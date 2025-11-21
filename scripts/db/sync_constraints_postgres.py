#!/usr/bin/env python3
"""
Export TikTrack dynamic constraints and generate PostgreSQL mapping.

The script connects directly to the target PostgreSQL instance (via DATABASE_URL
or --database-url), renders a Markdown table with the translated constraints, and
optionally applies the generated DDL.
"""

from __future__ import annotations

import argparse
import logging
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUTPUT = ROOT / "documentation" / "05-REPORTS" / "DB_CONSTRAINTS_MAPPING.md"

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")


def build_engine(database_url: Optional[str]) -> Engine:
    if not database_url:
        raise SystemExit("DATABASE_URL environment variable or --database-url flag is required")
    return create_engine(database_url)


def load_constraints(engine: Engine) -> List[Dict[str, Any]]:
    query = text(
        """
        SELECT id, table_name, column_name, constraint_type,
               constraint_name, constraint_definition, is_active
        FROM constraints
        WHERE is_active = TRUE
        ORDER BY table_name, column_name, constraint_type, id
        """
    )
    with engine.begin() as conn:
        rows = conn.execute(query).mappings().all()

    constraints: List[Dict[str, Any]] = []
    seen = set()
    for row in rows:
        key = (
            row["constraint_name"],
            row["table_name"],
            row["column_name"],
            row["constraint_type"],
            row["constraint_definition"],
        )
        if key in seen:
            continue
        seen.add(key)
        constraints.append(dict(row))
    return constraints


def normalize_expression(expr: str) -> str:
    result = expr.strip()
    result = result.replace('datetime("now")', "timezone('utc', now())")
    result = result.replace("datetime('now')", "timezone('utc', now())")
    result = re.sub(r"\bLENGTH\(", "char_length(", result)
    result = re.sub(r"\blength\(", "char_length(", result)
    result = result.replace("GLOB '[A-Z][A-Z][A-Z]'", "~ '^[A-Z]{3}$'")
    result = result.replace('GLOB "[A-Z][A-Z][A-Z]"', "~ '^[A-Z]{3}$'")
    result = re.sub(r'REGEXP\s+"([^"]+)"', r"~ '\1'", result)
    result = re.sub(r"REGEXP\s+'([^']+)'", r"~ '\1'", result)
    result = re.sub(r'"([^"]+)"', r"'\1'", result)
    result = result.replace("= 'True'", "= TRUE").replace("= 'False'", "= FALSE")
    return result


def parse_enum_values(definition: str) -> List[str]:
    match = re.search(r"\((.+)\)", definition)
    if not match:
        return []
    raw_values = match.group(1).split(",")
    return [value.strip().strip("'").strip('"') for value in raw_values]


def translate_constraint(row: Dict[str, Any]) -> Tuple[str, str, str]:
    table = row["table_name"]
    column = row["column_name"]
    name = row["constraint_name"] or f"{table}_{column}_{row['constraint_type'].lower()}"
    ctype = (row["constraint_type"] or "").upper().replace(" ", "_")
    definition = (row["constraint_definition"] or "").strip()

    auto_sql: Optional[str] = None
    status = "auto"
    notes = ""

    if ctype == "NOT_NULL":
        auto_sql = f'ALTER TABLE "{table}" ALTER COLUMN "{column}" SET NOT NULL;'
    elif ctype in {"ENUM", "CHECK", "RANGE"}:
        if ctype == "ENUM":
            values = parse_enum_values(definition)
            if not values:
                status = "manual"
                notes = "Unable to parse ENUM values automatically"
            else:
                clause = ", ".join(f"'{val}'" for val in values)
                expr = f'"{column}" IN ({clause})'
                auto_sql = f'ALTER TABLE "{table}" ADD CONSTRAINT {name} CHECK ({expr});'
        else:
            expr = normalize_expression(definition)
            auto_sql = f'ALTER TABLE "{table}" ADD CONSTRAINT {name} CHECK ({expr});'
    elif ctype == "UNIQUE":
        auto_sql = f'ALTER TABLE "{table}" ADD CONSTRAINT {name} UNIQUE ("{column}");'
    elif ctype == "FOREIGN_KEY":
        if "REFERENCES" not in definition.upper():
            status = "manual"
            notes = "Foreign key definition missing REFERENCES clause"
        else:
            target = definition.split("REFERENCES", 1)[1].strip()
            auto_sql = (
                f'ALTER TABLE "{table}" ADD CONSTRAINT {name} '
                f'FOREIGN KEY ("{column}") REFERENCES {target};'
            )
    else:
        status = "manual"
        notes = f"Custom handling required ({ctype})"

    if auto_sql and any(token in definition for token in ("REGEXP", "GLOB", "datetime(")):
        notes = "Expression normalized automatically; review generated SQL."

    return auto_sql or "", status, notes


