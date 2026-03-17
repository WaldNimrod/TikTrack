# Mandates — S003-P009-WP001  ·  G3_PLAN

**Spec:** Pipeline Resilience Package — 3-tier file resolution, wsm_writer.py auto-write, targeted git integration (pre-GATE_4 + GATE_8), route alias normalization (4a/4b already implemented)

**Canonical date:** Use `date -u +%F` for today; replace {{date}} in identity headers.

════════════════════════════════════════════════════════════
  EXECUTION ORDER
════════════════════════════════════════════════════════════

  Phase 1:  Team 10   ← runs alone
             ↓  Phase 2 starts ONLY after Phase 1 completes
             💻  Phase 1 done?  →  ./pipeline_run.sh --domain agents_os phase2

  Phase 2:  Operator   ← runs alone

════════════════════════════════════════════════════════════

## Team 10 — Work Plan Author (Phase 1)

### Your Task

**Environment:** Cursor (Team 10 — Work Plan Generator)

Produce a complete implementation work plan for WP `S003-P009-WP001`.

**Approved Spec (from GATE_1 LLD400):**

# Team 170 — LLD400 | S003-P009-WP001 Pipeline Resilience Package
## TEAM_170_S003_P009_WP001_LLD400_v1.0.0.md

---
project_domain: AGENTS_OS
id: TEAM_170_S003_P009_WP001_LLD400_v1.0.0
from: Team 170 (Spec & Governance Authority)
to: Team 190 (Constitutional Validator)
cc: Team 10, Team 100, Team 61
date: 2026-03-17
status: SUBMITTED_FOR_GATE_1_VALIDATION
gate_id: GATE_1
architectural_approval_type: SPEC
spec_version: 1.0.0
source: TEAM_100_PIPELINE_RESILIENCE_LOD400_DRAFT_v1.0.0.md
required_ssm_version: 1.0.0
required_wsm_version: 1.0.0
required_active_stage: S003
phase_owner: Team 10
---

## §1 Identity Header

| Field | Value |
|-------|-------|
| gate | GATE_1 |
| wp | S003-P009-WP001 |
| stage | S003 |
| domain | agents_os |
| date | 2026-03-17 |
| roadmap_id | PHOENIX_ROADMAP |
| program_id | S003-P009 |
| work_package_id | S003-P009-WP001 |
| task_id | PIPELINE_RESILIENCE |
| architectural_approval_type | SPEC |
| spec_version | 1.0.0 |
| source | TEAM_100_PIPELINE_RESILIENCE_LOD400_DRAFT_v1.0.0 |
| required_ssm_version | 1.0.0 |
| required_wsm_version | 1.0.0 |
| required_active_stage | S003 |
| phase_owner | Team 10 |

---

## §2 Endpoint Contract

**Domain:** AGENTS_OS Pipeline Resilience has no HTTP API. Contracts are CLI commands, Python module entry points, and file I/O.

### 2.1 CLI: pipeline_run.sh

| Command | Method | Purpose |
|---------|--------|---------|
| `./pipeline_run.sh --domain agents_os pass` | UPDATE state | Advance current gate to PASS; triggers wsm_writer; pre-GATE_4: block if uncommitted changes |
| `./pipeline_run.sh --domain agents_os fail "reason"` | UPDATE state | Advance current gate to FAIL |
| `./pipeline_run.sh --domain agents_os store GATE_1 <path>` | UPDATE state | Manual Tier 3 store for LLD400 artifact |
| `./pipeline_run.sh --domain agents_os store G3_PLAN <path>` | UPDATE state | Manual Tier 3 store for work plan artifact |
| `./pipeline_run.sh --domain agents_os status` | READ state | Display pipeline status |

**GATE_1 / G3_PLAN auto-store (inline Python):** When at GATE_1 or G3_PLAN, `pipeline_run.sh` invokes `_auto_store_gate1_artifact()` or `_auto_store_g3plan_artifact()` which output: `STORE:<path>`, `NO_FILE`, `ALREADY_STORED:<path>`, or `TIER2_MATCH:<path>` (stderr).

