"""
Reference Data Routes
Task: GET /api/v1/reference/brokers (ADR-013, DATA_MAP_FINAL)
Status: COMPLETED

Reference/lookup endpoints for forms (brokers, etc.).
"""

import logging
from fastapi import APIRouter, Depends, status

from ..core.database import get_db
from ..utils.dependencies import get_current_user
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..models.identity import User
from ..schemas.reference import BrokerReferenceResponse
from ..services.reference_service import get_reference_brokers
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
    - Primary: user's brokers from brokers_fees
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
