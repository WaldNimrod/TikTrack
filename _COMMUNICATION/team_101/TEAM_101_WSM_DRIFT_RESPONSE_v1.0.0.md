---
id: TEAM_101_WSM_DRIFT_RESPONSE_v1.0.0
historical_record: true
from: Team 101
to: Team 100
re: TEAM_100_TO_TEAM_101_WSM_DRIFT_ROOT_CAUSE_QUERY_v1.0.0.md
date: 2026-03-24
status: CLOSED — superseded by full remediation doc---

# תשובה קצרה — שאלת drift WP099 / WSM

## הפניה מלאה

ניתוח שורש, הפרדת מקורות (בדיקות Canary לעומת `pipeline_run`), ותוכנית טיפול מובנית — במסמך:

**[`TEAM_101_PIPELINE_TEST_ISOLATION_AND_WSM_DRIFT_REMEDIATION_v1.0.0.md`](TEAM_101_PIPELINE_TEST_ISOLATION_AND_WSM_DRIFT_REMEDIATION_v1.0.0.md)**

## תשובות ישירות לשאלות §3 (תקציר)

| # | תשובה |
|---|--------|
| 1 | כל `pass`/`fail`/`approve` שבוצעו כש־`pipeline_state_agentsos.json` עדיין החזיק **WP099** יכלו לכתוב את אותו WP ל־WSM. הבדיקות האוטומטיות הצרות (mocks/verify/ssot/selenium) **לא** מפעילות `pipeline_run`; מקור הזיהום הוא **הרצות pipeline אופרטוריות/QA/E2E** על אותו repo. |
| 2 | סקריפטי Canary ב־`scripts/canary_simulation/` **לא** מריצים `pass`/`fail`. סקריפט E2E תחת `_COMMUNICATION/team_101/_E2E_SIM_*/` **כן** מריץ `pipeline_run` — מסומן כ־operator-only. |
| 3 | אין scheduler רשמי של Team 101; תהליכי רקע יש לבדוק לפי `ps` בסביבה. |
| 4–5 | לא מבוצע בסשן זה; השתמשו בפקודות Diagnostic מהשאלה כשצריך לאמת סביבה חיה. |

## סקריפט בטוח ברירת מחדל

`scripts/canary_simulation/run_canary_safe.sh` — Layer 1 + `ssot_check` בלי `pipeline_run`.

---

**log_entry | TEAM_101 | WSM_DRIFT_RESPONSE | POINTER_TO_REMEDIATION_DOC | 2026-03-24**
