# Governance Rules — Agents_OS V2

## Message Format (MANDATORY)
Per TEAM_190_TO_ALL_TEAMS_CANONICAL_MESSAGE_FORMAT_LOCK_v1.0.0:
- Every governance message MUST use canonical format with identity header
- Non-canonical message = operationally invalid for gate transition
- Missing identity header fields block progression

## Task Closure (SOP-013)
- Task closure ONLY via Seal Message
- Completion report alone is NOT closure
- Format: `--- PHOENIX TASK SEAL ---` with TASK_ID, STATUS, FILES_MODIFIED, PRE_FLIGHT, HANDOVER_PROMPT

## Gate Flow
- Gates bind ONLY to Work Package level (S-P-WP-T hierarchy)
- No GATE_5 before GATE_4 PASS
- WSM must be updated immediately upon gate closure by Gate Owner
- Work-plan validation is GATE_3 sub-stage G3.5 (not PRE_GATE_3)

## Validation Responses
- Must include: identity header, overall_status (PASS/FAIL), blocking_findings
- Max resubmissions: 5 (channel policy default)
- Loop termination: PASS, ESCALATE (max exceeded), STUCK (same blocker twice)

## Communication Protocol
- Domain-aware routing:
  - TIKTRACK/SHARED structural questions route through Team 10 (Gateway)
  - AGENTS_OS-only structural questions route through Team 100/170 governance lane
  - Team 10 must be synchronized when cross-domain impact exists
- Knowledge promotion routing:
  - Team 10 routes promotion requests by domain
  - Team 170 promotes AGENTS_OS + governance canonicals
  - Team 70 promotes TIKTRACK canonicals and repository documentation/archive maintenance
- Teams write to _COMMUNICATION/team_[ID]/ only

## Drift Prevention
- No assumption-based decisions
- All governance updates must pass validation
- No cross-domain leakage
- Domain split must be enforced:
  - Teams 10/20/30/40/50 => TIKTRACK + SHARED lanes
  - Team 61 => AGENTS_OS-only development lane
  - Team 60 => cross-domain platform lane
  - Teams 90/190 => cross-domain validation lanes

## GATE_4/5/6/7 and Gate Quality (canonical source)
GATE_4/5/6/7 definitions and GATE_7 semantics are superseded by: `documentation/docs-governance/04-PROCEDURES/GATES_4_5_6_7_GOVERNANCE_POLICY_v1.0.0.md` and `documentation/docs-governance/05-CONTRACTS/GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.1.0.md` per ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING_v1.0.0. Gate Model Protocol reference: 04_GATE_MODEL_PROTOCOL_v2.3.0 (canonical).
