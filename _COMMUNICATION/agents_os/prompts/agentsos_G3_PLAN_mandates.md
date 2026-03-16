# Mandates — S002-P005-WP003  ·  G3_PLAN

**Spec:** AOS State Alignment & Governance Integrity

════════════════════════════════════════════════════════════
  EXECUTION ORDER
════════════════════════════════════════════════════════════

  Phase 1:  Team 10   ← runs alone
             ↓  Phase 2 starts ONLY after Phase 1 completes
             💻  Phase 1 done?  →  ./pipeline_run.sh --domain agents_os phase2

  Phase 2:  Operator   ← runs alone

════════════════════════════════════════════════════════════

## Team 10 — Work Plan Author (Phase 1)

### Your Task (REVISION)

**Environment:** Cursor (Team 10 — Execution Orchestrator)

Your work plan was reviewed by Team 90 (G3_5) and **FAILED**.
Do NOT produce a new plan from scratch — fix the existing plan to address the blockers.

**G3_5 Blockers to Fix:**

BF-G3_5: 001 (SEVERE) — Contract verification step references non-existent CLI command; BF-G3_5: 002 (SEVERE) — Gate routing; BF-G3_5: 003 (MAJOR) — Test coverage criteria are too vague for implementation readiness; BF-G3_5: 004 (MAJOR) — Team 61 implementation deliverable artifact is underspecified

**Existing Work Plan:**

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



**Spec (reference):**

# Team 170 — LLD400 | S002-P005-WP003 AOS State Alignment & Governance Integrity
## TEAM_170_S002_P005_WP003_LLD400_v1.0.0.md

---
project_domain: AGENTS_OS
id: TEAM_170_S002_P005_WP003_LLD400_v1.0.0
from: Team 170 (Spec & Governance Authority)
to: Team 190 (Constitutional Validator)
cc: Team 10, Team 100, Team 61
date: 2026-03-16
status: SUBMITTED_FOR_GATE_1_VALIDATION
gate_id: GATE_1
architectural_approval_type: SPEC
spec_version: 1.0.0
source: TEAM_100_AGENTS_OS_STATE_ALIGNMENT_WP003_LOD200_v1.0.0.md
required_ssm_version: 1.0.0
required_wsm_version: 1.0.0
required_active_stage: S002
phase_owner: Team 10
---

## §1 Identity Header

| Field | Value |
|-------|-------|
| gate | GATE_1 |
| wp | S002-P005-WP003 |
| stage | S002 |
| domain | agents_os |
| date | 2026-03-16 |
| roadmap_id | PHOENIX_ROADMAP |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP003 |
| task_id | AOS_STATE_ALIGNMENT |
| architectural_approval_type | SPEC |
| spec_version | 1.0.0 |
| source | TEAM_100_AGENTS_OS_STATE_ALIGNMENT_WP003_LOD200_v1.0.0 |
| required_ssm_version | 1.0.0 |
| required_wsm_version | 1.0.0 |
| required_active_stage | S002 |
| phase_owner | Team 10 |

---

## §2 Endpoint Contract

**Domain:** AGENTS_OS has no HTTP API. Contracts are CLI commands, file fetches (static JSON), and Python module entry points.

### 2.1 CLI: pipeline_run.sh

| Command | Method | Purpose |
|---------|--------|---------|
| `./pipeline_run.sh new S002-P005` | CREATE state | Initialize new program; creates domain-specific pipeline_state_*.json |
| `./pipeline_run.sh --domain agents_os pass` | UPDATE state | Advance current gate to PASS |
| `./pipeline_run.sh --domain agents_os fail "reason"` | UPDATE state | Advance current gate to FAIL |
| `./pipeline_run.sh --domain agents_os pass_with_actions "ACTION-1\|ACTION-2"` | UPDATE state | Mark gate PASS_WITH_ACTION; set pending_actions |
| `./pipeline_run.sh --domain agents_os status` | READ state | Display pipeline status |
| `./pipeline_run.sh sync` | SYNC | Align registry mirrors from WSM (per Team 00 decision) |

**Invariant (CS-02):** After any gate transition, a gate ID MUST NOT appear in both `gates_completed` and `gates_failed` simultaneously.

### 2.2 Static JSON Fetch (JS)

