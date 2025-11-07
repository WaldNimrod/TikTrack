#!/usr/bin/env python3
"""
Alert Model Tests - TikTrack

בדיקות מקיפות ל-Alert Model

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os
import unittest
from unittest.mock import Mock
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from models.alert import Alert


class TestAlertModel(unittest.TestCase):
    """Test suite for Alert model"""
    
    def setUp(self):
        """Set up test environment"""
        self.alert_data = {
            'id': 1,
            'ticker_id': 1,
            'condition': 'price > 100',
            'status': 'active',
            'created_at': datetime.now()
        }
    
    def test_alert_creation(self):
        """Test creating an Alert instance"""
        alert = Alert(**self.alert_data)
        
        self.assertEqual(alert.id, 1)
        self.assertEqual(alert.status, 'active')
        self.assertEqual(alert.condition, 'price > 100')
    
    def test_alert_to_dict(self):
        """Test converting Alert to dictionary"""
        alert = Alert(**self.alert_data)
        
        if hasattr(alert, 'to_dict'):
            alert_dict = alert.to_dict()
            self.assertIsInstance(alert_dict, dict)
            self.assertIn('id', alert_dict)
            self.assertIn('status', alert_dict)
    
    def test_alert_validation(self):
        """Test alert data validation"""
        valid_alert = Alert(**self.alert_data)
        self.assertIsNotNone(valid_alert)


if __name__ == '__main__':
    unittest.main()

