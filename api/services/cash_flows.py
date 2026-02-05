"""
Cash Flows Service - Business Logic
Task: Trading Accounts View Backend Implementation
Status: COMPLETED

Business logic for Cash Flows API.
Calculates summary (total_deposits, total_withdrawals, net_flow).
Extracts subtype and status from metadata JSONB.
"""

import uuid
from datetime import date
from typing import List, Optional
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, case, cast, String
from sqlalchemy.dialects.postgresql import JSONB
import logging

from ..models.cash_flows import CashFlow
from ..models.trading_accounts import TradingAccount
from ..utils.identity import uuid_to_ulid, ulid_to_uuid
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..schemas.cash_flows import CashFlowResponse, CashFlowSummaryResponse

logger = logging.getLogger(__name__)


class CashFlowService:
    """
    Cash Flows Service - Handles cash flow queries and summary calculations.
    
    Features:
    - List cash flows with filters (trading_account_id, date_from, date_to, flow_type)
    - Calculate summary (total_deposits, total_withdrawals, net_flow)
    - Extract subtype and status from metadata JSONB
    - JOIN with trading_accounts for account_name
    """
    
    async def get_cash_flows(
        self,
        user_id: uuid.UUID,
        db: AsyncSession,
        trading_account_id: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        flow_type: Optional[str] = None
    ) -> List[CashFlowResponse]:
        """
        Get cash flows for user with filters.
        
        Args:
            user_id: User UUID
            db: Database session
            trading_account_id: Filter by trading account ULID (optional)
            date_from: Filter by transaction_date >= date_from (optional)
            date_to: Filter by transaction_date <= date_to (optional)
            flow_type: Filter by flow_type (optional)
            
        Returns:
            List of CashFlowResponse
        """
        # Base query
        conditions = [
            CashFlow.user_id == user_id,
            CashFlow.deleted_at.is_(None)
        ]
        
        if trading_account_id:
            try:
                account_uuid = ulid_to_uuid(trading_account_id)
                conditions.append(CashFlow.trading_account_id == account_uuid)
            except Exception as e:
                logger.warning(f"Invalid trading_account_id ULID: {trading_account_id}")
                raise HTTPExceptionWithCode(
                    status_code=400,
                    detail="Invalid trading_account_id format",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
                )
        
        if date_from:
            conditions.append(CashFlow.transaction_date >= date_from)
        
        if date_to:
            conditions.append(CashFlow.transaction_date <= date_to)
        
        if flow_type:
            conditions.append(CashFlow.flow_type == flow_type)
        
        # LEFT JOIN with trading_accounts to get account_name
        # Use LEFT JOIN to handle cases where trading_accounts might not exist
        stmt = select(
            CashFlow,
            TradingAccount.account_name
        ).outerjoin(
            TradingAccount,
            CashFlow.trading_account_id == TradingAccount.id
        ).where(
            and_(*conditions)
        ).order_by(CashFlow.transaction_date.desc())
        
        result = await db.execute(stmt)
        rows = result.all()
        
        # Build response
        responses = []
        for cash_flow, account_name in rows:
            # Extract subtype and status from metadata JSONB
            metadata = cash_flow.flow_metadata or {}
            subtype = metadata.get("subtype")
            status = metadata.get("status")
            
            response = CashFlowResponse(
                external_ulid=uuid_to_ulid(cash_flow.id),
                transaction_date=cash_flow.transaction_date,
                flow_type=cash_flow.flow_type,
                subtype=subtype,
                trading_account_id=uuid_to_ulid(cash_flow.trading_account_id),
                account_name=account_name,
                amount=cash_flow.amount,
                currency=cash_flow.currency,
                status=status,
                description=cash_flow.description
            )
            responses.append(response)
        
        return responses
    
    async def get_cash_flows_summary(
        self,
        user_id: uuid.UUID,
        db: AsyncSession,
        trading_account_id: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None
    ) -> CashFlowSummaryResponse:
        """
        Get cash flows summary (total_deposits, total_withdrawals, net_flow).
        
        Args:
            user_id: User UUID
            db: Database session
            trading_account_id: Filter by trading account ULID (optional)
            date_from: Filter by transaction_date >= date_from (optional)
            date_to: Filter by transaction_date <= date_to (optional)
            
        Returns:
            CashFlowSummaryResponse
        """
        # Base query
        conditions = [
            CashFlow.user_id == user_id,
            CashFlow.deleted_at.is_(None)
        ]
        
        if trading_account_id:
            try:
                account_uuid = ulid_to_uuid(trading_account_id)
                conditions.append(CashFlow.trading_account_id == account_uuid)
            except Exception as e:
                logger.warning(f"Invalid trading_account_id ULID: {trading_account_id}")
                raise HTTPExceptionWithCode(
                    status_code=400,
                    detail="Invalid trading_account_id format",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT
                )
        
        if date_from:
            conditions.append(CashFlow.transaction_date >= date_from)
        
        if date_to:
            conditions.append(CashFlow.transaction_date <= date_to)
        
        # Calculate totals by flow_type
        stmt = select(
            CashFlow.flow_type,
            func.sum(CashFlow.amount).label("total")
        ).where(
            and_(*conditions)
        ).group_by(CashFlow.flow_type)
        
        result = await db.execute(stmt)
        rows = result.all()
        
        # Calculate totals
        total_deposits = Decimal("0")
        total_withdrawals = Decimal("0")
        
        for flow_type, total in rows:
            if flow_type == "DEPOSIT":
                total_deposits = total or Decimal("0")
            elif flow_type == "WITHDRAWAL":
                total_withdrawals = total or Decimal("0")
        
        net_flow = total_deposits - total_withdrawals
        
        return CashFlowSummaryResponse(
            total_deposits=total_deposits,
            total_withdrawals=total_withdrawals,
            net_flow=net_flow
        )


# Singleton instance
_cash_flow_service: Optional[CashFlowService] = None


def get_cash_flow_service() -> CashFlowService:
    """Get global CashFlowService instance."""
    global _cash_flow_service
    if _cash_flow_service is None:
        _cash_flow_service = CashFlowService()
    return _cash_flow_service
