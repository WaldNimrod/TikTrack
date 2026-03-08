# TEAM_10 → TEAM_50 | S002-P002 MCP-QA — Hybrid QA Activation Mandate (v1.0.0)

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_10_TO_TEAM_50_S002_P002_MCP_QA_HYBRID_QA_ACTIVATION_v1.0.0  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 50 (QA)  
**cc:** Team 190, Team 60, Team 61, Team 90  
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

## 1) Mandate — Hybrid Parity Runs (MCP + Selenium Safety Net)

Execute **hybrid parity runs** that combine:
- **MCP** — tooling and flows validated via MCP (per LLD400 and architect decision for S002-P002).
- **Selenium safety net** — existing or designated Selenium-based checks that provide a regression/parity baseline.

Objective: Ensure MCP-based validation and Selenium-based validation are aligned and both feed into evidence that can be submitted for GATE_5/GATE_6 materialization (per Team 90 protocol when activated).

---

## 2) Evidence Contract (mandatory)

Every **MATERIALIZATION_EVIDENCE.json** produced in this program must include:
1. **provenance tag:** `TARGET_RUNTIME` | `LOCAL_DEV_NON_AUTHORITATIVE` | `SIMULATION`
2. **signature block:** `Ed25519`, `key_id`, `signature_base64`, `signed_payload_sha256`, `signed_at_utc`, `signed_by_team`
3. **gate context** and **traceable artifact path**

Team 50 is responsible for producing QA evidence that complies with this contract; signing is provided by Team 60 and integrated via Team 61 where applicable.

---

## 3) Deliverables and Response

- **Deliverables:** Hybrid parity runs (MCP + Selenium) executed and documented; evidence artifacts (where produced) conform to Evidence Contract.
- **Response:** Completion report to Team 10 with evidence_path for each deliverable. Report format: id, status, owner, artifact_path, verification_report, verification_type, verified_by, closed_date (per §2-style evidence).

---

## 4) Sequencing

This mandate is **unlocked after G3.5 PASS** (automation and runtime readiness sign-off). Team 10 will confirm when G3.5 is passed and Team 50 may then proceed (G3.6 step).

---

## 5) Reference

- Execution plan: `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_10_S002_P002_MCP_QA_TRANSITION_GATE3_EXECUTION_PLAN_v1.0.0.md` (G3.6 step).

---

**log_entry | TEAM_10 | TO_TEAM_50 | S002_P002_MCP_QA_HYBRID_QA_ACTIVATION | 2026-03-07**
