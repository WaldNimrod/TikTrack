# דוח מקיף לניקוי קוד כפול ופונקציות לא בשימוש

**תאריך**: 31.10.2025, 23:59:43

---

## סיכום

- **סה"כ קבצים**: 61
- **סה"כ פונקציות**: 1471
- **פונקציות לא בשימוש**: 757
- **קבוצות כפולות**: 319
- **פונקציות מקומיות עם תחליף כללי**: 78

## המלצות

### 1. Unused functions found (HIGH)

- **כמות**: 757
- **קבצים מעורבים**: index.js, trades.js, executions.js, alerts.js, trade_plans.js, cash_flows.js, research.js, notes.js, preferences-page.js, tickers.js, trading_accounts.js, database.js, notification-system.js, logger-service.js, tables.js, header-system.js, page-utils.js, translation-utils.js, button-icons.js, color-scheme-system.js, select-populator-service.js, pagination-system.js, actions-menu-system.js, business-module.js, core-systems.js, data-advanced.js, data-basic.js, ui-advanced.js, date-utils.js, preferences-ui.js, validation-utils.js, account-service.js, alert-service.js, ticker-service.js, trade-plan-service.js, constraints.js, linked-items.js, related-object-filters.js, external-data-settings-service.js
- **פעולה מומלצת**: Review and remove unused functions to reduce code complexity

### 2. Duplicate functions found within files (HIGH)

- **כמות**: 319
- **קבצים מעורבים**: index.js, trades.js, executions.js, alerts.js, trade_plans.js, cash_flows.js, research.js, notes.js, preferences-page.js, tickers.js, trading_accounts.js, database.js, notification-system.js, logger-service.js, ui-utils.js, color-scheme-system.js, business-module.js, core-systems.js, data-advanced.js, ui-advanced.js, ui-basic.js, data-utils.js, validation-utils.js, account-service.js, alert-service.js, ticker-service.js, trade-plan-service.js, constraints.js, linked-items.js, external-data-settings-service.js
- **פעולה מומלצת**: Consolidate duplicate functions into single implementation

### 3. Local functions with global alternatives found (MEDIUM)

- **כמות**: 78
- **קבצים מעורבים**: trades.js, executions.js, alerts.js, trade_plans.js, cash_flows.js, notes.js, tickers.js, trading_accounts.js, database.js, business-module.js, core-systems.js, data-advanced.js, data-basic.js, ui-basic.js
- **פעולה מומלצת**: Replace local functions with global system functions for consistency

## 1. פונקציות לא בשימוש (757)

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

1. **loadTradeTickerInfo** (שורה 385, function) - HIGH
2. **displayTradeTickerInfo** (שורה 415, function) - HIGH
3. **loadTickerDataForTrades** (שורה 490, function) - HIGH
4. **addTrade** (שורה 1169, function) - HIGH
5. **editTrade** (שורה 1192, function) - HIGH
6. **clearTradeValidation** (שורה 1219, function) - HIGH
7. **hideAddTradeModal** (שורה 1278, function) - HIGH
8. **hideEditTradeModal** (שורה 1304, function) - HIGH
9. **refreshPositions** (שורה 1795, function) - HIGH
10. **initializeTradeConditionsSystem** (שורה 2110, function) - HIGH
11. **generateDetailedLogForTrades** (שורה 3050, function) - HIGH
12. **saveTrade** (שורה 3135, function) - HIGH
13. **deleteTrade** (שורה 3237, function) - HIGH
14. **loadTradeTickerInfo** (שורה 385, async-function) - MEDIUM
15. **loadTickerDataForTrades** (שורה 490, async-function) - MEDIUM
16. **refreshPositions** (שורה 1795, async-function) - MEDIUM
17. **generateDetailedLogForTrades** (שורה 3050, async-function) - MEDIUM
18. **saveTrade** (שורה 3135, async-function) - MEDIUM
19. **deleteTrade** (שורה 3237, async-function) - MEDIUM

### executions.js

1. **addExecution** (שורה 137, function) - HIGH
2. **openExecutionDetails** (שורה 197, function) - HIGH
3. **editExecution** (שורה 213, function) - HIGH
4. **resetExecutionForm** (שורה 237, function) - HIGH
5. **resetAddExecutionForm** (שורה 287, function) - HIGH
6. **resetEditExecutionForm** (שורה 297, function) - HIGH
7. **updateRealizedPLField** (שורה 307, function) - HIGH
8. **fillEditExecutionForm** (שורה 332, function) - HIGH
9. **validateExecutionTradeId** (שורה 580, function) - HIGH
10. **validateExecutionQuantity** (שורה 623, function) - HIGH
11. **validateExecutionPrice** (שורה 631, function) - HIGH
12. **validateExecutionCommission** (שורה 639, function) - HIGH
13. **validateExecutionSource** (שורה 647, function) - HIGH
14. **validateExecutionNotes** (שורה 655, function) - HIGH
15. **validateExecutionExternalId** (שורה 663, function) - HIGH
16. **validateExecutionDate** (שורה 674, function) - HIGH
17. **validateExecutionType** (שורה 685, function) - HIGH
18. **clearExecutionValidationErrors** (שורה 715, function) - HIGH
19. **validateCompleteExecutionForm** (שורה 756, function) - HIGH
20. **saveExecution** (שורה 792, function) - HIGH
21. **updateExecutionWrapper** (שורה 896, function) - HIGH
22. **showExecutionLinkedItemsModal** (שורה 1063, function) - HIGH
23. **loadLinkedItemsDetails** (שורה 1106, function) - HIGH
24. **loadLinkedItemsFromMultipleSources** (שורה 1136, function) - HIGH
25. **displayLinkedItems** (שורה 1219, function) - HIGH
26. **displayLinkedItems** (שורה 1420, function) - HIGH
27. **goToTrade** (שורה 1439, function) - HIGH
28. **goToPlan** (שורה 1453, function) - HIGH
29. **goToAlert** (שורה 1467, function) - HIGH
30. **goToNote** (שורה 1481, function) - HIGH
31. **clearNewExecutionHighlights** (שורה 1841, function) - HIGH
32. **filterExecutionsLocally** (שורה 1944, function) - HIGH
33. **updateExecution** (שורה 2056, function) - HIGH
34. **setupModalConfigurations** (שורה 2198, function) - HIGH
35. **loadTickersWithOpenOrClosedTradesAndPlans** (שורה 2238, function) - HIGH
36. **enableAllFields** (שורה 2281, function) - HIGH
37. **loadActiveTradesForTicker** (שורה 2315, function) - HIGH
38. **updateTradesOnCheckboxChange** (שורה 2465, function) - HIGH
39. **updateTradesOnTickerChange** (שורה 2501, function) - HIGH
40. **goToTickerPage** (שורה 2525, function) - HIGH
41. **showTickerHelp** (שורה 2553, function) - HIGH
42. **addNewTicker** (שורה 2572, function) - HIGH
43. **addNewPlan** (שורה 2592, function) - HIGH
44. **addNewTrade** (שורה 2605, function) - HIGH
45. **updateExecutionsSummary** (שורה 2619, function) - HIGH
46. **toggleExecutionFormFields** (שורה 2658, function) - HIGH
47. **enableExecutionFormFields** (שורה 2687, function) - HIGH
48. **disableExecutionFormFields** (שורה 2695, function) - HIGH
49. **loadExecutionTickerInfo** (שורה 2702, function) - HIGH
50. **displayExecutionTickerInfo** (שורה 2759, function) - HIGH
51. **hideExecutionTickerInfo** (שורה 2827, function) - HIGH
52. **calculateExecutionValues** (שורה 2838, function) - HIGH
53. **calculateAddExecutionValues** (שורה 2889, function) - HIGH
54. **calculateEditExecutionValues** (שורה 2897, function) - HIGH
55. **goToLinkedTrade** (שורה 2909, function) - HIGH
56. **updateExecutionsTableForTradeModal** (שורה 2960, function) - HIGH
57. **linkExistingExecution** (שורה 3021, function) - HIGH
58. **unlinkExecution** (שורה 3032, function) - HIGH
59. **setupExecutionsFilterFunctions** (שורה 3215, function) - HIGH
60. **applyAccountFilterWithTradesData** (שורה 3277, function) - HIGH
61. **updateExecutionsGlobalData** (שורה 3441, function) - HIGH
62. **toggleExternalIdField** (שורה 3517, function) - HIGH
63. **loadTickersSummaryData** (שורה 3557, function) - HIGH
64. **updateTickersSummaryTable** (שורה 3625, function) - HIGH
65. **refreshTickersSummary** (שורה 3704, function) - HIGH
66. **addExecutionForTicker** (שורה 3744, function) - HIGH
67. **updateTickersList** (שורה 3806, function) - HIGH
68. **toggleExecutionsSection** (שורה 3879, function) - HIGH
69. **showAddExecutionModal** (שורה 3901, function) - HIGH
70. **showEditExecutionModal** (שורה 3915, function) - HIGH
71. **deleteExecution** (שורה 3929, function) - HIGH
72. **performExecutionDeletion** (שורה 3976, function) - HIGH
73. **trySetTradeValue** (שורה 361, arrow) - MEDIUM
74. **fillEditExecutionForm** (שורה 332, async-function) - MEDIUM
75. **saveExecution** (שורה 792, async-function) - MEDIUM
76. **updateExecutionWrapper** (שורה 896, async-function) - MEDIUM
77. **showExecutionLinkedItemsModal** (שורה 1063, async-function) - MEDIUM
78. **loadLinkedItemsDetails** (שורה 1106, async-function) - MEDIUM
79. **loadLinkedItemsFromMultipleSources** (שורה 1136, async-function) - MEDIUM
80. **loadTickersWithOpenOrClosedTradesAndPlans** (שורה 2238, async-function) - MEDIUM
81. **loadActiveTradesForTicker** (שורה 2315, async-function) - MEDIUM
82. **updateTradesOnCheckboxChange** (שורה 2465, async-function) - MEDIUM
83. **updateTradesOnTickerChange** (שורה 2501, async-function) - MEDIUM
84. **loadExecutionTickerInfo** (שורה 2702, async-function) - MEDIUM
85. **loadTickersSummaryData** (שורה 3557, async-function) - MEDIUM
86. **refreshTickersSummary** (שורה 3704, async-function) - MEDIUM
87. **updateTickersList** (שורה 3806, async-function) - MEDIUM
88. **deleteExecution** (שורה 3929, async-function) - MEDIUM
89. **performExecutionDeletion** (שורה 3976, async-function) - MEDIUM

### alerts.js

