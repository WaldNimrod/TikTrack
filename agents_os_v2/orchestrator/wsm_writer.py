from __future__ import annotations

"""WSM auto-write helper for pipeline gate transitions (SSOT — S003-P012-WP001).

CURRENT_OPERATIONAL_STATE is updated only by pipeline advance (pass/fail/approve).
Do not skip updates when gate_state is HUMAN_PENDING — WSM must reflect operational truth.
"""

import re
from datetime import datetime, timezone

from ..config import REPO_ROOT
from .log_events import append_event
from .state import PipelineState

WSM_PATH = REPO_ROOT / "documentation" / "docs-governance" / "01-FOUNDATIONS" / "PHOENIX_MASTER_WSM_v1.0.0.md"

# Short labels for active_stage_id (WSM active_stage_label)
_STAGE_LABELS: dict[str, str] = {
    "S001": "S001 — Foundation",
    "S002": "שלב 1 — Stage 1",
    "S003": "שלב 2 — Stage 2",
    "S004": "שלב 3 — Stage 3",
}


def _emit_warn_event(state: PipelineState, gate_id: str, reason: str) -> None:
    try:
        append_event(
            {
                "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "pipe_run_id": state.pipe_run_id or "pipeline",
                "event_type": "WSM_UPDATE_WARN",
                "domain": state.project_domain or "",
                "stage_id": state.stage_id or "",
                "work_package_id": state.work_package_id or "",
                "gate": gate_id,
                "agent_team": "team_61",
                "severity": "WARN",
                "description": f"WSM auto-write skipped: {reason}",
                "metadata": {"reason": reason},
            }
        )
    except Exception:
        pass


def _replace_table_value(text: str, field_name: str, new_value: str) -> str:
    """Replace Value in | field_name | value | row (single line)."""
    cell = new_value.replace("|", "\\|")
    pattern = rf"(\|\s*{re.escape(field_name)}\s*\|\s*)([^\n|]*)(\s*\|)"
    return re.sub(pattern, rf"\g<1>{cell}\g<3>", text, count=1, flags=re.IGNORECASE)


def _plan_id_from_stage(stage: str) -> str:
    s = (stage or "").strip()
    if re.match(r"^S\d{3}$", s):
        return s
    return s or "S003"


def _program_id_from_wp(wp: str) -> str:
    """S003-P011-WP002 → S003-P011"""
    parts = (wp or "").replace("_", "-").split("-")
    if len(parts) >= 3:
        return f"{parts[0]}-{parts[1]}"
    return ""


def _default_phase_for_gate(gate: str) -> str:
    g = (gate or "").upper()
    return {
        "GATE_1": "1.1",
        "GATE_2": "2.2",
        "GATE_3": "3.1",
        "GATE_4": "4.1",
        "GATE_5": "5.1",
        "COMPLETE": "5.1",
    }.get(g, "1.1")


def _resolve_owner_label(state: PipelineState, gate: str) -> str:
    """Human-readable team owner for WSM prose (lazy import avoids cycles)."""
    try:
        from .pipeline import resolve_phase_owner_from_state

        ph = str(state.current_phase or "").strip() or _default_phase_for_gate(gate)
        own = resolve_phase_owner_from_state(state, gate, ph)
        if isinstance(own, list):
            return ", ".join(o.replace("team_", "Team ") for o in own)
        return str(own).replace("team_", "Team ")
    except Exception:
        return "Team 10"


def _is_closure_pass(state: PipelineState, gate_id: str, result: str) -> bool:
    """Lifecycle closed — 5-gate (GATE_5) or legacy GATE_8."""
    if result != "PASS":
        return False
    if state.current_gate == "COMPLETE":
        return True
    if gate_id == "GATE_8":
        return True
    return False


def write_wsm_state(state: PipelineState, gate_id: str, result: str) -> None:
    """DEPRECATED (S003-P016) — COS fields moved to pipeline_state_*.json; WSM is now static policy.

    Retained as no-op so existing import sites and test monkeypatches continue to work.
    """
    return  # no-op


