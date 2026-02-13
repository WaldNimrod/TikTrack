# Team 60 → Team 10: אישור הפעלה — External Data (תשתית)

**id:** `TEAM_60_EXTERNAL_DATA_ACTIVATION_ACK`  
**from:** Team 60 (DevOps & Platform)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**מקור:** TEAM_10_TO_TEAM_60_EXTERNAL_DATA_ACTIVATION.md; TEAM_10_TO_TEAM_60_EXTERNAL_DATA_M5_MANDATE.md

---

## 1. קבלה ואימוץ

**Team 60 מאשר** קבלת הודעת ההפעלה — ספקי נתונים חיצוניים (External Data).

---

## 2. תפקיד ותוצר סופי

| תחום | אחריות Team 60 |
|------|----------------|
| **Schema / DDL** | ticker_prices, exchange_rates, **ticker_prices_intraday** |
| **EOD Sync** | FX — Alpha Vantage → Yahoo (fallback); **אין Frankfurter** |
| **Intraday** | טבלה נפרדת `market_data.ticker_prices_intraday` |
| **Cleanup** | Retention 30d (Intraday), 250d (Daily/FX); Archive; Evidence |
| **Evidence** | last_run_time, rows_updated, rows_pruned; לוגים ב-artifacts |

---

## 3. משימות (סדר ביצוע)

| # | מזהה | משימה | סטטוס |
|---|------|--------|--------|
| 1 | **P3-016** | DDL + migration — `market_data.ticker_prices_intraday` | ⏳ |
| 2 | **P3-011** | FX EOD Sync — Alpha→Yahoo; עדכון `sync_exchange_rates_eod.py` (החלפת Frankfurter) | ⏳ |
| 3 | **P3-017** | Cleanup Jobs + Evidence | ⏳ |

---

## 4. תיעוד נקרא

- MARKET_DATA_PIPE_SPEC §5, §7
- MARKET_DATA_COVERAGE_MATRIX
- FOREX_MARKET_SPEC
- TEAM_90_MAINTENANCE_LOCKED_UPDATE
- M5 Mandate (Alpha→Yahoo, Scope USD/EUR/ILS)

---

## 5. הערה

**sync_exchange_rates_eod.py** משתמש כרגע ב-Frankfurter. **נדרש עדכון** — Alpha Vantage (Primary) → Yahoo (Fallback) לפי M5.

---

**סגירה:** רק עם **Seal Message (SOP-013)**.

---

**log_entry | TEAM_60 | EXTERNAL_DATA_ACTIVATION | ACKNOWLEDGED | 2026-02-13**
