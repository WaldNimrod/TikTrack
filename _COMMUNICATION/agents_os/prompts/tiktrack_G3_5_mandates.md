date: 2026-03-22
historical_record: true

## Team 90 — Work Plan Validator (Phase 2.2v)

**ACTIVE: TEAM_90 (Dev-Validator)**  gate=G3_5 | wp=S003-P013-WP001 | stage=S003 | 2026-03-22

---

# G3.5 — Validate Work Plan  [FIRST RUN]

**WP:** `S003-P013-WP001`

Validate this work plan for implementation readiness.
Check: completeness, team assignments, deliverables, test coverage.

## MANDATORY: route_recommendation

**If FAIL — include at the top of your response:**

```
route_recommendation: doc
```  ← plan has format/governance/wording issues only
```
route_recommendation: full
``` ← plan has structural/scope/logic problems

Classification:
- `doc`: blockers are grammar, missing paths, credential text, format-only
- `full`: scope unclear, wrong team assignments, missing deliverables, logic errors

This field drives automatic pipeline routing. Missing = manual block.

Respond with: PASS or FAIL + blocking findings.

## Work Plan

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

**Blocking rule:** Team 50 **cannot** sign off on UI scenarios C–F until D33 build contains required `data-testid` and column behavior. Team 30 may start layout work against **mock or staging** API once Team 20 confirms `display_name` key