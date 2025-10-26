# Error Handling Coverage Report

**Generated**: 10/26/2025, 6:14:53 PM

---

## Summary

- **Total Functions**: 525
- **With Coverage**: 316
- **Without Coverage**: 209
- **Coverage**: 60.19%

---

## Per-Page Details

### ⚠️ index.js

- **Total Functions**: 16
- **Coverage**: 62.50%

**Functions without try-catch:**
- `switchTableTab()`
- `refreshOverview()`
- `exportOverview()`
- `quickAction()`
- `createMixedChartData()`
- `debugZIndexStatus()`

---

### ⚠️ trades.js

- **Total Functions**: 61
- **Coverage**: 40.98%

**Functions without try-catch:**
- `formatDailyChange()`
- `getInvestmentTypeColor()`
- `updateTradesTable()`
- `viewTickerDetails()`
- `viewAccountDetails()`
- `viewTradePlanDetails()`
- `editTradeRecord()`
- `addEditImportantNote()`
- `addEditReminder()`
- `showEditTradeModal()`
- `showAddTradeModal()`
- `disableTradeFormFields()`
- `enableTradeFormFields()`
- `validateTradeForm()`
- `updateTickersListForClosedTrades()`
- `onShowClosedTradesChange()`
- `addImportantNote()`
- `addReminder()`
- `validateTradeStatusChange()`
- `getCurrentPosition()`
- `viewLinkedItemsForTrade()`
- `setupTradeModalListeners()`
- `setupDateValidation()`
- `validateDateFields()`
- `showDateValidationError()`
- `clearDateValidationMessages()`
- `addEditBuySell()`
- `updateTableStats()`
- `filterTradesData()`
- `setupSortEventListeners()`
- `validateTradePlanChange()`
- `validateTradeChanges()`
- `applyStatusFilterToTrades()`
- `validateTickerChange()`
- `showTickerChangeConfirmation()`
- `validateTradePlanDate()`

---

### ⚠️ executions.js

- **Total Functions**: 85
- **Coverage**: 61.18%

**Functions without try-catch:**
- `updateExecutionsTableMain()`
- `addNewPlan()`
- `addNewTrade()`
- `updateExecutionsSummary()`
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
- `setupExecutionsFilterFunctions()`
- `applyAccountFilterWithTradesData()`
- `updateExecutionsGlobalData()`
- `toggleExternalIdField()`
- `updateTickersSummaryTable()`
- `refreshTickersSummary()`
- `viewTickerDetails()`
- `addExecutionForTicker()`
- `toggleTickersSection()`
- `toggleExecutionsSection()`
- `saveExecutionWrapper()`
- `updateExecutionWrapper()`
- `confirmDeleteExecution()`
- `goToLinkedTrade()`
- `addNewPlan()`
- `addNewTrade()`
- `addNewTicker()`
- `generateDetailedLog()`

---

### ⚠️ alerts.js

- **Total Functions**: 62
- **Coverage**: 70.97%

**Functions without try-catch:**
- `updateStatusAndTriggered()`
- `updateAlert()`
- `deleteAlertInternal()`
- `getStatusClass()`
- `getRelatedClass()`
- `restoreAlertsSectionState()`
- `filterAlertsByRelatedObjectTypeWrapper()`
- `loadAlerts()`
- `updateAlertsSummary()`
- `loadConditionsFromSource()`
- `displayAvailableConditions()`
- `selectConditionForAlert()`
- `initializeAlertModalTabs()`
- `updateModalButtons()`
- `showEvaluationLoading()`
- `displayEvaluationResults()`
- `updateEvaluationSummary()`
- `getMethodIdFromCondition()`

---

### ⚠️ trade_plans.js

- **Total Functions**: 76
- **Coverage**: 53.95%

**Functions without try-catch:**
- `displayTickerInfo()`
- `displayEditTickerInfo()`
- `openEditTradePlanModal()`
- `updateEditTickerInfo()`
- `confirmCancelTradePlan()`
- `editTradePlan()`
- `filterDesignsData()`
- `performLocalSort()`
- `getPlanningColumnValue()`
- `isDateValue()`
- `restoreSortState()`
- `getStatusClass()`
- `getTypeClass()`
- `loadUserPreferences()`
- `createDateWithTimezone()`
- `translateDateRangeToDates()`
- `updateFilterDebugPanel()`
- `filterTradePlansLocally()`
- `setupTradePlanModalListeners()`
- `getCurrentEditPlanId()`
- `setupPriceCalculation()`
- `setupEditPriceCalculation()`
- `setupSortableHeadersLocal()`
- `toggleSection()`
- `restorePlanningSectionState()`
- `showTickerPage()`
- `addImportantNote()`
- `addReminder()`
- `updateTickerInfo()`
- `updateDefaultPrices()`
- `updateSharesFromAmount()`
- `updateAmountFromShares()`
- `addEntryCondition()`
- `addReason()`
- `filterTradePlansByType()`

