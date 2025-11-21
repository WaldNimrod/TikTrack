#!/usr/bin/env python3
"""
Upgrade currency exchange cash flows to the dedicated enum types.

This script updates existing records that were created with the legacy
'other_negative' / 'other_positive' types and share an external_id that starts
with 'exchange_' so the new UI filters can rely on the type itself.

Usage:
    python Backend/scripts/migrate_currency_exchange_types.py

An optional environment variable `TIKTRACK_DB_PATH` can be used to point the
script at a different SQLite database file (defaults to Backend/db/tiktrack.db).
"""

import os
import sqlite3
from typing import Tuple

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DB_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, '..', 'db', 'tiktrack.db'))
DB_PATH = os.environ.get('TIKTRACK_DB_PATH', DEFAULT_DB_PATH)

LEGACY_FROM = 'other_negative'
LEGACY_TO = 'other_positive'
NEW_FROM = 'currency_exchange_from'
NEW_TO = 'currency_exchange_to'


def _update_rows(cursor: sqlite3.Cursor, old_type: str, new_type: str) -> int:
    cursor.execute(
        """
        UPDATE cash_flows
        SET type = ?
        WHERE type = ?
          AND external_id LIKE 'exchange_%'
        """,
        (new_type, old_type),
    )
    return cursor.rowcount


def migrate() -> Tuple[int, int]:
    if not os.path.exists(DB_PATH):
        raise FileNotFoundError(f"Database file not found: {DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    conn.isolation_level = None  # use autocommit manually
    try:
        cursor = conn.cursor()
        cursor.execute('PRAGMA foreign_keys = ON;')
        cursor.execute('BEGIN;')

        updated_from = _update_rows(cursor, LEGACY_FROM, NEW_FROM)
        updated_to = _update_rows(cursor, LEGACY_TO, NEW_TO)

        conn.commit()
        print(f"✅ Migration complete. Updated {updated_from} outgoing and {updated_to} incoming exchange rows.")
        return updated_from, updated_to
    except Exception as exc:
        conn.rollback()
        print(f"❌ Migration failed: {exc}")
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    migrate()


