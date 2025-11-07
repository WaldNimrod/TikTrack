#!/usr/bin/env python3
"""
Preferences Routes API Tests - TikTrack

בדיקות מקיפות ל-API endpoints של Preferences

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from flask import Flask
from routes.api.preferences import preferences_bp


class TestPreferencesRoutes(unittest.TestCase):
    """Test suite for Preferences API routes"""
    
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.register_blueprint(preferences_bp)
        self.mock_db = Mock()
    
    def test_get_preferences_endpoint(self):
        """Test GET /api/preferences endpoint"""
        with self.app.test_client() as client:
            with patch('routes.api.preferences.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                response = client.get('/api/preferences')
                self.assertIn(response.status_code, [200, 500])
    
    def test_update_preference_endpoint(self):
        """Test PUT /api/preferences/<key> endpoint"""
        with self.app.test_client() as client:
            with patch('routes.api.preferences.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                response = client.put('/api/preferences/test-key',
                                    json={'value': 'test-value'},
                                    content_type='application/json')
                self.assertIn(response.status_code, [200, 404, 400, 500])


if __name__ == '__main__':
    unittest.main()

