"""
GATE_1 — SPEC_LOCK (LOD 400)
Owner: Team 190 (validation), Team 170 (production)
Action: Team 170 produces LLD400, Team 190 validates it.
"""

from ..engines.base import BaseEngine
from ..context.injection import build_full_agent_prompt, build_canonical_message
from ..validators.identity_header import validate_identity_header
from ..validators.section_structure import validate_section_structure
from .base import GateResult


async def run_gate_1_produce(engine_170: BaseEngine, spec_brief: str, gate_0_result: str, stage_id: str = "S002") -> GateResult:
    system_prompt = build_full_agent_prompt(
        team_id="team_170",
        gate_id="GATE_1",
        task_message="",
        scope="full",
    )

    user_message = build_canonical_message(
        team_from="team_100",
        team_to="team_170",
        gate_id="GATE_1",
        purpose="Produce LLD400 spec package based on the approved LOD200 scope.",
        context_inputs=[
            f"GATE_0 result: {gate_0_result[:200]}",
            "Original scope brief provided below",
        ],
        required_actions=[
            "Produce complete LLD400 spec with all required sections",
            "Include identity header, implementation details, acceptance criteria",
            "Follow canonical message format",
        ],
        deliverables=["LLD400 spec document in canonical format"],
        validation_criteria=[
            "All mandatory sections present",
            "Identity header complete",
            "Implementation scope clearly defined",
        ],
        stage_id=stage_id,
        subject="GATE_1_LLD400_PRODUCTION_REQUEST",
    )

    user_message += f"\n\n---\n\n## Scope Brief\n\n{spec_brief}"

    response = await engine_170.call_with_retry(system_prompt, user_message, max_retries=3)

    if not response.success:
        return GateResult(gate_id="GATE_1", status="FAIL", message=f"Engine error: {response.error}")

    return GateResult(
        gate_id="GATE_1",
        status="PRODUCED",
        message="LLD400 produced — pending validation by Team 190",
        engine_response=response.content,
    )


async def run_gate_1_validate(engine_190: BaseEngine, lld400_content: str, stage_id: str = "S002") -> GateResult:
    # Deterministic checks first
    header_findings = validate_identity_header(lld400_content, "LLD400")
    section_findings = validate_section_structure(lld400_content, "LLD400")

    blocks = [f for f in header_findings + section_findings if f.status == "BLOCK"]
    if blocks:
        return GateResult(
            gate_id="GATE_1",
            status="FAIL",
            findings=[{"check_id": f.check_id, "message": f.message} for f in blocks],
            message=f"Deterministic validation failed: {len(blocks)} blocks",
        )

    # LLM validation for content quality
    system_prompt = build_full_agent_prompt(
        team_id="team_190",
        gate_id="GATE_1",
        task_message="",
    )

    user_message = build_canonical_message(
        team_from="team_170",
        team_to="team_190",
        gate_id="GATE_1",
        purpose="Validate this LLD400 spec for constitutional compliance and completeness.",
        context_inputs=["LLD400 document provided below"],
        required_actions=["Validate completeness", "Check constitutional compliance", "Verify implementation scope is clear"],
        deliverables=["Validation result: PASS / BLOCK"],
        validation_criteria=["All spec requirements are clear and actionable", "No constitutional violations"],
        stage_id=stage_id,
        subject="GATE_1_LLD400_VALIDATION_REQUEST",
    )
    user_message += f"\n\n---\n\n## LLD400 Document\n\n{lld400_content}"

    response = await engine_190.call_with_retry(system_prompt, user_message, max_retries=3)

    if not response.success:
        return GateResult(gate_id="GATE_1", status="FAIL", message=f"Engine error: {response.error}")

    status = "PASS" if "PASS" in response.content.upper() and "BLOCK" not in response.content.upper() else "FAIL"

    return GateResult(
        gate_id="GATE_1",
        status=status,
        message=response.content[:500],
        engine_response=response.content,
        next_gate="GATE_2" if status == "PASS" else None,
    )
