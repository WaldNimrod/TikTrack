---
project_domain: AGENTS_OS
id: TEAM_100_TO_TEAM_61_AGENTS_OS_UI_WORK_PACKAGE_LOD400_v1.0.0
from: Team 100 (Agents_OS Architectural Authority)
to: Team 61 (Local Cursor Implementation Agent)
cc: Team 51 (QA), Team 90 (Validation), Team 10, Team 170, Team 00
date: 2026-03-14
status: APPROVED_FOR_IMMEDIATE_IMPLEMENTATION
supersedes: TEAM_100_TO_TEAM_61_AGENTS_OS_UI_OPTIMIZATION_FEEDBACK_v1.0.0
in_response_to:
  - _COMMUNICATION/team_61/TEAM_61_AGENTS_OS_UI_OPTIMIZATION_RECOMMENDATIONS_v1.0.0.md
  - _COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_AGENTS_OS_UI_OPTIMIZATION_REMEDIATION_HANDOFF_v1.0.0.md
  - _COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_ROADMAP_CONFLICT_AND_UI_CANONICAL_LAYOUT_AMENDMENT_REQUEST_v1.0.0.md
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| task_id | AGENTS_OS_UI_OPTIMIZATION |
| gate_id | G3_PLAN — APPROVED |
| lod | 400 |
| decision | APPROVED_FOR_IMMEDIATE_IMPLEMENTATION |

---

## 0) Routing and Execution Flow

```
Team 61  →  implements this work package
Team 51  →  QA against Acceptance Criteria (§9)
Team 90  →  architectural validation
Team 100 →  final approval before GATE_8
```

Team 61 may begin implementation immediately. Submit to Team 51 upon completion of all tasks in this document.

---

## 1) Scope

This work package covers two integrated tracks delivered as a single implementation unit:

**Track A — CSS/JS Extraction (modularization):**
Extract all inline CSS and JS from the three Agents_OS UI HTML files into external files under `agents_os/ui/css/` and `agents_os/ui/js/`. Aligned with TikTrack standards.

**Track B — UI Hardening and Layout Canonicalization:**
Implement three structural improvements identified by Team 190 (SPC-01, SPC-02, SPC-03) and three UI layout contracts (UI-01, UI-02, UI-03).

Both tracks must be delivered together. They are not separable — the CSS/JS extraction must incorporate the new layout contracts.

---

## 2) Pre-work: Mandatory Re-scans (before any implementation)

### PRE-01 — Re-scan PIPELINE_ROADMAP.html (BLOCKING)

The file was **fully rewritten** by Team 100 on 2026-03-14. Team 61's previous scan data (886 lines) is invalid.

**Current state (post-rewrite):**
- ~520 lines
- Two-column grid layout: `grid-template-columns: 1fr 300px`
- Right sidebar exists with: domain stats cards, hierarchy validation panel, canonical files section
- Program detail panel (`.prog-detail-panel`) currently renders **in the main column** (inline, below tree)
- Conflict banner is single-state (red only)
- Auto-refresh is a `<input type="checkbox">` pattern (not unified button)
- `escAttr()` function exists (was missing before — added in rewrite)
- `checkStageConflict()` exists (new — added in rewrite) but is single-state

**Team 61 must:** Read the current file in full, extract the CSS class inventory, and update their implementation plan for Roadmap before proceeding.

### PRE-02 — Re-scan PIPELINE_DASHBOARD.html (RECOMMENDED)

Multiple additions were made on 2026-03-14:
- Health warnings panel HTML + CSS (`.health-warn-item`, `.hw-error`, `.hw-warning`, `.hw-body`, `.hw-copy-btn`)
- `loadHealthWarnings()` function (~35 lines)
- `loadMandates()` rewritten (hide accordion for non-mandate gates)
- `loadAll()` updated
- Auto-refresh interval changed to 5000ms
- Accordion order changed

Current line count is higher than the original 2,555 in Team 61's scan.

### PRE-03 — PIPELINE_TEAMS.html (scan still valid)

No changes since Team 61's scan. Original scan data is accurate.

---

## 3) Track A — CSS/JS Extraction

