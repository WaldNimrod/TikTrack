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
| **Intraday Sync** | `*/15 * * * 1-5` | `make sync-intraday` | ticker_prices_intraday (Active tickers; Yahoo→Alpha) |

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
| `scripts/sync_ticker_prices_intraday.py` | Intraday ticker_prices_intraday (Active tickers) |
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

**log_entry | TEAM_60 | CRON_SCHEDULE | SSOT_ALIGNED | 2026-02-13**
