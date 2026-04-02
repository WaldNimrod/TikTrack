---
id: TEAM_100_TO_TEAM_101_CANARY_FINDINGS_DELEGATION_v1.0.0
historical_record: true
from: Team 100 (Claude Code — Architect)
to: Team 101 (AOS Architect)
authority: Direct architectural instruction — authorized by Team 00 (Nimrod). Not part of any WSM work package. Overrides WSM state. This mandate is active regardless of AOS domain pipeline state.
date: 2026-03-23
classification: ARCHITECT_DIRECTIVE
priority: HIGH---

# Team 101 — Canary Findings Delegation
## Immediate Fix Package: S003-P013-WP001 Pipeline Bugs

**⚠️ AUTHORITY NOTE:** This mandate is a direct instruction from the Architect (Team 100, authorized by Team 00). It does not originate from a work package and is not gated by WSM state. Execute as a standalone architectural fix sprint. Return all deliverables to Team 100 for final review.

---

## 1. Context

S003-P013-WP001 (TikTrack canary monitored run — D33 display_name) completed 2026-03-23 with ALL GATES PASS. During the run, 16 process deviations and 8 KB entries were recorded. The following items require immediate implementation. They are pipeline-layer bugs that affect ALL future work packages — tiktrack and AOS alike.

**Source document:** `_COMMUNICATION/team_00/monitor/FLIGHT_LOG_S003_P013_WP001_v1.0.0.md` (Sections H.1–H.3)

---

## 2. Open Items — Prioritized Fix List

### TIER 1 — CRITICAL (pipeline correctness)

#### FIX-101-01: KB-78 — `_generate_gate_2_prompt()` Missing Phase Structure
**File:** `agents_os_v2/orchestrator/pipeline.py`
**Severity:** CRITICAL — OPEN
**Root cause:** `_generate_gate_2_prompt()` does not implement the canonical 5-phase GATE_2 structure (2.1 Team 170 LLD400 → 2.1v Team 190 validate → 2.2 Team 10 work plan → 2.2v Team 90 validate plan → 2.3 Team 100/102 arch review). The function is a placeholder that jumps directly to a simplified intent approval, bypassing the work plan entirely.

**Required fix:**
- Rewrite `_generate_gate_2_prompt()` to route by `current_phase`:
  - Phase 2.1: Team 170 LLD400 spec (current GATE_1 content — already done, this is `phase2` transition)
  - Phase 2.1v: Team 190 validates LLD400 (current GATE_1 Phase 2)
  - Phase 2.2: Team 10/11 work plan — reuse/call `_generate_g3_plan_mandates()`
  - Phase 2.2v: Team 90 work plan validation — reuse/call `_generate_g3_5_prompt()`
  - Phase 2.3: Team 100/102 combined architectural review (current `_generate_gate_2_prompt()` logic, renamed)
- Register `isTwoPhaseGate('GATE_2')` = true for dashboard phase badge support
- Add `"GATE_2"` to `GATE_MANDATE_FILES_BASE` → `"GATE_2_mandates.md"` (new two-phase mandate file)
- Update `_DOMAIN_PHASE_ROUTING` for GATE_2 all sub-phases

**Acceptance criteria:**
- [ ] `./pipeline_run.sh --domain tiktrack` at GATE_2 generates `gate_2_mandates.md` with all 5 phase steps
- [ ] Dashboard shows multi-tab mandate view at GATE_2 (team per phase)
- [ ] `phase2`, `phase3`, `phase4`, `phase5` commands extract correct sections
- [ ] `isTwoPhaseGate('GATE_2')` returns `true` in dashboard

---

#### FIX-101-02: WSM Auto-Sync at Gate Transitions
**Files:** `pipeline_run.sh`, `agents_os_v2/orchestrator/pipeline.py`
**Severity:** CRITICAL — systemic
**Root cause:** WSM `STAGE_PARALLEL_TRACKS` is NOT automatically updated when a gate advances. Every gate transition requires a manual sync (DEV-GATE2-002, DEV-GATE5-005). ssot_check fails after every advance until manually fixed.

