"""
Tests for Trade Business Logic Service
========================================

Tests all trade-related business logic calculations and validations.
"""

import pytest
from services.business_logic.trade_business_service import TradeBusinessService


class TestTradeBusinessService:
    """Test suite for TradeBusinessService."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.service = TradeBusinessService()
    
    # ========================================================================
    # Price Calculations
    # ========================================================================
    
    def test_calculate_stop_price_long(self):
        """Test stop price calculation for long position."""
        result = self.service.calculate_stop_price(100.0, 10.0, 'Long')
        
        assert result['is_valid'] is True
        assert result['stop_price'] == 90.0
        assert result['error'] is None
    
    def test_calculate_stop_price_short(self):
        """Test stop price calculation for short position."""
        result = self.service.calculate_stop_price(100.0, 10.0, 'Short')
        
        assert result['is_valid'] is True
        assert result['stop_price'] == 110.0
        assert result['error'] is None
    
    def test_calculate_stop_price_invalid_price(self):
        """Test stop price calculation with invalid price."""
        result = self.service.calculate_stop_price(0.0, 10.0, 'Long')
        
        assert result['is_valid'] is False
        assert result['stop_price'] == 0.0
        assert result['error'] is not None
    
    def test_calculate_target_price_long(self):
        """Test target price calculation for long position."""
        result = self.service.calculate_target_price(100.0, 20.0, 'Long')
        
        assert result['is_valid'] is True
        assert result['target_price'] == 120.0
        assert result['error'] is None
    
    def test_calculate_target_price_short(self):
        """Test target price calculation for short position."""
        result = self.service.calculate_target_price(100.0, 20.0, 'Short')
        
        assert result['is_valid'] is True
        assert result['target_price'] == 80.0
        assert result['error'] is None
    
    def test_calculate_percentage_from_price_long(self):
        """Test percentage calculation for long position."""
        result = self.service.calculate_percentage_from_price(100.0, 120.0, 'Long')
        
        assert result['is_valid'] is True
        assert result['percentage'] == 20.0
        assert result['error'] is None
    
    def test_calculate_percentage_from_price_short(self):
        """Test percentage calculation for short position."""
        result = self.service.calculate_percentage_from_price(100.0, 80.0, 'Short')
        
        assert result['is_valid'] is True
        assert result['percentage'] == 20.0
        assert result['error'] is None
    
    # ========================================================================
    # Investment Calculations
    # ========================================================================
    
    def test_calculate_investment_from_price_quantity(self):
        """Test investment calculation from price and quantity."""
        result = self.service.calculate_investment(price=100.0, quantity=10.0)
        
        assert result['is_valid'] is True
        assert result['price'] == 100.0
        assert result['quantity'] == 10.0
        assert result['amount'] == 1000.0
    
    def test_calculate_investment_from_price_amount(self):
        """Test investment calculation from price and amount."""
        result = self.service.calculate_investment(price=100.0, amount=1000.0)
        
        assert result['is_valid'] is True
        assert result['price'] == 100.0
        assert result['quantity'] == 10.0
        assert result['amount'] == 1000.0
    
    def test_calculate_investment_from_quantity_amount(self):
        """Test investment calculation from quantity and amount."""
        result = self.service.calculate_investment(quantity=10.0, amount=1000.0)
        
        assert result['is_valid'] is True
        assert result['price'] == 100.0
        assert result['quantity'] == 10.0
        assert result['amount'] == 1000.0
    
    def test_calculate_investment_fractional_shares(self):
        """Test investment calculation with fractional shares."""
        result = self.service.calculate_investment(price=100.0, quantity=0.5)
        
        assert result['is_valid'] is True
        assert result['price'] == 100.0
        assert result['quantity'] == 0.5
        assert result['amount'] == 50.0
    
    # ========================================================================
    # P/L Calculations
    # ========================================================================
    
    def test_calculate_pl_long_profit(self):
        """Test P/L calculation for long position with profit."""
        result = self.service.calculate_pl(100.0, 120.0, 10.0, 'Long')
        
        assert result['is_valid'] is True
        assert result['pl'] == 200.0
        assert result['pl_percent'] == 20.0
    
    def test_calculate_pl_long_loss(self):
        """Test P/L calculation for long position with loss."""
        result = self.service.calculate_pl(100.0, 80.0, 10.0, 'Long')
        
        assert result['is_valid'] is True
        assert result['pl'] == -200.0
        assert result['pl_percent'] == -20.0
    
    def test_calculate_pl_short_profit(self):
        """Test P/L calculation for short position with profit."""
        result = self.service.calculate_pl(100.0, 80.0, 10.0, 'Short')
        
        assert result['is_valid'] is True
        assert result['pl'] == 200.0
        assert result['pl_percent'] == 20.0
    
    def test_calculate_risk_reward(self):
        """Test risk/reward calculation."""
        result = self.service.calculate_risk_reward(
            entry_price=100.0,
            stop_price=90.0,
            target_price=120.0,
            quantity=10.0,
            side='Long'
        )
        
        assert result['is_valid'] is True
        assert result['risk'] == 100.0  # Loss if stop hit
        assert result['reward'] == 200.0  # Profit if target hit
        assert result['ratio'] == 2.0  # 200/100 = 2:1
    
    # ========================================================================
    # Validation
    # ========================================================================
    
    def test_validate_trade_valid(self):
        """Test validation of valid trade data."""
        trade_data = {
            'price': 100.0,
            'quantity': 10.0,
            'side': 'buy',
            'investment_type': 'Investment',
            'status': 'open',
            'user_id': 1
        }
        
        result = self.service.validate(trade_data)
        
        assert result['is_valid'] is True
        assert len(result['errors']) == 0
    
    def test_validate_trade_missing_required(self):
        """Test validation of trade with missing required fields."""
        trade_data = {
            'price': 100.0
            # Missing quantity, side, etc.
        }
        
        result = self.service.validate(trade_data)
        
        assert result['is_valid'] is False
        assert len(result['errors']) > 0
    
    def test_validate_trade_invalid_price(self):
        """Test validation of trade with invalid price."""
        trade_data = {
            'price': -10.0,  # Invalid: negative price
            'quantity': 10.0,
            'side': 'buy',
            'investment_type': 'Investment',
            'status': 'open'
        }
        
        result = self.service.validate(trade_data)
        
        assert result['is_valid'] is False
        assert any('price' in error.lower() for error in result['errors'])
