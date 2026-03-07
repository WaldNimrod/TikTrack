# TEAM_10_S002_P003_WP001_WORK_PACKAGE_DEFINITION

**project_domain:** TIKTRACK  
**id:** TEAM_10_S002_P003_WP001_WORK_PACKAGE_DEFINITION  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 30, Team 190, Team 00, Team 50, Team 90  
**date:** 2026-02-27  
**status:** ACTIVE  
**gate_id:** GATE_3  
**program_id:** S002-P003  
**work_package_id:** S002-P003-WP001  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | TIKTRACK_ROADMAP_LOCKED |
| stage_id | S002 |
| program_id | S002-P003 |
| work_package_id | S002-P003-WP001 |
| task_id | N/A |
| gate_id | GATE_3 |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1) Work Package Title and Purpose

**Title:** S002-P003-WP001 — D22 Filter UI completion

**Purpose:** Complete D22 (Tickers) filter/search UI per LLD400: filter bar (ticker_type, is_active), loadTickersData params, state across pagination; E2E coverage; SOP-013 Seal. No scope expansion to D23 or S003.

---

## 2) Canonical Basis

| Document | Role |
|----------|------|
| _COMMUNICATION/team_190/TEAM_190_TO_TEAM_10_S002_P003_GATE3_INTAKE_HANDOFF.md | GATE_3 intake handoff — open WP001, mandate Team 30 |
| _COMMUNICATION/team_170/TIKTRACK_ALIGNMENT_S002_P003_LLD400_v1.0.0.md | LLD400 §2.4, §2.5, §2.6 |
| _COMMUNICATION/_Architects_Decisions/ARCHITECT_GATE2_S002_P003_DECISION.md | GATE_2 APPROVED — execution authorized |

---

## 3) Scope and Deliverables (per LLD400 §2.5)

| Artifact / area | Purpose |
|-----------------|---------|
| ui/src/views/management/tickers/tickersTableInit.js | Filter params to backend; state across pagination |
| ui/src/views/management/tickers/tickers.content.html | Filter bar HTML (ticker_type, is_active toggles) |

**Exit criteria (per LLD400 §2.6):** Filter bar present; loadTickersData passes params; filter toggles refresh table; state preserved across pagination; SOP-013 Seal.

---

## 4) Execution Owner and Dependency (by layer)

- **Backend (prerequisite):** Team 20 confirms D22 tickers API contract (query params ticker_type, is_active) and publishes TEAM_20_TO_TEAM_30_S002_P003_D22_API_CONTRACT_CONFIRMATION before any UI work. Per LLD400 §3 the API already exists; Team 20 confirms or fixes.
- **Owner (implementation):** Team 30 (Frontend) — client-side only: filter bar, loadTickersData params. No backend changes by Team 30.
- **Dependency:** Team 30 starts **only after** Team 20 contract confirmation.  
- **Next:** On WP001 completion, Team 50 may execute D22 portion of WP002 (FAV scripts + E2E). If API/UI gaps block tests, Team 50 issues coordination messages to Team 20 or Team 30 (no QA team implementation of backend/frontend).

---

**log_entry | TEAM_10 | S002_P003_WP001_WORK_PACKAGE_DEFINITION | GATE_3_INTAKE_OPEN | 2026-02-27**
