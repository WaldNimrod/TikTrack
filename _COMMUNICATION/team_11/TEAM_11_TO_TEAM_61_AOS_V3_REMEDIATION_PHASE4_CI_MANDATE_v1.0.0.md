---
id: TEAM_11_TO_TEAM_61_AOS_V3_REMEDIATION_PHASE4_CI_MANDATE_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 61 (AOS DevOps & Platform)
cc: Team 00 (Principal), Team 51, Team 100, Team 191
date: 2026-03-28
type: REMEDIATION_MANDATE — Phase 4 (CI/CD for agents_os_v3)
domain: agents_os
branch: aos-v3
authority:
  - _COMMUNICATION/team_100/TEAM_100_AOS_V3_BUILD_COMPLETENESS_AUDIT_AND_GAP_PLAN_v1.0.0.md
phase4_go_handoff: TEAM_11_TO_TEAM_61_AOS_V3_REMEDIATION_PHASE4_CI_GO_HANDOFF_v1.0.0.md
phase4_gateway_receipt: TEAM_11_RECEIPT_TEAM_61_AOS_V3_REMEDIATION_PHASE4_CI_COMPLETION_v1.0.0.md---

# Team 11 → Team 61 | AOS v3 Remediation — Phase 4 (CI)

## מטרה

לסגור **F-02 / G-03 / G-04**: workflow ב-GitHub Actions שמריץ **`pytest agents_os_v3/tests/`** עם שירות **PostgreSQL**, **בלי** לשבור או להחליף את [canary-simulation-tests.yml](.github/workflows/canary-simulation-tests.yml) (v2).

**GO Gateway:** `TEAM_11_TO_TEAM_61_AOS_V3_REMEDIATION_PHASE4_CI_GO_HANDOFF_v1.0.0.md`. **הושלם:** `TEAM_11_RECEIPT_TEAM_61_AOS_V3_REMEDIATION_PHASE4_CI_COMPLETION_v1.0.0.md`.

## Layer 1 — Identity

| Field | Value |
|------|--------|
| Team ID | `team_61` |
| writes_to | `.github/workflows/` (קובץ חדש מוצע); `FILE_INDEX` אם נוספים סקריפטים תחת `agents_os_v3/` או `scripts/` |
| Submission | `TEAM_61_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE4_CI_COMPLETION_v1.0.0.md` |

## Layer 2 — Iron Rules

- Workflow חדש: מזהה מוצע **`aos-v3-tests.yml`** (או `aos-v3-ci.yml`).
- **אין** הסרת/שינוי התנהגות workflow קיימים ל-v2 ללא סימון מפורש בדוח 61.
- שימוש ב־`DATABASE_URL` / `AOS_V3_DATABASE_URL` בהתאם לדפוס repo (ראו `agents_os_v3/.env.example` אם קיים).

## Layer 3 — Deliverables

| # | Task |
|---|------|
| 4.1 | Job: התקנת תלויות Python + `pytest agents_os_v3/tests/` עם Postgres service container |
| 4.2 | (אופציונלי) Job נפרד או שלב מאוחר: E2E headless — **אחרי** Phase 3 stable; אם נדחה — ציין בדוח |
| 4.3 | תיעוד בדוח 61: איך לשחזר כשלון מקומית |

## Layer 4 — קבלה

- הרצה ירוקה על PR או `workflow_dispatch` (לפי מה שנבחר).
- קישור ל-run לדוגמה בדוח המסירה (או הערה אם CI רץ רק ב-main).

---

**log_entry | TEAM_11 | AOS_V3 | REMEDIATION | PHASE4_CI_MANDATE_T61_GO_AFTER_PHASE3B | 2026-03-28**
