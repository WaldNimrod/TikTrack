"""
Currency Business Logic Service - TikTrack
==========================================

Business logic for currency conversions and validations.

Documentation:
- documentation/02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from .base_business_service import BaseBusinessService

logger = logging.getLogger(__name__)


class CurrencyBusinessService(BaseBusinessService):
    """
    Business logic service for currencies.
    
    Handles all currency-related validations, conversions, and business rules.
    """
    
    # Exchange rate validation rules
    RATE_MIN = 0.0001
    RATE_MAX = 1000000
    
    @property
    def table_name(self) -> Optional[str]:
        """Return the database table name for currencies."""
        return 'currencies'
    
    def __init__(self, db_session: Optional[Session] = None):
        """Initialize the currency business service."""
        super().__init__(db_session)
    
    # ========================================================================
    # Validation Methods
    # ========================================================================
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate currency data according to business rules.
        
        Args:
            data: Currency data dictionary with keys:
                - name: str (required)
                - symbol: str (required)
                - exchange_rate: float (optional, > 0)
            
        Returns:
            Dict with:
                - is_valid: bool
                - errors: List[str]
        """
        self.log_business_event('currency_validation', data)
        
        errors = []
        
        # Step 1: Validate against database constraints (FIRST!)
        is_valid, constraint_errors = self.validate_with_constraints(data)
        if not is_valid:
            errors.extend(constraint_errors)
            self.logger.debug(f"Constraint validation found {len(constraint_errors)} errors")
        
        # Step 2: Validate against business rules registry (SECOND!)
        # Validate name (required)
        if 'name' not in data or not data.get('name'):
            errors.append('Currency name is required')
        elif not isinstance(data['name'], str) or len(data['name'].strip()) == 0:
            errors.append('Currency name must be a non-empty string')
        
        # Validate symbol (required)
        if 'symbol' not in data or not data.get('symbol'):
            errors.append('Currency symbol is required')
        elif not isinstance(data['symbol'], str) or len(data['symbol'].strip()) == 0:
            errors.append('Currency symbol must be a non-empty string')
        
        # Validate exchange_rate (if provided)
        if 'exchange_rate' in data and data['exchange_rate'] is not None:
            rate_validation = self.validate_exchange_rate(data.get('exchange_rate'))
            if not rate_validation['is_valid']:
                errors.extend(rate_validation['errors'])
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_exchange_rate(self, rate: Optional[float]) -> Dict[str, Any]:
        """
        Validate exchange rate.
        
        Args:
            rate: Exchange rate value
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        if rate is None:
            return {'is_valid': True, 'errors': []}
        
        try:
            rate_float = float(rate)
            if rate_float < self.RATE_MIN:
                errors.append(f'Exchange rate must be at least {self.RATE_MIN}')
            if rate_float > self.RATE_MAX:
                errors.append(f'Exchange rate must not exceed {self.RATE_MAX}')
        except (ValueError, TypeError):
            errors.append('Exchange rate must be a valid number')
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
        Perform business calculations for currencies.
        
        Currency conversions are handled by CashFlowBusinessService.
        This method is available for future extensions.
        
        Args:
            data: Input data for calculations
            
        Returns:
            Dict with calculated values
        """
        self.log_business_event('currency_calculation', data)
        
        # Currency conversions are handled by CashFlowBusinessService.calculate_currency_conversion()
        
        return {
            'calculated': True,
            'values': {},
            'note': 'Use CashFlowBusinessService.calculate_currency_conversion() for currency conversions'
        }
    
    def convert(
        self,
        amount: float,
        from_currency_rate: float,
        to_currency_rate: float
    ) -> Dict[str, Any]:
        """
        Convert amount from one currency to another.
        
        This is a wrapper around CashFlowBusinessService.calculate_currency_conversion()
        for consistency with the service interface.
        
        Args:
            amount: Amount to convert
            from_currency_rate: Exchange rate of source currency
            to_currency_rate: Exchange rate of target currency
            
        Returns:
            Dict with 'converted_amount' (float) and 'is_valid' (bool)
        """
        # Import here to avoid circular dependency
        from .cash_flow_business_service import CashFlowBusinessService
        
        cash_flow_service = CashFlowBusinessService()
        result = cash_flow_service.calculate_currency_conversion(
            amount, from_currency_rate, to_currency_rate
        )
        
        if result['is_valid']:
            return {
                'converted_amount': result['converted_amount'],
                'is_valid': True,
                'error': None
            }
        else:
            return {
                'converted_amount': 0.0,
                'is_valid': False,
                'error': result.get('error', 'Conversion failed')
            }

