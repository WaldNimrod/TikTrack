# Team 10 → Team 50 | D35 Rich Text + Attachments — מנדט QA
**project_domain:** TIKTRACK

**משימת-על:** D35_RICH_TEXT_ATTACHMENTS_LOCK (MB3A)  
**מקור:** Team 90 Feedback Lock (D35 Notes); תוכנית: [TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md](TEAM_10_NOTES_ALERTS_MINI_BATCH_WORK_PLAN.md) §5  
**סטטוס:** מנדט פעיל — Gate-A חובה לפני Gate-B; סגירה רק עם Seal (SOP-013).

---

## היקף (Team 50 — QA)

- **תרחישי E2E ו־API מלאים** עבור D35 Notes: Rich Text, קבצים מצורפים, אבטחה.
- כיסוי: **קבצים פסולים**, **חריגת גודל**, **חריגת מכסה** (קובץ רביעי), **security regression** (XSS).

---

## Acceptance Criteria (מדידים — לוודא לסגירת Gate-A)

| # | קריטריון | אימות |
|---|-----------|--------|
| 1 | יצירה/עריכה של הערה עם Rich Text נשמרת ומוצגת **ללא XSS**. | E2E + regression אבטחה. |
| 2 | העלאה של **עד 3 קבצים** תקינים מצליחה; **קובץ רביעי נדחה**. | API + E2E. |
| 3 | קובץ **מעל 1MB** נדחה (413). | API test. |
| 4 | **סוג קובץ לא מורשה** נדחה (415); MIME (magic-bytes) מאומת. | API test עם קבצים מתחזים. |
| 5 | **נתיב אחסון** על הדיסק: `users/{user_id}/notes/{note_id}/...` (תואם תבנית). | אימות עם 60/20 לפי נגישות. |
| 6 | כל **חוזי השגיאה** 413, 415, 422, 403, 404 ממומשים ומתועדים. | רשימת בדיקות + דוח Gate-A. |

---

## תוצרים נדרשים

- **דוח Gate-A** (TEAM_50_TO_TEAM_10_*_NOTES_QA_REPORT או דומה) — כולל רשימת בדיקות וממצאים.
- **Seal (SOP-013)** — חסם יחיד לסגירת שער; דוח בלבד לא מספיק.

---

## הערת ממשל

אין מעבר Gate-B לפני: תוכנית מעודכנת + SSOT מעודכנים + מנדטים מעודכנים + **אישור Gate-A QA**.

**log_entry | TEAM_10 | D35_MANDATE | TO_TEAM_50 | 2026-02-15**
