# AGENTS.md

## Governance & agent context (single source of truth)

**All agents (Cursor, Cloud Agent, and any other runner) must use only these context documents.** No legacy procedure paths are active.

| Purpose | Document / path |
|--------|------------------------------------------|
| Squad ID list + mandatory files | `.cursorrules` (repo root) |
| Role mapping (all 21 teams: 00/10/11/20/21/30/31/40/50/51/60/61/70/71/90/100/110/111/170/190/191) | `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.1.md` |
| Principal / Team 00 model + PFS | `documentation/docs-governance/01-FOUNDATIONS/PRINCIPAL_AND_TEAM_00_MODEL_v1.0.0.md` |
| Active workflow & orchestration | `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` |
| **Gemini Code Assist environment procedure** | `_COMMUNICATION/team_101/TEAM_101_OPERATING_PROCEDURES_v1.0.0.md` |
| Global entry + WSM | `00_MASTER_INDEX.md`, `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` |
| **AOS v3 — תיעוד קנוני (Directive 3B)** | `documentation/docs-agents-os/00_AGENTS_OS_MASTER_INDEX.md` → קבצי `AGENTS_OS_V3_*` |

**Deprecated (do not use as active procedure):** References to `PHOENIX_MASTER_BIBLE` or `CURSOR_INTERNAL_PLAYBOOK` under `documentation/09-GOVERNANCE/standards/` or `06-GOVERNANCE_&_COMPLIANCE/standards/` — those paths are not in active use; superseded by the documents above and by V2 Operating Procedures.

---

## AOS v3 — branch `aos-v3` (post-BUILD + documentation)

| Field | Value |
|-------|--------|
| **Branch** | `aos-v3` |
| **Push** | `origin/aos-v3` (direct; no `codex/team191-integration` on this track) |
| **Pipeline** | N/A for this project track (`pipeline_run.sh` not used here) |
| **BUILD status** | **COMPLETE** — `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_11_AOS_V3_GATE_5_BUILD_COMPLETE_VERDICT_v1.0.0.md` (GATE_5 PASS, 2026-03-28) |
| **GATE_DOC (phase B)** | **COMPLETE** — `_COMMUNICATION/team_190/TEAM_190_AOS_V3_GATE_DOC_PHASE_B_REVIEW_v1.0.0.md` (**PASS**) + `_COMMUNICATION/team_11/TEAM_11_RECEIPT_AOS_V3_GATE_DOC_PHASE_B_CLOSURE_v1.0.0.md`. תיעוד v3: `documentation/docs-agents-os/**/AGENTS_OS_V3_*` (Directive **3B**; no `agents_os_v3/docs/`) |
| **REMEDIATION (Team 100 audit)** | **PASS (סגור 2026-03-28)** — דוח מקור `_COMMUNICATION/team_100/TEAM_100_AOS_V3_BUILD_COMPLETENESS_AUDIT_AND_GAP_PLAN_v1.0.0.md`; **Phase 0–5 PASS**; מפת שלבים §**0.11**; דוח סגירה ל-**100**: `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_100_AOS_V3_REMEDIATION_CLOSURE_REPORT_v1.0.0.md`; ל-**00**: `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_00_AOS_V3_REMEDIATION_CLOSURE_REPORT_v1.0.1.md` (**FINAL**); CI: `.github/workflows/aos-v3-tests.yml` (כולל שלב **F-05** `scripts/run_aos_v3_canary_simulation.sh`) + runner נפרד ל-51 `scripts/run_aos_v3_phase5_canary_sim.sh` |
| **Default branch** | `main` remains the GitHub default; merge when Principal approves + data migration is ready |
| **Iron Rules** | `agents_os_v2/` **FROZEN**; every file under `agents_os_v3/` must appear in `agents_os_v3/FILE_INDEX.json` before commit — see `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_191_AOS_V3_GIT_GOVERNANCE_CANONICAL_v1.1.0.md` |

**Pre-commit:** `phoenix-aos-v3-file-index-v2-freeze` · **BUILD check:** `bash scripts/check_aos_v3_build_governance.sh`

