# Team 10 → Team 20 | D35 Rich Text + Attachments — מנדט ביצוע
**project_domain:** TIKTRACK

**משימת-על:** D35_RICH_TEXT_ATTACHMENTS_LOCK (MB3A)  
**מקור:** Team 90 Feedback Lock (D35 Notes); תוכנית: [TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md](TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md) §5  
**סטטוס:** מנדט פעיל — אין Gate-B לפני עדכון תוכנית + SSOT + מנדטים + Gate-A QA.

---

## היקף (Team 20 — Backend)

- מודל/שירות/ראוטים ל־**attachments** (Notes).
- **ולידציות:** MIME אמיתי (magic-bytes), גודל קובץ (≤ 1MB), מכסה (עד 3 קבצים להערה).
- **סניטיזציה:** שדה `notes.content` חייב לעבור Rich Text sanitization בצד שרת (מנגנון קיים — `api/utils/rich_text_sanitizer.py`, [RICH_TEXT_SANITIZATION_POLICY.md](../../api/utils/RICH_TEXT_SANITIZATION_POLICY.md)).

---

## חוזים (SSOT)

- **OpenAPI:** [OPENAPI_SPEC_V2.5.2_NOTES_ATTACHMENTS_ADDENDUM.yaml](../../documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2_NOTES_ATTACHMENTS_ADDENDUM.yaml) — endpoints ל־notes ו־notes/{id}/attachments; חוזי שגיאה **413, 415, 422, 403, 404**.
- **DB:** [PHX_DB_SCHEMA_V2.5_NOTES_ATTACHMENTS_DDL.sql](../../documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_NOTES_ATTACHMENTS_DDL.sql) — טבלת `user_data.note_attachments`, CHECK גודל.

---

## Acceptance Criteria (מדידים)

| # | קריטריון | אימות |
|---|-----------|--------|
| 1 | יצירה/עריכה של הערה עם Rich Text נשמרת ומוצגת **ללא XSS** (content מסונן בשרת). | בדיקת round-trip + בדיקת XSS (Team 50). |
| 2 | העלאה של **עד 3 קבצים** תקינים מצליחה; **קובץ רביעי נדחה** (422). | API test: 4th upload returns 422. |
| 3 | קובץ **מעל 1MB נדחה** (413). | API test: file > 1048576 bytes → 413. |
| 4 | **סוג קובץ לא מורשה** נדחה (415); ולידציה לפי **MIME (magic-bytes)** לא רק סיומת. | API test: e.g. .exe או קובץ עם סיומת מותרת אך MIME שונה → 415. |
| 5 | **נתיב אחסון** נכתב בדיוק: `storage/uploads/users/{user_id}/notes/{note_id}/{attachment_id}_{safe_filename}`. | לוג/DB או בדיקת filesystem. |
| 6 | כל חוזי השגיאה **413, 415, 422, 403, 404** ממומשים לפי OpenAPI. | תיעוד/בדיקות API. |

---

## סגירה

- דיווח ל־Team 10 עם Evidence (כתובת קבצים/בדיקות).
- **סגירה מלאה של D35 Lock רק עם Seal (SOP-013)** לאחר Gate-A QA.

**log_entry | TEAM_10 | D35_MANDATE | TO_TEAM_20 | 2026-02-15**
