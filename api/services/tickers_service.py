"""
Tickers Service - Business Logic
Task: Management - Tickers CRUD

Business logic for Tickers API (market_data.tickers).
Includes latest price and daily change from ticker_prices.
"""

import uuid
from decimal import Decimal
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, cast, String
import logging

from ..models.tickers import Ticker
from ..models.ticker_prices import TickerPrice
from ..utils.identity import uuid_to_ulid, ulid_to_uuid
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..schemas.tickers import TickerResponse

logger = logging.getLogger(__name__)


def _ticker_to_response(t: Ticker, price_data: Optional[Dict[str, Any]] = None) -> TickerResponse:
    current_price = None
    daily_change_pct = None
    if price_data:
        current_price = price_data.get("current_price")
        daily_change_pct = price_data.get("daily_change_pct")
    return TickerResponse(
        id=uuid_to_ulid(t.id),
        symbol=t.symbol,
        company_name=t.company_name,
        ticker_type=t.ticker_type,
        is_active=t.is_active,
        delisted_date=t.delisted_date,
        created_at=t.created_at,
        updated_at=t.updated_at,
        current_price=current_price,
        daily_change_pct=daily_change_pct,
    )


class TickersService:
    """Tickers CRUD service."""

    async def get_tickers(
        self,
        db: AsyncSession,
        search: Optional[str] = None,
        ticker_type: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> List[TickerResponse]:
        stmt = select(Ticker).where(Ticker.deleted_at.is_(None))
        if search:
            stmt = stmt.where(
                or_(
                    Ticker.symbol.ilike(f"%{search}%"),
                    func.coalesce(cast(Ticker.company_name, String), "").ilike(f"%{search}%"),
                )
            )
        if ticker_type:
            stmt = stmt.where(Ticker.ticker_type == ticker_type.upper())
        if is_active is not None:
            stmt = stmt.where(Ticker.is_active == is_active)
        stmt = stmt.order_by(Ticker.symbol.asc())
        result = await db.execute(stmt)
        rows = result.scalars().all()
        ticker_ids = [r.id for r in rows]

        price_map: Dict[uuid.UUID, Dict[str, Any]] = {}
        if ticker_ids:
            latest_subq = select(
                TickerPrice.ticker_id,
                func.max(TickerPrice.price_timestamp).label("max_ts"),
            ).where(TickerPrice.ticker_id.in_(ticker_ids)).group_by(TickerPrice.ticker_id).subquery()
            price_stmt = select(
                TickerPrice.ticker_id,
                TickerPrice.price.label("price"),
                TickerPrice.open_price,
                TickerPrice.close_price,
            ).join(
                latest_subq,
                and_(
                    TickerPrice.ticker_id == latest_subq.c.ticker_id,
                    TickerPrice.price_timestamp == latest_subq.c.max_ts,
                ),
            )
            price_result = await db.execute(price_stmt)
            for row in price_result.all():
                price_val = row.price or Decimal("0")
                prev = row.open_price or row.close_price or price_val
                daily_pct = (
                    ((price_val - prev) / prev * 100) if prev and prev > 0 else None
                )
                price_map[row.ticker_id] = {
                    "current_price": price_val,
                    "daily_change_pct": daily_pct,
                }

        return [
            _ticker_to_response(r, price_map.get(r.id))
            for r in rows
        ]

    async def get_ticker_by_id(
        self, db: AsyncSession, ticker_id: str
    ) -> Optional[TickerResponse]:
        try:
            ticker_uuid = ulid_to_uuid(ticker_id)
        except Exception:
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="Invalid ticker ID format",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
            )
        stmt = select(Ticker).where(
            and_(Ticker.id == ticker_uuid, Ticker.deleted_at.is_(None))
        )
        result = await db.execute(stmt)
        row = result.scalar_one_or_none()
        if not row:
            raise HTTPExceptionWithCode(
                status_code=404,
                detail="Ticker not found",
                error_code=ErrorCodes.RESOURCE_NOT_FOUND,
            )
        price_map = {}
        latest_subq = select(
            TickerPrice.ticker_id,
            func.max(TickerPrice.price_timestamp).label("max_ts"),
        ).where(TickerPrice.ticker_id == ticker_uuid).group_by(TickerPrice.ticker_id).subquery()
        price_stmt = select(
            TickerPrice.price.label("price"),
            TickerPrice.open_price,
            TickerPrice.close_price,
        ).join(
            latest_subq,
            and_(
                TickerPrice.ticker_id == latest_subq.c.ticker_id,
                TickerPrice.price_timestamp == latest_subq.c.max_ts,
            ),
        )
        price_row = (await db.execute(price_stmt)).first()
        if price_row:
            price_val = price_row.price or Decimal("0")
            prev = price_row.open_price or price_row.close_price or price_val
            daily_pct = ((price_val - prev) / prev * 100) if prev and prev > 0 else None
            price_map[row.id] = {"current_price": price_val, "daily_change_pct": daily_pct}
        return _ticker_to_response(row, price_map.get(row.id))

    async def create_ticker(
        self, db: AsyncSession, symbol: str, company_name: Optional[str], ticker_type: str, is_active: bool
    ) -> TickerResponse:
        # Check symbol uniqueness
        stmt = select(Ticker).where(
            and_(
                Ticker.symbol == symbol.upper(),
                Ticker.deleted_at.is_(None),
            )
        )
        existing = await db.execute(stmt)
        if existing.scalar_one_or_none():
            raise HTTPExceptionWithCode(
                status_code=409,
                detail=f"Ticker symbol '{symbol}' already exists",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
            )
        ticker = Ticker(
            symbol=symbol.upper(),
            company_name=company_name or None,
            ticker_type=ticker_type.upper(),
            is_active=is_active,
        )
        db.add(ticker)
        await db.commit()
        await db.refresh(ticker)
        return _ticker_to_response(ticker)

    async def update_ticker(
        self,
        db: AsyncSession,
        ticker_id: str,
        symbol: Optional[str] = None,
        company_name: Optional[str] = None,
        ticker_type: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> TickerResponse:
        try:
            ticker_uuid = ulid_to_uuid(ticker_id)
        except Exception:
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="Invalid ticker ID format",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
            )
        stmt = select(Ticker).where(
            and_(Ticker.id == ticker_uuid, Ticker.deleted_at.is_(None))
        )
        result = await db.execute(stmt)
        ticker = result.scalar_one_or_none()
        if not ticker:
            raise HTTPExceptionWithCode(
                status_code=404,
                detail="Ticker not found",
                error_code=ErrorCodes.RESOURCE_NOT_FOUND,
            )
        if symbol is not None:
            ticker.symbol = symbol.upper()
        if company_name is not None:
            ticker.company_name = company_name or None
        if ticker_type is not None:
            ticker.ticker_type = ticker_type.upper()
        if is_active is not None:
            ticker.is_active = is_active
        await db.commit()
        await db.refresh(ticker)
        return _ticker_to_response(ticker)

    async def delete_ticker(self, db: AsyncSession, ticker_id: str) -> None:
        try:
            ticker_uuid = ulid_to_uuid(ticker_id)
        except Exception:
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="Invalid ticker ID format",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
            )
        stmt = select(Ticker).where(
            and_(Ticker.id == ticker_uuid, Ticker.deleted_at.is_(None))
        )
        result = await db.execute(stmt)
        ticker = result.scalar_one_or_none()
        if not ticker:
            raise HTTPExceptionWithCode(
                status_code=404,
                detail="Ticker not found",
                error_code=ErrorCodes.RESOURCE_NOT_FOUND,
            )
        ticker.deleted_at = datetime.now(timezone.utc)
        await db.commit()

    async def get_summary(self, db: AsyncSession) -> dict:
        from ..schemas.tickers import TickerSummaryResponse
        total_stmt = select(func.count(Ticker.id)).where(Ticker.deleted_at.is_(None))
        active_stmt = select(func.count(Ticker.id)).where(
            and_(Ticker.deleted_at.is_(None), Ticker.is_active == True)
        )
        total = (await db.execute(total_stmt)).scalar() or 0
        active = (await db.execute(active_stmt)).scalar() or 0
        return {"total_tickers": total, "active_tickers": active}


_tickers_service: Optional[TickersService] = None


def get_tickers_service() -> TickersService:
    global _tickers_service
    if _tickers_service is None:
        _tickers_service = TickersService()
    return _tickers_service
