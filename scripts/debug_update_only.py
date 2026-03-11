#!/usr/bin/env python3
"""מינימלי: חיבור חדש, רק UPDATE אחד, בלי SELECT קודם."""
import os
import sys
import time
sys.stdout.reconfigure(line_buffering=True) if hasattr(sys.stdout, 'reconfigure') else None
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

print("Connect...")
conn = psycopg2.connect(url)
conn.autocommit = False
cur = conn.cursor()

print("UPDATE (single row, partition 2026_03)...")
t0 = time.time()
cur.execute("""
    UPDATE market_data.ticker_prices_2026_03
    SET market_cap = 111
    WHERE id = '198cc2fa-954e-44b9-8738-79df70eef380'::uuid
""")
elapsed = time.time() - t0
print(f"  Done in {elapsed:.2f}s, rows={cur.rowcount}")

conn.rollback()  # don't persist
cur.close()
conn.close()
print("OK")
