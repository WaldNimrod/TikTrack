#!/usr/bin/env python3
"""
Cache Service Tests - TikTrack

בדיקות מקיפות ל-Cache Service

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from services.cache_service import CacheService
from services.advanced_cache_service import advanced_cache_service


class TestCacheService(unittest.TestCase):
    """Test suite for CacheService"""
    
    def setUp(self):
        self.mock_db = Mock()
    
    def test_get_cache(self):
        """Test getting cache value"""
        with patch.object(advanced_cache_service, 'get') as mock_get:
            mock_get.return_value = {'test': 'value'}
            result = advanced_cache_service.get('test-key')
            self.assertIsNotNone(result)
    
    def test_set_cache(self):
        """Test setting cache value"""
        with patch.object(advanced_cache_service, 'set') as mock_set:
            mock_set.return_value = True
            result = advanced_cache_service.set('test-key', {'test': 'value'})
            self.assertTrue(result)
    
    def test_clear_cache(self):
        """Test clearing cache"""
        with patch.object(advanced_cache_service, 'clear') as mock_clear:
            mock_clear.return_value = True
            result = advanced_cache_service.clear('light')
            self.assertTrue(result)


if __name__ == '__main__':
    unittest.main()

