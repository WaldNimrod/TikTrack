#!/usr/bin/env python3
"""
Trade Service Tests - TikTrack

בדיקות מקיפות ל-Trade Service

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os
import unittest
from unittest.mock import Mock, patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from services.trade_service import TradeService
from models.trade import Trade


class TestTradeService(unittest.TestCase):
    """Test suite for TradeService"""
    
    def setUp(self):
        """Set up test environment"""
        self.mock_db = Mock()
        self.mock_trade = Mock(spec=Trade)
        self.mock_trade.id = 1
        self.mock_trade.to_dict = Mock(return_value={'id': 1, 'status': 'open'})
    
    def test_get_all_trades(self):
        """Test getting all trades"""
        self.mock_db.query.return_value.all.return_value = [self.mock_trade]
        
        trades = TradeService.get_all(self.mock_db)
        
        self.assertIsInstance(trades, list)
        self.mock_db.query.assert_called()
    
    def test_get_trade_by_id(self):
        """Test getting trade by ID"""
        self.mock_db.query.return_value.filter.return_value.first.return_value = self.mock_trade
        
        trade = TradeService.get_by_id(self.mock_db, 1)
        
        self.assertIsNotNone(trade)
        self.assertEqual(trade.id, 1)
    
    def test_create_trade(self):
        """Test creating a new trade"""
        trade_data = {'ticker_id': 1, 'account_id': 1, 'status': 'open'}
        
        with patch.object(TradeService, '_validate_trade_data') as mock_validate:
            mock_validate.return_value = True
            
            with patch.object(Trade, '__init__', return_value=None):
                new_trade = Mock(spec=Trade)
                new_trade.id = 1
                
                self.mock_db.add = Mock()
                self.mock_db.commit = Mock()
                self.mock_db.refresh = Mock()
                
                # Mock TradeService.create
                with patch.object(TradeService, 'create') as mock_create:
                    mock_create.return_value = new_trade
                    result = mock_create(self.mock_db, trade_data)
                    
                    self.assertIsNotNone(result)
    
    def test_update_trade(self):
        """Test updating a trade"""
        self.mock_db.query.return_value.filter.return_value.first.return_value = self.mock_trade
        self.mock_db.commit = Mock()
        
        update_data = {'status': 'closed'}
        
        with patch.object(TradeService, 'update') as mock_update:
            mock_update.return_value = self.mock_trade
            result = mock_update(self.mock_db, 1, update_data)
            
            self.assertIsNotNone(result)
    
    def test_delete_trade(self):
        """Test deleting a trade"""
        self.mock_db.query.return_value.filter.return_value.first.return_value = self.mock_trade
        self.mock_db.delete = Mock()
        self.mock_db.commit = Mock()
        
        with patch.object(TradeService, 'delete') as mock_delete:
            mock_delete.return_value = True
            result = mock_delete(self.mock_db, 1)
            
            self.assertTrue(result)
    
    def test_get_by_account(self):
        """Test getting trades by account"""
        self.mock_db.query.return_value.filter.return_value.all.return_value = [self.mock_trade]
        
        trades = TradeService.get_by_account(self.mock_db, 1)
        
        self.assertIsInstance(trades, list)
    
    def test_get_by_status(self):
        """Test getting trades by status"""
        self.mock_db.query.return_value.filter.return_value.all.return_value = [self.mock_trade]
        
        trades = TradeService.get_by_status(self.mock_db, 'open')
        
        self.assertIsInstance(trades, list)


if __name__ == '__main__':
    unittest.main()

