---
**project_domain:** AGENTS_OS  
**id:** TEAM_51_AOS_V3_PIPELINE_INTEGRITY_QA_REPORT_v1.0.0  
date: 2026-04-02
historical_record: true
**from:** Team 51 (AOS QA)  
**to:** Team 100 (Chief System Architect)  
**cc:** Team 61, Team 11, Team 00  
**date:** 2026-03-27  
**status:** COMPLETE — evidence captured; remediation routed to Team 21/31 per mandate  
**repo_head:** `1dce8b59691139d41a6b9be759beba0793da5170`  
**environment:** Live v3 API `http://127.0.0.1:8090`, UI canonical path `http://127.0.0.1:8090/v3/` (see WARN-003). Manual API calls used `X-Actor-Team-Id: team_00` unless noted. **No** `AOS_V3_E2E_UI_MOCK` for this session.  ---

# Team 51 — AOS v3 Pipeline Integrity QA Report

## SUMMARY

| Metric | Count |
|--------|------:|
| Total checks (documented test points across A–E) | 52 |
| PASS | 28 |
| FAIL | 4 |
| WARN | 9 |
| BLOCKER (must fix before flight) | 2 |

**Pre-state (DB + API):** `GET /api/health` → OK. `AOS_V3_DATABASE_URL` from `agents_os_v3/.env` reachable. Active TikTrack run present: `run_id=01KMX6Q8FJRMKHC6RMWKZBPDWS`, `work_package_id=S003-P005`, `status=IN_PROGRESS`, `current_gate_id=GATE_0`, `current_phase_id=0.1`. WP `S001-P002` → `COMPLETE`; `S003-P005` → `ACTIVE` with matching `linked_run_id`.

---

## SUITE A — Domain Resolution Results

### A-1. API endpoint × slug vs ULID

| Endpoint | Slug test | ULID test | Match? | Evidence (abbrev.) |
|----------|-----------|-----------|--------|---------------------|
| `GET /api/state?domain_id=` | `tiktrack` | `01JK8AOSV3DOMAIN00000002` | **PASS** | Both: `IN_PROGRESS`, same `run_id`, `S003-P005` |
| `GET /api/state?domain_id=` | `agents_os` | `01JK8AOSV3DOMAIN00000001` | **PASS** | Both: `IDLE`, no `run_id` |
| `GET /api/runs?status=IN_PROGRESS,CORRECTION,PAUSED&domain_id=` | `tiktrack` | `01JK8AOSV3DOMAIN00000002` | **FAIL** | Slug: `total 0`; ULID: `total 1`, run `01KMX6Q8FJRMKHC6RMWKZBPDWS` |
| `GET /api/history?domain_id=&limit=3` | `tiktrack` | `01JK8AOSV3DOMAIN00000002` | **FAIL** | Slug: `total 0`; ULID: `total 1`, events returned |
| `GET /api/history?domain_id=&limit=5` | `agents_os` | `01JK8AOSV3DOMAIN00000001` | **FAIL** | Slug: `total 0`; ULID: `total 2` |
| `GET /api/work-packages?domain_id=` | `tiktrack` vs ULID | **N/A** | **WARN** | Query param **ignored** by server; always returns full list (27 rows). Mandate table implied filter — contract gap. |

**POST `/api/runs` (body `domain_id`):** Not executed with duplicate initiation (would mutate flight). **Code path:** `machine.initiate_run` → `R.fetch_domain` → `resolve_domain_id` — slug expected to work (**PASS by inspection**).

### A-2. UI domain filter — Network (real browser)

| Page | URL tested | API observed | Slug vs ULID sent |
|------|------------|--------------|-------------------|
| Pipeline | `/v3/` | `GET /api/state?domain_id=agents_os` then `...=tiktrack` | **Slug** (`agents_os` / `tiktrack`) |
| Pipeline | `/v3/` | `GET /api/events/stream?domain_id=...` (+ `run_id` when active) | Slug |
| Pipeline | `/v3/` | `GET /api/history?run_id=<ulid>&limit=...` when run active | **run_id** (not `domain_id` filter) — avoids history slug bug for this view |
| Portfolio | `/v3/portfolio.html` | `GET /api/runs?status=...` **no** `domain_id`; `GET /api/work-packages`; `GET /api/ideas?limit=200` | Domain filter is **client-side** after full fetch |

### A-3. Cross-page consistency (S003-P005 active, TikTrack)

