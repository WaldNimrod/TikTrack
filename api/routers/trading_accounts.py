"""
Trading Accounts Routes - API Endpoints
Task: Trading Accounts View Backend Implementation
Status: COMPLETED

FastAPI routes for trading accounts API.
"""

from fastapi import APIRouter, Depends, Query, status, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import logging

from ..core.database import get_db
from ..utils.dependencies import get_current_user
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..utils.identity import ulid_to_uuid
from ..models.identity import User
from ..services.trading_accounts import get_trading_account_service
from ..services.reference_service import is_broker_supported
from ..schemas.trading_accounts import (
    TradingAccountListResponse,
    TradingAccountSummaryResponse,
    TradingAccountResponse,
    TradingAccountCreateRequest,
    TradingAccountUpdateRequest
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/trading_accounts", tags=["trading_accounts"])


def _canonical_status_to_is_active(status_val: Optional[str]) -> Optional[bool]:
    """Map canonical status (TT2_SYSTEM_STATUS_VALUES_SSOT) to is_active for D16.
    active→True; inactive|pending|cancelled→False."""
    if not status_val or not str(status_val).strip():
        return None
    s = str(status_val).strip().lower()
    if s == "active":
        return True
    if s in ("inactive", "pending", "cancelled"):
        return False
    return None


@router.get("", response_model=TradingAccountListResponse)
async def get_trading_accounts(
    status: Optional[str] = Query(None, description="Filter by canonical status: active|inactive|pending|cancelled (TT2_SYSTEM_STATUS_VALUES_SSOT)"),
    search: Optional[str] = Query(None, description="Search by account_name"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get trading accounts for current user.
    
    Returns list of trading accounts with calculated fields:
    - positions_count: Number of open positions
    - total_pl: Total unrealized P/L
    - account_value: Total account value (cash + holdings)
    - holdings_value: Total holdings value
    
    Query Parameters:
    - status: Filter by is_active (true/false)
    - search: Search by account_name (partial match)
    """
    try:
        status_bool = _canonical_status_to_is_active(status)
        service = get_trading_account_service()
        accounts = await service.get_trading_accounts(
            user_id=current_user.id,
            db=db,
            status=status_bool,
            search=search
        )
        
        return TradingAccountListResponse(
            data=accounts,
            total=len(accounts)
        )
    except Exception as e:
        logger.error(f"Error fetching trading accounts: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch trading accounts",
            error_code=ErrorCodes.SERVER_ERROR
        )


@router.get("/summary", response_model=TradingAccountSummaryResponse)
async def get_trading_accounts_summary(
    status: Optional[str] = Query(None, description="Filter by canonical status: active|inactive|pending|cancelled (TT2_SYSTEM_STATUS_VALUES_SSOT)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get trading accounts summary statistics.
    
    Returns summary statistics:
    - total_accounts: Total number of trading accounts
    - active_accounts: Number of active trading accounts
    - total_account_value: Total account value across all accounts
    - total_cash_balance: Total cash balance across all accounts
    - total_holdings_value: Total holdings value across all accounts
    - total_unrealized_pl: Total unrealized P/L across all accounts
    - total_positions: Total number of open positions across all accounts
    
    Query Parameters:
    - status: Filter by is_active (true/false) (optional)
    """
    try:
        status_bool = _canonical_status_to_is_active(status)
        service = get_trading_account_service()
        summary = await service.get_trading_accounts_summary(
            user_id=current_user.id,
            db=db,
            status=status_bool
        )
        return summary
    except Exception as e:
        logger.error(f"Error fetching trading accounts summary: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch trading accounts summary",
            error_code=ErrorCodes.SERVER_ERROR
        )


@router.get("/{id}/api-import-eligible")
async def get_trading_account_api_import_eligible(
    id: str = Path(..., description="Trading account ULID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    ADR-018: Check if trading account is eligible for API setup or import.
    Returns 200 with eligible=true only when broker is_supported.
    Returns 403 when broker is 'other' or custom (is_supported=false).
    """
    try:
        service = get_trading_account_service()
        account = await service.get_trading_account_by_id(
            user_id=current_user.id,
            trading_account_id=id,
            db=db
        )
        broker = account.broker if hasattr(account, 'broker') else getattr(account, 'broker', None)
        eligible = is_broker_supported(broker)
        if not eligible:
            raise HTTPExceptionWithCode(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="API and import are not supported for this broker. Contact us to add support.",
                error_code=ErrorCodes.BROKER_NOT_SUPPORTED_FOR_API_IMPORT
            )
        return {"eligible": True, "account_id": id}
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error checking api-import eligibility: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check eligibility",
            error_code=ErrorCodes.SERVER_ERROR
        )


@router.get("/{id}", response_model=TradingAccountResponse)
async def get_trading_account(
    id: str = Path(..., description="Trading account ULID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get single trading account by ID.
    
    Args:
        id: Trading account ULID
        
    Returns:
        TradingAccountResponse
    """
    try:
        service = get_trading_account_service()
        account = await service.get_trading_account_by_id(
            user_id=current_user.id,
            trading_account_id=id,
            db=db
        )
        return account
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error fetching trading account: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch trading account",
            error_code=ErrorCodes.SERVER_ERROR
        )


@router.post("", response_model=TradingAccountResponse, status_code=status.HTTP_201_CREATED)
async def create_trading_account(
    request: TradingAccountCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create new trading account.
    
    Args:
        request: TradingAccountCreateRequest with account details
        
    Returns:
        TradingAccountResponse
    """
    try:
        service = get_trading_account_service()
        account = await service.create_trading_account(
            user_id=current_user.id,
            db=db,
            account_name=request.account_name,
            initial_balance=request.initial_balance,
            currency=request.currency,
            broker=request.broker,
            account_number=request.account_number,
            is_active=request.is_active,
            external_account_id=request.external_account_id,
            account_metadata=request.account_metadata
        )
        return account
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error creating trading account: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create trading account",
            error_code=ErrorCodes.SERVER_ERROR
        )


@router.put("/{id}", response_model=TradingAccountResponse)
async def update_trading_account(
    id: str = Path(..., description="Trading account ULID"),
    request: TradingAccountUpdateRequest = ...,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update existing trading account.
    
    Args:
        id: Trading account ULID
        request: TradingAccountUpdateRequest with fields to update
        
    Returns:
        TradingAccountResponse
    """
    try:
        service = get_trading_account_service()
        account = await service.update_trading_account(
            user_id=current_user.id,
            trading_account_id=id,
            db=db,
            account_name=request.account_name,
            broker=request.broker,
            account_number=request.account_number,
            initial_balance=request.initial_balance,
            currency=request.currency,
            is_active=request.is_active,
            external_account_id=request.external_account_id,
            account_metadata=request.account_metadata
        )
        return account
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error updating trading account: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update trading account",
            error_code=ErrorCodes.SERVER_ERROR
        )


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trading_account(
    id: str = Path(..., description="Trading account ULID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete trading account (soft delete).
    
    Args:
        id: Trading account ULID
        
    Returns:
        204 No Content
    """
    try:
        service = get_trading_account_service()
        await service.delete_trading_account(
            user_id=current_user.id,
            trading_account_id=id,
            db=db
        )
        return None
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error deleting trading account: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete trading account",
            error_code=ErrorCodes.SERVER_ERROR
        )
