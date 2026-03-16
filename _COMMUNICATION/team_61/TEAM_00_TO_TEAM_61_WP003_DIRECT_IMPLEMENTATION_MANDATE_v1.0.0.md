---
id: TEAM_00_TO_TEAM_61_WP003_DIRECT_IMPLEMENTATION_MANDATE_v1.0.0
from: Team 00 (Chief Architect — Nimrod)
to: Team 61 (Cursor Cloud Agent — Implementation)
cc: Team 51, Team 100
date: 2026-03-16
status: ACTIVE — IMMEDIATE EXECUTION
gate_id: DIRECT_MANDATE (bypasses G3_5 pipeline gate)
program_id: S002-P005
work_package_id: S002-P005-WP003
project_domain: AGENTS_OS
authority: TEAM_00_DIRECT_MANDATE
---

# Direct Implementation Mandate — S002-P005-WP003
# AOS State Alignment & Governance Integrity

---

## ⚠️ Bypass Authorization

This mandate is issued **directly by Team 00 (Chief Architect)** and bypasses the standard G3_5 pipeline gate validation.

**Reason for bypass:** Pipeline dashboard advancement was stalled due to tooling/UX issues unrelated to the substance of this work package. The work plan (v1.1.0) is approved. Spec (LLD400 v1.0.0) is locked.

**Authority:** Team 00 constitutional authority — direct mandate supersedes gate state for this WP.

**Return path:** Team 61 implements → Team 51 QA → Team 61 delivers `TEAM_61_S002_P005_WP003_IMPLEMENTATION_COMPLETE_v1.0.0.md` → Team 51 delivers `TEAM_51_S002_P005_WP003_QA_REPORT_v1.0.0.md` → submit both to Team 00 for review.

---

## 1. Scope

**WP:** S002-P005-WP003 — AOS State Alignment & Governance Integrity

**What this WP fixes:**

| ID | Problem | Fix |
|----|---------|-----|
| **CS-02** | Gate IDs can appear simultaneously in `gates_completed` and `gates_failed` | Contradiction invariant in pipeline.py |
| **CS-03** | On fetch failure, dashboard falls back to legacy/alternate source instead of showing error | `PRIMARY_STATE_READ_FAILED` error panel; eliminate fallback |
| **CS-04** | Python `state.py` reads legacy file when domain file missing | Remove legacy read; return `NO_ACTIVE_PIPELINE` sentinel |
| **CS-05** | No conflict banner when active program is in completed stage | Conflict banner in Roadmap page |
| **CS-08** | No freshness indicator for STATE_SNAPSHOT.json age | Freshness badge (green / yellow / red by age) |
| **SA-01** | Teams page shows only one domain row | Dual-domain rows (tiktrack + agents_os) with separate WP/Gate per domain |
| **P0-01** | No provenance badges on any page | `[source]` / `[live: domain]` / `[registry_mirror]` badges on Dashboard, Roadmap, Teams |
| **AC-CS-06** | EXPECTED_FILES idle state not updated in config | `pipeline-config.js` EXPECTED_FILES aligned to active WP |

**Domain:** AGENTS_OS
**No HTTP API** — contracts are CLI commands, static JSON fetch, Python module entry points.

---

## 2. Locked Specs

**LLD400:** `_COMMUNICATION/team_170/TEAM_170_S002_P005_WP003_LLD400_v1.0.0.md`

**Work Plan:** `_COMMUNICATION/team_10/TEAM_10_S002_P005_WP003_G3_PLAN_WORK_PLAN_v1.1.0.md`

Both are **locked and authoritative.** If you find a discrepancy between them, LLD400 takes priority. Do not re-interpret or extend scope.

---

## 3. Pre-Implementation: Contract Verify (BLOCKING)

Before writing any code, verify contracts against the actual codebase.

### 3.1 Verify CLI Surface

Read `pipeline_run.sh` case statement (lines ~342–920). Confirm these commands exist:

