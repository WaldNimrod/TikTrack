"""
Migration: Add external_account_number to trading_accounts table
Date: 2025-11-14
Description:
- Adds nullable TEXT column `external_account_number` so each trading account can be linked
  to a broker account number before imports.
- Creates a unique index (ignoring NULLs) to prevent duplicate mappings.
"""

import os
import sqlite3
from datetime import datetime


def _get_db_path() -> str:
    """Resolve the absolute path to the SQLite database file."""
    migrations_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.normpath(os.path.join(migrations_dir, "..", "db", "tiktrack.db"))


def migrate() -> bool:
    """Apply the migration."""
    db_path = _get_db_path()

    if not os.path.exists(db_path):
        print(f"❌ Database not found: {db_path}")
        return False

    conn = None
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Check existing columns
        cursor.execute("PRAGMA table_info(trading_accounts)")
        columns = [column[1] for column in cursor.fetchall()]

        if "external_account_number" not in columns:
            cursor.execute(
                """
                ALTER TABLE trading_accounts
                ADD COLUMN external_account_number TEXT
                """
            )
            print("✅ Added external_account_number column to trading_accounts")
        else:
            print("ℹ️ Column external_account_number already exists. Skipping add step.")

        # Create unique index (ignores NULL values)
        cursor.execute(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS idx_trading_accounts_external_account_number
            ON trading_accounts (external_account_number)
            WHERE external_account_number IS NOT NULL
            """
        )
        print("✅ Ensured unique index on external_account_number")

        conn.commit()
        return True
    except Exception as exc:
        if conn:
            conn.rollback()
        print(f"❌ Migration failed: {exc}")
        return False
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    print("🔄 Starting migration: Add external_account_number to trading_accounts table")
    print(f"⏰ Migration started at: {datetime.now().isoformat()}")
    print("=" * 70)

    success = migrate()

    print("=" * 70)
    if success:
        print("✅ Migration completed successfully")
        print(f"⏰ Completed at: {datetime.now().isoformat()}")
    else:
        print("❌ Migration failed")
        raise SystemExit(1)


