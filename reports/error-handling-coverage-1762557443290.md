# Error Handling Coverage Report

**Generated**: 11/8/2025, 1:17:23 AM

---

## Summary

- **Total Functions**: 437
- **With Coverage**: 307
- **Without Coverage**: 130
- **Coverage**: 70.25%

---

## Per-Page Details

### ⚠️ index.js

- **Total Functions**: 15
- **Coverage**: 66.67%

**Functions without try-catch:**
- `switchTableTab()`
- `refreshOverview()`
- `exportOverview()`
- `quickAction()`
- `debugZIndexStatus()`

---

### ⚠️ trades.js

- **Total Functions**: 63
- **Coverage**: 79.37%

**Functions without try-catch:**
- `displayTradeTickerInfo()`
- `updateTradesTable()`
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

- **Total Functions**: 56
- **Coverage**: 53.57%

**Functions without try-catch:**
- `updateRealizedPLField()`
- `updateExecution()`
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
- `applyAccountFilterWithTradesData()`
- `updateExecutionsGlobalData()`
- `toggleExternalIdField()`
- `updateTickersSummaryTable()`
- `refreshTickersSummary()`
- `viewTickerDetails()`
- `addExecutionForTicker()`

---

### ⚠️ alerts.js

- **Total Functions**: 58
- **Coverage**: 58.62%

**Functions without try-catch:**
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
- `getMethodIdFromCondition()`
- `displayAlertTickerInfo()`
- `clearAlertTickerInfo()`

---

### ⚠️ trade_plans.js

- **Total Functions**: 52
- **Coverage**: 82.69%

**Functions without try-catch:**
- `_REMOVED_displayTickerInfo()`
- `displayTradePlanTickerInfo()`
- `_REMOVED_displayEditTickerInfo()`
- `updateEditTickerInfo()`
- `checkLinkedItemsBeforeCancel()`
- `viewLinkedItemsForTradePlan()`
- `updatePricesFromPercentages()`
- `updatePercentagesFromPrices()`
- `_REMOVED_saveNewTradePlan()`

---

### ⚠️ cash_flows.js

- **Total Functions**: 44
- **Coverage**: 61.36%

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

- **Total Functions**: 37
- **Coverage**: 81.08%

**Functions without try-catch:**
- `editNote()`
- `onNoteRelationTypeChange()`
- `populateEditSelectByType()`
- `validateNoteForm()`
- `confirmDeleteNote()`
- `loadNoteForViewing()`
- `replaceCurrentAttachment()`

---

### ✅ research.js

- **Total Functions**: 12
- **Coverage**: 100.00%

---

### ⚠️ tickers.js

- **Total Functions**: 41
- **Coverage**: 85.37%

**Functions without try-catch:**
- `editTicker()`
- `checkLinkedItemsAndCancelTicker()`
- `checkLinkedItemsBeforeDeleteTicker()`
- `checkLinkedItemsBeforeCancelTicker()`
- `checkLinkedItemsAndDeleteTicker()`
- `tryLoadData()`

---

### ⚠️ trading_accounts.js

- **Total Functions**: 39
- **Coverage**: 48.72%

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

- **index.js**: 66.67% coverage (need 23.33% more)
- **trades.js**: 79.37% coverage (need 10.629999999999995% more)
- **executions.js**: 53.57% coverage (need 36.43% more)
- **alerts.js**: 58.62% coverage (need 31.380000000000003% more)
- **trade_plans.js**: 82.69% coverage (need 7.310000000000002% more)
- **cash_flows.js**: 61.36% coverage (need 28.64% more)
- **notes.js**: 81.08% coverage (need 8.920000000000002% more)
- **tickers.js**: 85.37% coverage (need 4.6299999999999955% more)
- **trading_accounts.js**: 48.72% coverage (need 41.28% more)
- **database.js**: 86.67% coverage (need 3.3299999999999983% more)
- **preferences-page.js**: 80.00% coverage (need 10% more)

