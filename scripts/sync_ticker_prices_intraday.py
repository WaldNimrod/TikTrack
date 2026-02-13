#!/usr/bin/env python3
"""
Intraday Sync — Ticker Prices (Active tickers)
Team 20 — MARKET_DATA_PIPE_SPEC §7.1
TEAM_90_RATELIMIT_SCALING_LOCK — Single-Flight, Cooldown on 429

Providers: Yahoo Finance (Primary) → Alpha Vantage (Fallback).
Loads active tickers from market_data.tickers, fetches current prices,
inserts into market_data.ticker_prices_intraday.
Cron: per INTRADAY_INTERVAL_MINUTES (e.g. */15 * * * 1-5 UTC).
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


def insert_intraday(
    rows: List[Tuple[UUID, str, Decimal, Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[int], Optional[Decimal], datetime, str]]
) -> int:
    import psycopg2

    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        now = datetime.now(timezone.utc)
        inserted = 0
        for ticker_id, symbol, price, o, h, l, c, vol, mc, as_of, provider in rows:
            try:
                cur.execute("""
                    INSERT INTO market_data.ticker_prices_intraday
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


def load_active_tickers() -> List[Tuple[UUID, str]]:
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
        lock_path = _project / "scripts" / ".sync_ticker_prices_intraday.lock"
        try:
            fd = os.open(str(lock_path), os.O_CREAT | os.O_RDWR)
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print("⚠️ Another intraday sync already running (Single-Flight). Exit.")
            if fd is not None:
                os.close(fd)
            sys.exit(0)
        except Exception as e:
            print(f"⚠️ Lock error: {e}")
            sys.exit(0)

    try:
        print("🔄 Intraday sync — ticker_prices_intraday (Yahoo→Alpha, Single-Flight)")
        tickers = load_active_tickers()
        if not tickers:
            print("⚠️ No active tickers in market_data.tickers. Exit.")
            sys.exit(0)

        rows = asyncio.run(fetch_prices_for_tickers(tickers))
        if not rows:
            print("⚠️ No prices fetched. Exit 0.")
            sys.exit(0)

        n = insert_intraday(rows)
        print(f"✅ Inserted {n} intraday prices to market_data.ticker_prices_intraday")
    finally:
        if fd is not None and fcntl:
            fcntl.flock(fd, fcntl.LOCK_UN)
            os.close(fd)
    sys.exit(0)


if __name__ == "__main__":
    main()
