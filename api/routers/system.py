"""
System Routes — WP_20_03 (ENTITY_TIME_MARKET)
--------------------------------------------
Endpoints for system-level info: market status, etc.
"""

import logging
from fastapi import APIRouter, Depends, status

from ..utils.dependencies import get_current_user
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..models.identity import User
from ..services.market_status_service import get_market_status

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/system", tags=["system"])


@router.get("/market-status")
async def get_market_status_endpoint(
    current_user: User = Depends(get_current_user),
):
    """
    Get US market status (open/closed, pre/post, overnight).
    
    Source: Yahoo Finance v7/quote (SPY). Used by staleness clock + market status color key.
    """
    try:
        market_state, display_label = await get_market_status()
        return {
            "market_state": market_state or "unknown",
            "display_label": display_label,
        }
    except Exception as e:
        logger.error("Market status failed: %s", e)
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch market status",
            error_code=ErrorCodes.SERVER_ERROR
        )
