---
document_id: PIPELINE_DASHBOARD_ARCHITECTURE_v1.0.0
from: Team 00 (Chief Architect)
to: Team 61 (Pipeline UI Specialist), Team 10 (Execution Orchestrator), Team 100 (AOS Domain Architect)
cc: Team 170 (Registry & Documentation), Team 190 (Constitutional Validator)
date: 2026-03-16
status: ACTIVE
authority: Team 00 — architectural authority over AOS UI system
supersedes: (none — first canonical architecture document)
---

# AOS Pipeline Dashboard — Architecture Reference
## agents_os/ui/docs/PIPELINE_DASHBOARD_ARCHITECTURE_v1.0.0.md

This document is the authoritative architecture reference for the AOS Pipeline Dashboard system.
It describes the system **as it exists**, not as it was planned. All future design and
implementation work in `agents_os/ui/` must be consistent with the contracts defined here.

---

## 1. System Overview

The AOS Pipeline Dashboard is a **static HTML + vanilla JavaScript + CSS operator interface**
that provides real-time visibility and control over a dual-domain gate-based delivery pipeline.

**Two domains:** `agents_os` (Agents OS internal programs) and `tiktrack` (TikTrack product programs).

**Three pages:**

| Page | File | Purpose |
|------|------|---------|
| Dashboard | `PIPELINE_DASHBOARD.html` | Operate the active gate: view prompt, record verdict, advance pipeline |
| Roadmap | `PIPELINE_ROADMAP.html` | Portfolio view: stage/program tree, domain stats, hierarchy validation |
| Teams | `PIPELINE_TEAMS.html` | Team reference: mandate viewer, team capabilities, ISO rules |

**Backend:** `pipeline_run.sh` (bash wrapper → `python3 -m agents_os_v2` CLI). All state mutations
go through this CLI. The UI is **read-only** with respect to state — it reads JSON, generates
terminal commands for the operator to run, and cannot directly mutate pipeline state.

**Runtime requirement:** The UI must be served from an HTTP server (same-origin fetch constraint).
Standard start: `python3 -m http.server 8090 --directory agents_os/ui/`. Commands provided by
`agents_os/scripts/start_ui_server.sh` and `stop_ui_server.sh`.

---

## 2. File Structure

```
agents_os/
├── ui/
│   ├── PIPELINE_DASHBOARD.html          ← Dashboard page
│   ├── PIPELINE_ROADMAP.html            ← Roadmap page
│   ├── PIPELINE_TEAMS.html              ← Teams page
│   ├── css/
│   │   ├── pipeline-shared.css          ← Cross-page base styles (root vars, header, layout)
│   │   ├── pipeline-dashboard.css       ← Dashboard-specific styles
│   │   ├── pipeline-roadmap.css         ← Roadmap-specific styles
│   │   └── pipeline-teams.css           ← Teams page styles
│   ├── js/
│   │   ├── pipeline-config.js           ← All constants (gate defs, domain files, team data)
│   │   ├── pipeline-state.js            ← Global state (pipelineState, loadDomainState)
│   │   ├── pipeline-dom.js              ← Shared DOM utilities
│   │   ├── pipeline-commands.js         ← Clipboard + command copy helpers
│   │   ├── pipeline-booster.js          ← Fast-track booster panel logic
│   │   ├── pipeline-help.js             ← Help modal (English / Hebrew)
│   │   ├── pipeline-dashboard.js        ← Dashboard page logic (~2200 lines)
│   │   ├── pipeline-roadmap.js          ← Roadmap page logic
│   │   └── pipeline-teams.js            ← Teams page logic
│   └── docs/
│       ├── PIPELINE_DASHBOARD_ARCHITECTURE_v1.0.0.md     ← This document
│       ├── PIPELINE_DASHBOARD_UI_REGISTRY_v2.0.0.md      ← Component changelog registry
│       └── PIPELINE_DASHBOARD_UI_REGISTRY_v1.0.0.md      ← (superseded — historical record)
├── scripts/
│   ├── start_ui_server.sh               ← Starts python http.server on port 8090
│   └── stop_ui_server.sh                ← Stops the server
└── ...

agents_os_v2/
├── orchestrator/
│   ├── pipeline.py                      ← Python backend: gate logic, prompt generation
│   ├── state.py                         ← PipelineState dataclass + persistence
│   └── gate_router.py                   ← Gate routing table
├── context/
│   ├── identity/                        ← Team constitutions (team_61.md, team_170.md, ...)
│   └── governance/
│       └── gate_rules.md                ← Gate rules documentation
├── tests/
│   └── test_pipeline.py                 ← Python pipeline unit tests (23 tests)
└── ...

_COMMUNICATION/agents_os/               ← SSOT for live pipeline state files
├── pipeline_state_agentsos.json         ← agents_os domain live state
├── pipeline_state_tiktrack.json         ← tiktrack domain live state
├── STATE_SNAPSHOT.json                  ← Health snapshot (written by state_reader.py)
└── prompts/                             ← Generated gate prompt files
    ├── agentsos_GATE_0_prompt.md        ← Current gate prompt (agents_os)
    ├── tiktrack_GATE_0_prompt.md        ← Current gate prompt (tiktrack)
    └── archive/                         ← Archived prompts after gate advance (S003-P008)
```

