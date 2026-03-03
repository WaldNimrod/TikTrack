---
**project_domain:** TIKTRACK
**id:** TEAM_00_S003_P003_SYSTEM_SETTINGS_LOD200_v1.0.0
**from:** Team 00 (Chief Architect)
**to:** Team 170 (LLD400 authoring), Team 190 (GATE_0 intake), Team 100 (GATE_2 approval)
**cc:** Team 10 (Gateway)
**date:** 2026-03-04
**status:** LOD200 APPROVED — ready for GATE_0 submission packaging
**gate_id:** pre-GATE_0
**architectural_approval_type:** SPEC
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P003 |
| work_package_id | N/A (LOD200 level) |
| task_id | N/A |
| gate_id | N/A (pre-GATE_0) |
| phase_owner | Team 170 (spec authoring) + Team 10 (execution orchestration) |
| required_ssm_version | 1.0.0 |
| required_active_stage | S003 |
| architectural_approval_type | SPEC |

---

# S003-P003 — SYSTEM SETTINGS: LOD200 v1.0.0
## Pages: D39 (Preferences) + D40 (System Management) + D41 (User Management)

---

## 1. Program Scope

| Item | Value |
|------|-------|
| Program | S003-P003 — System Settings |
| Pages | D39 (User Preferences), D40 (System Management), D41 (User Management) |
| Domain | TIKTRACK |
| Stage | S003 |
| Access model | D39: authenticated users; D40 + D41: admin-only |
| Page template | Standard TikTrack collapsible-container page template — containers stacked vertically, each with titled header. **Iron Rule: all pages in system must use this template without exception.** |

---

## 2. D39 — User Preferences

### 2.1 Purpose

Single-page preferences editor for authenticated users. All 23 preference fields organized into 6 collapsible containers. Replaces any prior per-page preference handling (timezone and language fields move exclusively to D39 as the write surface for all user preferences).

### 2.2 UI Structure

- **Template:** Standard TikTrack collapsible-container page template
- **Containers:** 6 containers, one per group (Group A through F), each with group-label header
- **Save behavior:** Each container has its own Save button in the container header for convenience. A single PATCH call saves all fields in that container. All containers post to the same endpoint; scope determined by which fields are included in the request body.
- **Empty state:** No empty state — page always shows all 6 groups with their current values

### 2.3 Field Specification

#### Group A — General

| Field | Type | Values / Notes |
|-------|------|----------------|
| `timezone` | SELECT | Full IANA timezone list (server-side validated). Backend: stored in `user_data.users.timezone` (direct column — NOT in settings JSONB). |
| `date_format` | SELECT | YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY, DD.MM.YYYY |
| `language` | SELECT (disabled) | Display-only select; options: English / עברית / العربية / Русский. Disabled state with small "עתידי" label inline. Backend: stored in `user_data.users.language` (direct column). |
| `primary_currency` | SELECT | USD, EUR, ILS, CHF, JPY, GBP. Hardcoded list — does not pull from exchange_rates. |

**Note on timezone + language:** These two fields are stored as direct VARCHAR columns on `user_data.users` (existing schema), not in the `settings` JSONB. The preferences API reads them from the direct columns and writes them back via the same endpoint. The remaining 19 fields are stored in `user_data.users.settings` (new JSONB column — see §5.1 migration).

#### Group B — Trading Defaults

| Field | Type | Values / Notes |
|-------|------|----------------|
| `default_trading_account` | SELECT (nullable) | FK → `user_data.trading_accounts`. Shows user's accounts by name. Placeholder: "ללא ברירת מחדל". If no accounts configured: field disabled with note "יש להוסיף חשבון מסחר תחילה". |
| `default_stop_loss_pct` | NUMERIC | 0.01–100.00. Display: percentage. |
| `default_target_pct` | NUMERIC | 0.01–1000.00. Display: percentage. |
| `default_risk_pct` | NUMERIC | 0.01–100.00. Display: percentage. |
| `default_trade_amount` | NUMERIC (nullable) | Nullable. In primary_currency. Placeholder: "ללא ברירת מחדל". |
| `pl_method` | RADIO | FIFO / FILO. Labels in Hebrew: "ראשון נכנס ראשון יוצא" / "אחרון נכנס ראשון יוצא". |

#### Group C — UI

| Field | Type | Values / Notes |
|-------|------|----------------|
| `default_page_size` | SELECT | 10 / 25 / 50 / 100. Default: 25. |
| `chart_default_period` | SELECT | 1D / 1W / 1M / 3M / 1Y / ALL. Default: 1M. |

