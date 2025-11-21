#!/usr/bin/env python3
"""
Verify indexes are properly defined in SQLAlchemy models.

This script compares indexes in the SQLite database with indexes defined
in SQLAlchemy models to ensure all indexes will be created in PostgreSQL.

Usage:
    python scripts/db/verify_indexes.py [--db-path PATH] [--output PATH]
"""

from __future__ import annotations

import argparse
import sqlite3
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Set

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB_PATH = ROOT / "Backend" / "db" / "tiktrack.db"
DEFAULT_OUTPUT = ROOT / "documentation" / "05-REPORTS" / "DB_INDEXES_VERIFICATION.md"


def get_db_indexes(conn: sqlite3.Connection) -> Dict[str, List[Dict]]:
    """Get all indexes from database, grouped by table."""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            i.name,
            i.tbl_name,
            i.sql,
            il.name as column_name
        FROM sqlite_master i
        LEFT JOIN pragma_index_info(i.name) il ON 1=1
        WHERE i.type = 'index'
        AND i.name NOT LIKE 'sqlite_%'
        ORDER BY i.tbl_name, i.name, il.seqno
    """)
    
    indexes_by_table: Dict[str, List[Dict]] = defaultdict(list)
    current_index = None
    
    for row in cursor.fetchall():
        idx_name, table_name, sql, col_name = row
        
        # Check if this is a new index
        if not current_index or current_index["name"] != idx_name:
            # Parse unique from SQL
            is_unique = "UNIQUE" in (sql or "").upper()
            
            # Extract columns from SQL if available
            columns = []
            if sql:
                import re
                match = re.search(r'\(([^)]+)\)', sql)
                if match:
                    columns = [col.strip().strip('"').strip("'") for col in match.group(1).split(',')]
            
            current_index = {
                "name": idx_name,
                "table": table_name,
                "unique": is_unique,
                "columns": columns if columns else [],
                "sql": sql or ""
            }
            indexes_by_table[table_name].append(current_index)
        
        # Add column if found
        if col_name and col_name not in current_index["columns"]:
            current_index["columns"].append(col_name)
    
    return dict(indexes_by_table)


def get_model_indexes() -> Dict[str, List[Dict]]:
    """Get indexes defined in SQLAlchemy models."""
    try:
        import sys
        import importlib
        sys.path.insert(0, str(ROOT / "Backend"))
        
        models_module = importlib.import_module('models')
        indexes_by_table: Dict[str, List[Dict]] = defaultdict(list)
        
        for name in models_module.__all__:
            model_class = getattr(models_module, name, None)
            if not model_class or not hasattr(model_class, '__table__'):
                continue
            
            table = model_class.__table__
            table_name = table.name
            
            # Get indexes from __table_args__
            if hasattr(table, 'indexes'):
                for idx in table.indexes:
                    columns = [col.name for col in idx.columns]
                    indexes_by_table[table_name].append({
                        "name": idx.name or f"idx_{table_name}_{'_'.join(columns)}",
                        "table": table_name,
                        "unique": idx.unique,
                        "columns": columns,
                        "sql": None  # Not available from model
                    })
        
        return dict(indexes_by_table)
    except Exception as e:
        print(f"⚠️  Warning: Could not load models: {e}")
        return {}


def generate_markdown(
    db_indexes: Dict[str, List[Dict]],
    model_indexes: Dict[str, List[Dict]],
    output_path: Path
) -> None:
    """Generate markdown report comparing DB and model indexes."""
    lines = [
        "# Index Verification Report",
        "",
        "This document compares indexes in the SQLite database with indexes",
        "defined in SQLAlchemy models to ensure proper migration to PostgreSQL.",
        "",
        "## Summary",
        "",
    ]
    
    # Count indexes
    total_db = sum(len(idxs) for idxs in db_indexes.values())
    total_model = sum(len(idxs) for idxs in model_indexes.values())
    
    lines.append(f"- **Total indexes in DB:** {total_db}")
    lines.append(f"- **Total indexes in models:** {total_model}")
    lines.append("")
    
    # Find missing indexes
    all_tables = set(db_indexes.keys()) | set(model_indexes.keys())
    missing_in_models = []
    missing_in_db = []
    
    for table in all_tables:
        db_idxs = {idx["name"]: idx for idx in db_indexes.get(table, [])}
        model_idxs = {idx["name"]: idx for idx in model_indexes.get(table, [])}
        
        # Indexes in DB but not in models
        for idx_name in db_idxs:
            if idx_name not in model_idxs:
                missing_in_models.append((table, db_idxs[idx_name]))
        
        # Indexes in models but not in DB (might be new)
        for idx_name in model_idxs:
            if idx_name not in db_idxs:
                missing_in_db.append((table, model_idxs[idx_name]))
    
    if missing_in_models:
        lines.append(f"⚠️  **Indexes in DB but not in models:** {len(missing_in_models)}")
    else:
        lines.append(f"✅ **All DB indexes are in models**")
    
    if missing_in_db:
        lines.append(f"ℹ️  **Indexes in models but not in DB:** {len(missing_in_db)} (may be new)")
    
    lines.append("")
    lines.append("---")
    lines.append("")
    
    # Detailed comparison by table
    lines.append("## Index Comparison by Table")
    lines.append("")
    
    for table in sorted(all_tables):
        db_idxs = db_indexes.get(table, [])
        model_idxs = model_indexes.get(table, [])
        
        if not db_idxs and not model_idxs:
            continue
        
        lines.append(f"### `{table}`")
        lines.append("")
        
        # DB indexes
        if db_idxs:
            lines.append("#### Database Indexes")
            lines.append("")
            lines.append("| Name | Unique | Columns |")
            lines.append("|------|--------|---------|")
            for idx in db_idxs:
                cols = ", ".join(idx["columns"]) if idx["columns"] else "?"
                unique_marker = "✓" if idx["unique"] else ""
                lines.append(f"| `{idx['name']}` | {unique_marker} | `{cols}` |")
            lines.append("")
        
        # Model indexes
        if model_idxs:
            lines.append("#### Model Indexes")
            lines.append("")
            lines.append("| Name | Unique | Columns | Status |")
            lines.append("|------|--------|---------|--------|")
            for idx in model_idxs:
                cols = ", ".join(idx["columns"]) if idx["columns"] else "?"
                unique_marker = "✓" if idx["unique"] else ""
                
                # Check if exists in DB
                db_idx = next((i for i in db_idxs if i["name"] == idx["name"]), None)
                if db_idx:
                    status = "✅ Matches"
                else:
                    status = "ℹ️ New (not in DB)"
                
                lines.append(f"| `{idx['name']}` | {unique_marker} | `{cols}` | {status} |")
            lines.append("")
        
        # Missing indexes
        missing = [idx for idx in db_idxs if not any(m["name"] == idx["name"] for m in model_idxs)]
        if missing:
            lines.append("⚠️  **Missing in models:**")
            for idx in missing:
                cols = ", ".join(idx["columns"]) if idx["columns"] else "?"
                lines.append(f"- `{idx['name']}` on `{cols}`")
            lines.append("")
        
        lines.append("---")
        lines.append("")
    
    # Recommendations
    if missing_in_models:
        lines.extend([
            "## Recommendations",
            "",
            "### Indexes to Add to Models",
            "",
            "The following indexes exist in the database but are not defined in models.",
            "They should be added to ensure they are created in PostgreSQL:",
            "",
        ])
        
        for table, idx in missing_in_models:
            cols = ", ".join(idx["columns"]) if idx["columns"] else "?"
            unique = "UNIQUE " if idx["unique"] else ""
            lines.append(f"#### `{idx['name']}` on `{table}`")
            lines.append("")
            lines.append("```python")
            lines.append("__table_args__ = (")
            if idx['columns']:
                col_list = ", ".join(f"'{col}'" for col in idx['columns'])
                lines.append(f"    Index('{idx['name']}', {col_list}),")
            else:
                lines.append(f"    Index('{idx['name']}', ?),")
            lines.append(")")
            lines.append("```")
            lines.append("")
        
        lines.append("---")
        lines.append("")
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"✅ Index verification report written to: {output_path.relative_to(ROOT)}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Verify indexes in models")
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
    
    print(f"📊 Verifying indexes: {args.db_path}")
    
    conn = sqlite3.connect(str(args.db_path))
    conn.row_factory = sqlite3.Row
    
    try:
        print("  Loading indexes from database...")
        db_indexes = get_db_indexes(conn)
        print(f"    Found {sum(len(idxs) for idxs in db_indexes.values())} indexes")
        
        print("  Loading indexes from models...")
        model_indexes = get_model_indexes()
        print(f"    Found {sum(len(idxs) for idxs in model_indexes.values())} indexes")
        
        print("  Generating report...")
        generate_markdown(db_indexes, model_indexes, args.output)
        
    finally:
        conn.close()


if __name__ == "__main__":
    main()