---

## 3. JS Module Responsibilities and Load Order

Each HTML page loads JS in a fixed order. **Modules loaded earlier can be referenced by modules
loaded later. Never reverse this order.**

### Dashboard page (`PIPELINE_DASHBOARD.html`)

```
pipeline-config.js     → GATE_CONFIG, ALL_GATE_DEFS, GATE_SEQUENCE, DOMAIN_STATE_FILES,
                          BOOSTER_TEAM_DATA, DOMAIN_GATE_OWNERS_JS, AUTHORIZED_STAGE_EXCEPTIONS
pipeline-state.js      → pipelineState (global), currentDomain, loadDomainState(), fetchText(),
                          fetchJSON(), getDomainStateFile(), getDomainOwner()
pipeline-dom.js        → escHtml(), escAttr(), statusPillClass(), statusDotClass(),
                          statusLabel(), gateStatus()
pipeline-commands.js   → copyText(), copyCmd(), _dfCmd(), buildCommands()
pipeline-booster.js    → Booster panel (fast-track operations)
pipeline-help.js       → Help modal with gate reference and keyboard shortcuts
pipeline-dashboard.js  → All dashboard logic (see §5 for function reference)
```

### Roadmap page (`PIPELINE_ROADMAP.html`)

```
pipeline-config.js  →  (same constants)
pipeline-state.js   →  (same state)
pipeline-dom.js     →  (same DOM utilities)
pipeline-roadmap.js →  loadRoadmap(), buildTree(), checkStageConflict(), loadDomainStats()
```

### Teams page (`PIPELINE_TEAMS.html`)

```
pipeline-config.js  →  (same constants, especially BOOSTER_TEAM_DATA)
pipeline-state.js   →  (same state)
pipeline-dom.js     →  (same DOM utilities)
pipeline-teams.js   →  team selector, mandate display per team
```

**Iron Rule — module isolation:** No page-specific module may reference a global defined only in
another page's JS file. All cross-page globals must live in `pipeline-config.js`,
`pipeline-state.js`, or `pipeline-dom.js`.

---

## 4. State Architecture

### 4.1 Global state variables (set by pipeline-state.js)

| Variable | Type | Description |
|----------|------|-------------|
| `pipelineState` | Object \| null | Parsed JSON from current domain's state file. Set by `loadDomainState()`. Also mirrored to `window.pipelineState`. |
| `currentDomain` | String | `"agents_os"` or `"tiktrack"`. Persisted to `localStorage("pipeline_domain")`. |
| `stateFallbackMode` | Boolean | True when legacy `pipeline_state.json` was used (domain file missing). Triggers `LEGACY_FALLBACK` badge. |

### 4.2 Pipeline state JSON schema (canonical fields)

