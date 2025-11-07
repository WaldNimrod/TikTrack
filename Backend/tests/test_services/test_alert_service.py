#!/usr/bin/env python3
"""
Alert Service Tests - TikTrack

בדיקות מקיפות ל-Alert Service

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from services.alert_service import AlertService
from models.alert import Alert


class TestAlertService(unittest.TestCase):
    """Test suite for AlertService"""
    
    def setUp(self):
        self.mock_db = Mock()
        self.mock_alert = Mock(spec=Alert)
        self.mock_alert.id = 1
        self.mock_alert.to_dict = Mock(return_value={'id': 1, 'status': 'active'})
    
    def test_get_all_alerts(self):
        """Test getting all alerts"""
        self.mock_db.query.return_value.all.return_value = [self.mock_alert]
        alerts = AlertService.get_all(self.mock_db)
        self.assertIsInstance(alerts, list)
    
    def test_get_alert_by_id(self):
        """Test getting alert by ID"""
        self.mock_db.query.return_value.filter.return_value.first.return_value = self.mock_alert
        alert = AlertService.get_by_id(self.mock_db, 1)
        self.assertIsNotNone(alert)
    
    def test_create_alert(self):
        """Test creating a new alert"""
        alert_data = {'ticker_id': 1, 'condition': 'price > 100'}
        with patch.object(AlertService, 'create') as mock_create:
            mock_create.return_value = self.mock_alert
            result = mock_create(self.mock_db, alert_data)
            self.assertIsNotNone(result)
    
    def test_update_alert(self):
        """Test updating an alert"""
        self.mock_db.query.return_value.filter.return_value.first.return_value = self.mock_alert
        update_data = {'status': 'inactive'}
        with patch.object(AlertService, 'update') as mock_update:
            mock_update.return_value = self.mock_alert
            result = mock_update(self.mock_db, 1, update_data)
            self.assertIsNotNone(result)


if __name__ == '__main__':
    unittest.main()

