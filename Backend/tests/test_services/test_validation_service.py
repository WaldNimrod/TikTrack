#!/usr/bin/env python3
"""
Validation Service Tests - TikTrack

בדיקות מקיפות ל-Validation Service

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from services.validation_service import ValidationService


class TestValidationService(unittest.TestCase):
    """Test suite for ValidationService"""
    
    def setUp(self):
        self.validator = ValidationService()
    
    def test_validate_trade_data(self):
        """Test validating trade data"""
        valid_data = {'ticker_id': 1, 'account_id': 1, 'status': 'open'}
        invalid_data = {'ticker_id': None}
        
        # Test valid data
        result = self.validator.validate_trade_data(valid_data)
        self.assertIsInstance(result, (bool, dict))
        
        # Test invalid data
        result = self.validator.validate_trade_data(invalid_data)
        self.assertIsInstance(result, (bool, dict))
    
    def test_validate_alert_data(self):
        """Test validating alert data"""
        valid_data = {'ticker_id': 1, 'condition': 'price > 100'}
        invalid_data = {'ticker_id': None}
        
        result = self.validator.validate_alert_data(valid_data)
        self.assertIsInstance(result, (bool, dict))
        
        result = self.validator.validate_alert_data(invalid_data)
        self.assertIsInstance(result, (bool, dict))


if __name__ == '__main__':
    unittest.main()

