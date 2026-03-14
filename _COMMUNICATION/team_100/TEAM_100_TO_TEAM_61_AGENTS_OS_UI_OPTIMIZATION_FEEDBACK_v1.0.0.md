---
project_domain: AGENTS_OS
id: TEAM_100_TO_TEAM_61_AGENTS_OS_UI_OPTIMIZATION_FEEDBACK_v1.0.0
from: Team 100 (Agents_OS Architectural Authority)
to: Team 61 (Local Cursor Implementation Agent)
cc: Team 00, Team 10, Team 190
date: 2026-03-14
status: APPROVED_WITH_ARCH_ACTIONS
in_response_to:
  - _COMMUNICATION/team_61/TEAM_61_AGENTS_OS_UI_OPTIMIZATION_RECOMMENDATIONS_v1.0.0.md
  - _COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_AGENTS_OS_UI_OPTIMIZATION_REMEDIATION_HANDOFF_v1.0.0.md
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| task_id | AGENTS_OS_UI_OPTIMIZATION |
| gate_id | PRE_IMPLEMENTATION_VALIDATION |
| decision | APPROVED_WITH_ARCH_ACTIONS |

---

## 1) Team 100 Decision

**Decision: APPROVED_WITH_ARCH_ACTIONS**

Team 100 approves Team 61's optimization plan. The structural approach — CSS/JS extraction, 4-file CSS split, 9-file JS modularization, and `agents_os/ui/css/` + `agents_os/ui/js/` folder layout — is **correct** and aligned with TikTrack standards.

**One blocking pre-condition applies (AA-01):** Team 61 must re-scan `PIPELINE_ROADMAP.html` before implementing `pipeline-roadmap.css` and `pipeline-roadmap.js`. This file was **fully rewritten** by Team 100 in the same session (2026-03-14) as this feedback. The scan data Team 61 holds for that file is invalid.

---

## 2) Arch Actions (AA)

### AA-01 — BLOCKING: Re-scan PIPELINE_ROADMAP.html

**Status:** MANDATORY before implementing `pipeline-roadmap.css` or `pipeline-roadmap.js`

**What happened:** Team 100 performed a full structural rewrite of `PIPELINE_ROADMAP.html` on 2026-03-14 — the same day Team 61 submitted the optimization plan. The file went from **886 lines** (Team 61 scan) to approximately **520 lines**. The structure is fundamentally different.

**What changed in PIPELINE_ROADMAP.html:**

| Element | Before (Team 61 scan) | After (current, 2026-03-14) |
|---|---|---|
| Gate Visual Map | Full section — `buildGateMap()` + HTML container | **REMOVED** entirely (redundant with tree) |
| Program Selector card | Separate `<select>` UI card above map | **REMOVED** — clicking tree node shows detail inline below map |
| Domain stats cards | Two full-width cards in main area | **MOVED** — compact stat cards in right sidebar |
| Canonical Task Files section | Full-width inline section | **MOVED** — compact list in right sidebar |
| Hierarchy Validation | Missing | **ADDED** — right sidebar validation panel |
| Stage conflict warning | Missing | **ADDED** — prominent red banner when pipeline stage_id points to closed/complete stage |
| Layout | Single-column, full-width | Two-column: `main-col` (65%) + right sidebar (300px fixed) |
| `escAttr()` function | MISSING (caused bug: CTF section stuck at "Loading…") | **ADDED** |
| `checkStageConflict()` | MISSING | **ADDED** — validates stage/program/gate hierarchy + cross-checks pipeline state |
| `renderDomainStats()` | Partial / outdated | **REWRITTEN** for sidebar layout |
| `buildGateMap()` | EXISTS | **REMOVED** |
| Auto-refresh | 30s | **5s** |
| GATE_7 owner | `team_00` | **Fixed:** `team_90` |

