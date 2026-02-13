"""
Tickers Routes - API Endpoints
Task: Management - Tickers CRUD

FastAPI routes for tickers API (market_data.tickers).
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, Query, Path, status

from ..core.database import get_db
from ..utils.dependencies import get_current_user
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..models.identity import User
from ..services.tickers_service import get_tickers_service
from ..schemas.tickers import (
    TickerResponse,
    TickerListResponse,
    TickerCreateRequest,
    TickerUpdateRequest,
    TickerSummaryResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tickers", tags=["tickers"])


@router.get("", response_model=TickerListResponse)
async def get_tickers(
    search: Optional[str] = Query(None, description="Search in symbol, company_name"),
    ticker_type: Optional[str] = Query(None, description="Filter by ticker type"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    """Get all tickers (paginated)."""
    try:
        service = get_tickers_service()
        tickers = await service.get_tickers(
            db=db,
            search=search,
            ticker_type=ticker_type,
            is_active=is_active,
        )
        return TickerListResponse(data=tickers, total=len(tickers))
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error fetching tickers: {e}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch tickers",
            error_code=ErrorCodes.SERVER_ERROR,
        )


@router.get("/summary", response_model=TickerSummaryResponse)
async def get_tickers_summary(
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    """Get tickers summary (total, active)."""
    try:
        service = get_tickers_service()
        summary = await service.get_summary(db)
        return TickerSummaryResponse(**summary)
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error fetching tickers summary: {e}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch tickers summary",
            error_code=ErrorCodes.SERVER_ERROR,
        )


@router.get("/{ticker_id}", response_model=TickerResponse)
async def get_ticker(
    ticker_id: str = Path(..., description="Ticker ULID"),
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    """Get single ticker by ID."""
    try:
        service = get_tickers_service()
        return await service.get_ticker_by_id(db=db, ticker_id=ticker_id)
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error fetching ticker: {e}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch ticker",
            error_code=ErrorCodes.SERVER_ERROR,
        )


@router.post("", response_model=TickerResponse, status_code=status.HTTP_201_CREATED)
async def create_ticker(
    payload: TickerCreateRequest,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    """Create a new ticker."""
    try:
        service = get_tickers_service()
        return await service.create_ticker(
            db=db,
            symbol=payload.symbol,
            company_name=payload.company_name,
            ticker_type=payload.ticker_type,
            is_active=payload.is_active,
        )
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error creating ticker: {e}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create ticker",
            error_code=ErrorCodes.SERVER_ERROR,
        )


@router.put("/{ticker_id}", response_model=TickerResponse)
async def update_ticker(
    ticker_id: str = Path(..., description="Ticker ULID"),
    payload: TickerUpdateRequest = ...,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    """Update a ticker."""
    try:
        service = get_tickers_service()
        return await service.update_ticker(
            db=db,
            ticker_id=ticker_id,
            symbol=payload.symbol,
            company_name=payload.company_name,
            ticker_type=payload.ticker_type,
            is_active=payload.is_active,
        )
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error updating ticker: {e}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update ticker",
            error_code=ErrorCodes.SERVER_ERROR,
        )


@router.delete("/{ticker_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticker(
    ticker_id: str = Path(..., description="Ticker ULID"),
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    """Soft-delete a ticker."""
    try:
        service = get_tickers_service()
        await service.delete_ticker(db=db, ticker_id=ticker_id)
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error deleting ticker: {e}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete ticker",
            error_code=ErrorCodes.SERVER_ERROR,
        )
