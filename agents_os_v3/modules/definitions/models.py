"""Pydantic request/response bodies — GATE_2 (actor via X-Actor-Team-Id only)."""

from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field, field_validator, model_validator

# Default domain for ideas when omitted (Agents OS seed domain)
DEFAULT_IDEAS_DOMAIN_ID = "01JK8AOSV3DOMAIN00000001"


class CreateRunBody(BaseModel):
    work_package_id: str
    domain_id: str
    process_variant: Optional[str] = None


class RejectEntryBody(BaseModel):
    """POST /runs/{run_id}/reject-entry — GATE_0 terminal rejection by team_190 or team_00."""

    reason: str


class AdvanceRunBody(BaseModel):
    """UC-02 / T11; summary + optional Mode A feedback_json (UI §10.6)."""

    verdict: Literal["pass", "resubmit"] = "pass"
    summary: Optional[str] = None
    feedback_json: Optional[dict[str, Any]] = None


class BlockingFindingV1(BaseModel):
    """Single blocking finding inside a StructuredVerdictV1 payload."""

    id: str = Field(..., description="e.g. F-01")
    severity: Literal["BLOCKER", "MAJOR", "MINOR"]
    description: str = Field(..., min_length=1)
    evidence: Optional[str] = None


class StructuredVerdictV1(BaseModel):
    """Mode A (CANONICAL_AUTO) structured verdict body — schema_version 1."""

    schema_version: Literal["1"] = "1"
    verdict: Literal["PASS", "FAIL"]
    confidence: Literal["HIGH", "MEDIUM", "LOW"] = "HIGH"
    summary: str = Field(..., min_length=1)
    blocking_findings: list[BlockingFindingV1] = Field(default_factory=list)
    route_recommendation: Optional[Literal["doc", "impl", "arch"]] = None


class FeedbackIngestBody(BaseModel):
    """POST /runs/{run_id}/feedback — all modes A/B/C/D (UI §10.1)."""

    detection_mode: Literal["CANONICAL_AUTO", "OPERATOR_NOTIFY", "NATIVE_FILE", "RAW_PASTE"]
    structured_json: Optional[StructuredVerdictV1] = None
    file_path: Optional[str] = None
    raw_text: Optional[str] = None

    @field_validator("file_path", "raw_text", mode="before")
    @classmethod
    def _strip_opt(cls, v: Any) -> Any:
        if isinstance(v, str) and not v.strip():
            return None
        return v

    @model_validator(mode="after")
    def _check_by_mode(self) -> "FeedbackIngestBody":
        if self.detection_mode == "CANONICAL_AUTO" and not self.structured_json:
            raise ValueError("structured_json required for CANONICAL_AUTO")
        if self.detection_mode == "NATIVE_FILE" and not self.file_path:
            raise ValueError("file_path required for NATIVE_FILE")
        if self.detection_mode == "RAW_PASTE" and not self.raw_text:
            raise ValueError("raw_text required for RAW_PASTE")
        return self


class FailRunBody(BaseModel):
    reason: str = Field(..., min_length=1)
    findings: Optional[list[dict[str, Any]]] = None


class ApproveRunBody(BaseModel):
    approval_notes: Optional[str] = None


class PauseRunBody(BaseModel):
    pause_reason: str = Field(..., min_length=1)


class ResumeRunBody(BaseModel):
    resume_notes: Optional[str] = None


class PrincipalOverrideBody(BaseModel):
    """UC-12 — Module Map §4.8; actor_team_id must match X-Actor-Team-Id."""

    actor_team_id: str = Field(..., min_length=1)
    action: str = Field(..., min_length=1)
    reason: str = Field(..., min_length=1)
    snapshot: Optional[dict[str, Any]] = None


class PolicyUpdateBody(BaseModel):
    """PUT /api/policies/{policy_id} — optional partial update (team_00 only)."""

    policy_value_json: Optional[Any] = None
    priority: Optional[int] = None
    scope_type: Optional[str] = None
    domain_id: Optional[str] = None
    gate_id: Optional[str] = None
    phase_id: Optional[str] = None


ALLOWED_IDEA_TYPES = ("BUG", "FEATURE", "IMPROVEMENT", "TECH_DEBT", "RESEARCH")


class IdeaCreateBody(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "MEDIUM"
    domain_id: Optional[str] = None
    idea_type: str = "FEATURE"

    @field_validator("idea_type")
    @classmethod
    def _upper_idea_type(cls, v: str) -> str:
        return (v or "FEATURE").strip().upper()


class IdeaUpdateBody(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    decision_notes: Optional[str] = None
    target_program_id: Optional[str] = None


class TeamEngineUpdateBody(BaseModel):
    """PUT /api/teams/{team_id}/engine — UI Spec (team_00 only)."""

    engine: str = Field(..., min_length=1)


class RoutingRuleCreateBody(BaseModel):
    gate_id: str
    phase_id: Optional[str] = None
    domain_id: Optional[str] = None
    variant: Optional[str] = None
    role_id: str
    priority: int = 100
    resolve_from_state_key: Optional[str] = None


class RoutingRuleUpdateBody(BaseModel):
    gate_id: Optional[str] = None
    phase_id: Optional[str] = None
    domain_id: Optional[str] = None
    variant: Optional[str] = None
    role_id: Optional[str] = None
    priority: Optional[int] = None
    resolve_from_state_key: Optional[str] = None


class TemplateUpdateBody(BaseModel):
    body_markdown: Optional[str] = None
    version: Optional[int] = None
    is_active: Optional[int] = Field(default=None, ge=0, le=1)
    name: Optional[str] = None


class ErrorResponse(BaseModel):
    code: str
    message: str
    details: Optional[dict[str, Any]] = None
