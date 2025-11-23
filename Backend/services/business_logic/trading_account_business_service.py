"""
TradingAccount Business Logic Service - TikTrack
=================================================

Business logic for trading account validations and calculations.

Documentation:
- documentation/02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from .base_business_service import BaseBusinessService

logger = logging.getLogger(__name__)


class TradingAccountBusinessService(BaseBusinessService):
    """
    Business logic service for trading accounts.
    
    Handles all trading account-related validations and business rules.
    """
    
    # Valid account statuses
    VALID_STATUSES = ['open', 'closed']
    
    # Name validation rules
    NAME_MIN_LENGTH = 1
    NAME_MAX_LENGTH = 100
    
    # Notes validation rules
    NOTES_MAX_LENGTH = 5000
    
    def __init__(self):
        """Initialize the trading account business service."""
        super().__init__()
    
    # ========================================================================
    # Validation Methods
    # ========================================================================
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate trading account data according to business rules.
        
        Args:
            data: Trading account data dictionary with keys:
                - name: str (required, 1-100 chars)
                - currency_id: int (required, positive)
                - status: str (optional, 'open' or 'closed')
                - opening_balance: float (optional)
                - notes: str (optional, max 5000 chars)
            
        Returns:
            Dict with:
                - is_valid: bool
                - errors: List[str]
                
        Example:
            result = service.validate({
                'name': 'My Account',
                'currency_id': 1,
                'status': 'open'
            })
        """
        self.log_business_event('trading_account_validation', data)
        
        errors = []
        
        # Validate name
        name_validation = self.validate_name(data.get('name'))
        if not name_validation['is_valid']:
            errors.extend(name_validation['errors'])
        
        # Validate currency_id
        currency_validation = self.validate_currency_id(data.get('currency_id'))
        if not currency_validation['is_valid']:
            errors.extend(currency_validation['errors'])
        
        # Validate status (if provided)
        if 'status' in data and data['status']:
            status_validation = self.validate_status(data.get('status'))
            if not status_validation['is_valid']:
                errors.extend(status_validation['errors'])
        
        # Validate opening_balance (if provided)
        if 'opening_balance' in data and data['opening_balance'] is not None:
            balance_validation = self.validate_opening_balance(data.get('opening_balance'))
            if not balance_validation['is_valid']:
                errors.extend(balance_validation['errors'])
        
        # Validate notes (if provided)
        if 'notes' in data and data['notes']:
            notes_validation = self.validate_notes(data.get('notes'))
            if not notes_validation['is_valid']:
                errors.extend(notes_validation['errors'])
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_name(self, name: Optional[str]) -> Dict[str, Any]:
        """
        Validate trading account name.
        
        Args:
            name: Account name string
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        if name is None:
            errors.append('Account name is required')
            return {'is_valid': False, 'errors': errors}
        
        if not isinstance(name, str):
            errors.append('Account name must be a string')
            return {'is_valid': False, 'errors': errors}
        
        name_length = len(name.strip())
        
        if name_length < self.NAME_MIN_LENGTH:
            errors.append(f'Account name must be at least {self.NAME_MIN_LENGTH} character(s)')
        
        if name_length > self.NAME_MAX_LENGTH:
            errors.append(f'Account name must not exceed {self.NAME_MAX_LENGTH} characters')
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_currency_id(self, currency_id: Optional[int]) -> Dict[str, Any]:
        """
        Validate currency ID.
        
        Args:
            currency_id: Currency ID (positive integer)
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        if currency_id is None:
            errors.append('Currency ID is required')
            return {'is_valid': False, 'errors': errors}
        
        if not isinstance(currency_id, int):
            errors.append('Currency ID must be an integer')
            return {'is_valid': False, 'errors': errors}
        
        if currency_id <= 0:
            errors.append('Currency ID must be a positive integer')
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_status(self, status: Optional[str]) -> Dict[str, Any]:
        """
        Validate account status.
        
        Args:
            status: Account status string
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        if status is None:
            return {'is_valid': True, 'errors': []}
        
        if not isinstance(status, str):
            errors.append('Status must be a string')
            return {'is_valid': False, 'errors': errors}
        
        status_lower = status.lower()
        if status_lower not in self.VALID_STATUSES:
            valid_statuses = ', '.join(self.VALID_STATUSES)
            errors.append(f'Invalid status. Must be one of: {valid_statuses}')
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_opening_balance(self, opening_balance: Optional[float]) -> Dict[str, Any]:
        """
        Validate opening balance.
        
        Args:
            opening_balance: Opening balance amount
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        if opening_balance is None:
            return {'is_valid': True, 'errors': []}
        
        try:
            balance = float(opening_balance)
            # float() always returns a float (or raises an exception)
            # No need to check isinstance - if we reach here, balance is valid
        except (ValueError, TypeError):
            errors.append('Opening balance must be a valid number')
            return {'is_valid': False, 'errors': errors}
        
        # Opening balance can be negative (for margin accounts)
        # No min/max validation needed
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_notes(self, notes: Optional[str]) -> Dict[str, Any]:
        """
        Validate account notes.
        
        Args:
            notes: Notes string
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        if notes is None:
            return {'is_valid': True, 'errors': []}
        
        if not isinstance(notes, str):
            errors.append('Notes must be a string')
            return {'is_valid': False, 'errors': errors}
        
        if len(notes) > self.NOTES_MAX_LENGTH:
            errors.append(f'Notes must not exceed {self.NOTES_MAX_LENGTH} characters')
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    # ========================================================================
    # Calculation Methods
    # ========================================================================
    
    def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform business calculations for trading accounts.
        
        Currently, account calculations are handled by AccountActivityService
        and PositionPortfolioService. This method is available for future extensions.
        
        Args:
            data: Input data for calculations
            
        Returns:
            Dict with calculated values
        """
        self.log_business_event('trading_account_calculation', data)
        
        # For now, return empty calculations
        # Account balance, equity, and margin calculations are handled by:
        # - AccountActivityService.get_account_activity() - for balance calculations
        # - PositionPortfolioService.calculate_all_account_positions() - for position calculations
        
        return {
            'calculated': True,
            'values': {},
            'note': 'Use AccountActivityService for balance calculations and PositionPortfolioService for position calculations'
        }
    
    # ========================================================================
    # Helper Methods
    # ========================================================================
    
    def is_valid_status(self, status: str) -> bool:
        """
        Check if status is valid.
        
        Args:
            status: Status string
            
        Returns:
            True if status is valid, False otherwise
        """
        if not status:
            return False
        return status.lower() in self.VALID_STATUSES
    
    def get_valid_statuses(self) -> List[str]:
        """
        Get all valid statuses.
        
        Returns:
            List of valid status strings
        """
        return self.VALID_STATUSES.copy()

