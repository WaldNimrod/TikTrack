# Agents_OS v3 — Developer runbook
## documentation/docs-agents-os/04-PROCEDURES/AGENTS_OS_V3_DEVELOPER_RUNBOOK.md

**project_domain:** AGENTS_OS  
**owner:** Team 71 (AOS Documentation)  
**date:** 2026-03-28  
**status:** Active

**Traceability:** Directive 3B · Team 11 → Team 71 GATE_DOC Phase B mandate (2026-03-28)

---

## 1. Prerequisites

- Python 3 with `fastapi` and `uvicorn` (scripts may `pip install -r agents_os_v3/requirements.txt` if imports fail).
- PostgreSQL reachable from your machine.
- Repo root as working directory for all commands below.

**Domain isolation:** AOS v3 uses **`agents_os_v3/.env`** and **`AOS_V3_DATABASE_URL`** only. Do not point it at the TikTrack application database. See `agents_os_v3/.env.example`.

---

## 2. Configure environment

1. Copy `agents_os_v3/.env.example` → `agents_os_v3/.env`.
2. Set **`AOS_V3_DATABASE_URL`** to a Postgres URL, e.g. `postgresql://user:pass@127.0.0.1:5432/aos_v3`.
3. Optional: **`AOS_V3_VENV`** to a venv path, or use `agents_os_v3/.venv` / `api/venv` (see scripts).
4. Optional: **`AOS_V3_DOCKER_PG_CONTAINER`** and related vars for Docker-assisted DB creation (documented in `.env.example`).
5. Optional: **`ALLOWED_ORIGINS`** for CORS (comma-separated).

---

## 3. Database init

Apply migration **`001`**, run seed:

```bash
bash scripts/init_aos_v3_database.sh
```

This loads `agents_os_v3/.env`, ensures local Postgres role/DB when applicable, runs `agents_os_v3/db/run_migration.py --fresh`, then `agents_os_v3/seed.py`.

---

## 4. Start and stop the API

**Start (background, default port 8090):**

```bash
bash scripts/start-aos-v3-server.sh
```

**Foreground (logs in terminal):**

```bash
bash scripts/start-aos-v3-server.sh --foreground
```

**Stop:**

```bash
bash scripts/stop-aos-v3-server.sh
```

**Restart:**

```bash
bash scripts/restart-aos-v3-server.sh
```

**Health check:**

```bash
curl -s http://127.0.0.1:8090/api/health
```

Expected: `{"status":"ok"}` (adjust host/port if overridden).

**OpenAPI:** `http://127.0.0.1:8090/docs`

---

## 5. Port 8090 conflict (v2 vs v3)

`agents_os/scripts/start_ui_server.sh` (Agents OS **v2** UI) also uses **8090**. Only one listener per port.

- Stop the v2 UI first, **or**
- Run v3 on another port: `AOS_V3_SERVER_PORT=8091 bash scripts/start-aos-v3-server.sh`

---

## 6. One-shot bootstrap

DB init + start API:

```bash
bash scripts/bootstrap_aos_v3_local.sh
```

Skip database steps (server only):

```bash
AOS_V3_SKIP_DATABASE_INIT=1 bash scripts/bootstrap_aos_v3_local.sh
```

---

## 7. Static UI (v3)

The FastAPI app does **not** serve `agents_os_v3/ui/` as static files. For local testing, use a simple HTTP server from repo root, e.g.:

```bash
python3 -m http.server 8778
```

Then open paths under `http://127.0.0.1:8778/agents_os_v3/ui/` (e.g. `index.html`). The UI expects the API at a configurable base URL (see `agents_os_v3/ui/api-client.js`).

**Team 31 preflight** (serves pages and optionally checks API health):

```bash
bash agents_os_v3/ui/run_preflight.sh
# With API check:
AOS_V3_API_BASE=http://127.0.0.1:8090 bash agents_os_v3/ui/run_preflight.sh
```

Default static server port for the script is **8778**.

