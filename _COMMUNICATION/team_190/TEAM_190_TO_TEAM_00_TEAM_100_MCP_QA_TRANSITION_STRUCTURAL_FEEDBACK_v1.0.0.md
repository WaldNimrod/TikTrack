# TEAM_190 -> TEAM_00, TEAM_100 | MCP_QA_TRANSITION_STRUCTURAL_FEEDBACK_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_190_TO_TEAM_00_TEAM_100_MCP_QA_TRANSITION_STRUCTURAL_FEEDBACK  
**from:** Team 190 (Constitutional Validation)  
**to:** Team 00 (Chief Architect), Team 100 (Development Architecture Authority)  
**cc:** Team 10, Team 50, Team 60, Team 61, Team 90, Team 170  
**date:** 2026-03-06  
**status:** PASS_WITH_CONDITIONS  
**gate_id:** GOVERNANCE_PROGRAM  
**program_id:** N/A (pre-LOD200 architectural shaping)  
**work_package_id:** N/A  
**in_response_to:** ARCH-MCP-QA-001 (Testing Infrastructure Upgrade / Selenium to MCP Transition)

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | N/A |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 00 + Team 100 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Executive Verdict

The MCP strategy is directionally correct and high-value, but **cannot be promoted as-is** to immediate execution packaging.

**Decision:** `PASS_WITH_CONDITIONS`

Reason: the concept is strong technically, yet currently conflicts with canonical gate ownership semantics and lacks required governance controls for evidence authority and runtime security.

## 2) Structural Findings (ordered by severity)

### B1 — Gate ownership mismatch (BLOCKER)

The concept assigns gate execution roles that conflict with canonical gate ownership.

Canonical source:
- `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md`

Required canonical mapping (locked):
- GATE_0..GATE_2 execution owner: Team 190
- GATE_3..GATE_4 execution owner: Team 10
- GATE_5..GATE_8 execution owner: Team 90
- GATE_2 and GATE_6 approval authority: Team 100

Implication: MCP may be introduced as tooling, but must not reassign gate authority.

### B2 — Team 190 scope overreach in execution gates (BLOCKER)

The concept places Team 190 directly inside GATE_4/5 operational validation. Under current constitution, Team 190 is constitutional/spec authority for GATE_0..2 and governance-level validation support.

Canonical sources:
- `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md`
- `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`

Implication: Team 190 can define control boundaries and validate structural compliance, but execution gate operation remains with Team 10/90.

### B3 — GATE_7 automation risk (BLOCKER if interpreted as replacement)

GATE_7 is explicitly a human browser approval gate. MCP can assist pre-checks but cannot replace human decision authority.

Canonical source:
- `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/documentation/docs-governance/05-CONTRACTS/GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.0.0.md`

Implication: any “full agentic” target must exclude replacing GATE_7 decision path.

### I1 — Evidence provenance policy is not yet codified for MCP artifacts (IMPORTANT)

The concept proposes richer evidence (DOM/DB/log), but does not define canonical evidence provenance and admissibility schema by gate.

Required: deterministic evidence tags (`TARGET_RUNTIME`, `LOCAL_DEV_NON_AUTHORITATIVE`, `SIMULATION`) and gate-level admissibility rules.

### I2 — Runtime security boundaries incomplete (IMPORTANT)

Proposed DB MCP and Shell MCP need explicit least-privilege and command-policy constraints.

Required controls:
1. DB MCP read-only role (no DDL/DML write grants).
2. Shell MCP allowlist-only execution profile (no arbitrary shell).
3. Audit trail for MCP action -> artifact linkage.

### I3 — Selenium retirement criteria missing (IMPORTANT)

A replacement decision is proposed without measurable parity gates.

Current repo state still has broad Selenium dependency:
- `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/tests/` (multiple `selenium-webdriver` suites)

Required: explicit parity KPIs before decommissioning Selenium.

### I4 — Team 61 integration missing from operating model (IMPORTANT)

Automation lane exists in canonical roster (Team 61) but concept does not assign it explicitly as MCP infrastructure owner.

Canonical source:
- `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`

## 3) Required Corrections Before LOD200 Lock

1. Keep gate authority unchanged; introduce MCP as execution tooling overlay only.
2. Publish gate-by-gate RACI for MCP operations (owner vs operator vs approver).
3. Define MCP evidence provenance and admissibility matrix per gate.
4. Define security baseline for MCP servers (RBAC, allowlists, auditability).
5. Define Selenium coexistence + retirement criteria with measurable thresholds.
6. Assign Team 61 explicitly to MCP infra automation; Team 60 for platform runtime hardening.

## 4) Recommended LOD200 Packaging (two-stage transition)

### Stage A (Immediate after current WP closure): Hybrid Integration

Recommended packaging anchor: **S002-P002 (Full Pipeline Orchestrator) scope extension via LOD200 v1.1.0**.

WP-A1 (MCP Foundation):
- Browser MCP setup for deterministic DOM/state checks.
- Filesystem MCP checks for GATE_0/GATE_1 spec consistency against ADR/SSOT paths.
- Evidence schema v1.0.0 (provenance + hash + trace id).

WP-A2 (Hybrid Gate Operations):
- GATE_4/GATE_5 MCP-assisted runs in parallel to Selenium baseline.
- Comparison report MCP vs Selenium per scenario.
- No authority changes and no GATE_7 replacement.

Entry condition:
- Current S002-P003-WP002 reaches GATE_8 PASS.

Exit criteria:
1. 3 consecutive cycles with MCP/Selenium result parity >= 95% on selected suites.
2. Zero authority drift from canonical gate model.
3. Evidence provenance policy enforced in all produced artifacts.

### Stage B (Planned and time-boxed for next close gate window): Controlled Agentic Expansion

WP-B1 (Selective Selenium retirement):
- Retire only suites meeting parity + stability threshold.
- Keep fallback regression lane for high-risk pages until 2 release cycles green.

WP-B2 (Automated seal-draft support):
- MCP drafts evidence sections for SOP-013/support artifacts.
- Final decision and signature remain with canonical human teams.

Non-negotiable boundary:
- GATE_7 remains human decision gate.

## 5) Proposed MCP RACI (canonical-compatible)

1. Team 61: MCP infrastructure automation (servers, CI wiring, reproducibility).
2. Team 60: platform/runtime hardening, credentials, network and execution policies.
3. Team 50: QA/FAV scenario execution using MCP tooling at GATE_4 support layer.
4. Team 90: GATE_5..8 owner; consumes MCP evidence under admissibility policy.
5. Team 10: orchestrates execution at GATE_3..4 and team mandates.
6. Team 190: constitutional validation of policy, artifact contracts, and gate-boundary compliance.

## 6) LOD200 Authoring Request (for Team 100 + Team 170)

Please produce `LOD200_v1.1.0` for MCP QA transition with mandatory sections:
1. Canonical identity + program/WP mapping.
2. In-scope / out-of-scope by gate.
3. MCP server architecture + security controls.
4. Evidence admissibility matrix.
5. Parity metrics and Selenium decommission rules.
6. Rollback/fallback plan.
7. Acceptance signals and artifact path contract.

## 7) Response Required

1. Team 00: confirm governance boundaries above (especially B1-B3).
2. Team 100: issue LOD200 packaging direction (S002-P002 v1.1.0 extension vs new program).
3. Team 170: prepare canonical templates for evidence provenance matrix.
4. Team 10/50/60/61/90: provide implementation feasibility inputs for Stage A.

---

**log_entry | TEAM_190 | MCP_QA_TRANSITION_STRUCTURAL_FEEDBACK | PASS_WITH_CONDITIONS | 2026-03-06**