---

### ⚠️ cash_flows.js

- **Total Functions**: 40
- **Coverage**: 60.00%

**Functions without try-catch:**
- `ensureTradingAccountsLoaded()`
- `restoreCashFlowsSectionState()`
- `renderCashFlowsTable()`
- `getCashFlowTypeText()`
- `formatCashFlowAmount()`
- `formatUsdRate()`
- `showCashFlowDetails()`
- `updateCashFlowsTable()`
- `confirmDeleteCashFlow()`
- `manageExternalIdField()`
- `setupSourceFieldListeners()`
- `initializeExternalIdFields()`
- `showAddCashFlowModal()`
- `showEditCashFlowModal()`
- `editCashFlow()`
- `generateDetailedLog()`

---

### ⚠️ notes.js

- **Total Functions**: 54
- **Coverage**: 70.37%

**Functions without try-catch:**
- `editNote()`
- `deleteNote()`
- `loadNoteData()`
- `loadModalData()`
- `onNoteRelationTypeChange()`
- `populateEditSelectByType()`
- `confirmDeleteNote()`
- `loadNoteForViewing()`
- `replaceCurrentAttachment()`
- `toggleSection()`
- `openNoteDetailsWrapper()`
- `editNote()`
- `deleteNote()`
- `filterNotesByRelatedObjectType()`
- `formatText()`
- `loadNotesData()`

---

### ✅ research.js

- **Total Functions**: 12
- **Coverage**: 100.00%

---

### ⚠️ tickers.js

- **Total Functions**: 51
- **Coverage**: 52.94%

**Functions without try-catch:**
- `getCurrencySymbol()`
- `getTimeDuration()`
- `getTickerTypeStyle()`
- `getTickerStatusStyle()`
- `getTickerStatusLabel()`
- `generateTickerCurrencyOptions()`
- `updateCurrencyOptions()`
- `restoreTickersSectionState()`
- `showAddTickerModal()`
- `showEditTickerModal()`
- `deleteTicker()`
- `showDeleteTickerModal()`
- `getTickerSymbol()`
- `clearTickersCache()`
- `updateTickersSummaryStats()`
- `tryLoadData()`
- `filterTickersByType()`
- `getTypeDisplayName()`
- `toggleSection()`
- `toggleTickersSection()`
- `saveTicker()`
- `updateTicker()`
- `confirmDeleteTicker()`
- `refreshYahooFinanceData()`

---

### ⚠️ trading_accounts.js

- **Total Functions**: 47
- **Coverage**: 55.32%

**Functions without try-catch:**
- `loadCurrenciesFromServer()`
- `generateCurrencyOptions()`
- `loadAllTradingAccountsFromServer()`
- `loadDefaultTradingAccounts()`
- `updateTradingAccountsTable()`
- `updateTradingAccountsSummary()`
- `updateTradingAccountFilterDisplayText()`
- `createTradingAccountModal()`
- `validateTradingAccountData()`
- `showFormError()`
- `showEditTradingAccountModal()`
- `showSuccessMessage()`
- `showErrorMessage()`
- `confirmDeleteTradingAccount()`
- `showOpenTradesWarning()`
- `filterTradingAccountsLocally()`
- `updateTradingAccountFilterMenu()`
- `restoreTradingAccountsSectionState()`
- `getTradingAccountName()`
- `sortTable()`
- `getTradingAccounts()`

---

### ⚠️ database.js

- **Total Functions**: 16
- **Coverage**: 81.25%

**Functions without try-catch:**
- `fetchTableData()`
- `formatDate()`
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

- **index.js**: 62.50% coverage (need 27.5% more)
- **trades.js**: 40.98% coverage (need 49.02% more)
- **executions.js**: 61.18% coverage (need 28.82% more)
- **alerts.js**: 70.97% coverage (need 19.03% more)
- **trade_plans.js**: 53.95% coverage (need 36.05% more)
- **cash_flows.js**: 60.00% coverage (need 30% more)
- **notes.js**: 70.37% coverage (need 19.629999999999995% more)
- **tickers.js**: 52.94% coverage (need 37.06% more)
- **trading_accounts.js**: 55.32% coverage (need 34.68% more)
- **database.js**: 81.25% coverage (need 8.75% more)
- **preferences-page.js**: 80.00% coverage (need 10% more)