```json
{
  "work_package_id":   "S002-P005-WP003",
  "stage_id":          "S002",
  "current_gate":      "GATE_0",
  "gates_completed":   [],
  "gates_failed":      ["GATE_0"],
  "gate_state":        null,
  "pending_actions":   [],
  "spec_brief":        "AOS State Alignment & Governance Integrity",
  "project_domain":    "agents_os",
  "lld400_content":    "",
  "phase8_content":    "",
  "last_updated":      "2026-03-16T00:00:00Z"
}
```

**Key fields for UI rendering:**

| Field | UI Effect |
|-------|-----------|
| `current_gate` | Drives all gate-specific rendering. `"COMPLETE"` triggers WP-closed state. |
| `gates_failed` | `failCount = failed.filter(g => g === gate).length`. If `> 0` → correction cycle mode. |
| `gate_state` | `"PASS_WITH_ACTION"` → PWA banner shown; gate held pending action resolution. |
| `lld400_content` | Non-empty → GATE_1 Phase 2 active (Team 190 validates stored LLD400). |
| `phase8_content` | Non-empty → GATE_8 Phase 2 active (Team 90 validates AS_MADE_REPORT). |

### 4.3 State file locations

```javascript
// pipeline-state.js / DOMAIN_STATE_FILES constant
{
  "tiktrack":  "../../_COMMUNICATION/agents_os/pipeline_state_tiktrack.json",
  "agents_os": "../../_COMMUNICATION/agents_os/pipeline_state_agentsos.json"
}
// Legacy fallback (older single-domain format)
"../../_COMMUNICATION/agents_os/pipeline_state.json"
```

---

## 5. Dashboard Page — Function Reference

### 5.1 Top-level entry points

| Function | Called by | Purpose |
|----------|-----------|---------|
| `loadAll()` | Page `onload`, domain switch, auto-refresh timer | Orchestrates all load operations |
| `loadPipelineState()` | `loadAll()` | Loads state, renders header/sidebar/banner/QAbar |
| `loadPrompt(gate)` | `loadAll()` after state loaded | Fetches and renders gate prompt text |
| `loadMandates()` | `loadAll()` | Fetches and renders team mandate accordion |
| `checkExpectedFiles()` | `loadAll()` | Checks expected artifact files; renders missing-file warnings |
| `loadHealthWarnings()` | `loadAll()` | Reads STATE_SNAPSHOT.json; renders governance health panel |

### 5.2 Banner system functions

| Function | Signature | Purpose |
|----------|-----------|---------|
| `buildCurrentStepBanner` | `(gate, state) → HTML string` | Builds the "Next Step" banner HTML for any gate. Includes the 3-Layer FD panel for AI-verdict gates. |
| `initFeedbackDetection` | `async (gate) → void` | **Layer A** auto-scan. Called from `loadPipelineState()` after banner renders. Scans verdict candidates, calls `_processFdVerdict`. |
| `_processFdVerdict` | `(gate, text, path) → void` | Shared processing pipeline for all 3 detection layers. Updates FD status, buttons, banner, and findings builder. |
| `fdRescan` | `async () → void` | **Layer B** guided rescan. Parallel-scans all candidates, shows selectable list if multiple found. |
| `fdLoadPath` | `async (path) → void` | Loads a specific file path (used by Layer B selection and Layer C). |
| `fdToggleManual` | `() → void` | Toggles Layer C manual path input row visibility. |
| `fdLoadManual` | `async () → void` | **Layer C** manual load. Reads input field, calls `fdLoadPath`. |
| `updateBannerForVerdict` | `(gate, status, path) → void` | Rewrites banner title, steps, and CSS classes based on verdict status. Called from `_processFdVerdict` and `autoLoadVerdictFile`. |

### 5.3 Verdict detection functions

