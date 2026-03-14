"""
Canonical Ticker Service - Single creation path for D22 + D33
ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_v1.0.0 §3.1

THE canonical path for creating a system ticker.
Admin (D22) and user (D33) creation both delegate here.
"""

import os
import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.exc import IntegrityError, ProgrammingError
import logging

from ..models.tickers import Ticker
from ..utils.exceptions import HTTPExceptionWithCode, ErrorCodes

logger = logging.getLogger(__name__)

_USER_CREATED_TICKER_STATUS = "pending"


def _is_live_check_bypass() -> bool:
    """Dev/QA only: SKIP_LIVE_DATA_CHECK=true bypasses provider fetch."""
    return os.environ.get("SKIP_LIVE_DATA_CHECK", "").strip().lower() in ("true", "1", "yes")


async def _live_data_check(
    symbol: str,
    ticker_type: str = "STOCK",
    market: Optional[str] = None,
) -> bool:
    """Live data-load check per architect directive. Yahoo → Alpha fallback. Used for create and edit."""
    if _is_live_check_bypass():
        logger.info("Live data check bypassed for %s", symbol)
        return True
    from ..integrations.market_data.providers.yahoo_provider import YahooProvider
    from ..integrations.market_data.providers.alpha_provider import AlphaProvider
    from ..integrations.market_data.provider_mapping_utils import (
        get_provider_mapping,
        resolve_symbols_for_fetch,
    )

    pm = get_provider_mapping(symbol, ticker_type, market, metadata=None)
    yahoo_sym, alpha_sym, alpha_market = resolve_symbols_for_fetch(symbol, ticker_type, pm)
    for provider_cls in (YahooProvider,):
        try:
            provider = provider_cls(mode="LIVE")
            result = await provider.get_ticker_price(yahoo_sym)
            if result and result.price and result.price > 0:
                return True
        except Exception as e:
            logger.warning("Live check %s failed for %s: %s", provider_cls.__name__, yahoo_sym, e)
    try:
        provider = AlphaProvider(mode="LIVE")
        if ticker_type == "CRYPTO":
            result = await provider.get_ticker_price_crypto(alpha_sym, alpha_market)
        else:
            result = await provider.get_ticker_price(alpha_sym)
        if result and result.price and result.price > 0:
            return True
    except Exception as e:
        logger.warning("Live check AlphaProvider failed for %s: %s", alpha_sym, e)
    return False


async def validate_ticker_with_providers(
    symbol: str,
    ticker_type: str = "STOCK",
    market: Optional[str] = None,
) -> None:
    """
    Public validation: run live provider check; raise 422 if symbol has no market data.
    Use for edit when symbol/ticker_type/exchange changes. Create uses _live_data_check inside create_system_ticker.
    """
    from ..core.config import settings

    if not getattr(settings, "run_live_symbol_validation", True):
        return
    symbol_uc = symbol.strip().upper()
    ticker_type_uc = ticker_type.upper()
    live_ok = await _live_data_check(symbol_uc, ticker_type=ticker_type_uc, market=market)
    if not live_ok:
        raise HTTPExceptionWithCode(
            status_code=422,
            detail="Provider could not fetch data for this symbol. Ticker not updated. Verify symbol exists and try again.",
            error_code=ErrorCodes.TICKER_SYMBOL_INVALID,
        )


def _symbol_advisory_key(symbol: str) -> int:
    """G7R Batch5: Deterministic bigint for pg_advisory_xact_lock (single-create invariant)."""
    import hashlib

    h = hashlib.sha256(symbol.strip().upper().encode()).digest()
    return int.from_bytes(h[:8], "big") % (2**63)


async def create_system_ticker(
    db: AsyncSession,
    symbol: str,
    ticker_type: str = "STOCK",
    exchange_id: Optional[uuid.UUID] = None,
    company_name: Optional[str] = None,
    metadata: Optional[dict] = None,
    skip_live_check: bool = False,
    status: str = "pending",
    market: Optional[str] = None,
) -> Ticker:
    """
    THE canonical path for creating a system ticker.
    G7R Batch5: Advisory lock enforces single-create under concurrency.
    1. Acquire advisory lock by symbol (serialize concurrent creates)
    2. Check symbol uniqueness in market_data.tickers
    3. Validate live market data (unless skip_live_check=True and dev)
    4. Create ticker with status OR return existing on IntegrityError
    5. Return Ticker ORM object
    """
    from sqlalchemy import text
    from ..core.config import settings

    symbol_uc = symbol.strip().upper()
    ticker_type_uc = ticker_type.upper()

    # G7R Batch5: Serialize concurrent create for same symbol
    lock_key = _symbol_advisory_key(symbol_uc)
    await db.execute(text("SELECT pg_advisory_xact_lock(:key)"), {"key": lock_key})

    # Uniqueness check (after lock; another txn cannot have created meanwhile)
    # G7R Batch5: Return existing instead of 409 — idempotent get-or-create for concurrency
    stmt = select(Ticker).where(and_(Ticker.symbol == symbol_uc, Ticker.deleted_at.is_(None)))
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        return existing

    # Live validation: default ON (TEAM_50). Only skip when skip_live_check=True and not force_validate; never run if bypass.
    # RUN_LIVE_SYMBOL_VALIDATION=false or SKIP_LIVE_DATA_CHECK=true disables for dev only.
    force_validate = os.environ.get("VALIDATE_SYMBOL_ALWAYS", "").strip().lower() in (
        "true",
        "1",
        "yes",
    )
    run_validation = getattr(settings, "run_live_symbol_validation", True)
    do_live = (
        run_validation and not _is_live_check_bypass() and (force_validate or not skip_live_check)
    )
    if do_live:
        live_ok = await _live_data_check(symbol_uc, ticker_type=ticker_type_uc, market=market)
        if not live_ok:
            raise HTTPExceptionWithCode(
                status_code=422,
                detail="Provider could not fetch data for this symbol. Ticker not created. Verify symbol exists and try again.",
                error_code=ErrorCodes.TICKER_SYMBOL_INVALID,
            )

    # G7-v1.2.1: Ticker without market data NOT is_active=true (status=pending = no data yet)
    is_active = status.lower() != "pending"
    ticker = Ticker(
        symbol=symbol_uc,
        company_name=company_name or None,
        ticker_type=ticker_type_uc,
        exchange_id=exchange_id,
        is_active=is_active,
        status=status,
        ticker_metadata=metadata or {},
    )
    db.add(ticker)
    try:
        await db.flush()
        await db.refresh(ticker)
        return ticker
    except ProgrammingError as e:
        await db.rollback()
        err = str(e).lower()
        if "column" in err and "does not exist" in err:
            logger.error("Tickers schema mismatch: %s", e)
            raise HTTPExceptionWithCode(
                status_code=503,
                detail="market_data.tickers schema outdated. Run migrations.",
                error_code=ErrorCodes.SERVER_ERROR,
            )
        raise
    except IntegrityError as e:
        await db.rollback()
        error_msg = str(e.orig) if hasattr(e, "orig") else str(e)
        if "symbol" in error_msg.lower() or "unique" in error_msg.lower():
            # G7R Batch5: Concurrent insert — return existing (no duplicate)
            stmt = select(Ticker).where(
                and_(Ticker.symbol == symbol_uc, Ticker.deleted_at.is_(None))
            )
            existing = (await db.execute(stmt)).scalar_one_or_none()
            if existing:
                return existing
        raise HTTPExceptionWithCode(
            status_code=409,
            detail="Ticker creation failed",
            error_code=ErrorCodes.VALIDATION_INVALID_FORMAT,
        )
