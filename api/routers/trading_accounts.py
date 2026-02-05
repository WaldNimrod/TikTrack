"""
Trading Accounts Routes - API Endpoints
Task: Trading Accounts View Backend Implementation
Status: COMPLETED

FastAPI routes for trading accounts API.
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import logging

from ..core.database import get_db
from ..utils.dependencies import get_current_user
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..models.identity import User
from ..services.trading_accounts import get_trading_account_service
from ..schemas.trading_accounts import TradingAccountListResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/trading_accounts", tags=["trading_accounts"])


@router.get("", response_model=TradingAccountListResponse)
async def get_trading_accounts(
    status: Optional[bool] = Query(None, description="Filter by is_active status"),
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
        service = get_trading_account_service()
        accounts = await service.get_trading_accounts(
            user_id=current_user.id,
            db=db,
            status=status,
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
