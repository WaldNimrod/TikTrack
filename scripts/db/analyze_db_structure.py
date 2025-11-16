#!/usr/bin/env python3
"""
Analyze SQLite database structure for PostgreSQL migration preparation.

This script performs read-only analysis of the SQLite database structure,
including tables, indexes, foreign keys, triggers, and constraints.
It generates a comprehensive report without modifying the database.

Usage:
    python scripts/db/analyze_db_structure.py [--db-path PATH] [--output PATH]
"""

from __future__ import annotations

import argparse
import sqlite3
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB_PATH = ROOT / "Backend" / "db" / "tiktrack.db"
DEFAULT_OUTPUT = ROOT / "documentation" / "05-REPORTS" / "DB_STRUCTURE_ANALYSIS.md"


@dataclass
class TableInfo:
    name: str
    columns: List[Dict[str, str]]
    indexes: List[str]
    foreign_keys: List[Dict[str, str]]
    triggers: List[str]
    row_count: int


@dataclass
class IndexInfo:
    name: str
    table: str
    unique: bool
    columns: List[str]
    sql: str


@dataclass
class TriggerInfo:
    name: str
    table: str
    event: str
    timing: str
    sql: str


def get_tables(conn: sqlite3.Connection) -> List[str]:
    """Get list of all user tables."""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        AND name NOT LIKE 'sqlite_%'
        ORDER BY name
    """)
    return [row[0] for row in cursor.fetchall()]


def get_table_info(conn: sqlite3.Connection, table_name: str) -> TableInfo:
    """Get detailed information about a table."""
    cursor = conn.cursor()
    
    # Get columns
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = []
    for row in cursor.fetchall():
        columns.append({
            "name": row[1],
            "type": row[2],
            "not_null": bool(row[3]),
            "default": row[4],
            "pk": bool(row[5])
        })
    
    # Get indexes
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='index' 
        AND tbl_name = ?
        AND name NOT LIKE 'sqlite_%'
    """, (table_name,))
    indexes = [row[0] for row in cursor.fetchall()]
    
    # Get foreign keys
    cursor.execute(f"PRAGMA foreign_key_list({table_name})")
    foreign_keys = []
    for row in cursor.fetchall():
        foreign_keys.append({
            "from": row[3],  # column name
            "to_table": row[2],  # referenced table
            "to_column": row[4] if row[4] else "id"  # referenced column
        })
    
    # Get triggers
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='trigger' 
        AND tbl_name = ?
    """, (table_name,))
    triggers = [row[0] for row in cursor.fetchall()]
    
    # Get row count
    try:
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        row_count = cursor.fetchone()[0]
    except:
        row_count = 0
    
    return TableInfo(
        name=table_name,
        columns=columns,
        indexes=indexes,
        foreign_keys=foreign_keys,
        triggers=triggers,
        row_count=row_count
    )


def get_index_details(conn: sqlite3.Connection) -> List[IndexInfo]:
    """Get detailed information about all indexes."""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT name, tbl_name, sql FROM sqlite_master 
        WHERE type='index' 
        AND name NOT LIKE 'sqlite_%'
        ORDER BY tbl_name, name
    """)
    
    indexes = []
    for name, table, sql in cursor.fetchall():
        # Parse UNIQUE from SQL
        unique = "UNIQUE" in (sql or "").upper()
        
        # Extract columns from SQL
        columns = []
        if sql:
            # Simple extraction - look for column names in parentheses
            import re
            match = re.search(r'\(([^)]+)\)', sql)
            if match:
                columns = [col.strip().strip('"').strip("'") for col in match.group(1).split(',')]
        
        indexes.append(IndexInfo(
            name=name,
            table=table,
            unique=unique,
            columns=columns,
            sql=sql or ""
        ))
    
    return indexes


