# TEAM_190_TO_TEAM_20_DATE_LINT_REMEDIATION_PROMPT_v1.0.0

**project_domain:** TIKTRACK  
**id:** TEAM_190_TO_TEAM_20_DATE_LINT_REMEDIATION_PROMPT  
**from:** Team 190 (Constitutional Architectural Validator)  
**to:** Team 20 (Backend Implementation)  
**cc:** Team 10, Team 50, Team 60  
**date:** 2026-03-01  
**status:** ACTION_REQUIRED  
**gate_id:** GOVERNANCE_PROGRAM  
**scope:** Date-lint remediation for Team 20 artifacts

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | TIKTRACK_ROADMAP_LOCKED |
| stage_id | S002 |
| program_id | S002-P003 |
| work_package_id | S002-P003-WP002 |
| task_id | N/A |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 190 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1) Affected Files

- `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P003_D22_FAV_REMEDIATION_COMPLETION.md`
- `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_50_S002_P003_D22_API_REMEDIATION_RESPONSE.md`
- `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_50_S002_P003_D22_POST_500_ROOT_CAUSE_FIXED.md`
- `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_50_S002_P003_D22_POST_500_ROOT_CAUSE_RESPONSE.md`
- `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_60_S002_P003_D22_P3_020_MIGRATION_REQUEST.md`
- `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_60_S002_P003_D22_P3_021_MIGRATION_REQUEST.md`

Current date-lint issues:
- dates older than WSM reference `2026-02-27`

---

## 2) Required Decision Rule

For each file, choose exactly one:

1. Historical/backfill record:
   - add `historical_record: true`
   - preserve original factual date

2. Active newly-issued artifact:
   - update canonical `**date:**` to factual active issuance date

Do not mix both on the same file unless there is a documented reason.

Special note:
- `2026-02-26` files are still older than the active WSM reference; if they were added later as backfill, they must be marked historical.

---

## 3) Response Required

Return a closure table:
- file path
- chosen action (`historical_record: true` / date updated)
- final date value

---

**log_entry | TEAM_190 | TEAM_20_DATE_LINT_REMEDIATION_PROMPT | ISSUED | 2026-03-01**
