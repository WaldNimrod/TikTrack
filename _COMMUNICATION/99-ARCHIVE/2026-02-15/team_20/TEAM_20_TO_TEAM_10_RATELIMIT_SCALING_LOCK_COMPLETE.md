# Team 20 → Team 10: מימוש — Rate-Limit & Scaling Lock

**id:** `TEAM_20_TO_TEAM_10_RATELIMIT_SCALING_LOCK_COMPLETE`  
**from:** Team 20 (Backend)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**מקור:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_RATELIMIT_SCALING_LOCK; MARKET_DATA_PIPE_SPEC §8

---

## 1. סיכום

**כל 5 כללי הליבה ו-4 בקרי System Settings מומשו.**  
**טיקרים נטענים מ־market_data.tickers בלבד.**

---

## 2. Core Rules — מימוש

| # | כלל | מימוש |
|---|-----|-------|
| 1 | Cache-First only | Request path — skip_fetch; EOD sync only |
| 2 | Single-Flight refresh | fcntl file lock ב-sync_ticker_prices_eod.py |
| 3 | Cooldown on 429 | provider_cooldown.py — 429 → set_cooldown; skip provider |
| 4 | Fallback enforced | Yahoo→Alpha (Prices), Alpha→Yahoo (FX) |
| 5 | Never block UI | stale + staleness=na |

---

## 3. System Settings

| בקר | מודול | Env |
|-----|-------|-----|
| max_active_tickers | market_data_settings.py | MAX_ACTIVE_TICKERS (default 50) |
| intraday_interval_minutes | market_data_settings.py | INTRADAY_INTERVAL_MINUTES (default 15) |
| provider_cooldown_minutes | market_data_settings.py | PROVIDER_COOLDOWN_MINUTES (default 15) |
| max_symbols_per_request | market_data_settings.py | MAX_SYMBOLS_PER_REQUEST (default 5) |

---

## 4. טיקרים מ-DB בלבד

- **sync_ticker_prices_eod.py** — load_tickers() מ-market_data.tickers
- **verify_live_providers.py** — load_tickers_from_db() מ-market_data.tickers
- **seed_market_data_tickers.py** — הזנת AAPL, MSFT, TSLA, GOOGL, AMZN

**פקודה:** `make seed-tickers` או `python3 scripts/seed_market_data_tickers.py`

---

## 5. קבצים

| קובץ | שינוי |
|------|--------|
| api/integrations/market_data/market_data_settings.py | חדש — 4 בקרים |
| api/integrations/market_data/provider_cooldown.py | חדש — cooldown on 429 |
| scripts/sync_ticker_prices_eod.py | Single-Flight, Cooldown, max_active_tickers, טיקרים מ-DB |
| scripts/verify_live_providers.py | טיקרים מ-DB |
| scripts/seed_market_data_tickers.py | חדש — seed טיקרים |
| Makefile | make seed-tickers |

---

**Evidence:** documentation/05-REPORTS/artifacts/TEAM_20_RATELIMIT_SCALING_LOCK_EVIDENCE.md

---

**log_entry | TEAM_20 | TO_TEAM_10 | RATELIMIT_SCALING_LOCK_COMPLETE | 2026-02-13**
