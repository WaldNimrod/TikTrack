"""
GATE_4 — QA
Owner: Team 10 (coordination), Team 50 (execution)
Requirement: 0 SEVERE for PASS.
"""

from ..engines.base import BaseEngine
from ..context.injection import build_full_agent_prompt
from ..validators.code_quality import run_all_quality_checks
from .base import GateResult


async def run_gate_4(engine_50: BaseEngine | None = None) -> GateResult:
    """Run automated QA checks + optional LLM QA review."""
    results = run_all_quality_checks()

    failed = [r for r in results if not r.passed]
    all_passed = len(failed) == 0

    findings = []
    for r in results:
        findings.append({
            "check": r.check,
            "status": "PASS" if r.passed else "FAIL",
            "output": r.output[:300],
        })

    if not all_passed:
        return GateResult(
            gate_id="GATE_4",
            status="FAIL",
            findings=findings,
            message=f"QA failed: {len(failed)} checks did not pass: {', '.join(r.check for r in failed)}",
        )

    return GateResult(
        gate_id="GATE_4",
        status="PASS",
        findings=findings,
        message=f"QA passed: all {len(results)} checks green",
        next_gate="GATE_5",
    )