**Work Package ID format (Iron Rule):** Always `S{NNN}-P{NNN}-WP{NNN}` — three levels, always. Stage (`S003`), Program (`S003-P005`), Work Package (`S003-P005-WP001`). Even if a program has only one WP it must be `WP001`. **Never** use a program-level ID (`S003-P005`) as a `work_package_id`. Enforced in `initiate_run()` (HTTP 400 `INVALID_WP_ID_FORMAT`) and by a DB `CHECK` constraint. Directive: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_WP_ID_NAMING_CONVENTION_v1.0.0.md`

**Local AOS v3 DB (GATE_0):** Configure **`agents_os_v3/.env`** with **`AOS_V3_DATABASE_URL`** only (isolated from TikTrack `api/.env` / `DATABASE_URL`). Optional: `AOS_V3_DOCKER_PG_CONTAINER` when multiple Postgres containers exist. Then `bash scripts/init_aos_v3_database.sh` — applies `001`, runs `seed.py`.

**AOS v3 API (local) — agent startup protocol:**
1. **Always run `bash scripts/start-aos-v3-server.sh` as the first step** before any API call. The script is idempotent: if AOS v3 is already healthy on port 8090 it prints "already running" and exits 0; if the port is free it starts the server; if the port is occupied by a non-AOS process it exits 2 with diagnostics.
2. A single failed `curl /api/health` is **not** sufficient to conclude the server is down — a brief reload window (~2–4 s) can cause a transient 7/connection-refused. Always run the start script, not a raw curl, to determine server state.
3. **Do not start uvicorn with `--reload`** in agent/operational sessions. `--reload` causes brief downtime on every file change and will produce false-negative health checks for other agents running concurrently.
4. `GET /api/state` **requires** the `X-Actor-Team-Id` header (e.g. `-H 'X-Actor-Team-Id: team_190'`).

Commands: Start: `bash scripts/start-aos-v3-server.sh` · Stop: `bash scripts/stop-aos-v3-server.sh` · Restart: `bash scripts/restart-aos-v3-server.sh` · DB+API bootstrap: `bash scripts/bootstrap_aos_v3_local.sh`. **Port:** 8090 (canonical). `agents_os/scripts/start_ui_server.sh` (agents_os_v2, frozen) also defaults to 8090 — it must not be running during AOS v3 agent sessions.

**Dual-domain DB health (TikTrack + AOS, isolated URLs):** `python3 scripts/verify_dual_domain_database_connectivity.py` (needs `psycopg2`; uses `api/.env` + `agents_os_v3/.env`).

---

## Document Correction Protocol (Iron Rule — 2026-04-03)

**Root cause:** Validation loops extended to 4 rounds because corrections fixed the specific location named in a finding but missed duplicate occurrences of the same claim elsewhere in the same document. The "Authority matrix: unchanged" line survived 2 full correction rounds this way.

**Mandatory steps when addressing any validation finding that involves correcting a claim in a document:**

### Step 1 — Identify the key phrase
Extract the specific claim being corrected. Example: `Authority matrix: unchanged from v0.2`

### Step 2 — Search exhaustively before editing
```bash
grep -in "authority matrix.*unchanged" _COMMUNICATION/team_100/RELEVANT_DOC.md
# Run for EVERY document that is being corrected, not just the one line referenced
```

### Step 3 — Fix ALL occurrences in a single commit
Every instance found in Step 2 must be fixed in the same commit. No partial fixes.

### Step 4 — Verify zero remaining occurrences after editing
```bash
grep -in "authority matrix.*unchanged" _COMMUNICATION/team_100/RELEVANT_DOC.md
# Expected: no output. If any output remains → do not commit.
```

### Step 5 — Cross-check related documents
For any claim that appears in document A, check whether the same claim was also copied into companion documents (delta docs, context docs, summaries). Run the same grep against the full `_COMMUNICATION/` tree:
```bash
grep -rn "key phrase" _COMMUNICATION/
```

**This protocol is BLOCKING.** A correction that misses a duplicate is a failed correction — it will be found in the next validation round and extend the loop unnecessarily.

---

## Organizational Structure (LOCKED — 2026-03-26)

**Every agent MUST learn the organizational structure and fully adopt its assigned role at onboarding.** This is non-negotiable. Drift from role boundaries is a governance violation.

### Full Team Roster — 21 Teams

| ID | Name | Group | Domain | Engine |
|---|---|---|---|---|
| team_00 | Principal & Chief Architect | leadership/architecture | multi | claude-code |
| team_10 | Execution Orchestrator | gateway | tiktrack | cursor |
| team_11 | AOS Gateway / Execution Lead | gateway | agents_os | cursor |
| team_20 | Backend Implementation | implementation | tiktrack | cursor |
| team_21 | AOS Backend Implementation | implementation | agents_os | cursor |
| team_30 | Frontend Implementation | implementation | tiktrack | cursor |
| team_31 | AOS Frontend Implementation | implementation | agents_os | cursor |
| team_40 | UI Assets & Design | design | tiktrack | cursor |
| team_50 | QA & Functional Acceptance | qa | tiktrack | cursor |
| team_51 | AOS QA & Functional Acceptance | qa | agents_os | cursor |
| team_60 | DevOps & Platform | implementation | tiktrack | cursor |
| team_61 | AOS DevOps & Platform | implementation | agents_os | cursor |
| team_70 | TikTrack Documentation | documentation | tiktrack | codex |
| team_71 | AOS Documentation | documentation | agents_os | codex |
| team_90 | Dev Validator | governance | multi | codex |
| team_100 | Chief System Architect / Chief R&D | architecture | agents_os | codex |
| team_110 | TikTrack Domain Architect (IDE) | architecture | tiktrack | codex |
| team_111 | AOS Domain Architect (IDE) | architecture | agents_os | codex |
| team_170 | Spec & Governance | governance | multi | codex |
| team_190 | Constitutional Validator | governance | multi | codex |
| team_191 | Git-Governance Lane | governance | multi | cursor |

### x0/x1 Domain Pattern

Every functional role has a TikTrack (x0) and AOS (x1) mirror:

```
x0 (TikTrack)    x1 (AOS)         Function
─────────────────────────────────────────
team_10          team_11          Gateway
team_20          team_21          Backend
team_30          team_31          Frontend
team_50          team_51          QA
team_60          team_61          DevOps
team_70          team_71          Documentation
```

**Rule:** x0 and x1 receive the same Layer 4 task template with a different domain parameter.

### 4-Layer Context Model (mandatory for ALL agent sessions)

| Layer | Content | Loaded From |
|---|---|---|
| **Layer 1 — Identity** | Team ID, name, role, domain, engine, parent/children | `TEAMS_ROSTER_v1.0.0.json` → `layer_1_identity` |
| **Layer 2 — Governance** | writes_to, governed_by, gate_authority, Iron Rules | `TEAMS_ROSTER_v1.0.0.json` → `layer_2_authority` + `layer_4_procedure.iron_rules` |
| **Layer 3 — Current State** | WSM, pipeline state, active WP/gate, relevant specs | WSM + `pipeline_state.json` + domain-specific SSOT |
| **Layer 4 — Task** | Specific mandate, deliverables, acceptance criteria | Activation prompt from issuing team |

**Iron Rule:** Context loaders MUST bind the specific team ID (e.g., `team_31` not `team_30`) so an agent never runs with a generic or wrong-domain identity.

**Context size by profession:**

| Profession | Layer 2 | Layer 3 | Rationale |
|---|---|---|---|
| backend/frontend/devops_engineer | SMALL | Current WP + gate | Focused execution scope |
| gateway_orchestrator | MEDIUM | Full pipeline state | Coordination awareness |
| qa_engineer | MEDIUM | Current WP + test state | QA protocols + domain |
| domain_architect | LARGE | Full architecture state | LOD200/400 + all rules |
| constitutional_validator | LARGE | Gate submission under review | Cross-domain constitution |
| principal | FULL | All | Supreme authority |

### SSOT Files for Org Structure

```
documentation/docs-governance/01-FOUNDATIONS/TEAM_TAXONOMY_v1.0.1.md         ← Group + Profession enums, x0/x1 map, context isolation rules
documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json        ← Canonical 4-layer definitions per team (SSOT for loaders)
documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.1.md ← Roles, scope, registration records, domain split lock
```

### Principal (Team 00) — SSOT behavior (AOS v3 alignment)

- **One human operator** in canon: **Team 00 / Principal** (see `PRINCIPAL_AND_TEAM_00_MODEL_v1.0.0.md` for D-01…D-14).
- **No personal names** in SSOT identifiers or specs; use `Principal`, `Team 00`, `team_00`, `operator`, `human` as appropriate.
- **Principal does not routinely author repository files** or **run routine test suites**; mandated squads produce artifacts, and tests run under human-gate or explicit request (same addendum).
- **Team 100** receives AOS v3 spec handoffs from **Team 110** (IDE domain architect) under Principal-authorized programs; **Team 00** remains escalations + Iron Rules (`TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.1.md` §1.4–1.5).
- **Pipeline Fidelity Suite (PFS):** canonical harness name for scripted pipeline+dashboard exercises — not new roster squads (`PRINCIPAL_AND_TEAM_00_MODEL_v1.0.0.md` §3).

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
5. **AOS v3 (BUILD track):** From workspace root: `bash scripts/bootstrap_aos_v3_local.sh` or `bash scripts/start-aos-v3-server.sh` after DB init. Health: `curl -s http://127.0.0.1:8090/api/health` → `{"status":"ok"}`. VS Code / Cursor: **Tasks** include Init AOS v3 DB, Start/Stop/Restart AOS v3 API, Bootstrap.

