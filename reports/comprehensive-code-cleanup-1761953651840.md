# דוח מקיף לניקוי קוד כפול ופונקציות לא בשימוש

**תאריך**: 1.11.2025, 1:34:11

---

## סיכום

- **סה"כ קבצים**: 61
- **סה"כ פונקציות**: 1390
- **פונקציות לא בשימוש**: 712
- **קבוצות כפולות**: 314
- **פונקציות מקומיות עם תחליף כללי**: 29

## המלצות

### 1. Unused functions found (HIGH)

- **כמות**: 712
- **קבצים מעורבים**: index.js, trades.js, executions.js, alerts.js, trade_plans.js, cash_flows.js, research.js, notes.js, preferences-page.js, tickers.js, trading_accounts.js, database.js, notification-system.js, logger-service.js, ui-utils.js, tables.js, header-system.js, page-utils.js, translation-utils.js, button-icons.js, color-scheme-system.js, select-populator-service.js, pagination-system.js, actions-menu-system.js, business-module.js, core-systems.js, data-advanced.js, data-basic.js, ui-advanced.js, date-utils.js, data-utils.js, preferences-ui.js, validation-utils.js, account-service.js, alert-service.js, ticker-service.js, trade-plan-service.js, constraints.js, linked-items.js, related-object-filters.js, external-data-settings-service.js
- **פעולה מומלצת**: Review and remove unused functions to reduce code complexity

### 2. Duplicate functions found within files (HIGH)

- **כמות**: 314
- **קבצים מעורבים**: index.js, trades.js, executions.js, alerts.js, trade_plans.js, cash_flows.js, research.js, notes.js, preferences-page.js, tickers.js, trading_accounts.js, database.js, notification-system.js, logger-service.js, ui-utils.js, color-scheme-system.js, business-module.js, core-systems.js, data-advanced.js, ui-advanced.js, ui-basic.js, data-utils.js, validation-utils.js, account-service.js, alert-service.js, ticker-service.js, trade-plan-service.js, constraints.js, linked-items.js, external-data-settings-service.js
- **פעולה מומלצת**: Consolidate duplicate functions into single implementation

### 3. Local functions with global alternatives found (MEDIUM)

- **כמות**: 29
- **קבצים מעורבים**: cash_flows.js, core-systems.js, data-advanced.js
- **פעולה מומלצת**: Replace local functions with global system functions for consistency

## 1. פונקציות לא בשימוש (712)

### index.js

1. **switchTableTab** (שורה 84, function) - HIGH
2. **refreshOverview** (שורה 109, function) - HIGH
3. **exportOverview** (שורה 118, function) - HIGH
4. **quickAction** (שורה 130, function) - HIGH
5. **createTradesStatusChart** (שורה 145, function) - HIGH
6. **createPerformanceChart** (שורה 188, function) - HIGH
7. **createAccountChart** (שורה 229, function) - HIGH
8. **createMixedChart** (שורה 270, function) - HIGH
9. **createMixedChartData** (שורה 314, function) - HIGH
10. **refreshAllCharts** (שורה 379, function) - HIGH
11. **refreshChart** (שורה 403, function) - HIGH
12. **exportChart** (שורה 438, function) - HIGH
13. **exportAllCharts** (שורה 462, function) - HIGH
14. **debugZIndexStatus** (שורה 649, function) - HIGH
15. **createTradesStatusChart** (שורה 145, async-function) - MEDIUM
16. **createPerformanceChart** (שורה 188, async-function) - MEDIUM
17. **createAccountChart** (שורה 229, async-function) - MEDIUM
18. **createMixedChart** (שורה 270, async-function) - MEDIUM
19. **refreshAllCharts** (שורה 379, async-function) - MEDIUM
20. **refreshChart** (שורה 403, async-function) - MEDIUM
21. **exportChart** (שורה 438, async-function) - MEDIUM
22. **exportAllCharts** (שורה 462, async-function) - MEDIUM

### trades.js

1. **loadTradeTickerInfo** (שורה 417, function) - HIGH
2. **displayTradeTickerInfo** (שורה 447, function) - HIGH
3. **loadTickerDataForTrades** (שורה 522, function) - HIGH
4. **addTrade** (שורה 1228, function) - HIGH
5. **editTrade** (שורה 1252, function) - HIGH
6. **clearTradeValidation** (שורה 1279, function) - HIGH
7. **hideAddTradeModal** (שורה 1338, function) - HIGH
8. **hideEditTradeModal** (שורה 1364, function) - HIGH
9. **refreshPositions** (שורה 1855, function) - HIGH
10. **initializeTradeConditionsSystem** (שורה 2154, function) - HIGH
11. **generateDetailedLogForTrades** (שורה 3094, function) - HIGH
12. **saveTrade** (שורה 3143, function) - HIGH
13. **deleteTrade** (שורה 3245, function) - HIGH
14. **loadTradeTickerInfo** (שורה 417, async-function) - MEDIUM
15. **loadTickerDataForTrades** (שורה 522, async-function) - MEDIUM
16. **refreshPositions** (שורה 1855, async-function) - MEDIUM
17. **generateDetailedLogForTrades** (שורה 3094, async-function) - MEDIUM
18. **saveTrade** (שורה 3143, async-function) - MEDIUM
19. **deleteTrade** (שורה 3245, async-function) - MEDIUM

### executions.js

1. **addExecution** (שורה 116, function) - HIGH
2. **editExecution** (שורה 178, function) - HIGH
3. **resetExecutionForm** (שורה 207, function) - HIGH
4. **resetAddExecutionForm** (שורה 258, function) - HIGH
5. **resetEditExecutionForm** (שורה 262, function) - HIGH
6. **updateRealizedPLField** (שורה 274, function) - HIGH
7. **fillEditExecutionForm** (שורה 299, function) - HIGH
8. **updateExecutionWrapper** (שורה 581, function) - HIGH
9. **displayLinkedItems** (שורה 756, function) - HIGH
10. **goToTrade** (שורה 954, function) - HIGH
11. **goToPlan** (שורה 968, function) - HIGH
12. **goToAlert** (שורה 982, function) - HIGH
13. **goToNote** (שורה 996, function) - HIGH
14. **filterExecutionsLocally** (שורה 1443, function) - HIGH
15. **setupModalConfigurations** (שורה 1667, function) - HIGH
16. **loadTickersWithOpenOrClosedTradesAndPlans** (שורה 1707, function) - HIGH
17. **enableAllFields** (שורה 1750, function) - HIGH
18. **loadActiveTradesForTicker** (שורה 1784, function) - HIGH
19. **updateTradesOnCheckboxChange** (שורה 1934, function) - HIGH
20. **updateTradesOnTickerChange** (שורה 1970, function) - HIGH
21. **goToTickerPage** (שורה 1994, function) - HIGH
22. **showTickerHelp** (שורה 2022, function) - HIGH
23. **addNewTicker** (שורה 2041, function) - HIGH
24. **addNewPlan** (שורה 2061, function) - HIGH
25. **addNewTrade** (שורה 2074, function) - HIGH
26. **updateExecutionsSummary** (שורה 2088, function) - HIGH
27. **toggleExecutionFormFields** (שורה 2127, function) - HIGH
28. **enableExecutionFormFields** (שורה 2156, function) - HIGH
29. **disableExecutionFormFields** (שורה 2164, function) - HIGH
30. **loadExecutionTickerInfo** (שורה 2171, function) - HIGH
31. **displayExecutionTickerInfo** (שורה 2228, function) - HIGH
32. **hideExecutionTickerInfo** (שורה 2296, function) - HIGH
33. **calculateExecutionValues** (שורה 2307, function) - HIGH
34. **calculateAddExecutionValues** (שורה 2358, function) - HIGH
35. **calculateEditExecutionValues** (שורה 2366, function) - HIGH
36. **goToLinkedTrade** (שורה 2378, function) - HIGH
37. **loadTradeExecutions** (שורה 2410, function) - HIGH
38. **updateExecutionsTableForTradeModal** (שורה 2429, function) - HIGH
39. **linkExistingExecution** (שורה 2490, function) - HIGH
40. **unlinkExecution** (שורה 2501, function) - HIGH
41. **setupExecutionsFilterFunctions** (שורה 2665, function) - HIGH
42. **applyAccountFilterWithTradesData** (שורה 2727, function) - HIGH
43. **updateExecutionsGlobalData** (שורה 2891, function) - HIGH
44. **toggleExternalIdField** (שורה 2967, function) - HIGH
45. **loadTickersSummaryData** (שורה 3007, function) - HIGH
46. **updateTickersSummaryTable** (שורה 3075, function) - HIGH
47. **refreshTickersSummary** (שורה 3154, function) - HIGH
48. **addExecutionForTicker** (שורה 3194, function) - HIGH
49. **updateTickersList** (שורה 3242, function) - HIGH
50. **deleteExecution** (שורה 3332, function) - HIGH
51. **performExecutionDeletion** (שורה 3379, function) - HIGH
52. **trySetTradeValue** (שורה 328, arrow) - MEDIUM
53. **fillEditExecutionForm** (שורה 299, async-function) - MEDIUM
54. **updateExecutionWrapper** (שורה 581, async-function) - MEDIUM
55. **loadTickersWithOpenOrClosedTradesAndPlans** (שורה 1707, async-function) - MEDIUM
56. **loadActiveTradesForTicker** (שורה 1784, async-function) - MEDIUM
57. **updateTradesOnCheckboxChange** (שורה 1934, async-function) - MEDIUM
58. **updateTradesOnTickerChange** (שורה 1970, async-function) - MEDIUM
59. **loadExecutionTickerInfo** (שורה 2171, async-function) - MEDIUM
60. **loadTickersSummaryData** (שורה 3007, async-function) - MEDIUM
61. **refreshTickersSummary** (שורה 3154, async-function) - MEDIUM
62. **updateTickersList** (שורה 3242, async-function) - MEDIUM
63. **deleteExecution** (שורה 3332, async-function) - MEDIUM
64. **performExecutionDeletion** (שורה 3379, async-function) - MEDIUM

### alerts.js

