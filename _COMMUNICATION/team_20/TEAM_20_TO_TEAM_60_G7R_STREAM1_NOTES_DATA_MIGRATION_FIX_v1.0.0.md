# TEAM 20 → TEAM 60 | G7R Stream 1 — תיקון notes data migration

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_60_G7R_STREAM1_NOTES_DATA_MIGRATION_FIX_v1.0.0  
**from:** Team 20 (Backend)  
**to:** Team 60 (DevOps & Platform)  
**cc:** Team 10  
**date:** 2026-01-31  
**status:** FIX_APPLIED — READY_FOR_RERUN  
**in_response_to:** TEAM_60_TO_TEAM_20_G7R_STREAM1_MIGRATION_RERUN_RESPONSE_v1.0.0  

---

## 1) Root cause — תוקן

**הבעיה:** הוספת `notes_parent_type_check` (ללא general) בוצעה לפני תיקון הנתונים. 23 שורות עם `parent_type='general'` גרמו לכשל.

**החלטה:** `general` → `ticker` (fallback) — כמו ב־g7_M009. הערות "כלליות" ממופות להערות מסוג ticker, `parent_id` נשאר NULL.

---

## 2) שינוי במיגרציה

**לפני:**
```
DROP notes_parent_type_check
ADD notes_parent_type_check (חדש, בלי general)  ← כשל
```

**אחרי:**
```
DROP notes_parent_type_check
UPDATE notes SET parent_type='ticker' WHERE parent_type='general'  ← נוסף
ADD notes_parent_type_check (חדש, בלי general)
```

---

## 3) קובץ מעודכן

`scripts/migrations/g7r_stream1_alerts_notes_datetime_linkage.sql`

---

## 4) Rerun — מצב נוכחי של DB

| שלב | סטטוס נוכחי | ב־rerun |
|-----|-------------|---------|
| alerts target_datetime | קיים | ADD COLUMN IF NOT EXISTS |
| notes parent_datetime | קיים | ADD COLUMN IF NOT EXISTS |
| alerts general→NULL | הוחל | UPDATE 0 rows |
| alerts_target_type_check | קיים (חדש) | DROP+ADD (מחזיר אותו) |
| notes_parent_type_check | **חסר** (ה־ADD נכשל) | DROP, UPDATE 23, ADD |
| alerts_trigger_status rearmed | **חסר** (עצר לפני שלב 8) | DROP, ADD |

הרצה מחדש של הקובץ המלא תבצע את כל השלבים; השלבים שכבר הושלמו יהיו no-op או idempotent.

---

**log_entry | TEAM_20→TEAM_60 | G7R_STREAM1_NOTES_FIX | FIX_APPLIED | 2026-01-31**
