---
project_domain: AGENTS_OS
id: TEAM_170_S002_P005_WP002_DEVELOPER_GUIDES_UPDATE_REPORT
from: Team 170 (Spec & Governance — GATE_8 executor)
to: Team 90 (GATE_8 validation), Team 00, Team 100
date: 2026-03-15
status: GATE_8_SUBMISSION
gate_id: GATE_8
work_package_id: S002-P005-WP002
---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP002 |
| gate_id | GATE_8 |
| phase_owner | Team 90 |
| project_domain | AGENTS_OS |

---

## 1) As-Built Behavior Summary (Pipeline Governance)

### Help Modal — 4 tabs
- **Start:** Quick Start, Three Modes (mode-1/2/3), domain examples (`--domain agents_os`, `--domain tiktrack`)
- **Gates:** GATE_1 Phase 1/2, G3_5 owner, GATE_8 owner; correction cycle
- **Commands:** `phase2`, `pass`, `fail`, `--domain`; pass_with_actions, actions_clear, override
- **Help:** FAQ (domain ambiguity, GATE_1 BLOCK, Phase 2, store fails); Troubleshooting; links to PIPELINE_ROADMAP.html, PIPELINE_TEAMS.html

### Three Modes
- **Mode 1:** Legacy — no AOS pipeline; Team 10 process coordinator
- **Mode 2:** Semi-auto — AOS + Dashboard; pipeline routes
- **Mode 3:** Full-auto — pipeline fully replaces Team 10 coordination

### Domain Switch
- Sidebar badge: 🔵 TikTrack / 🟢 Agents OS
- Clicks load state from `pipeline_state_agentsos.json` (or tiktrack equivalent)
- Gate Timeline and Pipeline Status reflect current domain

### Context Banner
- `help-context-zone` populated by pipeline-help.js: "You are at: {gate}"
- Data from pipeline_state; visible in all Help tabs

---

## 2) Runtime/Ops Notes

### pipeline_run.sh
- `--domain agents_os | tiktrack` — explicit domain selection
- `pass_with_actions "a1|a2"` — record PASS_WITH_ACTION, HOLD gate
- `actions_clear` — advance gate when actions resolved
- `override "reason"` — Nimrod advance with override
- Gate advance blocked when `gate_state === "PASS_WITH_ACTION"` unless actions_clear or override

### pipeline.py
- CLI: `--advance GATE_X PASS|FAIL`; domain from `--domain` or auto-detect
- State write: gate_state, pending_actions, override_reason in pipeline_state JSON

### PIPELINE_DASHBOARD.html
- Fetches state from `pipeline_state_agentsos.json` (or domain-specific)
- PWA banner when gate_state = PASS_WITH_ACTION (yellow; pending list; Actions Resolved / Override buttons)
- Help modal: 4 tabs; context banner; Hebrew toggle (lang-he / lang-en)

---

## 3) Canonical Pointers

| Document | Path |
|----------|------|
| Pipeline State & Behavior | `documentation/docs-agents-os/03-CLI-REFERENCE/PIPELINE_STATE_AND_BEHAVIOR_v1.0.0.md` |
| Gate rules | `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md` |
| Team role mapping | `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md` |
| AGENTS_OS Overview | `documentation/docs-agents-os/01-OVERVIEW/AGENTS_OS_OVERVIEW.md` |
| Design backlog | `_COMMUNICATION/team_100/TEAM_100_PASS_WITH_ACTION_PIPELINE_GOVERNANCE_BACKLOG_v1.0.0.md` |
| Dashboard UI Registry | `agents_os/ui/docs/PIPELINE_DASHBOARD_UI_REGISTRY_v1.0.0.md` |

---

## 4) Known Caveats (carried to future cycles)

| ID | Caveat | Non-blocking |
|----|--------|--------------|
| OBS-02 | insist command — implementation pending | Yes |
| HELP-TAB | Tab persistence (localStorage) — not verified at GATE_7 | Yes |

---

## 5) Evidence-by-path

1. `documentation/docs-agents-os/03-CLI-REFERENCE/PIPELINE_STATE_AND_BEHAVIOR_v1.0.0.md`
2. `_COMMUNICATION/team_51/TEAM_51_S002_P005_WP002_GATE7_BROWSER_VERIFICATION_v1.0.0.md`
3. `agents_os/ui/js/pipeline-help.js` — tabs, context banner
4. `agents_os/ui/PIPELINE_DASHBOARD.html` — structure

---

**log_entry | TEAM_170 | S002_P005_WP002 | DEVELOPER_GUIDES_UPDATE_REPORT | GATE8_SUBMISSION | 2026-03-15**
