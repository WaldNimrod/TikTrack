---
id: TEAM_61_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE3_INFRA_COMPLETION_v1.0.0
historical_record: true
from: Team 61 (AOS DevOps & Platform)
to: Team 11 (AOS Gateway / Execution Lead)
cc: Team 51 (AOS QA), Team 31 (AOS Frontend), Team 00 (Principal), Team 100 (Chief Architect)
date: 2026-03-28
type: COMPLETION — Remediation Phase 3a (E2E infrastructure)
domain: agents_os
branch: aos-v3
authority:
  - TEAM_11_TO_TEAM_61_AOS_V3_REMEDIATION_PHASE3_E2E_INFRA_MANDATE_v1.0.0.md
  - TEAM_11_TO_TEAM_61_AOS_V3_REMEDIATION_PHASE3_INFRA_GO_HANDOFF_v1.0.0.md
paired_mandate_team_51: TEAM_11_TO_TEAM_51_AOS_V3_REMEDIATION_PHASE3_BROWSER_E2E_MANDATE_v1.0.0.md
status: PHASE_3A_INFRA_COMPLETE — Team 51 may proceed Phase 3b on scenarios---

# Team 61 → Team 11 | Remediation Phase 3a — השלמת תשתית E2E

## סיכום

| # | מנדט (שכבת משלוח) | מצב |
|---|-------------------|-----|
| 1 | תיעוד/סקריפט להרמת API + DB + UI סטטי | **DONE** — `scripts/run_aos_v3_e2e_stack.sh` + `scripts/stop_aos_v3_e2e_static.sh`; יישור ל־[AGENTS_OS_V3_DEVELOPER_RUNBOOK.md](../../documentation/docs-agents-os/04-PROCEDURES/AGENTS_OS_V3_DEVELOPER_RUNBOOK.md) §7.1 |
| 2 | שלד E2E — fixture דפדפן + base URL | **DONE** — `agents_os_v3/tests/e2e/conftest.py` (Selenium / Chrome; `e2e_base_url`, `browser_driver`) |
| 3 | בדיקת smoke אחת | **DONE** — `agents_os_v3/tests/e2e/test_smoke_index.py` (כותרת + `[data-aosv3-page=pipeline]` + `h1.agents-header-title`) |

## בחירת כלי

**Selenium 4 + Chrome** — עקביות עם אקוסיסטם הפרויקט (Selenium ב־`tests/` ל־TikTrack), Selenium Manager ל־ChromeDriver במידת הצורך, נוח ל־CI עתידי ללא Node לשכבה זו.

## תלויות

- `agents_os_v3/requirements-e2e.txt` — **לא** ממוזג ל־`requirements.txt` הראשי; התקנה ממוקדת:  
  `pip install -r agents_os_v3/requirements-e2e.txt`

## הרצה (תזכורת)

```bash
bash scripts/run_aos_v3_e2e_stack.sh
pip install -r agents_os_v3/requirements-e2e.txt
AOS_V3_E2E_RUN=1 python3 -m pytest agents_os_v3/tests/e2e/ -v
```

ברירת מחדל: מודול ה־E2E **מדולג** אם `AOS_V3_E2E_RUN` לא מוגדר — כדי שלא יישברו ריצות `pytest agents_os_v3/tests/` בסביבות בלי Chrome/Selenium.

## IR-3

- `agents_os_v3/FILE_INDEX.json` גרסה **1.1.11** — רשומות: `requirements-e2e.txt`, `tests/e2e/README.md`, `conftest.py`, `test_smoke_index.py`.
- `bash scripts/check_aos_v3_build_governance.sh` — **PASS** בעת המסירה.

## Iron Rules

- **לא** נגענו ב־`agents_os_v2/`.
- **לא** שינינו את `.github/workflows/canary-simulation-tests.yml`.

## המשך (Gateway)

**Team 51** — מנדט Phase 3b (תרחישי דפדפן מלאים) לאחר קבלת מסמך זה.  
**Team 31** — אופציונלי: `data-testid` לפי צורך יציבות DOM.

---

**log_entry | TEAM_61 | AOS_V3 | REMEDIATION | PHASE3A_INFRA_COMPLETION | 2026-03-28**