1. **getDemoAlertsData** (שורה 307, function) - HIGH
2. **getConditionSourceDisplay** (שורה 452, function) - HIGH
3. **updatePageSummaryStats_LEGACY** (שורה 711, function) - HIGH
4. **toggleConditionFields** (שורה 1041, function) - HIGH
5. **enableEditConditionFields** (שורה 1104, function) - HIGH
6. **disableEditConditionFields** (שורה 1112, function) - HIGH
7. **populateEditRelatedObjects** (שורה 1159, function) - HIGH
8. **saveAlert** (שורה 1239, function) - HIGH
9. **editAlert** (שורה 1423, function) - HIGH
10. **updateStatusAndTriggered** (שורה 1501, function) - HIGH
11. **deleteAlertInternal** (שורה 1707, function) - HIGH
12. **confirmDeleteAlert** (שורה 1740, function) - HIGH
13. **restoreAlertsSectionState** (שורה 1795, function) - HIGH
14. **filterAlertsByRelatedObjectTypeWrapper** (שורה 1876, function) - HIGH
15. **loadAlerts** (שורה 1982, function) - HIGH
16. **reactivateAlert** (שורה 2022, function) - HIGH
17. **toggleAlert** (שורה 2099, function) - HIGH
18. **validateAlertForm** (שורה 2272, function) - HIGH
19. **updateEvaluationStats** (שורה 2322, function) - HIGH
20. **saveAlertData** (שורה 2352, function) - HIGH
21. **generateDetailedLogForAlerts** (שורה 2468, function) - HIGH
22. **loadConditionsFromSource** (שורה 2500, function) - HIGH
23. **loadTradePlansForConditions** (שורה 2521, function) - HIGH
24. **loadTradesForConditions** (שורה 2548, function) - HIGH
25. **loadConditionsFromItem** (שורה 2575, function) - HIGH
26. **displayAvailableConditions** (שורה 2608, function) - HIGH
27. **selectConditionForAlert** (שורה 2640, function) - HIGH
28. **createAlertFromCondition** (שורה 2665, function) - HIGH
29. **initializeAlertModalTabs** (שורה 2730, function) - HIGH
30. **updateModalButtons** (שורה 2747, function) - HIGH
31. **evaluateAllConditions** (שורה 2788, function) - HIGH
32. **refreshConditionEvaluations** (שורה 2827, function) - HIGH
33. **showEvaluationLoading** (שורה 2864, function) - HIGH
34. **displayEvaluationResults** (שורה 2885, function) - HIGH
35. **updateEvaluationSummary** (שורה 2911, function) - HIGH
36. **initializeAlertConditionBuilder** (שורה 2934, function) - HIGH
37. **getMethodIdFromCondition** (שורה 2983, function) - HIGH
38. **cleanupAlertConditionBuilder** (שורה 2998, function) - HIGH
39. **loadAlertTickerInfo** (שורה 3041, function) - HIGH
40. **displayAlertTickerInfo** (שורה 3071, function) - HIGH
41. **updatePageSummaryStats_LEGACY** (שורה 711, async-function) - MEDIUM
42. **saveAlert** (שורה 1239, async-function) - MEDIUM
43. **deleteAlertInternal** (שורה 1707, async-function) - MEDIUM
44. **confirmDeleteAlert** (שורה 1740, async-function) - MEDIUM
45. **reactivateAlert** (שורה 2022, async-function) - MEDIUM
46. **saveAlertData** (שורה 2352, async-function) - MEDIUM
47. **generateDetailedLogForAlerts** (שורה 2468, async-function) - MEDIUM
48. **loadTradePlansForConditions** (שורה 2521, async-function) - MEDIUM
49. **loadTradesForConditions** (שורה 2548, async-function) - MEDIUM
50. **loadConditionsFromItem** (שורה 2575, async-function) - MEDIUM
51. **createAlertFromCondition** (שורה 2665, async-function) - MEDIUM
52. **evaluateAllConditions** (שורה 2788, async-function) - MEDIUM
53. **refreshConditionEvaluations** (שורה 2827, async-function) - MEDIUM
54. **loadAlertTickerInfo** (שורה 3041, async-function) - MEDIUM

### trade_plans.js

1. **executeTradePlan** (שורה 106, function) - HIGH
2. **copyTradePlan** (שורה 179, function) - HIGH
3. **enableFormFields** (שורה 352, function) - HIGH
4. **disableFormFields** (שורה 377, function) - HIGH
5. **enableEditFieldsWrapper** (שורה 402, function) - HIGH
6. **disableEditFields** (שורה 427, function) - HIGH
7. **loadTickerInfo** (שורה 449, function) - HIGH
8. **loadTradePlanTickerInfo** (שורה 487, function) - HIGH
9. **displayTickerInfo** (שורה 514, function) - HIGH
10. **displayTradePlanTickerInfo** (שורה 547, function) - HIGH
11. **hideTickerInfo** (שורה 628, function) - HIGH
12. **updateTickerInfo** (שורה 646, function) - HIGH
13. **updateSharesFromAmount** (שורה 684, function) - HIGH
14. **updateAmountFromShares** (שורה 738, function) - HIGH
15. **updateFormFieldsWithTickerData** (שורה 788, function) - HIGH
16. **loadEditTickerInfo** (שורה 866, function) - HIGH
17. **displayEditTickerInfo** (שורה 901, function) - HIGH
18. **hideEditTickerInfo** (שורה 935, function) - HIGH
19. **updateEditFormFieldsWithTickerData** (שורה 952, function) - HIGH
20. **updateEditTickerInfo** (שורה 1042, function) - HIGH
21. **updateEditSharesFromAmount** (שורה 1228, function) - HIGH
22. **updateEditAmountFromShares** (שורה 1256, function) - HIGH
23. **saveEditTradePlan** (שורה 1284, function) - HIGH
24. **reactivateTradePlan** (שורה 1375, function) - HIGH
25. **addEditCondition** (שורה 1445, function) - HIGH
26. **addEditReason** (שורה 1462, function) - HIGH
27. **openCancelTradePlanModal** (שורה 1546, function) - HIGH
28. **cancelTradePlan** (שורה 1580, function) - HIGH
29. **setupPriceCalculation** (שורה 1623, function) - HIGH
30. **setupEditPriceCalculation** (שורה 1717, function) - HIGH
31. **updateDesignsTable** (שורה 1930, function) - HIGH
32. **filterTradePlansData** (שורה 1945, function) - HIGH
33. **updateTradePlansPageSummaryStats** (שורה 2371, function) - HIGH
34. **saveTradePlanData** (שורה 2600, function) - HIGH
35. **saveNewTradePlan** (שורה 2735, function) - HIGH
36. **initializeTradePlanConditionsSystem** (שורה 2760, function) - HIGH
37. **setupSortableHeadersLocal** (שורה 2806, function) - HIGH
38. **restorePlanningSectionState** (שורה 2829, function) - HIGH
39. **filterTradePlansByType** (שורה 2861, function) - HIGH
40. **saveTradePlan** (שורה 2934, function) - HIGH
41. **deleteTradePlan** (שורה 3056, function) - HIGH
42. **performTradePlanDeletion** (שורה 3114, function) - HIGH
43. **hasActiveFilters** (שורה 2053, arrow) - MEDIUM
44. **initializeFormValidation** (שורה 2495, arrow) - MEDIUM
45. **loadTickerInfo** (שורה 449, async-function) - MEDIUM
46. **loadTradePlanTickerInfo** (שורה 487, async-function) - MEDIUM
47. **displayTickerInfo** (שורה 514, async-function) - MEDIUM
48. **updateTickerInfo** (שורה 646, async-function) - MEDIUM
49. **updateFormFieldsWithTickerData** (שורה 788, async-function) - MEDIUM
50. **loadEditTickerInfo** (שורה 866, async-function) - MEDIUM
51. **displayEditTickerInfo** (שורה 901, async-function) - MEDIUM
52. **updateEditFormFieldsWithTickerData** (שורה 952, async-function) - MEDIUM
53. **updateEditTickerInfo** (שורה 1042, async-function) - MEDIUM
54. **saveEditTradePlan** (שורה 1284, async-function) - MEDIUM
55. **reactivateTradePlan** (שורה 1375, async-function) - MEDIUM
56. **cancelTradePlan** (שורה 1580, async-function) - MEDIUM
57. **saveTradePlanData** (שורה 2600, async-function) - MEDIUM
58. **saveNewTradePlan** (שורה 2735, async-function) - MEDIUM
59. **saveTradePlan** (שורה 2934, async-function) - MEDIUM
60. **deleteTradePlan** (שורה 3056, async-function) - MEDIUM
61. **performTradePlanDeletion** (שורה 3114, async-function) - MEDIUM

### cash_flows.js

1. **loadCashFlowsData** (שורה 88, function) - HIGH
2. **calculateBalance** (שורה 152, function) - HIGH
3. **getAccountNameById** (שורה 253, function) - HIGH
4. **ensureTradingAccountsLoaded** (שורה 280, function) - HIGH
5. **loadCashFlows** (שורה 334, function) - HIGH
6. **validateCashFlowForm** (שורה 376, function) - HIGH
7. **validateEditCashFlowForm** (שורה 432, function) - HIGH
8. **deleteCashFlow** (שורה 486, function) - HIGH
9. **performCashFlowDeletion** (שורה 534, function) - HIGH
10. **loadAccountsForCashFlow** (שורה 642, function) - HIGH
11. **loadCurrenciesForCashFlow** (שורה 674, function) - HIGH
12. **renderCashFlowsTable** (שורה 695, function) - HIGH
13. **formatAmount** (שורה 822, function) - HIGH
14. **getCashFlowTypeWithColor** (שורה 849, function) - HIGH
15. **getCashFlowTypeText** (שורה 914, function) - HIGH
16. **formatCashFlowAmount** (שורה 924, function) - HIGH
17. **formatUsdRate** (שורה 952, function) - HIGH
18. **showCashFlowDetails** (שורה 968, function) - HIGH
19. **startAutoRefresh** (שורה 1024, function) - HIGH
20. **applyDynamicColors** (שורה 1055, function) - HIGH
21. **applyUserPreferences** (שורה 1126, function) - HIGH
22. **updateCashFlow** (שורה 1240, function) - HIGH
23. **saveCashFlow** (שורה 1277, function) - HIGH
24. **confirmDeleteCashFlow** (שורה 1424, function) - HIGH
25. **manageExternalIdField** (שורה 1465, function) - HIGH
26. **setupSourceFieldListeners** (שורה 1496, function) - HIGH
27. **initializeExternalIdFields** (שורה 1527, function) - HIGH
28. **editCashFlow** (שורה 1559, function) - HIGH
29. **loadTradesForCashFlow** (שורה 1574, function) - HIGH
30. **loadTradePlansForCashFlow** (שורה 1615, function) - HIGH
31. **generateDetailedLogForCashFlows** (שורה 1899, function) - HIGH
32. **loadCashFlowsData** (שורה 88, async-function) - MEDIUM
33. **ensureTradingAccountsLoaded** (שורה 280, async-function) - MEDIUM
34. **loadCashFlows** (שורה 334, async-function) - MEDIUM
35. **deleteCashFlow** (שורה 486, async-function) - MEDIUM
36. **performCashFlowDeletion** (שורה 534, async-function) - MEDIUM
37. **loadAccountsForCashFlow** (שורה 642, async-function) - MEDIUM
38. **loadCurrenciesForCashFlow** (שורה 674, async-function) - MEDIUM
39. **renderCashFlowsTable** (שורה 695, async-function) - MEDIUM
40. **applyDynamicColors** (שורה 1055, async-function) - MEDIUM
41. **updateCashFlow** (שורה 1240, async-function) - MEDIUM
42. **saveCashFlow** (שורה 1277, async-function) - MEDIUM
43. **loadTradesForCashFlow** (שורה 1574, async-function) - MEDIUM
44. **loadTradePlansForCashFlow** (שורה 1615, async-function) - MEDIUM
45. **generateDetailedLogForCashFlows** (שורה 1899, async-function) - MEDIUM

### research.js

1. **initializeResearchPage** (שורה 52, function) - HIGH
2. **loadResearchData** (שורה 75, function) - HIGH
3. **setupResearchEventListeners** (שורה 97, function) - HIGH
4. **analyzeMarketTrends** (שורה 115, function) - HIGH
5. **compareTickers** (שורה 135, function) - HIGH
6. **technicalAnalysis** (שורה 155, function) - HIGH
7. **getMarketOverview** (שורה 175, function) - HIGH
8. **getVolatilityIndex** (שורה 195, function) - HIGH
9. **getNewsFeed** (שורה 215, function) - HIGH
10. **exportResearchData** (שורה 235, function) - HIGH
11. **generateDetailedLogForResearch** (שורה 350, function) - HIGH
12. **generateDetailedLogForResearch** (שורה 350, async-function) - MEDIUM

### notes.js

