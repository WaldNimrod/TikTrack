"""
Tickers Routes - API Endpoints
Task: Management - Tickers CRUD

FastAPI routes for tickers API (market_data.tickers).
"""

import asyncio
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
    TickerDataIntegrityResponse,
    HistoryBackfillResponse,
)
from ..services.history_backfill_service import run_history_backfill

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


@router.get("/{ticker_id}/data-integrity", response_model=TickerDataIntegrityResponse)
async def get_ticker_data_integrity(
    ticker_id: str = Path(..., description="Ticker ULID"),
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    """Get ticker data integrity report — EOD, intraday, history + last updates."""
    try:
        service = get_tickers_service()
        return await service.get_ticker_data_integrity(db=db, ticker_id=ticker_id)
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error fetching ticker data integrity: {e}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch ticker data integrity",
            error_code=ErrorCodes.SERVER_ERROR,
        )


@router.post(
    "/{ticker_id}/history-backfill",
    response_model=HistoryBackfillResponse,
    status_code=status.HTTP_200_OK,
)
async def post_ticker_history_backfill(
    ticker_id: str = Path(..., description="Ticker ULID"),
    current_user: User = Depends(get_current_user),
):
    """
    Trigger history backfill for a ticker (250d OHLCV).
    Idempotent, Single-Flight. Returns 200 (completed/no_op), 404, 409, 502.
    """
    try:
        result = await asyncio.wait_for(
            run_history_backfill(ticker_id),
            timeout=90.0,
        )
        return HistoryBackfillResponse(**result)
    except ValueError as e:
        msg = str(e)
        if msg == "not_found":
            raise HTTPExceptionWithCode(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticker not found",
                error_code=ErrorCodes.USER_NOT_FOUND,
            )
        if msg == "locked":
            raise HTTPExceptionWithCode(
                status_code=status.HTTP_409_CONFLICT,
                detail="Another history backfill is already running (Single-Flight)",
                error_code=ErrorCodes.SERVER_ERROR,
            )
        if msg == "provider_error":
            raise HTTPExceptionWithCode(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Provider error — Yahoo/Alpha failed to return history",
                error_code=ErrorCodes.SERVER_ERROR,
            )
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg,
            error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
        )
    except asyncio.TimeoutError:
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="History backfill timeout (90s)",
            error_code=ErrorCodes.SERVER_ERROR,
        )
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"History backfill failed for {ticker_id}: {e}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="History backfill failed",
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
