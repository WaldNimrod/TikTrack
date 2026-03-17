---
id: TEAM_00_TO_TEAM_51_S002_P005_COMBINED_VALIDATION_v1.0.0
from: Team 00 (Chief Architect — Nimrod)
to: Team 51 (AOS QA & Functional Acceptance)
cc: Team 100, Team 90
date: 2026-03-17
status: ACTIVE
authority: TEAM_00_CONSTITUTIONAL_MANDATE
covers: S002-P005-WP002 (first formal QA) + WP003 PWA runtime + WP004 regression
reference: ARCHITECT_DECISION_S002_P005_FINAL_STATE_v1.0.0.md §C
---

# Combined Validation Mandate — S002-P005 Final Pass

---

## Context

Three work packages require validation before S002-P005 can close:

| WP | Status | What's needed |
|----|--------|---------------|
| **WP002** | Delivered but never formally QA'd | First QA pass — full AC verification |
| **WP003** | GATE_6 PASS with 3 PWA runtime items | Runtime scenario execution |
| **WP004** | GATE_6 PASS (clean) | Regression confirmation |

Run all blocks in a single session. Environment: `localhost:8090`.

---

## Block 1 — WP002 PASS_WITH_ACTION Lifecycle (AC-01..AC-09)

Use `--domain agents_os` throughout. Document exact state of `pipeline_state_agentsos.json` after each step.

### B1-01 — Issue PASS_WITH_ACTION (AC-01)

```bash
./pipeline_run.sh --domain agents_os pass_with_actions "ACTION-A|ACTION-B"
```

**Pass:** `pipeline_state_agentsos.json` contains:
```json
"gate_state": "PASS_WITH_ACTION",
"pending_actions": ["ACTION-A", "ACTION-B"]
```
`current_gate` is **unchanged** (gate held).

---

### B1-02 — Gate advance blocked (AC-02)

```bash
./pipeline_run.sh --domain agents_os pass
```

**Pass:** Command returns error/non-zero exit. Clear message indicating gate is in PASS_WITH_ACTION state. Gate does NOT advance.

---

### B1-03 — Dashboard banner renders (AC-05)

Refresh dashboard. Observe:

| Element | Pass condition |
|---------|----------------|
| Yellow PWA banner visible | Either sidebar panel or gate context panel (or both) |
| `data-testid="pending-actions-panel"` in DOM | Yes |
| "ACTION-A" listed | Visible in banner |
| "ACTION-B" listed | Visible in banner |

---

### B1-04 — "Actions Resolved" button (AC-06)

In the PWA banner:

**Pass:** "✅ Actions Resolved" button present. On click / hover: generates `./pipeline_run.sh --domain agents_os actions_clear`.

---

### B1-05 — "Override & Advance" button (AC-07)

In the PWA banner:

**Pass:** "⚡ Override & Advance" button present. Requires reason text input. Generates `./pipeline_run.sh --domain agents_os override "..."`.

---

### B1-06 — actions_clear (AC-03)

```bash
./pipeline_run.sh --domain agents_os actions_clear
```

**Pass:** `gate_state` → `null`; `pending_actions` → `[]`; gate advances to next gate.

---

### B1-07 — override (AC-04)

```bash
./pipeline_run.sh --domain agents_os pass_with_actions "ACTION-C"
./pipeline_run.sh --domain agents_os override "QA combined validation test"
```

**Pass:** Gate advances; `override_reason = "QA combined validation test"` stored in state.

---

### B1-08 — state_reader parses gate_state (AC-08)

```bash
./pipeline_run.sh --domain agents_os pass_with_actions "STATE-TEST"
./pipeline_run.sh --domain agents_os status
```

**Pass:** Status output shows `gate_state = PASS_WITH_ACTION` or equivalent parsed field. No Python exception.

---

### B1-09 — insist command

```bash
./pipeline_run.sh --domain agents_os pass_with_actions "INSIST-TEST"
./pipeline_run.sh --domain agents_os insist
```

**Pass:** Gate stays at current gate. Correction prompt generated or acknowledged. No crash.

---

## Block 2 — WP003 PWA Runtime Scenarios

