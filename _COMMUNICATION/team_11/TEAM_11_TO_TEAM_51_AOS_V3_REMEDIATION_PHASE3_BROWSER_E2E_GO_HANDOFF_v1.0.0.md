---
id: TEAM_11_TO_TEAM_51_AOS_V3_REMEDIATION_PHASE3_BROWSER_E2E_GO_HANDOFF_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 51 (AOS QA & Functional Acceptance)
cc: Team 61, Team 31, Team 21, Team 100, Team 00
date: 2026-03-28
type: QA_HANDOFF — Remediation Phase 3b (**GO**)
domain: agents_os
branch: aos-v3
authority:
  - TEAM_11_TO_TEAM_51_AOS_V3_REMEDIATION_PHASE3_BROWSER_E2E_MANDATE_v1.0.0.md
  - TEAM_61_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE3_INFRA_COMPLETION_v1.0.0.md
  - TEAM_11_RECEIPT_TEAM_61_AOS_V3_REMEDIATION_PHASE3_INFRA_COMPLETION_v1.0.0.md
gateway_status: GO — Phase 3b authorized---

# Team 11 → Team 51 | Remediation Phase 3b (Browser E2E) — **GO**

## מצב

**Phase 3a הושלמה ואושרה ב-Gateway.**  
קבלה: `TEAM_11_RECEIPT_TEAM_61_AOS_V3_REMEDIATION_PHASE3_INFRA_COMPLETION_v1.0.0.md`.  
תנאי **blocked_until** במנדט Phase 3b **הוסר בפועל** — מסמך 61 נמסר.

**מותר להתחיל מלא** את **Phase 3b** לפי `TEAM_11_TO_TEAM_51_AOS_V3_REMEDIATION_PHASE3_BROWSER_E2E_MANDATE_v1.0.0.md`.

## תשתית (מ־61) — שימוש

| נושא | נתיב / פעולה |
|------|----------------|
| הרמת stack | `bash scripts/run_aos_v3_e2e_stack.sh` (אופציונלי `AOS_V3_E2E_PREPARE_DB=1`) |
| עצירת static | `bash scripts/stop_aos_v3_e2e_static.sh` |
| תלויות E2E | `pip install -r agents_os_v3/requirements-e2e.txt` |
| הרצת בדיקות דפדפן | `AOS_V3_E2E_RUN=1 python3 -m pytest agents_os_v3/tests/e2e/ -v` (+ מלא לפי README / Runbook §7.1) |

## מסירה צפויה

`TEAM_51_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE3_E2E_COMPLETION_v1.0.0.md`.

## תזכורות מנדט

- הפרדה בדוח בין **Browser E2E** לבין **TestClient** / API integration.
- **MCP browser** — local-only (C-02); ל-CI עתידי — Selenium/Playwright כפי ש־61 הטמיע (Selenium 4 + Chrome).
- **Team 31** — אופציונלי: `data-testid` / יציבות DOM לפי מנדט selectors.

---

**log_entry | TEAM_11 | AOS_V3 | REMEDIATION | PHASE3B_BROWSER_HANDOFF_GO_T51 | 2026-03-28**
