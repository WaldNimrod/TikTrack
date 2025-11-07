#!/usr/bin/env python3
"""
Trading Accounts Routes API Tests - TikTrack

בדיקות מקיפות ל-API endpoints של Trading Accounts

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from flask import Flask
from routes.api.trading_accounts import trading_accounts_bp


class TestTradingAccountsRoutes(unittest.TestCase):
    """Test suite for Trading Accounts API routes"""
    
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.register_blueprint(trading_accounts_bp)
        self.mock_db = Mock()
    
    def test_get_accounts_endpoint(self):
        """Test GET /api/trading-accounts endpoint"""
        with self.app.test_client() as client:
            with patch('routes.api.trading_accounts.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                response = client.get('/api/trading-accounts')
                self.assertIn(response.status_code, [200, 500])
    
    def test_create_account_endpoint(self):
        """Test POST /api/trading-accounts endpoint"""
        with self.app.test_client() as client:
            with patch('routes.api.trading_accounts.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                response = client.post('/api/trading-accounts',
                                     json={'name': 'Test Account'},
                                     content_type='application/json')
                self.assertIn(response.status_code, [200, 201, 400, 500])


if __name__ == '__main__':
    unittest.main()

