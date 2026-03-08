"""
T190-Price PHASE_1 — Price Reliability Unit Tests
TEAM_10_TO_TEAM_20_PRICE_RELIABILITY_PHASE1_MANDATE

Scenarios:
1. stale EOD + no intraday (active)   -> EOD_STALE, not null
2. stale EOD + no intraday (inactive)  -> EOD_STALE, not null
3. stale EOD + intraday (active)      -> INTRADAY_FALLBACK
4. fresh EOD + intraday                -> remains EOD
5. missing EOD + intraday (active)     -> INTRADAY_FALLBACK
"""

import os
import sys
import uuid
from decimal import Decimal
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost:5432/test")
os.environ.setdefault("JWT_SECRET_KEY", "a" * 86)

from api.services.tickers_service import (
    _get_price_with_fallback,
    EOD_STALE_HOURS,
)


def _make_row(ticker_id, price, open_p, close_p, ts):
    row = MagicMock()
    row.ticker_id = ticker_id
    row.price = price
    row.open_price = open_p
    row.close_price = close_p
    row.price_timestamp = ts
    return row


@pytest.mark.asyncio
async def test_stale_eod_no_intraday_active_returns_eod_stale_not_null():
    """Scenario 1: stale EOD + no intraday (active) -> EOD_STALE, not null"""
    tid = uuid.uuid4()
    now = datetime.now(timezone.utc)
    stale_ts = now - timedelta(hours=EOD_STALE_HOURS + 1)

    db = AsyncMock()
    eod_result = MagicMock()
    eod_result.all.return_value = [_make_row(tid, Decimal("100"), Decimal("98"), Decimal("99"), stale_ts)]
    intra_empty = MagicMock()
    intra_empty.all.return_value = []
    db.execute = AsyncMock(side_effect=[eod_result, intra_empty])

    with patch("api.services.tickers_service.datetime") as mock_dt:
        mock_dt.now.return_value = now
        result = await _get_price_with_fallback(db, [tid], active_ticker_ids={tid})

    assert tid in result
    assert result[tid]["current_price"] == Decimal("100")
    assert result[tid]["price_source"] == "EOD_STALE"
    assert result[tid]["price_as_of_utc"] is not None


@pytest.mark.asyncio
async def test_stale_eod_no_intraday_inactive_returns_eod_stale_not_null():
    """Scenario 2: stale EOD + no intraday (inactive) -> EOD_STALE, not null"""
    tid = uuid.uuid4()
    now = datetime.now(timezone.utc)
    stale_ts = now - timedelta(hours=EOD_STALE_HOURS + 1)

    db = AsyncMock()
    eod_result = MagicMock()
    eod_result.all.return_value = [_make_row(tid, Decimal("50"), Decimal("48"), Decimal("49"), stale_ts)]
    db.execute = AsyncMock(return_value=eod_result)

    with patch("api.services.tickers_service.datetime") as mock_dt:
        mock_dt.now.return_value = now
        result = await _get_price_with_fallback(db, [tid], active_ticker_ids=set())

    assert tid in result
    assert result[tid]["current_price"] == Decimal("50")
    assert result[tid]["price_source"] == "EOD_STALE"
    assert result[tid]["price_as_of_utc"] is not None


@pytest.mark.asyncio
async def test_stale_eod_intraday_active_returns_intraday_fallback():
    """Scenario 3: stale EOD + intraday (active) -> INTRADAY_FALLBACK"""
    tid = uuid.uuid4()
    now = datetime.now(timezone.utc)
    stale_ts = now - timedelta(hours=EOD_STALE_HOURS + 1)
    intra_ts = now - timedelta(minutes=5)

    db = AsyncMock()
    eod_result = MagicMock()
    eod_result.all.return_value = [_make_row(tid, Decimal("100"), Decimal("98"), Decimal("99"), stale_ts)]
    intra_result = MagicMock()
    intra_row = MagicMock()
    intra_row.ticker_id = tid
    intra_row.price = Decimal("102")
    intra_row.open_price = Decimal("100")
    intra_row.close_price = Decimal("101")
    intra_row.price_timestamp = intra_ts
    intra_result.all.return_value = [intra_row]
    db.execute = AsyncMock(side_effect=[eod_result, intra_result])

    with patch("api.services.tickers_service.datetime") as mock_dt:
        mock_dt.now.return_value = now
        result = await _get_price_with_fallback(db, [tid], active_ticker_ids={tid})

    assert tid in result
    assert result[tid]["current_price"] == Decimal("102")
    assert result[tid]["price_source"] == "INTRADAY_FALLBACK"


@pytest.mark.asyncio
async def test_fresh_eod_intraday_remains_eod():
    """Scenario 4: fresh EOD + intraday -> remains EOD"""
    tid = uuid.uuid4()
    now = datetime.now(timezone.utc)
    fresh_ts = now - timedelta(hours=12)

    db = AsyncMock()
    eod_result = MagicMock()
    eod_result.all.return_value = [_make_row(tid, Decimal("100"), Decimal("98"), Decimal("99"), fresh_ts)]
    intra_result = MagicMock()
    intra_row = MagicMock()
    intra_row.ticker_id = tid
    intra_row.price = Decimal("102")
    intra_row.open_price = Decimal("100")
    intra_row.close_price = Decimal("101")
    intra_row.price_timestamp = now - timedelta(minutes=5)
    intra_result.all.return_value = [intra_row]
    db.execute = AsyncMock(side_effect=[eod_result, intra_result])

    with patch("api.services.tickers_service.datetime") as mock_dt:
        mock_dt.now.return_value = now
        result = await _get_price_with_fallback(db, [tid], active_ticker_ids={tid})

    assert tid in result
    assert result[tid]["current_price"] == Decimal("100")
    assert result[tid]["price_source"] == "EOD"


@pytest.mark.asyncio
async def test_missing_eod_intraday_active_returns_intraday_fallback():
    """Scenario 5: missing EOD + intraday (active) -> INTRADAY_FALLBACK"""
    tid = uuid.uuid4()
    now = datetime.now(timezone.utc)
    intra_ts = now - timedelta(minutes=10)

    db = AsyncMock()
    eod_result = MagicMock()
    eod_result.all.return_value = []
    intra_result = MagicMock()
    intra_row = MagicMock()
    intra_row.ticker_id = tid
    intra_row.price = Decimal("75")
    intra_row.open_price = Decimal("74")
    intra_row.close_price = Decimal("74.5")
    intra_row.price_timestamp = intra_ts
    intra_result.all.return_value = [intra_row]
    db.execute = AsyncMock(side_effect=[eod_result, intra_result])

    with patch("api.services.tickers_service.datetime") as mock_dt:
        mock_dt.now.return_value = now
        result = await _get_price_with_fallback(db, [tid], active_ticker_ids={tid})

    assert tid in result
    assert result[tid]["current_price"] == Decimal("75")
    assert result[tid]["price_source"] == "INTRADAY_FALLBACK"
