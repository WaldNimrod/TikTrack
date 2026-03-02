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
from sqlalchemy.exc import IntegrityError, ProgrammingError
import logging

from ..models.tickers import Ticker
from ..models.user_tickers import UserTicker
from ..models.ticker_prices import TickerPrice
from ..models.ticker_prices_intraday import TickerPriceIntraday
from ..utils.identity import uuid_to_ulid, ulid_to_uuid
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..schemas.tickers import TickerResponse, TickerDataIntegrityResponse

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
            # Cast enum to string for robust comparison (DB has market_data.ticker_type ENUM)
            stmt = stmt.where(
                func.upper(cast(Ticker.ticker_type, String)) == ticker_type.upper()
            )
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
        from .canonical_ticker_service import create_system_ticker
        from ..core.config import settings
        ticker = await create_system_ticker(
            db=db,
            symbol=symbol,
            ticker_type=ticker_type,
            company_name=company_name,
            skip_live_check=settings.debug,
            status="active",
        )
        if not is_active:
            ticker.is_active = False
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
        """
        Soft-delete system ticker. Per ARCHITECT_DIRECTIVE_G7:
        - Set ticker status='cancelled', deleted_at=now()
        - Cascade: all linked user_tickers → status='cancelled', deleted_at=now()
        """
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
        now = datetime.now(timezone.utc)
        ticker.status = "cancelled"
        ticker.deleted_at = now
        ticker.is_active = False
        # Status cascade: all linked user_tickers → cancelled + deleted_at
        user_ticker_stmt = select(UserTicker).where(
            and_(
                UserTicker.ticker_id == ticker_uuid,
                UserTicker.deleted_at.is_(None),
            )
        )
        ut_result = await db.execute(user_ticker_stmt)
        for ut in ut_result.scalars().all():
            ut.status = "cancelled"
            ut.deleted_at = now
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

    async def get_ticker_data_integrity(
        self, db: AsyncSession, ticker_id: str
    ) -> TickerDataIntegrityResponse:
        """Ticker data integrity report — EOD, intraday, history counts + last updates."""
        from ..schemas.tickers import DataDomainOverview, LastUpdateEntry

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

        MIN_HISTORY_FOR_INDICATORS = 250  # SSOT: 250 ימי מסחר מינימום (MARKET_DATA_PIPE_SPEC)
        STALE_HOURS = 48  # EOD > 48h = stale

        gaps: List[str] = []

        # --- EOD (ticker_prices) ---
        eod_count_stmt = select(func.count(TickerPrice.id)).where(
            TickerPrice.ticker_id == ticker_uuid
        )
        eod_count = (await db.execute(eod_count_stmt)).scalar() or 0

        eod_latest_stmt = (
            select(
                TickerPrice.price_timestamp,
                TickerPrice.fetched_at,
                TickerPrice.price,
                TickerPrice.market_cap,
            )
            .where(TickerPrice.ticker_id == ticker_uuid)
            .order_by(TickerPrice.price_timestamp.desc())
            .limit(1)
        )
        eod_latest = (await db.execute(eod_latest_stmt)).first()

        eod_status = "OK"
        if eod_count == 0:
            eod_status = "NO_DATA"
            gaps.append("אין נתוני EOD (מחיר)")
        elif eod_latest and eod_latest.price_timestamp:
            ts = eod_latest.price_timestamp
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            delta_h = (datetime.now(timezone.utc) - ts).total_seconds() / 3600
            if delta_h > STALE_HOURS:
                eod_status = "STALE"
                gaps.append(f"נתוני EOD ישנים ({int(delta_h)} שעות)")

        eod_overview = DataDomainOverview(
            row_count=eod_count,
            latest_price_timestamp=eod_latest.price_timestamp if eod_latest else None,
            latest_fetched_at=eod_latest.fetched_at if eod_latest else None,
            has_data=eod_count > 0,
            gap_status=eod_status,
        )

        # --- Intraday ---
        intraday_count_stmt = select(func.count(TickerPriceIntraday.id)).where(
            TickerPriceIntraday.ticker_id == ticker_uuid
        )
        intraday_count = (await db.execute(intraday_count_stmt)).scalar() or 0

        intraday_latest_stmt = (
            select(
                TickerPriceIntraday.price_timestamp,
                TickerPriceIntraday.fetched_at,
                TickerPriceIntraday.price,
            )
            .where(TickerPriceIntraday.ticker_id == ticker_uuid)
            .order_by(TickerPriceIntraday.price_timestamp.desc())
            .limit(1)
        )
        intraday_latest = (await db.execute(intraday_latest_stmt)).first()

        intraday_status = "OK" if intraday_count > 0 else "NO_DATA"
        if intraday_count == 0 and ticker.is_active:
            gaps.append("אין נתוני Intraday (פעיל אבל אין עדכונים תוך־יומיים)")

        intraday_note = "Active tickers only" if ticker.is_active else "Inactive — no intraday"
        intraday_overview = DataDomainOverview(
            row_count=intraday_count,
            latest_price_timestamp=intraday_latest.price_timestamp if intraday_latest else None,
            latest_fetched_at=intraday_latest.fetched_at if intraday_latest else None,
            has_data=intraday_count > 0,
            gap_status=intraday_status,
            note=intraday_note,
        )

        # --- History 250d ---
        history_status = "OK" if eod_count >= MIN_HISTORY_FOR_INDICATORS else "INSUFFICIENT"
        if eod_count < MIN_HISTORY_FOR_INDICATORS:
            gaps.append(
                f"היסטוריה 250d: {eod_count} שורות (נדרש {MIN_HISTORY_FOR_INDICATORS} ימים ל־ATR/MA/CCI)"
            )

        history_overview = DataDomainOverview(
            row_count=eod_count,
            latest_price_timestamp=eod_latest.price_timestamp if eod_latest else None,
            latest_fetched_at=eod_latest.fetched_at if eod_latest else None,
            has_data=eod_count > 0,
            gap_status=history_status,
            note=f"נדרש {MIN_HISTORY_FOR_INDICATORS} ימים",
        )

        # --- Last updates (last 5 from ticker_prices) ---
        last_updates_stmt = (
            select(TickerPrice.price_timestamp, TickerPrice.fetched_at, TickerPrice.price)
            .where(TickerPrice.ticker_id == ticker_uuid)
            .order_by(TickerPrice.price_timestamp.desc())
            .limit(5)
        )
        last_rows = (await db.execute(last_updates_stmt)).all()
        last_updates = [
            LastUpdateEntry(
                price_timestamp=r.price_timestamp,
                fetched_at=r.fetched_at,
                price=r.price,
            )
            for r in last_rows
        ]

        # --- Indicators (ATR/MA/CCI) + Market Cap — compute from 250d or fetch from provider ---
        from ..integrations.market_data.cache_first_service import get_ticker_indicators_cache_first
        from ..schemas.tickers import IndicatorsOverview

        indicators_dict = await get_ticker_indicators_cache_first(
            db, ticker.symbol, ticker_uuid, 250, skip_fetch=False, mode="LIVE"
        )
        market_cap = None
        if eod_latest:
            market_cap = getattr(eod_latest, "market_cap", None)

        indicators_overview = IndicatorsOverview(
            atr_14=indicators_dict.get("atr_14"),
            ma_20=indicators_dict.get("ma_20"),
            ma_50=indicators_dict.get("ma_50"),
            ma_150=indicators_dict.get("ma_150"),
            ma_200=indicators_dict.get("ma_200"),
            cci_20=indicators_dict.get("cci_20"),
            market_cap=market_cap,
        )

        return TickerDataIntegrityResponse(
            ticker_id=uuid_to_ulid(ticker.id),
            symbol=ticker.symbol,
            company_name=ticker.company_name,
            eod_prices=eod_overview,
            intraday_prices=intraday_overview,
            history_250d=history_overview,
            indicators=indicators_overview,
            gaps_summary=gaps,
            last_updates=last_updates,
        )


_tickers_service: Optional[TickersService] = None


def get_tickers_service() -> TickersService:
    global _tickers_service
    if _tickers_service is None:
        _tickers_service = TickersService()
    return _tickers_service
