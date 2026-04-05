# PROJECT CONTEXT — TikTrack Phoenix

## What is this project?

TikTrack is a financial ticker tracking and portfolio management platform.
Backend: FastAPI (port 8082, /api/v1/). Frontend: port 8080.
Database: PostgreSQL (tiktrack). Financial precision: NUMERIC(20,8).

## Current State

- **Active milestone:** S003 (AOS Infrastructure)
- **Active WP:** AOS-V310-WP2 (TikTrack _aos/ migration)
- **Profile:** L2 (dual-profile)
- **AOS engine version:** v0.1.0+ecf247c (in agents_os_v3/)

## Dual-Profile Mode (active until S004)

TikTrack operates in dual-profile mode:

| Layer | Mechanism | Status |
|-------|-----------|--------|
| L0 governance | `_aos/` directory | NEW — created in AOS v3.1.0 WP-2 |
| L2 engine | `agents_os_v2/` (pipeline_run.sh) | UNCHANGED — S004 scope |

These layers are independent. `_aos/` does NOT change engine behavior.
`pipeline_run.sh` continues to call `agents_os_v2.orchestrator.pipeline`.

## Key Directories

- `_aos/` — L0 governance (roadmap, teams, methodology)
- `agents_os_v3/` — AOS v3 engine snapshot (v0.1.0+ecf247c)
- `agents_os_v2/` — LEGACY engine (pipeline_run.sh still uses this)
- `agents_os/` — ARCHIVED v1 foundation
- `api/` — TikTrack backend (FastAPI)
- `ui/` — TikTrack frontend

## What NOT to touch

- `pipeline_run.sh` — S004 scope. Do not modify.
- `agents_os_v3/` — Do not rename. D-04 defers rename to S004.
- `agents_os_v2/` — LEGACY. Read-only except archival notes.
