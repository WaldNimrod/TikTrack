# Error Handling Coverage Report

**Generated**: 12/11/2025, 1:42:54 AM

---

## Summary

- **Total Functions**: 547
- **With Coverage**: 312
- **Without Coverage**: 235
- **Coverage**: 57.04%

---

## Per-Page Details

### ⚠️ index.js

- **Total Functions**: 28
- **Coverage**: 25.00%

**Functions without try-catch:**
- `toNumber()`
- `resolveDateValue()`
- `normalizeArray()`
- `determineCurrencySymbol()`
- `computePortfolioPnL()`
- `updateSummaryStats()`
- `updateRecentItemsWidget()`
- `updateRecentTradePlans()`
- `updateRecentTrades()`
- `updateActiveAlerts()`
- `updateDashboardCount()`
- `updatePortfolioSummary()`
- `showDashboardError()`
- `handleDashboardError()`
- `processDashboardData()`
- `legacyFetchDashboardDataFromApi()`
- `loadDashboardDataFromService()`
- `switchTableTab()`
- `exportOverview()`
- `quickAction()`
- `debugZIndexStatus()`

---

### ⚠️ trades.js

- **Total Functions**: 83
- **Coverage**: 69.88%

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
- `getTradesModalElement()`
- `getTradeModalEntityName()`
- `openTradeConditionsModal()`
- `handleTradeConditionsButtonClick()`
- `handleTradeConditionSummaryEdit()`
- `handleTradeConditionSummaryDelete()`
- `evaluateSingleTradeCondition()`
- `getTradeConditionsForEvaluation()`
- `loadTradeConditionsSummary()`
- `setupTradeConditionsButton()`
- `setupSortEventListeners()`
- `validateTradePlanChange()`
- `validateTickerChange()`
- `validateTradePlanDate()`
- `deleteTrade()`

---

### ⚠️ executions.js

- **Total Functions**: 88
- **Coverage**: 50.00%

**Functions without try-catch:**
- `updateRealizedPLField()`
- `updateExecution()`
- `loadExecutionsData()`
- `getExecutionsPaginationOptions()`
- `handleExecutionsPageRender()`
- `handleExecutionsFilteredChange()`
- `applyExecutionsFilteredData()`
- `updateExecutionsTableMain()`
- `loadAndRenderClusters()`
- `renderClusters()`
- `handleClusterCheckboxChange()`
- `updateClusterSummary()`
- `handleClusterButtonClick()`
- `toggleExecutionFormFields()`
- `enableExecutionFormFields()`
- `disableExecutionFormFields()`
- `displayExecutionTickerInfo()`
- `hideExecutionTickerInfo()`
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
- `renderTradeSuggestionsSection()`
- `buildTradeSuggestionRow()`
- `toggleAllSuggestions()`
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

- **Total Functions**: 55
- **Coverage**: 54.55%

**Functions without try-catch:**
- `loadAlertsDataInternal()`
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

- **Total Functions**: 72
- **Coverage**: 54.17%

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
- `updateTradePlansTable()`
- `getTradePlanModalEntityName()`
- `getTradePlansModalElement()`
- `isConditionsModalOpen()`
- `getCachedConditionSummary()`
- `clearCachedConditionsSummary()`
- `openTradePlanConditionsModal()`
- `handleTradePlanConditionsButtonClick()`
- `handleTradePlanConditionSummaryEdit()`
- `handleTradePlanConditionSummaryDelete()`
- `confirmTradePlanConditionDeletion()`
- `buildTradePlanModalNavigationMetadata()`
- `updateTradePlanModalNavigation()`
- `handleTradePlanModalRestore()`
- `setupTradePlanModalNavigation()`
- `getConditionsTranslator()`
- `evaluatePlanConditions()`
- `evaluateSinglePlanCondition()`
- `normalizeConditionEvaluationPayload()`
- `loadTradePlanConditionsSummary()`
- `setupTradePlanConditionsButton()`

