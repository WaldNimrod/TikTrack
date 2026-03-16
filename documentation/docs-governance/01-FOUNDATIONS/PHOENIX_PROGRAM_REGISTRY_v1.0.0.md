
# PHOENIX_PROGRAM_REGISTRY_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** PHOENIX_PROGRAM_REGISTRY  
**version:** 1.0.0  
**owner:** Team 100 / Team 00 (architectural); mirror sync per PORTFOLIO_WSM_SYNC_RULES  
**date:** 2026-03-10  
**directive:** TEAM_190_TO_TEAM_170_PORTFOLIO_CANONICALIZATION_MIGRATION_WORK_PACKAGE_v1.0.0

---

## Boundary

Programs are **single-domain only**. **current_gate_mirror** is derived from WSM; it is not a runtime source. Runtime SSOT remains `PHOENIX_MASTER_WSM_v1.0.0.md` block CURRENT_OPERATIONAL_STATE.

---

## Schema

| Field | Description |
|-------|-------------|
| program_id | S{NNN}-P{NNN} |
| program_name | Short label |
| domain | Single domain only (e.g. AGENTS_OS, TIKTRACK) |
| stage_id | S{NNN} |
| status | ACTIVE \| COMPLETE \| CLOSED \| DEFERRED \| HOLD \| FROZEN \| PIPELINE \| PLANNED |
| current_gate_mirror | Informational mirror from WSM (Program has no independent gate lifecycle authority) |

---

## Programs

כל תוכנית = sub של שלב. סדר: לפי stage_id (Roadmap) ואז program_id. דומיין: TikTrack או Agents_OS.



