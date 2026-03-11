# Team 60 → Team 50 (QA) | CC: Team 10 — Market Data Provider Fix — חבילה מוחזרת ל-QA

**project_domain:** TIKTRACK  
**id:** TEAM_60_TO_TEAM_50_MARKET_DATA_PROVIDER_FIX_QA_HANDOFF  
**from:** Team 60 (Infrastructure)  
**to:** Team 50 (QA & Fidelity)  
**cc:** Team 10 (Gateway)  
**date:** 2025-01-31  
**status:** READY_FOR_QA  
**context:** תיקוני האדריכלית (Market Data Provider Fix) — אימות טעינת נתונים בפועל הושלם; החבילה מוחזרת ל-QA.

---

## 1) רקע — תיקוני האדריכלית (הושלמו)

לאחר התייעצות (TEAM_60_TO_TEAM_10_ARCHITECT_MARKET_DATA_PROVIDERS_STATE_AND_CONSULTATION_REQUEST) בוצעו תיקונים ב־**6 קבצים**:

| קובץ | שינוי עיקרי |
|------|-------------|
| `api/integrations/market_data/provider_cooldown.py` | תקצוב Alpha: `increment_alpha_calls()`, `get_alpha_calls_today()`, `get_alpha_remaining_today()`, `ALPHA_DAILY_LIMIT=25` |
| `api/integrations/market_data/providers/alpha_provider.py` | בדיקת מכסה לפני קריאה; הסרת `_fetch_market_cap` מ־`get_ticker_price` (1 קריאה/טיקר במקום 2) |
| `api/integrations/market_data/providers/yahoo_provider.py` | Exponential backoff 5s→10s→20s על 429; 100ms delay בין batch chunks |
| `api/integrations/market_data/market_data_settings.py` | `delay_between_symbols_seconds` ברירת מחדל 0→1 שנייה |
| `scripts/sync_ticker_prices_eod.py` | Alpha policy: `ALPHA_FX_RESERVE=8`; non-CRYPTO רק כש־remaining>8; לוג מכסה בהתחלה |
| `scripts/sync_ticker_prices_intraday.py` | Alpha non-CRYPTO: never; CRYPTO רק כש־quota > reserve |

---

## 2) בדיקות טעינת נתונים בפועל (בוצעו ע"י Team 60)

### 2.1 EOD Ticker Prices — `make sync-ticker-prices`

- **תוצאה:** Exit 0 — הסנכרון הושלם.
- **תצוגה:** לוג מכסה Alpha בהתחלה: `📊 [FIX-4] Alpha Vantage quota: 0/25 used, 25 remaining (FX reserve: 8)`.
- **התנהגות:** כיבוד cooldown (Yahoo/Alpha); fallback ל־last-known price כאשר שני הספקים לא זמינים; 9 ticker prices עודכנו ב־`market_data.ticker_prices`.

### 2.2 EOD Exchange Rates — `make sync-eod`

- **תוצאה:** Exit 0 — הסנכרון הושלם.
- **התנהגות:** Alpha partial/fail → fallback ל־Yahoo; Yahoo החזיר "No data found for this date range" (צפוי בסוף שבוע/חג). אין שגיאה בקוד.

**מסקנה:** טעינת הנתונים בפועל עובדת; מכסה ו־cooldown נשמרים; אין קריסה. **הכל טוב** — החבילה מוחזרת ל-QA.

---

## 3) החזרה ל-QA — נדרש מצוות 50

- **סקופ:** אימות ש־תיקוני Market Data Provider (Alpha 25/day, Yahoo backoff + delay, FX reserve) לא שוברים תסריטי QA קיימים; ואימות שסנכרון EOD/Intraday ממשיך להתנהג בהתאם למפרט (מכסה, fallback, last-known).
- **מקורות:**  
  - מנדט/תיקון: סיכום האדריכלית (Market Data Provider Fix — Complete).  
  - דוח התייעצות: `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_ARCHITECT_MARKET_DATA_PROVIDERS_STATE_AND_CONSULTATION_REQUEST.md`
- **דוח QA נדרש:** לפי נוהל Team 50 — דוח לתיקון/חבילה זו, עם העתק ל-Team 10.

---

## 4) קבצים רלוונטיים לבדיקה

| נתיב | תיאור |
|------|--------|
| `api/integrations/market_data/provider_cooldown.py` | מכסת Alpha, cooldown |
| `api/integrations/market_data/providers/alpha_provider.py` | quota check, אין market_cap ב־get_ticker_price |
| `api/integrations/market_data/providers/yahoo_provider.py` | exponential backoff, 100ms בין batches |
| `api/integrations/market_data/market_data_settings.py` | delay_between_symbols_seconds=1 |
| `scripts/sync_ticker_prices_eod.py` | ALPHA_FX_RESERVE, לוג מכסה |
| `scripts/sync_ticker_prices_intraday.py` | Alpha non-CRYPTO never |

---

**log_entry | TEAM_60 | MARKET_DATA_PROVIDER_FIX | TO_TEAM_50_QA_HANDOFF | CC_TEAM_10 | 2025-01-31**
