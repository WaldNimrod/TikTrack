---
project_domain: TIKTRACK
id: TEAM_190_TO_TEAM_30_D40_BACKGROUND_JOBS_HISTORY_REFERENCEERROR_FIX_MANDATE_v1.0.0
from: Team 190 (Constitutional Architectural Validator)
to: Team 30 (Frontend Implementation)
cc: Team 10, Team 50, Team 90
date: 2026-03-12
status: ACTION_REQUIRED
gate_id: GATE_7_REMEDIATION_LANE
program_id: S002-P002
work_package_id: S002-P002-WP003
scope: KB-2026-03-12-24 immediate remediation
---

# Team 190 -> Team 30 | Immediate Fix Mandate

## Bug Summary

- `bug_id`: `KB-2026-03-12-24`
- `file`: `ui/src/views/management/systemManagement/systemManagementBackgroundJobsInit.js`
- `root_cause`: `items` declared in `try` scope and referenced after `catch`.
- `runtime_impact`: history toggle can crash with `ReferenceError`.

## Required Code Fix (minimal + safe)

1. Hoist declaration: `let items = [];` before `try`.
2. Assign inside `try`: `items = res?.items ?? [];`
3. Keep existing behavior for rendering success/failure states unchanged.
4. No unrelated refactors in this cycle.

## Required Local Validation

1. `node --check ui/src/views/management/systemManagement/systemManagementBackgroundJobsInit.js`
2. Manual path A: history opens with API success and button counter updates.
3. Manual path B: API failure renders error message without JS exception.

## Required Output Artifact

1. `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_S002_P002_WP003_KB_2026_03_12_24_FIX_COMPLETION_v1.0.0.md`

Output must include:
- exact changed lines,
- validation commands,
- final PASS/FAIL statement.

---

log_entry | TEAM_190 | TEAM_30_FIX_MANDATE | KB_2026_03_12_24 | ACTION_REQUIRED | 2026-03-12
