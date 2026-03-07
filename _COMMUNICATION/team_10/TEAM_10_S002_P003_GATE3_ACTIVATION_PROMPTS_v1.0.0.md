# Team 10 | S002-P003 — GATE_3 Activation Prompts (TikTrack)

**project_domain:** TIKTRACK  
**id:** TEAM_10_S002_P003_GATE3_ACTIVATION_PROMPTS_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 20, Team 30 (WP001), Team 50 (WP002)  
**cc:** Team 190, Team 00, Team 170, Team 90  
**date:** 2026-02-27  
**status:** ACTIVE  
**gate_id:** GATE_3  
**program_id:** S002-P003  

---

## 0) Team roles and layer ownership (SSOT)

**Canonical source:** `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`

| Squad | Role | Responsibility | S002-P003 layer |
|-------|------|-----------------|------------------|
| **Team 20** | Backend Implementation | Server-side: API, logic, DB, services. | D22: API contract (tickers filter params). LLD400 §3: api/routers/tickers.py EXISTS — Team 20 confirms contract before UI work. |
| **Team 30** | Frontend Execution | Client-side: components, pages, API integration. | WP001: D22 filter bar and loadTickersData params only. **No backend changes.** |
| **Team 50** | QA / FAV | Scripts, E2E, FAV sign-off. | WP002: D22/D34/D35 FAV scripts and E2E only. **No backend or frontend implementation.** |

**Rule:** Each team performs **only** tasks in its layer. Cross-layer dependencies require **coordination messages** (see §3.1).

---

## 1) When to Use

These prompts are **issued at GATE_3 intake** per TEAM_190_TO_TEAM_10_S002_P003_GATE3_INTAKE_HANDOFF. Execution order respects **layer order**: backend contract confirmation → frontend → QA. No UI work without confirmed server contract.

---

## 2) Mandatory Context (before execution)

| Document | Role |
|----------|------|
| documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md | Team roles and scope-by-domain rule |
| _COMMUNICATION/team_10/TEAM_10_S002_P003_WP001_WORK_PACKAGE_DEFINITION.md | WP001 scope, deliverables, exit criteria |
| _COMMUNICATION/team_10/TEAM_10_S002_P003_WP002_WORK_PACKAGE_DEFINITION.md | WP002 scope, dependency order, D34/D35 vs D22 |
| _COMMUNICATION/team_170/TIKTRACK_ALIGNMENT_S002_P003_LLD400_v1.0.0.md | LLD400 §2.4–§2.6, §3 repo reality |
| _COMMUNICATION/_Architects_Decisions/ARCHITECT_GATE2_S002_P003_DECISION.md | GATE_2 APPROVED — execution authorized |

---

## 3) Execution Order (GATE_3) — by layer

1. **Team 20 (Backend):** Publish **API contract confirmation** for D22 tickers: query params `ticker_type`, `is_active` (and optional `search`) per existing `api/routers/tickers.py`. Document: `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_30_S002_P003_D22_API_CONTRACT_CONFIRMATION.md`. **Required before Team 30 implements UI.**
2. **Team 30 (Frontend):** After Team 20 contract confirmation exists, execute WP001 (D22 Filter UI) — filter bar, pass params to existing API; completion report to Team 10. **If API does not match contract:** issue `TEAM_30_TO_TEAM_20_S002_P003_D22_BACKEND_CONTRACT_REQUEST` and do not implement until resolved.
3. **Team 50 (QA):** D34 and D35 FAV **immediate** (no dependency on D22 UI). D22 FAV (scripts + E2E) **only after** Team 30 WP001 completion. **If API or UI gaps block tests:** issue coordination to Team 20 or Team 30 (e.g. `TEAM_50_TO_TEAM_20_S002_P003_API_CONTRACT_REQUEST` or `TEAM_50_TO_TEAM_30_S002_P003_UI_CONTRACT_REQUEST`).
4. Team 10: on WP completion, gate advancement and GATE_4 handoff per runbook.

### 3.1) Coordination messages (required)