| stage_id | program_id | program_name | domain | status | current_gate_mirror |
| --- | --- | --- | --- | --- | --- |
| S001 | S001-P001 | Agents_OS Phase 1 | AGENTS_OS | COMPLETE | DOCUMENTATION_CLOSED (GATE_8 PASS 2026-02-23) |
| S001 | S001-P002 | Alerts POC | TIKTRACK | ACTIVE | GATE_0 (deferred activation authorized per ARCHITECT_DIRECTIVE_S001_P002_ACTIVATION_v1.0.0; trigger met: S002-P002-WP003 lifecycle close 2026-03-13; parallel activation during S002 era 2026-03-14). *domain reclassified from AGENTS_OS to TIKTRACK per TEAM_00_AGENTS_OS_INDEPENDENCE_DIRECTIVE_ACCEPTANCE_v1.0.0 §2 — ruling 2026-03-11* |
| S002 | S002-P001 | Agents_OS Core Validation Engine | AGENTS_OS | COMPLETE | DOCUMENTATION_CLOSED (WP001+WP002 GATE_8 PASS 2026-02-26) |
| S002 | S002-P002 | MCP-QA Transition (Full Pipeline Orchestrator) | TIKTRACK | COMPLETE | GATE_8; active_flow=S002-P002-WP003 (Market Data Hardening) — **GATE_8 PASS / DOCUMENTATION_CLOSED** after Team 90 validation; no active work package in execution at this time.; active_work_package_id=N/A |
| S002 | S002-P003 | TikTrack Alignment (D22+D33+D34+D35) | TIKTRACK | COMPLETE | GATE_8 PASS 2026-03-07; DOCUMENTATION_CLOSED; lifecycle complete (Team 90 validation report) |
| S002 | S002-P004 | Admin Review S002 | TIKTRACK | PLANNED | — (Stage Governance Package; planning marker per integrated roadmap v1.1.0) |
| S002 | S002-P005 | Agents_OS v2 Writing Semantics Hardening (ADR-031 Stage A) + UI Optimization | AGENTS_OS | ACTIVE | GATE_8; active_flow=S002-P005-WP002 (Pipeline Governance) — **GATE_8 PASS / DOCUMENTATION_CLOSED** after Team 90 revalidation (`TEAM_90_TO_TEAM_170_S002_P005_WP002_GATE8_VALIDATION_RESPONSE_v1.0.1.md`); no active work package in execution at this time.; active_work_package_id=N/A |
| S003 | S003-P001 | Data Model Validator | AGENTS_OS | COMPLETE | FAST_4 CLOSED (WP001) 2026-03-11 — Data Model Validator deployed; FAST_0..FAST_3 completed; Team 170 closure per TEAM_61_TO_TEAM_170_S003_P001_WP001_FAST4_HANDOFF_PROMPT_v1.0.0 |
| S003 | S003-P002 | Test Template Generator | AGENTS_OS | COMPLETE | FAST_4 CLOSED (WP001) 2026-03-12 — Test Template Generator deployed; G3.7 added; agents_os_v2/requirements.txt canonical |
| S003 | S003-P003 | System Settings (D39+D40+D41) | TIKTRACK | PLANNED | — (scope updated per ROADMAP_AMENDMENT_v2 §B3; D41 user_management companion) |
| S003 | S003-P004 | User Tickers (D33) | TIKTRACK | PLANNED | — (registered from integrated roadmap v1.1.0) |
| S003 | S003-P005 | Watch Lists (D26) | TIKTRACK | PLANNED | — (D38 tag_management relocated to S005 per ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v1.0.0 §A1; registered from integrated roadmap v1.1.0) |
| S003 | S003-P006 | Admin Review S003 | TIKTRACK | PLANNED | — (Stage Governance Package; planning marker per integrated roadmap v1.1.0) |
| S003 | S003-P007 | Agents_OS Command Bridge Lite (ADR-031 Stage B) | AGENTS_OS | PLANNED | — (next AGENTS_OS stage-3 package; scope lock: approve-path desync block, command bridge copy flow with Task ID + context, model-B path realignment; **backlog candidate:** PIPELINE_HELP.html — standalone help page replacing modal, full operator guide searchable/browser-navigable, trigger: WP002 GATE_8 PASS, LOD200 required before GATE_0; authority source: `_COMMUNICATION/_Architects_Decisions/Gimini 00 cloud/פסיקה אדריכלית_ סמנטיקת כתיבה ותוכנית אבולוציה Agents_OS v2.md`; lock package: `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_00_ADR031_DECISION_LOCK_AND_SIGNER_CHAIN_PROPOSAL_v1.0.0.md`) |
| S003 | S003-P008 | Agents_OS Pipeline Governance Hardening | AGENTS_OS | PLANNED | — pending GATE_0 validation; LOD200 submitted 2026-03-16; scope: STATE_VIEW.json, LOD200 ordering table schema (IDEA-040/042), gate prompt lifecycle archive (IDEA-038), test_cursor_prompt cap (IDEA-039); activation trigger: S002-P005-WP003 GATE_0 PASS; sequencing: activate before or in parallel with S003-P007; authority: TEAM_100_AGENTS_OS_PIPELINE_GOVERNANCE_HARDENING_S003_P008_LOD200_v1.0.0.md |
| S004 | S004-P001 | Financial Precision Validator | AGENTS_OS | PLANNED | — (placeholder; program number assigned at activation; LOD200 authoring begins when S003 Agents_OS programs complete; scope: float prohibition E-18..E-19, NUMERIC(20,8) enforcement E-20..E-22) |
| S004 | S004-P002 | Business Logic Validator | AGENTS_OS | PLANNED | — (placeholder; ⚡ ACCELERATED from S005; scope: multi-entity consistency, state machine completeness, business rule coverage; MUST complete before S005 TikTrack begins) |
| S004 | S004-P003 | Spec Draft Generator | AGENTS_OS | PLANNED | — (placeholder; ⚡ ACCELERATED from S006; scope: LLM-assisted LOD200/LLD400 first draft from product requirements; ~70% reduction in spec authoring token cost; MUST complete before S005 TikTrack begins) |
| S004 | S004-P004 | Executions (D36) | TIKTRACK | PLANNED | — (registered from integrated roadmap v1.1.0) |
| S004 | S004-P005 | Data Import (D37) | TIKTRACK | PLANNED | — (registered from integrated roadmap v1.1.0) |
| S004 | S004-P006 | Admin Review S004 | TIKTRACK | PLANNED | — (Stage Governance Package; planning marker per integrated roadmap v1.1.0) |
| S004 | S004-P007 | Indicators Infrastructure | TIKTRACK | PLANNED | — (canonical slot assigned for registry consistency; architectural alias in directives: S004-PXXX. Deliverables: ticker_indicators table NUMERIC(20,8), indicator_computation_service ATR/MA/CCI, nightly_indicators_calculation APScheduler job, GET /api/v1/tickers/{id}/indicators endpoint) |
| S004 | S004-P008 | Agents_OS Mediated Reconciliation Engine (ADR-031 Stage C) | AGENTS_OS | PLANNED | — (independent stage-4 package after existing AGENTS_OS stage-4 programs; scope lock: proposed_updates mediator, SSM legality gate, visual evidence diff/capture flow; authority source: `_COMMUNICATION/_Architects_Decisions/Gimini 00 cloud/פסיקה אדריכלית_ סמנטיקת כתיבה ותוכנית אבולוציה Agents_OS v2.md`; lock package: `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_00_ADR031_DECISION_LOCK_AND_SIGNER_CHAIN_PROPOSAL_v1.0.0.md`) |
| S005 | S005-P001 | Analytics Quality Validator | AGENTS_OS | PLANNED | — (placeholder; moved from S006; scope: analytics calculation declaration, output format compliance; built during S005 era to serve S006 TikTrack analytics work) |
| S005 | S005-P002 | Trade Entities (D29+D24) | TIKTRACK | PLANNED | — (registered from integrated roadmap v1.1.0) |
| S005 | S005-P003 | Market Intelligence (D27+D25) | TIKTRACK | PLANNED | — (registered from integrated roadmap v1.1.0) |
| S005 | S005-P004 | Journal & History (D28+D31) | TIKTRACK | PLANNED | — (registered from integrated roadmap v1.1.0) |
| S005 | S005-P005 | Admin Review S005 | TIKTRACK | PLANNED | — (Stage Governance Package; planning marker per integrated roadmap v1.1.0) |
| S006 | S006-P001 | Portfolio State (D32) | TIKTRACK | PLANNED | — (registered from integrated roadmap v1.1.0) |
| S006 | S006-P002 | Analysis & Closure (D30) | TIKTRACK | PLANNED | — (registered from integrated roadmap v1.1.0) |
| S006 | S006-P003 | Level-1 Dashboards | TIKTRACK | PLANNED | — (registered from integrated roadmap v1.1.0) |
| S006 | S006-P004 | Admin Review S006 FINAL | TIKTRACK | PLANNED | — (Stage Governance Package; planning marker per integrated roadmap v1.1.0) |



