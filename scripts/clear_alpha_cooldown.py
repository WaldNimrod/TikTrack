#!/usr/bin/env python3
"""
Clear Alpha Vantage cooldown from DB (QA/dev unblock).
Removes alpha_cooldown_until from market_data.system_settings so next sync can use Alpha.
Team 60 — when "enough time passed" but Alpha still skipped: cooldown is persisted in DB.
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
    print("❌ DATABASE_URL not set")
    sys.exit(1)
if "postgresql+asyncpg" in str(DATABASE_URL):
    DATABASE_URL = str(DATABASE_URL).replace("postgresql+asyncpg://", "postgresql://")

def main():
    import psycopg2
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM market_data.system_settings WHERE key = 'alpha_cooldown_until'")
        conn.commit()
        n = cur.rowcount
        if n:
            print("✅ Cleared alpha_cooldown_until from market_data.system_settings (Alpha will be tried on next sync)")
        else:
            print("ℹ️ No alpha_cooldown_until row in DB (already clear)")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
    sys.exit(0)
