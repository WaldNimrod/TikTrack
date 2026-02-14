# Team 20 → Teams 10 & 30: בקרת תקינות נתוני טיקר — בקשת מימוש UI

**id:** `TEAM_20_TO_TEAMS_10_30_TICKER_DATA_INTEGRITY_UI_REQUEST`  
**from:** Team 20 (Backend)  
**to:** Team 10 (Gateway), Team 30 (UI)  
**date:** 2026-02-14  
**מקור:** בקשה לבקרה ובדיקת תקינות נתונים בעמוד ניהול טיקרים

---

## 1. הקשר

נדרש ממשק בעמוד **ניהול טיקרים** (`tickers.html`) המאפשר:
- **בחירת טיקר** — דרופדאון מרשימת הטיקרים במערכת  
- **פירוט נתונים** — הצגת הנתונים הקיימים והחוסרים עבור הטיקר הנבחר  
- **מידע נוסף** — מתי עודכן, לוג עדכונים אחרונים  

**מטרה:** בקרה ובדיקה — לאפשר למשתמש לאמת תקינות נתוני market data לטיקר ספציפי.

---

## 2. מה Team 20 מספק (הושלם)

### 2.1 API Endpoint

| פריט | ערך |
|------|------|
| **Method** | `GET` |
| **Path** | `/api/v1/tickers/{ticker_id}/data-integrity` |
| **Auth** | Bearer token (get_current_user) |
| **Response** | `TickerDataIntegrityResponse` (JSON) |

### 2.2 מבנה התשובה

```json
{
  "ticker_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "symbol": "AAPL",
  "company_name": "Apple Inc.",

  "eod_prices": {
    "row_count": 5,
    "latest_price_timestamp": "2026-01-31T22:00:00Z",
    "latest_fetched_at": "2026-01-31T22:05:00Z",
    "has_data": true,
    "gap_status": "OK",
    "note": null
  },

  "intraday_prices": {
    "row_count": 0,
    "latest_price_timestamp": null,
    "latest_fetched_at": null,
    "has_data": false,
    "gap_status": "NO_DATA",
    "note": "Active tickers only"
  },

  "history_250d": {
    "row_count": 5,
    "latest_price_timestamp": "2026-01-31T22:00:00Z",
    "latest_fetched_at": "2026-01-31T22:05:00Z",
    "has_data": true,
    "gap_status": "INSUFFICIENT",
    "note": "נדרש מינימום 200 שורות"
  },

  "gaps_summary": [
    "היסטוריה 250d: 5 שורות (נדרש 200+ ל־ATR/MA/CCI)"
  ],

  "last_updates": [
    {
      "price_timestamp": "2026-01-31T22:00:00Z",
      "fetched_at": "2026-01-31T22:05:00Z",
      "price": "255.78"
    }
  ]
}
```

### 2.3 שדות והסברים

| שדה | תיאור |
|-----|--------|
| `eod_prices` | נתוני EOD — ticker_prices (מחיר יומי) |
| `intraday_prices` | נתוני Intraday — ticker_prices_intraday (Active בלבד) |
| `history_250d` | היסטוריה 250 ימים — נדרש ל־Indicators (ATR/MA/CCI) |
| `gap_status` | `OK` \| `NO_DATA` \| `INSUFFICIENT` \| `STALE` |
| `gaps_summary` | רשימת חוסרים בעברית (להצגה ישירה) |
| `last_updates` | 5 העדכונים האחרונים (price_timestamp, fetched_at, price) |

### 2.4 רשימת טיקרים (דרופדאון)

**קיים:** `GET /api/v1/tickers` — מחזיר רשימת טיקרים עם `id`, `symbol`, `company_name`.  
**שימוש:** לטעינת הדרופדאון — `id` נשלח ל־`/tickers/{id}/data-integrity`.

---

## 3. בקשה ל־Team 30 (UI)

### 3.1 מיקום

**עמוד:** ניהול טיקרים — `ui/src/views/management/tickers/tickers.html`  
**מיקום:** **בקונטיינר העליון** — `tt-section data-section="summary"` (סיכום מידע) — או כ־widget חדש מעל/בתוך האזור העליון.

### 3.2 רכיבים נדרשים

| רכיב | תיאור |
|------|--------|
| **Dropdown** | `<select>` / combobox — בחירת טיקר מתוך רשימת הטיקרים (מ־GET /tickers) |
| **כפתור "בדוק"** | טריגר קריאה ל־GET /tickers/{id}/data-integrity |
| **פירוט נתונים** | הצגת eod_prices, intraday_prices, history_250d — סטטוס, כמות, תאריכים |
| **חוסרים (gaps)** | הצגת `gaps_summary` — אם ריק: "אין חוסרים" |
| **לוג עדכונים** | טבלה/רשימה של `last_updates` — תאריך מחיר, מתי נטען, ערך |

### 3.3 דוגמת UX

```
┌─────────────────────────────────────────────────────────┐
│ בקרת תקינות נתונים                                      │
├─────────────────────────────────────────────────────────┤
│ [בחר טיקר ▼]  [AAPL - Apple Inc.]        [בדוק]        │
├─────────────────────────────────────────────────────────┤
│ נתוני EOD:        ✅ 5 שורות | אחרון: 31/01 22:05      │
│ נתוני Intraday:   ⚠️ אין נתונים (Active בלבד)          │
│ היסטוריה 250d:    ⚠️ 5 שורות (נדרש 200+)               │
├─────────────────────────────────────────────────────────┤
│ חוסרים: היסטוריה 250d לא מלאה ל־ATR/MA/CCI             │
├─────────────────────────────────────────────────────────┤
│ עדכונים אחרונים:                                        │
│ 31/01 22:00 | נטען 22:05 | 255.78                       │
└─────────────────────────────────────────────────────────┘
```

### 3.4 התנהגות

- בעת בחירת טיקר ולחיצה על "בדוק" — קריאה ל־API והצגת התוצאה.
- אין צורך ב־polling — קריאה על דרישה.
- RTL — התאמה לעמוד (עברית).

---

## 4. בקשה ל־Team 10 (Gateway)

- **אישור:** תאום וידוא שהממשק והמפרט מסונכרנים עם SSOT.  
- **Index:** עדכון D15_SYSTEM_INDEX / תיעוד אם נדרש.  
- **העברה:** העברת הבקשה ל־Team 30 להנחת עבודה.

---

## 5. קבצים רלוונטיים

| קובץ | צוות | תיאור |
|------|------|--------|
| `api/routers/tickers.py` | 20 | Route GET /{ticker_id}/data-integrity |
| `api/services/tickers_service.py` | 20 | get_ticker_data_integrity |
| `api/schemas/tickers.py` | 20 | TickerDataIntegrityResponse, DataDomainOverview |
| `ui/src/views/management/tickers/tickers.html` | 30 | עמוד ניהול טיקרים — מיקום ה־widget |
| `_COMMUNICATION/team_31/team_31_staging/TEAM_31_TICKERS_COMPLETE_SPEC.md` | 31 | מפרט עמוד טיקרים |

---

## 6. סיכום

| צוות | פעולה |
|------|--------|
| **Team 20** | ✅ API מוכן — GET /tickers/{id}/data-integrity |
| **Team 30** | מימוש UI — דרופדאון + פירוט + לוג בעמוד ניהול טיקרים (קונטיינר עליון) |
| **Team 10** | תאום, העברה ל־30, עדכון Index |

---

**log_entry | TEAM_20 | TO_TEAMS_10_30 | TICKER_DATA_INTEGRITY_UI_REQUEST | 2026-02-14**