1. **getDemoAlertsData** (שורה 315, function) - HIGH
2. **filterAlertsLocally** (שורה 452, function) - HIGH
3. **getConditionSourceDisplay** (שורה 601, function) - HIGH
4. **clearAlertValidation** (שורה 887, function) - HIGH
5. **toggleConditionFields** (שורה 1228, function) - HIGH
6. **enableEditConditionFields** (שורה 1291, function) - HIGH
7. **disableEditConditionFields** (שורה 1299, function) - HIGH
8. **populateEditRelatedObjects** (שורה 1346, function) - HIGH
9. **onEditRelationTypeChange** (שורה 1385, function) - HIGH
10. **onEditRelatedObjectChange** (שורה 1403, function) - HIGH
11. **enableEditConditionFields** (שורה 1426, function) - HIGH
12. **disableEditConditionFields** (שורה 1434, function) - HIGH
13. **checkAlertVariable** (שורה 1447, function) - HIGH
14. **checkAlertOperator** (שורה 1481, function) - HIGH
15. **buildAlertCondition** (שורה 1518, function) - HIGH
16. **saveAlert** (שורה 1570, function) - HIGH
17. **editAlert** (שורה 1754, function) - HIGH
18. **updateStatusAndTriggered** (שורה 1832, function) - HIGH
19. **deleteAlertInternal** (שורה 2038, function) - HIGH
20. **confirmDeleteAlert** (שורה 2071, function) - HIGH
21. **getStatusClass** (שורה 2113, function) - HIGH
22. **getRelatedClass** (שורה 2132, function) - HIGH
23. **restoreAlertsSectionState** (שורה 2153, function) - HIGH
24. **filterAlertsByRelatedObjectTypeWrapper** (שורה 2234, function) - HIGH
25. **loadAlerts** (שורה 2345, function) - HIGH
26. **reactivateAlert** (שורה 2385, function) - HIGH
27. **checkAlertCondition** (שורה 2461, function) - HIGH
28. **toggleAlert** (שורה 2519, function) - HIGH
29. **hideAddAlertModal** (שורה 2690, function) - HIGH
30. **hideEditAlertModal** (שורה 2716, function) - HIGH
31. **validateAlertForm** (שורה 2742, function) - HIGH
32. **updateEvaluationStats** (שורה 2794, function) - HIGH
33. **saveAlertData** (שורה 2824, function) - HIGH
34. **generateDetailedLogForAlerts** (שורה 2940, function) - HIGH
35. **loadConditionsFromSource** (שורה 2972, function) - HIGH
36. **loadTradePlansForConditions** (שורה 2993, function) - HIGH
37. **loadTradesForConditions** (שורה 3020, function) - HIGH
38. **loadConditionsFromItem** (שורה 3047, function) - HIGH
39. **displayAvailableConditions** (שורה 3080, function) - HIGH
40. **selectConditionForAlert** (שורה 3112, function) - HIGH
41. **createAlertFromCondition** (שורה 3137, function) - HIGH
42. **initializeAlertModalTabs** (שורה 3202, function) - HIGH
43. **updateModalButtons** (שורה 3219, function) - HIGH
44. **evaluateAllConditions** (שורה 3260, function) - HIGH
45. **refreshConditionEvaluations** (שורה 3299, function) - HIGH
46. **showEvaluationLoading** (שורה 3336, function) - HIGH
47. **displayEvaluationResults** (שורה 3357, function) - HIGH
48. **updateEvaluationSummary** (שורה 3383, function) - HIGH
49. **initializeAlertConditionBuilder** (שורה 3406, function) - HIGH
50. **getMethodIdFromCondition** (שורה 3455, function) - HIGH
51. **cleanupAlertConditionBuilder** (שורה 3470, function) - HIGH
52. **showAddAlertModal** (שורה 3490, function) - HIGH
53. **showEditAlertModal** (שורה 3504, function) - HIGH
54. **loadAlertTickerInfo** (שורה 3529, function) - HIGH
55. **displayAlertTickerInfo** (שורה 3559, function) - HIGH
56. **saveAlert** (שורה 1570, async-function) - MEDIUM
57. **deleteAlertInternal** (שורה 2038, async-function) - MEDIUM
58. **confirmDeleteAlert** (שורה 2071, async-function) - MEDIUM
59. **reactivateAlert** (שורה 2385, async-function) - MEDIUM
60. **saveAlertData** (שורה 2824, async-function) - MEDIUM
61. **generateDetailedLogForAlerts** (שורה 2940, async-function) - MEDIUM
62. **loadTradePlansForConditions** (שורה 2993, async-function) - MEDIUM
63. **loadTradesForConditions** (שורה 3020, async-function) - MEDIUM
64. **loadConditionsFromItem** (שורה 3047, async-function) - MEDIUM
65. **createAlertFromCondition** (שורה 3137, async-function) - MEDIUM
66. **evaluateAllConditions** (שורה 3260, async-function) - MEDIUM
67. **refreshConditionEvaluations** (שורה 3299, async-function) - MEDIUM
68. **loadAlertTickerInfo** (שורה 3529, async-function) - MEDIUM

### trade_plans.js

1. **executeTradePlan** (שורה 29, function) - HIGH
2. **copyTradePlan** (שורה 102, function) - HIGH
3. **enableFormFields** (שורה 275, function) - HIGH
4. **disableFormFields** (שורה 300, function) - HIGH
5. **enableEditFieldsWrapper** (שורה 325, function) - HIGH
6. **disableEditFields** (שורה 350, function) - HIGH
7. **loadTickerInfo** (שורה 372, function) - HIGH
8. **loadTradePlanTickerInfo** (שורה 410, function) - HIGH
9. **displayTickerInfo** (שורה 437, function) - HIGH
10. **displayTradePlanTickerInfo** (שורה 470, function) - HIGH
11. **hideTickerInfo** (שורה 551, function) - HIGH
12. **updateTickerInfo** (שורה 569, function) - HIGH
13. **updateSharesFromAmount** (שורה 607, function) - HIGH
14. **updateAmountFromShares** (שורה 661, function) - HIGH
15. **updateFormFieldsWithTickerData** (שורה 711, function) - HIGH
16. **loadEditTickerInfo** (שורה 789, function) - HIGH
17. **displayEditTickerInfo** (שורה 824, function) - HIGH
18. **hideEditTickerInfo** (שורה 858, function) - HIGH
19. **updateEditFormFieldsWithTickerData** (שורה 875, function) - HIGH
20. **updateEditTickerInfo** (שורה 965, function) - HIGH
21. **updateEditSharesFromAmount** (שורה 1151, function) - HIGH
22. **updateEditAmountFromShares** (שורה 1179, function) - HIGH
23. **saveEditTradePlan** (שורה 1207, function) - HIGH
24. **reactivateTradePlan** (שורה 1298, function) - HIGH
25. **addEditCondition** (שורה 1368, function) - HIGH
26. **addEditReason** (שורה 1385, function) - HIGH
27. **openCancelTradePlanModal** (שורה 1469, function) - HIGH
28. **cancelTradePlan** (שורה 1503, function) - HIGH
29. **setupPriceCalculation** (שורה 1546, function) - HIGH
30. **setupEditPriceCalculation** (שורה 1640, function) - HIGH
31. **updateDesignsTable** (שורה 1852, function) - HIGH
32. **filterTradePlansData** (שורה 1867, function) - HIGH
33. **updateTradePlansPageSummaryStats** (שורה 2293, function) - HIGH
34. **saveTradePlanData** (שורה 2522, function) - HIGH
35. **saveEditTradePlan** (שורה 2654, function) - HIGH
36. **saveNewTradePlan** (שורה 2662, function) - HIGH
37. **initializeTradePlanConditionsSystem** (שורה 2687, function) - HIGH
38. **setupSortableHeadersLocal** (שורה 2733, function) - HIGH
39. **restorePlanningSectionState** (שורה 2756, function) - HIGH
40. **filterTradePlansByType** (שורה 2788, function) - HIGH
41. **showAddTradePlanModal** (שורה 2849, function) - HIGH
42. **showEditTradePlanModal** (שורה 2863, function) - HIGH
43. **saveTradePlan** (שורה 2877, function) - HIGH
44. **deleteTradePlan** (שורה 2999, function) - HIGH
45. **performTradePlanDeletion** (שורה 3031, function) - HIGH
46. **hasActiveFilters** (שורה 1975, arrow) - MEDIUM
47. **initializeFormValidation** (שורה 2417, arrow) - MEDIUM
48. **loadTickerInfo** (שורה 372, async-function) - MEDIUM
49. **loadTradePlanTickerInfo** (שורה 410, async-function) - MEDIUM
50. **displayTickerInfo** (שורה 437, async-function) - MEDIUM
51. **updateTickerInfo** (שורה 569, async-function) - MEDIUM
52. **updateFormFieldsWithTickerData** (שורה 711, async-function) - MEDIUM
53. **loadEditTickerInfo** (שורה 789, async-function) - MEDIUM
54. **displayEditTickerInfo** (שורה 824, async-function) - MEDIUM
55. **updateEditFormFieldsWithTickerData** (שורה 875, async-function) - MEDIUM
56. **updateEditTickerInfo** (שורה 965, async-function) - MEDIUM
57. **saveEditTradePlan** (שורה 1207, async-function) - MEDIUM
58. **reactivateTradePlan** (שורה 1298, async-function) - MEDIUM
59. **cancelTradePlan** (שורה 1503, async-function) - MEDIUM
60. **saveTradePlanData** (שורה 2522, async-function) - MEDIUM
61. **saveEditTradePlan** (שורה 2654, async-function) - MEDIUM
62. **saveNewTradePlan** (שורה 2662, async-function) - MEDIUM
63. **saveTradePlan** (שורה 2877, async-function) - MEDIUM
64. **deleteTradePlan** (שורה 2999, async-function) - MEDIUM
65. **performTradePlanDeletion** (שורה 3031, async-function) - MEDIUM

### cash_flows.js

