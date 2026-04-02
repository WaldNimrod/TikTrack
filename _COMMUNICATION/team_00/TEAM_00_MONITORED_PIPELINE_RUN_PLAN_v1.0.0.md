---
id: TEAM_00_MONITORED_PIPELINE_RUN_PLAN_v1.0.0
historical_record: true
from: Team 00 (System Designer) / Team 100 (Chief System Architect)
to: All active teams
date: 2026-03-21
status: APPROVED — READY FOR EXECUTION
purpose: Full-pipeline monitored run on a simple development task
domain: tiktrack
process_variant: TRACK_FOCUSED (monitoring prototype — simplest valid path)---

# Monitored Pipeline Run — Design Plan

## §0 — Rationale

S003-P012 has proven the pipeline mechanics work. Before opening S003-P004 (D33) with
full TRACK_FULL complexity, we run one **fully monitored, enhanced-observability cycle**
on a constrained task. The goal: understand the exact flow — where prompts are generated,
what state transitions occur, where timing delays arise, and what the operator experience
feels like in practice.

This is NOT a debug session. It is a **structured observability run** with intentional
capture of every artifact at every step.

---

## §1 — Task Selection (Canary WP)

### Selected: S003-P013-WP001 — "D33 display_name field — read-only display"

| Field | Value |
|---|---|
| program_id | S003-P013 (new — Canary Observability Run) |
| work_package_id | S003-P013-WP001 |
| domain | tiktrack |
| process_variant | TRACK_FOCUSED (Team 61 implements — minimal team chain) |
| scope | Display `display_name` field (already in DB) in D33 user tickers table |

### Why this task

| Criterion | Justification |
|---|---|
| Real code change | Yes — backend + frontend (not synthetic dummy) |
| Bounded scope | 1 DB field, 1 API response field, 1 UI column — ~30 lines total |
| Schema already exists | `user_ticker.display_name` VARCHAR(100) NULL — confirmed in schema facts |
| No migrations needed | Field exists; just needs to surface via API + UI |
| Representative flow | Exercises full GATE_1→GATE_5 cycle with real acceptance criteria |
| No ambiguity | Field semantics are unambiguous (nullable display name, fallback to ticker symbol) |

### Scope boundary (LOCKED — no scope creep)

**In scope:**
- Backend: include `display_name` in GET /api/v1/user_tickers response (nullable)
- Frontend D33: add "שם תצוגה" column to the user tickers table (display only, no edit)
- If display_name is NULL: show ticker symbol as fallback (greyed out)

**Explicitly out of scope:**
- Editing display_name (create/update via UI)
- Any other D33 changes
- Any other endpoints

---

## §2 — Enhanced Monitoring Protocol

Every step in this run generates a **monitor artifact** before advancing. No gate
transition happens without the capture.

### Monitor role: Team 100 (observer at every gate)

At each gate transition, Team 100:
1. Runs `./pipeline_run.sh --domain tiktrack` → captures full generated prompt to file
2. Runs `python -m agents_os_v2.tools.ssot_check --domain tiktrack` → logs exit code
3. Records timestamp and gate state in **MONITOR_LOG** (see §3)
4. Reviews team delivery before authorizing pipeline advance
5. Notes any deviation (behavior, timing, content) in DEVIATION_LOG (§4)

### Monitoring additions vs. standard flow

| Addition | When | Captured in |
|---|---|---|
| Full generated prompt (raw text) | Before each gate send | `monitor/gate_N_prompt_raw.md` |
| ssot_check exit code + output | Before AND after each gate transition | MONITOR_LOG §gate_N |
| Pipeline state JSON snapshot | After each `pass`/`fail` command | `monitor/gate_N_state_after.json` |
| Team delivery review checklist | When team returns artifact | MONITOR_LOG §gate_N_review |
| Timestamp trail | Every CLI command | MONITOR_LOG §timeline |
| Dashboard screenshot description | At GATE_1, GATE_3, GATE_5 | MONITOR_LOG §dashboard_capture |
| Deviation log entry | Any unexpected behavior | DEVIATION_LOG |

---

## §3 — Gate-by-Gate Execution Plan

### GATE_1 — Spec activation

**Action:**
```bash
./pipeline_run.sh --domain tiktrack status    # capture current state
./pipeline_run.sh --domain tiktrack           # generate GATE_1 prompt → paste to Team 61
```

**Monitor captures:**
- [ ] State before: `current_gate`, `work_package_id`, `process_variant`
- [ ] Full GATE_1 prompt text (copy to `monitor/gate_1_prompt_raw.md`)
- [ ] ssot_check --domain tiktrack → exit code logged
- [ ] Team 61 receives prompt → timestamp recorded

**Expected output from Team 61:** LOD200/spec brief acknowledgment. No code yet.

**Advance (when Team 61 confirms):**
```bash
./pipeline_run.sh --domain tiktrack pass
```
**Capture:** state JSON after pass → `monitor/gate_1_state_after.json`

---

### GATE_2 — Architecture approval

**Action:**
```bash
./pipeline_run.sh --domain tiktrack           # generate GATE_2 prompt → review
```

**Monitor captures:**
- [ ] GATE_2 prompt (is spec_brief present? are AC listed?)
- [ ] ssot_check before and after
- [ ] Architectural note: does the spec match our locked decisions?
  - display_name nullable ✓ (per schema facts)
  - Fallback = ticker symbol ✓ (per UX Iron Rule — no empty cells)
  - Read-only only ✓ (no edit in scope)

**Expected:** GATE_2 = architectural sign-off. Team 100 reviews and approves.

