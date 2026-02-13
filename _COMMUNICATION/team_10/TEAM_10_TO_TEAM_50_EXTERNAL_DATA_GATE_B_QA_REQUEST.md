# Team 10 → Team 50: External Data — בקשת בדיקות מלאות (Gate B)

**id:** `TEAM_10_TO_TEAM_50_EXTERNAL_DATA_GATE_B_QA_REQUEST`  
**from:** Team 10 (The Gateway)  
**to:** Team 50 (QA & Fidelity)  
**date:** 2026-01-30  
**re:** Gate A הושלם; התהליך לא נחשב סגור ללא Gate B — נתוני אמת, שמירה, ממשק, והבחנה EOD/תוך־יומי.

---

## 0. הערה חשובה — שוק סגור ונתוני תוך־יומי

**כרגע השוק (מניות/ETF) סגור.** לא ניתן לקבל בפועל נתוני תוך־יומי אמיתיים לכל הנכסים הנסחרים בשעות בורסה.

- **חובה:** לבדוק גם **נכסים הנסחרים 24/7** — ביטקוין (Bitcoin) ואיתריום (Ethereum) — כדי לאמת נתוני תוך־יומי אמיתיים.
- **חובה:** לוודא **טיקרים נכונים ומדויקים** לפי הספק (למשל Yahoo: `BTC-USD`, `ETH-USD`; Alpha Vantage — לבדוק במסמכי הספק). אין להשתמש בסמלים לא־תקניים.

---

## 1. הקשר

שער א' (Gate A) אושר: DB (market_cap), Unit tests, Import verification.  
**אבל:** ללא בדיקות על **נתוני אמת מהספקים**, **שמירה ב-DB**, **הצגה בממשק**, והבחנה ברורה בין **תוך־יומי (intraday)** ל־**סוף־יום (EOD)** — לא סיימנו.  
מבקשים מ־Team 50 לבצע **בדיקות מלאות (Gate B)** לפי הרשימה להלן.

---

## 2. מטרות Gate B

| מטרה | תיאור |
|------|--------|
| **נתוני אמת** | קבלת נתונים אמיתיים מכל הספקים (Alpha Vantage, Yahoo Finance) — לא רק mock/unit. |
| **שמירה** | וידוא שכל הנתונים **נשמרים** בטבלאות המתאימות. |
| **מגוון נתונים** | וידוא שיש לנו את **כל מגוון הנתונים** לפי האפיון (MARKET_DATA_COVERAGE_MATRIX, MARKET_DATA_PIPE_SPEC). |
| **EOD vs תוך־יומי** | וידוא שהמערכת **מבינה ומבדילה** בין נתוני סוף־יום (ticker_prices, exchange_rates) לנתוני תוך־יומי (ticker_prices_intraday). |
| **שני ספקים** | וידוא **תקשורת עם שני הספקים** (Yahoo, Alpha) — לפי היררכיה: FX = Alpha→Yahoo, Prices = Yahoo→Alpha. |
| **ממשק** | וידוא שהנתונים **מוצגים בממשק** (שעון סטגנציה, חשבונות מסחר — פוזיציות עם מחיר/שינוי יומי). |

---

## 3. רשימת בדיקות נדרשת (Gate B)

### 3.1 נתוני אמת מהספקים

- [ ] **FX (שערי חליפין):** הרצת sync/refresh עם Alpha (primary) ו־Yahoo (fallback) — וידוא שנתונים אמיתיים מגיעים ונשמרים ב־`market_data.exchange_rates`.
- [ ] **מחירי טיקר (EOD):** וידוא שנתונים אמיתיים מ־Yahoo (primary) ו־Alpha (fallback) נשמרים ב־`market_data.ticker_prices` (כולל שדות: price, open, high, low, close, volume, **market_cap**, price_timestamp, provider_id).
- [ ] **תוך־יומי (Intraday):** כי השוק סגור — **להשתמש בנכסים 24/7:** ביטקוין, איתריום. וידוא טיקרים נכונים (למשל Yahoo: `BTC-USD`, `ETH-USD`; Alpha — לפי מסמכי הספק). אם יש sync/script ל־intraday — וידוא שנתונים נשמרים ב־`market_data.ticker_prices_intraday` (נפרד מ־ticker_prices).
- [ ] **250d Historical:** וידוא ש־get_ticker_history / 250 trading days מחזיר ונשמר (או משמש ל־Indicators) לפי האפיון. לנכסים 24/7 (BTC, ETH) — היסטוריה זמינה גם כשהבורסה סגורה.

### 3.2 שמירה ב-DB

