"""
Cash Flow Business Logic Service - TikTrack
============================================

Business logic for cash flow calculations, validations, and rule applications.
Moved from frontend to ensure consistency and centralization.

Documentation:
- documentation/02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from .base_business_service import BaseBusinessService
from .business_rules_registry import business_rules_registry

logger = logging.getLogger(__name__)


class CashFlowBusinessService(BaseBusinessService):
    """
    Business logic service for cash flows.
    
    Handles all cash flow-related calculations, validations, and business rules.
    """
    
    @property
    def table_name(self) -> Optional[str]:
        """Return the database table name for cash flows."""
        return 'cash_flows'
    
    def __init__(self, db_session: Optional[Session] = None):
        """Initialize the cash flow business service."""
        super().__init__(db_session)
        self.registry = business_rules_registry
    
    # ========================================================================
    # Account Balance Calculations
    # ========================================================================
    
    def calculate_account_balance(
        self,
        initial_balance: float,
        cash_flows: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculate account balance from initial balance and cash flows.
        
        Args:
            initial_balance: Initial account balance
            cash_flows: List of cash flow dictionaries
            
        Returns:
            Dict with 'balance' (float), 'total_income' (float), 'total_expenses' (float)
        """
        if not cash_flows:
            return {
                'balance': round(initial_balance, 2),
                'total_income': 0.0,
                'total_expenses': 0.0,
                'is_valid': True,
                'error': None
            }
        
        total_income = 0.0
        total_expenses = 0.0
        
        for cash_flow in cash_flows:
            amount = cash_flow.get('amount', 0.0) or 0.0
            flow_type = cash_flow.get('type', '').lower()
            
            if flow_type in ['income', 'interest']:
                total_income += amount
            elif flow_type in ['expense', 'fee', 'tax']:
                total_expenses += amount
        
        balance = initial_balance + total_income - total_expenses
        
        return {
            'balance': round(balance, 2),
            'total_income': round(total_income, 2),
            'total_expenses': round(total_expenses, 2),
            'is_valid': True,
            'error': None
        }
    
    def calculate_currency_conversion(
        self,
        amount: float,
        from_currency_rate: float,
        to_currency_rate: float
    ) -> Dict[str, Any]:
        """
        Calculate currency conversion.
        
        Args:
            amount: Amount to convert
            from_currency_rate: Exchange rate of source currency (to USD)
            to_currency_rate: Exchange rate of target currency (to USD)
            
        Returns:
            Dict with 'converted_amount' (float) and 'is_valid' (bool)
        """
        if not amount or amount <= 0:
            return {
                'converted_amount': 0.0,
                'is_valid': False,
                'error': 'Invalid amount'
            }
        
        if not from_currency_rate or from_currency_rate <= 0:
            return {
                'converted_amount': 0.0,
                'is_valid': False,
                'error': 'Invalid source currency rate'
            }
        
        if not to_currency_rate or to_currency_rate <= 0:
            return {
                'converted_amount': 0.0,
                'is_valid': False,
                'error': 'Invalid target currency rate'
            }
        
        # Convert: amount_in_USD = amount / from_rate, then converted = amount_in_USD * to_rate
        amount_in_usd = amount / from_currency_rate
        converted_amount = amount_in_usd * to_currency_rate
        
        return {
            'converted_amount': round(converted_amount, 2),
            'is_valid': True,
            'error': None
        }
    
    # ========================================================================
    # Validation
    # ========================================================================
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate cash flow data according to business rules.
        
        Validation order (CRITICAL - must follow this order):
        1. Database Constraints (ValidationService) - checks NOT NULL, UNIQUE, FOREIGN KEY, ENUM, RANGE, CHECK
        2. Business Rules Registry - checks min/max, allowed_values, required (only if not in Constraints)
        3. Complex Business Rules - checks business logic
        
        Args:
            data: Cash flow data dictionary
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        # Step 1: Validate against database constraints (FIRST!)
        is_valid, constraint_errors = self.validate_with_constraints(data)
        if not is_valid:
            errors.extend(constraint_errors)
            self.logger.debug(f"Constraint validation found {len(constraint_errors)} errors")
        
        # Step 2: Validate against business rules registry (SECOND!)
        # Validate required fields
        required_fields = ['amount', 'type', 'source']
        for field in required_fields:
            if field not in data or data[field] is None or data[field] == '':
                errors.append(f"{field} is required")
        
        # Validate field values using registry
        from .utils.edge_cases_utils import is_empty_value
        
        for field, value in data.items():
            if is_empty_value(value):
                continue
            
            rule_result = self.registry.validate_value('cash_flow', field, value)
            if not rule_result['is_valid']:
                errors.append(rule_result['error'])
        
        # Business rule validations
        if 'amount' in data:
            amount = data.get('amount')
            if amount and amount <= 0:
                errors.append("Amount must be greater than 0")
        
        # Validate currency conversion if provided
        if 'currency_id' in data and 'base_currency_id' in data:
            if data['currency_id'] != data['base_currency_id']:
                # Currency conversion required
                if 'exchange_rate' not in data or not data['exchange_rate']:
                    errors.append("Exchange rate required for currency conversion")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform cash flow calculations.
        
        Args:
            data: Cash flow data dictionary
            
        Returns:
            Dict with calculated values
        """
        results = {}
        
        # Calculate currency conversion if needed
        if 'amount' in data and 'currency_id' in data and 'base_currency_id' in data:
            if data['currency_id'] != data['base_currency_id']:
                # Currency conversion
                if 'exchange_rate' in data:
                    conversion_result = self.calculate_currency_conversion(
                        amount=data.get('amount', 0.0),
                        from_currency_rate=data.get('exchange_rate', 1.0),
                        to_currency_rate=1.0  # Base currency rate is always 1
                    )
                    if conversion_result['is_valid']:
                        results['converted_amount'] = conversion_result['converted_amount']
        
        return results

