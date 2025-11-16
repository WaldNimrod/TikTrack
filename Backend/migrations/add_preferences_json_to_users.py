"""
Migration: add preferences_json column to users table
----------------------------------------------------
Purpose:
- Align existing SQLite databases with the User SQLAlchemy model, which defines
  a legacy/deprecated preferences_json field kept for backward compatibility.

Notes:
- This column is nullable and does not change any primary keys or constraints.
- Safe to run multiple times: uses `ALTER TABLE` inside a guard.
"""

import sqlite3
import os


def get_db_path() -> str:
    """
    Resolve the path to the tiktrack SQLite database used in development.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_dir, "db", "tiktrack.db")


def column_exists(cursor: sqlite3.Cursor, table: str, column: str) -> bool:
    cursor.execute(f"PRAGMA table_info({table});")
    rows = cursor.fetchall()
    return any(row[1] == column for row in rows)


def migrate() -> None:
    """
    Apply migration: add preferences_json TEXT column to users table if missing.
    """
    db_path = get_db_path()
    conn = sqlite3.connect(db_path)
    try:
        cursor = conn.cursor()
        if not column_exists(cursor, "users", "preferences_json"):
            cursor.execute("ALTER TABLE users ADD COLUMN preferences_json TEXT;")
            conn.commit()
        else:
            # Nothing to do – column already exists
            pass
    finally:
        conn.close()


if __name__ == "__main__":
    migrate()


