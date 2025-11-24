"""
Alert Business Logic Service - TikTrack
========================================

Business logic for alert validations and rule applications.
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


class AlertBusinessService(BaseBusinessService):
    """
    Business logic service for alerts.
    
    Handles all alert-related validations and business rules.
    """
    
    def __init__(self):
        """Initialize the alert business service."""
        super().__init__()
        self.registry = business_rules_registry
    
    # ========================================================================
    # Validation
    # ========================================================================
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate alert data according to business rules.
        
        Args:
            data: Alert data dictionary
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        # Validate required fields
        required_fields = ['condition_attribute']
        for field in required_fields:
            if field not in data or data[field] is None or data[field] == '':
                errors.append(f"{field} is required")
        
        # Validate condition_attribute
        condition_attribute = data.get('condition_attribute')
        if condition_attribute:
            allowed_attributes = ['price', 'change', 'volume']
            if condition_attribute not in allowed_attributes:
                errors.append(f"condition_attribute must be one of: {', '.join(allowed_attributes)}")
        
        # Validate condition_number based on condition_attribute
        condition_number = data.get('condition_number')
        if condition_number is not None and condition_number != '':
            try:
                numeric_value = float(condition_number)
                
                # Validate based on attribute type
                if condition_attribute == 'price':
                    # Price validation: must be positive and reasonable
                    if numeric_value <= 0:
                        errors.append("מחיר חייב להיות גדול מ-0")
                    if numeric_value > 1000000:
                        errors.append("מחיר לא יכול להיות גדול מ-1,000,000")
                
                elif condition_attribute == 'change':
                    # Change validation: must be between -100% and 100%
                    if numeric_value < -100 or numeric_value > 100:
                        errors.append("אחוז שינוי חייב להיות בין -100% ל-100%")
                
                elif condition_attribute == 'volume':
                    # Volume validation: must be positive
                    if numeric_value <= 0:
                        errors.append("נפח חייב להיות גדול מ-0")
                
            except (ValueError, TypeError):
                errors.append("הערך חייב להיות מספר")
        
        # Validate field values using registry
        for field, value in data.items():
            if value is None or value == '':
                continue
            
            rule_result = self.registry.validate_value('alert', field, value)
            if not rule_result['is_valid']:
                errors.append(rule_result['error'])
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_condition_value(
        self,
        condition_attribute: str,
        condition_number: Optional[float]
    ) -> Dict[str, Any]:
        """
        Validate condition value based on attribute type.
        
        Args:
            condition_attribute: Type of condition ('price', 'change', 'volume')
            condition_number: Numeric value to validate
            
        Returns:
            Dict with 'is_valid' (bool) and 'error' (str or None)
        """
        if condition_number is None:
            return {
                'is_valid': True,
                'error': None
            }
        
        try:
            numeric_value = float(condition_number)
        except (ValueError, TypeError):
            return {
                'is_valid': False,
                'error': 'הערך חייב להיות מספר'
            }
        
        if condition_attribute == 'price':
            if numeric_value <= 0:
                return {
                    'is_valid': False,
                    'error': 'מחיר חייב להיות גדול מ-0'
                }
            if numeric_value > 1000000:
                return {
                    'is_valid': False,
                    'error': 'מחיר לא יכול להיות גדול מ-1,000,000'
                }
        
        elif condition_attribute == 'change':
            if numeric_value < -100 or numeric_value > 100:
                return {
                    'is_valid': False,
                    'error': 'אחוז שינוי חייב להיות בין -100% ל-100%'
                }
        
        elif condition_attribute == 'volume':
            if numeric_value <= 0:
                return {
                    'is_valid': False,
                    'error': 'נפח חייב להיות גדול מ-0'
                }
        
        return {
            'is_valid': True,
            'error': None
        }
    
    def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform alert calculations.
        
        Args:
            data: Alert data dictionary
            
        Returns:
            Dict with calculated values
        """
        results = {}
        
        # Calculate condition value if needed
        condition_attribute = data.get('condition_attribute')
        condition_number = data.get('condition_number')
        
        if condition_attribute and condition_number:
            # Validate and normalize condition value
            validation_result = self.validate_condition_value(
                condition_attribute,
                condition_number
            )
            if validation_result['is_valid']:
                results['normalized_condition_value'] = float(condition_number)
        
        return results