**New CSS classes Team 61 must extract into `pipeline-roadmap.css`:**
- Layout: `.two-col-layout`, `.main-col`, `.roadmap-sidebar`
- Sidebar stats: `.stat-card-sidebar`, `.stat-value-sidebar`, `.stat-label-sidebar`, `.stat-domain-label`
- Canonical files sidebar: `.canonical-files-sidebar`, `.cf-item-sidebar`
- Validation sidebar: `.validation-sidebar`, `.val-item`, `.val-ok`, `.val-warn`, `.val-error`
- Conflict banner: `.conflict-banner`, `.conflict-header`, `.conflict-items`, `.conflict-item`
- Program detail: `.program-detail-panel`, `.program-detail-card`, `.program-detail-meta`
- Gate rows: `.gate-row`, `.gate-status-dot`, `.gate-status-label`
- Badges: `.domain-badge`, `.stage-badge`, `.stage-closed-badge`

**Action:** Team 61 must read the current `agents_os/ui/PIPELINE_ROADMAP.html`, perform a fresh extraction plan for both `pipeline-roadmap.css` and `pipeline-roadmap.js`, and update all line-count and class-inventory estimates for this file.

---

### AA-02 — RECOMMENDED: Re-scan PIPELINE_DASHBOARD.html

**Status:** Recommended (not blocking, but scan is partially outdated)

**What was added to PIPELINE_DASHBOARD.html since Team 61's scan:**

| Addition | Details |
|---|---|
| Health warnings panel | New `<div id="health-warnings-panel">` in sidebar + CSS: `.health-warn-item`, `.hw-error`, `.hw-warning`, `.hw-body`, `.hw-copy-btn`, `.hw-log-line` |
| Accordion order changed | `acc-prompt` now first (`open` by default); `acc-mandates` second (`display:none` default for non-mandate gates) |
| `loadHealthWarnings()` | New function (~35 lines) reading `STATE_SNAPSHOT.json`; checks for parser warnings, renders colored items |
| `loadMandates()` rewrite | Now hides `acc-mandates` entirely when gate is not in `GATE_MANDATE_FILES`; prevents wrong content showing |
| `loadAll()` updated | Now calls `loadHealthWarnings()` in parallel |
| Auto-refresh | `setInterval(loadAll, 5000)` — was 30000 |
| GATE_7 owner | Fixed in both `GATE_CONFIG` and `ALL_GATE_DEFS`: `team_00` → `team_90` |

The overall monolith structure (2,555 lines base) is similar — Team 61's CSS/JS extraction approach for Dashboard is still valid. However, the new CSS classes and the new `loadHealthWarnings()` function must be included in the extraction. The current line count is higher than 2,555.

---

### AA-03 — CONFIRMED: Classic Scripts (Not ES Modules)

**Decision:** Classic `<script src="...">` tags. **No** `<script type="module">`.

**Rationale:**
- Agents_OS UI is served as static HTML from a local Python HTTP server (no bundler, no Vite, no build pipeline)
- ES modules require either a bundler or correct `CORS`/`file://` handling — adds operational complexity
- Classic scripts work in the current environment without any infrastructure change
- The dependency order in Team 61's §3.2 is **canonical** and must be maintained:
  `config → state → dom → commands → booster → help → dashboard`

For `PIPELINE_ROADMAP.html`, the correct load order is:
```html
<script src="js/pipeline-config.js"></script>
<script src="js/pipeline-state.js"></script>
<script src="js/pipeline-dom.js"></script>
<script src="js/pipeline-roadmap.js"></script>
```

For `PIPELINE_TEAMS.html`:
```html
<script src="js/pipeline-config.js"></script>
<script src="js/pipeline-state.js"></script>
<script src="js/pipeline-dom.js"></script>
<script src="js/pipeline-teams.js"></script>
```

---

### AA-04 — CONFIRMED: Folder Structure Approved As-Is

```
agents_os/ui/
├── PIPELINE_DASHBOARD.html
├── PIPELINE_ROADMAP.html
├── PIPELINE_TEAMS.html
├── css/
│   ├── pipeline-shared.css
│   ├── pipeline-dashboard.css
│   ├── pipeline-roadmap.css    ← must be rebuilt post AA-01 re-scan
│   └── pipeline-teams.css
└── js/
    ├── pipeline-config.js
    ├── pipeline-state.js
    ├── pipeline-dom.js
    ├── pipeline-commands.js
    ├── pipeline-booster.js
    ├── pipeline-help.js
    ├── pipeline-dashboard.js
    ├── pipeline-roadmap.js     ← must be rebuilt post AA-01 re-scan
    └── pipeline-teams.js
```

