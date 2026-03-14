from __future__ import annotations
"""
Agents_OS V2 — Context Injection
Builds canonical messages per TEAM_190_TO_ALL_TEAMS_CANONICAL_MESSAGE_FORMAT_LOCK_v1.0.0.

Every LLM call gets a full 4-layer context injection:
  Layer 1: Team identity (from context/identity/team_XX.md)
  Layer 2: Governance rules (canonical format, gate rules, drift prevention)
  Layer 3: Current state (WSM, active stage, STATE_SNAPSHOT)
  Layer 4: Task-specific request

Based on:
  - Canonical Message Format Lock v1.0.0
  - Context Loading Protocol (TEAM_100_SUCCESSOR_HANDOFF_PACKAGE)
  - Drift Prevention Rules v1.0.0
"""

import json
from datetime import datetime, timezone, date
from pathlib import Path
from typing import Optional

from ..config import REPO_ROOT, STATE_SNAPSHOT_PATH

IDENTITY_DIR = Path(__file__).parent / "identity"
GOVERNANCE_DIR = Path(__file__).parent / "governance"
CONVENTIONS_DIR = Path(__file__).parent / "conventions"


def _read_file(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8").strip()
    except FileNotFoundError:
        return f"[FILE NOT FOUND: {path}]"


def _read_state_snapshot() -> dict:
    try:
        return json.loads(STATE_SNAPSHOT_PATH.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return {"error": "STATE_SNAPSHOT.json not found. Run: python3 -m agents_os_v2.observers.state_reader"}


def load_team_identity(team_id: str) -> str:
    identity_file = IDENTITY_DIR / f"{team_id}.md"
    return _read_file(identity_file)


def load_governance_rules() -> str:
    return _read_file(GOVERNANCE_DIR / "gate_rules.md")


def load_conventions(scope: str) -> str:
    if scope in ("backend", "full"):
        return _read_file(CONVENTIONS_DIR / "backend.md")
    elif scope == "frontend":
        return _read_file(CONVENTIONS_DIR / "frontend.md")
    return ""


_TEAM_ROLES = {
    "team_10":  "Gateway",
    "team_20":  "API-Verify",
    "team_30":  "Frontend",
    "team_50":  "QA",
    "team_90":  "Dev-Validator",
    "team_100": "Arch-Authority",
    "team_170": "Spec-Author",
    "team_190": "Constitutional-Validator",
}


def build_identity_stamp(
    team_id: str,
    gate_id: str,
    work_package_id: str = "N/A",
    stage_id: str = "S002",
) -> str:
    """Lean identity stamp — ~40 tokens. Canonical replacement for CONTEXT_RESET.

    Prevents context drift without verbose re-injection.
    Format: **ACTIVE: TEAM_XX (Role)** gate=... | wp=... | stage=... | date=...

    Use fresh=True in build_full_agent_prompt() to additionally prepend the full identity.
    """
    role = _TEAM_ROLES.get(team_id, team_id.upper())
    today = date.today().isoformat()
    return (
        f"**ACTIVE: {team_id.upper()} ({role})**  "
        f"gate={gate_id} | wp={work_package_id} | stage={stage_id} | {today}"
    )


def build_context_reset(team_id: str) -> str:
    """DEPRECATED — use build_identity_stamp() instead.

    Kept for backward compatibility with conversations/*.py files.
    Returns a lean stamp rather than the old verbose CONTEXT_RESET line.
    """
    return build_identity_stamp(team_id, gate_id="N/A")


def build_state_summary() -> str:
    snapshot = _read_state_snapshot()
    if "error" in snapshot:
        return snapshot["error"]

    gov = snapshot.get("governance", {})
    cb = snapshot.get("codebase", {})
    q = snapshot.get("quality", {})
    backend = cb.get("backend", {})

    lines = [
        "## Current Project State (from STATE_SNAPSHOT)",
        "",
        f"- **Active stage:** {gov.get('active_stage', 'unknown')}",
        f"- **WSM path:** {gov.get('wsm_path', 'unknown')}",
        f"- **SSM path:** {gov.get('ssm_path', 'unknown')}",
        "",
        f"- **Backend models:** {len(backend.get('models', []))} ({', '.join(backend.get('models', [])[:5])}...)",
        f"- **Backend routers:** {len(backend.get('routers', []))}",
        f"- **Backend services:** {len(backend.get('services', []))}",
        f"- **Backend schemas:** {len(backend.get('schemas', []))}",
        f"- **Frontend pages:** {len(cb.get('frontend', {}).get('pages', []))}",
        f"- **DB migrations:** {cb.get('database', {}).get('migration_count', 0)}",
        "",
        f"- **Unit test files:** {q.get('unit_test_files', 0)}",
        f"- **CI pipeline:** {'yes' if q.get('has_ci_pipeline') else 'no'}",
    ]
    return "\n".join(lines)


def build_identity_header(
    team_from: str,
    team_to: str,
    gate_id: str,
    work_package_id: str = "N/A",
    stage_id: str = "S002",
    program_id: str = "N/A",
) -> str:
    """Build the Mandatory Identity Header per canonical format."""
    return (
        f"## Mandatory Identity Header\n\n"
        f"| Field | Value |\n"
        f"|---|---|\n"
        f"| roadmap_id | PHOENIX_ROADMAP |\n"
        f"| stage_id | {stage_id} |\n"
        f"| program_id | {program_id} |\n"
        f"| work_package_id | {work_package_id} |\n"
        f"| task_id | N/A |\n"
        f"| gate_id | {gate_id} |\n"
        f"| phase_owner | {team_from} |\n"
        f"| required_ssm_version | 1.0.0 |\n"
        f"| required_active_stage | {stage_id} |"
    )


def build_canonical_message(
    team_from: str,
    team_to: str,
    gate_id: str,
    purpose: str,
    context_inputs: list[str],
    required_actions: list[str],
    deliverables: list[str],
    validation_criteria: list[str],
    work_package_id: str = "N/A",
    stage_id: str = "S002",
    program_id: str = "N/A",
    subject: str = "ORCHESTRATOR_REQUEST",
) -> str:
    """
    Build a full canonical message per TEAM_190_TO_ALL_TEAMS_CANONICAL_MESSAGE_FORMAT_LOCK_v1.0.0.
    This is the message sent TO the team agent.
    """
    today = date.today().isoformat()
    from_label = team_from.replace("_", " ").title()
    to_label = team_to.replace("_", " ").title()

    context_list = "\n".join(f"{i+1}. {c}" for i, c in enumerate(context_inputs))
    actions_list = "\n".join(f"{i+1}. {a}" for i, a in enumerate(required_actions))
    deliverables_list = "\n".join(f"{i+1}. {d}" for i, d in enumerate(deliverables))
    criteria_list = "\n".join(f"{i+1}. {c}" for i, c in enumerate(validation_criteria))

    return (
        f"# {from_label.upper().replace(' ','_')}_TO_{to_label.upper().replace(' ','_')}_{subject}\n\n"
        f"**project_domain:** TIKTRACK\n"
        f"**id:** {from_label.upper().replace(' ','_')}_TO_{to_label.upper().replace(' ','_')}_{subject}\n"
        f"**from:** {from_label}\n"
        f"**to:** {to_label}\n"
        f"**date:** {today}\n"
        f"**status:** ACTION_REQUIRED\n"
        f"**gate_id:** {gate_id}\n"
        f"**work_package_id:** {work_package_id}\n\n"
        f"---\n\n"
        f"{build_identity_header(team_from, team_to, gate_id, work_package_id, stage_id, program_id)}\n\n"
        f"## 1) Purpose\n{purpose}\n\n"
        f"## 2) Context / Inputs\n{context_list}\n\n"
        f"## 3) Required actions\n{actions_list}\n\n"
        f"## 4) Deliverables and paths\n{deliverables_list}\n\n"
        f"## 5) Validation criteria (PASS/FAIL)\n{criteria_list}\n\n"
        f"## 6) Response required\n"
        f"- Decision: PASS / CONDITIONAL_PASS / FAIL\n"
        f"- Blocking findings (if any)\n"
        f"- Evidence-by-path\n\n"
        f"log_entry | {from_label.upper().replace(' ','_')} | {subject} | ACTION_REQUIRED | {today}"
    )


def build_full_agent_prompt(
    team_id: str,
    gate_id: str,
    task_message: str,
    work_package_id: str = "N/A",
    scope: str = "full",
    include_conventions: bool = False,
    fresh: bool = False,
    stage_id: str = "S002",
) -> str:
    """Build a complete prompt for an agent call.

    fresh=True (new session): includes full identity file + governance rules (heavy, ~1000+ tokens).
    fresh=False (continuing session): lean stamp only (40 tokens). Agent already has context.
    """
    parts = []

    # Identity stamp — always present, prevents drift
    parts.append(build_identity_stamp(team_id, gate_id, work_package_id, stage_id))
    parts.append("")

    if fresh:
        # Full identity + governance for new sessions
        parts.append("# Your Identity and Role")
        parts.append(load_team_identity(team_id))
        parts.append("")
        parts.append("# Governance Rules")
        parts.append(load_governance_rules())
        parts.append("")

    # State snapshot — always include (changes every session)
    parts.append("# Current Project State")
    parts.append(build_state_summary())
    parts.append("")

    # Conventions (for implementation teams)
    if include_conventions:
        conv = load_conventions(scope)
        if conv and "[FILE NOT FOUND" not in conv:
            parts.append("# Coding Conventions")
            parts.append(conv)
            parts.append("")

    # Gate + WP context anchor
    parts.append(f"gate={gate_id} | wp={work_package_id} | no-assumption-decisions | no-cross-domain-leakage")
    parts.append("")

    return "\n".join(parts)
