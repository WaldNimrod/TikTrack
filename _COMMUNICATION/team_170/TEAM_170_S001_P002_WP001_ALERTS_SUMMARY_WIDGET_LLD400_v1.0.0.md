# Team 170 — LLD400 | S001-P002-WP001 Alerts Summary Widget
## TEAM_170_S001_P002_WP001_ALERTS_SUMMARY_WIDGET_LLD400_v1.0.0.md

**project_domain:** TIKTRACK  
**id:** TEAM_170_S001_P002_WP001_ALERTS_SUMMARY_WIDGET_LLD400_v1.0.0  
**from:** Team 170 (Spec & Governance)  
**to:** Team 190 (Constitutional Validator)  
**cc:** Team 10, Team 100  
**date:** 2026-03-14  
**status:** SUBMITTED_FOR_GATE_1_VALIDATION  
**gate_id:** GATE_1  
**architectural_approval_type:** SPEC  
**spec_version:** 1.0.0  
**source:** GATE_0 scope brief; TEAM_00_AGENTS_OS_CONTINUATION_STRATEGIC_DECISIONS; ARCHITECT_DIRECTIVE_S001_P002_ACTIVATION  
**required_ssm_version:** 1.0.0  
**required_wsm_version:** 1.0.0  
**required_active_stage:** S002  
**phase_owner:** Team 10  

---

## §1 Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S001 |
| program_id | S001-P002 |
| work_package_id | S001-P002-WP001 |
| task_id | N/A |
| gate_id | GATE_1 |
| architectural_approval_type | SPEC |
| spec_version | 1.0.0 |
| date | 2026-03-14 |
| source | GATE_0 scope; ARCHITECT_DIRECTIVE_S001_P002_ACTIVATION |
| required_ssm_version | 1.0.0 |
| required_wsm_version | 1.0.0 |
| required_active_stage | S002 |
| phase_owner | Team 10 |

---

## §2 Scope

Alerts Summary Widget on D15.I (home dashboard). Read-only frontend component. Uses existing GET /api/v1/alerts/ endpoint. No new backend, no schema changes.

---

## §3 endpoint_contract

**Endpoint:** GET /api/v1/alerts/  
**Source:** `api/routers/alerts.py` (router prefix /alerts, app prefix /api/v1)  
**Evidence:** `api/main.py:149` — `app.include_router(alerts.router, prefix=settings.api_v1_prefix)`

| Query param | Type | Required | Description |
|-------------|------|----------|-------------|
| trigger_status | string | For widget | `triggered_unread` — alerts with unread triggered state |
| per_page | int | No | Default 25; widget uses 5 |
| sort | string | No | Default `created_at`; widget uses `triggered_at` |
| order | string | No | Default `desc`; widget uses `desc` |

**Widget canonical call:**
```
GET /api/v1/alerts?trigger_status=triggered_unread&per_page=5&sort=triggered_at&order=desc
```

**Response:** `{"data": [...], "total": N}` — each item includes: id, ticker_id, target_type, condition_field, condition_operator, condition_value, triggered_at, is_triggered. Ticker symbol resolved via `alerts_service._resolve_target_display_names` (ticker → symbol).

---

## §4 db_contract

**Table:** `user_data.alerts`  
**Source:** `api/models/alerts.py`, PHOENIX_MASTER_SSM §3 [Entity: ALERT]

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | primary_key |
| user_id | UUID | FK user_data.users |
| target_type | VARCHAR(50) | ticker \| trade \| trade_plan \| account \| datetime |
| ticker_id | UUID | FK market_data.tickers (nullable) |
| target_id | UUID | nullable |
| condition_field | VARCHAR(50) | price, volume, etc. |
| condition_operator | VARCHAR(20) | >, <, crosses_above, etc. |
| condition_value | NUMERIC(20,8) | per Iron Rules |
| is_triggered | BOOLEAN | |
| triggered_at | TIMESTAMPTZ | nullable |
| deleted_at | TIMESTAMPTZ | soft delete; row visible when IS NULL |

**No schema changes** — widget reads existing table via existing service.

---

## §5 state_definitions

**Trigger status (API filter):** `untriggered` | `triggered_unread` | `triggered_read` | `rearmed`  
**Source:** `api/services/alerts_service.py` — VALID_TRIGGER_STATUS  
**Widget behavior:** Fetch with `trigger_status=triggered_unread` only.

