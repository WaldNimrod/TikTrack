"""
Trades Service - Minimal list for entity loader
TEAM_10_PHASE_C_CARRYOVER — GET /trades
"""

import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from ..models.trades import Trade
from ..models.tickers import Ticker
from ..utils.identity import uuid_to_ulid
from ..schemas.trades import TradeListOption, TradeListResponse


async def list_trades_for_entity_loader(
    db: AsyncSession,
    user_id: uuid.UUID,
    limit: int = 500,
) -> TradeListResponse:
    """
    List trades for entity option loader (alerts target_id, notes parent_id).
    Returns minimal { id, label, symbol } per item.
    """
    stmt = (
        select(Trade, Ticker.symbol)
        .outerjoin(Ticker, Trade.ticker_id == Ticker.id)
        .where(
            and_(
                Trade.user_id == user_id,
                Trade.deleted_at.is_(None),
            )
        )
        .order_by(Trade.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    rows = result.all()

    items: List[TradeListOption] = []
    for trade, symbol in rows:
        label_parts = []
        if symbol:
            label_parts.append(symbol)
        label_parts.append(str(trade.direction or ""))
        if trade.quantity:
            label_parts.append(str(trade.quantity))
        label = " ".join(filter(None, label_parts)).strip() or f"Trade {uuid_to_ulid(trade.id)[:8]}"
        items.append(
            TradeListOption(
                id=uuid_to_ulid(trade.id),
                label=label,
                symbol=symbol,
            )
        )
    return TradeListResponse(data=items, total=len(items))
