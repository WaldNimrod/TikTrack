---
id: TEAM_61_AGENTS_OS_UI_CSS_CLASS_INVENTORY_v1.0.0
from: Team 61 (Cloud Agent / DevOps Automation)
to: Team 10, Team 170 (CSS_CLASSES_INDEX input)
cc: Team 100, Team 190
date: 2026-03-14
historical_record: true
status: INPUT_FOR_AOUI_F02
in_response_to: AOUI-IMP-ACT-01, AOUI-F02 (TEAM_100_TO_TEAM_10_AOUI_F02_CSS_INDEX_MANDATE_DIRECTIVE)
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| task_id | AGENTS_OS_UI_OPTIMIZATION |
| decision | CSS_INVENTORY_INPUT |

---

## 1) Purpose

Input for Team 170's update of `documentation/docs-system/07-DESIGN/CSS_CLASSES_INDEX.md` per AOUI-F02 mandate. Agents_OS UI (LOD400) uses a separate CSS stack under `agents_os/ui/css/` — not phoenix-base/phoenix-components. This inventory documents all CSS classes defined in the pipeline UI files for incorporation into the canonical index.

---

## 2) Pipeline UI — File Structure

| File | Scope |
|------|-------|
| pipeline-shared.css | Cross-page (Dashboard, Roadmap, Teams) |
| pipeline-dashboard.css | Dashboard only |
| pipeline-roadmap.css | Roadmap only |
| pipeline-teams.css | Teams only |

---

## 3) Class Inventory by File

### pipeline-shared.css (cross-page)

| Class | Purpose |
|-------|---------|
| .pipeline-nav | Top navigation bar |
| .nav-link, .nav-link.active | Navigation links |
| .nav-sep | Separator between nav items |
| .agents-header | Canonical page header (§5.1) |
| .agents-header-left, .agents-header-right | Header columns |
| .agents-header-title | Page title in header |
| .agents-refresh-label | Refresh / meta label |
| .agents-refresh-btn | Refresh button |
| .agents-page-layout | Canonical grid layout (§5.2) |
| .agents-page-main | Main content column |
| .agents-page-sidebar | Right sidebar column |
| .section-card, .section-title | Content section cards |
| .sidebar-section-card, .sidebar-section-title | Sidebar section wrapper |
| .status-pill | Status chip base |
| .pill-pass, .pill-fail, .pill-current, .pill-pending, .pill-human | Status pill variants |
| .legacy-fallback-badge | SPC-02 fallback indicator |
| .btn, .btn-primary | Buttons |
| .domain-badge | Domain chip |
| .domain-tiktrack, .domain-agentsos | Domain badge variants |
| .domain-selector | Domain button group |
| .domain-btn, .domain-btn.active-tiktrack, .domain-btn.active-agentsos | Domain toggle buttons |
| .domain-label-badge, .domain-label-tiktrack, .domain-label-agentsos | Sidebar domain label |
| .badge | Generic badge |
| .loading, .error-msg | Text states |
| .refresh-label, .refresh-dot | Auto-refresh controls |

### pipeline-dashboard.css

| Class | Purpose |
|-------|---------|
| .sidebar-section, .sidebar-label | Sidebar grouping |
| .info-row, .info-key, .info-val | Info key-value rows |
| .gate-list, .gate-item, .gate-item.is-current | Gate timeline list |
| .gate-dot, .dot-pass, .dot-fail, .dot-current, .dot-pending, .dot-human | Gate status dots |
| .gate-name, .gate-status-text | Gate row text |
| .spec-card, .spec-text, .spec-wp | Spec display |
| .accordion, .accordion-header, .accordion-title, .accordion-badge, .accordion-chevron | Accordion |
| .accordion-body, .accordion.open | Accordion body/state |
| .prompt-toolbar, .prompt-meta, .prompt-box | Prompt area |
| .copy-flash | Copy feedback |
| .booster-panel, .booster-toggle-row, .booster-options | Booster panel |
| .booster-type-tabs, .booster-tab, .booster-preview, .booster-footer, .booster-hint | Booster UI |
| .mandate-redirect-banner | Mandate redirect notice |
| .mandate-content | Mandate text area |
| .team-tabs, .team-tab, .phase-badge, .correction-badge | Team mandate tabs |
| .file-list, .file-row, .file-path, .file-icon | Expected files list |
| .health-warn-item, .hw-error, .hw-warning, .hw-info | Health warnings |
| .hw-icon, .hw-body, .hw-msg, .hw-log-row, .hw-log, .hw-copy-btn | Health warning detail |
| .sidebar-cmd-list, .sidebar-cmd-row, .sidebar-cmd-text, .sidebar-cmd-btn | Sidebar commands |
| .modal-overlay, .modal-box, .modal-close | Modals |
| .help-btn, .step-box, .alert-box, .tip-box | Help modal |
| .quick-action-bar, .qa-btn | Quick actions |
| .findings-builder | Findings area |

### pipeline-roadmap.css

| Class | Purpose |
|-------|---------|
| .rm-stage, .rm-stage-active, .rm-stage-header, .rm-chevron | Roadmap tree stage |
| .rm-stage-id, .rm-stage-name, .rm-programs | Stage content |
| .rm-program, .rm-program-active, .rm-program-selected | Program row |
| .rm-prog-id, .rm-prog-name, .rm-prog-domain, .rm-status | Program detail |
| .rm-s-active, .rm-s-complete, .rm-s-planned, .rm-s-deferred, .rm-s-hold | Status badges |
| .prog-detail-panel | Program detail in sidebar |
| .gate-seq-table, .gate-name-cell, .decision-marker | Gate sequence table |
| .gate-history-list, .history-item, .history-gate, .fail-cycle-tag | Gate history |
| .stat-domain-card, .tiktrack-card, .agentsos-card, .total-card | Domain stat cards |
| .stat-domain-title, .stat-dot, .stat-row, .stat-item | Stat display |
| .conflict-banner, .state-blocking, .state-exception | 3-state conflict banner |
| .cf-row, .cf-path | Canonical files list |
| .rm-val-ok, .rm-val-err | Validation status |

### pipeline-teams.css

| Class | Purpose |
|-------|---------|
| .teams-layout | Teams grid (220px 1fr) |
| .team-list, .team-list-header | Team list sidebar |
| .team-item, .team-item.active | Team row |
| .team-badge, .team-item-name, .team-engine-dot | Team row detail |
| .dot-cursor, .dot-codex, .dot-human, .dot-auto | Engine indicators |
| .team-panel, .team-panel-empty | Team detail panel |
| .team-header-card, .team-id-badge, .team-role-text | Team header |
| .team-meta-row, .team-meta-item, .team-meta-lbl, .team-meta-val | Team meta |
| .prompt-tabs, .prompt-tab | Prompt type tabs |
| .prompt-output-card, .prompt-output-header, .prompt-output-pre | Prompt output |
| .state-strip | State display strip |
| .pv-panel, .pv-title, .pv-desc, .pv-field, .pv-actions, .pv-warn | Validation panel |
| .section-card, .section-title | Section cards |
| .copy-flash | Copy feedback |

---

## 4) Routing for AOUI-IMP-ACT-01

- **Team 10:** Include this inventory in mandate to Team 170 for CSS_CLASSES_INDEX update.
- **Team 170:** Add new section "Agents_OS Pipeline UI" referencing `agents_os/ui/css/*.css` and the classes above, or merge into existing categories as appropriate.

---

**log_entry | TEAM_61 | CSS_CLASS_INVENTORY | AOUI_F02_INPUT | 2026-03-15**