- [ ] אחרי fetch — וידוא שורות ב־`market_data.exchange_rates` (לפחות זוגות רלוונטיים, למשל USD/ILS, USD/EUR).
- [ ] אחרי fetch — וידוא שורות ב־`market_data.ticker_prices` עם שדות מלאים (כולל market_cap כשהספק מחזיר).
- [ ] אם קיים flow ל־intraday — וידוא שורות ב־`market_data.ticker_prices_intraday` (הבחנה ברורה מ־ticker_prices). **לבדיקת intraday כשהשוק סגור:** להשתמש ב־BTC/ETH עם טיקרים תקניים (למשל `BTC-USD`, `ETH-USD` ב-Yahoo).
- [ ] **טיקרים נכונים:** וידוא שהסמלים ל־ביטקוין ואיתריום תואמים לספק (Yahoo: `BTC-USD`, `ETH-USD`; Alpha — לבדוק במסמכי הספק). אין להשתמש בסמלים לא־מדויקים.

### 3.3 מגוון נתונים לפי אפיון

- [ ] **FX:** conversion_rate, last_sync_time — EOD בלבד (לפי FOREX_MARKET_SPEC / MARKET_DATA_COVERAGE_MATRIX).
- [ ] **Prices EOD:** OHLCV + market_cap ב־ticker_prices; Precision NUMERIC(20,8).
- [ ] **Prices Intraday:** OHLCV ב־ticker_prices_intraday (טבלה נפרדת); הבחנה ברורה ב־cadence (EOD vs intraday).
- [ ] **Indicators:** ATR(14), MA(20/50/150/200), CCI(20) — נגזרים מ־250d daily; וידוא unit/import כבר ב־Gate A; אופציונלי ב־Gate B: וידוא חישוב עם נתוני אמת.

### 3.4 הבחנה EOD vs תוך־יומי

- [ ] תיעוד/וידוא: מתי משתמשים ב־`ticker_prices` (EOD / היסטוריה יומית) ומתי ב־`ticker_prices_intraday` (נתוני תוך־יומי).
- [ ] וידוא ש־API/שירותים (למשל positions, reference/exchange-rates) קוראים מהטבלאות הנכונות ולא מערבבים EOD עם intraday שלא לפי אפיון.

### 3.5 תקשורת עם שני הספקים

- [ ] **FX:** Alpha primary, Yahoo fallback — וידוא (לוג/סקריפט/בדיקה) ששניהם נקראים בהתאם (במקרה של miss או stale).
- [ ] **Prices:** Yahoo primary, Alpha fallback — וידוא ששניהם נקראים בהתאם.
- [ ] Guardrails: Yahoo — User-Agent rotation; Alpha — RateLimit 12.5s; וידוא שאין block/ban.

### 3.6 הצגה בממשק

- [ ] **שעון סטגנציה (Staleness clock):** בדיקה בעמוד שטוען את השעון — נתוני FX מ־GET /api/v1/reference/exchange-rates; צבע + tooltip לפי staleness.
- [ ] **חשבונות מסחר (Trading Accounts):** בדיקה שטבלת הפוזיציות מציגה **מחיר נוכחי** ו־**שינוי יומי %** שמגיעים מ־market_data.ticker_prices (דרך Positions API).
- [ ] תיעוד: עמוד "ניהול טיקרים" (tickers.html) **לא קיים** באפליקציה הנוכחית — אין לבצע שם וידוא עד שייושם; כשניישם — להוסיף לרשימת הבדיקות.

---

## 4. מסמכי אפיון (לשימוש Team 50)

| מסמך | נתיב |
|------|------|
| MARKET_DATA_PIPE_SPEC | documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md |
| MARKET_DATA_COVERAGE_MATRIX | documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md |
| External Data — Where in UI | 05-REPORTS/artifacts/TEAM_10_EXTERNAL_DATA_UI_VISIBILITY_REPORT.md |
| Gate A QA Report | _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_EXTERNAL_DATA_QA_REPORT.md |

---

## 5. תלות סביבה

- **DB:** מיגרציה P3-013 (market_cap ב־ticker_prices) — כבר הורצה (Team 60).
- **Env:** `ALPHA_VANTAGE_API_KEY` — נדרש לבדיקות עם נתוני אמת מ־Alpha.
- **yfinance:** מותקן (Yahoo).

---

## 6. תוצר מצופה

דוח **TEAM_50_TO_TEAM_10_EXTERNAL_DATA_GATE_B_QA_REPORT** עם:
- סטטוס כל פריט ברשימה (PASS / FAIL / N/A + הערה).
- Evidence קצר (למשל: צילום מסך ממשק, מספר שורות ב-DB אחרי fetch, לוג קריאה לספק).
- ממצאים ותיקונים נדרשים (אם יש).

**רק לאחר Gate B PASS — התהליך נחשב סגור מבחינת "הכל נשמר, מגוון נתונים, EOD vs intraday, שני ספקים, והצגה בממשק".**

---

**log_entry | TEAM_10 | TO_TEAM_50 | EXTERNAL_DATA_GATE_B_QA_REQUEST | 2026-01-30**
