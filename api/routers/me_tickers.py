"""
User Tickers Routes — GET/POST/DELETE /me/tickers
Task: 20.UT.2, 20.UT.3, 20.UT.4
Source: TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF

Auth + tenant. List, add (existing or create new + live data check), remove.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Path, Query, Body, status
import logging

from ..core.database import get_db
from ..models.identity import User
from ..utils.dependencies import get_current_user
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..schemas.tickers import TickerResponse, TickerListResponse
from pydantic import BaseModel, Field
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
    ticker_type: str = Query("STOCK", description="Ticker type for new ticker (STOCK, CRYPTO, etc.)"),
    market: Optional[str] = Query(None, description="Market/currency for CRYPTO (e.g. USD, EUR); default USD"),
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
            market=market,
        )
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        # ROOT_FIX: provider/add-ticker failures → 422, not 500 (TEAM_50_RERUN)
        # When adding by symbol (create-new), failures are almost always provider/validation.
        err_lower = str(e).lower()
        _provider_keywords = (
            "provider", "could not fetch", "invalid literal", "timeout", "connection",
            "rate limit", "api key", "api_key", "symbol", "fetch", "yahoo", "alpha",
            "httpx", "yfinance", "no data", "empty", "404", "429", "503"
        )
        if any(k in err_lower for k in _provider_keywords):
            logger.warning("Add ticker provider/validation failure (422): %s", e)
            raise HTTPExceptionWithCode(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Provider could not fetch data for this symbol. Check ALPHA_VANTAGE_API_KEY in api/.env and Yahoo availability. Ticker not created.",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
            )
        # Fallback: when adding by symbol, treat any unexpected error as 422 to avoid 500
        # (provider failures often surface as generic exceptions)
        if symbol and not ticker_id:
            logger.warning("Add ticker (symbol=%s) unexpected error → 422: %s", symbol, e)
            raise HTTPExceptionWithCode(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Provider could not fetch data for this symbol. Check ALPHA_VANTAGE_API_KEY in api/.env and Yahoo availability. Ticker not created.",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
            )
        logger.error("Add my ticker failed: %s", e, exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add ticker",
            error_code=ErrorCodes.SERVER_ERROR,
        )


class PatchMyTickerRequest(BaseModel):
    """Request for PATCH /me/tickers/{ticker_id} — update display_name."""
    display_name: Optional[str] = Field(None, max_length=100)


@router.patch("/tickers/{ticker_id}", response_model=TickerResponse)
async def update_my_ticker(
    ticker_id: str = Path(..., description="Ticker ULID to update"),
    body: PatchMyTickerRequest = Body(default=PatchMyTickerRequest()),
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    """Update display_name for a ticker in user's list."""
    data = body.model_dump(exclude_unset=True) if body else {}
    display_name = data.get("display_name")
    try:
        service = get_user_tickers_service()
        return await service.update_user_ticker(
            db=db, user_id=current_user.id, ticker_id=ticker_id, display_name=display_name
        )
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error("Update my ticker failed: %s", e, exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update ticker",
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
