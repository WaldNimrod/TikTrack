---
project_domain: AGENTS_OS
id: TEAM_191_TO_TEAM_61_S002_P005_WP002_FAST2_IMPLEMENTATION_MANDATE_v1.0.0
from: Team 191 (Git Governance Operations)
to: Team 61 (AOS Local Cursor Implementation)
cc: Team 190, Team 10, Team 00, Team 51, Team 170, Team 100
date: 2026-03-15
status: ACTIVE
scope: FAST_2 implementation mandate for Team 191 Git-governance optimization lanes
in_response_to: TEAM_190_TO_TEAM_191_S002_P005_WP002_INTERNAL_LOD400_REVALIDATION_RESULT_v1.0.0
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP002 |
| task_id | TEAM191_GITHUB_WORKFLOW_OPTIMIZATION |
| gate_id | FAST_2 |
| phase_owner | Team 61 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Mission

Implement the approved Team 191 operational lanes in code, as defined by Team 191 LOD400 and internal procedure, before FAST_2.5 QA is executed.

## 2) Required Inputs

1. `_COMMUNICATION/team_191/TEAM_191_INTERNAL_S002_P005_WP002_GITHUB_OPERATIONS_LOD400_v1.0.1.md`
2. `_COMMUNICATION/team_191/TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.0.md`
3. `_COMMUNICATION/team_191/TEAM_191_TO_TEAM_190_S002_P005_WP002_INTERNAL_LOD400_REVALIDATION_REQUEST_ERRATA_v1.0.0.md`

## 3) Implementation Scope (FAST_2)

1. Implement Team 191 operational command lanes in orchestrator/code path:
   - `191 doctor` / `191 דוקטור`
   - `191 ci` / `191 סי-איי`
   - `191 comments` / `191 תגובות`
2. Enforce bilingual alias behavior and optional payload syntax:
   - pattern: `<command> ? <text>`
3. Ensure deterministic result block generation:
   - `overall_result`
   - `checks_run`
   - `files_changed`
   - `remaining_blockers`
   - `owner_next_action`
4. Add/extend automated tests for:
   - command recognition (EN + HE aliases)
   - payload parsing
   - deterministic output contract
5. Keep implementation strictly non-semantic and inside approved allowlist.

## 4) File Boundary (Binding)

Allowed:
1. `agents_os_v2/orchestrator/pipeline.py` (Team 191 routing only)
2. `agents_os_v2/tests/test_pipeline.py` (or dedicated tests for Team 191 routing)
3. Team 191 communication/evidence files

Disallowed:
1. `api/` and `ui/` business logic changes
2. Direct semantic edits to canonical governance ownership docs

## 5) Required Return Contract from Team 61

1. `overall_result` (`PASS` / `BLOCK_FOR_FIX`)
2. `files_changed`
3. `tests_run`
4. `remaining_blockers`
5. `owner_next_action`
6. `evidence-by-path`

Expected completion artifact path:
`_COMMUNICATION/team_61/TEAM_61_TO_TEAM_191_S002_P005_WP002_FAST2_IMPLEMENTATION_COMPLETION_v1.0.0.md`

## 6) Flow Lock

Team 191 must not trigger Team 51 QA for this WP until Team 61 FAST_2 completion artifact is returned.

---

**log_entry | TEAM_191 | S002_P005_WP002_FAST2_IMPLEMENTATION_MANDATE | ISSUED_TO_TEAM_61 | 2026-03-15**
