# TEAM_10_S002_P003_G7_REMEDIATION_MASTER_PLAN_v1.0.0

**project_domain:** TIKTRACK  
**id:** TEAM_10_S002_P003_G7_REMEDIATION_MASTER_PLAN_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 20, Team 30, Team 50, Team 60, Team 90  
**cc:** Team 00, Team 100, Team 170, Team 190, Team 40  
**date:** 2026-03-01  
**status:** READY_FOR_G3_EXECUTION_REENTRY  
**gate_id:** GATE_3 (re-entry after GATE_7 reject)  
**work_package_id:** S002-P003-WP002  

---

## 1) Sources studied in full

1. `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_v1.0.0.md`
2. `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_SUPPLEMENT_v1.0.0.md`
3. `_COMMUNICATION/_Architects_Decisions/NIMROD_GATE7_S002_P003_WP002_DECISION.md`
4. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` (current operational state)
5. `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`

---

## 2) Team 10 mandatory decisions

| Decision ID | Topic | Team 10 decision | Rationale |
| --- | --- | --- | --- |
| D-01 | D35 error-contract canonical form | Use **API-style checks in existing D35 test flow** (no new out-of-scope model invention). | Minimizes drift and aligns with architect's Option A spirit while preserving evidence quality (X/Y + exit code). |
| D-02 | Execution sequence lock | Enforce strict Phase A -> B -> C -> D -> E as specified. | Stream dependencies are structural; no parallel bypass of DB/service prerequisites. |
| D-03 | Scope lock | WP scope includes **D22 + D33 + D34 + D35** exactly; no D23/S003 additions. | Explicit in briefing + directives. |
| D-04 | Evidence standard | Every test/report section must include **PASS count + exit code** (never "PRESENT" only). | Required by new GATE_6 procedure directive. |

---

## 3) Clarifications / approvals required

| Q-ID | Item | Why clarification is required | Proposed handling until answered |
| --- | --- | --- | --- |
| Q-01 | GATE_4 QA owner conflict (`Team 40 QA` in briefing vs historical `Team 50 QA/FAV`) | Governance text and briefing wording diverge operationally. | Team 10 runs dual QA handoff: Team 50 for FAV runtime, Team 40 for UX consistency review; submit combined QA package. |
| Q-02 | D35 error-contract exact harness format | Brief allows "API script or E2E extension". | Proceed with API-negative checks embedded in D35 test flow and present explicit mapping to required 422/401/400 outcomes. |

If Team 00/100 provide different rulings, Team 10 will re-lock this plan before coding continues.

---

## 4) Work breakdown by stream

### Stream 1 — Backend Infrastructure (must complete first)

| Finding | Team | Deliverable |
| --- | --- | --- |
| F-01 | Team 20 | `api/services/canonical_ticker_service.py`; D22/D33 single creation path |
| F-02 | Team 20 + Team 60 | `user_tickers` migration M-001 (+ status/notes/updated_* fields as specified) |
| F-03 | Team 20 | status cascade logic system_ticker -> user_tickers |
| F-04 | Team 20 | deleted_at restore/cancel policy consistency |
| F-08 | Team 20 + Team 60 | alerts `trigger_status` migration and model update |
| F-09 | Team 20 | `update_alert()` create/edit path correctness |
| F-13 | Team 20 + Team 60 | `scripts/check_alert_conditions.py` + cron integration pattern |
| F-14 | Team 20 + Team 60 | `user_data.notifications` + `admin_data.job_run_log` tables and logging hooks |

### Stream 2 — Semantic Layer + Condition Builder

| Finding | Team | Deliverable |
| --- | --- | --- |
| F-05 | Team 30 | `statusValues.js` + `statusAdapter.js` integrated into D22/D33 views |
| F-06 | Team 30 | D34 condition builder (7 fields x 7 operators incl. crosses_*) |
| F-07 | Team 30 (+ Team 20 API verification) | `ui/src/utils/entityOptionLoader.js` + endpoint alignment |
| F-10 | Team 30 | D34 filter bar `ticker_id` query pass-through fix |
| F-15 | Team 20 + Team 30 | D35 parent_type/parent_id model lock (ticker/trade/trade_plan/account + defined types from directive) |
| F-16 | Team 30 | D35 dynamic entity loading by parent_type via shared loader |

### Stream 3 — UX Components

| Finding | Team | Deliverable |
| --- | --- | --- |
| F-11 | Team 30 | D34 trigger_status visual states + re-arm UX |
| F-12 | Team 30 + Team 20 + Team 60 | notification bell widget + notifications endpoints + polling stability |

---

## 5) Phase execution plan (orchestration)

| Phase | Scope | Owner | Exit criteria |
| --- | --- | --- | --- |
| A | Migrations M-001..M-007 | Team 20 + Team 60 | migrations exit 0, rollback scripts present, no data loss |
| B | canonical_ticker_service + service updates + eval engine | Team 20 | F-01/F-03/F-04/F-09/F-13 complete |
| C | entityOptionLoader + condition builder + note linkage | Team 30 (+ Team 20 API support) | F-05/F-06/F-07/F-10/F-15/F-16 complete |
| D | trigger_status UX + notification bell + background jobs UI | Team 30 + Team 20 + Team 60 | F-11/F-12 complete, UI consistency rules met |
| E | full regression + seals + evidence package | Team 50 (with Team 10 orchestration) | D22/D34/D35 full green, SOP-013 seals complete, evidence quality compliant |

---

## 6) Gate path (re-entry cycle)

`GATE_3 (current)` -> `GATE_4 QA package` -> `GATE_5 Team 90 validation` -> `GATE_6 Team 90 resubmission (8 artifacts incl. GATE6_READINESS_MATRIX)` -> `GATE_7 human review`.

No gate skipping is permitted.

---

## 7) Immediate activation package

Team 10 issues activation mandates per role:

1. Team 20: backend + migrations + services + routers  
2. Team 30: frontend + semantic UI + UX components  
3. Team 60: runtime/platform readiness + cron/job infrastructure  
4. Team 50: QA/FAV execution, evidence, seals, regression matrix  

Each mandate includes fixed evidence paths and pass criteria.

---

Log entry: TEAM_10 | S002_P003_WP002 | G7_REMEDIATION_MASTER_PLAN_READY | 2026-03-01