| Step | Expected | Actual | Result |
|------|----------|--------|--------|
| Pipeline TikTrack | IN_PROGRESS + run | `GET /api/state?domain_id=tiktrack` matches; browser Network showed same call | **PASS** |
| Portfolio Active / All | Shows run | API `GET /api/runs?status=IN_PROGRESS,...` returns 1 row (full list); UI filters client-side | **PASS** (with WARN: slug `domain_id` on GET `/api/runs` broken if used) |
| History | Events for run | Pipeline uses `history?run_id=` — events load | **PASS** for Pipeline path |
| History page with `domain_id=tiktrack` slug | Events | `GET /api/history?domain_id=tiktrack` → **0 events** (FAIL vs ULID) | **FAIL** (API) |

### A-4. Code scan — `domain_id` SQL without prior resolver

| File | Line(s) | Finding |
|------|---------|---------|
| `agents_os_v3/modules/management/portfolio.py` | 183–185 | `list_runs_paginated`: appends raw `domain_id` to `r.domain_id = %s` — **no** `resolve_domain_id` → **BLOCKER** (matches A-1 FAIL). |
| `agents_os_v3/modules/management/use_cases.py` | 515–517 | `uc_14_get_history`: `e.domain_id = %s` with raw query param — **no** resolver → **BLOCKER**. |
| `agents_os_v3/modules/management/use_cases.py` | 439–448 | `uc_13_get_current_state`: uses `R.resolve_domain_id` before `WHERE domain_id` — **OK**. |
| `agents_os_v3/modules/state/repository.py` | 50–53, etc. | `in_progress_run_for_domain` resolves first — **OK**. |
| `agents_os_v3/modules/management/use_cases.py` | 239–242 | Uses `row["domain_id"]` from DB row (ULID) — **OK**. |
| `agents_os_v3/modules/policy/settings.py` | 67 | Policy column update — context-specific (not assessed as slug input). |
| `agents_os_v3/modules/routing/resolver.py` | 37 | Routing rule lookup — internal ULID usage. |
| `agents_os_v3/modules/prompting/templates.py` | 20 | Template filter — parameterized. |

---

## SUITE B — Pipeline Page Results (browser + API)

**Browser:** `http://127.0.0.1:8090/v3/` (scripts 200). **Note:** UI default actor in browser was `team_61`; API parity check for `agents_os` IDLE used both `team_00` and `team_61` — same result.

### B-1. Active run metadata (TikTrack, S003-P005)

| Check | Result | Notes |
|-------|--------|-------|
| Network: state call | **PASS** | `GET /api/state?domain_id=tiktrack` → 200, `IN_PROGRESS`, `run_id` present |
| run_id / wp / gate | **PASS** | API: `S003-P005`, `GATE_0`, phase `0.1` |
| Run log / INITIATE | **WARN** | Log populated via `history?run_id=`; full field-by-field DOM audit limited by a11y snapshot granularity |

### B-2. IDLE (Agents OS)

| Check | Result | Notes |
|-------|--------|-------|
| API | **PASS** | `GET /api/state?domain_id=agents_os` → `IDLE` |
| UI after switch | **WARN** | After domain switch, accessibility tree still exposed handoff copy consistent with “active run” narrative in one capture; **Network** showed `GET /api/state?domain_id=agents_os` 200. Flag **WARN-008**: verify DOM clears handoff/prompt panels on IDLE to avoid operator confusion. |

### B-3. Domain switch H→T→H

| Check | Result | Notes |
|-------|--------|-------|
| TikTrack → Agents OS → TikTrack | **PASS** | Network showed state refetch for `agents_os` then `tiktrack`; SSE URL included `run_id` + `domain_id=tiktrack` when active |

**Screenshots / DOM:** Browser tool captured Pipeline and Portfolio views at `8090/v3/*` (see session artifacts in IDE browser). Root URL `http://127.0.0.1:8090/` without `/v3/` produced **404** for `app.js` / `api-client.js` (see WARN-003).

---

## SUITE C — Portfolio Page Results

**Entry:** `http://127.0.0.1:8090/v3/portfolio.html`  
**Network (initial load):**  
- `GET /api/runs?status=IN_PROGRESS,CORRECTION,PAUSED&limit=100&offset=0`  
- `GET /api/runs?status=COMPLETE&limit=100&offset=0`  
- `GET /api/work-packages`  
- `GET /api/ideas?limit=200&offset=0`  

### C-1. Active Runs

| Check | Result | Notes |
|-------|--------|-------|
| Active run visible (All) | **PASS** | API returns 1 active run; client filter |
| Filter `tiktrack` / `agents_os` | **WARN** | Relies on client filter + full list; **direct** API `domain_id=tiktrack` on `/api/runs` is broken (Suite A) |

