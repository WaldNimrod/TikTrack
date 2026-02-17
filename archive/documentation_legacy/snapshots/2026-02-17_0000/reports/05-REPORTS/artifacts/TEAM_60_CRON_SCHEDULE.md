# Team 60: Cron / Job Schedule — External Data (SSOT-aligned)

**מקור:** TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE §6.3  
**date:** 2026-02-13

---

## EOD Jobs (UTC, Mon–Fri)

| Job | Cron | Make target | תיאור |
|-----|------|-------------|-------|
| **History Backfill** | `0 21 * * 1-5` | `make sync-history-backfill` | 250d OHLCV לטיקרים עם < 250 שורות (Indicators) |
| **FX Sync** | `0 22 * * 1-5` | `make sync-eod` | exchange_rates + exchange_rates_history (Alpha→Yahoo) |
| **Ticker Sync** | `5 22 * * 1-5` | `make sync-ticker-prices` | ticker_prices (Yahoo→Alpha) |
| **Cleanup** | `30 22 * * 1-5` | `make cleanup-market-data` | Intraday 30d, Daily 250d, FX history 250d |

---

## Intraday Job (UTC, Mon–Fri)

| Job | Cron | Make target | תיאור |
|-----|------|-------------|-------|
| **Intraday Sync** | `*/15 * * * 1-5` | `make sync-intraday` | ticker_prices_intraday — טיקרים עם is_active=true (Yahoo→Alpha). מקור: TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT |

**תזמון:** מתוך System Settings `INTRADAY_INTERVAL_MINUTES` (ברירת מחדל 15).  
**מקור:** Team 20 — TEAM_20_TO_TEAM_60_ENV_AND_INTRADAY_COORDINATION_REQUEST; MARKET_DATA_PIPE_SPEC §7.1.

---

## Cron Wrapper (טעינת .env)

```bash
# דוגמה — טוען api/.env ומריץ job:
./scripts/run_market_data_job.sh sync-history-backfill
./scripts/run_market_data_job.sh sync-eod
./scripts/run_market_data_job.sh sync-ticker-prices
./scripts/run_market_data_job.sh sync-intraday
./scripts/run_market_data_job.sh cleanup-market-data
```

**Crontab דוגמה:**
```
0 21 * * 1-5 cd /path/to/TikTrackAppV2-phoenix && ./scripts/run_market_data_job.sh sync-history-backfill
0 22 * * 1-5 cd /path/to/TikTrackAppV2-phoenix && ./scripts/run_market_data_job.sh sync-eod
5 22 * * 1-5 cd /path/to/TikTrackAppV2-phoenix && ./scripts/run_market_data_job.sh sync-ticker-prices
*/15 * * * 1-5 cd /path/to/TikTrackAppV2-phoenix && ./scripts/run_market_data_job.sh sync-intraday
30 22 * * 1-5 cd /path/to/TikTrackAppV2-phoenix && ./scripts/run_market_data_job.sh cleanup-market-data
```

---

## Scripts

| Script | תפקיד |
|--------|-------|
| `scripts/sync_ticker_prices_history_backfill.py` | 250d OHLCV backfill (tickers with < 250 rows) |
| `scripts/sync_exchange_rates_eod.py` | INSERT history + UPSERT exchange_rates |
| `scripts/sync_ticker_prices_eod.py` | EOD ticker prices (uses max_active_tickers, provider_cooldown) |
| `scripts/sync_ticker_prices_intraday.py` | Intraday ticker_prices_intraday — טיקרים עם is_active=true. מקור: TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT |
| `scripts/cleanup_market_data.py` | Retention: intraday, daily, fx_history |

---

## System Settings (env) — Rate‑Limit & Scaling §8.3

Jobs read from `api/integrations/market_data/market_data_settings.py` → env vars:

| Var | Default | תיאור |
|-----|---------|-------|
| MAX_ACTIVE_TICKERS | 50 | Max active tickers for intraday |
| INTRADAY_INTERVAL_MINUTES | 15 | Intraday refresh interval |
| PROVIDER_COOLDOWN_MINUTES | 15 | Cooldown after 429 |
| MAX_SYMBOLS_PER_REQUEST | 5 | Max symbols per batch |

**תיאום Team 20:** ערכים מוגדרים ב־`market_data_settings.py`; cron/jobs קוראים אותם.

---

## User Tickers — Crypto + Provider Mapping (Corrective)

**מקור:** `TEAM_10_TO_TEAM_60_USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE.md` | `TEAM_10_USER_TICKERS_CRYPTO_EXCHANGE_GAPS_AND_CORRECTIVE_PLAN`

| דרישה | סטטוס |
|--------|--------|
| Jobs (EOD, Intraday, History Backfill) משתמשים ב־**מיפוי ספקים** (symbol+market) בעת fetch | **תלות ב־Team 20** — הלוגיקה בסקריפטים; Team 60 מריץ |
| **אין** סינון/החרגה של `ticker_type=CRYPTO` | ✅ Jobs טוענים מטבלת tickers לפי `is_active` — אין החרגת קריפטו |
| אין שינוי ב־cron/env שימנע טעינת קריפטו | ✅ אין תוכנן |

**תאום:** `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_20_USER_TICKERS_CRYPTO_EXCHANGE_COORDINATION.md`

---

**log_entry | TEAM_60 | CRON_SCHEDULE | SSOT_ALIGNED | 2026-02-13**
**log_entry | TEAM_60 | CRON_SCHEDULE | USER_TICKERS_CRYPTO_CORRECTIVE | 2026-02-14**
