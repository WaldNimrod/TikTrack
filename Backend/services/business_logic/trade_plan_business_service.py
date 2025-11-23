"""
TradePlan Business Logic Service - TikTrack
========================================

Business logic for trade plan validations and calculations.

Documentation:
- documentation/02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from .base_business_service import BaseBusinessService

logger = logging.getLogger(__name__)


class TradePlanBusinessService(BaseBusinessService):
    """
    Business logic service for trade plans.
    
    Handles all trade plan-related validations and business rules.
    Price calculations are delegated to TradeBusinessService.
    """
    
    # Valid investment types
    VALID_INVESTMENT_TYPES = ['Investment', 'Swing', 'Passive']
    
    # Valid sides
    VALID_SIDES = ['Long', 'Short', 'buy', 'sell']
    
    # Valid statuses
    VALID_STATUSES = ['open', 'closed', 'cancelled']
    
    # Price validation rules
    PRICE_MIN = 0.01
    PRICE_MAX = 1000000
    
    # Amount validation rules
    AMOUNT_MIN = 0.01
    AMOUNT_MAX = 1000000000
    
    # Percentage validation rules
    PERCENTAGE_MIN = 0.01
    PERCENTAGE_MAX = 10000  # Support high percentages
    
    def __init__(self):
        """Initialize the trade plan business service."""
        super().__init__()
    
    # ========================================================================
    # Validation Methods
    # ========================================================================
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate trade plan data according to business rules.
        
        Args:
            data: Trade plan data dictionary with keys:
                - trading_account_id: int (required, positive)
                - ticker_id: int (required, positive)
                - investment_type: str (required, 'Investment', 'Swing', 'Passive')
                - side: str (required, 'Long', 'Short', 'buy', 'sell')
                - status: str (optional, 'open', 'closed', 'cancelled')
                - planned_amount: float (required, > 0)
                - entry_price: float (required, > 0)
                - stop_price: float (optional, > 0)
                - target_price: float (optional, > 0)
                - stop_percentage: float (optional, 0.01-10000)
                - target_percentage: float (optional, 0.01-10000)
            
        Returns:
            Dict with:
                - is_valid: bool
                - errors: List[str]
                
        Example:
            result = service.validate({
                'trading_account_id': 1,
                'ticker_id': 2,
                'investment_type': 'Swing',
                'side': 'Long',
                'planned_amount': 10000,
                'entry_price': 100.0
            })
        """
        self.log_business_event('trade_plan_validation', data)
        
        errors = []
        
        # Validate trading_account_id
        account_validation = self.validate_trading_account_id(data.get('trading_account_id'))
        if not account_validation['is_valid']:
            errors.extend(account_validation['errors'])
        
        # Validate ticker_id
        ticker_validation = self.validate_ticker_id(data.get('ticker_id'))
        if not ticker_validation['is_valid']:
            errors.extend(ticker_validation['errors'])
        
        # Validate investment_type
        investment_validation = self.validate_investment_type(data.get('investment_type'))
        if not investment_validation['is_valid']:
            errors.extend(investment_validation['errors'])
        
        # Validate side
        side_validation = self.validate_side(data.get('side'))
        if not side_validation['is_valid']:
            errors.extend(side_validation['errors'])
        
        # Validate status (if provided)
        if 'status' in data and data['status']:
            status_validation = self.validate_status(data.get('status'))
            if not status_validation['is_valid']:
                errors.extend(status_validation['errors'])
        
        # Validate planned_amount
        amount_validation = self.validate_planned_amount(data.get('planned_amount'))
        if not amount_validation['is_valid']:
            errors.extend(amount_validation['errors'])
        
        # Validate entry_price
        entry_validation = self.validate_entry_price(data.get('entry_price'))
        if not entry_validation['is_valid']:
            errors.extend(entry_validation['errors'])
        
        # Validate stop_price (if provided)
        if 'stop_price' in data and data['stop_price'] is not None:
            stop_validation = self.validate_stop_price(data.get('stop_price'))
            if not stop_validation['is_valid']:
                errors.extend(stop_validation['errors'])
        
        # Validate target_price (if provided)
        if 'target_price' in data and data['target_price'] is not None:
            target_validation = self.validate_target_price(data.get('target_price'))
            if not target_validation['is_valid']:
                errors.extend(target_validation['errors'])
        
        # Validate stop_percentage (if provided)
        if 'stop_percentage' in data and data['stop_percentage'] is not None:
            stop_pct_validation = self.validate_stop_percentage(data.get('stop_percentage'))
            if not stop_pct_validation['is_valid']:
                errors.extend(stop_pct_validation['errors'])
        
        # Validate target_percentage (if provided)
        if 'target_percentage' in data and data['target_percentage'] is not None:
            target_pct_validation = self.validate_target_percentage(data.get('target_percentage'))
            if not target_pct_validation['is_valid']:
                errors.extend(target_pct_validation['errors'])
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_trading_account_id(self, account_id: Optional[int]) -> Dict[str, Any]:
        """Validate trading account ID."""
        errors = []
        
        if account_id is None:
            errors.append('Trading account ID is required')
            return {'is_valid': False, 'errors': errors}
        
        if not isinstance(account_id, int):
            errors.append('Trading account ID must be an integer')
            return {'is_valid': False, 'errors': errors}
        
        if account_id <= 0:
            errors.append('Trading account ID must be a positive integer')
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_ticker_id(self, ticker_id: Optional[int]) -> Dict[str, Any]:
        """Validate ticker ID."""
        errors = []
        
        if ticker_id is None:
            errors.append('Ticker ID is required')
            return {'is_valid': False, 'errors': errors}
        
        if not isinstance(ticker_id, int):
            errors.append('Ticker ID must be an integer')
            return {'is_valid': False, 'errors': errors}
        
        if ticker_id <= 0:
            errors.append('Ticker ID must be a positive integer')
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_investment_type(self, investment_type: Optional[str]) -> Dict[str, Any]:
        """Validate investment type."""
        errors = []
        
        if investment_type is None:
            errors.append('Investment type is required')
            return {'is_valid': False, 'errors': errors}
        
        if not isinstance(investment_type, str):
            errors.append('Investment type must be a string')
            return {'is_valid': False, 'errors': errors}
        
        if investment_type not in self.VALID_INVESTMENT_TYPES:
            valid_types = ', '.join(self.VALID_INVESTMENT_TYPES)
            errors.append(f'Invalid investment type. Must be one of: {valid_types}')
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_side(self, side: Optional[str]) -> Dict[str, Any]:
        """Validate trade side."""
        errors = []
        
        if side is None:
            errors.append('Side is required')
            return {'is_valid': False, 'errors': errors}
        
        if not isinstance(side, str):
            errors.append('Side must be a string')
            return {'is_valid': False, 'errors': errors}
        
        side_normalized = side.capitalize() if side else ''
        if side_normalized not in ['Long', 'Short'] and side.lower() not in ['buy', 'sell']:
            valid_sides = ', '.join(self.VALID_SIDES)
            errors.append(f'Invalid side. Must be one of: {valid_sides}')
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_status(self, status: Optional[str]) -> Dict[str, Any]:
        """Validate trade plan status."""
        errors = []
        
        if status is None:
            return {'is_valid': True, 'errors': []}
        
        if not isinstance(status, str):
            errors.append('Status must be a string')
            return {'is_valid': False, 'errors': errors}
        
        if status.lower() not in [s.lower() for s in self.VALID_STATUSES]:
            valid_statuses = ', '.join(self.VALID_STATUSES)
            errors.append(f'Invalid status. Must be one of: {valid_statuses}')
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_planned_amount(self, amount: Optional[float]) -> Dict[str, Any]:
        """Validate planned amount."""
        errors = []
        
        if amount is None:
            errors.append('Planned amount is required')
            return {'is_valid': False, 'errors': errors}
        
        try:
            amount_float = float(amount)
            if amount_float < self.AMOUNT_MIN:
                errors.append(f'Planned amount must be at least {self.AMOUNT_MIN}')
            if amount_float > self.AMOUNT_MAX:
                errors.append(f'Planned amount must not exceed {self.AMOUNT_MAX}')
        except (ValueError, TypeError):
            errors.append('Planned amount must be a valid number')
            return {'is_valid': False, 'errors': errors}
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_entry_price(self, price: Optional[float]) -> Dict[str, Any]:
        """Validate entry price."""
        errors = []
        
        if price is None:
            errors.append('Entry price is required')
            return {'is_valid': False, 'errors': errors}
        
        try:
            price_float = float(price)
            if price_float < self.PRICE_MIN:
                errors.append(f'Entry price must be at least {self.PRICE_MIN}')
            if price_float > self.PRICE_MAX:
                errors.append(f'Entry price must not exceed {self.PRICE_MAX}')
        except (ValueError, TypeError):
            errors.append('Entry price must be a valid number')
            return {'is_valid': False, 'errors': errors}
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_stop_price(self, price: Optional[float]) -> Dict[str, Any]:
        """Validate stop price."""
        errors = []
        
        if price is None:
            return {'is_valid': True, 'errors': []}
        
        try:
            price_float = float(price)
            if price_float < self.PRICE_MIN:
                errors.append(f'Stop price must be at least {self.PRICE_MIN}')
            if price_float > self.PRICE_MAX:
                errors.append(f'Stop price must not exceed {self.PRICE_MAX}')
        except (ValueError, TypeError):
            errors.append('Stop price must be a valid number')
            return {'is_valid': False, 'errors': errors}
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_target_price(self, price: Optional[float]) -> Dict[str, Any]:
        """Validate target price."""
        errors = []
        
        if price is None:
            return {'is_valid': True, 'errors': []}
        
        try:
            price_float = float(price)
            if price_float < self.PRICE_MIN:
                errors.append(f'Target price must be at least {self.PRICE_MIN}')
            if price_float > self.PRICE_MAX:
                errors.append(f'Target price must not exceed {self.PRICE_MAX}')
        except (ValueError, TypeError):
            errors.append('Target price must be a valid number')
            return {'is_valid': False, 'errors': errors}
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_stop_percentage(self, percentage: Optional[float]) -> Dict[str, Any]:
        """Validate stop percentage."""
        errors = []
        
        if percentage is None:
            return {'is_valid': True, 'errors': []}
        
        try:
            pct_float = float(percentage)
            if pct_float < self.PERCENTAGE_MIN:
                errors.append(f'Stop percentage must be at least {self.PERCENTAGE_MIN}')
            if pct_float > self.PERCENTAGE_MAX:
                errors.append(f'Stop percentage must not exceed {self.PERCENTAGE_MAX}')
        except (ValueError, TypeError):
            errors.append('Stop percentage must be a valid number')
            return {'is_valid': False, 'errors': errors}
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_target_percentage(self, percentage: Optional[float]) -> Dict[str, Any]:
        """Validate target percentage."""
        errors = []
        
        if percentage is None:
            return {'is_valid': True, 'errors': []}
        
        try:
            pct_float = float(percentage)
            if pct_float < self.PERCENTAGE_MIN:
                errors.append(f'Target percentage must be at least {self.PERCENTAGE_MIN}')
            if pct_float > self.PERCENTAGE_MAX:
                errors.append(f'Target percentage must not exceed {self.PERCENTAGE_MAX}')
        except (ValueError, TypeError):
            errors.append('Target percentage must be a valid number')
            return {'is_valid': False, 'errors': errors}
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    # ========================================================================
    # Calculation Methods
    # ========================================================================
    
    def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform business calculations for trade plans.
        
        Price calculations are delegated to TradeBusinessService.
        This method is available for future extensions.
        
        Args:
            data: Input data for calculations
            
        Returns:
            Dict with calculated values
        """
        self.log_business_event('trade_plan_calculation', data)
        
        # Price calculations are handled by TradeBusinessService:
        # - calculate_stop_price() - for stop price calculations
        # - calculate_target_price() - for target price calculations
        # - calculate_percentage_from_price() - for percentage calculations
        
        return {
            'calculated': True,
            'values': {},
            'note': 'Use TradeBusinessService for price calculations (calculate_stop_price, calculate_target_price, calculate_percentage_from_price)'
        }
    
    # ========================================================================
    # Helper Methods
    # ========================================================================
    
    def is_valid_investment_type(self, investment_type: str) -> bool:
        """Check if investment type is valid."""
        if not investment_type:
            return False
        return investment_type in self.VALID_INVESTMENT_TYPES
    
    def is_valid_side(self, side: str) -> bool:
        """Check if side is valid."""
        if not side:
            return False
        side_normalized = side.capitalize() if side else ''
        return side_normalized in ['Long', 'Short'] or side.lower() in ['buy', 'sell']
    
    def is_valid_status(self, status: str) -> bool:
        """Check if status is valid."""
        if not status:
            return False
        return status.lower() in [s.lower() for s in self.VALID_STATUSES]

