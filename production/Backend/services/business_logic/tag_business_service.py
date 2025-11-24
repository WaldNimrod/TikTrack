"""
Tag Business Logic Service - TikTrack
=====================================

Business logic for tag validations and rule applications.

Documentation:
- documentation/02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from .base_business_service import BaseBusinessService

logger = logging.getLogger(__name__)


class TagBusinessService(BaseBusinessService):
    """
    Business logic service for tags.
    
    Handles all tag-related validations and business rules.
    """
    
    # Name validation rules
    NAME_MIN_LENGTH = 1
    NAME_MAX_LENGTH = 100
    
    @property
    def table_name(self) -> Optional[str]:
        """Return the database table name for tags."""
        return 'tags'
    
    def __init__(self, db_session: Optional[Session] = None):
        """Initialize the tag business service."""
        super().__init__(db_session)
    
    # ========================================================================
    # Validation Methods
    # ========================================================================
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate tag data according to business rules.
        
        Args:
            data: Tag data dictionary with keys:
                - name: str (required, 1-100 chars)
                - category: str (optional)
            
        Returns:
            Dict with:
                - is_valid: bool
                - errors: List[str]
                
        Example:
            result = service.validate({
                'name': 'High Risk',
                'category': 'Risk Level'
            })
        """
        self.log_business_event('tag_validation', data)
        
        errors = []
        
        # Step 1: Validate against database constraints (FIRST!)
        is_valid, constraint_errors = self.validate_with_constraints(data)
        if not is_valid:
            errors.extend(constraint_errors)
            self.logger.debug(f"Constraint validation found {len(constraint_errors)} errors")
        
        # Step 2: Validate against business rules registry (SECOND!)
        # Validate name
        name_validation = self.validate_name(data.get('name'))
        if not name_validation['is_valid']:
            errors.extend(name_validation['errors'])
        
        # Validate category (if provided)
        if 'category' in data and data['category']:
            category_validation = self.validate_category(data.get('category'))
            if not category_validation['is_valid']:
                errors.extend(category_validation['errors'])
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_name(self, name: Optional[str]) -> Dict[str, Any]:
        """
        Validate tag name.
        
        Args:
            name: Tag name string
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        if name is None:
            errors.append('Tag name is required')
            return {'is_valid': False, 'errors': errors}
        
        if not isinstance(name, str):
            errors.append('Tag name must be a string')
            return {'is_valid': False, 'errors': errors}
        
        name_length = len(name.strip())
        
        if name_length < self.NAME_MIN_LENGTH:
            errors.append(f'Tag name must be at least {self.NAME_MIN_LENGTH} character(s)')
        
        if name_length > self.NAME_MAX_LENGTH:
            errors.append(f'Tag name must not exceed {self.NAME_MAX_LENGTH} characters')
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_category(self, category: Optional[str]) -> Dict[str, Any]:
        """
        Validate tag category.
        
        Args:
            category: Tag category string
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        if category is None:
            return {'is_valid': True, 'errors': []}
        
        if not isinstance(category, str):
            errors.append('Tag category must be a string')
            return {'is_valid': False, 'errors': errors}
        
        if len(category.strip()) == 0:
            errors.append('Tag category must not be empty')
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    # ========================================================================
    # Calculation Methods
    # ========================================================================
    
    def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform business calculations for tags.
        
        Currently, tags don't require complex calculations,
        but this method is available for future extensions.
        
        Args:
            data: Input data for calculations
            
        Returns:
            Dict with calculated values
        """
        self.log_business_event('tag_calculation', data)
        
        # For now, return empty calculations
        # Can be extended for future features like:
        # - Tag statistics
        # - Tag relationships analysis
        
        return {
            'calculated': True,
            'values': {}
        }

