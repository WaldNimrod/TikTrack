#!/usr/bin/env python3
"""מידע על pid 67415."""
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
cur.execute("""
    SELECT pid, usename, application_name, client_addr, client_port, backend_start, state, query_start, wait_event_type, wait_event, left(query, 200)
    FROM pg_stat_activity WHERE pid = 67415
""")
r = cur.fetchone()
print("pid 67415:", r)
cur.close()
conn.close()
