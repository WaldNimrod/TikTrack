"""
AI Analysis Business Logic Service - TikTrack
=============================================

Business logic for AI analysis validations, variable validations, and rule applications.

Documentation:
- documentation/02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
import json

from .base_business_service import BaseBusinessService
from .business_rules_registry import business_rules_registry
from .utils.edge_cases_utils import is_empty_value

logger = logging.getLogger(__name__)


class AIAnalysisBusinessService(BaseBusinessService):
    """
    Business logic service for AI analysis.
    
    Handles all AI analysis-related validations, variable validations, and business rules.
    """
    
    # Valid provider values
    VALID_PROVIDERS = ['gemini', 'perplexity']
    
    # Valid status values
    VALID_STATUSES = ['pending', 'completed', 'failed']
    
    # Variables validation rules
    VARIABLES_MAX_LENGTH = 10000  # Max total length of all variables combined
    
    @property
    def table_name(self) -> Optional[str]:
        """Return the database table name for AI analysis requests."""
        return 'ai_analysis_requests'
    
    def __init__(self, db_session: Optional[Session] = None):
        """Initialize the AI analysis business service."""
        super().__init__(db_session)
        self.registry = business_rules_registry
    
    # ========================================================================
    # Validation Methods
    # ========================================================================
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate AI analysis request data according to business rules.
        
        Validation order (CRITICAL - must follow this order):
        1. Database Constraints (ValidationService) - checks NOT NULL, UNIQUE, FOREIGN KEY, ENUM, RANGE, CHECK
        2. Business Rules Registry - checks min/max, allowed_values, required (only if not in Constraints)
        3. Complex Business Rules - checks business logic (e.g., template exists, provider configured, variables valid)
        
        Args:
            data: AI analysis request data dictionary with keys:
                - template_id: int (required, positive)
                - variables: dict (required, non-empty)
                - user_id: int (required, positive)
                - provider: str (optional, 'gemini' or 'perplexity')
                - status: str (optional, 'pending', 'completed', 'failed')
            
        Returns:
            Dict with:
                - is_valid: bool
                - errors: List[str]
                
        Example:
            result = service.validate({
                'template_id': 1,
                'variables': {'stock_ticker': 'TSLA', 'goal': 'Investment'},
                'user_id': 1,
                'provider': 'gemini'
            })
        """
        self.log_business_event('ai_analysis_validation', data)
        
        errors = []
        
        # Step 1: Validate against database constraints (FIRST!)
        is_valid, constraint_errors = self.validate_with_constraints(data)
        if not is_valid:
            errors.extend(constraint_errors)
            self.logger.debug(f"Constraint validation found {len(constraint_errors)} errors")
        
        # Step 2: Validate against business rules registry (SECOND!)
        # Validate required fields first
        entity_rules = self.registry.get_entity_rules('ai_analysis')
        for field, rule in entity_rules.items():
            if rule.get('required', False):
                if field not in data or is_empty_value(data.get(field)):
                    errors.append(f"{field} is required")
        
        # Validate field values using registry
        for field, value in data.items():
            if is_empty_value(value):
                continue
            
            rule_result = self.registry.validate_value('ai_analysis', field, value)
            if not rule_result['is_valid']:
                errors.append(rule_result['error'])
        
        # Step 3: Complex business rules (THIRD!)
        
        # Validate template_id exists and is active
        template_id = data.get('template_id')
        # Ensure template_id is an integer (not a dict)
        # Handle case where entire data dict was passed as template_id (bug in cache or API)
        if isinstance(template_id, dict):
            # If template_id is a dict, extract the actual template_id from it
            original_template_id = template_id
            template_id = template_id.get('template_id')
            self.logger.warning(f"template_id was a dict: {original_template_id}, extracted: {template_id}")
        
        if template_id:
            try:
                template_id = int(template_id)
                template_validation = self.validate_template_exists(template_id)
                if not template_validation['is_valid']:
                    errors.extend(template_validation['errors'])
            except (ValueError, TypeError) as e:
                errors.append(f"Invalid template_id: must be an integer, got {type(template_id).__name__}: {str(e)}")
        
        # Validate provider
        provider = data.get('provider')
        if provider:
            if provider not in self.VALID_PROVIDERS:
                errors.append(f"Provider must be one of: {', '.join(self.VALID_PROVIDERS)}")
        
        # Validate variables
        variables = data.get('variables')
        if variables:
            variables_validation = self.validate_variables(variables)
            if not variables_validation['is_valid']:
                errors.extend(variables_validation['errors'])
        else:
            errors.append('Variables are required')
        
        # Template-specific validations
        if template_id and variables:
            template_specific_errors = self._validate_template_specific_requirements(template_id, variables)
            if template_specific_errors:
                errors.extend(template_specific_errors)
        
        # Validate status (if provided)
        status = data.get('status')
        if status and status not in self.VALID_STATUSES:
            errors.append(f"Status must be one of: {', '.join(self.VALID_STATUSES)}")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def _validate_template_specific_requirements(
        self,
        template_id: int,
        variables: Dict[str, Any]
    ) -> List[str]:
        """
        Validate template-specific requirements
        
        Args:
            template_id: Template ID (2=Technical Analysis, 3=Portfolio Performance, 4=Risk & Conditions)
            variables: Variables dictionary (v2.0 or legacy)
            
        Returns:
            List of error messages (empty if valid)
        """
        errors = []
        
        # Extract prompt_variables from v2.0 structure or use variables directly
        prompt_variables = variables
        if isinstance(variables, dict) and ('prompt_variables' in variables or variables.get('version') == '2.0'):
            prompt_variables = variables.get('prompt_variables', variables)
        
        # Technical Analysis (template_id=2) requires ticker symbol
        if template_id == 2:
            ticker_symbol = prompt_variables.get('ticker_symbol') or prompt_variables.get('stock_ticker')
            if not ticker_symbol or (isinstance(ticker_symbol, str) and ticker_symbol.strip() == ''):
                errors.append("ניתוח טכני דורש בחירת טיקר. אנא בחר טיקר לפני ביצוע הניתוח.")
        
        return errors
    
    def validate_template_exists(self, template_id: int) -> Dict[str, Any]:
        """
        Validate that template exists and is active.
        
        Args:
            template_id: Template ID to validate
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        if not self.db_session:
            # Cannot validate without DB session - skip this check
            return {'is_valid': True, 'errors': []}
        
        try:
            from models.ai_analysis import AIPromptTemplate
            
            template = self.db_session.query(AIPromptTemplate).filter(
                AIPromptTemplate.id == template_id
            ).first()
            
            if not template:
                errors.append(f"Template {template_id} not found")
            elif template.is_active is False:
                errors.append(f"Template {template_id} is not active")
        except Exception as e:
            self.logger.error(f"Error validating template existence: {e}", exc_info=True)
            errors.append(f"Error validating template: {str(e)}")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_variables(self, variables: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate variables dictionary.
        Supports both v2.0 structure (with prompt_variables, filters, trade_selection) and legacy v1.0 structure.
        
        Args:
            variables: Variables dictionary (v2.0 or v1.0)
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        if not isinstance(variables, dict):
            errors.append('Variables must be a dictionary')
            return {'is_valid': False, 'errors': errors}
        
        if len(variables) == 0:
            errors.append('Variables dictionary cannot be empty')
            return {'is_valid': False, 'errors': errors}
        
        # Check if this is v2.0 structure
        is_v2 = variables.get('version') == '2.0' or 'prompt_variables' in variables
        
        if is_v2:
            # v2.0 structure: validate prompt_variables, filters, trade_selection separately
            prompt_variables = variables.get('prompt_variables', {})
            filters = variables.get('filters', {})
            trade_selection = variables.get('trade_selection', {})
            metadata = variables.get('metadata', {})
            
            # Validate prompt_variables (must be flat dict with simple values)
            if isinstance(prompt_variables, dict):
                for key, value in prompt_variables.items():
                    if not isinstance(key, str):
                        errors.append(f"Prompt variable key '{key}' must be a string")
                    elif value is not None and not isinstance(value, (str, int, float, bool)):
                        errors.append(f"Prompt variable '{key}' value must be a string, number, or boolean")
            else:
                errors.append("prompt_variables must be a dictionary")
            
            # Validate filters (must be flat dict with simple values)
            if isinstance(filters, dict):
                for key, value in filters.items():
                    if not isinstance(key, str):
                        errors.append(f"Filter key '{key}' must be a string")
                    elif value is not None and not isinstance(value, (str, int, float, bool)):
                        errors.append(f"Filter '{key}' value must be a string, number, or boolean")
            else:
                errors.append("filters must be a dictionary")
            
            # Validate trade_selection (can contain nested structures, but top-level keys must be strings)
            if isinstance(trade_selection, dict):
                for key, value in trade_selection.items():
                    if not isinstance(key, str):
                        errors.append(f"Trade selection key '{key}' must be a string")
                    # trade_selection values can be more complex (dicts, lists) - allow them
            else:
                errors.append("trade_selection must be a dictionary")
            
            # Validate metadata (can contain nested structures)
            if metadata and not isinstance(metadata, dict):
                errors.append("metadata must be a dictionary")
            
            # Check total length (sum of all nested values)
            total_length = (
                sum(len(str(v)) for v in prompt_variables.values() if v is not None) +
                sum(len(str(v)) for v in filters.values() if v is not None) +
                len(str(trade_selection)) +
                len(str(metadata))
            )
            if total_length > self.VARIABLES_MAX_LENGTH:
                errors.append(f"Total length of all variables must not exceed {self.VARIABLES_MAX_LENGTH} characters")
        else:
            # Legacy v1.0 structure: validate as flat dictionary
            # Check total length of all variables (to prevent extremely large requests)
            total_length = sum(len(str(v)) for v in variables.values())
            if total_length > self.VARIABLES_MAX_LENGTH:
                errors.append(f"Total length of all variables must not exceed {self.VARIABLES_MAX_LENGTH} characters")
            
            # Validate each variable value
            for key, value in variables.items():
                if not isinstance(key, str):
                    errors.append(f"Variable key '{key}' must be a string")
                elif len(key) == 0:
                    errors.append("Variable key cannot be empty")
                elif len(key) > 100:
                    errors.append(f"Variable key '{key}' must not exceed 100 characters")
                
                # Value can be string, number, or None
                if value is not None and not isinstance(value, (str, int, float, bool)):
                    errors.append(f"Variable '{key}' value must be a string, number, or boolean")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate business values for AI analysis (if needed).
        
        Currently, AI analysis doesn't require complex calculations,
        but this method is required by BaseBusinessService.
        
        Args:
            data: AI analysis request data dictionary
            
        Returns:
            Dict with calculated values (currently empty)
        """
        self.log_business_event('ai_analysis_calculation', data)
        
        # No calculations needed for AI analysis at this time
        # This method can be extended in the future if needed
        return {}

