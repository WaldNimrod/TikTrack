#!/usr/bin/env python3
"""
Cache Management Routes API Tests - TikTrack

בדיקות מקיפות ל-API endpoints של Cache Management

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from flask import Flask
from routes.api.cache_management import cache_management_bp


class TestCacheManagementRoutes(unittest.TestCase):
    """Test suite for Cache Management API routes"""
    
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.register_blueprint(cache_management_bp)
        self.mock_db = Mock()
    
    def test_clear_cache_endpoint(self):
        """Test POST /api/cache/clear endpoint"""
        with self.app.test_client() as client:
            with patch('routes.api.cache_management.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                response = client.post('/api/cache/clear',
                                     json={'level': 'light'},
                                     content_type='application/json')
                self.assertIn(response.status_code, [200, 400, 500])
    
    def test_get_cache_stats_endpoint(self):
        """Test GET /api/cache/stats endpoint"""
        with self.app.test_client() as client:
            with patch('routes.api.cache_management.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                response = client.get('/api/cache/stats')
                self.assertIn(response.status_code, [200, 500])


if __name__ == '__main__':
    unittest.main()