#### Group D — Filters

| Field | Type | Values / Notes |
|-------|------|----------------|
| `default_status_filter` | SELECT | all / active / pending / inactive / cancelled. Default: all. ONE global filter applies to all entity tables. |

#### Group E — Market Data Display

| Field | Type | Values / Notes |
|-------|------|----------------|
| `show_volume` | TOGGLE | Default: true. |
| `show_pct_change` | TOGGLE | Default: true. |
| `show_market_cap` | TOGGLE | Default: true. |
| `show_52week_range` | TOGGLE | Default: false. |

#### Group F — Alert Defaults

| Field | Type | Values / Notes |
|-------|------|----------------|
| `alert_default_threshold_pct` | NUMERIC | 0.01–100.00. Display: percentage. |
| `alert_market_hours_only` | TOGGLE | Default: false. |

### 2.4 System-Provided Defaults (when settings is NULL or field absent)

| Field | Default |
|-------|---------|
| timezone | UTC (existing column default) |
| date_format | YYYY-MM-DD |
| language | en (existing column default) |
| primary_currency | USD |
| default_trading_account | NULL |
| default_stop_loss_pct | NULL |
| default_target_pct | NULL |
| default_risk_pct | NULL |
| default_trade_amount | NULL |
| pl_method | FIFO |
| default_page_size | 25 |
| chart_default_period | 1M |
| default_status_filter | all |
| show_volume | true |
| show_pct_change | true |
| show_market_cap | true |
| show_52week_range | false |
| alert_default_threshold_pct | NULL |
| alert_market_hours_only | false |

### 2.5 API Contract

