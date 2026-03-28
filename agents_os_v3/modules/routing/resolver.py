"""
resolve_actor(run) → team_id | None

Precondition: run.status ∈ {IN_PROGRESS, CORRECTION} (AD-S5-02: not PAUSED).
GATE_2 slice: standard rule match + assignment (Stage B); sentinel via lod200_author_team column.
"""

from __future__ import annotations

from typing import Any

from agents_os_v3.modules.state import repository as R


def resolve_actor_team_id(cur: Any, run: dict[str, Any]) -> str | None:
    st = str(run["status"])
    if st not in ("IN_PROGRESS", "CORRECTION"):
        return None

    gate_id = str(run["current_gate_id"])
    domain_id = str(run["domain_id"])
    phase_id = str(run["current_phase_id"]) if run.get("current_phase_id") else None
    wp_id = str(run["work_package_id"])
    pv = str(run["process_variant"])

    cur.execute(
        """
        SELECT * FROM routing_rules
        WHERE gate_id = %s
          AND (domain_id = %s OR domain_id IS NULL)
          AND (phase_id = %s OR phase_id IS NULL)
          AND (variant IS NULL OR variant = %s)
        ORDER BY
          CASE WHEN resolve_from_state_key IS NOT NULL THEN 0 ELSE 1 END,
          CASE WHEN domain_id IS NOT NULL THEN 0 ELSE 1 END,
          CASE WHEN phase_id IS NOT NULL THEN 0 ELSE 1 END,
          CASE WHEN variant IS NOT NULL THEN 0 ELSE 1 END,
          priority DESC
        LIMIT 1
        """,
        (gate_id, domain_id, phase_id, pv),
    )
    row = cur.fetchone()
    if not row:
        return None
    rule = dict(row)
    key = rule.get("resolve_from_state_key")
    if key:
        col = str(key)
        if col in run and run[col] is not None:
            return str(run[col])
    role_id = str(rule["role_id"])
    asg = R.assignment_for_role(cur, wp_id, role_id)
    if not asg:
        return None
    return str(asg["team_id"])