| Endpoint | Method | Request | Response |
|----------|--------|---------|----------|
| `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` | GET | — | Pipeline state (agents_os domain) |
| `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json` | GET | — | Pipeline state (tiktrack domain) |
| `_COMMUNICATION/agents_os/STATE_SNAPSHOT.json` | GET | — | Observer read-only snapshot |

**Response schema (pipeline_state_*.json):** See §3 DB Contract.

**Error behavior (CS-03):** On fetch failure → MUST render `PRIMARY_STATE_READ_FAILED` error panel; NO fallback to legacy or alternate source.

### 2.3 Python Module: state_reader

| Entry Point | Purpose |
|-------------|---------|
| `python3 -m agents_os_v2.observers.state_reader` | Build STATE_SNAPSHOT.json |

**Output path:** `_COMMUNICATION/agents_os/STATE_SNAPSHOT.json`

---

## §3 DB Contract

**Domain:** AGENTS_OS has no database. Data sources are JSON and markdown files.

### 3.1 Files Read

| Path | Purpose | Columns / Fields |
|------|---------|------------------|
| `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` | Pipeline state (agents_os) | work_package_id, current_gate, gates_completed, gates_failed, project_domain, spec_brief, lld400_content, work_plan, mandates, last_updated, gate_state, pending_actions, phase8_content |
| `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json` | Pipeline state (tiktrack) | Same schema |
| `_COMMUNICATION/agents_os/STATE_SNAPSHOT.json` | Observer output (read-only) | produced_at_iso, governance, consistency_check, pipeline.domains.* |
| `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` | WSM (governance SSOT) | active_work_package_id, active_stage_id, current_gate, active_project_domain |

### 3.

---

For each blocker, confirm how you fixed it in the revised plan.

Save revised plan to: `_COMMUNICATION/team_10/TEAM_10_S002_P005_WP003_G3_PLAN_WORK_PLAN_v1.0.0.md` (increment version)

When done, inform Nimrod. Nimrod runs `./pipeline_run.sh --domain agents_os phase2` to auto-store the revised plan.

⛔ **YOUR TASK ENDS WITH SAVING THE REVISED PLAN.**

**Output — write to:**
`_COMMUNICATION/team_10/TEAM_10_S002_P005_WP003_G3_PLAN_WORK_PLAN_v1.0.0.md`

### Acceptance
- Work plan saved to: `_COMMUNICATION/team_10/TEAM_10_S002_P005_WP003_G3_PLAN_WORK_PLAN_v1.0.0.md`
- All 4 sections present: §2 files per team, §3 execution order, §6 AC, §4 API contract
- Domain adaptation: Team 61 + Team 51 (no Team 20/30 for agents_os)
- Identity header present (gate/wp/stage/domain/date)
- When done: Nimrod runs `./pipeline_run.sh --domain agents_os phase2`

────────────────────────────────────────────────────────────
  ✅  Phase 1 complete?
  →  Run in terminal:  ./pipeline_run.sh --domain agents_os phase2
     Regenerates mandates with Phase 1 output injected
     + displays Phase 2 section ready to copy.
────────────────────────────────────────────────────────────

## Operator — Work Plan Storage Confirmation (Phase 2)

⚠️  PREREQUISITE: **Team 10** must be COMPLETE before starting this mandate.

### Phase 2 — Work Plan Auto-Storage & Advance

**This phase is operator-run, not a team task.**

Running `./pipeline_run.sh --domain agents_os phase2` will:

1. Auto-scan `_COMMUNICATION/team_10/` for latest `TEAM_10_S002_P005_WP003_G3_PLAN_WORK_PLAN_v*.md`
2. Store content → `pipeline_state.work_plan`
3. Confirm storage + print next step

**Current storage status:** ✅ Stored (10131 chars) — ready to pass

---

**After storage confirmed:**

`./pipeline_run.sh --domain agents_os pass` → advances G3_PLAN → G3_5 (Team 90 validates plan)

### Acceptance
- work_plan field populated in pipeline state (non-empty)
- If PASS  →  `./pipeline_run.sh --domain agents_os pass`  (advances to G3_5)
- If plan missing  →  check Team 10 saved `TEAM_10_S002_P005_WP003_G3_PLAN_WORK_PLAN_v*.md`
