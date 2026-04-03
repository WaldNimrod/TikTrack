date: 2026-03-22
historical_record: true

# Team 61 — Dashboard Mandate | Canary Run Continuation
## TEAM_61_S003_P013_CANARY_DASHBOARD_MANDATE_v1.0.0

**From:** Team 100 (Chief Architect — Claude Code)
**To:** Team 61 (AOS Full-Stack Implementor)
**Date:** 2026-03-22
**Priority:** CRITICAL — blocks canary run continuation
**Status:** MANDATE_ISSUED — immediate execution required

---

## Context

S003-P013-WP001 canary monitored run is at **GATE_2 Phase 2.2**. The pipeline has been corrected (KB-77, KB-78 partial fix) and the dashboard must be updated to correctly display phase state and resolve team owners dynamically.

Team 61 owns agents_os UI (`agents_os/ui/`). All changes in this mandate are within Team 61's scope.

---

## Mandatory Deliverables (4 items — all required for PASS)

### M-01 — Phase step badge in "current step" banner

**File:** `agents_os/ui/js/pipeline-dashboard.js`
**Function:** `buildCurrentStepBanner()` (or wherever the banner is assembled)

**Current behavior:** Phase badge renders only if `state.current_phase` is set. Backend now sets `current_phase` on all gate advances. The banner displays it if present — this part is correct.

**Required addition:** Alongside the phase badge, display the **phase-level team actor** resolved from `_DOMAIN_PHASE_ROUTING` (or its JS equivalent). Currently the banner shows the gate owner (from `DOMAIN_GATE_OWNERS_JS`), not the phase-level actor.

**Spec:**
```
[GATE_2] [Phase 2.2] → Team 10 (Work Plan)
```
- Gate label: `GATE_2` (existing)
- Phase badge: `Phase 2.2` (already displayed if current_phase set — verify)
- Phase actor: resolved from phase routing table, shown as `→ Team 10 (Work Plan)`

**Implementation guidance:**
Add a JS function `resolvePhaseActor(gate, phase, domain, variant)` that reads from a JS constant mirroring `_DOMAIN_PHASE_ROUTING`. Minimal version for canary — just the GATE_2 phases:
```javascript
const PHASE_ACTORS = {
  "GATE_2": {
    "2.2":  { "tiktrack": "team_10", "agents_os": "team_11", "default": "team_10" },
    "2.2v": { "default": "team_90" },
    "2.3":  { "default": "lod200_author_team" },  // resolves from state.lod200_author_team
  },
  "GATE_3": {
    "3.1":  { "tiktrack": "team_10", "agents_os": "team_11", "default": "team_10" },
    "3.2":  { "tiktrack": "teams_20_30", "agents_os": "team_61", "default": "team_61" },
    "3.3":  { "tiktrack": "team_50", "agents_os": "team_51", "default": "team_51" },
  },
  "GATE_4": {
    "4.1":  { "default": "team_90" },
    "4.2":  { "default": "lod200_author_team" },
    "4.3":  { "default": "team_00" },  // HUMAN GATE — Nimrod
  },
};
```
For GATE_2 Phase 2.2 on tiktrack: resolves to `team_10`.
For `lod200_author_team`: read from `state.lod200_author_team` (already in pipeline_state).

**AC-M01-01:** Banner shows phase actor alongside phase badge when `current_phase` is set.
**AC-M01-02:** For `lod200_author_team` sentinel, banner resolves to `state.lod200_author_team` value.
**AC-M01-03:** When `current_phase` is null/absent, banner shows gate owner (existing behavior unchanged).

---

### M-02 — GATE_2 phase step indicator (stepper)

**File:** `agents_os/ui/js/pipeline-dashboard.js`
**Location:** Render below the current step banner when gate = GATE_2

**Spec:** Horizontal stepper showing GATE_2 phases with current phase highlighted:
```
Phase 2.2 [Work Plan] → Phase 2.2v [WP Validation] → Phase 2.3 [Arch Review]
                 ↑ (current — highlighted)
```

