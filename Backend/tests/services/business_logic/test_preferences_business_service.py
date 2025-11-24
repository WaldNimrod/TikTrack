"""
Tests for Preferences Business Logic Service
=============================================

Tests all preferences-related business logic validations.
"""

import pytest
from services.business_logic.preferences_business_service import PreferencesBusinessService


class TestPreferencesBusinessService:
    """Test suite for PreferencesBusinessService."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.service = PreferencesBusinessService()
    
    # ========================================================================
    # Table Name
    # ========================================================================
    
    def test_table_name(self):
        """Test that table_name property returns correct value."""
        assert self.service.table_name == 'user_preferences'
    
    # ========================================================================
    # Preference Validation
    # ========================================================================
    
    def test_validate_preference_string(self):
        """Test preference validation for string type."""
        result = self.service.validate_preference('test_preference', 'test_value', 'string')
        
        assert result['is_valid'] is True
        assert len(result['errors']) == 0
    
    def test_validate_preference_number(self):
        """Test preference validation for number type."""
        result = self.service.validate_preference('test_preference', 123.45, 'number')
        
        assert result['is_valid'] is True
        assert len(result['errors']) == 0
    
    def test_validate_preference_number_invalid(self):
        """Test preference validation for invalid number type."""
        result = self.service.validate_preference('test_preference', 'not_a_number', 'number')
        
        assert result['is_valid'] is False
        assert len(result['errors']) > 0
        assert any('number' in error.lower() for error in result['errors'])
    
    def test_validate_preference_boolean(self):
        """Test preference validation for boolean type."""
        result = self.service.validate_preference('test_preference', 'true', 'boolean')
        
        assert result['is_valid'] is True
        assert len(result['errors']) == 0
    
    def test_validate_preference_boolean_invalid(self):
        """Test preference validation for invalid boolean type."""
        result = self.service.validate_preference('test_preference', 'maybe', 'boolean')
        
        assert result['is_valid'] is False
        assert len(result['errors']) > 0
        assert any('boolean' in error.lower() for error in result['errors'])
    
    def test_validate_preference_json(self):
        """Test preference validation for JSON type."""
        result = self.service.validate_preference('test_preference', '{"key": "value"}', 'json')
        
        assert result['is_valid'] is True
        assert len(result['errors']) == 0
    
    def test_validate_preference_json_invalid(self):
        """Test preference validation for invalid JSON type."""
        result = self.service.validate_preference('test_preference', 'not json', 'json')
        
        assert result['is_valid'] is False
        assert len(result['errors']) > 0
        assert any('json' in error.lower() for error in result['errors'])
    
    def test_validate_preference_color(self):
        """Test preference validation for color type."""
        result = self.service.validate_preference('test_preference', '#FF0000', 'color')
        
        assert result['is_valid'] is True
        assert len(result['errors']) == 0
    
    def test_validate_preference_color_invalid(self):
        """Test preference validation for invalid color type."""
        result = self.service.validate_preference('test_preference', 'red', 'color')
        
        assert result['is_valid'] is False
        assert len(result['errors']) > 0
        assert any('color' in error.lower() or 'hex' in error.lower() for error in result['errors'])
    
    # ========================================================================
    # Profile Validation
    # ========================================================================
    
    def test_validate_profile_valid(self):
        """Test profile validation with valid data."""
        profile_data = {
            'profile_name': 'Test Profile',
            'is_active': False
        }
        result = self.service.validate_profile(profile_data)
        
        assert result['is_valid'] is True
        assert len(result['errors']) == 0
    
    def test_validate_profile_delete_active(self):
        """Test profile validation - cannot delete active profile."""
        profile_data = {
            'profile_id': 1,
            'is_active': True,
            'action': 'delete'
        }
        result = self.service.validate_profile(profile_data)
        
        assert result['is_valid'] is False
        assert len(result['errors']) > 0
        assert any('active' in error.lower() for error in result['errors'])
    
    def test_validate_profile_delete_inactive(self):
        """Test profile validation - can delete inactive profile."""
        profile_data = {
            'profile_id': 1,
            'is_active': False,
            'action': 'delete'
        }
        result = self.service.validate_profile(profile_data)
        
        assert result['is_valid'] is True
        assert len(result['errors']) == 0
    
    def test_validate_profile_name_empty(self):
        """Test profile validation - profile name cannot be empty."""
        profile_data = {
            'profile_name': '   ',
            'is_active': False
        }
        result = self.service.validate_profile(profile_data)
        
        assert result['is_valid'] is False
        assert len(result['errors']) > 0
        assert any('empty' in error.lower() for error in result['errors'])
    
    def test_validate_profile_name_too_long(self):
        """Test profile validation - profile name cannot exceed 100 characters."""
        profile_data = {
            'profile_name': 'a' * 101,
            'is_active': False
        }
        result = self.service.validate_profile(profile_data)
        
        assert result['is_valid'] is False
        assert len(result['errors']) > 0
        assert any('100' in error or 'exceed' in error.lower() for error in result['errors'])
    
    # ========================================================================
    # Dependencies Validation
    # ========================================================================
    
    def test_validate_dependencies_valid(self):
        """Test dependencies validation with valid preferences."""
        preferences = {
            'preference1': 'value1',
            'preference2': 'value2'
        }
        result = self.service.validate_dependencies(preferences)
        
        assert result['is_valid'] is True
        assert len(result['errors']) == 0
    
    def test_validate_dependencies_empty(self):
        """Test dependencies validation with empty preferences."""
        preferences = {}
        result = self.service.validate_dependencies(preferences)
        
        assert result['is_valid'] is True
        assert len(result['errors']) == 0
    
    # ========================================================================
    # General Validation
    # ========================================================================
    
    def test_validate_empty_data(self):
        """Test general validate method with empty data."""
        result = self.service.validate({})
        
        assert isinstance(result, dict)
        assert 'is_valid' in result
        assert 'errors' in result
    
    def test_validate_with_preference_name(self):
        """Test general validate method with preference name."""
        data = {
            'preference_name': 'test_preference',
            'value': 'test_value'
        }
        result = self.service.validate(data)
        
        assert isinstance(result, dict)
        assert 'is_valid' in result
        assert 'errors' in result

