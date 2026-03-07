"""
Trade Plans Service - Minimal list for entity loader
TEAM_10_PHASE_C_CARRYOVER — GET /trade_plans
"""

import logging
import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from ..utils.identity import uuid_to_ulid
from ..schemas.trade_plans import TradePlanListOption, TradePlanListResponse

logger = logging.getLogger(__name__)


async def list_trade_plans_for_entity_loader(
    db: AsyncSession,
    user_id: uuid.UUID,
    limit: int = 500,
) -> TradePlanListResponse:
    """
    List trade plans for entity option loader (alerts target_id, notes parent_id).
    Returns minimal { id, label, symbol } per item.
    Uses raw SQL to avoid ORM/enum/schema mismatches (trade_plans may not exist or use custom enums).
    """
    try:
        result = await db.execute(
            text("""
                SELECT tp.id, tp.plan_name, t.symbol
                FROM user_data.trade_plans tp
                LEFT JOIN market_data.tickers t ON t.id = tp.ticker_id
                WHERE tp.user_id = :uid AND tp.deleted_at IS NULL
                ORDER BY tp.created_at DESC
                LIMIT :lim
            """),
            {"uid": str(user_id), "lim": limit},
        )
        rows = result.fetchall()
    except Exception as e:
        logger.warning("trade_plans list failed (table may not exist): %s", e)
        return TradePlanListResponse(data=[], total=0)

    items: List[TradePlanListOption] = []
    for row in rows:
        try:
            plan_id, plan_name, symbol = row[0], row[1], row[2]
            sym_str = str(symbol) if symbol is not None else None
            if sym_str and len(sym_str) > 50:
                sym_str = sym_str[:50]
            label = (plan_name or "").strip() if plan_name else ""
            if not label and sym_str:
                label = f"{sym_str} plan"
            if not label:
                label = f"Plan {uuid_to_ulid(plan_id)[:8]}" if plan_id else "Plan"
            items.append(
                TradePlanListOption(
                    id=uuid_to_ulid(plan_id),
                    label=label,
                    symbol=sym_str,
                )
            )
        except Exception as e:
            logger.debug("trade_plans row skip: %s", e)
    return TradePlanListResponse(data=items, total=len(items))
