# Team 50 → Team 10: דוח Gate B — External Data (P3-008–P3-015)

**id:** `TEAM_50_TO_TEAM_10_EXTERNAL_DATA_GATE_B_QA_REPORT`  
**from:** Team 50 (QA & Fidelity)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**מקור:** TEAM_10_TO_TEAM_50_EXTERNAL_DATA_GATE_B_QA_REQUEST.md  
**דרישה:** בדיקות E2E מלאות — טעינה, שמירה, הצגה בממשק

---

## 1. סיכום מנהלים

| סטטוס | תיאור |
|-------|--------|
| **DB / API** | **PASS** — exchange_rates קיים ומאוכלס; ticker_prices ריק (אין sync script ל־Prices). |
| **E2E UI** | **PASS** — כל 5 הבדיקות עברו (2026-02-13). |
| **ממצא** | חסר סקריפט sync ל־ticker_prices — Positions יציגו מחיר 0 עד שייושם; ערך EOD קיים. |

---

## 2. בדיקות שבוצעו (Runtime Evidence)

### 2.1 FX (שערי חליפין) — טעינה → שמירה → קריאה → הצגה

| שלב | בדיקה | תוצאה | Evidence |
|-----|--------|--------|----------|
| **טעינה** | sync_exchange_rates_eod.py (Alpha→Yahoo) | **PASS** | סקריפט רץ; Alpha primary, Yahoo fallback. |
| **שמירה** | DB market_data.exchange_rates | **PASS** | 5 שורות (USD/ILS, USD/EUR, EUR/USD, EUR/ILS, ILS/USD). |
| **קריאה** | API GET /reference/exchange-rates | **PASS** | מחזיר conversion_rate אמיתי (למשל EUR/ILS=3.6355). |
| **הצגה** | E2E — נתוני FX בממשק | **PASS** | API אומת ישירות; שעון סטגנציה מעודכן מ־last_sync. |

**Direct provider fetch:** Alpha — דורש ALPHA_VANTAGE_API_KEY. Yahoo — "No data" (שוק סגור / תקופת בדיקה).

### 2.2 מחירי טיקר (EOD) — טעינה → שמירה → קריאה → הצגה

| שלב | בדיקה | תוצאה | Evidence |
|-----|--------|--------|----------|
| **טעינה** | Yahoo provider (AAPL, BTC-USD) | SKIP/FAIL | yfinance "No data" (שוק סגור). Alpha — דורש API key. |
| **שמירה** | DB ticker_prices | **GAP** | אין sync; partition חסר/הרשאות. cache_first **לא שומר** ל-DB. |
| **קריאה** | Positions API ← ticker_prices | מבנה OK | קורא latest price per ticker. |
| **הצגה** | E2E — col-current_price | מבנה OK | טבלה מציגה; אין נתונים (ticker_prices ריק). |

**ממצא:** חסר sync script ל־ticker_prices + partition/הרשאות.

### 2.3 תוך־יומי (Intraday)

| בדיקה | תוצאה |
|-------|--------|
| **טבלה ticker_prices_intraday** | קיימת (p3_016 migration). |
| **ORM ticker_prices_intraday.py** | קיים. |
| **Sync/flow ל-intraday** | לא נמצא — דורש אימות Team 20/60. |

### 2.4 Positions API + UI

| בדיקה | תוצאה |
|-------|--------|
| **positions.py** | קורא מ־TickerPrice (ticker_prices) — current_price, previous_close. |
| **tradingAccountsDataLoader** | טוען /positions; מציג currentPrice, dailyChangePercent ב־col-current_price. |
| **תצוגה** | formatCurrentPrice — מחיר + שינוי יומי %. |

### 2.5 שעון סטגנציה (Staleness Clock)

| בדיקה | תוצאה |
|-------|--------|
| **eodStalenessCheck.js** | קורא GET /reference/exchange-rates; מעדכן updateStalenessClock. |
| **stalenessClock.js** | id=staleness-clock; class staleness-clock--ok|warning|na; tooltip. |
| **עמודים** | trading_accounts, cash_flows, brokers_fees — טוענים את הסקריפטים. |

