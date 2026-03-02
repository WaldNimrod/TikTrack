"""
Sync Intraday — Ticker Prices (APScheduler module)
ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION
Converted from scripts/sync_ticker_prices_intraday.py.
No fcntl. No direct .env parsing. Uses shared job_runner bootstrap.
"""

import asyncio
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select
from sqlalchemy.engine import Row

DECIMAL_SCALE = Decimal("0.00000001")


async def run(db: AsyncSession) -> dict:
    """
    Sync intraday prices for active tickers.
    Returns {records_processed, records_updated, error_count}.
    """
    from api.integrations.market_data.market_data_settings import get_intraday_enabled
    if not get_intraday_enabled():
        return {"records_processed": 0, "records_updated": 0, "error_count": 0}

    tickers = await _load_active_tickers(db)
    if not tickers:
        return {"records_processed": 0, "records_updated": 0, "error_count": 0}

    rows = await _fetch_prices_for_tickers(db, tickers)
    if not rows:
        return {"records_processed": len(tickers), "records_updated": 0, "error_count": 0}

    inserted = await _insert_intraday(db, rows)
    return {
        "records_processed": len(tickers),
        "records_updated": inserted,
        "error_count": 0,
    }


async def _load_active_tickers(db: AsyncSession) -> List[Tuple[UUID, str, str, Optional[Dict[str, Any]]]]:
    """Load active tickers from market_data.tickers."""
    from api.integrations.market_data.market_data_settings import get_max_active_tickers
    max_tickers = get_max_active_tickers()
    result = await db.execute(
        text("""
            SELECT id, symbol, COALESCE(ticker_type::text, 'STOCK') AS ticker_type, metadata
            FROM market_data.tickers
            WHERE deleted_at IS NULL AND is_active = true
            ORDER BY symbol
            LIMIT :limit
        """),
        {"limit": max_tickers},
    )
    rows = result.fetchall()
    out = []
    for r in rows:
        meta = r[3] if len(r) > 3 else None
        if isinstance(meta, str):
            import json
            try:
                meta = json.loads(meta) if meta else None
            except (json.JSONDecodeError, TypeError):
                meta = None
        out.append((r[0], r[1], r[2] or "STOCK", meta))
    return out


def _is_429(e: Exception) -> bool:
    s = str(e).lower()
    return "429" in s or "too many" in s or "rate limit" in s


async def _fetch_prices_for_tickers(
    db: AsyncSession,
    tickers: List[Tuple[UUID, str, str, Optional[Dict[str, Any]]]],
) -> List[Tuple[UUID, str, Decimal, Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[int], Optional[Decimal], datetime, str]]:
    """Yahoo → Alpha fallback. Uses market_data_settings for config (no .env in this module)."""
    from api.integrations.market_data.providers.yahoo_provider import YahooProvider
    from api.integrations.market_data.providers.alpha_provider import AlphaProvider
    from api.integrations.market_data.provider_cooldown import set_cooldown, is_in_cooldown
    from api.integrations.market_data.provider_mapping_utils import get_provider_mapping, resolve_symbols_for_fetch
    from api.integrations.market_data.market_data_settings import (
        get_provider_cooldown_minutes,
        get_delay_between_symbols_seconds,
    )

    cooldown_min = get_provider_cooldown_minutes()
    delay_sec = get_delay_between_symbols_seconds()
    yahoo = YahooProvider()
    alpha = AlphaProvider()
    results = []
    yahoo_skipped = alpha_skipped = False

    for ticker_id, symbol, ticker_type, metadata in tickers:
        pm = get_provider_mapping(symbol, ticker_type or "STOCK", None, metadata)
        yahoo_sym, alpha_sym, alpha_market = resolve_symbols_for_fetch(symbol, ticker_type or "STOCK", pm)
        pr = None
        for provider, name, use_sym, use_crypto in [
            (yahoo, "YAHOO_FINANCE", yahoo_sym, False),
            (alpha, "ALPHA_VANTAGE", alpha_sym, ticker_type == "CRYPTO"),
        ]:
            if is_in_cooldown(name):
                if name == "YAHOO_FINANCE":
                    yahoo_skipped = True
                else:
                    alpha_skipped = True
                continue
            try:
                if use_crypto and provider is alpha:
                    pr = await alpha.get_ticker_price_crypto(alpha_sym, alpha_market)
                else:
                    pr = await provider.get_ticker_price(use_sym)
                if pr and pr.price and pr.price > 0:
                    results.append((
                        ticker_id,
                        symbol,
                        pr.price,
                        pr.open_price,
                        pr.high_price,
                        pr.low_price,
                        pr.close_price or pr.price,
                        pr.volume,
                        pr.market_cap,
                        pr.as_of or datetime.now(timezone.utc),
                        pr.provider or "unknown",
                    ))
                    break
            except Exception as e:
                if _is_429(e):
                    set_cooldown(name, cooldown_min)
            else:
                last = await _get_last_known_price(db, ticker_id, symbol)
                if last:
                    results.append(last)
        if delay_sec > 0:
            await asyncio.sleep(delay_sec)
    return results


