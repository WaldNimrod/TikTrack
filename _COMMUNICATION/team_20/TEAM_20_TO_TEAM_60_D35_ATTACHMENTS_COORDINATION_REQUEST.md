# Team 20 → Team 60 | D35 Attachments — תיאום נדרש
**project_domain:** TIKTRACK

**id:** TEAM_20_TO_TEAM_60_D35_ATTACHMENTS_COORDINATION_REQUEST  
**from:** Team 20 (Backend)  
**to:** Team 60 (DevOps & Platform)  
**date:** 2026-01-31  
**מקור:** TEAM_10_TO_TEAM_60_D35_RICH_TEXT_ATTACHMENTS_MANDATE

---

## 1. מה מומש (Team 20)

- API ל־notes ו־note_attachments מלא.
- ולידציות MIME (magic-bytes), גודל (1MB), מכסה (3).
- נתיב אחסון: `{STORAGE_UPLOADS_BASE}/users/{user_id}/notes/{note_id}/{attachment_id}_{safe_filename}`

---

## 2. מה נדרש מ-Team 60

### 2.1 Migration

**קובץ:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_NOTES_ATTACHMENTS_DDL.sql`

- הרצת ה-DDL ליצירת `user_data.note_attachments`
- Trigger: `check_note_attachment_count` (מקסימום 3 להערה)
- עד שהמיגרציה רצה — endpoints של attachments מחזירים שגיאה (טבלה חסרה)

### 2.2 נתיב אחסון

- **Env:** `STORAGE_UPLOADS_BASE` (ברירת מחדל: `storage/uploads` ביחס ל-project root)
- **דרישה:** תיקייה עם הרשאות כתיבה; Backend יוצר תתי-תיקיות (`users/{user_id}/notes/{note_id}/`)

### 2.3 אופציונלי

- מדיניות ניקוי (retention) לקבצים ישנים — לפי מדיניות פרויקט.

---

## 3. אחרי המיגרציה

- POST `/notes/{note_id}/attachments` יפעל כרגיל
- הקבצים יישמרו בנתיב המוגדר

**log_entry | TEAM_20 | TO_TEAM_60 | D35_COORDINATION_REQUEST | 2026-01-31**