---

### ⚠️ cash_flows.js

- **Total Functions**: 61
- **Coverage**: 49.18%

**Functions without try-catch:**
- `loadCashFlowsData()`
- `resolveExchangeDirectionFromType()`
- `getCashFlowsPaginationInstance()`
- `setActiveCashFlowTypeButton()`
- `setupCashFlowTypeFilterDropdown()`
- `cashFlowMatchesType()`
- `filterCashFlowsByType()`
- `filterCashFlowsLocallyByType()`
- `reapplyCashFlowTypeFilter()`
- `ensureTradingAccountsLoaded()`
- `validateCashFlowAmount()`
- `validateCashFlowDate()`
- `groupUnifiedExchanges()`
- `ensureExchangePairsAdjacency()`
- `setupExchangeRowInteractions()`
- `highlightExchangeGroup()`
- `clearExchangeHighlight()`
- `setCurrencyExchangeSummary()`
- `hydrateCashFlowExchangeDisplay()`
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
- `generateDetailedLog()`

---

### ⚠️ notes.js

- **Total Functions**: 38
- **Coverage**: 81.58%

**Functions without try-catch:**
- `editNote()`
- `updateNotesTable()`
- `onNoteRelationTypeChange()`
- `populateEditSelectByTypeFallback()`
- `validateNoteForm()`
- `confirmDeleteNote()`
- `replaceCurrentAttachment()`

---

### ⚠️ research.js

- **Total Functions**: 7
- **Coverage**: 14.29%

**Functions without try-catch:**
- `getContainer()`
- `renderPlaceholder()`
- `renderDataState()`
- `loadResearchData()`
- `initializeResearchPage()`
- `loadEODResearchData()`

---

### ⚠️ tickers.js

- **Total Functions**: 53
- **Coverage**: 67.92%

**Functions without try-catch:**
- `editTicker()`
- `initializeProviderSymbolFields()`
- `collectProviderSymbols()`
- `populateProviderSymbolFields()`
- `checkLinkedItemsAndCancelTicker()`
- `checkLinkedItemsBeforeDeleteTicker()`
- `checkLinkedItemsBeforeCancelTicker()`
- `checkLinkedItemsAndDeleteTicker()`
- `checkTickerDataCompleteness()`
- `checkTickersDataCompleteness()`
- `ensureHistoricalDataForTickers()`
- `enrichTickersWithFullData()`
- `loadAndRefreshMissingData()`
- `getDataStatusBadge()`
- `loadTickersDataInternal()`
- `updateTickersTable()`
- `tryLoadData()`

---

### ⚠️ trading_accounts.js

- **Total Functions**: 42
- **Coverage**: 45.24%

**Functions without try-catch:**
- `loadCurrenciesFromServer()`
- `generateCurrencyOptions()`
- `loadTradingAccountsFromServer()`
- `loadAllTradingAccountsFromServer()`
- `legacyFetchTradingAccounts()`
- `loadTradingAccountsData()`
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

⚠️  **12 pages** need improvement:

- **index.js**: 25.00% coverage (need 65% more)
- **trades.js**: 69.88% coverage (need 20.120000000000005% more)
- **executions.js**: 50.00% coverage (need 40% more)
- **alerts.js**: 54.55% coverage (need 35.45% more)
- **trade_plans.js**: 54.17% coverage (need 35.83% more)
- **cash_flows.js**: 49.18% coverage (need 40.82% more)
- **notes.js**: 81.58% coverage (need 8.420000000000002% more)
- **research.js**: 14.29% coverage (need 75.71000000000001% more)
- **tickers.js**: 67.92% coverage (need 22.08% more)
- **trading_accounts.js**: 45.24% coverage (need 44.76% more)
- **database.js**: 86.67% coverage (need 3.3299999999999983% more)
- **preferences-page.js**: 80.00% coverage (need 10% more)

