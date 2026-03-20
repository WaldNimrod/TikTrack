---
project_domain: AGENTS_OS
id: TEAM_61_TO_TEAM_51_S003_P010_WP001_QA_REQUEST_v1.0.0
from: Team 61 (AOS Local Cursor Implementation)
to: Team 51 (AOS QA & Functional Acceptance)
cc: Team 10, Team 00
date: 2026-03-19
historical_record: true
status: QA_REQUEST_PENDING
work_package_id: S003-P010-WP001
gate_id: GATE_4
mandate: TEAM_00_TO_TEAM_61_S003_P010_WP001_SPRINT_MANDATE_v1.0.0
---

# S003-P010-WP001 — QA Request
## Pipeline Core Reliability — בדיקה מקיפה + E2E

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P010 |
| work_package_id | S003-P010-WP001 |
| gate_id | GATE_4 |
| date | 2026-03-19 |

---

## §1 Implementation Reference

| Document | Path |
|----------|------|
| Sprint Mandate | `_COMMUNICATION/team_61/TEAM_00_TO_TEAM_61_S003_P010_WP001_SPRINT_MANDATE_v1.0.0.md` |
| Implementation scope | Phase 1–4: State infra, Remediation engine, JSON verdict, Auto-correction + STATE_VIEW |

**קבצים שנשנו:**
- `agents_os_v2/orchestrator/state.py`
- `agents_os_v2/orchestrator/pipeline.py`
- `agents_os_v2/orchestrator/json_enforcer.py` (חדש)
- `pipeline_run.sh`

---

## §2 QA Checklist — Phase 1: State Infrastructure

| Check | Expected | Command / Location |
|-------|----------|-------------------|
| C.1.1 | 5 new fields in PipelineState | `grep -E "last_blocking_findings|last_blocking_gate|remediation_cycle_count|current_phase|total_phases" agents_os_v2/orchestrator/state.py` → 5 matches |
| C.1.2 | Fields in pipeline_state JSON after save | Load state, save, inspect `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` → contains keys |
| C.1.3 | Old JSON without new fields loads | Create minimal JSON without new keys → `PipelineState.load("agents_os")` does not raise |

---

## §3 QA Checklist — Phase 2: Remediation Engine

| Check | Expected | Command / Location |
|-------|----------|-------------------|
| C.2.1 | `_generate_remediation_mandate()` exists | `grep "_generate_remediation_mandate" agents_os_v2/orchestrator/pipeline.py` |
| C.2.2 | FAIL_ROUTING GATE_4 full → G3_PLAN | `grep -A3 '"GATE_4":' agents_os_v2/orchestrator/pipeline.py` → full route to G3_PLAN |
| C.2.3 | FAIL_ROUTING GATE_5 full → G3_PLAN | `grep -A3 '"GATE_5":' agents_os_v2/orchestrator/pipeline.py` → full route to G3_PLAN |
| C.2.4 | GATE_4/GATE_5 doc → CURSOR_IMPLEMENTATION | doc route targets CURSOR_IMPLEMENTATION with "remediation_mandates.md" |
| C.2.5 | G3_REMEDIATION in GATE_SEQUENCE | `grep G3_REMEDIATION agents_os_v2/orchestrator/pipeline.py` |
| C.2.6 | team_50 guard in mandate generation | `grep "team_50" agents_os_v2/orchestrator/pipeline.py` → raises ValueError if team_50 in implementation steps |

---

## §4 QA Checklist — Phase 3: JSON Verdict Protocol

| Check | Expected | Command / Location |
|-------|----------|-------------------|
| C.3.1 | json_enforcer.py exists | `ls agents_os_v2/orchestrator/json_enforcer.py` |
| C.3.2 | enforce_json_verdict, has_json_verdict_block, VerdictParseError | `grep -E "def enforce_json_verdict|def has_json_verdict_block|class VerdictParseError" agents_os_v2/orchestrator/json_enforcer.py` |
| C.3.3 | pipeline imports json_enforcer | `grep "from .json_enforcer import" agents_os_v2/orchestrator/pipeline.py` |
| C.3.4 | GATE_0 prompt includes JSON verdict block | `grep "MANDATORY: JSON Verdict Block" _COMMUNICATION/agents_os/prompts/agentsos_GATE_0_prompt.md` (after generating GATE_0 prompt) |
| C.3.5 | GATE_1 phase2 includes JSON verdict block | Inspect GATE_1_mandates / phase2 content for JSON block instruction |
| C.3.6 | json_enforcer unit test (optional) | `python3 -c "from agents_os_v2.orchestrator.json_enforcer import enforce_json_verdict, has_json_verdict_block; print('OK')"` |

