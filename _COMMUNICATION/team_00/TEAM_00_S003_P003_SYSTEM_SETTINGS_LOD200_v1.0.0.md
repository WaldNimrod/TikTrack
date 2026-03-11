# Team 00 — S003-P003 System Settings | LOD200 Specification
**project_domain:** TIKTRACK
**id:** TEAM_00_S003_P003_SYSTEM_SETTINGS_LOD200_v1.0.0
**from:** Team 00 (Chief Architect — Nimrod)
**to:** Team 100 (GATE_0 packaging), Team 190 (GATE_1 validation), Team 170 (registry sync)
**cc:** Team 10 (intake orchestration), Team 20 (backend), Team 30 (frontend)
**date:** 2026-03-04 (formalized 2026-03-11)
**historical_record:** true
**status:** LOD200 APPROVED — all decisions locked; queued for GATE_0 at S003 activation
**authority:** ARCHITECT_DIRECTIVE_S003_PREP_DECISIONS_v1.0.0 + direct Nimrod session decisions (2026-03-04)

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P003 |
| work_package_id | WP001 (single WP covering D39+D40+D41) |
| gate_id | N/A (pre-GATE_0) |
| phase_owner | Team 100 (GATE_0 / GATE_2 authority) |
| required_ssm_version | 1.0.0 |
| required_active_stage | S003 |
| project_domain | TIKTRACK |
| architectural_approval_type | SPEC |

---

## §1 — Program Overview

**Program:** S003-P003 — System Settings (D39 + D40 + D41)

**Three deliverables, one work package:**

| Deliverable | Name | Route | Description |
|---|---|---|---|
| D39 | User Preferences | `/preferences` | Per-user preferences: display, trading defaults, notification settings |
| D40 | System Management | `/system_management` | Admin-only system config: market data, background tasks, feature flags |
| D41 | User Management | `/user_management` | Admin-only user list with role management |

**Execution order (within WP001):** D39 → D40 → D41 (each GATE_7 PASS before next delivery). Single gate lifecycle binds all three.

---

## §2 — D39: User Preferences

### 2.1 Page Structure

- **Template:** collapsible-container (Iron Rule — all TikTrack pages)
- **6 containers** (one per group); each container has its own **Save** button in the container header
- Containers load asynchronously; failures show per-container error state
- Preferences cached on app init — no per-page API round-trips (Iron Rule, see §2.4)

### 2.2 Field Groups + Fields (23 total)

**Group A — Display & Locale (4 fields)**
| Field | UI Type | Default | Notes |
|---|---|---|---|
| language | Disabled SELECT | en | Shows "עתידי" label — NOT just a disabled field |
| timezone | SELECT (timezones) | UTC | IANA timezone strings |
| primary_currency | SELECT (6 options) | USD | USD/EUR/ILS/CHF/JPY/GBP — hardcoded list, NOT from exchange_rates |
| date_format | SELECT | YYYY-MM-DD | |

**Group B — Trading Defaults (6 fields)**
| Field | UI Type | Default | Notes |
|---|---|---|---|
| default_trading_account | SELECT (FK) | NULL | From user_data.trading_accounts; disabled + instructional note if user has no accounts |
| default_order_type | SELECT | LIMIT | |
| default_time_in_force | SELECT | DAY | |
| default_commission_unit | RADIO | % | % / flat |
| pl_method | RADIO | FIFO | FIFO / FILO with Hebrew labels |
| default_price_type | SELECT | CLOSE | CLOSE / OPEN / REAL-TIME |

**Group C — Notification Settings (4 fields)**
| Field | UI Type | Default | Notes |
|---|---|---|---|
| email_notifications_enabled | TOGGLE | false | |
| alert_trigger_email | TOGGLE | true | depends on email_notifications_enabled |
| weekly_summary_email | TOGGLE | false | |
| price_alert_threshold_pct | NUMBER | 5.0 | % change before alert |

**Group D — Dashboard Layout (3 fields)**
| Field | UI Type | Default | Notes |
|---|---|---|---|
| default_status_filter | SELECT | active | ONE global filter (Iron Rule) |
| rows_per_page | SELECT | 25 | 10/25/50/100 |
| default_sort_column | TEXT | updated_at | |

**Group E — API (2 fields)**
| Field | UI Type | Default | Notes |
|---|---|---|---|
| api_rate_limit | NUMBER (read-only) | 1000 | Displayed only — not editable in UI |
| api_key_count | NUMBER (read-only) | 0 | Count of user_api_keys rows |

**Group F — Accessibility (4 fields)**
| Field | UI Type | Default | Notes |
|---|---|---|---|
| high_contrast_mode | TOGGLE | false | |
| font_size | SELECT | medium | small/medium/large |
| rtl_mode | TOGGLE | false | |
| decimal_separator | SELECT | . | . or , |

