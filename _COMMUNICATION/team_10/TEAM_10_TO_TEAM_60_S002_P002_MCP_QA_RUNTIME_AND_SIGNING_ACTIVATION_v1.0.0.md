# TEAM_10 → TEAM_60 | S002-P002 MCP-QA — Runtime and Signing Activation Mandate (v1.0.0)

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_10_TO_TEAM_60_S002_P002_MCP_QA_RUNTIME_AND_SIGNING_ACTIVATION_v1.0.0  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 60 (Runtime / Platform & Signing-Key Custody)  
**cc:** Team 190, Team 50, Team 61, Team 90  
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

Team 60 controls **runtime/platform** and **signing-key custody only**. No drift into repo-automation content ownership or gate ownership.

---

## 2) Mandate — Runtime and Signing Activation

Execute the following and report completion to Team 10 with **evidence_path** for each deliverable:

1. **Runtime hardening**  
   Harden runtime/platform so that S002-P002 MCP-QA transition runs (e.g. MCP + Selenium parity) can execute in a well-defined environment. Document target runtime identity and any constraints (e.g. TARGET_RUNTIME vs LOCAL_DEV_NON_AUTHORITATIVE) for Evidence Contract provenance.

2. **Ed25519 key custody**  
   Establish or confirm Ed25519 key custody for the program: keys used for signing MATERIALIZATION_EVIDENCE.json payloads are under Team 60 control; access and usage are documented and traceable.

3. **Signing service setup**  
   Provide or configure a signing service that produces the **signature block** required by the Evidence Contract:
   - `Ed25519`, `key_id`, `signature_base64`, `signed_payload_sha256`, `signed_at_utc`, `signed_by_team`  
   So that artifacts (e.g. from Team 61 evidence hooks) can be signed and submitted with valid MATERIALIZATION_EVIDENCE.json.

---

## 3) Evidence Contract (reminder)

Every MATERIALIZATION_EVIDENCE.json in this program must include:
- **provenance tag:** `TARGET_RUNTIME` | `LOCAL_DEV_NON_AUTHORITATIVE` | `SIMULATION`
- **signature block** (Ed25519, key_id, signature_base64, signed_payload_sha256, signed_at_utc, signed_by_team)
- **gate context** and **traceable artifact path**

Team 60 is responsible for the **signing capability** and **key custody**; Team 61 integrates calling this from repo/CI.

---

## 4) Deliverables and Response

- **Deliverables:** Runtime hardening (documented); Ed25519 key custody (documented); signing service setup (operational and documented).
- **Response:** Completion report to Team 10 with artifact paths (evidence_path). Report format: id, status, owner, artifact_path, verification_report, verification_type, verified_by, closed_date (per §2-style evidence).

---

## 5) Reference

- Execution plan: `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_10_S002_P002_MCP_QA_TRANSITION_GATE3_EXECUTION_PLAN_v1.0.0.md` (G3.4 step; G3.5 checkpoint depends on this).

---

**log_entry | TEAM_10 | TO_TEAM_60 | S002_P002_MCP_QA_RUNTIME_AND_SIGNING_ACTIVATION | 2026-03-07**
