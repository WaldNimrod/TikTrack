# Alerts Entity — Canonical Knowledge Baseline v1.0
**project_domain:** TIKTRACK

**id:** ALERTS_ENTITY_KNOWLEDGE_BASELINE_v1.0  
**owner:** Team 170 (Librarian / SSOT Authority)  
**mandate:** TEAM_100_TO_TEAM_170_ALERTS_KNOWLEDGE_BASELINE_MANDATE  
**date:** 2026-02-19  
**status:** BASELINE — for Team 190 Gate Validation  
**canonical promotion path:** Team 10 → `documentation/reports/ALERTS_ENTITY_KNOWLEDGE_BASELINE_v1.0.md`

---

## 1. Executive Summary

The Alerts entity (D34, MB3A) has a **backend API and DB schema in place**, an **Alerts dedicated page** (`/alerts.html`) **connected** to the API for list, summary, filter, sort, and pagination, and a **Home Page “Active Alerts” widget that is static** (no live data). Blueprint (Team 31) and frontend (Team 30) align with the API contract. **Data contract:** API returns snake_case; frontend accepts both snake_case and camelCase. **Gaps:** Home Page active-alerts not wired to API; add/edit/delete forms not implemented (API ready); no dedicated spec schema document for Alerts in documentation (references exist in POC reports, DB docs, page trackers). **Readiness:** Dedicated Alerts page is ready for live data; Home widget and CRUD forms require integration/implementation.

---

## 2. Current UI Structural Snapshot

### 2.1 Dedicated Alerts Page (`/alerts.html`)

| Area | Location | Structure |
|------|----------|-----------|
| **Shell** | `ui/src/views/data/alerts/alerts.html` | LEGO: `page-wrapper` → `page-container` → `main` → `tt-container` → `tt-section`(s) |
| **Section: Summary** | `tt-section` with `data-section="summary"` `data-entity="alert"` | `index-section__header` + `index-section__body`; inside: `info-summary` with row first (totalAlerts, activeAlerts, newAlerts, toggle), row second (triggeredAlerts) |
| **Section: Management** | `tt-section` with `data-section="alerts-management"` `data-entity="alert"` | Header (title, count, filter buttons, “הוספת התראה” button, section toggle); body: `phoenix-table-wrapper` (table + pagination) |
| **Table** | `#alertsTable`, `#alertsTableBody` | Columns: מקושר ל (target_type), טיקר, תנאי, סטטוס, הופעל, נוצר ב, פעולות. Sortable headers; action menu per row (view/edit/delete) |
| **Pagination** | `alertsPaginationInfo`, `alertsPrevPageBtn`, `alertsNextPageBtn`, `alertsPageNumbers`, `.js-table-page-size[data-table-id="alertsTable"]` | Page size 10/25/50/100; prev/next + page numbers |
| **Scripts** | Same file (bottom) | `alertsPageConfig.js`, `UnifiedAppInit.js`, `sectionToggleHandler.js`, `PhoenixTableSortManager.js`, `PhoenixTablePagination.js`, `alertsTableInit.js`, `headerLinksUpdater.js`, `footerLoader.js` |

### 2.2 Home Page — Active Alerts Widget (Logged-in)

| Area | Location | Structure |
|------|----------|-----------|
| **Container** | `ui/src/components/HomePage.jsx` — inside `tt-section` `data-section="top"` | `div.active-alerts` with `data-role="container"` |
| **Header** | `.active-alerts__header` | `.active-alerts__title-group` (trigger button + “התראות פעילות”), `.active-alerts__count-badge` (data-role="count") = **hardcoded "3"**, `.active-alerts__filters` (data-role="filters") **empty** |
| **List** | `.active-alerts__list` (data-role="list") | **Static** article cards (e.g. `data-alert-id="1"` `data-entity-type="trades"`) — not loaded from API |
| **Header bell** | When section closed | Button with 🔔 and **hardcoded "3"** |

**Conclusion:** Dedicated page = dynamic (DataStage → loadAlertsData). Home widget = fully static (count and cards hardcoded).

### 2.3 Blueprint Reference

| Artifact | Path | Role |
|----------|------|------|
| Alerts page blueprint | `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/alerts_BLUEPRINT.html` | Structural reference for Alerts page (v1.0.13, LEGO, RTL, CSS hierarchy) |
| D15 Index (dashboard) | `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D15_INDEX.html`, `D15_INDEX.html` | Active alerts block: `data-section="top"`, `.active-alerts`, `data-role="container"`, `list`, `count`, `filters` |

---

## 3. Data Contract Status

### 3.1 API Endpoints (Backend Present)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/alerts/summary` | Yes | total_alerts, active_alerts, new_alerts (10d), triggered_alerts |
| GET | `/api/v1/alerts` | Yes | List; query: target_type, page, per_page, sort, order |
| GET | `/api/v1/alerts/{id}` | Yes | Single alert |
| POST | `/api/v1/alerts` | Yes | Create (body: AlertCreate) |
| PATCH | `/api/v1/alerts/{id}` | Yes | Update (body: AlertUpdate) |
| DELETE | `/api/v1/alerts/{id}` | Yes | Soft delete (204) |

