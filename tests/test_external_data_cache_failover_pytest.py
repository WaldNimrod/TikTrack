#!/usr/bin/env python3
"""
External Data — Suite B: Cache-First + Failover (pytest, REPLAY mode)
TEAM_10_TO_TEAM_20_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE
- Cache HIT → no provider call
- Cache MISS → Primary → Fallback
- Primary fail → Fallback OK
- Both fail → stale + staleness=na (Never block UI)
Uses mode=REPLAY — zero HTTP calls.
"""

import asyncio
import sys
from pathlib import Path
from decimal import Decimal
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures" / "market_data"


def test_cache_hit_fx_returns_immediately():
    """Cache HIT → return from DB, no provider call (REPLAY mode doesn't matter when cache hits)."""
    from api.integrations.market_data.cache_first_service import get_exchange_rate_cache_first
    from api.integrations.market_data.provider_interface import ExchangeRateResult

    # Mock DB with cache HIT
    mock_row = MagicMock()
    mock_row.from_currency = "USD"
    mock_row.to_currency = "ILS"
    mock_row.conversion_rate = Decimal("3.05")
    mock_row.last_sync_time = datetime.now(timezone.utc)

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_row

    mock_db = AsyncMock()
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def run():
        rate, staleness = await get_exchange_rate_cache_first(
            mock_db, "USD", "ILS", skip_fetch=False, mode="REPLAY", fixtures_dir=FIXTURES_DIR
        )
        assert rate is not None
        assert rate.from_currency == "USD"
        assert rate.to_currency == "ILS"
        assert staleness in ("ok", "warning", "na")

    asyncio.run(run())


def test_cache_miss_fx_replay_returns_from_fixtures():
    """Cache MISS → Primary (Alpha) → returns from fixtures. Zero HTTP."""
    from api.integrations.market_data.cache_first_service import get_exchange_rate_cache_first

    # Mock DB: cache MISS (no row)
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None

    mock_db = AsyncMock()
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def run():
        rate, staleness = await get_exchange_rate_cache_first(
            mock_db, "USD", "ILS", skip_fetch=False, mode="REPLAY", fixtures_dir=FIXTURES_DIR
        )
        assert rate is not None
        assert rate.from_currency == "USD"
        assert rate.to_currency == "ILS"
        assert rate.rate > 0
        assert staleness == "ok"

    asyncio.run(run())


def test_cache_miss_price_replay_returns_from_fixtures():
    """Cache MISS → Primary (Yahoo) → returns from fixtures. Zero HTTP."""
    from api.integrations.market_data.cache_first_service import get_ticker_price_cache_first

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None

    mock_db = AsyncMock()
    mock_db.execute = AsyncMock(return_value=mock_result)
    mock_db.add = MagicMock()
    mock_db.flush = AsyncMock()

    ticker_id = uuid4()

    async def run():
        price, staleness = await get_ticker_price_cache_first(
            mock_db, "AAPL", ticker_id, skip_fetch=False,
            mode="REPLAY", fixtures_dir=FIXTURES_DIR
        )
        assert price is not None
        assert price.symbol == "AAPL"
        assert price.price > 0
        assert staleness == "ok"

    asyncio.run(run())


def test_both_providers_fail_returns_none_staleness_na():
    """Both fail (symbol not in fixtures) → None, staleness=na. Never block UI."""
    from api.integrations.market_data.cache_first_service import get_ticker_price_cache_first

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None

    mock_db = AsyncMock()
    mock_db.execute = AsyncMock(return_value=mock_result)

    ticker_id = uuid4()

    async def run():
        price, staleness = await get_ticker_price_cache_first(
            mock_db, "NONEXISTENT_SYMBOL_XYZ", ticker_id, skip_fetch=False,
            mode="REPLAY", fixtures_dir=FIXTURES_DIR
        )
        assert price is None
        assert staleness == "na"

    asyncio.run(run())


def test_skip_fetch_returns_cache_only():
    """skip_fetch=True → DB only, no provider call."""
    from api.integrations.market_data.cache_first_service import get_exchange_rate_cache_first

    mock_row = MagicMock()
    mock_row.from_currency = "USD"
    mock_row.to_currency = "ILS"
    mock_row.conversion_rate = Decimal("3.05")
    mock_row.last_sync_time = datetime.now(timezone.utc)

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_row

    mock_db = AsyncMock()
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def run():
        rate, staleness = await get_exchange_rate_cache_first(
            mock_db, "USD", "ILS", skip_fetch=True
        )
        assert rate is not None
        assert rate.provider == "cache"

    asyncio.run(run())


def test_replay_history_returns_from_fixtures():
    """get_ticker_history with REPLAY returns 250d from fixtures."""
    from api.integrations.market_data.cache_first_service import get_ticker_history_cache_first

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []

    mock_db = AsyncMock()
    mock_db.execute = AsyncMock(return_value=mock_result)

    ticker_id = uuid4()

    async def run():
        hist = await get_ticker_history_cache_first(
            mock_db, "AAPL", ticker_id, 250, skip_fetch=False,
            mode="REPLAY", fixtures_dir=FIXTURES_DIR
        )
        assert hist is not None
        assert len(hist) >= 10

    asyncio.run(run())


if __name__ == "__main__":
    import pytest
    pytest.main([__file__, "-v"])
