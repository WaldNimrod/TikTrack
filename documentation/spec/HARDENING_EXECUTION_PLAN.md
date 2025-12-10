# Master Hardening & Gap-Closure Execution Plan

## Scope

- Included: main-menu user pages (no dev tools), plus partially implemented pages now product:
  Dashboard (index), Trades, Trade Plans, Executions, Alerts, Tickers, Ticker Dashboard,
  Trading Accounts, Cash Flows, Notes, AI Analysis, Watch Lists, Preferences (single version),
  Trading Journal, Trade History, Portfolio State, Ticker History views embedded in dashboard,
  External Data Dashboard, User Profile/Auth flows.
- Excluded: dev/ops tools (db_display, db_extradata, constraints, system-management, css-management,
  cache-management, code-quality-dashboard, init-system-management, CRUD testing dashboard),
  future-only mockups that are not linked from the main menu.
- Source lists: `documentation/PAGES_LIST.md`, general systems in
  `documentation/frontend/GENERAL_SYSTEMS_LIST.md`.

## Baseline Findings (Audit)

- Business Logic gaps: index, data_import, research lack full BL services; some daily-snapshot flows
  (trade history/portfolio state variants) rely on partial wiring; watch-list modal/quick actions
  need backend glue; preferences must be unified to one version (no dual v3/v4).
- Auth/permissions: frontend `auth-guard.js` enforces modal login, but backend APIs are permissive in
  dev; need enforced user_id scoping and session/token checks for all included pages.
- General systems: must be used everywhere (Unified Initialization/Cache, Modal Manager V2 + nav + z,
  Header/Filters, Table Pipeline, FieldRendererService, CRUDResponseHandler, Event Handler Manager).
  Remove page-local logic/duplicates.
- External data: ticker dashboard/history depend on quotes/quotes_last/eod metrics; scheduler output
  must stay aligned for demos.
- Demo data: ensure coverage for accounts, trades/plans/executions, alerts, watch lists, preferences,
  external data, user_ticker custom fields/status.

## Work Plan by Phase

1) Audit & Baseline (per included page; re-check code before each sub-task because other teams are
   actively changing code)
   - Verify data service usage; flag any local logic bypassing general systems.
   - Map endpoints/BL services; note missing or weak implementations (index, data_import, research,
     mockup-turned-product flows).
   - Check auth guard invocation and backend user scoping.

2) Business Logic Hardening
   - Implement/finish BL for index, data_import, research.
   - Wire partial mockups now product: ticker dashboard history blocks, trade history, watch-list
     modal flows, trading journal edge cases.
   - Standardize validation/calculation wrappers; normalize payloads; add rate limiting where
     appropriate.

3) Auth/Permissions
   - Enforce session/token on included endpoints; redirect unauthenticated users via auth modal.
   - Apply role/permission checks for sensitive operations (admin vs user) where relevant.
   - Ensure user_id filters on all queries; remove dev shortcuts.

4) Data Consistency & Demo Data
   - Regenerate demo data covering all included pages/entities; ensure watch-list + user_ticker fields
     populated.
   - Align scheduler outputs (quotes/quotes_last/eod metrics) with ticker dashboard/history.

5) Frontend Alignment
   - For each page, confirm: init system, cache system, modal manager/nav/z-index, header/filters,
     table pipeline, FieldRendererService, CRUDResponseHandler, event-handler-manager data-onclick,
     info summaries where applicable; keep RTL/ITCSS intact.
   - Remove page-local duplicates; route actions through general systems.

6) Performance & Stability
   - Add TTL guard/batching/lazy-loading for heavy pages (ticker dashboard, trading journal, trade
     history).
   - Verify background tasks and scheduler health endpoints for observability.

7) Testing
   - Selenium console scan on all included pages; fix JS runtime errors.
   - API smoke per page (CRUD + BL wrappers) with admin session.
   - Manual demo script: Dashboard → Ticker Dashboard → Trades/Plans/Executions → Alerts →
     Trading Journal → Watch Lists → Preferences → External Data views.

