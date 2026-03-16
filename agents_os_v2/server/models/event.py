"""Pipeline Event schema v2 — canonical definition per TEAM_00 approval."""

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class EventType(str, Enum):
    """Canonical event types for pipeline event log."""

    GATE_PASS = "GATE_PASS"
    GATE_FAIL = "GATE_FAIL"
    GATE_BLOCK = "GATE_BLOCK"
    GATE_ADVANCE_BLOCKED = "GATE_ADVANCE_BLOCKED"
    PIPELINE_APPROVE = "PIPELINE_APPROVE"
    PHASE_TRANSITION = "PHASE_TRANSITION"
    INIT_PIPELINE = "INIT_PIPELINE"
    WSM_UPDATE = "WSM_UPDATE"
    DRIFT_DETECTED = "DRIFT_DETECTED"
    DRIFT_RESOLVED = "DRIFT_RESOLVED"
    PASS_WITH_ACTION = "PASS_WITH_ACTION"
    OVERRIDE = "OVERRIDE"
    SNAPSHOT_GENERATED = "SNAPSHOT_GENERATED"
    ERROR = "ERROR"
    ARTIFACT_STORE = "ARTIFACT_STORE"
    SERVER_START = "SERVER_START"
    SERVER_STOP = "SERVER_STOP"
    SERVER_ERROR = "SERVER_ERROR"


class PipelineEvent(BaseModel):
    """Canonical pipeline event — all fields per approval spec."""

    timestamp: str = Field(..., description="ISO-8601 UTC")
    pipe_run_id: str = Field(..., description="UUID or unique run ID")
    event_type: EventType = Field(...)
    domain: str = Field(..., description="agents_os | tiktrack | global")
    stage_id: str = Field(default="", description="From WSM ONLY")
    work_package_id: str = Field(default="", description="From WSM ONLY")
    gate: str = Field(default="", description="Current gate ID")
    agent_team: str = Field(default="", description="Team that triggered event")
    severity: str = Field(default="INFO", description="INFO | WARN | ERROR")
    description: str = Field(default="", description="Human-readable")
    metadata: dict[str, Any] = Field(default_factory=dict)
