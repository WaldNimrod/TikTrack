# Team 20 → Team 30: History Backfill API — הודעת השלמה

**id:** `TEAM_20_TO_TEAM_30_HISTORY_BACKFILL_API_COMPLETE`  
**from:** Team 20 (Backend)  
**to:** Team 30 (UI), Team 10 (Gateway)  
**date:** 2026-01-31  
**מקור:** TEAM_30_TO_TEAM_20_HISTORY_BACKFILL_API_REQUEST

---

## 1. סיכום

הושלם מימוש **POST /api/v1/tickers/{ticker_id}/history-backfill** בהתאם לחוזה.

---

## 2. API — חוזה ממומש

### 2.1 Endpoint

| פריט | ערך |
|------|------|
| **Method** | `POST` |
| **Path** | `/api/v1/tickers/{ticker_id}/history-backfill` |
| **Auth** | Bearer token (get_current_user) |
| **Body** | `{}` (אופציונלי) |

### 2.2 תשובות

| Status | תיאור |
|--------|--------|
| **200 OK** | `completed` — backfill הושלם, `rows_inserted` > 0 |
| **200 OK** | `no_op` — לטיקר כבר 200+ שורות, אין צורך |
| **404** | טיקר לא נמצא |
| **409** | Backfill אחר רץ כעת (Single-Flight lock) |
| **502** | שגיאת Provider (Yahoo/Alpha) |
| **504** | Timeout (90 שניות) |

### 2.3 מבנה תשובה (200)

```json
{
  "ticker_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "symbol": "AAPL",
  "rows_inserted": 187,
  "status": "completed",
  "message": "History backfill completed — 187 rows inserted"
}
```

או `no_op`:

```json
{
  "ticker_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "symbol": "AAPL",
  "rows_inserted": 0,
  "status": "no_op",
  "message": "Ticker already has sufficient history"
}
```

### 2.4 התנהגות

- **Idempotent** — לא מכפיל שורות (skips existing dates)
- **Single-Flight** — lock file משותף עם `sync_ticker_prices_history_backfill.py`
- **Timeout** — 90 שניות לכל הפעולה

---

## 3. קבצים שנוספו/שונו

| קובץ | שינוי |
|------|-------|
| `api/routers/tickers.py` | Route `POST /{ticker_id}/history-backfill` |
| `api/services/history_backfill_service.py` | **חדש** — לוגיקת backfill ל־API |
| `api/schemas/tickers.py` | `HistoryBackfillResponse` |
| `scripts/sync_ticker_prices_history_backfill.py` | `ticker_exists()`, `get_ticker_symbol()` |

---

## 4. בקשות ל־Team 30

- **404** — טיקר לא נמצא → מומלץ: "טיקר לא נמצא" (לא "ממתין ל־API")
- **502** — שגיאת ספק → "שגיאת ספק נתונים — נסה שוב מאוחר יותר"
- **409** — backfill רץ → "Backfill אחר רץ כעת — נסה שוב בעוד דקה"
- **504** — timeout → "הפעלה נמשכת זמן רב — נסה שוב"

---

**log_entry | TEAM_20 | TO_TEAM_30 | HISTORY_BACKFILL_API_COMPLETE | 2026-01-31**
