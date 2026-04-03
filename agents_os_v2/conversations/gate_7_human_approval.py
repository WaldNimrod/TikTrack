"""
⚠️ LEGACY — DO NOT USE IN NEW WORK
GATE_7 is not an active pipeline gate. The pipeline has GATE_0 through GATE_5 only.
Preserved for historical reference only (2026-03-24).
Human UX review by Nimrod is an organizational action outside the pipeline.

[ORIGINAL HEADER BELOW — LEGACY]
GATE_7 — HUMAN_UX_APPROVAL
Owner: Team 90 (execution), Team 00/Nimrod (decision)
This is the ONLY human checkpoint. Pipeline pauses here.
"""

from pathlib import Path
from .base import GateResult
from ..config import AGENTS_OS_OUTPUT_DIR


async def run_gate_7(wp_id: str = "N/A", summary: str = "") -> GateResult:
    """Pause pipeline and notify human for UX review."""
    review_file = AGENTS_OS_OUTPUT_DIR / "gate_7_review_request.md"
    review_file.parent.mkdir(parents=True, exist_ok=True)
    review_file.write_text(
        f"# GATE_7 — Human UX Approval Required\n\n"
        f"**Work Package:** {wp_id}\n"
        f"**Status:** WAITING_FOR_HUMAN\n\n"
        f"## What to review\n\n"
        f"{summary}\n\n"
        f"## How to approve\n\n"
        f"Run: `python3 -m agents_os_v2.orchestrator.pipeline --approve gate7`\n\n"
        f"## How to reject\n\n"
        f"Run: `python3 -m agents_os_v2.orchestrator.pipeline --reject gate7 --reason \"your reason\"`\n",
        encoding="utf-8",
    )

    return GateResult(
        gate_id="GATE_7",
        status="MANUAL",
        message=f"GATE_7: Waiting for human UX approval. Review request at {review_file}",
        artifacts_produced=[str(review_file)],
    )
