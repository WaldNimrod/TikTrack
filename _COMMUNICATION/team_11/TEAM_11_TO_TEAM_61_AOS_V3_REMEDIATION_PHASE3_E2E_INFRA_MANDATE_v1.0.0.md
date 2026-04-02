---
id: TEAM_11_TO_TEAM_61_AOS_V3_REMEDIATION_PHASE3_E2E_INFRA_MANDATE_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 61 (AOS DevOps & Platform)
cc: Team 00 (Principal), Team 51, Team 31, Team 100
date: 2026-03-28
type: REMEDIATION_MANDATE — Phase 3a (browser E2E infrastructure)
domain: agents_os
branch: aos-v3
authority:
  - _COMMUNICATION/team_100/TEAM_100_AOS_V3_BUILD_COMPLETENESS_AUDIT_AND_GAP_PLAN_v1.0.0.md
  - _COMMUNICATION/team_00/TEAM_00_AOS_V3_BUILD_PROCESS_MAP_v1.0.0.md
paired_mandate: TEAM_11_TO_TEAM_51_AOS_V3_REMEDIATION_PHASE3_BROWSER_E2E_MANDATE_v1.0.0.md
phase3a_go_handoff: TEAM_11_TO_TEAM_61_AOS_V3_REMEDIATION_PHASE3_INFRA_GO_HANDOFF_v1.0.0.md---

# Team 11 → Team 61 | AOS v3 Remediation — Phase 3a (E2E infra)

## מטרה

לסגור תשתית ל־**F-01**: הרצת דפדפן אמיתי (Selenium או Playwright — **בחירת 61** לפי התאמה ל-repo ול-CI עתידי) מול `agents_os_v3/ui/` עם שרת v3 + DB, כפי שמפורט בדוח §7.3.

**GO Gateway:** לאחר **Phase 2 PASS** — ראו `TEAM_11_TO_TEAM_61_AOS_V3_REMEDIATION_PHASE3_INFRA_GO_HANDOFF_v1.0.0.md`.

## Layer 1 — Identity

| Field | Value |
|------|--------|
| Team ID | `team_61` |
| writes_to | סקריפטי bootstrap, תלויות E2E (למשל `requirements-e2e.txt` או סעיף ב־`agents_os_v3/requirements.txt` **באישור מגבלות**), תיעוד הרצה מקומית; `FILE_INDEX` לנתיבים חדשים תחת `agents_os_v3/` |
| Submission | `TEAM_61_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE3_INFRA_COMPLETION_v1.0.0.md` |

## Layer 2 — Iron Rules

- **אין** שינוי ב־`agents_os_v2/` או שבירת [canary-simulation-tests.yml](.github/workflows/canary-simulation-tests.yml) ל-v2 ללא החלטה נפרדת.
- כל נתיב חדש תחת `agents_os_v3/` — **FILE_INDEX**.

## Layer 3 — Deliverables

| # | Task |
|---|------|
| 1 | מסמך / סקריפט: איך מרימים API + DB + static UI לבדיקת E2E (יישור ל־[AGENTS_OS_V3_DEVELOPER_RUNBOOK](documentation/docs-agents-os/04-PROCEDURES/AGENTS_OS_V3_DEVELOPER_RUNBOOK.md) אם רלוונטי) |
| 2 | שלד בדיקות E2E (תיקייה מוצעת: `agents_os_v3/tests/e2e/` או שם מאושר בידי 61) — fixture לדפדפן + base URL |
| 3 | אינטגרציה ראשונית: בדיקה אחת **smoke** (למשל טעינת `index.html` + assert כותרת/נגישות אלמנט) כהוכחת חיוּת |

## תיאום

- **Team 51** מממש תרחישים מלאים במנדט הזוגי לאחר קיום infra.
- **Team 31** — מנדט אופציונלי ל־`data-testid` אם האינפרא דורשת יציבות DOM.

---

**log_entry | TEAM_11 | AOS_V3 | REMEDIATION | PHASE3_INFRA_MANDATE_T61_GO_AFTER_PHASE2 | 2026-03-28**
