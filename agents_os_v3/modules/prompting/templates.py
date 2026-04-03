"""Active template slot resolution (DDL templates table)."""

from __future__ import annotations

from typing import Any


def get_active_template(
    cur: Any,
    *,
    gate_id: str,
    phase_id: str | None,
    domain_id: str | None,
) -> dict[str, Any] | None:
    cur.execute(
        """
        SELECT * FROM templates
        WHERE gate_id = %s AND is_active = 1
          AND (%s::text IS NULL OR phase_id IS NULL OR phase_id = %s::text)
          AND (%s::text IS NULL OR domain_id IS NULL OR domain_id = %s::text)
        ORDER BY
          CASE WHEN phase_id IS NOT NULL THEN 0 ELSE 1 END,
          CASE WHEN domain_id IS NOT NULL THEN 0 ELSE 1 END,
          version DESC
        LIMIT 1
        """,
        (gate_id, phase_id, phase_id, domain_id, domain_id),
    )
    row = cur.fetchone()
    return dict(row) if row else None
