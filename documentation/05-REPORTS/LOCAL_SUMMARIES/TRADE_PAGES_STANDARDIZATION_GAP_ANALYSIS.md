## Trade Plans & Trades – Gap Analysis vs Tickers Standard

### Scope
- `trading-ui/scripts/trade_plans.js`
- `trading-ui/scripts/trade-plan-service.js`
- `trading-ui/scripts/services/trade-plans-data.js`
- `trading-ui/scripts/trades.js`
- `trading-ui/scripts/services/trades-data.js`
- Reference implementation: `trading-ui/scripts/tickers.js`, `scripts/tickers/tickers-data.js` (service analogue)

### Key Findings
1. **CRUD Response Handling**
   - Trade Plans/Trades cancellation flows call `window.cancelItem` → `performItemCancellation` bypassing `handleApiResponseWithRefresh`.
   - Save/update/delete in trade plans call `CRUDResponseHandler` but rely on custom cache invalidation blocks instead of unified reload orchestration.
   - Tickers route every CRUD action through `CRUDResponseHandler.handle*` combined with `handleApiResponseWithRefresh`, guaranteeing a single refresh surface.

2. **Cache & Data Layer Alignment**
   - `scripts/trade_plans/trade-plans-data.js` uses cache key `trade-plans-data`, while page-level code manually issues `clearByPattern('trade-plans-data')`; service and page are not wired together (page uses `trade-plan-service.js` which skips UnifiedCacheManager entirely).
   - `trading-ui/scripts/trades.js` loads data directly via fetch without consulting a service module or cache layer, so cache invalidation events from backend (`@invalidate_cache`) are never coordinated.
   - In tickers, `tickers.js` defers to `UnifiedCacheManager.clearAllCache('Light')`, resets in-memory mirrors, and the service layer (`tickers-data`) uses consistent keys (`trades-data`) for invalidate/save/get.

3. **Linked Items & Warning System**
   - Trade Plans still implement bespoke linked-item handling before deletion/cancellation (manual fetch plus modal selection). Trades have partially duplicated logic, while `cancelItem` fallback logic shows legacy messaging.
   - Tickers leverage `checkLinkedItemsAndPerformAction` + `warning-system.js` + `handleApiResponseWithRefresh`, eliminating one-off modals.

4. **Table Refresh & Summary Stats**
   - Trade Plans reload function only updates table but does not ensure `updatePageSummaryStats` for current dataset consistently; some flows rely on `updateTradePlansTable` only.
   - Trades manage pagination and summary differently (`syncTradesPagination`, `updateTradesSummary`) with local helper functions and optional fallbacks.
   - Tickers centralize refresh via `loadTickersData` → update summary + table + colors, triggered uniformly through `enhancedTableRefresh`.

5. **TagService Integration**
   - Trade Plans integrate `TagService.replaceEntityTags` on save/update but do so manually after response, lacking unified success flow.
   - Trades perform tag updates within page-specific code rather than a shared helper.
   - Tickers execute tag replacement inside the same unified post-success branch used for other updates.

6. **Logging**
   - Trade Plans and Trades contain extensive `window.Logger` debug statements (including raw payload dumps) not present in tickers standard implementation.
   - Tickers limit logging to high-level lifecycle events.

### Standardization Targets
- Replace ad-hoc CRUD flows with `handleApiResponseWithRefresh` (or unified `CRUDResponseHandler.reloadFn`) for **all** actions.
- Route data access through service modules using consistent cache keys (`trade-plans-data`, `trades-data`) and UnifiedCacheManager helpers.
- Use `checkLinkedItemsAndPerformAction` + `warning-system.show...` across both pages.
- Consolidate table refresh to `enhancedTableRefresh(loadXData, updatePageSummaryStats)` to keep UI state and summaries in sync.
- Move tag updates into shared success callbacks to avoid per-page divergence.
- Trim logging to standard info/error checkpoints matching tickers.

### Next Steps Mapping
| Category | Trade Plans | Trades | Required Alignment |
| --- | --- | --- | --- |
| CRUD success handling | Custom cache clears + manual reload | Mixed direct fetch + manual refresh | Adopt `handleApiResponseWithRefresh` + `loadXData` reload |
| Cancellation flow | Legacy `cancelItem` fallback | Similar but with extra prompts | Migrate to `checkLinkedItemsAndPerformAction` pattern |
| Data services | Dual sources (`trade-plan-service`, `TradePlansData`) with inconsistent cache usage | Direct fetch without service | Standardize on single service per entity mirroring tickers-data design |
| Cache invalidation | Manual `clearByPattern` only | None | Use service-level `invalidate` + backend `@invalidate_cache` hooks |
| Summary & table refresh | `updateTradePlansTable` only | Custom pagination helpers | Central `enhancedTableRefresh` and summary update |
| TagService usage | Manual per call | Manual per call | Unified success hook with error handling consistent with tickers |

This analysis will drive the subsequent standardization tasks in the plan.

### Implementation Sync (2025-11-13)
- `TradePlansData` / `TradesData` now cache under `trade-plans-data` / `trades-data` and always return normalized arrays for `trade-plan-service` and `trades.js`.
- `trade-plan-service.js` delegates loading to `TradePlansData`; `trades.js` consumes `TradesData.loadTradesData()` instead of manual fetches.
- Cancellation flows (`cancelTradePlan`, `cancelTradeRecord`) now rely on `checkLinkedItemsAndPerformAction`, `showCancelWarning`, and `handleApiResponseWithRefresh` for success handling.
- Manual cache flushes were removed from delete/cancel paths; post-success refresh is handled via unified loaders.
- Validation: `npx jest --config jest.config.js --selectProjects component --runTestsByPath tests/e2e/user-pages/trade_plans.test.js` and `.../trades.test.js` both passed after the refactor.

### Implementation Sync (2025-11-14)
- שירותי הנתונים של Trades/Trade Plans הועברו לתיקיית `trading-ui/scripts/services/` ומוטענים מה־Services Package האחיד, כך שכל העמודים משתמשים באותה שכבת שירותים (ללא טעינת קבצים מסקריפטי שורש).
- `page-initialization-configs.js` נטען בהצלחה ומייצא כעת את `PAGE_CONFIGS` ללא סינטקס שגוי, כדי לאפשר לאתחול המאוחד לרוץ בכל העמודים המשתמשים בקונפיגורציות החדשות.