1. **loadCashFlowsData** (שורה 89, function) - HIGH
2. **calculateBalance** (שורה 153, function) - HIGH
3. **getAccountNameById** (שורה 254, function) - HIGH
4. **ensureTradingAccountsLoaded** (שורה 281, function) - HIGH
5. **toggleCashFlowsSection** (שורה 314, function) - HIGH
6. **restoreCashFlowsSectionState** (שורה 365, function) - HIGH
7. **loadCashFlows** (שורה 427, function) - HIGH
8. **validateCashFlowForm** (שורה 469, function) - HIGH
9. **validateEditCashFlowForm** (שורה 525, function) - HIGH
10. **deleteCashFlow** (שורה 579, function) - HIGH
11. **performCashFlowDeletion** (שורה 627, function) - HIGH
12. **loadAccountsForCashFlow** (שורה 735, function) - HIGH
13. **loadCurrenciesForCashFlow** (שורה 767, function) - HIGH
14. **renderCashFlowsTable** (שורה 788, function) - HIGH
15. **formatAmount** (שורה 909, function) - HIGH
16. **getCashFlowTypeWithColor** (שורה 936, function) - HIGH
17. **getCashFlowTypeText** (שורה 1001, function) - HIGH
18. **formatCashFlowAmount** (שורה 1011, function) - HIGH
19. **formatUsdRate** (שורה 1039, function) - HIGH
20. **showCashFlowDetails** (שורה 1055, function) - HIGH
21. **startAutoRefresh** (שורה 1111, function) - HIGH
22. **applyDynamicColors** (שורה 1142, function) - HIGH
23. **applyUserPreferences** (שורה 1213, function) - HIGH
24. **updateCashFlow** (שורה 1327, function) - HIGH
25. **saveCashFlow** (שורה 1364, function) - HIGH
26. **confirmDeleteCashFlow** (שורה 1511, function) - HIGH
27. **manageExternalIdField** (שורה 1552, function) - HIGH
28. **setupSourceFieldListeners** (שורה 1583, function) - HIGH
29. **initializeExternalIdFields** (שורה 1614, function) - HIGH
30. **showAddCashFlowModal** (שורה 1634, function) - HIGH
31. **showEditCashFlowModal** (שורה 1650, function) - HIGH
32. **editCashFlow** (שורה 1671, function) - HIGH
33. **loadTradesForCashFlow** (שורה 1686, function) - HIGH
34. **loadTradePlansForCashFlow** (שורה 1727, function) - HIGH
35. **generateDetailedLogForCashFlows** (שורה 2010, function) - HIGH
36. **loadCashFlowsData** (שורה 89, async-function) - MEDIUM
37. **ensureTradingAccountsLoaded** (שורה 281, async-function) - MEDIUM
38. **restoreCashFlowsSectionState** (שורה 365, async-function) - MEDIUM
39. **loadCashFlows** (שורה 427, async-function) - MEDIUM
40. **deleteCashFlow** (שורה 579, async-function) - MEDIUM
41. **performCashFlowDeletion** (שורה 627, async-function) - MEDIUM
42. **loadAccountsForCashFlow** (שורה 735, async-function) - MEDIUM
43. **loadCurrenciesForCashFlow** (שורה 767, async-function) - MEDIUM
44. **renderCashFlowsTable** (שורה 788, async-function) - MEDIUM
45. **applyDynamicColors** (שורה 1142, async-function) - MEDIUM
46. **updateCashFlow** (שורה 1327, async-function) - MEDIUM
47. **saveCashFlow** (שורה 1364, async-function) - MEDIUM
48. **loadTradesForCashFlow** (שורה 1686, async-function) - MEDIUM
49. **loadTradePlansForCashFlow** (שורה 1727, async-function) - MEDIUM
50. **generateDetailedLogForCashFlows** (שורה 2010, async-function) - MEDIUM

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

1. **addNote** (שורה 160, function) - HIGH
2. **uploadFile** (שורה 183, function) - HIGH
3. **downloadFile** (שורה 252, function) - HIGH
4. **openNoteDetails** (שורה 359, function) - HIGH
5. **editNote** (שורה 376, function) - HIGH
6. **deleteNote** (שורה 386, function) - HIGH
7. **restoreNotesSectionState** (שורה 433, function) - HIGH
8. **updateNotesSummary** (שורה 723, function) - HIGH
9. **updateGridFromComponent** (שורה 767, function) - HIGH
10. **onNoteRelationTypeChange** (שורה 940, function) - HIGH
11. **populateEditSelectByType** (שורה 946, function) - HIGH
12. **validateNoteForm** (שורה 1018, function) - HIGH
13. **validateEditNoteForm** (שורה 1045, function) - HIGH
14. **saveNote** (שורה 1106, function) - HIGH
15. **updateNoteFromModal** (שורה 1154, function) - HIGH
16. **confirmDeleteNote** (שורה 1238, function) - HIGH
17. **deleteNoteFromServer** (שורה 1249, function) - HIGH
18. **clearNoteValidationErrors** (שורה 1290, function) - HIGH
19. **getFieldByErrorId** (שורה 1318, function) - HIGH
20. **setupNoteValidationEvents** (שורה 1362, function) - HIGH
21. **clearSelectedFile** (שורה 1505, function) - HIGH
22. **showTickerPage** (שורה 1582, function) - HIGH
23. **formatText** (שורה 1610, function) - HIGH
24. **clearFormatting** (שורה 1692, function) - HIGH
25. **getEditorContent** (שורה 1717, function) - HIGH
26. **setEditorContent** (שורה 1751, function) - HIGH
27. **filterNotesData** (שורה 1792, function) - HIGH
28. **filterNotesByType** (שורה 1824, function) - HIGH
29. **viewNote** (שורה 1918, function) - HIGH
30. **loadNoteForViewing** (שורה 1947, function) - HIGH
31. **getNoteRelatedDisplay** (שורה 2003, function) - HIGH
32. **editCurrentNote** (שורה 2049, function) - HIGH
33. **displayCurrentAttachment** (שורה 2074, function) - HIGH
34. **removeCurrentAttachment** (שורה 2131, function) - HIGH
35. **replaceCurrentAttachment** (שורה 2171, function) - HIGH
36. **showAddNoteModal** (שורה 2198, function) - HIGH
37. **showEditNoteModal** (שורה 2212, function) - HIGH
38. **insertLink** (שורה 1651, arrow) - MEDIUM
39. **populateEditSelectByType** (שורה 946, async-function) - MEDIUM
40. **saveNote** (שורה 1106, async-function) - MEDIUM
41. **updateNoteFromModal** (שורה 1154, async-function) - MEDIUM
42. **confirmDeleteNote** (שורה 1238, async-function) - MEDIUM
43. **deleteNoteFromServer** (שורה 1249, async-function) - MEDIUM
44. **loadNoteForViewing** (שורה 1947, async-function) - MEDIUM

### preferences-page.js

1. **loadAccountsForPreferences** (שורה 60, function) - HIGH
2. **switchActiveProfile** (שורה 105, function) - HIGH
3. **createNewProfile** (שורה 176, function) - HIGH
4. **initializePreferencesPage** (שורה 423, function) - HIGH
5. **loadAccountsForPreferences** (שורה 60, async-function) - MEDIUM
6. **switchActiveProfile** (שורה 105, async-function) - MEDIUM
7. **createNewProfile** (שורה 176, async-function) - MEDIUM

### tickers.js

1. **viewTickerDetailsOld** (שורה 126, function) - HIGH
2. **refreshTickerData** (שורה 186, function) - HIGH
3. **loadCurrenciesData** (שורה 307, function) - HIGH
4. **getCurrencySymbol** (שורה 328, function) - HIGH
5. **getTimeDuration** (שורה 346, function) - HIGH
6. **getTickerTypeStyle** (שורה 371, function) - HIGH
7. **getTickerStatusStyle** (שורה 402, function) - HIGH
8. **getTickerStatusLabel** (שורה 439, function) - HIGH
9. **generateTickerCurrencyOptions** (שורה 456, function) - HIGH
10. **updateCurrencyOptions** (שורה 492, function) - HIGH
11. **updateActiveTradesField** (שורה 522, function) - HIGH
12. **restoreTickersSectionState** (שורה 634, function) - HIGH
13. **checkLinkedItemsAndCancelTicker** (שורה 993, function) - HIGH
14. **performTickerCancellation** (שורה 1000, function) - HIGH
15. **checkLinkedItemsBeforeDeleteTicker** (שורה 1090, function) - HIGH
16. **checkLinkedItemsBeforeCancelTicker** (שורה 1098, function) - HIGH
17. **performCancelTicker** (שורה 1170, function) - HIGH
18. **reactivateTicker** (שורה 1287, function) - HIGH
19. **checkLinkedItemsAndDeleteTicker** (שורה 1342, function) - HIGH
20. **performTickerDeletion** (שורה 1349, function) - HIGH
21. **confirmDeleteTicker** (שורה 1427, function) - HIGH
22. **clearTickersCache** (שורה 1476, function) - HIGH
23. **loadTickersData** (שורה 1489, function) - HIGH
24. **loadColorsAndApplyToHeaders** (שורה 1847, function) - HIGH
25. **tryLoadData** (שורה 1928, function) - HIGH
26. **refreshYahooFinanceData** (שורה 1966, function) - HIGH
27. **refreshYahooFinanceDataSilently** (שורה 2002, function) - HIGH
28. **filterTickersByType** (שורה 2033, function) - HIGH
29. **showAddTickerModal** (שורה 2149, function) - HIGH
30. **showEditTickerModal** (שורה 2170, function) - HIGH
31. **loadCurrenciesData** (שורה 307, async-function) - MEDIUM
32. **updateActiveTradesField** (שורה 522, async-function) - MEDIUM
33. **checkLinkedItemsAndCancelTicker** (שורה 993, async-function) - MEDIUM
34. **performTickerCancellation** (שורה 1000, async-function) - MEDIUM
35. **checkLinkedItemsBeforeDeleteTicker** (שורה 1090, async-function) - MEDIUM
36. **checkLinkedItemsBeforeCancelTicker** (שורה 1098, async-function) - MEDIUM
37. **performCancelTicker** (שורה 1170, async-function) - MEDIUM
38. **reactivateTicker** (שורה 1287, async-function) - MEDIUM
39. **checkLinkedItemsAndDeleteTicker** (שורה 1342, async-function) - MEDIUM
40. **performTickerDeletion** (שורה 1349, async-function) - MEDIUM
41. **confirmDeleteTicker** (שורה 1427, async-function) - MEDIUM
42. **loadTickersData** (שורה 1489, async-function) - MEDIUM
43. **loadColorsAndApplyToHeaders** (שורה 1847, async-function) - MEDIUM
44. **refreshYahooFinanceData** (שורה 1966, async-function) - MEDIUM
45. **refreshYahooFinanceDataSilently** (שורה 2002, async-function) - MEDIUM

### trading_accounts.js

