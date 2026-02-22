# Team 10 → Team 30 | D35 Rich Text + Attachments — מנדט ביצוע
**project_domain:** TIKTRACK

**משימת-על:** D35_RICH_TEXT_ATTACHMENTS_LOCK (MB3A)  
**מקור:** Team 90 Feedback Lock (D35 Notes); תוכנית: [TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md](TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md) §5  
**סטטוס:** מנדט פעיל — אין Gate-B לפני עדכון תוכנית + SSOT + מנדטים + Gate-A QA.

---

## היקף (Team 30 — Frontend)

- **עורך Rich Text** בעמוד Notes (D35) — תצוגה/עריכה של `content` בהתאם למדיניות Rich Text.
- **העלאת קבצים** — UI להעלאת קבצים מצורפים להערה (עד 3 קבצים, עד 1MB כל אחד).
- **חסימות UI:** סוג קובץ לא מורשה, גודל מעל 1MB, מכסה מעל 3 — חסימה/הודעות ברורות (בתיאום עם תגובות API 413/415/422).

---

## חוזים (SSOT)

- **OpenAPI:** [OPENAPI_SPEC_V2.5.2_NOTES_ATTACHMENTS_ADDENDUM.yaml](../../documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2_NOTES_ATTACHMENTS_ADDENDUM.yaml).
- **Rich Text:** [RICH_TEXT_SANITIZATION_POLICY.md](../../api/utils/RICH_TEXT_SANITIZATION_POLICY.md) — שדה `notes.content`.
- סוגים מותרים: jpg, png, webp, pdf, xls, xlsx, doc, docx.

---

## Acceptance Criteria (מדידים)

| # | קריטריון | אימות |
|---|-----------|--------|
| 1 | **יצירה/עריכה** של הערה עם Rich Text **נשמרת ומוצגת** ללא XSS (תצוגה תואמת למדיניות). | E2E/Manual: שמירה וטעינה מחדש; אין script injection. |
| 2 | העלאת **עד 3 קבצים** תקינים מצליחה; **קובץ רביעי** — חסימה ב-UI או הודעת דחייה ברורה. | UI: כפתור מושבת/הודעה אחרי 3. |
| 3 | **קובץ מעל 1MB** — חסימה או הודעה ברורה לפני/אחרי שליחה. | UI/ E2E. |
| 4 | **סוג קובץ לא מורשה** — חסימה או הודעה ברורה. | UI: סינון לפי רשימת סוגים מותרים. |
| 5 | הודעות שגיאה מ-API (413/415/422) **מוצגות למשתמש** באופן ברור. | E2E/Manual. |

---

## סגירה

- דיווח ל־Team 10 עם Evidence (מסכים/בדיקות).
- **סגירה מלאה של D35 Lock רק עם Seal (SOP-013)** לאחר Gate-A QA.

**log_entry | TEAM_10 | D35_MANDATE | TO_TEAM_30 | 2026-02-15**