1. **downloadFile** (שורה 161, function) - HIGH
2. **openNoteDetails** (שורה 224, function) - HIGH
3. **editNote** (שורה 246, function) - HIGH
4. **deleteNote** (שורה 261, function) - HIGH
5. **restoreNotesSectionState** (שורה 308, function) - HIGH
6. **updateNotesSummary** (שורה 591, function) - HIGH
7. **updateGridFromComponent** (שורה 635, function) - HIGH
8. **onNoteRelationTypeChange** (שורה 808, function) - HIGH
9. **populateEditSelectByType** (שורה 814, function) - HIGH
10. **validateNoteForm** (שורה 886, function) - HIGH
11. **validateEditNoteForm** (שורה 913, function) - HIGH
12. **saveNote** (שורה 974, function) - HIGH
13. **updateNoteFromModal** (שורה 1022, function) - HIGH
14. **confirmDeleteNote** (שורה 1106, function) - HIGH
15. **deleteNoteFromServer** (שורה 1117, function) - HIGH
16. **clearNoteValidationErrors** (שורה 1158, function) - HIGH
17. **getFieldByErrorId** (שורה 1186, function) - HIGH
18. **setupNoteValidationEvents** (שורה 1230, function) - HIGH
19. **clearSelectedFile** (שורה 1373, function) - HIGH
20. **showTickerPage** (שורה 1450, function) - HIGH
21. **formatText** (שורה 1478, function) - HIGH
22. **clearFormatting** (שורה 1560, function) - HIGH
23. **getEditorContent** (שורה 1585, function) - HIGH
24. **setEditorContent** (שורה 1619, function) - HIGH
25. **filterNotesData** (שורה 1660, function) - HIGH
26. **filterNotesByType** (שורה 1692, function) - HIGH
27. **viewNote** (שורה 1786, function) - HIGH
28. **loadNoteForViewing** (שורה 1815, function) - HIGH
29. **getNoteRelatedDisplay** (שורה 1871, function) - HIGH
30. **editCurrentNote** (שורה 1917, function) - HIGH
31. **displayCurrentAttachment** (שורה 1947, function) - HIGH
32. **removeCurrentAttachment** (שורה 2004, function) - HIGH
33. **replaceCurrentAttachment** (שורה 2044, function) - HIGH
34. **insertLink** (שורה 1519, arrow) - MEDIUM
35. **populateEditSelectByType** (שורה 814, async-function) - MEDIUM
36. **saveNote** (שורה 974, async-function) - MEDIUM
37. **updateNoteFromModal** (שורה 1022, async-function) - MEDIUM
38. **confirmDeleteNote** (שורה 1106, async-function) - MEDIUM
39. **deleteNoteFromServer** (שורה 1117, async-function) - MEDIUM
40. **loadNoteForViewing** (שורה 1815, async-function) - MEDIUM

### preferences-page.js

1. **loadAccountsForPreferences** (שורה 59, function) - HIGH
2. **switchActiveProfile** (שורה 104, function) - HIGH
3. **createNewProfile** (שורה 175, function) - HIGH
4. **initializePreferencesPage** (שורה 422, function) - HIGH
5. **loadAccountsForPreferences** (שורה 59, async-function) - MEDIUM
6. **switchActiveProfile** (שורה 104, async-function) - MEDIUM
7. **createNewProfile** (שורה 175, async-function) - MEDIUM

### tickers.js

1. **viewTickerDetailsOld** (שורה 124, function) - HIGH
2. **refreshTickerData** (שורה 184, function) - HIGH
3. **loadCurrenciesData** (שורה 305, function) - HIGH
4. **getCurrencySymbol** (שורה 326, function) - HIGH
5. **getTimeDuration** (שורה 344, function) - HIGH
6. **getTickerTypeStyle** (שורה 369, function) - HIGH
7. **getTickerStatusStyle** (שורה 400, function) - HIGH
8. **getTickerStatusLabel** (שורה 437, function) - HIGH
9. **generateTickerCurrencyOptions** (שורה 454, function) - HIGH
10. **updateCurrencyOptions** (שורה 490, function) - HIGH
11. **updateActiveTradesField** (שורה 520, function) - HIGH
12. **restoreTickersSectionState** (שורה 632, function) - HIGH
13. **checkLinkedItemsAndCancelTicker** (שורה 991, function) - HIGH
14. **performTickerCancellation** (שורה 998, function) - HIGH
15. **checkLinkedItemsBeforeDeleteTicker** (שורה 1088, function) - HIGH
16. **checkLinkedItemsBeforeCancelTicker** (שורה 1096, function) - HIGH
17. **performCancelTicker** (שורה 1168, function) - HIGH
18. **reactivateTicker** (שורה 1295, function) - HIGH
19. **checkLinkedItemsAndDeleteTicker** (שורה 1350, function) - HIGH
20. **performTickerDeletion** (שורה 1357, function) - HIGH
21. **confirmDeleteTicker** (שורה 1493, function) - HIGH
22. **loadTickersData** (שורה 1540, function) - HIGH
23. **loadColorsAndApplyToHeaders** (שורה 1910, function) - HIGH
24. **tryLoadData** (שורה 1991, function) - HIGH
25. **refreshYahooFinanceData** (שורה 2029, function) - HIGH
26. **refreshYahooFinanceDataSilently** (שורה 2065, function) - HIGH
27. **filterTickersByType** (שורה 2096, function) - HIGH
28. **loadCurrenciesData** (שורה 305, async-function) - MEDIUM
29. **updateActiveTradesField** (שורה 520, async-function) - MEDIUM
30. **checkLinkedItemsAndCancelTicker** (שורה 991, async-function) - MEDIUM
31. **performTickerCancellation** (שורה 998, async-function) - MEDIUM
32. **checkLinkedItemsBeforeDeleteTicker** (שורה 1088, async-function) - MEDIUM
33. **checkLinkedItemsBeforeCancelTicker** (שורה 1096, async-function) - MEDIUM
34. **performCancelTicker** (שורה 1168, async-function) - MEDIUM
35. **reactivateTicker** (שורה 1295, async-function) - MEDIUM
36. **checkLinkedItemsAndDeleteTicker** (שורה 1350, async-function) - MEDIUM
37. **performTickerDeletion** (שורה 1357, async-function) - MEDIUM
38. **confirmDeleteTicker** (שורה 1493, async-function) - MEDIUM
39. **loadTickersData** (שורה 1540, async-function) - MEDIUM
40. **loadColorsAndApplyToHeaders** (שורה 1910, async-function) - MEDIUM
41. **refreshYahooFinanceData** (שורה 2029, async-function) - MEDIUM
42. **refreshYahooFinanceDataSilently** (שורה 2065, async-function) - MEDIUM

### trading_accounts.js

1. **loadAllTradingAccountsFromServer** (שורה 399, function) - HIGH
2. **loadDefaultTradingAccounts** (שורה 452, function) - HIGH
3. **isTradingAccountsLoaded** (שורה 472, function) - HIGH
4. **loadTradingAccountsData** (שורה 477, function) - HIGH
5. **updateTradingAccountsTable** (שורה 516, function) - HIGH
6. **updateTradingAccountsSummary** (שורה 624, function) - HIGH
7. **loadTradingAccounts** (שורה 646, function) - HIGH
8. **updateTradingAccountFilterDisplayText** (שורה 687, function) - HIGH
9. **deleteTradingAccountFromAPI** (שורה 881, function) - HIGH
10. **cancelTradingAccount** (שורה 906, function) - HIGH
11. **deleteTradingAccount** (שורה 1057, function) - HIGH
12. **confirmDeleteTradingAccount** (שורה 1167, function) - HIGH
13. **showOpenTradesWarning** (שורה 1183, function) - HIGH
14. **loadTradingAccountsDataForTradingAccountsPage** (שורה 1268, function) - HIGH
15. **filterTradingAccountsLocally** (שורה 1398, function) - HIGH
16. **updateTradingAccountFilterMenu** (שורה 1491, function) - HIGH
17. **restoreTradingAccountsSectionState** (שורה 1542, function) - HIGH
18. **cancelTradingAccountWithLinkedItemsCheck** (שורה 1609, function) - HIGH
19. **deleteTradingAccountWithLinkedItemsCheck** (שורה 1669, function) - HIGH
20. **restoreTradingAccount** (שורה 1729, function) - HIGH
21. **checkLinkedItemsAndCancelTradingAccount** (שורה 1800, function) - HIGH
22. **performTradingAccountCancellation** (שורה 1807, function) - HIGH
23. **checkLinkedItemsAndDeleteTradingAccount** (שורה 1853, function) - HIGH
24. **performTradingAccountDeletion** (שורה 1860, function) - HIGH
25. **checkLinkedItemsBeforeCancelTradingAccount** (שורה 1932, function) - HIGH
26. **checkLinkedItemsBeforeDeleteTradingAccount** (שורה 1940, function) - HIGH
27. **getTradingAccountName** (שורה 1950, function) - HIGH
28. **updateTradingAccount** (שורה 1968, function) - HIGH
29. **viewTradingAccountDetails** (שורה 2029, function) - HIGH
30. **showTradingAccountDetails** (שורה 2090, function) - HIGH
31. **getTradingAccounts** (שורה 2217, function) - HIGH
32. **saveTradingAccount** (שורה 2253, function) - HIGH
33. **deleteTradingAccount** (שורה 2359, function) - HIGH
34. **performTradingAccountDeletion** (שורה 2413, function) - HIGH
35. **loadAllTradingAccountsFromServer** (שורה 399, async-function) - MEDIUM
36. **loadTradingAccountsData** (שורה 477, async-function) - MEDIUM
37. **loadTradingAccounts** (שורה 646, async-function) - MEDIUM
38. **deleteTradingAccountFromAPI** (שורה 881, async-function) - MEDIUM
39. **cancelTradingAccount** (שורה 906, async-function) - MEDIUM
40. **deleteTradingAccount** (שורה 1057, async-function) - MEDIUM
41. **loadTradingAccountsDataForTradingAccountsPage** (שורה 1268, async-function) - MEDIUM
42. **restoreTradingAccountsSectionState** (שורה 1542, async-function) - MEDIUM
43. **cancelTradingAccountWithLinkedItemsCheck** (שורה 1609, async-function) - MEDIUM
44. **deleteTradingAccountWithLinkedItemsCheck** (שורה 1669, async-function) - MEDIUM
45. **restoreTradingAccount** (שורה 1729, async-function) - MEDIUM
46. **checkLinkedItemsAndCancelTradingAccount** (שורה 1800, async-function) - MEDIUM
47. **performTradingAccountCancellation** (שורה 1807, async-function) - MEDIUM
48. **checkLinkedItemsAndDeleteTradingAccount** (שורה 1853, async-function) - MEDIUM
49. **performTradingAccountDeletion** (שורה 1860, async-function) - MEDIUM
50. **checkLinkedItemsBeforeCancelTradingAccount** (שורה 1932, async-function) - MEDIUM
51. **checkLinkedItemsBeforeDeleteTradingAccount** (שורה 1940, async-function) - MEDIUM
52. **saveTradingAccount** (שורה 2253, async-function) - MEDIUM
53. **deleteTradingAccount** (שורה 2359, async-function) - MEDIUM
54. **performTradingAccountDeletion** (שורה 2413, async-function) - MEDIUM

### database.js

1. **initDatabaseDisplay** (שורה 104, function) - HIGH
2. **fetchTableData** (שורה 195, function) - HIGH
3. **updateTableDisplay** (שורה 223, function) - HIGH
4. **createTableBodyHTML** (שורה 279, function) - HIGH
5. **formatCellValue** (שורה 313, function) - HIGH
6. **applySortingFunctionality** (שורה 345, function) - HIGH
7. **updateTableInfo** (שורה 387, function) - HIGH
8. **filterTableData** (שורה 406, function) - HIGH
9. **formatStatus** (שורה 477, function) - HIGH
10. **addRecord** (שורה 511, function) - HIGH
11. **fetchTableData** (שורה 195, async-function) - MEDIUM

### notification-system.js

1. **isPrimarySeverity** (שורה 106, function) - HIGH
2. **isUserInitiatedAction** (שורה 131, function) - HIGH
3. **shouldShowInMode** (שורה 175, function) - HIGH

### logger-service.js

1. **critical** (שורה 8, arrow-method) - MEDIUM
2. **critical** (שורה 672, arrow-method) - MEDIUM

### ui-utils.js