### 3.1 File Structure (canonical — locked)

```
agents_os/ui/
├── PIPELINE_DASHBOARD.html      (HTML structure only — no inline <style> or <script>)
├── PIPELINE_ROADMAP.html        (HTML structure only — no inline <style> or <script>)
├── PIPELINE_TEAMS.html          (HTML structure only — no inline <style> or <script>)
├── css/
│   ├── pipeline-shared.css      (~300 lines — shared across all pages)
│   ├── pipeline-dashboard.css   (~400 lines — Dashboard-specific)
│   ├── pipeline-roadmap.css     (~180 lines — Roadmap-specific)
│   └── pipeline-teams.css       (~110 lines — Teams-specific)
└── js/
    ├── pipeline-config.js        (~140 lines — all config constants)
    ├── pipeline-state.js         (~110 lines — state management + domain source)
    ├── pipeline-dom.js           (~200 lines — rendering utilities)
    ├── pipeline-commands.js      (~80 lines — clipboard/commands)
    ├── pipeline-booster.js       (~70 lines — booster panel)
    ├── pipeline-help.js          (~150 lines — help modal EN/HE)
    ├── pipeline-dashboard.js     (~420 lines — Dashboard page logic)
    ├── pipeline-roadmap.js       (~350 lines — Roadmap page logic)
    └── pipeline-teams.js         (~360 lines — Teams page logic)
```

The preflight placeholder files (`css/pipeline-shared.css` and `js/pipeline-config.js`) already exist — overwrite with actual content.

### 3.2 HTML Load Order (canonical per page)

**PIPELINE_DASHBOARD.html:**
```html
<link rel="stylesheet" href="css/pipeline-shared.css" />
<link rel="stylesheet" href="css/pipeline-dashboard.css" />
...
<script src="js/pipeline-config.js"></script>
<script src="js/pipeline-state.js"></script>
<script src="js/pipeline-dom.js"></script>
<script src="js/pipeline-commands.js"></script>
<script src="js/pipeline-booster.js"></script>
<script src="js/pipeline-help.js"></script>
<script src="js/pipeline-dashboard.js"></script>
```

**PIPELINE_ROADMAP.html:**
```html
<link rel="stylesheet" href="css/pipeline-shared.css" />
<link rel="stylesheet" href="css/pipeline-roadmap.css" />
...
<script src="js/pipeline-config.js"></script>
<script src="js/pipeline-state.js"></script>
<script src="js/pipeline-dom.js"></script>
<script src="js/pipeline-roadmap.js"></script>
```

**PIPELINE_TEAMS.html:**
```html
<link rel="stylesheet" href="css/pipeline-shared.css" />
<link rel="stylesheet" href="css/pipeline-teams.css" />
...
<script src="js/pipeline-config.js"></script>
<script src="js/pipeline-state.js"></script>
<script src="js/pipeline-dom.js"></script>
<script src="js/pipeline-teams.js"></script>
```

**RULE:** Classic `<script src="...">` only. No `<script type="module">`. No bundler. No Vite. The load order above is the canonical dependency chain and must be maintained.

### 3.3 pipeline-config.js — Required Contents

Must contain ALL configuration constants currently inline in the HTML files, plus the new additions below:

```javascript
// Gate sequence and config
const GATE_SEQUENCE = [...];     // all gate IDs in order
const GATE_CONFIG = {...};       // per-gate metadata (owner, type, description)
const GATE_MANDATE_FILES = {...}; // only gates that have mandate docs

// Domain and state file mapping
const DOMAIN_STATE_FILES = {
  tiktrack: '../_COMMUNICATION/agents_os/pipeline_state_tiktrack.json',
  agents_os: '../_COMMUNICATION/agents_os/pipeline_state_agentsos.json'
};
const LEGACY_STATE_FILE = '../_COMMUNICATION/agents_os/pipeline_state.json';

// Booster and team data
const BOOSTER_TEAM_DATA = {...};
const DOMAIN_GATE_OWNERS_JS = {...};
const EXPECTED_FILES = [...];

// NEW — SPC-01: Authorized stage exceptions
// When a stage is CLOSED/COMPLETE but an architect directive authorizes parallel activation,
// list it here to prevent false CONFLICT_BLOCKING.
const AUTHORIZED_STAGE_EXCEPTIONS = {
  'S001': {
    authority_ref: 'ARCHITECT_DIRECTIVE_S001_P002_ACTIVATION_v1.0.0.md',
    authority_path: '_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_S001_P002_ACTIVATION_v1.0.0.md',
    description: 'S001-P002 Deferred Parallel Activation — authorized by Team 00 (2026-03-14)',
    authorized_programs: ['S001-P002']
  }
};
```

