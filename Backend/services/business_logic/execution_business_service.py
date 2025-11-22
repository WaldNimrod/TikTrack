"""
Execution Business Logic Service - TikTrack
===========================================

Business logic for execution calculations, validations, and rule applications.
Moved from frontend to ensure consistency and centralization.

Documentation:
- documentation/02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from .base_business_service import BaseBusinessService
from .business_rules_registry import business_rules_registry

logger = logging.getLogger(__name__)


class ExecutionBusinessService(BaseBusinessService):
    """
    Business logic service for executions.
    
    Handles all execution-related calculations, validations, and business rules.
    """
    
    def __init__(self):
        """Initialize the execution business service."""
        super().__init__()
        self.registry = business_rules_registry
    
    # ========================================================================
    # Value Calculations
    # ========================================================================
    
    def calculate_execution_values(
        self,
        quantity: float,
        price: float,
        commission: float = 0.0,
        action: Optional[str] = None,
        is_edit: bool = False
    ) -> Dict[str, Any]:
        """
        Calculate execution values (total, label, etc.).
        
        Args:
            quantity: Number of shares
            price: Price per share
            commission: Commission amount
            action: Execution action ('buy', 'sell', 'short', 'cover')
            is_edit: Whether this is for edit form (simpler logic)
            
        Returns:
            Dict with 'total' (float), 'label' (str), and 'is_valid' (bool)
            
        Example:
            # Buy execution
            result = service.calculate_execution_values(
                quantity=10.0,
                price=100.0,
                commission=1.0,
                action='buy'
            )
            # Returns: {'total': -1001.0, 'label': 'סה"כ עלות:', 'is_valid': True}
            
            # Sell execution
            result = service.calculate_execution_values(
                quantity=10.0,
                price=100.0,
                commission=1.0,
                action='sell'
            )
            # Returns: {'total': 999.0, 'label': 'סה"כ מזומן:', 'is_valid': True}
        """
        self.log_business_event('execution_values_calculation', {
            'quantity': quantity,
            'price': price,
            'commission': commission,
            'action': action,
            'is_edit': is_edit
        })
        
        # Validation
        if not quantity or quantity <= 0:
            return {
                'total': 0.0,
                'label': '',
                'is_valid': False,
                'error': 'Invalid quantity'
            }
        
        if not price or price <= 0:
            return {
                'total': 0.0,
                'label': '',
                'is_valid': False,
                'error': 'Invalid price'
            }
        
        commission = commission or 0.0
        
        # Calculate based on form type
        if is_edit:
            # Edit form: simple calculation
            total = quantity * price + commission
            label = 'סה"כ:'
        else:
            # Add form: advanced logic with buy/sell
            action_lower = (action or '').lower()
            
            if action_lower == 'buy':
                # Buy: total cost = -(quantity * price + commission) - negative because money goes out
                total = -(quantity * price + commission)
                label = 'סה"כ עלות:'
            elif action_lower == 'sell':
                # Sell: total cash = quantity * price - commission - positive because money comes in
                total = quantity * price - commission
                label = 'סה"כ מזומן:'
            else:
                # If no action selected, show basic amount
                total = quantity * price
                label = 'סה"כ:'
        
        return {
            'total': round(total, 2),
            'label': label,
            'is_valid': True,
            'error': None
        }
    
    def calculate_average_price(
        self,
        executions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculate average price from multiple executions.
        
        Args:
            executions: List of execution dictionaries with 'quantity' and 'price'
            
        Returns:
            Dict with 'average_price' (float), 'total_quantity' (float), 'total_amount' (float)
        """
        if not executions:
            return {
                'average_price': 0.0,
                'total_quantity': 0.0,
                'total_amount': 0.0,
                'is_valid': False,
                'error': 'No executions provided'
            }
        
        total_quantity = 0.0
        total_amount = 0.0
        
        for execution in executions:
            quantity = execution.get('quantity', 0.0) or 0.0
            price = execution.get('price', 0.0) or 0.0
            
            if quantity > 0 and price > 0:
                total_quantity += quantity
                total_amount += quantity * price
        
        if total_quantity == 0:
            return {
                'average_price': 0.0,
                'total_quantity': 0.0,
                'total_amount': 0.0,
                'is_valid': False,
                'error': 'Total quantity is zero'
            }
        
        average_price = total_amount / total_quantity
        
        return {
            'average_price': round(average_price, 2),
            'total_quantity': round(total_quantity, 4),
            'total_amount': round(total_amount, 2),
            'is_valid': True,
            'error': None
        }
    
    def calculate_total_execution(
        self,
        executions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculate total execution values (quantity, amount, commission).
        
        Args:
            executions: List of execution dictionaries
            
        Returns:
            Dict with totals and 'is_valid' (bool)
        """
        if not executions:
            return {
                'total_quantity': 0.0,
                'total_amount': 0.0,
                'total_commission': 0.0,
                'is_valid': False,
                'error': 'No executions provided'
            }
        
        total_quantity = 0.0
        total_amount = 0.0
        total_commission = 0.0
        
        for execution in executions:
            quantity = execution.get('quantity', 0.0) or 0.0
            price = execution.get('price', 0.0) or 0.0
            commission = execution.get('commission', 0.0) or 0.0
            
            if quantity > 0 and price > 0:
                total_quantity += quantity
                total_amount += quantity * price
                total_commission += commission
        
        return {
            'total_quantity': round(total_quantity, 4),
            'total_amount': round(total_amount, 2),
            'total_commission': round(total_commission, 2),
            'is_valid': True,
            'error': None
        }
    
    # ========================================================================
    # Validation
    # ========================================================================
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate execution data according to business rules.
        
        Args:
            data: Execution data dictionary
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        # Validate required fields
        required_fields = ['price', 'quantity', 'action', 'status']
        for field in required_fields:
            if field not in data or data[field] is None or data[field] == '':
                errors.append(f"{field} is required")
        
        # Validate field values using registry
        for field, value in data.items():
            if value is None or value == '':
                continue
            
            rule_result = self.registry.validate_value('execution', field, value)
            if not rule_result['is_valid']:
                errors.append(rule_result['error'])
        
        # Business rule validations
        if 'price' in data and 'quantity' in data:
            price = data.get('price')
            quantity = data.get('quantity')
            if price and quantity:
                # Validate that price * quantity is reasonable
                total = price * quantity
                if total <= 0:
                    errors.append("Price and quantity must result in positive total")
        
        # Validate execution against trade (if trade_id provided)
        if 'trade_id' in data and data['trade_id']:
            # Business rule: Execution action should match trade side
            # (This would need database access to validate, but we check structure here)
            pass
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform execution calculations.
        
        Args:
            data: Execution data dictionary
            
        Returns:
            Dict with calculated values
        """
        results = {}
        
        # Calculate execution values
        if 'quantity' in data and 'price' in data:
            exec_result = self.calculate_execution_values(
                quantity=data.get('quantity', 0.0),
                price=data.get('price', 0.0),
                commission=data.get('commission', 0.0),
                action=data.get('action'),
                is_edit=False
            )
            if exec_result['is_valid']:
                results['total'] = exec_result['total']
                results['label'] = exec_result['label']
        
        return results

