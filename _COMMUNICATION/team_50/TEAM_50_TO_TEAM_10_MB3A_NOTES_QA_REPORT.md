# Team 50 → Team 10: דוח Gate-A — MB3A Notes (D35)

**from:** Team 50 (QA & Fidelity)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-16  
**מקור:** TEAM_10_MB3A_NOTES_ALERTS_CONTEXT_AND_ACTIVATION_PROMPTS, TEAM_10_TO_TEAM_50_D35_RICH_TEXT_ATTACHMENTS_MANDATE  
**קלט:** TEAM_30_MB3A_NOTES_IMPLEMENTATION_SUMMARY_REPORT, TEAM_20_TO_TEAM_10_SESSION_SUMMARY_AND_VERIFICATION

---

## 1. היקף Gate-A

תרחישי D35: Rich Text, קבצים מצורפים (עד 3, 1MB), MIME magic-bytes, סניטיזציה XSS, חוזי שגיאה 413/415/422/403/404.  
בנוסף: רשימת בדיקות UI מ-Team 30 (13 פריטים — טופס, טולבר, סטנדרטים).

---

## 2. Acceptance Criteria (מנדט D35) — מיפוי

| # | קריטריון | אימות | סטטוס |
|---|-----------|--------|-------|
| 1 | Rich Text נשמר ומוצג **ללא XSS** | E2E + API | סקריפט API מוכן; E2E ידני |
| 2 | עד 3 קבצים תקינים; **קובץ רביעי נדחה** | API + E2E | סקריפט API מוכן |
| 3 | קובץ **>1MB** נדחה (413) | API | סקריפט API מוכן |
| 4 | **סוג קובץ לא מורשה** נדחה (415); MIME magic-bytes | API | סקריפט API מוכן |
| 5 | נתיב אחסון `users/{user_id}/notes/{note_id}/...` | אימות 60/20 | תלוי Evidence |
| 6 | חוזי שגיאה 413, 415, 422, 403, 404 | רשימת בדיקות | סקריפט API מוכן |

---

## 3. סקריפט API

**קובץ:** `scripts/run-notes-d35-qa-api.sh`  
**הרצה:** `bash scripts/run-notes-d35-qa-api.sh`

**בדיקות:**
- Admin Login
- POST /notes → 201 (יצירת הערה)
- POST attachment (JPEG תקין) → 201 (×3)
- POST attachment 4 → 422 (מכסה)
- POST attachment >1MB → 413
- POST attachment fake EXE (MIME) → 415
- GET /notes/{fake_uuid} → 404
- XSS — POST עם `<script>` → תוכן מסונן בתשובה

**דרישה:** Backend 8082, Admin (TikTrackAdmin/4181), מיגרציה D35 (note_attachments) רצה.

---

## 4. טבלת סיכום — רמזור

### 4.1 D35 API

| סעיף | רמזור | הערות |
|------|-------|-------|
| Admin Login | 🟢 | 200 |
| POST /notes (create) | 🟡 | 500 — חסום; ייתכן סביבה/מיגרציה |
| Attachments 413/415/422/404 | 🟡 | תלוי create — סקריפט מוכן |
| XSS sanitization | 🟡 | תלוי create |
| נתיב אחסון (AC5) | 🟡 | תלוי Evidence 60/20 |

### 4.2 רשימת בדיקות UI (Team 30)

| # | בדיקה | רמזור | הערות |
|---|-------|-------|-------|
| 1 | פתיחת מודל הוספת הערה | 🟡 | E2E ידני |
| 2 | כפתורי שמירה/ביטול — צמד אחד | 🟡 | E2E ידני |
| 3 | כותרת ריקה + תוכן — גזירה | 🟡 | E2E ידני |
| 4 | כותרת מלאה — שמירה | 🟡 | E2E ידני |
| 5 | העלאת קובץ — שורה אייקון\|שם\|X | 🟡 | E2E ידני |
| 6 | כפתור צרוף קובץ — מיקום | 🟡 | E2E ידני |
| 7 | טולבר — שורות 1+2 | 🟡 | E2E ידני |
| 8 | כפתורי טולבר — אייקונים, פעיל | 🟡 | E2E ידני |
| 9 | עריכה — מודל נטען, שמירה | 🟡 | E2E ידני |
| 10 | כפתור שמירה — "שמירה" | 🟡 | E2E ידני |
| 11 | כפתור ביטול — "לבטל" | 🟡 | E2E ידני |
| 12 | Placeholder — "לבחור X" | 🟡 | E2E ידני |
| 13 | חשבון מסחר — טרמינולוגיה | 🟡 | E2E ידני |

---

## 5. אחוז הצלחה

**API:** 1/10 (10%) — Login עבר; create הערה החזיר 500.  
**UI:** 0/13 (0%) — לא הורצה E2E.  
**סה"כ Gate-A:** PARTIAL — סקריפט מוכן; הרצה מלאה תלויה ב־Backend (create note).

---

## 6. התקדמות מול בדיקה קודמת

| מדד | קודם | נוכחי | שינוי |
|-----|------|-------|-------|
| אחוז הצלחה API | — | 10% | ראשון |
| סקריפט D35 | — | מוכן | נוצר |
| E2E ידני | — | לא הורצה | — |

---

## 7. המלצות

1. **Team 20/60:** אימות פתרון 500 ב-POST /notes (create) — מיגרציה, סכמה, env.
2. **הרצה חוזרת:** לאחר תיקון — `bash scripts/run-notes-d35-qa-api.sh`.
3. **E2E:** ביצוע ידני של 13 הפריטים מ-Team 30 — רשימה ב-`TEAM_30_MB3A_NOTES_IMPLEMENTATION_SUMMARY_REPORT.md` §4.
4. **Evidence נתיב אחסון:** תיאום 60/20 — אימות `users/{user_id}/notes/{note_id}/...`.

---

## 8. Seal (SOP-013)

---
--- PHOENIX TASK SEAL ---
TASK_ID: MB3A-NOTES-GATE-A
STATUS: PARTIAL
FILES_CREATED:
  - scripts/run-notes-d35-qa-api.sh
PRE_FLIGHT: BLOCKED (POST /notes → 500)
BLOCKER: Create note returns 500; full API run requires fix. UI E2E — manual checklist ready.
HANDOVER_PROMPT: "לאחר תיקון create note — הרצת scripts/run-notes-d35-qa-api.sh ואימות 13 פריטי UI. Gate-B רק אחרי Gate-A PASS."
--- END SEAL ---
---

**הערה:** Gate-A במצב **PARTIAL**. סקריפט API מוכן; דרוש תיקון 500 ב-create note להשלמת אימות. רשימת E2E ידנית מצורפת.

---

**log_entry | TEAM_50 | TO_TEAM_10 | MB3A_NOTES_QA_REPORT | 2026-02-16**
