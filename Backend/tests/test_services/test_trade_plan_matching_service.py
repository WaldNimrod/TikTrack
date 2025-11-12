#!/usr/bin/env python3
"""
Trade Plan Matching Service Tests - TikTrack
============================================

Unit tests covering trade-plan recommendation logic.
"""

import os
import sys
import unittest
from datetime import datetime, timedelta
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from services.trade_plan_matching_service import TradePlanMatchingService
from services.trade_service import TradeService


def _build_trade(
    trade_id: int,
    ticker_id: int,
    trading_account_id: int,
    *,
    side: str = 'Long',
    created_at: datetime = None,
    notes: str = None,
    executions=None,
):
    return SimpleNamespace(
        id=trade_id,
        ticker_id=ticker_id,
        trading_account_id=trading_account_id,
        side=side,
        investment_type='swing',
        status='open',
        created_at=created_at or datetime.utcnow(),
        closed_at=None,
        notes=notes,
        trade_plan_id=None,
        ticker=SimpleNamespace(symbol='TCKR'),
        account=SimpleNamespace(name='Primary Account'),
        executions=executions or [],
    )


def _build_plan(
    plan_id: int,
    ticker_id: int,
    trading_account_id: int,
    *,
    side: str = 'long',
    created_at: datetime = None,
    status: str = 'open',
):
    return SimpleNamespace(
        id=plan_id,
        ticker_id=ticker_id,
        trading_account_id=trading_account_id,
        side=side,
        status=status,
        investment_type='swing',
        planned_amount=10_000,
        entry_price=100.5,
        created_at=created_at or datetime.utcnow(),
        cancelled_at=None,
        account=SimpleNamespace(name='Primary Account'),
        ticker=SimpleNamespace(symbol='TCKR'),
    )


class TestTradePlanMatchingService(unittest.TestCase):
    """Test suite for trade-plan matching heuristics."""

    def test_assignment_suggestions_sorted_by_score(self):
        """Assignments are produced and sorted by score."""
        trade = _build_trade(
            trade_id=1,
            ticker_id=101,
            trading_account_id=777,
            created_at=datetime.utcnow(),
        )
        plan = _build_plan(
            plan_id=10,
            ticker_id=101,
            trading_account_id=777,
            created_at=datetime.utcnow() - timedelta(days=1),
        )

        db = MagicMock()
        with patch.object(
            TradeService,
            'get_trades_without_plan',
            return_value=[trade],
        ), patch.object(
            TradePlanMatchingService,
            '_load_open_plans_for_tickers',
            return_value=[plan],
        ):
            suggestions = TradePlanMatchingService.get_assignment_suggestions(db, max_items=None)

        self.assertEqual(len(suggestions), 1)
        self.assertEqual(suggestions[0]['trade_id'], trade.id)
        self.assertGreaterEqual(suggestions[0]['best_score'], TradePlanMatchingService.ASSIGNMENT_MIN_SCORE)
        self.assertTrue(suggestions[0]['suggestions'])

    def test_creation_suggestions_penalize_assignments(self):
        """Creation scores drop when trade already has assignment suggestion."""
        trade = _build_trade(
            trade_id=2,
            ticker_id=202,
            trading_account_id=900,
            notes="Needs plan",
            executions=[
                SimpleNamespace(
                    action='buy',
                    quantity=5,
                    price=100,
                    fee=1,
                    date=datetime.utcnow(),
                ),
            ],
        )
        assignment_index = {trade.id: 90}

        with patch.object(
            TradeService,
            'get_trades_without_plan',
            return_value=[trade],
        ):
            suggestions = TradePlanMatchingService.get_creation_suggestions(
                MagicMock(),
                assignment_index=assignment_index,
            )

        self.assertEqual(len(suggestions), 1)
        suggestion = suggestions[0]
        self.assertTrue(suggestion['has_assignment_suggestion'])
        self.assertLess(
            suggestion['score'],
            TradePlanMatchingService.CREATION_BASE_SCORE,
            "Score should be penalized for assignment overlap",
        )
        self.assertIn('prefill', suggestion)
        self.assertGreater(suggestion['prefill']['planned_amount'], 0)

    def test_link_trade_to_plan_uses_trade_service(self):
        """link_trade_to_plan delegates to TradeService.assign_plan."""
        db = MagicMock()
        trade = _build_trade(trade_id=5, ticker_id=505, trading_account_id=12)

        with patch.object(
            TradeService,
            'assign_plan',
            return_value=trade,
        ) as mock_assign:
            query_chain = db.query.return_value
            options_chain = query_chain.options.return_value
            filter_chain = options_chain.filter.return_value
            filter_chain.first.return_value = trade

            result = TradePlanMatchingService.link_trade_to_plan(db, 5, 42)

        mock_assign.assert_called_once_with(db, 5, 42, validate_ticker=True)
        self.assertEqual(result['id'], trade.id)
        db.refresh.assert_called_with(trade)


if __name__ == '__main__':
    unittest.main()