### Database Setup Gotchas

- The full DDL at `documentation/docs-system/02-SERVER/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` has ordering issues and partial unique constraint syntax errors. It cannot be applied cleanly in one pass. Several tables must be created manually after the initial DDL run (tickers, trading_accounts, trades, alerts, user_tickers, exchange_rates, ticker_prices, etc.).
- Two extra tables not in the DDL are required by the ORM models: `user_data.user_refresh_tokens` and `user_data.revoked_tokens` (defined in `api/models/tokens.py`).
- The `DATABASE_URL` in `api/.env` must use `postgresql://` (not `postgresql+asyncpg://`); the code adds the `+asyncpg` prefix automatically in `api/core/database.py`.

### Auth & Admin

- Primary local QA/runtime login: username `TikTrackAdmin`, password `4181` (seeded via `python3 scripts/seed_qa_test_user.py` and used by current QA/E2E flows)
- `python3 api/scripts/create_admin_user.py` creates a separate bootstrap user `admin / 418141`, but this user should not be assumed to exist in the active local database after resets or reseeds
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

**AOS v3 BUILD track:** Use branch **`aos-v3`**; push to **`origin/aos-v3`**. Maintain **`agents_os_v3/FILE_INDEX.json`** for every path under `agents_os_v3/` (see **Active branch — AOS v3** above). Do **not** modify `agents_os_v2/`.

