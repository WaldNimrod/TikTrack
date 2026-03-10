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


# T190-Price: EOD stale threshold (hours) — beyond this, fallback to intraday
EOD_STALE_HOURS = 48


async def _get_price_with_fallback(
    db: AsyncSession,
    ticker_ids: List[uuid.UUID],
    active_ticker_ids: Optional[set] = None,
) -> Dict[uuid.UUID, Dict[str, Any]]:
    """
    T190-Price PHASE_1: Always preserve EOD; no null regression when stale.
    - EOD fresh → price_source=EOD
    - EOD stale + no intraday → price_source=EOD_STALE (keep EOD value, never null)
    - EOD stale + intraday (active) → price_source=INTRADAY_FALLBACK (override)
    - No EOD + intraday (active) → price_source=INTRADAY_FALLBACK
    Returns map: ticker_id -> {current_price, daily_change_pct, price_source, price_as_of_utc}.
    """
    now = datetime.now(timezone.utc)
    stale_cutoff = now.timestamp() - (EOD_STALE_HOURS * 3600)
    out: Dict[uuid.UUID, Dict[str, Any]] = {}

    # 1. EOD latest per ticker — ALWAYS preserve (no null when EOD exists)
    latest_eod = select(
        TickerPrice.ticker_id,
        func.max(TickerPrice.price_timestamp).label("max_ts"),
    ).where(TickerPrice.ticker_id.in_(ticker_ids)).group_by(TickerPrice.ticker_id).subquery()
    eod_stmt = select(
        TickerPrice.ticker_id,
        TickerPrice.price,
        TickerPrice.open_price,
        TickerPrice.close_price,
        TickerPrice.price_timestamp,
    ).join(
        latest_eod,
        and_(
            TickerPrice.ticker_id == latest_eod.c.ticker_id,
            TickerPrice.price_timestamp == latest_eod.c.max_ts,
        ),
    )
    eod_rows = (await db.execute(eod_stmt)).all()

    stale_for_intraday: List[uuid.UUID] = []
    for row in eod_rows:
        tid, price, open_p, close_p, ts = (
            row.ticker_id, row.price, row.open_price, row.close_price, row.price_timestamp
        )
        price_val = price or Decimal("0")
        prev = open_p or close_p or price_val
        daily_pct = ((price_val - prev) / prev * 100) if prev and prev > 0 else None
        ts_utc = ts.replace(tzinfo=timezone.utc) if ts and ts.tzinfo is None else ts
        is_stale = ts_utc is not None and ts_utc.timestamp() < stale_cutoff

        # PHASE_1: Always add EOD to out (preserve — no null regression)
        # PHASE_2: last_close from EOD (close_price or price)
        last_close = close_p or price_val
        out[tid] = {
            "current_price": price_val,
            "daily_change_pct": daily_pct,
            "price_source": "EOD_STALE" if is_stale else "EOD",
            "price_as_of_utc": ts_utc,
            "last_close_price": last_close,
            "last_close_as_of_utc": ts_utc,
        }
        if is_stale:
            stale_for_intraday.append(tid)

    missing_eod = [tid for tid in ticker_ids if tid not in out]

    # 2. Intraday override for stale EOD (active only) or missing EOD (active only)
    ids_to_try: List[uuid.UUID] = []
    if active_ticker_ids is None:
        ids_to_try = stale_for_intraday + missing_eod
    else:
        active_set = active_ticker_ids or set()
        ids_to_try = [t for t in stale_for_intraday + missing_eod if t in active_set]

    if ids_to_try:
        latest_intra = select(
            TickerPriceIntraday.ticker_id,
            func.max(TickerPriceIntraday.price_timestamp).label("max_ts"),
        ).where(TickerPriceIntraday.ticker_id.in_(ids_to_try)).group_by(
            TickerPriceIntraday.ticker_id
        ).subquery()
        intra_stmt = select(
            TickerPriceIntraday.ticker_id,
            TickerPriceIntraday.price,
            TickerPriceIntraday.open_price,
            TickerPriceIntraday.close_price,
            TickerPriceIntraday.price_timestamp,
        ).join(
            latest_intra,
            and_(
                TickerPriceIntraday.ticker_id == latest_intra.c.ticker_id,
                TickerPriceIntraday.price_timestamp == latest_intra.c.max_ts,
            ),
        )
        intra_rows = (await db.execute(intra_stmt)).all()
        for row in intra_rows:
            tid, price, open_p, close_p, ts = (
                row.ticker_id, row.price, row.open_price, row.close_price, row.price_timestamp
            )
            price_val = price or Decimal("0")
            prev = open_p or close_p or price_val
            daily_pct = ((price_val - prev) / prev * 100) if prev and prev > 0 else None
            ts_utc = ts.replace(tzinfo=timezone.utc) if ts and ts.tzinfo is None else ts
            # Override: stale EOD or add if missing EOD (preserve last_close when from EOD)
            prev_entry = out.get(tid, {})
            out[tid] = {
                "current_price": price_val,
                "daily_change_pct": daily_pct,
                "price_source": "INTRADAY_FALLBACK",
                "price_as_of_utc": ts_utc,
                "last_close_price": prev_entry.get("last_close_price"),
                "last_close_as_of_utc": prev_entry.get("last_close_as_of_utc"),
            }
    return out


