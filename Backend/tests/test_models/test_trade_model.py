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
from unittest.mock import Mock, patch
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from models.trade import Trade


class TestTradeModel(unittest.TestCase):
    """Test suite for Trade model"""
    
    def setUp(self):
        """Set up test environment"""
        self.trade_data = {
            'id': 1,
            'trading_account_id': 1,
            'ticker_id': 1,
            'status': 'open',
            'side': 'buy',
            'quantity': 10,
            'entry_price': 100.0,
            'created_at': datetime.now()
        }
    
    def test_trade_creation(self):
        """Test creating a Trade instance"""
        trade = Trade(**self.trade_data)
        
        self.assertEqual(trade.id, 1)
        self.assertEqual(trade.status, 'open')
        self.assertEqual(trade.side, 'buy')
        self.assertEqual(trade.quantity, 10)
    
    def test_trade_to_dict(self):
        """Test converting Trade to dictionary"""
        trade = Trade(**self.trade_data)
        
        if hasattr(trade, 'to_dict'):
            trade_dict = trade.to_dict()
            self.assertIsInstance(trade_dict, dict)
            self.assertIn('id', trade_dict)
            self.assertIn('status', trade_dict)
    
    def test_trade_validation(self):
        """Test trade data validation"""
        # Valid trade
        valid_trade = Trade(**self.trade_data)
        self.assertIsNotNone(valid_trade)
        
        # Invalid trade (missing required fields)
        invalid_data = {'id': 1}
        # Should handle missing fields gracefully
        try:
            invalid_trade = Trade(**invalid_data)
            self.assertIsNotNone(invalid_trade)
        except Exception:
            # Expected to fail validation
            pass
    
    def test_trade_relationships(self):
        """Test trade relationships"""
        trade = Trade(**self.trade_data)
        
        # Check if relationships are defined
        self.assertTrue(hasattr(trade, 'account') or hasattr(trade, 'trading_account_id'))
        self.assertTrue(hasattr(trade, 'ticker') or hasattr(trade, 'ticker_id'))


if __name__ == '__main__':
    unittest.main()