**Advance:**
```bash
./pipeline_run.sh --domain tiktrack pass
```

---

### GATE_3 — Implementation (Team 61 TRACK_FOCUSED)

**Action:**
```bash
./pipeline_run.sh --domain tiktrack           # generate GATE_3 mandate → send to Team 61
```

**Monitor captures:**
- [ ] Full GATE_3 mandate (verify: identity header ✓, AC listed ✓, FAIL_CMD format ✓,
      HITL boundary ✓, roster excerpt ✓)
- [ ] Note: does roster show tiktrack teams correctly?
- [ ] Team 61 receives mandate → timestamp T_impl_start

**Team 61 implementation checklist (verify in delivery):**
- [ ] `GET /api/v1/user_tickers` response includes `display_name` field (nullable)
- [ ] D33 table has "שם תצוגה" column
- [ ] NULL display_name → shows ticker symbol (greyed CSS class)
- [ ] No JS console errors
- [ ] pytest regression: all 205 tests pass (plus new tests for this feature)
- [ ] SOP-013 seal in delivery artifact

**Advance after delivery review:**
```bash
./pipeline_run.sh --domain tiktrack pass
```

---

### GATE_4 — QA (Team 51)

**Action:**
```bash
./pipeline_run.sh --domain tiktrack           # generate GATE_4 QA prompt → send to Team 51
```

**Monitor captures:**
- [ ] Full GATE_4 QA prompt (verify: D-pages listed ✓, spec_brief ✓, prior findings N/A ✓,
      FAIL_CMD format instruction ✓, HITL boundary ✓)
- [ ] Team 51 receives prompt → timestamp T_qa_start
- [ ] Team 51 runs: pytest + browser check D33 in tiktrack domain

**If FAIL:** capture full FAIL report + run:
```bash
./pipeline_run.sh --domain tiktrack fail --finding_type <TYPE> --from-report <REPORT_PATH>
```
Then capture state JSON + log correction cycle trigger.

**If PASS:** capture Team 51 report → advance:
```bash
./pipeline_run.sh --domain tiktrack pass
```

---

### GATE_5 — Lifecycle closure (Team 100)

**Action:**
```bash
./pipeline_run.sh --domain tiktrack           # generate GATE_5 prompt
```

**Monitor captures:**
- [ ] GATE_5 prompt content (is evidence chain listed? is lifecycle closure explicit?)
- [ ] ssot_check --domain tiktrack → must be exit 0
- [ ] Dashboard screenshot at GATE_5 (what does the pipeline UI show?)
- [ ] Final state: `current_gate = COMPLETE`

**Final advance:**
```bash
./pipeline_run.sh --domain tiktrack pass
```

**Capture:** state JSON after → `monitor/gate_5_state_after.json`

---

## §4 — Deviation Log Format

Any deviation from expected behavior is logged immediately. Format:

```
DEVIATION-001
gate:     GATE_N
timestamp: 2026-03-21THH:MM:SS
observed:  [what actually happened]
expected:  [what should have happened]
severity:  LOW | MEDIUM | HIGH | BLOCKING
action:    [logged / KB candidate / blocked]
```

Deviations are NOT auto-blocked. They are collected and reviewed at GATE_5 closure.
BLOCKING deviations stop the run.

---

## §5 — Monitor Artifact Output Location

```
_COMMUNICATION/team_00/monitor/
  gate_1_prompt_raw.md
  gate_1_state_after.json
  gate_2_prompt_raw.md
  gate_2_state_after.json
  gate_3_prompt_raw.md
  gate_3_state_after.json
  gate_3_team61_delivery_review.md
  gate_4_prompt_raw.md
  gate_4_state_after.json
  gate_4_qa_report_summary.md
  gate_5_prompt_raw.md
  gate_5_state_after.json
  MONITOR_LOG_v1.0.0.md      ← running log, updated at each step
  DEVIATION_LOG_v1.0.0.md    ← deviations only, updated as they occur
```

Team 100 writes all monitor artifacts. No other team writes to this folder.

---

## §6 — Success Criteria for the Monitored Run

The run is considered **OBSERVABILITY_PASS** when:

| # | Criterion |
|---|---|
| O-01 | All 5 gate prompts captured (raw text + ssot_check before/after) |
| O-02 | All state JSON snapshots captured at each gate |
| O-03 | DEVIATION_LOG written (even if empty) |
| O-04 | D33 display_name renders correctly in TikTrack browser |
| O-05 | All 205+ tests pass |
| O-06 | MONITOR_LOG has timeline with timestamps for every CLI command |
| O-07 | Gate 5 COMPLETE — `current_gate = COMPLETE` confirmed in state JSON |

**Final output:** `TEAM_00_MONITORED_RUN_REPORT_v1.0.0.md` — summary of all observations,
deviations, and architectural conclusions. This document feeds directly into S003-P004
preparation.

---

## §7 — Pre-conditions Before Starting

- [ ] S003-P012 DOCUMENTATION_CLOSED confirmed (all 5 WPs) ✓
- [ ] Team 170 governance update complete (WSM + registry updated) — **wait for this**
- [ ] ssot_check --domain tiktrack → exit 0 confirmed
- [ ] Dashboard loads without JS errors
- [ ] 205 baseline tests pass

**Start signal:** Team 170 mandate delivery confirmed → then begin.

---

**log_entry | TEAM_00 | MONITORED_PIPELINE_RUN_PLAN | S003_P013_WP001 | D33_DISPLAY_NAME | TRACK_FOCUSED | 2026-03-21**
