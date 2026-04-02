# PIPELINE_MONITOR / PIPELINE_CONSTITUTION Architecture v1.1.0

Date: 2026-03-20  
Owner: Team 190 (Constitutional Validator, implementation support)
Status: ACTIVE (supersedes `PIPELINE_MONITOR_ARCHITECTURE_v1.0.0.md`)

## 1. Purpose
The previous single monitor page was split into two canonical pages to enforce non-overloaded UX and clear operational boundaries:

1. **Live Monitor (`PIPELINE_MONITOR.html`)**
   - Current runtime state only (dual-domain)
   - Active programs, runtime cards, gate matrix, event stream
2. **Constitution Map (`PIPELINE_CONSTITUTION.html`)**
   - Canonical process structure and governance rules
   - Track-aware flow map, phase ownership, responsibility model, accountability chain, expected outputs

Both pages are read-only and fetch from existing canonical data sources only.

## 2. Canonical Files
- Pages
  - `agents_os/ui/PIPELINE_MONITOR.html`
  - `agents_os/ui/PIPELINE_CONSTITUTION.html`
- Shared styles
  - `agents_os/ui/css/pipeline-monitor.css`
- Script split (canonical)
  - `agents_os/ui/js/pipeline-monitor-core.js`
  - `agents_os/ui/js/pipeline-monitor-live.js`
  - `agents_os/ui/js/pipeline-monitor-constitution.js`
- Backward-compat shim (deprecated)
  - `agents_os/ui/js/pipeline-monitor.js`

## 2.1 Runtime Port Contract (locked)
- UI server startup: `./agents_os/scripts/start_ui_server.sh`
- Fixed runtime port: `8090`
- Policy: the startup script rejects non-`8090` port arguments.
- Purpose: prevent environment drift and preserve deterministic browser/MCP verification paths.

## 3. Page Contract

### 3.1 Live Monitor page
- `body[data-monitor-mode="live"]`
- Every major container is a canonical accordion:
  - Active Programs + Track
  - Live Runtime State (Dual Domain)
  - Cross-Domain Gate Matrix
  - Recent Event Stream
- Sidebar remains shared and contains:
  - Data Sources
  - System Alerts
  - Scope Guardrails

### 3.2 Constitution Map page
- `body[data-monitor-mode="constitution"]`
- Every major container is a canonical accordion:
  - Canonical Flow Map + Gate/Phase Ownership
  - Responsibility Model + Program Accountability Chain
  - Canonical Expected Outputs (Phase / Team / Process)
- Sidebar remains shared and contains:
  - Data Sources
  - System Alerts
  - Scope Guardrails

## 4. Script Split Contract
`pipeline-monitor-core.js` owns shared logic:
- Data loading from canonical files
- Domain theme sync
- Track view handling
- Rendering primitives and page-safe render gating by mode

Entry scripts are mode selectors only:
- `pipeline-monitor-live.js` → `setMonitorPageMode("live")`
- `pipeline-monitor-constitution.js` → `setMonitorPageMode("constitution")`

This split enforces a clean separation of concerns and avoids code duplication.

## 5. Data Sources (unchanged)
- `../../_COMMUNICATION/agents_os/pipeline_state_tiktrack.json`
- `../../_COMMUNICATION/agents_os/pipeline_state_agentsos.json`
- `../../_COMMUNICATION/agents_os/logs/pipeline_events.jsonl`
- `../../documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`

## 6. Theme Contract (unchanged)
- `pipeline_domain=tiktrack` => light theme via `html.theme-tiktrack`
- `pipeline_domain=agents_os` => dark theme (default vars)

Both pages use identical theme sync behavior through `pipeline-monitor-core.js`.

## 7. Navigation Contract
Nav must expose both pages from all main UI pages:
- `🏛️ Constitution` → `PIPELINE_CONSTITUTION.html`
- `📡 Live Monitor` → `PIPELINE_MONITOR.html`

Updated pages:
- `PIPELINE_DASHBOARD.html`
- `PIPELINE_ROADMAP.html`
- `PIPELINE_TEAMS.html`
- `PIPELINE_MONITOR.html`
- `PIPELINE_CONSTITUTION.html`

## 8. Canonical Code Documentation Rule
All monitor split scripts include canonical header comments with references to:
- `S003-P011-WP002` LOD200 sections
- This architecture document (`v1.1.0`)

This is mandatory to keep code-level intent aligned with governance canon.

## 9. Validation
Recommended checks:
- `node --check agents_os/ui/js/pipeline-monitor-core.js`
- `node --check agents_os/ui/js/pipeline-monitor-live.js`
- `node --check agents_os/ui/js/pipeline-monitor-constitution.js`
- open:
  - `/static/PIPELINE_MONITOR.html`
  - `/static/PIPELINE_CONSTITUTION.html`
- verify both pages return HTTP 200 and render without JS runtime errors.
