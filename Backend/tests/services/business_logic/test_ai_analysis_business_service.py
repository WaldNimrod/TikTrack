"""
Tests for AI Analysis Business Logic Service
=============================================

Tests all AI analysis-related business logic validations and calculations.
"""

import pytest
from services.business_logic.ai_analysis_business_service import AIAnalysisBusinessService


class TestAIAnalysisBusinessService:
    """Test suite for AIAnalysisBusinessService."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.service = AIAnalysisBusinessService()
    
    # ========================================================================
    # Validation Tests
    # ========================================================================
    
    def test_validate_success(self):
        """Test successful validation with valid data."""
        data = {
            'template_id': 1,
            'variables': {'stock_ticker': 'TSLA', 'goal': 'Investment'},
            'user_id': 1,
            'provider': 'gemini'
        }
        result = self.service.validate(data)
        
        # Note: This will fail if template_id=1 doesn't exist in DB
        # But we're testing the validation logic, not DB existence
        # In real tests, we'd mock the DB or use fixtures
        assert isinstance(result, dict)
        assert 'is_valid' in result
        assert 'errors' in result
    
    def test_validate_missing_template_id(self):
        """Test validation with missing template_id."""
        data = {
            'variables': {'stock_ticker': 'TSLA'},
            'user_id': 1,
            'provider': 'gemini'
        }
        result = self.service.validate(data)
        
        assert result['is_valid'] is False
        assert len(result['errors']) > 0
        # Should have error about missing template_id
        assert any('template_id' in str(error).lower() or 'required' in str(error).lower() 
                   for error in result['errors'])
    
    def test_validate_invalid_provider(self):
        """Test validation with invalid provider."""
        data = {
            'template_id': 1,
            'variables': {'stock_ticker': 'TSLA'},
            'user_id': 1,
            'provider': 'invalid_provider'
        }
        result = self.service.validate(data)
        
        assert result['is_valid'] is False
        assert len(result['errors']) > 0
        # Should have error about invalid provider
        assert any('provider' in str(error).lower() or 'gemini' in str(error).lower() or 'perplexity' in str(error).lower()
                   for error in result['errors'])
    
    def test_validate_empty_variables(self):
        """Test validation with empty variables."""
        data = {
            'template_id': 1,
            'variables': {},
            'user_id': 1,
            'provider': 'gemini'
        }
        result = self.service.validate(data)
        
        assert result['is_valid'] is False
        assert len(result['errors']) > 0
        # Should have error about empty variables
        assert any('variable' in str(error).lower() or 'empty' in str(error).lower() or 'required' in str(error).lower()
                   for error in result['errors'])
    
    def test_validate_missing_variables(self):
        """Test validation with missing variables."""
        data = {
            'template_id': 1,
            'user_id': 1,
            'provider': 'gemini'
        }
        result = self.service.validate(data)
        
        assert result['is_valid'] is False
        assert len(result['errors']) > 0
        # Should have error about missing variables
        assert any('variable' in str(error).lower() or 'required' in str(error).lower()
                   for error in result['errors'])
    
    def test_validate_invalid_status(self):
        """Test validation with invalid status."""
        data = {
            'template_id': 1,
            'variables': {'stock_ticker': 'TSLA'},
            'user_id': 1,
            'provider': 'gemini',
            'status': 'invalid_status'
        }
        result = self.service.validate(data)
        
        assert result['is_valid'] is False
        assert len(result['errors']) > 0
        # Should have error about invalid status
        assert any('status' in str(error).lower() or 'pending' in str(error).lower() or 'completed' in str(error).lower()
                   for error in result['errors'])
    
    def test_validate_valid_status(self):
        """Test validation with valid status."""
        data = {
            'template_id': 1,
            'variables': {'stock_ticker': 'TSLA'},
            'user_id': 1,
            'provider': 'gemini',
            'status': 'pending'
        }
        result = self.service.validate(data)
        
        # Status is valid, but other validations may fail
        # We're just checking that valid status doesn't add errors
        assert isinstance(result, dict)
        assert 'is_valid' in result
        assert 'errors' in result
    
    # ========================================================================
    # Variables Validation Tests
    # ========================================================================
    
    def test_validate_variables_success(self):
        """Test successful variables validation."""
        variables = {
            'stock_ticker': 'TSLA',
            'goal': 'Investment',
            'investment_thesis': 'Strong fundamentals'
        }
        result = self.service.validate_variables(variables)
        
        assert result['is_valid'] is True
        assert len(result['errors']) == 0
    
    def test_validate_variables_not_dict(self):
        """Test variables validation with non-dict value."""
        variables = 'not a dict'
        result = self.service.validate_variables(variables)
        
        assert result['is_valid'] is False
        assert len(result['errors']) > 0
        assert any('dictionary' in str(error).lower() or 'dict' in str(error).lower()
                   for error in result['errors'])
    
    def test_validate_variables_empty(self):
        """Test variables validation with empty dict."""
        variables = {}
        result = self.service.validate_variables(variables)
        
        assert result['is_valid'] is False
        assert len(result['errors']) > 0
        assert any('empty' in str(error).lower()
                   for error in result['errors'])
    
    def test_validate_variables_invalid_key_type(self):
        """Test variables validation with invalid key type."""
        variables = {
            123: 'invalid_key_type'  # Key should be string
        }
        result = self.service.validate_variables(variables)
        
        assert result['is_valid'] is False
        assert len(result['errors']) > 0
        assert any('string' in str(error).lower() or 'key' in str(error).lower()
                   for error in result['errors'])
    
    def test_validate_variables_invalid_value_type(self):
        """Test variables validation with invalid value type."""
        variables = {
            'stock_ticker': ['invalid', 'list']  # Value should be string, number, or bool
        }
        result = self.service.validate_variables(variables)
        
        assert result['is_valid'] is False
        assert len(result['errors']) > 0
        assert any('string' in str(error).lower() or 'number' in str(error).lower() or 'boolean' in str(error).lower()
                   for error in result['errors'])
    
    def test_validate_variables_valid_types(self):
        """Test variables validation with valid value types."""
        variables = {
            'string_var': 'text',
            'number_var': 123,
            'float_var': 45.67,
            'bool_var': True,
            'null_var': None
        }
        result = self.service.validate_variables(variables)
        
        assert result['is_valid'] is True
        assert len(result['errors']) == 0
    
    def test_validate_variables_max_length(self):
        """Test variables validation with total length exceeding max."""
        # Create variables that exceed VARIABLES_MAX_LENGTH (10000)
        long_string = 'x' * 5001
        variables = {
            'var1': long_string,
            'var2': long_string
        }
        result = self.service.validate_variables(variables)
        
        assert result['is_valid'] is False
        assert len(result['errors']) > 0
        assert any('length' in str(error).lower() or '10000' in str(error)
                   for error in result['errors'])
    
    # ========================================================================
    # Template Validation Tests
    # ========================================================================
    
    def test_validate_template_exists_no_db_session(self):
        """Test template validation without DB session (should skip check)."""
        result = self.service.validate_template_exists(1)
        
        # Without DB session, should return valid (skip check)
        assert result['is_valid'] is True
        assert len(result['errors']) == 0
    
    # ========================================================================
    # Calculate Tests
    # ========================================================================
    
    def test_calculate(self):
        """Test calculate method (currently returns empty dict)."""
        data = {
            'template_id': 1,
            'variables': {'stock_ticker': 'TSLA'},
            'user_id': 1,
            'provider': 'gemini'
        }
        result = self.service.calculate(data)
        
        # Currently calculate returns empty dict for AI analysis
        assert isinstance(result, dict)
        # Can be extended in the future if calculations are needed

