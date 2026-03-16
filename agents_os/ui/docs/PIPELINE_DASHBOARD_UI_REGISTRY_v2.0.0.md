---
document_id: PIPELINE_DASHBOARD_UI_REGISTRY_v2.0.0
from: Team 00 (Chief Architect)
to: Team 170 (Registry & Documentation), Team 61 (Pipeline UI Specialist)
cc: Team 100 (AOS Domain Architect), Team 190 (Constitutional Validator)
date: 2026-03-16
status: ACTIVE
supersedes: PIPELINE_DASHBOARD_UI_REGISTRY_v1.0.0 (2026-03-15)
---

# Pipeline Dashboard UI Component Registry — v2.0.0
## agents_os/ui/docs/PIPELINE_DASHBOARD_UI_REGISTRY_v2.0.0.md

**Mandatory Identity Header:**

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 / S003 |
| domain | AGENTS_OS |
| doc_version | 2.0.0 |
| authority | Team 00 — Chief Architect |

---

## Change Log (v1.0.0 → v2.0.0)

| Change | Type | Session |
|--------|------|---------|
| DOC-04 updated — buildCurrentStepBanner now includes FD panel | AMENDMENT | 2026-03-16 |
| DOC-06 updated — PWA is now ACTIVE (not scaffold) | AMENDMENT | 2026-03-16 |
| DOC-07 added — 3-Layer Feedback Detection System (NEW) | NEW | 2026-03-16 |
| DOC-08 added — REVALIDATION Candidate Ordering (NEW) | NEW | 2026-03-16 |
| DOC-09 added — updateBannerForVerdict (NEW) | NEW | 2026-03-16 |
| DOC-10 added — Verdict-driven button states (NEW) | NEW | 2026-03-16 |
| DOC-11 added — A1/A2 governance guards (NEW) | NEW | 2026-03-16 |

---

## DOC-04 — buildCurrentStepBanner (AMENDED v2.0.0)

### Component
**Source:** `agents_os/ui/js/pipeline-dashboard.js` — `buildCurrentStepBanner(gate, state)` (line ~1448)

### Behavior
**Added:** 2026-03-15 | **Amended:** 2026-03-16 (FD panel added)

Unified "Next Step — What to do now?" banner shown above the Gate Context accordion on every
gate. Renders into `#current-step-banner`. Driven entirely by `pipelineState` — no manual
intervention required.

**Structure:**
```
[Title — "Next Step — What to do now?"]
[Actor] — [Engine badge] — [Phase label]
Step 1: [action]
Step 2: [action]
Step N: [action]
[Feedback Detection Panel — for AI-verdict gates only]   ← NEW in v2.0.0
```

**Render trigger:** `loadPipelineState()` → line 71.

### All Banner States

| State | CSS class(es) | Condition | Border color |
|-------|--------------|-----------|--------------|
| Default (AI/Codex gate) | `current-step-banner` | Standard AI validation gate | Blue |
| GATE_1 Phase 1 (no LLD400) | `current-step-banner` | LLD400 not yet stored | Blue |
| GATE_1 Phase 1 correction | `csb-correction` | failCount > 0, no PASS verdict | Yellow |
| GATE_1 Phase 2 (LLD400 stored) | `csb-phase2` | `lld400_content` non-empty | Green |
| GATE_8 Phase 1 | `current-step-banner` | `phase8_content` empty | Blue |
| GATE_8 Phase 2 | `csb-phase2` | `phase8_content` non-empty | Green |
| Human gate (GATE_2, GATE_6, GATE_7) | `csb-human` | `def.engine === 'human'` | Yellow |
| PASS_WITH_ACTION | `csb-pwa` | `gate_state === 'PASS_WITH_ACTION'` | Amber |
| Cursor / Implementation gate | `current-step-banner` (or `csb-correction`) | `def.engine === 'cursor'` | Blue / Yellow |
| WP COMPLETE | `csb-complete` | `gate === 'COMPLETE'` | Green dimmed |
| **PASS verdict detected** | `csb-pass-detected` ← added dynamically | After FD system finds PASS | **Green** |
| **BLOCK verdict detected** | `csb-block-detected csb-correction` ← added dynamically | After FD system finds BLOCK | **Red** |

### Amendment Notes (v2.0.0)

The `csb-last-action` div at the bottom (v1.0.0) is replaced for AI-verdict gates by the
3-layer Feedback Detection panel (`.csb-fd`). See DOC-07 for full specification.
Non-AI gates (cursor, human) retain the simple `csb-last-action` div.

---

## DOC-05 — Mandate Tab Phase Auto-Selection (UNCHANGED)

### Component
**Source:** `agents_os/ui/js/pipeline-dashboard.js` — `_parseMandateSections()` (line ~269)

### Behavior
**Added:** 2026-03-15 | **Status:** Unchanged in v2.0.0

