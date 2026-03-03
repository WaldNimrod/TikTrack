# TEAM 170 -> TEAM 10 | DDL V2.6 Delivery Confirmation

**project_domain:** TIKTRACK  
**id:** TEAM_170_DDL_V2.6_DELIVERY_CONFIRMATION_v1.0.0  
**from:** Team 170 (Spec / Governance / Documentation)  
**to:** Team 10 (Execution Orchestrator)  
**cc:** Team 00, Team 20, Team 100, Team 190  
**date:** 2026-03-03  
**status:** DELIVERED  
**relates_to:** TEAM_00_TO_TEAM_170_DDL_RECONCILIATION_ACTIVATION_v1.0.0.md  

---

## 1) Delivery Artifact

- `documentation/docs-system/02-SERVER/PHX_DB_SCHEMA_V2.6_FULL_DDL.sql`

V2.5 retained as requested:

- `documentation/docs-system/02-SERVER/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (unchanged)

---

## 2) Corrections Applied

1. **KB-001 (partial unique constraints syntax):**
   - Converted inline partial unique constraints to separate partial unique indexes:
     - `market_data.tickers`
     - `user_data.user_api_keys`
   - Structural normalization also applied to additional inline partial unique constraints found in file to enforce parser-safe style consistently.

2. **KB-002 (missing tables):**
   - Added:
     - `user_data.user_refresh_tokens`
     - `user_data.revoked_tokens`
   - Included PK/FK/check constraints + indexes + comments.

3. **KB-003 (table rename):**
   - Replaced legacy name with canonical table:
     - `user_data.brokers_fees` -> `user_data.trading_account_fees`
   - Updated related index names, constraint names, and comments.

4. **exchange_rates directive correction (Team 00):**
   - DDL V2.6 now explicitly documents `market_data.exchange_rates.conversion_rate NUMERIC(20,8)`.
   - `rate` is not used as the DB column in the DDL artifact.

---

## 3) Validation Results

### 3.1 Syntax/tooling availability

- `psql` client: not available in this runtime environment (`command not found`)
- external SQL parser modules (`sqlfluff`, `sqlparse`): not available in this runtime environment

### 3.2 Structural validation checks (executed)

- `CREATE TABLE` blocks containing `WHERE`: **0**
- inline partial unique pattern `UNIQUE (...) WHERE`: **0**
- presence of required tables:
  - `user_data.user_refresh_tokens`: **TRUE**
  - `user_data.revoked_tokens`: **TRUE**
- legacy name grep (`brokers_fees`) in V2.6: **FALSE** (zero occurrences)

Result: **DDL V2.6 structural validation PASS** for KB-001/002/003 reconciliation scope.

---

## 4) Prerequisite Trace

Prerequisite intake document received:

- `_COMMUNICATION/team_20/TEAM_20_PRODUCTION_SCHEMA_CONFIRMATION_v1.0.0.md`

---

log_entry | TEAM_170 | DDL_V2.6_DELIVERY_CONFIRMATION | KB-001_002_003_APPLIED_AND_VALIDATED | 2026-03-03
log_entry | TEAM_170 | DDL_V2.6_DELIVERY_CONFIRMATION | EXCHANGE_RATES_CONVERSION_RATE_CORRECTION_APPLIED | 2026-03-03
