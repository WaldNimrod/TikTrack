"""
Note Business Logic Service - TikTrack
=======================================

Business logic for note validations, relation validations, and rule applications.

Documentation:
- documentation/02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from .base_business_service import BaseBusinessService

logger = logging.getLogger(__name__)


class NoteBusinessService(BaseBusinessService):
    """
    Business logic service for notes.
    
    Handles all note-related validations, relation validations, and business rules.
    """
    
    # Valid note relation types
    VALID_RELATION_TYPES = {
        1: 'trading_account',
        2: 'trade',
        3: 'trade_plan',
        4: 'ticker'
    }
    
    # Content validation rules
    CONTENT_MIN_LENGTH = 1
    CONTENT_MAX_LENGTH = 10000
    
    # Forbidden characters in content (if any)
    FORBIDDEN_CHARACTERS = []  # Can be extended if needed
    
    @property
    def table_name(self) -> Optional[str]:
        """Return the database table name for notes."""
        return 'notes'
    
    def __init__(self, db_session: Optional[Session] = None):
        """Initialize the note business service."""
        super().__init__(db_session)
    
    # ========================================================================
    # Validation Methods
    # ========================================================================
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate note data according to business rules.
        
        Validation order (CRITICAL - must follow this order):
        1. Database Constraints (ValidationService) - checks NOT NULL, UNIQUE, FOREIGN KEY, ENUM, RANGE, CHECK
        2. Business Rules Registry - checks min/max, allowed_values, required (only if not in Constraints)
        3. Complex Business Rules - checks business logic
        
        Args:
            data: Note data dictionary with keys:
                - content: str (required, 1-10000 chars)
                - related_type_id: int (required, 1-4)
                - related_id: int (required, positive)
                - attachment: str (optional, max 500 chars)
            
        Returns:
            Dict with:
                - is_valid: bool
                - errors: List[str]
                
        Example:
            result = service.validate({
                'content': 'This is a note',
                'related_type_id': 2,
                'related_id': 123
            })
        """
        self.log_business_event('note_validation', data)
        
        errors = []
        
        # Step 1: Validate against database constraints (FIRST!)
        is_valid, constraint_errors = self.validate_with_constraints(data)
        if not is_valid:
            errors.extend(constraint_errors)
            self.logger.debug(f"Constraint validation found {len(constraint_errors)} errors")
        
        # Step 2: Validate against business rules registry (SECOND!)
        
        # Validate content
        content_validation = self.validate_content(data.get('content'))
        if not content_validation['is_valid']:
            errors.extend(content_validation['errors'])
        
        # Validate relation
        relation_validation = self.validate_relation(
            data.get('related_type_id'),
            data.get('related_id')
        )
        if not relation_validation['is_valid']:
            errors.extend(relation_validation['errors'])
        
        # Validate attachment (if provided)
        if 'attachment' in data and data['attachment']:
            attachment_validation = self.validate_attachment(data.get('attachment'))
            if not attachment_validation['is_valid']:
                errors.extend(attachment_validation['errors'])
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_content(self, content: Optional[str]) -> Dict[str, Any]:
        """
        Validate note content.
        
        Args:
            content: Note content string
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        if content is None:
            errors.append('Content is required')
            return {'is_valid': False, 'errors': errors}
        
        if not isinstance(content, str):
            errors.append('Content must be a string')
            return {'is_valid': False, 'errors': errors}
        
        content_length = len(content.strip())
        
        if content_length < self.CONTENT_MIN_LENGTH:
            errors.append(f'Content must be at least {self.CONTENT_MIN_LENGTH} character(s)')
        
        if content_length > self.CONTENT_MAX_LENGTH:
            errors.append(f'Content must not exceed {self.CONTENT_MAX_LENGTH} characters')
        
        # Check for forbidden characters
        if self.FORBIDDEN_CHARACTERS:
            for char in self.FORBIDDEN_CHARACTERS:
                if char in content:
                    errors.append(f'Content contains forbidden character: {repr(char)}')
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_relation(
        self,
        related_type_id: Optional[int],
        related_id: Optional[int]
    ) -> Dict[str, Any]:
        """
        Validate note relation (related_type_id and related_id).
        
        Args:
            related_type_id: Relation type ID (1-4)
            related_id: Related entity ID (positive integer)
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        # Validate related_type_id
        if related_type_id is None:
            errors.append('related_type_id is required')
        elif not isinstance(related_type_id, int):
            errors.append('related_type_id must be an integer')
        elif related_type_id not in self.VALID_RELATION_TYPES:
            valid_types = ', '.join([f'{k} ({v})' for k, v in self.VALID_RELATION_TYPES.items()])
            errors.append(f'Invalid related_type_id. Must be one of: {valid_types}')
        
        # Validate related_id
        if related_id is None:
            errors.append('related_id is required')
        elif not isinstance(related_id, int):
            errors.append('related_id must be an integer')
        elif related_id <= 0:
            errors.append('related_id must be a positive integer')
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_attachment(self, attachment: Optional[str]) -> Dict[str, Any]:
        """
        Validate note attachment filename/path.
        
        Args:
            attachment: Attachment filename or path
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        if attachment is None:
            return {'is_valid': True, 'errors': []}
        
        if not isinstance(attachment, str):
            errors.append('Attachment must be a string')
            return {'is_valid': False, 'errors': errors}
        
        if len(attachment) > 500:
            errors.append('Attachment path must not exceed 500 characters')
        
        # Additional validation can be added here (file extension, path format, etc.)
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_relation_type(self, relation_type_id: Optional[int]) -> Dict[str, Any]:
        """
        Validate note relation type ID.
        
        Args:
            relation_type_id: Relation type ID (1-4)
            
        Returns:
            Dict with 'is_valid' (bool), 'errors' (List[str]), and 'relation_type' (str)
        """
        errors = []
        
        if relation_type_id is None:
            errors.append('Relation type ID is required')
            return {'is_valid': False, 'errors': errors, 'relation_type': None}
        
        if not isinstance(relation_type_id, int):
            errors.append('Relation type ID must be an integer')
            return {'is_valid': False, 'errors': errors, 'relation_type': None}
        
        if relation_type_id not in self.VALID_RELATION_TYPES:
            valid_types = ', '.join([f'{k} ({v})' for k, v in self.VALID_RELATION_TYPES.items()])
            errors.append(f'Invalid relation type ID. Must be one of: {valid_types}')
            return {'is_valid': False, 'errors': errors, 'relation_type': None}
        
        return {
            'is_valid': True,
            'errors': [],
            'relation_type': self.VALID_RELATION_TYPES[relation_type_id]
        }
    
    # ========================================================================
    # Calculation Methods
    # ========================================================================
    
    def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform business calculations for notes.
        
        Currently, notes don't require complex calculations,
        but this method is available for future extensions.
        
        Args:
            data: Input data for calculations
            
        Returns:
            Dict with calculated values
        """
        self.log_business_event('note_calculation', data)
        
        # For now, return empty calculations
        # Can be extended for future features like:
        # - Note statistics
        # - Note relationships analysis
        # - Note content analysis
        
        return {
            'calculated': True,
            'values': {}
        }
    
    # ========================================================================
    # Helper Methods
    # ========================================================================
    
    def get_relation_type_name(self, relation_type_id: int) -> Optional[str]:
        """
        Get relation type name by ID.
        
        Args:
            relation_type_id: Relation type ID
            
        Returns:
            Relation type name or None if invalid
        """
        return self.VALID_RELATION_TYPES.get(relation_type_id)
    
    def get_valid_relation_types(self) -> Dict[int, str]:
        """
        Get all valid relation types.
        
        Returns:
            Dict mapping relation type IDs to names
        """
        return self.VALID_RELATION_TYPES.copy()

