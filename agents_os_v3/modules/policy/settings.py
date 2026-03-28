"""Read policies table for builder / correction limits."""

from __future__ import annotations

import json
from typing import Any

from agents_os_v3.modules.state.errors import StateMachineError

_SCOPE_TYPES = frozenset({"GLOBAL", "DOMAIN", "GATE", "PHASE"})


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


def update_policy_by_id(cur: Any, policy_id: str, patch: dict[str, Any]) -> dict[str, Any]:
    """Partial update by primary key; validates scope and FK targets when provided."""
    cur.execute("SELECT * FROM policies WHERE id = %s", (policy_id,))
    row = cur.fetchone()
    if not row:
        raise StateMachineError("NOT_FOUND", 404, details={"policy_id": policy_id})

    row_d = dict(row)
    cols: list[str] = []
    vals: list[Any] = []

    if "policy_value_json" in patch and patch["policy_value_json"] is not None:
        pv = patch["policy_value_json"]
        if isinstance(pv, (dict, list)):
            cols.append("policy_value_json = %s")
            vals.append(json.dumps(pv, sort_keys=True))
        else:
            cols.append("policy_value_json = %s")
            vals.append(str(pv))

    if "priority" in patch and patch["priority"] is not None:
        cols.append("priority = %s")
        vals.append(int(patch["priority"]))

    if "scope_type" in patch and patch["scope_type"] is not None:
        st = str(patch["scope_type"])
        if st not in _SCOPE_TYPES:
            raise StateMachineError(
                "INVALID_ACTION",
                400,
                details={"scope_type": st},
            )
        cols.append("scope_type = %s")
        vals.append(st)

    if "domain_id" in patch:
        dom = patch["domain_id"]
        if dom is not None:
            cur.execute("SELECT 1 FROM domains WHERE id = %s", (str(dom),))
            if cur.fetchone() is None:
                raise StateMachineError("DOMAIN_NOT_FOUND", 400, details={"domain_id": dom})
        cols.append("domain_id = %s")
        vals.append(dom)

    if "gate_id" in patch:
        gid = patch["gate_id"]
        if gid is not None:
            cur.execute("SELECT 1 FROM gates WHERE id = %s", (str(gid),))
            if cur.fetchone() is None:
                raise StateMachineError("NOT_FOUND", 404, details={"gate_id": gid})
        cols.append("gate_id = %s")
        vals.append(gid)

    if "phase_id" in patch:
        ph = patch["phase_id"]
        if "gate_id" in patch:
            gate_for_phase = patch["gate_id"]
        else:
            gate_for_phase = row_d.get("gate_id")
        if ph is not None:
            if not gate_for_phase:
                raise StateMachineError(
                    "INVALID_ACTION",
                    400,
                    details={"phase_id": "gate_id required when setting phase_id"},
                )
            cur.execute(
                "SELECT 1 FROM phases WHERE id = %s AND gate_id = %s",
                (str(ph), str(gate_for_phase)),
            )
            if cur.fetchone() is None:
                raise StateMachineError("NOT_FOUND", 404, details={"phase_id": ph})
        cols.append("phase_id = %s")
        vals.append(ph)

    if not cols:
        return row_d

    cols.append("updated_at = NOW()")
    vals.append(policy_id)
    cur.execute(
        f"UPDATE policies SET {', '.join(cols)} WHERE id = %s",
        vals,
    )
    cur.execute(
        """
        SELECT id, scope_type, domain_id, gate_id, phase_id, policy_key,
               policy_value_json, priority, updated_at
        FROM policies WHERE id = %s
        """,
        (policy_id,),
    )
    out = cur.fetchone()
    return dict(out) if out else {}
