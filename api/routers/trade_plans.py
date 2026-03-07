"""
Trade Plans Router - Minimal list for entity loader
TEAM_10_PHASE_C_CARRYOVER — dynamic entity loader dependency
"""

import logging
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..utils.dependencies import get_current_user
from ..models.identity import User
from ..services.trade_plans_service import list_trade_plans_for_entity_loader
from ..schemas.trade_plans import TradePlanListResponse

router = APIRouter(prefix="/trade_plans", tags=["trade_plans"])
logger = logging.getLogger(__name__)


@router.get("", response_model=TradePlanListResponse)
async def list_trade_plans(
    limit: int = Query(500, ge=1, le=1000, description="Max items for entity loader"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List trade plans for entity option loader (D34 alerts target_id, D35 notes parent_id).
    Returns minimal { id, label, symbol } per item. id is ULID (external).
    Contract: always 200 with { data, total } — never 500 (table may not exist).
    """
    try:
        return await list_trade_plans_for_entity_loader(db=db, user_id=current_user.id, limit=limit)
    except Exception as e:
        logger.warning("GET /trade_plans failed (returning empty): %s", e)
        return TradePlanListResponse(data=[], total=0)
