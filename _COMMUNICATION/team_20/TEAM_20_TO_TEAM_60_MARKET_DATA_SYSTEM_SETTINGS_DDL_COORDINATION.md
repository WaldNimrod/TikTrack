# Team 20 → Team 60 | market_data.system_settings DDL Coordination

**Task:** MD-SETTINGS — DB migration for Market Data System Settings  
**Date:** 2026-01-31  
**Mandate (Team 60):** [TEAM_10_TO_TEAM_60_MARKET_DATA_SETTINGS_UI_MANDATE](../team_10/TEAM_10_TO_TEAM_60_MARKET_DATA_SETTINGS_UI_MANDATE.md)

---

## DDL File

**Path:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_MARKET_DATA_SYSTEM_SETTINGS_DDL.sql`

## Keys (aligned with TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT)

| key | value_type | notes |
|-----|------------|-------|
| max_active_tickers | integer | 1–500, default 50 |
| intraday_interval_minutes | integer | 5–240, default 15 |
| provider_cooldown_minutes | integer | 5–120, default 15 |
| max_symbols_per_request | integer | 1–50, default 5 |
| delay_between_symbols_seconds | integer | 0–30, default 0 |
| intraday_enabled | boolean | default true |

## Team 20 Readiness

- API and service layer will use this table once it exists.
- If table is missing, GET falls back to env; PATCH returns 503 with guidance.

**log_entry | TEAM_20 | DDL_COORDINATION | TO_TEAM_60 | 2026-01-31**
