# Agents OS v3 — backend (`agents_os_v3/`)

FastAPI service, PostgreSQL state, audit ledger, routing, prompt assembly, and AOS v3 UI static assets under `ui/`. This tree is **isolated** from TikTrack (`api/`) and from legacy **`agents_os_v2/`** (frozen — do not modify).

Canonical governance for agents is in the repo root **`AGENTS.md`**. Long-form documentation with prefix **`AGENTS_OS_V3_*`** lives under `documentation/docs-agents-os/` (**Team 71**). This README is the **local runbook** for implementers; it should stay aligned with `AGENTS.md` for URLs, ports, and scripts.

## Requirements

- Python 3.9+ (see `requirements.txt`)
- PostgreSQL 16+ (or compatible) for the **AOS-only** database
- Repo checkout on branch **`aos-v3`** for active BUILD work

## Environment

1. Copy `agents_os_v3/.env.example` → `agents_os_v3/.env`.
2. Set **`AOS_V3_DATABASE_URL`** to a Postgres URL used **only** for AOS v3 (not the TikTrack app DB).
3. Optional: `AOS_V3_DOCKER_PG_CONTAINER` if `scripts/init_aos_v3_database.sh` must target a specific Docker container.

Optional runtime:

- **`AOS_V3_SERVER_PORT`** — API listen port (default **8090**). Conflicts with v2 UI on the same port if both run locally.
- **`AOS_V3_PUBLIC_API_BASE`** — base URL embedded in `GET /api/state` `next_action.cli_command` (default `http://127.0.0.1:8090`).
- **`ALLOWED_ORIGINS`** — comma-separated CORS origins (see `modules/management/api.py` for defaults).

## Install dependencies

From repo root:

```bash
pip install -r agents_os_v3/requirements.txt
```

## Database init and seed

From repo root (loads `agents_os_v3/.env` inside the script where applicable):

```bash
bash scripts/init_aos_v3_database.sh
```

Applies migration `001`, runs `seed.py` idempotently. One-shot DB + API:

```bash
bash scripts/bootstrap_aos_v3_local.sh
```

Skip DB init: `AOS_V3_SKIP_DATABASE_INIT=1 bash scripts/bootstrap_aos_v3_local.sh`.

## Run the API

```bash
bash scripts/start-aos-v3-server.sh
```

- Default URL: `http://127.0.0.1:8090`
- Health: `GET /api/health` → `{"status":"ok"}`
- OpenAPI: `/docs`, `/redoc`

Stop / restart:

```bash
bash scripts/stop-aos-v3-server.sh
bash scripts/restart-aos-v3-server.sh
```

## Mutations and identity

Mutating routes require header **`X-Actor-Team-Id`** (BUILD stub; see `modules/management/authority.py`). Bodies do **not** carry `actor_team_id` in the current BUILD contract.

## Package layout (high level)

| Path | Role |
|------|------|
| `modules/management/api.py` | FastAPI routers: `/api/*` business + health + SSE |
| `modules/management/use_cases.py` | UC orchestration; calls `state.machine.execute_transition` for mutations |
| `modules/state/machine.py` | Transactions, run lifecycle, events via ledger |
| `modules/state/repository.py` | SQL helpers (runs, events, pending feedback, …) |
| `modules/audit/ledger.py` | Append-only `events` + canonical `event_hash` |
| `modules/audit/ingestion.py` | Feedback Ingestion Pipeline (FIP) |
| `modules/audit/sse.py` | Server-Sent Events broadcaster (post-commit) |
| `modules/routing/resolver.py` | `resolve_actor_team_id` for active runs |
| `modules/prompting/builder.py` | Assembled prompt for `GET /api/runs/{id}/prompt` |
| `modules/management/portfolio.py` | Portfolio reads (teams, runs, work packages, ideas) |
| `definition.yaml` | Seed source for gates, teams, routing (with `seed.py`) |
| `db/migrations/` | DDL |
| `tests/` | `pytest` |

## Tests and governance

```bash
PYTHONPATH=. python3 -m pytest agents_os_v3/tests/ -v
bash scripts/check_aos_v3_build_governance.sh
```

Every new path under `agents_os_v3/` must be listed in **`FILE_INDEX.json`** before commit (`AGENTS.md`).

## SSE

`GET /api/events/stream` — subscribe with optional `run_id` / `domain_id` query params. Requires the app lifespan (see `create_app()`); events are pushed after successful DB commits (not inside transactions).

## No in-tree doc site here

Per **Directive 3B**, do **not** add `agents_os_v3/docs/` for long narrative docs; use `documentation/docs-agents-os/` under **Team 71** ownership.
