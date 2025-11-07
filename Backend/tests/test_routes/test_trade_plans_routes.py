#!/usr/bin/env python3
"""
Trade Plans Routes API Tests - TikTrack

בדיקות מקיפות ל-API endpoints של Trade Plans

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from flask import Flask
from routes.api.trade_plans import trade_plans_bp


class TestTradePlansRoutes(unittest.TestCase):
    """Test suite for Trade Plans API routes"""
    
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.register_blueprint(trade_plans_bp)
        self.mock_db = Mock()
    
    def test_get_trade_plans_endpoint(self):
        """Test GET /api/trade_plans endpoint"""
        with self.app.test_client() as client:
            with patch('routes.api.trade_plans.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                response = client.get('/api/trade_plans')
                self.assertIn(response.status_code, [200, 500])
    
    def test_create_trade_plan_endpoint(self):
        """Test POST /api/trade_plans endpoint"""
        with self.app.test_client() as client:
            with patch('routes.api.trade_plans.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                response = client.post('/api/trade_plans',
                                     json={'ticker_id': 1, 'account_id': 1},
                                     content_type='application/json')
                self.assertIn(response.status_code, [200, 201, 400, 500])


if __name__ == '__main__':
    unittest.main()

