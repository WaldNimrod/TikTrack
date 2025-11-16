#!/usr/bin/env python3
"""
Convert SQLite triggers to PostgreSQL functions and triggers.

This script analyzes SQLite triggers and generates PostgreSQL equivalents.
It's a read-only operation that generates migration SQL without modifying databases.

Usage:
    python scripts/db/convert_triggers_to_postgres.py [--db-path PATH] [--output PATH]
"""

from __future__ import annotations

import argparse
import re
import sqlite3
from pathlib import Path
from typing import Dict, List

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB_PATH = ROOT / "Backend" / "db" / "tiktrack.db"
DEFAULT_OUTPUT = ROOT / "documentation" / "05-REPORTS" / "DB_TRIGGERS_POSTGRES.md"


def load_triggers(conn: sqlite3.Connection) -> List[Dict]:
    """Load all triggers from SQLite database."""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT name, tbl_name, sql
        FROM sqlite_master
        WHERE type = 'trigger'
        ORDER BY tbl_name, name
    """)
    
    triggers = []
    for row in cursor.fetchall():
        name, table, sql = row
        sql_upper = (sql or "").upper()
        
        # Parse timing
        timing = "BEFORE"
        if "AFTER" in sql_upper:
            timing = "AFTER"
        elif "INSTEAD OF" in sql_upper:
            timing = "INSTEAD OF"
        
        # Parse event
        event = "UNKNOWN"
        if "INSERT" in sql_upper:
            event = "INSERT"
        elif "UPDATE" in sql_upper:
            event = "UPDATE"
        elif "DELETE" in sql_upper:
            event = "DELETE"
        
        triggers.append({
            "name": name,
            "table": table,
            "timing": timing,
            "event": event,
            "sql": sql or ""
        })
    
    return triggers


def convert_trigger_to_postgres(trigger: Dict) -> Dict[str, str]:
    """Convert SQLite trigger to PostgreSQL function and trigger."""
    name = trigger["name"]
    table = trigger["table"]
    timing = trigger["timing"]
    event = trigger["event"]
    sqlite_sql = trigger["sql"]
    
    # Extract trigger body
    # SQLite format: CREATE TRIGGER name BEFORE/AFTER event ON table BEGIN ... END
    body_match = re.search(r'BEGIN\s+(.*?)\s+END', sqlite_sql, re.DOTALL | re.IGNORECASE)
    if not body_match:
        return {
            "function_name": f"{name}_fn",
            "function_sql": f"-- TODO: Parse trigger body manually\n-- {sqlite_sql}",
            "trigger_sql": f"-- TODO: Create trigger after function",
            "notes": "Could not parse trigger body automatically"
        }
    
    body = body_match.group(1).strip()
    
    # Convert SQLite-specific syntax to PostgreSQL
    pg_body = body
    
    # Convert RAISE(ABORT, ...) to RAISE EXCEPTION
    pg_body = re.sub(
        r'RAISE\s*\(\s*ABORT\s*,\s*["\']([^"\']+)["\']\s*\)',
        r"RAISE EXCEPTION '\1'",
        pg_body,
        flags=re.IGNORECASE
    )
    
    # Convert CASE WHEN ... THEN RAISE(...) END to IF ... THEN RAISE ...
    # This is a simplified conversion - may need manual review
    pg_body = re.sub(
        r'SELECT\s+CASE\s+WHEN\s+([^THEN]+)\s+THEN\s+RAISE\s*\([^)]+\)\s+END',
        r'IF \1 THEN\n        RAISE EXCEPTION ''Trigger condition violated'';\n    END IF',
        pg_body,
        flags=re.IGNORECASE | re.DOTALL
    )
    
    # Convert NEW/OLD references (already compatible, but ensure proper context)
    # NEW and OLD are available in PostgreSQL triggers
    
    # Generate function name
    function_name = f"{name}_fn"
    
    # Determine return type based on timing
    if timing == "INSTEAD OF":
        return_type = "TRIGGER"
    else:
        return_type = "TRIGGER"
    
    # Generate function SQL
    function_sql = f"""CREATE OR REPLACE FUNCTION {function_name}()
