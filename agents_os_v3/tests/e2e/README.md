# AOS v3 — browser E2E (Selenium)

**Owner:** Team 61 (infra) / Team 51 (scenarios)  
**Gate:** Remediation Phase 3a (infra) + **Phase 3b** (browser scenarios in `test_phase3b_browser_scenarios.py`)

## Prerequisites

1. **Chrome** installed (Selenium 4 manages ChromeDriver via Selenium Manager when possible).
2. Python deps: `pip install -r agents_os_v3/requirements-e2e.txt` (in addition to `agents_os_v3/requirements.txt` / `api/venv`).
3. **Stack (canonical):** AOS v3 FastAPI on **8090** serves both `/api/*` and UI at **`http://127.0.0.1:8090/`** and `/v3/*`. From repo root:

```bash
bash scripts/run_aos_v3_e2e_stack.sh
```

This ensures the v3 server is running and checks `/api/health`, `/v3/index.html`, and `/`. It does **not** start a second HTTP server unless you opt into legacy mode (below).

Optional one-shot DB migrate/seed before first run:

```bash
AOS_V3_E2E_PREPARE_DB=1 bash scripts/run_aos_v3_e2e_stack.sh
```

## Run tests

Default: E2E tests are **skipped** unless explicitly enabled (keeps `pytest agents_os_v3/tests/` green without Chrome).

```bash
AOS_V3_E2E_RUN=1 python3 -m pytest agents_os_v3/tests/e2e/ -v
```

Phase 3b adds multi-page scenarios (Pipeline presets + nav, Configuration tabs, Teams, Portfolio modal, History, System Map). Same env vars.

**Full UI survey** (`test_e2e_full_ui_survey.py`): loads every v3 page, asserts Type A (Pipeline + System Map) vs Type B domain controls, cycles **all** Configuration and Portfolio tabs, and smoke-checks top-nav links. Run with the same `AOS_V3_E2E_RUN=1` — this is the checklist for “all pages and tabs,” not the default `pytest agents_os_v3/tests/` run (browser tests stay opt-in).

**Same-origin (default):** UI on **8090** can call `/api/*` without CORS issues. Set **`AOS_V3_E2E_UI_MOCK=0`** to exercise the live API; default **`AOS_V3_E2E_UI_MOCK=1`** keeps `aosv3_mock=1` on URLs (mock data) for deterministic tests.

**Legacy separate static server:** `AOS_V3_E2E_SEPARATE_STATIC=1 bash scripts/run_aos_v3_e2e_stack.sh` starts `python -m http.server` on **8778** (old workflow). Then set `AOS_V3_E2E_BASE_URL=http://127.0.0.1:8778/agents_os_v3/ui/index.html` for pytest, or rely on that URL explicitly.

### Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `AOS_V3_E2E_RUN` | *(unset)* | Set to `1` / `true` / `yes` to run browser tests |
| `AOS_V3_E2E_BASE_URL` | `http://127.0.0.1:8090/v3/index.html` | Page URL used to derive sibling paths under `/v3/` |
| `AOS_V3_E2E_HEADLESS` | `1` | Set `0` to see the browser |
| `AOS_V3_E2E_UI_MOCK` | `1` | Append `aosv3_mock=1`; set `0` for live API (same-origin) |
| `AOS_V3_E2E_SEPARATE_STATIC` | *(unset)* | Set `1` with stack script to add port **8778** static tree |

## Stop servers

- **v3 (8090):** `bash scripts/stop-aos-v3-server.sh`
- **Legacy static (8778) only:** `bash scripts/stop_aos_v3_e2e_static.sh`

---

**log_entry | TEAM_61 | AOS_V3 | E2E_INFRA | README | 2026-03-28**  
**log_entry | TEAM_61 | AOS_V3 | E2E_INFRA | README_8090_DEFAULT | 2026-03-28**
