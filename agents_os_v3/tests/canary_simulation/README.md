# AOS v3 — Phase 5 pipeline canary simulation (`canary_simulation/`)

**F-05 / Remediation Phase 5** — suite מצומצמת שמריצה **מעברי מצב אמיתיים** מול PostgreSQL דרך ה-API (לא `canary_gate4.sh`, לא `agents_os_v2`).

## בעלות

| צוות | תפקיד |
|------|--------|
| **Team 61** | סקריפט הרצה, CI, מרקר `aos_v3_canary_sim`, תשתית pytest |
| **Team 51** | M1 עיצוב (מסמך נפרד), הרחבת תרחישים נוספים במידת הצורך |

## מה נחשב "צעד pipeline" (תזכורת M1)

ב-v3, צעד טיפוסי כולל מוטציה על `runs` דרך REST: `POST /api/runs`, `…/advance`, `…/pause`, `…/resume`, `…/approve`, `…/fail`, וכו' — עם אירועים ב-`events` / היסטוריה. אין שימוש ב-`pipeline_run.sh` של v2 בחבילה זו.

## הרצה מקומית

```bash
export PYTHONPATH=$(pwd)
export AOS_V3_DATABASE_URL=postgresql://user:pass@127.0.0.1:5432/aos_v3
python3 agents_os_v3/db/run_migration.py --fresh && python3 agents_os_v3/seed.py
bash scripts/run_aos_v3_canary_simulation.sh
```

## M2 / M3

- **M2:** הבדיקה `test_phase5_canary_pipeline_happy_path` מבצעת מסלול מלא (כולל **≥5** מחזורי feedback/advance לפני HITL, **approve**, וסיום `COMPLETE`) — יישור C-03.
- **M3:** קוד יציאה של pytest + פלט טקסטual (ב-CI: שלב נפרד **Phase 5 — pipeline canary** ב-`aos-v3-tests.yml`).

---

**log_entry | TEAM_61 | AOS_V3 | PHASE5_CANARY_SIM | README | 2026-03-28**
