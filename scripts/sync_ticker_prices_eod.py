#!/usr/bin/env python3
"""
EOD Sync — Ticker Prices (Gate B Gaps)
Team 20 — TEAM_10_TO_TEAM_20_GATE_B_GAPS_AND_SYNC_MANDATE
MARKET_DATA_PIPE_SPEC §4.1, §7.1

Providers: Yahoo Finance (Primary) → Alpha Vantage (Fallback).
Loads tickers from market_data.tickers, fetches EOD prices, saves to market_data.ticker_prices.
Cron: similar to FX (e.g. 0 22 * * 1-5 UTC).
"""

import asyncio
import os
import sys
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


async def fetch_prices_for_tickers(
    tickers: List[Tuple[UUID, str]]
) -> List[Tuple[UUID, str, Decimal, Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[Decimal], Optional[int], Optional[Decimal], datetime, str]]:
    """Yahoo (Primary) → Alpha (Fallback). Returns (ticker_id, symbol, price, o, h, l, c, vol, market_cap, as_of, provider)."""
    from api.integrations.market_data.providers.yahoo_provider import YahooProvider
    from api.integrations.market_data.providers.alpha_provider import AlphaProvider

    yahoo = YahooProvider()
    alpha = AlphaProvider()
    results = []

    for ticker_id, symbol in tickers:
        for provider in (yahoo, alpha):
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
                print(f"⚠️ {provider.__class__.__name__} {symbol}: {e}")
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

    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT id, symbol FROM market_data.tickers
            WHERE (deleted_at IS NULL OR deleted_at > NOW())
            AND is_active = true
            ORDER BY symbol
        """)
        rows = cur.fetchall()
        return [(r["id"], r["symbol"]) for r in rows]
    finally:
        conn.close()


def main():
    print("🔄 EOD sync — ticker_prices (Yahoo→Alpha)")
    tickers = load_tickers()
    if not tickers:
        print("⚠️ No tickers in market_data.tickers. Add tickers to sync.")
        sys.exit(0)

    rows = asyncio.run(fetch_prices_for_tickers(tickers))
    if not rows:
        print("⚠️ No prices fetched. Exit 0.")
        sys.exit(0)

    n = upsert_prices(rows)
    print(f"✅ Upserted {n} ticker prices to market_data.ticker_prices")
    sys.exit(0)


if __name__ == "__main__":
    main()