1. **showSecondConfirmationModal** (שורה 641, function) - HIGH
2. **toggleTopSection** (שורה 1414, function) - HIGH
3. **toggleAllSections** (שורה 1527, function) - HIGH

### tables.js

1. **updateSortIconsLocal** (שורה 267, function) - HIGH

### header-system.js

1. **logFilterMenuDiagnostics** (שורה 1565, function) - HIGH
2. **openFilterMenuPortal** (שורה 1609, function) - HIGH
3. **closeFilterMenuPortal** (שורה 1669, function) - HIGH
4. **positionPortal** (שורה 1688, function) - HIGH
5. **closeAllFilterMenus** (שורה 1706, function) - HIGH
6. **updateFilterSelections** (שורה 1739, function) - HIGH
7. **addPortalEventListeners** (שורה 1884, function) - HIGH
8. **updatePortalSelections** (שורה 1943, function) - HIGH
9. **setupHoverBehavior** (שורה 1974, function) - HIGH
10. **normalizeMulti** (שורה 1773, arrow) - MEDIUM
11. **normalizeDate** (שורה 1788, arrow) - MEDIUM
12. **initHeader** (שורה 2516, arrow) - MEDIUM
13. **createFilterSystem** (שורה 2706, method) - HIGH

### page-utils.js

1. **debugSavedFilters** (שורה 222, function) - HIGH
2. **restoreDesignsSectionState** (שורה 246, function) - HIGH
3. **initializePage** (שורה 282, function) - HIGH
4. **savePageState** (שורה 336, function) - HIGH
5. **clearPageState** (שורה 398, function) - HIGH
6. **isPageAvailable** (שורה 422, function) - HIGH
7. **getPageInfo** (שורה 447, function) - HIGH
8. **navigateToPage** (שורה 485, function) - HIGH
9. **isCurrentPage** (שורה 554, function) - HIGH
10. **applySavedFilters** (שורה 570, function) - HIGH
11. **setupFilterEventHandlers** (שורה 586, function) - HIGH
12. **handleHeaderSort** (שורה 604, function) - HIGH
13. **getCurrentTableData** (שורה 639, function) - HIGH
14. **calculateTableStats** (שורה 659, function) - HIGH
15. **updateStatsDisplay** (שורה 682, function) - HIGH
16. **getCurrentPageState** (שורה 697, function) - HIGH
17. **initializeAccountsPage** (שורה 729, function) - HIGH

### translation-utils.js

1. **translateAccountStatus** (שורה 23, function) - HIGH
2. **translateNoteStatus** (שורה 53, function) - HIGH
3. **translateAlertStatus** (שורה 67, function) - HIGH
4. **translateAlertType** (שורה 82, function) - HIGH
5. **translateAlertCondition** (שורה 99, function) - HIGH
6. **translateIsTriggered** (שורה 143, function) - HIGH
7. **translateTradeStatus** (שורה 170, function) - HIGH
8. **translateTestCategory** (שורה 244, function) - HIGH
9. **setLanguage** (שורה 265, function) - HIGH
10. **getCurrentLanguage** (שורה 341, function) - HIGH
11. **updateLanguageDependentElements** (שורה 371, function) - HIGH
12. **initializeLanguageSystem** (שורה 415, function) - HIGH
13. **formatNumberWithCommas** (שורה 490, function) - HIGH
14. **translateExecutionAction** (שורה 635, function) - HIGH
15. **getCurrencyIcon** (שורה 657, function) - HIGH
16. **getTickerCurrencyDisplay** (שורה 678, function) - HIGH
17. **getTickerCurrencySymbol** (שורה 701, function) - HIGH
18. **getCashFlowCurrencyDisplay** (שורה 720, function) - HIGH
19. **translateAlertConditionById** (שורה 745, function) - HIGH
20. **findAlertById** (שורה 839, function) - HIGH
21. **getConditionAttributeOptions** (שורה 858, function) - HIGH
22. **getConditionOperatorOptions** (שורה 871, function) - HIGH

### button-icons.js

1. **getButtonClass** (שורה 81, function) - HIGH

### color-scheme-system.js

1. **lightenColor** (שורה 185, function) - HIGH
2. **getInvestmentTypeBackgroundColor** (שורה 257, function) - HIGH
3. **isWarningModal** (שורה 403, function) - HIGH
4. **setCurrentEntityColorFromPage** (שורה 658, function) - HIGH
5. **findPageClass** (שורה 696, function) - HIGH
6. **getEntityColorFromPreferences** (שורה 721, function) - HIGH
7. **getAllEntityColorVariantsFromPreferences** (שורה 738, function) - HIGH
8. **generateAndApplyEntityCSS** (שורה 852, function) - HIGH
9. **setCurrentEntityColorFromPage** (שורה 658, async-function) - MEDIUM
10. **getEntityColorFromPreferences** (שורה 721, async-function) - MEDIUM
11. **getAllEntityColorVariantsFromPreferences** (שורה 738, async-function) - MEDIUM

### select-populator-service.js

1. **getFilteredTickers** (שורה 548, function) - HIGH
2. **handleRelationTypeChange** (שורה 661, function) - HIGH
3. **handleTickerChange** (שורה 746, function) - HIGH

### pagination-system.js

1. **destroy** (שורה 67, method) - HIGH

### actions-menu-system.js

1. **checkOverflow** (שורה 194, arrow) - MEDIUM

### business-module.js

1. **addInvestmentTypeColorLegend** (שורה 152, function) - HIGH
2. **loadEditTradeModalData** (שורה 772, function) - HIGH
3. **saveEditTradeData** (שורה 1031, function) - HIGH
4. **saveNewTradeRecord** (שורה 1311, function) - HIGH
5. **getCurrentPosition** (שורה 1791, function) - HIGH
6. **checkLinkedItemsBeforeDelete** (שורה 1828, function) - HIGH
7. **filterTradesData** (שורה 2165, function) - HIGH
8. **copyDetailedLog** (שורה 2929, function) - HIGH
9. **loadEditTradeModalData** (שורה 772, async-function) - MEDIUM
10. **saveEditTradeData** (שורה 1031, async-function) - MEDIUM
11. **saveNewTradeRecord** (שורה 1311, async-function) - MEDIUM
12. **checkLinkedItemsBeforeDelete** (שורה 1828, async-function) - MEDIUM
13. **copyDetailedLog** (שורה 2929, async-function) - MEDIUM

### core-systems.js

1. **detectPageInfo** (שורה 715, function) - HIGH
2. **detectAvailableSystems** (שורה 765, function) - HIGH
3. **analyzePageRequirements** (שורה 793, function) - HIGH
4. **determinePageType** (שורה 801, function) - HIGH
5. **requiresFilters** (שורה 812, function) - HIGH
6. **requiresValidation** (שורה 823, function) - HIGH
7. **requiresTables** (שורה 834, function) - HIGH
8. **requiresCharts** (שורה 846, function) - HIGH
9. **initializeCacheSystem** (שורה 853, function) - HIGH
10. **generateNotificationId** (שורה 1177, function) - HIGH
11. **showSimpleErrorNotification** (שורה 1845, function) - HIGH
12. **showFinalSuccessNotification** (שורה 1923, function) - HIGH
13. **showCriticalErrorNotification** (שורה 1990, function) - HIGH
14. **createDetailedErrorMessage** (שורה 2023, function) - HIGH
15. **showFinalSuccessModal** (שורה 2233, function) - HIGH
16. **showFinalSuccessNotificationWithReload** (שורה 2312, function) - HIGH
17. **showFinalSuccessModalWithReload** (שורה 2364, function) - HIGH
18. **showCriticalErrorModal** (שורה 2478, function) - HIGH
19. **createCriticalError** (שורה 2608, function) - HIGH
20. **withCriticalErrorHandling** (שורה 2639, function) - HIGH
21. **showNotificationLegacy** (שורה 2919, function) - HIGH
22. **formatSuccessForCopy** (שורה 3186, function) - HIGH
23. **determinePageType** (שורה 723, arrow) - MEDIUM
24. **requiresFilters** (שורה 729, arrow) - MEDIUM
25. **requiresValidation** (שורה 733, arrow) - MEDIUM
26. **requiresTables** (שורה 737, arrow) - MEDIUM
27. **requiresCharts** (שורה 741, arrow) - MEDIUM
28. **initializeCacheSystem** (שורה 853, async-function) - MEDIUM
29. **showSimpleErrorNotification** (שורה 1845, async-function) - MEDIUM
30. **showFinalSuccessNotification** (שורה 1923, async-function) - MEDIUM
31. **showCriticalErrorNotification** (שורה 1990, async-function) - MEDIUM
32. **showFinalSuccessNotificationWithReload** (שורה 2312, async-function) - MEDIUM
33. **showCriticalErrorModal** (שורה 2478, async-function) - MEDIUM

### data-advanced.js

1. **clearUserPreferencesCache** (שורה 460, function) - HIGH

### data-basic.js

1. **getTableMapping** (שורה 760, function) - HIGH
2. **isTableSupported** (שורה 773, function) - HIGH
3. **getTableConfig** (שורה 784, function) - HIGH
4. **getColumnDefinition** (שורה 935, function) - HIGH
5. **setTableConfig** (שורה 1290, function) - HIGH
6. **setColumnDefinition** (שורה 1318, function) - HIGH
7. **updateSortIcons** (שורה 1744, function) - HIGH

### ui-advanced.js

1. **generateAndApplyStatusCSS** (שורה 281, function) - HIGH
2. **loadStatusColorsFromPreferences** (שורה 310, function) - HIGH
3. **loadInvestmentTypeColorsFromPreferences** (שורה 324, function) - HIGH
4. **getInvestmentTypeBackgroundColorWrapper3** (שורה 558, function) - HIGH
5. **getInvestmentTypeEntityType** (שורה 628, function) - HIGH
6. **createEntityLegend** (שורה 959, function) - HIGH
7. **updateNumericValueColors** (שורה 1240, function) - HIGH
8. **updateEntityColor** (שורה 1270, function) - HIGH
9. **updateEntityColorFromHex** (שורה 1304, function) - HIGH
10. **resetEntityColors** (שורה 1322, function) - HIGH
11. **getContrastColor** (שורה 1411, function) - HIGH
12. **getColorPreferences** (שורה 1461, function) - HIGH
13. **toHex** (שורה 941, arrow) - MEDIUM
14. **ensureVar** (שורה 2185, arrow) - MEDIUM

### date-utils.js

1. **formatDateTime** (שורה 118, function) - HIGH
2. **formatDateOnly** (שורה 147, function) - HIGH
3. **formatLongDate** (שורה 199, function) - HIGH
4. **parseDate** (שורה 254, function) - HIGH
5. **toDate** (שורה 399, function) - HIGH
6. **isPastDate** (שורה 441, function) - HIGH
7. **isFutureDate** (שורה 463, function) - HIGH
8. **daysDifference** (שורה 488, function) - HIGH
9. **addDays** (שורה 516, function) - HIGH
10. **addMonths** (שורה 540, function) - HIGH
11. **initializeDateUtils** (שורה 577, function) - HIGH

### data-utils.js

1. **isNumeric** (שורה 25, function) - HIGH

### preferences-ui.js

1. **showDefaultProfileWarning** (שורה 1551, function) - HIGH
2. **hideDefaultProfileWarning** (שורה 1577, function) - HIGH

### validation-utils.js

1. **showFieldSuccess** (שורה 160, function) - HIGH
2. **validateEmailField** (שורה 362, function) - HIGH
3. **validateCurrencySymbol** (שורה 563, function) - HIGH
4. **validateCurrencyRate** (שורה 573, function) - HIGH
5. **validateTickerSymbol** (שורה 584, function) - HIGH
6. **validateDateRange** (שורה 600, function) - HIGH
7. **validateWithConfirmation** (שורה 660, function) - HIGH
8. **validateWithConfirmation** (שורה 660, async-function) - MEDIUM

