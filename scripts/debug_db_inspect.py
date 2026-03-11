#!/usr/bin/env python3
"""בדיקת מבנה DB — אינדקסים, פרטיציות, גודל."""
import os
from pathlib import Path

_project = Path(__file__).parent.parent
env = _project / "api" / ".env"
url = None
if env.exists():
    for line in env.read_text().splitlines():
        if line.startswith("DATABASE_URL=") and not line.strip().startswith("#"):
            url = line.split("=", 1)[1].strip().strip("'\"")
            break
if not url:
    url = os.environ.get("DATABASE_URL")
if url and "asyncpg" in url:
    url = url.replace("postgresql+asyncpg://", "postgresql://")

import psycopg2

conn = psycopg2.connect(url)
cur = conn.cursor()

print("=== Partitions of ticker_prices ===")
cur.execute("""
    SELECT inhrelid::regclass AS partition_name
    FROM pg_inherits
    WHERE inhparent = 'market_data.ticker_prices'::regclass
    ORDER BY 1
""")
for r in cur.fetchall():
    print(f"  {r[0]}")

print("\n=== Indexes on ticker_prices_2026_03 ===")
cur.execute("""
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'ticker_prices_2026_03'
""")
for r in cur.fetchall():
    print(f"  {r[0]}")
    print(f"    {r[1][:100]}...")

print("\n=== Row count per partition ===")
cur.execute("""
    SELECT relname, n_live_tup
    FROM pg_stat_user_tables
    WHERE schemaname = 'market_data' AND relname LIKE 'ticker_prices_%'
    ORDER BY relname
""")
for r in cur.fetchall():
    print(f"  {r[0]}: ~{r[1]} rows")

print("\n=== EXPLAIN UPDATE (no run) ===")
cur.execute("""
    EXPLAIN (ANALYZE false, FORMAT TEXT)
    UPDATE market_data.ticker_prices_2026_03
    SET market_cap = 123
    WHERE id = '198cc2fa-954e-44b9-8738-79df70eef380'::uuid
""")
for r in cur.fetchall():
    print(f"  {r[0]}")

cur.close()
conn.close()
print("\n=== RLS on ticker_prices ===")
conn2 = psycopg2.connect(url)
cur2 = conn2.cursor()
cur2.execute("""
    SELECT relrowsecurity, relforcerowsecurity
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'market_data' AND c.relname = 'ticker_prices'
""")
r = cur2.fetchone()
print(f"  rowsecurity={r[0]}, forcerow={r[1]}" if r else "  (not found)")
cur2.execute("SELECT count(*) FROM pg_policy WHERE polrelid = 'market_data.ticker_prices'::regclass")
print(f"  policies: {cur2.fetchone()[0]}")

print("\n=== Active queries (not idle) ===")
cur2.execute("""
    SELECT pid, state, wait_event_type, wait_event, left(query, 100)
    FROM pg_stat_activity
    WHERE datname = current_database() AND pid != pg_backend_pid()
""")
for r in cur2.fetchall():
    print(f"  pid={r[0]} state={r[1]} wait={r[2]}/{r[3]} q={r[4]}")
cur2.close()
conn2.close()

print("\nDone")
