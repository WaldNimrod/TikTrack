<!--
  TikTrack Linter Monitor Rebuild Plan
  Author: GPT-5 Codex (Cursor)
  Last Updated: 2025-11-13
-->

# Linter Monitor Rebuild Plan

## 1. Goals And Constraints
- Align the lint monitoring flow with the current TikTrack architecture and general systems.
- Remove legacy assumptions: real-time sockets, ad-hoc file discovery, IndexedDB/LocalStorage persistence.
- Rely on existing CLI tooling (`eslint`, `stylelint`, `htmlhint`, `prettier`, Jest) executed manually or via scripted tasks.
- Provide developers with a trustworthy dashboard that summarizes the latest lint scan and the required follow-up actions.
- Enforce reusable building blocks (services, unified tables, notification system) and avoid page-specific logic where a general solution exists.

## 2. Current State Audit (Key Findings)
- **UI/Page:** `trading-ui/code-quality-dashboard.html` (סקשן ניטור הלינטר; בעבר `linter-realtime-monitor.html`) – oversized, duplicates header controls, exposes outdated real-time terminology, and binds dozens of inactive buttons.
- **Controller:** `trading-ui/scripts/linter-realtime-monitor.js` – ~3k lines of custom scanners, IndexedDB caches, fake auto fixers, “realtime” recursion guards, and dynamic discovery helpers (`window.discoverProjectFiles`, auto-refresh intervals).
- **Supporting Modules:** `linter-file-analysis.js`, `linter-export-system.js`, `linter-testing-system.js`, `charts/adapters/linter-adapter.js` – each simulates linting rather than consuming real CLI output; most logic references removed systems (IndexedDB adapters, chart renderers, websocket status).
- **Backend:** no active `/api/linter/*` endpoints; documentation still references them.
- **Notifications:** `trading-ui/scripts/notifications-center.js` exposes websocket status indicators although realtime infrastructure was removed.
- **Data Flow:** the monitor currently invents results through local analysis heuristics instead of reusing the project’s CLI tooling (`npm run lint`, `npm run css:check`, etc.).

## 3. Target Architecture Overview
1. **Source Of Truth → CLI Tooling**
   - Use existing npm scripts:
     - `npm run lint` (`eslint`)
     - `npm run css:check` (`stylelint`)
     - `npm run html:check` (`htmlhint`)
     - `npm run format:check` (`prettier --check`)
   - Add a new orchestrator script `npm run lint:collect` that executes the commands with structured (JSON) output and stores results under `reports/linter/`.
   - Retain manual trigger requirement (“סריקה ידנית אחת לכמה זמן”) while allowing automation through CI or scheduled scripts.

2. **Result Aggregation**
   - New Node script `scripts/lint/collect-lint-results.js` (service-style utility, no page coupling) will:
     - Spawn each CLI with JSON/standardised format.
     - Normalize findings into a unified schema: `{ tool, status, issues[], summary }`.
     - Persist output to:
       - `reports/linter/latest.json` (single run snapshot).
       - `reports/linter/history.json` (append-only capped log, e.g. last 20 runs).
     - Emit exit codes so CI can fail on critical lint errors if desired.

3. **Backend Exposure**
   - Lightweight Flask route `GET /api/quality/lint` (in `Backend/routes/api/quality.py` or existing quality controller if present) that:
     - Loads `reports/linter/latest.json`.
     - Provides fallbacks when the file is missing (return 204 + guidance message, no fake data).
     - Avoids WebSocket usage; pure REST.
   - Optional: `GET /api/quality/lint/history` reading the capped history file.

4. **Frontend Service Layer**
   - New generic service `trading-ui/scripts/services/lint-status-service.js` (registered in the general systems manifest):
     - Fetches `/api/quality/lint` & `/api/quality/lint/history`.
     - Normalizes responses for view models (summary cards, issue tables).
     - Relies on `window.ApiClient` / existing fetch wrappers if available; otherwise uses `fetch` with the global error handlers (`handleApiError`, `showErrorNotification`).
   - No IndexedDB/localStorage caches; rely on back-end file state.

5. **Dashboard Page Revamp**
- Rename the in-page context to “Lint Monitor” (drop “Realtime” terminology).
- Replace the current HTML section בתוך `code-quality-dashboard.html` with a lean layout that reuses global components:
     - Summary section (cards) using existing status badge CSS.
     - Issues table wired through `UnifiedTableSystem` for consistent sorting (default chain already date → status → ticker is meaningless here, so define `lint_issues` mapping with severity → file → rule).
     - Manual Actions & Tests section listing commands (`npm run lint:collect`, `npm run check:all`) and linking to documentation.
     - History timeline (optional) using `UnifiedTableSystem` or reusable timeline component if available; otherwise simple list.
   - Remove legacy controls: auto-refresh, websocket indicators, IndexedDB sync toggles, fake fix buttons.
   - Hook all notifications to the global notification system.

6. **Removal Of Obsolete Logic**
   - Delete / archive:
     - IndexedDB adapter references, auto discovery helpers, manual file analyzers, mock recommendations.
     - WebSocket-related UI/logic (both in the lint monitor and `notifications-center.js`).
   - Ensure global search for `websocketStatus` or `setupWebSocketEvents` is either removed or migrated to a genuine integration point.

7. **Testing Strategy**
   - **Automated:** Extend Jest to cover `collect-lint-results.js` (mock child_process) and the frontend service (using existing testing patterns).
   - **Manual Checklist:** Run `npm run lint:collect`, open dashboard, verify counts/issues, run `npm run lint` to ensure CLI still passes.
   - Integrate with existing QA documentation under `documentation/05-REPORTS` once implementation is complete.

## 4. Implementation Roadmap (Matches Execution Plan)
1. **Asset Cleanup (audit-assets ✅)** – already performed; confirms scope for code removal.
2. **Workflow Design (lint-workflow-design)** – guided by Sections 3–7 above.
3. **Legacy Removal (remove-legacy-integrations)** – delete websocket/dynamic scanning code paths and unused modules or move them to `archive/`.
4. **Dashboard Refresh (dashboard-refresh)** – rebuild HTML/JS around the new service and unified systems.
5. **Documentation Update (documentation-update)** – update `LINTER_REALTIME_MONITOR.md`, index entries, and developer guides to match the rebuilt flow.
6. **Verification (verification)** – run CLI commands, commit generated reports (if required), capture manual test notes.

## 5. Deliverables Summary
- Node orchestrator + npm script (`npm run lint:collect`).
- REST endpoints for lint summaries.
- Service & page rewrite without websockets/dynamic scans.
- Updated documentation & manual testing checklist.
- Removal or archiving of obsolete frontend modules.