### account-service.js

1. **getAccounts** (שורה 74, function) - HIGH
2. **getActiveAccounts** (שורה 101, function) - HIGH
3. **getAccountsByStatus** (שורה 118, function) - HIGH
4. **cancelAccount** (שורה 135, function) - HIGH
5. **reactivateAccount** (שורה 167, function) - HIGH
6. **getAccountById** (שורה 199, function) - HIGH
7. **isAccountsLoaded** (שורה 234, function) - HIGH
8. **getAccounts** (שורה 74, async-function) - MEDIUM
9. **getActiveAccounts** (שורה 101, async-function) - MEDIUM
10. **getAccountsByStatus** (שורה 118, async-function) - MEDIUM
11. **cancelAccount** (שורה 135, async-function) - MEDIUM
12. **reactivateAccount** (שורה 167, async-function) - MEDIUM
13. **getAccountById** (שורה 199, async-function) - MEDIUM

### alert-service.js

1. **isAlertActive** (שורה 174, function) - HIGH
2. **isAlertTriggered** (שורה 191, function) - HIGH
3. **canAlertBeCancelled** (שורה 208, function) - HIGH
4. **formatAlertCondition** (שורה 255, function) - HIGH
5. **cancelAlert** (שורה 362, function) - HIGH
6. **performAlertDeletion** (שורה 466, function) - HIGH
7. **updateMultipleAlertsStatus** (שורה 582, function) - HIGH
8. **cancelAlert** (שורה 362, async-function) - MEDIUM
9. **performAlertDeletion** (שורה 466, async-function) - MEDIUM
10. **updateMultipleAlertsStatus** (שורה 582, async-function) - MEDIUM

### ticker-service.js

1. **isCacheValid** (שורה 51, function) - HIGH
2. **getTrades** (שורה 116, function) - HIGH
3. **loadCache** (שורה 171, function) - HIGH
4. **getTickersWithTrades** (שורה 209, function) - HIGH
5. **getTickersWithPlans** (שורה 244, function) - HIGH
6. **getRelevantTickers** (שורה 285, function) - HIGH
7. **getTickersByType** (שורה 388, function) - HIGH
8. **getTickersByActivity** (שורה 423, function) - HIGH
9. **getTrades** (שורה 116, async-function) - MEDIUM
10. **loadCache** (שורה 171, async-function) - MEDIUM
11. **getTickersWithTrades** (שורה 209, async-function) - MEDIUM
12. **getTickersWithPlans** (שורה 244, async-function) - MEDIUM
13. **getRelevantTickers** (שורה 285, async-function) - MEDIUM
14. **getTickersByType** (שורה 388, async-function) - MEDIUM
15. **getTickersByActivity** (שורה 423, async-function) - MEDIUM

### trade-plan-service.js

1. **isTradePlansLoaded** (שורה 125, function) - HIGH
2. **formatTradePlanStatus** (שורה 138, function) - HIGH
3. **parseTradePlanStatus** (שורה 157, function) - HIGH
4. **getTradePlanById** (שורה 176, function) - HIGH
5. **getTradePlansByStatus** (שורה 189, function) - HIGH
6. **getTradePlansByInvestmentType** (שורה 202, function) - HIGH
7. **getTradePlansByAccount** (שורה 215, function) - HIGH
8. **getTradePlansByTicker** (שורה 228, function) - HIGH
9. **searchTradePlans** (שורה 241, function) - HIGH
10. **getDemoTradePlansData** (שורה 315, function) - HIGH

### constraints.js

1. **showValidationModal** (שורה 764, function) - HIGH
2. **startValidation** (שורה 827, function) - HIGH
3. **performRealValidation** (שורה 878, function) - HIGH
4. **checkDatabaseConstraint** (שורה 938, function) - HIGH
5. **checkDataViolations** (שורה 953, function) - HIGH
6. **validateConstraintData** (שורה 989, function) - HIGH
7. **validateNotNullConstraint** (שורה 1034, function) - HIGH
8. **validateUniqueConstraint** (שורה 1043, function) - HIGH
9. **validateCheckConstraint** (שורה 1052, function) - HIGH
10. **validateEnumConstraint** (שורה 1061, function) - HIGH
11. **validateForeignKeyConstraint** (שורה 1070, function) - HIGH
12. **validateRangeConstraint** (שורה 1079, function) - HIGH
13. **checkUIValidation** (שורה 1090, function) - HIGH
14. **validateSingleConstraint** (שורה 1105, function) - HIGH
15. **displayValidationResults** (שורה 1116, function) - HIGH
16. **validateNext** (שורה 837, arrow) - MEDIUM
17. **performRealValidation** (שורה 878, async-function) - MEDIUM
18. **checkDatabaseConstraint** (שורה 938, async-function) - MEDIUM
19. **checkDataViolations** (שורה 953, async-function) - MEDIUM
20. **validateConstraintData** (שורה 989, async-function) - MEDIUM
21. **validateNotNullConstraint** (שורה 1034, async-function) - MEDIUM
22. **validateUniqueConstraint** (שורה 1043, async-function) - MEDIUM
23. **validateCheckConstraint** (שורה 1052, async-function) - MEDIUM
24. **validateEnumConstraint** (שורה 1061, async-function) - MEDIUM
25. **validateForeignKeyConstraint** (שורה 1070, async-function) - MEDIUM
26. **validateRangeConstraint** (שורה 1079, async-function) - MEDIUM
27. **checkUIValidation** (שורה 1090, async-function) - MEDIUM
28. **validateSingleConstraint** (שורה 1105, async-function) - MEDIUM

### linked-items.js

1. **createLinkedItemsModalContent** (שורה 270, function) - HIGH
2. **createLinkedItemsList** (שורה 557, function) - HIGH
3. **getRulesExplanation** (שורה 619, function) - HIGH
4. **getTradePlanDetails** (שורה 802, function) - HIGH
5. **getItemTypeIcon** (שורה 885, function) - HIGH
6. **createBasicItemInfo** (שורה 937, function) - HIGH
7. **createModal** (שורה 954, function) - HIGH
8. **createDetailedItemInfo** (שורה 992, function) - HIGH
9. **createTradeDetails** (שורה 1039, function) - HIGH
10. **createAccountDetails** (שורה 1063, function) - HIGH
11. **createTickerDetails** (שורה 1076, function) - HIGH
12. **createAlertDetails** (שורה 1100, function) - HIGH
13. **createCashFlowDetails** (שורה 1141, function) - HIGH
14. **createNoteDetails** (שורה 1163, function) - HIGH
15. **createTradePlanDetails** (שורה 1180, function) - HIGH
16. **createExecutionDetails** (שורה 1194, function) - HIGH
17. **exportLinkedItemsData** (שורה 1235, function) - HIGH
18. **createCSVFromLinkedItems** (שורה 1274, function) - HIGH
19. **downloadCSV** (שורה 1336, function) - HIGH
20. **viewItemDetails** (שורה 1359, function) - HIGH
21. **editItem** (שורה 1372, function) - HIGH
22. **deleteItem** (שורה 1385, function) - HIGH
23. **openItemPage** (שורה 1398, function) - HIGH
24. **viewLinkedItemsForAccount** (שורה 1426, function) - HIGH
25. **viewLinkedItemsForCashFlow** (שורה 1450, function) - HIGH
26. **getTypeBadgeClass** (שורה 1490, function) - HIGH
27. **getStatusBadge** (שורה 1512, function) - HIGH
28. **getRelatedObjectTypeName** (שורה 1735, function) - HIGH
29. **getRelatedObjectTypeNameHebrew** (שורה 1751, function) - HIGH

### related-object-filters.js

1. **filterByRelatedObjectType** (שורה 26, function) - HIGH
2. **filterNotesByRelatedObjectType** (שורה 109, function) - HIGH
3. **createRelatedObjectFilter** (שורה 134, function) - HIGH
4. **initializeRelatedObjectFilters** (שורה 163, function) - HIGH

### external-data-settings-service.js

1. **handleResponse** (שורה 27, function) - HIGH
2. **getSettings** (שורה 49, function) - HIGH
3. **handleResponse** (שורה 27, async-function) - MEDIUM
4. **getSettings** (שורה 49, async-function) - MEDIUM

## 2. פונקציות כפולות בתוך קובץ (314)

### 1. index.js - createTradesStatusChart

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 145 (function)
  2. שורה 145 (async-function)

### 2. index.js - createPerformanceChart

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 188 (function)
  2. שורה 188 (async-function)

### 3. index.js - createAccountChart

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 229 (function)
  2. שורה 229 (async-function)

### 4. index.js - createMixedChart

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 270 (function)
  2. שורה 270 (async-function)

### 5. index.js - refreshAllCharts

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 379 (function)
  2. שורה 379 (async-function)

### 6. index.js - refreshChart

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 403 (function)
  2. שורה 403 (async-function)

### 7. index.js - exportChart

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 438 (function)
  2. שורה 438 (async-function)

### 8. index.js - exportAllCharts

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 462 (function)
  2. שורה 462 (async-function)

### 9. index.js - copyDetailedLogLocal

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 715 (function)
  2. שורה 715 (async-function)

### 10. trades.js - loadTradesData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 295 (function)
  2. שורה 295 (async-function)

### 11. trades.js - if

- **כמות כפילויות**: 3
- **מיקומים**:
  1. שורה 368 (function)
  2. שורה 481 (function)
  3. שורה 2115 (function)

### 12. trades.js - loadTradeTickerInfo

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 417 (function)
  2. שורה 417 (async-function)

### 13. trades.js - loadTickerDataForTrades

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 522 (function)
  2. שורה 522 (async-function)

### 14. trades.js - updateTradesTable

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 562 (function)
  2. שורה 562 (async-function)

### 15. trades.js - loadTradePlanDates

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 761 (function)
  2. שורה 761 (async-function)

### 16. trades.js - cancelTradeRecord

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 909 (function)
  2. שורה 909 (async-function)

### 17. trades.js - checkLinkedItemsAndCancel

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 996 (function)
  2. שורה 996 (async-function)

### 18. trades.js - performTradeCancellation

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1010 (function)
  2. שורה 1010 (async-function)

### 19. trades.js - deleteTradeRecord

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1042 (function)
  2. שורה 1042 (async-function)

### 20. trades.js - performTradeDeletion

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1148 (function)
  2. שורה 1148 (async-function)

### 21. trades.js - initializeTradesPage

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1826 (function)
  2. שורה 1826 (async-function)

### 22. trades.js - refreshPositions

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1855 (function)
  2. שורה 1855 (async-function)

### 23. trades.js - validateTradePlanChange

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2269 (function)
  2. שורה 2269 (async-function)

### 24. trades.js - validateTradeChanges

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2329 (function)
  2. שורה 2329 (async-function)

### 25. trades.js - applyStatusFilterToTrades

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2395 (function)
  2. שורה 2395 (async-function)

### 26. trades.js - validateTickerChange

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2450 (function)
  2. שורה 2450 (async-function)

### 27. trades.js - validateTradePlanDate

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2560 (function)
  2. שורה 2560 (async-function)

### 28. trades.js - updateEditTradeTickerFromPlan

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2599 (function)
  2. שורה 2599 (async-function)

### 29. trades.js - updateEditTradePriceFromTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2679 (function)
  2. שורה 2679 (async-function)

### 30. trades.js - reactivateTrade

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2728 (function)
  2. שורה 2728 (async-function)

### 31. trades.js - generateDetailedLogForTrades

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3094 (function)
  2. שורה 3094 (async-function)

### 32. trades.js - saveTrade

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3143 (function)
  2. שורה 3143 (async-function)

### 33. trades.js - deleteTrade

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3245 (function)
  2. שורה 3245 (async-function)

### 34. executions.js - fillEditExecutionForm

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 299 (function)
  2. שורה 299 (async-function)