| Command | Expected behavior |
|---------|------------------|
| `./pipeline_run.sh --domain agents_os pass` | Advance gate PASS |
| `./pipeline_run.sh --domain agents_os fail "reason"` | Advance gate FAIL |
| `./pipeline_run.sh --domain agents_os status` | Show status |
| `./pipeline_run.sh --domain agents_os store G3_PLAN <file>` | Store artifact |
| `./pipeline_run.sh --domain agents_os phase2` | Phase 2 auto-store |
| `./pipeline_run.sh --domain agents_os pass_with_actions "a1\|a2"` | PASS_WITH_ACTION |

**NOT in pipeline_run.sh:** `new`, `sync` — document this gap.

### 3.2 Verify JSON Schema

Read `_COMMUNICATION/agents_os/pipeline_state_agentsos.json`. Confirm fields:
`work_package_id, current_gate, gates_completed, gates_failed, project_domain, spec_brief, lld400_content, work_plan, mandates, last_updated, gate_state, pending_actions, phase8_content`

### 3.3 Output

Write: `_COMMUNICATION/team_61/TEAM_61_S002_P005_WP003_CONTRACT_VERIFY_v1.0.0.md`
- Brief: confirmed CLI commands, confirmed schema, documented gaps.
- This file is REQUIRED before implementation starts.

---

## 4. Implementation — Files to Modify

### Priority order: P0 first, then P1. Commit P0 separately from P1.

---

### 4.1 P0 — Must ship (gates block on these)

#### 4.1.1 `agents_os_v2/orchestrator/pipeline.py` — CS-02 Gate Contradiction Fix

**Problem:** After gate transitions, a gate ID can appear in both `gates_completed` and `gates_failed` simultaneously.

**Fix:** In `_advance_gate()` or wherever gate state is mutated, add invariant check:
```python
# After any mutation of gates_completed or gates_failed:
contradiction = set(state.gates_completed) & set(state.gates_failed)
if contradiction:
    raise ValueError(f"Gate contradiction detected: {contradiction} in both completed and failed")
# Or: silently deduplicate (remove from one list when added to other)
```

Choose the approach that fits the existing pattern. Check `state.py` for where these lists are mutated.

**Test:** `./pipeline_run.sh --domain agents_os pass` then check state JSON — no gate in both lists.

---

#### 4.1.2 `agents_os_v2/orchestrator/state.py` — CS-03/CS-04 Fallback Removal

**Problem:** `PipelineState.load()` (or equivalent) falls back to a legacy JSON file when the domain-specific file is missing.

**Fix:**
1. Remove the legacy fallback path entirely.
2. When domain file is missing, return a sentinel: `NO_ACTIVE_PIPELINE` state (not an exception, not legacy data).
3. The sentinel must have `is_active = False` and `work_package_id = "NONE"` or equivalent.

**Check current code:** Find where legacy fallback exists:
```bash
grep -n "legacy\|fallback\|pipeline_state\.json" agents_os_v2/orchestrator/state.py
```

**Test:** Run QA-P0-06 (rename domain file, call `PipelineState.load()`, verify sentinel returned).

---

#### 4.1.3 `agents_os/ui/js/pipeline-state.js` — CS-03 Frontend Error Panel

**Problem:** When `loadDomainState()` fetch fails, the dashboard silently falls back or shows nothing.

**Fix:**
1. On any fetch failure for the primary domain state file, set a `PRIMARY_STATE_READ_FAILED` error state.
2. This error state must cause the UI to render `<div data-testid="primary-state-read-failed">` prominently.
3. NO fallback to `pipeline_state.json` (legacy) — eliminate this path.

**Check current code:**
```bash
grep -n "fallback\|legacy\|pipeline_state\.json\|catch\|error" agents_os/ui/js/pipeline-state.js
```

---

#### 4.1.4 `agents_os/ui/js/pipeline-dashboard.js` — P0-01 Provenance Badges + CS-03 Panel

**P0-01 — Provenance badges:**
Every data display section that reads from a specific source must show a badge indicating source provenance. Minimum:
- Header area or state summary: `[live: agents_os]` or `[live: tiktrack]` — indicates which domain state file was loaded
- If data is from STATE_SNAPSHOT.json: `[snapshot]` or `[registry_mirror]`

Badge element must have: `data-testid="dashboard-provenance-badge"`

