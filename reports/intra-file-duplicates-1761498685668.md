# Intra-File Duplicate Detection Report

**Generated**: 10/26/2025, 7:11:25 PM

---

## Summary

- **Total Files Analyzed**: 11
- **Files with Duplicates**: 8
- **Total Duplicates Found**: 92
- **High Severity**: 76
- **Medium Severity**: 16
- **Average per File**: 8.36

## Recommendations

### 1. Exact function name duplicates found (HIGH)

**Files**: trades.js, executions.js, trade_plans.js, cash_flows.js, notes.js, tickers.js, trading_accounts.js

**Action**: Rename duplicate functions or consolidate functionality

### 2. High similarity code blocks found (MEDIUM)

**Files**: trades.js, executions.js, alerts.js, trade_plans.js, cash_flows.js, trading_accounts.js

**Action**: Review and refactor similar functions to reduce duplication

## Detailed Findings

### trades.js

- **Total Functions**: 61
- **Duplicates Found**: 5
- **High Severity**: 1
- **Medium Severity**: 4

**Duplicates**:
1. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: checkLinkedItemsBeforeDelete vs checkLinkedItemsBeforeCancel (100.0% similar)
2. **HIGH_SIMILARITY** (MEDIUM) - HIGH_SIMILARITY: addEditImportantNote vs addImportantNote (88.1% similar)
3. **HIGH_SIMILARITY** (MEDIUM) - HIGH_SIMILARITY: viewTickerDetails vs viewAccountDetails (84.5% similar)
4. **SIMILAR_CODE** (MEDIUM) - SIMILAR_CODE: addEditImportantNote vs addEditReminder (78.7% similar)
5. **SIMILAR_CODE** (MEDIUM) - SIMILAR_CODE: addEditReminder vs addImportantNote (78.0% similar)

### executions.js

- **Total Functions**: 86
- **Duplicates Found**: 23
- **High Severity**: 22
- **Medium Severity**: 1

**Duplicates**:
1. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: updateExecutionWrapper
2. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: confirmDeleteExecution
3. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: addNewTicker
4. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: addNewPlan
5. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: addNewTrade
6. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: enableExecutionFormFields vs disableExecutionFormFields (100.0% similar)
7. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: goToLinkedTrade
8. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: saveExecutionWrapper vs confirmDeleteExecution (100.0% similar)
9. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: saveExecutionWrapper vs addNewPlan (100.0% similar)
10. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: saveExecutionWrapper vs addNewTrade (100.0% similar)
11. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: saveExecutionWrapper vs addNewTicker (100.0% similar)
12. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: confirmDeleteExecution vs addNewPlan (100.0% similar)
13. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: confirmDeleteExecution vs addNewTrade (100.0% similar)
14. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: confirmDeleteExecution vs addNewTicker (100.0% similar)
15. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: addNewPlan vs addNewTrade (100.0% similar)
16. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: addNewPlan vs addNewTicker (100.0% similar)
17. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: addNewTrade vs addNewTicker (100.0% similar)
18. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: validateExecutionQuantity vs validateExecutionPrice (97.8% similar)
19. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: goToTrade vs goToPlan (95.0% similar)
20. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: goToTrade vs goToAlert (95.0% similar)
21. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: goToPlan vs goToAlert (95.0% similar)
22. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: addNewPlan vs addNewTrade (94.6% similar)
23. **HIGH_SIMILARITY** (MEDIUM) - HIGH_SIMILARITY: linkExistingExecution vs unlinkExecution (87.6% similar)

### alerts.js

- **Total Functions**: 63
- **Duplicates Found**: 3
- **High Severity**: 0
- **Medium Severity**: 3

**Duplicates**:
1. **SIMILAR_CODE** (MEDIUM) - SIMILAR_CODE: disableConditionFields vs disableEditConditionFields (79.5% similar)
2. **SIMILAR_CODE** (MEDIUM) - SIMILAR_CODE: populateRelatedObjects vs populateEditRelatedObjects (78.3% similar)
3. **SIMILAR_CODE** (MEDIUM) - SIMILAR_CODE: enableConditionFields vs enableEditConditionFields (76.8% similar)

### trade_plans.js

- **Total Functions**: 79
- **Duplicates Found**: 12
- **High Severity**: 6
- **Medium Severity**: 6