**Request (implicit):** Domain from `--domain` or `PIPELINE_DOMAIN` env.

**Response (auto-store):** One of: `STORE:<path>`, `NO_FILE`, `ALREADY_STORED:<path>`.

### 2.2 Python Module: wsm_writer

| Entry Point | Purpose |
|-------------|---------|
| `from agents_os_v2.orchestrator.wsm_writer import write_wsm_state` | Update WSM CURRENT_OPERATIONAL_STATE table; append log_entry |

**Invocation:** Called from `pipeline.py` `advance()` after `state.save()`, when `state.gate_state is None`.

**Request:** `state: PipelineState`, `gate_id: str`, `result: str`.

**Response:** None (side effect: WSM file updated). On error: WARN event to `pipeline_events.jsonl`; pipeline continues (non-blocking).

---

## §3 DB Contract

**Domain:** AGENTS_OS has no database. Data sources are JSON files, markdown (WSM), and event log.

### 3.1 Files Read

| Path | Purpose | Fields |
|------|---------|--------|
| `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` | Pipeline state | work_package_id, current_gate, last_updated, lld400_content, work_plan |
| `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json` | Pipeline state (tiktrack) | Same |
| `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` | WSM | CURRENT_OPERATIONAL_STATE block: active_flow, active_work_package_id, in_progress_work_package_id, last_closed_work_package_id, current_gate, active_program_id, phase_owner_team, next_required_action, next_responsible_team |

### 3.2 Files Written

| Path | Purpose | Write trigger |
|------|---------|---------------|
| `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` | Pipeline state | pipeline_run.sh pass/fail/store; state.py save() |
| `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTE

---

**Required output — all 4 sections mandatory:**

1. **§2 Files per team** (canonical paths):
   - Team 61 Contract Verify → `_COMMUNICATION/team_61/TEAM_61_S003_P009_WP001_CONTRACT_VERIFY_v1.0.0.md`
   - Team 61 Implementation → `agents_os/ui/js/*.js`, `agents_os_v2/orchestrator/*.py`
   - Team 51 QA → `_COMMUNICATION/team_51/TEAM_51_S003_P009_WP001_QA_REPORT_v1.0.0.md`

2. **§3 Execution order** with dependencies

3. **§6 Per-team acceptance criteria** — field, empty state, error contracts for UI

4. **§4 API/contract** — CLI commands, JSON paths, Python entry points, schema

---

**Domain adaptation:** AGENTS_OS — Team 61 (implementation + contract verify) + Team 51 (QA). No Team 20/30 for this domain.

Identity header required: `gate: G3_PLAN | wp: S003-P009-WP001 | stage: S003 | domain: agents_os | date: 2026-03-17`

Save to: `_COMMUNICATION/team_10/TEAM_10_S003_P009_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`

When done, inform Nimrod. Nimrod runs `./pipeline_run.sh --domain agents_os phase2` to auto-store the plan and confirm readiness for G3_5.

⛔ **YOUR TASK ENDS WITH SAVING THE WORK PLAN.**

**Output — write to:**
`_COMMUNICATION/team_10/TEAM_10_S003_P009_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`

### Acceptance
- Work plan saved to: `_COMMUNICATION/team_10/TEAM_10_S003_P009_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`
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

1. Auto-scan `_COMMUNICATION/team_10/` for latest `TEAM_10_S003_P009_WP001_G3_PLAN_WORK_PLAN_v*.md`
2. Store content → `pipeline_state.work_plan`
3. Confirm storage + print next step

**Current storage status:** ✅ Stored (17574 chars) — ready to pass

---

**After storage confirmed:**

`./pipeline_run.sh --domain agents_os pass` → advances G3_PLAN → G3_5 (Team 90 validates plan)

### Acceptance
- work_plan field populated in pipeline state (non-empty)
- If PASS  →  `./pipeline_run.sh --domain agents_os pass`  (advances to G3_5)
- If plan missing  →  check Team 10 saved `TEAM_10_S003_P009_WP001_G3_PLAN_WORK_PLAN_v*.md`
