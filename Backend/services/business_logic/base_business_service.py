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
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class BaseBusinessService(ABC):
    """
    Base class for all business logic services.
    
    All business services should inherit from this class and implement
    the required methods for validation, calculation, and rule application.
    """
    
    def __init__(self):
        """Initialize the business service."""
        self.logger = logging.getLogger(self.__class__.__name__)
    
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

