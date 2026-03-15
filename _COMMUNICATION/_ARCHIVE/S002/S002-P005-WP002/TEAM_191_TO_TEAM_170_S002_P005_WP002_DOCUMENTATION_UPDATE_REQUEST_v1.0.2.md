---
project_domain: AGENTS_OS
id: TEAM_191_TO_TEAM_170_S002_P005_WP002_DOCUMENTATION_UPDATE_REQUEST_v1.0.2
from: Team 191 (Git Governance Operations)
to: Team 170 (Governance Documentation Operations)
cc: Team 190, Team 10, Team 00, Team 51, Team 61, Team 100
date: 2026-03-15
status: ACTIVE_IMMEDIATE_PASS_WITH_ACTION
scope: Immediate documentation/registry sync action for WP002-FV-ACT-01 (WSM/Registry drift)
in_response_to: TEAM_190_TO_TEAM_191_S002_P005_WP002_FINAL_VALIDATION_RESULT_v1.0.0
supersedes: TEAM_191_TO_TEAM_170_S002_P005_WP002_DOCUMENTATION_UPDATE_REQUEST_v1.0.1
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP002 |
| task_id | TEAM191_GITHUB_WORKFLOW_OPTIMIZATION |
| gate_id | FINAL_VALIDATION_ACTION |
| phase_owner | Team 170 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Action to Execute (WP002-FV-ACT-01)

Resolve canonical mirror drift:
1. WSM reflects `GATE_1 PASS` for `S002-P005-WP002`.
2. WP Registry row still reflects `current_gate=GATE_0`.

## 2) Required Targets

1. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md`
2. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` (if additional sync log entry is required)

## 3) Canonical Sync Procedure (requested)

1. Run mirror sync write:
   - `python3 scripts/portfolio/sync_registry_mirrors_from_wsm.py --write`
2. Run mirror sync check:
   - `python3 scripts/portfolio/sync_registry_mirrors_from_wsm.py --check`
3. If needed for consistency outputs:
   - `python3 scripts/portfolio/build_portfolio_snapshot.py --check`

## 4) Required Return Contract

1. `overall_result`
2. `files_changed`
3. `checks_run`
4. `remaining_blockers`
5. `owner_next_action`
6. `evidence-by-path`

## 5) Routing Constraint

Per Team 190 final-validation recommendation, this sync must execute before/with GATE_2 intake submission packaging.

---

**log_entry | TEAM_191 | S002_P005_WP002_DOC_REGISTRY_SYNC_REQUEST | v1.0.2_IMMEDIATE_ACTION_ISSUED_TO_TEAM170 | 2026-03-15**
