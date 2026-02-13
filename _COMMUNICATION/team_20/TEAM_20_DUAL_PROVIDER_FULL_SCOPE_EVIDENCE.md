# Team 20 — Dual Provider + Full Scope Evidence

**id:** TEAM_20_DUAL_PROVIDER_FULL_SCOPE_EVIDENCE  
**מקור:** TEAM_10_TO_TEAM_20_DUAL_PROVIDER_AND_FULL_SCOPE_EVIDENCE_MANDATE  
**תאריך:** 2026-02-13

---

## 1. FX — Alpha → Yahoo

| פריט | תוכן |
|------|------|
| **Primary** | Alpha Vantage |
| **Fallback** | Yahoo |
| **תוצאה** | 5 שורות ב־exchange_rates ו־exchange_rates_history |

---

## 2. Prices (EOD) — Yahoo → Alpha

| פריט | תוכן |
|------|------|
| **Primary** | Yahoo Finance |
| **Fallback** | Alpha Vantage |
| **מקור טיקרים** | טיקרים נטענים מ־market_data.tickers |

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
| **טבלה** | ticker_prices_intraday קיימת (P3-016) |
| **סקריפט** | `scripts/sync_ticker_prices_intraday.py` — Yahoo→Alpha |
| **Make target** | `make sync-intraday` |
| **Cron** | Team 60 — `*/15 * * * 1-5` (או לפי INTRADAY_INTERVAL_MINUTES) |

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
| **scripts/verify_dual_provider_full_scope.py** | הרצת FX + Prices sync ו־DB counts (Evidence run) |
| **scripts/sync_ticker_prices_intraday.py** | Intraday sync — ticker_prices_intraday |
| **scripts/check_market_data_counts.py** | ספירות: tickers, ticker_prices, exchange_rates, exchange_rates_history, ticker_prices_intraday |

**הרצה:**  
`python3 scripts/verify_dual_provider_full_scope.py` — מריץ sync-eod, sync-ticker-prices, מונה שורות, ויכול לרשום פלט ל-Evidence.  
`make check-market-data-counts` או `python3 scripts/check_market_data_counts.py` — ספירות בלבד.

---

**log_entry | TEAM_20 | DUAL_PROVIDER_FULL_SCOPE_EVIDENCE | 2026-02-13**
