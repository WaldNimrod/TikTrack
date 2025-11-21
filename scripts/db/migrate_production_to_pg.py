#!/usr/bin/env python3
"""
TikTrack Production – SQLite → PostgreSQL data migration helper.

Copies only system configuration tables (not user data) from production SQLite
database into the new PostgreSQL production database.

System tables migrated:
- users (base accounts)
- preference_groups, preference_types, preference_profiles
- currencies
- external_data_providers
- trading_methods, method_parameters
- note_relation_types
- tag_categories
- system_setting_groups, system_setting_types, system_settings
- constraints, constraint_validations, enum_values

User data tables EXCLUDED:
- tickers, trades, trade_plans, executions, cash_flows
- trading_accounts, alerts, notes, tags

Usage:
  SQLITE_MIGRATION_PATH=/path/to/production/tiktrack.db \
  POSTGRES_HOST=localhost \
  POSTGRES_DB=TikTrack-db-production \
  POSTGRES_USER=TikTrakDBAdmin \
  POSTGRES_PASSWORD="BigMeZoo1974!?" \
  python scripts/db/migrate_production_to_pg.py
"""

from __future__ import annotations

import os
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Sequence

from sqlalchemy import MetaData, Table, create_engine
from sqlalchemy.engine import Engine


SQLITE_PATH = Path(os.getenv("SQLITE_MIGRATION_PATH", ""))
if not SQLITE_PATH:
    raise ValueError("SQLITE_MIGRATION_PATH environment variable must be set")

POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_DB = os.getenv("POSTGRES_DB", "TikTrack-db-production")
POSTGRES_USER = os.getenv("POSTGRES_USER", "TikTrakDBAdmin")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "BigMeZoo1974!?")

POSTGRES_URL = (
    f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASSWORD}"
    f"@{POSTGRES_HOST}:5432/{POSTGRES_DB}"
)

# System tables only (no user data)
# ORDER MATTERS: Parent tables must be copied before child tables
TABLE_MAP: Dict[str, str] = {
    # Level 1: No dependencies
    "users": "users",
    "preference_groups": "preference_groups",  # Must be before preference_types
    "preference_profiles": "preference_profiles",  # Must be before user_preferences
    "currencies": "currencies",
    "external_data_providers": "external_data_providers",
    "trading_methods": "trading_methods",
    "note_relation_types": "note_relation_types",
    "tag_categories": "tag_categories",  # Must be before tags (but tags not migrated)
    "system_setting_groups": "system_setting_groups",
    # Level 2: Depend on Level 1
    "preference_types": "preference_types",  # Depends on preference_groups
    "user_preferences": "user_preferences_v3",  # Depends on preference_profiles, preference_types
    "preferences_legacy": "preferences_legacy",  # preserve as backup/history
    "method_parameters": "method_parameters",  # Depends on trading_methods
    "system_setting_types": "system_setting_types",  # Depends on system_setting_groups
    "system_settings": "system_settings",  # Depends on system_setting_types
    # Group C: Constraints and Connectivity
    "constraints": "constraints",  # Must be before enum_values
    "constraint_validations": "constraint_validations",  # Depends on constraints
    "enum_values": "enum_values",  # Depends on constraints
}

# User data tables that are EXCLUDED (for reference):
EXCLUDED_TABLES = [
    "tickers",
    "trades",
    "trade_plans",
    "executions",
    "cash_flows",
    "trading_accounts",
    "alerts",
    "notes",
    "tags",  # User-created tags (tag_categories is system)
]


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


def get_valid_ids(engine: Engine, table_name: str, id_column: str = "id") -> set:
    """Get valid IDs from a table for foreign key filtering"""
    try:
        metadata = MetaData()
        table = Table(table_name, metadata, autoload_with=engine, schema='public')
        with engine.connect() as conn:
            result = conn.execute(table.select(table.c[id_column]))
            return {row[0] for row in result}
    except Exception:
        return set()


def copy_table(
    sqlite_conn: sqlite3.Connection, engine: Engine, metadata: MetaData, target: str, source: str
) -> TableCopyResult:
    # Refresh metadata to avoid conflicts
    metadata.clear()
    table = Table(target, metadata, autoload_with=engine, schema='public')
    rows = fetch_rows(sqlite_conn, source)
    
    # Filter rows with invalid foreign keys for specific tables
    if target == "user_preferences":
        # Filter by valid profile_id and preference_id
        valid_profiles = get_valid_ids(engine, "preference_profiles")
        valid_preferences = get_valid_ids(engine, "preference_types")
        rows = [
            r for r in rows
            if r.get("profile_id") in valid_profiles and r.get("preference_id") in valid_preferences
        ]
    elif target == "enum_values":
        # Filter by valid constraint_id
        valid_constraints = get_valid_ids(engine, "constraints")
        rows = [r for r in rows if r.get("constraint_id") in valid_constraints]
    elif target == "constraint_validations":
        # Filter by valid constraint_id
        valid_constraints = get_valid_ids(engine, "constraints")
        rows = [r for r in rows if r.get("constraint_id") in valid_constraints]
    elif target == "preference_types":
        # Filter by valid group_id
        valid_groups = get_valid_ids(engine, "preference_groups")
        rows = [r for r in rows if r.get("group_id") in valid_groups]
    elif target == "method_parameters":
        # Filter by valid method_id
        valid_methods = get_valid_ids(engine, "trading_methods")
        rows = [r for r in rows if r.get("method_id") in valid_methods]
    elif target == "system_setting_types":
        # Filter by valid group_id
        valid_groups = get_valid_ids(engine, "system_setting_groups")
        rows = [r for r in rows if r.get("group_id") in valid_groups]
    elif target == "system_settings":
        # Filter by valid type_id
        valid_types = get_valid_ids(engine, "system_setting_types")
        rows = [r for r in rows if r.get("type_id") in valid_types]
    
    truncate_table(engine, table)
    insert_rows(engine, table, rows)
    return TableCopyResult(name=target, rows_copied=len(rows))


def main() -> None:
    ensure_inputs()
    
    # Safety check: verify database name
    if "production" not in POSTGRES_DB.lower():
        print("⚠️  WARNING: Database name does not contain 'production'")
        print(f"   Current: {POSTGRES_DB}")
        print("   Expected: TikTrack-db-production")
        response = input("Continue anyway? (y/N): ")
        if response.lower() != 'y':
            print("Aborted.")
            return
    
    sqlite_conn = sqlite3.connect(str(SQLITE_PATH))
    engine = create_engine(POSTGRES_URL)
    metadata = MetaData()

    print("=" * 80)
    print("TikTrack Production Database Migration")
    print("=" * 80)
    print(f"Source SQLite: {SQLITE_PATH}")
    print(f"Target PostgreSQL: {POSTGRES_DB} on {POSTGRES_HOST}")
    print(f"Tables to migrate: {len(TABLE_MAP)} system tables")
    print(f"Excluded tables: {', '.join(EXCLUDED_TABLES)}")
    print("=" * 80)
    print()

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

    print()
    print("=" * 80)
    print("Migration Summary")
    print("=" * 80)
    total_rows = sum(r.rows_copied for r in results)
    print(f"Total tables migrated: {len(results)}")
    print(f"Total rows copied: {total_rows}")
    print()
    for result in results:
        print(f"  {result.name}: {result.rows_copied} rows")
    print("=" * 80)


if __name__ == "__main__":
    main()


