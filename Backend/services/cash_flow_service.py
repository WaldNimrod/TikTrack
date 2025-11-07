"""
Cash Flow Service - Helper Functions for Currency Exchange
==========================================================

This module provides helper functions for currency exchange operations in cash flows.
Includes functions for identifying exchange operations, retrieving exchange-related flows,
and validating exchange completeness.

Author: TikTrack Development Team
Version: 1.0.0
Date: January 2025
"""

from sqlalchemy.orm import Session
from models.cash_flow import CashFlow
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class CashFlowService:
    """
    Service for cash flow operations, especially currency exchanges
    """
    
    EXCHANGE_PREFIX = "exchange_"
    
    @staticmethod
    def is_currency_exchange(external_id: Optional[str]) -> bool:
        """
        Check if external_id indicates a currency exchange operation
        
        Args:
            external_id: External ID string to check
            
        Returns:
            bool: True if external_id starts with 'exchange_'
        """
        if not external_id:
            return False
        return external_id.startswith(CashFlowService.EXCHANGE_PREFIX)
    
    @staticmethod
    def get_exchange_flows(db: Session, exchange_id: str) -> List[CashFlow]:
        """
        Get all cash flows related to a currency exchange operation
        
        Args:
            db: Database session
            exchange_id: Exchange ID (with or without 'exchange_' prefix)
            
        Returns:
            List[CashFlow]: List of cash flows related to this exchange
        """
        # Ensure exchange_id has the prefix
        if not exchange_id.startswith(CashFlowService.EXCHANGE_PREFIX):
            exchange_id = f"{CashFlowService.EXCHANGE_PREFIX}{exchange_id}"
        
        flows = db.query(CashFlow).filter(
            CashFlow.external_id == exchange_id
        ).all()
        
        logger.info(f"Found {len(flows)} cash flows for exchange {exchange_id}")
        return flows
    
    @staticmethod
    def validate_exchange_completeness(flows: List[CashFlow]) -> tuple[bool, Optional[str]]:
        """
        Validate that an exchange operation has all required flows
        
        Args:
            flows: List of cash flows to validate
            
        Returns:
            tuple: (is_valid, error_message)
        """
        if not flows or len(flows) < 2:
            return False, "Currency exchange must have at least 2 cash flows (from and to)"
        
        # Check for other_negative (from currency - outgoing)
        from_flow = next((f for f in flows if f.type == 'other_negative'), None)
        if not from_flow:
            return False, "Currency exchange must have a 'from' flow with type 'other_negative'"
        
        # Check for other_positive (to currency - incoming)
        to_flow = next((f for f in flows if f.type == 'other_positive'), None)
        if not to_flow:
            return False, "Currency exchange must have a 'to' flow with type 'other_positive'"
        
        # Fee flow is optional (type='fee')
        fee_flow = next((f for f in flows if f.type == 'fee'), None)
        
        # Validate amounts
        if from_flow.amount >= 0:
            return False, "From flow amount must be negative (outgoing)"
        
        if to_flow.amount <= 0:
            return False, "To flow amount must be positive (incoming)"
        
        if fee_flow and fee_flow.amount >= 0:
            return False, "Fee flow amount must be negative"
        
        # Validate currencies are different
        if from_flow.currency_id == to_flow.currency_id:
            return False, "From and to currencies must be different"
        
        logger.info(f"Exchange validation passed: {len(flows)} flows (from: {from_flow.id}, to: {to_flow.id}, fee: {fee_flow.id if fee_flow else 'none'})")
        return True, None
    
    @staticmethod
    def get_exchange_uuid_from_external_id(external_id: str) -> Optional[str]:
        """
        Extract exchange UUID from external_id
        
        Args:
            external_id: External ID string (format: 'exchange_<uuid>')
            
        Returns:
            str: UUID part without prefix, or None if invalid
        """
        if not CashFlowService.is_currency_exchange(external_id):
            return None
        
        return external_id[len(CashFlowService.EXCHANGE_PREFIX):]
    
    @staticmethod
    def create_exchange_id(uuid: str) -> str:
        """
        Create exchange external_id from UUID
        
        Args:
            uuid: UUID string
            
        Returns:
            str: External ID with prefix
        """
        return f"{CashFlowService.EXCHANGE_PREFIX}{uuid}"

