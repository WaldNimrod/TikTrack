"""
User Tickers Routes — GET/POST/DELETE /me/tickers
Task: 20.UT.2, 20.UT.3, 20.UT.4
Source: TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF

Auth + tenant. List, add (existing or create new + live data check), remove.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Path, Query, status
import logging

from ..core.database import get_db
from ..models.identity import User
from ..utils.dependencies import get_current_user
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..schemas.tickers import TickerResponse, TickerListResponse
from ..services.user_tickers_service import get_user_tickers_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/me", tags=["me-tickers"])


@router.get("/tickers", response_model=TickerListResponse)
async def get_my_tickers(
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    """
    List tickers for the current user ("הטיקרים שלי").
    Auth + tenant filtering.
    """
    try:
        service = get_user_tickers_service()
        tickers = await service.get_my_tickers(db=db, user_id=current_user.id)
        return TickerListResponse(data=tickers, total=len(tickers))
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error("Get my tickers failed: %s", e, exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch tickers",
            error_code=ErrorCodes.SERVER_ERROR,
        )


@router.post("/tickers", response_model=TickerResponse, status_code=status.HTTP_201_CREATED)
async def add_my_ticker(
    ticker_id: Optional[str] = Query(None, description="Existing ticker ULID (add to list)"),
    symbol: Optional[str] = Query(None, description="Symbol for new ticker (creates + adds)"),
    company_name: Optional[str] = Query(None),
    ticker_type: str = Query("STOCK", description="Ticker type for new ticker"),
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    """
    Add ticker to user's list.
    - ticker_id: add existing system ticker.
    - symbol (no ticker_id): create new system ticker + add. Requires live data check (Yahoo→Alpha).
      If provider returns no data → 422, ticker not created.
    New tickers get status=pending (SSOT).
    """
    if not ticker_id and not symbol:
        raise HTTPExceptionWithCode(
            status_code=400,
            detail="Provide ticker_id (add existing) or symbol (create new)",
            error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
        )
    if ticker_id and symbol:
        raise HTTPExceptionWithCode(
            status_code=400,
            detail="Provide either ticker_id or symbol, not both",
            error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
        )
    try:
        service = get_user_tickers_service()
        return await service.add_ticker(
            db=db,
            user_id=current_user.id,
            ticker_id=ticker_id,
            symbol=symbol,
            company_name=company_name,
            ticker_type=ticker_type,
        )
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error("Add my ticker failed: %s", e, exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add ticker",
            error_code=ErrorCodes.SERVER_ERROR,
        )


@router.delete("/tickers/{ticker_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_my_ticker(
    ticker_id: str = Path(..., description="Ticker ULID to remove from list"),
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    """
    Remove ticker from user's list (soft delete in user_tickers).
    """
    try:
        service = get_user_tickers_service()
        await service.remove_ticker(db=db, user_id=current_user.id, ticker_id=ticker_id)
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error("Remove my ticker failed: %s", e, exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove ticker",
            error_code=ErrorCodes.SERVER_ERROR,
        )