def get_trigger_details(conn: sqlite3.Connection) -> List[TriggerInfo]:
    """Get detailed information about all triggers."""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT name, tbl_name, sql FROM sqlite_master 
        WHERE type='trigger'
        ORDER BY tbl_name, name
    """)
    
    triggers = []
    for name, table, sql in cursor.fetchall():
        # Parse timing and event from SQL
        timing = "BEFORE"
        event = "UNKNOWN"
        if sql:
            sql_upper = sql.upper()
            if "AFTER" in sql_upper:
                timing = "AFTER"
            if "INSERT" in sql_upper:
                event = "INSERT"
            elif "UPDATE" in sql_upper:
                event = "UPDATE"
            elif "DELETE" in sql_upper:
                event = "DELETE"
        
        triggers.append(TriggerInfo(
            name=name,
            table=table,
            event=event,
            timing=timing,
            sql=sql or ""
        ))
    
    return triggers


def generate_report(
    tables: List[TableInfo],
    indexes: List[IndexInfo],
    triggers: List[TriggerInfo],
    output_path: Path
) -> None:
    """Generate comprehensive markdown report."""
    lines = [
        "# Database Structure Analysis",
        "",
        f"**Generated:** {Path(__file__).stat().st_mtime}",
        "",
        "## Summary",
        "",
        f"- **Total Tables:** {len(tables)}",
        f"- **Total Indexes:** {len(indexes)}",
        f"- **Total Triggers:** {len(triggers)}",
        f"- **Total Foreign Keys:** {sum(len(t.foreign_keys) for t in tables)}",
        "",
        "---",
        "",
        "## Tables",
        "",
    ]
    
    # Group tables by category (based on naming patterns)
    categories = defaultdict(list)
    for table in tables:
        if table.name.startswith(('user_', 'preference')):
            categories['Users & Preferences'].append(table)
        elif table.name.startswith(('trade', 'execution', 'alert', 'cash_flow')):
            categories['Trading Entities'].append(table)
        elif table.name.startswith(('ticker', 'market_data', 'quotes', 'intraday')):
            categories['Market Data'].append(table)
        elif table.name.startswith(('constraint', 'enum', 'note_relation')):
            categories['Constraints & Relations'].append(table)
        elif table.name.startswith(('system_', 'import_')):
            categories['System & Import'].append(table)
        elif table.name.startswith('tag'):
            categories['Tags'].append(table)
        else:
            categories['Other'].append(table)
    
    for category, category_tables in sorted(categories.items()):
        lines.append(f"### {category} ({len(category_tables)} tables)")
        lines.append("")
        
        for table in sorted(category_tables, key=lambda t: t.name):
            lines.append(f"#### `{table.name}`")
            lines.append("")
            lines.append(f"- **Rows:** {table.row_count:,}")
            lines.append(f"- **Columns:** {len(table.columns)}")
            lines.append(f"- **Indexes:** {len(table.indexes)}")
            lines.append(f"- **Foreign Keys:** {len(table.foreign_keys)}")
            lines.append(f"- **Triggers:** {len(table.triggers)}")
            lines.append("")
            
            if table.columns:
                lines.append("**Columns:**")
                lines.append("")
                lines.append("| Name | Type | Not Null | Default | Primary Key |")
                lines.append("|------|------|----------|---------|-------------|")
                for col in table.columns:
                    lines.append(
                        f"| `{col['name']}` | `{col['type']}` | "
                        f"{'✓' if col['not_null'] else ''} | "
                        f"{col['default'] or '—'} | "
                        f"{'✓' if col['pk'] else ''} |"
                    )
                lines.append("")
            
            if table.foreign_keys:
                lines.append("**Foreign Keys:**")
                lines.append("")
                lines.append("| From Column | To Table | To Column |")
                lines.append("|-------------|----------|-----------|")
                for fk in table.foreign_keys:
                    lines.append(
                        f"| `{fk['from']}` | `{fk['to_table']}` | `{fk['to_column']}` |"
                    )
                lines.append("")
            
            if table.indexes:
                lines.append("**Indexes:**")
                for idx_name in table.indexes:
                    idx_info = next((i for i in indexes if i.name == idx_name), None)
                    if idx_info:
                        unique_marker = " (UNIQUE)" if idx_info.unique else ""
                        cols = ", ".join(idx_info.columns) if idx_info.columns else "?"
                        lines.append(f"- `{idx_name}`{unique_marker}: `{cols}`")
                    else:
                        lines.append(f"- `{idx_name}`")
                lines.append("")
            
            if table.triggers:
                lines.append("**Triggers:**")
                for trigger_name in table.triggers:
                    trigger_info = next((t for t in triggers if t.name == trigger_name), None)
                    if trigger_info:
                        lines.append(f"- `{trigger_name}` ({trigger_info.timing} {trigger_info.event})")
                    else:
                        lines.append(f"- `{trigger_name}`")
                lines.append("")
            
            lines.append("---")
            lines.append("")
    
    # Add indexes section
    lines.extend([
        "## Indexes Summary",
        "",
        "| Name | Table | Unique | Columns |",
        "|------|-------|--------|---------|",
    ])
    
    for idx in sorted(indexes, key=lambda i: (i.table, i.name)):
        cols = ", ".join(idx.columns) if idx.columns else "?"
        unique_marker = "✓" if idx.unique else ""
        lines.append(f"| `{idx.name}` | `{idx.table}` | {unique_marker} | `{cols}` |")
    
    lines.append("")
    lines.append("---")
    lines.append("")
    
    # Add triggers section
    if triggers:
        lines.extend([
            "## Triggers Summary",
            "",
            "| Name | Table | Timing | Event |",
            "|------|-------|--------|-------|",
        ])
        
        for trigger in sorted(triggers, key=lambda t: (t.table, t.name)):
            lines.append(
                f"| `{trigger.name}` | `{trigger.table}` | {trigger.timing} | {trigger.event} |"
            )
        
        lines.append("")
        lines.append("---")
        lines.append("")
    
    # Add PostgreSQL migration notes
    lines.extend([
        "## PostgreSQL Migration Notes",
        "",
        "### Triggers",
        "",
        "SQLite triggers need to be converted to PostgreSQL functions and triggers:",
        "",
    ])
    
    for trigger in triggers:
        lines.append(f"#### `{trigger.name}` on `{trigger.table}`")
        lines.append("")
        lines.append("```sql")
        lines.append(trigger.sql)
        lines.append("```")
        lines.append("")
        lines.append("**PostgreSQL equivalent:**")
        lines.append("")
        lines.append("```sql")
        lines.append(f"-- TODO: Convert {trigger.timing} {trigger.event} trigger")
        lines.append(f"-- Review logic and convert SQLite-specific syntax")
        lines.append("```")
        lines.append("")
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"✅ Report generated: {output_path.relative_to(ROOT)}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Analyze SQLite database structure")
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
    
    print(f"📊 Analyzing database: {args.db_path}")
    
    conn = sqlite3.connect(str(args.db_path))
    conn.row_factory = sqlite3.Row
    
    try:
        tables = []
        for table_name in get_tables(conn):
            print(f"  Analyzing table: {table_name}")
            tables.append(get_table_info(conn, table_name))
        
        print(f"  Analyzing indexes...")
        indexes = get_index_details(conn)
        
        print(f"  Analyzing triggers...")
        triggers = get_trigger_details(conn)
        
        print(f"  Generating report...")
        generate_report(tables, indexes, triggers, args.output)
        
    finally:
        conn.close()


if __name__ == "__main__":
    main()

