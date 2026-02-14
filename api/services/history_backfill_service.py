"""
History Backfill Service — TEAM_30_TO_TEAM_20_HISTORY_BACKFILL_API_REQUEST
---------------------------------------------------------------------------
API-facing service for single-ticker history backfill (250d OHLCV).
Uses scripts/sync_ticker_prices_history_backfill.py logic.
Idempotent, Single-Flight lock, timeout 90s.
API passes ULID; DB uses UUID — conversion required.
"""

import asyncio
import logging
import os
from pathlib import Path
from typing import Optional, Tuple

try:
    import fcntl
except ImportError:
    fcntl = None

from ..utils.identity import ulid_to_uuid

logger = logging.getLogger(__name__)

_project = Path(__file__).resolve().parents[2]
_script_path = _project / "scripts" / "sync_ticker_prices_history_backfill.py"
BACKFILL_TIMEOUT = 90  # seconds


def _load_backfill_module():
    """Load backfill script module (avoids scripts/ as package)."""
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "backfill_script",
        str(_script_path),
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _acquire_lock() -> Tuple[bool, object]:
    """Try acquire Single-Flight lock. Returns (acquired, fd_or_None)."""
    if not fcntl:
        return True, None
    lock_path = _project / "scripts" / ".sync_ticker_prices_history_backfill.lock"
    try:
        fd = os.open(str(lock_path), os.O_CREAT | os.O_RDWR)
        fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        return True, fd
    except BlockingIOError:
        return False, None
    except Exception as e:
        logger.warning("Lock acquire error: %s", e)
        return True, None  # Proceed without lock on error


def _release_lock(fd) -> None:
    if fd is not None and fcntl:
        try:
            fcntl.flock(fd, fcntl.LOCK_UN)
            os.close(fd)
        except Exception as e:
            logger.warning("Lock release error: %s", e)


def _ulid_to_db_id(ticker_id: str) -> str:
    """Convert API ULID to DB UUID string. Raises ValueError on invalid ULID."""
    try:
        u = ulid_to_uuid(ticker_id)
    except Exception:
        raise ValueError("not_found")
    if u is None:
        raise ValueError("not_found")
    return str(u)


async def run_history_backfill(ticker_id: str) -> dict:
    """
    Run history backfill for a single ticker.
    ticker_id: ULID (API format). DB uses UUID — we convert before script calls.
    Returns dict with status, rows_inserted, message, ticker_id, symbol.
    Raises:
        - ValueError("not_found") -> 404
        - ValueError("no_op") -> 200 no_op
        - ValueError("locked") -> 409
        - ValueError("provider_error") -> 502
    """
    db_id: str
    try:
        db_id = _ulid_to_db_id(ticker_id)
    except Exception:
        raise ValueError("not_found")

    mod = _load_backfill_module()

    acquired, fd = await asyncio.to_thread(_acquire_lock)
    if not acquired:
        _release_lock(fd)
        raise ValueError("locked")

    try:
        # 404: ticker not found
        if not await asyncio.to_thread(mod.ticker_exists, db_id):
            raise ValueError("not_found")

        # no_op: already has 200+ rows
        pair = await asyncio.to_thread(mod.load_ticker_by_id_for_backfill, db_id)
        if not pair:
            symbol = await asyncio.to_thread(mod.get_ticker_symbol, db_id) or ""
            return get_no_op_response(ticker_id, symbol)

        ticker_uuid, symbol = pair

        # Get existing dates
        existing = await asyncio.to_thread(mod.get_existing_dates, ticker_uuid)

        # Fetch history (async, Yahoo → Alpha)
        hist, provider = await asyncio.wait_for(
            mod.fetch_history_for_ticker(ticker_uuid, symbol),
            timeout=BACKFILL_TIMEOUT - 10,
        )

        if not hist or len(hist) < 100:
            logger.warning(
                "History backfill: providers failed for %s (got %s rows). "
                "Check ALPHA_VANTAGE_API_KEY; Yahoo may be rate-limited.",
                symbol,
                len(hist) if hist else 0,
            )
            raise ValueError(f"provider_error|{symbol}")

        # Insert
        inserted = await asyncio.to_thread(
            mod.insert_history_rows,
            ticker_uuid,
            symbol,
            hist,
            existing,
        )

        return {
            "ticker_id": ticker_id,
            "symbol": symbol,
            "rows_inserted": inserted,
            "status": "completed",
            "message": f"History backfill completed — {inserted} rows inserted",
        }
    finally:
        _release_lock(fd)


def get_no_op_response(ticker_id: str, symbol: str = "") -> dict:
    """Build 200 no_op response."""
    return {
        "ticker_id": ticker_id,
        "symbol": symbol or ticker_id,
        "rows_inserted": 0,
        "status": "no_op",
        "message": "Ticker already has sufficient history",
    }
