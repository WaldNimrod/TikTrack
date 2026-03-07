# TEAM_10 → TEAM_61 | S002-P002 MCP-QA — Automation Activation Mandate (v1.0.0)

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_10_TO_TEAM_61_S002_P002_MCP_QA_AUTOMATION_ACTIVATION_v1.0.0  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 61 (Repo Automation)  
**cc:** Team 190, Team 50, Team 60, Team 90  
**date:** 2026-03-07  
**status:** MANDATE_ACTIVE  
**program_id:** S002-P002  
**gate_id:** GATE_3_PREPARATION  
**authority:** TEAM_190_TO_TEAM_10_S002_P002_MCP_QA_TRANSITION_ACTIVATION_PROMPT_v1.0.0.md §5  

---

## Mandatory Identity Header

| Field | Value |
|-------|------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| gate_id | GATE_3_PREPARATION |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1) Boundary (Locked)

Team 61 controls **repo-automation lane only**. No drift into runtime custody or gate ownership.

---

## 2) Mandate — Repo Automation Activation

Execute the following and report completion to Team 10 with **evidence_path** for each deliverable:

1. **CI integration**  
   Ensure CI pipeline (or equivalent) supports S002-P002 program context: runs relevant to MCP-QA transition are triggerable and results are traceable (e.g. artifact paths, gate context).

2. **Tooling integration**  
   Integrate tooling required for MCP-QA hybrid parity (e.g. MCP client/server tooling, Selenium/runner hooks) into the repo automation lane so that evidence-generation and parity runs can be invoked from a single orchestration point where applicable.

3. **Evidence generation hooks**  
   Provide hooks or scripts that produce **MATERIALIZATION_EVIDENCE.json** conforming to the Evidence Contract:
   - **provenance tag:** `TARGET_RUNTIME` | `LOCAL_DEV_NON_AUTHORITATIVE` | `SIMULATION`
   - **signature block:** `Ed25519`, `key_id`, `signature_base64`, `signed_payload_sha256`, `signed_at_utc`, `signed_by_team`
   - **gate context** and **traceable artifact path**

   Team 60 owns key custody and signing service; Team 61 integrates the **calling** of signing and the **writing** of evidence artifacts in the repo/CI lane.

---

## 3) Deliverables and Response

- **Deliverables:** CI integration, tooling integration, evidence-generation hooks as above.
- **Response:** Completion report to Team 10 with artifact paths (evidence_path) for each item. Report format: id, status, owner, artifact_path, verification_report, verification_type, verified_by, closed_date (per §2-style evidence).

---

## 4) Reference

- Execution plan: `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_10_S002_P002_MCP_QA_TRANSITION_GATE3_EXECUTION_PLAN_v1.0.0.md` (G3.3 step; G3.5 checkpoint depends on this).

---

**log_entry | TEAM_10 | TO_TEAM_61 | S002_P002_MCP_QA_AUTOMATION_ACTIVATION | 2026-03-07**
