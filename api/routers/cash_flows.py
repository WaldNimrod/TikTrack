"""
Cash Flows Routes - API Endpoints
Task: Trading Accounts View Backend Implementation
Status: COMPLETED

FastAPI routes for cash flows API.
"""

from fastapi import APIRouter, Depends, Query, status, Path
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date
from typing import Optional
import logging

from ..core.database import get_db
from ..utils.dependencies import get_current_user
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..models.identity import User
from ..services.cash_flows import get_cash_flow_service
from ..schemas.cash_flows import (
    CashFlowListResponse,
    CashFlowResponse,
    CashFlowCreateRequest,
    CashFlowUpdateRequest,
    CurrencyConversionListResponse
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cash_flows", tags=["cash_flows"])


@router.get("", response_model=CashFlowListResponse)
async def get_cash_flows(
    trading_account_id: Optional[str] = Query(None, description="Filter by trading account ULID"),
    date_from: Optional[date] = Query(None, description="Filter by transaction_date >= date_from"),
    date_to: Optional[date] = Query(None, description="Filter by transaction_date <= date_to"),
    flow_type: Optional[str] = Query(None, description="Filter by flow_type (DEPOSIT, WITHDRAWAL, etc.)"),
    search: Optional[str] = Query(None, description="Search in description and external_reference"),
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
            flow_type=flow_type,
            search=search
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
    # Ignore pagination parameters (page, page_size) - summary endpoint doesn't use them
    # These are included to prevent 400 errors when Frontend sends them
    page: Optional[int] = Query(None, include_in_schema=False),
    page_size: Optional[int] = Query(None, include_in_schema=False),
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
    - page: Ignored (pagination not applicable to summary)
    - page_size: Ignored (pagination not applicable to summary)
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


@router.get("/currency_conversions", response_model=CurrencyConversionListResponse)
async def get_currency_conversions(
    trading_account_id: Optional[str] = Query(default=None, description="Filter by trading account ULID"),
    date_from: Optional[date] = Query(default=None, description="Filter by transaction_date >= date_from"),
    date_to: Optional[date] = Query(default=None, description="Filter by transaction_date <= date_to"),
    # Ignore pagination parameters (page, page_size) - may be sent by Frontend
    # These are included to prevent 400 errors when Frontend sends them
    page: Optional[int] = Query(default=None, include_in_schema=False),
    page_size: Optional[int] = Query(default=None, include_in_schema=False),
    # Ignore additional parameters that Frontend may send but are not used by this endpoint
    # These are included to prevent 400 errors when Frontend sends invalid/unexpected parameters
    # Using default=None explicitly to handle empty strings gracefully
    date_range: Optional[str] = Query(default=None, include_in_schema=False),
    search: Optional[str] = Query(default=None, include_in_schema=False),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get currency conversions for current user.
    
    Returns list of currency conversion transactions where currency differs from account base currency,
    or transactions explicitly marked as conversions in metadata.
    
    Query Parameters:
    - trading_account_id: Filter by trading account ULID (optional) - if invalid, filter is ignored
    - date_from: Filter by transaction_date >= date_from (optional)
    - date_to: Filter by transaction_date <= date_to (optional)
    - page: Ignored (pagination not implemented for currency conversions)
    - page_size: Ignored (pagination not implemented for currency conversions)
    """
    # Log incoming request parameters for debugging (Team 90 requirement)
    logger.info(
        f"[DEBUG] Currency conversions request - user_id: {current_user.id}, "
        f"trading_account_id: '{trading_account_id}' (type: {type(trading_account_id).__name__}), "
        f"date_from: {date_from}, date_to: {date_to}, "
        f"page: {page}, page_size: {page_size}, "
        f"date_range: '{date_range}', search: '{search}'"
    )
    
    try:
        # Normalize trading_account_id if provided (trim whitespace)
        # Handle None, empty string, or whitespace-only strings as None
        normalized_trading_account_id = None
        if trading_account_id and trading_account_id.strip():
            normalized_trading_account_id = trading_account_id.strip()
        
        service = get_cash_flow_service()
        conversions = await service.get_currency_conversions(
            user_id=current_user.id,
            db=db,
            trading_account_id=normalized_trading_account_id,
            date_from=date_from,
            date_to=date_to
        )
        
        logger.debug(
            f"Currency conversions response - user_id: {current_user.id}, "
            f"count: {len(conversions)}"
        )
        
        return CurrencyConversionListResponse(
            data=conversions,
            total=len(conversions)
        )
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error fetching currency conversions: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch currency conversions",
            error_code=ErrorCodes.SERVER_ERROR
        )


@router.get("/{id}", response_model=CashFlowResponse)
async def get_cash_flow(
    id: str = Path(..., description="Cash flow ULID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get single cash flow by ID.
    
    Args:
        id: Cash flow ULID
        
    Returns:
        CashFlowResponse
    """
    try:
        service = get_cash_flow_service()
        cash_flow = await service.get_cash_flow_by_id(
            user_id=current_user.id,
            cash_flow_id=id,
            db=db
        )
        return cash_flow
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error fetching cash flow: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch cash flow",
            error_code=ErrorCodes.SERVER_ERROR
        )


@router.post("", response_model=CashFlowResponse, status_code=status.HTTP_201_CREATED)
async def create_cash_flow(
    request: CashFlowCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create new cash flow.
    
    Args:
        request: CashFlowCreateRequest with cash flow details
        
    Returns:
        CashFlowResponse
    """
    try:
        service = get_cash_flow_service()
        cash_flow = await service.create_cash_flow(
            user_id=current_user.id,
            db=db,
            trading_account_id=request.trading_account_id,
            flow_type=request.flow_type,
            amount=request.amount,
            currency=request.currency,
            transaction_date=request.transaction_date,
            description=request.description,
            external_reference=request.external_reference,
            metadata=request.metadata
        )
        return cash_flow
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error creating cash flow: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create cash flow",
            error_code=ErrorCodes.SERVER_ERROR
        )


@router.put("/{id}", response_model=CashFlowResponse)
async def update_cash_flow(
    id: str = Path(..., description="Cash flow ULID"),
    request: CashFlowUpdateRequest = ...,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update existing cash flow.
    
    Args:
        id: Cash flow ULID
        request: CashFlowUpdateRequest with fields to update
        
    Returns:
        CashFlowResponse
    """
    try:
        service = get_cash_flow_service()
        cash_flow = await service.update_cash_flow(
            user_id=current_user.id,
            cash_flow_id=id,
            db=db,
            trading_account_id=request.trading_account_id,
            flow_type=request.flow_type,
            amount=request.amount,
            currency=request.currency,
            transaction_date=request.transaction_date,
            description=request.description,
            external_reference=request.external_reference,
            metadata=request.metadata
        )
        return cash_flow
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error updating cash flow: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update cash flow",
            error_code=ErrorCodes.SERVER_ERROR
        )


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cash_flow(
    id: str = Path(..., description="Cash flow ULID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete cash flow (soft delete).
    
    Args:
        id: Cash flow ULID
        
    Returns:
        204 No Content
    """
    try:
        service = get_cash_flow_service()
        await service.delete_cash_flow(
            user_id=current_user.id,
            cash_flow_id=id,
            db=db
        )
        return None
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error deleting cash flow: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete cash flow",
            error_code=ErrorCodes.SERVER_ERROR
        )
