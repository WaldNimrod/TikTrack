---
id: TEAM_00_TO_TEAM_61_S003_P012_WP003_MANDATE_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect) / Team 00 (System Designer)
to: Team 61 (AOS TRACK_FOCUSED Unified Implementor)
cc: Team 51, Team 90, Team 170
date: 2026-03-21
status: ISSUED — IMMEDIATE EXECUTION
work_package_id: S003-P012-WP003
program_id: S003-P012
gate_id: GATE_1 → GATE_5 (full cycle)
project_domain: agents_os
subject: Dashboard UI Stabilization — KB-42..49 fixes---

# Team 61 | S003-P012-WP003 Mandate
# Dashboard UI Stabilization

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P012 |
| work_package_id | S003-P012-WP003 |
| project_domain | agents_os |
| process_variant | TRACK_FOCUSED |
| gate_sequence | GATE_1 → GATE_2 → GATE_3 → GATE_4 → GATE_5 |
| implementor | Team 61 |
| qa_owner | Team 51 |
| authority | Team 100 / Team 00 |

---

## §1 — Context

WP001 (SSOT) and WP002 (Prompt Quality) are DOCUMENTATION_CLOSED.
WP003 was unlocked by Team 100 GATE_8 FULL PASS (2026-03-21).

During the S003-P003 test flight (2026-03-21), the Dashboard UI revealed a set of bugs
registered as KB-2026-03-21-42..49. This WP addresses them in priority order.

**Pipeline initialization:**
```bash
# WP003 is the next WP — pipeline is currently at COMPLETE for WP002.
# No CLI init needed — directly advance with this mandate as GATE_1 spec.
```

---

## §2 — Scope (KB priority order)

### TIER 1 — IMMEDIATE (P0: ship first, non-negotiable)

#### KB-44 — Light Mode Fix (CRITICAL — dashboard unusable in TikTrack domain)

**Problem:** TikTrack domain renders in light mode. `current-step-banner` header text is
white-on-white (unreadable). Card titles and step labels invisible. Affects usability of
all monitoring sessions.

**Fix location:** `agents_os/ui/css/` — color variables; `.current-step-banner`,
`.card-header`, step-label classes.

**Requirement:**
- TikTrack domain renders in the SAME dark theme as agents_os domain
- No hardcoded white text on white/light backgrounds anywhere in the UI
- Both domains must pass visibility check: all text elements have contrast ratio ≥ 4.5:1

**Acceptance:** Screenshot of TikTrack domain dashboard showing readable dark-theme text.
`data-testid="domain-theme-tiktrack"` on the root domain container (add if absent).

---

#### KB-46 — Quick Commands Confirmation Dialog (CRITICAL — misclick destroys pipeline state)

**Problem:** Pass / Fail / Approve buttons in Quick Commands panel execute immediately.
No confirmation, no gate display, no double-click prevention. One misclick = permanent
pipeline state advance. Observed during test flight.

**Fix location:** `agents_os/ui/js/` — quick-commands panel handlers.

**Requirement:**
1. Every destructive action (pass, fail, approve, override) must show a modal confirmation:
   - Display: current gate + current WP + action being taken
   - Two buttons: "Confirm [ACTION]" (proceed) and "Cancel" (dismiss)
   - Confirmation button must be visually distinct (color/label) from cancel
2. `data-testid="quick-cmd-confirm-modal"` on the modal container
3. `data-testid="quick-cmd-confirm-btn"` on the confirm button
4. `data-testid="quick-cmd-cancel-btn"` on the cancel button
5. Double-execution prevention: disable confirm button for 2s after first click

---

### TIER 2 — HIGH (P1: ship in same delivery, before QA handoff)

#### KB-42 — Team 60 Missing from GATE_3 TRACK_FULL Routing (BLOCKING — pipeline correctness)

**Problem:** `_DOMAIN_PHASE_ROUTING["GATE_3"]["3.2"]["tiktrack"]` routes to `"teams_20_30_40"` —
missing Team 60 (DevOps/CI). Team 60 is a required participant in TRACK_FULL GATE_3
implementation. Missing from `_resolve_phase_owner()` expansion.

**Fix location:** `agents_os_v2/orchestrator/pipeline.py` — `_DOMAIN_PHASE_ROUTING` +
`"teams_20_30_40"` expansion dict.

**Requirement:**
1. Add `"tiktrack"` routing entry for GATE_3/3.2 that includes Team 60:
   `"teams_20_30_40_60"` (or similar canonical label)
2. Add expansion entry in `_resolve_phase_owner()` for `"teams_20_30_40_60"`
3. Generated GATE_3 mandate for TikTrack TRACK_FULL must list Team 60 in the mandate step