### 3.4 pipeline-state.js — Required Contents

Must include the domain-state source lock (SPC-02):

```javascript
let pipelineState = null;
let currentDomain = 'agents_os';
let stateFallbackMode = false;   // NEW — SPC-02

// SPC-02: Load from domain-specific state file; fallback to legacy with badge
async function loadDomainState(domain) {
  const url = DOMAIN_STATE_FILES[domain];
  if (url) {
    try {
      const data = await fetchJSON(url);
      if (data && Object.keys(data).length > 0) {
        stateFallbackMode = false;
        return data;
      }
    } catch(e) {}
  }
  // Fallback path — shows LEGACY_FALLBACK badge in UI
  stateFallbackMode = true;
  return await fetchJSON(LEGACY_STATE_FILE) || {};
}

// All other state functions: switchDomain, getDomainOwner, getDomainFlag,
//   getDomainStateFile, fetchJSON, fetchText, fileExists
```

The `stateFallbackMode` flag must be read by rendering code to show/hide the `LEGACY_FALLBACK` badge in the pipeline state display area.

---

## 4) Track B — UI Hardening

### 4.1 SPC-01 + SPC-03: Three-State Conflict Validator

**File:** `pipeline-roadmap.js`
**Function:** `checkStageConflict(stages, programs, pipelineState)`

The function must return one of three result types (currently returns only CONFLICT_BLOCKING):

```
CONFLICT_BLOCKING   → stage is CLOSED/COMPLETE, no authorization directive found
AUTHORIZED_EXCEPTION → stage is CLOSED/COMPLETE, but AUTHORIZED_STAGE_EXCEPTIONS entry exists
OK                  → no conflict
```

**Implementation contract:**
```javascript
function checkStageConflict(stages, programs, state) {
  // Returns: { type: 'OK'|'AUTHORIZED_EXCEPTION'|'CONFLICT_BLOCKING', items: [], ref: null }
  const result = { type: 'OK', items: [], ref: null };
  if (!state?.stage_id || !stages?.length) return result;

  const stage = stages.find(s => s.id === state.stage_id);
  if (!stage) return result;

  const isClosed = ['CLOSED','COMPLETE'].includes((stage.status||'').toUpperCase());
  if (isClosed) {
    const exc = AUTHORIZED_STAGE_EXCEPTIONS[state.stage_id];
    if (exc) {
      result.type = 'AUTHORIZED_EXCEPTION';
      result.ref  = exc.authority_ref;
      result.items.push(exc.description);
    } else {
      result.type = 'CONFLICT_BLOCKING';
      result.items.push(`Stage ${state.stage_id} is ${stage.status} — no authorization directive`);
    }
  }

  // Additional hierarchy checks (duplicate IDs, orphan programs, WSM mismatch)
  // ...existing hierarchy validation logic preserved...

  return result;
}
```

**Visual rendering (pipeline-roadmap.css + pipeline-roadmap.js):**

The conflict banner element must support three visual states via CSS modifier classes:

```css
/* In pipeline-roadmap.css */
.conflict-banner { border-radius:6px; padding:10px 12px; margin-bottom:8px; font-size:12px; }
.conflict-banner.state-blocking  { background:rgba(248,81,73,0.10); border:1px solid var(--danger);  color:var(--danger); }
.conflict-banner.state-exception { background:rgba(210,153,34,0.10); border:1px solid var(--warning); color:var(--warning); }
```

