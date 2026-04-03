date: 2026-03-04
historical_record: true

# Mandates — S003-P003-WP001  ·  G3_PLAN

**Spec:** System Settings — D39 User Preferences (23 fields/6 groups, JSONB settings column migration, GET/PATCH /api/v1/users/preferences, D39 page with collapsible-container template), D40 System Management (7 sections including market data, background tasks, feature_flags table), D41 User Management (role/status management, pagination from D39 rows_per_page). Single WP001. LOD200 approved 2026-03-04. LOD400 to be written at GATE_1.

**Canonical date:** Use `date -u +%F` for today; replace {{date}} in identity headers.

════════════════════════════════════════════════════════════
  EXECUTION ORDER
════════════════════════════════════════════════════════════

  Phase 1:  Team 10   ← runs alone
             ↓  Phase 2 starts ONLY after Phase 1 completes
             💻  Phase 1 done?  →  ./pipeline_run.sh --domain tiktrack phase2

  Phase 2:  Operator   ← runs alone

════════════════════════════════════════════════════════════

## Team 10 — Work Plan Author (Phase 1)

### Your Task

**Environment:** Cursor (Team 10 — Work Plan Generator)

Produce a complete implementation work plan for WP `S003-P003-WP001`.

**Approved Spec (from GATE_1 LLD400):**

# TEAM_170_S003_P003_WP001_LLD400_v1.0.0 — System Settings (D39+D40+D41)

**project_domain:** TIKTRACK  
**id:** TEAM_170_S003_P003_WP001_LLD400  
**from:** Team 170 (Spec & Governance Authority)  
**to:** Team 190 (GATE_1 validation), Team 20/30 (execution)  
**cc:** Team 10, Team 00  
**date:** 2026-03-19  
**status:** SUBMITTED_FOR_GATE_1_VALIDATION  
**gate_id:** GATE_1  
**architectural_approval_type:** SPEC  
**spec_version:** 1.0.0  
**source:** _COMMUNICATION/team_00/TEAM_00_S003_P003_SYSTEM_SETTINGS_LOD200_v1.0.0.md  
**required_ssm_version:** 1.0.0  
**required_wsm_version:** 1.0.0  
**required_active_stage:** S003  
**phase_owner:** Team 100 (GATE_0/GATE_2 authority)

---

## §1 Identity Header

| Field | Value |
|-------|--------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P003 |
| work_package_id | S003-P003-WP001 |
| task_id | N/A |
| gate_id | GATE_1 |
| architectural_approval_type | SPEC |
| spec_version | 1.0.0 |
| date | 2026-03-19 |
| source | TEAM_00_S003_P003_SYSTEM_SETTINGS_LOD200_v1.0.0.md |
| required_ssm_version | 1.0.0 |
| required_wsm_version | 1.0.0 |
| required_active_stage | S003 |
| phase_owner | Team 100 |

---

## §2 Endpoint Contract

### 2.1 D39 — User Preferences

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/me/preferences` | Bearer JWT | Return all 23 preference fields for current user |
| PATCH | `/api/v1/me/preferences` | Bearer JWT | Partial update; merge into `settings` JSONB + direct columns |

**GET /api/v1/me/preferences — Response 200**

```json
{
  "language": "en",
  "timezone": "UTC",
  "primary_currency": "USD",
  "date_format": "YYYY-MM-DD",
  "default_trading_account": null,
  "default_order_type": "LIMIT",
  "default_time_in_force": "DAY",
  "default_commission_unit": "%",
  "pl_method": "FIFO",
  "default_price_type": "CLOSE",
  "email_notifications_enabled": false,
  "alert_trigger_email": true,
  "weekly_summary_email": false,
  "price_alert_threshold_pct": 5.0,
  "default_status_filter": "active",
  "rows_per_page": 25,
  "default_sort_column": "updated_at",
  "api_rate_limit": 1000,
  "api_key_count": 0,
  "high_contrast_mode": false,
  "font_size": "medium",
  "rtl_mode": false,
  "decimal_separator": "."
}
```

**PATCH /api/v1/me/preferences — Request Body**

Any subset of the 23 fields. Keys map as follows:
- `timezone`, `language` → direct column update on `user_data.users`
- All others → JSONB merge into `settings`

```json
{
  "timezone": "America/New_York",
  "rows_per_page": 50
}
```

**PATCH — Response 200:** Same shape as GET response with merged values.

**Error responses:** 401 (unauthenticated), 422 (validation error on field value).

---

### 2.2 D40 — System Management (Admin-only)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/settings/market-data` | Admin | Market data settings (existing; extended with 3 keys) |
| PATCH | `/api/v1/settings/market-data` | Admin | Update market data settings (existing) |
| GET | `/api/v1/admin/background-jobs` | Admin | List jobs + last run (existing) |
| GET | `/api/v1/admin/background-jobs/{job_name}/history` | Admin | Run history (existing) |
| POST | `/api/v1/admin/background-jobs/{job_name}/trigger` | Admin | Manual trigger (existing) |
| POST | `/api/v1/admin/background-jobs/{job_name}/toggle` | Admin | Enable/disable job (existing) |
| GET | `/api/v1/admin/feature-flags` | Admin | List all feature flags |
| PATCH | `/api/v1/admin/feature-flags/{key}` | Admin | Update single flag |

