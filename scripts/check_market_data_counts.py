#!/usr/bin/env python3
"""
בדיקת ספירות — market_data.tickers, market_data.ticker_prices.
לשימוש: וידוא שיש טיקרים ומחירים לפני תצוגה ב-UI.
Team 10 / Team 50 — TEAM_10_EXTERNAL_DATA_UI_GAPS_AND_QA.
"""
import os
import sys
from pathlib import Path

_project = Path(__file__).resolve().parent.parent
env_file = _project / "api" / ".env"
DATABASE_URL = None
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line.startswith("DATABASE_URL=") and not line.startswith("#"):
                DATABASE_URL = line.split("=", 1)[1].strip().strip("'\"").strip()
                break
if not DATABASE_URL:
    DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL not set (api/.env or env)")
    sys.exit(1)
if "postgresql+asyncpg" in str(DATABASE_URL):
    DATABASE_URL = str(DATABASE_URL).replace("postgresql+asyncpg://", "postgresql://")

def main():
    try:
        import psycopg2
    except ImportError:
        print("❌ psycopg2 required: pip install psycopg2-binary")
        sys.exit(1)
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) FROM market_data.tickers")
        tickers_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM market_data.ticker_prices")
        prices_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM market_data.exchange_rates")
        fx_count = cur.fetchone()[0]
        print("market_data.tickers:", tickers_count)
        print("market_data.ticker_prices:", prices_count)
        print("market_data.exchange_rates:", fx_count)
        if tickers_count == 0:
            print("⚠️ אין טיקרים — הרץ: make seed-tickers")
        if prices_count == 0 and tickers_count > 0:
            print("⚠️ אין מחירים — הרץ: make sync-ticker-prices")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    main()