---
### S005 stage context notes (TikTrack)

- D38 (tag_management): added to S005 from S003 per architectural decision 2026-03-02.
- D26-Phase2 (watch_lists enhancement): new WP in S005 after D29 GATE_8 PASS (scope: ATR, Position, P&L%, P&L columns; flag_color filter enhancement).
- Tag assignment: built inline per entity page as each page is built (S003 onward per entity).

---
## Agents_OS Completion Gate

```
★ AGENTS_OS SYSTEM COMPLETE GATE ★
Triggered when: S004-P002 (Business Logic Validator) AND S004-P003 (Spec Draft Generator) both reach GATE_8 PASS
Effect: All Agents_OS capability phases 1–5 operational.
        S005 TikTrack development may proceed with full automation infrastructure.
Mandate: S005 TikTrack GATE_0 may not open until this gate is reached.
Authority: Team 100 (confirms GATE_8 PASS) → Team 00 (activates S005 TikTrack)
```

---

## S002-P005 Backlog and Governance

### S002-P005-WP003 candidate (revised)
- **PIPELINE_TEAMS.html Update** — `TEAM_00_TO_TEAM_30_AOS_TEAMS_PAGE_UPDATE_MANDATE_v1.0.0.md`

### S002-P005-WP004 candidate
- **Idea Pipeline Phase 2** — grooming automation, UI fate-decision interface, dedup detection, registry auto-integration. Trigger: WP002 GATE_8 PASS. LOD200 required before GATE_0. Design authority: `_COMMUNICATION/PHOENIX_IDEA_LOG.json` (IDEA-007).

### Standing governance (AGENTS_OS)
- **AOS Docs Audit** — `TEAM_00_TO_TEAM_170_TEAM_190_AOS_DOCS_AUDIT_MANDATE_v1.0.0.md`: Standing thread (Team 170 + Team 190): code vs docs alignment, activation prompt updates, vision alignment checks. Trigger: every gate completion + every pipeline code change + every Stage activation. Not a WP — ongoing responsibility.

### Pending deliverable (AOS Docs Audit scope)
- **TEAM_10_MODE1_ROUTING_TABLE_v1.0.0.md** — Deterministic routing table for Team 10 Mode 1 legacy operation. Required by `ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v2.0.0.md` §Required Actions. Author: Team 170; submit to `_COMMUNICATION/_ARCHITECT_INBOX/` for Team 00 approval.

---
## Pending LOD200 Inputs (S003 preparation locks)

- **D39 Preferences (S003-P003):** Canonical field set locked to 23 fields across 6 groups; JSONB settings storage; `default_commission` excluded; trading-hours fields excluded from D39; `primary_currency` included in Group A; Group B contains 6 trading-default fields.
- **D40 System Management (S003-P003):** Locked to 7 sections; Market Data Settings includes `trading_hours_start`, `trading_hours_end`, `trading_timezone`; admin-only scope.
- **D33 User Tickers (S003-P004):** Iron Rule display lock requires `last_price` + `last_change` in table rows; live price INCLUDED; scope includes filtering, sorting, pagination.
- **D41 User Management (S003-P003 companion):** Added per ROADMAP_AMENDMENT_v2 §B3.
- **D36/D37 P&L policy:** Option B (Delta-Reset via enhanced D37 import) locked for S004; Option C (Direct Broker API) deferred to S006+ roadmap.
- **S002-P002 MCP-QA transition packaging:** Hybrid MCP integration package (Stage A) + controlled agentic expansion package (Stage B), including evidence admissibility tags and `MATERIALIZATION_EVIDENCE.json` artifact contract.

