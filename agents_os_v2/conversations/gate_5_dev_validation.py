from __future__ import annotations
"""
GATE_5 — DEV_VALIDATION
Owner: Team 90
Action: Validate implementation against spec (code quality + spec compliance).
"""

from ..engines.base import BaseEngine
from ..context.injection import build_full_agent_prompt, build_canonical_message
from ..validators.code_quality import run_all_quality_checks
from ..validators.spec_compliance import validate_spec_compliance
from .base import GateResult


async def run_gate_5(
    engine_90: BaseEngine,
    lld400_content: str,
    required_files: list[str],
    required_endpoints: list[str] | None = None,
    wp_id: str = "N/A",
    stage_id: str = "S002",
) -> GateResult:
    # Phase 1: Deterministic checks
    quality_results = run_all_quality_checks()
    quality_failed = [r for r in quality_results if not r.passed]

    spec_findings = validate_spec_compliance(required_files, required_endpoints)
    spec_blocks = [f for f in spec_findings if f.status == "BLOCK"]

    if quality_failed or spec_blocks:
        findings = []
        for r in quality_failed:
            findings.append({"check": r.check, "status": "FAIL", "output": r.output[:200]})
        for f in spec_blocks:
            findings.append({"check": f.check_id, "status": "BLOCK", "message": f.message})
        return GateResult(
            gate_id="GATE_5",
            status="FAIL",
            findings=findings,
            message=f"Deterministic validation failed: {len(quality_failed)} quality + {len(spec_blocks)} spec",
        )

    # Phase 2: LLM validation (spec alignment)
    system_prompt = build_full_agent_prompt(
        team_id="team_90",
        gate_id="GATE_5",
        task_message="",
        work_package_id=wp_id,
    )

    files_summary = "\n".join(f"- {f}" for f in required_files)
    user_message = build_canonical_message(
        team_from="team_10",
        team_to="team_90",
        gate_id="GATE_5",
        purpose="DEV_VALIDATION — validate implementation against approved spec.",
        context_inputs=[
            "LLD400 spec (approved at GATE_2)",
            f"Implementation files:\n{files_summary}",
            "GATE_4 QA: PASS",
        ],
        required_actions=[
            "Verify all spec requirements are implemented",
            "Check architecture alignment",
            "Validate naming conventions and code standards",
            "Produce VALIDATION_RESPONSE with PASS or BLOCKING_REPORT",
        ],
        deliverables=["VALIDATION_RESPONSE.md"],
        validation_criteria=[
            "All LLD400 requirements implemented",
            "Code follows project conventions",
            "No architectural violations",
        ],
        work_package_id=wp_id,
        stage_id=stage_id,
        subject="GATE_5_DEV_VALIDATION_REQUEST",
    )
    user_message += f"\n\n---\n\n## LLD400 Spec\n\n{lld400_content[:4000]}"

    response = await engine_90.call_with_retry(system_prompt, user_message, max_retries=3)

    if not response.success:
        return GateResult(gate_id="GATE_5", status="FAIL", message=f"Engine error: {response.error}")

    status = "PASS" if "PASS" in response.content.upper() and "BLOCK" not in response.content.upper() else "FAIL"

    return GateResult(
        gate_id="GATE_5",
        status=status,
        message=response.content[:500],
        engine_response=response.content,
        next_gate="GATE_6" if status == "PASS" else None,
    )
