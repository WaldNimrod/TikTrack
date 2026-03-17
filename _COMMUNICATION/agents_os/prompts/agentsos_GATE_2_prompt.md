**ACTIVE: TEAM_100 (Arch-Authority)**  gate=GATE_2 | wp=S003-P009-WP001 | stage=S003 | 2026-03-17

---

# GATE_2 — Approve Architectural Intent

Question: Do we approve building this?

**Domain:** `agents_os` — Architectural authority for this domain: `team_100`

## Approved Spec (LLD400 from GATE_1)

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

Respond with: APPROVED or REJECTED + reasoning.

**NOTE:** After analysis, the pipeline will PAUSE for human decision.
Use --approve GATE_2 / --reject GATE_2 --reason '…' to continue.