"""
⚠️ LEGACY — DO NOT USE IN NEW WORK
GATE_6 is not an active pipeline gate. The pipeline has GATE_0 through GATE_5 only.
This file is preserved for historical reference only (2026-03-24).
Post-execution organizational review, when required, is triggered manually by Team 00.
"""

from ..engines.base import BaseEngine
from ..context.injection import build_full_agent_prompt, build_canonical_message
from .base import GateResult
from .response_parser import parse_gate_decision


async def run_gate_6(engine_100: BaseEngine, lld400_content: str, implementation_summary: str, wp_id: str = "N/A", stage_id: str = "S002") -> GateResult:
    system_prompt = build_full_agent_prompt(
        team_id="team_100",
        gate_id="GATE_6",
        task_message="",
        work_package_id=wp_id,
    )

    user_message = build_canonical_message(
        team_from="team_90",
        team_to="team_100",
        gate_id="GATE_6",
        purpose="Verify that implementation matches the approved spec. Question: Does what was built match what we approved at GATE_2?",
        context_inputs=[
            "LLD400 spec (approved at GATE_2)",
            "Implementation summary (GATE_5 PASS)",
        ],
        required_actions=[
            "Compare implementation against spec requirements",
            "Verify architectural alignment",
            "Decide: APPROVED or REJECTED (with rejection route if applicable)",
        ],
        deliverables=["GATE_6 decision: APPROVED / REJECTED"],
        validation_criteria=[
            "Implementation matches spec intent",
            "No architectural deviations",
            "All required deliverables present",
        ],
        work_package_id=wp_id,
        stage_id=stage_id,
        subject="GATE_6_REALITY_VALIDATION",
    )
    user_message += f"\n\n---\n\n## Approved Spec (LLD400)\n\n{lld400_content[:3000]}\n\n## Implementation Summary\n\n{implementation_summary[:3000]}"

    response = await engine_100.call_with_retry(system_prompt, user_message, max_retries=3)

    if not response.success:
        return GateResult(gate_id="GATE_6", status="FAIL", message=f"Engine error: {response.error}")

    status, reason = parse_gate_decision(response.content)

    import re as _re
    if not _re.search(r"##\s*Gate\s*Decision", response.content, _re.IGNORECASE):
        pass  # parse_gate_decision already handles fallback; no crash needed

    return GateResult(
        gate_id="GATE_6",
        status=status,
        message=response.content[:500],
        engine_response=response.content,
        next_gate="GATE_7" if status == "PASS" else None,
    )
