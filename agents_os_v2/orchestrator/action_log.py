"""Pipeline action log — append-only JSONL record of pipeline mutations.

Every significant pipeline action (gate advance, fail, wsm-reset, WP init) is
recorded here for audit and post-run analysis.

Flag control:
    PIPELINE_ACTION_LOG=1   (default) — logging enabled
    PIPELINE_ACTION_LOG=0             — logging disabled (debug / silence mode)

Log file: logs/pipeline_actions.jsonl  (relative to repo root, auto-created).

Each record (one JSON object per line):
    {
        "ts":          "2026-03-24T14:00:00Z",
        "action_type": "GATE_PASS" | "GATE_FAIL" | "WSM_RESET" | "WP_INIT" | ...,
        "domain":      "tiktrack" | "agents_os" | "",
        "wp":          "S003-P004-WP001" | "",
        "gate":        "GATE_2" | "",
        "phase":       "2.3" | "",
        "actor":       "pipeline_run.sh" | "team_191" | ...,
        "details":     {}   (action-specific payload)
    }
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Optional

# ── Constants ─────────────────────────────────────────────────────────────────
ACTION_LOG_ENV = "PIPELINE_ACTION_LOG"
_REPO_ROOT = Path(__file__).resolve().parent.parent.parent
DEFAULT_LOG_PATH = _REPO_ROOT / "logs" / "pipeline_actions.jsonl"


# ── Public API ────────────────────────────────────────────────────────────────

def is_enabled() -> bool:
    """Return True when action logging is active (PIPELINE_ACTION_LOG != '0')."""
    return os.environ.get(ACTION_LOG_ENV, "1") != "0"


def append_action(
    action_type: str,
    domain: str = "",
    wp: str = "",
    gate: str = "",
    phase: str = "",
    actor: str = "",
    details: Optional[Dict] = None,
    log_path: Optional[Path] = None,
) -> None:
    """Append one action record to the JSONL log.

    Non-blocking: any exception is silently swallowed so that a logging failure
    can never interrupt the pipeline execution.

    Args:
        action_type: Short verb-noun label, e.g. ``"GATE_PASS"``, ``"WSM_RESET"``.
        domain:      Pipeline domain (``"tiktrack"`` / ``"agents_os"``).
        wp:          Work-package ID, e.g. ``"S003-P004-WP001"``.
        gate:        Gate name, e.g. ``"GATE_2"``.
        phase:       Sub-phase within gate, e.g. ``"2.3"``.
        actor:       Who triggered the action (``"pipeline_run.sh"``, team ID, …).
        details:     Arbitrary dict with action-specific payload (finding_type, etc.).
        log_path:    Override log file path (used in tests). Defaults to
                     ``logs/pipeline_actions.jsonl`` inside the repo root.
    """
    if not is_enabled():
        return
    try:
        record = {
            "ts": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "action_type": action_type,
            "domain": domain or "",
            "wp": wp or "",
            "gate": gate or "",
            "phase": phase or "",
            "actor": actor or "",
            "details": details if details is not None else {},
        }
        path = log_path if log_path is not None else DEFAULT_LOG_PATH
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(record, ensure_ascii=False) + "\n")
    except Exception:
        pass  # Non-blocking: log failure must never interrupt pipeline