**Implementation:**
- Only render when `state.current_gate === "GATE_2"` and `state.current_phase` is set
- Use existing CSS variables (`--success`, `--warning`, `--body-bg`, etc.) for consistency
- Active phase: highlight with `var(--success)` or primary color
- Completed phases: greyed out with checkmark
- Future phases: neutral/muted

**AC-M02-01:** Stepper renders for GATE_2 only.
**AC-M02-02:** Active phase matches `state.current_phase`.
**AC-M02-03:** No stepper renders when `state.current_gate !== "GATE_2"`.
**AC-M02-04:** Uses existing CSS variables — no new CSS files.

---

### M-03 — DOMAIN_GATE_OWNERS_JS sync + dynamic lod200_author_team display

**File:** `agents_os/ui/js/pipeline-config.js`

**Current state:** DOMAIN_GATE_OWNERS_JS already updated by Team 100 (KB-77 fix applied directly).
No further changes needed to the constant itself.

**Required:** Wherever the gate owner is displayed in the sidebar ("Canonical Files" or "Gate Owner" panel), when the owner resolves to `lod200_author_team`, display `state.lod200_author_team` value (e.g. `team_102`) with a note `(lod200_author_team → team_102)`.

**AC-M03-01:** `lod200_author_team` sentinel never shown raw in UI — always resolved to the actual team.
**AC-M03-02:** If `state.lod200_author_team` is absent, show `team_100` as fallback.

---

### M-04 — Regenerate GATE_2 prompt after phase fix

**This is a runtime step, not a code change. Instructions for Team 61:**

After M-01 through M-03 are implemented, the dashboard must be refreshed to show:
- `GATE_2 / Phase 2.2`
- Phase actor: `team_10` (TikTrack Work Plan)
- Stepper showing 2.2 → 2.2v → 2.3

Verify by opening the agents_os dashboard and confirming the current step banner shows these values. The pipeline prompt file already updated (`tiktrack_GATE_2_prompt.md` will be regenerated on next `./pipeline_run.sh`).

**AC-M04-01:** Dashboard shows `GATE_2 / Phase 2.2` with `team_10` as actor.
**AC-M04-02:** Stepper shows Phase 2.2 highlighted.

---

## Out of Scope (S003-P011)

- Full prompt quality improvements for Phase 2.2/2.2v/2.3
- Mandate tracking UI (Phase 3.1 display)
- GATE_3/GATE_4/GATE_5 steppers (implement after GATE_2 stepper is validated)

---

## Acceptance Criteria Summary

| AC | Description | Gate |
|---|---|---|
| M01-01 | Banner shows phase actor alongside phase badge | GATE_2 |
| M01-02 | lod200_author_team sentinel resolves from state | GATE_2 |
| M01-03 | No regression when current_phase is null | All |
| M02-01 | Phase stepper renders for GATE_2 | GATE_2 |
| M02-02 | Active phase matches state.current_phase | GATE_2 |
| M02-03 | No stepper for non-GATE_2 gates | All |
| M02-04 | Uses existing CSS variables only | GATE_2 |
| M03-01 | lod200_author_team sentinel never shown raw | All |
| M03-02 | Fallback = team_100 when state.lod200_author_team absent | All |
| M04-01 | Dashboard shows GATE_2/Phase 2.2/team_10 | GATE_2 |
| M04-02 | Stepper shows 2.2 highlighted | GATE_2 |

---

## Verdict Save Path

```
_COMMUNICATION/team_61/TEAM_61_S003_P013_CANARY_DASHBOARD_VERDICT_v1.0.0.md
```

JSON block at top:
```json
{
  "gate_id": "GATE_2_PHASE_2.2_DASHBOARD",
  "decision": "PASS",
  "blocking_findings": [],
  "mandate_ref": "TEAM_61_S003_P013_CANARY_DASHBOARD_MANDATE_v1.0.0"
}
```

---

**log_entry | TEAM_100 | TEAM_61_MANDATE | CANARY_DASHBOARD_MANDATE | S003_P013_WP001 | GATE_2_PHASE_2_2 | ISSUED | 2026-03-22**