8) Documentation & Handover
   - Summarize per-page readiness (BL/auth/cache/refresh) and remaining risks.
   - Note excluded dev-tool pages explicitly and any open items for future productization.

## Business Logic Action Items (priority)

- Dashboard (index): add Business Service for KPIs/summary cards; reuse statistics/calculation
  wrappers; ensure cache/refresh hooks.
- Data Import: implement BL service and API for import sessions/status; align with import_session
  model; surface progress/errors via unified responses.
- Research: create BL for research data retrieval, validate inputs, and route through data services.
- Ticker Dashboard: ensure endpoints return quotes/quotes_last/eod metrics in one payload; add
  caching and error handling; validate ticker ownership (user_ticker).
- Trade History & Portfolio State: finalize BL endpoints for historical slices; enforce user_id;
  normalize date envelopes.
- Trading Journal: validate filters/date ranges; ensure BL calculations for aggregates; support lazy
  paging.
- Watch Lists: wire modal/quick actions to BL; validate entries against user_ticker; ensure refresh
  triggers and cache invalidation.
- Preferences: converge to single active version; validate dependencies; ensure profile switching
  works with caching and rate-limited updates.
- Auth/Profile: ensure `/api/auth/*` and profile/reset flows enforce validation and rate limiting.

## Auth & Permissions Checklist

- Enforce auth guard on all included pages; redirect unauthenticated users via auth modal.
- No cookies of any kind; dev environment runs without cache, so implement alternative active-user
  storage (e.g., in-memory/sessionStorage) consistent across pages.
- Back-end: require session/token on all included endpoints; reject dev-mode open paths.
- Apply user_id scoping on queries (trades, plans, executions, alerts, notes, watch lists, ticker
  dashboard/history, journal, history endpoints).
- Role separation will be added later; immediate step: hide all dev-tool menu entries from non-admin,
  show only to admin.
- Rate limit auth endpoints (login/reset/register) and sensitive BL write operations.

## Demo Data & External Data Plan

- Demo data process already refreshed against the current local production-like test DB; re-verify
  outputs match requirements and adjust as needed.
- Ensure coherent scenarios: accounts → trades/plans → executions → alerts → watch lists →
  preferences.
- Populate user_ticker custom fields/status for watch lists and dashboard views.
- Ensure external data scheduler loads quotes/quotes_last/eod metrics for tickers used in demos;
  prewarm ticker dashboard/history datasets.

## Frontend Alignment Checklist

- Use: Unified Initialization System, Unified Cache System, Modal Manager V2 + navigation/z-index,
  Header/Filters, Table Pipeline, FieldRendererService, CRUDResponseHandler, event-handler-manager
  (data-onclick), info-summary where applicable. Re-check each page before edits because other teams
  may have changed code.
- Remove page-local duplicates; keep ITCSS and RTL intact.
- Confirm data services wrap BL APIs (no raw fetch to business endpoints).

## Performance & Stability Focus

- Add TTL guard and batching for trades/executions/alerts/tickers heavy calls.
- Lazy load heavy panes in ticker dashboard, trading journal, trade history.
- Expose/verify health endpoints for scheduler/background tasks/cache.

## Testing Plan

- Selenium console scan across included pages; fix runtime errors.
- API smoke per page: CRUD + BL wrappers using admin session (`admin`/`admin123`).
- Manual demo path: Dashboard → Ticker Dashboard → Trades/Plans/Executions → Alerts →
  Trading Journal → Watch Lists → Preferences → External Data views.

## Readiness & Risks Summary

- Deliver per-page readiness table (BL complete? auth enforced? cache/refresh OK? external data
  aligned?).
- Track open risks: any remaining mockup wiring, auth hardening gaps, scheduler data freshness.

