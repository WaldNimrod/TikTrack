#!/usr/bin/env python3
"""
EOD Sync — Ticker Prices (Gate B Gaps)
Team 20 — TEAM_10_TO_TEAM_20_GATE_B_GAPS_AND_SYNC_MANDATE
TEAM_90_RATELIMIT_SCALING_LOCK — Single-Flight, Cooldown on 429, טיקרים מ-DB בלבד

Providers: Yahoo Finance (Primary) → Alpha Vantage (Fallback).
Loads tickers from market_data.tickers, fetches EOD prices, saves to market_data.ticker_prices.
Cron: similar to FX (e.g. 0 22 * * 1-5 UTC).
"""

import asyncio
import os
import sys
try:
    import fcntl
except ImportError:
    fcntl = None  # Windows — fallback to no lock
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from typing import List, Optional, Tuple
from uuid import UUID

DECIMAL_SCALE = Decimal("0.00000001")

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
if not DATABASE_URL:
    print("❌ DATABASE_URL not set (api/.env)")
    sys.exit(1)
if "postgresql+asyncpg" in str(DATABASE_URL):
    DATABASE_URL = str(DATABASE_URL).replace("postgresql+asyncpg://", "postgresql://")

sys.path.insert(0, str(_project))


def _quantize(raw) -> Optional[Decimal]:
    if raw is None:
        return None
    try:
        return Decimal(str(float(raw))).quantize(DECIMAL_SCALE, rounding=ROUND_HALF_UP)
    except (TypeError, ValueError):
        return None


def _is_429(e: Exception) -> bool:
    """Detect 429 rate limit from exception."""
    s = str(e).lower()
    return "429" in s or "too many" in s or "rate limit" in s


async def fetch_prices_for_tickers(
    tickers: List[Tuple[UUID, str]]
) -> List[Tuple[UUID, str, Decimal, Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[int], Optional[Decimal], datetime, str]]:
    """Yahoo (Primary) → Alpha (Fallback). Cooldown on 429. Returns (ticker_id, symbol, ...)."""
    from api.integrations.market_data.providers.yahoo_provider import YahooProvider
    from api.integrations.market_data.providers.alpha_provider import AlphaProvider
    from api.integrations.market_data.provider_cooldown import set_cooldown, is_in_cooldown
    from api.integrations.market_data.market_data_settings import get_provider_cooldown_minutes

    cooldown_min = get_provider_cooldown_minutes()
    yahoo = YahooProvider()
    alpha = AlphaProvider()
    results = []
    yahoo_skipped = alpha_skipped = False

    for ticker_id, symbol in tickers:
        for provider, name in [(yahoo, "YAHOO_FINANCE"), (alpha, "ALPHA_VANTAGE")]:
            if is_in_cooldown(name):
                if not (yahoo_skipped if name == "YAHOO_FINANCE" else alpha_skipped):
                    print(f"⚠️ {name} in cooldown — skipping")
                if name == "YAHOO_FINANCE":
                    yahoo_skipped = True
                else:
                    alpha_skipped = True
                continue
            try:
                pr = await provider.get_ticker_price(symbol)
                if pr and pr.price and pr.price > 0:
                    results.append((
                        ticker_id,
                        symbol,
                        pr.price,
                        pr.open_price,
                        pr.high_price,
                        pr.low_price,
                        pr.close_price or pr.price,
                        pr.volume,
                        pr.market_cap,
                        pr.as_of or datetime.now(timezone.utc),
                        pr.provider or "unknown",
                    ))
                    break
            except Exception as e:
                if _is_429(e):
                    set_cooldown(name, cooldown_min)
                    print(f"⚠️ {name} 429 — cooldown {cooldown_min}min")
                print(f"⚠️ {name} {symbol}: {e}")
        else:
            print(f"⚠️ No price for {symbol} (ticker_id={ticker_id})")

    return results


def _next_month(year: int, month: int) -> Tuple[int, int]:
    if month == 12:
        return year + 1, 1
    return year, month + 1


def ensure_partition(conn, year: int, month: int) -> None:
    """Create partition for given month if not exists. Handles partitioned table."""
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


def upsert_prices(
    rows: List[Tuple[UUID, str, Decimal, Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[int], Optional[Decimal], datetime, str]]
) -> int:
    import psycopg2

    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        now = datetime.now(timezone.utc)
        try:
            ensure_partition(conn, now.year, now.month)
        except Exception:
            pass  # May not have dateutil or partition might exist

        inserted = 0
        for ticker_id, symbol, price, o, h, l, c, vol, mc, as_of, provider in rows:
            try:
                cur.execute("""
                    DELETE FROM market_data.ticker_prices
                    WHERE ticker_id = %s AND date(price_timestamp AT TIME ZONE 'UTC') = date(%s AT TIME ZONE 'UTC')
                """, (str(ticker_id), as_of))
                cur.execute("""
                    INSERT INTO market_data.ticker_prices
                    (ticker_id, provider_id, price, open_price, high_price, low_price, close_price, volume, market_cap, price_timestamp, fetched_at, is_stale)
                    VALUES (%s, NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, false)
                """, (
                    str(ticker_id),
                    price,
                    o,
                    h,
                    l,
                    c,
                    vol,
                    mc,
                    as_of,
                    now,
                ))
                inserted += 1
            except Exception as e:
                print(f"⚠️ Insert {symbol}: {e}")
                conn.rollback()
                cur = conn.cursor()
                continue
        conn.commit()
        return inserted
    finally:
        conn.close()


def load_tickers() -> List[Tuple[UUID, str]]:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    from api.integrations.market_data.market_data_settings import get_max_active_tickers

    max_tickers = get_max_active_tickers()
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT id, symbol FROM market_data.tickers
            WHERE (deleted_at IS NULL OR deleted_at > NOW())
            AND is_active = true
            ORDER BY symbol
            LIMIT %s
        """, (max_tickers,))
        rows = cur.fetchall()
        return [(r["id"], r["symbol"]) for r in rows]
    finally:
        conn.close()


def main():
    fd = None
    if fcntl:
        lock_path = _project / "scripts" / ".sync_ticker_prices.lock"
        try:
            fd = os.open(str(lock_path), os.O_CREAT | os.O_RDWR)
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print("⚠️ Another sync already running (Single-Flight). Exit.")
            if fd is not None:
                os.close(fd)
            sys.exit(0)
        except Exception as e:
            print(f"⚠️ Lock error: {e}")
            sys.exit(0)

    try:
        print("🔄 EOD sync — ticker_prices (Yahoo→Alpha, Single-Flight)")
        tickers = load_tickers()
        if not tickers:
            print("⚠️ No tickers in market_data.tickers. Run: python3 scripts/seed_market_data_tickers.py")
            sys.exit(0)

        rows = asyncio.run(fetch_prices_for_tickers(tickers))
        if not rows:
            print("⚠️ No prices fetched. Exit 0.")
            sys.exit(0)

        n = upsert_prices(rows)
        print(f"✅ Upserted {n} ticker prices to market_data.ticker_prices")
    finally:
        if fd is not None and fcntl:
            fcntl.flock(fd, fcntl.LOCK_UN)
            os.close(fd)
    sys.exit(0)


if __name__ == "__main__":
    main()
