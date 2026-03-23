from __future__ import annotations

"""WSM auto-write helper for pipeline gate transitions."""

import re
from datetime import datetime, timezone

from ..config import REPO_ROOT
from .log_events import append_event
from .state import PipelineState

WSM_PATH = REPO_ROOT / "documentation" / "docs-governance" / "01-FOUNDATIONS" / "PHOENIX_MASTER_WSM_v1.0.0.md"


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
    pattern = rf"(\|\s*{re.escape(field_name)}\s*\|\s*)(.*?)(\s*\|)"
    return re.sub(pattern, rf"\g<1>{new_value}\g<3>", text, count=1, flags=re.IGNORECASE)


def write_wsm_state(state: PipelineState, gate_id: str, result: str) -> None:
    """Auto-update CURRENT_OPERATIONAL_STATE fields in WSM.

    Non-blocking by design: failures emit WARN events and return.
    """
    if state.gate_state is not None:
        return
    if not WSM_PATH.exists():
        _emit_warn_event(state, gate_id, "wsm_file_missing")
        return

    try:
        original = WSM_PATH.read_text(encoding="utf-8")
    except Exception:
        _emit_warn_event(state, gate_id, "wsm_read_failed")
        return

    stage = state.stage_id or "S002"
    today = datetime.now(timezone.utc).date().isoformat()
    current_gate = state.current_gate or gate_id
    active_wp = state.work_package_id or "NONE"
    last_closed_wp = None

    # GATE_8 PASS closes the active WP and resets runtime active slot.
    if result == "PASS" and gate_id == "GATE_8":
        active_wp = "NONE"
        last_closed_wp = state.work_package_id or "NONE"

    updated = original
    updated = _replace_table_value(updated, "active_stage_id", stage)
    updated = _replace_table_value(updated, "current_gate", current_gate)
    updated = _replace_table_value(updated, "active_work_package_id", active_wp)
    if last_closed_wp:
        updated = _replace_table_value(updated, "last_closed_work_package_id", last_closed_wp)

    # Idempotency guard: do not append duplicate daily line.
    patch_line = (
        f"**log_entry | TEAM_61 | EXPLICIT_WSM_PATCH | {gate_id} {result} | "
        f"{state.work_package_id or 'NONE'} | {today}**"
    )
    if patch_line not in updated:
        if not updated.endswith("\n"):
            updated += "\n"
        updated += patch_line + "\n"

    if updated == original:
        return

    try:
        WSM_PATH.write_text(updated, encoding="utf-8")
    except Exception:
        _emit_warn_event(state, gate_id, "wsm_write_failed")
