---
id: TEAM_100_TO_TEAM_101_CANARY_SIMULATION_MANDATE_v1.0.0
historical_record: true
from: Team 100 (Claude Code — Architect)
to: Team 101 (AOS Architect)
authority: Direct architectural instruction — authorized by Team 00 (Nimrod). Not part of any WSM work package. DEFERRED — activate only after Nimrod confirms activation.
date: 2026-03-23
status: DEFERRED — pending Nimrod activation signal after FIX-101 sprint completion
classification: ARCHITECT_DIRECTIVE---

# Team 101 — Canary Simulation Mandate
## Pipeline Dry-Run: "Canary Round 2" Preparation

**⚠️ STATUS: DEFERRED.** Do not begin this mandate until Nimrod explicitly activates it (after reviewing Team 101 FIX sprint and Team 170 documentation).

**⚠️ AUTHORITY NOTE:** Direct architectural instruction from Team 100, authorized by Team 00. Not gated by WSM state. Execute as a standalone simulation sprint.

---

## 1. Purpose

Before running Canary Round 2 (a real agent-executed pipeline run), the pipeline system must be stress-tested in simulation — without real agents, without human-in-the-loop, and without a real work package.

**Goal:** Discover all bugs, UX issues, and process failures that would block a clean run — BEFORE they occur in a live run with real agents. Produce a prioritized fix list.

**This simulation is a preparatory exercise, not a production run.**

---

## 2. Simulation Scope

