"""Read policies table for builder / correction limits."""

from __future__ import annotations

from typing import Any


def list_policies(cur: Any) -> list[dict[str, Any]]:
    cur.execute(
        """
        SELECT id, scope_type, domain_id, gate_id, phase_id, policy_key,
               policy_value_json, priority, updated_at
        FROM policies
        ORDER BY priority DESC, policy_key ASC
        """
    )
    rows = cur.fetchall() or []
    return [dict(r) for r in rows]
