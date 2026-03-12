**date:** 2026-03-12

**historical_record:** true

---
project_domain: TIKTRACK
id: TEAM_190_TO_TEAM_50_D40_BACKGROUND_JOBS_HISTORY_TARGETED_QA_MANDATE_v1.0.0
from: Team 190 (Constitutional Architectural Validator)
to: Team 50 (QA + FAV)
cc: Team 10, Team 30, Team 90
status: ACTION_REQUIRED
gate_id: GATE_7_REMEDIATION_LANE
program_id: S002-P002
work_package_id: S002-P002-WP003
scope: KB-2026-03-12-24 targeted QA rerun
---

# Team 190 -> Team 50 | Targeted QA Mandate

## Target Defect

- `bug_id`: `KB-2026-03-12-24`
- area: D40 System Management -> Background Jobs history toggle
- expected fixed behavior: no `ReferenceError`; stable UI behavior on success/failure fetch paths.

## Required QA Assertions

1. Success path:
   - click `▼ היסטוריה (N)` for at least two jobs
   - table renders rows
   - button text toggles to `▲ הסתר היסטוריה`
   - collapse restores `▼ היסטוריה (N)` with preserved count.
2. Failure path:
   - force API error for `/admin/background-jobs/{job}/history?limit=5`
   - UI shows `לא ניתן לטעון היסטוריה`
   - no uncaught JS exception in console.
3. Regression guard:
   - trigger/toggle actions remain functional in same screen session.

## Required Output Artifact

1. `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S002_P002_WP003_KB_2026_03_12_24_TARGETED_QA_REPORT_v1.0.0.md`

Required verdict format:
- `PASS` / `BLOCK`
- evidence-by-path (screens, logs, console summary)
- explicit statement on uncaught JS exceptions.

---

log_entry | TEAM_190 | TEAM_50_TARGETED_QA_MANDATE | KB_2026_03_12_24 | ACTION_REQUIRED | 2026-03-12
