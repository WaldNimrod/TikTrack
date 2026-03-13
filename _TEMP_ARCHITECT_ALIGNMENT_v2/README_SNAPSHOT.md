# README_SNAPSHOT — RFM-190-02 (Agents_OS v2 Alignment Package)

**id:** RFM-190-02  
**from:** Team 190 (Constitutional Validator)  
**to:** Chief Architect (Team 00)  
**cc:** Team 100, Team 170, Nimrod  
**date:** 2026-03-13  
**status:** SUBMITTED_READY  
**priority:** CRITICAL

---

## 1) Package Purpose

Temporary audit bundle for architectural alignment on Agents_OS v2.  
The folder contains:
1. A deterministic summary report.
2. A dedicated deep-dive core-logic report.
3. A State-of-the-Union drift report.
4. Snapshot copies of canonical governance/docs/code/log evidence.

---

## 2) Main Reports (this folder root)

| File | Purpose |
|---|---|
| `RFM_190_02_SUMMARY_REPORT_v1.0.0.md` | Executive report for Team Mapping 2026, ownership, and validation conclusions. |
| `AGENTS_OS_V2_CORE_LOGIC_v1.0.0.md` | Deterministic deep dive: loop, LOD400 contract, SSM/WSM consumption. |
| `STATE_OF_THE_UNION_V2_DRIFT_REPORT_v1.0.0.md` | Runtime/legacy split and architectural debt register (evidence-by-path). |

---

## 3) Copied Evidence Set

All copied assets are under: `copies/`

### 3.1 Team mapping / authority (requested evidence)
- `copies/documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`
- `copies/documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md`
- `copies/documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md`

### 3.2 SSM/WSM and contracts
- `copies/documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md`
- `copies/documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
- `copies/documentation/docs-governance/05-CONTRACTS/GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.1.0.md`
- `copies/documentation/docs-governance/05-CONTRACTS/GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.1.0.md`
- `copies/documentation/docs-governance/04-PROCEDURES/FAST_TRACK_EXECUTION_PROTOCOL_v1.2.0.md`

### 3.3 Agents_OS v2 core code (mechanics evidence)
- `copies/agents_os_v2/orchestrator/pipeline.py`
- `copies/agents_os_v2/orchestrator/gate_router.py`
- `copies/agents_os_v2/context/injection.py`
- `copies/agents_os_v2/observers/state_reader.py`
- `copies/agents_os_v2/config.py`
- `copies/pipeline_run.sh`

### 3.4 Identity/role context used by engine
- `copies/agents_os_v2/context/identity/team_10.md`
- `copies/agents_os_v2/context/identity/team_61.md`
- `copies/agents_os_v2/context/identity/team_100.md`
- `copies/agents_os_v2/context/identity/team_170.md`
- `copies/agents_os_v2/context/identity/team_190.md`

### 3.5 Runtime proof logs (v2 in action)
- `copies/_COMMUNICATION/agents_os/pipeline_state.json`
- `copies/_COMMUNICATION/agents_os/STATE_SNAPSHOT.json`
- `copies/_COMMUNICATION/agents_os/prompts/G3_PLAN_prompt.md`
- `copies/_COMMUNICATION/agents_os/prompts/GATE_5_prompt.md`

### 3.6 ADR / architectural directives
- `copies/_COMMUNICATION/_Architects_Decisions/ADR_026_AGENT_OS_FINAL_VERDICT.md`
- `copies/_COMMUNICATION/_Architects_Decisions/ADR_027_TEAM_100_TEAM_00_ARCHITECTURAL_CHARTER.md`
- `copies/_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0.md`
- `copies/_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_AGENTS_OS_FAST_TRACK_DEFAULT_v1.0.0.md`
- `copies/_COMMUNICATION/team_100/TEAM_100_AGENTS_OS_V2_MASTER_PLAN_v1.0.0.md`
- `copies/_COMMUNICATION/team_00/TEAM_00_S003_P001_DATA_MODEL_VALIDATOR_LOD400_v1.0.0.md`
- `copies/_COMMUNICATION/team_00/TEAM_00_S003_P001_DATA_MODEL_VALIDATOR_LOD400_ADDENDUM_v1.0.0.md`
- `copies/_COMMUNICATION/team_00/TEAM_00_S003_P002_TEST_TEMPLATE_GENERATOR_LOD400_v1.0.0.md`

---

## 4) Clarification on “AGENTS_OS_V2_CORE_LOGIC” evidence

No standalone canonical file named exactly `AGENTS_OS_V2_CORE_LOGIC` exists in repository authorities.  
To satisfy deterministic evidence requirements, this package includes:
- `AGENTS_OS_V2_CORE_LOGIC_v1.0.0.md` (code-derived deterministic snapshot), and
- direct code evidence files listed in section 3.3.

---

**log_entry | TEAM_190 | RFM_190_02 | README_SNAPSHOT_PREPARED | 2026-03-13**