**GET /api/v1/admin/feature-flags — Response 200**

```json
{
  "items": [
    {
      "key": "maintenance_mode",
      "value_bool": false,
      "value_text": null,
      "description": "Put system into read-only maintenance mode",
      "updated_at": "2026-03-19T12:00:00Z"
    }
  ]
}
```

**PATCH /api/v1/admin/feature-flags/{key} — Request Body**

```json
{
  "value_bool": true
}
```

Or for text-valued flag

---

**Required output — all 4 sections mandatory:**

1. **§2 Files per team** (canonical paths):
   - Team 61 Contract Verify → `_COMMUNICATION/team_61/TEAM_61_S003_P003_WP001_CONTRACT_VERIFY_v1.0.0.md`
   - Team 61 Implementation → `agents_os/ui/js/*.js`, `agents_os_v2/orchestrator/*.py`
   - Team 51 QA → `_COMMUNICATION/team_51/TEAM_51_S003_P003_WP001_QA_REPORT_v1.0.0.md`

2. **§3 Execution order** with dependencies

3. **§6 Per-team acceptance criteria** — field, empty state, error contracts for UI

4. **§4 API/contract** — CLI commands, JSON paths, Python entry points, schema

---

**Domain adaptation:** AGENTS_OS — Team 61 (implementation + contract verify) + Team 51 (QA). No Team 20/30 for this domain.

Identity header required: `gate: G3_PLAN | wp: S003-P003-WP001 | stage: S003 | domain: tiktrack | date: 2026-03-19`

Save to: `_COMMUNICATION/team_10/TEAM_10_S003_P003_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`

When done, inform Nimrod. Nimrod runs `./pipeline_run.sh --domain tiktrack phase2` to auto-store the plan and confirm readiness for G3_5.

⛔ **YOUR TASK ENDS WITH SAVING THE WORK PLAN.**

**Output — write to:**
`_COMMUNICATION/team_10/TEAM_10_S003_P003_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`

### Acceptance
- Work plan saved to: `_COMMUNICATION/team_10/TEAM_10_S003_P003_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`
- All 4 sections present: §2 files per team, §3 execution order, §6 AC, §4 API contract
- Domain adaptation: Team 61 + Team 51 (no Team 20/30 for agents_os)
- Identity header present (gate/wp/stage/domain/date)
- When done: Nimrod runs `./pipeline_run.sh --domain tiktrack phase2`

────────────────────────────────────────────────────────────
  ✅  Phase 1 complete?
  →  Run in terminal:  ./pipeline_run.sh --domain tiktrack phase2
     Regenerates mandates with Phase 1 output injected
     + displays Phase 2 section ready to copy.
────────────────────────────────────────────────────────────

## Operator — Work Plan Storage Confirmation (Phase 2)

⚠️  PREREQUISITE: **Team 10** must be COMPLETE before starting this mandate.

### Phase 2 — Work Plan Auto-Storage & Advance

**This phase is operator-run, not a team task.**

Running `./pipeline_run.sh --domain tiktrack phase2` will:

1. Auto-scan `_COMMUNICATION/team_10/` for latest `TEAM_10_S003_P003_WP001_G3_PLAN_WORK_PLAN_v*.md`
2. Store content → `pipeline_state.work_plan`
3. Confirm storage + print next step

**Current storage status:** ✅ Stored (12595 chars) — ready to pass

---

**After storage confirmed:**

`./pipeline_run.sh --domain tiktrack pass` → advances G3_PLAN → G3_5 (Team 90 validates plan)

### Acceptance
- work_plan field populated in pipeline state (non-empty)
- If PASS  →  `./pipeline_run.sh --domain tiktrack pass`  (advances to G3_5)
- If plan missing  →  check Team 10 saved `TEAM_10_S003_P003_WP001_G3_PLAN_WORK_PLAN_v*.md`
