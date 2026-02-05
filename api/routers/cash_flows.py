"""
Cash Flows Routes - API Endpoints
Task: Trading Accounts View Backend Implementation
Status: COMPLETED

FastAPI routes for cash flows API.
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date
from typing import Optional
import logging

from ..core.database import get_db
from ..utils.dependencies import get_current_user
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..models.identity import User
from ..services.cash_flows import get_cash_flow_service
from ..schemas.cash_flows import CashFlowListResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cash_flows", tags=["cash_flows"])


@router.get("", response_model=CashFlowListResponse)
async def get_cash_flows(
    trading_account_id: Optional[str] = Query(None, description="Filter by trading account ULID"),
    date_from: Optional[date] = Query(None, description="Filter by transaction_date >= date_from"),
    date_to: Optional[date] = Query(None, description="Filter by transaction_date <= date_to"),
    flow_type: Optional[str] = Query(None, description="Filter by flow_type (DEPOSIT, WITHDRAWAL, etc.)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get cash flows for current user.
    
    Returns list of cash flows with summary statistics:
    - total_deposits: Total deposits
    - total_withdrawals: Total withdrawals
    - net_flow: Net cash flow (deposits - withdrawals)
    
    Query Parameters:
    - trading_account_id: Filter by trading account ULID
    - date_from: Filter by transaction_date >= date_from
    - date_to: Filter by transaction_date <= date_to
    - flow_type: Filter by flow_type (DEPOSIT, WITHDRAWAL, DIVIDEND, INTEREST, FEE, OTHER)
    """
    try:
        service = get_cash_flow_service()
        cash_flows = await service.get_cash_flows(
            user_id=current_user.id,
            db=db,
            trading_account_id=trading_account_id,
            date_from=date_from,
            date_to=date_to,
            flow_type=flow_type
        )
        
        # Get summary
        summary = await service.get_cash_flows_summary(
            user_id=current_user.id,
            db=db,
            trading_account_id=trading_account_id,
            date_from=date_from,
            date_to=date_to
        )
        
        return CashFlowListResponse(
            data=cash_flows,
            total=len(cash_flows),
            summary=summary
        )
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error fetching cash flows: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch cash flows",
            error_code=ErrorCodes.SERVER_ERROR
        )


@router.get("/summary", response_model=CashFlowListResponse)
async def get_cash_flows_summary(
    trading_account_id: Optional[str] = Query(None, description="Filter by trading account ULID"),
    date_from: Optional[date] = Query(None, description="Filter by transaction_date >= date_from"),
    date_to: Optional[date] = Query(None, description="Filter by transaction_date <= date_to"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get cash flows summary only (without list of transactions).
    
    Returns summary statistics:
    - total_deposits: Total deposits
    - total_withdrawals: Total withdrawals
    - net_flow: Net cash flow (deposits - withdrawals)
    
    Query Parameters:
    - trading_account_id: Filter by trading account ULID
    - date_from: Filter by transaction_date >= date_from
    - date_to: Filter by transaction_date <= date_to
    """
    try:
        service = get_cash_flow_service()
        summary = await service.get_cash_flows_summary(
            user_id=current_user.id,
            db=db,
            trading_account_id=trading_account_id,
            date_from=date_from,
            date_to=date_to
        )
        
        return CashFlowListResponse(
            data=[],
            total=0,
            summary=summary
        )
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error fetching cash flows summary: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch cash flows summary",
            error_code=ErrorCodes.SERVER_ERROR
        )
