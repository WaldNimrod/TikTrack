"""
Base Business Service - TikTrack
=================================

Base class for all business logic services.
Provides common interface and utilities for validation, calculation, and rule application.

Documentation:
- documentation/02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md
"""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.orm import Session

from services.validation_service import ValidationService

logger = logging.getLogger(__name__)


class BaseBusinessService(ABC):
    """
    Base class for all business logic services.
    
    All business services should inherit from this class and implement
    the required methods for validation, calculation, and rule application.
    """
    
    def __init__(self, db_session: Optional[Session] = None):
        """
        Initialize the business service.
        
        Args:
            db_session: Optional database session for constraint validation.
                       If None, constraint validation will be skipped.
        """
        self.logger = logging.getLogger(self.__class__.__name__)
        self.db_session = db_session
    
    @property
    @abstractmethod
    def table_name(self) -> Optional[str]:
        """
        Return the database table name for this entity.
        
        Returns:
            Table name (e.g., 'trades', 'executions') or None if not applicable.
            Services without a database table (e.g., StatisticsBusinessService)
            should return None.
        """
        pass
    
    @abstractmethod
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate business data according to business rules.
        
        Args:
            data: Data dictionary to validate
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
            
        Example:
            result = service.validate({'price': 100, 'quantity': 10})
            if result['is_valid']:
                # proceed with business logic
            else:
                # handle validation errors
                for error in result['errors']:
                    logger.error(error)
        """
        pass
    
    @abstractmethod
    def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform business calculations.
        
        Args:
            data: Input data for calculations
            
        Returns:
            Dict with calculated values
            
        Example:
            result = service.calculate({
                'price': 100,
                'quantity': 10,
                'side': 'buy'
            })
            # result contains calculated values like total_amount, etc.
        """
        pass
    
    def apply_rules(self, data: Dict[str, Any], rule_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Apply business rules to data.
        
        Args:
            data: Data to apply rules to
            rule_type: Optional specific rule type to apply
            
        Returns:
            Dict with rule application results
            
        Example:
            result = service.apply_rules({
                'trade': trade_data,
                'account': account_data
            }, rule_type='trade_validation')
        """
        self.logger.debug(f"Applying rules to data: {rule_type or 'default'}")
        return {
            'applied': True,
            'rules_checked': [],
            'violations': []
        }
    
    def validate_with_constraints(self, data: Dict[str, Any], exclude_id: Optional[int] = None) -> Tuple[bool, List[str]]:
        """
        Validate data against database constraints (first step in validation chain).
        
        This method should be called FIRST in the validate() method of each service,
        before BusinessRulesRegistry validation and complex business rules.
        
        Args:
            data: Data dictionary to validate
            exclude_id: ID to exclude from unique checks (for updates)
            
        Returns:
            Tuple of (is_valid, list_of_errors)
            
        Note:
            - If db_session is None, constraint validation is skipped (returns True, [])
            - If table_name is None, constraint validation is skipped (returns True, [])
            - This allows services without DB tables (e.g., Statistics) to work correctly
        """
        if not self.db_session:
            # No DB session - skip constraint validation
            self.logger.debug(f"No DB session provided for {self.__class__.__name__}, skipping constraint validation")
            return True, []
        
        if not self.table_name:
            # No table name - skip constraint validation (e.g., StatisticsBusinessService)
            self.logger.debug(f"No table name defined for {self.__class__.__name__}, skipping constraint validation")
            return True, []
        
        try:
            return ValidationService.validate_data(self.db_session, self.table_name, data, exclude_id)
        except Exception as e:
            self.logger.error(f"Error validating constraints for {self.__class__.__name__}: {str(e)}")
            # Return validation error instead of crashing
            return False, [f"Constraint validation error: {str(e)}"]
    
    def log_business_event(self, event_type: str, data: Dict[str, Any], level: str = 'info'):
        """
        Log business events for auditing and debugging.
        
        Args:
            event_type: Type of business event (e.g., 'trade_calculated', 'validation_failed')
            data: Event data
            level: Log level ('info', 'warning', 'error')
        """
        log_method = getattr(self.logger, level, self.logger.info)
        log_method(f"Business event: {event_type}", extra={'data': data})

