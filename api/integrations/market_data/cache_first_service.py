"""
Cache-First Service — P3-008
SSOT: MARKET_DATA_PIPE_SPEC §2.3
1. Always check cache (DB) before any external API call
2. Cache HIT → return immediately
3. Cache MISS → Provider (Primary → Fallback)
4. Both fail → return stale + staleness=na. Never block UI.
"""

import logging
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path
from typing import Optional, Tuple
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...models.exchange_rates import ExchangeRate
from ...models.ticker_prices import TickerPrice

from .provider_interface import ExchangeRateResult, OHLCVRow, PriceResult
from .indicators_service import compute_indicators
from .providers.alpha_provider import AlphaProvider
from .providers.yahoo_provider import YahooProvider

logger = logging.getLogger(__name__)

STALENESS_WARNING_MINUTES = 15
STALENESS_NA_HOURS = 24

# Domain mapping per MARKET_DATA_PIPE_SPEC §2.1
# FX: Alpha → Yahoo | Prices: Yahoo → Alpha


def _persist_price_to_db(db: AsyncSession, ticker_id: UUID, price: PriceResult) -> None:
    """Gate B — persist fetched price to ticker_prices so cache builds from API calls."""
    now = datetime.now(timezone.utc)
    ts = price.as_of or now
    row = TickerPrice(
        ticker_id=ticker_id,
        provider_id=None,
        price=price.price,
        open_price=price.open_price,
        high_price=price.high_price,
        low_price=price.low_price,
        close_price=price.close_price or price.price,
        volume=price.volume,
        market_cap=price.market_cap,
        price_timestamp=ts,
        fetched_at=now,
        is_stale=False,
    )
    db.add(row)
    try:
        db.flush()
    except Exception as e:
        logger.warning("Persist ticker price failed for %s: %s", price.symbol, e)


def _compute_staleness(last_ts: Optional[datetime]) -> str:
    """Per TT2_MARKET_DATA_RESILIENCE."""
    if not last_ts:
        return "na"
    now = datetime.now(timezone.utc)
    if last_ts.tzinfo is None:
        last_ts = last_ts.replace(tzinfo=timezone.utc)
    age = now - last_ts
    if age > timedelta(hours=STALENESS_NA_HOURS):
        return "na"
    if age > timedelta(minutes=STALENESS_WARNING_MINUTES):
        return "warning"
    return "ok"


async def get_exchange_rate_cache_first(
    db: AsyncSession,
    from_ccy: str,
    to_ccy: str,
    *,
    skip_fetch: bool = False,
    mode: str = "LIVE",
    fixtures_dir: Optional[Path] = None,
) -> Tuple[Optional[ExchangeRateResult], str]:
    """
    Cache-First FX. Per FOREX_MARKET_SPEC: Alpha → Yahoo.
    skip_fetch=True: DB only (for API requests — no external call in request).
    skip_fetch=False: used by sync script — check DB, if miss fetch via providers.
    """
    stmt = select(ExchangeRate).where(
        ExchangeRate.from_currency == from_ccy,
        ExchangeRate.to_currency == to_ccy,
    )
    result = await db.execute(stmt)
    row = result.scalar_one_or_none()

    if row:
        staleness = _compute_staleness(row.last_sync_time)
        out = ExchangeRateResult(
            from_currency=row.from_currency,
            to_currency=row.to_currency,
            rate=row.conversion_rate,
            as_of=row.last_sync_time,
            provider="cache",
        )
        if skip_fetch or staleness == "ok":
            return out, staleness
        # Stale — try refresh (for sync script path)

    if skip_fetch:
        return (
            ExchangeRateResult(
                from_currency=from_ccy,
                to_currency=to_ccy,
                rate=row.conversion_rate if row else Decimal("0"),
                as_of=row.last_sync_time if row else None,
                provider="cache",
            ) if row else None,
            "na" if not row else _compute_staleness(row.last_sync_time),
        )

    # Cache MISS or stale — Primary (Alpha) → Fallback (Yahoo)
    alpha = AlphaProvider(mode=mode, fixtures_dir=fixtures_dir)
    yahoo = YahooProvider(mode=mode, fixtures_dir=fixtures_dir)
    for provider in (alpha, yahoo):
        try:
            rate = await provider.get_exchange_rate(from_ccy, to_ccy)
            if rate:
                return rate, "ok"
        except Exception as e:
            logger.warning("Provider %s failed for FX %s/%s: %s",
                           provider.__class__.__name__, from_ccy, to_ccy, e)

    # Both failed — return stale if any
    if row:
        return (
            ExchangeRateResult(
                from_currency=row.from_currency,
                to_currency=row.to_currency,
                rate=row.conversion_rate,
                as_of=row.last_sync_time,
                provider="cache",
            ),
            "na",
        )
    return None, "na"


