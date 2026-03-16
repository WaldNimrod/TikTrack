**ACTIVE: TEAM_90 (Dev-Validator)**  gate=G3_5 | wp=S002-P005-WP003 | stage=S002 | 2026-03-16

---

# G3.5 — Validate Work Plan  [FIRST RUN]

**WP:** `S002-P005-WP003`

Validate this work plan for implementation readiness.
Check: completeness, team assignments, deliverables, test coverage.

## MANDATORY: route_recommendation

**If FAIL — include at the top of your response:**

```
route_recommendation: doc
```  ← plan has format/governance/wording issues only
```
route_recommendation: full
``` ← plan has structural/scope/logic problems

Classification:
- `doc`: blockers are grammar, missing paths, credential text, format-only
- `full`: scope unclear, wrong team assignments, missing deliverables, logic errors

This field drives automatic pipeline routing. Missing = manual block.

Respond with: PASS or FAIL + blocking findings.

## Work Plan

---
project_domain: AGENTS_OS
id: TEAM_10_S002_P005_WP003_G3_PLAN_WORK_PLAN_v1.0.0
from: Team 10 (Execution Orchestrator)
to: Team 61, Team 51
cc: Team 00, Team 100, Team 170, Team 190
date: 2026-03-16
status: ACTIVE
gate_id: GATE_3
program_id: S002-P005
work_package_id: S002-P005-WP003
scope: AOS State Alignment & Governance Integrity — G3 Build Work Plan
authority_mode: TEAM_10_GATE_3_OWNER
spec_source: TEAM_170_S002_P005_WP003_LLD400_v1.0.0.md
---

# Team 10 | S002-P005-WP003 — G3 Work Plan (AOS State Alignment)

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP003 |
| task_id | G3_PLAN |
| gate_id | GATE_3 |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
| project_domain | AGENTS_OS |

---

## 1. Approved Spec (Locked)

**Source:** `_COMMUNICATION/team_170/TEAM_170_S002_P005_WP003_LLD400_v1.0.0.md`

S002-P005-WP003: AOS State Alignment & Governance Integrity. Align pipeline state (CLI, JSON files, Python state_reader), dashboard UI provenance badges, fallback removal (CS-03), gate contradiction invariant (CS-02), Teams dual-domain rows (SA-01), snapshot freshness (CS-08). No HTTP API — contracts are CLI commands, static JSON fetch, and Python module entry points.

---

## 2. Files to Create/Modify per Team

**Note:** AGENTS_OS domain — execution scope is Team 61 (implementation), QA scope is Team 51. No Team 20/30 (TIKTRACK-only). Contract verification is Team 61 pre-implementation step.

### 2.1 Team 61 — Contract Verify (Pre-Implementation)

| Action | File | Purpose |
|--------|------|---------|
| **READ** | `_COMMUNICATION/team_170/TEAM_170_S002_P005_WP003_LLD400_v1.0.0.md` | LLD400 spec |
| **READ** | `documentation/docs-agents-os/03-CLI-REFERENCE/PIPELINE_STATE_AND_BEHAVIOR_v1.0.0.md` | Existing CLI behavior |
| **VERIFY** | `pipeline_run.sh` | Confirm `--domain agents_os`, `pass`, `fail`, `status`, `new` commands exist |
| **VERIFY** | `_COMMUNICATION/agents_os/pipeline_state_agentsos.json`, `pipeline_state_tiktrack.json` | Schema matches §3.3 |
| **OUTPUT** | `_COMMUNICATION/team_61/TEAM_61_S002_P005_WP003_CONTRACT_VERIFY_v1.0.0.md` | Brief note: confirmed contracts, gaps (if any) |

### 2.2 Team 61 — Implementation

| Action | File | Purpose |
|--------|------|---------|
| **MODIFY** | `agents_os/ui/js/pipeline-dashboard.js` | P0-01 provenance badges; CS-03 error panel; data-testid anchors |
| **MODIFY** | `agents_os/ui/js/pipeline-roadmap.js` | P0-01 provenance badges; CS-05 conflict banner |
| **MODIFY** | `agents_os/ui/js/pipeline-teams.js` | P0-01 provenance badges; P0-05 dual-domain rows (SA-01) |
| **MODIFY** | `agents_os/ui/js/pipeline-state.js` | CS-03 loadDomainState failure → PRIMARY_STATE_READ_FAILED; remove legacy fallback |
| **MODIFY** | `agents_os/ui/PIPELINE_TEAMS.html` | DOM anchors per §4.3 (data-testid) |
| **MODIFY** | `agents_os/ui/PIPELINE_DASHBOARD.html` | DOM anchors per §4.3 |
| **MODIFY** | `agents_os/ui/PIPELINE_ROADMAP.html` | DOM anchors per §4.3 |
| **MODIFY** | `agents_os_v2/orchestrator/pipeline.py` | CS-02 gate contradiction fix |
| **MODIFY** | `agents_os_v2/orchestrator/state.py` | CS-03/CS-04 fallback removal; NONE/COMPLETE sentinel |
| **MODIFY** | `agents_os/ui/js/pipeline-config.js` | AC-CS-06 EXPECTED_FILES idle state |
| **REFERENCE** | `agents_os_v2/observers/state_reader.py` | STATE_SNAPSHOT.json producer |

### 2.3 Team 51 — QA

| Action | File | Purpose |
|--------|------|---------|
| **OUTPUT** | `_COMMUNICATION/team_51/TEAM_51_S002_P005_WP003_QA_REPORT_v1.0.0.md` | QA report per TEAM_100_TO_TEAM_51_STATE_ALIGNMENT_WP003_QA_MANDATE |

---

## 3. Execution Order with Dependencies

```
Step 1: Team 61 — Contract verify (BLOCKING for implementation)
        ↓
Step 2: Team 61 — Implementation (P0 first, then P1)
        ↓
Step 3: Team 51 — QA/FAV per mandate
        ↓
Step 4: GATE_4 submission to Team 90
```