| When | Who | Document / action |
|------|-----|-------------------|
| Before UI work | Team 20 → Team 30 | TEAM_20_TO_TEAM_30_S002_P003_D22_API_CONTRACT_CONFIRMATION.md |
| If API mismatch found | Team 30 → Team 20 | TEAM_30_TO_TEAM_20_S002_P003_D22_BACKEND_CONTRACT_REQUEST |
| If API blocks FAV | Team 50 → Team 20 | TEAM_50_TO_TEAM_20_S002_P003_API_CONTRACT_REQUEST (or similar) |
| If UI blocks E2E | Team 50 → Team 30 | TEAM_50_TO_TEAM_30_S002_P003_UI_CONTRACT_REQUEST (or similar) |

---

## 4) Prompts for Handoff

### 4.0 Team 20 — D22 API contract confirmation (prerequisite for WP001 UI)

```markdown
**id:** TEAM_10_TO_TEAM_20_S002_P003_D22_API_CONTRACT_CONFIRMATION_REQUEST
**from:** Team 10 (Execution Orchestrator)
**to:** Team 20 (Backend Implementation)
**scope:** S002-P003 — D22 tickers API (backend layer only)
**gate_id:** GATE_3
**phase_owner:** Team 10
**project_domain:** TIKTRACK
**date:** 2026-02-27
**trigger:** GATE_3 intake; UI (Team 30) must not implement filter without confirmed server contract.

---

You are operating as Team 20 (Backend). Team 10 requests a **contract confirmation** for the D22 tickers list API — no implementation work unless the API does not yet match LLD400.

**Your responsibility (layer):** Server-side only. Per TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0 you own API, logic, DB, services.

**Task:**
1. Confirm that `api/routers/tickers.py` (or equivalent) exposes **GET /tickers** with query params: `ticker_type` (optional), `is_active` (optional), `search` (optional), and pagination as per LLD400 §3 ("Full CRUD, filter params supported").
2. If confirmed: Publish _COMMUNICATION/team_20/TEAM_20_TO_TEAM_30_S002_P003_D22_API_CONTRACT_CONFIRMATION.md with: endpoint, query params, types, and one-line "READY for frontend filter UI integration."
3. If not confirmed (params missing or behavior differs): Implement the minimal backend change to satisfy the contract, then publish the same confirmation document.

**Coordination:** Team 30 will not implement the filter UI until this confirmation exists. Team 10 will not issue Team 30 WP001 execution until this step is done.
```
---

### 4.1 Team 30 — S002-P003-WP001 (D22 Filter UI completion — frontend layer only)

```markdown
**id:** TEAM_10_TO_TEAM_30_S002_P003_WP001_ACTIVATION_PROMPT
**from:** Team 10 (Execution Orchestrator)
**to:** Team 30 (Frontend)
**work_package_id:** S002-P003-WP001
**gate_id:** GATE_3
**phase_owner:** Team 10
**project_domain:** TIKTRACK
**date:** 2026-02-27
**trigger:** GATE_3 intake; WP001 mandate. **Start only after** Team 20 has published TEAM_20_TO_TEAM_30_S002_P003_D22_API_CONTRACT_CONFIRMATION.

---

You are operating as Team 30 (Frontend). Per TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0 your responsibility is **client-side only**: components, pages, API integration. You do **not** implement backend.

**Prerequisite:** Team 20 must have published _COMMUNICATION/team_20/TEAM_20_TO_TEAM_30_S002_P003_D22_API_CONTRACT_CONFIRMATION.md. If it does not exist, do not implement; request Team 10 to unblock.

**Mandatory context:**
- _COMMUNICATION/team_10/TEAM_10_S002_P003_WP001_WORK_PACKAGE_DEFINITION.md
- _COMMUNICATION/team_170/TIKTRACK_ALIGNMENT_S002_P003_LLD400_v1.0.0.md (§2.4, §2.5, §2.6)
- Team 20 API contract confirmation (see above)

**Tasks — implement (frontend layer only):**
1. **Filter bar (per LLD400 §2.5):** Use the **confirmed** API params (ticker_type, is_active) from Team 20.
   - `ui/src/views/management/tickers/tickersTableInit.js` — pass filter params to existing backend; preserve state across pagination.
   - `ui/src/views/management/tickers/tickers.content.html` — filter bar HTML (ticker_type, is_active toggles).

2. **Exit criteria (LLD400 §2.6):** Filter bar present; loadTickersData passes params; filter toggles refresh table; state preserved across pagination; SOP-013 Seal.

3. **Scope guardrails:** No D23 or S003. No backend changes. Follow D34 alertsTableInit pattern (R-01).

4. **Coordination:** If the live API does not match Team 20's contract, **do not** implement workarounds. Publish _COMMUNICATION/team_30/TEAM_30_TO_TEAM_20_S002_P003_D22_BACKEND_CONTRACT_REQUEST.md and wait for resolution.

5. **Completion:** Notify Team 10; publish completion report under _COMMUNICATION/team_30/. Team 50 may then start D22 FAV (API + E2E scripts).
```

