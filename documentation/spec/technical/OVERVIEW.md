# Technical Overview (Backfilled Spec)

## Purpose

Provide a current-state specification for engineers rebuilding or extending TikTrack based on the live
codebase (Dec 2025). Summaries are in Hebrew elsewhere; technical depth is here in English.

## Scope

- Covers Backend (Flask/SQLAlchemy/PostgreSQL), Frontend (trading-ui with general systems), data
  model, API surface, pages (including mockups), runtime/ops, and gaps/roadmap.
- Source of truth for DB: Development PostgreSQL via `./start_server.sh` (environment auto-detected
  from folder name).
- Page coverage: all pages in `documentation/PAGES_LIST.md`, including mockups/daily snapshots.

## Audience

- Engineers implementing new features or hardening for external exposure.
- Solution architects preparing a full rewrite/modernization while reusing general systems.

## Key References

- General systems catalog: `documentation/frontend/GENERAL_SYSTEMS_LIST.md`
- Page list & statuses: `documentation/PAGES_LIST.md`
- Backend entrypoint: `Backend/app.py` (blueprints, schedulers, rate limiting, caching)
- DB models: `Backend/models/*.py` (entities listed in `DATA_MODEL.md`)
- Testing (Selenium console scan): `scripts/test_pages_console_errors.py`

## Document Map

- Architecture: `ARCHITECTURE.md`
- Data Model: `DATA_MODEL.md`
- API Surface: `API_SURFACE.md`
- Frontend Pages & Flows: `FRONTEND_PAGES_AND_FLOWS.md`
- Runtime & Ops: `RUNTIME_AND_OPS.md`
- Gaps & Roadmap: `ROADMAP_AND_GAPS.md`



