---
id: TEAM_61_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE5_CANARY_SIM_COMPLETION_v1.0.0
historical_record: true
from: Team 61 (AOS DevOps & Platform)
to: Team 11 (AOS Gateway / Execution Lead)
cc: Team 51 (AOS QA), Team 191 (Git Governance), Team 100 (Chief Architect), Team 00 (Principal)
date: 2026-03-28
type: COMPLETION — Remediation Phase 5 (canary simulation — infra + CI)
domain: agents_os
branch: aos-v3
authority:
  - TEAM_11_TO_TEAM_61_AOS_V3_REMEDIATION_PHASE5_CANARY_SIM_COORDINATION_v1.0.0.md
  - TEAM_11_REMEDIATION_PHASE5_CANARY_SIM_GO_HANDOFF_v1.0.0.md
paired_mandate_team_51: TEAM_11_TO_TEAM_51_AOS_V3_REMEDIATION_PHASE5_CANARY_SIM_MANDATE_v1.0.0.md
status: PHASE5_INFRA_COMPLETE — Team 51: M1 design doc + completion report per mandate---

# Team 61 → Team 11 | Remediation Phase 5 — Canary simulation (השלמת תשתית)

## סיכום תפקיד 61

| נושא | מצב |
|------|-----|
| סקריפט הרצה מפורש (M3) | **`scripts/run_aos_v3_canary_simulation.sh`** — `pytest agents_os_v3/tests/canary_simulation/`; קוד יציאה = pytest |
| תיקיית בדיקות | **`agents_os_v3/tests/canary_simulation/`** — `conftest.py` (fixture `api_client`, מרקר **`aos_v3_canary_sim`**), `README.md` (חוזה + תזכורת M1) |
| בדיקת ייחוס M2 (מינימום + C-03) | **`test_phase5_canary_pipeline_happy_path`** — מסלול DB מלא: initiate + **חמישה** מחזורי advance (`drive_from_0_1_to_4_1`) + **approve** (HITL) + advance ל-**COMPLETE** + אימות אירועים בהיסטוריה |
| CI | עודכן **`.github/workflows/aos-v3-tests.yml`**: שלב 1 — pytest עם **`--ignore=.../canary_simulation/`**; שלב 2 — **`run_aos_v3_canary_simulation.sh`** (PASS/FAIL נפרד בלוג) |
| v2 | **לא** שינינו **`canary-simulation-tests.yml`** או **`scripts/canary_simulation/`** (v2) |
| IR-3 | **`FILE_INDEX.json`** גרסה **1.1.14** — 3 רשומות חדשות תחת `tests/canary_simulation/` |
| תיעוד | **`AGENTS_OS_V3_DEVELOPER_RUNBOOK.md`** §9.1 — תיאור שני השלבים + canary מקומי |

## שחזור כשלון מקומית

```bash
cd /path/to/repo
export PYTHONPATH="$(pwd)"
export AOS_V3_DATABASE_URL="postgresql://…/aos_v3"
python3 agents_os_v3/db/run_migration.py --fresh
python3 agents_os_v3/seed.py
bash scripts/run_aos_v3_canary_simulation.sh
```

## קישור ל-run לדוגמה (GitHub Actions)

לאחר push: **Actions** → workflow **AOS v3 Tests** → בחר run → שלב **Phase 5 — pipeline canary simulation (F-05)**.  
URL תבנית: `https://github.com/<org>/<repo>/actions/workflows/aos-v3-tests.yml`

## תיאום Team 51

- **M1** (מסמך עיצוב עמוד אחד) — באחריות **51** לפי המנדט הזוגי; תוכן מוצג בקצרה ב-`canary_simulation/README.md` כתזכורת בלבד.
- הרחבות תרחיש (pause/resume נפרדים, fail/correction, וכו') — **51** יכולים להוסיף קבצים באותה תיקייה + עדכון FILE_INDEX.

## אימות מקומי (repo)

```bash
bash scripts/check_aos_v3_build_governance.sh
```

---

**log_entry | TEAM_61 | AOS_V3 | REMEDIATION | PHASE5_CANARY_SIM_COMPLETION | 2026-03-28**
