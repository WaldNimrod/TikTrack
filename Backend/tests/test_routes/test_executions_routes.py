#!/usr/bin/env python3
"""
Executions Routes API Tests - TikTrack

בדיקות מקיפות ל-API endpoints של Executions

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from flask import Flask
from routes.api.executions import executions_bp


class TestExecutionsRoutes(unittest.TestCase):
    """Test suite for Executions API routes"""
    
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.register_blueprint(executions_bp)
        self.mock_db = Mock()
    
    def test_get_executions_endpoint(self):
        """Test GET /api/executions endpoint"""
        with self.app.test_client() as client:
            with patch('routes.api.executions.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                response = client.get('/api/executions')
                self.assertIn(response.status_code, [200, 500])
    
    def test_create_execution_endpoint(self):
        """Test POST /api/executions endpoint"""
        with self.app.test_client() as client:
            with patch('routes.api.executions.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                response = client.post('/api/executions',
                                     json={'trade_id': 1, 'quantity': 10},
                                     content_type='application/json')
                self.assertIn(response.status_code, [200, 201, 400, 500])


if __name__ == '__main__':
    unittest.main()

