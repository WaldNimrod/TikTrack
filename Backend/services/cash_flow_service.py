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

from sqlalchemy.orm import Session, joinedload
from models.cash_flow import CashFlow
from models.trading_account import TradingAccount
from typing import List, Optional, Dict, Any, Union
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

class CashFlowService:
    """
    Service for cash flow operations, especially currency exchanges
    """
    
    # Existing constants preserved for compatibility with API and UI
    EXCHANGE_PREFIX = "exchange_"
    EXCHANGE_FROM_TYPE = "currency_exchange_from"
    EXCHANGE_TO_TYPE = "currency_exchange_to"
    LEGACY_EXCHANGE_FROM_TYPE = "other_negative"
    LEGACY_EXCHANGE_TO_TYPE = "other_positive"
    EXCHANGE_TYPES = {
        EXCHANGE_FROM_TYPE,
        EXCHANGE_TO_TYPE,
        LEGACY_EXCHANGE_FROM_TYPE,
        LEGACY_EXCHANGE_TO_TYPE,
    }
    
    @staticmethod
    def is_currency_exchange(external_id: Optional[str], flow_type: Optional[str] = None) -> bool:
        """
        Check if external_id indicates a currency exchange operation
        
        Args:
            external_id: External ID string to check
            
        Returns:
            bool: True if external_id starts with 'exchange_'
        """
        if flow_type and flow_type in CashFlowService.EXCHANGE_TYPES:
            return True
        if not external_id:
            return False
        return external_id.startswith(CashFlowService.EXCHANGE_PREFIX)

    @staticmethod
    def is_exchange_type(flow_type: Optional[str]) -> bool:
        return (flow_type or '') in CashFlowService.EXCHANGE_TYPES

    @staticmethod
    def get_exchange_direction(flow_type: Optional[str]) -> Optional[str]:
        if not flow_type:
            return None
        if flow_type in (CashFlowService.EXCHANGE_FROM_TYPE, CashFlowService.LEGACY_EXCHANGE_FROM_TYPE):
            return 'from'
        if flow_type in (CashFlowService.EXCHANGE_TO_TYPE, CashFlowService.LEGACY_EXCHANGE_TO_TYPE):
            return 'to'
        return None

    @staticmethod
    def normalize_exchange_type(flow_type: Optional[str]) -> Optional[str]:
        if not flow_type:
            return None
        if flow_type == CashFlowService.LEGACY_EXCHANGE_FROM_TYPE:
            return CashFlowService.EXCHANGE_FROM_TYPE
        if flow_type == CashFlowService.LEGACY_EXCHANGE_TO_TYPE:
            return CashFlowService.EXCHANGE_TO_TYPE
        return flow_type
    
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
        
        flows = db.query(CashFlow).options(
            joinedload(CashFlow.account).joinedload(TradingAccount.currency),
            joinedload(CashFlow.currency)
        ).filter(
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

        if len(flows) > 2:
            legacy_fee_flow = next((f for f in flows if f.type == 'fee'), None)
            if legacy_fee_flow:
                return False, "Currency exchange should not include a separate fee flow (legacy structure detected)"
            return False, "Currency exchange must include exactly 2 cash flows (from and to)"
        
        # Check for from/to flows using legacy + new types
        from_flow = next((f for f in flows if CashFlowService.get_exchange_direction(getattr(f, 'type', None)) == 'from'), None)
        if not from_flow:
            return False, "Currency exchange must have a 'from' flow with type 'currency_exchange_from'"
        
        to_flow = next((f for f in flows if CashFlowService.get_exchange_direction(getattr(f, 'type', None)) == 'to'), None)
        if not to_flow:
            return False, "Currency exchange must have a 'to' flow with type 'currency_exchange_to'"
        
        # Validate amounts
        if from_flow.amount >= 0:
            return False, "From flow amount must be negative (outgoing)"
        
        if to_flow.amount <= 0:
            return False, "To flow amount must be positive (incoming)"
        
        # Validate currencies are different
        if from_flow.currency_id == to_flow.currency_id:
            return False, "From and to currencies must be different"

        # Validate fee data on from_flow
        fee_amount = from_flow.fee_amount if hasattr(from_flow, 'fee_amount') else None
        if fee_amount is None:
            return False, "From flow must include fee_amount field"
        if fee_amount < 0:
            return False, "Fee amount must be non-negative"

        # Target flow must not carry a fee amount
        target_fee_amount = to_flow.fee_amount if hasattr(to_flow, 'fee_amount') else 0
        if target_fee_amount not in (0, None):
            return False, "Target flow fee_amount must be zero"
        
        logger.info(
            "Exchange validation passed: %s flows (from: %s, to: %s, fee_amount: %s)",
            len(flows),
            from_flow.id,
            to_flow.id,
            fee_amount
        )
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

    # ------------------------------------------------------------------
    # Creation APIs (SSOT for manual + import flows)
    # ------------------------------------------------------------------
    @staticmethod
    def create_exchange(
        db: Session,
        *,
        trading_account_id: int,
        from_currency_id: int,
        to_currency_id: int,
        date,
        from_amount: float,
        exchange_rate: float,
        fee_amount: float = 0.0,
        description: str = None,
        source: str = "currency_exchange"
    ) -> Dict[str, Any]:
        """
        Create an atomic currency exchange pair using the canonical structure.
        Returns: dict with from_flow, to_flow, exchange_id (external_id with prefix).
        """
        from models.cash_flow import CashFlow
        from models.currency import Currency
        import uuid as _uuid
        from datetime import datetime as _dt, date as _date

        # Validate input
        if not trading_account_id or not from_currency_id or not to_currency_id:
            raise ValueError("Missing required fields for exchange creation")
        if from_currency_id == to_currency_id:
            raise ValueError("From and to currencies must be different")
        if from_amount <= 0:
            raise ValueError("From amount must be greater than 0")
        if exchange_rate <= 0:
            raise ValueError("Exchange rate must be greater than 0")
        if fee_amount is None:
            fee_amount = 0.0
        if fee_amount < 0:
            raise ValueError("Fee amount cannot be negative")
        # Normalize date to date object
        if isinstance(date, _dt):
            date_value = date.date()
        elif isinstance(date, _date):
            date_value = date
        else:
            date_value = date

        # Calculate target amount
        to_amount = from_amount * exchange_rate

        # Resolve currencies for usd_rate
        from_currency = db.query(Currency).filter(Currency.id == from_currency_id).first()
        to_currency = db.query(Currency).filter(Currency.id == to_currency_id).first()
        if not from_currency or not to_currency:
            raise ValueError("Currency not found")

        # Create shared external_id
        exchange_uuid = _uuid.uuid4().hex[:12]
        exchange_id = CashFlowService.create_exchange_id(exchange_uuid)

        # Build flows
        from_flow = CashFlow(
            trading_account_id=trading_account_id,
            type=CashFlowService.EXCHANGE_FROM_TYPE,
            amount=-abs(float(from_amount)),
            fee_amount=float(fee_amount or 0.0),
            currency_id=from_currency_id,
            usd_rate=float(from_currency.usd_rate or 1.0),
            date=date_value,
            description=description,
            source=source,
            external_id=exchange_id
        )
        to_flow = CashFlow(
            trading_account_id=trading_account_id,
            type=CashFlowService.EXCHANGE_TO_TYPE,
            amount=float(to_amount),
            fee_amount=0.0,
            currency_id=to_currency_id,
            usd_rate=float(to_currency.usd_rate or 1.0),
            date=date_value,
            description=description,
            source=source,
            external_id=exchange_id
        )

        db.add(from_flow)
        db.add(to_flow)
        db.commit()
        db.refresh(from_flow)
        db.refresh(to_flow)

        return {
            "exchange_id": exchange_id,
            "from_flow": from_flow,
            "to_flow": to_flow
        }

    @staticmethod
    def _safe_number(value: Any) -> Optional[float]:
        """Convert Decimal/str to float safely"""
        if value is None:
            return None
        if isinstance(value, (int, float)):
            return float(value)
        if isinstance(value, Decimal):
            return float(value)
        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _cash_flow_payload(flow: Union[CashFlow, Dict[str, Any]]) -> Dict[str, Any]:
        """
        Normalize a cash flow model/dict into a plain dict with currency/account metadata.
        """
        if isinstance(flow, dict):
            payload = dict(flow)
        elif isinstance(flow, CashFlow):
            payload = flow.to_dict()
            account = getattr(flow, 'account', None)
            currency = getattr(flow, 'currency', None)
            if account:
                payload.setdefault('account_name', getattr(account, 'name', None))
                payload['account_currency_id'] = getattr(account, 'currency_id', None)
                account_currency = getattr(account, 'currency', None)
                payload['account_currency_symbol'] = getattr(account_currency, 'symbol', None)
                payload['account_currency_name'] = getattr(account_currency, 'name', None)
            if currency:
                payload['currency_symbol'] = getattr(currency, 'symbol', payload.get('currency_symbol'))
                payload['currency_name'] = getattr(currency, 'name', payload.get('currency_name'))
        else:
            payload = {}

        # Fallback for account currency metadata if missing
        if payload.get('account_currency_symbol') is None:
            currency_obj = payload.get('account', {})
            if isinstance(currency_obj, dict):
                payload['account_currency_symbol'] = currency_obj.get('currency_symbol') or currency_obj.get('symbol')
                payload['account_currency_id'] = currency_obj.get('currency_id')
                payload['account_currency_name'] = currency_obj.get('currency_name')

        return payload

    @staticmethod
    def build_exchange_pair_summary(
        from_flow: Union[CashFlow, Dict[str, Any], None],
        to_flow: Union[CashFlow, Dict[str, Any], None]
    ) -> Optional[Dict[str, Any]]:
        """
        Build a structured summary for a currency exchange pair (from/to flows).
        """
        if not from_flow or not to_flow:
            return None

        from_payload = CashFlowService._cash_flow_payload(from_flow)
        to_payload = CashFlowService._cash_flow_payload(to_flow)
        from_payload['type'] = CashFlowService.normalize_exchange_type(from_payload.get('type'))
        to_payload['type'] = CashFlowService.normalize_exchange_type(to_payload.get('type'))

        from_amount = CashFlowService._safe_number(from_payload.get('amount'))
        to_amount = CashFlowService._safe_number(to_payload.get('amount'))
        fee_amount = CashFlowService._safe_number(from_payload.get('fee_amount')) or 0.0

        if from_amount is None or to_amount is None:
            return None

        absolute_from = abs(from_amount)
        exchange_rate = None
        if from_amount not in (0, None):
            try:
                exchange_rate = abs(to_amount / from_amount) if from_amount != 0 else None
            except ZeroDivisionError:
                exchange_rate = None

        summary = {
            "group_id": from_payload.get('external_id') or to_payload.get('external_id'),
            "exchange_rate": exchange_rate,
            "fee_amount": fee_amount,
            "fee_currency_id": from_payload.get('account_currency_id'),
            "fee_currency_symbol": from_payload.get('account_currency_symbol'),
            "fee_currency_name": from_payload.get('account_currency_name'),
            "net_out_account_currency": absolute_from + (fee_amount or 0),
            "net_in_target_currency": to_amount,
            "from": {
                "id": from_payload.get('id'),
                "currency_id": from_payload.get('currency_id'),
                "currency_symbol": from_payload.get('currency_symbol'),
                "currency_name": from_payload.get('currency_name'),
                "amount": absolute_from,
                "raw_amount": from_amount,
                "type": from_payload.get('type'),
                "date": from_payload.get('date'),
                "fee_amount": fee_amount
            },
            "to": {
                "id": to_payload.get('id'),
                "currency_id": to_payload.get('currency_id'),
                "currency_symbol": to_payload.get('currency_symbol'),
                "currency_name": to_payload.get('currency_name'),
                "amount": to_amount,
                "raw_amount": to_amount,
                "type": to_payload.get('type'),
                "date": to_payload.get('date')
            }
        }

        return summary