1. **loadAllTradingAccountsFromServer** (שורה 398, function) - HIGH
2. **loadDefaultTradingAccounts** (שורה 451, function) - HIGH
3. **isTradingAccountsLoaded** (שורה 471, function) - HIGH
4. **loadTradingAccountsData** (שורה 476, function) - HIGH
5. **updateTradingAccountsTable** (שורה 515, function) - HIGH
6. **updateTradingAccountsSummary** (שורה 623, function) - HIGH
7. **loadTradingAccounts** (שורה 645, function) - HIGH
8. **updateTradingAccountFilterDisplayText** (שורה 686, function) - HIGH
9. **deleteTradingAccountFromAPI** (שורה 880, function) - HIGH
10. **cancelTradingAccount** (שורה 905, function) - HIGH
11. **deleteTradingAccount** (שורה 1051, function) - HIGH
12. **confirmDeleteTradingAccount** (שורה 1178, function) - HIGH
13. **showOpenTradesWarning** (שורה 1194, function) - HIGH
14. **loadTradingAccountsDataForTradingAccountsPage** (שורה 1279, function) - HIGH
15. **filterTradingAccountsLocally** (שורה 1409, function) - HIGH
16. **updateTradingAccountFilterMenu** (שורה 1502, function) - HIGH
17. **restoreTradingAccountsSectionState** (שורה 1553, function) - HIGH
18. **cancelTradingAccountWithLinkedItemsCheck** (שורה 1620, function) - HIGH
19. **deleteTradingAccountWithLinkedItemsCheck** (שורה 1680, function) - HIGH
20. **restoreTradingAccount** (שורה 1740, function) - HIGH
21. **checkLinkedItemsAndCancelTradingAccount** (שורה 1806, function) - HIGH
22. **performTradingAccountCancellation** (שורה 1813, function) - HIGH
23. **checkLinkedItemsAndDeleteTradingAccount** (שורה 1861, function) - HIGH
24. **performTradingAccountDeletion** (שורה 1868, function) - HIGH
25. **checkLinkedItemsBeforeCancelTradingAccount** (שורה 1942, function) - HIGH
26. **checkLinkedItemsBeforeDeleteTradingAccount** (שורה 1950, function) - HIGH
27. **getTradingAccountName** (שורה 1960, function) - HIGH
28. **updateTradingAccount** (שורה 1978, function) - HIGH
29. **viewTradingAccountDetails** (שורה 2039, function) - HIGH
30. **showTradingAccountDetails** (שורה 2100, function) - HIGH
31. **getTradingAccounts** (שורה 2245, function) - HIGH
32. **showAddTradingAccountModal** (שורה 2279, function) - HIGH
33. **showEditTradingAccountModal** (שורה 2295, function) - HIGH
34. **saveTradingAccount** (שורה 2309, function) - HIGH
35. **deleteTradingAccount** (שורה 2415, function) - HIGH
36. **performTradingAccountDeletion** (שורה 2447, function) - HIGH
37. **loadAllTradingAccountsFromServer** (שורה 398, async-function) - MEDIUM
38. **loadTradingAccountsData** (שורה 476, async-function) - MEDIUM
39. **loadTradingAccounts** (שורה 645, async-function) - MEDIUM
40. **deleteTradingAccountFromAPI** (שורה 880, async-function) - MEDIUM
41. **cancelTradingAccount** (שורה 905, async-function) - MEDIUM
42. **deleteTradingAccount** (שורה 1051, async-function) - MEDIUM
43. **loadTradingAccountsDataForTradingAccountsPage** (שורה 1279, async-function) - MEDIUM
44. **restoreTradingAccountsSectionState** (שורה 1553, async-function) - MEDIUM
45. **cancelTradingAccountWithLinkedItemsCheck** (שורה 1620, async-function) - MEDIUM
46. **deleteTradingAccountWithLinkedItemsCheck** (שורה 1680, async-function) - MEDIUM
47. **restoreTradingAccount** (שורה 1740, async-function) - MEDIUM
48. **checkLinkedItemsAndCancelTradingAccount** (שורה 1806, async-function) - MEDIUM
49. **performTradingAccountCancellation** (שורה 1813, async-function) - MEDIUM
50. **checkLinkedItemsAndDeleteTradingAccount** (שורה 1861, async-function) - MEDIUM
51. **performTradingAccountDeletion** (שורה 1868, async-function) - MEDIUM
52. **checkLinkedItemsBeforeCancelTradingAccount** (שורה 1942, async-function) - MEDIUM
53. **checkLinkedItemsBeforeDeleteTradingAccount** (שורה 1950, async-function) - MEDIUM
54. **saveTradingAccount** (שורה 2309, async-function) - MEDIUM
55. **deleteTradingAccount** (שורה 2415, async-function) - MEDIUM
56. **performTradingAccountDeletion** (שורה 2447, async-function) - MEDIUM

### database.js

1. **initDatabaseDisplay** (שורה 104, function) - HIGH
2. **fetchTableData** (שורה 195, function) - HIGH
3. **updateTableDisplay** (שורה 223, function) - HIGH
4. **createTableBodyHTML** (שורה 279, function) - HIGH
5. **formatCellValue** (שורה 313, function) - HIGH
6. **applySortingFunctionality** (שורה 345, function) - HIGH
7. **updateTableInfo** (שורה 387, function) - HIGH
8. **filterTableData** (שורה 406, function) - HIGH
9. **formatStatus** (שורה 486, function) - HIGH
10. **addRecord** (שורה 520, function) - HIGH
11. **fetchTableData** (שורה 195, async-function) - MEDIUM

### notification-system.js

1. **isPrimarySeverity** (שורה 106, function) - HIGH
2. **isUserInitiatedAction** (שורה 131, function) - HIGH
3. **shouldShowInMode** (שורה 175, function) - HIGH

### logger-service.js

1. **critical** (שורה 8, arrow-method) - MEDIUM
2. **critical** (שורה 672, arrow-method) - MEDIUM

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
2. **loadEditTradeModalData** (שורה 830, function) - HIGH
3. **saveEditTradeData** (שורה 1089, function) - HIGH
4. **saveNewTradeRecord** (שורה 1422, function) - HIGH
5. **getCurrentPosition** (שורה 1903, function) - HIGH
6. **checkLinkedItemsBeforeDelete** (שורה 1940, function) - HIGH
7. **filterTradesData** (שורה 2287, function) - HIGH
8. **copyDetailedLog** (שורה 3052, function) - HIGH
9. **loadEditTradeModalData** (שורה 830, async-function) - MEDIUM
10. **saveEditTradeData** (שורה 1089, async-function) - MEDIUM
11. **saveNewTradeRecord** (שורה 1422, async-function) - MEDIUM
12. **checkLinkedItemsBeforeDelete** (שורה 1940, async-function) - MEDIUM
13. **copyDetailedLog** (שורה 3052, async-function) - MEDIUM

### core-systems.js

1. **detectPageInfo** (שורה 715, function) - HIGH
2. **detectAvailableSystems** (שורה 765, function) - HIGH
3. **analyzePageRequirements** (שורה 793, function) - HIGH
4. **generateNotificationId** (שורה 1178, function) - HIGH
5. **showSimpleErrorNotification** (שורה 1846, function) - HIGH
6. **showFinalSuccessNotification** (שורה 1924, function) - HIGH
7. **showCriticalErrorNotification** (שורה 1991, function) - HIGH
8. **createDetailedErrorMessage** (שורה 2024, function) - HIGH
9. **showFinalSuccessModal** (שורה 2234, function) - HIGH
10. **showFinalSuccessNotificationWithReload** (שורה 2313, function) - HIGH
11. **showFinalSuccessModalWithReload** (שורה 2365, function) - HIGH
12. **showCriticalErrorModal** (שורה 2479, function) - HIGH
13. **createCriticalError** (שורה 2609, function) - HIGH
14. **withCriticalErrorHandling** (שורה 2640, function) - HIGH
15. **showNotificationLegacy** (שורה 2920, function) - HIGH
16. **formatSuccessForCopy** (שורה 3187, function) - HIGH
17. **determinePageType** (שורה 723, arrow) - MEDIUM
18. **requiresFilters** (שורה 729, arrow) - MEDIUM
19. **requiresValidation** (שורה 733, arrow) - MEDIUM
20. **requiresTables** (שורה 737, arrow) - MEDIUM
21. **requiresCharts** (שורה 741, arrow) - MEDIUM
22. **showSimpleErrorNotification** (שורה 1846, async-function) - MEDIUM
23. **showFinalSuccessNotification** (שורה 1924, async-function) - MEDIUM
24. **showCriticalErrorNotification** (שורה 1991, async-function) - MEDIUM
25. **showFinalSuccessNotificationWithReload** (שורה 2313, async-function) - MEDIUM
26. **showCriticalErrorModal** (שורה 2479, async-function) - MEDIUM

### data-advanced.js

1. **clearUserPreferencesCache** (שורה 461, function) - HIGH

### data-basic.js

1. **getTableMapping** (שורה 760, function) - HIGH
2. **isTableSupported** (שורה 773, function) - HIGH
3. **getTableConfig** (שורה 784, function) - HIGH
4. **getColumnDefinition** (שורה 935, function) - HIGH
5. **setTableConfig** (שורה 1290, function) - HIGH
6. **setColumnDefinition** (שורה 1318, function) - HIGH
7. **updateSortIcons** (שורה 1747, function) - HIGH

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
14. **ensureVar** (שורה 2166, arrow) - MEDIUM

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

### preferences-ui.js

1. **showDefaultProfileWarning** (שורה 1551, function) - HIGH
2. **hideDefaultProfileWarning** (שורה 1577, function) - HIGH

### validation-utils.js

1. **validateEmailField** (שורה 362, function) - HIGH
2. **validateCurrencySymbol** (שורה 563, function) - HIGH
3. **validateCurrencyRate** (שורה 573, function) - HIGH
4. **validateTickerSymbol** (שורה 584, function) - HIGH
5. **validateDateRange** (שורה 600, function) - HIGH
6. **validateWithConfirmation** (שורה 660, function) - HIGH
7. **validateWithConfirmation** (שורה 660, async-function) - MEDIUM

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

## 2. פונקציות כפולות בתוך קובץ (319)

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
  1. שורה 263 (function)
  2. שורה 263 (async-function)

### 11. trades.js - if

- **כמות כפילויות**: 3
- **מיקומים**:
  1. שורה 336 (function)
  2. שורה 449 (function)
  3. שורה 2071 (function)

### 12. trades.js - loadTradeTickerInfo

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 385 (function)
  2. שורה 385 (async-function)

### 13. trades.js - loadTickerDataForTrades

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 490 (function)
  2. שורה 490 (async-function)

### 14. trades.js - updateTradesTable

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 530 (function)
  2. שורה 530 (async-function)

### 15. trades.js - loadTradePlanDates

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 729 (function)
  2. שורה 729 (async-function)

### 16. trades.js - cancelTradeRecord

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 872 (function)
  2. שורה 872 (async-function)

### 17. trades.js - checkLinkedItemsAndCancel

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 959 (function)
  2. שורה 959 (async-function)

### 18. trades.js - performTradeCancellation

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 973 (function)
  2. שורה 973 (async-function)

### 19. trades.js - deleteTradeRecord

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1005 (function)
  2. שורה 1005 (async-function)

### 20. trades.js - performTradeDeletion

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1089 (function)
  2. שורה 1089 (async-function)

### 21. trades.js - initializeTradesPage

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1766 (function)
  2. שורה 1766 (async-function)

### 22. trades.js - refreshPositions

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1795 (function)
  2. שורה 1795 (async-function)

### 23. trades.js - validateTradePlanChange

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2225 (function)
  2. שורה 2225 (async-function)

### 24. trades.js - validateTradeChanges

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2285 (function)
  2. שורה 2285 (async-function)

### 25. trades.js - applyStatusFilterToTrades

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2351 (function)
  2. שורה 2351 (async-function)

### 26. trades.js - validateTickerChange

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2406 (function)
  2. שורה 2406 (async-function)

### 27. trades.js - validateTradePlanDate

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2516 (function)
  2. שורה 2516 (async-function)

### 28. trades.js - updateEditTradeTickerFromPlan

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2555 (function)
  2. שורה 2555 (async-function)

### 29. trades.js - updateEditTradePriceFromTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2635 (function)
  2. שורה 2635 (async-function)

