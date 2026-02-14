#!/usr/bin/env python3
"""
Gap-Fill Smart History — Unit/Integration tests
TEAM_50 / Smart History Fill — validates:
- compute_gaps → date range for provider
- Yahoo provider uses period1/period2 (not range) when date_from/date_to given
- Service passes date_from/date_to to fetch in GAP_FILL mode
"""

import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


def test_compute_gaps_returns_missing_dates():
    """compute_gaps returns set of missing YYYY-MM-DD within 250-day window."""
    from api.services.smart_history_engine import compute_gaps, MIN_HISTORY_DAYS

    # Empty existing → all 250 dates are "gaps"
    gaps = compute_gaps(set())
    assert len(gaps) == MIN_HISTORY_DAYS
    for g in gaps:
        assert len(g) == 10 and g[4] == "-" and g[7] == "-"

    # Full existing → no gaps
    from api.services.smart_history_engine import _last_n_trading_dates
    required = _last_n_trading_dates(MIN_HISTORY_DAYS)
    gaps_full = compute_gaps(required)
    assert len(gaps_full) == 0

    # Partial → some gaps
    partial = set(list(required)[:200])
    gaps_partial = compute_gaps(partial)
    assert len(gaps_partial) == MIN_HISTORY_DAYS - 200


def test_gaps_to_date_range():
    """_gaps_to_date_range converts gap set to (date_from, date_to) for provider."""
    from api.services.history_backfill_service import _gaps_to_date_range

    gaps = {"2025-01-10", "2025-01-11", "2025-01-15"}
    df, dt = _gaps_to_date_range(gaps)
    assert df == date(2025, 1, 10)
    assert dt == date(2025, 1, 15)

    df2, dt2 = _gaps_to_date_range(set())
    assert df2 is None
    assert dt2 is None


def test_yahoo_gap_fill_uses_period1_period2():
    """When date_from and date_to are set, Yahoo provider uses period1/period2 (not range)."""
    from api.integrations.market_data.providers.yahoo_provider import _fetch_history_v8_chart

    # Mock httpx.Client (imported inside the function) to capture request params
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "chart": {
            "result": [{
                "timestamp": [],
                "indicators": {"quote": [{"open": [], "high": [], "low": [], "close": [], "volume": []}]},
            }],
            "error": None,
        }
    }
    mock_response.raise_for_status = MagicMock()

    date_from = date(2025, 1, 6)
    date_to = date(2025, 1, 10)

    with patch("httpx.Client") as MockClient:
        mock_client = MagicMock()
        mock_client.get.return_value = mock_response
        MockClient.return_value.__enter__.return_value = mock_client
        MockClient.return_value.__exit__.return_value = None

        result = _fetch_history_v8_chart("AAPL", 250, date_from=date_from, date_to=date_to)

        assert mock_client.get.called
        call_args = mock_client.get.call_args
        url = call_args[0][0]
        params = call_args[1].get("params", {})

        # Gap-fill must use period1/period2, NOT range
        assert "period1" in params
        assert "period2" in params
        assert "range" not in params
        assert "query1.finance.yahoo.com" in url


def test_decide_gap_fill_when_gaps_exist():
    """decide returns GAP_FILL when has_any_gaps or existing_count < 250."""
    from api.services.smart_history_engine import decide, BackfillDecision

    # Has gaps
    d = decide(existing_count=242, has_any_gaps=True, mode="gap_fill", is_admin=False)
    assert d == BackfillDecision.GAP_FILL

    # Under 250, no gaps (edge)
    d2 = decide(existing_count=200, has_any_gaps=False, mode="gap_fill", is_admin=False)
    assert d2 == BackfillDecision.GAP_FILL
