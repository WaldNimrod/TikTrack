# Team 60: Cron / Job Schedule — External Data (SSOT-aligned)

**מקור:** TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE §6.3  
**date:** 2026-02-13

---

## EOD Jobs (UTC, Mon–Fri)

| Job | Cron | Make target | תיאור |
|-----|------|-------------|-------|
| **FX Sync** | `0 22 * * 1-5` | `make sync-eod` | exchange_rates + exchange_rates_history (Alpha→Yahoo) |
| **Ticker Sync** | `5 22 * * 1-5` | `make sync-ticker-prices` | ticker_prices (Yahoo→Alpha) |
| **Cleanup** | `30 22 * * 1-5` | `make cleanup-market-data` | Intraday 30d, Daily 250d, FX history 250d |

---

## Scripts

| Script | תפקיד |
|--------|-------|
| `scripts/sync_exchange_rates_eod.py` | INSERT history + UPSERT exchange_rates |
| `scripts/sync_ticker_prices_eod.py` | EOD ticker prices (Team 20) |
| `scripts/cleanup_market_data.py` | Retention: intraday, daily, fx_history |

---

**log_entry | TEAM_60 | CRON_SCHEDULE | SSOT_ALIGNED | 2026-02-13**
