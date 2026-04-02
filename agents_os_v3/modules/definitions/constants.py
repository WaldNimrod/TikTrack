"""Canonical strings aligned to DDL CHECK constraints and State Machine v1.0.2."""

TEAM_PRINCIPAL = "team_00"

RUN_STATUSES = frozenset(
    {"NOT_STARTED", "IN_PROGRESS", "CORRECTION", "PAUSED", "COMPLETE", "FAILED"}
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

# Bootstrap routing (definition.yaml seed — ORCHESTRATOR → gateway per domain)
ORCHESTRATOR_ROLE_ID = "01JK8AOSV3ROLE0000000001"
ORCHESTRATOR_TEAM_ID = "team_10"  # TikTrack gateway
AOS_GATEWAY_TEAM_ID = "team_11"  # agents_os gateway (mirror of team_10)

# GATE_0 constitutional validator — team_190, domain-agnostic (both domains)
CONSTITUTIONAL_VALIDATOR_ROLE_ID = "01JK8AOSV3ROLE0000000002"
CONSTITUTIONAL_VALIDATOR_TEAM_ID = "team_190"

# GATE_1 phase 1.1 — Spec Author → team_170 (domain-agnostic)
SPEC_AUTHOR_ROLE_ID = "01JK8AOSV3ROLE0000000003"
SPEC_AUTHOR_TEAM_ID = "team_170"

# GATE_2 — Architecture Approver: the architect who authored the LOD200/LOD400 spec.
# Naming convention (Iron Rule): suffix-0 teams = TikTrack domain; suffix-1 teams = AOS domain.
#   team_110 = TikTrack Domain Architect (suffix 0 → TikTrack)
#   team_111 = AOS Domain Architect      (suffix 1 → AOS)
# Fallback hierarchy (system-only): domain architect → team_100 (neutral Chief Architect)
# team_00 is NEVER a system default — team_00 acts only when Nimrod explicitly overrides.
ARCH_APPROVER_ROLE_ID = "01JK8AOSV3ROLE0000000004"
ARCH_APPROVER_TEAM_ID_TT = "team_110"   # TikTrack Domain Architect (suffix-0 = TikTrack)
ARCH_APPROVER_TEAM_ID_AOS = "team_111"  # AOS Domain Architect      (suffix-1 = AOS)
ARCH_APPROVER_TEAM_ID_FALLBACK = "team_100"  # Neutral fallback when domain architect inactive (NOT team_00)

# Domain ULIDs (seed — must match definition.yaml domains.id)
DOMAIN_ULID_AGENTS_OS = "01JK8AOSV3DOMAIN00000001"
DOMAIN_ULID_TIKTRACK = "01JK8AOSV3DOMAIN00000002"

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