**Test:**
```bash
python3 -c "
from agents_os_v2.orchestrator.pipeline import _resolve_phase_owner
result = _resolve_phase_owner('tiktrack', 'TRACK_FULL', 'GATE_3', '3.2')
assert 'team_60' in result.lower() or '60' in result, f'team_60 missing: {result}'
print('PASS:', result)
"
```

---

#### KB-47 — Expected Output Files Card (HIGH — primary progress tracking tool)

**Problem:** Expected Output Files card is empty across all phases. Canonical file naming
conventions are now established. This card is the operator's real-time progress tracker.

**Fix location:** `agents_os/ui/js/` — expected-outputs renderer; requires file-existence
check against `_COMMUNICATION/` tree (via STATE_SNAPSHOT or direct fetch).

**Requirement:**
1. For the current active WP and gate, derive the expected file names using the canonical
   naming pattern: `TEAM_{N}_{WP_ID}_{GATE_ID}_{TYPE}_v1.0.0.md`
2. For each expected file: show filename + existence status (✓ exists / ✗ missing) + link
   if exists
3. Files are checked by attempting a `HEAD` fetch against the `_COMMUNICATION/` path, OR
   by reading the `expected_artifacts` field from STATE_SNAPSHOT if present
4. `data-testid="expected-output-files-card"` on the card container
5. `data-testid="expected-file-row"` on each file row (one per expected file)
6. `data-testid="expected-file-exists"` / `data-testid="expected-file-missing"` on status
   indicator

---

#### KB-43 — Feature Spec Card Shows "No spec loaded" (HIGH — primary UX gap)

**Problem:** Feature Spec card shows "No spec loaded" even when `spec_path` is correctly
set in `pipeline_state_*.json`. Card reads wrong field or fails to fetch spec content.

**Fix location:** `agents_os/ui/js/` — dashboard spec loader.

**Requirement:**
1. Read `spec_path` from pipeline state
2. Fetch the content of that file (via relative URL)
3. Display at minimum: first 500 chars of the file, or the `spec_brief` field if fetch fails
4. `data-testid="feature-spec-card"` on the card
5. `data-testid="spec-content"` on the content element (must not be empty when spec_path set)

---

### TIER 3 — MEDIUM/LOW (P2: include if time allows; defer to WP004 if not)

#### KB-45 — Gate Context Card (MEDIUM — evaluate before implementing)

**Problem:** Gate Context card renders but shows no data. `gate_context` field in pipeline
state is never populated.

**Decision (Team 100):** Do NOT remove. Populate with the following minimal content:
- Gate ID (current_gate)
- Gate description (from GATE_META in pipeline.py — can be hardcoded in config.js)
- Phase owner team
- Process variant

`data-testid="gate-context-card"` + `data-testid="gate-context-content"`.

---

#### KB-48 — Event Log Expandable Rows (MEDIUM)

**Problem:** Event Log shows flat one-line entries. Full event details not accessible.

**Fix:**
1. Each log row is clickable → expands to show full event JSON / full message
2. Copy-to-clipboard button per expanded row
3. `data-testid="event-log-row"` + `data-testid="event-log-expand-btn"` per row

---

#### KB-49 — Identity Injection QA (MEDIUM — Team 51 task, not Team 61)

**Scope clarification:** KB-49 is executed by Team 51 AFTER Team 61 delivery.
Team 51 runs a dedicated browser QA session across all 3 dashboard pages.
Team 61 has no implementation task for KB-49 — only ensure identity fields are being
written to STATE_SNAPSHOT correctly (they should be from WP001 SSOT implementation).

---

### OUT OF SCOPE for WP003

| KB | Reason |
|---|---|
| KB-40 (state file path restructure) | Architecture decision needed; WP004 scope |
| KB-41 (MandateStep naming) | Naming refactor; low risk to defer; WP004 scope |
| KB-54 (artifact submission detection) | Infrastructure feature; WP005 scope |

---

## §3 — Files to Modify

| File | KBs addressed |
|---|---|
| `agents_os/ui/css/*.css` (color/theme) | KB-44 |
| `agents_os/ui/js/pipeline-dashboard.js` | KB-43, KB-46, KB-47, KB-48 |
| `agents_os/ui/js/pipeline-config.js` or equivalent | KB-45, KB-47 (expected files config) |
| `agents_os/ui/js/quick-commands.js` (or inline) | KB-46 |
| `agents_os_v2/orchestrator/pipeline.py` | KB-42 |
| HTML files (if data-testid anchors missing) | KB-43..47 |

---

## §4 — Acceptance Criteria

### Team 61 delivery PASS when ALL P0+P1 items met:

