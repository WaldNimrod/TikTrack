---
id: TEAM_61_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE4_CI_COMPLETION_v1.0.0
historical_record: true
from: Team 61 (AOS DevOps & Platform)
to: Team 11 (AOS Gateway / Execution Lead)
cc: Team 51 (AOS QA), Team 191 (Git Governance), Team 100 (Chief Architect), Team 00 (Principal)
date: 2026-03-28
type: COMPLETION — Remediation Phase 4 (CI for agents_os_v3)
domain: agents_os
branch: aos-v3
authority:
  - TEAM_11_TO_TEAM_61_AOS_V3_REMEDIATION_PHASE4_CI_MANDATE_v1.0.0.md
  - TEAM_11_TO_TEAM_61_AOS_V3_REMEDIATION_PHASE4_CI_GO_HANDOFF_v1.0.0.md
status: PHASE4_CI_DELIVERED---

# Team 61 → Team 11 | Remediation Phase 4 — CI (השלמה)

## 4.1 — Workflow חדש

| פריט | ערך |
|------|-----|
| קובץ | `.github/workflows/aos-v3-tests.yml` |
| שם workflow | **AOS v3 Tests** |
| Python | **3.12** (תואם `str \| None` / pydantic ללא תלות ב-eval_type_backport בזמן איסוף) |
| Postgres | שירות **postgres:15-alpine**; משתמש/סיסמה/DB: `aosv3_ci` / `aosv3_ci_pass` / `aos_v3_ci` |
| משתנה סביבה | **`AOS_V3_DATABASE_URL`** בלבד לבדיקות v3 (לא `DATABASE_URL` של TikTrack) |
| לפני pytest | `python3 agents_os_v3/db/run_migration.py --fresh` + `python3 agents_os_v3/seed.py` |
| פקודה | `python3 -m pytest agents_os_v3/tests/ -v --tb=short` |
| טריגרים | `workflow_dispatch`; `pull_request` + `push` ל־`main` / `aos-v3` / `develop` עם **path filter** ל־`agents_os_v3/**` או לקובץ ה-workflow |

**Iron Rule:** לא נגענו ב־`.github/workflows/canary-simulation-tests.yml`.

## 4.2 — E2E headless ב-CI

**נדחה לשלב זה (מנומק):** הרצת Chrome + Selenium + `AOS_V3_E2E_RUN=1` + stack (API + `http.server` סטטי) מוסיפה זמן, תלות ב־`apt` ל־Chrome, ורגישות לרועד — מעבר לס cope מנדט 4.1. בדיקות E2E נשארות **מקומיות / ידניות / workflow נפרד עתידי** אם יוחלט ב-Gateway.

ב-CI הנוכחי מודולי `agents_os_v3/tests/e2e/` נשארים ב־**skip** (ללא `AOS_V3_E2E_RUN`) — הסוויטה נשארת ירוקה.

## 4.3 — שחזור כשלון מקומית

דוגמה עם Docker (פורט **5433** כדי לא להתנגש ב-Postgres מקומי):

```bash
docker run -d --name aos-v3-ci-pg -p 5433:5432 \
  -e POSTGRES_USER=aosv3_ci \
  -e POSTGRES_PASSWORD=aosv3_ci_pass \
  -e POSTGRES_DB=aos_v3_ci \
  postgres:15-alpine
# המתן ~5s ל־healthy

cd /path/to/TikTrackAppV2-phoenix
python3.12 -m venv .venv-aos-v3-ci
source .venv-aos-v3-ci/bin/activate
pip install -r agents_os_v3/requirements.txt
export PYTHONPATH="$(pwd)"
export AOS_V3_DATABASE_URL="postgresql://aosv3_ci:aosv3_ci_pass@127.0.0.1:5433/aos_v3_ci"
python3 agents_os_v3/db/run_migration.py --fresh
python3 agents_os_v3/seed.py
python3 -m pytest agents_os_v3/tests/ -v --tb=short
```

**הערה:** אם אין Python 3.12 מקומית, התקן אותו או השתמש ב-container שמדמה את `ubuntu-latest` + `actions/setup-python@v5` עם `3.12`.

## קישור ל-run לדוגמה

- לאחר ה-push הראשון של workflow זה לריפו: פתח **Actions** → **AOS v3 Tests** → בחר run עדכני והעתק את ה-URL.
- תבנית: `https://github.com/<org>/<repo>/actions/workflows/aos-v3-tests.yml`

(במסמך זה אין קישור חי — ימולא על ידי Gateway/מפעיל אחרי ריצה ראשונה ב-GitHub.)

## תיעוד נוסף

- `documentation/docs-agents-os/04-PROCEDURES/AGENTS_OS_V3_DEVELOPER_RUNBOOK.md` — §9.1 (סיכום CI).

---

**log_entry | TEAM_61 | AOS_V3 | REMEDIATION | PHASE4_CI_COMPLETION | 2026-03-28**
