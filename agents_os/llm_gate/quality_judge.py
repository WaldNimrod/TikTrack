"""
LLM Quality Judge — Q-01 to Q-05.
HOLD (exit 2) on any negative; mock in tests.
"""

from typing import Callable, Optional, Tuple

from agents_os.validators.base.validator_base import ExitCode


def quality_judge(
    content: str,
    context: Optional[dict] = None,
    llm_call: Optional[Callable[[str, str], Tuple[bool, str]]] = None,
) -> Tuple[ExitCode, str]:
    """
    Q-01–Q-05: Quality judgment.
    llm_call(system_prompt, user_content) -> (passed, reason).
    If llm_call is None, use mock (always PASS).
    HOLD on negative.
    """
    if llm_call is None:
        return ExitCode.PASS, "mock:PASS"

    prompts = [
        ("Q-01", "Assess spec coherence and completeness."),
        ("Q-02", "Assess architectural alignment."),
        ("Q-03", "Assess traceability to LOD200."),
        ("Q-04", "Assess risk coverage."),
        ("Q-05", "Assess governance compliance."),
    ]

    for qid, prompt in prompts:
        passed, reason = llm_call(prompt, content[:2000])
        if not passed:
            return ExitCode.HOLD, f"{qid}:{reason}"

    return ExitCode.PASS, "all_checks_passed"
