#!/usr/bin/env python3
"""
AUTO-WP003-05 — Debug backfill שלב אחר שלב.
מריצים כל שלב בנפרד ובודקים היכן נופלים.
"""
import os
import sys
from pathlib import Path

_project = Path(__file__).parent.parent
os.chdir(_project)
sys.path.insert(0, str(_project))

# 1) טעינת DATABASE_URL
env_file = _project / "api" / ".env"
DATABASE_URL = None
if env_file.exists():
    for line in env_file.read_text().splitlines():
        if line.startswith("DATABASE_URL=") and not line.strip().startswith("#"):
            DATABASE_URL = line.split("=", 1)[1].strip().strip("'\"")
            break
if not DATABASE_URL:
    DATABASE_URL = os.environ.get("DATABASE_URL")
if DATABASE_URL and "postgresql+asyncpg" in str(DATABASE_URL):
    DATABASE_URL = str(DATABASE_URL).replace("postgresql+asyncpg://", "postgresql://")

if not DATABASE_URL:
    print("❌ DATABASE_URL not set")
    sys.exit(1)

print("=" * 50)
print("Step 1: Connect")
import psycopg2
from psycopg2.extras import RealDictCursor

conn = psycopg2.connect(DATABASE_URL, connect_timeout=5)
print("  ✓ Connected")

print("\nStep 2: SELECT rows (CTE)")
cur = conn.cursor(cursor_factory=RealDictCursor)
cur.execute("SET lock_timeout = '2s'")
SYMBOLS = ["ANAU.MI", "BTC-USD", "TEVA.TA", "SPY"]
cur.execute("""
    WITH latest AS (
        SELECT DISTINCT ON (t.id) t.id AS ticker_id, t.symbol, tp.id AS price_row_id, tp.price_timestamp
        FROM market_data.tickers t
        JOIN market_data.ticker_prices tp ON tp.ticker_id = t.id
        WHERE t.symbol = ANY(%s) AND t.deleted_at IS NULL AND tp.market_cap IS NULL
        ORDER BY t.id, tp.price_timestamp DESC
    )
    SELECT ticker_id, symbol, price_row_id, price_timestamp FROM latest
""", (SYMBOLS,))
rows = cur.fetchall()
print(f"  ✓ Got {len(rows)} rows")
for r in rows:
    print(f"    {r['symbol']}: id={r['price_row_id']}, ts={r['price_timestamp']}")

# ערכים ידניים — רק לבדיקה שהעדכון עובד
pre = {"ANAU.MI": 500000000.0, "BTC-USD": 1414253236719.0, "TEVA.TA": 36709413000.0, "SPY": 500000000000.0}

print("\nStep 3: UPDATE each row")
for i, row in enumerate(rows):
    symbol = row["symbol"]
    mc = pre.get(symbol)
    pid = row["price_row_id"]
    pts = row["price_timestamp"]
    print(f"  3.{i+1} UPDATE {symbol} (id={pid}, ts={pts}) ...", end=" ", flush=True)
    try:
        cur.execute(
            "UPDATE market_data.ticker_prices SET market_cap = %s WHERE id = %s AND price_timestamp = %s",
            (mc, pid, pts),
        )
        print(f"OK (rows={cur.rowcount})")
    except Exception as e:
        print(f"FAIL: {e}")
        conn.rollback()
        sys.exit(1)

print("\nStep 4: Commit")
conn.commit()
print("  ✓ Committed")

cur.close()
conn.close()
print("\nStep 5: Verify")
conn2 = psycopg2.connect(DATABASE_URL)
cur2 = conn2.cursor()
cur2.execute("""
    SELECT t.symbol, tp.market_cap
    FROM market_data.tickers t
    JOIN market_data.ticker_prices tp ON tp.ticker_id = t.id
    WHERE t.symbol = ANY(%s) AND t.deleted_at IS NULL
    ORDER BY t.symbol, tp.price_timestamp DESC
""", (SYMBOLS,))
for r in cur2.fetchall():
    print(f"  {r[0]}: market_cap={r[1]}")
cur2.close()
conn2.close()

print("\n✓ Debug complete")