**UI state:** 
- `total === 0` → widget **fully hidden** (no DOM)
- `total > 0` → badge shows count; list shows up to 5 items

---

## §6 dom_blueprint (UI Structural Contract)

**Page:** D15.I — home dashboard  
**Reference:** `documentation/docs-system/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md` — D15.I home

**Iron Rules:** 
- **collapsible-container** — outer wrapper on ALL pages (CONTAINER_HEADER_STRUCTURE_GUIDELINES)
- **maskedLog** — mandatory for all logs; use `ui/src/utils/maskedLog.js`

**Required structure:**
```html
<div class="active-alerts collapsible-container" data-section="alerts-summary" data-role="container">
  <div class="index-section__header" data-role="header">
    <span class="index-section__header-count" data-alert-badge>N התראות לא נקראו</span>
    <a href="/alerts.html?trigger_status=triggered_unread" data-role="badge-link">…</a>
  </div>
  <ul class="active-alerts__list" data-role="list">
    <li data-alert-id="…" data-role="alert-item">
      <span data-role="ticker-symbol">…</span>
      <span data-role="condition-label">…</span>
      <span data-role="triggered-at-relative">…</span>
    </li>
  </ul>
</div>
```

**DOM anchors for MCP/test:** `data-section="alerts-summary"`, `data-role="container"`, `data-alert-id`, `data-role="alert-item"`, `data-role="badge-link"`

**Click behaviors:**
- Item click → navigate to D34 `/alerts.html` (alert detail or list filtered by alert)
- Badge click → navigate to `/alerts.html?trigger_status=triggered_unread`

---

## §7 no_guessing_declaration

**I declare that this spec contains no assumed values, no placeholder logic, and no unverified codebase references.** All endpoint paths, query params, table names, and field types are traced to existing modules: `api/routers/alerts.py`, `api/services/alerts_service.py`, `api/models/alerts.py`, `api/schemas/alerts.py`. Condition fields/operators from `api/schemas/alert_conditions.py` (CONDITION_FIELDS, CONDITION_OPERATORS). D34 route per `ui/vite.config.js` and `documentation/docs-system/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md`.

---

## §8 MCP Test Scenarios

| ID | Scenario | Expected |
|----|----------|----------|
| 1 | Empty state (total=0) | Widget returns null; no DOM |
| 2 | total=1 | Badge "1 התראות לא נקראו"; list has 1 item |
| 3 | total=5 | Badge "5 התראות לא נקראו"; list has 5 items |
| 4 | Item click | Navigate to D34 (alerts.html) |
| 5 | Badge click | Navigate to /alerts.html?trigger_status=triggered_unread |
| 6 | Per-alert display | ticker symbol · condition label · triggered_at (relative) |
| 7 | D34 regression | D34 page loads; table, filters, pagination intact |

---

## §9 Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| AC-1 | Widget uses GET /api/v1/alerts/ with trigger_status=triggered_unread, per_page=5 | Code review; API call params |
| AC-2 | Widget fully hidden when total=0 | E2E / snapshot |
| AC-3 | Badge shows triggered_unread count | E2E |
| AC-4 | List shows N=5 most recent; per-item: ticker · condition · relative time | E2E |
| AC-5 | Item click → D34 | E2E |
| AC-6 | Badge click → D34 filtered unread | E2E |
| AC-7 | collapsible-container class on wrapper | DOM inspection |
| AC-8 | maskedLog for all logging (no console.log) | Code review |
| AC-9 | No new backend routes or schema changes | Diff against api/ and migrations/ |

---

## §10 Proposed Deltas

**Frontend only:** New or modified component(s) under `ui/src/` for D15.I home dashboard. No changes to `api/`, no new migrations. Existing modules referenced: `api/routers/alerts.py`, `api/services/alerts_service.py`, `api/models/alerts.py`, `ui/src/utils/maskedLog.js`, D15_DASHBOARD_STYLES.css, phoenix-components.css.

---

## §11 Risk Register

| ID | Risk | Severity | Mitigation |
|----|------|----------|------------|
| R1 | D34 route mismatch | LOW | D34 canonical path per TT2_PAGES_SSOT_MASTER_LIST; vite proxy /alerts.html |
| R2 | API contract drift | LOW | No backend changes; contract locked per existing code |

---

**log_entry | TEAM_170 | LLD400 | S001_P002_WP001 | SUBMITTED_FOR_GATE_1 | 2026-03-14**
