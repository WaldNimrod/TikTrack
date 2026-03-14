---
project_domain: SHARED (TIKTRACK + AGENTS_OS)
id: PHOENIX_REALITY_ATLAS_v1.0.0
from: Team 190 (Constitutional Architectural Validator)
to: Team 00 (Chief Architect)
cc: Team 100, Team 170, Nimrod
date: 2026-03-14
status: SUBMITTED
gate_id: GOVERNANCE_PROGRAM
in_response_to: RFM-190-04
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | N/A |
| work_package_id | N/A |
| task_id | RFM-190-04 |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 190 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1) LOD400 Team Map — Ground Truth

### 1.1 Active team inventory (canonical)

Canonical team map and domain split are defined in:
`documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md:17-31`

Active teams found in current SSOT:
- Management/authority lane: Team 00, Team 100, Team 170, Team 190
- Execution lane: Team 10, Team 20, Team 30, Team 40, Team 50, Team 51, Team 60, Team 61, Team 70, Team 191
- Validation lane: Team 90, Team 190

### 1.2 Signature/approval authority (who signs what)

- Team 00: final product authority (`documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md:112`)
- Team 100: architectural approval authority at GATE_2 and GATE_6 (`documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md:104`, `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md:108`)
- Team 190: gate owner for GATE_0..GATE_2 and constitutional validator (`documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md:102-105`, `documentation/docs-governance/01-FOUNDATIONS/07_TEAM_190_CONSTITUTION.md:28-33`)
- Team 90: gate owner for GATE_5..GATE_8 (`documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md:107-110`)

### 1.3 Domain split (operational lock)

- Teams 10/20/30/40/50: TIKTRACK + SHARED only
- Team 61: AGENTS_OS-only development lane
- Team 60: cross-domain platform
- Teams 90/190: cross-domain validators
- Team 191: child of Team 190 for Git governance operations only

Evidence:
- `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md:11`
- `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md:32`

### 1.4 Grey teams check (e.g., Team 80)

- No Team 80 registration found in active governance/docs scan.
- Evidence query returned empty: `rg -n "\b(Team 80|team_80|TEAM_80)\b" documentation/docs-governance _COMMUNICATION .cursorrules 00_MASTER_INDEX.md`

Verdict: Team 80 is not an active canonical team (current state).

---

## 2) 8-Gate Pipeline — Owner/Executor/Input/Output Matrix

Canonical baseline:
- Gate enum/authority: `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md:100-110`
- Operational details: `documentation/docs-governance/04-PROCEDURES/TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md:31-120`
- Completeness audit: `documentation/docs-governance/01-FOUNDATIONS/GATE_LIFECYCLE_DESCRIPTION_AND_OWNERS_v1.1.0.md:64-77`

| Gate | Owner (authority) | Executor lane | Required input | Signed output / evidence |
|---|---|---|---|---|
| GATE_0 | Team 190 | Team 190 | Scope brief + SSM/WSM context | Gate validation result + WSM update (`GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.1.0.md:20-24`) |
| GATE_1 | Team 190 | Team 170 prepares, Team 190 validates | LLD400/spec package | Validation result + correction cycle (if needed) + AUTO_TESTABLE/HUMAN_ONLY classification (`GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.1.0.md:23-24`, `67-85`) |
| GATE_2 | Team 190 (execution), Team 100 (approval) | Team 190 + Team 100 | Architect submission package | Architect decision + handoff to Team 10 + initial G7 residual shell (`GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.1.0.md:24-27`) |
| GATE_3 | Team 10 | Team 10 + impl teams | GATE_2 PASS handoff | GATE_3 exit package to QA; WSM update (`TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md:31-54`) |
| GATE_4 | Team 10 | Team 50 (TIKTRACK) / Team 51 (AGENTS_OS fast lane) | GATE_3 exit package | QA report (smoke/readiness) (`TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md:57-66`, `GATES_4_5_6_7_GOVERNANCE_POLICY_v1.0.0.md:15-25`) |
| GATE_5 | Team 90 | Team 90 validation | GATE_4 PASS | `G5_AUTOMATION_EVIDENCE.json` + deterministic PASS/BLOCK (`GATES_4_5_6_7_GOVERNANCE_POLICY_v1.0.0.md:27-39`) |
| GATE_6 | Team 90 (execution), Team 100 (approval) | Team 90 + Team 100 | GATE_5 PASS | `G6_TRACEABILITY_MATRIX.md` + decision + route classification (`GATES_4_5_6_7_GOVERNANCE_POLICY_v1.0.0.md:40-50`) |
| GATE_7 | Team 90 (owner), Nimrod/Team 00 (human authority) | Team 90 orchestrates, human signs | GATE_6 PASS + HUMAN_ONLY residuals | Human decision artifact + completed `G7_HUMAN_RESIDUALS_MATRIX.md` (`GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.1.0.md:23-29`, `70-83`) |
| GATE_8 | Team 90 | Team 70 (TIKTRACK docs), Team 170 (AGENTS_OS fast closure) | GATE_7 PASS | AS_MADE closure + DOCUMENTATION_CLOSED in WSM (`TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md:110-119`) |