When a gate is two-phase (GATE_1, GATE_8) and the phase-transition artifact is stored in state
(`lld400_content` or `phase8_content`), the Phase 2 mandate tab is auto-selected on load.

**Active phase formula:**
```javascript
const lld400Ready  = !!(pipelineState.lld400_content  || '').trim();
const phase8Ready  = !!(pipelineState.phase8_content   || '').trim();
const activePhase  = (isTwoPhaseGate(curGate) && (lld400Ready || phase8Ready)) ? 2 : 1;
```

**Effect:** The correct mandate is immediately visible without operator needing to click a tab.
Active tab shows `▶ SEND NOW` green badge.

---

## DOC-06 — PWA Button and Banner (AMENDED v2.0.0 — NOW ACTIVE)

### Component
**Source:** `agents_os/ui/js/pipeline-dashboard.js` — `buildQuickActionBar()`, `loadPipelineState()` (PWA block), `buildCurrentStepBanner()` (csb-pwa state)

### Behavior
**Added:** 2026-03-15 | **Amended:** 2026-03-16 (WP002 now active — was scaffold in v1.0.0)

**⚠️ v1.0.0 note superseded:** v1.0.0 stated these were scaffold/copy templates only. WP002
(PASS_WITH_ACTION governance) is now implemented.

### Components

**1. Pass w/ Action Button (Quick Action Bar)**
Present on all gates with `twoPaths: true`. Copies:
```
./pipeline_run.sh pass_with_actions "ACTION-1: [describe]|ACTION-2: [describe]"
```

**2. PWA Banner (Sidebar)**
Shown when `gate_state === "PASS_WITH_ACTION"`. Renders into `#pwa-banner-sidebar`.
- Lists `pending_actions` items
- Button "✅ Actions Resolved" → copies `./pipeline_run.sh actions_clear`
- Button "⚡ Override & Advance" → prompts for reason, copies `./pipeline_run.sh override "reason"`

**3. PWA Banner (Quick Action Bar)**
Secondary rendering inside the quick-action-bar section when `gate_state === "PASS_WITH_ACTION"`.

**4. Banner State csb-pwa**
When `gate_state === "PASS_WITH_ACTION"`, `buildCurrentStepBanner()` returns a dedicated
banner telling operator to resolve the listed action items.

### CSS Classes
- `.pwa-banner` — container
- `.pwa-banner-title` — "⚡ PASS_WITH_ACTION" header
- `.pwa-action-item` — individual action item
- `.pwa-btn-clear` — green "Actions Resolved" button
- `.pwa-btn-override` — amber "Override & Advance" button

---

## DOC-07 — 3-Layer Feedback Detection System (NEW in v2.0.0)

### Component
**Source:** `agents_os/ui/js/pipeline-dashboard.js` — functions `initFeedbackDetection`,
`_processFdVerdict`, `fdRescan`, `fdLoadPath`, `fdToggleManual`, `fdLoadManual` (lines ~1237–1447)
**CSS:** `agents_os/ui/css/pipeline-dashboard.css` — `.csb-fd` block

### Behavior
**Added:** 2026-03-16 | **Status:** Active — Iron Rule for all AI-verdict gates

**Iron Rule:** This 3-layer detection system is a **locked universal behavior** for all gates
where `getEffectiveVerdictTeam(gate) !== null`. It cannot be selectively disabled for individual
gates. All future AI-verdict gates must participate.

### Architecture

```
Layer A — Auto-scan (initFeedbackDetection)
  Trigger: loadPipelineState() after banner renders (line 75)
  Fires: on every page load, domain switch, auto-refresh tick
  Behavior: scans getVerdictCandidates(gate, wp) sequentially;
            stops at first fetchable file; calls _processFdVerdict()
  No user gesture required.

Layer B — Guided Rescan (fdRescan)
  Trigger: "↩️ Rescan" button in FD panel
  Behavior: scans ALL candidates in parallel (Promise.all);
            if 1 found → auto-load;
            if multiple found → show selectable list (★ = highest priority)
  DOM target: #csb-fd-candidates

Layer C — Manual Bypass (fdLoadManual → fdLoadPath)
  Trigger: "✏️ Manual" button → reveals input; Enter or "Load ↵" button
  Behavior: operator pastes any file path;
            system fetches and processes through same pipeline
  DOM elements: #csb-fd-manual-row, #csb-fd-path-input
```

### Shared Processing Pipeline — _processFdVerdict(gate, text, path)

All 3 layers funnel into this function:

