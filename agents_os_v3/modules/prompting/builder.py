"""4-layer prompt assembly — GATE_2 minimal (L1 template, L2 governance file, L3 policies, L4 run)."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any


# ---------------------------------------------------------------------------
# §H — Token Budget helpers
# ---------------------------------------------------------------------------

_OPTIONAL_SECTIONS_RE = re.compile(
    r"^(## OPTIONAL_.*|## APPENDIX.*|## BACKGROUND.*)",
    re.MULTILINE,
)

# Soft budget thresholds (in approx tokens)
_L1_L2_MAX_TOKENS = 6000
_L3_MAX_TOKENS = 2000
_L4_MAX_TOKENS = 1000
_TOTAL_WARN_TOKENS = 8000
_TOTAL_NEAR_TOKENS = 6000


def _approx_tokens(text: str) -> int:
    """Lower-bound heuristic: len//4.
    English ≈ accurate. Hebrew/emoji = underestimate (actual higher).
    Suitable for soft budget warnings only — not for billing.
    """
    return len(text) // 4


def _trim_optional_sections(text: str, max_chars: int) -> tuple[str, bool]:
    """Remove optional sections from bottom up until under max_chars.
    Never removes SECTION 1 (MISSION), SECTION 2 (CONSTRAINTS), SECTION 3 (TRIGGER).

    ⚠️ R-03 — IMPLEMENTATION MANDATE (Team 21): unit tests REQUIRED before merge.
    """
    if len(text) <= max_chars:
        return text, False
    parts = _OPTIONAL_SECTIONS_RE.split(text)
    while len("".join(parts)) > max_chars and len(parts) > 1:
        parts.pop()
    return "".join(parts), len("".join(parts)) < len(text)

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
        l3_raw = json.dumps(
            [{"policy_key": p["policy_key"], "policy_value_json": p["policy_value_json"]} for p in policies],
            default=str,
        )

        run_public = {k: str(v) if not hasattr(v, "isoformat") else v.isoformat() for k, v in dict(run).items()}
        l4_raw = json.dumps(run_public, default=str)

        # §H — section-based trim for L1/L2; meta-only truncation for L3/L4
        truncation_applied = False
        truncated_layers: list[str] = []
        max_l1_l2_chars = _L1_L2_MAX_TOKENS * 4

        l1_trimmed, l1_cut = _trim_optional_sections(l1, max_l1_l2_chars)
        if l1_cut:
            truncated_layers.append("L1")
            truncation_applied = True
            l1 = l1_trimmed

        l2_trimmed, l2_cut = _trim_optional_sections(l2, max_l1_l2_chars)
        if l2_cut:
            truncated_layers.append("L2")
            truncation_applied = True
            l2 = l2_trimmed

        l3 = l3_raw
        if _approx_tokens(l3_raw) > _L3_MAX_TOKENS:
            l3 = json.dumps({
                "_truncated": True,
                "count": len(policies),
                "note": "fetch /api/policies for full list",
            })
            truncated_layers.append("L3")
            truncation_applied = True

        l4 = l4_raw
        if _approx_tokens(l4_raw) > _L4_MAX_TOKENS:
            l4 = json.dumps({
                "_truncated": True,
                "note": "fetch /api/runs/" + run_id + " for full run state",
            })
            truncated_layers.append("L4")
            truncation_applied = True

        total_tokens = (
            _approx_tokens(l1) + _approx_tokens(l2) + _approx_tokens(l3) + _approx_tokens(l4)
        )
        if total_tokens > _TOTAL_WARN_TOKENS:
            token_budget_warning = f"OVER_BUDGET: ~{total_tokens} tokens (limit {_TOTAL_WARN_TOKENS})"
        elif total_tokens > _TOTAL_NEAR_TOKENS:
            token_budget_warning = f"NEAR_BUDGET: ~{total_tokens} tokens"
        else:
            token_budget_warning = None

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
                "token_budget_warning": token_budget_warning,
                "approx_tokens": total_tokens,
                "approx_tokens_note": "lower-bound heuristic (len//4); Hebrew underestimated",
                "truncation_applied": truncation_applied,
                "truncated_layers": truncated_layers,
            },
        }
        prompt_cache.cache_set(cache_key, out)
        return out
