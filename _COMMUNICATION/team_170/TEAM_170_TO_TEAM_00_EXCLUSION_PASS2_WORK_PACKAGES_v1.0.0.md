---
id: TEAM_170_TO_TEAM_00_EXCLUSION_PASS2_WORK_PACKAGES_v1.0.0
historical_record: true
from: Team 170 (Librarian — _COMMUNICATION/)
to: Team 00 (Chief Architect)
cc: Team 10 (Gateway)
date: 2026-02-19
status: DRAFT — token list requires Team 00 confirmation when WSM/backlog changes
scope: _COMMUNICATION/ — exclusion of files bearing active/planned WP program signatures---

# חרגה 2 — חבילות עבודה ותוכניות (חתימות בקבצים)

## מקורות סטטוס (לעדכון מחזורי)

- PRIMARY: documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md — CURRENT_OPERATIONAL_STATE + STAGE_PARALLEL_TRACKS (Team 100 gate-owner updates).
- SECONDARY: _COMMUNICATION/team_00/TEAM_00_CLEAN_TABLE_DECLARATION_2026-03-15_v1.0.0.md — Backlog — Registered but NOT Active.
- COMMUNICATION: _COMMUNICATION/FLIGHT_LOG_S003_P003_WP001.md; STAGE_ACTIVE_PORTFOLIO_S002.md is S002 supplementary — may be stale vs S003; WSM wins for S003.
- Reconcile conflicts: agents_os/STATE_SNAPSHOT.json may drift from WSM — exclusion list follows WSM + explicit backlog rows below.

## תוכניות / חבילות — פעילות (לפי דומיין)

| דומיין | תוכנית | חבילות | הערה |
|--------|---------|--------|------|
| AGENTS_OS | S003-P011 | S003-P011-WP002, S003-P011-WP099 | STAGE_PARALLEL_TRACKS: WP002 GATE_5 Phase 5.1 lane; WSM active_work_package_id S003-P011-WP099 |
| TIKTRACK | S003-P003 | S003-P003-WP001 | HOLD at G3_PLAN — System Settings flight; still in_progress_work_package_id in WSM |

## מתוכננות / Backlog (מנוע החרגה — לא בהכרח ריצה פעילה)

| פריט | דומיין | הערה |
|--------|--------|------|
| `S002-P005-WP003` | AGENTS_OS | Backlog candidate — TEAM_00_CLEAN_TABLE §Backlog |
| `S002-P005-WP004` | AGENTS_OS | IDEA-007 — trigger WP002 GATE_8; LOD200 before GATE_0 |
| `S001-P002` | TIKTRACK | Alerts Widget — awaiting Team 100 placement |
| `S003-P001` | AGENTS_OS | AGENTS_OS Data Model Validator — FAST_0 pending |
| `S003-P002` | AGENTS_OS | Test Template Generator — after P001 FAST_4 |
| `S003-P012-WP001` | AGENTS_OS | Evidence: _COMMUNICATION/team_101 AOS scheduler LOD200 — treat as registered WP comms until registry sync |

## אסימונים מורחבים (מקף + קו תחתון)

**ספירה:** 26 אסימונים; **קבצים תואמים:** 179

```text
S002-P005-WP003
S002-P005-WP004
S002_P005_WP003
S002_P005_WP004
S003-P003-WP001
S003-P011-WP001
S003-P011-WP002
S003-P011-WP099
S003-P012-WP001
S003_P003_WP001
S003_P011_WP001
S003_P011_WP002
S003_P011_WP099
S003_P012_WP001
S001-P002
S001_P002
S003-P001
S003-P002
S003-P003
S003-P011
S003-P012
S003_P001
S003_P002
S003_P003
S003_P011
S003_P012
```

## פלט סריקה

- CSV: `_COMMUNICATION/team_170/TEAM_00_EXCLUSION_PASS2_WORK_PACKAGES.csv` — כל קובץ תחת `_COMMUNICATION/` (למעט `99-ARCHIVE/`) שנמצא בו לפחות אסימון אחד.

**הערה:** אסימון קצר מדי עלול לייצר שגיאות — רשימת האסימונים נבנית ממזהי WP/Program מלאים בלבד.

**log_entry | TEAM_170 | EXCLUSION_PASS2 | WP_SIGNATURE_SCAN | 2026-02-19**
