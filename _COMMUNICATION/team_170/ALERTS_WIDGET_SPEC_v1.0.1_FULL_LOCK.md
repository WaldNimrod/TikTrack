# Alerts Widget Spec v1.0.1 — FULL SPEC LOCK VERSION

**id:** ALERTS_WIDGET_SPEC_v1.0.1  
**owner:** Team 170 (Librarian / SSOT Authority)  
**mandate:** TEAM_100_MB3A_ALERTS_WIDGET_SPEC_COMPLETION_MANDATE  
**stage context:** GAP_CLOSURE_BEFORE_AGENT_POC  
**date:** 2026-02-19  
**status:** FULL LOCK — Ready for Constitutional Validation  
**authority:** Documentation integrity only. No Gate authority. No architectural decisions.

---

## A. Endpoint Contract Lock

All endpoints verified from `api/routers/alerts.py` and `api/main.py` (router prefix from `settings.api_v1_prefix` → `/api/v1`). No endpoint invented.

| Method | Path | Auth Required | Request Schema | Response Schema | Error Schema |
|--------|------|---------------|----------------|-----------------|--------------|
| GET | `/api/v1/alerts/summary` | Yes (`get_current_user`) | None | `{ total_alerts: int, active_alerts: int, new_alerts: int, triggered_alerts: int }` (service: `alerts_service.get_alerts_summary`) | 401: auth; no 404 for summary |
| GET | `/api/v1/alerts` | Yes | Query: `target_type` (optional, account\|trade\|trade_plan\|ticker\|general), `page` (1), `per_page` (1–100), `sort` (created_at\|target_type\|is_active\|…), `order` (asc\|desc) | `{ data: array of alert objects, total: int }` (router line 60) | 401: auth |
| POST | `/api/v1/alerts` | Yes | Body: `AlertCreate` (api/schemas/alerts.py) | Single alert object (dict), 201 | 401: auth; 422: validation (error_code, detail, field_errors per api/main.py) |
| GET | `/api/v1/alerts/{alert_id}` | Yes | Path: `alert_id` (UUID) | Single alert object | 401: auth; 404: `{ "detail": "Alert not found" }` (router HTTPException) |
| PATCH | `/api/v1/alerts/{alert_id}` | Yes | Path: `alert_id`; Body: `AlertUpdate` (partial) | Single alert object | 401: auth; 404: `{ "detail": "Alert not found" }`; 422: validation |
| DELETE | `/api/v1/alerts/{alert_id}` | Yes | Path: `alert_id` | No body, 204 | 401: auth; 404: `{ "detail": "Alert not found" }` |

**Request/Response detail (from code):**

- **AlertCreate** (schemas): target_type (required), target_id, ticker_id, alert_type (PRICE|VOLUME|TECHNICAL|NEWS|CUSTOM), priority (default MEDIUM), condition_field, condition_operator, condition_value, title (required, max 200), message, is_active (default true), expires_at.
- **AlertUpdate** (schemas): all optional — is_active, title, message, condition_field, condition_operator, condition_value, expires_at.
- **Single alert object** (service `_alert_to_response`): id, target_type, target_id, ticker_id, ticker_symbol, alert_type, priority, condition_field, condition_operator, condition_value, condition_summary, title, message, is_active, is_triggered, triggered_at, expires_at, created_at, updated_at.
- **422 validation:** `error_code` (ErrorCodes.VALIDATION_INVALID_FORMAT), `detail`, `field_errors` (array of `{ field, message }`) — from api/main.py validation_exception_handler.
- **404:** Standard FastAPI `{ "detail": "Alert not found" }`; alerts router does not use HTTPExceptionWithCode.

---

## B. DB Contract Lock

Source: `scripts/migrations/d34_alerts.sql`, `documentation/docs-system/02-SERVER/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`, ORM `api/models/alerts.py`.

**Schema:** `user_data`

**Enum definitions:**

| Enum | Values | Source |
|------|--------|--------|
| `user_data.alert_type` | PRICE, VOLUME, TECHNICAL, NEWS, CUSTOM | d34_alerts.sql L11; enums.py AlertType |
| `user_data.alert_priority` | LOW, MEDIUM, HIGH, CRITICAL | d34_alerts.sql L16; enums.py AlertPriority |

