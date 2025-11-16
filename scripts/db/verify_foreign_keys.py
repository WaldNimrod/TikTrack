#!/usr/bin/env python3
"""
Verify foreign keys are properly defined in SQLAlchemy models.

This script compares foreign keys in the SQLite database with foreign keys
defined in SQLAlchemy models to ensure proper migration to PostgreSQL.

Usage:
    python scripts/db/verify_foreign_keys.py [--db-path PATH] [--output PATH]
"""

from __future__ import annotations

import argparse
import sqlite3
from collections import defaultdict
from pathlib import Path
from typing import Dict, List

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB_PATH = ROOT / "Backend" / "db" / "tiktrack.db"
DEFAULT_OUTPUT = ROOT / "documentation" / "05-REPORTS" / "DB_FOREIGN_KEYS_VERIFICATION.md"


def get_db_foreign_keys(conn: sqlite3.Connection) -> Dict[str, List[Dict]]:
    """Get all foreign keys from database, grouped by table."""
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        AND name NOT LIKE 'sqlite_%'
        AND name != 'lost_and_found'
    """)
    tables = [row[0] for row in cursor.fetchall()]
    
    fks_by_table: Dict[str, List[Dict]] = defaultdict(list)
    
    for table in tables:
        cursor.execute(f"PRAGMA foreign_key_list({table})")
        for row in cursor.fetchall():
            # row: (id, seq, table, from, to, on_update, on_delete, match)
            fks_by_table[table].append({
                "from_column": row[3],
                "to_table": row[2],
                "to_column": row[4] if row[4] else "id",
                "on_update": row[5] or "NO ACTION",
                "on_delete": row[6] or "NO ACTION"
            })
    
    return dict(fks_by_table)


def get_model_foreign_keys() -> Dict[str, List[Dict]]:
    """Get foreign keys defined in SQLAlchemy models."""
    try:
        import sys
        import importlib
        sys.path.insert(0, str(ROOT / "Backend"))
        
        models_module = importlib.import_module('models')
        fks_by_table: Dict[str, List[Dict]] = defaultdict(list)
        
        for name in models_module.__all__:
            model_class = getattr(models_module, name, None)
            if not model_class or not hasattr(model_class, '__table__'):
                continue
            
            table = model_class.__table__
            table_name = table.name
            
            # Get foreign keys
            for fk in table.foreign_keys:
                fks_by_table[table_name].append({
                    "from_column": fk.parent.name,
                    "to_table": fk.column.table.name,
                    "to_column": fk.column.name,
                    "on_update": getattr(fk, 'onupdate', None) or "NO ACTION",
                    "on_delete": getattr(fk, 'ondelete', None) or "NO ACTION"
                })
        
        return dict(fks_by_table)
    except Exception as e:
        print(f"⚠️  Warning: Could not load models: {e}")
        return {}


def generate_markdown(
    db_fks: Dict[str, List[Dict]],
    model_fks: Dict[str, List[Dict]],
    output_path: Path
) -> None:
    """Generate markdown report comparing DB and model foreign keys."""
    lines = [
        "# Foreign Key Verification Report",
        "",
        "This document compares foreign keys in the SQLite database with foreign keys",
        "defined in SQLAlchemy models to ensure proper migration to PostgreSQL.",
        "",
        "## Summary",
        "",
    ]
    
    # Count foreign keys
    total_db = sum(len(fks) for fks in db_fks.values())
    total_model = sum(len(fks) for fks in model_fks.values())
    
    lines.append(f"- **Total foreign keys in DB:** {total_db}")
    lines.append(f"- **Total foreign keys in models:** {total_model}")
    lines.append("")
    
    # Find missing foreign keys
    all_tables = set(db_fks.keys()) | set(model_fks.keys())
    missing_in_models = []
    missing_in_db = []
    
    for table in all_tables:
        db_fk_list = db_fks.get(table, [])
        model_fk_list = model_fks.get(table, [])
        
        # Create lookup keys for comparison
        db_keys = {
            (fk["from_column"], fk["to_table"], fk["to_column"]): fk
            for fk in db_fk_list
        }
        model_keys = {
            (fk["from_column"], fk["to_table"], fk["to_column"]): fk
            for fk in model_fk_list
        }
        
        # Foreign keys in DB but not in models
        for key in db_keys:
            if key not in model_keys:
                missing_in_models.append((table, db_keys[key]))
        
        # Foreign keys in models but not in DB (might be new)
        for key in model_keys:
            if key not in db_keys:
                missing_in_db.append((table, model_keys[key]))
    
    if missing_in_models:
        lines.append(f"⚠️  **Foreign keys in DB but not in models:** {len(missing_in_models)}")
    else:
        lines.append(f"✅ **All DB foreign keys are in models**")
    
    if missing_in_db:
        lines.append(f"ℹ️  **Foreign keys in models but not in DB:** {len(missing_in_db)} (may be new)")
    
    lines.append("")
    lines.append("---")
    lines.append("")
    
    # Detailed comparison by table
    lines.append("## Foreign Key Comparison by Table")
    lines.append("")
    
    for table in sorted(all_tables):
        db_fk_list = db_fks.get(table, [])
        model_fk_list = model_fks.get(table, [])
        
        if not db_fk_list and not model_fk_list:
            continue
        
        lines.append(f"### `{table}`")
        lines.append("")
        
        # DB foreign keys
        if db_fk_list:
            lines.append("#### Database Foreign Keys")
            lines.append("")
            lines.append("| From Column | To Table | To Column | On Update | On Delete |")
            lines.append("|-------------|----------|-----------|-----------|-----------|")
            for fk in db_fk_list:
                lines.append(
                    f"| `{fk['from_column']}` | `{fk['to_table']}` | "
                    f"`{fk['to_column']}` | {fk['on_update']} | {fk['on_delete']} |"
                )
            lines.append("")
        
        # Model foreign keys
        if model_fk_list:
            lines.append("#### Model Foreign Keys")
            lines.append("")
            lines.append("| From Column | To Table | To Column | On Update | On Delete | Status |")
            lines.append("|-------------|----------|-----------|-----------|-----------|--------|")
            for fk in model_fk_list:
                # Check if exists in DB
                db_fk = next(
                    (d for d in db_fk_list 
                     if d["from_column"] == fk["from_column"] 
                     and d["to_table"] == fk["to_table"]
                     and d["to_column"] == fk["to_column"]),
                    None
                )
                if db_fk:
                    # Check cascade actions match
                    if (db_fk["on_update"] == fk["on_update"] and 
                        db_fk["on_delete"] == fk["on_delete"]):
                        status = "✅ Matches"
                    else:
                        status = f"⚠️ Cascade mismatch (DB: {db_fk['on_delete']}, Model: {fk['on_delete']})"
                else:
                    status = "ℹ️ New (not in DB)"
                
                lines.append(
                    f"| `{fk['from_column']}` | `{fk['to_table']}` | "
                    f"`{fk['to_column']}` | {fk['on_update']} | {fk['on_delete']} | {status} |"
                )
            lines.append("")
        
        # Missing foreign keys
        missing = []
        for db_fk in db_fk_list:
            if not any(
                m["from_column"] == db_fk["from_column"]
                and m["to_table"] == db_fk["to_table"]
                and m["to_column"] == db_fk["to_column"]
                for m in model_fk_list
            ):
                missing.append(db_fk)
        
        if missing:
            lines.append("⚠️  **Missing in models:**")
            for fk in missing:
                lines.append(
                    f"- `{fk['from_column']}` → `{fk['to_table']}.{fk['to_column']}` "
                    f"({fk['on_delete']})"
                )
            lines.append("")
        
        lines.append("---")
        lines.append("")
    
    # Cascading delete summary
    lines.extend([
        "## Cascading Delete Summary",
        "",
        "Foreign keys with CASCADE DELETE:",
        "",
        "| Table | Column | To Table | Action |",
        "|-------|--------|----------|--------|",
    ])
    
    cascade_count = 0
    for table in sorted(all_tables):
        for fk in db_fks.get(table, []):
            if "CASCADE" in fk["on_delete"].upper():
                lines.append(
                    f"| `{table}` | `{fk['from_column']}` | "
                    f"`{fk['to_table']}` | {fk['on_delete']} |"
                )
                cascade_count += 1
    
    if cascade_count == 0:
        lines.append("| *None* | | | |")
    
    lines.append("")
    lines.append("---")
    lines.append("")
    
    # Recommendations
    if missing_in_models:
        lines.extend([
            "## Recommendations",
            "",
            "### Foreign Keys to Add to Models",
            "",
            "The following foreign keys exist in the database but are not defined in models.",
            "They should be added to ensure proper referential integrity in PostgreSQL:",
            "",
        ])
        
        for table, fk in missing_in_models:
            lines.append(f"#### `{table}.{fk['from_column']}` → `{fk['to_table']}.{fk['to_column']}`")
            lines.append("")
            lines.append("```python")
            lines.append(f"from_column = Column(Integer, ForeignKey('{fk['to_table']}.{fk['to_column']}'))")
            if fk['on_delete'] != 'NO ACTION':
                lines.append(f"# Note: ondelete='{fk['on_delete']}' should be added")
            lines.append("```")
            lines.append("")
        
        lines.append("---")
        lines.append("")
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"✅ Foreign key verification report written to: {output_path.relative_to(ROOT)}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Verify foreign keys in models")
    parser.add_argument(
        "--db-path",
        type=Path,
        default=DEFAULT_DB_PATH,
        help=f"Path to SQLite database (default: {DEFAULT_DB_PATH.relative_to(ROOT)})"
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Output markdown file (default: {DEFAULT_OUTPUT.relative_to(ROOT)})"
    )
    args = parser.parse_args()
    
    if not args.db_path.exists():
        print(f"❌ Database not found: {args.db_path}")
        return
    
    print(f"📊 Verifying foreign keys: {args.db_path}")
    
    conn = sqlite3.connect(str(args.db_path))
    conn.row_factory = sqlite3.Row
    
    try:
        print("  Loading foreign keys from database...")
        db_fks = get_db_foreign_keys(conn)
        print(f"    Found {sum(len(fks) for fks in db_fks.values())} foreign keys")
        
        print("  Loading foreign keys from models...")
        model_fks = get_model_foreign_keys()
        print(f"    Found {sum(len(fks) for fks in model_fks.values())} foreign keys")
        
        print("  Generating report...")
        generate_markdown(db_fks, model_fks, args.output)
        
    finally:
        conn.close()


if __name__ == "__main__":
    main()

