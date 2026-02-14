# Team 20 → Team 30: עדכון — Indicators בממשק בקרת תקינות

**id:** `TEAM_20_TO_TEAM_30_INDICATORS_DATA_INTEGRITY_UPDATE`  
**from:** Team 20 (Backend)  
**to:** Team 30 (UI)  
**date:** 2026-02-14  
**מקור:** MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC; בקשה להצגת ATR/MA/CCI ושווי שוק

---

## 1. הקשר

עדכון ממשק **בקרת תקינות נתוני טיקר** — הוספת הצגת **Indicators** (ATR, MA, CCI) ו-**שווי שוק (Market Cap)**.

כאשר יש מספיק היסטוריה (200+ שורות), הנתונים מחושבים; כשאין — מוצג "—" (חסר).

---

## 2. עדכון API (Team 20 — הושלם)

### 2.1 שדה חדש בתשובה

`GET /api/v1/tickers/{ticker_id}/data-integrity` מחזיר כעת שדה נוסף:

```json
"indicators": {
  "atr_14": "2.54321000",
  "ma_20": "255.78000000",
  "ma_50": "248.12345678",
  "ma_150": null,
  "ma_200": null,
  "cci_20": "45.23000000",
  "market_cap": "4000000000000"
}
```

### 2.2 משמעות השדות

| שדה | תיאור | תנאי |
|-----|--------|------|
| `atr_14` | ATR(14) — Average True Range | נדרש 15+ שורות |
| `ma_20` | MA(20) — ממוצע נע 20 | נדרש 20+ שורות |
| `ma_50` | MA(50) | נדרש 50+ שורות |
| `ma_150` | MA(150) | נדרש 150+ שורות |
| `ma_200` | MA(200) | נדרש 200+ שורות |
| `cci_20` | CCI(20) — Commodity Channel Index | נדרש 20+ שורות |
| `market_cap` | שווי שוק — מ־EOD האחרון | מ־ticker_prices |

**כאשר `null`** — אין מספיק היסטוריה או שאין נתון. יש להציג "—" או "חסר".

---

## 3. עדכון UI (Team 20 — הושלם)

בלוק הצגת Indicators ב־`tickersDataIntegrityInit.js`:

```javascript
const ind = data?.indicators ?? {};
const fmt = (v) => (v != null && v !== '' ? String(v) : '—');
// ... שורות ATR, MA(20/50/150/200), CCI, Market Cap
```

**מיקום:** מתחת לשורות EOD / Intraday / History 250d, בתוך `data-integrity-detail`.

---

## 4. התנהגות צפויה

| מצב | הצגה |
|-----|------|
| יש 250d והיסטוריה מלאה | ערכים מספריים (ATR, MA, CCI, Market Cap) |
| חסרה היסטוריה | "—" עבור אינדיקטורים שלא ניתן לחשב |
| אין נתוני EOD | market_cap: "—" |

---

## 5. קבצים שעודכנו

| קובץ | צוות | תיאור |
|------|------|--------|
| `api/schemas/tickers.py` | 20 | IndicatorsOverview, indicators ב־TickerDataIntegrityResponse |
| `api/services/tickers_service.py` | 20 | get_ticker_indicators_cache_first + market_cap |
| `ui/src/views/management/tickers/tickersDataIntegrityInit.js` | 20 | הצגת Indicators (ATR, MA, CCI, Market Cap) |

---

## 6. הערה

**היסטוריה 250d:** אם עדיין אין נתונים (טיקרים חדשים, backfill לא רץ), האינדיקטורים יהיו ריקים. הרצת `make sync-history-backfill` ממלאת היסטוריה. ראה `TEAM_20_TO_TEAM_60_HISTORY_BACKFILL_COORDINATION_REQUEST.md`.

---

**log_entry | TEAM_20 | TO_TEAM_30 | INDICATORS_DATA_INTEGRITY_UPDATE | 2026-02-14**
