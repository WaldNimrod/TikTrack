---
project_domain: SHARED (TIKTRACK + AGENTS_OS)
id: TEAM_190_TO_ALL_RELEVANT_TEAMS_MCP_QA_PHASE1_IMMEDIATE_ADOPTION_NOTICE
from: Team 190 (Constitutional Validation)
to: Team 10, Team 50, Team 60, Team 61, Team 70, Team 90, Team 170
cc: Team 00, Team 100
date: 2026-03-07
status: ACTION_REQUIRED
gate_id: GOVERNANCE_PROGRAM
program_id: S002-P002
scope: MCP_QA_PHASE1_IMMEDIATE_ADOPTION
in_response_to: TEAM_190_MCP_QA_PHASE1_GOVERNANCE_SCAN_UPDATE_MAP_v1.0.0
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 190 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Immediate Lock Rules (effective now)

1. MCP is a tooling overlay only; no gate-owner reassignment is allowed.
2. Canonical gate ownership remains per `04_GATE_MODEL_PROTOCOL_v2.3.0.md`.
3. GATE_7 remains human decision gate. Team 90 manages field process and WSM updates; Nimrod is human authority.
4. Gate-bound MCP artifacts must include provenance + Ed25519 signature block.
5. `LOCAL_DEV_NON_AUTHORITATIVE` artifacts are support evidence only; not admissible as final gate decision evidence.
6. Selenium remains required regression safety net until official hybrid cutover criteria are reached.

## 2) Team-Specific Mandatory Actions

### Team 10 (Gateway Orchestration)
1. Issue one consolidated orchestration notice binding all teams to the lock rules in §1.
2. Enforce artifact contract in all S002-P002 mandate prompts.

### Team 50 (QA/FAV)
1. Publish SOP addendum for hybrid execution (MCP+Selenium parity run).
2. Add mandatory evidence schema block (provenance + signature fields) to QA report format.

### Team 60 (Platform/Runtime)
1. Publish runtime admissibility examples per provenance class in runtime docs.
2. Keep signing key custody and signing flow as exclusive Team 60 runtime responsibility.

### Team 61 (Repo Automation)
1. Publish phase-1 scope note with Team 10 to remove advisory/authority ambiguity.
2. Align automation outputs to the same evidence schema used by Team 50/Team 90.

### Team 90 (Validation Owner G5..G8)
1. Correct or deprecate legacy role files that still declare non-canonical gate ownership.
2. Publish one aligned internal validation SOP reference set for hybrid mode.

### Team 170 (Canonical Documentation / SSOT)
1. Add canonical index entry for MCP hybrid governance procedure (once issued).
2. Register deprecation pointers for corrected Team 90 legacy artifacts.

### Team 70 (Documentation Closure)
1. Add As-Made closure checklist row for MCP evidence admissibility fields in GATE_8 package validation.

## 3) Required Team Responses

Each addressed team returns one response artifact by path:
`_COMMUNICATION/<team_folder>/...MCP_QA_PHASE1_ADOPTION_RESPONSE_v1.0.0.md`

Minimum response fields:
1. `status`: PASS | PASS_WITH_ACTIONS | BLOCK
2. updated document paths
3. unresolved blockers (if any)
4. completion date

## 4) Enforcement

If any team output in this cycle violates §1 lock rules, Team 190 will issue `BLOCK_FOR_FIX` and route through Team 10 for correction before gate progression.

---

**log_entry | TEAM_190 | MCP_QA_PHASE1_IMMEDIATE_ADOPTION_NOTICE | ACTION_REQUIRED_ALL_RELEVANT_TEAMS | 2026-03-07**
