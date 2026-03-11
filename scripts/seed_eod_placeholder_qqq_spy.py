#!/usr/bin/env python3
"""
Seed one EOD row for QQQ and SPY when they have no ticker_prices (QA unblock for 1.2).
Use when Yahoo/Alpha are in cooldown and yfinance returns no data — so price_source is non-null.
Placeholder prices: approximate recent levels; replaced by real data on next successful sync.
"""

import os
import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta
from decimal import Decimal

_project = Path(__file__).parent.parent
env_file = _project / "api" / ".env"
DATABASE_URL = None
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            if line.strip().startswith("DATABASE_URL=") and not line.strip().startswith("#"):
                DATABASE_URL = line.split("=", 1)[1].strip().strip("'\"").strip()
                break
if not DATABASE_URL:
    DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL not set")
    sys.exit(1)
if "postgresql+asyncpg" in str(DATABASE_URL):
    DATABASE_URL = str(DATABASE_URL).replace("postgresql+asyncpg://", "postgresql://")

# Placeholder EOD (approximate; so API returns price_source=EOD)
PLACEHOLDERS = [("QQQ", Decimal("500.00")), ("SPY", Decimal("600.00"))]

def main():
    import psycopg2
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        now = datetime.now(timezone.utc)
        # Use last weekday as price_timestamp
        ts = now
        for _ in range(7):
            ts = ts - timedelta(days=1)
            if ts.weekday() < 5:
                break
        inserted = 0
        for symbol, price in PLACEHOLDERS:
            cur.execute("SELECT id FROM market_data.tickers WHERE symbol = %s AND deleted_at IS NULL LIMIT 1", (symbol,))
            row = cur.fetchone()
            if not row:
                continue
            ticker_id = row[0]
            cur.execute("""
                SELECT 1 FROM market_data.ticker_prices WHERE ticker_id = %s LIMIT 1
            """, (str(ticker_id),))
            if cur.fetchone():
                continue
            cur.execute("""
                INSERT INTO market_data.ticker_prices
                (ticker_id, provider_id, price, open_price, high_price, low_price, close_price, volume, market_cap, price_timestamp, fetched_at, is_stale)
                VALUES (%s, NULL, %s, %s, %s, %s, %s, NULL, NULL, %s, %s, true)
            """, (str(ticker_id), price, price, price, price, price, ts, now))
            inserted += 1
            print(f"  ✅ {symbol}: placeholder EOD (price={price}, is_stale=true)")
        conn.commit()
        if inserted:
            print(f"✅ Inserted {inserted} placeholder EOD row(s). Run sync-ticker-prices later to replace with live data.")
        else:
            print("ℹ️ QQQ/SPY already have ticker_prices.")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
    sys.exit(0)