| ID | Criterion | How to verify |
|---|---|---|
| AC-01 | KB-44: TikTrack domain readable (dark theme) | Screenshot — no white-on-white text |
| AC-02 | KB-46: Confirm dialog appears before all destructive actions | Browser test — click pass/fail/approve → modal shown |
| AC-03 | KB-46: `data-testid="quick-cmd-confirm-modal"` present in DOM | `document.querySelector('[data-testid="quick-cmd-confirm-modal"]')` |
| AC-04 | KB-42: Team 60 in TikTrack TRACK_FULL GATE_3 routing | Python assertion (§2) |
| AC-05 | KB-47: Expected files card shows ≥1 row with existence status | Browser + DOM check |
| AC-06 | KB-43: Spec card not empty when `spec_path` set | Load TikTrack domain → spec card shows content |
| AC-07 | pytest regression | `python3 -m pytest agents_os_v2/tests/ -q` → same or better than 157 passed, 4 skipped |
| AC-08 | No JS console errors at load | `console.error` count = 0 on dashboard load |

### P2 items (if implemented):

| ID | Criterion |
|---|---|
| AC-09 | KB-45: Gate Context card shows gate ID + description + owner |
| AC-10 | KB-48: Event log rows expandable; copy button works |

---

## §5 — Execution Order

```
STEP 1  Read this mandate + all referenced KB entries in KNOWN_BUGS_REGISTER.
        Read current dashboard files to understand existing structure before touching.

STEP 2  Fix KB-44 (CSS/theme) — isolated, low risk, highest UX impact.
        → Verify in browser: TikTrack domain readable.

STEP 3  Fix KB-46 (confirmation dialog) — JS only, no state changes.
        → Verify: pass/fail/approve buttons show modal.

STEP 4  Fix KB-42 (pipeline.py routing) — surgical dict change + expansion entry.
        → Verify: Python assertion passes.

STEP 5  Fix KB-47 (Expected Output Files) — JS + config.
        → Verify: card shows rows with existence status.

STEP 6  Fix KB-43 (Spec card) — JS fetch fix.
        → Verify: spec content loads.

STEP 7  KB-45, KB-48 (P2, if time allows).

STEP 8  Run: python3 -m pytest agents_os_v2/tests/ -q
        All pre-existing tests must pass.

STEP 9  Write delivery artifact:
        _COMMUNICATION/team_61/TEAM_61_S003_P012_WP003_DELIVERY_v1.0.0.md
        (identity header + AC evidence table + SOP-013 seal + Team 51 handover prompt)

STEP 10 Trigger Team 51 per §6.
```

---

## §6 — Canonical Validation Chain

| Order | Team | Trigger artifact |
|---|---|---|
| 1 | **Team 61** | Deliver: `TEAM_61_S003_P012_WP003_DELIVERY_v1.0.0.md` |
| 2 | **Team 51** | QA per `TEAM_51_S003_P012_WP003_GATE3_CANONICAL_PROMPT_v1.0.0.md` (write this in §9) |
| 3 | **Team 90** | Adversarial validation per `TEAM_90_S003_P012_WP003_GATE4_CANONICAL_PROMPT_v1.0.0.md` |
| 4 | **Team 100** | GATE_5 closure (Team 100 reads Team 90 verdict → issues GATE_8 FULL PASS) |

**Team 61 must write the canonical trigger prompts for Teams 51, 90, 100** as part of the
delivery (same pattern as WP002 — see `TEAM_61_WP002_DELIVERY_v1.0.0.md §5`).

---

## §7 — Team 51 Scope (KB-49 + AC verification)

Team 51 QA session covers:
1. AC-01..AC-08 browser verification across TikTrack + agents_os domains
2. KB-49: Dedicated identity injection check — WSM identity header, active WP display,
   canonical routing section on all 3 pages (Dashboard / Roadmap / Pipeline)
3. Output: `TEAM_51_S003_P012_WP003_GATE3_QA_REPORT_v1.0.0.md` with FAIL_CMD if FAIL

---

## §8 — HITL Boundary (KB-64)

Nimrod is NOT available for real-time clarifications during implementation.
If a scope question arises: document assumption in delivery artifact → flag in SOP-013 seal.
If a blocking ambiguity arises: escalate via FAIL with `--finding_type unclear`.

---

## §9 — SOP-013 Seal (required in delivery)

```
--- PHOENIX TASK SEAL (SOP-013) ---
TASK_ID:       S003-P012-WP003
STATUS:        COMPLETED
FILES_MODIFIED:
  - [list all modified files]
PRE_FLIGHT:
  - pytest agents_os_v2/tests/ (N passed, M skipped)
  - Dashboard loads without JS errors (TikTrack + agents_os)
HANDOVER_PROMPT:
  Team 51: run QA per _COMMUNICATION/team_51/TEAM_51_S003_P012_WP003_GATE3_CANONICAL_PROMPT_v1.0.0.md
--- END SEAL ---
```

---

**log_entry | TEAM_100 | TO_TEAM_61 | S003_P012_WP003_MANDATE | ISSUED | KB-42..49 | 2026-03-21**
