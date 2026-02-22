# Evidence — D35 Note Attachments (MB3A)
**project_domain:** TIKTRACK

**id:** TEAM_60_D35_NOTE_ATTACHMENTS_EVIDENCE  
**owner:** Team 60 (DevOps & Platform)  
**date:** 2026-02-15  
**מקור:** TEAM_10_TO_TEAM_60_D35_RICH_TEXT_ATTACHMENTS_MANDATE

---

## 1. Acceptance Criteria — אימות

| # | קריטריון | סטטוס | פרטים |
|---|-----------|--------|-------|
| 1 | Migration רץ — טבלת `user_data.note_attachments` קיימת; CHECK גודל פעיל | ✅ | `make migrate-d35-notes` — CREATE TABLE, INDEX, TRIGGER |
| 2 | נתיב דיסק תואם: `storage/uploads/users/{user_id}/notes/{note_id}/` | ✅ | `storage/uploads/` נוצר; .gitignore: storage/uploads/users/ |
| 3 | Cleanup — מתועדת מדיניות | ✅ | ON DELETE CASCADE ב-DB; Backend מוחק קבצים — TEAM_60_TO_TEAM_20_D35_NOTE_ATTACHMENTS_DDL_COORDINATION §4 |
| 4 | Evidence ב-05-REPORTS/artifacts | ✅ | קובץ זה |

---

## 2. Migration

**פקודה:** `make migrate-d35-notes`  
**קובץ:** `scripts/migrations/d35_note_attachments.sql`  
**תוצאה:** CREATE TABLE, CREATE INDEX (×2), CREATE FUNCTION, CREATE TRIGGER, COMMENT

**Constraint:** `file_size_bytes` CHECK (0 < size ≤ 1048576)  
**Trigger:** `tr_note_attachments_max_3` — max 3 attachments per note

---

## 3. Storage

**בסיס:** `storage/uploads/`  
**תבנית:** `users/{user_id}/notes/{note_id}/{attachment_id}_{safe_filename}`  
**הרשאות:** Backend יוצר תיקיות on-demand

---

## 4. תיאום Team 20

**מסמך:** `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_20_D35_NOTE_ATTACHMENTS_DDL_COORDINATION.md`

---

**log_entry | TEAM_60 | D35_NOTE_ATTACHMENTS_EVIDENCE | 2026-02-15**
