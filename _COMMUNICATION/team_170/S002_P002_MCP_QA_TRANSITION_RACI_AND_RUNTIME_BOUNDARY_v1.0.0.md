# S002_P002_MCP_QA_TRANSITION_RACI_AND_RUNTIME_BOUNDARY_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** S002_P002_MCP_QA_TRANSITION_RACI_AND_RUNTIME_BOUNDARY  
**from:** Team 170 (Spec & Governance)  
**date:** 2026-03-07  
**in_response_to:** TEAM_190_TO_TEAM_170_S002_P002_MCP_QA_TRANSITION_LLD400_ACTIVATION_PROMPT_v1.0.0

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GATE_1_PREPARATION |
| phase_owner | Team 170 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1. Purpose

Define RACI and runtime boundaries for S002-P002 (MCP-QA transition): Team 61 repo-automation vs Team 60 runtime/platform, and Team 90 validation and WSM ownership in GATE_5..GATE_8.

---

## 2. Team 61 — Repo-Automation Boundaries

| Dimension | Boundary |
|-----------|----------|
| **Scope** | `agents_os_v2/`, `.github/workflows/`, `tests/unit/`, quality tooling configs, quality scan reports, cloud-agent execution artifacts. |
| **Authority** | Create/maintain CI/CD pipelines; run quality scans (e.g. bandit, pip-audit, detect-secrets, mypy, ESLint, npm audit); generate unit tests; Agents_OS V2 orchestration; produce scan and known-bug reports. |
| **Non-authority** | Must not change production application code (`api/`, `ui/`) without Team 10 mandate; must not write canonical `documentation/` directly; **must not approve any gate**; does not replace Team 50 QA/FAV or Team 90 validation authority. |
| **MCP context** | MCP may run in repo/automation lane (e.g. browser automation for scenarios); output is **advisory evidence only**. Team 61 does not issue gate decisions. |

**Enforcement:** Team 10 orchestrates; Team 61 reports to Team 10. No gate-approval capability.

---

## 3. Team 60 — Runtime/Platform Boundaries

| Dimension | Boundary |
|-----------|----------|
| **Scope** | Infrastructure, runtimes, CI/CD platform, **key custody for MATERIALIZATION_EVIDENCE signing** (Ed25519 keys). |
| **Authority** | Signing key lifecycle (generate, store, rotate); producing detached Ed25519 signatures for canonicalized MATERIALIZATION_EVIDENCE payloads. |
| **Non-authority** | **Does not verify** evidence for gate passage; does not approve gates. Verification of signatures and evidence is Team 90 (GATE_5/GATE_6) and Team 190 (constitutional spot-check). |
| **MCP context** | If MCP runs in platform/runtime context, it does not issue GATE_7 PASS/REJECT; key custody remains with Team 60. |

**Enforcement:** Team 60 owns key custody only; verification flow is separate (Team 90, Team 190).

---

## 4. Team 90 — Validation and WSM Ownership (GATE_5..GATE_8)

| Gate | Team 90 role | WSM update |
|------|--------------|------------|
| GATE_5 | Execute DEV_VALIDATION; verify MATERIALIZATION_EVIDENCE (including signature per signature profile). | Team 90 updates WSM on closure. |
| GATE_6 | Execute ARCHITECTURAL_DEV_VALIDATION; **approval authority: Team 100**. Team 90 runs process and updates WSM. | Team 90 updates WSM on closure. |
| GATE_7 | Prepare human-facing scenarios; receive human decision (Nimrod/Team 00); normalize to canonical decision artifact; route PASS/REJECT; **MCP cannot issue GATE_7 PASS/REJECT**. | Team 90 updates WSM on closure. |
| GATE_8 | Execute DOCUMENTATION_CLOSURE (AS_MADE_LOCK); lifecycle not complete without GATE_8 PASS. | Team 90 updates WSM on closure. |

**WSM ownership (deterministic):** Gates 5–8: Team 90 is the sole updater of WSM at gate closure/transition per WSM_OWNER_MATRIX_GATES_0_8_v1.0.0.md.

---

## 5. RACI Summary (GATE_5..GATE_8)

| Activity | Team 61 | Team 60 | Team 90 | Team 100 | Human (Team 00) |
|----------|---------|---------|---------|----------|-----------------|
| Produce advisory MCP evidence | C | — | — | — | — |
| Key custody / signing | — | R/A | — | — | — |
| Verify evidence & signature (G5/G6) | — | — | R/A | — | — |
| GATE_6 architectural approval | — | — | C | R/A | — |
| GATE_7 scenario prep & routing | — | — | R/A | — | — |
| GATE_7 PASS/REJECT decision | — | — | — | — | R/A |
| GATE_8 execution & WSM | — | — | R/A | — | — |

R = Responsible, A = Accountable, C = Consulted.

---

## 6. References

1. `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`
2. `_COMMUNICATION/team_170/WSM_OWNER_MATRIX_GATES_0_8_v1.0.0.md`
3. `_COMMUNICATION/team_170/S002_P002_MATERIALIZATION_EVIDENCE_SIGNATURE_PROFILE_v1.0.0.md`
4. `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DECISION_MCP_QA_TRANSITION_v1.1.0.md`

---

**log_entry | TEAM_170 | S002_P002_MCP_QA_TRANSITION_RACI_AND_RUNTIME_BOUNDARY_v1.0.0 | PRODUCED | 2026-03-07**