**Total: 23 fields across 6 groups.**

### 2.3 Data Storage

| Column | Type | Status | Notes |
|---|---|---|---|
| `timezone` | VARCHAR | EXISTS | Direct column on user_data.users — bypass JSONB |
| `language` | VARCHAR | EXISTS | Direct column on user_data.users — bypass JSONB |
| `settings` | JSONB | **DOES NOT EXIST** | Migration required — stores remaining 19 fields |

**Migration (S003-P003 WP001 preamble):**
```sql
ALTER TABLE user_data.users
ADD COLUMN settings JSONB NOT NULL DEFAULT '{}'::jsonb;
```

`settings` JSONB structure stores all 19 non-timezone/non-language fields. `timezone` and `language` remain as direct VARCHAR columns for backward compatibility.

### 2.4 API — IRON RULE

- Endpoint: `GET /api/v1/me/preferences` + `PATCH /api/v1/me/preferences`
- GET returns all 23 fields: timezone/language from direct columns + 19 fields from `settings` JSONB (merged into single response object)
- PATCH: routes timezone/language to direct column updates; rest to JSONB merge (single SQL)
- **IRON RULE (Nimrod 2026-03-04):** Frontend caches preferences on app init (`window.TT.preferences`). All pages read from cache only. No per-page API round-trips. Cache invalidated only on PATCH success.

---

## §3 — D40: System Management

### 3.1 Page Structure

- **Template:** collapsible-container (Iron Rule — same as all admin pages)
- **Iron Rule (Nimrod 2026-03-04):** Admin pages extended at every gate to include new features
- D40 migrates existing system_management.html into the standard template — no re-architecture from scratch

### 3.2 Sections (7)

| # | Section | Status | Notes |
|---|---|---|---|
| 1 | Market Data Settings | MIGRATION | ALREADY IMPLEMENTED in system_management.html — migrate to container template; add 3 new keys |
| 2 | Sync Jobs | NEW | Background tasks: list, history, manual trigger (with confirm), enable/disable |
| 3 | Feature Flags | NEW | admin_data.feature_flags table; 3 initial flags; GET/PATCH API |
| 4 | Alert Conditions Config | EXISTING | carry forward from current system_management |
| 5 | System Health | EXISTING | carry forward |
| 6 | Recent Activity | EXISTING (ADAPTED) | NO new audit_log table — use job_run_log + system_settings.updated_by/at |
| 7 | Active System Configuration | NEW | Display-only overview of all current system_settings values |

### 3.3 Section 1 — Market Data Settings (ALREADY IMPLEMENTED)

Existing: `market_data.system_settings` table with 6 keys + `GET/PATCH /api/v1/settings/market-data` implemented.

D40 adds 3 new system_settings keys via INSERT (not migration):
```sql
INSERT INTO market_data.system_settings (key, value, description) VALUES
  ('trading_hours_start', '09:30', 'Market trading hours start (HH:MM local)'),
  ('trading_hours_end', '16:00', 'Market trading hours end (HH:MM local)'),
  ('trading_timezone', 'America/New_York', 'Timezone for trading hours evaluation');
```

### 3.4 Section 2 — Background Tasks (Sync Jobs)

Full interface per APScheduler canonical lock (`ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION_v1.0.0`):
- Job list: job_id, description, schedule, last_run_at, last_status, next_run_at, is_enabled
- Run history: last N runs per job (from job_run_log)
- Manual trigger: button + confirm modal → POST /api/v1/admin/jobs/{job_id}/trigger
- Enable/disable: PATCH /api/v1/admin/jobs/{job_id}/enabled
- **DEFERRED:** Schedule/priority editing → enhancement backlog (post-S003)

### 3.5 Section 3 — Feature Flags (NEW)

**New table:**
```sql
CREATE TABLE admin_data.feature_flags (
    key VARCHAR(100) PRIMARY KEY,
    value_bool BOOLEAN,
    value_text VARCHAR(500),
    description TEXT,
    updated_by UUID REFERENCES user_data.users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Initial 3 flags (seed):**
```sql
INSERT INTO admin_data.feature_flags (key, value_bool, description) VALUES
  ('maintenance_mode', false, 'Put system into read-only maintenance mode'),
  ('smtp_enabled', false, 'Enable outbound email notifications'),
  ('new_user_registration_enabled', true, 'Allow new user self-registration');