RETURNS {return_type}
LANGUAGE plpgsql
AS $$
BEGIN
    {pg_body}
    
    -- Return appropriate record based on trigger type
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;"""
    
    # Generate trigger SQL
    trigger_sql = f"""CREATE TRIGGER {name}
    {timing} {event}
    ON {table}
    FOR EACH ROW
    EXECUTE FUNCTION {function_name}();"""
    
    return {
        "function_name": function_name,
        "function_sql": function_sql,
        "trigger_sql": trigger_sql,
        "notes": "Auto-converted from SQLite - review for correctness"
    }


def generate_markdown(triggers: List[Dict], output_path: Path) -> None:
    """Generate markdown report with PostgreSQL equivalents."""
    lines = [
        "# SQLite to PostgreSQL Trigger Conversion",
        "",
        "This document contains SQLite triggers and their PostgreSQL equivalents.",
        "",
        f"**Total Triggers:** {len(triggers)}",
        "",
        "---",
        "",
    ]
    
    for trigger in triggers:
        name = trigger["name"]
        table = trigger["table"]
        timing = trigger["timing"]
        event = trigger["event"]
        sqlite_sql = trigger["sql"]
        
        lines.append(f"## `{name}` on `{table}`")
        lines.append("")
        lines.append(f"- **Timing:** {timing}")
        lines.append(f"- **Event:** {event}")
        lines.append("")
        
        lines.append("### SQLite Trigger")
        lines.append("")
        lines.append("```sql")
        lines.append(sqlite_sql)
        lines.append("```")
        lines.append("")
        
        # Convert to PostgreSQL
        pg_equiv = convert_trigger_to_postgres(trigger)
        
        lines.append("### PostgreSQL Function")
        lines.append("")
        lines.append("```sql")
        lines.append(pg_equiv["function_sql"])
        lines.append("```")
        lines.append("")
        
        lines.append("### PostgreSQL Trigger")
        lines.append("")
        lines.append("```sql")
        lines.append(pg_equiv["trigger_sql"])
        lines.append("```")
        lines.append("")
        
        if pg_equiv.get("notes"):
            lines.append(f"**Note:** {pg_equiv['notes']}")
            lines.append("")
        
        lines.append("---")
        lines.append("")
    
    # Add summary
    lines.extend([
        "## Summary",
        "",
        "| Trigger Name | Table | Timing | Event | Status |",
        "|--------------|-------|--------|-------|--------|",
    ])
    
    for trigger in triggers:
        pg_equiv = convert_trigger_to_postgres(trigger)
        status = "✅ Auto-converted" if "TODO" not in pg_equiv["function_sql"] else "⚠️ Manual review needed"
        lines.append(
            f"| `{trigger['name']}` | `{trigger['table']}` | "
            f"{trigger['timing']} | {trigger['event']} | {status} |"
        )
    
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Migration Steps")
    lines.append("")
    lines.append("1. Review each converted trigger for correctness")
    lines.append("2. Test functions and triggers on development PostgreSQL instance")
    lines.append("3. Apply to production after successful testing")
    lines.append("")
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"✅ Trigger conversion report written to: {output_path.relative_to(ROOT)}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert SQLite triggers to PostgreSQL")
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
    
    print(f"📊 Converting triggers from: {args.db_path}")
    
    conn = sqlite3.connect(str(args.db_path))
    conn.row_factory = sqlite3.Row
    
    try:
        triggers = load_triggers(conn)
        print(f"  Found {len(triggers)} triggers")
        
        print(f"  Generating PostgreSQL equivalents...")
        generate_markdown(triggers, args.output)
        
    finally:
        conn.close()


if __name__ == "__main__":
    main()