**Push rules:**
- Always push to `main` for approved Phase 1 items
- Run `python3 -m pytest agents_os_v2/tests/ -v -k "not OpenAI and not Gemini"` before push
- Verify 0 test failures before push

**Pre-GATE_4 check:** Pipeline warns if no new commits since last run. Ensure implementation is committed before continuing to GATE_4.

---

## Pipeline Dashboard — Display State Reference (G-01)

When `current_gate = COMPLETE` (or `NONE` / empty), the dashboard intentionally shows `—`
in several sidebar fields.  This is correct behavior — not a test failure.

| `current_gate` value | `s-owner` | `s-engine` | Gate pill | `team-assignment-expected` |
|----------------------|-----------|------------|-----------|---------------------------|
| `COMPLETE` | `—` | `—` | ✅ WP CLOSED | `—` (empty or not rendered) |
| `NONE` or empty | `—` | `—` | ✅ WP CLOSED | `—` |
| Any active gate (e.g. `GATE_3`) | Team ID | Engine string | Gate name + status | Team ID |

**Source:** `agents_os/ui/js/pipeline-dashboard.js` — `isComplete` flag (around line 157).

**For QA tests:** Assert `s-owner` = `—` (not empty string check) when gate is COMPLETE.
The `team-assignment-expected` element may be absent from the DOM entirely in COMPLETE state.

**Domain deep-link:** `http://localhost:8090/?domain=agents_os` loads Agents OS domain directly.
