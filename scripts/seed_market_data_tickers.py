#!/usr/bin/env python3
"""
Seed market_data.tickers — טיקרים להצגה וסנכרון
TEAM_90_RATELIMIT_SCALING_LOCK — טיקרים נטענים מ-DB בלבד
מקור: market_data.tickers — אין hardcoded symbols
"""

import os
import sys
from pathlib import Path

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
    print("❌ DATABASE_URL not set (api/.env)")
    sys.exit(1)
if "postgresql+asyncpg" in str(DATABASE_URL):
    DATABASE_URL = str(DATABASE_URL).replace("postgresql+asyncpg://", "postgresql://")

DEFAULT_TICKERS = [
    ("AAPL", "Apple Inc."),
    ("MSFT", "Microsoft Corporation"),
    ("TSLA", "Tesla Inc."),
    ("GOOGL", "Alphabet Inc. (Google)"),
    ("AMZN", "Amazon.com Inc."),
]


def seed():
    import psycopg2
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        inserted = 0
        for symbol, company_name in DEFAULT_TICKERS:
            cur.execute("""
                INSERT INTO market_data.tickers (symbol, company_name, ticker_type, is_active, created_at, updated_at)
                SELECT %s, %s, 'STOCK', true, NOW(), NOW()
                WHERE NOT EXISTS (SELECT 1 FROM market_data.tickers WHERE symbol = %s AND (deleted_at IS NULL))
            """, (symbol, company_name or "", symbol))
            if cur.rowcount > 0:
                inserted += 1
                print(f"  ✅ {symbol} — {company_name or ''}")
        conn.commit()
        cur.execute("SELECT COUNT(*) FROM market_data.tickers WHERE deleted_at IS NULL AND is_active = true")
        total = cur.fetchone()[0]
        print(f"\n✅ market_data.tickers: {total} tickers (inserted {inserted})")
    finally:
        conn.close()


if __name__ == "__main__":
    print("🔄 Seeding market_data.tickers (AAPL, MSFT, TSLA, GOOGL, AMZN)")
    try:
        seed()
    except Exception as e:
        print(f"❌ {e}")
        sys.exit(1)
