from __future__ import annotations
"""
Pipeline State Manager — tracks gate progress across the pipeline.
"""

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from dataclasses import dataclass, field, asdict
from typing import Optional

from ..config import AGENTS_OS_OUTPUT_DIR


STATE_FILE = AGENTS_OS_OUTPUT_DIR / "pipeline_state.json"


@dataclass
class PipelineState:
    pipe_run_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    work_package_id: str = "REQUIRED"
    stage_id: str = "S002"
    spec_brief: str = ""
    current_gate: str = "NOT_STARTED"
    gates_completed: list[str] = field(default_factory=list)
    gates_failed: list[str] = field(default_factory=list)
    lld400_content: str = ""
    work_plan: str = ""
    mandates: str = ""
    implementation_files: list[str] = field(default_factory=list)
    implementation_endpoints: list[str] = field(default_factory=list)
    started_at: str = ""
    last_updated: str = ""

    def save(self):
        STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
        self.last_updated = datetime.now(timezone.utc).isoformat()
        STATE_FILE.write_text(json.dumps(asdict(self), indent=2, ensure_ascii=False), encoding="utf-8")

    @classmethod
    def load(cls) -> "PipelineState":
        if STATE_FILE.exists():
            data = json.loads(STATE_FILE.read_text(encoding="utf-8"))
            return cls(**{k: v for k, v in data.items() if k in cls.__dataclass_fields__})
        return cls()

    def advance_gate(self, gate_id: str, status: str):
        if status in ("PASS", "MANDATES_READY", "PRODUCED", "MANUAL", "CONDITIONAL_PASS"):
            self.gates_completed.append(gate_id)
        else:
            self.gates_failed.append(gate_id)
        self.current_gate = gate_id
        self.save()