---

### 4.2 Team 50 — S002-P003-WP002 (D34/D35 FAV — QA layer only; D22 after WP001)

```markdown
**id:** TEAM_10_TO_TEAM_50_S002_P003_WP002_ACTIVATION_PROMPT
**from:** Team 10 (Execution Orchestrator)
**to:** Team 50 (QA / FAV)
**work_package_id:** S002-P003-WP002
**gate_id:** GATE_3
**phase_owner:** Team 10
**project_domain:** TIKTRACK
**date:** 2026-02-27
**trigger:** GATE_3 intake; WP002 mandate. Your responsibility is **QA/FAV layer only** — scripts and E2E; you do **not** implement backend or frontend.

---

You are operating as Team 50 (QA / FAV). Per TEAM_DEVELOPMENT_ROLE_MAPPING and gate model: you own **scripts, E2E, FAV sign-off**. You do **not** implement API or UI; if API or UI gaps block tests, you **must** issue a coordination message to Team 20 or Team 30 and document it.

**Mandatory context:**
- _COMMUNICATION/team_10/TEAM_10_S002_P003_WP002_WORK_PACKAGE_DEFINITION.md
- _COMMUNICATION/team_170/TIKTRACK_ALIGNMENT_S002_P003_LLD400_v1.0.0.md (§2.4–§2.6, §3 repo reality)

**Dependency order:**
- **Now (parallel to WP001):** D34 and D35 FAV — scripts and E2E per LLD400 §2.5.
- **After WP001 D22 completion by Team 30:** D22 — run-tickers-d22-qa-api.sh, tickers-d22-e2e.test.js.

**Tasks — execute in order (QA layer only):**
1. **D34 (Alerts) — immediate:** scripts/run-alerts-d34-fav-api.sh, tests/alerts-d34-fav-e2e.test.js; scripts/run-cats-precision.sh. Standards: ARCHITECT_DIRECTIVE_QA_PROTOCOL_STANDARD, ARCHITECT_DIRECTIVE_FAV_PROTOCOL; env vars only (R-02).
2. **D35 (Notes) — immediate:** tests/notes-d35-fav-e2e.test.js (DELETE, CRUD round-trip, XSS).
3. **D22 (Tickers) — only after Team 30 WP001 completion:** scripts/run-tickers-d22-qa-api.sh; tests/tickers-d22-e2e.test.js (filter UI, CRUD, data integrity, summary).

**Coordination (required):** If API behavior blocks FAV: publish _COMMUNICATION/team_50/TEAM_50_TO_TEAM_20_S002_P003_API_CONTRACT_REQUEST.md (or similar) with exact failure and expected contract. If UI behavior blocks E2E: publish TEAM_50_TO_TEAM_30_S002_P003_UI_CONTRACT_REQUEST.md. Do not implement backend or frontend fixes yourself.

**Exit criteria (LLD400 §2.6):** WP002 D22/D34/D35 per §2.6; report to Team 10; SOP-013 Seal. **No scope expansion:** D23 and S003 out of scope.
```

---

**log_entry | TEAM_10 | S002_P003_GATE3_ACTIVATION_PROMPTS | v1.0.0_ACTIVE | 2026-02-27**
