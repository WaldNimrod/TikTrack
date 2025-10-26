# Error Handling Coverage Report

**Generated**: 10/26/2025, 8:07:37 PM

---

## Summary

- **Total Functions**: 508
- **With Coverage**: 308
- **Without Coverage**: 200
- **Coverage**: 60.63%

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

- **Total Functions**: 62
- **Coverage**: 41.94%

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

- **Total Functions**: 77
- **Coverage**: 62.34%

**Functions without try-catch:**
- `resetAddExecutionForm()`
- `resetEditExecutionForm()`
- `updateExecutionsTableMain()`
- `addNewPlan()`
- `addNewTrade()`
- `updateExecutionsSummary()`
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

---

### ⚠️ alerts.js

- **Total Functions**: 63
- **Coverage**: 68.25%

**Functions without try-catch:**
- `showAddAlertModal()`
- `editAlert()`
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

- **Total Functions**: 47
- **Coverage**: 74.47%

**Functions without try-catch:**
- `editNote()`
- `deleteNote()`
- `showAddNoteModal()`
- `showEditNoteModal()`
- `loadNoteData()`
- `loadModalData()`
- `onNoteRelationTypeChange()`
- `populateEditSelectByType()`
- `confirmDeleteNote()`
- `loadNoteForViewing()`
- `replaceCurrentAttachment()`
- `toggleSection()`

---

### ✅ research.js

- **Total Functions**: 12
- **Coverage**: 100.00%

---

### ⚠️ tickers.js

- **Total Functions**: 46
- **Coverage**: 56.52%

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

---

### ⚠️ trading_accounts.js

- **Total Functions**: 48
- **Coverage**: 54.17%

**Functions without try-catch:**
- `loadCurrenciesFromServer()`
- `generateCurrencyOptions()`
- `loadAllTradingAccountsFromServer()`
- `loadDefaultTradingAccounts()`
- `updateTradingAccountsTable()`
- `updateTradingAccountsSummary()`
- `updateTradingAccountFilterDisplayText()`
- `showAddTradingAccountModal()`
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
- **trades.js**: 41.94% coverage (need 48.06% more)
- **executions.js**: 62.34% coverage (need 27.659999999999997% more)
- **alerts.js**: 68.25% coverage (need 21.75% more)
- **trade_plans.js**: 53.95% coverage (need 36.05% more)
- **cash_flows.js**: 60.00% coverage (need 30% more)
- **notes.js**: 74.47% coverage (need 15.530000000000001% more)
- **tickers.js**: 56.52% coverage (need 33.48% more)
- **trading_accounts.js**: 54.17% coverage (need 35.83% more)
- **database.js**: 81.25% coverage (need 8.75% more)
- **preferences-page.js**: 80.00% coverage (need 10% more)