### 35. executions.js - updateExecutionWrapper

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 581 (function)
  2. שורה 581 (async-function)

### 36. executions.js - loadExecutionsData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1024 (function)
  2. שורה 1024 (async-function)

### 37. executions.js - updateExecutionsTableMain

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1083 (function)
  2. שורה 1083 (async-function)

### 38. executions.js - loadTickersWithOpenOrClosedTradesAndPlans

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1707 (function)
  2. שורה 1707 (async-function)

### 39. executions.js - loadActiveTradesForTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1784 (function)
  2. שורה 1784 (async-function)

### 40. executions.js - updateTradesOnCheckboxChange

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1934 (function)
  2. שורה 1934 (async-function)

### 41. executions.js - updateTradesOnTickerChange

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1970 (function)
  2. שורה 1970 (async-function)

### 42. executions.js - loadExecutionTickerInfo

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2171 (function)
  2. שורה 2171 (async-function)

### 43. executions.js - loadTickersSummaryData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3007 (function)
  2. שורה 3007 (async-function)

### 44. executions.js - refreshTickersSummary

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3154 (function)
  2. שורה 3154 (async-function)

### 45. executions.js - updateTickersList

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3242 (function)
  2. שורה 3242 (async-function)

### 46. executions.js - deleteExecution

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3332 (function)
  2. שורה 3332 (async-function)

### 47. executions.js - performExecutionDeletion

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3379 (function)
  2. שורה 3379 (async-function)

### 48. alerts.js - loadAlertsData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 355 (function)
  2. שורה 355 (async-function)

### 49. alerts.js - updatePageSummaryStats_LEGACY

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 711 (function)
  2. שורה 711 (async-function)

### 50. alerts.js - if

- **כמות כפילויות**: 3
- **מיקומים**:
  1. שורה 718 (function)
  2. שורה 2354 (function)
  3. שורה 3105 (function)

### 51. alerts.js - loadModalData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 758 (function)
  2. שורה 758 (async-function)

### 52. alerts.js - saveAlert

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1239 (function)
  2. שורה 1239 (async-function)

### 53. alerts.js - updateAlert

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1547 (function)
  2. שורה 1547 (async-function)

### 54. alerts.js - deleteAlertInternal

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1707 (function)
  2. שורה 1707 (async-function)

### 55. alerts.js - confirmDeleteAlert

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1740 (function)
  2. שורה 1740 (async-function)

### 56. alerts.js - reactivateAlert

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2022 (function)
  2. שורה 2022 (async-function)

### 57. alerts.js - saveAlertData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2352 (function)
  2. שורה 2352 (async-function)

### 58. alerts.js - generateDetailedLogForAlerts

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2468 (function)
  2. שורה 2468 (async-function)

### 59. alerts.js - loadTradePlansForConditions

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2521 (function)
  2. שורה 2521 (async-function)

### 60. alerts.js - loadTradesForConditions

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2548 (function)
  2. שורה 2548 (async-function)

### 61. alerts.js - loadConditionsFromItem

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2575 (function)
  2. שורה 2575 (async-function)

### 62. alerts.js - createAlertFromCondition

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2665 (function)
  2. שורה 2665 (async-function)

### 63. alerts.js - evaluateAllConditions

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2788 (function)
  2. שורה 2788 (async-function)

### 64. alerts.js - refreshConditionEvaluations

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2827 (function)
  2. שורה 2827 (async-function)

### 65. alerts.js - loadAlertTickerInfo

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3041 (function)
  2. שורה 3041 (async-function)

### 66. trade_plans.js - loadTickerInfo

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 449 (function)
  2. שורה 449 (async-function)

### 67. trade_plans.js - loadTradePlanTickerInfo

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 487 (function)
  2. שורה 487 (async-function)

### 68. trade_plans.js - displayTickerInfo

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 514 (function)
  2. שורה 514 (async-function)

### 69. trade_plans.js - if

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 581 (function)
  2. שורה 1859 (function)

### 70. trade_plans.js - updateTickerInfo

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 646 (function)
  2. שורה 646 (async-function)

### 71. trade_plans.js - updateFormFieldsWithTickerData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 788 (function)
  2. שורה 788 (async-function)

### 72. trade_plans.js - loadEditTickerInfo

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 866 (function)
  2. שורה 866 (async-function)

### 73. trade_plans.js - displayEditTickerInfo

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 901 (function)
  2. שורה 901 (async-function)

### 74. trade_plans.js - updateEditFormFieldsWithTickerData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 952 (function)
  2. שורה 952 (async-function)

### 75. trade_plans.js - updateEditTickerInfo

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1042 (function)
  2. שורה 1042 (async-function)

### 76. trade_plans.js - saveEditTradePlan

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1284 (function)
  2. שורה 1284 (async-function)

### 77. trade_plans.js - checkLinkedItemsBeforeCancel

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1368 (function)
  2. שורה 1368 (async-function)

### 78. trade_plans.js - reactivateTradePlan

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1375 (function)
  2. שורה 1375 (async-function)

### 79. trade_plans.js - cancelTradePlan

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1580 (function)
  2. שורה 1580 (async-function)

### 80. trade_plans.js - loadTradePlansData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1876 (function)
  2. שורה 1876 (async-function)

### 81. trade_plans.js - saveTradePlanData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2600 (function)
  2. שורה 2600 (async-function)

### 82. trade_plans.js - saveNewTradePlan

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2735 (function)
  2. שורה 2735 (async-function)

### 83. trade_plans.js - saveTradePlan

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2934 (function)
  2. שורה 2934 (async-function)

### 84. trade_plans.js - deleteTradePlan

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3056 (function)
  2. שורה 3056 (async-function)

### 85. trade_plans.js - performTradePlanDeletion

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3114 (function)
  2. שורה 3114 (async-function)

### 86. trade_plans.js - updatePricesFromPercentages

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1638 (arrow)
  2. שורה 1732 (arrow)

### 87. trade_plans.js - updatePercentagesFromPrices

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1660 (arrow)
  2. שורה 1754 (arrow)

### 88. cash_flows.js - loadCashFlowsData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 88 (function)
  2. שורה 88 (async-function)

### 89. cash_flows.js - ensureTradingAccountsLoaded

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 280 (function)
  2. שורה 280 (async-function)

### 90. cash_flows.js - loadCashFlows

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 334 (function)
  2. שורה 334 (async-function)

### 91. cash_flows.js - deleteCashFlow

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 486 (function)
  2. שורה 486 (async-function)

### 92. cash_flows.js - performCashFlowDeletion

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 534 (function)
  2. שורה 534 (async-function)

### 93. cash_flows.js - loadAccountsForCashFlow

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 642 (function)
  2. שורה 642 (async-function)

### 94. cash_flows.js - loadCurrenciesForCashFlow

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 674 (function)
  2. שורה 674 (async-function)

### 95. cash_flows.js - renderCashFlowsTable

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 695 (function)
  2. שורה 695 (async-function)

### 96. cash_flows.js - updateCashFlowsTable

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 992 (function)
  2. שורה 992 (async-function)

### 97. cash_flows.js - applyDynamicColors

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1055 (function)
  2. שורה 1055 (async-function)

### 98. cash_flows.js - initializeCashFlowsPage

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1176 (function)
  2. שורה 1176 (async-function)

### 99. cash_flows.js - updateCashFlow

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1240 (function)
  2. שורה 1240 (async-function)

### 100. cash_flows.js - saveCashFlow

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1277 (function)
  2. שורה 1277 (async-function)

### 101. cash_flows.js - loadTradesForCashFlow

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1574 (function)
  2. שורה 1574 (async-function)

### 102. cash_flows.js - loadTradePlansForCashFlow

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1615 (function)
  2. שורה 1615 (async-function)

### 103. cash_flows.js - generateDetailedLogForCashFlows

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1899 (function)
  2. שורה 1899 (async-function)

### 104. cash_flows.js - validation

- **כמות כפילויות**: 4
- **מיקומים**:
  1. שורה 383 (arrow-method)
  2. שורה 394 (arrow-method)
  3. שורה 439 (arrow-method)
  4. שורה 450 (arrow-method)

### 105. research.js - generateDetailedLogForResearch

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 350 (function)
  2. שורה 350 (async-function)

### 106. notes.js - populateEditSelectByType

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 814 (function)
  2. שורה 814 (async-function)

### 107. notes.js - saveNote

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 974 (function)
  2. שורה 974 (async-function)

### 108. notes.js - updateNoteFromModal

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1022 (function)
  2. שורה 1022 (async-function)

### 109. notes.js - confirmDeleteNote

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1106 (function)
  2. שורה 1106 (async-function)

### 110. notes.js - deleteNoteFromServer

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1117 (function)
  2. שורה 1117 (async-function)

### 111. notes.js - loadNoteForViewing

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1815 (function)
  2. שורה 1815 (async-function)

### 112. preferences-page.js - loadAccountsForPreferences

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 59 (function)
  2. שורה 59 (async-function)

### 113. preferences-page.js - switchActiveProfile

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 104 (function)
  2. שורה 104 (async-function)

### 114. preferences-page.js - createNewProfile

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 175 (function)
  2. שורה 175 (async-function)

### 115. preferences-page.js - copyDetailedLogLocal

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 340 (function)
  2. שורה 340 (async-function)

### 116. tickers.js - loadCurrenciesData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 305 (function)
  2. שורה 305 (async-function)

### 117. tickers.js - updateActiveTradesField

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 520 (function)
  2. שורה 520 (async-function)

### 118. tickers.js - updateTickerActiveTradesStatus

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 562 (function)
  2. שורה 562 (async-function)

### 119. tickers.js - updateAllActiveTradesStatuses

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 594 (function)
  2. שורה 594 (async-function)

### 120. tickers.js - saveTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 691 (function)
  2. שורה 691 (async-function)

### 121. tickers.js - updateTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 774 (function)
  2. שורה 774 (async-function)

### 122. tickers.js - cancelTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 928 (function)
  2. שורה 928 (async-function)

### 123. tickers.js - checkLinkedItemsAndCancelTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 991 (function)
  2. שורה 991 (async-function)

### 124. tickers.js - performTickerCancellation

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 998 (function)
  2. שורה 998 (async-function)

### 125. tickers.js - checkLinkedItemsBeforeDeleteTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1088 (function)
  2. שורה 1088 (async-function)

### 126. tickers.js - checkLinkedItemsBeforeCancelTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1096 (function)
  2. שורה 1096 (async-function)

### 127. tickers.js - updateAllTickerStatuses

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1123 (function)
  2. שורה 1123 (async-function)

### 128. tickers.js - performCancelTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1168 (function)
  2. שורה 1168 (async-function)

### 129. tickers.js - reactivateTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1295 (function)
  2. שורה 1295 (async-function)

### 130. tickers.js - checkLinkedItemsAndDeleteTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1350 (function)
  2. שורה 1350 (async-function)

### 131. tickers.js - performTickerDeletion

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1357 (function)
  2. שורה 1357 (async-function)

### 132. tickers.js - deleteTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1436 (function)
  2. שורה 1436 (async-function)

### 133. tickers.js - confirmDeleteTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1493 (function)
  2. שורה 1493 (async-function)

### 134. tickers.js - loadTickersData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1540 (function)
  2. שורה 1540 (async-function)

### 135. tickers.js - loadColorsAndApplyToHeaders

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1910 (function)
  2. שורה 1910 (async-function)

### 136. tickers.js - refreshYahooFinanceData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2029 (function)
  2. שורה 2029 (async-function)

### 137. tickers.js - refreshYahooFinanceDataSilently

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2065 (function)
  2. שורה 2065 (async-function)

### 138. tickers.js - onSuccess

- **כמות כפילויות**: 3
- **מיקומים**:
  1. שורה 1014 (arrow-method)
  2. שורה 1322 (arrow-method)
  3. שורה 1371 (arrow-method)

