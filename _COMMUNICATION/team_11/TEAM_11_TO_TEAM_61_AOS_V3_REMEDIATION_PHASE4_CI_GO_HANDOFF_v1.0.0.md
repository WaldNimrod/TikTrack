---
id: TEAM_11_TO_TEAM_61_AOS_V3_REMEDIATION_PHASE4_CI_GO_HANDOFF_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 61 (AOS DevOps & Platform)
cc: Team 51, Team 191, Team 100, Team 00
date: 2026-03-28
type: INFRA_HANDOFF — Remediation Phase 4 (**GO**)
domain: agents_os
branch: aos-v3
authority:
  - TEAM_11_TO_TEAM_61_AOS_V3_REMEDIATION_PHASE4_CI_MANDATE_v1.0.0.md
  - TEAM_51_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE3_E2E_COMPLETION_v1.0.0.md
  - TEAM_11_RECEIPT_TEAM_51_AOS_V3_REMEDIATION_PHASE3_E2E_COMPLETION_v1.0.0.md
gateway_status: GO — Phase 4 authorized---

# Team 11 → Team 61 | Remediation Phase 4 (CI for v3) — **GO**

## מצב

**Phase 3b (Browser E2E) הושלמה ואושרה ב-Gateway.**  
קבלה: `TEAM_11_RECEIPT_TEAM_51_AOS_V3_REMEDIATION_PHASE3_E2E_COMPLETION_v1.0.0.md`.

**מותר להתחיל מלא** את **Phase 4** לפי **`TEAM_11_TO_TEAM_61_AOS_V3_REMEDIATION_PHASE4_CI_MANDATE_v1.0.0.md`**.

## מנדט Phase 4 — ליבה (תזכורת)

| # | משימה |
|---|--------|
| **4.1** | Workflow חדש (מוצע: `.github/workflows/aos-v3-tests.yml`): Postgres service + `pytest agents_os_v3/tests/` |
| **4.2** | (אופציונלי) Job/step ל-E2E headless — רק אם יציב; אחרת תעד דחייה מנומקת |
| **4.3** | דוח מסירה: שחזור כשלון מקומית + קישור ל-run לדוגמה (או הערה ל-main בלבד) |

## Iron Rules (ממנדט)

- **אל** לשבור או להחליף את `canary-simulation-tests.yml` (v2) ללא החלטה נפרדת.
- `DATABASE_URL` / `AOS_V3_DATABASE_URL` — לפי דפוס ה-repo.

## מסירה צפויה

`TEAM_61_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE4_CI_COMPLETION_v1.0.0.md`.

## הקשר Phase 3b (לתכנון CI)

- סוויטה מלאה עם E2E דורשת `AOS_V3_E2E_RUN=1` + Chrome/Selenium + לרוב stack; ברירת מחדל ב-CI יכולה להישאר **API-only** אם 4.2 נדחה — ציין במפורש.

---

**log_entry | TEAM_11 | AOS_V3 | REMEDIATION | PHASE4_CI_HANDOFF_GO_T61 | 2026-03-28**
