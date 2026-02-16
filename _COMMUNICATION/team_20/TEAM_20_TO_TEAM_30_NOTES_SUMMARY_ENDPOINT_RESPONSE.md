# Team 20 → Team 30: תשובה — Notes Summary + tags (D35)

**from:** Team 20 (Backend)  
**to:** Team 30 (Frontend)  
**date:** 2026-02-16  
**re:** [TEAM_30_TO_TEAM_20_NOTES_SUMMARY_ENDPOINT_REQUEST.md](../team_30/TEAM_30_TO_TEAM_20_NOTES_SUMMARY_ENDPOINT_REQUEST.md)  
**מקור:** MB3A Notes (D35) — סקשן "סיכום מידע" בעמוד הערות

---

## 1. סיכום מימוש

הוספנו:
1. **GET /api/v1/notes/summary** — endpoint סיכום
2. **tags** ב־NoteResponse, NoteCreate, NoteUpdate — GET /notes, GET /notes/{id}

---

## 2. GET /api/v1/notes/summary

**Request:** `GET /api/v1/notes/summary`  
**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "total_notes": 24,
  "recent_notes": 3,
  "total_attachments": 5,
  "pinned_notes": 2,
  "notes_with_tags": 8,
  "notes_by_parent_type": {
    "ticker": 12,
    "trade": 6,
    "trade_plan": 0,
    "account": 0,
    "general": 6
  }
}
```

| שדה | מקור |
|-----|------|
| total_notes | ספירת הערות לא-מחוקות (`deleted_at IS NULL`) |
| recent_notes | 10 ימים אחרונים (`created_at >= NOW() - INTERVAL '10 days'`) |
| total_attachments | ספירת קבצים מצורפים (`note_attachments`) |
| pinned_notes | `is_pinned = true` |
| notes_with_tags | `tags` לא ריק (cardinality > 0) |
| notes_by_parent_type | לפי ticker, trade, trade_plan, account, general |

**הערה:** נתיב `/summary` מוגדר **לפני** `/{note_id}` ברוטר כדי למנוע conflate.

---

## 3. tags ב־NoteResponse / NoteCreate / NoteUpdate

| Endpoint | שינוי |
|----------|--------|
| GET /notes | NoteResponse כולל `tags: list[str] \| null` |
| GET /notes/{id} | NoteResponse כולל `tags` |
| POST /notes | NoteCreate כולל `tags` (אופציונלי) |
| PUT /notes/{id} | NoteUpdate כולל `tags` (אופציונלי) |

**פורמט tags:** מערך מחרוזות — למשל `["ניתוח", "AAPL"]`. ריק או null = אין תגיות.

---

## 4. קבצים שעודכנו

| קובץ | שינוי |
|------|--------|
| `api/schemas/notes.py` | NotesSummaryResponse, tags ב־NoteResponse / NoteCreate / NoteUpdate |
| `api/services/notes_service.py` | get_notes_summary(), tags ב־create/update/response |
| `api/routers/notes.py` | GET /summary (לפני /{note_id}) |

---

## 5. תגובות שגיאה (סיכום)

| Status | תיאור |
|--------|--------|
| 401 | Unauthorized — token חסר/לא תקף |
| 403 | Forbidden — אין הרשאה |
| 500 | שגיאת שרת |

---

**log_entry | TEAM_20 | TO_30 | NOTES_SUMMARY_ENDPOINT_RESPONSE | 2026-02-16**