### 139. trading_accounts.js - loadCurrenciesFromServer

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 246 (function)
  2. שורה 246 (async-function)

### 140. trading_accounts.js - generateCurrencyOptions

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 321 (function)
  2. שורה 321 (async-function)

### 141. trading_accounts.js - loadTradingAccountsFromServer

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 337 (function)
  2. שורה 337 (async-function)

### 142. trading_accounts.js - loadAllTradingAccountsFromServer

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 399 (function)
  2. שורה 399 (async-function)

### 143. trading_accounts.js - loadTradingAccountsData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 477 (function)
  2. שורה 477 (async-function)

### 144. trading_accounts.js - loadTradingAccounts

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 646 (function)
  2. שורה 646 (async-function)

### 145. trading_accounts.js - deleteTradingAccountFromAPI

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 881 (function)
  2. שורה 881 (async-function)

### 146. trading_accounts.js - cancelTradingAccount

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 906 (function)
  2. שורה 906 (async-function)

### 147. trading_accounts.js - deleteTradingAccount

- **כמות כפילויות**: 4
- **מיקומים**:
  1. שורה 1057 (function)
  2. שורה 2359 (function)
  3. שורה 1057 (async-function)
  4. שורה 2359 (async-function)

### 148. trading_accounts.js - loadTradingAccountsDataForTradingAccountsPage

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1268 (function)
  2. שורה 1268 (async-function)

### 149. trading_accounts.js - restoreTradingAccountsSectionState

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1542 (function)
  2. שורה 1542 (async-function)

### 150. trading_accounts.js - cancelTradingAccountWithLinkedItemsCheck

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1609 (function)
  2. שורה 1609 (async-function)

### 151. trading_accounts.js - deleteTradingAccountWithLinkedItemsCheck

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1669 (function)
  2. שורה 1669 (async-function)

### 152. trading_accounts.js - restoreTradingAccount

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1729 (function)
  2. שורה 1729 (async-function)

### 153. trading_accounts.js - checkLinkedItemsAndCancelTradingAccount

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1800 (function)
  2. שורה 1800 (async-function)

### 154. trading_accounts.js - performTradingAccountCancellation

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1807 (function)
  2. שורה 1807 (async-function)

### 155. trading_accounts.js - checkLinkedItemsAndDeleteTradingAccount

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1853 (function)
  2. שורה 1853 (async-function)

### 156. trading_accounts.js - performTradingAccountDeletion

- **כמות כפילויות**: 4
- **מיקומים**:
  1. שורה 1860 (function)
  2. שורה 2413 (function)
  3. שורה 1860 (async-function)
  4. שורה 2413 (async-function)

### 157. trading_accounts.js - checkLinkedItemsBeforeCancelTradingAccount

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1932 (function)
  2. שורה 1932 (async-function)

### 158. trading_accounts.js - checkLinkedItemsBeforeDeleteTradingAccount

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1940 (function)
  2. שורה 1940 (async-function)

### 159. trading_accounts.js - saveTradingAccount

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2253 (function)
  2. שורה 2253 (async-function)

### 160. database.js - loadTableData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 161 (function)
  2. שורה 161 (async-function)

### 161. database.js - fetchTableData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 195 (function)
  2. שורה 195 (async-function)

### 162. notification-system.js - createAlert

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 217 (function)
  2. שורה 217 (async-function)

### 163. notification-system.js - updateNotificationHistory

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 245 (function)
  2. שורה 245 (async-function)

### 164. notification-system.js - shouldShowNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 350 (function)
  2. שורה 350 (async-function)

### 165. notification-system.js - shouldLogToConsole

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 426 (function)
  2. שורה 426 (async-function)

### 166. notification-system.js - logWithCategory

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 446 (function)
  2. שורה 446 (async-function)

### 167. notification-system.js - showNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 481 (function)
  2. שורה 481 (async-function)

### 168. notification-system.js - loadLinkedItemsData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 796 (function)
  2. שורה 796 (async-function)

### 169. notification-system.js - showSuccessNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 902 (function)
  2. שורה 902 (async-function)

### 170. notification-system.js - showErrorNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 920 (function)
  2. שורה 920 (async-function)

### 171. notification-system.js - showWarningNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 934 (function)
  2. שורה 934 (async-function)

### 172. notification-system.js - showInfoNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 948 (function)
  2. שורה 948 (async-function)

### 173. notification-system.js - showDetailsModal

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 961 (function)
  2. שורה 961 (async-function)

### 174. notification-system.js - saveNotificationToGlobalHistory

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1180 (function)
  2. שורה 1180 (async-function)

### 175. notification-system.js - updateGlobalNotificationStats

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1242 (function)
  2. שורה 1242 (async-function)

### 176. notification-system.js - loadGlobalNotificationHistory

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1321 (function)
  2. שורה 1321 (async-function)

### 177. notification-system.js - loadGlobalNotificationStats

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1351 (function)
  2. שורה 1351 (async-function)

### 178. logger-service.js - info

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 4 (arrow-method)
  2. שורה 668 (arrow-method)

### 179. logger-service.js - error

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 5 (arrow-method)
  2. שורה 669 (arrow-method)

### 180. logger-service.js - warn

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 6 (arrow-method)
  2. שורה 670 (arrow-method)

### 181. logger-service.js - debug

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 7 (arrow-method)
  2. שורה 671 (arrow-method)

### 182. logger-service.js - critical

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 8 (arrow-method)
  2. שורה 672 (arrow-method)

### 183. ui-utils.js - cancelItem

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 361 (function)
  2. שורה 361 (async-function)

### 184. ui-utils.js - performItemCancellation

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 419 (function)
  2. שורה 419 (async-function)

### 185. ui-utils.js - enhancedTableRefresh

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 669 (function)
  2. שורה 669 (async-function)

### 186. ui-utils.js - handleApiResponseWithRefresh

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 707 (function)
  2. שורה 707 (async-function)

### 187. ui-utils.js - autoRefreshCurrentPage

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 827 (function)
  2. שורה 827 (async-function)

### 188. color-scheme-system.js - loadDynamicColors

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 638 (function)
  2. שורה 638 (async-function)

### 189. color-scheme-system.js - setCurrentEntityColorFromPage

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 658 (function)
  2. שורה 658 (async-function)

### 190. color-scheme-system.js - getEntityColorFromPreferences

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 721 (function)
  2. שורה 721 (async-function)

### 191. color-scheme-system.js - getAllEntityColorVariantsFromPreferences

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 738 (function)
  2. שורה 738 (async-function)

### 192. color-scheme-system.js - loadColorPreferences

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 872 (function)
  2. שורה 872 (async-function)

### 193. business-module.js - loadTradesData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 267 (function)
  2. שורה 267 (async-function)

### 194. business-module.js - cancelTradeRecord

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 509 (function)
  2. שורה 509 (async-function)

### 195. business-module.js - checkLinkedItemsAndCancel

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 595 (function)
  2. שורה 595 (async-function)

### 196. business-module.js - performTradeCancellation

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 621 (function)
  2. שורה 621 (async-function)

### 197. business-module.js - deleteTradeRecord

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 653 (function)
  2. שורה 653 (async-function)

### 198. business-module.js - performTradeDeletion

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 720 (function)
  2. שורה 720 (async-function)

### 199. business-module.js - loadEditTradeModalData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 772 (function)
  2. שורה 772 (async-function)

### 200. business-module.js - saveEditTradeData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1031 (function)
  2. שורה 1031 (async-function)

### 201. business-module.js - saveNewTradeRecord

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1311 (function)
  2. שורה 1311 (async-function)

### 202. business-module.js - loadModalData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1414 (function)
  2. שורה 1414 (async-function)

### 203. business-module.js - updateTickerFromTradePlan

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1518 (function)
  2. שורה 1518 (async-function)

### 204. business-module.js - checkLinkedItemsBeforeDelete

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1828 (function)
  2. שורה 1828 (async-function)

### 205. business-module.js - checkLinkedItemsBeforeCancel

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1870 (function)
  2. שורה 1870 (async-function)

### 206. business-module.js - loadTradePlanDates

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2133 (function)
  2. שורה 2133 (async-function)

### 207. business-module.js - validateTradePlanChange

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2209 (function)
  2. שורה 2209 (async-function)

### 208. business-module.js - validateTradeChanges

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2269 (function)
  2. שורה 2269 (async-function)

### 209. business-module.js - validateTickerChange

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2378 (function)
  2. שורה 2378 (async-function)

### 210. business-module.js - validateTradePlanDate

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2483 (function)
  2. שורה 2483 (async-function)

### 211. business-module.js - updateEditTradeTickerFromPlan

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2522 (function)
  2. שורה 2522 (async-function)

### 212. business-module.js - updateEditTradePriceFromTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2598 (function)
  2. שורה 2598 (async-function)

### 213. business-module.js - reactivateTrade

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2643 (function)
  2. שורה 2643 (async-function)

### 214. business-module.js - copyDetailedLog

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2929 (function)
  2. שורה 2929 (async-function)

### 215. core-systems.js - determinePageType

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 801 (function)
  2. שורה 723 (arrow)

### 216. core-systems.js - requiresFilters

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 812 (function)
  2. שורה 729 (arrow)

### 217. core-systems.js - requiresValidation

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 823 (function)
  2. שורה 733 (arrow)

### 218. core-systems.js - requiresTables

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 834 (function)
  2. שורה 737 (arrow)

### 219. core-systems.js - requiresCharts

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 846 (function)
  2. שורה 741 (arrow)

### 220. core-systems.js - initializeCacheSystem

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 853 (function)
  2. שורה 853 (async-function)

### 221. core-systems.js - createAlert

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1199 (function)
  2. שורה 1199 (async-function)

### 222. core-systems.js - updateNotificationHistory

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1227 (function)
  2. שורה 1227 (async-function)

### 223. core-systems.js - shouldShowNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1332 (function)
  2. שורה 1332 (async-function)

### 224. core-systems.js - shouldLogToConsole

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1378 (function)
  2. שורה 1378 (async-function)

### 225. core-systems.js - logWithCategory

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1398 (function)
  2. שורה 1398 (async-function)

### 226. core-systems.js - showNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1433 (function)
  2. שורה 1433 (async-function)

### 227. core-systems.js - loadLinkedItemsData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1728 (function)
  2. שורה 1728 (async-function)

### 228. core-systems.js - showSuccessNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1790 (function)
  2. שורה 1790 (async-function)

### 229. core-systems.js - showErrorNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1809 (function)
  2. שורה 1809 (async-function)

### 230. core-systems.js - showSimpleErrorNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1845 (function)
  2. שורה 1845 (async-function)

### 231. core-systems.js - showFinalSuccessNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1923 (function)
  2. שורה 1923 (async-function)

### 232. core-systems.js - showCriticalErrorNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1990 (function)
  2. שורה 1990 (async-function)

### 233. core-systems.js - showFinalSuccessNotificationWithReload

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2312 (function)
  2. שורה 2312 (async-function)

### 234. core-systems.js - showCriticalErrorModal

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2478 (function)
  2. שורה 2478 (async-function)

### 235. core-systems.js - showWarningNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2676 (function)
  2. שורה 2676 (async-function)

### 236. core-systems.js - showInfoNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2690 (function)
  2. שורה 2690 (async-function)

### 237. core-systems.js - showDetailsModal

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2703 (function)
  2. שורה 2703 (async-function)

### 238. core-systems.js - saveNotificationToGlobalHistory

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2933 (function)
  2. שורה 2933 (async-function)

### 239. core-systems.js - updateGlobalNotificationStats

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3010 (function)
  2. שורה 3010 (async-function)

### 240. core-systems.js - loadGlobalNotificationHistory

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3096 (function)
  2. שורה 3096 (async-function)

