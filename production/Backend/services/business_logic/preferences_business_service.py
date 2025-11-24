"""
Preferences Business Logic Service - TikTrack
==============================================

Business logic for preferences validations and rule applications.
Moved from frontend to ensure consistency and centralization.

Documentation:
- documentation/02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md
"""

from __future__ import annotations

import logging
import json
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from .base_business_service import BaseBusinessService
from .business_rules_registry import business_rules_registry

logger = logging.getLogger(__name__)


class PreferencesBusinessService(BaseBusinessService):
    """
    Business logic service for preferences.
    
    Handles all preferences-related validations and business rules.
    """
    
    @property
    def table_name(self) -> Optional[str]:
        """Return the database table name for user preferences."""
        return 'user_preferences'
    
    def __init__(self, db_session: Optional[Session] = None):
        """Initialize the preferences business service."""
        super().__init__(db_session)
        self.registry = business_rules_registry
    
    # ========================================================================
    # Validation Methods
    # ========================================================================
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate preferences data according to business rules.
        
        Validation order (CRITICAL - must follow this order):
        1. Database Constraints (ValidationService) - checks NOT NULL, UNIQUE, FOREIGN KEY, ENUM, RANGE, CHECK
        2. Business Rules Registry - checks min/max, allowed_values, required (only if not in Constraints)
        3. Complex Business Rules - checks business logic (dependencies, profile rules)
        
        Args:
            data: Preferences data dictionary
            
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
        # Note: BusinessRulesRegistry יכול לבדוק חוקים מורכבים יותר מ-Constraints
        preference_name = data.get('preference_name')
        if preference_name:
            rule_result = self.registry.validate_value('preferences', preference_name, data.get('value'))
            if not rule_result['is_valid']:
                errors.append(rule_result['error'])
        
        # Step 3: Complex business rules (THIRD!)
        # Additional validations can be added here
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_preference(
        self,
        preference_name: str,
        value: Any,
        data_type: str = 'string'
    ) -> Dict[str, Any]:
        """
        Validate preference value.
        
        Validation order:
        1. Database Constraints (ValidationService)
        2. Business Rules Registry
        3. Complex Business Rules (dependencies, data type validation)
        
        Args:
            preference_name: Name of the preference
            value: Value to validate
            data_type: Expected data type (string, number, boolean, json)
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        # Prepare data for constraint validation
        validation_data = {
            'preference_name': preference_name,
            'value': value
        }
        
        # Step 1: Validate against database constraints (FIRST!)
        is_valid, constraint_errors = self.validate_with_constraints(validation_data)
        if not is_valid:
            errors.extend(constraint_errors)
            self.logger.debug(f"Constraint validation found {len(constraint_errors)} errors")
        
        # Step 2: Validate against business rules registry (SECOND!)
        entity_rules = self.registry.get_entity_rules('preferences')
        if preference_name in entity_rules:
            rule_result = self.registry.validate_value('preferences', preference_name, value)
            if not rule_result['is_valid']:
                errors.append(rule_result['error'])
        
        # Step 3: Complex business rules - data type validation (THIRD!)
        if data_type == 'number' or data_type == 'integer' or data_type == 'float':
            try:
                float(value)
            except (ValueError, TypeError):
                errors.append(f"Preference '{preference_name}' must be a number")
        
        elif data_type == 'boolean':
            if str(value).lower() not in ['true', 'false', '1', '0', 'yes', 'no']:
                errors.append(f"Preference '{preference_name}' must be boolean")
        
        elif data_type == 'json':
            try:
                if isinstance(value, str):
                    json.loads(value)
                else:
                    json.dumps(value)
            except (json.JSONDecodeError, TypeError):
                errors.append(f"Preference '{preference_name}' must be valid JSON")
        
        elif data_type == 'color':
            value_str = str(value).strip()
            if not value_str.startswith('#') or len(value_str) not in {4, 7}:
                errors.append(f"Preference '{preference_name}' must be hex color (e.g., #FF0000)")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate profile data.
        
        Business rule: Cannot delete active profile.
        
        Args:
            profile_data: Profile data dictionary with keys:
                - profile_id: int (required for delete operations)
                - is_active: bool (optional)
                - action: str (optional, 'delete' or 'update')
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        # Prepare data for constraint validation
        validation_data = {
            'profile_id': profile_data.get('profile_id'),
            'profile_name': profile_data.get('profile_name'),
            'is_active': profile_data.get('is_active')
        }
        
        # Step 1: Validate against database constraints (FIRST!)
        # Note: preference_profiles table validation
        # For now, we'll skip constraint validation for profiles as it's a complex operation
        # that requires checking the preference_profiles table
        
        # Step 2: Validate against business rules registry (SECOND!)
        action = profile_data.get('action', 'update')
        
        if action == 'delete':
            profile_id = profile_data.get('profile_id')
            is_active = profile_data.get('is_active', False)
            
            # Business rule: Cannot delete active profile
            if is_active:
                errors.append("Cannot delete active profile")
            
            if not profile_id:
                errors.append("profile_id is required for delete operation")
        
        # Step 3: Complex business rules (THIRD!)
        profile_name = profile_data.get('profile_name')
        if profile_name:
            profile_name = str(profile_name).strip()
            if not profile_name:
                errors.append("profile_name cannot be empty")
            elif len(profile_name) > 100:
                errors.append("profile_name cannot exceed 100 characters")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_dependencies(self, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate dependencies between preferences.
        
        Business rule: Some preferences depend on other preferences.
        
        Args:
            preferences: Dictionary of preference_name -> value
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        # Step 1: Validate against database constraints (FIRST!)
        # Note: Dependencies are business rules, not database constraints
        # So we skip constraint validation here
        
        # Step 2: Validate against business rules registry (SECOND!)
        # Check if any preference has dependency rules
        entity_rules = self.registry.get_entity_rules('preferences')
        for preference_name, value in preferences.items():
            if preference_name in entity_rules:
                rule_result = self.registry.validate_value('preferences', preference_name, value)
                if not rule_result['is_valid']:
                    errors.append(rule_result['error'])
        
        # Step 3: Complex business rules - dependency validation (THIRD!)
        # Example: If preference A is set, preference B must also be set
        # This can be extended based on actual business requirements
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform preferences calculations.
        
        Args:
            data: Preferences calculation data dictionary
            
        Returns:
            Dict with calculated values
        """
        # Preferences service doesn't have complex calculations
        # This method is here to satisfy the abstract method requirement
        return {}
