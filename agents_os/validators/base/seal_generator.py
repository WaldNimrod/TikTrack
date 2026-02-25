"""
SOP-013 seal protocol — LLD400 §2.5.
Generates PHOENIX TASK SEAL per ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.
"""

from typing import List, Optional


def generate_seal(
    task_id: str,
    status: str = "COMPLETED",
    files_modified: Optional[List[str]] = None,
    pre_flight: str = "PASS",
    handover_prompt: str = "",
) -> str:
    """
    Generate SOP-013 Seal Message.
    Format per ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.
    """
    files = files_modified or []
    lines = [
        "--- PHOENIX TASK SEAL ---",
        f"TASK_ID: {task_id}",
        f"STATUS: {status}",
        "FILES_MODIFIED:",
    ]
    for f in files:
        lines.append(f"  - {f}")
    lines.append(f"PRE_FLIGHT: {pre_flight}")
    lines.append(f'HANDOVER_PROMPT: "{handover_prompt}"')
    lines.append("--- END SEAL ---")
    return "\n".join(lines)
