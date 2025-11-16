# Fallback Policy Inventory

## Overview

Following the updated fallback policy we must distinguish three groups:

1. **UI & Design** – visual fallbacks are allowed when they only affect presentation (e.g., missing color tokens).  
2. **Core Systems** – infrastructural fallbacks are allowed only to surface clear error diagnostics and must leverage the global notification/logging systems.  
3. **Data Sources** – *forbidden*. Any attempt to fabricate or guess internal or external data must be replaced with explicit error handling.

This document lists every identified fallback mechanism, their current behaviour, and the remediation status per group.

## Group A – UI & Design (Allowed)

| Module | Fallback Description | Required Action |
| --- | --- | --- |
| `trading-ui/scripts/color-scheme-system.js` | Falls back to CSS variables / neutral colors when user preferences are absent. Purely visual. | Keep. Ensure tests cover `loadColorPreferences` branches. |
| `trading-ui/scripts/services/field-renderer-service.js` | Uses placeholder labels and CSS classes when metadata is missing. UI only. | Keep. Add assertions in existing renderer tests. |
| `trading-ui/styles-new/**` | Uses light theme defaults when custom tokens missing. | Keep. Covered by CSS regression tests. |

## Group B – Core Systems (Allowed Minimal)

| Module | Behaviour | Action |
| --- | --- | --- |
| `trading-ui/scripts/unified-cache-manager.js` | Falls back to localStorage/Memory layers when IndexedDB unavailable, with Logger + notifications. | Keep. Extend integration test to assert logger call. |
| `trading-ui/scripts/services/select-populator-service.js` | Uses cached preferences (localStorage / currentPreferences) when central services offline. Uses real cached data. | Keep but add unit test to ensure notification shows when data missing. |
| `trading-ui/scripts/ui-utils.js` | Falls back to localStorage for section state if `PageStateManager` unavailable. | Keep. Add coverage for warning path. |

## Group C – Data Sources (Forbidden – must remove)

| Module | Current Fallback | Required Fix |
| --- | --- | --- |
| `trading-ui/scripts/system-management.js` | ✅ (Nov 2025) Error paths surface via Logger + banner; no mock payloads remain (covered in `fallback-handling.test.js`). | — |
| `trading-ui/scripts/trades-adapter.js` | ✅ (Nov 2025) Removed `getFallbackData`/`getDefaultChartData`, now rethrows errors + notifies; covered by `trades-adapter-core.test.js` | — |
| `trading-ui/scripts/trade-plan-service.js` | ✅ (Nov 2025) Loader availability enforced; errors bubble with notifications + `trade-plan-service.test.js`. | — |
| `trading-ui/scripts/trade_plans.js` | ✅ (Nov 2025) Page loader no longer bypasses the service; failures rethrow after notifications, no empty-array fallback. | — |
| `trading-ui/scripts/constraints.js` | ✅ (Nov 2025) Network failures log + notify without mock objects; see `fallback-handling.test.js`. | — |
| `trading-ui/scripts/alerts.js` | ✅ (Nov 2025) Demo data removed; `loadAlertsData` rethrows after notifications. | — |
| `trading-ui/scripts/tickers.js` | External quote flow defaulted to `$` when currency missing. | ✅ (Nov 2025) `resolveExternalCurrencySymbol` emits warnings + notifications; UI displays data without fabricated symbols and tests guard the behaviour. |
| `trading-ui/scripts/charts/chart-system.js` | ✅ (Nov 2025) Adapter errors now trigger notifications and throw; enforced via `fallback-handling.test.js`. | — |
| `trading-ui/scripts/charts/adapters/performance-adapter.js` | ✅ (Nov 2025) API errors bubble with notifications instead of mock data; covered by `performance-adapter-charts.test.js` | — |
| `trading-ui/scripts/js-map.js` | ✅ (Nov 2025) File removed from runtime bundle; legacy tooling kept in coverage archive only. | — |
| Backend `app.py` (`/api/indexeddb/*`) | ✅ (Nov 2025) Endpoints now return 503 with descriptive JSON; verified by `test_indexeddb_endpoints_return_service_unavailable`. | — |
| Backend `routes/api/quality_check.py` (`/function-index`) | ✅ Runs actual monitor scripts and no longer returns fabricated payloads. | — |
| Backend `routes/api/preferences.py` (`/version`, `/user/check-updates`) | ✅ (Nov 2025) Version + polling endpoints read real timestamps; guarded by `test_preferences_version_and_update_checks_reflect_database`. | — |

## Ambiguous Items – Require Product Decision

1. `select-populator-service`: Using last-known preference from localStorage is technically real data, but confirm whether we should block UI until server responds. **Recommendation:** allow current behaviour; escalate if data staleness unacceptable.
2. `trade_plans` risk defaults: today we will remove hard-coded percentages; if business wants “recommended defaults” they must originate from documented preference records. Await confirmation after fix.

## Testing Plan

- Add Jest unit tests covering all new error branches in System Management, Trades Adapter, Constraints Monitor, Trade Plan Service, and Ticker currency loader.
- Extend integration tests to assert Logger + Notification calls where applicable.
- Add backend pytest cases validating new HTTP 503/500 responses for IndexedDB, quality check, and preferences endpoints.  
- Update coverage thresholds once new tests land.

## Follow-up Tasks

1. Remove all data-level fallbacks listed above (frontend & backend).
2. Implement new tests per Testing Plan.
3. Update status report (`tests/TEST_STATUS_REPORT.md`) once ≥90% coverage maintained without fallback code.



