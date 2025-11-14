# Error Handling Coverage Report

**Generated**: 11/14/2025, 3:59:42 PM

---

## Summary

- **Total Functions**: 487
- **With Coverage**: 323
- **Without Coverage**: 164
- **Coverage**: 66.32%

---

## Per-Page Details

### ⚠️ index.js

- **Total Functions**: 32
- **Coverage**: 40.63%

**Functions without try-catch:**
- `toNumber()`
- `resolveDateValue()`
- `normalizeArray()`
- `determineCurrencySymbol()`
- `computePortfolioPnL()`
- `updateSummaryStats()`
- `updateRecentTrades()`
- `updateActiveAlerts()`
- `updateDashboardCount()`
- `updatePortfolioSummary()`
- `showDashboardError()`
- `handleDashboardError()`
- `processDashboardData()`
- `fetchDashboardDataFromApi()`
- `switchTableTab()`
- `refreshOverview()`
- `exportOverview()`
- `quickAction()`
- `debugZIndexStatus()`

---

### ⚠️ trades.js

- **Total Functions**: 71
- **Coverage**: 78.87%

**Functions without try-catch:**
- `getTradesPaginationOptions()`
- `handleTradesPageRender()`
- `handleTradesFilteredChange()`
- `displayTradeTickerInfo()`
- `addTrade()`
- `editTrade()`
- `clearTradeValidation()`
- `validateTradeForm()`
- `addImportantNote()`
- `addReminder()`
- `setupSortEventListeners()`
- `validateTradePlanChange()`
- `validateTickerChange()`
- `validateTradePlanDate()`
- `deleteTrade()`

---

### ⚠️ executions.js

- **Total Functions**: 81
- **Coverage**: 49.38%

**Functions without try-catch:**
- `updateRealizedPLField()`
- `updateExecution()`
- `getExecutionsPaginationOptions()`
- `handleExecutionsPageRender()`
- `handleExecutionsFilteredChange()`
- `applyExecutionsFilteredData()`
- `updateExecutionsTableMain()`
- `addNewPlan()`
- `addNewTrade()`
- `toggleExecutionFormFields()`
- `enableExecutionFormFields()`
- `disableExecutionFormFields()`
- `displayExecutionTickerInfo()`
- `hideExecutionTickerInfo()`
- `calculateExecutionValues()`
- `calculateAddExecutionValues()`
- `calculateEditExecutionValues()`
- `goToLinkedTrade()`
- `updateExecutionsTableForTradeModal()`
- `addEditBuySell()`
- `linkExistingExecution()`
- `unlinkExecution()`
- `applyAccountFilterWithTradesData()`
- `updateExecutionsGlobalData()`
- `toggleExternalIdField()`
- `updateTickersSummaryTable()`
- `refreshTickersSummary()`
- `viewTickerDetails()`
- `addExecutionForTicker()`
- `updateSuggestionsCount()`
- `buildTradeSuggestionRow()`
- `toggleAllSuggestions()`
- `rejectSuggestion()`
- `rejectAllSuggestions()`
- `openTradeDetailsModal()`
- `getTradeSuggestionsFlatData()`
- `sortTradeSuggestionsTable()`
- `updateTradeSuggestionsTable()`
- `initializeTradeSuggestionsPagination()`
- `renderTradeSuggestionsPageRows()`
- `buildTradeSuggestionsFlatList()`

---

### ⚠️ alerts.js

- **Total Functions**: 56
- **Coverage**: 57.14%

**Functions without try-catch:**
- `updateAlertsTable()`
- `enableConditionFields()`
- `disableConditionFields()`
- `enableEditConditionFields()`
- `disableEditConditionFields()`
- `editAlert()`
- `validateAlertStatusCombination()`
- `updateStatusAndTriggered()`
- `deleteAlertInternal()`
- `restoreAlertsSectionState()`
- `filterAlertsByRelatedObjectTypeWrapper()`
- `loadAlerts()`
- `generateDetailedLog()`
- `updateAlertsSummary()`
- `loadConditionsFromSource()`
- `displayAvailableConditions()`
- `selectConditionForAlert()`
- `initializeAlertModalTabs()`
- `updateModalButtons()`
- `showEvaluationLoading()`
- `displayEvaluationResults()`
- `updateEvaluationSummary()`
- `displayAlertTickerInfo()`
- `clearAlertTickerInfo()`

---

### ⚠️ trade_plans.js

- **Total Functions**: 48
- **Coverage**: 75.00%