In JS, when rendering the banner:
- `CONFLICT_BLOCKING` → add class `state-blocking`, show authority_ref as "No directive found — contact Team 00"
- `AUTHORIZED_EXCEPTION` → add class `state-exception`, show `authority_ref` as a visible reference link/text: "Authorized by: [authority_ref]"
- `OK` → hide the banner element entirely

### 4.2 SPC-02: LEGACY_FALLBACK Badge

**File:** `pipeline-roadmap.js` and `pipeline-dashboard.js`

When `stateFallbackMode === true`, display a badge in the pipeline state info area:

```html
<span class="legacy-fallback-badge">⚠ LEGACY_FALLBACK</span>
```

```css
/* In pipeline-shared.css */
.legacy-fallback-badge {
  font-size:10px; font-weight:700; padding:2px 8px; border-radius:5px;
  background:rgba(248,81,73,0.15); color:var(--danger); border:1px solid var(--danger);
}
```

The badge must appear near the pipeline state header / domain indicator wherever the current state source is shown.

---

## 5) UI Layout Contract — UI-01, UI-02, UI-03

### 5.1 UI-03: Canonical Header Contract (ALL THREE PAGES)

**File:** `pipeline-shared.css` (header styles), each HTML file (structure)

All three pages must use this identical header structure:

```html
<!-- Canonical header structure — identical across all 3 pages -->
<header class="agents-header">
  <div class="agents-header-left">
    <h1 class="agents-header-title"><!-- page-specific title --></h1>
    <span class="domain-badge" id="domain-badge"><!-- domain --></span>
  </div>
  <div class="agents-header-right">
    <span class="agents-refresh-label" id="refresh-label">Auto-refresh (5s)</span>
    <button class="btn agents-refresh-btn" id="refresh-btn" onclick="loadAll()">⟳ Refresh</button>
  </div>
</header>
```

Page titles:
- Dashboard: `📊 Agents OS — <span>Pipeline Dashboard</span>`
- Roadmap: `🗺️ Agents OS — <span>Roadmap &amp; History</span>`
- Teams: `👥 Agents OS — <span>Team Management</span>`

```css
/* In pipeline-shared.css — canonical header */
.agents-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 34px;   /* below the nav bar */
  z-index: 100;
}
.agents-header-left  { display:flex; align-items:center; gap:10px; }
.agents-header-title { font-size:15px; font-weight:600; margin:0; }
.agents-header-right { display:flex; align-items:center; gap:10px; }
.agents-refresh-label { font-size:12px; color:var(--text-muted); }
.agents-refresh-btn   { /* inherits .btn styles */ }
```

The auto-refresh interval display (`id="refresh-label"`) must be updated by JS when auto-refresh state changes (on/off toggle not removed, but the checkbox pattern is replaced with a toggle button or an on/off state in the label).

### 5.2 UI-01: Canonical Page Layout Contract (Dashboard + Roadmap)

**File:** `pipeline-shared.css`

The shared page layout must be defined once and used identically in Dashboard and Roadmap:

```css
/* In pipeline-shared.css — canonical page layout */
.agents-page-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 16px;
  padding: 16px 20px;
  max-width: 1400px;
  margin: 0 auto;
  align-items: start;
}
@media (max-width: 960px) {
  .agents-page-layout { grid-template-columns: 1fr; }
}
.agents-page-main    { min-width: 0; }
.agents-page-sidebar { min-width: 0; width: 300px; display:flex; flex-direction:column; gap:12px; }
```

**PIPELINE_DASHBOARD.html:** The current sidebar div must use class `agents-page-sidebar` and the main content div must use `agents-page-main`, both wrapped in `agents-page-layout`.

**PIPELINE_ROADMAP.html:** Same — the `.page-layout` grid must be renamed to `agents-page-layout`. The sidebar becomes `agents-page-sidebar`.

**PIPELINE_TEAMS.html:** Teams uses a different structural pattern (left team-list nav + right content panel). It does NOT use `agents-page-layout`. However, it MUST use the canonical header (§5.1). The teams layout remains `grid-template-columns: 220px 1fr` as is.

### 5.3 UI-02: Two-Column Roadmap — Program Detail in Sidebar

