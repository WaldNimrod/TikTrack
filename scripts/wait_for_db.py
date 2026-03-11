#!/usr/bin/env python3
"""Wait for PostgreSQL to be ready (reads DATABASE_URL from api/.env). Exit 0 if ready, 1 otherwise."""
import os
import sys
from pathlib import Path

try:
    import psycopg2
except ImportError:
    sys.exit(1)

env_path = Path(__file__).resolve().parent.parent / "api" / ".env"
url = None
if env_path.exists():
    for line in env_path.read_text().splitlines():
        if line.startswith("DATABASE_URL=") and not line.strip().startswith("#"):
            url = line.split("=", 1)[1].strip().strip('"').strip("'")
            break
if not url:
    url = os.environ.get("DATABASE_URL", "")
if url and "asyncpg" in str(url):
    url = str(url).replace("postgresql+asyncpg://", "postgresql://")
if not url or "postgresql" not in url:
    sys.exit(1)
try:
    conn = psycopg2.connect(url, connect_timeout=2)
    conn.close()
    sys.exit(0)
except Exception:
    sys.exit(1)
