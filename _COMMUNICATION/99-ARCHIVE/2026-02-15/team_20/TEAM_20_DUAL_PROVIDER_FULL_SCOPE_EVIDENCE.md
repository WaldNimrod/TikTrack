# Team 20: Evidence — Dual Provider + Full Scope

**id:** `TEAM_20_DUAL_PROVIDER_FULL_SCOPE_EVIDENCE`  
**owner:** Team 20 (Backend)  
**date:** 2026-02-13  
**מקור:** MARKET_DATA_PIPE_SPEC; MARKET_DATA_COVERAGE_MATRIX; ARCHITECT_VERDICT_MARKET_DATA_STAGE_1

---

## 1. FX — Alpha → Yahoo

| פריט | תוכן |
|------|------|
| **Primary** | Alpha Vantage |
| **Fallback** | Yahoo Finance |
| **תוצאה** | 5 שורות ב־`market_data.exchange_rates` ו־`market_data.exchange_rates_history` |
| **Scope** | USD/ILS, USD/EUR, EUR/USD, EUR/ILS, ILS/USD |

---

## 2. Prices (EOD) — Yahoo → Alpha

| פריט | תוכן |
|------|------|
| **Primary** | Yahoo Finance |
| **Fallback** | Alpha Vantage |
| **מקור טיקרים** | `market_data.tickers` |
| **טבלה** | `market_data.ticker_prices` |

---

## 3. Historical 250d

| פריט | תוכן |
|------|------|
| **EOD sync** | שורה אחת/טיקר/יום |
| **get_ticker_history** | Yahoo/Alpha לתמיכה ב־250 ימי מסחר |
| **Indicators** | ATR/MA/CCI מתוך 250d |

---

## 4. Intraday

| פריט | תוכן |
|------|------|
| **טבלה** | `market_data.ticker_prices_intraday` — קיימת (P3-016) |
| **Job** | לא מיושם כרגע — ממתין ל־`sync_ticker_prices_intraday.py` (תאום Team 60) |

---

## 5. 429 / No data / Fallback

| תרחיש | התנהגות |
|--------|----------|
| Yahoo "No data" | Fallback ל־Alpha |
| Yahoo 429 | Cooldown + Fallback ל־Alpha |
| Alpha 429 | Cooldown + Fallback ל־Yahoo |
| Alpha "no API key" | Yahoo כ־Primary ל־Prices |

---

## 6. סקריפטים

| סקריפט | תיאור |
|--------|--------|
| `scripts/verify_dual_provider_full_scope.py` | הרצת FX + Prices sync ו־DB counts |
| `scripts/check_market_data_counts.py` | נוספו `exchange_rates_history` ו־`ticker_prices_intraday` |

---

**log_entry | TEAM_20 | DUAL_PROVIDER_FULL_SCOPE_EVIDENCE | 2026-02-13**
