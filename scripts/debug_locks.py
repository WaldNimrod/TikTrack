#!/usr/bin/env python3
"""מי מחזיק locks על ticker_prices?"""
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

print("=== Locks on ticker_prices* ===")
cur.execute("""
    SELECT l.pid, l.mode, l.granted, c.relname, a.state, a.query_start, left(a.query, 80)
    FROM pg_locks l
    JOIN pg_class c ON l.relation = c.oid
    JOIN pg_stat_activity a ON l.pid = a.pid
    WHERE c.relname LIKE 'ticker_prices%'
    ORDER BY l.granted, l.pid
""")
for r in cur.fetchall():
    print(f"  pid={r[0]} mode={r[1]} granted={r[2]} rel={r[3]} state={r[4]} q={r[6]}")

print("\n=== All non-idle connections ===")
cur.execute("""
    SELECT pid, state, wait_event_type, wait_event, left(query, 100)
    FROM pg_stat_activity
    WHERE datname = current_database() AND state != 'idle'
""")
for r in cur.fetchall():
    print(f"  pid={r[0]} state={r[1]} wait={r[2]}/{r[3]} q={r[4]}")

print("\n=== Idle in transaction ===")
cur.execute("""
    SELECT pid, state, query_start, left(query, 80)
    FROM pg_stat_activity
    WHERE datname = current_database() AND state = 'idle in transaction'
""")
for r in cur.fetchall():
    print(f"  pid={r[0]} since={r[2]} q={r[3]}")

cur.close()
conn.close()
print("Done")