### 30. trades.js - reactivateTrade

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2684 (function)
  2. שורה 2684 (async-function)

### 31. trades.js - generateDetailedLogForTrades

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3050 (function)
  2. שורה 3050 (async-function)

### 32. trades.js - saveTrade

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3135 (function)
  2. שורה 3135 (async-function)

### 33. trades.js - deleteTrade

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3237 (function)
  2. שורה 3237 (async-function)

### 34. executions.js - fillEditExecutionForm

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 332 (function)
  2. שורה 332 (async-function)

### 35. executions.js - saveExecution

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 792 (function)
  2. שורה 792 (async-function)

### 36. executions.js - updateExecutionWrapper

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 896 (function)
  2. שורה 896 (async-function)

### 37. executions.js - showExecutionLinkedItemsModal

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1063 (function)
  2. שורה 1063 (async-function)

### 38. executions.js - loadLinkedItemsDetails

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1106 (function)
  2. שורה 1106 (async-function)

### 39. executions.js - loadLinkedItemsFromMultipleSources

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1136 (function)
  2. שורה 1136 (async-function)

### 40. executions.js - displayLinkedItems

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1219 (function)
  2. שורה 1420 (function)

### 41. executions.js - loadExecutionsData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1509 (function)
  2. שורה 1509 (async-function)

### 42. executions.js - updateExecutionsTableMain

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1568 (function)
  2. שורה 1568 (async-function)

### 43. executions.js - loadTickersWithOpenOrClosedTradesAndPlans

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2238 (function)
  2. שורה 2238 (async-function)

### 44. executions.js - loadActiveTradesForTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2315 (function)
  2. שורה 2315 (async-function)

### 45. executions.js - updateTradesOnCheckboxChange

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2465 (function)
  2. שורה 2465 (async-function)

### 46. executions.js - updateTradesOnTickerChange

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2501 (function)
  2. שורה 2501 (async-function)

### 47. executions.js - loadExecutionTickerInfo

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2702 (function)
  2. שורה 2702 (async-function)

### 48. executions.js - loadTickersSummaryData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3557 (function)
  2. שורה 3557 (async-function)

### 49. executions.js - refreshTickersSummary

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3704 (function)
  2. שורה 3704 (async-function)

### 50. executions.js - updateTickersList

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3806 (function)
  2. שורה 3806 (async-function)

### 51. executions.js - deleteExecution

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3929 (function)
  2. שורה 3929 (async-function)

### 52. executions.js - performExecutionDeletion

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3976 (function)
  2. שורה 3976 (async-function)

### 53. alerts.js - loadAlertsData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 363 (function)
  2. שורה 363 (async-function)

### 54. alerts.js - if

- **כמות כפילויות**: 3
- **מיקומים**:
  1. שורה 857 (function)
  2. שורה 2826 (function)
  3. שורה 3593 (function)

### 55. alerts.js - loadModalData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 945 (function)
  2. שורה 945 (async-function)

### 56. alerts.js - enableEditConditionFields

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1291 (function)
  2. שורה 1426 (function)

### 57. alerts.js - disableEditConditionFields

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1299 (function)
  2. שורה 1434 (function)

### 58. alerts.js - saveAlert

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1570 (function)
  2. שורה 1570 (async-function)

### 59. alerts.js - updateAlert

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1878 (function)
  2. שורה 1878 (async-function)

### 60. alerts.js - deleteAlertInternal

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2038 (function)
  2. שורה 2038 (async-function)

### 61. alerts.js - confirmDeleteAlert

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2071 (function)
  2. שורה 2071 (async-function)

### 62. alerts.js - reactivateAlert

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2385 (function)
  2. שורה 2385 (async-function)

### 63. alerts.js - saveAlertData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2824 (function)
  2. שורה 2824 (async-function)

### 64. alerts.js - generateDetailedLogForAlerts

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2940 (function)
  2. שורה 2940 (async-function)

### 65. alerts.js - loadTradePlansForConditions

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2993 (function)
  2. שורה 2993 (async-function)

### 66. alerts.js - loadTradesForConditions

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3020 (function)
  2. שורה 3020 (async-function)

### 67. alerts.js - loadConditionsFromItem

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3047 (function)
  2. שורה 3047 (async-function)

### 68. alerts.js - createAlertFromCondition

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3137 (function)
  2. שורה 3137 (async-function)

### 69. alerts.js - evaluateAllConditions

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3260 (function)
  2. שורה 3260 (async-function)

### 70. alerts.js - refreshConditionEvaluations

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3299 (function)
  2. שורה 3299 (async-function)

### 71. alerts.js - loadAlertTickerInfo

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3529 (function)
  2. שורה 3529 (async-function)

### 72. trade_plans.js - loadTickerInfo

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 372 (function)
  2. שורה 372 (async-function)

### 73. trade_plans.js - loadTradePlanTickerInfo

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 410 (function)
  2. שורה 410 (async-function)

### 74. trade_plans.js - displayTickerInfo

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 437 (function)
  2. שורה 437 (async-function)

### 75. trade_plans.js - if

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 504 (function)
  2. שורה 1781 (function)

### 76. trade_plans.js - updateTickerInfo

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 569 (function)
  2. שורה 569 (async-function)

### 77. trade_plans.js - updateFormFieldsWithTickerData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 711 (function)
  2. שורה 711 (async-function)

### 78. trade_plans.js - loadEditTickerInfo

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 789 (function)
  2. שורה 789 (async-function)

### 79. trade_plans.js - displayEditTickerInfo

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 824 (function)
  2. שורה 824 (async-function)

### 80. trade_plans.js - updateEditFormFieldsWithTickerData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 875 (function)
  2. שורה 875 (async-function)

### 81. trade_plans.js - updateEditTickerInfo

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 965 (function)
  2. שורה 965 (async-function)

### 82. trade_plans.js - saveEditTradePlan

- **כמות כפילויות**: 4
- **מיקומים**:
  1. שורה 1207 (function)
  2. שורה 2654 (function)
  3. שורה 1207 (async-function)
  4. שורה 2654 (async-function)

### 83. trade_plans.js - checkLinkedItemsBeforeCancel

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1291 (function)
  2. שורה 1291 (async-function)

### 84. trade_plans.js - reactivateTradePlan

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1298 (function)
  2. שורה 1298 (async-function)

### 85. trade_plans.js - cancelTradePlan

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1503 (function)
  2. שורה 1503 (async-function)

### 86. trade_plans.js - loadTradePlansData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1798 (function)
  2. שורה 1798 (async-function)

### 87. trade_plans.js - saveTradePlanData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2522 (function)
  2. שורה 2522 (async-function)

### 88. trade_plans.js - saveNewTradePlan

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2662 (function)
  2. שורה 2662 (async-function)

### 89. trade_plans.js - saveTradePlan

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2877 (function)
  2. שורה 2877 (async-function)

### 90. trade_plans.js - deleteTradePlan

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2999 (function)
  2. שורה 2999 (async-function)

### 91. trade_plans.js - performTradePlanDeletion

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3031 (function)
  2. שורה 3031 (async-function)

### 92. trade_plans.js - updatePricesFromPercentages

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1561 (arrow)
  2. שורה 1655 (arrow)

### 93. trade_plans.js - updatePercentagesFromPrices

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1583 (arrow)
  2. שורה 1677 (arrow)

### 94. cash_flows.js - loadCashFlowsData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 89 (function)
  2. שורה 89 (async-function)

### 95. cash_flows.js - ensureTradingAccountsLoaded

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 281 (function)
  2. שורה 281 (async-function)

### 96. cash_flows.js - restoreCashFlowsSectionState

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 365 (function)
  2. שורה 365 (async-function)

### 97. cash_flows.js - loadCashFlows

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 427 (function)
  2. שורה 427 (async-function)

### 98. cash_flows.js - deleteCashFlow

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 579 (function)
  2. שורה 579 (async-function)

### 99. cash_flows.js - performCashFlowDeletion

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 627 (function)
  2. שורה 627 (async-function)

### 100. cash_flows.js - loadAccountsForCashFlow

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 735 (function)
  2. שורה 735 (async-function)

### 101. cash_flows.js - loadCurrenciesForCashFlow

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 767 (function)
  2. שורה 767 (async-function)

### 102. cash_flows.js - renderCashFlowsTable

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 788 (function)
  2. שורה 788 (async-function)

### 103. cash_flows.js - updateCashFlowsTable

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1079 (function)
  2. שורה 1079 (async-function)

### 104. cash_flows.js - applyDynamicColors

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1142 (function)
  2. שורה 1142 (async-function)

### 105. cash_flows.js - initializeCashFlowsPage

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1263 (function)
  2. שורה 1263 (async-function)

### 106. cash_flows.js - updateCashFlow

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1327 (function)
  2. שורה 1327 (async-function)

### 107. cash_flows.js - saveCashFlow

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1364 (function)
  2. שורה 1364 (async-function)

### 108. cash_flows.js - loadTradesForCashFlow

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1686 (function)
  2. שורה 1686 (async-function)

### 109. cash_flows.js - loadTradePlansForCashFlow

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1727 (function)
  2. שורה 1727 (async-function)

### 110. cash_flows.js - generateDetailedLogForCashFlows

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2010 (function)
  2. שורה 2010 (async-function)

### 111. cash_flows.js - validation

- **כמות כפילויות**: 4
- **מיקומים**:
  1. שורה 476 (arrow-method)
  2. שורה 487 (arrow-method)
  3. שורה 532 (arrow-method)
  4. שורה 543 (arrow-method)

### 112. research.js - generateDetailedLogForResearch

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 350 (function)
  2. שורה 350 (async-function)

### 113. notes.js - populateEditSelectByType

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 946 (function)
  2. שורה 946 (async-function)

### 114. notes.js - saveNote

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1106 (function)
  2. שורה 1106 (async-function)

### 115. notes.js - updateNoteFromModal

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1154 (function)
  2. שורה 1154 (async-function)

### 116. notes.js - confirmDeleteNote

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1238 (function)
  2. שורה 1238 (async-function)

### 117. notes.js - deleteNoteFromServer

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1249 (function)
  2. שורה 1249 (async-function)

### 118. notes.js - loadNoteForViewing

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1947 (function)
  2. שורה 1947 (async-function)

### 119. preferences-page.js - loadAccountsForPreferences

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 60 (function)
  2. שורה 60 (async-function)

### 120. preferences-page.js - switchActiveProfile

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 105 (function)
  2. שורה 105 (async-function)

### 121. preferences-page.js - createNewProfile

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 176 (function)
  2. שורה 176 (async-function)

### 122. preferences-page.js - copyDetailedLogLocal

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 341 (function)
  2. שורה 341 (async-function)

### 123. tickers.js - loadCurrenciesData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 307 (function)
  2. שורה 307 (async-function)

### 124. tickers.js - updateActiveTradesField

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 522 (function)
  2. שורה 522 (async-function)

