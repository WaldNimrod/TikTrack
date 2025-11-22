"""
Tests for Cash Flow Business Logic Service
============================================

Tests all cash flow-related business logic calculations and validations.
"""

import pytest
from services.business_logic.cash_flow_business_service import CashFlowBusinessService


class TestCashFlowBusinessService:
    """Test suite for CashFlowBusinessService."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.service = CashFlowBusinessService()
    
    def test_calculate_account_balance(self):
        """Test account balance calculation."""
        initial_balance = 1000.0
        cash_flows = [
            {'type': 'income', 'amount': 500.0},
            {'type': 'expense', 'amount': 200.0},
            {'type': 'fee', 'amount': 50.0}
        ]
        
        result = self.service.calculate_account_balance(initial_balance, cash_flows)
        
        assert result['is_valid'] is True
        assert result['balance'] == 1250.0  # 1000 + 500 - 200 - 50
        assert result['total_income'] == 500.0
        assert result['total_expenses'] == 250.0
    
    def test_calculate_currency_conversion(self):
        """Test currency conversion calculation."""
        result = self.service.calculate_currency_conversion(
            amount=100.0,
            from_currency_rate=3.5,  # ILS to USD
            to_currency_rate=1.0    # USD to USD
        )
        
        assert result['is_valid'] is True
        assert result['converted_amount'] == pytest.approx(28.57, rel=0.01)
    
    def test_validate_cash_flow_valid(self):
        """Test validation of valid cash flow data."""
        cash_flow_data = {
            'amount': 100.0,
            'type': 'income',
            'source': 'manual'
        }
        
        result = self.service.validate(cash_flow_data)
        
        assert result['is_valid'] is True
        assert len(result['errors']) == 0