| Function | Signature | Purpose |
|----------|-----------|---------|
| `getVerdictCandidates` | `(gate, wp) → string[]` | Returns ordered list of file paths to try for this gate's verdict. REVALIDATION files are first for GATE_0 and GATE_1. |
| `getEffectiveVerdictTeam` | `(gate) → string \| null` | Domain-aware verdict team resolver. GATE_2/6 differ by domain. Returns null for non-AI gates. |
| `extractVerdictStatus` | `(text) → 'PASS' \| 'BLOCK' \| null` | Parses `status:` field from YAML front-matter, or falls back to `## Overall Verdict` section scan. |
| `extractFindings` | `(text) → string \| null` | Extracts blocking findings from a BLOCK verdict file for auto-populating the fail command builder. |
| `applyVerdictToButtons` | `(status) → void` | Adds CSS classes to PASS/FAIL buttons: `verdict-pass-active`, `verdict-dimmed`, `verdict-active`. |
| `autoLoadVerdictFile` | `async (gate, statusId, taId, previewId, isRevise) → void` | Legacy verdict loader for the quick-action-bar findings builder. Still used by `buildQuickActionBar`. Calls `applyVerdictToButtons` and `updateBannerForVerdict`. |
| `logVerdictDrift` | `(gate, event, detail) → void` | Logs path drift events to console when found file differs from canonical expected path. |

### 5.4 Quick Action Bar functions

| Function | Signature | Purpose |
|----------|-----------|---------|
| `buildQuickActionBar` | `async (gate) → void` | Builds the PASS/FAIL button bar, PWA banner, and findings builder for verdict gates. Calls `autoLoadVerdictFile` when findings builder is shown. |
| `updateFindingsCmd` | `(gate, taId, previewId, isRevise) → void` | Updates the generated fail/revise terminal command as user types in the findings textarea. |
| `copyFindingsCmd` | `(previewId, btn) → void` | Copies the generated command to clipboard. |

### 5.5 Gate-type helpers

| Function | Returns | Purpose |
|----------|---------|---------|
| `isSelfLoopGate(gate)` | Boolean | True for GATE_0 and GATE_1 (auto-route back to self on FAIL). |
| `isTwoPhaseGate(gate)` | Boolean | True for GATE_1 and GATE_8 (have Phase 1 + Phase 2 sub-flow). |

### 5.6 Progress Check modal

| Function | Purpose |
|----------|---------|
| `runProgressCheck()` | Opens the progress modal; scans all gate statuses; runs `autoLoadVerdictFile` for the current gate's findings builders inside the modal. |

---

## 6. Critical Behavioral Contracts

### 6.1 Page Load Flow

```
loadAll()
  ├── await loadPipelineState()
  │   ├── await loadDomainState(currentDomain)  → sets pipelineState global
  │   ├── [sync] buildCurrentStepBanner(gate, state) → #current-step-banner
  │   ├── [async, no await] initFeedbackDetection(gate)  ← Layer A auto-scan
  │   ├── [sync] PWA banner render (if gate_state === PASS_WITH_ACTION)
  │   ├── [sync] spec card, gate timeline, history list
  │   ├── [sync] buildCommands(gate)           → sidebar quick commands
  │   └── [async, no await] buildQuickActionBar(gate)  → PASS/FAIL buttons + findings builder
  ├── await loadPrompt(state.current_gate)     → #gate-prompt-content
  └── await Promise.all([
        loadMandates(),
        checkExpectedFiles(),
        loadHealthWarnings()
      ])
```

**Key invariant:** `initFeedbackDetection` and `buildQuickActionBar` both fire as unwaited async
tasks. They run concurrently with `loadPrompt` / `loadMandates` / etc. Both will call
`_processFdVerdict` (or `autoLoadVerdictFile`) which calls `updateBannerForVerdict`. Since both
produce the same result for the same verdict file, idempotency is guaranteed.

### 6.2 3-Layer Feedback Detection System (Iron Rule)

**This is a locked universal behavior.** Every gate where `getEffectiveVerdictTeam(gate) !== null`
receives the Feedback Detection (FD) panel embedded inside the "Next Step" banner.

