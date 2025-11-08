#!/usr/bin/env python3
"""
Add fee_amount column to cash_flows table
=========================================

This migration adds a dedicated fee_amount column to the cash_flows table so that
each cash flow entry can persist its fee in the trading account's base currency.

The script is idempotent: it checks whether the column or related constraints
already exist before attempting to create them.

Author: TikTrack Development Team
Date: November 2025
"""

import os
import sqlite3
from datetime import datetime


DB_RELATIVE_PATH = os.path.join('..', 'db', 'simpleTrade_new.db')


def get_db_path() -> str:
    """Return absolute path to the SQLite database file."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(current_dir, DB_RELATIVE_PATH)


def column_exists(cursor: sqlite3.Cursor, table: str, column: str) -> bool:
    """Check whether a specific column exists in a table."""
    cursor.execute(f"PRAGMA table_info({table});")
    columns = cursor.fetchall()
    return any(col[1] == column for col in columns)


def constraint_exists(cursor: sqlite3.Cursor, table: str, column: str, constraint_type: str) -> bool:
    """Check whether a constraint entry already exists in the constraints table."""
    cursor.execute(
        """
        SELECT 1
        FROM constraints
        WHERE table_name = ?
          AND column_name = ?
          AND constraint_type = ?
          AND is_active = 1
        LIMIT 1
        """,
        (table, column, constraint_type)
    )
    return cursor.fetchone() is not None


def add_fee_amount_column():
    """Add fee_amount column and register constraints if needed."""
    db_path = get_db_path()
    print(f"➡️  Using database: {db_path}")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        print("🔍 Checking if 'fee_amount' column already exists on cash_flows table...")
        if column_exists(cursor, 'cash_flows', 'fee_amount'):
            print("✅ Column 'fee_amount' already exists - skipping column creation.")
        else:
            print("➕ Adding 'fee_amount' column (FLOAT NOT NULL DEFAULT 0)...")
            cursor.execute("ALTER TABLE cash_flows ADD COLUMN fee_amount FLOAT NOT NULL DEFAULT 0;")
            print("✅ Column added successfully.")

        print("🔄 Ensuring existing records have fee_amount values (default 0)...")
        cursor.execute("UPDATE cash_flows SET fee_amount = 0 WHERE fee_amount IS NULL;")

        # Register NOT NULL constraint in constraints table for validation service
        if constraint_exists(cursor, 'cash_flows', 'fee_amount', 'NOT_NULL'):
            print("✅ NOT_NULL constraint already registered for fee_amount.")
        else:
            print("📝 Registering NOT_NULL constraint for fee_amount in constraints table...")
            cursor.execute(
                """
                INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 1, ?, ?)
                """,
                (
                    'cash_flows',
                    'fee_amount',
                    'NOT_NULL',
                    'cash_flows_fee_amount_not_null',
                    'fee_amount IS NOT NULL',
                    datetime.utcnow().isoformat(),
                    datetime.utcnow().isoformat()
                )
            )
            print("✅ NOT_NULL constraint registered.")

        # Register RANGE constraint (fee_amount >= 0)
        if constraint_exists(cursor, 'cash_flows', 'fee_amount', 'RANGE'):
            print("✅ RANGE constraint already registered for fee_amount.")
        else:
            print("📝 Registering RANGE constraint for non-negative fee_amount...")
            cursor.execute(
                """
                INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 1, ?, ?)
                """,
                (
                    'cash_flows',
                    'fee_amount',
                    'RANGE',
                    'cash_flows_fee_amount_non_negative',
                    'fee_amount >= 0',
                    datetime.utcnow().isoformat(),
                    datetime.utcnow().isoformat()
                )
            )
            print("✅ RANGE constraint registered.")

        conn.commit()
        print("🎉 Migration completed successfully.")

    except sqlite3.Error as error:
        print(f"❌ SQLite error: {error}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    add_fee_amount_column()

