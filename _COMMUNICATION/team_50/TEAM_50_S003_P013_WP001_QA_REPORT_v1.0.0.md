---
id: TEAM_50_S003_P013_WP001_QA_REPORT_v1.0.0
historical_record: true
from: Team 50 (QA & Functional Acceptance — TikTrack product QA)
to: Team 10 (Gateway), Team 61 (pipeline), Team 20/30 (execution)
cc: Team 51 (AOS QA — informational; TRACK_FOCUSED routing)
date: 2026-03-23
status: QA_REPORT_FINAL
work_package_id: S003-P013-WP001
gate_context: GATE_4 — D33 `display_name` (canary monitored run)
process_variant: TRACK_FOCUSED
project_domain: tiktrack
verdict: QA_PASS
severe_findings: 0---

# Team 50 — GATE_4 QA Report | S003-P013-WP001 | D33 `display_name`

## Mandatory identity header

| Field | Value |
| --- | --- |
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| work_package_id | S003-P013-WP001 |
| gate_id | GATE_4 |
| project_domain | tiktrack |
| process_variant | TRACK_FOCUSED |
| phase_owner | Team 50 |

## End identity header

---

## Verdict

| | |
| --- | --- |
| **verdict** | **QA_PASS** |
| **SEVERE (GATE_4 blocker)** | **0** |

**FAIL_CMD:** _(not used — PASS)_

---

## Scope recap (LOD200)

- Surface `user_data.user_tickers.display_name` in **`GET /api/v1/me/tickers`** (`TickerResponse.display_name`, key present; `null` allowed).
- D33 (`/user_tickers`): table column **שם תצוגה**; if `display_name` null/empty after trim → show **symbol** with **muted** styling; **read-only** on D33 (no UI to PATCH `display_name`).

**Normative path note (Team 170 LLD400):** stakeholder phrase “GET /api/v1/user_tickers” maps to **`GET /api/v1/me/tickers`** in the active FastAPI map. QA exercised **`/api/v1/me/tickers`** only.

---

## Automated evidence (terminal)

| Command | Exit code | Result summary |
| --- | ---: | --- |
| `python3 -m pytest tests/unit/ -v --tb=short` | **0** | **37 passed**, 2 skipped (`test_d33_parallel_create` ×2) |
| `python3 -m pytest tests/test_external_data_cache_failover_pytest.py -v --tb=short` | **0** | **6 passed** |
| `cd ui && npx vite build` | **0** | Production build completed successfully |

Environment: macOS, Python 3.9.6, repo root `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix`. Warnings only (Pydantic deprecations); no failures.

---

## API acceptance — `GET /api/v1/me/tickers`

| # | Scenario | Result | Evidence |
| --- | --- | --- | --- |
| A1 | Response envelope `data` + `total`; each element includes **`display_name` key** | **PASS** | `curl` + JWT: `first_keys` included `'display_name'`; `total` matched `len(data)` |
| A2 | `display_name` reflects DB (`null` when unset) | **PASS** | Sample rows: `ANAU.MI`, `BTC-USD`, `TEVA.TA` → `display_name: null` |

**Supplemental (non-blocking):** To validate **non-null** presentation end-to-end, QA temporarily set `display_name` via **`PATCH /api/v1/me/tickers/{ticker_id}`** (allowed by LLD for non-D33 clients), confirmed UI showed **“QA Display Label”**, then cleared via `PATCH` with **`display_name: ""`** (empty string). **Informational:** JSON `{"display_name":null}` does not clear the field because `update_user_ticker` only updates when `display_name is not None` — **out of WP scope** (PATCH behavior not changed by this WP).

---

## UI acceptance — D33 (`http://localhost:8080/user_tickers`)

| # | Scenario | Result | Evidence |
| --- | --- | --- | --- |
| U1 | Authenticated user can open D33; table renders | **PASS** | MCP browser: login → navigate D33; title **הטיקרים שלי**; pagination + row actions present |
| U2 | Column **שם תצוגה** exists (markup) | **PASS** | `user_tickers.content.html`: `phoenix-table__header-text` **שם תצוגה**, `data-sort-key="display_name"` |
| U3 | Non-empty `display_name` shown as normal cell text | **PASS** | After PATCH probe, `browser_wait_for` found text **“QA Display Label”** on page |
| U4 | Null/empty `display_name` → fallback **symbol** + **muted** color | **PASS** | Code review: `userTickerTableInit.js` sets `displayCell.style.color = 'var(--color-text-muted)'` when `!customName` |
| U5 | D33 does not offer edit flow for `display_name` | **PASS** | Static review: `userTickerTableInit.js` documents read-only; no `PATCH` / `display_name` write from `userTicker` view JS |
| U6 | Sort key `display_name` uses effective label | **PASS** | Code review: `effectiveDisplaySortKey` for `display_name` column sort |

**Browser note:** A second IDE browser tab showed `chrome-error://chromewebdata/` before navigation; QA used tab `e0b1eb` only. **Not scored as product defect.**

---

## HITL / KB-64 assumptions

- Nimrod unavailable: **no** blocking questions; LLD400 treated as normative for path naming (`/me/tickers`).
- Local stack: backend `http://localhost:8082/health` → **200**; UI `http://localhost:8080` (Vite dev).

---

## Traceability (implementation pointers — informational)

- API list path: `api/routers/me_tickers.py` → `get_my_tickers` → `UserTickersService.get_my_tickers` selects `UserTicker.display_name` and maps via `_ticker_to_response` / `model_copy(update={"display_name": ...})`.
- Schema: `api/schemas/tickers.py` — `TickerResponse.display_name`.
- UI: `ui/src/views/management/userTicker/userTickerTableInit.js` — column build + muted fallback.

---

## Closure

**GATE_4:** **QA_PASS** — **0 SEVERE** — automated suites green; API contract satisfied for `display_name`; D33 presents column per LLD with read-only constraint respected.

**log_entry | TEAM_50 | QA_REPORT | S003-P013-WP001_GATE_4_D33_DISPLAY_NAME | PASS | 2026-03-23**