**Files:** `PIPELINE_ROADMAP.html`, `pipeline-roadmap.js`, `pipeline-roadmap.css`

**Current behavior (to change):** When a program is clicked in the roadmap tree, a `.prog-detail-panel` div appears inline in the main column (Column A), below the tree.

**Required behavior:** The program detail panel must render in the **right sidebar** (Column B), at the top of the sidebar. The sidebar is dynamic:

- **No program selected** → sidebar shows: [Domain Stats] → [Hierarchy Validation] → [Canonical Files]
- **Program selected** → sidebar shows: [Program Detail Panel] → [Domain Stats (collapsed or below)] → [Hierarchy Validation] → [Canonical Files]

**HTML structure for sidebar:**
```html
<div class="agents-page-sidebar">
  <!-- Program detail — shown when a program is selected -->
  <div id="prog-detail-sidebar" style="display:none">
    <div class="sidebar-section-card">
      <div class="sidebar-section-title">📋 Program Detail</div>
      <div id="prog-detail-content"><!-- rendered by JS --></div>
    </div>
  </div>

  <!-- Domain stats — always visible -->
  <div id="sidebar-stats"><!-- rendered by renderDomainStats() --></div>

  <!-- Hierarchy validation -->
  <div class="sidebar-section-card" id="sidebar-validation">
    <div class="sidebar-section-title">🔍 Hierarchy Validation</div>
    <div id="validation-content" class="loading">Loading…</div>
  </div>

  <!-- Canonical files -->
  <div class="sidebar-section-card" id="sidebar-canonical">
    <div class="sidebar-section-title">📁 Canonical Task Files</div>
    <div id="canonical-files-content" class="loading">Loading…</div>
  </div>
</div>
```

**JS change in `pipeline-roadmap.js`:**
```javascript
function loadProgramDetail(programId) {
  // Render detail into #prog-detail-content
  // Show #prog-detail-sidebar
  // Scroll sidebar to top
  document.getElementById('prog-detail-sidebar').style.display = '';
  // ... render detail content ...
}

function clearProgramDetail() {
  document.getElementById('prog-detail-sidebar').style.display = 'none';
}
```

The `.prog-detail-panel` in the main column (current inline location) must be **removed**. The main column contains ONLY the domain selector and the roadmap tree.

---

## 6) Execution Sequence

Execute in this order. Test after each phase before proceeding.

| Phase | Task | Blocking pre-condition |
|---|---|---|
| **0** | PRE-01: Re-scan PIPELINE_ROADMAP.html — full class + function inventory | — |
| **0** | PRE-02: Re-scan PIPELINE_DASHBOARD.html — capture additions | — |
| **1** | Create `pipeline-shared.css` — `:root` vars, body, nav, **canonical header (§5.1)**, **canonical layout (§5.2)**, status pills, buttons, `.legacy-fallback-badge` | PRE-01, PRE-02 |
| **2** | Create `pipeline-config.js` — all constants + `AUTHORIZED_STAGE_EXCEPTIONS` (§3.3) | — |
| **3** | Create `pipeline-state.js` — state management + `loadDomainState()` + `stateFallbackMode` (§3.4) | Phase 2 |
| **4** | Create `pipeline-dom.js` — rendering utilities | Phase 3 |
| **5** | Create `pipeline-commands.js`, `pipeline-booster.js`, `pipeline-help.js` | Phase 3 |
| **6** | Create `pipeline-dashboard.js` — full Dashboard logic | Phases 4–5 |
| **7** | Create `pipeline-dashboard.css` — Dashboard-specific CSS including health panel classes | Phase 1 |
| **8** | Refactor `PIPELINE_DASHBOARD.html` — canonical header (§5.1), canonical layout (§5.2), remove inline CSS/JS, add `<link>` + `<script>` tags | Phases 6–7 |
| **9** | **Test Dashboard** — load, all functions work, health panel, mandate accordion | Phase 8 |
| **10** | Create `pipeline-roadmap.js` — Roadmap logic + `checkStageConflict()` 3-state (§4.1) + `loadProgramDetail()` to sidebar (§5.3) + SPC-02 badge | Phases 3–5 |
| **11** | Create `pipeline-roadmap.css` — Roadmap-specific CSS including 3-state conflict banner (§4.1) | Phase 1 |
| **12** | Refactor `PIPELINE_ROADMAP.html` — canonical header (§5.1), `agents-page-layout`, move `.prog-detail-panel` to sidebar (§5.3), remove inline CSS/JS | Phases 10–11 |
| **13** | **Test Roadmap** — load, tree, program click → sidebar detail, conflict banner states, domain switch | Phase 12 |
| **14** | Create `pipeline-teams.js` | Phases 3–5 |
| **15** | Create `pipeline-teams.css` | Phase 1 |
| **16** | Refactor `PIPELINE_TEAMS.html` — canonical header (§5.1), remove inline CSS/JS | Phases 14–15 |
| **17** | **Test Teams** — load, team selection, mandates | Phase 16 |
| **18** | **Full cross-page test** — all ACs in §9 | Phases 9, 13, 17 |

