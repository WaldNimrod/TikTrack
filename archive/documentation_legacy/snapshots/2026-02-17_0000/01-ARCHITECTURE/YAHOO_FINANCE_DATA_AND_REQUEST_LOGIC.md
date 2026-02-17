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

### 3.1 `get_ticker_price` (מחיר סגירה EOD)

**חובה:** מחירי סגירה חייבים להחזיר תמיד; שוק סגור לא משנה. לא תוך־יום.

1. **Primary:** `v8/finance/chart` (range=1mo) — היסטוריה תמיד קיימת; לוקח את סגירת היום האחרון
2. **Fallback:** `history(5d)` → `history(start,end)` — yfinance (בלי session)
3. **אחרון:** `v7/finance/quote` — httpx

### 3.2 `get_exchange_rate` (FX)

אותה לוגיקה: `history` → fallback ב־start/end → quote API.

### 3.3 `get_ticker_history` (250d OHLCV)

1. **Primary:** v8/chart (HTTP ישיר, httpx) — `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}`
   - **Full 250d:** `range=2y` (trading_days > 252) או `range=1y` — מחזיר ~504/252 ימי לוח, לוקח 250 אחרונים
   - **Gap-fill:** `period1` + `period2` **בלבד** (ללא range). `period2` = תחילת יום לאחר date_to (כולל date_to)
   - **Retry:** 3×5 שניות (SPEC-PROV-YF-HIST)
   - **Deduplication:** הסרת תאריכים כפולים לפני החזרה
2. **Fallback:** yfinance (בלי Session — RULE 1) — `history(start=..., end=...)` 400 ימים אחורה

---

## 4. כללים

- **לא** להעביר `session` מותאם ל־yfinance — גורם ל־429
- **end** ב־Yahoo הוא **exclusive** — ל־"היום" יש להעביר `end = tomorrow`
- **היסטוריה** — נתונים על עבר זמינים תמיד; הבעיה לרוב ב־range יחסי (period)

### 4.1 סימבולים לקריפטו (Locked)

- Yahoo תומך **בשני פורמטים** (תיעוד רישמי): `BASE-QUOTE` (BTC-USD) ו־`BASEQUOTE=X` (BTCUSD=X).
- דוגמאות: `BTC-USD`, `ETH-USD`, `BTCUSD=X` — chart API עשוי להעדיף =X ל־forex/crypto.
- מימוש: מנסים קודם `BTC-USD`, אם נכשל — `BTCUSD=X` (עם רווח 2s).
- סימבולים כמו `BTC` בלבד עלולים להחזיר "no data".
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

## 6. מגבלות 429 — מה ידוע ומה מנוהל

### 6.1 תעוד רשמי של Yahoo

- **לא מפורסם.** Yahoo לא מפרסמת מגבלות מדויקות ל־query1.finance.yahoo.com.
- **Terms of Use:** "APIs may be subject to rate limits at Yahoo's absolute and sole discretion".
- **YQL (הפסק ב־2019):** 2,000/hr/IP (לא רלוונטי ל־v7/v8 הנוכחי).

### 6.2 ממצאים מקהילה (אינם רשמיים)

| מקור | הערכת מגבלה | זמן המתנה אחרי 429 |
|------|--------------|---------------------|
| Stack Overflow | ~100 בקשות/שעה | — |
| קהילה | 2+ דקות בין בקשות (לא מובטח) | — |
| User-Agent | חובה — בקשות בלי UA נחסמות |

### 6.3 ניהול אצלנו (SSOT: MARKET_DATA_PIPE_SPEC §8)

| מנגנון | מימוש | פרמטר |
|--------|--------|--------|
| **Cooldown על 429** | `provider_cooldown.py` | `PROVIDER_COOLDOWN_MINUTES` (ברירת מחדל: 15) |
| **חלון Cooldown** | 15 דקות (ניתן להגדרה) | אין קריאות נוספות לספק בתקופה |
| **Fallback** | Yahoo → Alpha (Prices) | אין חסימה של ה־UI |
| **Retry** | v8/chart: 3× עם 5s ביניהם | בתוך אותו ספק |
| **User-Agent** | Rotation חובה | `_next_user_agent()` |

### 6.4 המלצה ל־"בלי עומס"

- **לבדיקות ידניות / test-providers-direct:** המתנה **15–30 דקות** אחרי סשן עם הרבה בקשות.
- **לסביבת Production:** Cooldown 15 דקות; Single-Flight; Cache-First — מפחיתים עומס.
- **רווח בין סמלים בבדיקה:** 4+ שניות (כבר מיושם ב־test-providers-direct.py).

---

**log_entry | TEAM_20 | YAHOO_DATA_REQUEST_LOGIC | 2026-02-14**
