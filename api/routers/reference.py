"""
Reference Data Routes
Task: GET /api/v1/reference/brokers (ADR-013), exchange-rates (MARKET_DATA_PIPE_SPEC)
Status: COMPLETED

Reference/lookup endpoints for forms (brokers, exchange rates, etc.).
"""

import asyncio
import logging
from fastapi import APIRouter, Depends, status

from ..core.database import get_db
from ..utils.dependencies import get_current_user
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..models.identity import User
from ..schemas.reference import (
    BrokerReferenceResponse,
    ExchangeRatesResponse,
    ExchangeRateItem,
)
from ..services.reference_service import get_reference_brokers
from ..services.exchange_rates_service import get_exchange_rates
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reference", tags=["reference"])


@router.get("/brokers", response_model=BrokerReferenceResponse)
async def get_brokers(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get broker list for select dropdowns (D16, D18).
    
    ADR-013: API-based source only. No fallback to manual text input.
    - Primary: user's brokers from trading_accounts.broker
    - Fallback: defaults_brokers.json when user has none
    """
    try:
        items = await get_reference_brokers(current_user.id, db)
        return BrokerReferenceResponse(data=items, total=len(items))
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error fetching reference brokers: {e}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch broker list",
            error_code=ErrorCodes.SERVER_ERROR
        )


@router.get("/exchange-rates", response_model=ExchangeRatesResponse)
async def get_exchange_rates_endpoint(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get exchange rates (FOREX) for currency conversion.
    
    Per MARKET_DATA_PIPE_SPEC + ADR-022 (P3-005):
    - Cache-First: reads only from market_data.exchange_rates (no external API).
    - EOD only: data from Team 60 sync (Alpha/Yahoo). No real-time fetches.
    - Staleness: ok | warning (>15min) | na (>24h) — Visual Warning per ADR-022.
    - Never block UI: timeout 5s.
    """
    try:
        items, staleness = await asyncio.wait_for(
            get_exchange_rates(db),
            timeout=5.0  # Never block UI — 5s max
        )
        return ExchangeRatesResponse(
            data=[ExchangeRateItem(**x) for x in items],
            total=len(items),
            staleness=staleness
        )
    except asyncio.TimeoutError:
        logger.warning("Exchange rates query timeout (5s) — returning empty")
        return ExchangeRatesResponse(data=[], total=0, staleness="na")
    except HTTPExceptionWithCode:
        raise
    except Exception as e:
        logger.error(f"Error fetching exchange rates: {e}", exc_info=True)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch exchange rates",
            error_code=ErrorCodes.SERVER_ERROR
        )
