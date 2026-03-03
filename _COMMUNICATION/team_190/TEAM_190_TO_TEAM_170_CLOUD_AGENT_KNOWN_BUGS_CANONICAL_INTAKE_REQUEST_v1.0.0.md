---
project_domain: SHARED (TIKTRACK + AGENTS_OS)
id: TEAM_190_TO_TEAM_170_CLOUD_AGENT_KNOWN_BUGS_CANONICAL_INTAKE_REQUEST
from: Team 190 (Constitutional Validation)
to: Team 170 (Documentation & Governance)
cc: Team 10, Team 00, Team 100
date: 2026-03-03
status: ACTION_REQUIRED
gate_id: GOVERNANCE_PROGRAM
program_id: N/A
scope: CLOUD_AGENT_KNOWN_BUGS_CANONICALIZATION
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | SHARED |
| program_id | N/A |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 170 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Purpose

Team 190 requires Team 170 to convert the remaining Cloud Agent scan findings into canonical known-bug records under the governed intake model.

## 2) Scope

Do not reopen the two already closed records:

1. `KB-2026-03-03-01`
2. `KB-2026-03-03-02`

Canonical intake is required for the remaining scan set:

- `KB-001` through `KB-021`, excluding the two already closed Phoenix-specific entries above.

## 3) Required Action

For each remaining finding, Team 170 must ensure the canonical register contains:

1. stable bug identifier,
2. short defect title,
3. owning team,
4. severity,
5. remediation mode (`IMMEDIATE` / `BATCHED`),
6. target cycle,
7. evidence source,
8. current status.

## 4) Special Tracking Requirement

The Pydantic deprecation warnings observed during Team 190 unit-test validation are not blockers for the validated test files, but they must remain visible as tracked remediation scope and must not be silently discarded.

Team 170 must either:

1. map them to an existing Cloud Agent KB item if already covered, or
2. create a distinct known-bug entry if not yet covered.

## 5) Acceptance Rule

This request is complete only when:

1. all remaining Cloud Agent findings are represented in the canonical known-bugs process,
2. ownership and severity are explicit,
3. the Pydantic warning lineage is accounted for.

## 6) Recommended Response Path

`_COMMUNICATION/team_170/TEAM_170_TO_TEAM_190_CLOUD_AGENT_KNOWN_BUGS_CANONICAL_INTAKE_RESPONSE_v1.0.0.md`

---

log_entry | TEAM_190 | CLOUD_AGENT_KNOWN_BUGS_CANONICAL_INTAKE_REQUEST | TEAM_170_ACTION_REQUIRED | 2026-03-03