### Phase A — Happy Path (all PASS)
Simulate a complete pipeline cycle from GATE_0 to GATE_5 with:
- A **dummy work package** in the tiktrack domain
- **All team verdicts: PASS** (no loops, no blocks)
- **No real agents** — Team 101 produces all "agent responses" as mock artifacts
- **No human in the loop** (except Nimrod's activation of this mandate itself)

### Phase B — Negative Path (after Nimrod reviews Phase A report)
Identical simulation but:
- Introduce blocks, routing decisions, and remediation loops at designated gates
- Test `fail` command, `route` command, remediation cycle
- Test all `route_recommendation` variants: doc, full
- Test HITL gate (GATE_4/4.3) with HRC checklist edge cases

**Phase B activates only after Nimrod approves Phase A report.**

---

## 3. Simulation Procedure — Phase A

### Step 1: Create dummy work package

```
WP: S003-P013-WP002 (or next available)
Domain: tiktrack
Spec: "SIMULATION — dummy feature X. No real implementation."
Process variant: TRACK_FOCUSED
```

Register in PHOENIX_PROGRAM_REGISTRY as `SIMULATION` status. Do NOT affect any real ACTIVE program.

### Step 2: Initialize pipeline state

```bash
# Reset to GATE_0 for dummy WP
python3 -c "
from agents_os_v2.orchestrator.state import PipelineState
s = PipelineState(
  work_package_id='S003-P013-WP002',
  stage_id='S003',
  project_domain='tiktrack',
  spec_brief='SIMULATION — dummy feature X. Canary round 2 dry-run.',
  process_variant='TRACK_FOCUSED',
)
s.save()
"
```

### Step 3: Generate prompt for each gate

For each gate (GATE_0 through GATE_5):
1. Run `./pipeline_run.sh --domain tiktrack --wp S003-P013-WP002 --gate {GATE} [--phase {PHASE}]`
2. **Capture the generated prompt** (contents of generated `.md` file)
3. **Document in simulation log:** prompt quality, any issues

### Step 4: Produce mock team artifacts

For each gate, produce a mock "team response" artifact:
- Create the canonical artifact file at the correct path (as if a real agent wrote it)
- Include proper identity header, verdict phrase, `writes_to` content
- Use PASS verdicts in Phase A
- **The artifact must be realistic enough to fool the dashboard's file detection**

Required artifacts per gate:
| Gate | Team | Mock artifact file |
|---|---|---|
| GATE_0 | Team 190 | `TEAM_190_S003_P013_WP002_GATE_0_VALIDATION_v1.0.0.md` |
| GATE_1 Phase 1 | Team 170 | `TEAM_170_S003_P013_WP002_LLD400_v1.0.0.md` |
| GATE_1 Phase 2 | Team 190 | `TEAM_190_S003_P013_WP002_GATE_1_VERDICT_v1.0.0.md` |
| GATE_2 Phase 2.2 | Team 10 | `TEAM_10_S003_P013_WP002_G3_PLAN_WORK_PLAN_v1.0.0.md` |
| GATE_2 Phase 2.2v | Team 90 | `TEAM_90_S003_P013_WP002_G3_5_VERDICT_v1.0.0.md` |
| GATE_2 Phase 2.3 | Team 102 | `TEAM_102_S003_P013_WP002_GATE_2_ARCH_REVIEW_v1.0.0.md` |
| GATE_3 | Team 61 | `TEAM_61_S003_P013_WP002_IMPLEMENTATION_v1.0.0.md` |
| GATE_4 Phase 4.1 | Team 51 | `TEAM_51_S003_P013_WP002_QA_REPORT_v1.0.0.md` |
| GATE_4 Phase 4.2 | Team 102 | `TEAM_102_S003_P013_WP002_GATE4_ARCH_VERDICT_v1.0.0.md` |
| GATE_4 Phase 4.3 | Nimrod (HRC) | HRC JSON + Nimrod manual approval |
| GATE_5 Phase 5.1 | Team 70 | `TEAM_70_S003_P013_WP002_GATE5_PHASE51_DOCUMENTATION_CLOSURE_REPORT_v1.0.0.md` |
| GATE_5 Phase 5.2 | Team 90 | `TEAM_90_S003_P013_WP002_GATE_5_VALIDATION_v1.0.0.md` |

### Step 5: Dashboard verification at each gate

After producing each mock artifact:
1. **Take a screenshot or snapshot of the dashboard** (use preview_screenshot tool)
2. Document:
   - Does the file detection turn green?
   - Is the verdict shown correctly (PASS badge)?
   - Is the Pass-Ready CTA visible?
   - Are mandate tabs showing the correct team(s)?
   - Is the phase badge (P1/P2) correct?
   - Any UX issues or inconsistencies?
3. Run `./pipeline_run.sh --domain tiktrack pass` (or phase2 as appropriate)
4. Verify dashboard updates correctly

### Step 6: Record all deviations

Any deviation from expected behavior → record immediately:
```
DEV-SIM-{NNN}: Gate, Severity, Description, Root cause hypothesis, Bypass (if any)
```

### Step 7: Phase A completion report

Save: `_COMMUNICATION/team_101/TEAM_101_SIMULATION_PHASE_A_REPORT_v1.0.0.md`

Include:
- All gates: prompt quality assessment (1–5 + notes)
- Dashboard screenshot quality at each gate
- All deviations found (table)
- All gates that required bypass or workaround
- UX/UI observations (dashboard clarity, consistency, operator experience)
- Summary: "Phase A complete — pipeline flow: X% smooth, Y deviations, Z bypassed"

---

## 4. Simulation Procedure — Phase B (post-Nimrod approval)

After Nimrod reviews and approves Phase A:

### Additional scenarios to simulate:

**Scenario B1 — GATE_3 fail + remediation**
- Mock Team 61 artifact with `VERDICT: BLOCK` and finding `BF-G3-001`
- Run `./pipeline_run.sh --domain tiktrack fail --finding_type code "BF-G3-001: ..."`
- Verify remediation mandate generated
- Mock Team 61 remediation → PASS
- Verify pipeline advances from remediation

**Scenario B2 — GATE_5 doc-only block**
- Mock Team 70 with `BLOCKING_REPORT`, `route_recommendation: doc`
- Run fail with `--finding_type doc`
- Verify WSM reflects block
- Mock corrected Team 70 → PASS
- Mock Team 90 validation → PASS

**Scenario B3 — GATE_4 HRC with mixed verdicts**
- Open HRC in dashboard
- Set 7 items PASS, 2 items BLOCK, 1 item PWA
- Verify final decision options available
- Test "reject all" then "approve all" bulk buttons
- Verify artifact generated

**Scenario B4 — Wrong WP identifier (KB-84)**
- Run `./pipeline_run.sh --domain tiktrack --wp S003-P999-WP001 --gate GATE_3 pass`
- Verify blocked with clear error message
- Run without `--wp` flag
- Verify warned or blocked

### Phase B report

Save: `_COMMUNICATION/team_101/TEAM_101_SIMULATION_PHASE_B_REPORT_v1.0.0.md`

Same structure as Phase A report, plus:
- Each negative scenario: expected behavior vs actual
- Any flow that couldn't complete (pipeline stuck, no bypass available)
- All deviations found in negative paths

---

## 5. Final Simulation Summary

**Save:** `_COMMUNICATION/team_101/TEAM_101_CANARY_SIMULATION_FINAL_REPORT_v1.0.0.md`

### Required sections:

#### §1 — Executive Summary
- Simulation result: READY / NOT READY for Canary Round 2
- Total deviations found: Phase A + Phase B
- Critical blockers: list any that would fail a real run
- Estimated fixes required before Round 2: count + priority

#### §2 — Gate-by-Gate Scorecard
For each gate: flow score (1–5), dashboard UX score (1–5), key issues

#### §3 — UX/UI Assessment
Focus: dashboard consistency and optimal operator experience
- Is each gate's CTA clear and unambiguous?
- Do mandate tabs always show the right team?
- Phase badge accuracy?
- Is the operator never confused about "what to do next"?
- Recommendations for dashboard UX improvements

#### §4 — Fix Recommendations
Prioritized list of all fixes needed before Canary Round 2:
- Must-fix (blocks flow)
- Should-fix (degrades experience)
- Nice-to-fix (polish)

#### §5 — Canary Round 2 Readiness Verdict
Clear statement: "Pipeline is / is not ready for Canary Round 2. Conditions:..."

---

## 6. Cleanup After Simulation

After final report is approved by Team 100:
- Remove dummy WP state: reset `pipeline_state_tiktrack.json` to clean state (no dummy WP)
- Remove dummy program from PHOENIX_PROGRAM_REGISTRY (or mark SIMULATION_COMPLETE)
- Archive all mock artifacts to `_COMMUNICATION/_SIMULATION_ARCHIVE/S003-P013-WP002/`
- Run `ssot_check --domain tiktrack` → must exit 0 after cleanup

---

## 7. Return to Team 100

After all deliverables saved, return to Team 100 with:
1. Phase A report path
2. Phase B report path (if Phase B was activated)
3. Final summary path
4. ssot_check exit 0 confirmation post-cleanup

Team 100 performs final architectural review and issues Canary Round 2 readiness signal to Team 00.

---

`log_entry | TEAM_100 | TO_TEAM_101 | CANARY_SIMULATION_MANDATE | DEFERRED | AUTHORIZED_BY_TEAM_00 | 2026-03-23`
