# BACKGROUND_TASK_SCHEDULER_BEHAVIOR
**project_domain:** TIKTRACK

**id:** `BACKGROUND_TASK_SCHEDULER_BEHAVIOR`  
**owner:** Team 70 (Documentation)  
**status:** ACTIVE  
**date:** 2026-03-04  
**version:** v1.0.0

---

## 1. Purpose

מסמך זה מגדיר את התנהגות ה־scheduler ברמת runtime עבור משימות רקע, כולל אכיפת `run_after` כפי שממומשת בפועל.

---

## 2. Canonical components

| Component | Role |
|---|---|
| `api/background/scheduler_registry.py` | Iron Rule: רג'יסטרי קנוני יחיד לכל ה־jobs |
| `api/background/scheduler_startup.py` | רישום jobs ל־APScheduler, startup behavior, ואכיפת `run_after` |
| `api/background/job_runner.py` | מעטפת ריצה, הצלחה/כשלון, ועדכון run logs |

---

## 3. run_after behavior (enforced)

> **run_after enforcement (active since 2026-03-04):**  
> Jobs declared with `run_after` in `scheduler_registry.py` are:  
> (a) delayed on startup by one full interval — they do not fire simultaneously with their parent  
> (b) triggered immediately by the parent's wrapper after successful completion  
> (c) NOT triggered if the parent job raises an exception — stale-data protection is preserved

---

## 4. Startup behavior

- Parent jobs (ללא `run_after`) יכולים לקבל kickoff מיידי לפי קונפיגורציית startup.
- Dependent jobs (עם `run_after`) מקבלים `next_run_time` דחוי במחזור אחד (interval אחד) כדי למנוע ריצה סימולטנית עם parent.
- התנהגות זו מחליפה הנחה ישנה של "כל jobs מתחילים יחד".

---

## 5. Runtime chaining and fallback

- בהצלחת parent: מתבצע trigger מיידי ל־dependent דרך `_scheduler.modify_job()` (advance next run).
- בכשל parent: לא מתבצע trigger מיידי ל־dependent.
- Safety fallback נשמר: dependent ימשיך לרוץ לפי schedule interval הרגיל שלו.

---

## 6. Operational notes

- אין להגדיר jobs מחוץ ל־`scheduler_registry.py`.
- שינויים ב־`run_after` מחייבים התאמת תיעוד במסמך זה וב־`SERVERS_SCRIPTS_SSOT.md`.

---

## 7. Technical history

| Date | Change | Source |
|---|---|---|
| 2026-03-04 | תוקנה אכיפת `run_after` בריצה בפועל; dependent jobs נדחים ב־startup ומופעלים מיידית אחרי parent מוצלח | `TEAM_00_TO_TEAM_70_SCHEDULER_FIX_DOCUMENTATION_v1.0.0.md` |

---

**log_entry | TEAM_70 | BACKGROUND_TASK_SCHEDULER_BEHAVIOR | RUN_AFTER_ENFORCEMENT_DOCUMENTED | 2026-03-04**
