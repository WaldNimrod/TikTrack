"""
Trades Router - Minimal list for entity loader
TEAM_10_PHASE_C_CARRYOVER — dynamic entity loader dependency
"""

import logging
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..utils.dependencies import get_current_user
from ..models.identity import User
from ..services.trades_service import list_trades_for_entity_loader
from ..schemas.trades import TradeListResponse

router = APIRouter(prefix="/trades", tags=["trades"])
logger = logging.getLogger(__name__)


@router.get("", response_model=TradeListResponse)
async def list_trades(
    limit: int = Query(500, ge=1, le=1000, description="Max items for entity loader"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List trades for entity option loader (D34 alerts target_id, D35 notes parent_id).
    Returns minimal { id, label, symbol } per item. id is ULID (external).
    """
    try:
        return await list_trades_for_entity_loader(db=db, user_id=current_user.id, limit=limit)
    except Exception as e:
        logger.warning("GET /trades failed (returning empty): %s", e)
        return TradeListResponse(data=[], total=0)
