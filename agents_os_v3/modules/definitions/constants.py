"""Canonical strings aligned to DDL CHECK constraints and State Machine v1.0.2."""

TEAM_PRINCIPAL = "team_00"

RUN_STATUSES = frozenset(
    {"NOT_STARTED", "IN_PROGRESS", "CORRECTION", "PAUSED", "COMPLETE"}
)

ACTOR_TYPE_SYSTEM = "system"
ACTOR_TYPE_AGENT = "agent"
ACTOR_TYPE_HUMAN = "human"

VERDICT_PASS = "pass"
VERDICT_FAIL = "fail"
VERDICT_APPROVE = "approve"
VERDICT_RESUBMIT = "resubmit"

FORCE_PASS = "FORCE_PASS"
FORCE_FAIL = "FORCE_FAIL"
FORCE_PAUSE = "FORCE_PAUSE"
FORCE_RESUME = "FORCE_RESUME"
FORCE_CORRECTION = "FORCE_CORRECTION"

PRINCIPAL_OVERRIDE_ACTIONS = frozenset(
    {FORCE_PASS, FORCE_FAIL, FORCE_PAUSE, FORCE_RESUME, FORCE_CORRECTION}
)

# Bootstrap routing (definition.yaml seed — ORCHESTRATOR → Team 10)
ORCHESTRATOR_ROLE_ID = "01JK8AOSV3ROLE0000000001"
ORCHESTRATOR_TEAM_ID = "team_10"

# Tier-2 delegation role for idea status (Authority Model v1.0.0 §4)
IDEA_STATUS_AUTHORITY_ROLE_ID = "IDEA_STATUS_AUTHORITY"

# execute_transition transition_type strings (Module Map §3.5)
TRANS_INITIATE = "INITIATE"
TRANS_ADVANCE = "ADVANCE"
TRANS_FAIL = "FAIL"
TRANS_APPROVE_GATE = "APPROVE_GATE"
TRANS_PAUSE = "PAUSE"
TRANS_RESUME = "RESUME"

PAUSE_SNAPSHOT_SCHEMA: dict = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "required": ["captured_at", "gate_id", "phase_id", "assignments"],
    "properties": {
        "captured_at": {"type": "string", "format": "date-time"},
        "gate_id": {"type": "string"},
        "phase_id": {"type": "string"},
        "assignments": {
            "type": "object",
            "additionalProperties": {
                "type": "object",
                "required": ["assignment_id", "team_id"],
                "properties": {
                    "assignment_id": {"type": "string"},
                    "team_id": {"type": "string"},
                },
            },
        },
    },
    "additionalProperties": False,
}
