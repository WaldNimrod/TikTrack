#!/usr/bin/env python3
"""
Seed market_data.tickers — טיקרים להצגה וסנכרון
TEAM_90_RATELIMIT_SCALING_LOCK — טיקרים נטענים מ-DB בלבד
GATE_7 R2: exchange_id, ticker_type (ETF for SPY/QQQ); removed DDD/TSLA/MSFT per DETAILED_QA_FINDINGS 1.5, 1.6.
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

# GATE_7 R2: (symbol, company_name, ticker_type, exchange_code). exchange_code None = no exchange (CRYPTO).
# Removed: DDD, MSFT, TSLA (per 1.6). Added: SPY, QQQ (ETF per 1.5). exchange_id from market_data.exchanges (1.3).
DEFAULT_TICKERS = [
    ("AAPL", "Apple Inc.", "STOCK", "NASDAQ"),
    ("GOOGL", "Alphabet Inc. (Google)", "STOCK", "NASDAQ"),
    ("AMZN", "Amazon.com Inc.", "STOCK", "NASDAQ"),
    ("SPY", "SPDR S&P 500 ETF", "ETF", "NYSE"),
    ("QQQ", "Invesco QQQ Trust", "ETF", "NASDAQ"),
    ("TEVA.TA", "Teva Pharmaceutical", "STOCK", "TASE"),
    ("BTC-USD", "Bitcoin USD", "CRYPTO", None),
    ("ANAU.MI", "Anima Holding", "STOCK", "MIL"),
]


def _cleanup_removed_symbols(cur):
    """R2 1.6: Soft-delete DDD, TSLA, MSFT so they no longer appear in lists."""
    cur.execute("""
        UPDATE market_data.tickers
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE symbol IN ('DDD', 'TSLA', 'MSFT') AND deleted_at IS NULL
    """)
    n = cur.rowcount
    if n > 0:
        print(f"  🧹 Cleaned (deleted_at): {n} ticker(s) DDD/TSLA/MSFT")


def _backfill_ticker_type_for_existing(cur):
    """TEAM_10_TICKER_TYPE: Update ticker_type for existing tickers when DEFAULT_TICKERS says differently (SPY→ETF, QQQ→ETF, BTC-USD→CRYPTO)."""
    updated = 0
    for row in DEFAULT_TICKERS:
        symbol = row[0]
        expected_type = row[2] if len(row) >= 3 else "STOCK"
        cur.execute("""
            UPDATE market_data.tickers
            SET ticker_type = %s, updated_at = NOW()
            WHERE symbol = %s AND deleted_at IS NULL
              AND (ticker_type IS NULL OR ticker_type::text != %s)
        """, (expected_type, symbol, expected_type))
        if cur.rowcount > 0:
            updated += cur.rowcount
            print(f"  🔄 Updated ticker_type: {symbol} → {expected_type}")
    if updated > 0:
        print(f"  ✅ ticker_type backfill: {updated} ticker(s) updated")


def _backfill_exchange_id_for_existing(cur):
    """GATE_3 R3 (Blocker 1.3): Set exchange_id for existing tickers (e.g. TEVA.TA→TASE, ANAU.MI→MIL)."""
    updated = 0
    for row in DEFAULT_TICKERS:
        symbol = row[0]
        exchange_code = row[3] if len(row) >= 4 else None
        if not exchange_code:
            continue
        cur.execute(
            "SELECT id FROM market_data.exchanges WHERE exchange_code = %s AND status = 'ACTIVE' LIMIT 1",
            (exchange_code,),
        )
        r = cur.fetchone()
        if not r:
            continue
        exchange_id = r[0]
        cur.execute("""
            UPDATE market_data.tickers
            SET exchange_id = %s, updated_at = NOW()
            WHERE symbol = %s AND deleted_at IS NULL AND (exchange_id IS NULL OR exchange_id != %s)
        """, (exchange_id, symbol, exchange_id))
        if cur.rowcount > 0:
            updated += cur.rowcount
            print(f"  🔗 Backfilled exchange_id ({exchange_code}): {symbol}")
    if updated > 0:
        print(f"  ✅ GATE_3 R3: backfilled exchange_id for {updated} existing ticker(s)")


def seed():
    import psycopg2
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        # R2 1.6: Remove obsolete seed tickers from active set
        _cleanup_removed_symbols(cur)
        conn.commit()
        # GATE_3 R3 (1.3): Backfill exchange_id for existing tickers (TEVA.TA, ANAU.MI, etc.)
        _backfill_exchange_id_for_existing(cur)
        conn.commit()
        # TEAM_10_TICKER_TYPE: Backfill ticker_type (SPY→ETF, QQQ→ETF, BTC-USD→CRYPTO) when existing tickers have wrong type
        _backfill_ticker_type_for_existing(cur)
        conn.commit()

        inserted = 0
        for row in DEFAULT_TICKERS:
            symbol = row[0]
            company_name = row[1]
            ticker_type = row[2] if len(row) >= 3 else "STOCK"
            exchange_code = row[3] if len(row) >= 4 else None
            # Resolve exchange_id from market_data.exchanges (R2 1.3)
            exchange_id = None
            if exchange_code:
                cur.execute(
                    "SELECT id FROM market_data.exchanges WHERE exchange_code = %s AND status = 'ACTIVE' LIMIT 1",
                    (exchange_code,),
                )
                r = cur.fetchone()
                if r:
                    exchange_id = r[0]
            cur.execute("""
                INSERT INTO market_data.tickers (symbol, company_name, ticker_type, exchange_id, is_active, created_at, updated_at)
                SELECT %s, %s, %s, %s, true, NOW(), NOW()
                WHERE NOT EXISTS (SELECT 1 FROM market_data.tickers WHERE symbol = %s AND (deleted_at IS NULL))
            """, (symbol, company_name or "", ticker_type, exchange_id, symbol))
            if cur.rowcount > 0:
                inserted += 1
                ex = f" ({exchange_code})" if exchange_code else " (no exchange)"
                print(f"  ✅ {symbol} — {company_name or ''} [{ticker_type}]{ex}")
        conn.commit()
        cur.execute("SELECT COUNT(*) FROM market_data.tickers WHERE deleted_at IS NULL AND is_active = true")
        total = cur.fetchone()[0]
        print(f"\n✅ market_data.tickers: {total} tickers (inserted {inserted})")
        # GATE_3 R3 (1.2): EOD must run after seed so price_source is not null for AAPL/QQQ/SPY
        print("   💡 Next: run 'make sync-eod' so EOD prices fill and price_source is set.")
    finally:
        conn.close()


if __name__ == "__main__":
    print("🔄 Seeding market_data.tickers (R2: AAPL, GOOGL, AMZN, SPY, QQQ, TEVA.TA, BTC-USD, ANAU.MI; exchange_id set)")
    try:
        seed()
    except Exception as e:
        print(f"❌ {e}")
        sys.exit(1)