### C-2. Work Packages

| Check | Result | Notes |
|-------|--------|-------|
| S001-P002 COMPLETE | **PASS** | API row `status: COMPLETE` |
| S003-P005 ACTIVE + link | **PASS** | Matches live run |
| Pytest artifact ACTIVE WP | **PASS** | No unexpected ACTIVE WP beyond linked S003-P005 (orphan SQL = 0) |

### C-3. Start Run flow

| Check | Result | Notes |
|-------|--------|-------|
| Full C-3 sequence | **NOT RUN** | TikTrack domain has **active** S003-P005 run; initiating another run would violate flight safety. **Code:** `startRunForWp` uses `POST /api/runs` with ULID `domain_id` from WP payload; errors use toast (prior review). |

### C-4. Completed Runs

| Check | Result | Notes |
|-------|--------|-------|
| API shape | **PASS** | `GET /api/runs?status=COMPLETE` returns rows with labels/slugs |

### C-5. Ideas

| Check | Result | Notes |
|-------|--------|-------|
| Total 20 | **PASS** | `GET /api/ideas?limit=200` → `total: 20` |
| 13 TikTrack NEW / 7 AOS DEFERRED | **PASS** | Counts match |
| `[V2_LEGACY]` in decision_notes | **PASS** | 7 AOS rows contain `[V2_LEGACY]` in notes |

---

## SUITE D — Cross-Interface Matrix

**Timestamp (D-1):** 2026-03-27 (live session, same day as report)

### D-1. Run state — S003-P005 IN_PROGRESS @ GATE_0

| Interface | Expected | Actual | PASS/FAIL |
|-----------|----------|--------|-----------|
| `GET /api/state?domain_id=tiktrack` | IN_PROGRESS, S003-P005 | Matches | **PASS** |
| `GET /api/state?domain_id=01JK8AOSV3DOMAIN00000002` | Same | Matches | **PASS** |
| `GET /api/runs?status=IN_PROGRESS,CORRECTION,PAUSED&domain_id=tiktrack` | 1 TikTrack run | `total 0` | **FAIL** |
| `GET /api/runs?status=IN_PROGRESS,CORRECTION,PAUSED` (no filter) | ≥1 run | `total 1` | **PASS** |
| Pipeline (TikTrack) | Shows active run | Network + API aligned | **PASS** |
| Portfolio Active Runs | 1 row | API supports after client filter | **PASS** |
| Portfolio WP tab S003-P005 | ACTIVE | API | **PASS** |
| History with `domain_id=tiktrack` | Events | `total 0` | **FAIL** |
| History with ULID / or `run_id` | Events | Data present | **PASS** |

### D-2. After run completes

**Not executed:** Intentionally not stopped/completed during this QA to avoid disrupting the in-flight S003-P005 run. **Reason:** Mandate allows documented deferral (AC-6); repeat when run is cleared in a controlled window.

### D-3. Domain filter arithmetic (All = TikTrack + Agents OS)

Data from API (server-side lists; “All” = unfiltered row counts).

| Surface | All | TikTrack | Agents OS | TT+AOS | Match? |
|---------|-----|----------|-----------|--------|--------|
| Active runs | 1 | 1 | 0 | 1 | **PASS** |
| Ideas | 20 | 13 | 7 | 20 | **PASS** |
| Work packages | 27 | 22 | 4 | 26 | **WARN** | One WP row does not classify as tiktrack/agents_os in slug join (data/setup); arithmetic off by 1 |
| Completed runs | 2 | 0 | 1 | 1 | **WARN** | One completed run has `domain_slug=pytest_norr` — excluded from TT+AOS sum |

---

## SUITE E — Pattern Hunt

### E-1. FK / slug risk (representative scan)

Primary hits documented in A-4. Additional `WHERE ... domain_id` usages are either post-`resolve_domain_id` or internal ULIDs from DB rows.

### E-2. Invalid parameters

| Call | HTTP | Result |
|------|------|--------|
| `GET /api/state?domain_id=INVALID_XXX` | 200 | `IDLE`-shaped body (no 4xx) |
| `GET /api/runs?domain_id=INVALID_XXX` | 200 | Empty list |
| `GET /api/history?domain_id=INVALID_XXX` | 200 | Empty list |

**Assessment:** No 500s observed; **WARN-002**: unknown domain behaves like “empty/IDLE” rather than structured `DOMAIN_NOT_FOUND`.

### E-3. Orphan ACTIVE WP SQL

