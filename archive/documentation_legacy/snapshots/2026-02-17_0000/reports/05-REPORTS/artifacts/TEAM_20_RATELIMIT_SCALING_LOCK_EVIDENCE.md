# Team 20 — Rate-Limit & Scaling Lock — Evidence

**id:** TEAM_20_RATELIMIT_SCALING_LOCK_EVIDENCE  
**date:** 2026-02-13  
**מקור:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_RATELIMIT_SCALING_LOCK

---

## 1. Core Rules — מימוש

| כלל | מימוש |
|-----|-------|
| **Cache-First only** | cache_first_service — skip_fetch ב-request path; EOD sync only fetches |
| **Single-Flight refresh** | sync_ticker_prices_eod.py — fcntl file lock; job שני יוצא |
| **Cooldown on 429** | provider_cooldown.py + fetch loop — 429 → set_cooldown; skip provider ב-window |
| **Fallback enforced** | Yahoo→Alpha (Prices), Alpha→Yahoo (FX) |
| **Never block UI** | stale + staleness=na on failure |

---

## 2. System Settings — בקרים

| בקר | מיקום | Default |
|-----|--------|---------|
| max_active_tickers | market_data_settings.get_max_active_tickers() | 50 |
| intraday_interval_minutes | market_data_settings.get_intraday_interval_minutes() | 15 |
| provider_cooldown_minutes | market_data_settings.get_provider_cooldown_minutes() | 15 |
| max_symbols_per_request | market_data_settings.get_max_symbols_per_request() | 5 |

**Env override:** MAX_ACTIVE_TICKERS, INTRADAY_INTERVAL_MINUTES, PROVIDER_COOLDOWN_MINUTES, MAX_SYMBOLS_PER_REQUEST

---

## 3. טיקרים מ-DB בלבד

| סקריפט | מקור |
|--------|------|
| sync_ticker_prices_eod.py | market_data.tickers (load_tickers) |
| verify_live_providers.py | market_data.tickers (load_tickers_from_db) |
| seed_market_data_tickers.py | מוסיף AAPL, MSFT, TSLA, GOOGL, AMZN אם חסרים |

**פקודה ל-seed:** `python3 scripts/seed_market_data_tickers.py`

---

## 4. קבצים

| קובץ | תיאור |
|------|--------|
| api/integrations/market_data/market_data_settings.py | System Settings — 4 בקרים |
| api/integrations/market_data/provider_cooldown.py | Cooldown on 429 |
| scripts/sync_ticker_prices_eod.py | Single-Flight, Cooldown, max_active_tickers |
| scripts/verify_live_providers.py | טיקרים מ-DB |
| scripts/seed_market_data_tickers.py | הזנת טיקרים בסיסיים |

---

**log_entry | TEAM_20 | RATELIMIT_SCALING_LOCK_EVIDENCE | 2026-02-13**
