"""
Tests for Execution Business Logic Service
===========================================

Tests all execution-related business logic calculations and validations.
"""

import pytest
from services.business_logic.execution_business_service import ExecutionBusinessService


class TestExecutionBusinessService:
    """Test suite for ExecutionBusinessService."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.service = ExecutionBusinessService()
    
    def test_calculate_execution_values_buy(self):
        """Test execution values calculation for buy."""
        result = self.service.calculate_execution_values(
            quantity=10.0,
            price=100.0,
            commission=1.0,
            action='buy'
        )
        
        assert result['is_valid'] is True
        assert result['total'] == -1001.0  # Negative for buy (money goes out)
        assert result['label'] == 'סה"כ עלות:'
    
    def test_calculate_execution_values_sell(self):
        """Test execution values calculation for sell."""
        result = self.service.calculate_execution_values(
            quantity=10.0,
            price=100.0,
            commission=1.0,
            action='sell'
        )
        
        assert result['is_valid'] is True
        assert result['total'] == 999.0  # Positive for sell (money comes in)
        assert result['label'] == 'סה"כ מזומן:'
    
    def test_calculate_average_price(self):
        """Test average price calculation."""
        executions = [
            {'quantity': 10.0, 'price': 100.0},
            {'quantity': 5.0, 'price': 110.0}
        ]
        
        result = self.service.calculate_average_price(executions)
        
        assert result['is_valid'] is True
        assert result['average_price'] == pytest.approx(103.33, rel=0.01)
        assert result['total_quantity'] == 15.0
        assert result['total_amount'] == 1550.0
    
    def test_validate_execution_valid(self):
        """Test validation of valid execution data."""
        execution_data = {
            'price': 100.0,
            'quantity': 10.0,
            'action': 'buy',
            'status': 'completed'
        }
        
        result = self.service.validate(execution_data)
        
        assert result['is_valid'] is True
        assert len(result['errors']) == 0

