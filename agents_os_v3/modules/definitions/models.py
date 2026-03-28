"""Pydantic request/response bodies — GATE_2 (actor via X-Actor-Team-Id only)."""

from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field, field_validator

# Default domain for ideas when omitted (Agents OS seed domain)
DEFAULT_IDEAS_DOMAIN_ID = "01JK8AOSV3DOMAIN00000001"


class CreateRunBody(BaseModel):
    work_package_id: str
    domain_id: str
    process_variant: Optional[str] = None


class AdvanceRunBody(BaseModel):
    """UC-02 / T11; summary + optional Mode A feedback_json (UI §10.6)."""

    verdict: Literal["pass", "resubmit"] = "pass"
    summary: Optional[str] = None
    feedback_json: Optional[dict[str, Any]] = None


class FeedbackIngestBody(BaseModel):
    """POST /runs/{run_id}/feedback — operator modes B/C/D only (UI §10.1)."""

    detection_mode: Literal["OPERATOR_NOTIFY", "NATIVE_FILE", "RAW_PASTE"]
    file_path: Optional[str] = None
    raw_text: Optional[str] = None

    @field_validator("file_path", "raw_text", mode="before")
    @classmethod
    def _strip_opt(cls, v: Any) -> Any:
        if isinstance(v, str) and not v.strip():
            return None
        return v


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
