#!/usr/bin/env python3
"""
B-01: Sync Intraday Fallback Logic — No Duplicate Append
TEAM_10_BLOCKING_BUG_B01_REMEDIATION_ACTIVATION
Verifies: Provider A fail + B success → 1 row; Both fail → 1 LAST_KNOWN; A success → no fallback.
"""

import asyncio
import sys
from pathlib import Path
from decimal import Decimal
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


async def _run_fetch_with_mocks(
    yahoo_returns_price: bool,
    alpha_returns_price: bool,
    last_known_exists: bool,
) -> list:
    """Run _fetch_prices_for_tickers with mocked providers and DB."""
    from api.background.jobs.sync_intraday import _fetch_prices_for_tickers

    ticker_id = uuid4()
    tickers = [(ticker_id, "AAPL", "STOCK", None)]

    # Mock providers
    yahoo_pr = MagicMock() if yahoo_returns_price else None
    if yahoo_pr:
        yahoo_pr.price = Decimal("150.0")
        yahoo_pr.open_price = Decimal("149.0")
        yahoo_pr.high_price = Decimal("151.0")
        yahoo_pr.low_price = Decimal("148.0")
        yahoo_pr.close_price = Decimal("150.0")
        yahoo_pr.volume = 1000000
        yahoo_pr.market_cap = None
        yahoo_pr.as_of = datetime.now(timezone.utc)
        yahoo_pr.provider = "YAHOO_FINANCE"

    alpha_pr = MagicMock() if alpha_returns_price else None
    if alpha_pr:
        alpha_pr.price = Decimal("150.5")
        alpha_pr.open_price = Decimal("149.5")
        alpha_pr.high_price = Decimal("151.5")
        alpha_pr.low_price = Decimal("148.5")
        alpha_pr.close_price = Decimal("150.5")
        alpha_pr.volume = 1001000
        alpha_pr.market_cap = None
        alpha_pr.as_of = datetime.now(timezone.utc)
        alpha_pr.provider = "ALPHA_VANTAGE"

    async def yahoo_get(sym):
        if yahoo_returns_price:
            return yahoo_pr
        return None

    async def alpha_get(sym):
        if alpha_returns_price:
            return alpha_pr
        return None

    # Mock last_known
    last_row = None
    if last_known_exists:
        last_row = (
            ticker_id,
            "AAPL",
            Decimal("148.0"),
            Decimal("147.0"),
            Decimal("149.0"),
            Decimal("146.0"),
            Decimal("148.0"),
            999000,
            None,
            datetime.now(timezone.utc),
            "LAST_KNOWN",
        )

    async def mock_get_last(db, tid, sym):
        return last_row

    mock_db = AsyncMock()

    with patch("api.integrations.market_data.providers.yahoo_provider.YahooProvider") as MockYahoo:
        with patch("api.integrations.market_data.providers.alpha_provider.AlphaProvider") as MockAlpha:
            with patch("api.background.jobs.sync_intraday._get_last_known_price", side_effect=mock_get_last):
                with patch("api.integrations.market_data.provider_cooldown.is_in_cooldown", return_value=False):
                    with patch("api.integrations.market_data.provider_cooldown.set_cooldown"):
                        MockYahoo.return_value.get_ticker_price = AsyncMock(side_effect=yahoo_get)
                        MockAlpha.return_value.get_ticker_price = AsyncMock(side_effect=alpha_get)
                        MockAlpha.return_value.get_ticker_price_crypto = AsyncMock(return_value=None)

                        results = await _fetch_prices_for_tickers(mock_db, tickers)
    return results


def test_criterion_1_provider_a_fail_b_success_exactly_one_row():
    """Provider A no usable + Provider B success -> exactly 1 row."""
    results = asyncio.run(_run_fetch_with_mocks(
        yahoo_returns_price=False,
        alpha_returns_price=True,
        last_known_exists=True,
    ))
    assert len(results) == 1, f"Expected 1 row, got {len(results)}"
    assert results[0][-1] != "LAST_KNOWN", "Should be provider row, not fallback"
    assert "ALPHA" in str(results[0][-1]) or results[0][-1] == "unknown"


def test_criterion_2_both_fail_exactly_one_last_known():
    """Both providers non-usable -> exactly 1 LAST_KNOWN row."""
    results = asyncio.run(_run_fetch_with_mocks(
        yahoo_returns_price=False,
        alpha_returns_price=False,
        last_known_exists=True,
    ))
    assert len(results) == 1, f"Expected 1 LAST_KNOWN row, got {len(results)}"
    assert results[0][-1] == "LAST_KNOWN"


def test_criterion_3_provider_a_success_no_fallback():
    """Provider A success -> fallback not called (no LAST_KNOWN when A succeeds)."""
    results = asyncio.run(_run_fetch_with_mocks(
        yahoo_returns_price=True,
        alpha_returns_price=True,  # both would work, but A is first
        last_known_exists=True,
    ))
    assert len(results) == 1
    assert results[0][-1] != "LAST_KNOWN", "Fallback must not run when provider succeeds"
    assert "YAHOO" in str(results[0][-1]) or results[0][-1] == "unknown"


if __name__ == "__main__":
    import pytest
    pytest.main([__file__, "-v"])