---

## 3) Operational Scenario Matrix (Implemented Protocol)

### 3.1 Happy Path (0→8)

Protocol exists and is complete:
- lifecycle complete only on GATE_8 PASS (`documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md:167`)
- no GATE_5 before GATE_4 PASS (`documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md:176`)

### 3.2 Reject Loop

- Canonical reject loops are deterministic via route classes:
  - `DOC_ONLY_LOOP`
  - `CODE_CHANGE_REQUIRED`
  - `ESCALATE_TO_TEAM_00`
- Sources:
  - `documentation/docs-governance/04-PROCEDURES/GATES_4_5_6_7_GOVERNANCE_POLICY_v1.0.0.md:49-50`
  - `documentation/docs-governance/05-CONTRACTS/GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.1.0.md:100-105`
  - orchestrator runtime routing table in code: `agents_os_v2/orchestrator/pipeline.py:82-135`

Special note (question text used Team 190 at GATE_5):
- Canonically, GATE_5 owner is Team 90 (not Team 190).
- Team 190 can run non-gate constitutional validation by mandate (`documentation/docs-governance/01-FOUNDATIONS/07_TEAM_190_CONSTITUTION.md:35-43`).

### 3.3 Hotfix Lane

Implemented as fast-track overlay (not a new gate model):
- canonical gate_id remains GATE_0..8; fast mode is `track_mode`
- AGENTS_OS default fast-track; TIKTRACK optional
- source: `documentation/docs-governance/04-PROCEDURES/FAST_TRACK_EXECUTION_PROTOCOL_v1.2.0.md:21-25`, `18-20`, `41-43`

### 3.4 Drift Detected (SSM/WSM contradictions)

Implemented controls:
- domain mismatch at GATE_0 is BLOCK_FOR_FIX (`documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md:94`)
- context-boundary freeze on stage/program/wp/domain changes (`documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md:185-207`)
- push-time deterministic drift guards: WSM/registry sync + snapshot drift (`documentation/docs-governance/01-FOUNDATIONS/PORTFOLIO_WSM_SYNC_RULES_v1.0.0.md:33-39`)

### 3.5 Human Override (beyond GATE_7)

Exists in current runtime:
- GATE_2 and GATE_6 approvals are human-approval gates in pipeline runtime (WAITING gates):
  - `agents_os_v2/orchestrator/pipeline.py:46-47`
  - `agents_os_v2/orchestrator/pipeline.py:58-59`
  - `pipeline_run.sh:8` (approve command)
- GATE_7 remains explicit human UI sign-off (`GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.1.0.md:32-35`)

---

## 4) Artifact Taxonomy — _COMMUNICATION Reality Scan

### 4.1 File formats produced in practice

Top file-type counts under `_COMMUNICATION`:
- `md`: 4542
- `js`: 403
- `svg`: 234
- `html`: 112
- `log`: 83
- `json`: 76
- `css`: 51

Evidence command:
`find _COMMUNICATION -type f | awk -F. ...`

