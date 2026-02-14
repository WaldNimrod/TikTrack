"""
User Tickers Service - "הטיקרים שלי"
Task: 20.UT.2, 20.UT.3, 20.UT.4
Source: TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF, TEAM_10_USER_TICKERS_WORK_PLAN

GET /me/tickers, POST /me/tickers (add existing or create new + live data check), DELETE /me/tickers/{ticker_id}.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload
import logging

from ..models.identity import User
from ..models.tickers import Ticker
from ..models.user_tickers import UserTicker
from ..models.ticker_prices import TickerPrice
from ..utils.identity import uuid_to_ulid, ulid_to_uuid
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..schemas.tickers import TickerResponse

logger = logging.getLogger(__name__)

# Per TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT — new ticker from "הטיקרים שלי" = pending
_USER_CREATED_TICKER_STATUS = "pending"


def _ticker_to_response(t: Ticker, price_data: Optional[Dict[str, Any]] = None) -> TickerResponse:
    return TickerResponse(
        id=uuid_to_ulid(t.id),
        symbol=t.symbol,
        company_name=t.company_name,
        ticker_type=t.ticker_type,
        is_active=t.is_active,
        delisted_date=t.delisted_date,
        created_at=t.created_at,
        updated_at=t.updated_at,
        current_price=price_data.get("current_price") if price_data else None,
        daily_change_pct=price_data.get("daily_change_pct") if price_data else None,
    )


async def _live_data_check(symbol: str) -> bool:
    """
    Live data-load check per brief §4.1.
    Attempt Yahoo → Alpha fetch for EOD/last price.
    Returns True if at least one provider returns valid data.
    """
    from ..integrations.market_data.providers.yahoo_provider import YahooProvider
    from ..integrations.market_data.providers.alpha_provider import AlphaProvider

    for provider_cls in (YahooProvider,):
        try:
            provider = provider_cls(mode="LIVE")
            result = await provider.get_ticker_price(symbol)
            if result and result.price and result.price > 0:
                return True
        except Exception as e:
            logger.warning("Live data check %s failed for %s: %s", provider_cls.__name__, symbol, e)
    try:
        provider = AlphaProvider(mode="LIVE")
        result = await provider.get_ticker_price(symbol)
        if result and result.price and result.price > 0:
            return True
    except Exception as e:
        logger.warning("Live data check AlphaProvider failed for %s: %s", symbol, e)
    return False


class UserTickersService:
    """Service for user's "My Tickers" (הטיקרים שלי)."""

    async def get_my_tickers(
        self, db: AsyncSession, user_id: uuid.UUID
    ) -> List[TickerResponse]:
        """List tickers for the current user (auth + tenant)."""
        stmt = (
            select(Ticker)
            .join(UserTicker, and_(
                UserTicker.ticker_id == Ticker.id,
                UserTicker.user_id == user_id,
                UserTicker.deleted_at.is_(None),
            ))
            .where(Ticker.deleted_at.is_(None))
            .order_by(Ticker.symbol.asc())
        )
        result = await db.execute(stmt)
        tickers = result.scalars().all()
        ticker_ids = [t.id for t in tickers]
        price_map: Dict[uuid.UUID, Dict[str, Any]] = {}
        if ticker_ids:
            from sqlalchemy import func
            latest_subq = (
                select(
                    TickerPrice.ticker_id,
                    func.max(TickerPrice.price_timestamp).label("max_ts"),
                )
                .where(TickerPrice.ticker_id.in_(ticker_ids))
                .group_by(TickerPrice.ticker_id)
            ).subquery()
            price_stmt = select(
                TickerPrice.ticker_id,
                TickerPrice.price,
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
                daily_pct = ((price_val - prev) / prev * 100) if prev and prev > 0 else None
                price_map[row.ticker_id] = {"current_price": price_val, "daily_change_pct": daily_pct}
        return [_ticker_to_response(t, price_map.get(t.id)) for t in tickers]

    async def add_ticker(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        ticker_id: Optional[str] = None,
        symbol: Optional[str] = None,
        company_name: Optional[str] = None,
        ticker_type: str = "STOCK",
    ) -> TickerResponse:
        """
        Add existing ticker or create new system ticker + add.
        Per brief: before creating new ticker — live data-load check (Yahoo→Alpha).
        If fetch fails → 4xx, do not create.
        New ticker status = pending (locked SSOT).
        """
        if ticker_id:
            # Add existing ticker
            try:
                tid = ulid_to_uuid(ticker_id)
            except Exception:
                raise HTTPExceptionWithCode(
                    status_code=400,
                    detail="Invalid ticker ID format",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
                )
            stmt = select(Ticker).where(and_(Ticker.id == tid, Ticker.deleted_at.is_(None)))
            ticker = (await db.execute(stmt)).scalar_one_or_none()
            if not ticker:
                raise HTTPExceptionWithCode(
                    status_code=404,
                    detail="Ticker not found",
                    error_code=ErrorCodes.RESOURCE_NOT_FOUND,
                )
        else:
            # Create new ticker — must have symbol
            if not symbol or not symbol.strip():
                raise HTTPExceptionWithCode(
                    status_code=400,
                    detail="Symbol required for new ticker",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
                )
            symbol = symbol.strip().upper()
            # Live data-load check (per brief §4.1)
            if not await _live_data_check(symbol):
                raise HTTPExceptionWithCode(
                    status_code=422,
                    detail="Provider could not fetch data for this symbol. Ticker not created.",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
                )
            # Check if ticker already exists
            stmt = select(Ticker).where(
                and_(Ticker.symbol == symbol, Ticker.deleted_at.is_(None))
            )
            ticker = (await db.execute(stmt)).scalar_one_or_none()
            if not ticker:
                ticker = Ticker(
                    symbol=symbol,
                    company_name=company_name or None,
                    ticker_type=ticker_type.upper(),
                    is_active=True,
                    status=_USER_CREATED_TICKER_STATUS,
                )
                db.add(ticker)
                await db.flush()
        # Link to user (avoid duplicate)
        existing = await db.execute(
            select(UserTicker).where(
                and_(
                    UserTicker.user_id == user_id,
                    UserTicker.ticker_id == ticker.id,
                    UserTicker.deleted_at.is_(None),
                )
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPExceptionWithCode(
                status_code=409,
                detail="Ticker already in your list",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
            )
        ut = UserTicker(user_id=user_id, ticker_id=ticker.id)
        db.add(ut)
        await db.commit()
        await db.refresh(ticker)
        return _ticker_to_response(ticker)

    async def remove_ticker(
        self, db: AsyncSession, user_id: uuid.UUID, ticker_id: str
    ) -> None:
        """Soft delete: remove ticker from user's list."""
        try:
            tid = ulid_to_uuid(ticker_id)
        except Exception:
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="Invalid ticker ID format",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
            )
        stmt = select(UserTicker).where(
            and_(
                UserTicker.user_id == user_id,
                UserTicker.ticker_id == tid,
                UserTicker.deleted_at.is_(None),
            )
        )
        row = (await db.execute(stmt)).scalar_one_or_none()
        if not row:
            raise HTTPExceptionWithCode(
                status_code=404,
                detail="Ticker not in your list",
                error_code=ErrorCodes.RESOURCE_NOT_FOUND,
            )
        row.deleted_at = datetime.now(timezone.utc)
        await db.commit()


def get_user_tickers_service() -> UserTickersService:
    return UserTickersService()
