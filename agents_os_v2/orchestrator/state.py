from __future__ import annotations
"""
Pipeline State Manager — tracks gate progress across the pipeline.
"""

import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from dataclasses import dataclass, field, asdict
from typing import Optional

from ..config import AGENTS_OS_OUTPUT_DIR, get_state_file, DEFAULT_DOMAIN


# Legacy fallback — backward-compat alias (TikTrack default)
STATE_FILE = AGENTS_OS_OUTPUT_DIR / "pipeline_state.json"


@dataclass
class PipelineState:
    pipe_run_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    work_package_id: str = "REQUIRED"
    stage_id: str = "S002"
    project_domain: str = DEFAULT_DOMAIN   # "tiktrack" | "agents_os"
    spec_brief: str = ""
    current_gate: str = "NOT_STARTED"
    gates_completed: list[str] = field(default_factory=list)
    gates_failed: list[str] = field(default_factory=list)
    lld400_content: str = ""
    work_plan: str = ""
    mandates: str = ""
    implementation_files: list[str] = field(default_factory=list)
    implementation_endpoints: list[str] = field(default_factory=list)
    spec_path: str = ""  # Path to LLD400 spec file for G3.7 test template generation
    started_at: str = ""
    last_updated: str = ""
    # S002-P005-WP002: PASS_WITH_ACTION governance
    gate_state: Optional[str] = None       # null | "PASS_WITH_ACTION" | "OVERRIDE"
    pending_actions: list[str] = field(default_factory=list)
    override_reason: Optional[str] = None
    # GATE_8 two-phase tracking: empty = Phase 1 active; "PHASE2_ACTIVE" = Phase 2 active
    phase8_content: str = ""

    def _state_file(self) -> Path:
        return get_state_file(self.project_domain)

    def save(self):
        f = self._state_file()
        f.parent.mkdir(parents=True, exist_ok=True)
        self.last_updated = datetime.now(timezone.utc).isoformat()
        f.write_text(json.dumps(asdict(self), indent=2, ensure_ascii=False), encoding="utf-8")
        # Keep legacy pipeline_state.json in sync for backward compat
        STATE_FILE.write_text(json.dumps(asdict(self), indent=2, ensure_ascii=False), encoding="utf-8")

    @classmethod
    def load(cls, domain: str | None = None) -> "PipelineState":
        """Load pipeline state.

        Priority:  explicit arg  >  PIPELINE_DOMAIN env  >  auto-detect.

        Auto-detect rules (when no domain is given):
          - Scan all known domains for "active" WPs (past GATE_0 / NOT_STARTED).
          - Exactly 1 active  → deterministic auto-select (no warning needed).
          - 0 active          → legacy pipeline_state.json fallback / empty state.
          - 2+ active         → print error to stderr and sys.exit(1).
            The caller MUST add --domain to resolve the ambiguity.

        This ensures domain resolution is uniform across ALL code paths
        (bash commands, Python CLI, inline helpers) — no silent defaults.
        """
        import sys

        # ── 1. Explicit domain (arg or env) → load directly ─────────────────
        resolved = domain or os.environ.get("PIPELINE_DOMAIN") or None
        if resolved:
            path = get_state_file(resolved)
            if path.exists():
                data = json.loads(path.read_text(encoding="utf-8"))
                return cls(**{k: v for k, v in data.items() if k in cls.__dataclass_fields__})
            return cls(project_domain=resolved)

        # ── 2. No explicit domain → scan known domains for active WPs ────────
        # "active" = has a real work_package_id AND is past the initial gate.
        _INACTIVE_GATES = {"", "GATE_0", "NOT_STARTED"}
        _PLACEHOLDER_WPS = {"", "REQUIRED"}
        active: list[tuple[str, Path, dict]] = []
        for d in ("tiktrack", "agents_os"):
            p = get_state_file(d)
            if not p.exists():
                continue
            try:
                s = json.loads(p.read_text(encoding="utf-8"))
                wp   = s.get("work_package_id", "").strip()
                gate = s.get("current_gate", "").strip()
                if wp not in _PLACEHOLDER_WPS and gate not in _INACTIVE_GATES:
                    active.append((d, p, s))
            except Exception:
                pass

        if len(active) == 1:
            # Single active pipeline — deterministic, no ambiguity
            _d, _p, data = active[0]
            return cls(**{k: v for k, v in data.items() if k in cls.__dataclass_fields__})

        if len(active) > 1:
            # Ambiguous — multiple active pipelines — hard block
            lines = "\n".join(
                f"  {d:12s}  WP: {s.get('work_package_id', '?'):30s}"
                f"  Gate: {s.get('current_gate', '?')}"
                for d, _, s in active
            )
            print(
                "\n"
                "════════════════════════════════════════════════════════════════════\n"
                "  🔴 DOMAIN AMBIGUOUS — operation blocked\n"
                "\n"
                "  Multiple active pipelines found. Specify domain explicitly:\n"
                f"{lines}\n"
                "\n"
                "  Fix — add --domain flag:\n"
                "    ./pipeline_run.sh --domain tiktrack  <command>\n"
                "    ./pipeline_run.sh --domain agents_os <command>\n"
                "════════════════════════════════════════════════════════════════════\n",
                file=sys.stderr,
            )
            sys.exit(1)

        # ── 3. No active pipeline → legacy fallback / empty state ────────────
        if STATE_FILE.exists():
            data = json.loads(STATE_FILE.read_text(encoding="utf-8"))
            return cls(**{k: v for k, v in data.items() if k in cls.__dataclass_fields__})
        return cls()

    @classmethod
    def load_domain(cls, domain: str) -> "PipelineState":
        """Load state for a specific domain. Returns new state if not found."""
        path = get_state_file(domain)
        if path.exists():
            data = json.loads(path.read_text(encoding="utf-8"))
            state = cls(**{k: v for k, v in data.items() if k in cls.__dataclass_fields__})
            state.project_domain = domain
            return state
        return cls(project_domain=domain)

    def advance_gate(self, gate_id: str, status: str):
        if status in ("PASS", "MANDATES_READY", "PRODUCED", "MANUAL", "CONDITIONAL_PASS"):
            self.gates_completed.append(gate_id)
        else:
            self.gates_failed.append(gate_id)
        self.current_gate = gate_id
        self.save()
