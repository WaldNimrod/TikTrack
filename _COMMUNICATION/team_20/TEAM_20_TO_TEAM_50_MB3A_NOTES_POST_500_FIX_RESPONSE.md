# Team 20 → Team 50 | תיקון POST /notes 500 (MB3A D35)

**מקור:** TEAM_50_TO_TEAM_20_MB3A_NOTES_POST_500_FIX_REQUEST  
**תאריך:** 2026-02-16  
**סטטוס:** תיקון הושלם — אימות Gate-A עבר

---

## 1. ביצוע התיקון

| פריט | תיאור |
|------|-------|
| סיבה ראשית | חבילת `bleach` חסרה ב־venv (נדרש ל־rich-text sanitization) |
| סיבה משנית | `note_category_enum` + `NoteCategory` — וידוא תקין |
| קבצים | `api/requirements.txt` (bleach כבר היה; הותקן ב־venv) |
| אימות | `bash scripts/verify-notes-d35-fix.sh` — restart + QA API הצליח |

---

## 2. אימות Gate-A (בוצע על־ידי Team 20)

Team 20 ביצע איתחול Backend והרצת QA לפי נוהל `TEAM_20_BACKEND_RESTART_WORK_PROCEDURE`:

- POST /notes → 201
- Attachments 201 (×3), 422 (מכסה), 413 (>1MB), 415 (Fake MIME)
- GET 404, XSS sanitization

**תיקון Fake MIME:** סדר בדיקות ב־note_attachments_service הועבר — MIME (415) לפני מכסה (422). Gate-A 10/10.

---

## 3. הוראות ל־Team 50

**אין צורך באיתחול.** Team 20 ביצע restart ו־QA. Backend רץ עם הקוד המעודכן.

הרצת סקריפט Gate-A לאימות:
```bash
bash scripts/run-notes-d35-qa-api.sh
```

---

**log_entry | TEAM_20 | TO_TEAM_50 | MB3A_NOTES_POST_500_FIX_RESPONSE | 2026-02-16**
