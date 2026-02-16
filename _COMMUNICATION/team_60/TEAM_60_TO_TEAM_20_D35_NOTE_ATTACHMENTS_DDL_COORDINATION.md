# Team 60 → Team 20: תיאום DDL — D35 Note Attachments

**id:** `TEAM_60_TO_TEAM_20_D35_NOTE_ATTACHMENTS_DDL_COORDINATION`  
**from:** Team 60 (DevOps & Platform)  
**to:** Team 20 (Backend)  
**date:** 2026-02-15  
**מקור:** TEAM_10_TO_TEAM_60_D35_RICH_TEXT_ATTACHMENTS_MANDATE; MB3A Notes (D35)

---

## 1. מטרת התיאום

תאום מבנה הטבלה `user_data.note_attachments` ונתיב אחסון לפני מימוש API. Migration בוצע.

---

## 2. מבנה טבלה — DDL

**טבלה:** `user_data.note_attachments`

| עמודה | טיפוס | הערות |
|-------|-------|-------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| note_id | UUID | NOT NULL, FK → user_data.notes(id) ON DELETE CASCADE |
| user_id | UUID | NOT NULL, FK → user_data.users(id) ON DELETE CASCADE |
| storage_path | VARCHAR(1024) | NOT NULL — נתיב יחסי ל-base |
| original_filename | VARCHAR(255) | NOT NULL |
| content_type | VARCHAR(128) | NOT NULL |
| file_size_bytes | BIGINT | NOT NULL, CHECK (0 < size ≤ 1048576) |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| created_by | UUID | NOT NULL, FK → user_data.users(id) |

**אינדקסים:** `idx_note_attachments_note_id`, `idx_note_attachments_user_id`.

**Trigger:** `tr_note_attachments_max_3` — אכיפה: max 3 קבצים להערה. Backend חייב גם לאכוף (ולידציה לפני INSERT).

**מיקום DDL:** `scripts/migrations/d35_note_attachments.sql`  
**הרצה:** `make migrate-d35-notes`

---

## 3. נתיב אחסון

**בסיס:** `storage/uploads/` (יחסית לשורש הפרויקט).

**תבנית:** `users/{user_id}/notes/{note_id}/{attachment_id}_{safe_filename}`

**נתיב מלא:** `storage/uploads/users/{user_id}/notes/{note_id}/{attachment_id}_{safe_filename}`

**הרשאות:** Backend יוצר תיקיות on-demand (os.makedirs exist_ok=True). תיקיית `storage/uploads/` נוצרה עם הרשאות כתיבה.

---

## 4. מדיניות ניקוי (Cleanup)

| אירוע | התנהגות |
|-------|---------|
| **מחיקת note** | DB: ON DELETE CASCADE — רשומות note_attachments נמחקות אוטומטית. Backend: מוחק קבצים פיזיים בנתיב `users/{user_id}/notes/{note_id}/` |
| **מחיקת attachment** | Backend מוחק שורה מ-note_attachments + קובץ פיזי |
| **טריגר DB** | max 3 — דחיית INSERT רביעי |

**תיאום:** Team 20 מממש לוגיקת מחיקה — קודם DB, אחר כך קובץ פיזי. נתיב הקובץ ב־`storage_path`.

---

## 5. חוזים (OpenAPI)

- **413** Payload Too Large — קובץ > 1MB  
- **415** Unsupported Media Type — MIME לא מורשה (magic-bytes)  
- **422** — מכסה (קובץ רביעי), ולידציה  
- **403** / **404** — Forbidden / Not Found  

**מקור:** `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2_NOTES_ATTACHMENTS_ADDENDUM.yaml`

---

## 6. מסמכים

| מסמך | נתיב |
|------|------|
| DDL | documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_NOTES_ATTACHMENTS_DDL.sql |
| Migration | scripts/migrations/d35_note_attachments.sql |
| מנדט Team 60 | TEAM_10_TO_TEAM_60_D35_RICH_TEXT_ATTACHMENTS_MANDATE.md |
| מנדט Team 20 | TEAM_10_TO_TEAM_20_D35_RICH_TEXT_ATTACHMENTS_MANDATE.md |
| Work Plan §5 | TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md |

---

**log_entry | TEAM_60 | TO_TEAM_20 | D35_NOTE_ATTACHMENTS_DDL_COORDINATION | 2026-02-15**
