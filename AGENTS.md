# AGENTS.md

## Governance & agent context (single source of truth)

**All agents (Cursor, Cloud Agent, and any other runner) must use only these context documents.** No legacy procedure paths are active.

| Purpose | Document / path |
|--------|------------------------------------------|
| Squad ID list + mandatory files | `.cursorrules` (repo root) |
| Role mapping (20/30/40/50/51/60/61/70/90/100/170/190/191) | `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md` |
| Active workflow & orchestration | `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` |
| Global entry + WSM | `00_MASTER_INDEX.md`, `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` |

**Deprecated (do not use as active procedure):** References to `PHOENIX_MASTER_BIBLE` or `CURSOR_INTERNAL_PLAYBOOK` under `documentation/09-GOVERNANCE/standards/` or `06-GOVERNANCE_&_COMPLIANCE/standards/` — those paths are not in active use; superseded by the documents above and by V2 Operating Procedures.

---

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

### Linting & Type Checking

- **ESLint**: Config at `ui/.eslintrc.cjs`. Run: `cd ui && ./node_modules/.bin/eslint . --ext js,jsx`. Note: `scripts/` files use Node.js globals (overridden in config).
- **mypy**: Config at `api/mypy.ini`. Run: `source api/venv/bin/activate && mypy api/ --config-file api/mypy.ini`. Currently 153 issues in 42 files (tracked as KB-006).
- **Vite build**: `cd ui && npx vite build` — succeeds and serves as build-time check.

### Security Scanning

- **bandit** (Python SAST): `bandit -r api/ --exclude api/venv -ll` — 0 High, 1 Medium (expected 0.0.0.0 bind).
- **pip-audit**: `pip-audit` — checks Python dependencies for CVEs.
- **npm audit**: `cd ui && npm audit` — checks Node.js dependencies for vulnerabilities.
- Install tools: `pip install bandit pip-audit detect-secrets`

### Unit Tests

- **New unit tests** at `tests/unit/` (30 tests, all passing):
  - `test_auth_service.py` — password hashing, JWT tokens, init validation (17 tests)
  - `test_trading_accounts_service.py` — ULID validation, 404s, duplicates (7 tests)
  - `test_cash_flows_service.py` — flow_type validation, ULID handling (6 tests)
- Run: `python3 -m pytest tests/unit/ -v`

### Quality Gate — Recommended Pre-Commit Checks

Before every commit, run:
```bash
source api/venv/bin/activate
python3 -m pytest tests/unit/ -v --tb=short       # unit tests
python3 -m pytest tests/test_external_data_cache_failover_pytest.py -v  # Suite B
bandit -r api/ --exclude api/venv -ll              # security
cd ui && npx vite build                            # frontend build
```

### Known Issues Tracker

See `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md` for 21 tracked known bugs (KB-001 through KB-021).

### Environment Variables

- Backend: `api/.env` (copy from `api/.env.example`). Key vars: `DATABASE_URL`, `JWT_SECRET_KEY` (64+ chars), `ENCRYPTION_KEY`, `SKIP_LIVE_DATA_CHECK=true` for dev.
- Frontend: `ui/.env.development` already committed with correct defaults (API URL points to localhost:8082).

### Branch Protocol for Team 61

**Commit format:**
```
S{NNN}-P{NNN}-WP{NNN}: Team 61 — [Category X-XX]: [brief description]
```

**Branch naming:** Work on `main` for approved mandates. Use feature branches (`team61/feature-name`) for experimental work.

**Push rules:**
- Always push to `main` for approved Phase 1 items
- Run `python3 -m pytest agents_os_v2/tests/ -v -k "not OpenAI and not Gemini"` before push
- Verify 0 test failures before push

**Pre-GATE_4 check:** Pipeline warns if no new commits since last run. Ensure implementation is committed before continuing to GATE_4.
