date: 2026-03-22
historical_record: true

# Team 10 — G3 Plan | S003-P013-WP001 — D33 `display_name` (TRACK_FOCUSED)

**Document:** `TEAM_10_S003_P013_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`  
**From:** Team 10 (Gateway / Work Plan Author)  
**To:** Team 20 · Team 30 · Team 50 · Team 90 (Phase 2 plan review)  
**status:** DRAFT_FOR_EXECUTION  
**process_variant:** TRACK_FOCUSED  
**spec_ssot:** `_COMMUNICATION/team_170/TEAM_170_S003_P013_WP001_LLD400_v1.0.0.md` (GATE_1 LLD400, AS_MADE)

---

## Identity Header

`gate: G3_PLAN | wp: S003-P013-WP001 | stage: S003 | domain: tiktrack | date: 2026-03-22`

| Field | Value |
|-------|-------|
| roadmap_program | S003-P013 |
| work_package_id | S003-P013-WP001 |
| page / module | D33 — הטיקרים שלי (`user_tickers`) |
| phase_owner | Team 10 |

---

## §2 Files per team (canonical paths)

Each team **publishes** its closure / implementation narrative to the path below (operational artifact; not canonical promotion to `documentation/`).

| Team | Role | Canonical artifact path |
|------|------|-------------------------|
| **Team 20** | Backend — `GET /api/v1/me/tickers` contract, schema, service/query verification, automated tests | `_COMMUNICATION/team_20/TEAM_20_S003_P013_WP001_IMPLEMENTATION_v1.0.0.md` |
| **Team 30** | Frontend — D33 table columns, muted fallback, removal of D33 `display_name` edit path, `data-testid` anchors, HTML `colspan` / thead | `_COMMUNICATION/team_30/TEAM_30_S003_P013_WP001_IMPLEMENTATION_v1.0.0.md` |
| **Team 50** | QA — API + UI scenarios A–F, evidence, regression / canary hooks per LLD400 §5 | `_COMMUNICATION/team_50/TEAM_50_S003_P013_WP001_QA_REPORT_v1.0.0.md` |

**Primary code touchpoints (informative — teams confirm in their §2 artifacts):**

- **Team 20:** `api/routers/me_tickers.py`, `api/services/user_tickers_service.py`, `api/schemas/tickers.py` (`TickerResponse`, `TickerListResponse`), models `api/models/user_tickers.py` / `api/models/tickers.py`; new or extended tests under `tests/` (recommended: pytest covering list response shape).
- **Team 30:** `ui/src/views/management/userTicker/userTickerTableInit.js`, `ui/src/views/management/userTicker/user_tickers.content.html` (table markup / headers), optional `userTickerPageConfig.js`; **remove** D33-only wiring to `userTickerEditForm.js` / `PATCH /me/tickers/{id}` for display name (module may remain on disk for non-D33 use per LLD §2.5).
- **Team 50:** extend or add checks in `tests/user-tickers-qa.e2e.test.js` and/or MCP flows; document curl / UI steps in the QA report.

---

## §3 Execution order (dependencies)

| Phase | Owner | Dependency | Work summary |
|-------|--------|------------|--------------|
| **1** | Team 20 | None | Lock **API contract**: every element in `GET /api/v1/me/tickers` → `data[]` includes **`display_name`** (string or `null`), sourced from `user_data.user_tickers.display_name`, `total === len(data)`. **No DDL.** If implementation already matches LLD (current service selects `UserTicker.display_name` and maps into `TickerResponse`), deliver **verification + regression tests + OpenAPI/schema parity** rather than speculative refactors. |
| **2** | Team 30 | Team 20 response stable (or parallel once schema confirmed) | Implement **§4 UI** of LLD400: split **סמל** vs **שם תצוגה**, muted fallback for empty/null `display_name`, remove edit affordance and **no** `PATCH` from D33, add **`data-testid`** per §4.5, fix **empty-state `colspan`**, sort behavior for display column (recommend: effective string = `display_name?.trim() || symbol`). |
| **3** | Team 50 | Team 30 build available in QA environment; Team 20 API reachable | Execute **LLD400 §5** scenarios **A–F**; record pass/fail, logs, screenshots or DOM/network evidence in Team 50 report; flag canary / CI hook expectations (Scenario F). |

**Blocking rule:** Team 50 **cannot** sign off on UI scenarios C–F until D33 build contains required `data-testid` and column behavior. Team 30 may start layout work against **mock or staging** API once Team 20 confirms `display_name` key in contract.

---

## §6 Per-team acceptance criteria (from LLD400)

### Team 20 — Backend

1. **`GET /api/v1/me/tickers`** (router `me_tickers`, mounted under `settings.api_v1_prefix`): **200** with `TickerListResponse`; each `TickerResponse` has **`display_name`** key present — value **string** (max 100 when non-null per schema) or **`null`**, consistent with DB for the authenticated user’s non-deleted `user_tickers` rows joined to non-deleted tickers.
2. **Errors** unchanged: **401** unauthenticated; **500** / `HTTPExceptionWithCode` per existing SSOT.
3. **No new migrations**; no new response fields beyond ensuring **`display_name`** on list items.
4. **OpenAPI / `TickerResponse`** documents `display_name`; no regression removing it from the list response.
5. **Automated proof:** at least one pytest (or agreed suite) asserts JSON shape for authenticated list (key presence for `display_name`); optional DB fixture with `display_name` set vs `NULL`.

