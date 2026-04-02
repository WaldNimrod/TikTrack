---
id: TEAM_100_TO_TEAM_101_WSM_DRIFT_ROOT_CAUSE_QUERY_v1.0.0
historical_record: true
from: Team 100 (Chief Architect)
to: Team 101 (AOS Domain Architect)
date: 2026-03-24
status: QUERY_ACTIVE — requires Team 101 response
priority: URGENT
subject: WSM drift root cause — WP099/GATE_3 חוזר שוב ושוב---

# שאלה ל-Team 101 — מה כותב WP099 חזרה ל-WSM?

## §1 — הבעיה

WSM (`PHOENIX_MASTER_WSM_v1.0.0.md`) CURRENT_OPERATIONAL_STATE חוזר שוב ושוב למצב:
```
current_gate     | GATE_3
active_work_package_id | S003-P011-WP099
```

זה קורה גם לאחר שתיקנו ידנית וגם לאחר שניקינו את `pipeline_state_agentsos.json`.

**`pipeline_state_agentsos.json` נוכחי:** S003-P012-WP005 COMPLETE ✅
**WSM:** חוזר ל-WP099/GATE_3 ❌

---

## §2 — מיפוי מלא של מנגנוני הכתיבה ל-WSM (Team 100 ביצע)

| מנגנון | פונקציה | מתי מופעל | כותב COS? | כותב STAGE_PARALLEL? |
|---|---|---|---|---|
| Gate advance | `write_wsm_state()` | `./pipeline_run.sh pass/fail/approve` | ✅ כן | לא ישיר |
| Post-advance | `write_stage_parallel_tracks_row()` | אחרי כל pass/fail/approve | לא | ✅ כן |
| Phase sync | `_auto_wsm_sync()` → `sync_parallel_tracks_from_pipeline()` | `./pipeline_run.sh phase<N>` בלבד | לא | ✅ כן |
| pytest | mock עם `monkeypatch` + `tmp_path` | בודד, לא כותב לקבצים אמיתיים | לא | לא |
| `generate_mocks.py` | `write_files()` | simulation בלבד | לא (מפורש בקוד) | לא |
| `state_reader` | `output_path.write_text(...)` | `pipeline_run.sh status/next` | לא | לא |

**מסקנה:** הדרך היחידה לכתוב WP099 ל-WSM (COS) היא `write_wsm_state()` שנקראת רק אחרי `./pipeline_run.sh pass/fail/approve` — עם state שמכיל `work_package_id=S003-P011-WP099`.

---

## §3 — שאלות ישירות ל-Team 101

### שאלה 1 — CRITICAL
**האם Team 101 רץ `./pipeline_run.sh pass`, `fail`, או `approve` כאשר `pipeline_state_agentsos.json` הכיל WP099?**

אם כן — מתי? כמה פעמים? עם איזה domain flag?

### שאלה 2 — CRITICAL
**האם ה-simulation scripts שלך (Phase A, Phase B) מריצים `pipeline_run.sh` עם subcommands שמבצעים gate advance (pass/fail)?**

אם כן — אנא ציין כל שורה בקוד שמריצה `pass`/`fail`/`approve`.

### שאלה 3 — IMPORTANT
**האם יש background process, scheduler, watcher, או cron שרץ מהסשן של Team 101 ומריץ pipeline commands?**

### שאלה 4 — DIAGNOSTIC
**בדוק: האם יש כרגע process פעיל שמריץ pipeline commands?**
```bash
ps aux | grep pipeline_run
ps aux | grep "agents_os_v2.orchestrator.pipeline"
```
דווח על output.

### שאלה 5 — DIAGNOSTIC
**מה ה-git log של שינויים ל-WSM ב-48 השעות האחרונות?**
```bash
git log --oneline --follow -- documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md | head -20
```

---

## §4 — תיאוריה מובילה (לאימות/דחייה)

**הסברה:** Team 101 הריץ `./pipeline_run.sh pass` או `./pipeline_run.sh fail` בזמן ש-`pipeline_state_agentsos.json` עדיין הכיל WP099 (לפני הניקוי). זה כתב WP099/GATE_3 ל-WSM.

לאחר שניקינו את pipeline_state, ה-pipeline עצמו לא יכתוב WP099 מחדש — כי pipeline_state כבר S003-P012-WP005 COMPLETE. **אלא אם** יש עוד ריצות simulation פעילות עם WP099 שמריצות pipeline commands.

---

## §5 — תשובה נדרשת

```
1. אישור/דחייה של תיאוריה §4
2. רשימת כל pipeline commands שה-simulation scripts שלך מריצים
3. תוצאות בדיקות diagnostic (שאלות 4+5)
4. האם יש תהליכי background שיש לעצור?
```

Return path: `_COMMUNICATION/team_101/TEAM_101_WSM_DRIFT_RESPONSE_v1.0.0.md`

**log_entry | TEAM_100 | WSM_DRIFT_ROOT_CAUSE_QUERY | TEAM_101_ACTIVATED | URGENT | 2026-03-24**
