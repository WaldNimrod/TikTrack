date: 2026-03-28
historical_record: true

# TEAM_31 — GATE_4 AOS v3 production UI evidence

**Date:** 2026-03-28  
**Squad:** team_31 (AOS Frontend)  
**Scope:** Live wiring of `agents_os_v3/ui/*` to FastAPI under `/api` (default base `http://127.0.0.1:8090` via meta `aosv3-api-base` + `localStorage`).

## IR compliance

- **IR-3:** `agents_os_v3/FILE_INDEX.json` updated (v1.1.4) — `api-client.js`, `app.js`, `flow.html`, `run_preflight.sh`, `api.py` notes.
- **IR-4:** UI displays `next_action` and state from `GET /api/state` only; no client-side derivation of next actions.

## Backend deltas (supporting UI)

- `PUT /api/teams/{team_id}/engine` — actor `team_00` only (mandate alignment).
- `GET /api/templates` — list templates for Configuration tab (templates were previously single-ID only).
- CORS: UI dev ports per `api.py` `_allowed_origins()` (incl. 8778, 8766, 3000).

## Pages (six)

| Page | Live behavior |
|------|----------------|
| `index.html` | `GET /api/state`, SSE `/api/events/stream` + 15s poll, POST advance/fail/approve/pause/resume/resubmit; sidebar actor + API base |
| `history.html` | `GET /api/history` with server filters + pagination; run dropdown from `GET /api/runs` |
| `config.html` | `GET /api/routing-rules`, `GET /api/policies`, `GET /api/templates` |
| `teams.html` | `GET /api/teams`; engine save → `PUT /api/teams/{id}/engine` when not mock |
| `portfolio.html` | runs (active/completed), work-packages, ideas; `POST /api/ideas`, `PUT /api/ideas/{id}` |
| `flow.html` | Shared chrome; SSE chip + 15s `/api/health` poll fallback; Mermaid content unchanged |

## Mock mode (QA / snapshots)

- Query: `?mock=1` or `?aosv3_mock=1`, or meta `aosv3-use-mock` = `1`.

## Team 51 — TC-19…TC-26 (smoke orientation)

1. Start API (Team 61 port, typically **8090**): `uvicorn` app with DB per `AOS_V3_DATABASE_URL`.
2. Serve static UI: `python3 -m http.server 8778` from repo root (or allowed origin).
3. Open `http://127.0.0.1:8778/agents_os_v3/ui/index.html` (adjust path if using another server).
4. Set **X-Actor-Team-Id** in Pipeline sidebar (persisted); use `team_00` only for engine edits on Teams page.
5. Preflight: `AOS_V3_API_BASE=http://127.0.0.1:8090 bash agents_os_v3/ui/run_preflight.sh` — checks static pages + optional `/api/health`.

## Files touched (summary)

- `agents_os_v3/ui/api-client.js`, `app.js`, all six HTML shells, `run_preflight.sh`
- `agents_os_v3/modules/management/api.py` (`GET /templates`, prior GATE_4 routes)
- `agents_os_v3/FILE_INDEX.json`

---

**Handover:** Team 31 → Team 11 / Team 51 for E2E acceptance per program gate.
