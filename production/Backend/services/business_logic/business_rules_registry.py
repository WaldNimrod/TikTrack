"""
Business Rules Registry - TikTrack
===================================

Central registry for all business rules in the system.
This provides a single source of truth for all business logic rules.

Documentation:
- documentation/02-ARCHITECTURE/BACKEND/BUSINESS_RULES_REGISTRY.md
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

# ============================================================================
# Business Rules Registry
# ============================================================================

BUSINESS_RULES: Dict[str, Dict[str, Any]] = {
    'trade': {
        'price': {
            'min': 0.01,
            'max': 1000000,
            'required': True,
            'type': 'float'
        },
        'quantity': {
            'min': 0.01,  # Support fractional shares
            'max': 1000000000,
            'required': True,
            'type': 'float'
        },
        'stop_loss': {
            'min': 0.01,
            'max': None,  # No max, but must be valid percentage or price
            'required': False,
            'type': 'float'
        },
        'take_profit': {
            'min': 0.01,
            'max': None,
            'required': False,
            'type': 'float'
        },
        'stop_loss_percent': {
            'min': 0.01,
            'max': 100,
            'required': False,
            'type': 'float'
        },
        'take_profit_percent': {
            'min': 0.01,
            'max': 10000,  # Support high percentages
            'required': False,
            'type': 'float'
        },
        'side': {
            'allowed_values': ['buy', 'sell', 'long', 'short'],
            'required': True,
            'type': 'string'
        },
        'investment_type': {
            'allowed_values': ['Investment', 'Swing', 'Passive'],
            'required': True,
            'type': 'string'
        },
        'status': {
            'allowed_values': ['open', 'closed', 'cancelled'],
            'required': True,
            'type': 'string'
        }
    },
    
    'execution': {
        'price': {
            'min': 0.01,
            'max': 1000000,
            'required': True,
            'type': 'float'
        },
        'quantity': {
            'min': 0.01,
            'max': 1000000000,
            'required': True,
            'type': 'float'
        },
        'action': {
            'allowed_values': ['buy', 'sell', 'short', 'cover'],
            'required': True,
            'type': 'string'
        },
        'status': {
            'allowed_values': ['pending', 'completed', 'cancelled'],
            'required': True,
            'type': 'string'
        }
    },
    
    'alert': {
        'condition_number': {
            'min': None,  # Depends on condition type
            'max': None,
            'required': False,
            'type': 'float'
        },
        'condition_attribute': {
            'allowed_values': ['price', 'change', 'volume'],
            'required': True,
            'type': 'string'
        },
        'price': {
            'min': 0.01,
            'max': 1000000,
            'required': False,
            'type': 'float'
        },
        'change_percent': {
            'min': -100,
            'max': 100,
            'required': False,
            'type': 'float'
        }
    },
    
    'cash_flow': {
        'amount': {
            'min': 0.01,
            'max': 1000000000,
            'required': True,
            'type': 'float'
        },
        'type': {
            'allowed_values': ['income', 'expense', 'fee', 'tax', 'interest'],
            'required': True,
            'type': 'string'
        },
        'source': {
            'allowed_values': ['manual', 'automatic'],
            'required': True,
            'type': 'string'
        }
    },
    
    'statistics': {
        'calculation_types': {
            'allowed_values': ['kpi', 'summary', 'average', 'position', 'portfolio'],
            'required': True,
            'type': 'string'
        }
    },
    
    'preferences': {
        # Preference validation rules
        # Note: These are business rules that complement database constraints
        # Database constraints (NOT NULL, UNIQUE, etc.) are checked first via ValidationService
        'profile_name': {
            'min_length': 1,
            'max_length': 100,
            'required': True,
            'type': 'string'
        },
        'preference_name': {
            'min_length': 1,
            'max_length': 100,
            'required': True,
            'type': 'string'
        },
        'value': {
            'required': False,  # Some preferences can be empty
            'type': 'string'  # Stored as text in DB
        }
    }
}


class BusinessRulesRegistry:
    """
    Registry for managing and accessing business rules.
    
    Provides methods to get, validate, and apply business rules.
    """
    
    def __init__(self):
        """Initialize the registry with default rules."""
        self.rules = BUSINESS_RULES.copy()
    
    def get_rule(self, entity_type: str, field: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific business rule.
        
        Args:
            entity_type: Type of entity (e.g., 'trade', 'execution')
            field: Field name (e.g., 'price', 'quantity')
            
        Returns:
            Rule dictionary or None if not found
            
        Example:
            rule = registry.get_rule('trade', 'price')
            # Returns: {'min': 0.01, 'max': 1000000, 'required': True, 'type': 'float'}
        """
        return self.rules.get(entity_type, {}).get(field)
    
    def get_entity_rules(self, entity_type: str) -> Dict[str, Any]:
        """
        Get all rules for an entity type.
        
        Args:
            entity_type: Type of entity
            
        Returns:
            Dictionary of all rules for the entity
        """
        return self.rules.get(entity_type, {})
    
    def validate_value(self, entity_type: str, field: str, value: Any) -> Dict[str, Any]:
        """
        Validate a value against business rules.
        
        Args:
            entity_type: Type of entity
            field: Field name
            value: Value to validate
            
        Returns:
            Dict with 'is_valid' (bool) and 'error' (str or None)
        """
        rule = self.get_rule(entity_type, field)
        if not rule:
            return {'is_valid': True, 'error': None}  # No rule = valid
        
        errors = []
        
        # Type validation
        if 'type' in rule:
            expected_type = rule['type']
            if expected_type == 'float' and not isinstance(value, (int, float)):
                errors.append(f"{field} must be a number")
            elif expected_type == 'string' and not isinstance(value, str):
                errors.append(f"{field} must be a string")
        
        # Min/Max validation
        if isinstance(value, (int, float)):
            if 'min' in rule and rule['min'] is not None and value < rule['min']:
                errors.append(f"{field} must be at least {rule['min']}")
            if 'max' in rule and rule['max'] is not None and value > rule['max']:
                errors.append(f"{field} must be at most {rule['max']}")
        
        # Allowed values validation
        if 'allowed_values' in rule:
            if value not in rule['allowed_values']:
                errors.append(f"{field} must be one of: {', '.join(rule['allowed_values'])}")
        
        # Required validation
        if rule.get('required', False) and (value is None or value == ''):
            errors.append(f"{field} is required")
        
        return {
            'is_valid': len(errors) == 0,
            'error': errors[0] if errors else None,
            'errors': errors
        }
    
    def add_rule(self, entity_type: str, field: str, rule: Dict[str, Any]):
        """
        Add or update a business rule.
        
        Args:
            entity_type: Type of entity
            field: Field name
            rule: Rule dictionary
        """
        if entity_type not in self.rules:
            self.rules[entity_type] = {}
        self.rules[entity_type][field] = rule
    
    def get_all_rules(self) -> Dict[str, Dict[str, Any]]:
        """
        Get all business rules.
        
        Returns:
            Complete rules dictionary
        """
        return self.rules.copy()


# Global registry instance
business_rules_registry = BusinessRulesRegistry()