### 241. core-systems.js - loadGlobalNotificationStats

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3136 (function)
  2. שורה 3136 (async-function)

### 242. data-advanced.js - loadCurrenciesFromServer

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 39 (function)
  2. שורה 39 (async-function)

### 243. data-advanced.js - apiCall

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 163 (function)
  2. שורה 163 (async-function)

### 244. data-advanced.js - loadDataFromAPI

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 197 (function)
  2. שורה 197 (async-function)

### 245. data-advanced.js - getUserPreference

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 420 (function)
  2. שורה 420 (async-function)

### 246. ui-advanced.js - hexToRgb

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 353 (function)
  2. שורה 1397 (function)

### 247. ui-advanced.js - getInvestmentTypeTextColor

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 569 (function)
  2. שורה 596 (function)

### 248. ui-advanced.js - getInvestmentTypeBorderColor

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 580 (function)
  2. שורה 612 (function)

### 249. ui-advanced.js - loadColorPreferences

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1942 (function)
  2. שורה 1942 (async-function)

### 250. ui-advanced.js - loadUserPreferences

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2062 (function)
  2. שורה 2062 (async-function)

### 251. ui-advanced.js - applyColorScheme

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2263 (function)
  2. שורה 2263 (async-function)

### 252. ui-advanced.js - toggleColorScheme

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2280 (function)
  2. שורה 2280 (async-function)

### 253. ui-advanced.js - loadColorScheme

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2298 (function)
  2. שורה 2298 (async-function)

### 254. ui-advanced.js - saveColorScheme

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2316 (function)
  2. שורה 2316 (async-function)

### 255. ui-advanced.js - getCurrentColorScheme

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2365 (function)
  2. שורה 2365 (async-function)

### 256. ui-advanced.js - loadDynamicColors

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2584 (function)
  2. שורה 2584 (async-function)

### 257. ui-basic.js - cancelItem

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 339 (function)
  2. שורה 339 (async-function)

### 258. ui-basic.js - performItemCancellation

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 397 (function)
  2. שורה 397 (async-function)

### 259. ui-basic.js - autoRefreshCurrentPage

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 684 (function)
  2. שורה 684 (async-function)

### 260. ui-basic.js - loadSectionStates

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1335 (function)
  2. שורה 1335 (async-function)

### 261. data-utils.js - loadCurrenciesFromServer

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 43 (function)
  2. שורה 43 (async-function)

### 262. data-utils.js - apiCall

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 165 (function)
  2. שורה 165 (async-function)

### 263. data-utils.js - loadDataFromAPI

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 195 (function)
  2. שורה 195 (async-function)

### 264. data-utils.js - getUserPreference

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 437 (function)
  2. שורה 437 (async-function)

### 265. validation-utils.js - validateWithConfirmation

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 660 (function)
  2. שורה 660 (async-function)

### 266. account-service.js - getAccounts

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 74 (function)
  2. שורה 74 (async-function)

### 267. account-service.js - getActiveAccounts

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 101 (function)
  2. שורה 101 (async-function)

### 268. account-service.js - getAccountsByStatus

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 118 (function)
  2. שורה 118 (async-function)

### 269. account-service.js - cancelAccount

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 135 (function)
  2. שורה 135 (async-function)

### 270. account-service.js - reactivateAccount

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 167 (function)
  2. שורה 167 (async-function)

### 271. account-service.js - getAccountById

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 199 (function)
  2. שורה 199 (async-function)

### 272. alert-service.js - cancelAlert

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 362 (function)
  2. שורה 362 (async-function)

### 273. alert-service.js - deleteAlert

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 417 (function)
  2. שורה 417 (async-function)

### 274. alert-service.js - performAlertDeletion

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 466 (function)
  2. שורה 466 (async-function)

### 275. alert-service.js - updateAlertStatus

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 504 (function)
  2. שורה 504 (async-function)

### 276. alert-service.js - updateMultipleAlertsStatus

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 582 (function)
  2. שורה 582 (async-function)

### 277. ticker-service.js - getTickers

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 88 (function)
  2. שורה 88 (async-function)

### 278. ticker-service.js - getTrades

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 116 (function)
  2. שורה 116 (async-function)

### 279. ticker-service.js - getTradePlans

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 144 (function)
  2. שורה 144 (async-function)

### 280. ticker-service.js - loadCache

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 171 (function)
  2. שורה 171 (async-function)

### 281. ticker-service.js - getTickersWithTrades

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 209 (function)
  2. שורה 209 (async-function)

### 282. ticker-service.js - getTickersWithPlans

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 244 (function)
  2. שורה 244 (async-function)

### 283. ticker-service.js - getRelevantTickers

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 285 (function)
  2. שורה 285 (async-function)

### 284. ticker-service.js - getTickersWithOpenOrClosedTradesAndPlans

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 337 (function)
  2. שורה 337 (async-function)

### 285. ticker-service.js - getTickersByType

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 388 (function)
  2. שורה 388 (async-function)

### 286. ticker-service.js - getTickersByActivity

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 423 (function)
  2. שורה 423 (async-function)

### 287. ticker-service.js - loadTickersForTradePlan

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 489 (function)
  2. שורה 489 (async-function)

### 288. ticker-service.js - saveTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 573 (function)
  2. שורה 573 (async-function)

### 289. ticker-service.js - updateTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 673 (function)
  2. שורה 673 (async-function)

### 290. ticker-service.js - deleteTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 738 (function)
  2. שורה 738 (async-function)

### 291. ticker-service.js - updateTickerActiveTradesStatus

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 773 (function)
  2. שורה 773 (async-function)

### 292. ticker-service.js - updateAllActiveTradesStatuses

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 832 (function)
  2. שורה 832 (async-function)

### 293. ticker-service.js - updateAllTickerStatuses

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 893 (function)
  2. שורה 893 (async-function)

### 294. ticker-service.js - updateTickerFromTradePlan

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 956 (function)
  2. שורה 956 (async-function)

### 295. ticker-service.js - updateTickersListForClosedTrades

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1007 (function)
  2. שורה 1007 (async-function)

### 296. trade-plan-service.js - loadTradePlansData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 58 (function)
  2. שורה 58 (async-function)

### 297. constraints.js - performRealValidation

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 878 (function)
  2. שורה 878 (async-function)

### 298. constraints.js - checkDatabaseConstraint

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 938 (function)
  2. שורה 938 (async-function)

### 299. constraints.js - checkDataViolations

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 953 (function)
  2. שורה 953 (async-function)

### 300. constraints.js - validateConstraintData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 989 (function)
  2. שורה 989 (async-function)

### 301. constraints.js - validateNotNullConstraint

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1034 (function)
  2. שורה 1034 (async-function)

### 302. constraints.js - validateUniqueConstraint

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1043 (function)
  2. שורה 1043 (async-function)

### 303. constraints.js - validateCheckConstraint

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1052 (function)
  2. שורה 1052 (async-function)

### 304. constraints.js - validateEnumConstraint

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1061 (function)
  2. שורה 1061 (async-function)

### 305. constraints.js - validateForeignKeyConstraint

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1070 (function)
  2. שורה 1070 (async-function)

### 306. constraints.js - validateRangeConstraint

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1079 (function)
  2. שורה 1079 (async-function)

### 307. constraints.js - checkUIValidation

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1090 (function)
  2. שורה 1090 (async-function)

### 308. constraints.js - validateSingleConstraint

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1105 (function)
  2. שורה 1105 (async-function)

### 309. linked-items.js - loadLinkedItemsData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1812 (function)
  2. שורה 1812 (async-function)

### 310. linked-items.js - checkLinkedItemsBeforeAction

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1837 (function)
  2. שורה 1837 (async-function)

### 311. linked-items.js - checkLinkedItemsAndPerformAction

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1876 (function)
  2. שורה 1876 (async-function)

### 312. external-data-settings-service.js - handleResponse

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 27 (function)
  2. שורה 27 (async-function)

### 313. external-data-settings-service.js - getSettings

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 49 (function)
  2. שורה 49 (async-function)

### 314. external-data-settings-service.js - saveSettings

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 62 (function)
  2. שורה 62 (async-function)

## 3. פונקציות מקומיות עם תחליף כללי (29)

### cash_flows.js

1. **updatePageSummaryStats** (שורה 779)
   - תחליף כללי: `updatePageSummaryStats` (services/statistics-calculator.js)
   - קטגוריה: DATA_LOADING
   - דמיון: 100.0%
   - חומרה: HIGH

### core-systems.js

1. **shouldShowNotification** (שורה 1332)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 22.7%
   - חומרה: LOW
2. **showNotification** (שורה 1433)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 100.0%
   - חומרה: HIGH
3. **showSuccessNotification** (שורה 1790)
   - תחליף כללי: `showSuccessNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 100.0%
   - חומרה: HIGH
4. **showErrorNotification** (שורה 1809)
   - תחליף כללי: `showErrorNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 100.0%
   - חומרה: HIGH
5. **showSimpleErrorNotification** (שורה 1845)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 18.5%
   - חומרה: LOW
6. **showFinalSuccessNotification** (שורה 1923)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 14.3%
   - חומרה: LOW
7. **showCriticalErrorNotification** (שורה 1990)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 13.8%
   - חומרה: LOW
8. **showFinalSuccessModal** (שורה 2233)
   - תחליף כללי: `showSuccessNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 21.7%
   - חומרה: LOW
9. **showFinalSuccessNotificationWithReload** (שורה 2312)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 10.5%
   - חומרה: LOW
10. **showFinalSuccessModalWithReload** (שורה 2364)
   - תחליף כללי: `showSuccessNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 16.1%
   - חומרה: LOW
11. **showCriticalErrorModal** (שורה 2478)
   - תחליף כללי: `showErrorNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 22.7%
   - חומרה: LOW
12. **showWarningNotification** (שורה 2676)
   - תחליף כללי: `showWarningNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 100.0%
   - חומרה: HIGH
13. **showInfoNotification** (שורה 2690)
   - תחליף כללי: `showInfoNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 100.0%
   - חומרה: HIGH
14. **showDetailsModal** (שורה 2703)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 31.3%
   - חומרה: LOW
15. **showNotificationLegacy** (שורה 2919)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 72.7%
   - חומרה: MEDIUM
16. **shouldShowNotification** (שורה 1332)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 22.7%
   - חומרה: LOW
17. **showNotification** (שורה 1433)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 100.0%
   - חומרה: HIGH
18. **showSuccessNotification** (שורה 1790)
   - תחליף כללי: `showSuccessNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 100.0%
   - חומרה: HIGH
19. **showErrorNotification** (שורה 1809)
   - תחליף כללי: `showErrorNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 100.0%
   - חומרה: HIGH
20. **showSimpleErrorNotification** (שורה 1845)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 18.5%
   - חומרה: LOW
21. **showFinalSuccessNotification** (שורה 1923)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 14.3%
   - חומרה: LOW
22. **showCriticalErrorNotification** (שורה 1990)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 13.8%
   - חומרה: LOW
23. **showFinalSuccessNotificationWithReload** (שורה 2312)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 10.5%
   - חומרה: LOW
24. **showCriticalErrorModal** (שורה 2478)
   - תחליף כללי: `showErrorNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 22.7%
   - חומרה: LOW
25. **showWarningNotification** (שורה 2676)
   - תחליף כללי: `showWarningNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 100.0%
   - חומרה: HIGH
26. **showInfoNotification** (שורה 2690)
   - תחליף כללי: `showInfoNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 100.0%
   - חומרה: HIGH
27. **showDetailsModal** (שורה 2703)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 31.3%
   - חומרה: LOW

### data-advanced.js

1. **clearUserPreferencesCache** (שורה 460)
   - תחליף כללי: `clearAllCache` (unified-cache-manager.js)
   - קטגוריה: CACHE
   - דמיון: 20.0%
   - חומרה: LOW

