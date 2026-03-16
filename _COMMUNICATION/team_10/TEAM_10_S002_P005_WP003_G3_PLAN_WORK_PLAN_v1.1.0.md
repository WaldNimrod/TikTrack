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
| **MODIFY** | `agents_os/ui/PIPELINE_ROADMAP.html` | DOM anchors per LLD400 §4.3 |
| **MODIFY** | `agents_os_v2/orchestrator/pipeline.py` | CS-02 gate contradiction fix |
| **MODIFY** | `agents_os_v2/orchestrator/state.py` | CS-03/CS-04 fallback removal; NONE/COMPLETE sentinel |
| **MODIFY** | `agents_os/ui/js/pipeline-config.js` | AC-CS-06 EXPECTED_FILES idle state |

### 2.3 Team 51 — QA

| Action | File | Purpose |
|--------|------|---------|
| **OUTPUT** | `_COMMUNICATION/team_51/TEAM_51_S002_P005_WP003_QA_REPORT_v1.0.0.md` | QA report per TEAM_100_TO_TEAM_51_STATE_ALIGNMENT_WP003_QA_MANDATE |

---

## 3. Execution Order and Gate Routing

### 3.1 Execution Order

```
Step 1: Team 61 — Contract verify (BLOCKING for implementation)
        ↓
Step 2: Team 61 — Implementation (P0 first, then P1)
        ↓
Step 3: Team 51 — QA/FAV per mandate
        ↓
Step 4: GATE_4 submission to Team 90
```

### 3.2 Gate Routing (BF-G3_5: 002 FIX)

**Source:** `agents_os_v2/orchestrator/pipeline.py` FAIL_ROUTING

| Current Gate | Event | Next Gate | Action |
|--------------|-------|-----------|--------|
| G3_PLAN | PASS (after phase2 storage) | G3_5 | `./pipeline_run.sh --domain agents_os phase2` → `./pipeline_run.sh --domain agents_os pass` |
| G3_5 | PASS | G3_6_MANDATES | Team 90 validates → Team 10 generates mandates |
| G3_5 | FAIL (doc) | G3_PLAN | Work plan governance/format — Team 10 revises plan; `./pipeline_run.sh --domain agents_os revise "BF-xx"` |
| G3_5 | FAIL (full) | G3_PLAN | Work plan rejected — Team 10 full rewrite; route_recommendation: full |

**Verdict file:** Team 90 verdict must include `route_recommendation: doc` or `full` for auto-routing. If missing → manual: `./pipeline_run.sh route doc "reason"` or `route full "reason"`.

---

## 4. API / Contract Summary

### 4.1 CLI (pipeline_run.sh) — Actual Commands

**BF-G3_5: 001:** Only commands present in pipeline_run.sh case statement:

| Command | Purpose |
|---------|---------|
| `./pipeline_run.sh --domain agents_os pass` | Advance current gate PASS |
| `./pipeline_run.sh --domain agents_os fail "reason"` | Advance gate FAIL; triggers routing |
| `./pipeline_run.sh --domain agents_os status` | Display pipeline status |
| `./pipeline_run.sh --domain agents_os store G3_PLAN <file>` | Store work plan artifact |
| `./pipeline_run.sh --domain agents_os phase2` | G3_PLAN: auto-store work plan, show Phase 2 mandate |
| `./pipeline_run.sh --domain agents_os pass_with_actions "a1\|a2"` | PASS_WITH_ACTION, hold gate |

**Not in pipeline_run.sh:** `new S002-P005`, `sync`. Initialization: `python3 -m agents_os_v2.orchestrator.pipeline --spec "..."`. Sync: per Team 00 decision, may be separate script.

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

---

## 5. Test Scenarios — Run Commands and Binary PASS/FAIL

### 5.1 P0 Tests — Exact Commands (BF-G3_5: 003 FIX)

**Prerequisite:** Backend/frontend not required; AOS UI served via `cd agents_os/ui && python3 -m http.server 8090`

