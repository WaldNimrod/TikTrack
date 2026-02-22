# Team 20 | POST /notes 500 — Evidence of Fix
**project_domain:** TIKTRACK

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

## 3. תוצאות Gate-A API (10/10 PASS)

```
✅ Admin Login OK
✅ POST /notes → 201
✅ POST attachment (valid JPEG) → 201
✅ POST attachment 2 → 201
✅ POST attachment 3 → 201
✅ POST attachment 4 (quota) → 422
✅ POST attachment (>1MB) → 413
✅ POST attachment (fake EXE/MIME) → 415
✅ GET /notes/{fake} → 404
✅ XSS sanitization — <script> removed from content
```

**תיקון Fake MIME (TEAM_50_TO_TEAM_10_MB3A_NOTES_QA_REPORT):** סדר בדיקות ב־upload_attachment הועבר — MIME (415) לפני מכסה (422).

---

**log_entry | TEAM_20 | MB3A_NOTES_POST_500_EVIDENCE | 2026-02-16**
