"""
⚠️ LEGACY — DO NOT USE IN NEW WORK
GATE_8 is not an active pipeline gate. The pipeline has GATE_0 through GATE_5 only.
Preserved for historical reference only (2026-03-24).

[ORIGINAL HEADER BELOW — LEGACY]
GATE_8 — DOCUMENTATION_CLOSURE
Owner: Team 90 (execution), Team 70 (documentation)
Action: AS_MADE_REPORT, clean folders, validate closure.
"""

from ..engines.base import BaseEngine
from ..context.injection import build_full_agent_prompt
from .base import GateResult


async def run_gate_8(engine_90: BaseEngine, engine_70: BaseEngine, wp_id: str = "N/A", stage_id: str = "S002") -> GateResult:
    # Team 70 produces AS_MADE_REPORT
    system_prompt_70 = build_full_agent_prompt(
        team_id="team_70",
        gate_id="GATE_8",
        task_message="",
        work_package_id=wp_id,
    )

    response_70 = await engine_70.call_with_retry(
        system_prompt_70,
        f"Produce AS_MADE_REPORT for work package {wp_id}. "
        f"Document what was built, list all files created/modified, "
        f"and confirm documentation indexes are updated.",
        max_retries=3,
    )

    # Team 90 validates closure
    system_prompt_90 = build_full_agent_prompt(
        team_id="team_90",
        gate_id="GATE_8",
        task_message="",
        work_package_id=wp_id,
    )

    response_90 = await engine_90.call_with_retry(
        system_prompt_90,
        f"Validate documentation closure for work package {wp_id}.\n\n"
        f"AS_MADE_REPORT:\n{response_70.content[:3000] if response_70.success else 'ERROR: Team 70 failed'}\n\n"
        f"Verify: all files present, indexes updated, communication cleaned.",
        max_retries=3,
    )

    if not response_90.success:
        return GateResult(gate_id="GATE_8", status="FAIL", message=f"Engine error: {response_90.error}")

    status = "PASS" if "PASS" in response_90.content.upper() or "COMPLETE" in response_90.content.upper() else "FAIL"

    return GateResult(
        gate_id="GATE_8",
        status=status,
        message="LIFECYCLE COMPLETE" if status == "PASS" else response_90.content[:500],
        engine_response=response_90.content,
    )
