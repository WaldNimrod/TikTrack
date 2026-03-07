"""
LLM Quality Judge — Q-01 to Q-05.
HOLD (exit 2) on any negative; mock in tests.
"""

from typing import Callable, Optional, Tuple

from agents_os.validators.base.validator_base import ExitCode


SPEC_PROMPTS = [
    ("Q-01", "Assess spec coherence and completeness."),
    ("Q-02", "Assess architectural alignment."),
    ("Q-03", "Assess traceability to LOD200."),
    ("Q-04", "Assess risk coverage."),
    ("Q-05", "Assess governance compliance."),
]

EXECUTION_PROMPTS = [
    ("Q-01", "Overall execution quality: is the implementation logically sound and complete?"),
    ("Q-02", "Architectural compliance: does the code follow the approved two-phase routing architecture?"),
    ("Q-03", "Test quality: are the tests meaningful (not trivially passing), covering real edge cases?"),
    ("Q-04", "Completion report quality: are Team 20/70 completion reports substantive and evidence-backed?"),
    ("Q-05", "Risk assessment: does the implementation introduce any risks to the Agents_OS domain or gate governance?"),
]


def quality_judge(
    content: str,
    context: Optional[dict] = None,
    llm_call: Optional[Callable[[str, str], Tuple[bool, str]]] = None,
    mode: str = "spec",
) -> Tuple[ExitCode, str]:
    """
    Q-01–Q-05: Quality judgment.
    mode: "spec" (WP001) | "execution" (WP002 GATE_5).
    llm_call(system_prompt, user_content) -> (passed, reason).
    If llm_call is None, use mock (always PASS).
    HOLD on negative.
    """
    if llm_call is None:
        return ExitCode.PASS, "mock:PASS"

    prompts = EXECUTION_PROMPTS if mode == "execution" else SPEC_PROMPTS
    for qid, prompt in prompts:
        passed, reason = llm_call(prompt, content[:2000])
        if not passed:
            return ExitCode.HOLD, f"{qid}:{reason}"

    return ExitCode.PASS, "all_checks_passed"
