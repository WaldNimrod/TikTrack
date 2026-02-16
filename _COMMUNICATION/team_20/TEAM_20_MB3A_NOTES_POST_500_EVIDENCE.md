# Team 20 | POST /notes 500 — Evidence of Fix

**משימה:** MB3A Notes D35 — תיקון Gate-A  
**מקור:** TEAM_50_TO_TEAM_20_MB3A_NOTES_POST_500_FIX_REQUEST  
**תאריך:** 2026-02-16

---

## 1. סיכום

| פריט | תוצאה |
|------|-------|
| סיבה | חבילת `bleach` חסרה ב־venv (D35 rich-text sanitization) |
| תיקון | `pip install -r api/requirements.txt`; אימות enum תקין |
| אימות | `verify-notes-d35-fix.sh` — PASS |

---

## 2. נוהל חדש

- **TEAM_20_BACKEND_RESTART_WORK_PROCEDURE** — חובה לאתחל Backend אחרי שינוי קוד; Team 20 מבצע restart, לא Team 50
- **verify-notes-d35-fix.sh** — restart + QA; מבטיח התקנת requirements לפני הפעלה

---

## 3. תוצאות Gate-A API

```
✅ Admin Login OK
✅ POST /notes → 201 (note_id=83703881-6a04-4daa-bc79-e248dfe672dd)
✅ POST attachment (valid JPEG) → 201
✅ POST attachment 2 → 201
✅ POST attachment 3 → 201
✅ POST attachment 4 (quota) → 422
✅ POST attachment (>1MB) → 413
⚠️ Fake MIME → 422 (expected 415)
✅ GET /notes/{fake} → 404
✅ XSS sanitization — <script> removed from content
```

---

**log_entry | TEAM_20 | MB3A_NOTES_POST_500_EVIDENCE | 2026-02-16**
