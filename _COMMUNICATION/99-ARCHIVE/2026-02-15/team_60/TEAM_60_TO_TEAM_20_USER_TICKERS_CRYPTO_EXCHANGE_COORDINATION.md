# Team 60 → Team 20: תאום — User Tickers Crypto + Provider Mapping (Corrective)

**id:** `TEAM_60_TO_TEAM_20_USER_TICKERS_CRYPTO_EXCHANGE_COORDINATION`  
**from:** Team 60 (DevOps & Platform)  
**to:** Team 20 (Backend)  
**date:** 2026-02-14  
**מקור:** TEAM_10_TO_TEAM_60_USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE | TEAM_10_USER_TICKERS_CRYPTO_EXCHANGE_GAPS_AND_CORRECTIVE_PLAN §3.4

---

## 1. הקשר

Team 10 הוציא מנדט תיקון — **Jobs עם מיפוי ספקים, לא לשבור קריפטו**.  
Team 60 מריץ את סקריפטי ה־sync דרך cron; הלוגיקה של **provider_mapping_data** ו־**DIGITAL_CURRENCY_DAILY** — ב־Team 20.

---

## 2. סקריפטים מושפעים

| Script | Job | Make target |
|--------|-----|-------------|
| `scripts/sync_ticker_prices_eod.py` | Ticker EOD | `make sync-ticker-prices` |
| `scripts/sync_ticker_prices_intraday.py` | Intraday | `make sync-intraday` |
| `scripts/sync_ticker_prices_history_backfill.py` | History Backfill | `make sync-history-backfill` |

כל הסקריפטים טוענים טיקרים מ־`market_data.tickers` ומעבירים `(id, symbol)` בלבד לפרוביידרים. **חסר:** `ticker_type`, `provider_mapping_data` / `metadata.provider_mapping_data`, `market`.

---

## 3. נדרש מ־Team 20

### 3.1 טעינה מרחיבה
- בטעינת טיקרים: לקרוא **ticker_type** ו־**metadata.provider_mapping_data** (או להסיק מ־symbol+ticker_type).
- להעביר ל־providers: **symbol + provider_mapping** (ולקרי­פטו: **market**, ברירת מחדל USD).

### 3.2 שימוש ב־provider mapping
- ל־**CRYPTO**: Alpha — **DIGITAL_CURRENCY_DAILY** (symbol+market); לא GLOBAL_QUOTE.
- ל־**STOCK**: כרגיל (GLOBAL_QUOTE, TIME_SERIES_DAILY).
- מקור SSOT: `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`.

### 3.3 חובת אי־שבירה
- אין להוציא/לסנן טיקרים לפי `ticker_type=CRYPTO` — Jobs ממשיכים לכלול את כל הטיקרים הפעילים.

---

## 4. התחייבות Team 60

| פריט | התחייבות |
|------|-----------|
| **Cron** | אין שינוי בתזמון/חוקים שימנעו טעינת קריפטו |
| **ENV** | אין החרגת קריפטו ב־env או ב־settings |
| **הרצה** | לאחר עדכון הסקריפטים — Team 60 יריץ אותם דרך cron ללא שינוי נוסף |
| **תיעוד** | TEAM_60_CRON_SCHEDULE מעודכן עם הפניה לתוכנית התיקון |

---

## 5. מסמכים מחייבים

- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md`
- `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE.md`

---

## 6. המשך

נא לעדכן את הסקריפטים לפי סעיפים 3.1–3.3. לאחר השלמה — Team 60 יוודא הרצה תקינה דרך cron וידווח ל־Team 10.

---

**Status:** תלות ב־Team 20 — חובה לפני סגירת User Tickers  
**log_entry | TEAM_60 | TO_TEAM_20 | USER_TICKERS_CRYPTO_EXCHANGE_COORDINATION | 2026-02-14**
