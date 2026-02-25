# AGENTS.md

## Cursor Cloud specific instructions

### Architecture Overview

TikTrack Phoenix is a full-stack stock/portfolio tracking web app:

- **Backend**: Python FastAPI on port 8082 (`api/` directory, uses `api/venv` virtualenv)
- **Frontend**: React 18 + Vite on port 8080 (`ui/` directory, npm)
- **Database**: PostgreSQL 16 in Docker container `tiktrack-postgres-dev` on port 5432
- **Tests**: Selenium/Mocha in `tests/` (npm), Python test suites via `make test-suite-*`

### Starting Services

1. **Docker + PostgreSQL**: `sudo dockerd &` then `sudo docker start tiktrack-postgres-dev`
2. **Backend**: From workspace root: `source api/venv/bin/activate && PYTHONPATH="/workspace/api:/workspace" uvicorn api.main:app --reload --host 0.0.0.0 --port 8082`
3. **Frontend**: From `ui/`: `npm run dev`
4. **Health check**: `curl http://localhost:8082/health` should return `{"status":"ok"}`

### Database Setup Gotchas

- The full DDL at `documentation/docs-system/02-SERVER/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` has ordering issues and partial unique constraint syntax errors. It cannot be applied cleanly in one pass. Several tables must be created manually after the initial DDL run (tickers, trading_accounts, trades, alerts, user_tickers, exchange_rates, ticker_prices, etc.).
- Two extra tables not in the DDL are required by the ORM models: `user_data.user_refresh_tokens` and `user_data.revoked_tokens` (defined in `api/models/tokens.py`).
- The `DATABASE_URL` in `api/.env` must use `postgresql://` (not `postgresql+asyncpg://`); the code adds the `+asyncpg` prefix automatically in `api/core/database.py`.

### Auth & Admin

- Default admin credentials: username `admin`, password `418141` (created via `python3 api/scripts/create_admin_user.py`)
- Login endpoint: `POST /api/v1/auth/login` with `{"username_or_email": "...", "password": "..."}`
- JWT tokens are issued with 24h expiry.

### Running Tests

- **Suite A** (contract/schema): `python3 tests/external_data_suite_a_contract_schema.py` — 2 tests fail due to schema drift (column naming/precision), not code bugs.
- **Suite B** (cache/failover): `python3 -m pytest tests/test_external_data_cache_failover_pytest.py -v` — all 6 pass.
- **Suite D** (retention): `python3 tests/test_retention_cleanup_suite_d.py` — passes.
- **Suite E** (UI): Requires ChromeDriver + running servers.
- See `Makefile` for all test targets.

### Linting

- Frontend ESLint is configured in `ui/package.json` scripts but no `.eslintrc` config file exists. `npm run lint` will fail without one.
- `vite build` from `ui/` succeeds and serves as a build-time code quality check.

### Environment Variables

- Backend: `api/.env` (copy from `api/.env.example`). Key vars: `DATABASE_URL`, `JWT_SECRET_KEY` (64+ chars), `ENCRYPTION_KEY`, `SKIP_LIVE_DATA_CHECK=true` for dev.
- Frontend: `ui/.env.development` already committed with correct defaults (API URL points to localhost:8082).
