#!/usr/bin/env python3
"""
TikTrack – SQLite → PostgreSQL data migration helper.

Copies the reference tables (users, preferences, constraints, currencies, system settings, etc.)
from the legacy SQLite database into the new PostgreSQL instance.

Usage:
  SQLITE_MIGRATION_PATH=Backend/db/tiktrack.db DATABASE_URL=postgresql+psycopg2://... \
  python scripts/db/migrate_sqlite_to_pg.py
"""

from __future__ import annotations

import os
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Sequence

from sqlalchemy import MetaData, Table, create_engine
from sqlalchemy.engine import Engine


DEFAULT_SQLITE = Path("Backend/db/tiktrack.db")
SQLITE_PATH = Path(os.getenv("SQLITE_MIGRATION_PATH", DEFAULT_SQLITE))
POSTGRES_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://tiktrack:tiktrack_dev_password@localhost:5432/tiktrack_dev",
)

# Target tables (PostgreSQL) → Source tables (SQLite)
# ORDER MATTERS: Parent tables must be copied before child tables
# Group B: Users, Preferences, Trading Methods (ordered by dependencies)
TABLE_MAP: Dict[str, str] = {
    # Level 1: No dependencies
    "users": "users",
    "preference_groups": "preference_groups",  # Must be before preference_types
    "preference_profiles": "preference_profiles",  # Must be before user_preferences
    "currencies": "currencies",  # Must be before tickers/quotes
    "external_data_providers": "external_data_providers",
    "trading_methods": "trading_methods",
    "note_relation_types": "note_relation_types",
    "tag_categories": "tag_categories",  # Must be before tags
    "system_setting_groups": "system_setting_groups",
    # Level 2: Depend on Level 1
    "preference_types": "preference_types",  # Depends on preference_groups
    "user_preferences": "user_preferences_v3",  # Depends on preference_profiles, preference_types
    "preferences_legacy": "preferences_legacy",  # preserve as backup/history
    "method_parameters": "method_parameters",  # Depends on trading_methods
    "tags": "tags",  # Depends on tag_categories
    "system_setting_types": "system_setting_types",  # Depends on system_setting_groups
    "system_settings": "system_settings",  # Depends on system_setting_types
    # Group C: Constraints and Connectivity
    "constraints": "constraints",  # Must be before enum_values
    "constraint_validations": "constraint_validations",  # Depends on constraints
    "enum_values": "enum_values",  # Depends on constraints
    # Group D: Currencies and Financial Aux Data
    # Note: quotes_last depends on tickers, but tickers are Group A (not migrated)
    # So we skip quotes_last or handle it separately
    # "quotes_last": "quotes_last",  # Skip - depends on tickers which aren't migrated
}


@dataclass
class TableCopyResult:
    name: str
    rows_copied: int


def ensure_inputs() -> None:
    if not SQLITE_PATH.exists():
        raise FileNotFoundError(f"SQLite database not found at {SQLITE_PATH}")
    if "psycopg2" not in POSTGRES_URL:
        raise RuntimeError(
            "DATABASE_URL must use the psycopg2 driver (postgresql+psycopg2://)."
        )


def fetch_rows(sqlite_conn: sqlite3.Connection, table: str) -> List[Dict]:
    cursor = sqlite_conn.cursor()
    cursor.row_factory = sqlite3.Row
    rows = cursor.execute(f"SELECT * FROM {table}").fetchall()
    return [dict(row) for row in rows]


def disable_fk_constraints(engine: Engine) -> None:
    # Try to disable FK constraints, but continue if permission denied
    try:
        with engine.begin() as conn:
            conn.exec_driver_sql("SET session_replication_role = replica;")
    except Exception:
        # If we don't have permission, we'll proceed anyway
        # Foreign key constraints will be checked during insert
        pass


def enable_fk_constraints(engine: Engine) -> None:
    # Try to enable FK constraints, but continue if permission denied
    try:
        with engine.begin() as conn:
            conn.exec_driver_sql("SET session_replication_role = DEFAULT;")
    except Exception:
        pass


def truncate_table(engine: Engine, table: Table) -> None:
    with engine.begin() as conn:
        conn.execute(table.delete())


def insert_rows(engine: Engine, table: Table, rows: Sequence[Dict]) -> None:
    if not rows:
        return
    with engine.begin() as conn:
        conn.execute(table.insert(), rows)


def copy_table(
    sqlite_conn: sqlite3.Connection, engine: Engine, metadata: MetaData, target: str, source: str
) -> TableCopyResult:
    # Refresh metadata to avoid conflicts
    metadata.clear()
    table = Table(target, metadata, autoload_with=engine, schema='public')
    rows = fetch_rows(sqlite_conn, source)
    truncate_table(engine, table)
    insert_rows(engine, table, rows)
    return TableCopyResult(name=target, rows_copied=len(rows))


def main() -> None:
    ensure_inputs()
    sqlite_conn = sqlite3.connect(str(SQLITE_PATH))
    engine = create_engine(POSTGRES_URL)
    metadata = MetaData()

    disable_fk_constraints(engine)
    results: List[TableCopyResult] = []
    try:
        for target, source in TABLE_MAP.items():
            try:
                result = copy_table(sqlite_conn, engine, metadata, target, source)
                results.append(result)
                print(f"✅ {target}: copied {result.rows_copied} rows from {source}")
            except sqlite3.OperationalError as exc:
                print(f"⚠️  Skipping {target}: source table '{source}' missing ({exc})")
            except Exception as exc:
                print(f"❌ Failed to copy {target}: {exc}")
                raise
    finally:
        enable_fk_constraints(engine)
        sqlite_conn.close()

    print("\nMigration summary:")
    for result in results:
        print(f" - {result.name}: {result.rows_copied} rows copied")


if __name__ == "__main__":
    main()



