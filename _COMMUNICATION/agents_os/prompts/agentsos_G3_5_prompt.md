**ACTIVE: TEAM_90 (Dev-Validator)**  gate=G3_5 | wp=S002-P005-WP003 | stage=S002 | 2026-03-17

---

╔══════════════════════════════════════════════════════════════╗
║  ⚠  RE-VALIDATION — G3_5 CYCLE #2                          ║
║  Work plan was revised to address prior blockers.            ║
║  Perform a FRESH review — do NOT repeat previous findings.   ║
╚══════════════════════════════════════════════════════════════╝

Previous verdict (read for context, do NOT copy its blockers):
  `_COMMUNICATION/team_90/TEAM_90_S002_P005_WP003_G3_5_VERDICT_v1.0.0.md`

# G3.5 — Validate Work Plan  [RE-RUN #2]

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
id: TEAM_10_S002_P005_WP003_G3_PLAN_WORK_PLAN_v1.1.0
from: Team 10 (Execution Orchestrator)
to: Team 61, Team 51
cc: Team 00, Team 90, Team 100, Team 170, Team 190
date: 2026-03-16
status: ACTIVE
gate_id: GATE_3
program_id: S002-P005
work_package_id: S002-P005-WP003
scope: AOS State Alignment & Governance Integrity — G3 Work Plan (G3_5 Blocker Remediation)
authority_mode: TEAM_10_GATE_3_OWNER
spec_source: TEAM_170_S002_P005_WP003_LLD400_v1.0.0.md
supersedes: TEAM_10_S002_P005_WP003_G3_PLAN_WORK_PLAN_v1.0.0
g35_remediation: BF-G3_5-001, BF-G3_5-002, BF-G3_5-003, BF-G3_5-004
---

# Team 10 | S002-P005-WP003 — G3 Work Plan v1.1.0 (G3_5 Remediation)

## G3_5 Blocker Fixes Summary

| Blocker | Fix Applied |
|---------|-------------|
| **BF-G3_5: 001** | Contract verification uses only **actual** CLI commands from pipeline_run.sh; removed non-existent `new`, `sync` (§2.1, §4.1) |
| **BF-G3_5: 002** | Explicit gate routing table added — G3_5 PASS/FAIL routes (§3.2) |
| **BF-G3_5: 003** | Test coverage expanded with exact run commands, assertions, binary PASS/FAIL per QA-P0/P1 (§5) |
| **BF-G3_5: 004** | Team 61 implementation deliverable artifact format and required sections specified (§7) |

---

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

### 2.1 Team 61 — Contract Verify (Pre-Implementation)

**BF-G3_5: 001 FIX:** Use only commands that **actually exist** in `pipeline_run.sh` (case statement). LLD400 §2.1 lists `new` and `sync` — these do **not** exist. Contract verify must document actual vs spec gap.

| Action | File | Purpose |
|--------|------|---------|
| **READ** | `_COMMUNICATION/team_170/TEAM_170_S002_P005_WP003_LLD400_v1.0.0.md` | LLD400 spec |
| **READ** | `pipeline_run.sh` lines 342–920 (case statement) | Actual subcommands |
| **VERIFY** | `pipeline_run.sh` | Confirm **actual** commands: `pass`, `fail`, `status`, `store`, `phase2`, `pass_with_actions` (with `--domain agents_os`) |
| **VERIFY** | `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` | Schema matches LLD400 §3.3 |
| **NOTE** | Contract verify output | Document: `new` and `sync` NOT in pipeline_run.sh; initialization uses `python3 -m agents_os_v2.orchestrator.pipeline --spec "..."` if needed |
| **OUTPUT** | `_COMMUNICATION/team_61/TEAM_61_S002_P005_WP003_CONTRACT_VERIFY_v1.0.0.md` | Confirmed commands, gaps |

### 2.2 Team 61 — Implementation

| Action | File | Purpose |
|--------|------|---------|
| **MODIFY** | `agents_os/ui/js/pipeline-dashboard.js` | P0-01 provenance badges; CS-03 error panel; data-testid anchors |
| **MODIFY** | `agents_os/ui/js/pipeline-roadmap.js` | P0-01 provenance badges; CS-05 conflict banner |
| **MODIFY** | `agents_os/ui/js/pipeline-teams.js` | P0-01 provenance badges; P0-05 dual-domain rows (SA-01) |
| **MODIFY** | `agents_os/ui/js/pipeline-state.js` | CS-03 loadDomainState failure → PRIMARY_STATE_READ_FAILED; remove legacy fallback |
| **MODIFY** | `agents_os/ui/PIPELINE_TEAMS.html` | DOM anchors per LLD400 §4.3 |
| **MODIFY** | `agents_os/ui/PIPELINE_DASHBOARD.html` | DOM anchors per LLD400 §4.3 |
| **MODIFY** | `agents_os/ui/PIPELINE_ROADMAP.html` | DOM anchors per LLD400 §4.