### B2-01 — CS-07: COMPLETE gate safe path (PWA-01)

Manually set `pipeline_state_agentsos.json`:
```json
"current_gate": "COMPLETE"
```
Refresh dashboard → observe prompt section.

**Pass:**
- Clean informational message rendered (e.g., "No prompt for COMPLETE gate")
- `data-testid="gate-complete-message"` present in DOM
- No JS exception in console
- No 404 error

---

### B2-02 — CS-05: Roadmap conflict banner (PWA-02)

Use S001-P002 scenario (program `status=ACTIVE` in stage that may be `COMPLETE`).

Load roadmap page. Verify:

**Pass (either A or B):**
- **A:** `data-testid="roadmap-stage-conflict-banner"` visible with conflict message
- **B:** `AUTHORIZED_STAGE_EXCEPTIONS` entry shown for S001-P002 (exception registered, no banner needed)

---

### B2-03 — CS-08: Snapshot freshness — yellow (PWA-03)

Modify `STATE_SNAPSHOT.json` field `produced_at_iso` to a timestamp 2 hours ago.
Refresh dashboard.

**Pass:** Freshness badge shows warning state (`sf-yellow` CSS class); `data-testid="snapshot-freshness-badge"` present.

---

### B2-04 — CS-08: Snapshot freshness — red (PWA-03)

Modify `STATE_SNAPSHOT.json` field `produced_at_iso` to a timestamp 25 hours ago.
Refresh dashboard.

**Pass:** Freshness badge shows critical state (`sf-red` CSS class).

Restore `produced_at_iso` to current time after test.

---

## Block 3 — WP004 Regression

### B3-01 — G5_DOC_FIX absent

Inspect gate selector / gate list in dashboard. Open browser devtools → confirm `G5_DOC_FIX` absent from rendered gate options.

**Pass:** `G5_DOC_FIX` does not appear anywhere in the UI.

---

### B3-02 — Team 10 label

Navigate to mandate tab / Teams page. Find Team 10 reference.

**Pass:** Label reads "Work Plan Generator". No "Orchestrator" text.

---

### B3-03 — PASS_WITH_ACTION button visibility

Navigate to a **VALIDATION gate** (e.g., G3_5, GATE_4, GATE_5):

**Pass:** `data-testid="pass-with-action-btn"` visible.

Navigate to an **EXECUTION gate** (e.g., G3_PLAN, CURSOR_IMPLEMENTATION):

**Pass:** Button absent / hidden.

Navigate to a **HUMAN gate** (GATE_7):

**Pass:** Button absent / hidden.

---

## Block 4 — System Regression

| Check | Pass condition |
|-------|----------------|
| Dashboard loads | HTTP 200; no JS console errors |
| Roadmap loads | HTTP 200; program cards visible |
| Teams loads | HTTP 200; both domain rows visible |
| Domain switch TikTrack ↔ Agents_OS | State updates correctly per domain |
| WP003 P0 testids present | `dashboard-provenance-badge`, `primary-state-read-failed` (on error), `teams-domain-row-tiktrack`, `teams-domain-row-agents_os`, `teams-provenance-badge`, `roadmap-provenance-badge` all in DOM |

---

## Return Contract

Write: `_COMMUNICATION/team_51/TEAM_51_S002_P005_COMBINED_QA_REPORT_v1.0.0.md`

Required sections:
- Block 1 results (B1-01..B1-09) with pass/fail per test and evidence
- Block 2 results (B2-01..B2-04)
- Block 3 results (B3-01..B3-03)
- Block 4 regression table
- Overall verdict: `QA_PASS` or `QA_FAIL`
- Blocking findings (if any) with exact test ID

**Pass threshold:** All of Block 1 must PASS. All of Block 3 must PASS. Block 2 and Block 4 may have PARTIAL items flagged (not blocking) if documented.

After QA_PASS: Team 100 issues GATE_6 approval for WP002. Then combined GATE_8.

---

**log_entry | TEAM_00 | S002_P005_COMBINED_VALIDATION_MANDATE | ISSUED_TO_TEAM_51 | 2026-03-17**
