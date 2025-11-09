#!/usr/bin/env python3
"""
Trade Model Tests - TikTrack

בדיקות מקיפות ל-Trade Model

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os
import unittest
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from models.trade import Trade


class TestTradeModel(unittest.TestCase):
    """Test suite for the updated Trade model"""

    def setUp(self):
        """Prepare a minimal trade payload compatible with the new schema."""
        self.trade_data = {
            'trading_account_id': 1,
            'ticker_id': 1,
            'status': 'open',
            'investment_type': 'swing',
            'side': 'Long',
            'notes': 'Integration test trade',
            'created_at': datetime.now(timezone.utc)
        }

    def test_trade_creation(self):
        """Trade can be instantiated with the new schema fields."""
        trade = Trade(**self.trade_data)

        self.assertEqual(trade.trading_account_id, 1)
        self.assertEqual(trade.ticker_id, 1)
        self.assertEqual(trade.status, 'open')
        self.assertEqual(trade.investment_type, 'swing')
        self.assertEqual(trade.side, 'Long')

    def test_trade_to_dict_retains_datetimes(self):
        """to_dict keeps datetime objects so the DateNormalizationService can envelope them."""
        trade = Trade(**self.trade_data)
        trade_dict = trade.to_dict()

        self.assertIsInstance(trade_dict, dict)
        self.assertIn('created_at', trade_dict)
        self.assertIsInstance(trade_dict['created_at'], datetime)
        self.assertEqual(trade_dict['created_at'].tzinfo, timezone.utc)

    def test_trade_relationship_attributes_exist(self):
        """Relationship placeholders remain available for lazy loading."""
        trade = Trade(**self.trade_data)

        self.assertTrue(hasattr(trade, 'account'))
        self.assertTrue(hasattr(trade, 'ticker'))
        self.assertTrue(hasattr(trade, 'executions'))


if __name__ == '__main__':
    unittest.main()