**Router:** `api/routers/alerts.py` (prefix `/alerts`, included under `settings.api_v1_prefix` in `api/main.py`).

### 3.2 Summary Response Shape

- **API returns:** `total_alerts`, `active_alerts`, `new_alerts`, `triggered_alerts` (snake_case).
- **Frontend (alertsDataLoader.js):** Normalizes to both forms; writes into summary: `totalAlerts`, `activeAlerts`, `newAlerts`, `triggeredAlerts`.

### 3.3 List Response Shape

- **API returns:** `{ "data": [ ... ], "total": N }`.
- **Frontend:** Accepts `response`, `response.data`, `response.alerts`, `response.results`, `response.items`; total from `response.total` or `response.total_count`.

### 3.4 Alert Row Fields (API / DB → UI)

| Field | API/DB | UI (alertsTableInit) | Notes |
|-------|--------|----------------------|--------|
| id | UUID | data-alert-id | |
| target_type | ticker, trade, trade_plan, account, general | TARGET_TYPE_LABELS (הכל, חשבון מסחר, טרייד, תוכנית, טיקר) | |
| ticker_id / ticker_symbol | ticker_symbol from join | col-ticker | |
| condition_field / condition_summary | condition_summary built in service | col-condition | |
| is_active | boolean | “פעיל” / “לא פעיל” | |
| is_triggered | boolean | “כן” / “לא” | |
| created_at | timestamptz | col-created, format he-IL | |

**Conclusion:** Data contract aligned for dedicated page. Home widget does not consume API.

---

## 4. State Definitions (Existing vs Missing)

### 4.1 Existing (Dedicated Page)

| State | Where | Notes |
|-------|--------|--------|
| Summary (total, active, new, triggered) | `alertsSummaryStats`, ids totalAlerts, activeAlerts, newAlerts, triggeredAlerts | Filled by loadAlertsData → renderSummary |
| Table data | `tableData`, `currentPage`, `currentPageSize`, `currentSortKey`, `currentSortDir`, `currentFilterType` (alertsTableInit.js) | From loadAlertsData; client-side sort/pagination |
| Filter (target_type) | `.filter-icon-btn` with `data-filter-type` (all, account, trade, trade_plan, ticker) | Calls loadAlertsData with targetType |
| Empty table | EMPTY_ROW_HTML when no rows | `data-role="empty-state"` |
| Section collapse | `index-section__header-toggle-btn`, `js-section-toggle` | Section body show/hide |

### 4.2 Missing or Static

| State | Where | Gap |
|-------|--------|-----|
| Home active-alerts count | HomePage.jsx | Hardcoded "3"; not from API |
| Home active-alerts list | HomePage.jsx | Static cards; not from GET /alerts or /alerts/summary |
| Home active-alerts filters | `.active-alerts__filters` | Empty; no filter UI or API |
| Add alert form | `.js-add-alert` | alert() only; no form/modal (API POST ready) |
| View/Edit/Delete actions | Row buttons js-action-view, js-action-edit, js-action-delete | No handlers for view/edit modal or delete confirmation; API GET/PATCH/DELETE ready |
| “Mark as read” (Home cards) | Legacy blueprint had `.active-alerts__mark_read` | Not present in current HomePage React; no API for “read” in current spec |

---

## 5. Selector Registry

### 5.1 Critical for Alerts Page (E2E / Integration)

| Selector | Type | Purpose |
|----------|------|--------|
| `[data-section="alerts-management"]` | data-section | Section containing table and filters |
| `[data-section="summary"]` (alerts context) | data-section | Summary section (entity alert) |
| `#alertsTable` | id | Main table |
| `#alertsTableBody` | id | Table body (rows or empty row) |
| `#totalAlerts`, `#activeAlerts`, `#newAlerts`, `#triggeredAlerts` | id | Summary stats |
| `#alertsSummaryContent`, `#alertsSummaryToggleSize` | id | Summary second row toggle |
| `#alertsCount` | id | “N התראות” in header |
| `#alertsPaginationInfo`, `#alertsPrevPageBtn`, `#alertsNextPageBtn`, `#alertsPageNumbers` | id | Pagination |
| `.js-table-page-size[data-table-id="alertsTable"]` | class + attribute | Page size select |
| `.js-add-alert` | class | Add alert button |
| `.filter-icon-btn` (within alerts-management) | class | Filter by target_type; `data-filter-type` = all | account | trade | trade_plan | ticker |
| `tr[data-alert-id]`, `.table-action-btn[data-alert-id]` | attribute | Row and action buttons by alert id |
| `.phoenix-table__row--empty`, `[data-role="empty-state"]` | structural | Empty state row |

