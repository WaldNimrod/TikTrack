"""
Exchange Rates Service - MARKET_DATA_PIPE_SPEC, ADR-022
Stage-1 (1-002) post-Closure + P3-005: use exchange_rates, Cache-First, EOD only.

- Cache-First: reads only from market_data.exchange_rates (no external API call).
- EOD: data populated by Team 60 sync (Alpha/Yahoo). No real-time fetches.
- Staleness: Warning at 15 mins, N/A after 1 trading day (Visual Warning per ADR-022).
- Never block UI: DB only, timeout 5s.
"""

import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Tuple

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..models.exchange_rates import ExchangeRate

logger = logging.getLogger(__name__)

STALENESS_WARNING_MINUTES = 15
STALENESS_NA_HOURS = 24  # 1 trading day


def _compute_staleness(last_sync: Optional[datetime]) -> str:
    """
    Per TT2_MARKET_DATA_RESILIENCE: Warning at 15 mins, N/A after 1 trading day.
    """
    if not last_sync:
        return "na"
    now = datetime.now(timezone.utc)
    if last_sync.tzinfo is None:
        last_sync = last_sync.replace(tzinfo=timezone.utc)
    age = now - last_sync
    if age > timedelta(hours=STALENESS_NA_HOURS):
        return "na"
    if age > timedelta(minutes=STALENESS_WARNING_MINUTES):
        return "warning"
    return "ok"


async def get_exchange_rates(db: AsyncSession) -> Tuple[List[dict], str]:
    """
    Get all exchange rates from DB. Never blocks — DB is internal.
    Returns (items, staleness) per MARKET_DATA_PIPE_SPEC.
    """
    stmt = select(ExchangeRate).order_by(ExchangeRate.from_currency, ExchangeRate.to_currency)
    result = await db.execute(stmt)
    rows = result.scalars().all()

    latest_sync: Optional[datetime] = None
    items = []
    for r in rows:
        if r.last_sync_time and (latest_sync is None or r.last_sync_time > latest_sync):
            latest_sync = r.last_sync_time
        items.append(
            {
                "from_currency": r.from_currency,
                "to_currency": r.to_currency,
                "conversion_rate": r.conversion_rate,
                "last_sync_time": r.last_sync_time,
            }
        )

    staleness = _compute_staleness(latest_sync) if items else "ok"
    return items, staleness
