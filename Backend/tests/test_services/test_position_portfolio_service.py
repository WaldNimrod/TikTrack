#!/usr/bin/env python3
"""
Position & Portfolio Service Tests
=================================

Unit tests covering the calculation helpers to ensure diagnostics,
filtering, and aggregation logic do not regress.
"""

import os
import sys
from types import SimpleNamespace

import pytest
from unittest.mock import MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from services.position_portfolio_service import PositionPortfolioService
from services.account_activity_service import AccountActivityService


class QuoteStub(SimpleNamespace):
    """Simple stub to mimic SQLAlchemy row access."""


def test_get_market_price_returns_latest_quote(monkeypatch):
    """get_market_price should return the latest non-stale quote as dict."""
    mock_session = MagicMock()
    fake_quote = QuoteStub(
        price=123.45,
        is_stale=False,
        fetched_at='2025-11-15T00:00:00Z',
        asof_utc='2025-11-15T00:00:00Z',
        change_pct_day=1.5,
        change_amount_day=1.2,
        open_price=120.0,  # Add open_price for tests
        change_pct_from_open=2.8,
        change_amount_from_open=3.45,
    )

    (mock_session.query.return_value
        .filter.return_value
        .order_by.return_value
        .first.return_value) = fake_quote

    result = PositionPortfolioService.get_market_price(mock_session, ticker_id=77)
    assert result['price'] == 123.45
    assert result['is_stale'] is False
    assert result['fetched_at'] == '2025-11-15T00:00:00Z'
    assert result['change_pct_day'] == 1.5
    assert result['open_price'] == 120.0  # Test open_price is included


def test_get_market_price_returns_none_on_exception(monkeypatch):
    """If query fails the method should swallow the exception and return None."""
    mock_session = MagicMock()
    mock_session.query.side_effect = RuntimeError("db failure")

    result = PositionPortfolioService.get_market_price(mock_session, ticker_id=1)
    assert result is None


def test_calculate_all_account_positions_internal_filters_closed_positions(monkeypatch):
    """Internal helper should drop closed positions unless include_closed=True and compute diagnostics."""
    mock_session = MagicMock()
    distinct_pairs = mock_session.query.return_value.filter.return_value.distinct.return_value
    distinct_pairs.all.return_value = [(101, 1), (102, 1)]

    call_log = []

    def fake_calc(db, account_id, ticker_id, include_market):
        call_log.append((account_id, ticker_id, include_market))
        if ticker_id == 101:
            return {'quantity': 0, 'market_value': 0}  # Closed position
        return {'quantity': 5, 'market_value': 200}

    monkeypatch.setattr(
        PositionPortfolioService,
        'calculate_position_by_ticker_account',
        staticmethod(fake_calc)
    )
    monkeypatch.setattr(
        AccountActivityService,
        'get_account_activity',
        staticmethod(lambda db, account_id, start_date, end_date: {'base_currency_total': 50})
    )

    positions, diagnostics = PositionPortfolioService._calculate_all_account_positions_internal(
        db=mock_session,
        trading_account_id=1,
        include_closed=False,
        include_market_data=True
    )

    assert call_log == [(1, 101, True), (1, 102, True)]
    assert diagnostics['execution_pairs_count'] == 2
    assert diagnostics['positions_count'] == 1
    assert positions[0]['quantity'] == 5
    assert positions[0]['percent_of_account'] == pytest.approx(80.0)


def test_calculate_all_account_positions_uses_include_closed_flag(monkeypatch):
    """Public helper should simply forward to the internal one and return only positions list."""
    positions_payload = [{'quantity': 0}]
    diagnostics_payload = {'positions_count': 1}

    monkeypatch.setattr(
        PositionPortfolioService,
        '_calculate_all_account_positions_internal',
        staticmethod(lambda **kwargs: (positions_payload, diagnostics_payload))
    )

    positions_only = PositionPortfolioService.calculate_all_account_positions(
        db=MagicMock(),
        trading_account_id=5,
        include_closed=True,
        include_market_data=False
    )

    assert positions_only is positions_payload

