"""
Tests for Statistics Business Logic Service
=============================================

Tests all statistics-related business logic calculations.
"""

import pytest
from services.business_logic.statistics_business_service import StatisticsBusinessService


class TestStatisticsBusinessService:
    """Test suite for StatisticsBusinessService."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.service = StatisticsBusinessService()
    
    def test_calculate_sum(self):
        """Test sum calculation."""
        data = [
            {'amount': 100.0},
            {'amount': 200.0},
            {'amount': 300.0}
        ]
        
        result = self.service.calculate_sum(data, 'amount')
        
        assert result['is_valid'] is True
        assert result['sum'] == 600.0
    
    def test_calculate_average(self):
        """Test average calculation."""
        data = [
            {'price': 100.0},
            {'price': 200.0},
            {'price': 300.0}
        ]
        
        result = self.service.calculate_average(data, 'price')
        
        assert result['is_valid'] is True
        assert result['average'] == 200.0
    
    def test_count_records(self):
        """Test record counting."""
        data = [
            {'status': 'open'},
            {'status': 'closed'},
            {'status': 'open'}
        ]
        
        result = self.service.count_records(data)
        
        assert result['is_valid'] is True
        assert result['count'] == 3
    
    def test_count_records_with_filter(self):
        """Test record counting with filter."""
        data = [
            {'status': 'open'},
            {'status': 'closed'},
            {'status': 'open'}
        ]
        
        result = self.service.count_records(
            data,
            lambda item: item.get('status') == 'open'
        )
        
        assert result['is_valid'] is True
        assert result['count'] == 2
    
    def test_calculate_min_max(self):
        """Test min/max calculation."""
        data = [
            {'price': 100.0},
            {'price': 200.0},
            {'price': 50.0}
        ]
        
        result = self.service.calculate_min_max(data, 'price')
        
        assert result['is_valid'] is True
        assert result['min'] == 50.0
        assert result['max'] == 200.0

