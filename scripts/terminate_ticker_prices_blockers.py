#!/usr/bin/env python3
"""
מפסיק connections שממתינים על ticker_prices (Lock/tuple וכו׳).
להריץ לפני backfill כשמזהים lock contention.
"""
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
conn.autocommit = True
cur = conn.cursor()

# Find pids that HOLD locks on ticker_prices (also catches COMMIT blockers)
cur.execute("""
    SELECT DISTINCT l.pid
    FROM pg_locks l
    JOIN pg_class c ON l.relation = c.oid
    WHERE c.relname LIKE 'ticker_prices%'
      AND l.pid != pg_backend_pid()
      AND l.granted = true
""")
lock_holders = [r[0] for r in cur.fetchall()]

cur.execute("""
    SELECT pid, state, wait_event_type, wait_event, left(query, 60)
    FROM pg_stat_activity
    WHERE datname = current_database()
      AND pid != pg_backend_pid()
      AND (query ILIKE '%ticker_prices%' OR query ILIKE '%market_cap%')
      AND state = 'active'
""")
rows = cur.fetchall()
all_targets = set(lock_holders) | {r[0] for r in rows}
if not all_targets:
    print("אין connections שחוסמים ticker_prices")
    conn.close()
    exit(0)

print(f"נמצאו {len(all_targets)} connections (holders או active):")
for pid in all_targets:
    cur.execute("SELECT state, wait_event_type, wait_event, left(query, 50) FROM pg_stat_activity WHERE pid = %s", (pid,))
    r = cur.fetchone()
    print(f"  pid={pid} state={r[0] if r else '?'} wait={r[1]}/{r[2] if r else '?'} q={r[3] if r else '?'}...")

# Kill all: lock holders + blockers
cur.execute("SELECT pg_backend_pid()")
my_pid = cur.fetchone()[0]
killed = 0
for pid in all_targets:
    if pid == my_pid:
        continue
    try:
        cur.execute("SELECT pg_terminate_backend(%s)", (pid,))
        if cur.fetchone()[0]:
            print(f"  terminated pid={pid}")
            killed += 1
    except Exception as e:
        print(f"  skip pid={pid}: {e}")

print(f"\nהופסקו {killed} connections")
cur.close()
conn.close()
