"""wp_artifact_index persistence — depends on definitions/DDL only (Process Map §10 Layer 1)."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from ulid import ULID


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def insert_artifact(
    cur: Any,
    *,
    work_package_id: str,
    path: str,
    type_: str,
    status: str,
    stage: str | None = None,
    created_by: str | None = None,
    purpose: str | None = None,
) -> str:
    """Insert a wp_artifact_index row; returns new id (ULID)."""
    row_id = str(ULID())
    now = utc_now()
    cur.execute(
        """
        INSERT INTO wp_artifact_index (
          id, work_package_id, path, type, status, stage,
          created_by, created_at, supersedes, purpose, last_updated
        ) VALUES (
          %s, %s, %s, %s, %s, %s,
          %s, %s, NULL, %s, %s
        )
        """,
        (
            row_id,
            work_package_id,
            path,
            type_,
            status,
            stage,
            created_by,
            now,
            purpose,
            now,
        ),
    )
    return row_id


def list_by_work_package(cur: Any, work_package_id: str) -> list[dict[str, Any]]:
    cur.execute(
        """
        SELECT id, work_package_id, path, type, status, stage, created_by,
               created_at, supersedes, purpose, last_updated
        FROM wp_artifact_index
        WHERE work_package_id = %s
        ORDER BY created_at ASC
        """,
        (work_package_id,),
    )
    rows = cur.fetchall() or []
    return [dict(r) for r in rows]


def mark_status(cur: Any, artifact_id: str, status: str) -> None:
    cur.execute(
        """
        UPDATE wp_artifact_index
        SET status = %s, last_updated = %s
        WHERE id = %s
        """,
        (status, utc_now(), artifact_id),
    )
