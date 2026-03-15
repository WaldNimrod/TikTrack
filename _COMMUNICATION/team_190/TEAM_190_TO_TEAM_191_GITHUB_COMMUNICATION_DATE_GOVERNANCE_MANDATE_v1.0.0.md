---
project_domain: SHARED (TIKTRACK + AGENTS_OS)
id: TEAM_190_TO_TEAM_191_GITHUB_COMMUNICATION_DATE_GOVERNANCE_MANDATE_v1.0.0
from: Team 190 (Constitutional Validator)
to: Team 191 (Git Governance Operations)
cc: Team 10, Team 100, Team 00
date: 2026-03-15
status: ACTION_REQUIRED
scope: Immediate internal lane for all GitHub communication + push guard date governance
priority: P0-IMMEDIATE
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | N/A |
| task_id | GITHUB_COMMUNICATION_DATE_GOVERNANCE |
| gate_id | OPERATIONS_LANE |
| phase_owner | Team 191 |

## 1) Mandate Trigger

Recurring `DATE-LINT` push blocks and date-header drift are operational blockers in GitHub delivery flow.
This lane is **Team 191 authority** per role mapping for git governance operations.

## 2) Team 191 Required Actions (Immediate)

1. Own all GitHub-facing communication artifacts related to push-guard/date-lint remediation.
2. Enforce date normalization in outgoing governance/communication markdown touched for push.
3. Apply `historical_record: true` only where intentional historical back-date is required.
4. Ensure every fixed file includes canonical date header format (`date: YYYY-MM-DD` or `**date:** YYYY-MM-DD`).
5. Run full push guard sequence and document results:
   - `DATE-LINT`
   - `SYNC CHECK`
   - `SNAPSHOT CHECK`
6. Return completion package to Team 190 for validation.

## 3) Hard Constraints

1. Team 191 does not issue constitutional PASS/BLOCK verdicts.
2. No semantic policy rewrite without Team 190/Team 00 ruling.
3. Scope is git/repo governance operations only.

## 4) Return Contract (Required)

Return file path:
`_COMMUNICATION/team_191/TEAM_191_TO_TEAM_190_GITHUB_COMMUNICATION_DATE_GOVERNANCE_COMPLETION_v1.0.0.md`

Required fields:
1. `overall_result`
2. `files_normalized`
3. `guard_results` (`DATE-LINT`, `SYNC CHECK`, `SNAPSHOT CHECK`)
4. `remaining_blockers`
5. `evidence_by_path`
6. `owner_next_action`

## 5) Validation Routing

- Team 191 submits completion package.
- Team 190 performs validation and returns `PASS` or `BLOCK_FOR_FIX`.

log_entry | TEAM_190 | GITHUB_COMMUNICATION_DATE_GOVERNANCE_MANDATE | ISSUED_TO_TEAM_191 | 2026-03-15
