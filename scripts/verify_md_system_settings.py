#!/usr/bin/env python3
"""
Verify market_data.system_settings table exists in the DB that api/.env uses.
Team 60 — MD-SETTINGS Gate-A diagnostic.
"""
import os
import sys
from pathlib import Path

# Load api/.env
_project = Path(__file__).resolve().parent.parent
env_file = _project / "api" / ".env"
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line.startswith("DATABASE_URL=") and not line.startswith("#"):
                url = line.split("=", 1)[1].strip().strip("'\"").strip()
                os.environ["DATABASE_URL"] = url
                break

url = os.environ.get("DATABASE_URL")
if not url:
    print("❌ DATABASE_URL not found in api/.env")
    sys.exit(1)

# Convert asyncpg to psycopg2
if "postgresql+asyncpg" in url:
    url = url.replace("postgresql+asyncpg://", "postgresql://")

# Extract db name for display
try:
    # postgresql://user:pass@host:port/dbname
    db_part = url.split("/")[-1].split("?")[0]
    print(f"DB from DATABASE_URL: {db_part}")
except Exception:
    db_part = "?"

print(f"Makefile migration target: TikTrack-phoenix-db (docker tiktrack-postgres-dev)")
print("")

try:
    import psycopg2
    conn = psycopg2.connect(url)
    cur = conn.cursor()
    cur.execute("""
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'market_data' AND table_name = 'system_settings'
        )
    """)
    exists = cur.fetchone()[0]
    cur.close()
    conn.close()
    if exists:
        print("✅ market_data.system_settings EXISTS in the DB that api/.env uses")
        sys.exit(0)
    else:
        print("❌ market_data.system_settings NOT FOUND in the DB that api/.env uses")
        print("")
        print("Fix: Run migration against the SAME database:")
        print("  Option A: If using Docker (tiktrack-postgres-dev): make migrate-md-settings")
        print("  Option B: If api/.env uses different DB, run:")
        print(f"    psql $DATABASE_URL -f scripts/migrations/md_system_settings.sql")
        sys.exit(1)
except Exception as e:
    print(f"❌ Connection/query failed: {e}")
    print("")
    print("Ensure DATABASE_URL in api/.env is correct and PostgreSQL is running.")
    sys.exit(1)