```sql
SELECT w.id, w.label, w.status, w.linked_run_id
FROM work_packages w
WHERE w.status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1 FROM runs r
    WHERE r.work_package_id = w.id
      AND r.status IN ('IN_PROGRESS', 'CORRECTION', 'PAUSED')
  );
```

**Result:** **0 rows** (executed via Python + `psycopg2` against `AOS_V3_DATABASE_URL`).

### E-4. Silent failures (UI actions)

| Area | Finding |
|------|---------|
| `postJson` / live actions | Majority of wired handlers attach `.then` + `.catch` with `showAosv3Toast` (spot-checked Advance/Stop paths in `app.js`). |
| `loadPipelineStateFromApi` | `.catch` shows toast when `showErr` true. |
| **Residual risk** | **WARN-009:** Not every `AOSV3_apiJson` call site audited line-by-line; recommend Team 31 grep for missing `.catch` on mutations. |

---

## BLOCKERS (must fix before flight)

| ID | File:line | Description | Proposed fix |
|----|-----------|-------------|--------------|
| **BLK-001** | `agents_os_v3/modules/management/portfolio.py` ~183–185 | `list_runs_paginated` filters `r.domain_id` with raw query string; slug `tiktrack` returns **zero** rows while ULID works. | Before building WHERE, `domain_ulid = R.resolve_domain_id(cur, domain_id)` (or equivalent), then compare to `r.domain_id`. Handle unknown slug per product rules (400 vs empty). |
| **BLK-002** | `agents_os_v3/modules/management/use_cases.py` ~515–517 | `uc_14_get_history` appends raw `domain_id` to `e.domain_id = %s`; slug returns **no** events. | Resolve slug → ULID via `R.resolve_domain_id` when `domain_id` provided; use ULID in SQL. |

---

## WARNINGS (should fix soon)

| ID | Description / risk |
|----|---------------------|
| WARN-001 | `GET /api/work-packages` ignores `domain_id` query — clients may assume filtering. |
| WARN-002 | Invalid `domain_id` on state/runs/history returns 200 + empty/IDLE — weak contract for integrators. |
| WARN-003 | `GET /` serves raw `index.html` with `<base href="./">` → static assets 404 unless user uses `/v3/`. Document canonical URL or adjust root response. |
| WARN-004 | Completed-run seed/data: `domain_slug=pytest_norr` breaks simple TT+AOS sum checks. |
| WARN-005 | WP slug sum vs total off by 1 — verify domain join coverage for all WPs. |
| WARN-006 | Portfolio depends on client-side domain filtering; any consumer of `/api/runs` with slug `domain_id` will see wrong counts. |
| WARN-007 | C-3 Start Run E2E not re-run while TikTrack run active (documented). |
| WARN-008 | Pipeline domain switch: confirm handoff/prompt DOM fully resets on IDLE to avoid stale narrative. |
| WARN-009 | Exhaustive UI mutation `.catch` audit not completed. |

---

## RECOMMENDED FIX ORDER

1. **BLK-001** — `list_runs_paginated` domain resolution (unblocks API clients, clarifies Portfolio server-side behavior if later added).  
2. **BLK-002** — `uc_14_get_history` domain resolution (aligns History page with slug selector).  
3. **WARN-002** — Structured error or explicit `UNKNOWN_DOMAIN` for invalid `domain_id` on read APIs.  
4. **WARN-003** — Root URL vs `/v3/` documentation or HTML fix.  
5. Data hygiene — WARN-004 / WARN-005 (completed runs + WP domain labels).  
6. **WARN-008** — UI state reset audit (`app.js` render paths for IDLE).  
7. **WARN-009** — Systematic grep for unhandled promise rejections on mutations.

---

## ACCEPTANCE CRITERIA (mandate)

| # | Criterion | Status |
|---|-----------|--------|
| AC-1 | All 5 suites executed and documented | **DONE** |
| AC-2 | Domain resolution tested slug + ULID on every endpoint that accepts `domain_id` | **DONE** (incl. FAIL on `/api/runs`, `/api/history`; WP param N/A) |
| AC-3 | Cross-interface matrix populated | **PARTIAL** — D-2 deferred with reason (active run preserved) |
| AC-4 | Pattern hunt — similar bugs enumerated | **DONE** (A-4 + E) |
| AC-5 | BLOCKER list with file + line + proposed fix | **DONE** |
| AC-6 | No “couldn’t check” without reason | **DONE** (C-3, D-2 explicitly scoped) |

---

**log_entry | TEAM_51 | AOS_V3_PIPELINE_INTEGRITY_QA | REPORT_DELIVERED | 2026-03-27**