```
1. extractVerdictStatus(text)      → 'PASS' | 'BLOCK' | null
2. Update #csb-fd-status display   → filename + PASS/BLOCK badge
3. applyVerdictToButtons(status)   → PASS button lit green / FAIL button lit red
4. updateBannerForVerdict(gate, status, path)
   → rewrites banner title + steps to reflect verdict
   → adds csb-pass-detected or csb-block-detected CSS class
5. Propagate to #qbar-ta findings builder:
   BLOCK → auto-fill findings textarea + border red + updateFindingsCmd()
   PASS  → clear textarea + placeholder "PASS detected" + border green
```

### DOM Elements (rendered by buildCurrentStepBanner for AI-verdict gates)

| ID | Description |
|----|-------------|
| `#csb-fd` | FD panel container (`.csb-fd` class) |
| `#csb-fd-status` | Status display text — updated by all 3 layers |
| `#csb-fd-manual-row` | Manual path input row (hidden by default) |
| `#csb-fd-path-input` | Path input field for Layer C |
| `#csb-fd-candidates` | Candidate selection list for Layer B multi-match |

### Status Display States

| State | Display |
|-------|---------|
| Scanning (Layer A on load) | `🔍 Scanning…` |
| Rescanning (Layer B) | `🔍 Scanning all candidates…` |
| Found — PASS | `🟢 FILENAME — ✅ PASS` |
| Found — BLOCK | `🟢 FILENAME — ⛔ BLOCK` |
| Not found (Layer A) | `🔍 No verdict file found — team is still working` |
| Not found (Layer B) | `🔍 Nothing found (N paths checked)` |
| Multiple found (Layer B) | `⚠️ N files found — select one to load:` + button list |
| Load error (Layer C) | `❌ Could not load: FILENAME` |

---

## DOC-08 — REVALIDATION Candidate Ordering (NEW in v2.0.0)

### Component
**Source:** `agents_os/ui/js/pipeline-dashboard.js` — `getVerdictCandidates()` (line ~657)
**Also mirrored in:** `agents_os_v2/orchestrator/pipeline.py` — `_verdict_candidates()`

### Behavior
**Added:** 2026-03-16 | **Applies to:** GATE_0 and GATE_1

During a correction cycle, Team 190 writes a REVALIDATION file that **supersedes** the original
VALIDATION file. Example:
```
TEAM_190_S002_P005_WP003_GATE_0_VALIDATION_v1.0.0.md   ← original (BLOCK_FOR_FIX)
TEAM_190_S002_P005_WP003_GATE_0_REVALIDATION_v1.0.0.md ← correction cycle result (PASS)
```

**Rule:** The REVALIDATION file is listed FIRST in the candidate array for GATE_0 and GATE_1.
First-match-wins scanning ensures the correction-cycle verdict is always the active one.

**This rule is enforced identically in both JS frontend and Python backend.**

### File Naming Convention

| Pattern | Usage |
|---------|-------|
| `TEAM_190_{WPU}_GATE_0_REVALIDATION_v1.0.0.md` | Correction cycle #1 result (supersedes VALIDATION) |
| `TEAM_190_{WPU}_GATE_0_VALIDATION_v1.0.0.md` | Original GATE_0 verdict |
| `TEAM_190_{WPU}_GATE_0_VERDICT_v1.0.0.md` | Alternative naming (older convention) |

`{WPU}` = work_package_id with `-` replaced by `_`. Example: `S002_P005_WP003`.

### Extension Rule

Any future correction-cycle gate (a gate that loops back to itself on FAIL) must follow this
same pattern: REVALIDATION file added as first candidate in `getVerdictCandidates()` AND
`_verdict_candidates()` in Python.

---

## DOC-09 — updateBannerForVerdict (NEW in v2.0.0)

### Component
**Source:** `agents_os/ui/js/pipeline-dashboard.js` — `updateBannerForVerdict(gate, verdictStatus, foundPath)` (line ~1822)

### Behavior
**Added:** 2026-03-16

Called by `_processFdVerdict()` (via all 3 FD layers) and by `autoLoadVerdictFile()` (quick-action-bar path). Rewrites the live "Next Step" banner content and CSS state based on a detected verdict.

**Called when:**
- Layer A auto-scan finds a verdict file on page load
- Layer B rescan finds a verdict file
- Layer C manual load finds a verdict file
- Quick-action-bar `autoLoadVerdictFile` finds a verdict file (legacy path)

**Actions on PASS:**
1. Rewrites `.csb-title` to: `✅ {GATE} — PASS — Run ./pipeline_run.sh pass to advance`
2. Rewrites `.csb-steps` to 2 steps: "PASS verdict received from {team} — {file}" + "Click PASS or run terminal command"
3. Removes classes `csb-correction`, `csb-block-detected`
4. Adds class `csb-pass-detected` → green border + green step numbers

**Actions on BLOCK:**
1. Rewrites `.csb-title` to: `⛔ {GATE} — BLOCK — Fix required before re-submission`
2. Rewrites `.csb-steps` to 3 steps: review findings → fix → resubmit
3. Removes class `csb-pass-detected`
4. Adds classes `csb-correction`, `csb-block-detected` → red border + red step numbers

