#!/usr/bin/env python3
"""
Add trade_id column to cash_flows table
========================================

This migration adds a trade_id column to the cash_flows table to enable
optional linking of cash flows to trades. The column is nullable (optional)
and references the trades table.

The script is idempotent: it checks whether the column or related constraints
already exist before attempting to create them.

Author: TikTrack Development Team
Date: February 2025
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


def add_trade_id_column():
    """Add trade_id column and register constraints if needed."""
    db_path = get_db_path()
    print(f"➡️  Using database: {db_path}")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        print("🔍 Checking if 'trade_id' column already exists on cash_flows table...")
        if column_exists(cursor, 'cash_flows', 'trade_id'):
            print("✅ Column 'trade_id' already exists - skipping column creation.")
        else:
            print("➕ Adding 'trade_id' column (INTEGER NULLABLE)...")
            cursor.execute("ALTER TABLE cash_flows ADD COLUMN trade_id INTEGER;")
            print("✅ Column added successfully.")

        # Register FOREIGN KEY constraint in constraints table for validation service
        if constraint_exists(cursor, 'cash_flows', 'trade_id', 'FOREIGN KEY'):
            print("✅ FOREIGN KEY constraint already registered for trade_id.")
        else:
            print("📝 Registering FOREIGN KEY constraint for trade_id in constraints table...")
            cursor.execute(
                """
                INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 1, ?, ?)
                """,
                (
                    'cash_flows',
                    'trade_id',
                    'FOREIGN KEY',
                    'cash_flows_trade_id_fk',
                    'FOREIGN KEY (trade_id) REFERENCES trades(id)',
                    datetime.utcnow().isoformat(),
                    datetime.utcnow().isoformat()
                )
            )
            print("✅ FOREIGN KEY constraint registered.")

        # Register CUSTOM constraint for ticker matching validation
        # This ensures that if a cash flow has a trade_id, the ticker must match
        if constraint_exists(cursor, 'cash_flows', 'trade_id', 'CUSTOM'):
            print("✅ CUSTOM constraint already registered for trade_id ticker matching.")
        else:
            print("📝 Registering CUSTOM constraint for trade_id ticker matching...")
            cursor.execute(
                """
                INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 1, ?, ?)
                """,
                (
                    'cash_flows',
                    'trade_id',
                    'CUSTOM',
                    'cash_flows_trade_ticker_match',
                    'CASH_FLOW_TRADE_TICKER_MATCH|If trade_id is set, the cash flow trading_account_id must match the trade trading_account_id',
                    datetime.utcnow().isoformat(),
                    datetime.utcnow().isoformat()
                )
            )
            print("✅ CUSTOM constraint registered.")

        conn.commit()
        print("🎉 Migration completed successfully.")

    except sqlite3.Error as error:
        print(f"❌ SQLite error: {error}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    add_trade_id_column()

