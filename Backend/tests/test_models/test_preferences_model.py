#!/usr/bin/env python3
"""
Preferences Model Tests - TikTrack

בדיקות מקיפות ל-Preferences Model

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os
import unittest
from unittest.mock import Mock
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from models.preferences import Preference


class TestPreferenceModel(unittest.TestCase):
    """Test suite for Preference model"""
    
    def setUp(self):
        """Set up test environment"""
        self.preference_data = {
            'id': 1,
            'key': 'test-key',
            'value': 'test-value',
            'created_at': datetime.now()
        }
    
    def test_preference_creation(self):
        """Test creating a Preference instance"""
        preference = Preference(**self.preference_data)
        
        self.assertEqual(preference.id, 1)
        self.assertEqual(preference.key, 'test-key')
        self.assertEqual(preference.value, 'test-value')
    
    def test_preference_to_dict(self):
        """Test converting Preference to dictionary"""
        preference = Preference(**self.preference_data)
        
        if hasattr(preference, 'to_dict'):
            pref_dict = preference.to_dict()
            self.assertIsInstance(pref_dict, dict)
            self.assertIn('key', pref_dict)
            self.assertIn('value', pref_dict)
    
    def test_preference_validation(self):
        """Test preference data validation"""
        valid_preference = Preference(**self.preference_data)
        self.assertIsNotNone(valid_preference)


if __name__ == '__main__':
    unittest.main()