### 125. tickers.js - updateTickerActiveTradesStatus

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 564 (function)
  2. שורה 564 (async-function)

### 126. tickers.js - updateAllActiveTradesStatuses

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 596 (function)
  2. שורה 596 (async-function)

### 127. tickers.js - saveTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 693 (function)
  2. שורה 693 (async-function)

### 128. tickers.js - updateTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 776 (function)
  2. שורה 776 (async-function)

### 129. tickers.js - cancelTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 930 (function)
  2. שורה 930 (async-function)

### 130. tickers.js - checkLinkedItemsAndCancelTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 993 (function)
  2. שורה 993 (async-function)

### 131. tickers.js - performTickerCancellation

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1000 (function)
  2. שורה 1000 (async-function)

### 132. tickers.js - checkLinkedItemsBeforeDeleteTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1090 (function)
  2. שורה 1090 (async-function)

### 133. tickers.js - checkLinkedItemsBeforeCancelTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1098 (function)
  2. שורה 1098 (async-function)

### 134. tickers.js - updateAllTickerStatuses

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1125 (function)
  2. שורה 1125 (async-function)

### 135. tickers.js - performCancelTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1170 (function)
  2. שורה 1170 (async-function)

### 136. tickers.js - reactivateTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1287 (function)
  2. שורה 1287 (async-function)

### 137. tickers.js - checkLinkedItemsAndDeleteTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1342 (function)
  2. שורה 1342 (async-function)

### 138. tickers.js - performTickerDeletion

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1349 (function)
  2. שורה 1349 (async-function)

### 139. tickers.js - confirmDeleteTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1427 (function)
  2. שורה 1427 (async-function)

### 140. tickers.js - loadTickersData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1489 (function)
  2. שורה 1489 (async-function)

### 141. tickers.js - loadColorsAndApplyToHeaders

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1847 (function)
  2. שורה 1847 (async-function)

### 142. tickers.js - refreshYahooFinanceData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1966 (function)
  2. שורה 1966 (async-function)

### 143. tickers.js - refreshYahooFinanceDataSilently

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2002 (function)
  2. שורה 2002 (async-function)

### 144. tickers.js - onSuccess

- **כמות כפילויות**: 3
- **מיקומים**:
  1. שורה 1016 (arrow-method)
  2. שורה 1314 (arrow-method)
  3. שורה 1363 (arrow-method)

### 145. trading_accounts.js - loadCurrenciesFromServer

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 245 (function)
  2. שורה 245 (async-function)

### 146. trading_accounts.js - generateCurrencyOptions

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 320 (function)
  2. שורה 320 (async-function)

### 147. trading_accounts.js - loadTradingAccountsFromServer

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 336 (function)
  2. שורה 336 (async-function)

### 148. trading_accounts.js - loadAllTradingAccountsFromServer

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 398 (function)
  2. שורה 398 (async-function)

### 149. trading_accounts.js - loadTradingAccountsData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 476 (function)
  2. שורה 476 (async-function)

### 150. trading_accounts.js - loadTradingAccounts

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 645 (function)
  2. שורה 645 (async-function)

### 151. trading_accounts.js - deleteTradingAccountFromAPI

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 880 (function)
  2. שורה 880 (async-function)

### 152. trading_accounts.js - cancelTradingAccount

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 905 (function)
  2. שורה 905 (async-function)

### 153. trading_accounts.js - deleteTradingAccount

- **כמות כפילויות**: 4
- **מיקומים**:
  1. שורה 1051 (function)
  2. שורה 2415 (function)
  3. שורה 1051 (async-function)
  4. שורה 2415 (async-function)

### 154. trading_accounts.js - loadTradingAccountsDataForTradingAccountsPage

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1279 (function)
  2. שורה 1279 (async-function)

### 155. trading_accounts.js - restoreTradingAccountsSectionState

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1553 (function)
  2. שורה 1553 (async-function)

### 156. trading_accounts.js - cancelTradingAccountWithLinkedItemsCheck

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1620 (function)
  2. שורה 1620 (async-function)

### 157. trading_accounts.js - deleteTradingAccountWithLinkedItemsCheck

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1680 (function)
  2. שורה 1680 (async-function)

### 158. trading_accounts.js - restoreTradingAccount

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1740 (function)
  2. שורה 1740 (async-function)

### 159. trading_accounts.js - checkLinkedItemsAndCancelTradingAccount

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1806 (function)
  2. שורה 1806 (async-function)

### 160. trading_accounts.js - performTradingAccountCancellation

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1813 (function)
  2. שורה 1813 (async-function)

### 161. trading_accounts.js - checkLinkedItemsAndDeleteTradingAccount

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1861 (function)
  2. שורה 1861 (async-function)

### 162. trading_accounts.js - performTradingAccountDeletion

- **כמות כפילויות**: 4
- **מיקומים**:
  1. שורה 1868 (function)
  2. שורה 2447 (function)
  3. שורה 1868 (async-function)
  4. שורה 2447 (async-function)

### 163. trading_accounts.js - checkLinkedItemsBeforeCancelTradingAccount

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1942 (function)
  2. שורה 1942 (async-function)

### 164. trading_accounts.js - checkLinkedItemsBeforeDeleteTradingAccount

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1950 (function)
  2. שורה 1950 (async-function)

### 165. trading_accounts.js - saveTradingAccount

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2309 (function)
  2. שורה 2309 (async-function)

### 166. database.js - loadTableData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 161 (function)
  2. שורה 161 (async-function)

### 167. database.js - fetchTableData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 195 (function)
  2. שורה 195 (async-function)

### 168. notification-system.js - createAlert

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 217 (function)
  2. שורה 217 (async-function)

### 169. notification-system.js - updateNotificationHistory

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 245 (function)
  2. שורה 245 (async-function)

### 170. notification-system.js - shouldShowNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 350 (function)
  2. שורה 350 (async-function)

### 171. notification-system.js - shouldLogToConsole

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 426 (function)
  2. שורה 426 (async-function)

### 172. notification-system.js - logWithCategory

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 446 (function)
  2. שורה 446 (async-function)

### 173. notification-system.js - showNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 481 (function)
  2. שורה 481 (async-function)

### 174. notification-system.js - loadLinkedItemsData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 796 (function)
  2. שורה 796 (async-function)

### 175. notification-system.js - showSuccessNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 902 (function)
  2. שורה 902 (async-function)

### 176. notification-system.js - showErrorNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 920 (function)
  2. שורה 920 (async-function)

### 177. notification-system.js - showWarningNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 934 (function)
  2. שורה 934 (async-function)

### 178. notification-system.js - showInfoNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 948 (function)
  2. שורה 948 (async-function)

### 179. notification-system.js - showDetailsModal

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 961 (function)
  2. שורה 961 (async-function)

### 180. notification-system.js - saveNotificationToGlobalHistory

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1180 (function)
  2. שורה 1180 (async-function)

### 181. notification-system.js - updateGlobalNotificationStats

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1242 (function)
  2. שורה 1242 (async-function)

### 182. notification-system.js - loadGlobalNotificationHistory

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1321 (function)
  2. שורה 1321 (async-function)

### 183. notification-system.js - loadGlobalNotificationStats

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1351 (function)
  2. שורה 1351 (async-function)

### 184. logger-service.js - info

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 4 (arrow-method)
  2. שורה 668 (arrow-method)

### 185. logger-service.js - error

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 5 (arrow-method)
  2. שורה 669 (arrow-method)

### 186. logger-service.js - warn

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 6 (arrow-method)
  2. שורה 670 (arrow-method)

### 187. logger-service.js - debug

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 7 (arrow-method)
  2. שורה 671 (arrow-method)

### 188. logger-service.js - critical

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 8 (arrow-method)
  2. שורה 672 (arrow-method)

### 189. ui-utils.js - cancelItem

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 361 (function)
  2. שורה 361 (async-function)

### 190. ui-utils.js - performItemCancellation

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 419 (function)
  2. שורה 419 (async-function)

### 191. ui-utils.js - enhancedTableRefresh

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 669 (function)
  2. שורה 669 (async-function)

### 192. ui-utils.js - handleApiResponseWithRefresh

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 707 (function)
  2. שורה 707 (async-function)

### 193. ui-utils.js - autoRefreshCurrentPage

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 827 (function)
  2. שורה 827 (async-function)

### 194. color-scheme-system.js - loadDynamicColors

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 638 (function)
  2. שורה 638 (async-function)

### 195. color-scheme-system.js - setCurrentEntityColorFromPage

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 658 (function)
  2. שורה 658 (async-function)

### 196. color-scheme-system.js - getEntityColorFromPreferences

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 721 (function)
  2. שורה 721 (async-function)

### 197. color-scheme-system.js - getAllEntityColorVariantsFromPreferences

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 738 (function)
  2. שורה 738 (async-function)

### 198. color-scheme-system.js - loadColorPreferences

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 872 (function)
  2. שורה 872 (async-function)

### 199. business-module.js - loadTradesData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 267 (function)
  2. שורה 267 (async-function)

### 200. business-module.js - cancelTradeRecord

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 504 (function)
  2. שורה 504 (async-function)

### 201. business-module.js - checkLinkedItemsAndCancel

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 590 (function)
  2. שורה 590 (async-function)

### 202. business-module.js - performTradeCancellation

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 616 (function)
  2. שורה 616 (async-function)

### 203. business-module.js - deleteTradeRecord

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 648 (function)
  2. שורה 648 (async-function)

### 204. business-module.js - performTradeDeletion

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 715 (function)
  2. שורה 715 (async-function)

### 205. business-module.js - showEditTradeModal

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 761 (function)
  2. שורה 761 (async-function)

### 206. business-module.js - loadEditTradeModalData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 830 (function)
  2. שורה 830 (async-function)

### 207. business-module.js - saveEditTradeData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1089 (function)
  2. שורה 1089 (async-function)

### 208. business-module.js - saveNewTradeRecord

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1422 (function)
  2. שורה 1422 (async-function)

### 209. business-module.js - loadModalData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1526 (function)
  2. שורה 1526 (async-function)

### 210. business-module.js - updateTickerFromTradePlan

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1630 (function)
  2. שורה 1630 (async-function)

### 211. business-module.js - checkLinkedItemsBeforeDelete

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1940 (function)
  2. שורה 1940 (async-function)

### 212. business-module.js - checkLinkedItemsBeforeCancel

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1982 (function)
  2. שורה 1982 (async-function)

### 213. business-module.js - loadTradePlanDates

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2255 (function)
  2. שורה 2255 (async-function)

### 214. business-module.js - validateTradePlanChange

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2331 (function)
  2. שורה 2331 (async-function)

### 215. business-module.js - validateTradeChanges

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2391 (function)
  2. שורה 2391 (async-function)

### 216. business-module.js - validateTickerChange

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2500 (function)
  2. שורה 2500 (async-function)

### 217. business-module.js - validateTradePlanDate

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2605 (function)
  2. שורה 2605 (async-function)

### 218. business-module.js - updateEditTradeTickerFromPlan

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2644 (function)
  2. שורה 2644 (async-function)

