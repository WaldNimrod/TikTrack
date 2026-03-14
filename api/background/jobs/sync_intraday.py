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


async def _load_active_tickers(
    db: AsyncSession,
) -> List[Tuple[UUID, str, str, Optional[Dict[str, Any]]]]:
    """Load active tickers from market_data.tickers."""
    from api.integrations.market_data.market_data_settings import get_max_active_tickers

    max_tickers = get_max_active_tickers()
    result = await db.execute(
        text(
            """
            SELECT id, symbol, COALESCE(ticker_type::text, 'STOCK') AS ticker_type, metadata
            FROM market_data.tickers
            WHERE deleted_at IS NULL AND is_active = true
            ORDER BY symbol
            LIMIT :limit
        """
        ),
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


async def _get_active_trade_ticker_ids(db: AsyncSession) -> set:
    """Return set of ticker_ids that have at least one ACTIVE trade. FIX-1."""
    result = await db.execute(
        text("SELECT DISTINCT ticker_id FROM user_data.trades WHERE status = 'ACTIVE'")
    )
    return {row[0] for row in result.fetchall()}


async def _get_last_fetched_at(db: AsyncSession, ticker_id: UUID) -> Optional[datetime]:
    """Return the most recent fetched_at for a ticker from ticker_prices_intraday, or None. FIX-1."""
    result = await db.execute(
        text(
            """
            SELECT fetched_at FROM market_data.ticker_prices_intraday
            WHERE ticker_id = :tid
            ORDER BY fetched_at DESC LIMIT 1
        """
        ),
        {"tid": str(ticker_id)},
    )
    row = result.fetchone()
    if row and row[0]:
        ts = row[0]
        if getattr(ts, "tzinfo", None) is None:
            ts = ts.replace(tzinfo=timezone.utc)
        return ts
    return None


async def _fetch_prices_for_tickers(
    db: AsyncSession,
    tickers: List[Tuple[UUID, str, str, Optional[Dict[str, Any]]]],
) -> List[
    Tuple[
        UUID,
        str,
        Decimal,
        Optional[Decimal],
        Optional[Decimal],
        Optional[Decimal],
        Optional[Decimal],
        Optional[int],
        Optional[Decimal],
        datetime,
        str,
    ]
]:
    """Yahoo → Alpha fallback. Uses market_data_settings for config (no .env in this module)."""
    from api.integrations.market_data.providers.yahoo_provider import YahooProvider
    from api.integrations.market_data.providers.alpha_provider import (
        AlphaProvider,
        AlphaQuotaExhaustedException,
    )
    from api.integrations.market_data.provider_cooldown import (
        set_cooldown,
        set_cooldown_hours,
        is_in_cooldown,
    )
    from api.integrations.market_data.provider_mapping_utils import (
        get_provider_mapping,
        resolve_symbols_for_fetch,
    )
    from api.integrations.market_data.market_data_settings import (
        get_alpha_quota_cooldown_hours,
        get_current_cadence_minutes,
        get_intraday_interval_minutes,
        get_off_hours_interval_minutes,
        get_provider_cooldown_minutes,
        get_delay_between_symbols_seconds,
    )

    cooldown_min = get_provider_cooldown_minutes()
    delay_sec = get_delay_between_symbols_seconds()
    off_hours_interval = get_off_hours_interval_minutes()
    market_is_open = get_current_cadence_minutes() == get_intraday_interval_minutes()
    active_trade_ids = await _get_active_trade_ticker_ids(db)
    now_utc = datetime.now(timezone.utc)

    # --- FIX-1: Build tickers to fetch (priority filter) ---
    tickers_to_fetch: List[Tuple[UUID, str, str, Optional[Dict[str, Any]]]] = []
    for ticker_id, symbol, ticker_type, metadata in tickers:
        last_fetched = await _get_last_fetched_at(db, ticker_id)
        has_no_data = last_fetched is None
        is_high = ticker_id in active_trade_ids and market_is_open
        if not has_no_data and not is_high:
            if last_fetched is not None:
                age_minutes = (now_utc - last_fetched).total_seconds() / 60
                if age_minutes < off_hours_interval:
                    continue
        tickers_to_fetch.append((ticker_id, symbol, ticker_type, metadata))

    yahoo = YahooProvider()
    alpha = AlphaProvider()
    results = []

    # --- FIX-2: Batch Yahoo first ---
    yahoo_batch: Dict[str, Any] = {}
    if tickers_to_fetch and not is_in_cooldown("YAHOO_FINANCE"):
        yahoo_symbols = []
        for ticker_id, symbol, ticker_type, metadata in tickers_to_fetch:
            pm = get_provider_mapping(symbol, ticker_type or "STOCK", None, metadata)
            yahoo_sym, _, _ = resolve_symbols_for_fetch(symbol, ticker_type or "STOCK", pm)
            if yahoo_sym:
                yahoo_symbols.append(yahoo_sym)
        yahoo_symbols_unique = list(dict.fromkeys(yahoo_symbols))
        if yahoo_symbols_unique:
            try:
                yahoo_batch = await yahoo.get_ticker_prices_batch(yahoo_symbols_unique)
            except Exception as e:
                if _is_429(e):
                    set_cooldown("YAHOO_FINANCE", cooldown_min)

    # --- Per-ticker: batch result → individual Yahoo → Alpha → LAST_KNOWN ---
    for ticker_id, symbol, ticker_type, metadata in tickers_to_fetch:
        pm = get_provider_mapping(symbol, ticker_type or "STOCK", None, metadata)
        yahoo_sym, alpha_sym, alpha_market = resolve_symbols_for_fetch(
            symbol, ticker_type or "STOCK", pm
        )
        pr = None

        if yahoo_sym and yahoo_sym in yahoo_batch:
            pr = yahoo_batch[yahoo_sym]
        elif not is_in_cooldown("YAHOO_FINANCE") and yahoo_sym and market_is_open:
            # CC-02: In off-hours, skip per-ticker Yahoo — batch only (≤2 Yahoo total: 0 market status + 1 batch)
            try:
                pr = await yahoo.get_ticker_price(yahoo_sym)
            except Exception as e:
                if _is_429(e):
                    set_cooldown("YAHOO_FINANCE", cooldown_min)

        if not pr and not is_in_cooldown("ALPHA_VANTAGE") and alpha_sym:
            try:
                if ticker_type == "CRYPTO":
                    pr = await alpha.get_ticker_price_crypto(alpha_sym, alpha_market)
                else:
                    pr = await alpha.get_ticker_price(alpha_sym)
            except AlphaQuotaExhaustedException:
                set_cooldown_hours("ALPHA_VANTAGE", get_alpha_quota_cooldown_hours())

        if pr and pr.price and pr.price > 0:
            results.append(
                (
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
                )
            )
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
) -> Optional[
    Tuple[
        UUID,
        str,
        Decimal,
        Optional[Decimal],
        Optional[Decimal],
        Optional[Decimal],
        Optional[Decimal],
        Optional[int],
        Optional[Decimal],
        datetime,
        str,
    ]
]:
    """Fallback when providers fail — use last known from DB."""
    for table in ["ticker_prices_intraday", "ticker_prices"]:
        result = await db.execute(
            text(
                f"""
                SELECT price, open_price, high_price, low_price, close_price, volume, market_cap, price_timestamp
                FROM market_data.{table}
                WHERE ticker_id = :tid
                ORDER BY price_timestamp DESC
                LIMIT 1
            """
            ),
            {"tid": str(ticker_id)},
        )
        row = result.fetchone()
        if row and row[0] and float(row[0]) > 0:
            ts = row[7] if len(row) > 7 else datetime.now(timezone.utc)
            if ts and getattr(ts, "tzinfo", None) is None:
                ts = (
                    ts.replace(tzinfo=timezone.utc)
                    if hasattr(ts, "replace")
                    else datetime.now(timezone.utc)
                )
            close_val = row[4] or row[0]
            return (
                ticker_id,
                symbol,
                Decimal(str(row[0])).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP),
                (
                    Decimal(str(row[1])).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP)
                    if row[1]
                    else None
                ),
                (
                    Decimal(str(row[2])).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP)
                    if row[2]
                    else None
                ),
                (
                    Decimal(str(row[3])).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP)
                    if row[3]
                    else None
                ),
                (
                    Decimal(str(close_val)).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP)
                    if close_val
                    else None
                ),
                int(row[5]) if row[5] is not None else None,
                (
                    Decimal(str(row[6])).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP)
                    if row[6]
                    else None
                ),
                ts or datetime.now(timezone.utc),
                "LAST_KNOWN",
            )
    return None


async def _insert_intraday(
    db: AsyncSession,
    rows: List[
        Tuple[
            UUID,
            str,
            Decimal,
            Optional[Decimal],
            Optional[Decimal],
            Optional[Decimal],
            Optional[Decimal],
            Optional[int],
            Optional[Decimal],
            datetime,
            str,
        ]
    ],
) -> int:
    """Insert price rows into ticker_prices_intraday."""
    now = datetime.now(timezone.utc)
    inserted = 0
    for ticker_id, symbol, price, o, h, low, c, vol, mc, as_of, provider in rows:
        await db.execute(
            text(
                """
                INSERT INTO market_data.ticker_prices_intraday
                (ticker_id, provider_id, price, open_price, high_price, low_price, close_price, volume, market_cap, price_timestamp, fetched_at, is_stale)
                VALUES (:tid, NULL, :price, :o, :h, :l, :c, :vol, :mc, :as_of, :fetched, false)
            """
            ),
            {
                "tid": str(ticker_id),
                "price": price,
                "o": o,
                "h": h,
                "l": low,
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
