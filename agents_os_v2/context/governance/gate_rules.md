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
- All structural questions route through Team 10 (The Gateway)
- Only Team 10 promotes knowledge to documentation/ (via Team 70)
- Teams write to _COMMUNICATION/team_[ID]/ only

## Drift Prevention
- No assumption-based decisions
- All governance updates must pass validation
- No cross-domain leakage
- Knowledge promotion executed only by Team 70, validated by Team 90