---

## 7) Canonical CSS Class Inventory

The following CSS classes must be defined in the canonical files as indicated. Team 61 must not invent new class names that duplicate these — they must use these names for the relevant components.

### pipeline-shared.css (cross-page classes)
| Class | Purpose |
|---|---|
| `.agents-header` | Page header container (§5.1) |
| `.agents-header-left` / `.agents-header-right` | Header columns |
| `.agents-header-title` | Page title in header |
| `.agents-refresh-label` | Auto-refresh indicator text |
| `.agents-refresh-btn` | Refresh button |
| `.agents-page-layout` | Main grid layout (§5.2) |
| `.agents-page-main` | Main content column |
| `.agents-page-sidebar` | Right sidebar column |
| `.sidebar-section-card` | Sidebar section wrapper |
| `.sidebar-section-title` | Sidebar section heading |
| `.legacy-fallback-badge` | State source fallback indicator (§4.2) |
| `.status-pill`, `.pill-pass`, `.pill-fail`, `.pill-current`, `.pill-pending`, `.pill-human` | Status indicators |
| `.domain-badge` | Domain indicator chip |
| `.section-card`, `.section-title` | Content card components |

### pipeline-roadmap.css (Roadmap-specific)
| Class | Purpose |
|---|---|
| `.rm-stage`, `.rm-stage-header`, `.rm-programs`, `.rm-program` | Tree nodes |
| `.rm-stage-active`, `.rm-program-active`, `.rm-program-selected` | Tree states |
| `.conflict-banner`, `.state-blocking`, `.state-exception` | 3-state conflict banner (§4.1) |
| `.stat-domain-card`, `.tiktrack-card`, `.agentsos-card`, `.total-card` | Domain stat cards |
| `.prog-detail-panel` | Program detail in sidebar |
| `.gate-seq-table` | Gate sequence table |

### pipeline-dashboard.css (Dashboard-specific)
| Class | Purpose |
|---|---|
| `.health-warn-item`, `.hw-error`, `.hw-warning`, `.hw-body`, `.hw-copy-btn` | Health panel |
| `.acc-header`, `.acc-body` | Accordion components |
| `.prompt-box`, `.quick-action-bar` | Prompt and action areas |
| `.mandate-content`, `.findings-builder` | Mandate and findings areas |

---

## 8) Scope Confirmation — Nothing Orphaned

All items identified in ADR-031 and Team 190 findings have confirmed homes:

| Item | Home |
|---|---|
| ADR-031 Stage A (13 items) | ✅ COMPLETE — this session |
| SPC-01 (false conflict) | ✅ This work package §4.1 |
| SPC-02 (domain state source) | ✅ This work package §3.4, §4.2 |
| SPC-03 (WSM mismatch directive) | ✅ This work package §4.1 (covered by SPC-01 implementation) |
| UI-01 (sidebar consistency) | ✅ This work package §5.2 |
| UI-02 (two-column roadmap) | ✅ This work package §5.3 |
| UI-03 (unified header) | ✅ This work package §5.1 |
| AOUI-F02 (CSS index) | ✅ Team 10 directive — post-merge (separate doc) |
| OI-01 (Model B definition) | ✅ S003-P007 intake — Team 190 |
| OI-02 (D-04 formal doc) | ✅ Before S004-P008 — Team 190 |

