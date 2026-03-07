# Team 20 → Team 10 | S002-P003-WP002 G7 Backend Remediation — Evidence Bundle

**project_domain:** TIKTRACK  
**id:** TEAM_20_S002_P003_WP002_G7_BACKEND_REMEDIATION_EVIDENCE_BUNDLE  
**in_response_to:** TEAM_10_TO_TEAM_20_S002_P003_G7_REMEDIATION_BACKEND_ACTIVATION_v1.0.0  
**from:** Team 20 (Backend Implementation)  
**to:** Team 10 (Execution Orchestrator)  
**cc:** Team 60, Team 50, Team 90  
**date:** 2026-03-01  
**status:** PASS  
**scope:** D22, D33, D34, D35 (Phase A + Phase B)  

---

## 1) Status

**PASS** — Phase A migrations and Phase B services/routes delivered. No blocking IDs.

---

## 2) Changed files

### Migrations (Phase A)
| File | Purpose |
|------|---------|
| `scripts/migrations/g7_M001_user_tickers_status_notes.sql` | user_tickers + status, notes |
| `scripts/migrations/g7_M001_rollback.sql` | Rollback M-001 |
| `scripts/migrations/g7_M002_alerts_trigger_status.sql` | alerts + trigger_status |
| `scripts/migrations/g7_M002_rollback.sql` | Rollback M-002 |
| `scripts/migrations/g7_M003_notifications.sql` | user_data.notifications |
| `scripts/migrations/g7_M003_rollback.sql` | Rollback M-003 |
| `scripts/migrations/g7_M004_admin_data_schema.sql` | admin_data schema |
| `scripts/migrations/g7_M004_rollback.sql` | Rollback M-004 |
| `scripts/migrations/g7_M005_job_run_log.sql` | admin_data.job_run_log |
| `scripts/migrations/g7_M005_rollback.sql` | Rollback M-005 |
| `scripts/migrations/g7_M005b_grant_admin_data.sql` | Grant TikTrackDbAdmin on admin_data |
| `scripts/migrations/g7_M006_tickers_status_verify.sql` | market_data.tickers status |
| `scripts/migrations/g7_M006_rollback.sql` | Rollback M-006 |
| `scripts/migrations/g7_M007_alerts_data_migration.sql` | Backfill trigger_status |
| `scripts/migrations/g7_M007_rollback.sql` | Rollback M-007 (no-op) |

### Models
| File | Change |
|------|--------|
| `api/models/user_tickers.py` | + status, notes (G7 M-001) |
| `api/models/alerts.py` | + trigger_status |
| `api/models/notification.py` | **NEW** — user_data.notifications |

### Services
| File | Change |
|------|--------|
| `api/services/canonical_ticker_service.py` | **NEW** — single ticker creation path |
| `api/services/tickers_service.py` | create_ticker → delegates to canonical |
| `api/services/user_tickers_service.py` | add_ticker → create_system_ticker when new |
| `api/services/alerts_service.py` | trigger_status in response + PATCH |

### Schemas
| File | Change |
|------|--------|
| `api/schemas/alerts.py` | + trigger_status in AlertUpdate, AlertResponse |

### Routers
| File | Change |
|------|--------|
| `api/routers/notifications.py` | **NEW** — GET, PATCH read, PATCH read-all |
| `api/main.py` | + notifications router |

### Scripts
| File | Change |
|------|--------|
| `scripts/check_alert_conditions.py` | **NEW** — job_run_log integration, fcntl lock |

### Makefile
| Target | Purpose |
|--------|----------|
| `make migrate-g7-M001` .. `make migrate-g7-M007` | Apply migrations |
| `make migrate-g7-all` | Apply all M-001..M-007 |
| `make rollback-g7-all` | Rollback Phase A |

---

## 3) Migration apply/rollback — exit 0

```
make migrate-g7-all   → EXIT=0
make rollback-g7-all → EXIT=0
make migrate-g7-all   → EXIT=0 (re-apply)
```

**Evidence path:** `Makefile` (lines 104–151)

---

## 4) API contract proofs

| Check | Result | Proof |
|-------|--------|-------|
| GET /alerts — trigger_status in response | ✅ | `trigger_status` field present |
| PATCH /alerts/{id} — trigger_status update | ✅ | PATCH returns `trigger_status: triggered_read` |
| GET /notifications | ✅ | `{ count, items }` schema |
| PATCH /notifications/{id}/read | ✅ | 204 |
| PATCH /notifications/read-all | ✅ | 204 |

---

## 5) Job-run log proof

```
scripts/check_alert_conditions.py → EXIT=0
Output: ✅ check_alert_conditions: checked=2 triggered=0 errors=0
```

**admin_data.job_run_log sample:**
```
job_name              | status  | records_processed
check_alert_conditions| success | 2
```

**Evidence path:** `scripts/check_alert_conditions.py`  
**Prerequisite:** `scripts/migrations/g7_M005b_grant_admin_data.sql` (grant TikTrackDbAdmin)

---

## 6) Deferred (Phase C/D — out of current scope)

- `api/routers/background_jobs.py` — admin job history UI backend
- Email preview endpoint — DB preview only
- Full alert condition evaluation (crosses_above/crosses_below) — script structure in place

---

## 7) Artifact paths

| Artifact | Path |
|----------|------|
| Evidence bundle | `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_20_S002_P003_WP002_G7_BACKEND_REMEDIATION_EVIDENCE_BUNDLE_v1.0.0.md` |
| Migrations | `scripts/migrations/g7_M*.sql` |
| Canonical ticker service | `api/services/canonical_ticker_service.py` |
| Notifications router | `api/routers/notifications.py` |
| Alert evaluation script | `scripts/check_alert_conditions.py` |

---

**log_entry | TEAM_20 | TO_TEAM_10 | S002_P003_WP002 | G7_BACKEND_REMEDIATION_EVIDENCE | PASS | 2026-03-01**
