# Team 10 → Team 60 | D35 Rich Text + Attachments — מנדט תשתית/DB

**משימת-על:** D35_RICH_TEXT_ATTACHMENTS_LOCK (MB3A)  
**מקור:** Team 90 Feedback Lock (D35 Notes); תוכנית: [TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md](TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md) §5  
**סטטוס:** מנדט פעיל — אין Gate-B לפני עדכון תוכנית + SSOT + מנדטים + Gate-A QA.

---

## היקף (Team 60 — DB/Infra)

- **Migration:** הרצת DDL לטבלת `user_data.note_attachments` (CHECK גודל, אינדקסים); מנגנון אכיפה ל־max 3 attachments per note באפליקציה (אופציונלי: trigger ב-DB).
- **נתיב אחסון בפועל:** `storage/uploads/users/{user_id}/notes/{note_id}/` — הרשאות כתיבה, יצירת תיקיות לפי תבנית.
- **מדיניות ניקוי (cleanup):** מחיקת קבצים עם מחיקת הערה/attachment (תיאום עם Backend).

---

## חוזים (SSOT)

- **DDL:** [PHX_DB_SCHEMA_V2.5_NOTES_ATTACHMENTS_DDL.sql](../../documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_NOTES_ATTACHMENTS_DDL.sql) — טבלת `note_attachments`, `file_size_bytes` CHECK (≤ 1048576), אינדקסים.

---

## Acceptance Criteria (מדידים)

| # | קריטריון | אימות |
|---|-----------|--------|
| 1 | **Migration רץ** — טבלת `user_data.note_attachments` קיימת; CHECK גודל פעיל. | ריצת migration; בדיקת constraint. |
| 2 | **נתיב דיסק** תואם: `storage/uploads/users/{user_id}/notes/{note_id}/` עם הרשאות כתיבה נכונות. | אימות נתיב והרשאות בסביבת יעד. |
| 3 | **Cleanup:** עם מחיקת note או attachment — קבצים פיזיים מתנקים (או מתועדת מדיניות). | תיעוד/סקריפט; תיאום עם Team 20. |
| 4 | Evidence ב־`05-REPORTS/artifacts` (או מקום מאושר) — migration + נתיב. | קובץ Evidence. |

---

## סגירה

- דיווח ל־Team 10 עם Evidence (מיקום migration, נתיב, הרשאות).
- **סגירה מלאה של D35 Lock רק עם Seal (SOP-013)** לאחר Gate-A QA.

**log_entry | TEAM_10 | D35_MANDATE | TO_TEAM_60 | 2026-02-15**
