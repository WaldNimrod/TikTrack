#!/usr/bin/env python3
"""
TikTrack Schema Guard
=====================

Validates that a target SQLite database matches the canonical schema stored in
`_Tmp/simpleTrade_new.db`. The script compares table definitions (including
column order, types, nullability, default values, and primary keys), indexes,
and triggers. It also verifies critical reference data unless skipped.
"""

from __future__ import annotations

import argparse
import sqlite3
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Sequence, Tuple

DEFAULT_BASELINE = Path("_Tmp/simpleTrade_new.db")
DEFAULT_TARGET = Path("Backend/db/tiktrack.db")


@dataclass(frozen=True)
class ColumnInfo:
    name: str
    type: str
    notnull: int
    default: str | None
    pk: int


def fetch_columns(conn: sqlite3.Connection, table: str) -> List[ColumnInfo]:
    cursor = conn.execute(f"PRAGMA table_info('{table}')")
    return [
        ColumnInfo(name=row[1], type=row[2], notnull=row[3], default=row[4], pk=row[5])
        for row in cursor.fetchall()
    ]


def fetch_index_sql(conn: sqlite3.Connection) -> Dict[str, str]:
    cursor = conn.execute(
        "SELECT name, sql FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'"
    )
    return {row[0]: (row[1] or "") for row in cursor.fetchall()}


def fetch_trigger_sql(conn: sqlite3.Connection) -> Dict[str, str]:
    cursor = conn.execute(
        "SELECT name, sql FROM sqlite_master WHERE type='trigger' AND name NOT LIKE 'sqlite_%'"
    )
    return {row[0]: (row[1] or "") for row in cursor.fetchall()}


def fetch_tables(conn: sqlite3.Connection) -> List[str]:
    cursor = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    )
    return [row[0] for row in cursor.fetchall()]


def compare_sequences(ref: Sequence[str], target: Sequence[str]) -> Tuple[List[str], List[str]]:
    missing = [item for item in ref if item not in target]
    extra = [item for item in target if item not in ref]
    return missing, extra


def normalize_sql(sql_text: str | None) -> str:
    return " ".join((sql_text or "").split())


def ensure_reference_data(conn: sqlite3.Connection) -> List[str]:
    issues: List[str] = []

    # Currencies check
    cursor = conn.execute("SELECT symbol FROM currencies")
    symbols = {row[0] for row in cursor.fetchall()}
    required_symbols = {"USD", "EUR", "ILS"}
    missing = required_symbols - symbols
    if missing:
        issues.append(f"Missing required currencies: {', '.join(sorted(missing))}")

    # Core trading account
    cursor = conn.execute(
        "SELECT COUNT(*) FROM trading_accounts WHERE LOWER(name) = LOWER('ibkr-int')"
    )
    if cursor.fetchone()[0] == 0:
        issues.append("Trading account 'ibkr-int' not found.")

    return issues


def main(argv: List[str]) -> int:
    parser = argparse.ArgumentParser(description="Validate SQLite schema against baseline.")
    parser.add_argument(
        "--baseline",
        type=Path,
        default=DEFAULT_BASELINE,
        help=f"Canonical schema database (default: {DEFAULT_BASELINE})",
    )
    parser.add_argument(
        "--target",
        type=Path,
        default=DEFAULT_TARGET,
        help=f"Target database to validate (default: {DEFAULT_TARGET})",
    )
    parser.add_argument(
        "--skip-reference-data",
        action="store_true",
        help="Skip validation of required reference records.",
    )
    args = parser.parse_args(argv)

    baseline = args.baseline.resolve()
    target = args.target.resolve()

    if not baseline.exists():
        print(f"❌ Baseline database not found: {baseline}", file=sys.stderr)
        return 2
    if not target.exists():
        print(f"❌ Target database not found: {target}", file=sys.stderr)
        return 2

    print("🧭 TikTrack Schema Guard")
    print("========================")
    print(f"Baseline: {baseline}")
    print(f"Target  : {target}\n")

    with sqlite3.connect(baseline) as base_conn, sqlite3.connect(target) as tgt_conn:
        issues: List[str] = []

        base_tables = fetch_tables(base_conn)
        tgt_tables = fetch_tables(tgt_conn)

        missing_tables, extra_tables = compare_sequences(base_tables, tgt_tables)
        if missing_tables:
            issues.append("Missing tables: " + ", ".join(missing_tables))
        if extra_tables:
            issues.append("Unexpected tables: " + ", ".join(extra_tables))

        shared_tables = sorted(set(base_tables) & set(tgt_tables))
        for table in shared_tables:
            base_columns = fetch_columns(base_conn, table)
            tgt_columns = fetch_columns(tgt_conn, table)

            if len(base_columns) != len(tgt_columns):
                issues.append(f"Column count mismatch in {table}")
                continue

            for base_col, tgt_col in zip(base_columns, tgt_columns):
                if base_col != tgt_col:
                    issues.append(
                        f"Column mismatch in {table}: expected {base_col}, got {tgt_col}"
                    )

        base_indexes = {k: normalize_sql(v) for k, v in fetch_index_sql(base_conn).items()}
        tgt_indexes = {k: normalize_sql(v) for k, v in fetch_index_sql(tgt_conn).items()}
        missing_idx, extra_idx = compare_sequences(base_indexes.keys(), tgt_indexes.keys())
        if missing_idx:
            issues.append("Missing indexes: " + ", ".join(missing_idx))
        if extra_idx:
            issues.append("Unexpected indexes: " + ", ".join(extra_idx))

        for idx_name in set(base_indexes) & set(tgt_indexes):
            if base_indexes[idx_name] != tgt_indexes[idx_name]:
                issues.append(f"Index definition mismatch: {idx_name}")

        base_triggers = {
            k: normalize_sql(v) for k, v in fetch_trigger_sql(base_conn).items()
        }
        tgt_triggers = {
            k: normalize_sql(v) for k, v in fetch_trigger_sql(tgt_conn).items()
        }
        missing_trg, extra_trg = compare_sequences(base_triggers.keys(), tgt_triggers.keys())
        if missing_trg:
            issues.append("Missing triggers: " + ", ".join(missing_trg))
        if extra_trg:
            issues.append("Unexpected triggers: " + ", ".join(extra_trg))

        for trg_name in set(base_triggers) & set(tgt_triggers):
            if base_triggers[trg_name] != tgt_triggers[trg_name]:
                issues.append(f"Trigger definition mismatch: {trg_name}")

        if not args.skip_reference_data:
            issues.extend(ensure_reference_data(tgt_conn))

    if issues:
        print("❌ Schema validation failed:")
        for item in issues:
            print(f"   - {item}")
        return 1

    print("✅ Schema validation passed")
    if not args.skip_reference_data:
        print("✅ Reference data validated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))



