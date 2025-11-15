# Table Integration – Option A Implementation Playbook

## 1. Scope And Objectives
- **Goal**: unify filtering, pagination, statistics, and dashboard computations so they operate on the canonical datasets stored in `TableDataRegistry`.
- **Systems In Scope**: `UnifiedTableSystem`, `TableDataRegistry`, `HeaderSystem`, `related-object-filters`, `entity-details-renderer`, `InfoSummarySystem`, dashboard and trading-account calculation cards.
- **Key Deliverables**:
  - Canonical filter pipeline (multi-filter context, registry-backed datasets).
  - Filter orchestration adapters for header, entity filters, and details module.
  - Statistics and cards recalculating from `TableDataRegistry.getFilteredData`.
  - Updated documentation (JSDoc, function indices) and regression tests.

## 2. Architecture Overview
### 2.1 Data Flow After Implementation
1. **User triggers filter** (header/entity/internal).
2. **Filter context builder** assembles a structured payload (status/type/account/date/search/etc.).
3. **`UnifiedTableSystem.filter.apply`** resolves full dataset from `TableDataRegistry`, applies filters, saves `filteredData`, and returns the new array.
4. **Pagination refresh** (`updateTableWithPagination` with `skipRegistry=true`) renders the appropriate slice and updates `TableDataRegistry.setPageData`.
5. **Downstream subscribers** (InfoSummary, cards, widgets) call `TableDataRegistry.getFilteredData(tableType)` to recompute stats.
6. **Sorting** (TableSorter) תמיד מושך את הנתונים מ־TableDataRegistry. ה־`updateFunction` של כל טבלה שמפעילה פאג׳ינציה חייב לקרוא חזרה ל־`sync<Table>Pagination` כדי להבטיח שהמיון ייושם על כלל הנתונים לפני חיתוכי העמודים.
6. **State persistence**: `TableStateManager` + `UnifiedCacheManager` store active filters per table type.

### 2.2 Filter Context Contract
```js
{
  status: string[],
  type: string[],
  account: string[],
  search: string,
  dateRange: { preset: string, start?: string, end?: string },
  custom: { [key: string]: any } // extensibility slot
}
```

### 2.3 Registry Hooks
- `TableDataRegistry.setFilteredData(tableType, data, { tableId, skipPageReset })`
- `TableDataRegistry.onFilteredDataChange(tableType, callback)` – new internal bus exposed via configuration (implemented during coding phase).
- `TableDataRegistry.getFilteredData(tableType)`

## 3. Implementation Phases
### Phase A – Core Filtering Enhancements
1. Extend `TableFilter` to accept full filter context, perform canonical filtering, and persist results.
2. Add helper utilities in `UnifiedTableSystem` for merging filter fragments and normalising values.
3. Enhance `TableDataRegistry` with dataset change notifications used by consumers.

### Phase B – Orchestrator Integrations
1. **Header System**: replace DOM hide/show with calls to `UnifiedTableSystem.filter.apply`, update pagination via `updateTableWithPagination({ skipRegistry: true })`, sync `filterSystem.currentFilters`.
2. **Entity Filters** (`related-object-filters.js`): build context and delegate to unified filter; adapt counters to registry data.
3. **Details Module** (`entity-details-renderer.js`): use canonical data for linked items, rely on registry listeners for refresh.

### Phase C – Statistics And Cards
1. **InfoSummarySystem consumers** (`cash_flows.js`, `alerts.js`, `trading_accounts.js`, `trade_plans.js`, etc.) fetch filtered data from registry before invoking `InfoSummarySystem.calculateAndRender`.
2. **Dashboard / Trading Account cards** (`index.js`, `trading_accounts.js`): subscribe to registry change events and recompute KPIs.
3. Ensure fallback code paths remain functional if registry is unavailable (defensive checks).

### Phase D – Documentation And Testing
1. Update function indices and add JSDoc blocks for all touched functions.
2. Add section to relevant docs (e.g., `HEADER_SYSTEM_README.md`, `INFO_SUMMARY_SYSTEM.md`) referencing new workflow.
3. Testing:
   - Unit-style verification of `TableFilter.apply` combinations.
   - Manual regression across pages with filters.
   - Performance smoke test with >5k rows dataset (DevTools timeline).

## 4. Developer Workflow Checklist
1. Review `GENERAL_SYSTEMS_LIST.md` before touching logic; reuse existing services (FieldRendererService, TableStateManager, UnifiedCacheManager).
2. For each file:
   - Maintain function index at top.
   - Use English identifiers in logic; keep translations in render layer.
   - Add/Update JSDoc on exported or modified utilities.
3. When adapting page scripts:
   - Replace direct array mutations (`window.alertsData = …`) with registry writes (`TableDataRegistry.setFullData`).
   - Ensure `updateTableWithPagination` is invoked with `skipRegistry=true` if filtering already updated the registry.
4. Persist filter state via `TableStateManager.save(tableType, { filters, pageSize, sort })`.
5. After coding, run targeted lint (`npm run lint -- tables.js header-system.js ...`) and relevant JS tests if available.

## 5. Deliverables Summary
- [ ] Updated `UnifiedTableSystem` (filtering, registry hooks).
- [ ] Updated orchestrators (header system, entity filters, details module).
- [ ] Updated statistics consumers and cards.
- [ ] Documentation / JSDoc completed.
- [ ] Test evidence (console logs, manual checklist).

## 6. Appendix – Key File References
- `trading-ui/scripts/unified-table-system.js`
- `trading-ui/scripts/table-data-registry.js`
- `trading-ui/scripts/header-system.js`
- `trading-ui/scripts/related-object-filters.js`
- `trading-ui/scripts/entity-details-renderer.js`
- `trading-ui/scripts/info-summary-system.js`
- `trading-ui/scripts/index.js`
- `trading-ui/scripts/trading_accounts.js`
- `trading-ui/scripts/cash_flows.js`
- Documentation updates in `documentation/02-ARCHITECTURE/FRONTEND/`

> **Reminder**: Do not introduce duplicate utilities. Always prefer existing general systems (pagination, field rendering, cache manager, notification system, etc.).