```
┌─ Next Step Banner ──────────────────────────────────────────────────────┐
│  Title + Actor/Engine/Phase                                             │
│  Step 1: ...    Step 2: ...    Step 3: ...                              │
│  ── Feedback Detection ─────────────────────────────────────────────── │
│  [🔍 Scanning…] / [🟢 filename — ✅ PASS] / [🔴 No verdict found]      │
│  [↩️ Rescan]   [✏️ Manual]                                              │
│  [manual path input — hidden until ✏️ clicked]                          │
│  [candidate file selection list — hidden until multiple found]          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Layer A — Auto-scan (initFeedbackDetection):**
- Fired by `loadPipelineState()` immediately after banner HTML is injected (line 75)
- Scans `getVerdictCandidates(gate, wp)` sequentially, stops at first fetchable file
- Fires on: page load, domain switch, auto-refresh tick

**Layer B — Guided rescan (fdRescan):**
- Triggered by "↩️ Rescan" button
- Scans all candidates in parallel (`Promise.all`)
- If 1 found: auto-loads (same as Layer A)
- If multiple found: shows selectable button list; first item marked ★ (highest priority)

**Layer C — Manual bypass (fdLoadManual / fdLoadPath):**
- Triggered by "✏️ Manual" button → input field appears
- Operator pastes any file path (absolute or relative to `agents_os/ui/`)
- Enter key or "Load ↵" button triggers `fdLoadPath(path)`

**Shared processing pipeline — _processFdVerdict(gate, text, path):**
```
extractVerdictStatus(text)
  → applyVerdictToButtons(status)     ← button visual state
  → updateBannerForVerdict(gate, status, path)   ← banner rewrite
  → populate #qbar-ta findings builder   ← BLOCK: auto-fill findings / PASS: clear + signal
  → update #csb-fd-status display line
