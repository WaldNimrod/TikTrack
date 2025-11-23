"""
Ticker Business Logic Service - TikTrack
========================================

Business logic for ticker validations and calculations.

Documentation:
- documentation/02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md
"""

from __future__ import annotations

import logging
import re
from typing import Any, Dict, List, Optional

from .base_business_service import BaseBusinessService

logger = logging.getLogger(__name__)


class TickerBusinessService(BaseBusinessService):
    """
    Business logic service for tickers.
    
    Handles all ticker-related validations and business rules.
    """
    
    # Symbol validation rules
    SYMBOL_MIN_LENGTH = 1
    SYMBOL_MAX_LENGTH = 20
    
    # Symbol format: alphanumeric, dots, hyphens, underscores
    SYMBOL_PATTERN = re.compile(r'^[A-Za-z0-9._-]+$')
    
    def __init__(self):
        """Initialize the ticker business service."""
        super().__init__()
    
    # ========================================================================
    # Validation Methods
    # ========================================================================
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate ticker data according to business rules.
        
        Args:
            data: Ticker data dictionary with keys:
                - symbol: str (required, 1-20 chars, alphanumeric + ._-)
                - exchange: str (optional)
                - currency_id: int (optional, positive)
            
        Returns:
            Dict with:
                - is_valid: bool
                - errors: List[str]
                
        Example:
            result = service.validate({
                'symbol': 'AAPL',
                'exchange': 'NASDAQ',
                'currency_id': 1
            })
        """
        self.log_business_event('ticker_validation', data)
        
        errors = []
        
        # Validate symbol
        symbol_validation = self.validate_symbol(data.get('symbol'))
        if not symbol_validation['is_valid']:
            errors.extend(symbol_validation['errors'])
        
        # Validate currency_id (if provided)
        if 'currency_id' in data and data['currency_id'] is not None:
            currency_validation = self.validate_currency_id(data.get('currency_id'))
            if not currency_validation['is_valid']:
                errors.extend(currency_validation['errors'])
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_symbol(self, symbol: Optional[str]) -> Dict[str, Any]:
        """
        Validate ticker symbol.
        
        Args:
            symbol: Ticker symbol string
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        if symbol is None:
            errors.append('Symbol is required')
            return {'is_valid': False, 'errors': errors}
        
        if not isinstance(symbol, str):
            errors.append('Symbol must be a string')
            return {'is_valid': False, 'errors': errors}
        
        symbol_stripped = symbol.strip()
        symbol_length = len(symbol_stripped)
        
        if symbol_length < self.SYMBOL_MIN_LENGTH:
            errors.append(f'Symbol must be at least {self.SYMBOL_MIN_LENGTH} character(s)')
        
        if symbol_length > self.SYMBOL_MAX_LENGTH:
            errors.append(f'Symbol must not exceed {self.SYMBOL_MAX_LENGTH} characters')
        
        # Validate format
        if not self.SYMBOL_PATTERN.match(symbol_stripped):
            errors.append('Symbol must contain only alphanumeric characters, dots, hyphens, and underscores')
        
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
            return {'is_valid': True, 'errors': []}
        
        if not isinstance(currency_id, int):
            errors.append('Currency ID must be an integer')
            return {'is_valid': False, 'errors': errors}
        
        if currency_id <= 0:
            errors.append('Currency ID must be a positive integer')
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    # ========================================================================
    # Calculation Methods
    # ========================================================================
    
    def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform business calculations for tickers.
        
        Currently, ticker calculations are minimal.
        This method is available for future extensions.
        
        Args:
            data: Input data for calculations
            
        Returns:
            Dict with calculated values
        """
        self.log_business_event('ticker_calculation', data)
        
        # For now, return empty calculations
        # Can be extended for future features like:
        # - Symbol normalization
        # - Exchange validation
        # - Price calculations
        
        return {
            'calculated': True,
            'values': {}
        }
    
    # ========================================================================
    # Helper Methods
    # ========================================================================
    
    def normalize_symbol(self, symbol: str) -> str:
        """
        Normalize ticker symbol (uppercase, trimmed).
        
        Args:
            symbol: Ticker symbol string
            
        Returns:
            Normalized symbol string
        """
        if not symbol:
            return ''
        return symbol.strip().upper()
    
    def is_valid_symbol_format(self, symbol: str) -> bool:
        """
        Check if symbol format is valid.
        
        Args:
            symbol: Ticker symbol string
            
        Returns:
            True if format is valid, False otherwise
        """
        if not symbol:
            return False
        return bool(self.SYMBOL_PATTERN.match(symbol.strip()))

