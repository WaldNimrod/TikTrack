---
**project_domain:** AGENTS_OS
**id:** TEAM_61_PRE_SCAN_ROADMAP_DASHBOARD_v1.0.0
**from:** Team 61
**date:** 2026-03-14
**status:** COMPLETE
---

# PRE-01 / PRE-02 Scan — Roadmap + Dashboard

## PRE-01: PIPELINE_ROADMAP.html (852 lines)

**CSS classes (lines 7–157):** `:root`, `.page-layout`, `.section-card`, `.section-title`, `.status-pill`, `.pill-*`, `.rm-stage`, `.rm-stage-header`, `.rm-programs`, `.rm-program`, `.prog-detail-panel`, `.gate-seq-table`, `.sidebar`, `.stat-domain-card`, `.sidebar-section-card`, `.conflict-banner`, `.cf-row`, `.rm-val-*`, `.refresh-label`, `.refresh-dot`

**JS functions:** `fetchJSON`, `fetchText`, `fileExists`, `escHtml`, `escAttr`, `gateStatus`, `statusPillClass`, `statusLabel`, `extractTable`, `rmStatusClass`, `rmStatusLabel`, `loadPipelineState`, `buildProgramSelector`, `onProgSelect`, `highlightRoadmapProgram`, `makeVirtualState`, `renderDomainStats`, `checkStageConflict`, `renderRoadmapTree`, `renderGateSequence`, `renderGateHistory`, `loadCanonicalFiles`, `loadAll`, `openFileViewer`, `closeFileViewer`

**Structure:** `#prog-detail` in main column (line 201); `aside.sidebar` (line 218); no domain selector — loads `pipeline_state.json` only.

## PRE-02: PIPELINE_DASHBOARD.html (2644 lines)

**Additions:** `.health-warn-item`, `.hw-error`, `.hw-warning`, `.hw-body`, `.hw-copy-btn`; `loadHealthWarnings()`, `loadMandates()`; `loadAll()` calls `loadMandates()`, `checkExpectedFiles()`, `loadHealthWarnings()` (line 2590).

---
**log_entry | TEAM_61 | PRE_SCAN | COMPLETE | 2026-03-14**