**Table: `user_data.alerts`**

| Column | Type | Nullable | Default | Constraints / Notes |
|--------|------|----------|---------|----------------------|
| id | UUID | NOT NULL | gen_random_uuid() | PRIMARY KEY |
| user_id | UUID | NOT NULL | — | REFERENCES user_data.users(id) ON DELETE CASCADE |
| target_type | VARCHAR(50) | NOT NULL | — | CHECK IN ('ticker','trade','trade_plan','account','general') |
| target_id | UUID | YES | — | — |
| ticker_id | UUID | YES | — | REFERENCES market_data.tickers(id) ON DELETE CASCADE |
| alert_type | user_data.alert_type | NOT NULL | — | — |
| priority | user_data.alert_priority | NOT NULL | 'MEDIUM' | — |
| condition_field | VARCHAR(50) | YES | — | — |
| condition_operator | VARCHAR(10) | YES | — | — |
| condition_value | NUMERIC(20,8) | YES | — | — |
| title | VARCHAR(200) | NOT NULL | — | — |
| message | TEXT | YES | — | — |
| is_active | BOOLEAN | NOT NULL | TRUE | — |
| is_triggered | BOOLEAN | NOT NULL | FALSE | — |
| triggered_at | TIMESTAMPTZ | YES | — | — |
| expires_at | TIMESTAMPTZ | YES | — | — |
| created_by | UUID | NOT NULL | — | REFERENCES user_data.users(id) |
| updated_by | UUID | NOT NULL | — | REFERENCES user_data.users(id) |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | — |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | — |
| deleted_at | TIMESTAMPTZ | YES | — | Soft delete |
| metadata | JSONB | YES | '{}'::JSONB | — |

**Indexes (from migration):** idx_alerts_user (user_id, created_at DESC) WHERE deleted_at IS NULL; idx_alerts_ticker (ticker_id) WHERE ticker_id IS NOT NULL AND deleted_at IS NULL; idx_alerts_target (target_type, target_id) WHERE deleted_at IS NULL; idx_alerts_active (is_active, is_triggered) WHERE is_active = TRUE AND is_triggered = FALSE AND deleted_at IS NULL.

**Delete policy:** Soft delete only. `alerts_service.delete_alert` sets `deleted_at = now()`; no hard delete in code. All list/summary/get filter by `deleted_at IS NULL`.

---

## C. State Machine Definition

**Canonical status values (from DB and service):**

- **is_active:** true | false (boolean, NOT NULL, default true).
- **is_triggered:** true | false (boolean, NOT NULL, default false).
- **Row visibility:** effective state = not deleted (`deleted_at IS NULL`).

No separate “status” enum for alerts in code; only is_active, is_triggered, and deleted_at.

**State transition sources (code-only):**

| Transition | Trigger source | Code location |
|------------|-----------------|---------------|
| Create alert | POST /alerts → create_alert | alerts_service.create_alert: new row with is_active=True, is_triggered=False |
| Deactivate/activate | PATCH /alerts/:id with is_active | alerts_service.update_alert: assigns alert.is_active |
| Set triggered | Not implemented in service (no method sets is_triggered in code inspected) | — |
| Soft delete | DELETE /alerts/:id | alerts_service.delete_alert: sets deleted_at |

**DEV bump logic:** None found in alerts backend or frontend code.

---

## D. DOM Structural Contract

All selectors taken from code; no screenshots. Two contexts: (1) Dedicated Alerts page `/alerts.html`, (2) Home Page Alerts widget (React).

### D.1 Dedicated Alerts Page (alerts.html, alertsTableInit.js)

