# Team 20 → Team 10 | Market Data Settings UI (MD-SETTINGS) — Implementation Evidence
**project_domain:** TIKTRACK

**Task:** MD-SETTINGS (Market Data Settings UI)  
**Mandate:** [TEAM_10_TO_TEAM_20_MARKET_DATA_SETTINGS_UI_MANDATE](../../_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_MARKET_DATA_SETTINGS_UI_MANDATE.md)  
**SSOT:** [TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT](../09-GOVERNANCE/TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT.md)  
**Date:** 2026-01-31  
**Status:** Implementation complete — awaiting Team 60 migration + Gate-A for Seal (SOP-013)

---

## 1. Deliverables Summary

| # | Criterion | Implementation |
|---|-----------|----------------|
| 1 | API GET + PATCH `/settings/market-data` | ✅ `api/routers/settings.py` — Admin-only via `require_admin_role` |
| 2 | Service layer DB > env | ✅ `api/integrations/market_data/market_data_settings.py` — reads from `market_data.system_settings` first, falls back to env |
| 3 | Validation min/max per SSOT | ✅ PATCH validates all keys; returns 422 for out-of-range |
| 4 | Audit (updated_by, updated_at) | ✅ PATCH persists to DB with `updated_by` = current user, `updated_at` = NOW() |
| 5 | delay_between_symbols_seconds in sync scripts | ✅ `sync_ticker_prices_intraday.py`, `sync_ticker_prices_eod.py`, `sync_ticker_prices_history_backfill.py` |
| 6 | intraday_enabled skip | ✅ Intraday script checks at start; exits with log if `false` |

---

## 2. Files Modified/Created

### Created
- `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_MARKET_DATA_SYSTEM_SETTINGS_DDL.sql` — DDL for Team 60 coordination

### Modified
- `api/integrations/market_data/market_data_settings.py` — DB > env, `get_delay_between_symbols_seconds()`, `get_intraday_enabled()`, `get_all_settings()`, `get_ssot_constraints()`
- `api/routers/settings.py` — Extended GET with new fields; PATCH with validation 400/403/422
- `scripts/sync_ticker_prices_intraday.py` — intraday_enabled skip; delay between symbols
- `scripts/sync_ticker_prices_eod.py` — delay between symbols
- `scripts/sync_ticker_prices_history_backfill.py` — delay between symbols

---

## 3. API Contract

### GET `/api/v1/settings/market-data` (Admin-only)
**Response:**
```json
{
  "max_active_tickers": 50,
  "intraday_interval_minutes": 15,
  "provider_cooldown_minutes": 15,
  "max_symbols_per_request": 5,
  "delay_between_symbols_seconds": 0,
  "intraday_enabled": true
}
```

### PATCH `/api/v1/settings/market-data` (Admin-only)
**Body:** Partial update; only provided keys are updated.
**Responses:** 200 (success), 403 (non-admin), 422 (validation errors), 503 (table not migrated)

---

## 4. Team 60 Coordination

- **DDL:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_MARKET_DATA_SYSTEM_SETTINGS_DDL.sql`
- **Table:** `market_data.system_settings` (key, value, value_type, updated_by, updated_at)
- **Keys:** max_active_tickers, intraday_interval_minutes, provider_cooldown_minutes, max_symbols_per_request, delay_between_symbols_seconds, intraday_enabled
- **Note:** If table does not exist, PATCH returns 503 with guidance; GET works via env fallback.

---

## 5. Closure

- **Evidence:** This report
- **Seal:** Pending Gate-A (Team 50 QA) per SOP-013
- **Next:** Team 60 to run migration; Team 50 to verify; Team 10 to Seal

**log_entry | TEAM_20 | MD_SETTINGS | IMPLEMENTATION_EVIDENCE | 2026-01-31**