```

**API:** `GET /api/v1/admin/feature-flags/` + `PATCH /api/v1/admin/feature-flags/{key}`

### 3.6 Section 6 — Recent Activity (NO NEW TABLE)

Decision: do NOT add audit_log table in S003. Source data:
- `job_run_log` for background task activity
- `market_data.system_settings.updated_by`, `updated_at` for settings changes
- `user_data.users.updated_at` for user record changes
No new schema required.

---

## §4 — D41: User Management

### 4.1 Page Structure

- **Standalone page** (not a section of D40) — separate route, separate nav entry
- Template: collapsible-container (Iron Rule)
- Admin-only access (role = ADMIN or SUPERADMIN)

### 4.2 Table + Filters

Columns: email, display_name (first_name + last_name fallback), role badge, is_active badge, phone_number (if present), last_login_at, created_at

Filters: search (email/name), role filter, is_active filter

Pagination: standard TikTrack table pattern (rows_per_page from D39 preferences)

### 4.3 Role Model + Actions

| User role | What admin sees | Available actions |
|---|---|---|
| USER | Role badge = USER | Promote to ADMIN, Deactivate |
| ADMIN | Role badge = ADMIN | Demote to USER, Deactivate |
| SUPERADMIN | Role badge = SUPERADMIN | **Read-only — no actions** |

**Iron Rules — D41 access management scope:**
1. D41 = role + status management ONLY. No profile editing, no preferences editing.
2. API keys (user_api_keys table): NOT shown in D41. Separate concern.
3. Self-protection (enforced at API layer, not just frontend):
   - Admin cannot deactivate their own account
   - Admin cannot demote their own role
   - SUPERADMIN role transitions blocked at API (return 403)

### 4.4 API (3 endpoints)

- `GET /api/v1/admin/users/` — paginated + search (query param) + role filter + is_active filter
- `PATCH /api/v1/admin/users/{id}/status` — body: `{"is_active": true/false}`
- `PATCH /api/v1/admin/users/{id}/role` — body: `{"role": "USER" | "ADMIN"}`

---

## §5 — S003 Setup Tasks (preamble to WP001)

The following are pre-requisite tech debt items to be completed by Team 20 BEFORE any D39/D40/D41 implementation begins. They are part of WP001 but listed separately:

| Task ID | Task | Owner | Blocking |
|---|---|---|---|
| SETUP-01 | python-jose → PyJWT migration | Team 20 | All auth-touching code |
| SETUP-02 | mypy KB-006 (type annotations + mypy clean run) | Team 20 | Code quality gate |

These are Iron Rule tasks per `ARCHITECT_DIRECTIVE_QUALITY_INFRASTRUCTURE_v1.0.0` and MEMORY (KB-006).

---

## §6 — Data Model Summary

| Schema change | Type | Priority |
|---|---|---|
| `ALTER TABLE user_data.users ADD COLUMN settings JSONB NOT NULL DEFAULT '{}'::jsonb` | Migration | D39 — preamble |
| 3 new system_settings INSERTs (trading_hours_start/end, trading_timezone) | Seed | D40 Section 1 |
| `CREATE TABLE admin_data.feature_flags (...)` | Migration | D40 Section 3 |
| Feature flags seed (3 initial rows) | Seed | D40 Section 3 |

No other migrations. S003-P003 does NOT add new user-facing entities — it adds infrastructure for existing entities.

---

## §7 — LOD400 Status

**LOD400 for S003-P003 is NOT YET WRITTEN.** This LOD200 locks the concept and all key decisions. The LOD400 (LLD400-equivalent) must be written before GATE_2 submission.

LOD400 must cover (at minimum):
- D39: full API schema (OpenAPI spec level), caching contract, all 23 field definitions + validation rules
- D40: full section-by-section spec, job trigger API, feature flags CRUD, section 7 aggregate display
- D41: full pagination spec, role transition matrix, API error contracts (401/403/422)
- Setup tasks SETUP-01/02 acceptance criteria
- Test acceptance matrix for GATE_4 (Team 50) and GATE_5 (Team 90)

**GATE_2 dependency:** LOD400 required before GATE_2 can approve execution.

---

## §8 — Acceptance Criteria (GATE_7 — LOD200 level)

| Deliverable | GATE_7 sign-off criterion |
|---|---|
| D39 | Nimrod browser: all 6 groups load; PATCH saves and cache updates; language field disabled with "עתידי" label visible |
| D40 | Nimrod browser: all 7 sections present; manual job trigger works; feature flags toggle works |
| D41 | Nimrod browser: user list paginated; ADMIN→USER demotion works; SUPERADMIN row = read-only (no action buttons) |

---

**log_entry | TEAM_00 | S003_P003_LOD200 | FORMALIZED_v1.0.0 | DECISIONS_FROM_2026-03-04 | 2026-03-11**