```

### 6.3 Verdict Candidate Ordering (REVALIDATION Rule)

For correction-cycle gates (GATE_0, GATE_1), a REVALIDATION file supersedes the original
VALIDATION file. This ordering is enforced **in both the JS frontend and Python backend**:

```javascript
// pipeline-dashboard.js — getVerdictCandidates()
'GATE_0': [
  // REVALIDATION first — correction-cycle superseding verdict takes priority
  `${t190}TEAM_190_${wpu}_GATE_0_REVALIDATION_v1.0.0.md`,  // ← checked first
  `${t190}TEAM_190_${wpu}_GATE_0_VERDICT_v1.0.0.md`,
  `${t190}TEAM_190_${wpu}_GATE_0_VALIDATION_v1.0.0.md`,
  `${t190}TEAM_190_${wpu}_SCOPE_VALIDATION_v1.0.0.md`,
  `${t190}TEAM_190_${wp}_GATE_0_VERDICT_v1.0.0.md`,
],
```

```python
# pipeline.py — _verdict_candidates()
"GATE_0": [
    t190 / f"TEAM_190_{wpu}_GATE_0_REVALIDATION_v1.0.0.md",  # ← checked first
    t190 / f"TEAM_190_{wpu}_GATE_0_VERDICT_v1.0.0.md",
    ...
],
```

**wpu convention:** Work package ID with hyphens replaced by underscores.
`"S002-P005-WP003"` → `"S002_P005_WP003"`. Used in all team file naming.

### 6.4 Banner State Machine

The "Next Step" banner transitions through states driven by verdict detection:

```
Default (blue):      no verdict found yet — shows static "what to do now" steps
csb-correction:      failCount > 0 + no PASS verdict — yellow warning border
csb-pass-detected:   PASS verdict found — green border + rewrites title/steps to "run pass"
csb-block-detected:  BLOCK verdict found — red border + rewrites title/steps to correction flow
csb-phase2:          GATE_1/GATE_8 with Phase 2 active (lld400/phase8 content stored)
csb-pwa:             gate_state === PASS_WITH_ACTION — amber, actions pending
csb-human:           engine === 'human' gate — yellow, Nimrod approval required
csb-complete:        WP COMPLETE — all gates passed
```

State transitions: `updateBannerForVerdict()` adds/removes `csb-pass-detected` and
`csb-block-detected`. `buildCurrentStepBanner()` sets the initial class from gate state.

### 6.5 Domain-Aware Rendering

Two gates behave differently per domain — GATE_2 and GATE_6:

| Gate | TikTrack domain | AgentsOS domain |
|------|-----------------|-----------------|
| GATE_2 | Team 00 approves | Team 100 approves |
| GATE_6 | Team 00 approves | Team 100 approves |

Resolved by `getDomainOwner(gate)` → reads `DOMAIN_GATE_OWNERS_JS[currentDomain][gate]`.
`getEffectiveVerdictTeam(gate)` calls `getDomainOwner(gate)` for these two gates.
Verdict file candidates for GATE_2/GATE_6 include both `team_00/` and `team_100/` paths.

---

## 7. Configuration Reference

### 7.1 Gate Definitions (ALL_GATE_DEFS, pipeline-config.js)

Key fields for each gate entry:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `owner` | string | yes | Responsible team key (e.g. `"team_190"`, `"team_100"`) |
| `engine` | string | yes | `"codex"`, `"cursor"`, `"human"`, `"codex+human"`, `"auto"` |
| `twoPaths` | boolean | yes | True if gate has PASS and FAIL paths (shows QA bar) |
| `verdictTeam` | string | for AI gates | Team whose output is scanned for verdict. Drives FD panel presence. |
| `passCmd` | string | yes | Terminal command for PASS |
| `failCmd` | string | yes | Default terminal command for FAIL |
| `passLabel` | string | yes | Label for PASS button |
| `failLabel` | string | yes | Label for FAIL button |
| `failRoutes` | object | for non-self-loop | `{ doc: {cmd, label, desc}, full: {cmd, label, desc} }` |
| `reviseCmd` | string | G3_5 only | Command to generate revision prompt after FAIL |

### 7.2 Verdict Candidates (getVerdictCandidates, pipeline-dashboard.js)

Defined for: GATE_0, GATE_1, GATE_2, G3_5, GATE_4, GATE_5, GATE_6, GATE_8.

Naming convention for candidate file paths:
```
../../_COMMUNICATION/team_{NNN}/TEAM_{NNN}_{WPU}_{GATE_ID}_{TYPE}_v1.0.0.md
```
where `{WPU}` = work_package_id with `-` replaced by `_`.

**REVALIDATION rule:** For GATE_0 and GATE_1, REVALIDATION variant is first candidate.

### 7.3 AUTHORIZED_STAGE_EXCEPTIONS (pipeline-config.js)

Dictionary of stage IDs that are authorized to be "active" even when they differ from WSM
`active_stage_id`. Used by `loadHealthWarnings()` to suppress false AD-V2-05 warnings.

```javascript
const AUTHORIZED_STAGE_EXCEPTIONS = {
  "S001": { description: "S001 re-activated parallel...", authority_ref: "..." },
  // ...
};
```

**How to add:** When a program from a non-active stage is authorized, register its stage_id here
with `description` and `authority_ref` fields. This prevents health warning spam.

---

## 8. CSS Architecture

### 8.1 File responsibilities

| File | Owns | Never contains |
|------|------|----------------|
| `pipeline-shared.css` | `:root` vars, `.agents-header`, `.agents-page-layout`, `.status-pill`, `.btn`, `.domain-btn`, `.legacy-fallback-badge` | Page-specific layouts |
| `pipeline-dashboard.css` | Dashboard page layout, banner system, QA bar, findings builder, health warnings, FD panel, PWA banner, progress modal | Roadmap or teams styles |
| `pipeline-roadmap.css` | Tree nodes, program detail sidebar, stage conflict banners, domain stats cards | Dashboard or teams styles |
| `pipeline-teams.css` | Team list, team detail panel | Any other page styles |

### 8.2 Banner system CSS classes (pipeline-dashboard.css)

```css
/* Base banner */
.current-step-banner          — blue border/bg (default)
.current-step-banner.csb-correction   — yellow (correction cycle, no verdict yet)
.current-step-banner.csb-phase2       — green (Phase 2 active)
.current-step-banner.csb-complete     — green, dimmed (WP closed)
.current-step-banner.csb-human        — yellow (human approval gate)
.current-step-banner.csb-pwa          — amber (PASS_WITH_ACTION)
.current-step-banner.csb-pass-detected  — green (PASS verdict found — dynamic)
.current-step-banner.csb-block-detected — red (BLOCK verdict found — dynamic)