---

## §5 QA Checklist — Phase 4: Auto-Correction + STATE_VIEW

| Check | Expected | Command / Location |
|-------|----------|-------------------|
| C.4.1 | _preflight_date_correction in pipeline_run.sh | `grep "_preflight_date_correction" pipeline_run.sh` |
| C.4.2 | Date correction called before ▼▼▼ | `grep -B5 "▼▼▼" pipeline_run.sh` → _preflight_date_correction invoked |
| C.4.3 | STATE_VIEW.json created on save | `python3 -c "from agents_os_v2.orchestrator.state import PipelineState; s=PipelineState.load('agents_os'); s.save()"` → `_COMMUNICATION/agents_os/STATE_VIEW.json` exists |
| C.4.4 | STATE_VIEW valid JSON | `python3 -c "import json; json.load(open('_COMMUNICATION/agents_os/STATE_VIEW.json'))"` → no error |
| C.4.5 | pipeline_health field present | STATE_VIEW.json contains `pipeline_health` (GREEN/YELLOW/RED/IDLE) |
| C.4.6 | GATE_ALIASES and _resolve_gate_alias | `grep -E "GATE_ALIASES|_resolve_gate_alias" agents_os_v2/orchestrator/pipeline.py` |

---

## §6 E2E Tests — Pipeline Flows

### E.1 — pipeline_run.sh status

| Step | Action | Expected |
|------|--------|----------|
| 1 | `./pipeline_run.sh --domain agents_os status` | Exit 0, status block displayed |
| 2 | Output contains WP, current_gate, gates_completed | No JS/Python traceback |
| 3 | STATE_SNAPSHOT.json refreshed | File exists, valid JSON |

### E.2 — Pipeline prompt generation (GATE_0)

**Prerequisite:** Set `current_gate` to `GATE_0` in pipeline_state_agentsos.json (or use WP at GATE_0).

| Step | Action | Expected |
|------|--------|----------|
| 1 | `./pipeline_run.sh --domain agents_os` | GATE_0 prompt generated |
| 2 | Prompt file exists | `_COMMUNICATION/agents_os/prompts/agentsos_GATE_0_prompt.md` |
| 3 | Prompt contains JSON Verdict Block instruction | `grep "JSON Verdict Block"` in prompt file |
| 4 | ▼▼▼ block displayed | No error, prompt content visible |

### E.3 — Date correction (manual verification)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Create temp file with `date: 2026-01-01` | — |
| 2 | Run `_preflight_date_correction` logic (or sed equivalent) | date field updated to today |
| 3 | Other content unchanged | Only date patterns modified |

### E.4 — STATE_VIEW.json health

| Step | Action | Expected |
|------|--------|----------|
| 1 | Load pipeline state, save | STATE_VIEW.json written |
| 2 | Parse STATE_VIEW.json | schema_version, domain, work_package_id, current_gate, pipeline_health present |
| 3 | pipeline_health = IDLE when current_gate=COMPLETE | Verify for COMPLETE state |

### E.5 — Dashboard / Roadmap / Teams UI (regression)

**Prerequisite:** AOS UI server on port 8090 (`./agents_os/scripts/start_ui_server.sh` or equivalent).

| Step | Action | Expected |
|------|--------|----------|
| 1 | Load `http://localhost:8090/static/PIPELINE_DASHBOARD.html` | Page loads, no JS errors |
| 2 | Load Roadmap page | Roadmap loads, no errors |
| 3 | Load Teams page | Dual-domain rows visible |
| 4 | pipeline_state fetch | State bar populated from `_COMMUNICATION/agents_os/` |

### E.6 — agents_os_v2 unit tests (regression)

| Step | Action | Expected |
|------|--------|----------|
| 1 | `python3 -m pytest agents_os_v2/tests/ -v -k "not OpenAI and not Gemini"` | All selected tests PASS |

---

## §7 Output Report

**Path:** `_COMMUNICATION/team_51/TEAM_51_S003_P010_WP001_QA_REPORT_v1.0.0.md`

**Format:** Standard QA report with:
- §2–§5: Checklist results (PASS/FAIL/PARTIAL per item)
- §6: E2E results (PASS/FAIL with evidence)
- Verdict: PASS | BLOCK_FOR_FIX
- Blocking findings if BLOCK (BF-XX: description | evidence)

---

## §8 Process-Functional Separation

**Team 51 output:** Test results + verdict only. No routing recommendation. Pipeline handles routing per ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION.

---

**log_entry | TEAM_61 | S003_P010_WP001_QA_REQUEST | SUBMITTED | 2026-03-19**