| test_id | Run Command / Steps | PASS | FAIL |
|---------|---------------------|------|------|
| QA-P0-01 | Load http://localhost:8090/PIPELINE_DASHBOARD.html; inspect DOM | `document.querySelector('[data-testid="dashboard-provenance-badge"]') !== null` | Missing |
| QA-P0-02 | Load PIPELINE_ROADMAP.html; inspect program cards | Badge `[live: domain]` or `[registry_mirror]` visible | Missing |
| QA-P0-03 | Load PIPELINE_TEAMS.html; inspect each domain row | `teams-domain-row-tiktrack` and `teams-domain-row-agents_os` exist; each has provenance badge | Missing row or badge |
| QA-P0-04 | Run: `./pipeline_run.sh --domain agents_os pass`; then `python3 -c "import json; d=json.load(open('_COMMUNICATION/agents_os/pipeline_state_agentsos.json')); c=set(d.get('gates_completed',[])); f=set(d.get('gates_failed',[])); exit(0 if not (c&f) else 1)"` | exit 0 | exit 1 |
| QA-P0-05 | `mv _COMMUNICATION/agents_os/pipeline_state_agentsos.json /tmp/backup.json`; load Dashboard | `[data-testid="primary-state-read-failed"]` visible; NO fallback state | Fallback shown |
| QA-P0-06 | `python3 -c "from agents_os_v2.orchestrator.state import PipelineState; s=PipelineState.load('agents_os'); print(type(s).__name__)"` with no domain file | `NO_ACTIVE_PIPELINE` or equivalent; no legacy read | Legacy read |
| QA-P0-07 | Set `work_package_id: "NONE"` in pipeline_state_tiktrack.json; load; check is_active | is_active === false | is_active === true |
| QA-P0-08 | Load PIPELINE_TEAMS.html | Both domain rows visible with correct WP/Gate | Missing or wrong |

**Restore after QA-P0-05:** `mv /tmp/backup.json _COMMUNICATION/agents_os/pipeline_state_agentsos.json`

### 5.2 P1 Tests — Exact Commands

| test_id | Run Command / Steps | PASS | FAIL |
|---------|---------------------|------|------|
| QA-P1-01 | Create ACTIVE program in COMPLETE stage; load Roadmap | Conflict banner or exception card | No banner |
| QA-P1-02 | Set work_package_id NONE; load Dashboard | "No active WP" or equivalent | Hardcoded WP |
| QA-P1-03 | Set current_gate COMPLETE; load Dashboard | `[data-testid="gate-complete-message"]` visible; no 404 | 404 or JS error |
| QA-P1-04 | Manually age STATE_SNAPSHOT.json produced_at_iso >3600s; load Dashboard | `[data-testid="snapshot-freshness-badge"]` yellow/red | Missing or green when stale |
| QA-P1-05 | `grep -r "{{date}}\|date -u +%F" _COMMUNICATION/agents_os/prompts/ \| wc -l` | ≥3 | <3 |

### 5.3 pytest

```bash
python3 -m pytest agents_os_v2/tests/test_pipeline.py -v -k "not OpenAI and not Gemini"
```
**PASS:** exit 0; 0 failures. **FAIL:** exit ≠ 0 or any failure.

### 5.4 Regression

| Check | Command / Steps | PASS |
|-------|-----------------|------|
| Pages load | Load Dashboard, Roadmap, Teams at :8090 | No JS errors in console |
| Domain switch | Dashboard domain selector: TikTrack ↔ Agents_OS | Correct state per domain |
| Roadmap labels | COMPLETE program | No ACTIVE label |

---

## 6. Per-Team Acceptance Criteria

### 6.1 Team 61 — Contract Verify

| # | Criterion | Pass |
|---|-----------|------|
| 1 | Actual commands (pass, fail, status, store, phase2) confirmed in pipeline_run.sh | Documented |
| 2 | LLD400 vs actual gap documented (new, sync absent) | Documented |
| 3 | pipeline_state_*.json schema matches LLD400 §3.3 | Documented |
| 4 | No implementation — verify only | Confirmed |

### 6.2 Team 61 — Implementation

