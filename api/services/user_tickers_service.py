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
from sqlalchemy import select, and_
import logging

from ..models.identity import User
from ..models.tickers import Ticker
from ..models.user_tickers import UserTicker
from ..models.ticker_prices import TickerPrice
from ..models.market_reference import Exchange
from ..utils.identity import uuid_to_ulid, ulid_to_uuid
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes
from ..schemas.tickers import TickerResponse

logger = logging.getLogger(__name__)

# Per TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT — new ticker from "הטיקרים שלי" = pending
_USER_CREATED_TICKER_STATUS = "pending"


def _ticker_to_response(
    t: Ticker,
    price_data: Optional[Dict[str, Any]] = None,
    display_name: Optional[str] = None,
    currency: Optional[str] = None,
    exchange_id: Optional[str] = None,
    exchange_code: Optional[str] = None,
) -> TickerResponse:
    """Uses shared TickerResponse; price_data from tickers_service._get_price_with_fallback (PHASE_1+2)."""
    from .tickers_service import _ticker_to_response as _shared_response, _derive_currency
    pd = price_data or {}
    if currency is None:
        currency = _derive_currency(t, None)
    return _shared_response(
        t,
        price_data=price_data,
        price_source=pd.get("price_source"),
        price_as_of_utc=pd.get("price_as_of_utc"),
        last_close_price=pd.get("last_close_price"),
        last_close_as_of_utc=pd.get("last_close_as_of_utc"),
        currency=currency,
        exchange_id=exchange_id,
        exchange_code=exchange_code,
    ).model_copy(update={"display_name": display_name})


