---
project_domain: SHARED (TIKTRACK + AGENTS_OS)
id: TEAM_190_MCP_QA_PHASE1_GOVERNANCE_SCAN_UPDATE_MAP
from: Team 190 (Constitutional Validation)
to: Team 10, Team 50, Team 60, Team 61, Team 70, Team 90, Team 170
cc: Team 00, Team 100
date: 2026-03-07
status: ISSUED
gate_id: GOVERNANCE_PROGRAM
program_id: S002-P002
scope: MCP_QA_PHASE1_PROCEDURE_ALIGNMENT
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 190 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Purpose

Provide a phase-1 governance scan and an actionable update map for full MCP+Chrome operational adoption by Team 50, Team 90, and Team 190 without gate-authority drift.

## 2) Canonical Baseline Used

1. `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md`
2. `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`
3. `documentation/docs-governance/01-FOUNDATIONS/07_TEAM_190_CONSTITUTION.md`
4. `documentation/docs-governance/05-CONTRACTS/GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.0.0.md`
5. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_00_ARCH_MCP_QA_001_REVALIDATION_RESULT_v1.1.0.md`

## 3) Findings (ordered by severity)

### P1-01 (BLOCKER): Team 90 legacy role files contradict canonical gate ownership

Contradicting legacy statements still exist and must be corrected/deprecated:
1. `_COMMUNICATION/team_90/TEAM_90_GOVERNANCE_ROLE_RESET_AND_ENFORCEMENT.md:33`
2. `_COMMUNICATION/team_90/TEAM_90_GOVERNANCE_ROLE_RESET_AND_ENFORCEMENT.md:34`
3. `_COMMUNICATION/team_90/TEAM_90_GOVERNANCE_ROLE_RESET_AND_ENFORCEMENT.md:52`
4. `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_100_ROLE_RECONFIRMATION_ALIGNMENT_ACK.md:16`
5. `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_100_ROLE_RECONFIRMATION_ALIGNMENT_ACK.md:19`

Canonical owner matrix remains:
1. GATE_0..GATE_2: Team 190
2. GATE_3..GATE_4: Team 10
3. GATE_5..GATE_8: Team 90

### P1-02 (BLOCKER): No single canonical hybrid QA SOP for MCP + Selenium coexistence

Current material is split across team docs and infra notes. A single binding procedure is missing for:
1. parity policy
2. admissibility policy
3. evidence signature contract
4. cutover criteria from Selenium

Evidence:
1. `tests/README.md:1`
2. `infrastructure/s002_p002_mcp_qa/MCP_CHROME_SETUP.md:3`
3. `_COMMUNICATION/team_50/TEAM_50_ROLE_AND_PROCEDURES_README.md:14`

### P2-01 (IMPORTANT): Team 50 SOPs do not yet lock MCP evidence fields as mandatory

Team 50 SOP set is solid for QA operations but does not yet force the exact phase-1 MCP evidence contract fields in all gate-bound outputs.

Evidence:
1. `_COMMUNICATION/team_50/TEAM_50_QA_REPORT_FORMAT_STANDARD.md:1`
2. `_COMMUNICATION/team_50/TEAM_50_QA_FAILURE_REPORTING_SOP_v1.0.0.md:1`
3. `_COMMUNICATION/team_50/TEAM_50_QA_RERUN_SOP.md:1`

### P2-02 (IMPORTANT): Team 61 phase wording can cause ownership ambiguity

Some active messaging defines Team 61 as advisory in phase-1 for this repo, while canonical role mapping assigns Team 61 repo-automation authority in general. This requires explicit phase-scope clarification.

Evidence:
1. `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_61_S002_P002_MCP_QA_AUTOMATION_ACTIVATION_v1.0.0.md:32`
2. `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md:39`

## 4) Required Documentation Update Map

| Priority | Owner Team | Document Path | Required Update |
|---|---|---|---|
| P1 | Team 90 | `_COMMUNICATION/team_90/TEAM_90_GOVERNANCE_ROLE_RESET_AND_ENFORCEMENT.md` | Issue v1.1.0 correction or deprecation note; remove Gate 4/5 split model and align to canonical owner matrix. |
| P1 | Team 90 | `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_100_ROLE_RECONFIRMATION_ALIGNMENT_ACK.md` | Replace legacy gate ownership lines with canonical mapping and GATE_7 human-authority binding model. |
| P1 | Team 50 + Team 90 + Team 190 (via Team 170 canonicalization) | `documentation/docs-governance/04-PROCEDURES/` (new file) | Create one canonical `MCP_HYBRID_QA_VALIDATION_PROCEDURE_v1.0.0.md` for phase-1 hybrid mode. |
| P2 | Team 50 | `_COMMUNICATION/team_50/TEAM_50_QA_REPORT_FORMAT_STANDARD.md` | Add mandatory MCP evidence block schema + provenance tag + signature fields for gate-bound reports. |
| P2 | Team 50 | `_COMMUNICATION/team_50/TEAM_50_QA_RERUN_SOP.md` | Add deterministic rerun policy for MCP parity cycle and Selenium fallback policy. |
| P2 | Team 60 | `infrastructure/s002_p002_mcp_qa/MCP_CHROME_SETUP.md` | Add explicit normative link to provenance/signature contract and admissibility policy. |
| P2 | Team 60 | `infrastructure/s002_p002_mcp_qa/RUNTIME_IDENTITY.md` | Add gate-level admissibility examples per tag (`TARGET_RUNTIME`, `LOCAL_DEV_NON_AUTHORITATIVE`, `SIMULATION`). |
| P2 | Team 61 + Team 10 | `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_61_S002_P002_MCP_QA_AUTOMATION_ACTIVATION_v1.0.0.md` | Clarify phase-1 scope sentence so repo-level automation authority is explicit and non-conflicting. |
| P3 | Team 190 | `_COMMUNICATION/team_190/TEAM_190_INTERNAL_OPERATING_RULES.md` | Add MCP overlay section: admissibility spot-check flow for GATE_0..GATE_2 constitutional review. |
| P3 | Team 170 | `documentation/docs-governance/00-INDEX/GOVERNANCE_PROCEDURES_INDEX.md` | Register new MCP hybrid procedure and deprecation references for corrected Team 90 legacy docs. |

## 5) Immediate Message Required to Teams (same-cycle)

1. Gate authority is unchanged by MCP rollout; MCP is tooling overlay only.
2. GATE_7 remains human approval; Team 90 is field manager and WSM owner for G7/G8 updates; Nimrod is human authority.
3. No gate package may rely on `LOCAL_DEV_NON_AUTHORITATIVE` as decisive evidence.
4. Every gate-bound MCP evidence file must include provenance tag and Ed25519 signature block.
5. Selenium remains active regression safety net until hybrid parity rule is met (>=95% for 3 consecutive cycles).

## 6) Validation Decision

`PASS_WITH_ACTIONS`

The phase-1 infrastructure direction is valid, but the update map above is mandatory to prevent governance drift during scaling.

---

**log_entry | TEAM_190 | MCP_QA_PHASE1_GOVERNANCE_SCAN_UPDATE_MAP | PASS_WITH_ACTIONS | 2026-03-07**