**Duplicates**:
1. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: displayTickerInfo vs displayEditTickerInfo (100.0% similar)
2. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: setupPriceCalculation vs setupEditPriceCalculation (100.0% similar)
3. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: openCancelTradePlanModal vs openDeleteTradePlanModal (98.4% similar)
4. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: enableEditFieldsWrapper vs disableEditFields (98.3% similar)
5. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: enableFormFields vs disableFormFields (98.2% similar)
6. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: addEditCondition vs addEditReason (97.1% similar)
7. **SIMILAR_CODE** (MEDIUM) - SIMILAR_CODE: addEntryCondition vs addReason (79.0% similar)
8. **SIMILAR_CODE** (MEDIUM) - SIMILAR_CODE: addReminder vs addReason (77.7% similar)
9. **SIMILAR_CODE** (MEDIUM) - SIMILAR_CODE: addImportantNote vs addReminder (77.1% similar)
10. **SIMILAR_CODE** (MEDIUM) - SIMILAR_CODE: addReminder vs addEntryCondition (76.2% similar)
11. **SIMILAR_CODE** (MEDIUM) - SIMILAR_CODE: addImportantNote vs addReason (76.1% similar)
12. **SIMILAR_CODE** (MEDIUM) - SIMILAR_CODE: addImportantNote vs addEntryCondition (73.4% similar)

### cash_flows.js

- **Total Functions**: 44
- **Duplicates Found**: 7
- **High Severity**: 6
- **Medium Severity**: 1

**Duplicates**:
1. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: validation
2. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: validation
3. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: validation
4. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: validation
5. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: validation
6. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: validation
7. **HIGH_SIMILARITY** (MEDIUM) - HIGH_SIMILARITY: validateCashFlowForm vs validateEditCashFlowForm (85.5% similar)

### notes.js

- **Total Functions**: 57
- **Duplicates Found**: 14
- **High Severity**: 14
- **Medium Severity**: 0

**Duplicates**:
1. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: editNote
2. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: deleteNote
3. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: loadNotesData
4. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: onNoteRelationTypeChange vs getFieldByErrorId (100.0% similar)
5. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: formatText
6. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: toggleSection vs openNoteDetailsWrapper (100.0% similar)
7. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: toggleSection vs loadNotesData (100.0% similar)
8. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: openNoteDetailsWrapper vs loadNotesData (100.0% similar)
9. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: editNote vs deleteNote (100.0% similar)
10. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: editNote vs filterNotesByRelatedObjectType (100.0% similar)
11. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: editNote vs formatText (100.0% similar)
12. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: deleteNote vs filterNotesByRelatedObjectType (100.0% similar)
13. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: deleteNote vs formatText (100.0% similar)
14. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: filterNotesByRelatedObjectType vs formatText (100.0% similar)

### tickers.js

- **Total Functions**: 54
- **Duplicates Found**: 18
- **High Severity**: 18
- **Medium Severity**: 0

**Duplicates**:
1. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: saveTicker
2. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: updateTicker
3. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: checkLinkedItemsAndCancelTicker vs checkLinkedItemsAndDeleteTicker (100.0% similar)
4. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: confirmDeleteTicker
5. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: refreshYahooFinanceData
6. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: toggleSection vs saveTicker (100.0% similar)
7. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: toggleSection vs updateTicker (100.0% similar)
8. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: toggleSection vs confirmDeleteTicker (100.0% similar)
9. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: toggleSection vs refreshYahooFinanceData (100.0% similar)
10. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: saveTicker vs updateTicker (100.0% similar)
11. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: saveTicker vs confirmDeleteTicker (100.0% similar)
12. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: saveTicker vs refreshYahooFinanceData (100.0% similar)
13. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: updateTicker vs confirmDeleteTicker (100.0% similar)
14. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: updateTicker vs refreshYahooFinanceData (100.0% similar)
15. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: confirmDeleteTicker vs refreshYahooFinanceData (100.0% similar)
16. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: onSuccess
17. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: onSuccess
18. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: onSuccess

### trading_accounts.js

- **Total Functions**: 53
- **Duplicates Found**: 10
- **High Severity**: 9
- **Medium Severity**: 1

**Duplicates**:
1. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: getCurrencyDisplay vs getTradingAccounts (100.0% similar)
2. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: getCurrencyDisplay vs isTradingAccountsLoaded (100.0% similar)
3. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: getCurrencyDisplay vs checkLinkedItems (100.0% similar)
4. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: getTradingAccounts vs isTradingAccountsLoaded (100.0% similar)
5. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: getTradingAccounts vs checkLinkedItems (100.0% similar)
6. **EXACT_NAME_DUPLICATE** (HIGH) - Exact function name duplicate: getTradingAccounts
7. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: isTradingAccountsLoaded vs checkLinkedItems (100.0% similar)
8. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: updateTradingAccountFromModal vs setupSortableHeaders (100.0% similar)
9. **NEAR_DUPLICATE** (HIGH) - NEAR_DUPLICATE: checkLinkedItemsAndCancelTradingAccount vs checkLinkedItemsAndDeleteTradingAccount (100.0% similar)
10. **HIGH_SIMILARITY** (MEDIUM) - HIGH_SIMILARITY: showFormError vs showErrorMessage (89.8% similar)

