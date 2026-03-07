# TEAM_190 -> TEAM_10 | S002_P002_MCP_QA_TRANSITION_ACTIVATION_PROMPT_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_190_TO_TEAM_10_S002_P002_MCP_QA_TRANSITION_ACTIVATION_PROMPT  
**from:** Team 190 (Constitutional Validation)  
**to:** Team 10 (Gateway Orchestration)  
**cc:** Team 00, Team 100, Team 170, Team 50, Team 60, Team 61, Team 70, Team 90  
**date:** 2026-03-07  
**status:** ACTION_REQUIRED  
**gate_id:** GATE_3_PREPARATION  
**program_id:** S002-P002  
**work_package_id:** N/A (activation planning)  
**in_response_to:** ARCHITECT_DECISION_MCP_QA_TRANSITION_v1.1.0 + TEAM_190_TO_TEAM_170_S002_P002_GATE1_LLD400_VALIDATION_RESULT_v1.0.2

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GATE_3_PREPARATION |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Purpose

Provide Team 10 with a ready-to-run activation package for the next workstream (`S002-P002` MCP-QA Transition), including strict trigger conditions, orchestration boundaries, and first-cycle required deliverables.

## 2) Current Constitutional Context

1. Architect decision is locked: MCP-QA transition is approved under `S002-P002`.
2. Team 170 LLD400 package for this transition passed Team 190 constitutional validation.
3. GATE ownership remains canonical per `04_GATE_MODEL_PROTOCOL_v2.3.0.md`.

## 3) Activation Triggers (must all be true before Team 10 opens GATE_3 execution)

1. Current active package closure is complete at `GATE_8 PASS` with Team 70 As-Made closure package accepted.
2. `S002-P002` spec chain is formally open and approved for execution path (`GATE_0..GATE_2`, with Team 100 authority at GATE_2).
3. WSM is synchronized to `S002-P002` as active program before execution mandates are issued.

## 4) Locked Execution Boundaries for Team 10

1. No gate-owner drift is allowed.
2. `GATE_7`: Team 90 is gate owner; human authority is Nimrod (Team 00); MCP evidence is advisory only.
3. `GATE_8`: lifecycle completion only on Team 90 closure PASS.
4. Team 61 controls repo-automation lane only.
5. Team 60 controls runtime/platform and signing-key custody only.

## 5) First-Cycle Deliverables Required from Team 10

1. `TEAM_10_S002_P002_MCP_QA_TRANSITION_WORK_PACKAGE_DEFINITION_v1.0.0.md`
- WP-A (Hybrid Integration) and WP-B (Controlled Agentic Expansion)
- explicit gate chain and owners

2. `TEAM_10_S002_P002_MCP_QA_TRANSITION_GATE3_EXECUTION_PLAN_v1.0.0.md`
- G3.1..G3.9 orchestration plan
- mandatory G3.5 checkpoint definition

3. `TEAM_10_TO_TEAM_61_S002_P002_MCP_QA_AUTOMATION_ACTIVATION_v1.0.0.md`
- repo automation mandates (CI, tooling integration, evidence generation hooks)

4. `TEAM_10_TO_TEAM_60_S002_P002_MCP_QA_RUNTIME_AND_SIGNING_ACTIVATION_v1.0.0.md`
- runtime hardening + Ed25519 key custody + signing service setup mandates

5. `TEAM_10_TO_TEAM_50_S002_P002_MCP_QA_HYBRID_QA_ACTIVATION_v1.0.0.md`
- hybrid parity runs (MCP + Selenium safety net)

6. `TEAM_10_TO_TEAM_90_S002_P002_MCP_EVIDENCE_VALIDATION_PROTOCOL_ACTIVATION_v1.0.0.md`
- verification checkpoints for GATE_5/GATE_6 materialization evidence

## 6) Evidence Contract Enforcement (execution-start requirement)

Every `MATERIALIZATION_EVIDENCE.json` submitted in this program must include:
1. provenance tag (`TARGET_RUNTIME` | `LOCAL_DEV_NON_AUTHORITATIVE` | `SIMULATION`)
2. required signature block (`Ed25519`, `key_id`, `signature_base64`, `signed_payload_sha256`, `signed_at_utc`, `signed_by_team`)
3. gate context and traceable artifact path

## 7) Response Required from Team 10

Return one canonical response artifact:
`TEAM_10_TO_TEAM_190_S002_P002_MCP_QA_TRANSITION_ACTIVATION_ACK_v1.0.0.md`

Required fields in response:
1. trigger readiness status (`READY` | `WAITING_ON_TRIGGER`)
2. planned issue date for first-cycle mandate set
3. confirmation of adherence to locked gate ownership and evidence signature contract

---

**log_entry | TEAM_190 | S002_P002_MCP_QA_TRANSITION_ACTIVATION_PROMPT | ISSUED_TO_TEAM_10 | 2026-03-07**
