**date:** 2026-03-15
**historical_record:** true

# UI Surfaces Review

## Findings

- `P0` `The dashboard still models AGENTS_OS execution as a TikTrack-style Team 20/30/50 pipeline.` `agents_os/ui/js/pipeline-config.js` and `agents_os/ui/js/pipeline-dashboard.js` hard-code `CURSOR_IMPLEMENTATION` as Teams 20+30, `GATE_4` as Team 50 QA, and `GATE_8` as Team 70 closure. This makes the dashboard an unreliable control plane for the active AGENTS_OS lane.
- `P1` `The dashboard contains hard-coded artifact paths from historical work packages.` The `EXPECTED_FILES` block in `agents_os/ui/js/pipeline-config.js` references `S001-P002-WP001` Team 20, Team 30, and Team 50 artifacts. These paths are not generic and can falsely signal missing or completed work for unrelated runs.
- `P1` `The dashboard issues live 404 requests against legacy file contracts while presenting itself as a current AGENTS_OS control plane.` Browser network and console capture on `PIPELINE_DASHBOARD.html` showed repeated 404s for `TEAM_20_S001_P002_WP001_API_VERIFY`, `TEAM_50_S001_P002_WP001_QA_REPORT`, `TEAM_10_S001_P002_WP001_G3_PLAN_WORK_PLAN`, and the unprefixed `implementation_mandates.md`. This is not only static drift in source code. It is a live runtime defect in the operator surface.
- `P1` `The teams page and the dashboard do not tell the same story.` `agents_os/ui/js/pipeline-teams.js` includes Team 51 and Team 61 as AGENTS_OS-specific teams, but the dashboard gate definitions do not route operational flows through them. The roster view therefore acknowledges the new operating model while the dashboard workflow view continues to drive the old one.
- `P1` `The teams page binds itself to the TikTrack pipeline state even when rendering AGENTS_OS teams.` Browser network capture showed `PIPELINE_TEAMS.html` fetching only `pipeline_state_tiktrack.json`, and selecting Team 61 rendered `WP: REQUIRED` instead of the active AGENTS_OS `S002-P005-WP003` seen on the dashboard and roadmap. This is a concrete state-binding bug, not just a content mismatch.
- `P2` `PASS_WITH_ACTION is surfaced clearly as scaffold-only in some places, but the broader UI still depends heavily on implicit operator interpretation.` The PWA UI registry and the dashboard explicitly mark those commands as scaffold or copy-only, which is good. However, similar clarity is missing on the much more important Team 50/70 legacy assumptions, which are presented as if they were live truth.
- `P2` `The TikTrack login surface still has an operator-trust problem around authentication feedback.` In live browser execution, `admin / 418141` failed with backend `401 Unauthorized`, yet the UI surfaced `שגיאת רשת. אנא בדוק את החיבור.` rather than an invalid-credentials message. The alternate path `TikTrackAdmin / 4181` succeeded immediately and unlocked the alerts page. This is a smaller finding than the Agents OS control-plane drift, but it shows that UI/runtime/operator expectations are still not aligned.

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
  - `logs/browser_review_summary.txt`
- Commands:
  - `./agents_os/scripts/start_ui_server.sh 8090`
  - `curl` reads against local UI pages
  - `list_mcp_resources`
  - `list_mcp_resource_templates`
  - Playwright navigate/fill/click/snapshot on TikTrack login and alerts
  - Playwright navigate/snapshot/console/network capture on dashboard, roadmap, and teams pages

## Focus areas

- Dashboard, roadmap, and teams page behavior
- Registry-doc to UI-code consistency
- Command-copy correctness and operator affordances
- Visual clarity of active vs scaffold-only capability

## Notes

- The UI is strongest as an information surface and weakest as a truthful execution surface.
- The roadmap page has useful live-state overlay logic, but it still inherits owner assignments that do not match the active AGENTS_OS canon.
- The Teams page is not just conceptually inconsistent with the dashboard; it is also loading the wrong domain state at runtime.