/* Banner children */
.csb-title        — uppercase bold label (color inherits from parent state)
.csb-header       — actor + engine badge + phase label row
.csb-actor        — bold team name
.csb-engine-badge — badge showing engine (Codex, Cursor, etc.)
.csb-phase-label  — muted italic phase descriptor
.csb-steps        — numbered steps container
.csb-step         — individual step row
.csb-step-num     — circular step number (color inherits from parent state)
.csb-step-text    — step description text

/* 3-Layer Feedback Detection panel (inside banner for AI-verdict gates) */
.csb-fd              — container for FD system
.csb-fd-row          — status line + Rescan/Manual buttons row
.csb-fd-status       — status display text (updated by all 3 layers)
.csb-fd-btn          — small action button (Rescan, Manual, Load)
.csb-fd-manual-row   — collapsible manual path input row
.csb-fd-input        — monospace path input field
.csb-fd-candidates   — collapsible candidate selection list (Layer B multi-match)
.csb-fd-cand-btn     — individual candidate file button
.csb-fd-cand-primary — primary (highest priority) candidate, marked ★
```

### 8.3 Verdict-driven button states (pipeline-dashboard.css)

```css
.qa-btn-pass.verdict-pass-active  — PASS button highlighted green (PASS verdict found)
.qa-btn-pass.verdict-dimmed       — PASS button dimmed (BLOCK verdict found)
.qa-btn-fail.verdict-active       — FAIL button highlighted red (BLOCK verdict found)
.findings-builder.verdict-block   — findings builder gets red border + bg
.findings-builder.verdict-pass    — findings builder dimmed (PASS verdict found)
```

These classes are applied by `applyVerdictToButtons(status)` after verdict detection.

---

## 9. Extension Guide

### 9.1 Adding a new gate type

1. **Define gate in ALL_GATE_DEFS** (pipeline-config.js):
   ```javascript
   'GATE_NEW': {
     owner: 'team_XX', engine: 'codex', desc: '...',
     twoPaths: true,
     passCmd: './pipeline_run.sh pass', failCmd: './pipeline_run.sh fail "reason"',
     passLabel: '✅ PASS', failLabel: '❌ FAIL',
     verdictTeam: 'team_XX',   // ← Required for FD panel to appear
     failRoutes: { doc: {...}, full: {...} },
   },
   ```

2. **Add to GATE_SEQUENCE** (pipeline-config.js) at the correct position.

3. **Add verdict candidates** (pipeline-dashboard.js → `getVerdictCandidates`):
   ```javascript
   'GATE_NEW': [
     `${tXX}TEAM_XX_${wpu}_GATE_NEW_VERDICT_v1.0.0.md`,
     // add REVALIDATION variant first if this is a self-loop gate
   ],
   ```

4. **Mirror candidates in Python backend** (pipeline.py → `_verdict_candidates`):
   ```python
   "GATE_NEW": [
     tXX / f"TEAM_XX_{wpu}_GATE_NEW_VERDICT_v1.0.0.md",
   ],
   ```

5. **Banner behavior is automatic.** `buildCurrentStepBanner` routes to the standard codex gate
   case by default. Customize only if gate needs special phase logic (like GATE_1 or GATE_8).

6. **FD panel is automatic.** Since `verdictTeam` is set, `buildCurrentStepBanner` will include
   the FD panel, and `initFeedbackDetection` will scan for the gate's candidates on every
   page load.

### 9.2 Adding a new verdict team

1. Register in `BOOSTER_TEAM_DATA` (pipeline-config.js) with `label`, `name`, `writesTo`, `isoRules`.
2. Add candidate paths in `getVerdictCandidates` for the relevant gate.
3. The team's folder under `_COMMUNICATION/team_XX/` should follow the naming convention:
   `TEAM_XX_{WPU}_{GATE_ID}_{TYPE}_v1.0.0.md`.

### 9.3 Adding a new health warning

In `loadHealthWarnings()` (pipeline-dashboard.js), add a push to `warnings[]`:
```javascript
warnings.push({
  sev: 'error' | 'warning' | 'info',
  msg: 'Short human-readable message',
  log: 'WARN-CODE | detailed technical log for copying | remediation hint'
});
```
Icons: `🔴 error`, `🟡 warning`, `🟢 info`.

### 9.4 Adding a new pipeline state field

1. Update `PipelineState` dataclass in `agents_os_v2/orchestrator/state.py`.
2. Update `pipeline_run.sh` if the field is set via CLI command.
3. Update `loadPipelineState()` in `pipeline-dashboard.js` to consume the new field.
4. If the field drives banner behavior, add a new branch in `buildCurrentStepBanner()`.
5. Document the field in the state JSON schema table in §4.2 of this document (next version).

---

## 10. A1/A2 Governance Guards (pipeline_run.sh + pipeline.py)

Two governance guards implemented 2026-03-16:

### A1 — Prompt Staleness Guard (pipeline_run.sh)

Located in `_show_prompt()`. Before displaying a gate prompt, checks if the state file
(`pipeline_state_{domain}.json`) is newer than the cached prompt file. If so, auto-regenerates:

```bash
if [ -f "$state_file" ] && [ "$state_file" -nt "$prompt_file" ]; then
  echo "⚠️ STALE PROMPT — regenerating now..."
  # auto-regenerate