**CRITICAL NOTE:** Almost every page in the system loads preferences (different parts on each load). The preferences API must be fast, consistent, and cacheable client-side. This is an Iron Rule for the D39 implementation.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/me/preferences` | GET | Returns all 23 preference fields. Aggregates: timezone/language from direct columns + remaining fields from settings JSONB. Returns full preferences object with system defaults for absent fields. |
| `/api/v1/me/preferences` | PATCH | Partial update. Any subset of the 23 fields. Service layer routes timezone/language to direct column update; remaining fields to JSONB merge. Returns full updated preferences object. |

**Response shape (canonical):**
```json
{
  "timezone": "UTC",
  "date_format": "YYYY-MM-DD",
  "language": "en",
  "primary_currency": "USD",
  "default_trading_account": null,
  "default_stop_loss_pct": null,
  "default_target_pct": null,
  "default_risk_pct": null,
  "default_trade_amount": null,
  "pl_method": "FIFO",
  "default_page_size": 25,
  "chart_default_period": "1M",
  "default_status_filter": "all",
  "show_volume": true,
  "show_pct_change": true,
  "show_market_cap": true,
  "show_52week_range": false,
  "alert_default_threshold_pct": null,
  "alert_market_hours_only": false
}
```

**Frontend pattern (Iron Rule):** A single `preferencesService.get()` call on app init caches the preferences object in-memory (or local store). Pages read from the cache, not via repeated API calls. Invalidate cache only on PATCH success. This is mandatory — preferences must NOT trigger per-page API round-trips.

---

## 3. D40 — System Management

### 3.1 Purpose

Admin-only system management dashboard. All 7 sections (+ section 8 added by this session) presented as collapsible containers per standard page template. Migrates the existing Market Data Settings UI. Adds background tasks management, alert monitoring, feature flags, and an active-configuration overview.

**Iron Rule (declared by Nimrod 2026-03-04):** At the end of every gate, admin pages must be extended to include all new features. Section 2 migration and sections 1, 3–8 build together in S003. Future gates add new sections as needed — this page grows without bound.

### 3.2 Section Specifications

#### Section 1 — SYSTEM OVERVIEW

Read-only status dashboard. Displayed at top of page — always expanded.

| Metric | Data Source | Display |
|--------|-------------|---------|
| Market status | Compare UTC now vs. `trading_hours_start` / `trading_hours_end` / `trading_timezone` from system_settings | OPEN (green) / CLOSED (grey) |
| DB health | SELECT 1 connectivity check | Healthy (green) / Error (red) |
| Background jobs health | Latest entry per job in `admin_data.job_run_log` — exit_code 0 = green, non-0 = red, >threshold_minutes since last run = warn | Status badge per job |
| Pending tickers count | `SELECT COUNT(*) FROM market_data.tickers WHERE status = 'pending'` | Count integer |

**Refresh:** Manual "רענן" button. No auto-polling in MVP.

#### Section 2 — MARKET DATA SETTINGS

**Status: MIGRATION — already implemented.** Existing `GET/PATCH /api/v1/settings/market-data` endpoints and `market_data.system_settings` table are production-ready. D40 migrates the existing system_management UI into the standard container template.

**Existing 6 settings (carried forward):**

| Key | Type | Range | Default |
|-----|------|-------|---------|
| `max_active_tickers` | integer | 1–500 | 50 |
| `intraday_interval_minutes` | integer | 5–240 | 15 |
| `provider_cooldown_minutes` | integer | 5–120 | 15 |
| `max_symbols_per_request` | integer | 1–50 | 5 |
| `delay_between_symbols_seconds` | integer | 0–30 | 0 |
| `intraday_enabled` | boolean | — | true |

**New settings to add (per ARCHITECT_DIRECTIVE decisions):**

| Key | Type | Notes |
|-----|------|-------|
| `trading_hours_start` | string | HH:MM format (e.g., "09:30") |
| `trading_hours_end` | string | HH:MM format (e.g., "16:00") |
| `trading_timezone` | string | IANA timezone (e.g., "America/New_York") |

**Note:** The detailed sync-cycle specification (per-ticker-status sync frequency, provider rate limit handling) was scoped in prior architecture. The current 6 settings cover the core configuration surface. Before LLD400, Team 170 must review `ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION_v1.0.0.md` to confirm all spec'd sync logic is represented in system_settings keys. If additional keys are required, surface in LLD400 review — do not defer to post-GATE_2.

#### Section 3 — BACKGROUND TASKS

Full admin interface for background job management.

| Feature | Description |
|---------|-------------|
| Job list | All registered jobs from scheduler_registry.py: name, schedule (cron expression), enabled/disabled status |
| Per-job run history | Last N runs from `admin_data.job_run_log`: started_at, duration_ms, exit_code, records_processed, records_failed |
| Manual trigger | "הרץ עכשיו" button per job — triggers immediate run via `POST /api/v1/admin/jobs/{job_name}/trigger`. Confirmation dialog required. |
| Enable / Disable | Toggle per job — `PATCH /api/v1/admin/jobs/{job_name}` `{ "enabled": true/false }`. Updates scheduler_registry at runtime. |
| Priority / Schedule change | **Deferred to post-S003** — runtime schedule modification requires APScheduler job rescheduling; adds significant complexity. Logged as enhancement. |
| Log view | Inline expandable log panel per job run showing stdout_ref content if available |

#### Section 4 — ALERT SYSTEM MONITOR

Read-only monitoring panel.

| Metric | Source |
|--------|--------|
| Total active alerts | `SELECT COUNT(*) FROM user_data.alerts WHERE status = 'active'` |
| Triggered (unread) | `SELECT COUNT(*) FROM user_data.alerts WHERE trigger_status = 'triggered_unread'` |
| Last condition evaluation | Latest entry in `admin_data.job_run_log` WHERE job_name = 'check_alert_conditions' — display started_at |
| Last evaluation exit_code | Green/red indicator from job_run_log |

#### Section 5 — NOTIFICATIONS MONITOR

Placeholder container. Title displayed, body: "הרחבה מתוכננת ל-S004/S005."

#### Section 6 — RECENT ACTIVITY LOG

**Decision (2026-03-04):** No new `audit_log` table. Section displays **existing data** from two sources:

1. **Recent background job runs** — latest 25 entries from `admin_data.job_run_log` (job_name, started_at, exit_code, duration_ms)
2. **Recent settings changes** — entries from `market_data.system_settings` sorted by updated_at DESC, showing key, value, updated_by user email, updated_at

Display: unified chronological list of both. No new table required. Future S004+ enhancement: proper audit_log table if operational need is confirmed.

#### Section 7 — FEATURE FLAGS

Admin-editable runtime flags.

| Feature | Spec |
|---------|------|
| Storage | New table `admin_data.feature_flags` (key VARCHAR PK, value_bool BOOLEAN, value_text TEXT, updated_by UUID FK, updated_at TIMESTAMPTZ) |
| S003 flags | `maintenance_mode` (bool), `smtp_enabled` (bool, default false), `new_user_registration_enabled` (bool) |
| UI | Toggle per flag + last changed by/at display |
| API | `GET /api/v1/admin/feature-flags`, `PATCH /api/v1/admin/feature-flags/{key}` |

#### Section 8 — ACTIVE SYSTEM CONFIGURATION

**New section (added per Nimrod decision 2026-03-04).** Display-only. Shows all currently active system configuration in one organized view.

| Sub-section | Content |
|-------------|---------|
| Market Data Settings | All 9 keys with current values (from system_settings) |
| Feature Flags | All flags with current values (from feature_flags table) |
| Environment Config | Selected ENV vars relevant to system behavior (e.g., DATABASE_URL host portion, REDIS status, API key provider availability — masked, presence-only) |
| Background Job Registry | All registered jobs with schedule and enabled/disabled state |

Purpose: operator can see the full configuration state of the running system without hunting across multiple sections.

---

## 4. D41 — User Management

### 4.1 Purpose

Standalone admin-only page (separate from D40). Full user list with activation, deactivation, and role management. Foundation for future group/permission management.

### 4.2 User List

**Columns:**

| Column | Source | Notes |
|--------|--------|-------|
| Email | users.email | Primary identifier |
| Name | users.display_name OR first_name + last_name | Fallback chain |
| Role | users.role | Badge: USER / ADMIN (SUPERADMIN = special display, see §4.4) |
| Status | users.is_active | Active / Inactive badge |
| Phone | users.phone_number | Show if present; "--" if NULL |
| Last login | users.last_login_at | Relative time; "--" if never |
| Member since | users.created_at | Date only |

**Not shown in list:** UUID (available in detail/copy), password_hash, api keys (in user_api_keys table — not displayed in D41), settings JSONB.

**Note on settings separation:** User preferences (D39 fields) are stored in users.settings JSONB and displayed/edited on D39. User profile (name, phone, display_name) is edited via /api/v1/users/me. D41 is admin management only — it does NOT allow editing user profile fields or preferences. Iron Rule: no overlap between D41 admin management and D39 user preferences.

### 4.3 Actions

| Action | Availability | Confirmation |
|--------|-------------|--------------|
| Deactivate user | Active users only | YES — modal with email + "יפסיק גישה למערכת" |
| Activate user | Inactive users only | NO — reversible |
| Change role USER → ADMIN | USER accounts only | YES — modal with "מעניק הרשאות מנהל" |
| Change role ADMIN → USER | ADMIN accounts only | YES — modal with "מסיר הרשאות מנהל" |

### 4.4 Role Model

| Role ENUM value | S003 behavior |
|----------------|---------------|
| `USER` | Standard user — manageable (activate/deactivate/promote) |
| `ADMIN` | Admin user — manageable (deactivate/demote) |
| `SUPERADMIN` | System-level — displayed in list as read-only badge; no actions available on SUPERADMIN accounts via D41 UI |

**Future (S005+):** Additional role types and user groups with feature-level permissions. D41 must be architected to extend — service layer handles role transitions via enum validation, not hardcoded checks.

### 4.5 Self-Protection Rules (Iron Rule — enforced at API level)

| Rule | Implementation |
|------|----------------|
| Admin cannot deactivate own account | API: 403 if `target_user_id == current_user_id`; Frontend: action disabled for current user row |
| Admin cannot demote own role | API: 403 if `target_user_id == current_user_id`; Frontend: action disabled |
| Last ADMIN protection | API: 403 if only one ADMIN account exists and action would remove it |

### 4.6 Search + Filter + Pagination

| Feature | Spec |
|---------|------|
| Search | By email (substring match); by name (display_name / first+last) |
| Filter | By role (all / USER / ADMIN); by status (all / active / inactive) |
| Pagination | Standard page size control (uses user's default_page_size from D39, or 25 if not set) |

### 4.7 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/admin/users/` | GET | Paginated list. Query params: `search`, `role`, `is_active`, `page`, `page_size` |
| `/api/v1/admin/users/{id}/status` | PATCH | `{ "is_active": true/false }`. Enforces self-protection rules. |
| `/api/v1/admin/users/{id}/role` | PATCH | `{ "role": "USER" \| "ADMIN" }`. SUPERADMIN not settable via this endpoint. |

