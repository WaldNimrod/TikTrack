"""
History Backfill Service — TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC (LOCKED)
--------------------------------------------------------------------------------
API-facing service for single-ticker history backfill (250d OHLCV).
Uses Smart History Engine (gap-first, force_reload Admin-only).
Idempotent, Single-Flight lock, timeout 90s.
API passes ULID; DB uses UUID — conversion required.
"""

import asyncio
import logging
import os
from datetime import date, datetime
from pathlib import Path
from typing import Optional, Tuple

try:
    import fcntl
except ImportError:
    fcntl = None

from ..utils.identity import ulid_to_uuid

from .smart_history_engine import (
    BackfillDecision,
    MIN_HISTORY_DAYS,
    compute_gaps,
    decide,
    has_gaps,
)

logger = logging.getLogger(__name__)

_project = Path(__file__).resolve().parents[2]
_script_path = _project / "scripts" / "sync_ticker_prices_history_backfill.py"
BACKFILL_TIMEOUT = 90  # seconds
REQUIRED_MIN_AFTER_INSERT = 100  # Accept provider result if >= this (partial success)
IMMEDIATE_RETRY_MIN_ROWS = 50  # Retry if we get at least this many (worth retrying)


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


def _gaps_to_date_range(gaps: set) -> Tuple[Optional[date], Optional[date]]:
    """Convert gap dates (YYYY-MM-DD) to (date_from, date_to) for provider."""
    if not gaps:
        return None, None
    sorted_gaps = sorted(gaps)
    try:
        date_from_val = datetime.strptime(sorted_gaps[0], "%Y-%m-%d").date()
        date_to_val = datetime.strptime(sorted_gaps[-1], "%Y-%m-%d").date()
        return date_from_val, date_to_val
    except (ValueError, IndexError):
        return None, None


async def run_history_backfill(
    ticker_id: str,
    mode: str = "gap_fill",
    is_admin: bool = False,
) -> dict:
    """
    Run history backfill for a single ticker (Smart History Engine).
    ticker_id: ULID (API format). DB uses UUID — we convert before script calls.
    mode: gap_fill (default) | force_reload (Admin only)
    is_admin: user has ADMIN or SUPERADMIN role
    Returns dict with status, rows_inserted, message, ticker_id, symbol.
    Raises:
        - ValueError("not_found") -> 404
        - ValueError("no_op") -> 200 no_op
        - ValueError("forbidden") -> 403 (force_reload without Admin)
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
        info = await asyncio.to_thread(mod.load_ticker_with_history_info, db_id)
        if not info:
            raise ValueError("not_found")

        ticker_uuid, symbol, existing_dates, existing_count, ticker_type, metadata = info

        # Smart History Engine: decide
        decision = decide(
            existing_count=existing_count,
            has_any_gaps=has_gaps(existing_dates),
            mode=mode or "gap_fill",
            is_admin=is_admin,
        )

        if decision == BackfillDecision.NO_OP:
            return get_no_op_response(ticker_id, symbol)

        if decision == BackfillDecision.FULL_RELOAD:
            if not is_admin:
                raise ValueError("forbidden")
            # Admin confirmed: delete all, then full fetch
            await asyncio.to_thread(mod.delete_ticker_prices_for_ticker, db_id)
            existing_dates = set()
            date_from_val, date_to_val = None, None
        else:
            # GAP_FILL
            gaps = compute_gaps(existing_dates)
            date_from_val, date_to_val = _gaps_to_date_range(gaps)
            if not gaps and existing_count >= MIN_HISTORY_DAYS:
                # Edge: has_gaps was False, no gaps — no_op
                return get_no_op_response(ticker_id, symbol)

        # Fetch (Yahoo → Alpha). Per CORRECTIVE: CRYPTO uses provider mapping.
        hist, provider = await asyncio.wait_for(
            mod.fetch_history_for_ticker(
                ticker_uuid,
                symbol,
                ticker_type=ticker_type,
                metadata=metadata,
                date_from=date_from_val,
                date_to=date_to_val,
            ),
            timeout=BACKFILL_TIMEOUT - 10,
        )

        if not hist:
            logger.warning(
                "History backfill: providers failed for %s. "
                "Check ALPHA_VANTAGE_API_KEY; Yahoo may be rate-limited.",
                symbol,
            )
            raise ValueError(f"provider_error|{symbol}")

        if len(hist) < IMMEDIATE_RETRY_MIN_ROWS and not (date_from_val or date_to_val):
            # Full fetch returned few rows — try immediate retry (Retry Policy)
            logger.info("Smart History: %s got %d rows — immediate retry", symbol, len(hist))
            hist2, provider2 = await asyncio.wait_for(
                mod.fetch_history_for_ticker(
                    ticker_uuid,
                    symbol,
                    ticker_type=ticker_type,
                    metadata=metadata,
                    date_from=None,
                    date_to=None,
                ),
                timeout=BACKFILL_TIMEOUT - 10,
            )
            if hist2 and len(hist2) > len(hist):
                hist, provider = hist2, provider2

        inserted = await asyncio.to_thread(
            mod.insert_history_rows,
            ticker_uuid,
            symbol,
            hist,
            existing_dates,
        )

        # Post-run verification (Retry Policy)
        final_count = await asyncio.to_thread(mod.get_row_count, db_id)
        if final_count < MIN_HISTORY_DAYS:
            logger.info(
                "Smart History: %s has %d/%d rows — nightly batch will retry",
                symbol,
                final_count,
                MIN_HISTORY_DAYS,
            )

        status = "completed" if inserted > 0 else "no_op"
        message = (
            f"History backfill completed — {inserted} rows inserted"
            if inserted > 0
            else "Ticker already has sufficient history (no new rows)"
        )
        if decision == BackfillDecision.FULL_RELOAD and inserted > 0:
            message = f"Full reload completed — {inserted} rows inserted"

        return {
            "ticker_id": ticker_id,
            "symbol": symbol,
            "rows_inserted": inserted,
            "status": status,
            "message": message,
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