### 219. business-module.js - updateEditTradePriceFromTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2720 (function)
  2. שורה 2720 (async-function)

### 220. business-module.js - reactivateTrade

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2765 (function)
  2. שורה 2765 (async-function)

### 221. business-module.js - copyDetailedLog

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3052 (function)
  2. שורה 3052 (async-function)

### 222. core-systems.js - createAlert

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1200 (function)
  2. שורה 1200 (async-function)

### 223. core-systems.js - updateNotificationHistory

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1228 (function)
  2. שורה 1228 (async-function)

### 224. core-systems.js - shouldShowNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1333 (function)
  2. שורה 1333 (async-function)

### 225. core-systems.js - shouldLogToConsole

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1379 (function)
  2. שורה 1379 (async-function)

### 226. core-systems.js - logWithCategory

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1399 (function)
  2. שורה 1399 (async-function)

### 227. core-systems.js - showNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1434 (function)
  2. שורה 1434 (async-function)

### 228. core-systems.js - loadLinkedItemsData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1729 (function)
  2. שורה 1729 (async-function)

### 229. core-systems.js - showSuccessNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1791 (function)
  2. שורה 1791 (async-function)

### 230. core-systems.js - showErrorNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1810 (function)
  2. שורה 1810 (async-function)

### 231. core-systems.js - showSimpleErrorNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1846 (function)
  2. שורה 1846 (async-function)

### 232. core-systems.js - showFinalSuccessNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1924 (function)
  2. שורה 1924 (async-function)

### 233. core-systems.js - showCriticalErrorNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1991 (function)
  2. שורה 1991 (async-function)

### 234. core-systems.js - showFinalSuccessNotificationWithReload

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2313 (function)
  2. שורה 2313 (async-function)

### 235. core-systems.js - showCriticalErrorModal

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2479 (function)
  2. שורה 2479 (async-function)

### 236. core-systems.js - showWarningNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2677 (function)
  2. שורה 2677 (async-function)

### 237. core-systems.js - showInfoNotification

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2691 (function)
  2. שורה 2691 (async-function)

### 238. core-systems.js - showDetailsModal

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2704 (function)
  2. שורה 2704 (async-function)

### 239. core-systems.js - saveNotificationToGlobalHistory

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2934 (function)
  2. שורה 2934 (async-function)

### 240. core-systems.js - updateGlobalNotificationStats

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3011 (function)
  2. שורה 3011 (async-function)

### 241. core-systems.js - loadGlobalNotificationHistory

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3097 (function)
  2. שורה 3097 (async-function)

### 242. core-systems.js - loadGlobalNotificationStats

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 3137 (function)
  2. שורה 3137 (async-function)

### 243. data-advanced.js - loadCurrenciesFromServer

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 40 (function)
  2. שורה 40 (async-function)

### 244. data-advanced.js - apiCall

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 164 (function)
  2. שורה 164 (async-function)

### 245. data-advanced.js - loadDataFromAPI

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 198 (function)
  2. שורה 198 (async-function)

### 246. data-advanced.js - getUserPreference

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 421 (function)
  2. שורה 421 (async-function)

### 247. ui-advanced.js - hexToRgb

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 353 (function)
  2. שורה 1397 (function)

### 248. ui-advanced.js - getInvestmentTypeTextColor

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 569 (function)
  2. שורה 596 (function)

### 249. ui-advanced.js - getInvestmentTypeBorderColor

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 580 (function)
  2. שורה 612 (function)

### 250. ui-advanced.js - loadColorPreferences

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1929 (function)
  2. שורה 1929 (async-function)

### 251. ui-advanced.js - loadUserPreferences

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2044 (function)
  2. שורה 2044 (async-function)

### 252. ui-advanced.js - applyColorScheme

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2244 (function)
  2. שורה 2244 (async-function)

### 253. ui-advanced.js - toggleColorScheme

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2261 (function)
  2. שורה 2261 (async-function)

### 254. ui-advanced.js - loadColorScheme

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2279 (function)
  2. שורה 2279 (async-function)

### 255. ui-advanced.js - saveColorScheme

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2297 (function)
  2. שורה 2297 (async-function)

### 256. ui-advanced.js - getCurrentColorScheme

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2346 (function)
  2. שורה 2346 (async-function)

### 257. ui-advanced.js - loadDynamicColors

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 2565 (function)
  2. שורה 2565 (async-function)

### 258. ui-basic.js - cancelItem

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 358 (function)
  2. שורה 358 (async-function)

### 259. ui-basic.js - performItemCancellation

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 416 (function)
  2. שורה 416 (async-function)

### 260. ui-basic.js - enhancedTableRefresh

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 666 (function)
  2. שורה 666 (async-function)

### 261. ui-basic.js - handleApiResponseWithRefresh

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 704 (function)
  2. שורה 704 (async-function)

### 262. ui-basic.js - autoRefreshCurrentPage

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 824 (function)
  2. שורה 824 (async-function)

### 263. ui-basic.js - toggleTopSection

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1403 (function)
  2. שורה 1403 (async-function)

### 264. ui-basic.js - toggleAllSections

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1543 (function)
  2. שורה 1543 (async-function)

### 265. ui-basic.js - loadSectionStates

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1638 (function)
  2. שורה 1638 (async-function)

### 266. data-utils.js - loadCurrenciesFromServer

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 43 (function)
  2. שורה 43 (async-function)

### 267. data-utils.js - apiCall

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 165 (function)
  2. שורה 165 (async-function)

### 268. data-utils.js - loadDataFromAPI

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 195 (function)
  2. שורה 195 (async-function)

### 269. data-utils.js - getUserPreference

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 437 (function)
  2. שורה 437 (async-function)

### 270. validation-utils.js - validateWithConfirmation

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 660 (function)
  2. שורה 660 (async-function)

### 271. account-service.js - getAccounts

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 74 (function)
  2. שורה 74 (async-function)

### 272. account-service.js - getActiveAccounts

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 101 (function)
  2. שורה 101 (async-function)

### 273. account-service.js - getAccountsByStatus

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 118 (function)
  2. שורה 118 (async-function)

### 274. account-service.js - cancelAccount

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 135 (function)
  2. שורה 135 (async-function)

### 275. account-service.js - reactivateAccount

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 167 (function)
  2. שורה 167 (async-function)

### 276. account-service.js - getAccountById

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 199 (function)
  2. שורה 199 (async-function)

### 277. alert-service.js - cancelAlert

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 362 (function)
  2. שורה 362 (async-function)

### 278. alert-service.js - deleteAlert

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 417 (function)
  2. שורה 417 (async-function)

### 279. alert-service.js - performAlertDeletion

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 466 (function)
  2. שורה 466 (async-function)

### 280. alert-service.js - updateAlertStatus

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 504 (function)
  2. שורה 504 (async-function)

### 281. alert-service.js - updateMultipleAlertsStatus

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 582 (function)
  2. שורה 582 (async-function)

### 282. ticker-service.js - getTickers

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 88 (function)
  2. שורה 88 (async-function)

### 283. ticker-service.js - getTrades

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 116 (function)
  2. שורה 116 (async-function)

### 284. ticker-service.js - getTradePlans

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 144 (function)
  2. שורה 144 (async-function)

### 285. ticker-service.js - loadCache

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 171 (function)
  2. שורה 171 (async-function)

### 286. ticker-service.js - getTickersWithTrades

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 209 (function)
  2. שורה 209 (async-function)

### 287. ticker-service.js - getTickersWithPlans

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 244 (function)
  2. שורה 244 (async-function)

### 288. ticker-service.js - getRelevantTickers

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 285 (function)
  2. שורה 285 (async-function)

### 289. ticker-service.js - getTickersWithOpenOrClosedTradesAndPlans

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 337 (function)
  2. שורה 337 (async-function)

### 290. ticker-service.js - getTickersByType

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 388 (function)
  2. שורה 388 (async-function)

### 291. ticker-service.js - getTickersByActivity

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 423 (function)
  2. שורה 423 (async-function)

### 292. ticker-service.js - loadTickersForTradePlan

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 489 (function)
  2. שורה 489 (async-function)

### 293. ticker-service.js - saveTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 573 (function)
  2. שורה 573 (async-function)

### 294. ticker-service.js - updateTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 673 (function)
  2. שורה 673 (async-function)

### 295. ticker-service.js - deleteTicker

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 738 (function)
  2. שורה 738 (async-function)

### 296. ticker-service.js - updateTickerActiveTradesStatus

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 773 (function)
  2. שורה 773 (async-function)

### 297. ticker-service.js - updateAllActiveTradesStatuses

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 832 (function)
  2. שורה 832 (async-function)

### 298. ticker-service.js - updateAllTickerStatuses

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 893 (function)
  2. שורה 893 (async-function)

### 299. ticker-service.js - updateTickerFromTradePlan

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 956 (function)
  2. שורה 956 (async-function)

### 300. ticker-service.js - updateTickersListForClosedTrades

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1007 (function)
  2. שורה 1007 (async-function)

### 301. trade-plan-service.js - loadTradePlansData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 58 (function)
  2. שורה 58 (async-function)

### 302. constraints.js - performRealValidation

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 878 (function)
  2. שורה 878 (async-function)

### 303. constraints.js - checkDatabaseConstraint

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 938 (function)
  2. שורה 938 (async-function)

### 304. constraints.js - checkDataViolations

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 953 (function)
  2. שורה 953 (async-function)

### 305. constraints.js - validateConstraintData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 989 (function)
  2. שורה 989 (async-function)

### 306. constraints.js - validateNotNullConstraint

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1034 (function)
  2. שורה 1034 (async-function)

### 307. constraints.js - validateUniqueConstraint

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1043 (function)
  2. שורה 1043 (async-function)

### 308. constraints.js - validateCheckConstraint

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1052 (function)
  2. שורה 1052 (async-function)

### 309. constraints.js - validateEnumConstraint

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1061 (function)
  2. שורה 1061 (async-function)

### 310. constraints.js - validateForeignKeyConstraint

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1070 (function)
  2. שורה 1070 (async-function)

### 311. constraints.js - validateRangeConstraint

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1079 (function)
  2. שורה 1079 (async-function)

### 312. constraints.js - checkUIValidation

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1090 (function)
  2. שורה 1090 (async-function)

### 313. constraints.js - validateSingleConstraint

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1105 (function)
  2. שורה 1105 (async-function)

### 314. linked-items.js - loadLinkedItemsData

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1812 (function)
  2. שורה 1812 (async-function)

### 315. linked-items.js - checkLinkedItemsBeforeAction

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1837 (function)
  2. שורה 1837 (async-function)

### 316. linked-items.js - checkLinkedItemsAndPerformAction

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1876 (function)
  2. שורה 1876 (async-function)

### 317. external-data-settings-service.js - handleResponse

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 27 (function)
  2. שורה 27 (async-function)

### 318. external-data-settings-service.js - getSettings

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 49 (function)
  2. שורה 49 (async-function)

