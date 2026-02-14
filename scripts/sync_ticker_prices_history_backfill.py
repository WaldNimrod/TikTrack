#!/usr/bin/env python3
"""
History Backfill — 250d OHLCV for tickers with insufficient data
Team 20 — MARKET_DATA_COVERAGE_MATRIX, MARKET_DATA_PIPE_SPEC §2.4
P3-015 — Indicators (ATR/MA/CCI) require 250 trading days in ticker_prices.

Providers: Yahoo Finance (Primary) → Alpha Vantage (Fallback).
Loads tickers with < MIN_HISTORY_DAYS rows, fetches get_ticker_history(250),
inserts into market_data.ticker_prices. Idempotent — skips existing dates.
Single-Flight lock. Cooldown on 429.
"""

import asyncio
import os
import sys
try:
    import fcntl
except ImportError:
    fcntl = None
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import List, Optional, Set, Tuple
from uuid import UUID

MIN_HISTORY_DAYS = 200  # Backfill if fewer rows (250 required for indicators)
MAX_TICKERS_PER_RUN = 15  # Limit per run — Alpha 5/min

_project = Path(__file__).parent.parent
env_file = _project / "api" / ".env"
DATABASE_URL: Optional[str] = None
ALPHA_VANTAGE_API_KEY: Optional[str] = None

if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line.startswith("DATABASE_URL=") and not line.startswith("#"):
                DATABASE_URL = line.split("=", 1)[1].strip().strip("'\"").strip()
            elif line.startswith("ALPHA_VANTAGE_API_KEY=") and not line.startswith("#"):
                ALPHA_VANTAGE_API_KEY = line.split("=", 1)[1].strip().strip("'\"").strip()
if not DATABASE_URL:
    DATABASE_URL = os.getenv("DATABASE_URL")
if not ALPHA_VANTAGE_API_KEY:
    ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")
if ALPHA_VANTAGE_API_KEY:
    os.environ["ALPHA_VANTAGE_API_KEY"] = ALPHA_VANTAGE_API_KEY
if not DATABASE_URL:
    print("❌ DATABASE_URL not set (api/.env)")
    sys.exit(1)
if "postgresql+asyncpg" in str(DATABASE_URL):
    DATABASE_URL = str(DATABASE_URL).replace("postgresql+asyncpg://", "postgresql://")

sys.path.insert(0, str(_project))


def _is_429(e: Exception) -> bool:
    s = str(e).lower()
    return "429" in s or "too many" in s or "rate limit" in s


def load_tickers_needing_backfill() -> List[Tuple[UUID, str]]:
    """Tickers with < MIN_HISTORY_DAYS rows in ticker_prices."""
    import psycopg2
    from psycopg2.extras import RealDictCursor

    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT t.id, t.symbol
            FROM market_data.tickers t
            LEFT JOIN market_data.ticker_prices tp ON tp.ticker_id = t.id
            WHERE (t.deleted_at IS NULL OR t.deleted_at > NOW())
            GROUP BY t.id, t.symbol
            HAVING COUNT(tp.id) < %s
            ORDER BY COUNT(tp.id) ASC
            LIMIT %s
        """, (MIN_HISTORY_DAYS, MAX_TICKERS_PER_RUN))
        rows = cur.fetchall()
        return [(r["id"], r["symbol"]) for r in rows]
    finally:
        conn.close()


def get_existing_dates(ticker_id: UUID) -> Set[str]:
    """Existing price_timestamp dates (YYYY-MM-DD) for ticker."""
    import psycopg2
    from psycopg2.extras import RealDictCursor

    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT DISTINCT date(price_timestamp AT TIME ZONE 'UTC')::text AS d
            FROM market_data.ticker_prices
            WHERE ticker_id = %s
        """, (str(ticker_id),))
        return {r["d"] for r in cur.fetchall()}
    finally:
        conn.close()


def _next_month(year: int, month: int) -> Tuple[int, int]:
    if month == 12:
        return year + 1, 1
    return year, month + 1


def ensure_partition(conn, year: int, month: int) -> None:
    part_name = f"ticker_prices_{year}_{month:02d}"
    start_s = f"{year}-{month:02d}-01"
    ny, nm = _next_month(year, month)
    end_s = f"{ny}-{nm:02d}-01"
    cur = conn.cursor()
    try:
        cur.execute(f"""
            CREATE TABLE IF NOT EXISTS market_data.{part_name}
            PARTITION OF market_data.ticker_prices
            FOR VALUES FROM (%s) TO (%s)
        """, (start_s, end_s))
        conn.commit()
    except Exception as e:
        if "already exists" not in str(e).lower():
            print(f"⚠️ Partition {part_name}: {e}")
        conn.rollback()
    finally:
        cur.close()


