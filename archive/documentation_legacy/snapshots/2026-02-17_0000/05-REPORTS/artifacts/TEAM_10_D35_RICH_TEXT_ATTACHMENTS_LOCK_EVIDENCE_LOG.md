# Evidence Log — D35 Rich Text + Attachments Lock (MB3A)

**משימת-על:** D35_RICH_TEXT_ATTACHMENTS_LOCK  
**מקור:** Team 90 Feedback Lock (D35 Notes)  
**תאריך:** 2026-02-15  
**owner:** Team 10 (The Gateway)

---

## סיכום ביצוע

עדכון **תוכנית ביצוע + SSOT + מנדטים** לפי הנעילה (Feedback Lock) ל-D35 Notes: Rich Text ב־content, מנגנון קבצים מצורפים (עד 3 קבצים/הערה, 1MB/קובץ), MIME magic-bytes, נתיב אחסון לוק.

---

## SSOT שעודכנו

| פריט | מיקום | תוכן |
|------|--------|------|
| DDL | `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_NOTES_ATTACHMENTS_DDL.sql` | טבלת `user_data.note_attachments`, CHECK `file_size_bytes` ≤ 1048576, אינדקסים; max 3 באפליקציה |
| OpenAPI | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2_NOTES_ATTACHMENTS_ADDENDUM.yaml` | endpoints ל־notes ו־notes/{id}/attachments; 413, 415, 422, 403, 404 |
| Rich Text | `api/utils/RICH_TEXT_SANITIZATION_POLICY.md` | שדה `notes.content` נוסף לטבלת שדות מושפעים |
| Index | `documentation/00-MANAGEMENT/00_MASTER_INDEX.md` | הפניה ל-D35 Notes Attachments + Rich Text lock |

---

## תוכנית ומשימות

| מסמך | עדכון |
|------|--------|
| `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md` | שורה D35_RICH_TEXT_ATTACHMENTS_LOCK; MB3A-NOTES כפוף ל-D35 Lock; log_entry |
| `_COMMUNICATION/team_10/TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md` | §5 — D35 Feedback Lock, פירוק תתי-משימות DB/API/UI/QA/KP, AC מדידים |

---

## מנדטים שהופצו

| צוות | קובץ |
|------|------|
| 20 | TEAM_10_TO_TEAM_20_D35_RICH_TEXT_ATTACHMENTS_MANDATE.md |
| 30 | TEAM_10_TO_TEAM_30_D35_RICH_TEXT_ATTACHMENTS_MANDATE.md |
| 50 | TEAM_10_TO_TEAM_50_D35_RICH_TEXT_ATTACHMENTS_MANDATE.md |
| 60 | TEAM_10_TO_TEAM_60_D35_RICH_TEXT_ATTACHMENTS_MANDATE.md |

---

## Acceptance Criteria לסגירה (חוזים)

- יצירה/עריכה של הערה עם Rich Text נשמרת ומוצגת ללא XSS.
- העלאה של עד 3 קבצים תקינים מצליחה; קובץ רביעי נדחה.
- קובץ מעל 1MB נדחה.
- סוג קובץ לא מורשה נדחה.
- נתיב אחסון: `storage/uploads/users/{user_id}/notes/{note_id}/{attachment_id}_{safe_filename}`.
- כל החוזים מעודכנים ב־SSOT + OpenAPI; Evidence מלא.
- סגירה רק עם Seal (SOP-013); אין Gate-B לפני תוכנית + SSOT + מנדטים + Gate-A QA.

---

## תיקונים לאחר בדיקה (לפני Gate-B / אישור אדריכלית)

| ממצא | תיקון |
|------|--------|
| **P1** סתירה enum קטגוריות OpenAPI vs DB | OpenAPI Addendum יושר ל-DB SSOT: `TRADE`, `PSYCHOLOGY`, `ANALYSIS`, `GENERAL` (הוסרו RESEARCH, WATCHLIST). |
| **P1** Rich Text ל-notes.content לא בקוד | `is_rich_text_field()` עודכן לכלול `content`; docstring ב-`rich_text_sanitizer.py` עודכן. |
| **P2** מגבלת 3 קבצים לא נאכפת ב-DB | נוסף trigger `check_note_attachment_count()` + `tr_note_attachments_max_3` (BEFORE INSERT). Backend חייב גם לאכוף. |
| **P3** הפניה ל-SSOT לא קיים ב-DDL | הוחלף ל: Work Plan §5 + Evidence log (נתיבים קיימים). |

**log_entry | TEAM_10 | EVIDENCE | D35_CORRECTIONS_PRE_GATE_B | 2026-02-15**

---

**log_entry | TEAM_10 | EVIDENCE | D35_RICH_TEXT_ATTACHMENTS_LOCK | 2026-02-15**
