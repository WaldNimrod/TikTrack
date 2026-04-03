# Team 10 — G3 Plan | S003-P004-WP001 — D33 User Tickers (My Tickers)

**Document:** `documentation/docs-system/08-PRODUCT/S003_P004_WP001_D33_OPERATIONS_HANDBOOK_G3_PLAN_v1.0.0.md`  
**Canonical SSOT:** This file under `documentation/docs-system/08-PRODUCT/`.  
**Source narrative:** Team 10 G3_PLAN (2026-03-25); operational stub under `_COMMUNICATION/team_10/TEAM_10_S003_P004_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md` points here. Historical quotes in verdicts may still cite the `_COMMUNICATION` filename.  
**From:** Team 10 (Gateway / Work Plan Author)  
**To:** Team 20 · Team 30 · Team 50 · Team 90 (GATE_2 / 2.2v plan review)  
**status:** EXECUTION_CLOSED (2026-03-26 — WP complete; state synced)  
**process_variant:** TRACK_FULL  
**normative_baseline:** `_COMMUNICATION/team_100/TEAM_100_S003_P004_WP001_LOD200_v1.0.0.md` (LOCKED)  
**spec_ssot:** `_COMMUNICATION/team_170/TEAM_170_S003_P004_WP001_LLD400_v1.0.0.md` (GATE_1 LLD400, AS_MADE)

---

## Identity Header

`gate: G3_PLAN | wp: S003-P004-WP001 | stage: S003 | domain: tiktrack | date: 2026-03-25`

| Field | Value |
|-------|-------|
| roadmap_program | S003-P004 |
| work_package_id | S003-P004-WP001 |
| page / module | D33 — הטיקרים שלי (`user_tickers` / My Tickers) |
| phase_owner | Team 10 |

---

## §2 Files per team (canonical paths)

Each team **publishes** closure / implementation narrative to the path below (operational artifact; not canonical promotion to `documentation/`).

| Team | Role | Canonical artifact path |
|------|------|-------------------------|
| **Team 20** | Backend — extended `GET /api/v1/me/tickers` (filters, sort, pagination envelope), verification of `PATCH` / `POST` / `DELETE` per LLD400; tests | `_COMMUNICATION/team_20/TEAM_20_S003_P004_WP001_IMPLEMENTATION_v1.0.0.md` |
| **Team 30** | Frontend — D33 summary bar, filter bar, sortable table, pagination, modals, Iron Rule primary label, `data-testid` anchors | `_COMMUNICATION/team_30/TEAM_30_S003_P004_WP001_IMPLEMENTATION_v1.0.0.md` |
| **Team 50** | QA — MCP-01…MCP-09 + acceptance criteria evidence, regression hooks | `_COMMUNICATION/team_50/TEAM_50_S003_P004_WP001_QA_REPORT_v1.0.0.md` |

**Primary code touchpoints (informative — teams confirm in their §2 artifacts):**

- **Team 20:** `api/routers/me_tickers.py`, `api/services/user_tickers_service.py`, `api/schemas/tickers.py` (`TickerResponse`, **`TickerListResponse`** extended with `page`, `page_size` per LLD §2.2); models `api/models/user_tickers.py`, `api/models/tickers.py`; pytest (unit/integration as appropriate) under `tests/`.
- **Team 30:** `ui/src/views/management/userTicker/user_tickers.html`, `user_tickers.content.html`, `userTickerTableInit.js`, add/edit modals (`userTickerAddForm.js`, display-name modal), `sharedServices` usage for `GET /me/tickers` with query params.
- **Team 50:** E2E / MCP / documented manual steps per LLD400 §5; evidence in QA report.

---

## §3 Execution order (dependencies)

