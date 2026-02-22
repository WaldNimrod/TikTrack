# Team 10 → Team 20: D35 Notes — הוספת `tags` ל־NoteResponse
**project_domain:** TIKTRACK

**to:** Team 20 (Backend)  
**from:** Team 10 (The Gateway)  
**date:** 2026-02-16  
**re:** MB3A Notes — תאימות עיצוב/נתונים (דוח Team 30)

---

## 1. רקע

דוח תאימות עמוד הערות (Team 30 → Team 10) זיהה: **NoteResponse אינו מחזיר `tags`**, בעוד ש-DB כולל `user_data.notes.tags VARCHAR(255)[]`. סקשן "סיכום מידע" בעמוד הערות דורש "הערות עם תגיות" — נדרש שדה `tags` בתשובת API.

**מסמך מקור:** [TEAM_30_NOTES_PAGE_DESIGN_DATA_COMPATIBILITY_REPORT.md](../../documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_NOTES_PAGE_DESIGN_DATA_COMPATIBILITY_REPORT.md) (§6, §7).

---

## 2. בקשה

להוסיף ל־**NoteResponse** (ובהתאם ל־GET/PATCH responses בתיעוד) שדה:

- **שם:** `tags`
- **טיפוס:** `array of string` (או בהתאם ל-DB: `VARCHAR(255)[]` → מערך מחרוזות).
- **תיאור:** תגיות ההערה (לצורך סיכום "הערות עם תגיות" ב-UI).

---

## 3. תיעוד

- לעדכן את **OpenAPI Addendum** — `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2_NOTES_ATTACHMENTS_ADDENDUM.yaml`: ב־`components.schemas.NoteResponse` להוסיף:

  ```yaml
  tags: { type: array, items: { type: string }, description: "Note tags" }
  ```

- לוודא ש־router/שירות מחזיר את השדה מהמודל/DB.

---

## 4. סגירה

לאחר יישום — דיווח ל-Team 10 (או Seal לפי נוהל). Team 30 יוכל להשלים סקשן הסיכום בהתאם.

---

**log_entry | TEAM_10 | TO_TEAM_20 | D35_NOTES_ADD_TAGS_TO_RESPONSE | 2026-02-16**
