"""Base conversation handler — shared interface for all gates."""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class GateResult:
    gate_id: str
    status: str  # PASS / FAIL / HOLD / MANUAL
    findings: list[dict] = field(default_factory=list)
    artifacts_produced: list[str] = field(default_factory=list)
    next_gate: Optional[str] = None
    message: str = ""
    engine_response: Optional[str] = None
