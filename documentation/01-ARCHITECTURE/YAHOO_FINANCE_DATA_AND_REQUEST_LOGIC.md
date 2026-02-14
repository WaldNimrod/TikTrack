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

1. **ניסיון ראשון:** `history(period="1y" או "2y")`
2. **אם ריק:** `history(start=..., end=...)` — 400 ימים אחורה

---

## 4. כללים

- **לא** להעביר `session` מותאם ל־yfinance — גורם ל־429
- **end** ב־Yahoo הוא **exclusive** — ל־"היום" יש להעביר `end = tomorrow`
- **היסטוריה** — נתונים על עבר זמינים תמיד; הבעיה לרוב ב־range יחסי (period)

---

## 5. טבלאות DB רלוונטיות

| טבלה | תוכן | מקור |
|------|------|------|
| ticker_prices | EOD, שורה/יום | sync_ticker_prices_eod |
| ticker_prices_intraday | Intraday (Active) | sync_ticker_prices_intraday |
| exchange_rates | שער נוכחי | sync_exchange_rates_eod |
| exchange_rates_history | היסטוריית FX | sync_exchange_rates_eod |

סוף שבוע: אין מסחר חדש, אבל **היסטוריה** (סגירות קודמות) קיימת ויש להסתמך עליה.

---

**log_entry | TEAM_20 | YAHOO_DATA_REQUEST_LOGIC | 2026-02-14**
