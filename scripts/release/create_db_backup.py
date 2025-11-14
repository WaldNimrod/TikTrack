#!/usr/bin/env python3
"""
TikTrack DB Backup Helper
=========================

Creates a timestamped backup of the active SQLite database, validates its
integrity, and writes companion metadata to assist disaster recovery.

Usage:
    python scripts/release/create_db_backup.py \
        --target Backend/db/tiktrack.db \
        --label pre-update
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import sqlite3
import sys
from pathlib import Path
from typing import Optional

DEFAULT_DB_PATH = Path("Backend/db/tiktrack.db")
DEFAULT_BACKUP_DIR = Path("Backend/db/backups")
METADATA_SUFFIX = ".meta.json"


class BackupError(RuntimeError):
    """Raised when backup or validation fails."""


def run_integrity_check(db_path: Path) -> str:
    """Run PRAGMA integrity_check and return the engine response."""
    with sqlite3.connect(db_path) as conn:
        cursor = conn.execute("PRAGMA integrity_check;")
        result = cursor.fetchone()
        return result[0] if result else "no-result"


def copy_database(source: Path, destination: Path) -> None:
    """Copy database file using the SQLite backup API for consistency."""
    with sqlite3.connect(source) as src_conn, sqlite3.connect(destination) as dst_conn:
        src_conn.backup(dst_conn)
        dst_conn.commit()


def write_metadata(
    metadata_path: Path,
    *,
    label: str,
    source: Path,
    backup: Path,
    integrity_result: str,
    notes: Optional[str],
) -> None:
    metadata = {
        "created_at": dt.datetime.utcnow().isoformat() + "Z",
        "label": label,
        "source": str(source),
        "backup": str(backup),
        "integrity_check": integrity_result,
    }
    if notes:
        metadata["notes"] = notes

    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create a validated SQLite backup.")
    parser.add_argument(
        "--target",
        type=Path,
        default=DEFAULT_DB_PATH,
        help=f"Path to active database (default: {DEFAULT_DB_PATH})",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_BACKUP_DIR,
        help=f"Directory for backups (default: {DEFAULT_BACKUP_DIR})",
    )
    parser.add_argument(
        "--label",
        type=str,
        default="manual",
        help="Label describing the backup (e.g., pre-update, post-migration).",
    )
    parser.add_argument(
        "--notes",
        type=str,
        default=None,
        help="Optional free-form notes to store alongside the metadata.",
    )
    return parser.parse_args(argv)


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    target_db: Path = args.target.resolve()
    output_dir: Path = args.output_dir.resolve()
    label: str = args.label.strip() or "manual"

    if not target_db.exists():
        raise BackupError(f"Target database not found: {target_db}")

    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = dt.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"{target_db.stem}_{label}_{timestamp}.db"
    backup_path = output_dir / backup_filename
    metadata_path = backup_path.with_suffix(backup_path.suffix + METADATA_SUFFIX)

    print("📦 TikTrack DB Backup")
    print("======================")
    print(f"Source : {target_db}")
    print(f"Output : {backup_path}")
    print(f"Label  : {label}")
    if args.notes:
        print(f"Notes  : {args.notes}")
    print()

    integrity = run_integrity_check(target_db)
    if integrity.lower() != "ok":
        raise BackupError(f"Integrity check failed for {target_db}: {integrity}")
    print(f"✅ Integrity check passed: {integrity}")

    copy_database(target_db, backup_path)
    print(f"✅ Backup created: {backup_path}")

    write_metadata(
        metadata_path,
        label=label,
        source=target_db,
        backup=backup_path,
        integrity_result=integrity,
        notes=args.notes,
    )
    print(f"📝 Metadata written: {metadata_path}")

    print("\n🎉 Backup complete")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv[1:]))
    except BackupError as exc:
        print(f"❌ {exc}", file=sys.stderr)
        raise SystemExit(1)