**CS-03 — Error panel:**
Add a conditionally-rendered error panel:
```html
<div data-testid="primary-state-read-failed" style="display:none">
  ⚠️ PRIMARY STATE READ FAILED — domain state file not accessible.
  No fallback is used. Check: _COMMUNICATION/agents_os/pipeline_state_[domain].json
</div>
```
Show this panel when `pipeline-state.js` sets `PRIMARY_STATE_READ_FAILED`.

**data-testid anchors** (from LLD400 §4.3 — add all that are specified there):
Read LLD400 §4.3 for the full list. At minimum:
- `data-testid="dashboard-provenance-badge"`
- `data-testid="primary-state-read-failed"`
- `data-testid="gate-complete-message"` (shown when current_gate = COMPLETE)

---

#### 4.1.5 `agents_os/ui/js/pipeline-roadmap.js` — P0-01 Provenance Badges

**P0-01:** Add provenance badge to program cards. Badge must indicate data source.

`data-testid="roadmap-provenance-badge"` on each program card that carries provenance info.

Read LLD400 for exact field/badge spec.

---

#### 4.1.6 `agents_os/ui/js/pipeline-teams.js` — SA-01 Dual-Domain Rows + P0-01 Badges

**SA-01 — Dual-domain rows:**
The Teams page must show **two domain rows** — one for `tiktrack`, one for `agents_os`. Each row must independently show:
- Domain name
- Current WP (or "No active WP")
- Current gate (or "—")
- Owner team

DOM anchors:
- `data-testid="teams-domain-row-tiktrack"`
- `data-testid="teams-domain-row-agents_os"`

Each row must also carry a provenance badge (`data-testid="teams-provenance-badge"`).

The data for each row comes from `pipeline_state_tiktrack.json` and `pipeline_state_agentsos.json` respectively — loaded independently.

---

#### 4.1.7 HTML Files — data-testid Anchors

Add/confirm `data-testid` attributes per LLD400 §4.3 in:
- `agents_os/ui/PIPELINE_DASHBOARD.html`
- `agents_os/ui/PIPELINE_ROADMAP.html`
- `agents_os/ui/PIPELINE_TEAMS.html`

These are static HTML anchors for QA automation. Do NOT add runtime logic to HTML files.

---

#### 4.1.8 `agents_os/ui/js/pipeline-config.js` — AC-CS-06 EXPECTED_FILES

**Problem:** `EXPECTED_FILES` (or equivalent config) is not aligned to the active WP.

**Fix:** Read current `EXPECTED_FILES` definition. Align it to the actual expected artifacts for the current active WP structure. This is a config-level change — no logic change.

Check:
```bash
grep -n "EXPECTED_FILES\|expectedFiles\|expected_files" agents_os/ui/js/pipeline-config.js
```

---

### 4.2 P1 — Ship after P0 is working

#### 4.2.1 `agents_os/ui/js/pipeline-roadmap.js` — CS-05 Conflict Banner

**Problem:** When a program is marked ACTIVE but belongs to a COMPLETE stage, no warning is shown.

**Fix:** After loading programs, check: if `program.stage_id` is in the set of completed stages AND `program.status === 'ACTIVE'`, render a conflict banner:
```html
<div data-testid="stage-conflict-banner" class="conflict-banner">
  ⚠️ Stage conflict: program [id] is ACTIVE in completed stage [stage_id]
</div>
```

---

#### 4.2.2 CS-08 — Snapshot Freshness Badge

**Location:** Dashboard or wherever STATE_SNAPSHOT.json age is displayed.

**Fix:** After loading STATE_SNAPSHOT.json, compute age = `now - produced_at_iso` (seconds).
- Age < 600s (10 min): green badge `[live]` or `[fresh]`
- Age 600–3600s: yellow badge `[~N min ago]`
- Age > 3600s: red badge `[stale: Xh ago]`

`data-testid="snapshot-freshness-badge"` on this element.

---

## 5. Implementation Order

```
Phase A (commit separately):
  Step 1. Contract verify → write CONTRACT_VERIFY artifact
  Step 2. CS-02 fix (pipeline.py)
  Step 3. CS-03/CS-04 fix (state.py + pipeline-state.js)
  Step 4. P0-01 provenance badges (dashboard.js + roadmap.js + teams.js)
  Step 5. SA-01 dual-domain rows (teams.js)
  Step 6. data-testid anchors (HTML files + JS)
  Step 7. AC-CS-06 (pipeline-config.js)
  → git commit -m "feat(WP003-P0): state alignment P0 items — CS-02/03/04, SA-01, P0-01"

Phase B (commit separately):
  Step 8. CS-05 conflict banner (roadmap.js)
  Step 9. CS-08 snapshot freshness badge
  → git commit -m "feat(WP003-P1): state alignment P1 items — CS-05, CS-08"
```