**Required fix:**
- Add a `_auto_wsm_sync()` function to `pipeline_run.sh` (or Python) that:
  - After every `pass`/`fail` advance: reads `current_gate` from `pipeline_state_{domain}.json`
  - Updates `STAGE_PARALLEL_TRACKS` row for that domain: `current_gate` field
  - Updates `phase_status` prose to include gate milestone text
  - Appends log_entry to WSM
  - Re-runs `ssot_check --domain {domain}` and asserts exit 0
- Call `_auto_wsm_sync` in the `pass)`, `fail)`, and `phase*)` cases of `pipeline_run.sh`

**Acceptance criteria:**
- [ ] After `./pipeline_run.sh --domain tiktrack pass`, `ssot_check --domain tiktrack` exits 0 automatically
- [ ] No manual WSM patch required at any gate transition
- [ ] WSM log_entry appended with team=PIPELINE_RUNNER and gate event

---

### TIER 2 — HIGH (robustness + process enforcement)

#### FIX-101-03: HITL Boundary — Explicit Pipeline Prohibition in ALL Prompts
**Files:** `agents_os_v2/orchestrator/pipeline.py` — all `_generate_*_prompt()` functions
**Root cause:** DEV-GATE2-001: Team 102 self-advanced pipeline because `domain_note` said "no human step at GATE_2" — interpreted as permission to run `pipeline_run.sh`. Fix was applied to that specific prompt but not systematically.

**Required fix:**
- Add a shared `_hitl_prohibition_block()` function returning a canonical prohibition block:
  ```
  ⛔ DO NOT run ./pipeline_run.sh or any pipeline CLI command.
  ⛔ DO NOT advance the gate or modify pipeline state.
  ✅ Save your artifact to the canonical path below.
  ✅ Notify Nimrod. Nimrod runs all pipeline commands.
  ```
- Inject `_hitl_prohibition_block()` into EVERY prompt-generating function in `pipeline.py`
- Specifically: gates 0–8 mandate generators + all phase sub-prompts
- The prohibition must appear near the TOP of each prompt (before task description)

**Acceptance criteria:**
- [ ] All prompts generated by `pipeline.py` contain the HITL prohibition block
- [ ] Automated grep test: `grep -r "DO NOT run.*pipeline_run" agents_os/ui/prompts/` finds text in all generated files
- [ ] No agent can self-advance without the operator (tested in simulation — see FIX-101-08)

---

#### FIX-101-04: KB-84 Extension — Parameter Validation for ALL Commands
**File:** `pipeline_run.sh`
**Status:** Partially implemented (pass command validated); fail/route/phase commands not fully validated
**Root cause:** Parameter validation `--wp --gate --phase` was added to `pass` (KB-84) but `fail`, `route`, `phase2` may still advance without identifiers.

**Required fix:**
- Extend KB-84 guard to ALL state-mutating commands: `pass`, `fail`, `route`, `phase*`
- Every state-mutating command MUST validate:
  - `--wp` matches `state.work_package_id`
  - `--gate` matches `state.current_gate`
  - `--phase` (when provided) matches `state.current_phase`
- If any mismatch: block with clear error showing active state + correct command
- Commands without `--wp`/`--gate` should WARN (not block) unless in strict mode

**Acceptance criteria:**
- [ ] `./pipeline_run.sh fail "reason"` without identifiers → clear error: "identifiers required"
- [ ] `./pipeline_run.sh --domain tiktrack phase2` → blocked if wrong gate
- [ ] All 4 state-mutating commands show identical validation error format

---

#### FIX-101-05: Explicit `writes_to` in ALL Team Prompts
**Files:** `agents_os_v2/orchestrator/pipeline.py` — all MandateStep definitions
**Root cause:** DEV-GATE5-002: Team 90 saved to wrong filename because GATE_5 Phase 5.2 prompt lacked an explicit canonical save path. Team 70 at GATE_5 Phase 5.1 also initially saved to wrong WP. Pattern: any prompt without explicit `writes_to` produces save-path confusion.

**Required fix:**
- Audit all `MandateStep` objects in `pipeline.py` — verify every step has a populated `writes_to` field
- For any prompt generated outside of `_generate_mandate_doc` (legacy single-team prompts): add a `**Output — write to:**` block with canonical path
- The canonical path format MUST use `CanonicalPathBuilder` naming convention
- In `_generate_mandate_doc`, `writes_to` is already shown — verify it appears prominently (not buried)

