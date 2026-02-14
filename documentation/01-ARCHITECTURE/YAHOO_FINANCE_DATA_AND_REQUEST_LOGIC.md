# Yahoo Finance — סוגי מידע ולוגיקת קריאות

**מקור:** EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC, MARKET_DATA_PIPE_SPEC  
**תאריך:** 2026-02-14

---

## 1. סוגי Endpoints ב־Yahoo

| Endpoint | שימוש | פרמטרים | נתונים | זמין בסוף שבוע |
|----------|--------|----------|--------|----------------|
| **v8/finance/chart** | היסטורי OHLC | range / period1+period2 | שורת מחיר/יום | ✅ היסטוריה תמיד קיימת |
| **v7/finance/quote** | מחיר נוכחי/אחרון | symbols | regularMarketPrice, previousClose | תלוי (429 אפשרי) |
| **v10/finance/quoteSummary** | info מפורט | modules | marketCap, currentPrice… | 429 בתדירות גבוהה |

---

## 2. לוגיקת `history()` ב־yfinance

- **period** (למשל `"5d"`) → `params={"range": "5d"}` — טווח יחסי ל"עכשיו"
- **start/end** → `params={"period1": ts, "period2": ts}` — טווח תאריכים קבוע
- כש־`end` בעבר, yfinance משתמש ב־**cache** — פחות סיכון ל־429

**חשוב:** בסוף שבוע `range="5d"` לפעמים מחזיר ריק. **start/end** מבקש טווח היסטורי קבוע — הנתונים קיימים.

---

## 3. זרימת מימוש ב־yahoo_provider

### 3.1 `get_ticker_price` (מחיר אחרון)

1. **ניסיון ראשון:** `history(period="5d", interval="1d")` — מהיר בשעות מסחר
2. **אם ריק:** `history(start=..., end=...)` — טווח 14 יום אחורה, כולל סוף שבוע
3. **אם עדיין ריק:** `v7/finance/quote` (httpx) — fallback אחרון

### 3.2 `get_exchange_rate` (FX)

אותה לוגיקה: `history` → fallback ב־start/end → quote API.

### 3.3 `get_ticker_history` (250d OHLCV)

1. **Primary:** v8/chart (HTTP ישיר, httpx) — `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}`
   - **Full 250d:** `range=2y` (trading_days > 252) או `range=1y` — מחזיר ~504/252 ימי לוח, לוקח 250 אחרונים
   - **Gap-fill:** `period1` + `period2` **בלבד** (ללא range). `period2` = תחילת יום לאחר date_to (כולל date_to)
   - **Retry:** 3×5 שניות (SPEC-PROV-YF-HIST)
   - **Deduplication:** הסרת תאריכים כפולים לפני החזרה
2. **Fallback:** yfinance + Session + User-Agent — `history(start=..., end=...)` 400 ימים אחורה

---

## 4. כללים

- **לא** להעביר `session` מותאם ל־yfinance — גורם ל־429
- **end** ב־Yahoo הוא **exclusive** — ל־"היום" יש להעביר `end = tomorrow`
- **היסטוריה** — נתונים על עבר זמינים תמיד; הבעיה לרוב ב־range יחסי (period)

### 4.1 סימבולים לקריפטו (Locked)

- Yahoo עובד עם סימבול קריפטו בפורמט `BASE-QUOTE` בלבד.
- דוגמאות תקינות: `BTC-USD`, `ETH-USD`, `SOL-USD`.
- סימבולים כמו `BTC` בלבד עלולים להחזיר "no data" או תוצאות לא עקביות.
- ליישור מול Alpha Vantage יש לשמור `provider_mapping_data` לכל טיקר קריפטו:
  - Yahoo: `symbol=BTC-USD`
  - Alpha: `symbol=BTC`, `market=USD`

---

## 5. טבלאות DB רלוונטיות

| טבלה | תוכן | מקור |
|------|------|------|
| ticker_prices | EOD, שורה/יום | sync_ticker_prices_eod |
| ticker_prices_intraday | Intraday — טיקרים עם is_active=true | sync_ticker_prices_intraday. מקור: TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT |
| exchange_rates | שער נוכחי | sync_exchange_rates_eod |
| exchange_rates_history | היסטוריית FX | sync_exchange_rates_eod |

סוף שבוע: אין מסחר חדש, אבל **היסטוריה** (סגירות קודמות) קיימת ויש להסתמך עליה.

---

**log_entry | TEAM_20 | YAHOO_DATA_REQUEST_LOGIC | 2026-02-14**
