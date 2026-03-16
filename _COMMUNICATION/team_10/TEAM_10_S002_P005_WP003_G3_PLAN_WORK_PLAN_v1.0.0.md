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

**Dependency rules:**
- Team 61 implementation starts only after contract verify note exists (or escalate if gaps found).
- Team 51 QA runs only after Team 61 completion report.

---

## 4. API / Contract Summary

**Domain:** AGENTS_OS has no HTTP API. Contracts are:

### 4.1 CLI (pipeline_run.sh)

| Command | Purpose |
|---------|---------|
| `./pipeline_run.sh new S002-P005` | Initialize program; create pipeline_state_*.json |
| `./pipeline_run.sh --domain agents_os pass` | Advance gate PASS |
| `./pipeline_run.sh --domain agents_os fail "reason"` | Advance gate FAIL |
| `./pipeline_run.sh --domain agents_os status` | Display status |
| `./pipeline_run.sh sync` | Sync registry from WSM |

### 4.2 Static JSON (JS fetch)

| Path | Response |
|------|----------|
| `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` | pipeline state (agents_os) |
| `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json` | pipeline state (tiktrack) |
| `_COMMUNICATION/agents_os/STATE_SNAPSHOT.json` | Observer snapshot (read-only) |

### 4.3 Python Module

| Entry Point | Output |
|-------------|--------|
| `python3 -m agents_os_v2.observers.state_reader` | `_COMMUNICATION/agents_os/STATE_SNAPSHOT.json` |

### 4.4 pipeline_state Schema (§3.3)

`work_package_id`, `current_gate`, `gates_completed`, `gates_failed`, `project_domain`, `spec_brief`, `lld400_content`, `work_plan`, `mandates`, `last_updated`, `gate_state`, `pending_actions`, `phase8_content`

---

## 5. Test Scenarios — Run Commands and PASS Criteria

### 5.1 CLI Tests (Team 61 / Team 51)

**Commands:**
```bash
# CS-02: Gate contradiction check
./pipeline_run.sh --domain agents_os pass
# Then inspect: no gate in both gates_completed AND gates_failed
python3 -c "
import json
with open('_COMMUNICATION/agents_os/pipeline_state_agentsos.json') as f:
    d = json.load(f)
completed = set(d.get('gates_completed', []))
failed = set(d.get('gates_failed', []))
assert not (completed & failed), 'CS-02 VIOLATION: gate in both lists'
print('CS-02 PASS')
"

# State reader
python3 -m agents_os_v2.observers.state_reader
# PASS: _COMMUNICATION/agents_os/STATE_SNAPSHOT.json created/updated
```

### 5.2 UI Tests (Team 51 — MCP browser or manual)

**Prerequisite:** `cd agents_os/ui && python3 -m http.server 8090` (or equivalent)

| # | Scenario | Steps | PASS | FAIL |
|---|----------|-------|------|------|
| S1 | Provenance badge | Load Dashboard | `[data-testid="dashboard-provenance-badge"]` visible | Missing |
| S3 | Primary read failure | Rename pipeline_state_agentsos.json; load Dashboard | `[data-testid="primary-state-read-failed"]` visible; no fallback | Fallback shown |
| S5 | Teams dual-domain | Load PIPELINE_TEAMS.html | Both `teams-domain-row-tiktrack` and `teams-domain-row-agents_os` exist | Missing row |
| S6 | Snapshot freshness | Load Dashboard; check badge | `[data-testid="snapshot-freshness-badge"]` with age | Missing |
| S7 | COMPLETE gate | Set current_gate=COMPLETE; load Dashboard | `[data-testid="gate-complete-message"]` visible; no 404 | 404 or error |

### 5.3 pytest (Team 51)

```bash
python3 -m pytest agents_os_v2/tests/test_pipeline.py -v -k "not OpenAI and not Gemini"
```
**PASS:** exit 0; all relevant tests green.

---

## 6. Per-Team Acceptance Criteria

### 6.1 Team 61 — Contract Verify

| # | Criterion | Pass |
|---|-----------|------|
| 1 | pipeline_run.sh supports --domain agents_os | Documented |
| 2 | pipeline_state_*.json schema matches LLD400 §3.3 | Documented |
| 3 | No implementation — verify only | Confirmed |

### 6.2 Team 61 — Implementation

| # | Criterion | Pass |
|---|-----------|------|
| P0-01 | Provenance badges on Dashboard, Roadmap, Teams | ✓ |
| P0-02 | CS-02: No gate in both gates_completed and gates_failed | ✓ |
| P0-03 | CS-03: loadDomainState failure → PRIMARY_STATE_READ_FAILED; no fallback | ✓ |
| P0-04 | Python: NO_ACTIVE_PIPELINE sentinel; no legacy read in load() | ✓ |
| P0-05 | Teams dual-domain rows (SA-01) | ✓ |
| data-testid | All anchors from LLD400 §4.3 present | ✓ |

### 6.3 Field Contract (UI State Shape)

```javascript
{
  work_package_id: string,
  current_gate: string,
  project_domain: string,
  gates_completed: string[],
  gates_failed: string[],
  gate_state: string | null,
  pending_actions: string[],
  spec_brief: string,
  last_updated: string
}
```

### 6.4 Empty-State Contract (UI)

- `work_package_id = "NONE"` or `""` → `is_active = false`; no active WP messaging.
- `current_gate = "NONE"` or `"COMPLETE"` → same.
- EXPECTED_FILES section when no WP: "No active WP — expected files N/A".

### 6.5 Error-State Contract (UI)

- **Fetch failure (CS-03):** `loadDomainState(domain)` fails → render `PRIMARY_STATE_READ_FAILED` panel with: `source_path`, HTTP status, timestamp, domain, recovery command. NO fallback to legacy or alternate source.
- **Python load failure:** Return `NO_ACTIVE_PIPELINE` sentinel; no legacy `pipeline_state.json` read.

### 6.6 Team 51 — QA

| # | Criterion | Pass |
|---|-----------|------|
| 1 | All P0 mandatory tests (QA-P0-01..08) PASS | ✓ |
| 2 | All P1 mandatory tests (QA-P1-01..05) PASS | ✓ |
| 3 | Regression: 3 AOS pages load; domain switch works | ✓ |
| 4 | Report at canonical path | `_COMMUNICATION/team_51/TEAM_51_S002_P005_WP003_QA_REPORT_v1.0.0.md` |

---

## 7. Canonical Deliverable Paths

| Team | Deliverable | Canonical Path |
|------|-------------|----------------|
| Team 61 | Contract verify | `_COMMUNICATION/team_61/TEAM_61_S002_P005_WP003_CONTRACT_VERIFY_v1.0.0.md` |
| Team 61 | Completion report | `_COMMUNICATION/team_61/TEAM_61_S002_P005_WP003_IMPLEMENTATION_COMPLETE_v1.0.0.md` |
| Team 51 | QA report | `_COMMUNICATION/team_51/TEAM_51_S002_P005_WP003_QA_REPORT_v1.0.0.md` |

---

## 8. Team 10 Next Action

1. Await Team 61 contract verify at `TEAM_61_S002_P005_WP003_CONTRACT_VERIFY_v1.0.0.md`
2. Issue Team 61 implementation mandate (or reference existing Team 100 mandate)
3. Upon Team 61 completion, hand off to Team 51 per QA mandate
4. Upon Team 51 PASS, route to GATE_4 submission (Team 90)

---

**log_entry | TEAM_10 | G3_PLAN | S002_P005_WP003 | WORK_PLAN_CREATED | 2026-03-16**