**Functions without try-catch:**
- `displayTradePlanTickerInfo()`
- `updateEditTickerInfo()`
- `checkLinkedItemsBeforeCancel()`
- `buildTradePlanConfirmationDetails()`
- `viewLinkedItemsForTradePlan()`
- `updatePricesFromPercentages()`
- `updatePercentagesFromPrices()`
- `applyTradePlanDefaultRiskLevels()`
- `getTradePlanModalElements()`
- `parseFieldValue()`
- `parsePriceValue()`
- `normalizeSharesResult()`

---

### ⚠️ cash_flows.js

- **Total Functions**: 46
- **Coverage**: 63.04%

**Functions without try-catch:**
- `ensureTradingAccountsLoaded()`
- `validateCashFlowAmount()`
- `validateCashFlowDate()`
- `renderCashFlowsTable()`
- `getCashFlowTypeText()`
- `formatCashFlowAmount()`
- `formatUsdRate()`
- `showCashFlowDetails()`
- `updateCashFlowsTable()`
- `isCurrencyExchange()`
- `getExchangeIdFromCashFlow()`
- `confirmDeleteCashFlow()`
- `manageExternalIdField()`
- `setupSourceFieldListeners()`
- `initializeExternalIdFields()`
- `editCashFlow()`
- `generateDetailedLog()`

---

### ⚠️ notes.js

- **Total Functions**: 38
- **Coverage**: 84.21%

**Functions without try-catch:**
- `editNote()`
- `onNoteRelationTypeChange()`
- `populateEditSelectByType()`
- `validateNoteForm()`
- `confirmDeleteNote()`
- `replaceCurrentAttachment()`

---

### ✅ research.js

- **Total Functions**: 12
- **Coverage**: 100.00%

---

### ⚠️ tickers.js

- **Total Functions**: 42
- **Coverage**: 83.33%

**Functions without try-catch:**
- `editTicker()`
- `checkLinkedItemsAndCancelTicker()`
- `checkLinkedItemsBeforeDeleteTicker()`
- `checkLinkedItemsBeforeCancelTicker()`
- `checkLinkedItemsAndDeleteTicker()`
- `updateTickersTable()`
- `tryLoadData()`

---

### ⚠️ trading_accounts.js

- **Total Functions**: 41
- **Coverage**: 51.22%

**Functions without try-catch:**
- `loadCurrenciesFromServer()`
- `generateCurrencyOptions()`
- `loadAllTradingAccountsFromServer()`
- `loadAccountBalancesBatch()`
- `getCurrencySymbol()`
- `enrichAccountsWithBalances()`
- `confirmDeleteTradingAccount()`
- `showOpenTradesWarning()`
- `showEditTradingAccountModalById()`
- `filterTradingAccountsLocally()`
- `updateTradingAccountFilterMenu()`
- `restoreTradingAccountsSectionState()`
- `checkLinkedItemsAndCancelTradingAccount()`
- `checkLinkedItemsAndDeleteTradingAccount()`
- `checkLinkedItemsBeforeCancelTradingAccount()`
- `checkLinkedItemsBeforeDeleteTradingAccount()`
- `getTradingAccountName()`
- `generateDetailedLog()`
- `getTradingAccounts()`
- `waitAndRegisterTables()`

---

### ⚠️ database.js

- **Total Functions**: 15
- **Coverage**: 86.67%

**Functions without try-catch:**
- `fetchTableData()`
- `addRecord()`

---

### ⚠️ preferences-page.js

- **Total Functions**: 5
- **Coverage**: 80.00%

**Functions without try-catch:**
- `initializePreferencesPage()`

---

## Recommendations

⚠️  **11 pages** need improvement:

- **index.js**: 40.63% coverage (need 49.37% more)
- **trades.js**: 78.87% coverage (need 11.129999999999995% more)
- **executions.js**: 49.38% coverage (need 40.62% more)
- **alerts.js**: 57.14% coverage (need 32.86% more)
- **trade_plans.js**: 75.00% coverage (need 15% more)
- **cash_flows.js**: 63.04% coverage (need 26.96% more)
- **notes.js**: 84.21% coverage (need 5.790000000000006% more)
- **tickers.js**: 83.33% coverage (need 6.670000000000002% more)
- **trading_accounts.js**: 51.22% coverage (need 38.78% more)
- **database.js**: 86.67% coverage (need 3.3299999999999983% more)
- **preferences-page.js**: 80.00% coverage (need 10% more)