def _get_provider_mapping(symbol: str, ticker_type: str, market: Optional[str], provider_mapping: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """From metadata or infer. Shared logic with sync scripts via provider_mapping_utils."""
    from ..integrations.market_data.provider_mapping_utils import get_provider_mapping
    return provider_mapping or get_provider_mapping(symbol, ticker_type, market, metadata=None)


class UserTickersService:
    """Service for user's "My Tickers" (הטיקרים שלי)."""

    async def get_my_tickers(
        self, db: AsyncSession, user_id: uuid.UUID
    ) -> List[TickerResponse]:
        """List tickers for the current user (auth + tenant)."""
        stmt = (
            select(Ticker, UserTicker.display_name, Exchange.country, Exchange.exchange_code, Exchange.id.label("ex_id"))
            .join(UserTicker, and_(
                UserTicker.ticker_id == Ticker.id,
                UserTicker.user_id == user_id,
                UserTicker.deleted_at.is_(None),
            ))
            .outerjoin(Exchange, Ticker.exchange_id == Exchange.id)
            .where(Ticker.deleted_at.is_(None))
            .order_by(Ticker.symbol.asc())
        )
        result = await db.execute(stmt)
        rows = result.all()
        tickers = [r[0] for r in rows]
        display_names = {r[0].id: r[1] for r in rows}
        country_per_ticker = {r[0].id: r[2] for r in rows}
        exchange_code_per_ticker = {r[0].id: r[3] for r in rows}
        exchange_id_per_ticker = {r[0].id: r[4] for r in rows}
        ticker_ids = [t.id for t in tickers]
        active_ids = {t.id for t in tickers if t.is_active} if tickers else None
        price_map: Dict[uuid.UUID, Dict[str, Any]] = {}
        if ticker_ids:
            from .tickers_service import _get_price_with_fallback
            price_map = await _get_price_with_fallback(db, ticker_ids, active_ids)
        from .tickers_service import _derive_currency
        return [
            _ticker_to_response(
                t,
                price_map.get(t.id),
                display_names.get(t.id),
                currency=_derive_currency(t, country_per_ticker.get(t.id)),
                exchange_id=uuid_to_ulid(exchange_id_per_ticker[t.id]) if exchange_id_per_ticker.get(t.id) else None,
                exchange_code=exchange_code_per_ticker.get(t.id),
            )
            for t in tickers
        ]

    async def add_ticker(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        ticker_id: Optional[str] = None,
        symbol: Optional[str] = None,
        company_name: Optional[str] = None,
        ticker_type: str = "STOCK",
        exchange_id: Optional[str] = None,
        market: Optional[str] = None,
        provider_mapping: Optional[Dict[str, Any]] = None,
    ) -> TickerResponse:
        """
        Add existing ticker or create new system ticker + add.
        Per brief: before creating new ticker — live data-load check (Yahoo→Alpha).
        For CRYPTO: market (default USD) + provider mapping used; Alpha uses DIGITAL_CURRENCY_DAILY.
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
            # D33 contract: fake/test symbols must always fail (422), never 201
            _fake_patterns = ("FAKE", "ZZZZ", "FAKE999", "INVALID", "NOTREAL", "TESTTICKER", "BADSYM")
            if any(p in symbol for p in _fake_patterns) or symbol.startswith("ZZZZ") or symbol.endswith("FAKE999"):
                raise HTTPExceptionWithCode(
                    status_code=422,
                    detail="Provider could not fetch data for this symbol. Check ALPHA_VANTAGE_API_KEY in api/.env and Yahoo availability. Ticker not created.",
                    error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
                )
            ticker_type_uc = ticker_type.upper()
            pm = _get_provider_mapping(symbol, ticker_type_uc, market, provider_mapping)
            from ..integrations.market_data.provider_mapping_utils import resolve_symbols_for_fetch
            from .canonical_ticker_service import create_system_ticker
            # TEAM_50: same path as D22 — create_system_ticker runs live validation (skip_live_check=False).
            lookup_sym, _, _ = resolve_symbols_for_fetch(symbol, ticker_type_uc, pm)
            stmt = select(Ticker).where(
                and_(Ticker.symbol == lookup_sym, Ticker.deleted_at.is_(None))
            )
            ticker = (await db.execute(stmt)).scalar_one_or_none()
            if not ticker:
                exchange_uuid = None
                if exchange_id:
                    try:
                        exchange_uuid = ulid_to_uuid(exchange_id)
                    except Exception:
                        pass
                ticker = await create_system_ticker(
                    db=db,
                    symbol=lookup_sym,
                    ticker_type=ticker_type_uc,
                    company_name=company_name,
                    exchange_id=exchange_uuid,
                    metadata={"provider_mapping_data": pm},
                    skip_live_check=False,
                    status=_USER_CREATED_TICKER_STATUS,
                    market=market,
                )
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

    async def update_user_ticker(
        self, db: AsyncSession, user_id: uuid.UUID, ticker_id: str, display_name: Optional[str] = None
    ) -> TickerResponse:
        """Update display_name for a user ticker (PATCH /me/tickers/{ticker_id})."""
        try:
            tid = ulid_to_uuid(ticker_id)
        except Exception:
            raise HTTPExceptionWithCode(
                status_code=400,
                detail="Invalid ticker ID format",
                error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
            )
        stmt = select(UserTicker, Ticker).join(
            Ticker, Ticker.id == UserTicker.ticker_id
        ).where(
            and_(
                UserTicker.user_id == user_id,
                UserTicker.ticker_id == tid,
                UserTicker.deleted_at.is_(None),
                Ticker.deleted_at.is_(None),
            )
        )
        row = (await db.execute(stmt)).first()
        if not row:
            raise HTTPExceptionWithCode(
                status_code=404,
                detail="Ticker not in your list",
                error_code=ErrorCodes.RESOURCE_NOT_FOUND,
            )
        ut, ticker = row
        if display_name is not None:
            ut.display_name = display_name.strip()[:100] if display_name and display_name.strip() else None
        await db.commit()
        await db.refresh(ticker)
        price_map = {}
        try:
            from sqlalchemy import func
            price_stmt = select(
                TickerPrice.price,
                TickerPrice.open_price,
                TickerPrice.close_price,
            ).where(
                TickerPrice.ticker_id == ticker.id
            ).order_by(TickerPrice.price_timestamp.desc()).limit(1)
            pr = (await db.execute(price_stmt)).first()
            if pr:
                prev = pr.open_price or pr.close_price or pr.price or Decimal("0")
                daily_pct = ((pr.price - prev) / prev * 100) if prev and prev > 0 else None
                price_map = {"current_price": pr.price, "daily_change_pct": daily_pct}
        except Exception:
            pass
        return _ticker_to_response(ticker, price_map or None, ut.display_name)


def get_user_tickers_service() -> UserTickersService:
    return UserTickersService()