async def _get_last_known_price(
    db: AsyncSession,
    ticker_id: UUID,
    symbol: str,
) -> Optional[Tuple[UUID, str, Decimal, Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[int], Optional[Decimal], datetime, str]]:
    """Fallback when providers fail — use last known from DB."""
    for table in ["ticker_prices_intraday", "ticker_prices"]:
        result = await db.execute(
            text(f"""
                SELECT price, open_price, high_price, low_price, close_price, volume, market_cap, price_timestamp
                FROM market_data.{table}
                WHERE ticker_id = :tid
                ORDER BY price_timestamp DESC
                LIMIT 1
            """),
            {"tid": str(ticker_id)},
        )
        row = result.fetchone()
        if row and row[0] and float(row[0]) > 0:
            ts = row[7] if len(row) > 7 else datetime.now(timezone.utc)
            if ts and getattr(ts, "tzinfo", None) is None:
                ts = ts.replace(tzinfo=timezone.utc) if hasattr(ts, "replace") else datetime.now(timezone.utc)
            close_val = row[4] or row[0]
            return (
                ticker_id,
                symbol,
                Decimal(str(row[0])).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP),
                Decimal(str(row[1])).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP) if row[1] else None,
                Decimal(str(row[2])).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP) if row[2] else None,
                Decimal(str(row[3])).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP) if row[3] else None,
                Decimal(str(close_val)).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP) if close_val else None,
                int(row[5]) if row[5] is not None else None,
                Decimal(str(row[6])).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP) if row[6] else None,
                ts or datetime.now(timezone.utc),
                "LAST_KNOWN",
            )
    return None


async def _insert_intraday(
    db: AsyncSession,
    rows: List[Tuple[UUID, str, Decimal, Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[int], Optional[Decimal], datetime, str]],
) -> int:
    """Insert price rows into ticker_prices_intraday."""
    now = datetime.now(timezone.utc)
    inserted = 0
    for ticker_id, symbol, price, o, h, l, c, vol, mc, as_of, provider in rows:
        await db.execute(
            text("""
                INSERT INTO market_data.ticker_prices_intraday
                (ticker_id, provider_id, price, open_price, high_price, low_price, close_price, volume, market_cap, price_timestamp, fetched_at, is_stale)
                VALUES (:tid, NULL, :price, :o, :h, :l, :c, :vol, :mc, :as_of, :fetched, false)
            """),
            {
                "tid": str(ticker_id),
                "price": price,
                "o": o,
                "h": h,
                "l": l,
                "c": c,
                "vol": vol,
                "mc": mc,
                "as_of": as_of,
                "fetched": now,
            },
        )
        inserted += 1
    await db.commit()
    return inserted
