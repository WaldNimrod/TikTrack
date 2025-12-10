# Runtime & Ops

## Environments & Startup

- Always start via `./start_server.sh` (or `./start_pg_server.sh`): auto-detects environment by folder
  name (`TikTrackApp` → Dev port 8080, `TikTrackApp-Production` → Prod port 5001), sets PostgreSQL
  env vars, prevents duplicate servers.
- Check Postgres container health before start
  (`docker-compose -f docker/docker-compose.dev.yml up -d postgres-dev` if needed).
- Use `./start_server.sh --check-only` to detect port/process conflicts.
- Do not run `python3 Backend/app.py` directly (DB connection will fail).

## Dependencies & Tooling

- Backend: Python 3.9+, Flask, SQLAlchemy; external data adapters require network access to Yahoo
  Finance.
- Frontend: vanilla JS with bundled scripts (see `trading-ui/scripts/`), ITCSS styles.
- Debugging: Firefox is the standard (VS Code/Cursor config “🚀 Launch Firefox - Development
  (RECOMMENDED)” or `scripts/debug/launch-firefox.sh`).
- Logging: server logs via `/api/server-logs/*`, email logs via `/api/email-logs/*`.
- Monitoring: health/metrics endpoints, cache/status endpoints for external data, background tasks
  dashboard.

## Testing

- Selenium console scan (must run before manual test handoff):
  `python3 scripts/test_pages_console_errors.py`
  - Uses webdriver-manager for ChromeDriver; checks JS runtime errors across pages.
- Manual/feature tests should reuse admin credentials (`admin` / `admin123`) for consistency.
- Additional QA guides: `documentation/03-DEVELOPMENT/TESTING/SELENIUM_TESTING_GUIDE.md`, code
  quality guides in `documentation/03-DEVELOPMENT/TOOLS/`.

## Data & Scheduling

- External data scheduler refreshes quotes/historical/technicals; batch size optimized; retry + cache
  invalidation built in.
- Cache layers: memory, localStorage, IndexedDB, backend; cache change log available via API.
- Background tasks include tag-link cleanup and DB optimization passes.

## Deployment Considerations

- Harden auth/permissions before external exposure (dev mode is permissive).
- Ensure Business Logic services exist for all exposed pages (index/data_import/research currently
  weaker).
- Keep using general systems; avoid page-local logic for rendering/status/badges/forms.
- Markdown changes must pass `npm run markdownlint:check` prior to commit/push.