### Team 30 — Frontend (D33)

1. **Two leading columns:** **סמל** shows **`symbol` only**; **שם תצוגה** shows custom `display_name` when non-empty after trim, else **same symbol** as fallback with **muted** styling (`var(--color-text-muted)` or existing Phoenix utility — **prefer reuse**, CSS class priority per project rules).
2. **Contrast:** muted fallback visually distinct from primary symbol column.
3. **No** D33 UI to create/update/clear `display_name`: remove **שנה שם תצוגה** / `js-action-edit` (and handlers) from D33 actions; **no** modal on D33 that PATCHes `display_name`. View modal may show read-only label; no edit implication.
4. **`data-testid`:** `d33-user-tickers-table`, `d33-user-tickers-thead`, `d33-user-tickers-tbody`, per-row `d33-user-ticker-row` + retain `data-ticker-id`, `d33-cell-symbol`, `d33-cell-display-name`, `d33-cell-actions` (if needed for tests).
5. **Empty state:** single empty row **`colspan`** matches **new** column count.
6. **Sorting:** functional; display column sort defined (recommend effective display string).
7. **Fetch:** continues `sharedServices.get('/me/tickers', …)` → **`GET /api/v1/me/tickers`**; canonical field **`display_name`** (camelCase alias tolerated only as legacy).

### Team 50 — QA

1. **Scenario A:** Authenticated `GET /api/v1/me/tickers` returns `display_name: "My Label"` when DB row has that value.
2. **Scenario B:** `display_name: null` key present when DB `NULL`.
3. **Scenario C:** D33 `[data-testid=d33-cell-display-name]` shows custom label (not greyed as primary fallback).
4. **Scenario D:** NULL case — symbol column + display column show symbol; display cell uses muted color token / documented class.
5. **Scenario E:** No edit control for display name on D33; no PATCH-from-D33 path.
6. **Scenario F:** Canary: schema check on first row + presence of `d33-user-tickers-table` and `d33-cell-display-name`.
7. **LLD §6 global AC (1–10):** all mapped and evidenced in `TEAM_50_S003_P013_WP001_QA_REPORT_v1.0.0.md`.

---

## §4 API / contract (reference for implementation & tests)

### FastAPI routes

| Method | Path | Response model | Notes |
|--------|------|----------------|-------|
| `GET` | `/api/v1/me/tickers` | `TickerListResponse` | Auth required; **no** query/body. Stakeholder phrase “GET /user_tickers” = **this** route per LLD. |
| `PATCH` | `/api/v1/me/tickers/{ticker_id}` | `TickerResponse` | **Out of scope for D33**; may exist; **D33 must not call** for `display_name` after WP. |

**Router module:** `api/routers/me_tickers.py` (included from `api/main.py` with `settings.api_v1_prefix`).

### Pydantic models

- **`TickerListResponse`:** `data: List[TickerResponse]`, `total: int` (`len(data)`).
- **`TickerResponse`:** must include **`display_name: Optional[str]`** (`Field`, `max_length=100`) — see `api/schemas/tickers.py`.

### SQL / service intent

- Select `UserTicker` for `current_user.id`, `deleted_at IS NULL`, join `Ticker` (`deleted_at IS NULL`), `outerjoin` exchange as today; order by `Ticker.symbol` asc.
- Map `UserTicker.display_name` into each `TickerResponse.display_name` (existing `_ticker_to_response` + `model_copy(update={"display_name": ...})` pattern in `user_tickers_service.py`).

### Manual verification — curl

Replace `TOKEN` with a valid JWT for a user that has user_tickers rows:

```bash
curl -sS -H "Authorization: Bearer TOKEN" \
  "http://localhost:8082/api/v1/me/tickers" | jq '.data[0] | {id, symbol, display_name}'
```

Expect **`.display_name`** present (string or `null`). **401** without header.

### Automated tests — suggested commands

```bash
# From repo root, venv active — extend with new test module or cases as Team 20 documents
source api/venv/bin/activate
python3 -m pytest tests/unit/ -v --tb=short
# If Team 20 adds targeted tests, e.g.:
# python3 -m pytest tests/unit/test_me_tickers_display_name.py -v
```

**Frontend build smoke (Team 30 post-change):**

```bash
cd ui && npx vite build
```

---

## Handover

**Nimrod:** After this file is saved, run from repo root:

`./pipeline_run.sh --domain tiktrack phase2`

→ Injects Phase 1 plan for Team 90 / GATE_2.2v readiness.

---

**log_entry | TEAM_10 | G3_PLAN_WORK_PLAN | S003-P013-WP001 | 2026-03-22**
