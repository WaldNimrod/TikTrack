# TEAM_20 → TEAM_170 | PRODUCTION SCHEMA CONFIRMATION

**project_domain:** TIKTRACK  
**id:** TEAM_20_PRODUCTION_SCHEMA_CONFIRMATION_v1.0.0  
**from:** Team 20 (Backend)  
**to:** Team 170 (Schema Authority)  
**cc:** Team 10, Team 00  
**date:** 2026-01-31  
**status:** ACTIVE  
**prerequisite_for:** DDL V2.6  

---

## 1) Required tables — schema verification

Team 170: Run the following against TARGET_RUNTIME (production) and paste output for DDL V2.6 alignment.

### SQL to execute

```sql
-- 1. tickers (confirm partial unique constraint)
SELECT column_name, data_type, character_maximum_length, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_schema='market_data' AND table_name='tickers'
ORDER BY ordinal_position;

-- 2. user_api_keys
SELECT column_name, data_type, character_maximum_length, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_schema='user_data' AND table_name='user_api_keys'
ORDER BY ordinal_position;

-- 3. user_refresh_tokens
SELECT column_name, data_type, character_maximum_length, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_schema='user_data' AND table_name='user_refresh_tokens'
ORDER BY ordinal_position;

-- 4. revoked_tokens
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema='user_data' AND table_name='revoked_tokens'
ORDER BY ordinal_position;

-- 5. trading_account_fees (NOT brokers_fees)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema='user_data' AND table_name='trading_account_fees'
ORDER BY ordinal_position;

-- 6. exchange_rates (column: rate OR conversion_rate per migration)
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_schema='market_data' AND table_name='exchange_rates'
ORDER BY ordinal_position;

-- 7. ticker_prices (market_cap NUMERIC(24,4) per p3_019)
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_schema='market_data' AND table_name='ticker_prices'
AND column_name IN ('price', 'market_cap')
ORDER BY ordinal_position;
```

---

## 2) Expected state (per migrations)

| Table | Expectation |
|-------|-------------|
| tickers | Partial unique via separate index (not inline) |
| user_api_keys | Partial unique via separate index (not inline) |
| user_refresh_tokens | Exists, full column list |
| revoked_tokens | Exists, full column list |
| trading_account_fees | Name is `trading_account_fees` (NOT brokers_fees) |
| exchange_rates | Column `conversion_rate` (actual DB; DDL V2.6) — KB-004 correction: rate was wrong |
| ticker_prices | `market_cap` NUMERIC(24,4) per p3_019 |

---

## 3) Team 20 execution (2026-01-31)

Script `api/scripts/run_schema_confirmation.py` executed against configured DATABASE_URL. Output:

**Artifact:** `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_20_SCHEMA_CONFIRMATION_OUTPUT.md`

**Summary:**
| Table | Status | Note |
|-------|--------|------|
| tickers | ✅ | Columns verified |
| user_api_keys | ✅ | Columns verified |
| user_refresh_tokens | ✅ | Exists, full column list |
| revoked_tokens | ✅ | Exists, full column list |
| trading_account_fees | ✅ | Name correct (NOT brokers_fees) |
| exchange_rates | ✅ | Column `conversion_rate` (actual DB; DDL V2.6) — KB-004 correction applied |
| ticker_prices | ✅ | market_cap NUMERIC(24,4) per p3_019 |

---

## 4) Team 20 note

When TARGET_RUNTIME differs from local DB, Team 170 should re-run the SQL above and align. **KB-004 correction:** דוח KB-004 המקורי טעה — ה-DB תמיד היה `conversion_rate`. DDL V2.6 יתעד `conversion_rate` כמצב DB אמיתי.

---

**log_entry | TEAM_20 | TO_TEAM_170 | PRODUCTION_SCHEMA_CONFIRMATION | DONE | 2026-01-31**