---

## 6. Acceptance Criteria

### Team 61 Implementation PASS when ALL of:

| # | Criterion |
|---|-----------|
| P0-01 | Provenance badges present on Dashboard, Roadmap, Teams — `data-testid` anchors confirmed |
| CS-02 | `python3 -c "..."` contradiction check exits 0 after pass/fail cycles |
| CS-03 | `data-testid="primary-state-read-failed"` renders when domain state file missing |
| CS-04 | Python `PipelineState.load()` returns `NO_ACTIVE_PIPELINE` sentinel (not legacy data) when domain file absent |
| SA-01 | `data-testid="teams-domain-row-tiktrack"` and `teams-domain-row-agents_os"` both present |
| AC-CS-06 | EXPECTED_FILES matches actual WP artifact structure |
| data-testid | All LLD400 §4.3 anchors present in HTML/JS |
| Regression | Dashboard, Roadmap, Teams load without JS errors at `localhost:8090` |

---

## 7. Return Path

### After Phase A commit + Phase B commit:

1. Write deliverable artifact:
   `_COMMUNICATION/team_61/TEAM_61_S002_P005_WP003_IMPLEMENTATION_COMPLETE_v1.0.0.md`

   **Required sections:**
   - Identity header (roadmap_id, stage_id, program_id, wp, gate_id, date)
   - Modified files list (file path | change type | purpose)
   - P0 checklist: each criterion ✓/✗ with brief note
   - P1 checklist: each criterion ✓/✗
   - Test evidence: pytest exit code, count, manual UI checks
   - Handover prompt for Team 51

2. Hand off to Team 51 using the handover prompt in your artifact.

3. Team 51 QA: runs all tests per §5 of work plan v1.1.0, writes:
   `_COMMUNICATION/team_51/TEAM_51_S002_P005_WP003_QA_REPORT_v1.0.0.md`

4. Both artifacts submitted to Team 00 (Nimrod) for review.

**Team 00 review gate:** Team 00 will review both artifacts and decide:
- PASS → advance pipeline to GATE_4 / GATE_5 cycle
- FAIL → return specific items to Team 61 for correction

---

## 8. Constraints

| Rule | Detail |
|------|--------|
| No scope creep | Implement only what is in the LLD400 and this mandate. No bonus features. |
| No behavioral changes | Changes to dashboard UX behavior require Team 00 approval first |
| No CSS regressions | CSS/JS changes must not break existing pages |
| No new dependencies | Do not add npm/pip packages |
| AGENTS_OS domain only | These changes are for the pipeline dashboard — not TikTrack application code |
| CS-03 is absolute | NO fallback path — if domain state file is unreadable, show error panel and stop |

---

## 9. References

| Doc | Path |
|-----|------|
| LLD400 (locked spec) | `_COMMUNICATION/team_170/TEAM_170_S002_P005_WP003_LLD400_v1.0.0.md` |
| Work Plan v1.1.0 | `_COMMUNICATION/team_10/TEAM_10_S002_P005_WP003_G3_PLAN_WORK_PLAN_v1.1.0.md` |
| Team 51 QA Mandate | `_COMMUNICATION/team_100/TEAM_100_TO_TEAM_51_STATE_ALIGNMENT_WP003_QA_MANDATE.md` *(to be issued separately)* |
| Gate Architecture | `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GATE_ARCHITECTURE_CANONICAL_v1.0.0.md` |

---

**log_entry | TEAM_00 | WP003_DIRECT_MANDATE | ISSUED | 2026-03-17**
**log_entry | TEAM_00 | BYPASS_REASON | PIPELINE_DASHBOARD_STALL | 2026-03-17**
**log_entry | TEAM_00 | AUTHORITY | CONSTITUTIONAL_DIRECT_MANDATE | 2026-03-17**
