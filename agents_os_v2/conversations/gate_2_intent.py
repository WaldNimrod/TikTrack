"""
GATE_2 — ARCHITECTURAL_SPEC_VALIDATION (Intent Gate)
Owner: Team 190 (execution), Team 100 (approval)
Question: "Do we approve building this?"
"""

from ..engines.base import BaseEngine
from ..context.injection import build_full_agent_prompt, build_canonical_message
from .base import GateResult
from .response_parser import parse_gate_decision


async def run_gate_2(engine_100: BaseEngine, lld400_content: str, stage_id: str = "S002") -> GateResult:
    system_prompt = build_full_agent_prompt(
        team_id="team_100",
        gate_id="GATE_2",
        task_message="",
    )

    user_message = build_canonical_message(
        team_from="team_190",
        team_to="team_100",
        gate_id="GATE_2",
        purpose="Approve architectural intent for implementation. Question: Do we approve building this?",
        context_inputs=["LLD400 spec (GATE_1 PASS) provided below"],
        required_actions=[
            "Review the spec for architectural soundness",
            "Verify alignment with project vision and roadmap",
            "Decide: APPROVED or REJECTED with reasoning",
        ],
        deliverables=["GATE_2 decision: APPROVED / REJECTED"],
        validation_criteria=[
            "Spec is architecturally sound",
            "Aligns with roadmap and vision",
            "Implementation scope is realistic",
        ],
        stage_id=stage_id,
        subject="GATE_2_INTENT_APPROVAL_REQUEST",
    )
    user_message += f"\n\n---\n\n## LLD400 Spec\n\n{lld400_content}"

    response = await engine_100.call_with_retry(system_prompt, user_message, max_retries=3)

    if not response.success:
        return GateResult(gate_id="GATE_2", status="FAIL", message=f"Engine error: {response.error}")

    status, reason = parse_gate_decision(response.content)

    return GateResult(
        gate_id="GATE_2",
        status=status,
        message=response.content[:500],
        engine_response=response.content,
        next_gate="GATE_3" if status == "PASS" else None,
    )