All 3 endpoints: admin-only (role check in middleware). 403 on any self-protection violation.

---

## 5. Data Model Changes

### 5.1 New Column: user_data.users.settings

```sql
ALTER TABLE user_data.users
ADD COLUMN settings JSONB NOT NULL DEFAULT '{}'::jsonb;
```

**Notes:**
- `timezone` and `language` remain as direct VARCHAR columns (backward compatible)
- `metadata` JSONB column already exists and is separate (user metadata ≠ preferences)
- `settings` stores the remaining 19 D39 preference fields (all except timezone + language)
- JSONB merge strategy on PATCH: `settings = settings || $new_values::jsonb`

### 5.2 New Keys: market_data.system_settings

Three new rows inserted (migration):
```sql
INSERT INTO market_data.system_settings (key, value, value_type)
VALUES
  ('trading_hours_start', '09:30', 'string'),
  ('trading_hours_end', '16:00', 'string'),
  ('trading_timezone', 'America/New_York', 'string')
ON CONFLICT (key) DO NOTHING;
```

### 5.3 New Table: admin_data.feature_flags

```sql
CREATE TABLE admin_data.feature_flags (
  key            VARCHAR(80) PRIMARY KEY,
  value_bool     BOOLEAN,
  value_text     TEXT,
  description    TEXT,
  updated_by     UUID REFERENCES user_data.users(id) ON DELETE SET NULL,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initial S003 flags:
INSERT INTO admin_data.feature_flags (key, value_bool, description)
VALUES
  ('maintenance_mode',                   false, 'System-wide maintenance mode — blocks non-admin access'),
  ('smtp_enabled',                       false, 'Email delivery enabled (SMTP configured)'),
  ('new_user_registration_enabled',      true,  'Allow new user self-registration');
```

