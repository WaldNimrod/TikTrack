**ACTIVE: TEAM_10 (Gateway)**  gate=G3_PLAN | wp=S002-P005-WP003 | stage=S002 | 2026-03-16

---

# G3_PLAN — Build Work Plan from Approved Spec

## Approved Spec

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

## Required Output

1. Files to create/modify per team (canonical paths):
   - Team 20 (API verify only): confirm existing API endpoints — no code changes
   - Team 30 (Frontend): exact file paths to create/modify in `ui/src/`
   - Team 50 (QA): test scenarios + run commands + PASS criteria
2. Execution order with dependencies
3. Per-team acceptance criteria (field contract, empty state, error state for UI)
4. API contract: endpoint, params, response shape

## Pipeline State

## Current Project State (from STATE_SNAPSHOT)

- **Active stage:** S002
- **WSM path:** documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md
- **SSM path:** documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md

- **Backend models:** 19 (alerts, base, brokers_fees, cash_flows, enums...)
- **Backend routers:** 18
- **Backend services:** 22
- **Backend schemas:** 12
- **Frontend pages:** 46
- **DB migrations:** 41

- **Unit test files:** 5
- **CI pipeline:** yes