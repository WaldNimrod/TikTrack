"""
Canonical response artifact generator — LLD400 §2.5.
Produces structured validation output for gate flow.
"""

from typing import Dict, List, Optional

from agents_os.validators.base.validator_base import ExitCode, ValidatorResult


def generate_response(
    exit_code: ExitCode,
    results: List[ValidatorResult],
    artifact_path: str = "",
    summary: str = "",
) -> Dict:
    """
    Generate canonical validation response.
    """
    failed = [r for r in results if not r.passed]
    return {
        "exit_code": int(exit_code),
        "verdict": exit_code.name,
        "summary": summary or (f"{len(failed)} checks failed" if failed else "All checks passed"),
        "total_checks": len(results),
        "passed": len(results) - len(failed),
        "failed": len(failed),
        "results": [
            {
                "check_id": r.check_id,
                "passed": r.passed,
                "message": r.message,
                "detail": r.detail,
            }
            for r in results
        ],
        "artifact_path": artifact_path,
    }