def write_wsm_idle_reset(
    tt_wp: str = "",
    tt_gate: str = "",
    aos_wp: str = "",
    aos_gate: str = "",
) -> None:
    """DEPRECATED (S003-P016) — COS section removed from WSM; idle state is in pipeline_state_*.json.

    Retained as no-op so existing call sites and test monkeypatches continue to work.
    """
    return  # no-op


def _parallel_tracks_domain_key(state: PipelineState) -> str:
    """STAGE_PARALLEL_TRACKS row key: TIKTRACK | AGENTS_OS."""
    raw = (state.project_domain or "tiktrack").strip().lower().replace("-", "_")
    if raw in ("agents_os", "agentsos"):
        return "AGENTS_OS"
    return "TIKTRACK"


def write_stage_parallel_tracks_row(state: PipelineState) -> None:
    """Update the STAGE_PARALLEL_TRACKS table row for this pipeline domain (SSOT for tiktrack).

    ssot_check --domain tiktrack compares pipeline_state to this row — must stay aligned
    on every pass/fail/phase transition (FIX-101-02).
    """
    if not WSM_PATH.exists():
        _emit_warn_event(state, (state.current_gate or ""), "wsm_file_missing_parallel")
        return

    try:
        text = WSM_PATH.read_text(encoding="utf-8")
    except Exception:
        _emit_warn_event(state, (state.current_gate or ""), "wsm_read_failed_parallel")
        return

    key = _parallel_tracks_domain_key(state)
    wp = (state.work_package_id or "").strip() or "—"
    prog = _program_id_from_wp(wp) if wp not in ("—", "NONE", "N/A", "") else "—"
    cg = (state.current_gate or "").strip() or "—"
    ph = (getattr(state, "current_phase", None) or "").strip()
    team = _resolve_owner_label(state, cg)
    today = datetime.now(timezone.utc).date().isoformat()
    phase_bits = [f"**{today}** pipeline sync"]
    if cg and cg != "—":
        phase_bits.append(f"gate={cg}")
    if ph:
        phase_bits.append(f"phase={ph}")
    if wp and wp != "—":
        phase_bits.append(f"wp={wp}")
    phase_status = " — ".join(phase_bits)

    # One line, six columns — avoid raw '|' inside cells (breaks markdown table)
    new_row = f"| {key} | {prog} | {wp} | {phase_status} | {cg} | {team} |"

    idx = text.find("## STAGE_PARALLEL_TRACKS")
    if idx < 0:
        _emit_warn_event(state, cg, "stage_parallel_tracks_section_missing")
        return
    block_start = idx
    rest = text[block_start:]
    next_h2 = re.search(r"\n##\s+", rest[1:])
    block_end = block_start + (next_h2.start() + 1 if next_h2 else len(rest))
    block = text[block_start:block_end]

    lines = block.splitlines(keepends=True)
    out_lines: list[str] = []
    replaced = False
    prefix = f"| {key} |"
    for line in lines:
        stripped = line.lstrip()
        if stripped.startswith(prefix):
            out_lines.append(new_row + "\n")
            replaced = True
        else:
            out_lines.append(line)

    if not replaced:
        _emit_warn_event(state, cg, f"parallel_tracks_row_not_found:{key}")
        return

    new_block = "".join(out_lines)
    updated = text[:block_start] + new_block + text[block_end:]

    today_log = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    log_line = (
        f"**log_entry | PIPELINE_RUNNER | STAGE_PARALLEL_TRACKS_SYNC | {key} | "
        f"{cg} | {wp} | {today_log}**\n"
    )
    if log_line.strip() not in updated:
        if not updated.endswith("\n"):
            updated += "\n"
        updated += log_line

    if updated == text:
        return
    try:
        WSM_PATH.write_text(updated, encoding="utf-8")
    except Exception:
        _emit_warn_event(state, cg, "wsm_parallel_tracks_write_failed")


def sync_parallel_tracks_from_pipeline() -> None:
    """Load domain from PIPELINE_ENV and sync STAGE_PARALLEL_TRACKS (shell helper)."""
    import os

    d = (os.environ.get("PIPELINE_DOMAIN") or "").strip()
    if not d:
        return
    st = PipelineState.load(d)
    write_stage_parallel_tracks_row(st)
