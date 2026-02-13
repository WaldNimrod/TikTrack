# Team 10 → Team 20: הוכחת טעינה משני ספקים + היקף מלא (מחיר + היסטוריה)

**from:** Team 10 (The Gateway)  
**to:** Team 20 (Backend)  
**date:** 2026-02-13  
**סטטוס:** 🔒 **חובה — דרישת מנהל/משתמש**

---

## 1. דרישה

**הוכחה לטעינה משני הספקים** (Yahoo Finance + Alpha Vantage) של **כל היקף הנתונים הנדרש** לפי המפרט המלא — כולל **מחיר** ו**מידע היסטורי** (250 ימי מסחר בהתאם להגדרות).

---

## 2. היקף נדרש (לפי SSOT)

| Domain | נתונים | ספקים (עדיפות) | אחסון | מפרט |
|--------|--------|------------------|--------|------|
| **FX** | שערי חליפין | Alpha → Yahoo | market_data.exchange_rates | FOREX_MARKET_SPEC, MARKET_DATA_PIPE_SPEC §2.1 |
| **Prices (EOD)** | מחיר, OHLCV, market_cap | Yahoo → Alpha | market_data.ticker_prices | MARKET_DATA_PIPE_SPEC §4.1, MARKET_DATA_COVERAGE_MATRIX |
| **Prices (Intraday)** | Active tickers | Yahoo → Alpha | market_data.ticker_prices_intraday | §2.4, Coverage Matrix — intraday_interval_minutes |
| **Historical Daily** | 250 ימי מסחר OHLCV | Yahoo → Alpha | market_data.ticker_prices (retention 250d) | §2.4, Rule #2 Coverage Matrix |

**מקורות:**  
- `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md`  
- `documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md`

---

## 3. תוצר Evidence נדרש

**קובץ:** `_COMMUNICATION/team_20/TEAM_20_DUAL_PROVIDER_FULL_SCOPE_EVIDENCE.md`

לכלול:

1. **FX** — ריצה/לוג שמראה טעינה מ־Alpha ו/או Yahoo (לפי Fallback); תאריך + תוצאה (שורות ב־exchange_rates).
2. **Prices (EOD)** — ריצה/לוג שמראה טעינה מ־Yahoo (Primary) ו/או Alpha (Fallback); דוגמת טיקרים (למשל AAPL, MSFT, TSLA) עם מחיר שנשמר ב־ticker_prices.
3. **Historical (250d)** — Evidence שנתונים היסטוריים יומיים נטענים (או מתועדים ב-job/לוג) לפי המפרט.
4. **Intraday (Active)** — אם מיושם: Evidence שטעינה ל־ticker_prices_intraday מתבצעת בהתאם ל־System Settings (intraday_interval_minutes, max_active_tickers).

**אם ספק מחזיר 429 או "No data"** — לתעד במפורש (כולל UA Rotation / Cooldown) ו־Fallback לספק השני.

---

## 4. גישה ל-DB

לצוותים יש גישה לבסיס הנתונים. לבדיקת ספירות:

```bash
python3 scripts/check_market_data_counts.py
# או: make check-market-data-counts
```

פלט לדוגמה: market_data.tickers, market_data.ticker_prices, market_data.exchange_rates.  
**נדרש:** שלאחר טעינה תקינה יהיו שורות ב־ticker_prices (ולפי הצורך ב־exchange_rates / היסטוריה) כך שה-UI יציג נתונים.

---

## 5. סטטוס נוכחי (לאחר בדיקה)

- **market_data.tickers:** 5  
- **market_data.ticker_prices:** 0  
- **market_data.exchange_rates:** 5  

הרצת `make sync-ticker-prices` בוצעה — Yahoo החזיר "No data found for this date range" לכל הטיקרים; Alpha ללא API key. לכן **עדיין אין נתונים בממשק**. נדרש: וידוא API keys (Alpha), תאריך/טווח תאריכים ל-Yahoo, והרצה עד לקבלת שורות ב־ticker_prices + תיעוד Evidence above.

---

**log_entry | TEAM_10 | TO_TEAM_20 | DUAL_PROVIDER_FULL_SCOPE_EVIDENCE_MANDATE | 2026-02-13**
