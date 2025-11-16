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
# Group B: Users, Preferences, Trading Methods
TABLE_MAP: Dict[str, str] = {
    "users": "users",
    "preference_types": "preference_types",
    "preference_groups": "preference_groups",
    "preference_profiles": "preference_profiles",
    "user_preferences": "user_preferences_v3",  # consolidate onto a single canonical table
    "preferences_legacy": "preferences_legacy",  # preserve as backup/history
    "trading_methods": "trading_methods",
    "method_parameters": "method_parameters",
    # Group C: Constraints and Connectivity
    "constraints": "constraints",
    "constraint_validations": "constraint_validations",
    "enum_values": "enum_values",
    "note_relation_types": "note_relation_types",
    "link_types": "link_types",  # if exists
    # Group D: Currencies and Financial Aux Data
    "currencies": "currencies",
    "external_data_providers": "external_data_providers",
    "quotes_last": "quotes_last",  # cache table for last quotes
    # Group E: System Configuration
    "system_setting_types": "system_setting_types",
    "system_settings": "system_settings",
    "system_setting_groups": "system_setting_groups",
    "system_setting_profiles": "system_setting_profiles",  # if exists
    # Group F: Tags System
    "tag_categories": "tag_categories",
    "tags": "tags",
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
    with engine.begin() as conn:
        conn.exec_driver_sql("SET session_replication_role = replica;")


def enable_fk_constraints(engine: Engine) -> None:
    with engine.begin() as conn:
        conn.exec_driver_sql("SET session_replication_role = DEFAULT;")


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
    table = Table(target, metadata, autoload_with=engine)
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