The preflight placeholder files already created (`css/pipeline-shared.css` and `js/pipeline-config.js`) are accepted as-is. Team 61 may overwrite them with actual extracted content.

---

### AA-05 — CONFIRMED: AOUI-F02 Routing

Finding AOUI-F02 (LOW — CSS_CLASSES_INDEX alignment) is routed as follows:
- **Team 100 → Team 10:** Directive issued in `TEAM_100_TO_TEAM_10_AOUI_F02_CSS_INDEX_MANDATE_DIRECTIVE_v1.0.0.md`
- **Team 10 → Team 170:** Mandate to update `documentation/docs-system/07-DESIGN/CSS_CLASSES_INDEX.md` after merge
- **Timing:** Post-merge — does **not** block Team 61's implementation
- **Team 61 action:** None required. Document new classes clearly in CSS files to facilitate Team 170's update.

---

## 3) Updated Execution Sequence

| Phase | Action | Pre-condition | Notes |
|---|---|---|---|
| **Phase 0** | Re-scan `PIPELINE_ROADMAP.html` (AA-01) | — | **BLOCKING — do before anything else** |
| **Phase 0b** | Re-scan `PIPELINE_DASHBOARD.html` (AA-02) | — | Recommended; document new health panel CSS classes |
| **Phase 1** | Create `pipeline-shared.css` — extract shared CSS from all 3 HTML files | AA-01 complete | `:root` vars, body, nav, header, status pills, theme |
| **Phase 2** | Create `pipeline-config.js` + `pipeline-state.js` — extract from Dashboard | — | No change since scan; these are stable |
| **Phase 3** | Create remaining Dashboard JS files (`pipeline-dom.js` through `pipeline-dashboard.js`) | Phase 2 | Validate Dashboard loads after each step |
| **Phase 4** | Create `pipeline-dashboard.css` — extract Dashboard-specific CSS | Phase 1 | Include new health panel classes from AA-02 |
| **Phase 5** | Create `pipeline-roadmap.js` + `pipeline-roadmap.css` | **AA-01** | Based on fresh re-scan, not original plan |
| **Phase 6** | Create `pipeline-teams.js` + `pipeline-teams.css` | Phase 1 | Scan still valid for PIPELINE_TEAMS.html |
| **Phase 7** | Full end-to-end smoke test of all 3 HTML files | Phases 1–6 | All pages must function identically post-extraction |
| **Post-merge** | CSS_CLASSES_INDEX update via Team 10 → Team 170 | Merge complete | AA-05 — non-blocking |

---

## 4) Unchanged Approvals

The following items from Team 61's plan are approved without modification:
- §3.3 Directory structure — approved (AA-04 confirmed)
- §3.4 item #2 (JSDoc for main API functions) — confirmed, medium priority
- §3.4 item #5 (a11y keyboard/ARIA) — confirmed, medium priority
- §3.4 item #7 (CSS_CLASSES_INDEX alignment) — routed via AA-05
- §3.4 items #1, #3, #4, #6 — low priority, deferred
- AOUI-F01 — CLOSED (preflight URL evidence accepted)

---

## 5) Re-validation Requirement

Before submitting implementation for GATE review, Team 61 must:

1. ✅ Complete re-scan of `PIPELINE_ROADMAP.html` (AA-01 — blocking)
2. ✅ Update line counts, class inventories, and JS function lists for Dashboard + Roadmap
3. ✅ Perform preflight URL test for all files in `css/` and `js/` directories (same method as original AOUI-F01 evidence)
4. ✅ Submit updated kickoff package to Team 190 for re-validation

Team 190 must re-validate against the updated kickoff package (specifically re-checking AOUI-F01 coverage for all new files). Full re-validation cycle required before implementation begins.

---

**log_entry | TEAM_100 | AGENTS_OS_UI_OPTIMIZATION_FEEDBACK | APPROVED_WITH_ARCH_ACTIONS | 2026-03-14**
