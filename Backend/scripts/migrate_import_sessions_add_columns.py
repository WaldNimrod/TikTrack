#!/usr/bin/env python3
"""
Migration Script: Extend import_sessions schema with connector/task metadata
=======================================================================

Purpose:
    - Add `connector_type` column (VARCHAR(50))
    - Add `task_type` column (VARCHAR(50), default 'executions')
    - Backfill legacy rows so both columns contain meaningful values
    - Create supporting indexes to preserve query performance

Usage:
    python3 Backend/scripts/migrate_import_sessions_add_columns.py \
        --db-path /path/to/simpleTrade_new.db \
        --backup-dir /path/to/backup/dir

Notes:
    * If `--backup-dir` is provided, the script will create a timestamped copy
      of the database before applying any changes.
    * All operations are idempotent – rerunning the script is safe.
"""

import argparse
import datetime
import shutil
import sqlite3
import sys
from pathlib import Path
from typing import Optional

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DB_PATH = PROJECT_ROOT / "db" / "simpleTrade_new.db"


def backup_database(db_path: Path, backup_dir: Optional[Path]) -> None:
    """Create a timestamped backup of the database file."""
    if not backup_dir:
        return

    backup_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = backup_dir / f"{db_path.stem}_backup_{timestamp}{db_path.suffix}"

    shutil.copy2(db_path, backup_file)
    print(f"✅ Database backup created at: {backup_file}")


def column_exists(cursor: sqlite3.Cursor, table: str, column: str) -> bool:
    """Check if a column exists in a SQLite table."""
    cursor.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cursor.fetchall())


def create_index(cursor: sqlite3.Cursor, name: str, table: str, column: str) -> None:
    """Create an index if it does not already exist."""
    cursor.execute(
        f"CREATE INDEX IF NOT EXISTS {name} ON {table}({column})"
    )


def run_migration(db_path: Path, backup_dir: Optional[Path]) -> None:
    """Execute the schema and data updates."""
    if not db_path.exists():
        raise FileNotFoundError(f"Database file not found: {db_path}")

    print("=" * 70)
    print("🚀 Starting import_sessions schema migration")
    print("=" * 70)
    print(f"📁 Database: {db_path}")
    print(f"⏰ Time: {datetime.datetime.now().isoformat()}")
    print()

    backup_database(db_path, backup_dir)

    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()

    try:
        # 1. Add connector_type column
        if not column_exists(cursor, "import_sessions", "connector_type"):
            print("1️⃣ Adding connector_type column...")
            cursor.execute(
                "ALTER TABLE import_sessions ADD COLUMN connector_type VARCHAR(50)"
            )
            print("   ✅ connector_type added")
        else:
            print("1️⃣ connector_type column already exists – skipping")

        # 2. Add task_type column (with default)
        if not column_exists(cursor, "import_sessions", "task_type"):
            print("2️⃣ Adding task_type column...")
            cursor.execute(
                "ALTER TABLE import_sessions ADD COLUMN task_type VARCHAR(50) DEFAULT 'executions'"
            )
            print("   ✅ task_type added")
        else:
            print("2️⃣ task_type column already exists – skipping")

        # 3. Backfill legacy rows
        print("3️⃣ Backfilling legacy rows...")
        cursor.execute(
            "UPDATE import_sessions "
            "SET connector_type = LOWER(provider) "
            "WHERE connector_type IS NULL OR connector_type = ''"
        )
        connector_updates = cursor.rowcount

        cursor.execute(
            "UPDATE import_sessions "
            "SET task_type = 'executions' "
            "WHERE task_type IS NULL OR task_type = ''"
        )
        task_updates = cursor.rowcount
        print(f"   ✅ Updated {connector_updates} connector_type values")
        print(f"   ✅ Updated {task_updates} task_type values")

        # 4. Create indexes
        print("4️⃣ Creating indexes...")
        create_index(cursor, "idx_import_sessions_connector_type", "import_sessions", "connector_type")
        create_index(cursor, "idx_import_sessions_task_type", "import_sessions", "task_type")
        print("   ✅ Indexes ensured")

        conn.commit()
        print("\n✅ Migration completed successfully!")

    except Exception as exc:  # pragma: no cover - defensive
        conn.rollback()
        print(f"\n❌ Migration failed: {exc}")
        raise
    finally:
        conn.close()


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Add connector/task metadata columns to import_sessions table."
    )
    parser.add_argument(
        "--db-path",
        type=Path,
        default=DEFAULT_DB_PATH,
        help=f"Path to SQLite database (default: {DEFAULT_DB_PATH})",
    )
    parser.add_argument(
        "--backup-dir",
        type=Path,
        default=None,
        help="Directory to store a timestamped backup before migration.",
    )
    return parser.parse_args(argv)


def main(argv: list[str]) -> None:
    args = parse_args(argv)
    run_migration(args.db_path, args.backup_dir)


if __name__ == "__main__":
    main(sys.argv[1:])