def write_markdown(constraints: List[Dict[str, Any]], rows: List[Dict[str, str]], output_path: Path) -> None:
    lines = [
        "# PostgreSQL Constraint Mapping",
        "",
        "| Table | Column | Type | Definition | Postgres Action | Status | Notes |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]
    for meta, row in zip(constraints, rows):
        definition = (meta["constraint_definition"] or "").replace("|", "\\|")
        action = row["action"].replace("|", "\\|") if row["action"] else "—"
        notes = row["notes"].replace("|", "\\|") if row["notes"] else ""
        lines.append(
            f'| `{meta["table_name"]}` | `{meta["column_name"]}` | {meta["constraint_type"]} '
            f'| `{definition}` | `{action}` | {row["status"]} | {notes} |'
        )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def constraint_exists(engine: Engine, name: str) -> bool:
    query = text("SELECT 1 FROM pg_constraint WHERE conname = :name")
    with engine.begin() as conn:
        return bool(conn.execute(query, {"name": name}).scalar())


def column_is_nullable(engine: Engine, table: str, column: str) -> bool:
    query = text(
        """
        SELECT is_nullable
        FROM information_schema.columns
        WHERE table_name = :table AND column_name = :column
        """
    )
    with engine.begin() as conn:
        result = conn.execute(query, {"table": table, "column": column}).scalar()
        return result == "YES"


def apply_statements(engine: Engine, metadata: List[Dict[str, Any]], rows: List[Dict[str, str]]) -> None:
    for meta, row in zip(metadata, rows):
        sql = row["action"]
        if not sql or row["status"] != "auto":
            continue

        ctype = (meta["constraint_type"] or "").upper().replace(" ", "_")
        table = meta["table_name"]
        column = meta["column_name"]
        name = meta["constraint_name"] or f"{table}_{column}_{ctype.lower()}"

        if ctype == "NOT_NULL":
            if column_is_nullable(engine, table, column):
                logger.info("Applying NOT NULL constraint %s.%s", table, column)
                with engine.begin() as conn:
                    conn.execute(text(sql))
        else:
            if constraint_exists(engine, name):
                continue
            logger.info("Applying constraint %s on %s.%s", name, table, column)
            with engine.begin() as conn:
                conn.execute(text(sql))


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate Postgres constraint mapping.")
    parser.add_argument("--database-url", dest="database_url", default=os.getenv("DATABASE_URL"))
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Markdown output path.")
    parser.add_argument("--apply", action="store_true", help="Apply translated constraints to DATABASE_URL.")
    args = parser.parse_args()

    engine = build_engine(args.database_url)
    constraints = load_constraints(engine)
    translated_rows: List[Dict[str, str]] = []
    for meta in constraints:
        action, status, notes = translate_constraint(meta)
        translated_rows.append({"action": action, "status": status, "notes": notes})

    write_markdown(constraints, translated_rows, args.output)
    logger.info("Constraint mapping written to %s", args.output.relative_to(ROOT))

    if args.apply:
        apply_statements(engine, constraints, translated_rows)
        logger.info("Constraints applied to PostgreSQL instance")


if __name__ == "__main__":
    main()