async def get_ticker_price_cache_first(
    db: AsyncSession,
    symbol: str,
    ticker_id: UUID,
    *,
    skip_fetch: bool = False,
    mode: str = "LIVE",
    fixtures_dir: Optional[Path] = None,
) -> Tuple[Optional[PriceResult], str]:
    """
    Cache-First Prices. Per MARKET_DATA_PIPE_SPEC §2.1: Yahoo → Alpha.
    skip_fetch=True: DB only (no external call in request).
    """
    stmt = (
        select(TickerPrice)
        .where(TickerPrice.ticker_id == ticker_id)
        .order_by(TickerPrice.price_timestamp.desc())
        .limit(1)
    )
    result = await db.execute(stmt)
    row = result.scalar_one_or_none()

    if row:
        staleness = _compute_staleness(row.price_timestamp)
        out = PriceResult(
            symbol=symbol,
            price=row.price,
            open_price=row.open_price,
            high_price=row.high_price,
            low_price=row.low_price,
            close_price=row.close_price,
            volume=row.volume,
            market_cap=getattr(row, "market_cap", None),
            as_of=row.price_timestamp,
            provider="cache",
        )
        if skip_fetch or staleness == "ok":
            return out, staleness

    if skip_fetch:
        return (
            PriceResult(
                symbol=symbol,
                price=row.price if row else Decimal("0"),
                open_price=row.open_price,
                high_price=row.high_price,
                low_price=row.low_price,
                close_price=row.close_price,
                volume=row.volume,
                market_cap=getattr(row, "market_cap", None) if row else None,
                as_of=row.price_timestamp if row else None,
                provider="cache",
            ) if row else None,
            "na" if not row else _compute_staleness(row.price_timestamp),
        )

    # Cache MISS or stale — Primary (Yahoo) → Fallback (Alpha)
    yahoo = YahooProvider(mode=mode, fixtures_dir=fixtures_dir)
    alpha = AlphaProvider(mode=mode, fixtures_dir=fixtures_dir)
    for provider in (yahoo, alpha):
        try:
            price = await provider.get_ticker_price(symbol)
            if price:
                _persist_price_to_db(db, ticker_id, price)
                return price, "ok"
        except Exception as e:
            logger.warning("Provider %s failed for %s: %s",
                          provider.__class__.__name__, symbol, e)

    if row:
        return (
            PriceResult(
                symbol=symbol,
                price=row.price,
                open_price=row.open_price,
                high_price=row.high_price,
                low_price=row.low_price,
                close_price=row.close_price,
                volume=row.volume,
                market_cap=getattr(row, "market_cap", None),
                as_of=row.price_timestamp,
                provider="cache",
            ),
            "na",
        )
    return None, "na"


async def get_ticker_history_cache_first(
    db: AsyncSession,
    symbol: str,
    ticker_id: UUID,
    trading_days: int = 250,
    *,
    skip_fetch: bool = False,
    mode: str = "LIVE",
    fixtures_dir: Optional[Path] = None,
) -> list:
    """P3-015 — 250d OHLCV. Cache-First: DB → Yahoo → Alpha."""
    stmt = (
        select(TickerPrice)
        .where(TickerPrice.ticker_id == ticker_id)
        .order_by(TickerPrice.price_timestamp.asc())
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()
    if rows and len(rows) >= 200:
        recent = rows[-trading_days:]
        return [
            OHLCVRow(
                date=r.price_timestamp,
                open_price=r.open_price or Decimal("0"),
                high_price=r.high_price or Decimal("0"),
                low_price=r.low_price or Decimal("0"),
                close_price=r.close_price or r.price,
                volume=r.volume,
            )
            for r in recent
        ]
    if skip_fetch:
        return []
    yahoo = YahooProvider(mode=mode, fixtures_dir=fixtures_dir)
    alpha = AlphaProvider(mode=mode, fixtures_dir=fixtures_dir)
    for provider in (yahoo, alpha):
        try:
            hist = await provider.get_ticker_history(symbol, trading_days)
            if hist:
                return hist
        except Exception as e:
            logger.warning("Provider %s history failed for %s: %s",
                           provider.__class__.__name__, symbol, e)
    return []


async def get_ticker_indicators_cache_first(
    db: AsyncSession,
    symbol: str,
    ticker_id: UUID,
    trading_days: int = 250,
    *,
    skip_fetch: bool = False,
    mode: str = "LIVE",
    fixtures_dir: Optional[Path] = None,
) -> dict:
    """P3-014 — ATR(14), MA(20/50/150/200), CCI(20). Compute-on-read from 250d OHLC."""
    rows = await get_ticker_history_cache_first(
        db, symbol, ticker_id, trading_days,
        skip_fetch=skip_fetch, mode=mode, fixtures_dir=fixtures_dir
    )
    return compute_indicators(rows)
