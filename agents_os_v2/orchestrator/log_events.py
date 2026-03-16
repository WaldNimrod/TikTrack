"""Pipeline event logging — append-only JSONL. WSM-sourced identity fields."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from ..config import REPO_ROOT
from ..observers.state_reader import read_wsm_identity_fields, read_stage_parallel_tracks

LOG_FILE = REPO_ROOT / "_COMMUNICATION" / "agents_os" / "logs" / "pipeline_events.jsonl"


def get_wsm_identity(domain: str | None = None) -> dict[str, str]:
    """
    Get WSM identity fields for event emission.
    Returns active_stage_id, active_work_package_id, active_project_domain.
    If domain given, prefer STAGE_PARALLEL_TRACKS for that domain's WP.
    """
    identity = read_wsm_identity_fields()
    if domain:
        tracks = read_stage_parallel_tracks()
        domain_upper = domain.upper().replace(" ", "")
        for row in tracks:
            if row.get("domain", "").upper() == domain_upper:
                if row.get("active_work_package_id"):
                    identity["active_work_package_id"] = row["active_work_package_id"]
                break
    return identity


def append_event(evt: dict[str, Any]) -> None:
    """
    Append a pipeline event to the JSONL log file.
    Non-blocking: failures do not raise (per spec: log must not disrupt flow).
    """
    if "timestamp" not in evt or not evt["timestamp"]:
        evt = dict(evt)
        evt["timestamp"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    try:
        LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        line = json.dumps(evt, ensure_ascii=False) + "\n"
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line)
    except OSError:
        pass  # Non-blocking


def append_event_to_file(evt: dict) -> None:
    """Same as append_event — used by server routes. Kept for compatibility."""
    append_event(evt)
