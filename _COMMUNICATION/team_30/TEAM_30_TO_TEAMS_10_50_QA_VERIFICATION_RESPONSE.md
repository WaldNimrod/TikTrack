# Team 30 → Teams 10 & 50: תגובה לאימות QA — MB3A Notes
**project_domain:** TIKTRACK

**from:** Team 30 (Frontend)  
**to:** Team 10 (The Gateway), Team 50 (QA)  
**date:** 2026-02-16  
**re:** TEAM_50_TO_TEAM_10_MB3A_NOTES_QA_REPORT — פריטים באחריות צד משתמש

---

## 1. הקשר

דוח Gate-A (Team 50) מציין: API 9/10, UI 0/13 (E2E ידני).  
הפריטים 1–13 הם באחריות Team 30 — צד המשתמש. מסמך זה מאשר טיפול ותיקונים.

---

## 2. תיקונים שבוצעו (תגובה לדוח)

### 2.1 טיפול בשגיאות העלאת קבצים

**בעיה:** בעת כשל 413/415/422 בהעלאת קובץ — הודעת השגיאה לא הייתה ברורה.

**תיקון:** מיפוי קודי שגיאה להודעות בעברית:
- **413** (Payload Too Large): "הקובץ חורג מ־1MB. ההערה נשמרה, אך העלאת הקובץ נכשלה."
- **415** (Unsupported Media Type): "סוג הקובץ לא נתמך. ההערה נשמרה, אך העלאת הקובץ נכשלה."
- **422** (מכסה): "מכסה של 3 קבצים להערה הושלמה. הסר קובץ כדי להוסיף אחר."

**קובץ:** `ui/src/views/data/notes/notesForm.js`

---

## 3. אימות עצמי — 13 פריטי UI

| # | בדיקה | אימות קוד | ציפייה |
|---|-------|------------|--------|
| 1 | פתיחת מודל הוספת הערה | `openNotesForm(null)` → createModal + createPhoenixRichTextEditor | ✅ |
| 2 | כפתורי שמירה/ביטול — צמד אחד | PhoenixModal footer; אין form-actions בטופס | ✅ |
| 3 | כותרת ריקה + תוכן — גזירה | `deriveTitleFromContent(content)` לפני שליחה | ✅ |
| 4 | כותרת מלאה — שמירה | `titleEl.value.trim()` נשלח כ-title | ✅ |
| 5 | העלאת קובץ — אייקון\|שם\|X | `notes-attachment-row`, `notes-attachment-icon`, `notes-attachment-remove` | ✅ |
| 6 | כפתור צרוף קובץ — מיקום | `notes-attachments-header` + `margin-inline-start: auto` | ✅ |
| 7 | טולבר — שורות 1+2 | `phoenix-rt-toolbar-row`, ROW1_STYLES, ROW2_ALIGN_LISTS | ✅ |
| 8 | כפתורי טולבר — אייקונים, פעיל | `phoenixRichTextToolbarConfig` ICONS; `is-active` ב-editor | ✅ |
| 9 | עריכה — מודל נטען, שמירה | `openNotesForm(noteId)` → GET + createFormHTML(data) | ✅ |
| 10 | כפתור שמירה — "שמירה" | `saveButtonText: 'שמירה'` (PhoenixModal default + notesForm) | ✅ |
| 11 | כפתור ביטול — "לבטל" | `cancelButtonText: 'לבטל'` (PhoenixModal default) | ✅ |
| 12 | Placeholder — "לבחור X" | cashFlows, tickers, userTicker, dataDashboard | ✅ |
| 13 | חשבון מסחר — טרמינולוגיה | notesForm, trading_accounts, brokersFees, HomePage | ✅ |

---

## 4. המלצה ל-Team 50

לאחר התיקונים — להריץ את checklist ה-E2E הידני  
(`documentation/05-REPORTS/artifacts/TEAM_50_MB3A_NOTES_QA_CHECKLIST_E2E.md`)  
ולסמן ✅/❌. במידת הצורך — Team 30 יקבל משוב ויתקן.

---

## 5. פריטים שאינם באחריות Team 30

| פריט | בעלים | הערה |
|------|--------|------|
| Fake MIME → 415 (כרגע 422) | Team 20 | מנדט D35 — MIME magic-bytes |
| נתיב אחסון AC5 | Team 60/20 | Evidence |

---

**log_entry | TEAM_30 | TO_TEAMS_10_50 | QA_VERIFICATION_RESPONSE | 2026-02-16**
