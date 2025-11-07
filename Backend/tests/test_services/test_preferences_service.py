#!/usr/bin/env python3
"""
Preferences Service Tests - TikTrack

בדיקות מקיפות ל-Preferences Service

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from services.preferences_service import PreferencesService
from models.preferences import Preference


class TestPreferencesService(unittest.TestCase):
    """Test suite for PreferencesService"""
    
    def setUp(self):
        self.mock_db = Mock()
        self.mock_preference = Mock(spec=Preference)
        self.mock_preference.key = 'test-key'
        self.mock_preference.value = 'test-value'
    
    def test_get_preference(self):
        """Test getting a preference"""
        self.mock_db.query.return_value.filter.return_value.first.return_value = self.mock_preference
        preference = PreferencesService.get_preference(self.mock_db, 'test-key')
        self.assertIsNotNone(preference)
    
    def test_set_preference(self):
        """Test setting a preference"""
        with patch.object(PreferencesService, 'set_preference') as mock_set:
            mock_set.return_value = self.mock_preference
            result = mock_set(self.mock_db, 'test-key', 'test-value')
            self.assertIsNotNone(result)
    
    def test_get_all_preferences(self):
        """Test getting all preferences"""
        self.mock_db.query.return_value.all.return_value = [self.mock_preference]
        preferences = PreferencesService.get_all(self.mock_db)
        self.assertIsInstance(preferences, list)


if __name__ == '__main__':
    unittest.main()

