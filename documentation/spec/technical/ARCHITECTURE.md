# Architecture

## Backend (Flask + SQLAlchemy + PostgreSQL)

- Entry: `Backend/app.py`; blueprints per domain (`routes/api/*`), plus auth, preferences v4, logging,
  cache changes.
- Config: `config/database.py` (engine/session), `config/settings.py` (env flags, host/port, cache),
  `config/logging.py`.
- Cross-cutting services: rate limiter, response optimizer, error handler, health service,
  metrics collector, database optimizer, background task manager.
- External data: `services/data_refresh_scheduler.py`, `routes/external_data/*`, adapters under
  `services/external_data/`.
- Business logic: service layer per entity (trades, trade plans, tickers, alerts, watch lists,
  preferences, AI analysis, portfolio state/history/journal).
- Testing hooks: legacy `LegacyDBProxy` compatibility for historical test suite; Selenium console scan
  script for UI.

## Frontend (trading-ui, vanilla JS with general systems)

- Loading/initialization: Unified Initialization System + package manifest; standard load order
  (BASE → SERVICES → UI-ADVANCED → CRUD → PREFERENCES → INIT-SYSTEM).
- State/caching: Unified Cache System (memory/localStorage/IndexedDB/backend), page state manager,
  cache TTL guard.
- UI infra: modal manager v2 + navigation + z-index, event handler manager (data-onclick),
  header/filters system, table pipeline (load → filter → sort → paginate), info summaries,
  icon/button/color systems, RTL-first styling (ITCSS).
- Data services: entity-specific data services wrapping Business Logic API endpoints and
  validation/calculation helpers.
- Widgets: dashboard widgets (trades/plans/executions), TradingView widgets, overlay services.

## Data Flow (typical CRUD page)

1. Unified initializer loads page config + general systems.
2. Data service fetches via Business Logic API wrapper (`/api/<entity>/*`), applies
   validation/calculations, caches via TTL guard.
3. UI renders through table pipeline + FieldRendererService; modal manager handles create/edit linked
   to CRUD Response Handler.
4. Auto-refresh and cache invalidation propagate via unified cache + refresh triggers.

## Auth & Permissions

- Dev mode: auth modal via `auth.js`; APIs exposed without strict auth in dev. Production requires
  hardening (recommend session/token + user scoping already present in business logic filters).
- User profile/password reset endpoints exist; watch-list and preferences are user-scoped via user_id
  filters and User↔Ticker mapping.

## Background & Scheduling

- DataRefreshScheduler for external data (quotes/historical/technicals) with batching and retry.
- BackgroundTaskManager for maintenance/cleanup; tag links cleanup on deletions.
- Cache change log and WAL endpoints for observability.

## Error Handling, Logging, Metrics

- Central error handler with response normalization; rate limiting decorators for APIs.
- Metrics collector + health service (DB/cache/system) exposed via API.
- Server logs API and email logs API available for ops dashboards.

## Deployment/Runtime Notes

- Always start with `./start_server.sh` (auto-sets PostgreSQL env, prevents duplicate server). Dev runs
  on port 8080 when folder is `TikTrackApp`; production folder uses 5001.
- External data provider paths added to `sys.path` in app entrypoint.
- Start-up scripts also check Postgres container; use `--check-only` for port/process conflicts.