Source directives:
- `ARCHITECT_DIRECTIVE_S003_PREP_DECISIONS_v1.0.0.md`
- `ARCHITECT_DIRECTIVE_PL_RECONCILIATION_POLICY_v1.0.0.md`

---

**current_gate_mirror source:** WSM CURRENT_OPERATIONAL_STATE (last update 2026-03-15). Sync contract: `documentation/docs-governance/01-FOUNDATIONS/PORTFOLIO_WSM_SYNC_RULES_v1.0.0.md`.

**WSM mirror (2026-03-15):** active_stage_id=S002; active_program_id=S002-P005; current_gate=GATE_8; active_work_package_id=N/A; active_flow=S002-P005-WP002 (Pipeline Governance) — **GATE_8 PASS / DOCUMENTATION_CLOSED** after Team 90 revalidation (`TEAM_90_TO_TEAM_170_S002_P005_WP002_GATE8_VALIDATION_RESPONSE_v1.0.1.md`); no active work package in execution at this time..

---

**log_entry | TEAM_170 | PHOENIX_PROGRAM_REGISTRY | v1.0.0_CREATED | 2026-02-23**
**log_entry | TEAM_170 | PHOENIX_PROGRAM_REGISTRY | SYNC_WSM_B1_B5_REMEDIATION | 2026-02-23**
**log_entry | TEAM_170 | PHOENIX_PROGRAM_REGISTRY | SYNC_WSM_STAGE_S002_NO_ACTIVE_PROGRAM | 2026-02-24**
**log_entry | TEAM_170 | PHOENIX_PROGRAM_REGISTRY | S002_P001_ADDED_LLD400_SUBMITTED | 2026-02-24**
**log_entry | TEAM_100 | PHOENIX_PROGRAM_REGISTRY | S002_P001_CORRECTED_GATE0_LOD200_SUBMITTED | 2026-02-24**
**log_entry | TEAM_100 | PHOENIX_PROGRAM_REGISTRY | S002_P001_GATE0_PASS_GATE1_ACTIVE_TEAM_170_ACTIVATED | 2026-02-25**
**log_entry | TEAM_190 | PHOENIX_PROGRAM_REGISTRY | S002_P001_GATE2_APPROVED_GATE3_INTAKE_TEAM10_NEXT | 2026-02-25**
**log_entry | TEAM_100 | PHOENIX_PROGRAM_REGISTRY | S002_P001_WP001_GATE8_PASS_WP002_ACTIVATED_S002_P002_PIPELINE_ADDED | 2026-02-26**
**log_entry | TEAM_190 | PHOENIX_PROGRAM_REGISTRY | SYNC_WSM_WP002_GATE3_INTAKE_PENDING_TEAM10_OPEN_REQUIRED | 2026-02-26**
**log_entry | TEAM_190 | PHOENIX_PROGRAM_REGISTRY | S002_P003_ADDED_GATE0_PASS_G1_PENDING | 2026-02-26**
**log_entry | TEAM_90 | PHOENIX_PROGRAM_REGISTRY | S002_P003_WP002_G5_PASS_GATE6_ROUTING_PREPARATION_ACTIVE | 2026-03-04**
**log_entry | TEAM_90 | PHOENIX_PROGRAM_REGISTRY | S002_P003_WP002_G6_SUBMITTED_AWAITING_DECISION | 2026-03-04**
**log_entry | TEAM_90 | PHOENIX_PROGRAM_REGISTRY | S002_P003_WP002_REMEDIATION_EXECUTION_PACKAGE_ISSUED_TO_TEAM10 | 2026-03-04**
**log_entry | TEAM_100 | PHOENIX_PROGRAM_REGISTRY | S001_P002_STATUS_PIPELINE_ACTIVATION_AUTHORIZED + S002_P001_STATUS_COMPLETE + S003_S006_AGENTS_OS_PLACEHOLDERS_ADDED | 2026-02-27**
**log_entry | TEAM_100 | PHOENIX_PROGRAM_REGISTRY | SEQUENCING_REVISED_GENERATION_LAYER_ACCELERATED: TEST_TEMPLATE_GENERATOR→S003 + BUSINESS_LOGIC_VALIDATOR→S004 + SPEC_DRAFT_GENERATOR→S004 + ANALYTICS_VALIDATOR→S005 + AGENTS_OS_COMPLETE_GATE_ADDED | 2026-03-01**
**log_entry | TEAM_170 | PHOENIX_PROGRAM_REGISTRY | INTEGRATED_ROADMAP_V1_1_0_RECONCILIATION_B4_B5_APPLIED | 2026-03-01**
**log_entry | TEAM_170 | PHOENIX_PROGRAM_REGISTRY | TEAM_00_CANONICAL_ALIGNMENT_CORRECTIONS_APPLIED | 2026-03-02**
**log_entry | TEAM_170 | PHOENIX_PROGRAM_REGISTRY | S003_GOVERNANCE_ALIGNMENT_D01_D04_AND_LOD200_INPUTS_APPLIED | 2026-03-03**
**log_entry | TEAM_90 | PHOENIX_PROGRAM_REGISTRY | S002_P003_WP002_G7_REJECTED_CODE_CHANGE_REQUIRED_SYNCED_TO_WSM | 2026-03-04**
**log_entry | TEAM_90 | PHOENIX_PROGRAM_REGISTRY | S002_P003_WP002_G5_BLOCKED_REMEDIATION_INCOMPLETE_SYNCED_TO_WSM | 2026-03-06**
**log_entry | TEAM_90 | PHOENIX_PROGRAM_REGISTRY | S002_P003_WP002_G5_PASS_GATE6_ROUTING_PREPARATION_ACTIVE_SYNCED_TO_WSM | 2026-03-06**
**log_entry | TEAM_90 | PHOENIX_PROGRAM_REGISTRY | S002_P003_WP002_G6_SUBMITTED_AWAITING_DECISION_SYNCED_TO_WSM | 2026-03-06**
**log_entry | TEAM_90 | PHOENIX_PROGRAM_REGISTRY | S002_P003_WP002_G6_APPROVED_GATE7_HUMAN_SIGNOFF_ACTIVE_SYNCED_TO_WSM | 2026-03-06**
**log_entry | TEAM_190 | PHOENIX_PROGRAM_REGISTRY | S002_P002_MCP_QA_TRANSITION_PACKAGING_NOTE_ADDED | 2026-03-06**
**log_entry | TEAM_10 | PHOENIX_PROGRAM_REGISTRY | SYNC_WSM_POST_GATE8_S002_P003_COMPLETE_S002_P002_ACTIVE | 2026-03-07**
**log_entry | TEAM_90 | PHOENIX_PROGRAM_REGISTRY | S002_P002_PRICE_RELIABILITY_PACKAGE_TEAM190_REVALIDATION_PASS_GATE7_ACTIVE | 2026-03-09**
**log_entry | TEAM_170 | PHOENIX_PROGRAM_REGISTRY | FA01_APPLIED_S001_P002_DOMAIN_TIKTRACK_STATUS_DEFERRED_PER_TEAM_00_DIRECTIVE | 2026-03-11**
**log_entry | TEAM_170 | PHOENIX_PROGRAM_REGISTRY | S003_P001_FAST4_CLOSED_WP001_COMPLETE | 2026-03-11**
**log_entry | TEAM_170 | PHOENIX_PROGRAM_REGISTRY | S003_P002_FAST4_CLOSED_WP001_G37_ADDED | 2026-03-12**
**log_entry | TEAM_190 | PHOENIX_PROGRAM_REGISTRY | ADR031_PROGRAM_SLOTS_LOCKED_S002_P005_S003_P007_S004_P008_PLANNED | 2026-03-14**
**log_entry | TEAM_00 | PHOENIX_PROGRAM_REGISTRY | S001_P002_DEFERRED_TO_PIPELINE_ACTIVATED_PER_ARCHITECT_DIRECTIVE_S001_P002_ACTIVATION_v1.0.0 | 2026-03-14**
**log_entry | TEAM_170 | PHOENIX_PROGRAM_REGISTRY | S002_P005_PLANNED_TO_ACTIVE_WP001_TASK_CLOSED_WP002_PLANNED_PER_TEAM_100_MANDATE | 2026-03-15**
**log_entry | TEAM_170 | PHOENIX_PROGRAM_REGISTRY | S002_P005_BACKLOG_GOVERNANCE_REGISTERED_PER_TEAM_00_ROADMAP_INTEGRATION | 2026-03-15**
**log_entry | TEAM_170 | PHOENIX_PROGRAM_REGISTRY | S002_P005_WP003_REVISED_WP004_IDEA_PIPELINE_PHASE2_ADDED | 2026-02-19**
