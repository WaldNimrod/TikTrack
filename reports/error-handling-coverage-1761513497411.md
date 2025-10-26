# Error Handling Coverage Report

**Generated**: 10/26/2025, 11:18:17 PM

---

## Summary

- **Total Functions**: 517
- **With Coverage**: 282
- **Without Coverage**: 235
- **Coverage**: 54.55%

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

- **Total Functions**: 65
- **Coverage**: 35.38%

**Functions without try-catch:**
- `formatDailyChange()`
- `getInvestmentTypeColor()`
- `updateTradesTable()`
- `viewTickerDetails()`
- `viewAccountDetails()`
- `viewTradePlanDetails()`
- `editTradeRecord()`
- `checkLinkedItemsAndCancel()`
- `addEditImportantNote()`
- `addEditReminder()`
- `showEditTradeModal()`
- `showAddTradeModal()`
- `toggleTradeFormFields()`
- `disableTradeFormFields()`
- `enableTradeFormFields()`
- `validateTradeForm()`
- `saveEditTradeData()`
- `saveNewTradeRecord()`
- `updateTickersListForClosedTrades()`
- `onShowClosedTradesChange()`
- `addImportantNote()`
- `addReminder()`
- `validateTradeStatusChange()`
- `getCurrentPosition()`
- `viewLinkedItemsForTrade()`
- `checkLinkedItemsBeforeDelete()`
- `checkLinkedItemsBeforeCancel()`
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

- **Total Functions**: 78
- **Coverage**: 50.00%

**Functions without try-catch:**
- `resetAddExecutionForm()`
- `resetEditExecutionForm()`
- `validateExecutionQuantity()`
- `validateExecutionPrice()`
- `validateExecutionCommission()`
- `validateExecutionSource()`
- `validateExecutionNotes()`
- `validateExecutionExternalId()`
- `validateExecutionDate()`
- `validateExecutionType()`
- `validateCompleteExecutionForm()`
- `updateExecutionsTableMain()`
- `clearNewExecutionHighlights()`
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

- **Total Functions**: 66
- **Coverage**: 59.09%

**Functions without try-catch:**
- `showAddAlertModal()`
- `enableConditionFields()`
- `disableConditionFields()`
- `enableEditConditionFields()`
- `disableEditConditionFields()`
- `enableEditConditionFields()`
- `disableEditConditionFields()`
- `editAlert()`
- `validateAlertStatusCombination()`
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

- **Total Functions**: 78
- **Coverage**: 51.28%

**Functions without try-catch:**
- `displayTickerInfo()`
- `displayEditTickerInfo()`
- `openEditTradePlanModal()`
- `updateEditTickerInfo()`
- `checkLinkedItemsBeforeCancel()`
- `confirmCancelTradePlan()`
- `saveEditTradePlan()`
- `saveNewTradePlan()`
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
- **Coverage**: 72.34%

**Functions without try-catch:**
- `editNote()`
- `deleteNote()`
- `showAddNoteModal()`
- `showEditNoteModal()`
- `loadNoteData()`
- `loadModalData()`
- `onNoteRelationTypeChange()`
- `populateEditSelectByType()`
- `validateNoteForm()`
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
- **Coverage**: 47.83%

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
- `checkLinkedItemsAndCancelTicker()`
- `checkLinkedItemsBeforeDeleteTicker()`
- `checkLinkedItemsBeforeCancelTicker()`
- `getTickerSymbol()`
- `checkLinkedItemsAndDeleteTicker()`
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
- **Coverage**: 45.83%

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
- `checkLinkedItemsAndCancelTradingAccount()`
- `checkLinkedItemsAndDeleteTradingAccount()`
- `checkLinkedItemsBeforeCancelTradingAccount()`
- `checkLinkedItemsBeforeDeleteTradingAccount()`
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
- **trades.js**: 35.38% coverage (need 54.62% more)
- **executions.js**: 50.00% coverage (need 40% more)
- **alerts.js**: 59.09% coverage (need 30.909999999999997% more)
- **trade_plans.js**: 51.28% coverage (need 38.72% more)
- **cash_flows.js**: 60.00% coverage (need 30% more)
- **notes.js**: 72.34% coverage (need 17.659999999999997% more)
- **tickers.js**: 47.83% coverage (need 42.17% more)
- **trading_accounts.js**: 45.83% coverage (need 44.17% more)
- **database.js**: 81.25% coverage (need 8.75% more)
- **preferences-page.js**: 80.00% coverage (need 10% more)

