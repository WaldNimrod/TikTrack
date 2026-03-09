"""
GATE_3 — IMPLEMENTATION (G3.1–G3.9)
Owner: Team 10
Includes: planning, G3.5 validation by Team 90, mandate generation, Cursor pause.
"""

from ..engines.base import BaseEngine
from ..context.injection import build_full_agent_prompt, build_canonical_message
from .base import GateResult


async def run_g35_work_plan_validation(engine_90: BaseEngine, work_plan: str, wp_id: str = "N/A", stage_id: str = "S002") -> GateResult:
    """G3.5: Team 90 validates work plan before implementation."""
    system_prompt = build_full_agent_prompt(
        team_id="team_90",
        gate_id="GATE_3",
        task_message="",
        work_package_id=wp_id,
    )

    user_message = build_canonical_message(
        team_from="team_10",
        team_to="team_90",
        gate_id="GATE_3",
        purpose="Validate work plan for implementation readiness (G3.5 — WORK_PACKAGE_VALIDATION_WITH_TEAM_90).",
        context_inputs=["Work plan provided below"],
        required_actions=[
            "Validate work plan completeness",
            "Check gate sequencing",
            "Verify team assignments are correct",
            "Verify deliverables are clearly defined",
        ],
        deliverables=["VALIDATION_RESPONSE: PASS / FAIL with blocking findings"],
        validation_criteria=[
            "Work plan covers all spec requirements",
            "Team assignments match TEAM_DEVELOPMENT_ROLE_MAPPING",
            "Deliverables are concrete and verifiable",
        ],
        work_package_id=wp_id,
        stage_id=stage_id,
        subject="G3_5_WORK_PLAN_VALIDATION",
    )
    user_message += f"\n\n---\n\n## Work Plan\n\n{work_plan}"

    response = await engine_90.call_with_retry(system_prompt, user_message, max_retries=3)

    if not response.success:
        return GateResult(gate_id="GATE_3_G35", status="FAIL", message=f"Engine error: {response.error}")

    status = "PASS" if "PASS" in response.content.upper() and "BLOCK" not in response.content.upper() else "FAIL"

    return GateResult(
        gate_id="GATE_3_G35",
        status=status,
        message=response.content[:500],
        engine_response=response.content,
    )


async def run_g36_build_mandates(engine_10: BaseEngine, lld400_content: str, work_plan: str, wp_id: str = "N/A", stage_id: str = "S002") -> GateResult:
    """G3.6: Team 10 builds per-team mandates for implementation."""
    system_prompt = build_full_agent_prompt(
        team_id="team_10",
        gate_id="GATE_3",
        task_message="",
        work_package_id=wp_id,
    )

    user_message = (
        f"Build EXECUTION_AND_TEAM_PROMPTS for this work package.\n\n"
        f"Create a separate mandate for each in-scope team (20, 30, 40, 60) as needed.\n"
        f"Each mandate must include:\n"
        f"1. Link to full work plan as context\n"
        f"2. Execution order with dependencies\n"
        f"3. Specific tasks for that team\n"
        f"4. Expected deliverables\n"
        f"5. Seal (SOP-013) reminder\n\n"
        f"---\n\n## LLD400 Spec\n\n{lld400_content[:3000]}\n\n"
        f"## Work Plan\n\n{work_plan[:2000]}"
    )

    response = await engine_10.call_with_retry(system_prompt, user_message, max_retries=3)

    if not response.success:
        return GateResult(gate_id="GATE_3_G36", status="FAIL", message=f"Engine error: {response.error}")

    return GateResult(
        gate_id="GATE_3_G36",
        status="MANDATES_READY",
        message="Team mandates generated. Paste into Cursor sessions.",
        engine_response=response.content,
    )
