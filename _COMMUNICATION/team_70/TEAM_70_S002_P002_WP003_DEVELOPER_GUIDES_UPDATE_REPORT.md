# TEAM_70 | S002-P002-WP003 DEVELOPER_GUIDES_UPDATE_REPORT (GATE_8)

**project_domain:** TIKTRACK  
**id:** TEAM_70_S002_P002_WP003_DEVELOPER_GUIDES_UPDATE_REPORT  
**from:** Team 70 (Knowledge Librarian — GATE_8 executor)  
**to:** Team 90 (GATE_8 owner), Team 10 (Gateway)  
**date:** 2026-03-13  
**status:** DELIVERABLE  
**gate_id:** GATE_8  
**work_package_id:** S002-P002-WP003 (Market Data Hardening)

---

## Mandatory Identity Header

| Field | Value |
|-------|--------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP003 |
| task_id | N/A |
| gate_id | GATE_8 |
| phase_owner | Team 90 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
| project_domain | TIKTRACK |

---

## 1. As-built behavior summary (WP003 market-data hardening)

- **Alpha Vantage:** Daily quota 25 calls (UTC day); tracked in `provider_cooldown.py` (`ALPHA_DAILY_LIMIT`, `increment_alpha_calls()`, `get_alpha_remaining_today()`). Quota checked before each call; on exhaustion, `AlphaQuotaExhaustedException` and 24h cooldown. `get_ticker_price` does **not** call `_fetch_market_cap` (saves 1 call per ticker).
- **Yahoo Finance:** On 429, retry with **exponential backoff** 5s → 10s → 20s (v8 chart last-close and history). **100ms** delay between batch chunks in `_fetch_prices_batch_sync`. **1 second** default between symbols (`delay_between_symbols_seconds` in `market_data_settings.py`).
- **EOD sync (`sync_ticker_prices_eod.py`):** `ALPHA_FX_RESERVE=8`. Alpha used for non-CRYPTO only when `remaining > 8`; for CRYPTO always (quota-checked). Quota status logged at sync start.
- **Intraday sync (`sync_ticker_prices_intraday.py`):** Alpha for non-CRYPTO **never**; Alpha for CRYPTO only when quota > reserve.

**Evidence-by-path (SSOT):**

| Topic | Path |
|-------|------|
| Alpha quota, FX reserve, EOD/Intraday policy | `documentation/docs-system/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md` §8.5 |
| Yahoo 429 retry, batch delay, delay_between_symbols | `documentation/docs-system/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md` §8.4; `YAHOO_FINANCE_DATA_AND_REQUEST_LOGIC.md` §6.3 |
| Root causes, daily Alpha budget table | `documentation/docs-system/01-ARCHITECTURE/LOGIC/TT2_MARKET_DATA_RESILIENCE.md` §2 |
| Rate-limit / scaling (Rule 8) | `documentation/docs-system/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md` Rule 8 |

---

## 2. Runtime / ops notes (relevant for future cycles)

- **Cron / scheduler:** EOD and intraday sync scripts respect `delay_between_symbols_seconds` (default 1s). Do not set to 0 in production to avoid Yahoo 429 burst.
- **Alpha key:** 25 free-tier calls/day. FX sync (5 pairs) is independent; reserve 8 for FX so equity fallback uses at most 17 when Yahoo is in cooldown.
- **Cooldown:** On Yahoo 429, `PROVIDER_COOLDOWN_MINUTES` (default 15) applies; no Yahoo calls until cooldown expires. Alpha has separate 24h cooldown when quota exhausted.

---

## 3. Known caveats (non-blocking, carry to maintenance)

- **Market cap:** Single-ticker price from Alpha no longer returns `market_cap` (field `None`). Market-cap data remains available via other flows (e.g. EOD batch) where documented.
- **Manual testing:** After heavy Yahoo usage (e.g. `test-providers-direct`), allow 15–30 minutes before further runs to avoid 429.

---

## 4. Canonical pointers (runbooks / contracts only)

| Asset | Path |
|-------|------|
| Market Data Pipe SSOT | `documentation/docs-system/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md` |
| Yahoo data & request logic | `documentation/docs-system/01-ARCHITECTURE/YAHOO_FINANCE_DATA_AND_REQUEST_LOGIC.md` |
| Market Data Resilience | `documentation/docs-system/01-ARCHITECTURE/LOGIC/TT2_MARKET_DATA_RESILIENCE.md` |
| Coverage matrix | `documentation/docs-system/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md` |

---

**log_entry | TEAM_70 | S002_P002_WP003_DEVELOPER_GUIDES_UPDATE_REPORT | GATE_8 | 2026-03-13**
