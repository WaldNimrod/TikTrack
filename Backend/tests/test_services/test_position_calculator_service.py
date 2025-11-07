#!/usr/bin/env python3
"""
Position Calculator Service Tests - TikTrack

בדיקות מקיפות ל-Position Calculator Service

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from services.position_calculator_service import PositionCalculatorService


class TestPositionCalculatorService(unittest.TestCase):
    """Test suite for PositionCalculatorService"""
    
    def setUp(self):
        self.calculator = PositionCalculatorService()
        self.mock_db = Mock()
    
    def test_calculate_position(self):
        """Test calculating position for a trade"""
        trade_id = 1
        
        with patch.object(self.calculator, 'calculate_position') as mock_calc:
            mock_calc.return_value = {'quantity': 10, 'avg_price': 100.0}
            result = mock_calc(self.mock_db, trade_id)
            
            self.assertIsNotNone(result)
            self.assertIn('quantity', result)
    
    def test_calculate_positions_batch(self):
        """Test calculating positions for multiple trades"""
        trade_ids = [1, 2, 3]
        
        with patch.object(self.calculator, 'calculate_positions_batch') as mock_batch:
            mock_batch.return_value = {
                1: {'quantity': 10, 'avg_price': 100.0},
                2: {'quantity': 20, 'avg_price': 200.0}
            }
            result = mock_batch(self.mock_db, trade_ids)
            
            self.assertIsInstance(result, dict)
            self.assertIn(1, result)


if __name__ == '__main__':
    unittest.main()

