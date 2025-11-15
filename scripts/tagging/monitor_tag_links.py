#!/usr/bin/env python3
"""
monitor_tag_links.py
====================

Utility script for inspecting tag assignments directly from the local SQLite DB.
Allows developers to verify whether specific entities have tags linked after a
save operation without opening a SQL console manually.
"""

from __future__ import annotations

import argparse
import json
import os
import sqlite3
from typing import Any, Dict, List


DEFAULT_DB_PATH = os.path.join(
    os.path.dirname(__file__),
    '..',
    'Backend',
    'db',
    'tiktrack.db'
)


def _connect(db_path: str) -> sqlite3.Connection:
    if not os.path.exists(db_path):
        raise FileNotFoundError(f"Database not found at {db_path}")

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def fetch_links(
    conn: sqlite3.Connection,
    entity_type: str,
    entity_id: int,
    include_inactive: bool,
) -> List[sqlite3.Row]:
    query = """
        SELECT
            tl.id AS link_id,
            tl.entity_type,
            tl.entity_id,
            tl.created_at AS linked_at,
            t.id AS tag_id,
            t.name AS tag_name,
            t.is_active,
            t.usage_count,
            t.last_used_at,
            c.name AS category_name
        FROM tag_links tl
        JOIN tags t ON t.id = tl.tag_id
        LEFT JOIN tag_categories c ON c.id = t.category_id
        WHERE tl.entity_type = ?
          AND tl.entity_id = ?
    """
    params: List[Any] = [entity_type, entity_id]

    if not include_inactive:
        query += " AND t.is_active = 1"

    query += " ORDER BY t.name COLLATE NOCASE ASC"

    cursor = conn.execute(query, params)
    return cursor.fetchall()


def format_table(rows: List[sqlite3.Row]) -> str:
    if not rows:
        return "No tag links found."

    headers = [
        "link_id",
        "tag_id",
        "tag_name",
        "is_active",
        "usage_count",
        "last_used_at",
        "category_name",
        "linked_at",
    ]

    lines = [" | ".join(headers)]
    lines.append("-" * len(lines[0]))

    for row in rows:
        lines.append(
            " | ".join(
                str(row.get(col, "") if row.get(col, "") is not None else "")
                for col in headers
            )
        )

    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Inspect tag links for a specific entity."
    )
    parser.add_argument(
        "--entity",
        required=True,
        help="Entity type (e.g., trade, trade_plan, note)",
    )
    parser.add_argument(
        "--entity-id",
        type=int,
        required=True,
        help="Entity ID to inspect",
    )
    parser.add_argument(
        "--db",
        default=os.path.abspath(DEFAULT_DB_PATH),
        help="Path to tiktrack.db (defaults to Backend/db/tiktrack.db)",
    )
    parser.add_argument(
        "--include-inactive",
        action="store_true",
        help="Include inactive tags in the output",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Print output as JSON instead of table",
    )

    args = parser.parse_args()
    conn = _connect(args.db)
    try:
        rows = fetch_links(
            conn,
            args.entity,
            args.entity_id,
            args.include_inactive,
        )
    finally:
        conn.close()

    if args.json:
        print(json.dumps([dict(row) for row in rows], ensure_ascii=False, indent=2))
    else:
        print(format_table(rows))


if __name__ == "__main__":
    main()

