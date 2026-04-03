---
id: TEAM_11_TO_TEAM_51_AOS_V3_REMEDIATION_PHASE3_BROWSER_E2E_MANDATE_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 51 (AOS QA & Functional Acceptance)
cc: Team 00 (Principal), Team 21, Team 31, Team 61, Team 100
date: 2026-03-28
type: REMEDIATION_MANDATE — Phase 3b (browser E2E scenarios)
domain: agents_os
branch: aos-v3
authority:
  - _COMMUNICATION/team_100/TEAM_100_AOS_V3_BUILD_COMPLETENESS_AUDIT_AND_GAP_PLAN_v1.0.0.md
  - _COMMUNICATION/team_00/TEAM_00_TO_TEAM_11_AOS_V3_BUILD_WORK_PACKAGE_v1.0.3.md
blocked_until: TEAM_61_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE3_INFRA_COMPLETION_v1.0.0.md
blocked_until_status: SATISFIED — Gateway receipt `TEAM_11_RECEIPT_TEAM_61_AOS_V3_REMEDIATION_PHASE3_INFRA_COMPLETION_v1.0.0.md`
phase3b_go_handoff: TEAM_11_TO_TEAM_51_AOS_V3_REMEDIATION_PHASE3_BROWSER_E2E_GO_HANDOFF_v1.0.0.md
phase3b_gateway_receipt: TEAM_11_RECEIPT_TEAM_51_AOS_V3_REMEDIATION_PHASE3_E2E_COMPLETION_v1.0.0.md
paired_mandate: TEAM_11_TO_TEAM_61_AOS_V3_REMEDIATION_PHASE3_E2E_INFRA_MANDATE_v1.0.0.md---

# Team 11 → Team 51 | AOS v3 Remediation — Phase 3b (browser E2E)

## מטרה

לסגור **F-01 / G-01 / G-02** (לפחות ברמת אוטומציה ב-repo): בדיקות **דפדפן אמיתיות** ל־`agents_os_v3/ui/` בהתאם ל־WP D.4 / Process Map (Operator Handoff + SSE + מצבי B/C/D ככל שה-scope מאפשר).

## תנאי תחילה

**הושלם:** מסירת 51 + קבלת Gateway `TEAM_11_RECEIPT_TEAM_51_AOS_V3_REMEDIATION_PHASE3_E2E_COMPLETION_v1.0.0.md`. תנאי infra 3a — כבר התקיימו לפני GO 3b.

## Layer 1 — Identity

| Field | Value |
|------|--------|
| Team ID | `team_51` |
| writes_to | `agents_os_v3/tests/e2e/` (או נתיב שקבע 61); `_COMMUNICATION/team_51/` |
| Submission | `TEAM_51_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE3_E2E_COMPLETION_v1.0.0.md` |

## Layer 2 — Iron Rules

- **FILE_INDEX** לקבצים חדשים.
- דוח מסירה: מפריד בין **Browser E2E** לבין **TestClient**.

## Layer 3 — תרחישים (מינימום לפי דוח §7.3)

| # | עמוד | תוכן |
|---|------|------|
| 3.1 | Pipeline (`index.html`) | יצירת/בחירת run, advance, אימות עדכון SSE chip / מצב |
| 3.2 | Config | routing rules, templates, policies — צפייה + פעולות מפתח (לפי UI קיים) |
| 3.3 | Teams | רשימה + עדכון engine (אם role מאפשר) |
| 3.4 | Portfolio | ideas / work-packages — CRUD בסיסי |
| 3.5 | History | ציר זמן / בחירת run |
| 3.6 | System Map (`flow.html`) | רינדור / ניווט בסיסי |

**Team 100 — ייעוץ C-02 (Phase 3b):** אוטומציית דפדפן מבוססת **MCP** מתאימה **ל-local בלבד** — אינה נחשבת תואמת CI. ל-**CI** נדרש **Selenium או Playwright** (או שכבה מקבילה ש-61 מאשר) כפי ש-Phase 4 יריץ. אם משתמשים ב-MCP לפיתוח — תעדו בדוח מסירה **local-only** במפורש.

## Layer 4 — אימותים

- הרצה מקומית מתועדת (פקודות + תוצאה).
- אינטגרציה ל-CI תתווסף ב־**Phase 4** (לא חובה לסגירת Phase 3 אם 61 קובע אחרת).

---

**log_entry | TEAM_11 | AOS_V3 | REMEDIATION | PHASE3_E2E_MANDATE_T51_GO_AFTER_PHASE3A | 2026-03-28**
