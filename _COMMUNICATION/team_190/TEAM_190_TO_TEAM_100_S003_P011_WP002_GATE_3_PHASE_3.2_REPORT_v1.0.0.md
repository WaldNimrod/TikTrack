---
id: TEAM_190_TO_TEAM_100_S003_P011_WP002_GATE_3_PHASE_3.2_REPORT_v1.0.0
historical_record: true
from: Team 190 (Constitutional Validator)
to: Team 100 (Chief System Architect)
cc: Team 00, Team 61, Team 170
date: 2026-03-20
status: SUBMITTED
program: S003-P011
wp: S003-P011-WP002
domain: agents_os
gate: GATE_3
phase: 3.2
scope: Pipeline Monitor hardening (track-aware phase map + canonical expected outputs + active program track visibility)---

## 1) Mission Outcome
This delivery extends the read-only monitor page to support high-fidelity operational supervision without interfering with the active WP002 implementation lane.

Two monitoring levels are now covered in one page:
1. Full process comprehension (all canonical gates and phases, per track).
2. Live current-state observability (per domain/program, including track and drift signals).

## 2) Implemented Changes
### UI and navigation
- `agents_os/ui/PIPELINE_MONITOR.html`
  - Added top-level separation by information type using accordion containers:
    - Type 1: Process Structure & Constitutional Rules
    - Type 2: Current Runtime State
  - Added color-differentiated accordion headers to reduce cognitive overlap.
  - Added Track View controls: `AUTO`, `TRACK_FULL`, `TRACK_FOCUSED`.
  - Added Active Programs + Track panel.
  - Added modular Responsibility Model panel:
    - Summary matrix (always visible)
    - Accountability-chain drill-down (collapsed by default)
  - Added full phase-map container.
  - Added Canonical Expected Outputs + Overall Process Output sections.

### Monitor logic
- `agents_os/ui/js/pipeline-monitor.js`
  - Added track-state model with persistent selection (`localStorage` key: `monitor_track_view`).
  - Added canonical phase model covering all required phases:
    - GATE_1: 1.1, 1.2
    - GATE_2: 2.1, 2.1v, 2.2, 2.2v, 2.3
    - GATE_3: 3.1, 3.2, 3.3
    - GATE_4: 4.1, 4.2, 4.3
    - GATE_5: 5.1, 5.2
  - Added program registry ingestion from markdown table:
    - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`
  - Added active-program table with per-program track derivation.
  - Added canonical filename generator and per-phase expected output matrix.
  - Added overall process output bundle listing for each track.
  - Preserved read-only contract (no mutation actions, no pipeline commands, no state writes).

### Styling
- `agents_os/ui/css/pipeline-monitor.css`
  - Added monitor accordion system styling (open/close behavior + section color identity).
  - Added/updated styles for track toolbar, output matrix cells, and program table readability.

## 3) Canonical Naming Integration
Expected output rendering now follows the WP002 naming canon structure:

`TEAM_{sender}[_TO_TEAM_{recipient}]_{SXXX_PXXX_WPXXX}_{GATE}[_PHASE_{N.N}]_{TYPE}_{version}.{ext}`

Implementation details:
- Team identifiers are normalized from `team_{N}`.
- `work_package_id` (e.g. `S003-P011-WP002`) is transformed to `S003_P011_WP002`.
- Phase suffix is included for phase-level outputs, omitted where phase is explicitly disabled (e.g., closure at 5.1).
- TYPE values used from canonized set (`WORKPLAN`, `MANDATE`, `VERDICT`, `REVIEW`, `CLOSURE`, `DECISIONS`, `REPORT`, `LLD400`).

## 4) Track and Program Visibility Logic
### Track derivation
- Priority 1: `state.process_variant` when present.
- Priority 2: domain fallback (`AGENTS_OS` => `TRACK_FOCUSED`, `TIKTRACK` => `TRACK_FULL`).

### Domain theme consistency
- `pipeline_domain=tiktrack` => light mode (`html.theme-tiktrack`).
- `pipeline_domain=agents_os` => dark mode (default theme variables).
- Monitor now re-applies theme from `localStorage("pipeline_domain")` on load/refresh.

### Active programs panel
- Filters registry rows to live statuses: `ACTIVE`, `PIPELINE`, `HOLD`, `FROZEN`.
- Displays: stage, program_id, program_name, domain, status, derived track, architect owner, active WP mirror.
- Honors selected track view (or dual view under `AUTO`).

### Responsibility model (anti-clutter module pattern)
- Summary matrix (top layer): principle-level ownership by track (architect authority, gateway, implementation, QA, closure, cross-domain invariants).
- Drill-down module (details): per active program accountability chain across all phases, including:
  - effective owner per phase (domain/track sensitive)
  - output type per phase
  - current runtime pointer when bound to live state
  - impacted team set for the program.

## 5) Non-Interference Controls
The monitor remains a strict observability surface:
- No pass/fail/approve actions.
- No writes to state files.
- No command invocation to mutate pipeline.
- On read/parsing issues: explicit error display (no silent fallback mutation path).

## 6) Validation Evidence
### Static validation
- `node --check agents_os/ui/js/pipeline-monitor.js` -> PASS.

### Runtime validation (MCP Playwright)
- Opened `http://localhost:8090/static/PIPELINE_MONITOR.html`.
- Confirmed rendering of:
  - Track view controls
  - Active programs + per-program track
  - Responsibility summary matrix + drill-down accountability chains
  - Full phase map for all canonical phases
  - Canonical expected outputs matrix and overall bundles
  - Live dual-domain runtime cards and event streams
- Console findings: only `favicon.ico` 404 (non-blocking UI noise).

## 7) Architectural Notes
- Live data currently exposes TikTrack legacy gate (`G3_6_MANDATES`) as expected; monitor flags this drift but does not attempt correction.
- `lod200_author_team` is resolved dynamically from state when present; default fallback is `team_100`.

## 8) Recommendation for Next Gate Review
1. Keep this monitor page designated as read-only constitutional observability layer.
2. Use it as mandatory pre-GATE_4 review artifact for WP002 (phase/track/routing sanity check).
3. If Team 100 approves, lock this page in UI registry as required operational monitor for dual-domain governance.

---
log_entry | TEAM_190 | S003_P011_WP002 | MONITOR_TRACK_AWARE_CANONICAL_OUTPUTS | SUBMITTED | 2026-03-20
