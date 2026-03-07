---
**project_domain:** AGENTS_OS
**id:** AGENTS_OS_PIPELINE_ORCHESTRATOR_LOD200_ARCHITECTURAL_CONCEPT_v1.0.0
**gate_id:** GATE_0
**architectural_approval_type:** SPEC
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GATE_0 |
| phase_owner | Team 100 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
| project_domain | AGENTS_OS |

---

# S002-P002 — AGENTS_OS PIPELINE ORCHESTRATOR: ARCHITECTURAL CONCEPT (LOD200) v1.0.0

---

## 1) Strategic Context

### Problem

After S002-P001 completes, the Agents_OS domain will have two fully automated validators:
- **Spec Validator** (WP001): validates LOD200/LLD400 spec submissions (170→190 flow)
- **Execution Validator** (WP002): validates work package execution submissions (10→90 flow)

However, **invocation of these validators is manual**: teams must coordinate submissions, run the validators by hand, and route results. The gate progression process requires human orchestration at every step.

### Solution

**S002-P002 builds the Pipeline Orchestrator**: a lightweight event-driven layer that monitors submission activity and automatically invokes the correct validator at the correct gate. Humans remain in the approval loop — the orchestrator *proposes* results; approval decisions remain with authorized humans.

### Scope Boundary

This program operates **within the Agents_OS domain only**. It does not change TikTrack runtime code, SSM structure, or gate approval authority. It automates the mechanical parts of gate invocation, not the decision-making.

---

## 2) Program Structure

### Single Work Package

This program contains **one work package**:

```
S002-P002
└── S002-P002-WP001 — Pipeline Orchestrator Core
    ├── Gate trigger listener
    ├── GATE_0 automation (spec validator invocation)
    ├── GATE_4 automation (pre-QA invocation)
    ├── GATE_6 automation (execution reality-check)
    ├── GATE_8 automation (documentation closure)
    └── WSM update proposal engine
```

A second work package (monitoring/dashboard — S002-P002-WP002) is out of scope for Phase 1 and may be proposed in a future LOD200 revision.

---

## 3) Architecture — Four Trigger Modules

### 3.1 Gate Trigger Listener

Watches `_COMMUNICATION/_ARCHITECT_INBOX/` for new submission artifacts. Identifies gate type from submission identity header (`gate_id` field). Dispatches to the appropriate trigger module.

```
agents_os/triggers/gate_listener.py
  on_new_submission(path) → dispatch(gate_id, submission_path)
```

**Trigger strategy (architectural decision — see §7):** File-system polling (5-minute interval). No external dependencies.

### 3.2 GATE_0 Trigger

Invokes the Spec Validator in LOD200 mode on a new LOD200 submission:
```
validation_runner --mode=spec --gate=0 <submission_path>
```
Generates a pre-validation report for Team 190 to review. Does NOT replace Team 190 decision authority.

### 3.3 GATE_4 Trigger

Invokes pre-QA checks on a GATE_3-completed work package. Generates a preliminary QA report to reduce Team 50 manual load.

### 3.4 GATE_6 Trigger

Invokes the Execution Validator in Phase 2 mode against the GATE_5 submission:
```
validation_runner --mode=execution --phase=2 <submission_path>
```
Generates a reality-check diff between GATE_2 approved spec and GATE_5 execution output for Team 100 review.

### 3.5 GATE_8 Trigger

Invokes documentation completeness checks on post-GATE_7 work package. Confirms all required artifacts are present and correctly sealed before GATE_8 closure.

### 3.6 WSM Update Proposal Engine

When any trigger produces a PASS result, the engine generates a **proposed WSM update** (a diff file showing the new CURRENT_OPERATIONAL_STATE values). The gate owner must manually apply the proposal — no automatic WSM writes.

---

## 4) Gate Automation Coverage

| Gate | Automated? | What is automated | What remains human |
|---|---|---|---|
| GATE_0 | ✅ Partial | Spec validator invocation; pre-report generation | Team 190: review report, decide PASS/BLOCK |
| GATE_1 | ✅ Partial | Spec validator on LLD400; pre-report | Team 190: review, decide |
| GATE_2 | ❌ None | — | Team 100: architectural approval — human only |
| GATE_3 | ❌ None | — | Team 10: work package intake — human only |
| GATE_4 | ✅ Partial | Pre-QA check invocation; preliminary report | Team 50: full QA, decide |
| GATE_5 | ✅ Partial | Execution validator TIER E1+E2+LLM invocation | Team 90: review results, decide |
| GATE_6 | ✅ Partial | Reality-check diff vs GATE_2 spec | Team 100: review diff, decide |
| GATE_7 | ❌ None | — | Nimrod: human UX approval — permanent |
| GATE_8 | ✅ Partial | Documentation completeness scan | Team 90: confirm, close |

---

## 5) Artifact Structure

```
agents_os/
├── triggers/                               ← NEW (S002-P002-WP001)
│   ├── __init__.py
│   ├── gate_listener.py                    ← file-system watcher + dispatcher
│   ├── gate0_trigger.py                    ← GATE_0/GATE_1: spec validator invocation
│   ├── gate4_trigger.py                    ← GATE_4: pre-QA invocation
│   ├── gate6_trigger.py                    ← GATE_6: execution reality-check
│   ├── gate8_trigger.py                    ← GATE_8: doc closure scan
│   └── wsm_proposal_engine.py             ← WSM update proposal generation
├── orchestrator/
│   └── pipeline_orchestrator.py           ← NEW: coordinator for all triggers
└── tests/
    └── orchestrator/                       ← NEW: trigger + orchestrator tests
        ├── __init__.py
        ├── test_gate_listener.py
        ├── test_gate_triggers.py
        └── test_wsm_proposal.py
```

**No changes to TikTrack domain. No changes to existing Agents_OS validators.**

---

## 6) Exit Criteria

| Milestone | Criteria |
|---|---|
| WP001 GATE_4 PASS | All 5 trigger modules implemented and unit tested |
| WP001 GATE_5 PASS | Integration test: end-to-end trigger invocation on sample submission |
| WP001 GATE_8 PASS | Documentation closed; S002-P002 complete |

**Program complete when:** S002-P002-WP001 GATE_8 PASS.

---

## 7) Open Architectural Decisions

The following decisions were NOT locked in this LOD200. They must be resolved at GATE_2 or LLD400:

| Decision ID | Question | Status |
|---|---|---|
| D-01 | Trigger mechanism: file-system polling vs. inotify/fsevents vs. explicit submission script? | PROPOSED: polling (simpler, no OS deps); open for review |
| D-02 | WSM consent model: who confirms proposed WSM update — gate owner only, or also Team 100? | OPEN |
| D-03 | GATE_5 partial automation: does the execution validator result automatically open GATE_6, or does Team 90 still manually submit? | OPEN |
| D-04 | Audit log: file-based log in `agents_os/logs/` or integrated into WSM log entries? | PROPOSED: file-based; open for review |

These decisions are presented in the Decision List document (`TEAM_100_AGENTS_OS_NEXT_PROGRAMS_DECISION_LIST_v1.0.0.md`).

---

**log_entry | TEAM_100 | AGENTS_OS_PIPELINE_ORCHESTRATOR_LOD200_ARCHITECTURAL_CONCEPT_v1.0.0_CREATED | GATE_0_READY | 2026-02-26**
