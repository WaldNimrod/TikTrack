#!/usr/bin/env python3
"""
Export constraints from SQLite database for PostgreSQL migration preparation.

This script reads constraints from the SQLite database and prepares them
for translation to PostgreSQL. It generates a mapping document that can
be used with sync_constraints_postgres.py after data migration.

Usage:
    python scripts/db/export_constraints_from_sqlite.py [--db-path PATH] [--output PATH]
"""

from __future__ import annotations

import argparse
import sqlite3
from pathlib import Path
from typing import Dict, List

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB_PATH = ROOT / "Backend" / "db" / "tiktrack.db"
DEFAULT_OUTPUT = ROOT / "documentation" / "05-REPORTS" / "DB_CONSTRAINTS_EXPORT.md"


def load_constraints_from_sqlite(conn: sqlite3.Connection) -> List[Dict]:
    """Load all active constraints from SQLite database."""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            id,
            table_name,
            column_name,
            constraint_type,
            constraint_name,
            constraint_definition,
            is_active,
            created_at,
            updated_at
        FROM constraints
        WHERE is_active = 1
        ORDER BY table_name, column_name, constraint_type
    """)
    
    constraints = []
    for row in cursor.fetchall():
        constraints.append({
            "id": row[0],
            "table_name": row[1],
            "column_name": row[2],
            "constraint_type": row[3],
            "constraint_name": row[4],
            "constraint_definition": row[5],
            "is_active": bool(row[6]),
            "created_at": row[7],
            "updated_at": row[8]
        })
    
    return constraints


def load_enum_values(conn: sqlite3.Connection, constraint_id: int) -> List[Dict]:
    """Load enum values for a constraint."""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            id,
            value,
            display_name,
            is_active,
            sort_order
        FROM enum_values
        WHERE constraint_id = ? AND is_active = 1
        ORDER BY sort_order, value
    """, (constraint_id,))
    
    return [
        {
            "id": row[0],
            "value": row[1],
            "display_name": row[2],
            "is_active": bool(row[3]),
            "sort_order": row[4]
        }
        for row in cursor.fetchall()
    ]


def generate_markdown(constraints: List[Dict], conn: sqlite3.Connection, output_path: Path) -> None:
    """Generate markdown report of constraints."""
    lines = [
        "# Constraints Export from SQLite",
        "",
        "This document contains all active constraints from the SQLite database,",
        "prepared for migration to PostgreSQL.",
        "",
        f"**Total Constraints:** {len(constraints)}",
        "",
        "---",
        "",
        "## Constraints by Table",
        "",
    ]
    
    # Group by table
    by_table: Dict[str, List[Dict]] = {}
    for constraint in constraints:
        table = constraint["table_name"]
        if table not in by_table:
            by_table[table] = []
        by_table[table].append(constraint)
    
    for table_name in sorted(by_table.keys()):
        table_constraints = by_table[table_name]
        lines.append(f"### `{table_name}` ({len(table_constraints)} constraints)")
        lines.append("")
        
        # Group by column
        by_column: Dict[str, List[Dict]] = {}
        for constraint in table_constraints:
            column = constraint["column_name"]
            if column not in by_column:
                by_column[column] = []
            by_column[column].append(constraint)
        
        for column_name in sorted(by_column.keys()):
            column_constraints = by_column[column_name]
            lines.append(f"#### Column: `{column_name}`")
            lines.append("")
            
            for constraint in column_constraints:
                ctype = constraint["constraint_type"]
                cname = constraint["constraint_name"]
                cdef = constraint["constraint_definition"]
                
                lines.append(f"**{ctype}** - `{cname}`")
                lines.append("")
                lines.append(f"- **Definition:** `{cdef}`")
                
                # Add enum values if applicable
                if ctype == "ENUM":
                    enum_values = load_enum_values(conn, constraint["id"])
                    if enum_values:
                        lines.append("- **Enum Values:**")
                        for ev in enum_values:
                            display = f" ({ev['display_name']})" if ev['display_name'] else ""
                            lines.append(f"  - `{ev['value']}`{display} (order: {ev['sort_order']})")
                
                lines.append("")
            
            lines.append("---")
            lines.append("")
    
    # Add summary statistics
    lines.extend([
        "## Summary Statistics",
        "",
        "### By Type",
        "",
        "| Type | Count |",
        "|------|-------|",
    ])
    
    by_type: Dict[str, int] = {}
    for constraint in constraints:
        ctype = constraint["constraint_type"]
        by_type[ctype] = by_type.get(ctype, 0) + 1
    
    for ctype in sorted(by_type.keys()):
        lines.append(f"| {ctype} | {by_type[ctype]} |")
    
    lines.append("")
    lines.append("### By Table")
    lines.append("")
    lines.append("| Table | Count |")
    lines.append("|-------|-------|")
    
    for table in sorted(by_table.keys()):
        lines.append(f"| `{table}` | {len(by_table[table])} |")
    
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## PostgreSQL Migration Notes")
    lines.append("")
    lines.append("### Translation Guidelines")
    lines.append("")
    lines.append("1. **ENUM constraints:** Convert to CHECK constraints with IN clause")
    lines.append("2. **CHECK constraints:** Review SQLite-specific functions (e.g., datetime())")
    lines.append("3. **UNIQUE constraints:** Direct translation")
    lines.append("4. **FOREIGN KEY constraints:** Already handled by SQLAlchemy models")
    lines.append("5. **NOT NULL constraints:** Already in column definitions")
    lines.append("")
    lines.append("### SQLite-Specific Functions to Review")
    lines.append("")
    lines.append("- `datetime()` - PostgreSQL uses `NOW()` or `CURRENT_TIMESTAMP`")
    lines.append("- `REGEXP` - PostgreSQL uses `~` operator")
    lines.append("- `GLOB` - PostgreSQL uses `LIKE` with pattern conversion")
    lines.append("")
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"✅ Constraints export written to: {output_path.relative_to(ROOT)}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Export constraints from SQLite")
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
    
    print(f"📊 Exporting constraints from: {args.db_path}")
    
    conn = sqlite3.connect(str(args.db_path))
    conn.row_factory = sqlite3.Row
    
    try:
        constraints = load_constraints_from_sqlite(conn)
        print(f"  Found {len(constraints)} active constraints")
        
        print(f"  Generating report...")
        generate_markdown(constraints, conn, args.output)
        
    finally:
        conn.close()


if __name__ == "__main__":
    main()

