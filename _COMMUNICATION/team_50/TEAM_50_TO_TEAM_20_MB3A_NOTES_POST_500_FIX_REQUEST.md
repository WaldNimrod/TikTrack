# Team 50 → Team 20 | בקשת תיקון — POST /notes → 500 (MB3A D35)

**משימה:** MB3A Notes (D35) Gate-A  
**מקור:** TEAM_50_TO_TEAM_10_MB3A_NOTES_QA_REPORT  
**תאריך:** 2026-02-16

---

## תסמינים

- **Endpoint:** `POST /api/v1/notes`
- **תגובה:** HTTP 500, `{"detail":"Internal server error","error_code":"SERVER_ERROR"}`
- **תנאים:** איתחול בוצע (fix-env-after-restart, D35 migration); Login 200; Admin (TikTrackAdmin/4181).

---

## גוף הבקשה שנכשל

```json
{
  "parent_type": "general",
  "content": "<p>Test note for D35 QA</p>",
  "category": "GENERAL"
}
```

---

## פעולה נדרשת

1. איתור הסיבה ל-500 (לוגים: `logger.error` ב-global_exception_handler — `exc_info=True`).
2. תיקון — POST /notes חייב להחזיר 201 עם הערה נוצרת.
3. הודעה ל-Team 50 לאחר תיקון — הרצה חוזרת: `bash scripts/run-notes-d35-qa-api.sh`.

---

## קבצים רלוונטיים

- `api/routers/notes.py` — create_note
- `api/services/notes_service.py` — create_note
- `api/models/notes.py` — Note, note_category_enum

---

**log_entry | TEAM_50 | TO_TEAM_20 | MB3A_NOTES_POST_500_FIX_REQUEST | 2026-02-16**
