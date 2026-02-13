# Team 60 → Team 10: סיום מנדט Rate‑Limit & Scaling

**id:** `TEAM_60_TO_TEAM_10_RATELIMIT_SCALING_MANDATE_COMPLETE`  
**from:** Team 60 (DevOps & Platform)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**מקור:** TEAM_10_TO_TEAM_60_RATELIMIT_SCALING_MANDATE; TEAM_90_RATELIMIT_SCALING_LOCK

---

## 1. SSOT יישור

תשתית מיושרת ל־MARKET_DATA_PIPE_SPEC §8, MARKET_DATA_COVERAGE_MATRIX Rule #8.

---

## 2. כללי ליבה (תשתית)

| כלל | סטטוס |
|------|--------|
| Cache‑First only | תאום 20 — אין קריאות חיצוניות מ־request path |
| Single‑Flight refresh | Job יחיד (sync_ticker_prices_eod, sync_exchange_rates_eod) |
| Cooldown on 429 | Team 20 — provider_cooldown.py |
| Fallback enforced | Prices: Yahoo→Alpha; FX: Alpha→Yahoo (בסקריפטים) |
| Never block UI | תאום 20/30 |

---

## 3. System Settings (env/config/cron)

| בקרה | מקור | ברירת מחדל | תיאום |
|------|------|------------|--------|
| max_active_tickers | MAX_ACTIVE_TICKERS | 50 | api/.env.example; market_data_settings |
| intraday_interval_minutes | INTRADAY_INTERVAL_MINUTES | 15 | api/.env.example; market_data_settings |
| provider_cooldown_minutes | PROVIDER_COOLDOWN_MINUTES | 15 | api/.env.example; market_data_settings |
| max_symbols_per_request | MAX_SYMBOLS_PER_REQUEST | 5 | api/.env.example; market_data_settings |

**קבצים:**
- `api/.env.example` — תיעוד env vars (אופציונלי, ברירות מחדל בקוד)
- `documentation/05-REPORTS/artifacts/TEAM_60_CRON_SCHEDULE.md` — עדכון: System Settings + קישור ל־market_data_settings

---

## 4. Evidence

- תשתית תומכת בערכי ברירת מחדל ובשליטה ב־env.
- תיאום Team 20: market_data_settings.py קורא מ־env; scripts/sync_ticker_prices_eod.py משתמש.

---

**log_entry | TEAM_60 | TO_TEAM_10 | RATELIMIT_SCALING_MANDATE_COMPLETE | 2026-02-13**
