# Team 190 — S002-P005-WP001 Activation Mandate
## TEAM_190_S002_P005_WP001_ACTIVATION_MANDATE_v1.0.0.md

**project_domain:** AGENTS_OS
**from:** Team 00 (Chief Architect) via LOD200 routing
**to:** Team 190 (Primary) + Team 10 (Execution)
**date:** 2026-03-14
**status:** ACTIVE — EXECUTE IMMEDIATELY
**program_id:** S002-P005
**work_package_id:** S002-P005-WP001
**spec_ref:** `_COMMUNICATION/team_00/TEAM_00_S002_P005_LOD200_v1.0.0.md`

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP001 |
| gate_id | PRE-GATE_0 → GATE_0 |
| project_domain | agents_os |
| fast_track | FAST_3 |

---

## Part A — Team 10: Pipeline Activation

**Team 10 executes these steps in order:**

### Step 1 — Activate Pipeline State

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix
python3 -c "
import sys; sys.path.insert(0, '.')
from agents_os_v2.orchestrator.state import PipelineState
s = PipelineState(
    work_package_id='S002-P005-WP001',
    project_domain='agents_os',
    stage_id='S002',
    spec_brief='ADR-031 Stage A: Writing Semantics Hardening — parser determinism, gate integrity, program lifecycle CLI',
    current_gate='GATE_0'
)
s.save()
print('✅ State created:', s.work_package_id, '@', s.current_gate)
print('   Domain:', s.project_domain)
print('   Stage:', s.stage_id)
"
```

**Expected output:**
```
✅ State created: S002-P005-WP001 @ GATE_0
   Domain: agents_os
   Stage: S002
```

### Step 2 — Generate GATE_0 Prompt

```bash
./pipeline_run.sh --domain agents_os gate GATE_0
```

This generates `_COMMUNICATION/agents_os/prompts/GATE_0_prompt.md` and displays it for Team 190 review.

### Step 3 — Hand Off to Team 190

Once GATE_0 prompt is generated, Team 190 takes over for GATE_0 validation.

---

## Part B — Team 190: GATE_0 Validation

**Team 190 validates LOD200 scope against the following checklist:**

### GATE_0 Validation Checklist

| Item | Expected | Check |
|---|---|---|
| WP scope is bounded | R1+R2+R3+R4 only — no TikTrack features, no WSM writes | □ |
| R1 is fully specified | Structured parser, typed `StateReadError`, no silent None | □ |
| R2 primary (Option C) is specified | `GATE_ARTIFACT_PATHS` map + `check_gate_integrity()` function | □ |
| R2 secondary (WSM soft watch) is specified | Soft warning only, stage-level only, severity=WARNING | □ |
| R3 is verification-only | No code change unless ownership text is wrong | □ |
| R4 scope is Stage A only | `new` command only; hold/cancel/revive explicitly deferred | □ |
| Files to modify are enumerated | state_reader.py, pipeline.py, pipeline_run.sh, PIPELINE_ROADMAP.html | □ |
| Acceptance criteria are measurable | AC-01 through AC-09 with clear pass/fail | □ |
| Out-of-scope is explicitly stated | WSM writes, lifecycle UI, docs migration — all excluded | □ |

**GATE_0 pass condition:** All 9 items confirmed. Issue `./pipeline_run.sh --domain agents_os pass`.

**GATE_0 fail condition:** If scope ambiguity found → return to Team 00 with specific question. Do NOT proceed with ambiguous scope.

---

## Part C — Team 10: LLD400 (GATE_1 Prep)

After GATE_0 PASS, Team 10 writes the LLD400 for Team 190 to validate at GATE_1.

### LLD400 Required Sections

**Section 1 — R1: `state_reader.py` Parser Rewrite**
- Current code (line 66) — what it does
- New `_parse_wsm_table()` — pseudocode / code sketch
- New `StateReadError` class definition
- `read_governance_state()` behavior change
- Test case: WSM present + valid → returns dict; WSM present + field missing → raises error; WSM missing → returns `{"wsm_found": False}`

**Section 2 — R2: Consistency Check Implementation**
- `GATE_ARTIFACT_PATHS` map (complete, all gates)
- `check_gate_integrity()` function signature + logic
- `build_state_snapshot()` modification (adds `consistency_check` block)
- Dashboard: `consistency_check` JSON → banner rendering logic

**Section 3 — R4: `pipeline_run.sh new` Command**
- Bash implementation (argument parsing, validation, Python call)
- Python side: state creation logic
- Edge case: existing state file → confirmation prompt
- Test: `./pipeline_run.sh new S002-P005` → state file created at GATE_0

**Section 4 — R3 Verification**
- Run verification commands
- Document result (PASS or code fix needed)

---

## Part D — Team 190: Mandatory Reads

Before beginning GATE_0 validation, Team 190 must read:

1. `_COMMUNICATION/team_00/TEAM_00_S002_P005_LOD200_v1.0.0.md` — **THIS IS THE SPEC**
2. `agents_os_v2/observers/state_reader.py` — current code to understand what R1 changes
3. `agents_os_v2/orchestrator/pipeline.py` — current GATE_CONFIG to understand R2.1 artifact paths
4. `pipeline_run.sh` — current subcommand structure for R4

---

## Part E — Gate Chain Reference

```
GATE_0  (Team 190) — LOD200 scope validation             ← YOU ARE HERE
GATE_1  (Team 190) — LLD400 validation
GATE_2  (Team 100) — Architectural intent
WAITING_GATE2_APPROVAL (Nimrod)
G3_PLAN → G3_5 → G3_6_MANDATES
CURSOR_IMPLEMENTATION (Team 10 + Team 30)
GATE_4 → GATE_5 → GATE_6
WAITING_GATE6_APPROVAL (Nimrod)
GATE_7 (expedited — infrastructure WP, no UX review needed)
GATE_8 (Team 90 closure)
```

**Note on GATE_7:** S002-P005 is a pure infrastructure hardening WP (no user-facing UI changes). Team 90 may recommend expedited GATE_7 at GATE_5 review. Team 00 will confirm.

---

## Immediate Action Required

**Team 190 → Team 10:** Issue this mandate now. Team 10 executes Part A. Team 190 returns for GATE_0 validation.

---

**log_entry | TEAM_190 | S002_P005_WP001_ACTIVATION_MANDATE | ACTIVE | 2026-03-14**
