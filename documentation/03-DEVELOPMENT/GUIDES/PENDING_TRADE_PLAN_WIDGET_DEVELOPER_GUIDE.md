# Pending Trade Plan Widget – Developer Guide

## Overview
The **Pending Trade Plan Widget** (`trading-ui/scripts/pending-trade-plan-widget.js`) surfaces trades that are missing a linked trade plan and guides users through two flows:
- **Assignment suggestions** – link an existing plan to the trade.
- **Creation suggestions** – open a prefilled trade-plan modal for building a new plan.

The widget is rendered on the dashboard and adheres to all TikTrack general systems: lazy loading, button system (`data-onclick`), unified cache, FieldRendererService, ModalManagerV2 and SelectPopulatorService.

## Core Responsibilities
- Poll backend endpoints:
  - `/api/trades/pending-plan/assignments`
  - `/api/trades/pending-plan/creations`
- Render suggestion cards with hover-only details (aligned with PendingExecutions widgets).
- Handle four user actions (`assign/create/dismiss`) through the ButtonSystem.
- Open `tradePlansModal` in “add” mode with full prefill + live ticker info.
- Invalidate caches and trigger a hard reload after successful links.

## Key Functions
| Function | Purpose |
| --- | --- |
| `init()` | Ensures widget container exists, caches DOM nodes, loads dismissed set, fetches data, starts auto-refresh. |
| `fetchData()` | Loads assignment + creation suggestions (with cache busting) and populates state. |
| `renderAssignments()` / `renderCreations()` | Build list markup, bind buttons through ButtonSystem. |
| `handleAssignButton()` | Validate identifiers and call `assignTradeToPlan()`. |
| `assignTradeToPlan()` | POST link request, invalidate caches (`CacheSyncManager` + `UnifiedCacheManager`), refresh dashboard + trades, schedule hard reload. |
| `handleCreateButton()` | Resolve dependencies (lazy load modals) and open `tradePlansModal`. |
| `preparePlanModal()` | Populate selects via `SelectPopulatorService`, prefill form values, trigger `loadTradePlanTickerInfo()` for live market data, apply default risk levels. |
| `clearCachesAfterLink()` | Remove local cache keys, reset dashboard state, queue hard reload notification. |

## Dependencies
- **Modal stack:** `ModalManagerV2`, `modal-configs/trade-plans-config.js`, `trade_plans.js`
- **Lazy loaders:** `PendingExecutionTradeCreation.ensureTradeModalDependencies()` (extended to load trade-plan config/service)
- **Button System:** relies strictly on `data-button-type`, `data-onclick`, event delegation through `EventHandlerManager`.
- **Rendering / data services:** `FieldRendererService`, `SelectPopulatorService`, `InvestmentCalculationService`, `UnifiedCacheManager`, `CacheSyncManager`, `NotificationSystem`.

## Widget Lifecycle
1. `initializePendingTradePlanWidget()` is called from `index.js` after unified initialization.
2. Widget fetches assignments + creations with `_t=timestamp` to bypass HTTP cache.
3. Suggestions excluded if user dismissed them (stored in UnifiedCacheManager with TTL).
4. ButtonSystem processes buttons and routes clicks to `PendingTradePlanWidget.handle*` methods.
5. On “Create Plan” the widget ensures modals are ready, opens `tradePlansModal`, populates select options, fills form, loads ticker info, applies risk defaults.
6. On successful link the widget:
   - Shows success notification.
   - Calls `CacheSyncManager.invalidateByAction('trade-plan-linked')`.
   - Removes dashboard + widget keys from UnifiedCacheManager.
   - Forces dashboard/trades refresh and schedules `hardReload()` with user notification.

## Modal Prefill Flow
1. `preparePlanModal()` builds a payload from the suggestion prefill fields.
2. `SelectPopulatorService.populateTickersSelect()` populates `#tradePlanTicker` and selects the incoming ticker.
3. `SelectPopulatorService.populateAccountsSelect()` populates `#tradePlanAccount`, honouring default preferences when no prefill is present.
4. `ModalManagerV2.populateForm()` applies the payload to every matched field.
5. `loadTradePlanTickerInfo(tickerId)` renders real-time market data inside `tradePlanTickerInfo`.
6. `applyTradePlanDefaultRiskLevels({ force: true })` recalculates risk/amount totals in the modal.

## Cache & Performance Notes
- All fetches include `_t` to avoid stale HTTP cache.
- `CacheSyncManager` entry `trade-plan-linked` invalidates dashboard and widget keys.
- Widget removes specific UnifiedCacheManager keys: `trades`, `trade-data`, `trades-data`, `dashboard`, `dashboard-data`, `pending-trade-plan-assignments`, `pending-trade-plan-creations`.
- Scheduling a hard reload guarantees that HTTP cache is bypassed after linking.

## Testing Checklist
1. **Assignments:** click “שייך”, confirm cache invalidation, dashboard refresh, hard reload notification.
2. **Creations:** click “פתח תוכנית”, ensure modal loads with prefilled ticker/account and ticker info box populated.
3. **Dismissal:** click “דחה”, verify suggestion removed and not reloaded until TTL expires.
4. **Hover details:** ensure cards expand on hover/focus to match executions widget behaviour.
5. **Auto-refresh:** confirm widget re-fetches data each minute without duplicating event listeners.

## Troubleshooting
- **Modal not found:** confirm `PendingExecutionTradeCreation.ensureTradeModalDependencies()` loaded `trade-plans-config` and `trade_plans.js`.
- **No ticker info:** ensure `loadTradePlanTickerInfo` returns success; browser console will show a warning otherwise.
- **Buttons not working:** check ButtonSystem logs for missing `data-button-type` or `data-onclick`.
- **Cache not refreshing:** verify `CacheSyncManager.invalidateByAction('trade-plan-linked')` resolved and `UnifiedCacheManager.remove` calls succeeded.

## Future Extensions
- Add confidence scoring explanations to suggestion cards (already supported via `match_reasons`).
- Surface bulk actions for accepting multiple suggestions once backend batch endpoints exist.
- Extend creation flow to offer template selection before opening the modal.

