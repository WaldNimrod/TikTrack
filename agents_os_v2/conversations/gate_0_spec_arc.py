"""
GATE_0 — SPEC_ARC (LOD 200)
Owner: Team 190
Action: Validate scope brief / concept against constitutional standards.
"""

from ..engines.base import BaseEngine
from ..context.injection import build_full_agent_prompt, build_canonical_message
from ..validators.identity_header import validate_identity_header
from .base import GateResult
from .response_parser import parse_gate_decision


async def run_gate_0(engine: BaseEngine, spec_brief: str, stage_id: str = "S002") -> GateResult:
    system_prompt = build_full_agent_prompt(
        team_id="team_190",
        gate_id="GATE_0",
        task_message="",
        scope="full",
    )

    user_message = build_canonical_message(
        team_from="team_10",
        team_to="team_190",
        gate_id="GATE_0",
        purpose="Validate the following scope brief for constitutional compliance and feasibility.",
        context_inputs=[
            "Scope brief provided below",
            "SSM v1.0.0 and WSM current state",
        ],
        required_actions=[
            "Validate scope against constitutional standards",
            "Check domain isolation compliance",
            "Verify no conflict with existing programs",
        ],
        deliverables=["GATE_0 validation result: PASS / BLOCK with evidence"],
        validation_criteria=[
            "Scope is constitutionally valid",
            "No conflict with active programs",
            "Domain isolation maintained",
        ],
        stage_id=stage_id,
        subject="GATE_0_SPEC_ARC_VALIDATION",
    )

    user_message += f"\n\n---\n\n## Scope Brief\n\n{spec_brief}"

    response = await engine.call_with_retry(system_prompt, user_message, max_retries=3)

    if not response.success:
        return GateResult(
            gate_id="GATE_0",
            status="FAIL",
            message=f"Engine error: {response.error}",
        )

    status, reason = parse_gate_decision(response.content)

    return GateResult(
        gate_id="GATE_0",
        status=status,
        message=response.content[:500],
        engine_response=response.content,
        next_gate="GATE_1" if status == "PASS" else None,
    )