### 7.1 Browser E2E stack (Selenium — Remediation Phase 3a)

One script prepares **API + static UI** (DB migrate/seed optional):

```bash
# Optional: include DB init (001 + seed) before serving
AOS_V3_E2E_PREPARE_DB=1 bash scripts/run_aos_v3_e2e_stack.sh
# Or (API + static only, DB already migrated):
bash scripts/run_aos_v3_e2e_stack.sh
```

Install browser test deps once:

```bash
pip install -r agents_os_v3/requirements-e2e.txt
```

Run the **smoke** E2E (skipped by default unless `AOS_V3_E2E_RUN=1`):

```bash
AOS_V3_E2E_RUN=1 python3 -m pytest agents_os_v3/tests/e2e/ -v
```

Details: `agents_os_v3/tests/e2e/README.md`. Stop static HTTP: `bash scripts/stop_aos_v3_e2e_static.sh`.

---

## 8. Dual-domain DB connectivity check

When both TikTrack and AOS v3 URLs are configured:

```bash
python3 scripts/verify_dual_domain_database_connectivity.py
```

Requires `psycopg2` and `api/.env` + `agents_os_v3/.env` as described in [AGENTS.md](../../../AGENTS.md).

---

## 9. BUILD governance (branch `aos-v3`)

Pre-commit / CI-style check for v2 freeze + `FILE_INDEX.json` coverage:

```bash
bash scripts/check_aos_v3_build_governance.sh
```

See script header in `scripts/check_aos_v3_build_governance.sh` for behavior.

### 9.1 GitHub Actions (CI — Phase 4)

Workflow **`.github/workflows/aos-v3-tests.yml`** runs on `push` / `pull_request` (paths under `agents_os_v3/` or the workflow file), plus **`workflow_dispatch`**. It starts **PostgreSQL 15**, sets **`AOS_V3_DATABASE_URL`**, applies **`001` + `seed.py`**, then on **Python 3.12**:

1. **`pytest agents_os_v3/tests/`** with **`--ignore=agents_os_v3/tests/canary_simulation/`** (main suite).
2. **`bash scripts/run_aos_v3_canary_simulation.sh`** — **Phase 5 / F-05** canary (folder `agents_os_v3/tests/canary_simulation/` only; explicit PASS/FAIL step).

It does **not** modify **`canary-simulation-tests.yml`** (Agents OS v2). Browser E2E under `agents_os_v3/tests/e2e/` remains **skipped** in CI unless `AOS_V3_E2E_RUN=1` (not enabled in that workflow — see remediation Phase 4 completion note from Team 61).

**Local canary only:** after DB is ready, `bash scripts/run_aos_v3_canary_simulation.sh` (requires `AOS_V3_DATABASE_URL` + `PYTHONPATH` at repo root). See `agents_os_v3/tests/canary_simulation/README.md`.

---

## 10. Documentation and code ownership

- **Canonical v3 docs:** `documentation/docs-agents-os/` — files prefixed **`AGENTS_OS_V3_`**.
- **No** `agents_os_v3/docs/` directory.
- **`agents_os_v3/README.md`:** intended as a short entry point (Team **21**); link to [AGENTS_OS_V3_OVERVIEW.md](../01-OVERVIEW/AGENTS_OS_V3_OVERVIEW.md).

---

## 11. Related documents

- [AGENTS_OS_V3_OVERVIEW.md](../01-OVERVIEW/AGENTS_OS_V3_OVERVIEW.md)
- [AGENTS_OS_V3_API_REFERENCE.md](../02-ARCHITECTURE/AGENTS_OS_V3_API_REFERENCE.md)
- [AGENTS_OS_V3_LOCAL_VALIDATION_CHECKLIST.md](../05-TEMPLATES/AGENTS_OS_V3_LOCAL_VALIDATION_CHECKLIST.md)

---

**log_entry | TEAM_71 | AOS_V3 | GATE_DOC_PHASE_B | DEVELOPER_RUNBOOK | 2026-03-28**
