# Team 30 → Team 20: בקשת מימוש — API להפעלת History Backfill לטיקר

**id:** `TEAM_30_TO_TEAM_20_HISTORY_BACKFILL_API_REQUEST`  
**from:** Team 30 (UI)  
**to:** Team 20 (Backend)  
**date:** 2026-01-31  
**מקור:** TEAM_20_TO_TEAM_30_INDICATORS_DATA_INTEGRITY_UPDATE; backfill banner + כפתור "הפעל History Backfill"

---

## 1. הקשר

בעמוד **ניהול טיקרים** — בקרת תקינות נתונים — כאשר טיקר נבחר ותוצאת הבדיקה מצביעה על חוסר היסטוריה (200+ שורות נדרשות ל־ATR/MA/CCI), מוצגת הודעה **"נדרש History Backfill ל־ATR/MA/CCI"** וכפתור **"הפעל History Backfill"**.

**צד הלקוח (Team 30):** הושלם — הכפתור קורא ל־API להלן.  
**צד השרת (Team 20):** נדרש מימוש.

---

## 2. API נדרש — חוזה (Contract)

### 2.1 Endpoint

| פריט | ערך |
|------|------|
| **Method** | `POST` |
| **Path** | `/api/v1/tickers/{ticker_id}/history-backfill` |
| **Auth** | Bearer token (get_current_user) — כמו data-integrity |
| **Body** | `{}` (אופציונלי / ריק) |

### 2.2 Response — הצלחה (200 OK)

```json
{
  "ticker_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "symbol": "AAPL",
  "rows_inserted": 187,
  "status": "completed",
  "message": "History backfill completed — 187 rows inserted"
}
```

**שדות מומלצים:**
- `ticker_id` / `symbol` — זיהוי הטיקר
- `rows_inserted` — כמה שורות נוספו (או 0 אם כבר מספיק)
- `status` — `completed` | `no_op` | `failed`
- `message` — הודעה טקסטואלית

### 2.3 Response — ללא צורך (200 OK)

כאשר לטיקר כבר יש 200+ שורות — לא נדרש backfill:

```json
{
  "ticker_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "symbol": "AAPL",
  "rows_inserted": 0,
  "status": "no_op",
  "message": "Ticker already has sufficient history"
}
```

### 2.4 Response — שגיאות

| Status | תיאור |
|--------|--------|
| **404** | טיקר לא נמצא |
| **400** | טיקר כבר מספיק היסטוריה אך לוגיקה אחרת נכשלה |
| **409** | Backfill אחר רץ כעת (Single-Flight lock) |
| **502** | שגיאת Provider (Yahoo/Alpha) |

### 2.5 התנהגות צפויה

- **Idempotent** — אפשר להפעיל שוב; לא יכפיל שורות
- **Single-Flight** — lock file כמו בסקריפט — אם backfill רץ ברקע, להחזיר 409
- **ללא חסימת UI** — אם הפעולה לוקחת זמן, לשקול:
  - sync (חסרונות: timeout) או
  - async + polling / webhook (מתקדם)

**מינימום למימוש:** sync — הפעלה ישירה עד לסיום. Timeout של 60–120 שניות סביר.

---

## 3. מה Team 30 מימש (לקוח)

| פריט | מימוש |
|------|--------|
| **כפתור** | "הפעל History Backfill" — בתוך באנר התקינות, מוצג רק כאשר `indicators` ריק או `history_250d.gap_status === "INSUFFICIENT"` |
| **קריאה** | `POST /tickers/{ticker_id}/history-backfill` עם body `{}` |
| **Loading** | כפתור: "מריץ..." + disabled |
| **הצלחה** | רענון אוטומטי של תוצאות (doCheck) |
| **כישלון 404/501** | הודעת "ממתין ל־API — נא לפנות ל־Team 20" |
| **קבצים** | `tickersDataIntegrityInit.js`, `D15_DASHBOARD_STYLES.css` |

---

## 4. מקורות ל־Team 20

| קובץ | תיאור |
|------|--------|
| `scripts/sync_ticker_prices_history_backfill.py` | לוגיקת backfill קיימת; `load_ticker_by_id_for_backfill`, `fetch_history_for_ticker`, `insert_history_rows` |
| `TEAM_20_TO_TEAM_60_HISTORY_BACKFILL_COORDINATION_REQUEST.md` | סקריפט, providers, lock |
| `documentation/01-ARCHITECTURE/MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC.md` | 250d, 200 rows minimum |

---

## 5. גבולות אחריות

| צוות | אחריות |
|------|--------|
| **Team 30** | UI, כפתור, קריאת API, טיפול בתשובות |
| **Team 20** | API endpoint, לוגיקת backfill, providers, DB |

---

**log_entry | TEAM_30 | TO_TEAM_20 | HISTORY_BACKFILL_API_REQUEST | 2026-01-31**
