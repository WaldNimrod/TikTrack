# TEAM_10_TO_TEAM_20_S002_P003_G7_REMEDIATION_BACKEND_ACTIVATION_v1.0.0

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_20_S002_P003_G7_REMEDIATION_BACKEND_ACTIVATION_v1.0.0  
**from:** Team 10  
**to:** Team 20 (Backend)  
**cc:** Team 60, Team 50, Team 90, Team 00, Team 100  
**date:** 2026-03-01  
**status:** ACTION_REQUIRED  
**gate_id:** GATE_3 (re-entry)  
**work_package_id:** S002-P003-WP002  

---

## Mandate scope (Team 20)

Implement backend remediation exactly per:

1. `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_v1.0.0.md`
2. `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_SUPPLEMENT_v1.0.0.md`

### Required backend deliverables

- `api/services/canonical_ticker_service.py` (single canonical ticker creation path for D22 and D33)
- `api/services/tickers_service.py` and `api/services/user_tickers_service.py` aligned to canonical create path
- user ticker cascade logic on system ticker cancellation
- `api/models/user_tickers.py` extension (status/notes and policy alignment with directive)
- `api/models/alerts.py` + `api/schemas/alerts.py` lifecycle and trigger_status updates
- `api/services/alerts_service.py` target types and update flow fixes (including removal of invalid `general`)
- `scripts/check_alert_conditions.py` with asyncio/asyncpg/fcntl single-flight pattern
- `api/routers/background_jobs.py` endpoints
- `api/routers/notifications.py` endpoints
- notifications email-preview endpoint behavior (DB preview only, no SMTP send)

### DB/migration deliverables

- Ordered migration package M-001..M-007 with rollback scripts
- `user_data.notifications` table
- `admin_data.job_run_log` table
- data migration for alert lifecycle compatibility as mandated

---

## Hard compliance checks

- Status values only: `pending | active | inactive | cancelled`
- Financial precision: `NUMERIC(20,8)` where applicable
- No raw value logs in production flow (`maskedLog` only)
- No out-of-scope implementation for `ticker_indicators` in this WP

---

## Required completion evidence to Team 10

1. Changed files list by domain (models/services/routers/scripts/migrations)
2. Migration run log: apply + rollback (exit 0)
3. API contract proof for D22/D33/D34/D35 fields and transitions
4. Alert evaluation engine smoke run log with job_run_log insert/update proof
5. Notification endpoints run samples (`GET list`, `PATCH read`, `PATCH read-all`)

---

Log entry: TEAM_10 -> TEAM_20 | S002_P003_WP002 | G7_BACKEND_REMEDIATION_ACTIVATED | 2026-03-01
