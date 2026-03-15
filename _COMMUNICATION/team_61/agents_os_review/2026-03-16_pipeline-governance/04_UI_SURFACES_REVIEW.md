**date:** 2026-03-15

# UI Surfaces Review

## Findings

- `P0` `The dashboard still models AGENTS_OS execution as a TikTrack-style Team 20/30/50 pipeline.` `agents_os/ui/js/pipeline-config.js` and `agents_os/ui/js/pipeline-dashboard.js` hard-code `CURSOR_IMPLEMENTATION` as Teams 20+30, `GATE_4` as Team 50 QA, and `GATE_8` as Team 70 closure. This makes the dashboard an unreliable control plane for the active AGENTS_OS lane.
- `P1` `The dashboard contains hard-coded artifact paths from historical work packages.` The `EXPECTED_FILES` block in `agents_os/ui/js/pipeline-config.js` references `S001-P002-WP001` Team 20, Team 30, and Team 50 artifacts. These paths are not generic and can falsely signal missing or completed work for unrelated runs.
- `P1` `The teams page and the dashboard do not tell the same story.` `agents_os/ui/js/pipeline-teams.js` includes Team 51 and Team 61 as AGENTS_OS-specific teams, but the dashboard gate definitions do not route operational flows through them. The roster view therefore acknowledges the new operating model while the dashboard workflow view continues to drive the old one.
- `P2` `PASS_WITH_ACTION is surfaced clearly as scaffold-only in some places, but the broader UI still depends heavily on implicit operator interpretation.` The PWA UI registry and the dashboard explicitly mark those commands as scaffold or copy-only, which is good. However, similar clarity is missing on the much more important Team 50/70 legacy assumptions, which are presented as if they were live truth.
- `P2` `Full browser/MCP verification could not be completed in-session.` No MCP resources or templates were exposed, and no browser automation tool was available directly in the session. Validation therefore relied on code inspection, local server commands, and `curl`. This is a review constraint, not a repository bug.

## Evidence

- Files:
  - `agents_os/ui/PIPELINE_DASHBOARD.html`
  - `agents_os/ui/PIPELINE_ROADMAP.html`
  - `agents_os/ui/PIPELINE_TEAMS.html`
  - `agents_os/ui/js/pipeline-config.js`
  - `agents_os/ui/js/pipeline-dashboard.js`
  - `agents_os/ui/js/pipeline-roadmap.js`
  - `agents_os/ui/js/pipeline-teams.js`
  - `agents_os/ui/docs/PIPELINE_DASHBOARD_UI_REGISTRY_v1.0.0.md`
- Commands:
  - `./agents_os/scripts/start_ui_server.sh 8090`
  - `curl` reads against local UI pages

## Focus areas

- Dashboard, roadmap, and teams page behavior
- Registry-doc to UI-code consistency
- Command-copy correctness and operator affordances
- Visual clarity of active vs scaffold-only capability

## Notes

- The UI is strongest as an information surface and weakest as a truthful execution surface.
- The roadmap page has useful live-state overlay logic, but the dashboard still carries too many historical constants to be treated as a reliable operator console.
