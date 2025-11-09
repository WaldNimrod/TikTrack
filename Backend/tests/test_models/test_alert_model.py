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
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from models.alert import Alert


class TestAlertModel(unittest.TestCase):
    """Tests for the updated Alert model using the new condition fields."""

    def setUp(self):
        self.alert_data = {
            'ticker_id': 1,
            'message': 'Price crossed threshold',
            'status': 'open',
            'condition_attribute': 'price',
            'condition_operator': 'more_than',
            'condition_number': '100',
            'related_type_id': 2,
            'related_id': 5,
            'created_at': datetime.now(timezone.utc),
            'triggered_at': None
        }

    def test_alert_creation(self):
        alert = Alert(**self.alert_data)

        self.assertEqual(alert.ticker_id, 1)
        self.assertEqual(alert.status, 'open')
        self.assertEqual(alert.condition_attribute, 'price')
        self.assertEqual(alert.condition_operator, 'more_than')
        self.assertEqual(alert.condition_number, '100')

    def test_alert_to_dict_retains_datetimes(self):
        alert = Alert(**self.alert_data)
        alert_dict = alert.to_dict()

        self.assertIn('created_at', alert_dict)
        self.assertIsInstance(alert_dict['created_at'], datetime)
        self.assertEqual(alert_dict['condition_attribute'], 'price')
        self.assertIn('condition_display_text', alert_dict)

    def test_condition_display_text(self):
        alert = Alert(**self.alert_data)
        self.assertIn('יותר מ', alert.get_condition_display_text())


if __name__ == '__main__':
    unittest.main()