| Phase | Owner | Dependency | Work summary |
|-------|--------|------------|--------------|
| **1** | Team 20 | None | Implement **LLD400 §2** + **§3**: extended list `GET /api/v1/me/tickers` with query params (`ticker_type` multi, `status`, `sector_id`, `market_cap_group_id`, `sort_by`, `sort_dir`, `page`, `page_size`); response envelope `data`, `total`, `page`, `page_size`; **nulls:** ASC → nulls last, DESC → nulls first for nullable sort keys; **`total` = count before pagination**. Wire sort expressions per §3.4 (COALESCE / display ordering aligned with UI). **Verify** `PATCH` / `POST` / `DELETE` match LLD400 (PATCH body `display_name` max 100, `null` clear; POST query-param contract unchanged). **No new DDL.** Use **`maskedLog`** for user-identifying logs (**D33-IR-05**). |
| **2** | Team 30 | Team 20 OpenAPI/behavior stable for list + PATCH (or parallel UI shell against staging once contract frozen) | Complete **LLD400 §4** UI: `tt-container` → `tt-section` → `tt-section-row`; summary bar; filter bar wired to query params; table columns + header sort → `sort_by` / `sort_dir`; pagination 10/25/50 (max 50); primary label = `display_name` else `company_name` (**never** raw `symbol` as primary — **D33-IR-01**); price + **`price_source`** badge (**D33-IR-07**); add + edit display name + remove; empty and error states (**D33-IR-06**); **`data-testid`** per §4.5. |
| **3** | Team 50 | Integrated build in QA environment | Execute **LLD400 §5** (MCP-01…MCP-09), **§6** global AC, and **§7** HRC checklist as applicable; record pass/fail and evidence in Team 50 report. |

**Blocking rule:** Team 50 cannot close UI-heavy scenarios until Team 30 exposes required `data-testid` and Team 20 list endpoint returns the paginated envelope and filters. Team 30 may scaffold layout early; integration tests depend on Team 20.

---

## §6 Per-team acceptance criteria (from LLD400 + LOD200)

### Team 20 — Backend

1. **`GET /api/v1/me/tickers`:** **200** with JSON envelope: `data: TickerResponse[]`, `total` (int, pre-filter count), `page`, `page_size`; defaults `page=1`, `page_size=25`, `sort_by=display_name`, `sort_dir=asc`; **`page_size` hard cap 50**; **422** on invalid `sort_by`, `page < 1`, `page_size > 50`, invalid ULID filters.
2. **Query params:** Repeatable `ticker_type` (OR within tickers); `status` filters `user_data.user_tickers.status` (`active` \| `inactive`); `sector_id`, `market_cap_group_id` as ULID filters on joined tickers; AND semantics across filters.
3. **`sort_by`:** Allowed set per LLD400 §2.2 (`display_name`, `company_name`, `current_price`, `daily_change_pct`, `ticker_type`, `currency`, `exchange_code`, `status`, `price_source`); server-side expressions tied to joined row per §3.4.
4. **Backward compatibility:** No query params → first page, default size/sort, no extra filters, with **pagination envelope** (response shape change vs legacy flat list is normative for this WP).
5. **`PATCH /api/v1/me/tickers/{ticker_id}`:** **200** + full **`TickerResponse`**; body `{ "display_name": string \| null }`, max length 100; **404** when row not in user list.
6. **`POST` / `DELETE`:** Per LLD400 §2.3 / §2.5; soft-delete on user_tickers for DELETE.
7. **Precision / logging:** Money fields **`Decimal(20,8)`**-compatible in responses; logging via **`maskedLog`** (**D33-IR-05**).
8. **Tests:** Pytest (or agreed suite) covering envelope, cap 50, at least one filter + sort + pagination path; PATCH happy path optional but recommended.

### Team 30 — Frontend (D33)

1. **Layout:** **`tt-container` / `tt-section` / `tt-section-row`** (**D33-IR-02**).
2. **Primary label:** `display_name` (trimmed) else `company_name`; if both unusable → neutral placeholder (e.g. `—`); **raw `symbol` not the primary visible label** (**D33-IR-01**).
3. **Filters:** Wired to `GET` query params; changing filters resets to **page 1** and refetches.
4. **Table:** Columns per LLD400 §4.4; **every sortable data column** has header sort (**D33-IR-04**); price column shows **`current_price`**, **`daily_change_pct`**, **`price_source`** (**D33-IR-07**).
5. **Pagination:** Selector **10 / 25 / 50**; never request **> 50** rows (**D33-IR-03**).
6. **Modals:** Add ticker (POST contract unchanged); edit display name (PATCH); remove (DELETE **204**).
7. **Empty / error:** Empty state copy + `d33-user-tickers-empty`; API failure with user-visible error + retry (**D33-IR-06**).
8. **`data-testid`:** Minimum set per LLD400 §4.5 (`d33-user-tickers-table`, `d33-user-tickers-filters`, `d33-user-tickers-pagination`, row + actions, etc.).
9. **Build:** `cd ui && npx vite build` passes after changes.

