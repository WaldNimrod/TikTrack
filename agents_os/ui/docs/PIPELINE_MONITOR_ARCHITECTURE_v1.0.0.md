# PIPELINE_MONITOR Architecture v1.0.0

> Superseded on 2026-03-20 by `PIPELINE_MONITOR_ARCHITECTURE_v1.1.0.md` after split to:
> `PIPELINE_MONITOR.html` (Live runtime) and `PIPELINE_CONSTITUTION.html` (Process constitution map).

Date: 2026-03-20  
Owner: Team 190 (Constitutional Validator, implementation support)

## 1. Purpose
`PIPELINE_MONITOR.html` is a read-only operations monitor for two goals:
1. Exact process understanding (canonical 5-gate flow with phase ownership).
2. Live current-state visibility for both domains at the same time (`tiktrack`, `agents_os`).

The monitor now supports track-aware analysis:
- `AUTO` (dual view: `TRACK_FULL` + `TRACK_FOCUSED`)
- `TRACK_FULL` focused view
- `TRACK_FOCUSED` focused view

This page is intentionally non-operational: it does not run pass/fail/approve actions and does not mutate pipeline state.

## 2. Files
- `agents_os/ui/PIPELINE_MONITOR.html`
- `agents_os/ui/js/pipeline-monitor.js`
- `agents_os/ui/css/pipeline-monitor.css`

Navigation links were also added to:
- `agents_os/ui/PIPELINE_DASHBOARD.html`
- `agents_os/ui/PIPELINE_ROADMAP.html`
- `agents_os/ui/PIPELINE_TEAMS.html`

## 3. Data Sources (existing infra only)
No new backend endpoint was added.

The page reuses existing front-end infrastructure:
- `DOMAIN_STATE_FILES` from `pipeline-config.js`
- `fetchJSON` and `fetchText` from `pipeline-state.js`
- `resolveCanonicalGate` and `getExpectedTeamForPhase` from `pipeline-config.js`
- `gateStatus`, `statusPillClass`, `statusLabel` from `pipeline-dom.js`

Live file paths:
- `../../_COMMUNICATION/agents_os/pipeline_state_tiktrack.json`
- `../../_COMMUNICATION/agents_os/pipeline_state_agentsos.json`
- `../../_COMMUNICATION/agents_os/logs/pipeline_events.jsonl`
- `../../documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`

## 4. Monitor Layers
Top-level information separation is enforced via two accordion containers:
- **Type 1 — Process Structure & Constitutional Rules** (blue header)
- **Type 2 — Current Runtime State** (green header)

This preserves clarity while keeping dense details accessible.

### Layer A: Canonical Flow Map
Static canonical map for the 5-gate model and full phase matrix:
- GATE_1: 1.1, 1.2
- GATE_2: 2.1, 2.1v, 2.2, 2.2v, 2.3
- GATE_3: 3.1, 3.2, 3.3
- GATE_4: 4.1, 4.2, 4.3
- GATE_5: 5.1, 5.2

The phase matrix is rendered per selected track, or side-by-side in `AUTO`.

### Active Programs + Track
Program registry is parsed from canonical markdown table and shows:
- active programs only (`ACTIVE` / `PIPELINE` / `HOLD` / `FROZEN`)
- domain
- derived track (`TRACK_FULL` / `TRACK_FOCUSED`)
- active work package mirror when present
- architectural owner (effective reviewer source from live state when present)

### Responsibility Model (modular anti-clutter design)
To avoid dashboard overload, responsibility is split into two modules:
- Summary module (always visible):
  - principle/rule-level ownership matrix (architect authority, gateway, implementation, QA, closure, cross-domain invariants)
  - explicit track-sensitive owner differences (`TRACK_FOCUSED` vs `TRACK_FULL`)
- Drill-down module (collapsed by default):
  - accountability chain per active program
  - per phase: owners, output types, runtime pointer when bound to live state
  - impacted-team set for the selected program track

### Canonical Expected Outputs
For every gate phase, monitor renders expected artifacts per team using the WP002 canonical naming rule:

`TEAM_{sender}[_TO_TEAM_{recipient}]_{SXXX_PXXX_WPXXX}_{GATE}[_PHASE_{N.N}]_{TYPE}_{version}.{ext}`

Outputs are shown:
- per phase
- per track (`TRACK_FULL` / `TRACK_FOCUSED`)
- as an overall process bundle list (full expected artifact set)

### Layer B: Live Runtime State
Per-domain runtime card:
- work_package_id
- current_gate (raw + canonical if legacy)
- current_phase
- gate_state
- process_variant
- expected team (phase-aware)
- remediation cycles
- last updated

Cross-domain gate matrix renders status by gate for each domain.

Recent event streams are shown per domain (+ global events).

## 4.1 Theme Contract
Monitor follows the same domain theme policy used in dashboard pages:
- `pipeline_domain=tiktrack` => light theme (`html.theme-tiktrack`)
- `pipeline_domain=agents_os` => dark theme (default variables)

Theme is synchronized on page load and refresh from `localStorage("pipeline_domain")`.

## 5. Safety and Non-Interference Contract
The monitor enforces read-only behavior:
- No `POST` / `PUT` / `DELETE` calls.
- No `pipeline_run.sh` command execution.
- No fallback write or state rewrite.
- On read failure: explicit error shown (`PRIMARY_STATE_READ_FAILED`) with source path and error details.

## 6. Alerting Behavior
System alert panel includes:
- state read failures
- legacy gate ids in active state (raw vs canonical)
- latest drift signals from `DRIFT_DETECTED`
- event parse anomalies

This is observability-only; no routing action is taken automatically.

## 7. Runtime Notes
When served by AOS UI server (`agents_os/scripts/start_ui_server.sh`), page URL is:
- `/static/PIPELINE_MONITOR.html`

With raw static HTTP serving from repo root, path may also be:
- `/agents_os/ui/PIPELINE_MONITOR.html`

The monitor uses relative paths and works in either serving mode when the base static root maps correctly.

## 8. Validation Performed
- JS syntax: `node --check agents_os/ui/js/pipeline-monitor.js`
- MCP Playwright:
  - opened `/static/PIPELINE_MONITOR.html`
  - verified dual-domain state rendering and event stream
  - verified track view switching controls render
  - verified active-program track table renders from registry
  - verified full phase map + canonical expected outputs matrix
  - verified new nav link appears on Dashboard/Roadmap/Teams pages

## 9. Known Constraints
- Event stream quality depends on valid JSONL rows.
- Current expected-team derivation uses existing `getExpectedTeamForPhase` logic; if routing canon changes, this function must be updated in one place (`pipeline-config.js`).
