"""Shared DB helpers for GATE_2 pytest (temp work packages / cleanup)."""

from __future__ import annotations

from typing import Any

from ulid import ULID


def insert_temp_wp(conn: Any, domain_id: str) -> str:
    wid = str(ULID())
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO work_packages (id, label, domain_id, status, linked_run_id, created_at, updated_at)
            VALUES (%s, %s, %s, 'PLANNED', NULL, NOW(), NOW())
            """,
            (wid, "pytest GATE_2 temp wp", domain_id),
        )
    conn.commit()
    return wid


def purge_work_package(conn: Any, wp: str) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "DELETE FROM events WHERE run_id IN (SELECT id FROM runs WHERE work_package_id = %s)",
            (wp,),
        )
        cur.execute("DELETE FROM runs WHERE work_package_id = %s", (wp,))
        cur.execute("DELETE FROM assignments WHERE work_package_id = %s", (wp,))
        cur.execute("DELETE FROM work_packages WHERE id = %s", (wp,))
    conn.commit()


def clear_in_progress_runs_for_domain(conn: Any, domain_id: str) -> None:
    """Delete IN_PROGRESS runs for a domain — test scaffolding WPs only.

    SAFETY GUARD: skips any WP whose ID matches the canonical 3-level production format
    ``S{NNN}-P{NNN}-WP{NNN}``.  Production runs must never be deleted by test teardown.
    """
    import re
    _PRODUCTION_WP_RE = re.compile(r"^S\d{3}-P\d{3}-WP\d{3}$")

    with conn.cursor() as cur:
        cur.execute(
            "SELECT id, work_package_id FROM runs WHERE domain_id = %s AND status = %s",
            (domain_id, "IN_PROGRESS"),
        )
        rows = cur.fetchall() or []
    for row in rows:
        rid = str(row["id"])
        wpid = str(row["work_package_id"])
        if _PRODUCTION_WP_RE.match(wpid):
            # Skip — this is a canonical production WP; test teardown must not touch it
            continue
        with conn.cursor() as cur:
            cur.execute("DELETE FROM events WHERE run_id = %s", (rid,))
            cur.execute("DELETE FROM runs WHERE id = %s", (rid,))
            cur.execute("UPDATE work_packages SET linked_run_id = NULL WHERE id = %s", (wpid,))
        conn.commit()
