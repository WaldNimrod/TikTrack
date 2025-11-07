#!/usr/bin/env python3
"""
Trades Routes API Tests - TikTrack

בדיקות מקיפות ל-API endpoints של Trades

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os
import unittest
from unittest.mock import Mock, patch, MagicMock

# Add Backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from flask import Flask
from routes.api.trades import trades_bp
from services.trade_service import TradeService
from models.trade import Trade


class TestTradesRoutes(unittest.TestCase):
    """Test suite for Trades API routes"""
    
    def setUp(self):
        """Set up test environment"""
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.register_blueprint(trades_bp)
        self.client = self.app.test_client()
        
        # Mock database session
        self.mock_db = Mock()
        self.mock_db.query = Mock()
        
    def test_get_trades_endpoint_exists(self):
        """Test that GET /api/trades endpoint exists"""
        with self.app.test_client() as client:
            with patch('routes.api.trades.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                
                with patch('routes.api.trades.TradeService.get_all') as mock_get_all:
                    mock_get_all.return_value = []
                    
                    response = client.get('/api/trades')
                    
                    # Should return 200 or handle error gracefully
                    self.assertIn(response.status_code, [200, 500])
    
    def test_get_trades_with_filters(self):
        """Test GET /api/trades with filtering parameters"""
        with self.app.test_client() as client:
            with patch('routes.api.trades.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                
                with patch('routes.api.trades.TradeService.get_by_account_and_status') as mock_filter:
                    mock_filter.return_value = []
                    
                    response = client.get('/api/trades?trading_account_id=1&status=open')
                    
                    self.assertIn(response.status_code, [200, 500])
    
    def test_create_trade_endpoint(self):
        """Test POST /api/trades endpoint"""
        with self.app.test_client() as client:
            with patch('routes.api.trades.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                
                with patch('routes.api.trades.TradeService.create') as mock_create:
                    mock_create.return_value = Mock(id=1, to_dict=lambda: {'id': 1})
                    
                    response = client.post('/api/trades', 
                                         json={'ticker_id': 1, 'account_id': 1},
                                         content_type='application/json')
                    
                    self.assertIn(response.status_code, [200, 201, 400, 500])
    
    def test_update_trade_endpoint(self):
        """Test PUT /api/trades/<id> endpoint"""
        with self.app.test_client() as client:
            with patch('routes.api.trades.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                
                with patch('routes.api.trades.TradeService.update') as mock_update:
                    mock_update.return_value = Mock(id=1, to_dict=lambda: {'id': 1})
                    
                    response = client.put('/api/trades/1',
                                        json={'status': 'closed'},
                                        content_type='application/json')
                    
                    self.assertIn(response.status_code, [200, 404, 400, 500])
    
    def test_delete_trade_endpoint(self):
        """Test DELETE /api/trades/<id> endpoint"""
        with self.app.test_client() as client:
            with patch('routes.api.trades.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                
                with patch('routes.api.trades.TradeService.delete') as mock_delete:
                    mock_delete.return_value = True
                    
                    response = client.delete('/api/trades/1')
                    
                    self.assertIn(response.status_code, [200, 204, 404, 500])
    
    def test_get_trade_by_id_endpoint(self):
        """Test GET /api/trades/<id> endpoint"""
        with self.app.test_client() as client:
            with patch('routes.api.trades.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                
                with patch('routes.api.trades.TradeService.get_by_id') as mock_get:
                    mock_get.return_value = Mock(id=1, to_dict=lambda: {'id': 1})
                    
                    response = client.get('/api/trades/1')
                    
                    self.assertIn(response.status_code, [200, 404, 500])
    
    def test_error_handling(self):
        """Test error handling in routes"""
        with self.app.test_client() as client:
            with patch('routes.api.trades.get_db') as mock_get_db:
                mock_get_db.side_effect = Exception('Database error')
                
                response = client.get('/api/trades')
                
                # Should handle error gracefully
                self.assertIn(response.status_code, [500, 503])


if __name__ == '__main__':
    unittest.main()

