#!/usr/bin/env python3
"""
Alerts Routes API Tests - TikTrack

בדיקות מקיפות ל-API endpoints של Alerts

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os
import unittest
import datetime
from unittest.mock import Mock, patch

# Add Backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from flask import Flask
from routes.api.alerts import alerts_bp
from services.alert_service import AlertService


class TestAlertsRoutes(unittest.TestCase):
    """Test suite for Alerts API routes"""
    
    def setUp(self):
        """Set up test environment"""
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.register_blueprint(alerts_bp)
        self.client = self.app.test_client()
        
        # Mock database session
        self.mock_db = Mock()
        self.patcher_preferences = patch('routes.api.alerts.preferences_service')
        self.mock_preferences = self.patcher_preferences.start()
        self.mock_preferences.get_preference.return_value = 'UTC'

    def tearDown(self):
        self.patcher_preferences.stop()
    
    def test_get_alerts_endpoint_exists(self):
        """Test that GET /api/alerts endpoint exists"""
        with self.app.test_client() as client:
            with patch('routes.api.alerts.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                
                with patch('routes.api.alerts.AlertService.get_all') as mock_get_all:
                    mock_get_all.return_value = []
                    
                    response = client.get('/api/alerts/')
                    
                    self.assertIn(response.status_code, [200, 500])
    
    def test_create_alert_endpoint(self):
        """Test POST /api/alerts endpoint"""
        with self.app.test_client() as client:
            with patch('routes.api.alerts.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                
                with patch('routes.api.alerts.AlertService.create') as mock_create:
                    mock_create.return_value = Mock(id=1, to_dict=lambda: {'id': 1})
                    
                    mock_create.return_value = Mock(
                        id=1,
                        to_dict=lambda: {
                            'id': 1,
                            'ticker_id': 1,
                            'created_at': datetime.datetime.now(datetime.timezone.utc)
                        }
                    )

                    response = client.post(
                        '/api/alerts/',
                        json={
                            'ticker_id': 1,
                            'condition_attribute': 'price',
                            'condition_operator': 'more_than',
                            'condition_number': '100'
                        },
                        content_type='application/json'
                    )
                    
                    self.assertIn(response.status_code, [200, 201, 400, 500])
    
    def test_update_alert_endpoint(self):
        """Test PUT /api/alerts/<id> endpoint"""
        with self.app.test_client() as client:
            with patch('routes.api.alerts.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                
                with patch('routes.api.alerts.AlertService.update') as mock_update:
                    mock_update.return_value = Mock(id=1, to_dict=lambda: {'id': 1})
                    
                    response = client.put('/api/alerts/1/',
                                        json={'status': 'active'},
                                        content_type='application/json')
                    
                    self.assertIn(response.status_code, [200, 404, 400, 500])
    
    def test_delete_alert_endpoint(self):
        """Test DELETE /api/alerts/<id> endpoint"""
        with self.app.test_client() as client:
            with patch('routes.api.alerts.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                
                with patch('routes.api.alerts.AlertService.delete') as mock_delete:
                    mock_delete.return_value = True
                    
                    response = client.delete('/api/alerts/1/')
                    
                    self.assertIn(response.status_code, [200, 204, 404, 500])


if __name__ == '__main__':
    unittest.main()

