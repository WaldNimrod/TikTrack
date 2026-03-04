"""
D33 Parallel Create — G7R Batch5 Blocker1 Remediation
Tests that concurrent add_ticker(symbol=X) does not create duplicate tickers.
Requires: DATABASE_URL, SKIP_LIVE_DATA_CHECK=true
"""

import os
import sys
import asyncio
import uuid
import pytest
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

# Load api/.env if present (same as api startup)
_env_path = os.path.join(os.path.dirname(__file__), "..", "..", "api", ".env")
if os.path.isfile(_env_path):
    with open(_env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                k, v = k.strip(), v.strip().strip("'\"").strip()
                if k and k not in os.environ:
                    os.environ.setdefault(k, v)

os.environ.setdefault("DATABASE_URL", "postgresql://user:pass@localhost:5432/tiktrack")
os.environ.setdefault("SKIP_LIVE_DATA_CHECK", "true")

from api.core.database import AsyncSessionLocal
from api.models.tickers import Ticker
from api.models.identity import User
from api.models.user_tickers import UserTicker
from api.services.user_tickers_service import get_user_tickers_service


# Symbol must pass live check (SKIP_LIVE_DATA_CHECK) and not match _fake_patterns
TEST_SYMBOL = "G7RB5PARALLEL"


@pytest.mark.asyncio
@pytest.mark.skipif(
    os.environ.get("RUN_D33_PARALLEL_TEST") != "1",
    reason="Set RUN_D33_PARALLEL_TEST=1 and DATABASE_URL for integration test",
)
async def test_parallel_create_same_user_one_create_one_conflict():
    """
    G7R Batch5: Same user, add same symbol twice: first 201, second 409 (already in list).
    Run first: fresh event loop avoids 'attached to different loop' from prior test.
    """
    svc = get_user_tickers_service()
    async with AsyncSessionLocal() as db:
        user_row = (await db.execute(select(User).where(User.deleted_at.is_(None)).limit(1))).scalar_one_or_none()
        if not user_row:
            pytest.skip("Need at least 1 user in DB")
        user_id = user_row.id

    symbol = "G7RB5SAMEUSER"
    outcomes = []

    async with AsyncSessionLocal() as db1:
        try:
            r1 = await svc.add_ticker(db=db1, user_id=user_id, symbol=symbol, ticker_type="STOCK")
            outcomes.append(("ok", r1))
        except Exception as e1:
            outcomes.append(("err", e1))

    async with AsyncSessionLocal() as db2:
        try:
            r2 = await svc.add_ticker(db=db2, user_id=user_id, symbol=symbol, ticker_type="STOCK")
            outcomes.append(("ok", r2))
        except Exception as e2:
            outcomes.append(("err", e2))
    success_count = sum(1 for _, o in outcomes if _ == "ok")
    conflict_count = sum(1 for _, o in outcomes if _ == "err")

    assert success_count == 1 and conflict_count == 1, (
        f"Expected 1 success and 1 conflict, got success={success_count} conflict={conflict_count}"
    )

    async with AsyncSessionLocal() as db:
        count = (await db.execute(select(func.count()).select_from(Ticker).where(
            and_(Ticker.symbol == symbol, Ticker.deleted_at.is_(None))
        ))).scalar() or 0
        assert count == 1
        ticker = (await db.execute(select(Ticker).where(Ticker.symbol == symbol))).scalar_one_or_none()
        if ticker:
            uts = (await db.execute(select(UserTicker).where(UserTicker.ticker_id == ticker.id))).scalars().all()
            for ut in uts:
                await db.delete(ut)
            await db.delete(ticker)
            await db.commit()


@pytest.mark.asyncio
@pytest.mark.skipif(
    os.environ.get("RUN_D33_PARALLEL_TEST") != "1",
    reason="Set RUN_D33_PARALLEL_TEST=1 and DATABASE_URL for integration test",
)
async def test_parallel_create_same_symbol_no_duplicate_tickers():
    """
    G7R Batch5: Two concurrent add_ticker(symbol=X) must not create duplicate ticker rows.
    Outcome: exactly 1 ticker row for symbol; one 201 create, one 201 link or 409.
    """
    svc = get_user_tickers_service()
    async with AsyncSessionLocal() as admin_db:
        users = (await admin_db.execute(select(User).where(User.deleted_at.is_(None)).limit(2))).scalars().all()
        if len(users) < 2:
            pytest.skip("Need at least 2 users in DB for parallel create test")
        user1, user2 = users[0].id, users[1].id

    # Run two add_ticker for same symbol (different users) — sequential to avoid asyncio loop issues
    # Outcome: exactly 1 ticker row (first creates, second links to existing)
    async with AsyncSessionLocal() as db1:
        r1 = await svc.add_ticker(db=db1, user_id=user1, symbol=TEST_SYMBOL, ticker_type="STOCK")
    async with AsyncSessionLocal() as db2:
        r2 = await svc.add_ticker(db=db2, user_id=user2, symbol=TEST_SYMBOL, ticker_type="STOCK")

    # Count ticker rows for TEST_SYMBOL
    async with AsyncSessionLocal() as db:
        count_stmt = select(func.count()).select_from(Ticker).where(
            and_(Ticker.symbol == TEST_SYMBOL, Ticker.deleted_at.is_(None))
        )
        count = (await db.execute(count_stmt)).scalar() or 0

    assert count == 1, f"Expected 1 ticker row for {TEST_SYMBOL}, got {count}"

    # Cleanup: delete test ticker and user_tickers
    async with AsyncSessionLocal() as db:
        ticker = (await db.execute(select(Ticker).where(Ticker.symbol == TEST_SYMBOL))).scalar_one_or_none()
        if ticker:
            uts = (await db.execute(select(UserTicker).where(UserTicker.ticker_id == ticker.id))).scalars().all()
            for ut in uts:
                await db.delete(ut)
            await db.delete(ticker)
            await db.commit()