---

## 9) Acceptance Criteria

All ACs must PASS before submission to Team 51.

| AC | Criterion | Evidence Required |
|---|---|---|
| **AC-01** | No `CONFLICT_BLOCKING` banner when `AUTHORIZED_STAGE_EXCEPTIONS` entry exists for the pipeline stage | Screenshot showing `state-exception` yellow banner with authority ref for S001-P002 scenario |
| **AC-02** | `CONFLICT_BLOCKING` red banner shown when stage is CLOSED and no exception entry exists | Screenshot showing `state-blocking` red banner |
| **AC-03** | Domain selector change in Roadmap loads from domain-specific state file (`pipeline_state_tiktrack.json` or `pipeline_state_agentsos.json`) | Browser network tab showing correct file request |
| **AC-04** | `LEGACY_FALLBACK` badge shown when generic `pipeline_state.json` used as fallback | Screenshot + manual test (rename/remove domain file temporarily) |
| **AC-05** | All three pages: identical header structure (`.agents-header`), title in same position, Refresh button in same position | Screenshot bundle — all 3 pages side by side |
| **AC-06** | Dashboard and Roadmap: sidebar is right-aligned, 300px width, using `agents-page-layout` grid | CSS inspection + screenshot |
| **AC-07** | Roadmap: clicking a program shows program detail panel **in the sidebar** (not inline in main column) | Runtime click test + screenshot |
| **AC-08** | Roadmap: main column contains ONLY the domain selector and the roadmap tree (no inline program detail) | DOM inspection |
| **AC-09** | No inline `<style>` blocks in any of the 3 HTML files (except at most a `<style>:root{}</style>` init stub if unavoidable) | Code review |
| **AC-10** | No inline `<script>` blocks in any of the 3 HTML files (except at most a 2-line `document.addEventListener` init if unavoidable) | Code review |
| **AC-11** | Dashboard: health warnings panel renders correctly | Test with missing STATE_SNAPSHOT fields |
| **AC-12** | Dashboard: mandate accordion hidden at non-mandate gates (e.g. GATE_1); shown at mandate gates | Test at GATE_1 vs mandate gate |
| **AC-13** | All 3 pages load correctly, domain switching works, all core functionality preserved | Full functional smoke test |
| **AC-14** | Preflight URL test: all files in `css/` and `js/` return 200 from the UI server | HTTP request log |

---

## 10) Pre-submission Checklist (Team 61 self-check)

Before handing off to Team 51:

- [ ] PRE-01 and PRE-02 re-scans completed, inventory updated
- [ ] All 4 CSS files created and populated
- [ ] All 9 JS files created and populated
- [ ] All 3 HTML files: no inline CSS (AC-09), no inline JS (AC-10)
- [ ] `AUTHORIZED_STAGE_EXCEPTIONS` in `pipeline-config.js` with S001 entry
- [ ] `loadDomainState()` in `pipeline-state.js` with fallback + `stateFallbackMode` flag
- [ ] `checkStageConflict()` returns 3-state object (OK / AUTHORIZED_EXCEPTION / CONFLICT_BLOCKING)
- [ ] Conflict banner renders with correct class modifier per result type
- [ ] Program detail shows in sidebar (AC-07), NOT inline in main column (AC-08)
- [ ] Canonical header structure identical in all 3 pages (AC-05)
- [ ] `agents-page-layout` used in Dashboard and Roadmap (AC-06)
- [ ] All 14 ACs above confirmed PASS
- [ ] Preflight URL test run for all new css/ and js/ files (AC-14)

---

## 11) Post-merge Actions (not Team 61's responsibility)

| Action | Owner | Trigger |
|---|---|---|
| CSS_CLASSES_INDEX update (AOUI-F02) | Team 10 → Team 170 | After merge confirmed |

---

**log_entry | TEAM_100 | AGENTS_OS_UI_WORK_PACKAGE_LOD400 | APPROVED_FOR_IMMEDIATE_IMPLEMENTATION | 2026-03-14**
