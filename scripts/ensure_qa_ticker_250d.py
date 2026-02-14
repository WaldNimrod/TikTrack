#!/usr/bin/env python3
"""
Ensure QA Ticker 250d — TEAM_10_SMART_HISTORY_FILL_QA_URGENT_FIXES_MANDATE
---------------------------------------------------------------------------
מבטיח שקיים לפחות טיקר אחד עם 250+ שורות ב־ticker_prices — לבדיקות QA (בלוק "הנתונים מלאים", force_reload).
מריץ seed-tickers + sync-history-backfill עד שהתנאי מתקיים או עד מקסימום 3 סבבים.
"""
import os
import subprocess
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
    print("❌ DATABASE_URL not set (api/.env)")
    sys.exit(1)
if "postgresql+asyncpg" in str(DATABASE_URL):
    DATABASE_URL = str(DATABASE_URL).replace("postgresql+asyncpg://", "postgresql://")

MIN_REQUIRED = 250
MAX_ROUNDS = 3


def get_ticker_with_250_plus():
    """Returns (ticker_id, symbol, count) if any ticker has >= MIN_REQUIRED rows, else None."""
    import psycopg2
    from psycopg2.extras import RealDictCursor
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT t.id, t.symbol, COUNT(tp.id) AS cnt
            FROM market_data.tickers t
            LEFT JOIN market_data.ticker_prices tp ON tp.ticker_id = t.id
            WHERE (t.deleted_at IS NULL OR t.deleted_at > NOW())
            GROUP BY t.id, t.symbol
            HAVING COUNT(tp.id) >= %s
            ORDER BY COUNT(tp.id) DESC
            LIMIT 1
        """, (MIN_REQUIRED,))
        row = cur.fetchone()
        return (str(row["id"]), row["symbol"], row["cnt"]) if row else None
    finally:
        conn.close()


def run_seed_tickers():
    """Run make seed-tickers."""
    r = subprocess.run(
        ["make", "seed-tickers"],
        cwd=str(_project),
        capture_output=True,
        text=True,
    )
    if r.returncode != 0:
        print(f"⚠️ seed-tickers: {r.stderr or r.stdout}")
    return r.returncode == 0


def run_sync_history_backfill():
    """Run make sync-history-backfill."""
    r = subprocess.run(
        ["make", "sync-history-backfill"],
        cwd=str(_project),
        capture_output=True,
        text=True,
    )
    if r.stdout:
        print(r.stdout)
    if r.returncode != 0 and r.stderr:
        print(f"⚠️ sync-history-backfill: {r.stderr}")
    return r.returncode == 0


def main():
    print("🔄 Ensure QA ticker with 250+ rows (Smart History Fill QA)")
    existing = get_ticker_with_250_plus()
    if existing:
        ticker_id, symbol, count = existing
        print(f"✅ Ticker {symbol} already has {count} rows — ready for QA")
        sys.exit(0)

    run_seed_tickers()
    for round_num in range(1, MAX_ROUNDS + 1):
        print(f"\n📋 Round {round_num}/{MAX_ROUNDS} — running sync-history-backfill")
        run_sync_history_backfill()
        existing = get_ticker_with_250_plus()
        if existing:
            ticker_id, symbol, count = existing
            print(f"\n✅ Ticker {symbol} has {count} rows — ready for QA")
            sys.exit(0)
    print("\n⚠️ After 3 rounds, no ticker reached 250+ rows. Providers (Yahoo/Alpha) may be rate-limited.")
    print("   Run later: make ensure-qa-ticker-250d")
    sys.exit(1)


if __name__ == "__main__":
    main()