### 319. external-data-settings-service.js - saveSettings

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 62 (function)
  2. שורה 62 (async-function)

## 3. פונקציות מקומיות עם תחליף כללי (78)

### trades.js

1. **showDateValidationError** (שורה 1947)
   - תחליף כללי: `showErrorNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 17.4%
   - חומרה: LOW
2. **showAddTradeModal** (שורה 3087)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 29.4%
   - חומרה: LOW
3. **showEditTradeModal** (שורה 3111)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 22.2%
   - חומרה: LOW

### executions.js

1. **showExecutionLinkedItemsModal** (שורה 1063)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 13.8%
   - חומרה: LOW
2. **toggleTickersSection** (שורה 3777)
   - תחליף כללי: `toggleSection` (ui-utils.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 35.0%
   - חומרה: LOW
3. **toggleExecutionsSection** (שורה 3879)
   - תחליף כללי: `toggleSection` (ui-utils.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 26.1%
   - חומרה: LOW
4. **showAddExecutionModal** (שורה 3901)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 23.8%
   - חומרה: LOW
5. **showEditExecutionModal** (שורה 3915)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 18.2%
   - חומרה: LOW
6. **showExecutionLinkedItemsModal** (שורה 1063)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 13.8%
   - חומרה: LOW

### alerts.js

1. **updatePageSummaryStats** (שורה 850)
   - תחליף כללי: `updatePageSummaryStats` (services/statistics-calculator.js)
   - קטגוריה: DATA_LOADING
   - דמיון: 100.0%
   - חומרה: HIGH
2. **showAddAlertModal** (שורה 3490)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 41.2%
   - חומרה: LOW
3. **showEditAlertModal** (שורה 3504)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 22.2%
   - חומרה: LOW

### trade_plans.js

1. **showAddTradePlanModal** (שורה 2849)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 23.8%
   - חומרה: LOW
2. **showEditTradePlanModal** (שורה 2863)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 18.2%
   - חומרה: LOW

### cash_flows.js

1. **toggleCashFlowsSection** (שורה 314)
   - תחליף כללי: `toggleSection` (ui-utils.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 27.3%
   - חומרה: LOW
2. **updatePageSummaryStats** (שורה 871)
   - תחליף כללי: `updatePageSummaryStats` (services/statistics-calculator.js)
   - קטגוריה: DATA_LOADING
   - דמיון: 100.0%
   - חומרה: HIGH
3. **showAddCashFlowModal** (שורה 1634)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 25.0%
   - חומרה: LOW
4. **showEditCashFlowModal** (שורה 1650)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 19.0%
   - חומרה: LOW

### notes.js

1. **viewLinkedItems** (שורה 293)
   - תחליף כללי: `viewLinkedItems` (linked-items.js)
   - קטגוריה: DATA_LOADING
   - דמיון: 100.0%
   - חומרה: HIGH
2. **showAddNoteModal** (שורה 2198)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 31.3%
   - חומרה: LOW
3. **showEditNoteModal** (שורה 2212)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 23.5%
   - חומרה: LOW

### tickers.js

1. **clearTickersCache** (שורה 1476)
   - תחליף כללי: `clearAllCache` (unified-cache-manager.js)
   - קטגוריה: CACHE
   - דמיון: 29.4%
   - חומרה: LOW
2. **toggleTickersSection** (שורה 2131)
   - תחליף כללי: `toggleSection` (ui-utils.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 35.0%
   - חומרה: LOW
3. **showAddTickerModal** (שורה 2149)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 27.8%
   - חומרה: LOW
4. **showEditTickerModal** (שורה 2170)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 21.1%
   - חומרה: LOW

### trading_accounts.js

1. **showSuccessMessage** (שורה 1149)
   - תחליף כללי: `showSuccessNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 47.8%
   - חומרה: LOW
2. **showErrorMessage** (שורה 1161)
   - תחליף כללי: `showErrorNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 42.9%
   - חומרה: LOW
3. **sortTable** (שורה 2197)
   - תחליף כללי: `sortTable` (tables.js)
   - קטגוריה: DATA_LOADING
   - דמיון: 100.0%
   - חומרה: HIGH
4. **showAddTradingAccountModal** (שורה 2279)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 19.2%
   - חומרה: LOW
5. **showEditTradingAccountModal** (שורה 2295)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 14.8%
   - חומרה: LOW

### database.js

1. **formatDate** (שורה 431)
   - תחליף כללי: `formatDate` (date-utils.js)
   - קטגוריה: FORMATTING
   - דמיון: 100.0%
   - חומרה: HIGH

### business-module.js

1. **showEditTradeModal** (שורה 761)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 22.2%
   - חומרה: LOW
2. **showAddTradeModal** (שורה 1226)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 29.4%
   - חומרה: LOW
3. **showDateValidationError** (שורה 2119)
   - תחליף כללי: `showErrorNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 17.4%
   - חומרה: LOW
4. **showEditTradeModal** (שורה 761)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 22.2%
   - חומרה: LOW

### core-systems.js

1. **shouldShowNotification** (שורה 1333)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 22.7%
   - חומרה: LOW
2. **showNotification** (שורה 1434)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 100.0%
   - חומרה: HIGH
3. **showSuccessNotification** (שורה 1791)
   - תחליף כללי: `showSuccessNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 100.0%
   - חומרה: HIGH
4. **showErrorNotification** (שורה 1810)
   - תחליף כללי: `showErrorNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 100.0%
   - חומרה: HIGH
5. **showSimpleErrorNotification** (שורה 1846)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 18.5%
   - חומרה: LOW
6. **showFinalSuccessNotification** (שורה 1924)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 14.3%
   - חומרה: LOW
7. **showCriticalErrorNotification** (שורה 1991)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 13.8%
   - חומרה: LOW
8. **showFinalSuccessModal** (שורה 2234)
   - תחליף כללי: `showSuccessNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 21.7%
   - חומרה: LOW
9. **showFinalSuccessNotificationWithReload** (שורה 2313)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 10.5%
   - חומרה: LOW
10. **showFinalSuccessModalWithReload** (שורה 2365)
   - תחליף כללי: `showSuccessNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 16.1%
   - חומרה: LOW
11. **showCriticalErrorModal** (שורה 2479)
   - תחליף כללי: `showErrorNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 22.7%
   - חומרה: LOW
12. **showWarningNotification** (שורה 2677)
   - תחליף כללי: `showWarningNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 100.0%
   - חומרה: HIGH
13. **showInfoNotification** (שורה 2691)
   - תחליף כללי: `showInfoNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 100.0%
   - חומרה: HIGH
14. **showDetailsModal** (שורה 2704)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 31.3%
   - חומרה: LOW
15. **showNotificationLegacy** (שורה 2920)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 72.7%
   - חומרה: MEDIUM
16. **shouldShowNotification** (שורה 1333)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 22.7%
   - חומרה: LOW
17. **showNotification** (שורה 1434)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 100.0%
   - חומרה: HIGH
18. **showSuccessNotification** (שורה 1791)
   - תחליף כללי: `showSuccessNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 100.0%
   - חומרה: HIGH
19. **showErrorNotification** (שורה 1810)
   - תחליף כללי: `showErrorNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 100.0%
   - חומרה: HIGH
20. **showSimpleErrorNotification** (שורה 1846)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 18.5%
   - חומרה: LOW
21. **showFinalSuccessNotification** (שורה 1924)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 14.3%
   - חומרה: LOW
22. **showCriticalErrorNotification** (שורה 1991)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 13.8%
   - חומרה: LOW
23. **showFinalSuccessNotificationWithReload** (שורה 2313)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 10.5%
   - חומרה: LOW
24. **showCriticalErrorModal** (שורה 2479)
   - תחליף כללי: `showErrorNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 22.7%
   - חומרה: LOW
25. **showWarningNotification** (שורה 2677)
   - תחליף כללי: `showWarningNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 100.0%
   - חומרה: HIGH
26. **showInfoNotification** (שורה 2691)
   - תחליף כללי: `showInfoNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 100.0%
   - חומרה: HIGH
27. **showDetailsModal** (שורה 2704)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 31.3%
   - חומרה: LOW

### data-advanced.js

1. **isNumeric** (שורה 24)
   - תחליף כללי: `isNumeric` (data-utils.js)
   - קטגוריה: VALIDATION
   - דמיון: 100.0%
   - חומרה: HIGH
2. **clearUserPreferencesCache** (שורה 461)
   - תחליף כללי: `clearAllCache` (unified-cache-manager.js)
   - קטגוריה: CACHE
   - דמיון: 20.0%
   - חומרה: LOW

### data-basic.js

1. **sortTable** (שורה 1492)
   - תחליף כללי: `sortTable` (tables.js)
   - קטגוריה: DATA_LOADING
   - דמיון: 100.0%
   - חומרה: HIGH

### ui-basic.js

1. **showModal** (שורה 235)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 100.0%
   - חומרה: HIGH
2. **showSecondConfirmationModal** (שורה 638)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 14.8%
   - חומרה: LOW
3. **enhancedTableRefresh** (שורה 666)
   - תחליף כללי: `enhancedTableRefresh` (ui-utils.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 100.0%
   - חומרה: HIGH
4. **handleApiResponseWithRefresh** (שורה 704)
   - תחליף כללי: `handleApiResponseWithRefresh` (ui-utils.js)
   - קטגוריה: API
   - דמיון: 100.0%
   - חומרה: HIGH
5. **viewLinkedItems** (שורה 1274)
   - תחליף כללי: `viewLinkedItems` (linked-items.js)
   - קטגוריה: DATA_LOADING
   - דמיון: 100.0%
   - חומרה: HIGH
6. **toggleTopSection** (שורה 1403)
   - תחליף כללי: `toggleSection` (ui-utils.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 37.5%
   - חומרה: LOW
7. **toggleAllSections** (שורה 1543)
   - תחליף כללי: `toggleAllSections` (ui-utils.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 100.0%
   - חומרה: HIGH
8. **showFieldError** (שורה 1806)
   - תחליף כללי: `showErrorNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 19.0%
   - חומרה: LOW
9. **showFieldSuccess** (שורה 1836)
   - תחליף כללי: `showSuccessNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 21.7%
   - חומרה: LOW
10. **enhancedTableRefresh** (שורה 666)
   - תחליף כללי: `enhancedTableRefresh` (ui-utils.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 100.0%
   - חומרה: HIGH
11. **handleApiResponseWithRefresh** (שורה 704)
   - תחליף כללי: `handleApiResponseWithRefresh` (ui-utils.js)
   - קטגוריה: API
   - דמיון: 100.0%
   - חומרה: HIGH
12. **toggleTopSection** (שורה 1403)
   - תחליף כללי: `toggleSection` (ui-utils.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 37.5%
   - חומרה: LOW
13. **toggleAllSections** (שורה 1543)
   - תחליף כללי: `toggleAllSections` (ui-utils.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 100.0%
   - חומרה: HIGH

