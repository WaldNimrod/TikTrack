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
| `trading-ui/scripts/system-management.js` | `loadMockData()` injects fabricated health/alerts when API fails. | Remove mock data, surface error banner + notification. Add unit test for error branch. |
| `trading-ui/scripts/trades-adapter.js` | Returns `getFallbackData()` & `getDefaultChartData()` with fake trades. | Remove fallbacks, rethrow errors, ensure charts handle gracefully. Add unit tests. |
| `trading-ui/scripts/trade-plan-service.js` | On fetch failure uses `getDemoTradePlansData()`. | Remove demo data, rethrow + notify. Unit tests. |
| `trading-ui/scripts/trade_plans.js` | Multiple default fallbacks: mock ticker info, hard-coded risk % defaults, empty-array return on API error. | Remove / replace with explicit errors, ensure UI warns user. Add targeted tests. |
| `trading-ui/scripts/constraints.js` | `getMockConstraints()` / `getMockTables()` invoked on API issues. | Remove mock data; display error state instead. Tests needed. |
| `trading-ui/scripts/alerts.js` | `getDemoAlertsData()` still available. | Delete function & references. |
| `trading-ui/scripts/tickers.js` | Falls back to USD option when currency data missing. | Replace with “not available” notice & notification. Add tests. |
| `trading-ui/scripts/charts/chart-system.js` | Comments reference fallback data; adapters silently swallow failures. | Propagate adapter errors & notify. Tests to cover failure path. |
| `trading-ui/scripts/charts/adapters/performance-adapter.js` | Always returns empty dataset; generates mock data helper. | Throw informative error instead of mock data. Unit tests. |
| `trading-ui/scripts/js-map.js` | Development tool loads fallback metadata. | Mark as dev-only, ensure production build not using it (documented). |
| Backend `app.py` (`/api/indexeddb/*`) | Returns entirely mock IndexedDB statistics. | Replace with 503 + explicit message. Add API tests. |
| Backend `routes/api/quality_check.py` (`/function-index`) | Responds with fabricated statistics. | Return 503 until validator implemented. Test route. |
| Backend `routes/api/preferences.py` (`/version`, `/user/check-updates`) | Emits static version “3.1.0” and hard-coded `hasUpdates=true`. | Return accurate DB info or explicit error when unavailable. Tests required. |

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