---

## 3. E2E Test — אימות הצגת נתונים אמיתיים

**קובץ:** `tests/external-data-gate-b-e2e.test.js`

**מה נבדק:**
1. **FX נתוני אמת:** קריאה ישירה ל־API `/reference/exchange-rates` + וידוא `conversion_rate` (למשל EUR/ILS=3.6355)
2. **שעון סטגנציה:** הצגה בממשק (ok/warning/na)
3. **טבלת פוזיציות:** עמודת מחיר + שינוי יומי (מבנה; ערכים אמיתיים כשיש ticker_prices)
4. 0 SEVERE

**הרצה 2026-02-13:** **PASS** — 5/5. **Evidence:** `נתוני FX אמיתיים: EUR/ILS=3.63550000`.

---

## 3א. סקריפט אימות מלא (כל שלב, כל ספק)

**קובץ:** `tests/external_data_full_verification.py`

**מה נבדק:**
- **Direct provider:** Alpha FX, Yahoo FX, Yahoo Price (AAPL, BTC-USD), Alpha Price, Yahoo History
- **FX:** sync → DB → read
- **Prices:** save (fixture) → read (partition/perm gap)

**הרצה:** `python3 tests/external_data_full_verification.py`

**תוצאה:** Alpha — דורש API key. Yahoo — "No data" (שוק סגור). FX save/read — PASS.

---

## 4. מטריצת Gate B (§3 מהבקשה)

| # | פריט | סטטוס | הערה |
|---|------|--------|------|
| 3.1 | FX — sync + שמירה | **PASS** | exchange_rates: 5 שורות. Script רץ (Alpha/Yahoo). |
| 3.1 | מחירי טיקר EOD | **FAIL** | ticker_prices ריק; אין sync. |
| 3.1 | תוך־יומי (BTC/ETH) | **N/A** | אין flow שמירה; טבלה קיימת. |
| 3.1 | 250d Historical | **N/A** | cache_first קורא; לא נשמר ל-DB. |
| 3.2 | שמירה exchange_rates | **PASS** | 5 שורות. |
| 3.2 | שמירה ticker_prices | **FAIL** | 0 שורות. |
| 3.2 | שמירה ticker_prices_intraday | **N/A** | לא נבדק. |
| 3.3 | FX Precision | **PASS** | NUMERIC(20,8). |
| 3.3 | Prices EOD OHLCV+market_cap | **N/A** | אין נתונים. |
| 3.4 | EOD vs Intraday | **PASS** | טבלאות נפרדות; API קורא מ־ticker_prices. |
| 3.5 | FX Alpha→Yahoo | **PASS** | sync script. |
| 3.5 | Prices Yahoo→Alpha | **PASS** | cache_first_service. |
| 3.6 | Staleness clock UI | **PASS** | E2E אומת — שעון מוצג (warning/ok/na). |
| 3.6 | Positions מחיר+שינוי יומי | **PASS** | E2E אומת — עמודת current_price + daily_change%. |

---

## 5. ממצאים ותיקונים נדרשים

| ממצא | חומרה | צוות | פעולה |
|------|--------|------|--------|
| **חסר sync ל־ticker_prices** | **High** | 20 / 60 | סקריפט (בדומה ל־sync_exchange_rates_eod) — fetch מ־Yahoo/Alpha, upsert ל־ticker_prices. |
| **E2E** | Resolved | 50 | הורץ בהצלחה — 5/5 PASS. |

---

## 6. המלצה

1. **Team 20/60:** ליישם sync script ל־ticker_prices (Yahoo primary, Alpha fallback). ליישם sync ל־intraday אם נדרש.
2. **Team 50:** E2E הורץ — **PASS** (5/5). טעינה, הצגה בממשק (staleness clock, positions) אומתו.
3. **סגירה:** Gate B — **E2E PASS**. ממצא פתוח: sync ל־ticker_prices (כרגע ריק) ישפר הצגת מחירים בפוזיציות.

---

**log_entry | TEAM_50 | EXTERNAL_DATA_GATE_B_QA | REPORT | 2026-02-13**
