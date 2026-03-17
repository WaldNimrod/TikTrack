---
project_domain: AGENTS_OS
id: TEAM_00_TO_TEAM_51_B2_02_TARGETED_RETEST_v1.0.0
from: Team 00 (Chief Architect — Nimrod)
to: Team 51 (AOS QA & Functional Acceptance)
cc: Team 100, Team 90, Team 70
date: 2026-03-17
status: ACTION_REQUIRED
authority: TEAM_00_CONSTITUTIONAL_MANDATE
scope: B2-02 — CS-05 Roadmap conflict banner — targeted completion
prerequisite: TEAM_51_S002_P005_COMBINED_QA_REPORT_v1.0.0 (B2-02 PARTIAL)
blocks: S002-P005 GATE_8 approval
---

# Team 00 → Team 51 | B2-02 Targeted Re-test Mandate

---

## Why This Mandate Exists

`TEAM_51_S002_P005_COMBINED_QA_REPORT_v1.0.0` §2 B2-02 was marked **PARTIAL**:
> "data-testid="roadmap-stage-conflict-banner" in roadmap HTML; full S001-P002 ACTIVE-in-COMPLETE scenario not executed"

Team 00 will not approve S002-P005 closure while any item remains unverified, regardless of blocking status. This mandate closes B2-02 completely.

---

## Spec Reference — CS-05

**LLD400 §4.2 / §4.3 (TEAM_170_S002_P005_WP003_LLD400_v1.0.0):**

> CS-05: When `pipeline_state.stage_id` maps to a stage marked CLOSED or COMPLETE in the Roadmap, the conflict banner MUST render.

**Contract anchor:** `data-testid="roadmap-stage-conflict-banner"`

---

## Code Trace — What Triggers the Banner

File: `agents_os/ui/js/pipeline-roadmap.js` lines 355–393

```
checkStageConflict(stages, programs, state):
  1. Read state.stage_id from pipeline_state
  2. Find matching stage entry in Roadmap stages data
  3. If stage.status = CLOSED or COMPLETE:
     - Check AUTHORIZED_STAGE_EXCEPTIONS[stage_id]
     - If exception found → push { type: 'AUTHORIZED_EXCEPTION' }
     - If no exception  → push { type: 'CONFLICT_BLOCKING' }
  4. Call renderConflictResult(...)
  5. renderConflictResult renders all stageConflicts as:
     <div class="conflict-banner state-exception|state-blocking"
          data-testid="roadmap-stage-conflict-banner">
```

**Both branches (AUTHORIZED_EXCEPTION and CONFLICT_BLOCKING) render the testid.** The banner text differs; the testid is identical.

**Registered exception:** `AUTHORIZED_STAGE_EXCEPTIONS["S001"]` is defined in `pipeline-config.js` lines 132–137. S001 triggers `AUTHORIZED_EXCEPTION` path → yellow/amber banner with authority reference.

---

## Test Procedure

### Setup (state injection — safe, reversible)

**Step 1 — Record current state:**
```bash
cp _COMMUNICATION/agents_os/pipeline_state_agentsos.json \
   _COMMUNICATION/agents_os/pipeline_state_agentsos.json.b2_02_backup
```

**Step 2 — Inject conflict state:**
Edit `_COMMUNICATION/agents_os/pipeline_state_agentsos.json`:
- Change `"stage_id"` field to `"S001"`
- Keep all other fields unchanged

This will cause `checkStageConflict()` to detect: pipeline active in S001 (which has an authorized exception registered) → renders `AUTHORIZED_EXCEPTION` banner.

**Step 3 — Load Roadmap page:**
Open `agents_os/ui/PIPELINE_ROADMAP.html` in browser at localhost:8090 (or file:///)

**Step 4 — Verify banner:**
- [ ] `data-testid="roadmap-stage-conflict-banner"` element is present in DOM
- [ ] Banner is visible (not `display:none`)
- [ ] Banner text contains `"S001"` and references the conflict condition
- [ ] Banner shows authority reference (AUTHORIZED_EXCEPTION path)
- [ ] No JS errors in console

**Step 5 — Restore state:**
```bash
mv _COMMUNICATION/agents_os/pipeline_state_agentsos.json.b2_02_backup \
   _COMMUNICATION/agents_os/pipeline_state_agentsos.json
```

**Step 6 — Verify Roadmap loads normally after restore:**
- [ ] No conflict banner after restore (state returns to S002, which is active/non-COMPLETE)

---

## Return Contract

Write: `_COMMUNICATION/team_51/TEAM_51_B2_02_TARGETED_RETEST_RESULT_v1.0.0.md`

Required content:

```
## B2-02 Completion Result
STATUS: PASS | FAIL

## Evidence
- Banner present: YES / NO
- data-testid="roadmap-stage-conflict-banner" in DOM: YES / NO
- Banner visible: YES / NO
- Console errors: NONE / [list]
- State restored: YES / NO
- Roadmap post-restore: NORMAL / ERROR

## Verdict
B2-02: PASS | FAIL
```

**If PASS:** B2-02 upgrades from PARTIAL → PASS. Route completion notification to Team 70 and Team 100.
**If FAIL:** Document the failure with DOM snapshot and console output. Route to Team 61 for code investigation.

---

**log_entry | TEAM_00 | B2_02_TARGETED_RETEST_MANDATE | ISSUED_TO_TEAM_51 | 2026-03-17**