### Team 50 — QA

1. **MCP-01…MCP-09** (LLD400 §5): each precondition → action → assertion documented with evidence (logs, network, DOM).
2. **§6 acceptance criteria (1–12):** Mapped in `TEAM_50_S003_P004_WP001_QA_REPORT_v1.0.0.md` with pass/fail.
3. **Iron Rules D33-IR-01…07:** Checked in UI/API as applicable; visual / network proof for D33-IR-01, D33-IR-04, D33-IR-07 at GATE_4 readiness.
4. **Regression:** Note any E2E file paths (`tests/user-tickers-qa.e2e.test.js` or successor) and stability of hooks.

---

## §4 API / contract (reference for implementation & tests)

### FastAPI routes

| Method | Path | Response model | Notes |
|--------|------|----------------|-------|
| `GET` | `/api/v1/me/tickers` | Extended list envelope (see below) | Auth required. Legacy phrase “GET /user_tickers” = **this** route. |
| `POST` | `/api/v1/me/tickers` | `TickerResponse` | **201**; query-param contract per existing router unless separate GIN. |
| `PATCH` | `/api/v1/me/tickers/{ticker_id}` | `TickerResponse` | **200**; `display_name` only in body. |
| `DELETE` | `/api/v1/me/tickers/{ticker_id}` | — | **204**; soft-delete. |

**Router module:** `api/routers/me_tickers.py` (mounted under `settings.api_v1_prefix`).

### List response envelope (normative)

```json
{
  "data": [ /* TickerResponse, page slice only */ ],
  "total": 0,
  "page": 1,
  "page_size": 25
}
```

**`TickerResponse`:** Field set per `api/schemas/tickers.py` — **no new field names** for this WP; **`symbol` remains in JSON** but D33 UI must not use it as the human primary label (LLD400 §2.2, §4).

### Query parameters (summary)

| Parameter | Notes |
|-----------|-------|
| `ticker_type` | Repeatable; OR on `market_data.tickers.ticker_type`; values ∈ `TICKER_TYPES` SSOT |
| `status` | `active` \| `inactive` → `user_data.user_tickers.status` |
| `sector_id` | ULID → `tickers.sector_id` |
| `market_cap_group_id` | ULID → `market_cap_group_id` |
| `sort_by` / `sort_dir` | See LLD400 §2.2 |
| `page` / `page_size` | Defaults 1 / 25; **max page_size 50** |

### Pydantic / OpenAPI

- Extend **`TickerListResponse`** (or equivalent) so OpenAPI documents **`page`** and **`page_size`** alongside **`data`** and **`total`**.
- **`TickerResponse`** unchanged for this WP.

### Manual verification — example

```bash
# List first page (replace TOKEN)
curl -sS -H "Authorization: Bearer TOKEN" \
  "http://localhost:8082/api/v1/me/tickers?page=1&page_size=25&sort_by=display_name&sort_dir=asc" \
  | jq '{ total, page, page_size, first: .data[0] | {id, display_name, company_name, symbol} }'
```

### Automated tests — suggested commands

```bash
source api/venv/bin/activate
python3 -m pytest tests/unit/ -v --tb=short
# Plus targeted tests added by Team 20 for me/tickers list envelope and filters
```

**Frontend build smoke (Team 30):**

```bash
cd ui && npx vite build
```

---

## Handover

**Operator (Nimrod):** After this file is saved:

1. `./pipeline_run.sh --domain tiktrack phase2` — stores work plan for GATE_2 Phase 2.2.
2. `./pipeline_run.sh --domain tiktrack pass` — when ready, advances toward **2.2v** (Team 90 work-plan validation).

Team 10 does **not** run pipeline CLI.

---

**log_entry | TEAM_10 | G3_PLAN_WORK_PLAN | S003-P004-WP001 | 2026-03-25**  
**log_entry | TEAM_70 | CANONICAL_COPY | S003-P004-WP001 | 2026-03-26**
