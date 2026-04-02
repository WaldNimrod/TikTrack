# Agents OS — Network ports & browser entry (LOCKED)
## documentation/docs-agents-os/02-ARCHITECTURE/AGENTS_OS_V3_NETWORK_PORTS_AND_UI_ENTRY_v1.0.0.md

**project_domain:** AGENTS_OS  
**owner:** Team 71 (documentation) / enforced in code by Team 61 (runtime)  
**date:** 2026-03-28  
**status:** **LOCKED** — do not change ports without Principal + Team 100 erratum and simultaneous code/doc update.

---

## 1. Policy summary

| Stack | Port | Base URL | Purpose |
|--------|------|----------|---------|
| **AOS v3** (BUILD) | **8090** | `http://127.0.0.1:8090/` | FastAPI: `/api/*`, OpenAPI `/docs`, SSE; **`GET /` serves** `index.html` **directly** (address bar stays `/`); static v3 UI also under `/v3/*`; HTML uses `<base href="/v3/">` for assets; shared CSS `/agents_os/ui/*` (repo `agents_os/ui/`) |
| **Agents OS v2** (frozen pipeline UI) | **8092** | `http://127.0.0.1:8092/` | `uvicorn agents_os_v2.server.aos_ui_server:app` via `./agents_os/scripts/start_ui_server.sh` — `/static/*`, `/_COMMUNICATION/*`, legacy `/api/log/*` stubs |

**TikTrack** remains **8080** (UI) / **8082** (API) — unchanged.

---

## 2. Implementation references (code)

- v3 root HTML + static mounts: `agents_os_v3/modules/management/api.py` (`create_app`)
- v3 start script (canonical 8090): `scripts/start-aos-v3-server.sh`
- E2E prep (default integrated UI, no 8778): `scripts/run_aos_v3_e2e_stack.sh` — Cursor task **Prepare AOS v3 E2E stack (:8090)**
- v2 start script (locked 8092): `agents_os/scripts/start_ui_server.sh`
- v2 default port helper: `agents_os_v2/server/aos_ui_server.py` (`_get_server_port`)
- CI (v2 dashboard): `.github/workflows/canary-simulation-tests.yml` (port **8092**)

---

## 3. User-facing entry (v3)

1. Start DB + API: `bash scripts/bootstrap_aos_v3_local.sh` (or init DB then `bash scripts/start-aos-v3-server.sh`).
2. Open **`http://127.0.0.1:8090/`** — no path required; the Pipeline View HTML is served at that exact URL.

---

## 4. Regression / legacy (v2)

For Selenium smoke, pipeline dashboard, or constitution HTML against **frozen** v2 surfaces:

```bash
./agents_os/scripts/start_ui_server.sh
# e.g. http://127.0.0.1:8092/static/PIPELINE_DASHBOARD.html
```

---

**log_entry | TEAM_71 | AGENTS_OS | NETWORK_PORTS_POLICY | LOCKED_8090_8092 | 2026-03-28**