def insert_history_rows(
    ticker_id: UUID,
    symbol: str,
    rows: list,
    existing_dates: Set[str],
) -> int:
    """Insert OHLCV rows that don't exist. Returns count inserted."""
    import psycopg2

    conn = psycopg2.connect(DATABASE_URL)
    inserted = 0
    now = datetime.now(timezone.utc)
    try:
        cur = conn.cursor()
        months_seen: set = set()
        for row in rows:
            ts = row.date
            if hasattr(ts, "tzinfo") and getattr(ts, "tzinfo", None) is None:
                ts = ts.replace(tzinfo=timezone.utc)
            d_str = ts.strftime("%Y-%m-%d") if hasattr(ts, "strftime") else str(ts)[:10]
            if d_str in existing_dates:
                continue
            ym = (getattr(ts, "year", 0), getattr(ts, "month", 1))
            if ym not in months_seen:
                months_seen.add(ym)
                ensure_partition(conn, ym[0], ym[1])
            price = row.close_price
            try:
                cur.execute("""
                    INSERT INTO market_data.ticker_prices
                    (ticker_id, provider_id, price, open_price, high_price, low_price, close_price, volume, market_cap, price_timestamp, fetched_at, is_stale)
                    VALUES (%s, NULL, %s, %s, %s, %s, %s, %s, NULL, %s, %s, false)
                """, (
                    str(ticker_id),
                    price,
                    row.open_price,
                    row.high_price,
                    row.low_price,
                    row.close_price,
                    row.volume,
                    ts,
                    now,
                ))
                inserted += 1
                existing_dates.add(d_str)
            except Exception as e:
                conn.rollback()
                cur = conn.cursor()
                if "duplicate" not in str(e).lower():
                    print(f"⚠️ Insert {symbol} {d_str}: {e}")
        conn.commit()
    finally:
        conn.close()
    return inserted


async def fetch_history_for_ticker(
    ticker_id: UUID,
    symbol: str,
) -> Tuple[Optional[list], str]:
    """Yahoo → Alpha. Returns (rows, provider_name) or (None, '')."""
    from api.integrations.market_data.providers.yahoo_provider import YahooProvider
    from api.integrations.market_data.providers.alpha_provider import AlphaProvider
    from api.integrations.market_data.provider_cooldown import set_cooldown, is_in_cooldown
    from api.integrations.market_data.market_data_settings import get_provider_cooldown_minutes

    cooldown_min = get_provider_cooldown_minutes()
    for provider, name in [(YahooProvider(), "YAHOO_FINANCE"), (AlphaProvider(), "ALPHA_VANTAGE")]:
        if is_in_cooldown(name):
            continue
        try:
            hist = await provider.get_ticker_history(symbol, 250)
            if hist and len(hist) >= 100:
                return hist, name
        except Exception as e:
            if _is_429(e):
                set_cooldown(name, cooldown_min)
                print(f"⚠️ {name} 429 — cooldown {cooldown_min}min")
            print(f"⚠️ {name} {symbol}: {e}")
    return None, ""


def main():
    fd = None
    if fcntl:
        lock_path = _project / "scripts" / ".sync_ticker_prices_history_backfill.lock"
        try:
            fd = os.open(str(lock_path), os.O_CREAT | os.O_RDWR)
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print("⚠️ Another history backfill already running (Single-Flight). Exit.")
            if fd is not None:
                os.close(fd)
            sys.exit(0)
        except Exception as e:
            print(f"⚠️ Lock error: {e}")
            sys.exit(0)

    try:
        print("🔄 History backfill — 250d OHLCV (Yahoo→Alpha, Single-Flight)")
        tickers = load_tickers_needing_backfill()
        if not tickers:
            print("✅ All tickers have sufficient history. Nothing to backfill.")
            sys.exit(0)

        print(f"📋 {len(tickers)} ticker(s) need backfill (< {MIN_HISTORY_DAYS} rows)")
        total_inserted = 0
        for ticker_id, symbol in tickers:
            existing = get_existing_dates(ticker_id)
            hist, provider = asyncio.run(fetch_history_for_ticker(ticker_id, symbol))
            if not hist:
                print(f"⚠️ No history for {symbol}")
                continue
            n = insert_history_rows(ticker_id, symbol, hist, existing)
            total_inserted += n
            print(f"  {symbol}: +{n} rows ({provider})")
        print(f"✅ Backfill complete — inserted {total_inserted} historical rows")
    finally:
        if fd is not None and fcntl:
            fcntl.flock(fd, fcntl.LOCK_UN)
            os.close(fd)
    sys.exit(0)


if __name__ == "__main__":
    main()