### 4.2 Engine/runtime artifacts (Agents_OS v2)

Observed operational artifacts:
- state: `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json`, `_COMMUNICATION/agents_os/pipeline_state_agentsos.json`, `_COMMUNICATION/agents_os/pipeline_state.json`
- snapshot: `_COMMUNICATION/agents_os/STATE_SNAPSHOT.json`
- prompts: gate prompt files under `_COMMUNICATION/agents_os/prompts/`

Evidence: `find _COMMUNICATION/agents_os -maxdepth 3 -type f`

### 4.3 Ghost/residual risk findings

#### Finding RFM4-F01 (HIGH): Observer parser drift bug
- Symptom: observer can output wrong stage (`unknown`) and wrong operational_state token.
- Root cause: regex expects `current_stage_id` and naive `CURRENT_OPERATIONAL_STATE` capture.
- Evidence:
  - parser logic: `agents_os_v2/observers/state_reader.py:66-71`
  - real WSM field is `active_stage_id`: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md:94`
- Impact: architect-facing state snapshot can be wrong.

#### Finding RFM4-F02 (MEDIUM): Prompt residue in runtime prompt folder
- Multiple timestamped `test_cursor_prompt_*.md` files coexist with canonical gate prompts.
- Evidence: `_COMMUNICATION/agents_os/prompts` inventory includes >10 test prompt snapshots.
- Impact: no direct engine break, but high operator confusion and date-lint push noise risk.

#### Finding RFM4-F03 (MEDIUM): Legacy/historical docs mixed in active communication tree
- 200 active-path markdown files (excluding archive folders) are missing normalized date header in first 60 lines.
- Concentration in `_COMMUNICATION/_Architects_Decisions/*` and `_COMMUNICATION/_ARCHITECT_INBOX/*`.
- Impact: repeated date-lint push friction and governance drift/noise.

---

## 5) Strategic Insights + Recommendations

### 5.1 Immediate (P1)

1. Fix observer regex to read `active_stage_id` deterministically and parse state block via table-key extraction (not free-text regex).
   - Why: prevents false architecture decisions on wrong stage/state.
   - Evidence basis: RFM4-F01.

2. Split runtime prompt folder into canonical+ephemeral:
   - canonical: `GATE_*_prompt.md`, `*_mandates.md`
   - ephemeral: `test_cursor_prompt_*` moved to archival/test subfolder excluded from lint scope.
   - Why: removes operator ambiguity and push-lint friction.

### 5.2 Short-term (P2)

3. Add machine-checkable artifact taxonomy contract for `_COMMUNICATION`:
   - enforce required date headers only on active governance/operational classes
   - auto-mark historical bundles with `historical_record: true`.

4. Add single machine-readable gate event ledger (JSONL) mirrored from WSM updates.
   - Why: reduces reliance on large markdown log parsing, improves audit automation.

### 5.3 Clarification requests to Chief Architect (required for lock)

1. Confirm final signer model for TIKTRACK at GATE_2/GATE_6 where both canonical docs and runtime code mention Team 100 authority but runtime owner override routes to Team 00 in `agents_os_v2/config.py:63-68`.
2. Confirm policy for legacy `_COMMUNICATION/_Architects_Decisions/*` documents without normalized date header:
   - keep as immutable historical corpus, or
   - normalize headers to eliminate recurring push blockers.

If not clarified, this remains governance ambiguity risk (MEDIUM).

---

## 6) Final Constitutional Verdict (RFM-190-04)

- Operating model is largely implemented and evidence-backed.
- Core gate authority model, domain split, fast-track overlay, and rejection loops are structurally coherent.
- Critical corrective action required on observer parsing accuracy (RFM4-F01) before treating state snapshots as architectural-grade truth.

**overall_result:** PASS_WITH_MANDATORY_REMEDIATION

---

log_entry | TEAM_190 | PHOENIX_REALITY_ATLAS_v1.0.0 | RFM_190_04_SUBMITTED | PASS_WITH_MANDATORY_REMEDIATION | 2026-03-14