| Contract item | Selector | Source file |
|---------------|----------|-------------|
| Widget/Page container | `.page-wrapper`, `tt-container`, `[data-section="alerts-management"]` | alerts.html; tests: alerts-mb3a-e2e.test.js (pageWrapper, ttContainer) |
| Section summary | `tt-section[data-section="summary"]`, `#alertsSummaryStats`, `#alertsSummaryContent`, `#alertsSummaryToggleSize` | alerts.html L61–91 |
| Summary stats | `#totalAlerts`, `#activeAlerts`, `#newAlerts`, `#triggeredAlerts` | alerts.html L79,88; alertsTableInit.js renderSummary (getElementById) |
| Section management | `[data-section="alerts-management"]` | alerts.html L99; alertsTableInit.js bindFilters |
| Alert table | `#alertsTable`, `#alertsTableBody` | alerts.html L138,150; alertsTableInit.js |
| Alert row | `tr[data-alert-id]`, `tr.phoenix-table__row` (with data-alert-id) | alertsTableInit.js renderAlertRow L132–135 |
| Counter (header) | `#alertsCount` | alerts.html L106; alertsTableInit.js L117 |
| Empty state | `.phoenix-table__row--empty`, `td[data-role="empty-state"]` | alertsTableInit.js EMPTY_ROW_HTML L12–17; tests L81 |
| Triggered (cell) | `.phoenix-table__cell.col-triggered`, `td[data-field="is_triggered"]` (text "כן" when triggered) | alerts.html L145; alertsTableInit.js L140 |
| Pagination | `#alertsPaginationInfo`, `#alertsPrevPageBtn`, `#alertsNextPageBtn`, `#alertsPageNumbers`, `.js-table-page-size[data-table-id="alertsTable"]` | alerts.html L157–170; alertsTableInit.js |
| Add button | `.js-add-alert` | alerts.html L127; alertsTableInit.js bindAddButton L231; tests L109 |
| Filter buttons | `.filter-icon-btn`, `[data-filter-type]` (all, account, trade, trade_plan, ticker) | alerts.html L110–125; alertsTableInit.js bindFilters L207 |
| Row actions | `.table-action-btn.js-action-view`, `.js-action-edit`, `.js-action-delete` with `data-alert-id` | alertsTableInit.js L148–155 |

### D.2 Home Page Alerts Widget (HomePage.jsx)

| Contract item | Selector | Source file |
|---------------|----------|-------------|
| Widget container | `.active-alerts`, `[data-role="container"]` | HomePage.jsx L216 |
| Title text | `.active-alerts__title-text`, `[data-role="title-text"]` | HomePage.jsx L225 |
| Counter badge | `.active-alerts__count-badge`, `[data-role="count"]` | HomePage.jsx L227 (static "3") |
| Filters area | `.active-alerts__filters`, `[data-role="filters"]` | HomePage.jsx L229 |
| List | `.active-alerts__list`, `[data-role="list"]` | HomePage.jsx L233 |
| Alert card | `.active-alerts__card`, `[data-alert-id]`, `[data-entity-type]`; modifiers `active-alerts__card--trades`, `--account`, `--ticker` | HomePage.jsx L236–239, 306–308, 376–378 |
| Mark read | `.active-alerts__mark_read`, `[data-alert-id]` | HomePage.jsx L294–295, 364–365 |
| View alert button | `.btn-view-alert` | HomePage.jsx L270, 343, 348 |

### D.3 Notes Page Alerts Block (same widget pattern)

Empty state: `.active-alerts__empty`, `[data-role="empty-state"]` (notes.html L95–96). Count badge id: `notesAlertsBadge`; list id: `notesAlertsList`.

### D.4 DEV-only / ENV-gated selector

**None found in alerts-related code.** No NODE_ENV, ENV, or data-env usage in `ui/src/views/data/alerts/` or HomePage Alerts block.

---

## E. Validation Matrix (Mandatory)

