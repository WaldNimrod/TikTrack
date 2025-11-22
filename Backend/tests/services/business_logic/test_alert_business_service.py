"""
Tests for Alert Business Logic Service
========================================

Tests all alert-related business logic validations.
"""

import pytest
from services.business_logic.alert_business_service import AlertBusinessService


class TestAlertBusinessService:
    """Test suite for AlertBusinessService."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.service = AlertBusinessService()
    
    def test_validate_condition_value_price_valid(self):
        """Test validation of valid price condition."""
        result = self.service.validate_condition_value('price', 100.0)
        
        assert result['is_valid'] is True
        assert result['error'] is None
    
    def test_validate_condition_value_price_invalid_negative(self):
        """Test validation of negative price condition."""
        result = self.service.validate_condition_value('price', -10.0)
        
        assert result['is_valid'] is False
        assert 'מחיר' in result['error'] or 'price' in result['error'].lower()
    
    def test_validate_condition_value_change_valid(self):
        """Test validation of valid change condition."""
        result = self.service.validate_condition_value('change', 50.0)
        
        assert result['is_valid'] is True
        assert result['error'] is None
    
    def test_validate_condition_value_change_invalid_out_of_range(self):
        """Test validation of change condition out of range."""
        result = self.service.validate_condition_value('change', 150.0)
        
        assert result['is_valid'] is False
        assert 'אחוז' in result['error'] or 'change' in result['error'].lower()
    
    def test_validate_alert_valid(self):
        """Test validation of valid alert data."""
        alert_data = {
            'condition_attribute': 'price',
            'condition_number': 100.0
        }
        
        result = self.service.validate(alert_data)
        
        assert result['is_valid'] is True
        assert len(result['errors']) == 0