fi
```

**Purpose:** Prevents the operator from using an outdated prompt after state has been mutated
by a `pass` / `fail` / other command.

### A2 — Registry Premature Activation Advisory (pipeline.py)

Located in `_check_governance_precheck()`. Scans the Program Registry file for lines mentioning
the current WP (by full ID or short form, e.g. "WP003") with the word "activated" (but not
"pending") before GATE_0 PASS:

```python
if re.search(r"\bactivated\b", line, re.IGNORECASE) and not re.search(
    r"\bpending\b", line, re.IGNORECASE
):
    _log("[GATE_0 advisory A2] Program Registry notes may have premature activation...")
```

**Purpose:** Prevents BF-02 class errors where Program Registry notes prematurely claim a WP
is activated before GATE_0 PASS.

Both A1 and A2 are covered by pytest tests in `agents_os_v2/tests/test_pipeline.py`.

---

## 11. Known Behavioral Notes

1. **Double scan on page load:** Both `initFeedbackDetection` (Layer A) and `autoLoadVerdictFile`
   (inside `buildQuickActionBar`) scan verdict candidates and call `updateBannerForVerdict`. This
   is intentional and idempotent — both produce the same result. The slight redundancy provides
   resilience (if one async chain fails, the other covers it).

2. **No ES modules:** All JS uses classic `<script src>` with global functions. No `import`/`export`.
   This is an Iron Rule (locked 2026-03-15). Bundlers are prohibited in this system.

3. **fetchText cache-busting:** All `fetch()` calls append `?t=Date.now()` to prevent browser
   caching of verdict files. Verdict files may be updated without changing the URL.

4. **_qbarGate stale guard:** Inside `autoLoadVerdictFile`, `if (_qbarGate !== gate) return`
   prevents stale results when gate context changes mid-scan. This guard does not apply to
   `initFeedbackDetection` which uses `pipelineState.current_gate` directly.

5. **Version query strings on assets:** CSS/JS files use `?v=N` query strings in HTML to force
   browser cache invalidation when files change. Increment the version number when deploying
   updated CSS/JS files.

---

**log_entry | TEAM_00 | PIPELINE_DASHBOARD_ARCHITECTURE_v1.0.0 | CREATED | 2026-03-16**