**Acceptance criteria:**
- [ ] Every MandateStep has non-empty `writes_to`
- [ ] Every legacy single-team prompt has explicit save path instruction
- [ ] Team audit: zero "file not found" scan misses for standard WP flow

---

### TIER 3 — MEDIUM (dashboard + UX)

#### FIX-101-06: Dashboard Gate-Transition Loading Indicator
**File:** `agents_os/ui/js/pipeline-dashboard.js`
**Root cause:** When `phase2` or `pass` is run from terminal, the dashboard needs a manual refresh. No visual indication that state changed. Users run `./pipeline_run.sh` and see stale dashboard.

**Required fix:**
- Add a `Last updated` timestamp line to the dashboard header (reads from `pipeline_state.last_updated`)
- Show a `🔄 REFRESH` badge when `state.last_updated` is newer than last render
- The 5s auto-refresh already exists — ensure it correctly detects `last_updated` changes

**Acceptance criteria:**
- [ ] After `pass` command in terminal, dashboard auto-refreshes within 5s
- [ ] `Last updated: 2026-03-23 18:12` visible in dashboard header

---

#### FIX-101-07: GATE_5 Phase 5.2 Activation — Regenerate After State Update
**File:** `pipeline_run.sh` — `phase*)` case
**Root cause:** DEV-GATE5-006: When `phase2` is run at GATE_5, the mandate file is regenerated BEFORE state is updated to 5.2. With the two-phase mandate approach this is tolerable (both phases always visible), but the `phase2` terminal output prints Phase 2 content from the file generated with 5.1 state. Minor ordering issue.

**Required fix:**
- In the `phase*)` case, for gates where phase advance changes state (GATE_5, GATE_8, GATE_1):
  - Update state FIRST
  - Then regenerate mandate file (so Phase 2 section gets current Team 70 coordination data if not yet loaded)
  - Then display Phase 2 content from the freshly regenerated file

**Acceptance criteria:**
- [ ] After `phase2` at GATE_5, gate_5_mandates.md reflects updated state (Phase 2 marked as active in section header)
- [ ] Terminal output for `phase2` shows Phase 2 content with Team 70 coordination data auto-injected

---

## 3. Deliverables Required

For each FIX item:
1. **Implementation** — code changes in the relevant files
2. **Verification artifact** — `_COMMUNICATION/team_101/TEAM_101_FIX_{N}_VERIFICATION_v1.0.0.md`
   - Fix description + file:line evidence
   - Before/after test or command output
3. **Final summary** — `_COMMUNICATION/team_101/TEAM_101_CANARY_FIXES_SUMMARY_v1.0.0.md`
   - All 7 fixes: status (DONE / PARTIAL / BLOCKED), file:line, evidence

**Return to Team 100:** After all deliverables saved, notify Team 100 for architectural review.

---

## 4. Scope Boundary

✅ **In scope:** Items FIX-101-01 through FIX-101-07 listed above.
⛔ **Out of scope:** TikTrack product code (D33, API, etc.) — this WP is complete. Do not touch production pages.
⛔ **Out of scope:** Any GATE_6/GATE_7 logic (not used in 5-gate canonical model).
⛔ **Out of scope:** AOS pipeline state or active work packages.

---

## 5. Notes for Delegation to Implementation Teams

If Team 101 cannot implement directly, route as follows:
- FIX-101-01 (pipeline.py GATE_2): → Team 61 implementation
- FIX-101-02 (WSM auto-sync): → Team 61 implementation
- FIX-101-03 (HITL block): → Team 61 implementation
- FIX-101-04 (KB-84 extension): → Team 61 implementation (shell script + Python)
- FIX-101-05 (writes_to): → Team 61 audit + Team 170 mandate update
- FIX-101-06 (dashboard UX): → Team 61 implementation
- FIX-101-07 (phase ordering): → Team 61 implementation (pipeline_run.sh only)

All teams must return to Team 101 → Team 101 reviews and returns to Team 100.

---

`log_entry | TEAM_100 | TO_TEAM_101 | CANARY_FINDINGS_DELEGATION | 7_FIXES | IMMEDIATE_SPRINT | AUTHORIZED_BY_TEAM_00 | 2026-03-23`