def _ticker_to_response(
    t: Ticker,
    price_data: Optional[Dict[str, Any]] = None,
    price_source: Optional[str] = None,
    price_as_of_utc: Optional[datetime] = None,
    last_close_price: Optional[Decimal] = None,
    last_close_as_of_utc: Optional[datetime] = None,
) -> TickerResponse:
    current_price = None
    daily_change_pct = None
    if price_data:
        current_price = price_data.get("current_price")
        daily_change_pct = price_data.get("daily_change_pct")
        if last_close_price is None:
            last_close_price = price_data.get("last_close_price")
        if last_close_as_of_utc is None:
            last_close_as_of_utc = price_data.get("last_close_as_of_utc")
    return TickerResponse(
        id=uuid_to_ulid(t.id),
        symbol=t.symbol,
        company_name=t.company_name,
        ticker_type=t.ticker_type,
        status=t.status or "active",
        is_active=t.is_active,
        delisted_date=t.delisted_date,
        created_at=t.created_at,
        updated_at=t.updated_at,
        current_price=current_price,
        daily_change_pct=daily_change_pct,
        price_source=price_source,
        price_as_of_utc=price_as_of_utc,
        last_close_price=last_close_price,
        last_close_as_of_utc=last_close_as_of_utc,
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
        active_ids = {r.id for r in rows if r.is_active} if rows else None

        price_map: Dict[uuid.UUID, Dict[str, Any]] = {}
        if ticker_ids:
            price_map = await _get_price_with_fallback(db, ticker_ids, active_ids)

        return [
            _ticker_to_response(
                r,
                price_map.get(r.id),
                price_source=price_map.get(r.id, {}).get("price_source"),
                price_as_of_utc=price_map.get(r.id, {}).get("price_as_of_utc"),
            )
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
        active_ids = {row.id} if row.is_active else set()
        price_map = await _get_price_with_fallback(db, [row.id], active_ticker_ids=active_ids)
        pd = price_map.get(row.id) or {}
        return _ticker_to_response(
            row,
            pd,
            price_source=pd.get("price_source"),
            price_as_of_utc=pd.get("price_as_of_utc"),
        )

    async def create_ticker(
        self, db: AsyncSession, symbol: str, company_name: Optional[str], ticker_type: str, is_active: bool
    ) -> TickerResponse:
        from .canonical_ticker_service import create_system_ticker
        # TEAM_50: single path — live validation runs by default (run_live_symbol_validation + skip_live_check=False).
        ticker = await create_system_ticker(
            db=db,
            symbol=symbol,
            ticker_type=ticker_type,
            company_name=company_name,
            skip_live_check=False,
            status="active",
            market=None,
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
        status: Optional[str] = None,
        is_active: Optional[bool] = None,
        exchange_id: Optional[str] = None,
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
        # TEAM_50: validate with providers when symbol or ticker_type or exchange_id changes (same as create path).
        new_sym = symbol.strip().upper() if symbol else None
        new_ticker_type = ticker_type.upper() if ticker_type else None
        exchange_uuid: Optional[uuid.UUID] = None
        if exchange_id is not None:
            try:
                exchange_uuid = ulid_to_uuid(exchange_id)
            except Exception:
                raise HTTPExceptionWithCode(
                    status_code=400,
                    detail="Invalid exchange_id format",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
                )
        symbol_changed = new_sym is not None and new_sym != (ticker.symbol or "").strip().upper()
        ticker_type_changed = new_ticker_type is not None and new_ticker_type != (ticker.ticker_type or "").upper()
        exchange_changed = exchange_uuid is not None and exchange_uuid != ticker.exchange_id
        if symbol_changed or ticker_type_changed or exchange_changed:
            from .canonical_ticker_service import validate_ticker_with_providers
            sym_to_validate = new_sym if new_sym else (ticker.symbol or "").strip().upper()
            type_to_validate = new_ticker_type if new_ticker_type else (ticker.ticker_type or "STOCK").upper()
            await validate_ticker_with_providers(sym_to_validate, ticker_type=type_to_validate, market=None)

        # BF-G7-009: Duplicate symbol check (API-level, DB enforces via uix_tickers_symbol_exchange_active)
        exchange_for_dup = exchange_uuid if exchange_uuid is not None else ticker.exchange_id
        if symbol is not None:
            new_sym = symbol.strip().upper()
            dup_stmt = select(Ticker).where(
                and_(
                    Ticker.symbol == new_sym,
                    (Ticker.exchange_id == exchange_for_dup) if exchange_for_dup is not None else Ticker.exchange_id.is_(None),
                    Ticker.deleted_at.is_(None),
                    Ticker.id != ticker_uuid,
                )
            )
            dup = (await db.execute(dup_stmt)).scalar_one_or_none()
            if dup:
                raise HTTPExceptionWithCode(
                    status_code=409,
                    detail=f"Symbol '{new_sym}' already exists for this exchange",
                    error_code=ErrorCodes.TICKER_SYMBOL_DUPLICATE,
                )
            ticker.symbol = new_sym
        if exchange_uuid is not None:
            ticker.exchange_id = exchange_uuid
        if company_name is not None:
            ticker.company_name = company_name or None
        if ticker_type is not None:
            ticker.ticker_type = ticker_type.upper()
        if status is not None:
            ticker.status = status
        # WP003 FIX-4: Eligibility gate — validate when transitioning is_active false → true
        if is_active is not None:
            if is_active is True and (ticker.is_active is False or ticker.is_active is None):
                from .canonical_ticker_service import validate_ticker_with_providers
                await validate_ticker_with_providers(
                    ticker.symbol,
                    ticker_type=ticker.ticker_type or "STOCK",
                    market=None,
                )
            ticker.is_active = is_active
        try:
            await db.commit()
            await db.refresh(ticker)
        except IntegrityError as e:
            await db.rollback()
            err = str(e.orig) if hasattr(e, "orig") else str(e)
            if "unique" in err.lower() or "symbol" in err.lower():
                raise HTTPExceptionWithCode(
                    status_code=409,
                    detail="Symbol already exists (duplicate)",
                    error_code=ErrorCodes.TICKER_SYMBOL_DUPLICATE,
                )
            raise
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