### 5.2 Home Page — Active Alerts (Static)

| Selector | Type | Purpose |
|----------|------|--------|
| `.active-alerts` (data-role="container") | class / data-role | Widget container |
| `.active-alerts__title-text` (data-role="title-text") | data-role | Title |
| `.active-alerts__count-badge` (data-role="count") | data-role | Count badge (currently static "3") |
| `.active-alerts__filters` (data-role="filters") | data-role | Filter area (empty) |
| `.active-alerts__list` (data-role="list") | data-role | List of cards |
| `.active-alerts__card`, `[data-alert-id]`, `[data-entity-type]` | attribute | Card and entity type |
| `.active-alerts__empty` (data-role="empty-state") | data-role | Empty state (hidden when static cards shown) |

### 5.3 Structural (LEGO)

| Selector | Purpose |
|----------|--------|
| `tt-section[data-section]` | Section identity |
| `tt-container` | Container wrapper |
| `.index-section__header`, `.index-section__body` | Section layout |

---

## 6. Integration Gaps

| # | Gap | Location | Notes |
|---|-----|----------|--------|
| 1 | Home “Active Alerts” not connected to API | HomePage.jsx | Count and list static; no fetch to /alerts or /alerts/summary |
| 2 | Add-alert flow not implemented | alertsTableInit.js (bindAddButton) | .js-add-alert shows alert(); POST /alerts ready |
| 3 | View/Edit/Delete row actions not implemented | alertsTableInit.js | Buttons rendered with data-alert-id; no modal or delete flow |
| 4 | No “mark as read” API or UI in current scope | Home, API | Legacy DOM used /api/alerts/unread; current API has no read/unread; Home has no mark-read UI |
| 5 | Spec schema document | documentation/ | No single “Alerts entity spec” doc; only DB DDL, POC reports, page trackers, LEGACY_TO_PHOENIX_MAPPING |

---

## 7. Risk Notes

- **Home vs dedicated page consistency:** Home shows fixed “3” and static cards; dedicated page shows live counts and list. Users may see different numbers on Home vs Alerts page until Home is wired.
- **target_type naming:** DB and API use `account`; UI labels “חשבון מסחר”. Consistent; no drift.
- **Legacy `/api/alerts/unread`:** Referenced in legacy `active-alerts-component.js`; current API is `/api/v1/alerts` and `/api/v1/alerts/summary`. No conflict if legacy code is not in use.
- **CRUD readiness:** Backend CRUD is implemented; frontend forms and action handlers are missing (Phase 2 per POC docs).

---

## 8. Readiness Assessment

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Dedicated Alerts page loads and shows data from API | Yes | DataStage → loadAlertsData; summary + table + filter + sort + pagination |
| API and DB schema aligned | Yes | api/routers/alerts.py, api/services/alerts_service.py, user_data.alerts, d34_alerts.sql, PHX_DB_SCHEMA_V2.5 |
| UI and API data contract (snake/camel, summary, list) | Yes | alertsDataLoader.js normalizes; alertsTableInit maps fields |
| Home “Active Alerts” uses live data | No | Static count and cards |
| Add/Edit/Delete UI | No | API ready; UI not implemented |
| Selectors and sections stable for E2E | Yes | data-section, ids, .js-add-alert, .filter-icon-btn, data-alert-id documented above |
| Spec schema document in documentation/ | No | Scattered references only; no single Alerts entity spec |

**Summary:** The Alerts **entity** has a well-defined backend and a **connected** dedicated page; the **baseline** is suitable for Gate Validation (Team 190) with the above gaps and risks explicitly stated. No architectural recommendations, no Gate decision, no change to spec documents — baseline only.

---

**Change Summary:** First canonical baseline for Alerts entity. Cross-referenced UI (HomePage, alerts.html, alertsTableInit, alertsDataLoader, alertsPageConfig), API (routers, service, schemas), DB (d34_alerts.sql, PHX_DB_SCHEMA_V2.5), Blueprint, ACTIVE_STAGE (GAP_CLOSURE_BEFORE_AGENT_POC — CLEAN_FOR_AGENT), and documentation references.  
**Before/After:** N/A (initial baseline).  
**Canonical path (after Team 10 promotion):** `documentation/reports/ALERTS_ENTITY_KNOWLEDGE_BASELINE_v1.0.md`.  
**Drift scan note:** No drift introduced; baseline documents current state only.  
**Evidence anchors:** Mandate TEAM_100_TO_TEAM_170_ALERTS_KNOWLEDGE_BASELINE_MANDATE; intake TEAM_170_INTAKE_PACKAGE_2026-02-18; ACTIVE_STAGE 2026-02-18.

**log_entry | TEAM_170 | ALERTS_ENTITY_KNOWLEDGE_BASELINE_v1.0 | BASELINE_CREATED | 2026-02-19**
