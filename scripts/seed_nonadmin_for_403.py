#!/usr/bin/env python3
"""
Seed Non-Admin User for 403 Testing (MD-SETTINGS Gate-B)
Team 50 (QA & Fidelity) — TEAM_10_TO_TEAM_50_MARKET_DATA_SETTINGS_403_EVIDENCE_REQUEST
Purpose: Create USER-role user (qa_nonadmin / qa403test) for 403 non-admin verification.
"""
import sys
from pathlib import Path

try:
    import psycopg2
except ImportError:
    print("❌ psycopg2 required. Run: pip install psycopg2-binary")
    sys.exit(1)

env_file = Path(__file__).parent.parent / "api" / ".env"
DATABASE_URL = None
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            if line.startswith("DATABASE_URL=") and not line.startswith("#"):
                DATABASE_URL = line.split("=", 1)[1].strip().strip('"').strip("'")
                break

if not DATABASE_URL:
    print("❌ DATABASE_URL not found in api/.env")
    sys.exit(1)

db_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://") if "postgresql+asyncpg://" in DATABASE_URL else DATABASE_URL

def main():
    sql_file = Path(__file__).parent / "seed_nonadmin_for_403.sql"
    if not sql_file.exists():
        print(f"❌ {sql_file} not found")
        sys.exit(1)
    try:
        conn = psycopg2.connect(db_url)
        with conn.cursor() as cur:
            cur.execute(sql_file.read_text())
        conn.commit()
        conn.close()
        print("✅ Non-admin user qa_nonadmin / qa403test seeded (role USER)")
    except Exception as e:
        print(f"❌ {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