**Idempotency:** Safe to call multiple times with same arguments — CSS add/remove operations
are idempotent.

---

## DOC-10 — Verdict-Driven Button States (NEW in v2.0.0)

### Component
**Source:** `agents_os/ui/js/pipeline-dashboard.js` — `applyVerdictToButtons(status)` (line ~1215)
**CSS:** `agents_os/ui/css/pipeline-dashboard.css` — verdict button state block

### Behavior
**Added:** (existed in codebase; formally documented in v2.0.0)

Adds CSS classes to PASS/FAIL buttons and findings builder based on detected verdict. Called
by `_processFdVerdict()` and `autoLoadVerdictFile()`.

| Verdict | Element | CSS class added | Visual effect |
|---------|---------|-----------------|---------------|
| PASS | `.qa-btn-pass` | `verdict-pass-active` | Green glow + green bg |
| PASS | `.findings-builder` | `verdict-pass` | Dimmed (findings not needed) |
| BLOCK | `.qa-btn-pass` | `verdict-dimmed` | Opacity 28%, pointer-events: none |
| BLOCK | `.qa-btn-fail` | `verdict-active` | Red glow + red bg |
| BLOCK | `.findings-builder` | `verdict-block` | Red border + red bg |

**Purpose:** Operator immediately sees which button to click without reading the verdict file.
Prevents accidentally clicking PASS when verdict is BLOCK.

**Scope:** Uses `document.querySelector()` which scopes to the first matching element in the DOM.
Applies to the quick-action-bar buttons rendered by `buildQuickActionBar()`.

---

## DOC-11 — A1/A2 Governance Guards (NEW in v2.0.0)

### Components
**A1 Source:** `pipeline_run.sh` — `_show_prompt()` function
**A2 Source:** `agents_os_v2/orchestrator/pipeline.py` — `_check_governance_precheck()`
**Tests:** `agents_os_v2/tests/test_pipeline.py` — `TestGovernancePrecheck` (4 tests)

### A1 — Prompt Staleness Guard

**Added:** 2026-03-16 (immediate fix for BF-01 recurrence prevention)

Before displaying a cached gate prompt, checks if `pipeline_state_{domain}.json` is newer
than the prompt file (by filesystem mtime). If state is newer, auto-regenerates the prompt
before displaying it.

**Effect:** Operator always sees a prompt that reflects the current pipeline state. Prevents
using a stale GATE_0 prompt after the state has been mutated by a `pass`/`fail` command.

### A2 — Registry Premature Activation Advisory

**Added:** 2026-03-16 (immediate fix for BF-02 recurrence prevention)

During `_check_governance_precheck()` (runs at every gate), scans the Program Registry for
lines mentioning the current WP that contain "activated" without "pending". If found, emits
an advisory log (not a hard block). Checks both full WP ID (`S002-P005-WP003`) and short
form (`WP003`).

**Effect:** Team 100 is warned immediately if Program Registry notes were updated prematurely
(before GATE_0 PASS). Advisory only — operator decides whether to fix or proceed.

### Governance Context

A1 and A2 were introduced as immediate session fixes (2026-03-16) for the BF-01/BF-02 blocking
findings from correction cycle #1 of S002-P005-WP003. They are hardened in S003-P008-WP001
(AOS Pipeline Governance Hardening) as formal program scope.

---

## Unchanged Components from v1.0.0

The following components documented in v1.0.0 are **unchanged** in v2.0.0:

- `buildCommands()` — sidebar quick command generation
- `loadPrompt()` / `resolvePromptPath()` — gate prompt loading and display
- `loadMandates()` / `_parseMandateSections()` — mandate accordion
- `checkExpectedFiles()` — expected artifact file checker
- `loadHealthWarnings()` — STATE_SNAPSHOT.json health panel
- `getEffectiveVerdictTeam()` — domain-aware verdict team resolver
- `isTwoPhaseGate()` / `isSelfLoopGate()` — gate type helpers
- `loadDomainState()` — dual-domain state loading with fallback
- `syncDomainUIDashboard()` / `onDomainSwitch()` — domain switch UI sync
- `buildCorrectionCyclePanel()` — GATE_0/GATE_1 correction cycle instructions
- `buildPhaseTracker()` — GATE_1/GATE_8 phase progress indicator
- Stage conflict validator (`checkStageConflict()` in pipeline-roadmap.js)
- Domain stats rendering (pipeline-roadmap.js)
- Team mandate viewer (pipeline-teams.js)

---

**log_entry | TEAM_00 | PIPELINE_DASHBOARD_UI_REGISTRY_v2.0.0 | SUPERSEDES_v1.0.0 | 2026-03-16**