| Spec Item | Code Source File | Evidence Type | Verified (Y/N) |
|-----------|------------------|---------------|----------------|
| GET /alerts/summary | api/routers/alerts.py L22–31 | Endpoint | Y |
| GET /alerts list + query params | api/routers/alerts.py L34–60 | Endpoint | Y |
| POST /alerts | api/routers/alerts.py L63–72 | Endpoint | Y |
| GET /alerts/:id | api/routers/alerts.py L75–85 | Endpoint | Y |
| PATCH /alerts/:id | api/routers/alerts.py L88–103 | Endpoint | Y |
| DELETE /alerts/:id 204 | api/routers/alerts.py L105–116 | Endpoint | Y |
| Summary response shape | api/services/alerts_service.py get_alerts_summary L132–161 | Return dict | Y |
| List response shape | api/routers/alerts.py L60 | Return dict | Y |
| AlertCreate schema | api/schemas/alerts.py L11–24 | Pydantic | Y |
| AlertUpdate schema | api/schemas/alerts.py L26–34 | Pydantic | Y |
| Alert single-object fields | api/services/alerts_service.py _alert_to_response L39–77 | Dict keys | Y |
| user_data.alerts table | scripts/migrations/d34_alerts.sql L20–51 | DDL | Y |
| alert_type enum | d34_alerts.sql L11; api/models/enums.py L47–53 | DDL + Python | Y |
| alert_priority enum | d34_alerts.sql L16; api/models/enums.py L56–61 | DDL + Python | Y |
| target_type CHECK | d34_alerts.sql L24; api/models/alerts.py L29–31 | DDL + ORM | Y |
| Soft delete | api/services/alerts_service.py delete_alert L301–322 | Code | Y |
| #totalAlerts, #activeAlerts, #newAlerts, #triggeredAlerts | ui/src/views/data/alerts/alerts.html L79,88 | HTML id | Y |
| #alertsTable, #alertsTableBody | alerts.html L138,150 | HTML id | Y |
| data-section alerts-management | alerts.html L99; alertsTableInit.js L207 | HTML + JS | Y |
| .js-add-alert | alerts.html L127; alertsTableInit.js L231 | HTML class + JS | Y |
| tr data-alert-id | alertsTableInit.js L132,135 | JS template | Y |
| data-role empty-state | alertsTableInit.js L14 | JS template | Y |
| .active-alerts, data-role container | HomePage.jsx L216 | JSX | Y |
| .active-alerts__count-badge, data-role count | HomePage.jsx L227 | JSX | Y |
| .active-alerts__card, data-alert-id | HomePage.jsx L236,238 | JSX | Y |
| .col-triggered, data-field is_triggered | alerts.html L145; alertsTableInit.js L140 | HTML + JS | Y |
| E2E selectors | tests/alerts-mb3a-e2e.test.js L70–112 | Test code | Y |
| 422 error schema | api/main.py L50–56 | Exception handler | Y |
| 404 detail | api/routers/alerts.py L84,102,115 | HTTPException | Y |

**BLOCKER check:** No unmapped field; no undocumented endpoint; no unverified state or selector in the matrix above. No open BLOCKER.

---

## F. No Guessing Declaration

**All definitions in this spec are derived from code-level evidence.** Sources: api/routers/alerts.py, api/schemas/alerts.py, api/models/alerts.py, api/models/enums.py, api/services/alerts_service.py, api/main.py, scripts/migrations/d34_alerts.sql, ui/src/views/data/alerts/alerts.html, ui/src/views/data/alerts/alertsTableInit.js, ui/src/views/data/alerts/alertsDataLoader.js, ui/src/components/HomePage.jsx, tests/alerts-mb3a-e2e.test.js. **No inferred structures. No fields or endpoints added without a code reference.**

---

## Governance Artifacts Referenced (Evidence)

| Document | Path |
|----------|------|
| Gate-B PASS | documentation/reports/_POC_TEMP/DEV_ORCH_POC_PACKAGE_2026-02-18/B_stage_MB3A_alerts/TEAM_90_TO_TEAM_10_MB3A_ALERTS_GATE_B_PASS.md |
| Stage context | ACTIVE_STAGE.md — GAP_CLOSURE_BEFORE_AGENT_POC, CLEAN_FOR_AGENT |

---

## Submission

**Ready for Constitutional Validation.**

This document is to be passed to **Team 190 only**. No handover to Architect before Pass.

**STRUCTURAL_CONFLICT_BLOCKER:** None identified. If any inconsistency is found between this spec and code or SSOT, mark STRUCTURAL_CONFLICT_BLOCKER and stop.

---

**log_entry | TEAM_170 | ALERTS_WIDGET_SPEC_v1.0.1 | FULL_LOCK_CREATED | 2026-02-19**
