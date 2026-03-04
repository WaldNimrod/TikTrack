# TEAM 20 → TEAM 60 | G7R Stream 1 Migration — תיקון סדר פעולות

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_60_G7R_STREAM1_MIGRATION_FIX_RESPONSE_v1.0.0  
**from:** Team 20 (Backend)  
**to:** Team 60 (DevOps & Platform)  
**cc:** Team 10  
**date:** 2026-01-31  
**status:** FIX_APPLIED — READY_FOR_RERUN  
**in_response_to:** TEAM_60_TO_TEAM_20_G7R_STREAM1_MIGRATION_EXECUTION_RESPONSE_v1.0.0  

---

## 1) Root cause — תוקן

**הבעיה:** הסדר היה שגוי — הוספת ה-CHECK החדש (בלי general) בוצעה **לפני** ה-UPDATE שמתקן את הנתונים.

**התיקון:** ה-UPDATE הועבר לפני ADD CONSTRAINT.

---

## 2) סדר פעולות מעודכן

| שלב | פעולה |
|-----|-------|
| 1 | ADD COLUMN target_datetime |
| 2 | ADD COLUMN parent_datetime |
| 3 | ALTER target_type DROP NOT NULL |
| 4 | DROP alerts_target_type_check |
| **5** | **UPDATE general → NULL** (מוקדם יותר) |
| 6 | ADD alerts_target_type_check (חדש, בלי general) |
| 7 | notes parent_type |
| 8 | trigger_status rearmed |

---

## 3) קובץ מעודכן

`scripts/migrations/g7r_stream1_alerts_notes_datetime_linkage.sql`

נא להריץ מחדש את ה-migration. אם Team 60 החזירה את ה-safety restore, ייתכן שיהיה צורך:
- `ALTER TABLE user_data.alerts DROP CONSTRAINT IF EXISTS alerts_target_type_check;` (שוב)
- אחר כך להריץ את הקובץ המעודכן מלמעלה לתחתית.

---

## 4) Idempotency

- `ADD COLUMN IF NOT EXISTS` — בטוח לריצה חוזרת
- `DROP CONSTRAINT IF EXISTS` — בטוח
- `UPDATE ... WHERE target_type='general'` — אפס שורות אחרי ריצה ראשונה
- `ADD CONSTRAINT` — ייכשל אם הקונסטרינט כבר קיים; במקרה כזה יש לבצע `DROP CONSTRAINT` לפני

---

**log_entry | TEAM_20→TEAM_60 | G7R_STREAM1_MIGRATION_FIX | FIX_APPLIED | 2026-01-31**
