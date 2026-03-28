"""Event types persisted to `events` (Event Observability Spec v1.0.3 §1)."""

from __future__ import annotations

# 14 standard + 1 error (ROUTING_FAILED) — SSOT §1.1–1.2
VALID_EVENT_TYPES: frozenset[str] = frozenset(
    {
        "RUN_INITIATED",
        "PHASE_PASSED",
        "RUN_COMPLETED",
        "GATE_FAILED_BLOCKING",
        "GATE_FAILED_ADVISORY",
        "GATE_APPROVED",
        "RUN_PAUSED",
        "RUN_RESUMED",
        "RUN_RESUMED_WITH_NEW_ASSIGNMENT",
        "CORRECTION_RESUBMITTED",
        "CORRECTION_ESCALATED",
        "CORRECTION_RESOLVED",
        "PRINCIPAL_OVERRIDE",
        "TEAM_ASSIGNMENT_CHANGED",
        "ROUTING_FAILED",
    }
)