### 5.4 No New audit_log Table

Intentional decision for S003. Recent-activity display uses `job_run_log` + `system_settings.updated_by/at`. Proper audit trail deferred to S004+ pending operational need confirmation.

---

## 6. Architecture Decisions (LOCKED — S003-P003)

| Decision ID | Decision | Rationale |
|-------------|----------|-----------|
| D39-01 | Single PATCH /api/v1/me/preferences endpoint; routes timezone/language to direct columns, rest to JSONB | Backward compatible; clean API; existing /api/v1/users/me PUT continues to work |
| D39-02 | Preferences cached client-side on app init; pages read from cache | Performance Iron Rule — preferences must not trigger per-page API calls |
| D39-03 | language field: disabled SELECT with "עתידי" inline label | Honest UX; field will be activated in future stage |
| D39-04 | primary_currency: hardcoded 6-currency list (USD/EUR/ILS/CHF/JPY/GBP) | Decoupled from exchange_rates table; safe and explicit |
| D39-05 | default_trading_account: disabled if no accounts configured, with instructional note | Prevents dangling NULL selection confusion |
| D40-01 | Market Data Settings: migration of existing system_management UI — no re-architecture | Existing implementation is correct; migrate UI only, extend with 3 new keys |
| D40-02 | No new audit_log table in S003 | Existing data (job_run_log + system_settings) provides sufficient monitoring surface; additional overhead not justified yet |
| D40-03 | Section 8 (Active Configuration) is display-only and aggregates from all data sources | Single operational view of system state — requested by Nimrod 2026-03-04 |
| D40-04 | Background task priority/schedule change deferred post-S003 | Runtime rescheduling complexity; manual trigger + enable/disable sufficient for ops |
| D41-01 | Standalone D41 page (not D40 section) | User management will grow; clean separation prevents D40 bloat |
| D41-02 | SUPERADMIN accounts displayed read-only; no D41 actions | Platform-level role; not user-manageable via admin UI |
| D41-03 | D41 does not edit user profile or preferences | Iron Rule: no overlap. Profile edits on /users/me. Preferences on D39. D41 = access management only. |
| D41-04 | Self-protection rules enforced at API layer (not just frontend) | Security Iron Rule |

---

## 7. Out of Scope (S003-P003)

| Item | Where |
|------|-------|
| Notification preferences group | S004/S005 |
| Multi-profile / secondary accounts | S005 |
| Theme / color preferences | Theme system (future) |
| User groups / permission levels beyond USER/ADMIN | S005+ |
| Direct broker API settings | S006+ |
| SMTP configuration UI | When smtp_enabled flag is activated |
| Background task schedule editing at runtime | Post-S003 enhancement |
| Proper audit_log table | S004+ if operational need confirmed |
| Secondary currency | S005+ |

---

## 8. Routing Instructions

**Team 170:** Use this LOD200 as the authoritative source for LLD400 authoring on D39, D40, D41. Before writing LLD400:
1. Verify `ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION_v1.0.0.md` for sync cycle spec completeness (D40 Section 2 note)
2. Confirm `user_data.trading_accounts` table name from production schema
3. Use DDL V2.6 as reference for all existing schema — do not invent columns

**Team 190:** Standard GATE_0 intake. 7-file package required. LOD200 spec = this document.

**Team 100:** GATE_2 approval authority per ADR-027. Review against this LOD200 when GATE_1 PASS is confirmed.

---

**log_entry | TEAM_00 | S003_P003_SYSTEM_SETTINGS_LOD200_v1.0.0_CREATED | APPROVED_READY_FOR_GATE0 | 2026-03-04**
