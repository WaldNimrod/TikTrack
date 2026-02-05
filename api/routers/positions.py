"""
Positions Routes - API Endpoints
Task: Trading Accounts View Backend Implementation
Status: COMPLETED

FastAPI routes for positions API.
Positions are derived from trades table (aggregated by ticker_id and trading_account_id).
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import logging

from ..core.database import get_db
from ..utils.dependencies import get_current_user
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..models.identity import User
from ..services.positions import get_position_service
from ..schemas.positions import PositionListResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/positions", tags=["positions"])


@router.get("", response_model=PositionListResponse)
async def get_positions(
    trading_account_id: Optional[str] = Query(None, description="Filter by trading account ULID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get positions for current user.
    
    Positions are open trades (status != 'CLOSED') aggregated by ticker_id and trading_account_id.
    
    Returns list of positions with calculated fields:
    - quantity: Total quantity (aggregated)
    - avg_price: Average entry price
    - current_price: Current market price
    - daily_change: Daily price change
    - daily_change_percent: Daily price change percentage
    - market_value: Current market value (quantity * current_price)
    - unrealized_pl: Unrealized P/L
    - unrealized_pl_percent: Unrealized P/L percentage
    - percent_of_account: Percentage of account value
    
    Query Parameters:
    - trading_account_id: Filter by trading account ULID
    """
    try:
        service = get_position_service()
        positions = await service.get_positions(
            user_id=current_user.id,
            db=db,
            trading_account_id=trading_account_id
        )
        
        return PositionListResponse(
            data=positions,
            total=len(positions)
        )
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error fetching positions: {str(e)}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch positions",
            error_code=ErrorCodes.SERVER_ERROR
        )
