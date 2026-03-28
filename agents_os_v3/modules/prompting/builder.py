"""4-layer prompt assembly — GATE_2 minimal (L1 template, L2 governance file, L3 policies, L4 run)."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from agents_os_v3.modules.policy.settings import list_policies
from agents_os_v3.modules.prompting import cache as prompt_cache
from agents_os_v3.modules.prompting import templates as T
from agents_os_v3.modules.routing.resolver import resolve_actor_team_id
from agents_os_v3.modules.state import repository as R

GOVERNANCE_DIR = Path(__file__).resolve().parents[2] / "governance"


class GovernanceNotFoundError(Exception):
    """EC-02 — governance markdown missing for actor team (L2)."""

    def __init__(self, team_id: str) -> None:
        super().__init__(team_id)
        self.team_id = team_id


def _load_layer2(team_id: str) -> str:
    path = GOVERNANCE_DIR / f"{team_id}.md"
    if not path.is_file():
        raise GovernanceNotFoundError(team_id)
    return path.read_text(encoding="utf-8")


def assemble_prompt_for_run(
    conn: Any,
    *,
    run_id: str,
    bust_cache: bool = False,
) -> dict[str, Any]:
    """
    Build the 4-layer assembled prompt for ``GET /api/runs/{run_id}/prompt``.

    Raises :class:`StateMachineError` for missing run, invalid state (e.g. PAUSED), missing
    template, or unresolved actor. Raises :class:`GovernanceNotFoundError` when L2 markdown
    for the actor team is missing under ``agents_os_v3/governance/{team_id}.md``.
    """
    with conn.cursor() as cur:
        run = R.fetch_run(cur, run_id)
        if not run:
            from agents_os_v3.modules.state.errors import StateMachineError

            raise StateMachineError("RUN_NOT_FOUND", 404, details={"run_id": run_id})

        st = str(run["status"])
        if st in ("PAUSED", "NOT_STARTED"):
            from agents_os_v3.modules.state.errors import StateMachineError

            raise StateMachineError(
                "INVALID_STATE",
                409,
                details={"status": st, "hint": "prompt requires active run context"},
            )

        gate_id = str(run["current_gate_id"])
        phase_id = str(run["current_phase_id"]) if run.get("current_phase_id") else None
        domain_id = str(run["domain_id"])

        tpl = T.get_active_template(cur, gate_id=gate_id, phase_id=phase_id, domain_id=domain_id)
        if not tpl:
            from agents_os_v3.modules.state.errors import StateMachineError

            raise StateMachineError(
                "TEMPLATE_NOT_FOUND",
                404,
                details={"gate_id": gate_id, "phase_id": phase_id},
            )

        actor_team = resolve_actor_team_id(cur, run)
        if not actor_team:
            from agents_os_v3.modules.state.errors import StateMachineError

            raise StateMachineError("ROUTING_UNRESOLVED", 500, details={"run_id": run_id})

        l1 = str(tpl["body_markdown"])
        ver = int(tpl["version"])
        lu = run["last_updated"]
        lu_s = lu.isoformat() if hasattr(lu, "isoformat") else str(lu)
        cache_key = f"prompt:{run_id}:t{ver}:{lu_s}"
        if not bust_cache:
            hit = prompt_cache.cache_get(cache_key)
            if hit is not None:
                return hit

        l2 = _load_layer2(actor_team)

        policies = list_policies(cur)
        l3 = json.dumps(
            [{"policy_key": p["policy_key"], "policy_value_json": p["policy_value_json"]} for p in policies],
            default=str,
        )

        run_public = {k: str(v) if not hasattr(v, "isoformat") else v.isoformat() for k, v in dict(run).items()}
        l4 = json.dumps(run_public, default=str)

        out = {
            "run_id": run_id,
            "layers": {
                "L1_template": l1,
                "L2_governance": l2,
                "L3_policies_json": l3,
                "L4_run_json": l4,
            },
            "meta": {
                "template_id": str(tpl["id"]),
                "template_version": ver,
                "actor_team_id": actor_team,
                "token_budget_warning": None,
            },
        }
        prompt_cache.cache_set(cache_key, out)
        return out