| # | Criterion | Pass |
|---|-----------|------|
| P0-01 | Provenance badges on Dashboard, Roadmap, Teams | ✓ |
| P0-02 | CS-02: No gate in both gates_completed and gates_failed | ✓ |
| P0-03 | CS-03: loadDomainState failure → PRIMARY_STATE_READ_FAILED; no fallback | ✓ |
| P0-04 | Python: NO_ACTIVE_PIPELINE sentinel; no legacy read in load() | ✓ |
| P0-05 | Teams dual-domain rows (SA-01) | ✓ |
| data-testid | All anchors from LLD400 §4.3 present | ✓ |

### 6.3 Field, Empty, Error Contracts

(Unchanged from v1.0.0 — see §6.3–6.5 of prior plan.)

### 6.4 Team 51 — QA

| # | Criterion | Pass |
|---|-----------|------|
| 1 | All QA-P0-01..08 binary PASS | ✓ |
| 2 | All QA-P1-01..05 binary PASS | ✓ |
| 3 | pytest exit 0 | ✓ |
| 4 | Regression checks | ✓ |
| 5 | Report at canonical path | `_COMMUNICATION/team_51/TEAM_51_S002_P005_WP003_QA_REPORT_v1.0.0.md` |

---

## 7. Team 61 Implementation Deliverable Artifact (BF-G3_5: 004 FIX)

**Canonical path:** `_COMMUNICATION/team_61/TEAM_61_S002_P005_WP003_IMPLEMENTATION_COMPLETE_v1.0.0.md`

**Required sections (mandatory):**

| Section | Content |
|---------|---------|
| **Identity header** | roadmap_id, stage_id, program_id, work_package_id, gate_id, phase_owner, date |
| **Modified files list** | Table: file path, change type (MODIFY/CREATE), purpose (e.g. P0-01 provenance badge) |
| **P0 checklist** | P0-01..P0-05, data-testid anchors — each row: ✓ or ✗ with note |
| **P1 checklist** | P1-01..P1-05 — each row: ✓ or ✗ |
| **Test evidence** | Reference to pytest run (exit code, count); reference to manual/MCP run for UI tests |
| **Handover prompt** | Copy-paste-ready prompt for Team 51 QA activation with this artifact path |

**Format:** Markdown; YAML frontmatter with id, from, to, date, status.

**Trigger for Team 51:** Team 10 hands off using this artifact; Team 51 runs QA per §5 and reports to `TEAM_51_S002_P005_WP003_QA_REPORT_v1.0.0.md`.

---

## 8. Canonical Deliverable Paths

| Team | Deliverable | Canonical Path |
|------|-------------|----------------|
| Team 61 | Contract verify | `_COMMUNICATION/team_61/TEAM_61_S002_P005_WP003_CONTRACT_VERIFY_v1.0.0.md` |
| Team 61 | Implementation complete | `_COMMUNICATION/team_61/TEAM_61_S002_P005_WP003_IMPLEMENTATION_COMPLETE_v1.0.0.md` |
| Team 51 | QA report | `_COMMUNICATION/team_51/TEAM_51_S002_P005_WP003_QA_REPORT_v1.0.0.md` |

---

## 9. Team 10 Next Action

1. Await Team 61 contract verify
2. Issue Team 61 implementation mandate (or reference Team 100 mandate)
3. Upon Team 61 completion artifact, hand off to Team 51 per §7 handover prompt
4. Upon Team 51 PASS, route to GATE_4 submission (Team 90)

---

**log_entry | TEAM_10 | G3_PLAN | S002_P005_WP003 | v1.1.0_G35_REMEDIATION | 2026-03-16**
**log_entry | TEAM_10 | BF-G3_5-001 | CLI_ACTUAL_COMMANDS_ONLY | 2026-03-16**
**log_entry | TEAM_10 | BF-G3_5-002 | GATE_ROUTING_TABLE_ADDED | 2026-03-16**
**log_entry | TEAM_10 | BF-G3_5-003 | TEST_COVERAGE_EXACT_COMMANDS | 2026-03-16**
**log_entry | TEAM_10 | BF-G3_5-004 | TEAM61_DELIVERABLE_ARTIFACT_SPEC | 2026-03-16**
