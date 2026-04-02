---
id: TEAM_11_TO_TEAM_51_AOS_V3_REMEDIATION_PHASE2_TC_TRACEABILITY_MANDATE_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 51 (AOS QA & Functional Acceptance)
cc: Team 00 (Principal), Team 21, Team 100, Team 61
date: 2026-03-28
type: REMEDIATION_MANDATE — Phase 2 (TC traceability + new API tests)
domain: agents_os
branch: aos-v3
authority:
  - _COMMUNICATION/team_100/TEAM_100_AOS_V3_BUILD_COMPLETENESS_AUDIT_AND_GAP_PLAN_v1.0.0.md
  - _COMMUNICATION/team_00/TEAM_00_TO_TEAM_11_AOS_V3_BUILD_WORK_PACKAGE_v1.0.3.md
depends_on: TEAM_11_TO_TEAM_21_AOS_V3_REMEDIATION_PHASE1_API_GAPS_MANDATE_v1.0.1.md
phase2_go_handoff: TEAM_11_TO_TEAM_51_AOS_V3_REMEDIATION_PHASE2_QA_HANDOFF_v1.0.0.md---

# Team 11 → Team 51 | AOS v3 Remediation — Phase 2 (TC-01..TC-14 + API tests)

## מטרה

לסגור **פער F-04** (מיפוי TC) וחלק מ־**F-03**: בדיקות pytest **בשמות מפורשים** ל־TC-01..TC-14 + בדיקות ל-endpoints שהוסיפה **Phase 1** (אחרי מסירת 21).

## Layer 1 — Identity

| Field | Value |
|------|--------|
| Team ID | `team_51` |
| writes_to | `agents_os_v3/tests/` (קבצים חדשים/מעודכנים); `_COMMUNICATION/team_51/` למסירה |
| Submission | `TEAM_51_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE2_COMPLETION_v1.0.0.md` |

## Layer 2 — Iron Rules

| ID | Rule |
|----|------|
| IR-3 | עדכן `FILE_INDEX.json` אם נוספים קבצי בדיקה חדשים תחת `agents_os_v3/tests/`. |
| Terminology | הפרד בדוח בין **API integration (TestClient)** לבין **Browser E2E** (Phase 3). |

## Layer 3 — Deliverables

| # | Task | הערה |
|---|------|------|
| 2.1 | קובץ (או מודול) עם פונקציות `test_tc01_*` … `test_tc14_*` | מיפוי טבלה בראש הקובץ: TC-ID → spec paragraph (WP / Module Map) → בדיקה |
| 2.2 | בדיקות ל־`override`, `GET /api/teams/{id}`, `DELETE /api/routing-rules/{id}`, `PUT /api/policies/{id}` | **אחרי** השלמת Phase 1 מ־21; שמות מפורשים; נתיבים לפי **Option B** (ללא `/admin/`) |

## Layer 4 — אימותים

- `PYTHONPATH=. python3 -m pytest agents_os_v3/tests/ -q` — כל הסוויטה ירוקה.
- `bash scripts/check_aos_v3_build_governance.sh` — PASS.

## תלות

- **2.2** — **פתוח** — Phase 1 נסגר: `TEAM_21_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE1_COMPLETION_v1.0.0.md` + קבלת Gateway `TEAM_11_RECEIPT_TEAM_21_AOS_V3_REMEDIATION_PHASE1_COMPLETION_v1.0.0.md` + **GO** `TEAM_11_TO_TEAM_51_AOS_V3_REMEDIATION_PHASE2_QA_HANDOFF_v1.0.0.md`.
- **2.1** — יכול לרוץ **במקביל** ל-Phase 1 אם אין תלות בקוד חדש.

---

**log_entry | TEAM_11 | AOS_V3 | REMEDIATION | PHASE2_MANDATE_T51_GO_AFTER_PHASE1 | 2026-03-28**
