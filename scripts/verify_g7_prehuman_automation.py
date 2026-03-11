#!/usr/bin/env python3
"""
GATE_7 Pre-Human Automation — Runtime verification for Team 60.
TEAM_90_TO_TEAM_50_TEAM_60_S002_P002_WP003_G7_PREHUMAN_AUTOMATION_ACTIVATION_v1.0.0

Checks:
  AUTO-WP003-05: market_cap non-null for ANAU.MI, BTC-USD, TEVA.TA, SPY (4/4).
  AUTO-WP003-03/04/06: Instructions for Yahoo call count and 429 scan (runtime evidence).
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
            line = line.strip()
            if line.startswith("DATABASE_URL=") and not line.startswith("#"):
                DATABASE_URL = line.split("=", 1)[1].strip().strip("'\"").strip()
if not DATABASE_URL:
    DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and "postgresql+asyncpg" in str(DATABASE_URL):
    DATABASE_URL = str(DATABASE_URL).replace("postgresql+asyncpg://", "postgresql://")

SYMBOLS = ("ANAU.MI", "BTC-USD", "TEVA.TA", "SPY")


def check_market_cap():
    """AUTO-WP003-05: market_cap not null for ANAU.MI, BTC-USD, TEVA.TA, SPY."""
    try:
        import psycopg2
    except ImportError:
        print("AUTO-WP003-05: SKIP (psycopg2 not installed); run: pip install psycopg2-binary")
        return None
    if not DATABASE_URL:
        print("AUTO-WP003-05: SKIP (DATABASE_URL not set)")
        return None
    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        # Latest ticker_prices row per symbol (by ticker_id) with market_cap
        cur.execute("""
            WITH latest AS (
                SELECT DISTINCT ON (t.id)
                    t.symbol, tp.market_cap
                FROM market_data.tickers t
                JOIN market_data.ticker_prices tp ON tp.ticker_id = t.id
                WHERE t.symbol = ANY(%s) AND t.deleted_at IS NULL
                ORDER BY t.id, tp.price_timestamp DESC
            )
            SELECT symbol, market_cap FROM latest
        """, (list(SYMBOLS),))
        rows = cur.fetchall()
        cur.close()
        by_symbol = {r[0]: r[1] for r in rows}
        missing = [s for s in SYMBOLS if s not in by_symbol]
        nulls = [s for s in SYMBOLS if by_symbol.get(s) is None]
        if missing:
            print(f"AUTO-WP003-05: BLOCK — symbols not in DB or no prices: {missing}")
            return False
        if nulls:
            print(f"AUTO-WP003-05: BLOCK — market_cap null for: {nulls}")
            return False
        print(f"AUTO-WP003-05: PASS — market_cap non-null for {len(SYMBOLS)}/{len(SYMBOLS)}: {list(SYMBOLS)}")
        return True
    except Exception as e:
        print(f"AUTO-WP003-05: ERROR — {e}")
        return False
    finally:
        if conn:
            conn.close()


def main():
    print("GATE_7 Pre-Human Automation — Team 60 runtime checks")
    print("=" * 60)
    result_05 = check_market_cap()
    print()
    print("AUTO-WP003-03 (market-open Yahoo <= 5): Evidence = run intraday in market_open; count HTTP to Yahoo (batch + fallbacks). Code: batch-first + priority filter → design supports <= 5.")
    print("AUTO-WP003-04 (off-hours Yahoo <= 2): Evidence = run intraday in off_hours; count HTTP. Design: only FIRST_FETCH / stale tickers → <= 2.")
    print("AUTO-WP003-06 (zero 429 in 4 cycles): Evidence = run 4 sync cycles (~1h), grep backend/sync logs for '429'; expect 0.")
    print()
    if result_05 is False:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
