#!/usr/bin/env python3
"""Run add_currency_conversion_flow_type migration. Uses psycopg2 (no psql required)."""
import sys
from pathlib import Path

try:
    import psycopg2
except ImportError:
    print("❌ psycopg2 required: pip install psycopg2-binary")
    sys.exit(1)

env_file = Path(__file__).parent.parent / "api" / ".env"
db_url = None
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            if line.startswith("DATABASE_URL=") and not line.startswith("#"):
                db_url = line.split("=", 1)[1].strip().strip('"').strip("'")
                break
if "postgresql+asyncpg://" in (db_url or ""):
    db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")

if not db_url:
    print("❌ DATABASE_URL not found in api/.env")
    sys.exit(1)

migration_file = Path(__file__).parent / "migrations" / "add_currency_conversion_flow_type.sql"
sql = migration_file.read_text()

# Remove BEGIN/COMMIT for psycopg2 autocommit=False
sql = sql.replace("BEGIN;\n\n", "").replace("\n\nCOMMIT;", "")

conn = psycopg2.connect(db_url)
conn.autocommit = False
try:
    conn.cursor().execute(sql)
    conn.commit()
    print("✅ Migration add_currency_conversion_flow_type applied successfully.")
except Exception as e:
    conn.rollback()
    print(f"❌ Migration failed: {e}")
    sys.exit(1)
finally:
    conn.close()
