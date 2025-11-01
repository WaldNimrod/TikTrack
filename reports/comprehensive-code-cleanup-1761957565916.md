# דוח מקיף לניקוי קוד כפול ופונקציות לא בשימוש

**תאריך**: 1.11.2025, 2:39:25

---

## סיכום

- **סה"כ קבצים**: 61
- **סה"כ פונקציות**: 869
- **פונקציות לא בשימוש**: 131
- **קבוצות כפולות**: 6
- **פונקציות מקומיות עם תחליף כללי**: 12

## המלצות

### 1. Unused functions found (HIGH)

- **כמות**: 131
- **קבצים מעורבים**: index.js, trades.js, executions.js, alerts.js, trade_plans.js, cash_flows.js, notes.js, tickers.js, database.js, notification-system.js, logger-service.js, header-system.js, translation-utils.js, color-scheme-system.js, pagination-system.js, actions-menu-system.js, business-module.js, core-systems.js, ui-advanced.js, date-utils.js, preferences-ui.js, constraints.js, linked-items.js, external-data-settings-service.js
- **פעולה מומלצת**: Review and remove unused functions to reduce code complexity

### 2. Duplicate functions found within files (HIGH)

- **כמות**: 6
- **קבצים מעורבים**: trades.js, alerts.js, trade_plans.js, tickers.js
- **פעולה מומלצת**: Consolidate duplicate functions into single implementation

### 3. Local functions with global alternatives found (MEDIUM)

- **כמות**: 12
- **קבצים מעורבים**: core-systems.js, data-advanced.js
- **פעולה מומלצת**: Replace local functions with global system functions for consistency

## 1. פונקציות לא בשימוש (131)

### index.js

1. **createTradesStatusChart** (שורה 145, function) - HIGH
2. **createPerformanceChart** (שורה 188, function) - HIGH
3. **createAccountChart** (שורה 229, function) - HIGH
4. **createMixedChart** (שורה 270, function) - HIGH

### trades.js

1. **loadTickerDataForTrades** (שורה 522, function) - HIGH

### executions.js

1. **updateRealizedPLField** (שורה 214, function) - HIGH
2. **setupModalConfigurations** (שורה 1610, function) - HIGH
3. **toggleExecutionFormFields** (שורה 2069, function) - HIGH
4. **displayExecutionTickerInfo** (שורה 2170, function) - HIGH
5. **calculateExecutionValues** (שורה 2249, function) - HIGH
6. **applyAccountFilterWithTradesData** (שורה 2669, function) - HIGH
7. **updateExecutionsGlobalData** (שורה 2833, function) - HIGH
8. **performExecutionDeletion** (שורה 3321, function) - HIGH
9. **trySetTradeValue** (שורה 269, arrow) - MEDIUM

### alerts.js

1. **getConditionSourceDisplay** (שורה 452, function) - HIGH
2. **updatePageSummaryStats_LEGACY** (שורה 711, function) - HIGH
3. **toggleConditionFields** (שורה 1041, function) - HIGH
4. **enableEditConditionFields** (שורה 1104, function) - HIGH
5. **disableEditConditionFields** (שורה 1112, function) - HIGH
6. **deleteAlertInternal** (שורה 1708, function) - HIGH
7. **confirmDeleteAlert** (שורה 1741, function) - HIGH
8. **filterAlertsByRelatedObjectTypeWrapper** (שורה 1877, function) - HIGH
9. **displayAvailableConditions** (שורה 2610, function) - HIGH
10. **refreshConditionEvaluations** (שורה 2829, function) - HIGH
11. **showEvaluationLoading** (שורה 2866, function) - HIGH
12. **displayEvaluationResults** (שורה 2887, function) - HIGH
13. **updateEvaluationSummary** (שורה 2913, function) - HIGH
14. **getMethodIdFromCondition** (שורה 2985, function) - HIGH

### trade_plans.js

1. **openCancelTradePlanModal** (שורה 1550, function) - HIGH
2. **saveTradePlan** (שורה 2941, function) - HIGH
3. **hasActiveFilters** (שורה 2059, arrow) - MEDIUM
4. **initializeFormValidation** (שורה 2501, arrow) - MEDIUM

### cash_flows.js

1. **ensureTradingAccountsLoaded** (שורה 280, function) - HIGH
2. **validateCashFlowAmount** (שורה 377, function) - HIGH
3. **validateCashFlowDate** (שורה 390, function) - HIGH

### notes.js

1. **validateNoteForm** (שורה 886, function) - HIGH
2. **clearNoteValidationErrors** (שורה 1159, function) - HIGH
3. **getFieldByErrorId** (שורה 1187, function) - HIGH
4. **insertLink** (שורה 1520, arrow) - MEDIUM

### tickers.js

1. **getTimeDuration** (שורה 346, function) - HIGH
2. **tryLoadData** (שורה 1993, function) - HIGH
3. **filterTickersByType** (שורה 2098, function) - HIGH

### database.js

1. **fetchTableData** (שורה 195, function) - HIGH
2. **updateTableDisplay** (שורה 223, function) - HIGH
3. **createTableBodyHTML** (שורה 279, function) - HIGH
4. **formatCellValue** (שורה 313, function) - HIGH
5. **applySortingFunctionality** (שורה 345, function) - HIGH
6. **updateTableInfo** (שורה 387, function) - HIGH
7. **formatStatus** (שורה 477, function) - HIGH

### notification-system.js

1. **isPrimarySeverity** (שורה 106, function) - HIGH
2. **shouldShowInMode** (שורה 176, function) - HIGH

### logger-service.js

1. **critical** (שורה 8, arrow-method) - MEDIUM

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

### translation-utils.js

1. **translateAlertConditionById** (שורה 730, function) - HIGH

### color-scheme-system.js

1. **lightenColor** (שורה 186, function) - HIGH
2. **findPageClass** (שורה 750, function) - HIGH
3. **getEntityColorPref** (שורה 704, arrow) - MEDIUM

### pagination-system.js

1. **destroy** (שורה 67, method) - HIGH

### actions-menu-system.js

1. **checkOverflow** (שורה 194, arrow) - MEDIUM

### business-module.js

1. **addInvestmentTypeColorLegend** (שורה 152, function) - HIGH

### core-systems.js

1. **detectPageInfo** (שורה 715, function) - HIGH
2. **detectAvailableSystems** (שורה 743, function) - HIGH
3. **analyzePageRequirements** (שורה 771, function) - HIGH
4. **determinePageType** (שורה 779, function) - HIGH
5. **requiresFilters** (שורה 790, function) - HIGH
6. **requiresValidation** (שורה 801, function) - HIGH
7. **requiresTables** (שורה 812, function) - HIGH
8. **requiresCharts** (שורה 824, function) - HIGH
9. **initializeCacheSystem** (שורה 831, function) - HIGH
10. **generateNotificationId** (שורה 1155, function) - HIGH
11. **createDetailedErrorMessage** (שורה 1953, function) - HIGH
12. **showFinalSuccessModal** (שורה 2163, function) - HIGH
13. **showFinalSuccessModalWithReload** (שורה 2294, function) - HIGH
14. **showCriticalErrorModal** (שורה 2408, function) - HIGH
15. **showNotificationLegacy** (שורה 2825, function) - HIGH
16. **formatSuccessForCopy** (שורה 3092, function) - HIGH

### ui-advanced.js

1. **loadStatusColorsFromPreferences** (שורה 310, function) - HIGH
2. **loadInvestmentTypeColorsFromPreferences** (שורה 324, function) - HIGH
3. **getInvestmentTypeBackgroundColorWrapper3** (שורה 570, function) - HIGH
4. **getInvestmentTypeEntityType** (שורה 618, function) - HIGH
5. **updateNumericValueColors** (שורה 1230, function) - HIGH
6. **getContrastColor** (שורה 1387, function) - HIGH
7. **toHex** (שורה 931, arrow) - MEDIUM
8. **getEntityColorFromPrefs** (שורה 2175, arrow) - MEDIUM
9. **ensureVar** (שורה 2210, arrow) - MEDIUM

### date-utils.js

1. **initializeDateUtils** (שורה 577, function) - HIGH

### preferences-ui.js

1. **showDefaultProfileWarning** (שורה 1551, function) - HIGH
2. **hideDefaultProfileWarning** (שורה 1577, function) - HIGH

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

### linked-items.js

1. **createLinkedItemsList** (שורה 557, function) - HIGH
2. **getRulesExplanation** (שורה 619, function) - HIGH
3. **getTradePlanDetails** (שורה 802, function) - HIGH
4. **createBasicItemInfo** (שורה 937, function) - HIGH
5. **createModal** (שורה 954, function) - HIGH
6. **createTradeDetails** (שורה 1039, function) - HIGH
7. **createAccountDetails** (שורה 1063, function) - HIGH
8. **createTickerDetails** (שורה 1076, function) - HIGH
9. **createAlertDetails** (שורה 1100, function) - HIGH
10. **createCashFlowDetails** (שורה 1141, function) - HIGH
11. **createNoteDetails** (שורה 1163, function) - HIGH
12. **createTradePlanDetails** (שורה 1180, function) - HIGH
13. **createExecutionDetails** (שורה 1194, function) - HIGH
14. **openItemPage** (שורה 1398, function) - HIGH

### external-data-settings-service.js

1. **handleResponse** (שורה 27, function) - HIGH

## 2. פונקציות כפולות בתוך קובץ (6)

### 1. trades.js - if

- **כמות כפילויות**: 3
- **מיקומים**:
  1. שורה 368 (function)
  2. שורה 481 (function)
  3. שורה 2114 (function)

### 2. alerts.js - if

- **כמות כפילויות**: 3
- **מיקומים**:
  1. שורה 718 (function)
  2. שורה 2356 (function)
  3. שורה 3107 (function)

### 3. trade_plans.js - if

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 583 (function)
  2. שורה 1863 (function)

### 4. trade_plans.js - updatePricesFromPercentages

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1642 (arrow)
  2. שורה 1736 (arrow)

### 5. trade_plans.js - updatePercentagesFromPrices

- **כמות כפילויות**: 2
- **מיקומים**:
  1. שורה 1664 (arrow)
  2. שורה 1758 (arrow)

### 6. tickers.js - onSuccess

- **כמות כפילויות**: 3
- **מיקומים**:
  1. שורה 1016 (arrow-method)
  2. שורה 1324 (arrow-method)
  3. שורה 1373 (arrow-method)

## 3. פונקציות מקומיות עם תחליף כללי (12)

### core-systems.js

1. **shouldShowNotification** (שורה 1310)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 22.7%
   - חומרה: LOW
2. **showNotification** (שורה 1411)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 100.0%
   - חומרה: HIGH
3. **showSimpleErrorNotification** (שורה 1775)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 18.5%
   - חומרה: LOW
4. **showFinalSuccessNotification** (שורה 1853)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 14.3%
   - חומרה: LOW
5. **showCriticalErrorNotification** (שורה 1920)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 13.8%
   - חומרה: LOW
6. **showFinalSuccessModal** (שורה 2163)
   - תחליף כללי: `showSuccessNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 21.7%
   - חומרה: LOW
7. **showFinalSuccessNotificationWithReload** (שורה 2242)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 10.5%
   - חומרה: LOW
8. **showFinalSuccessModalWithReload** (שורה 2294)
   - תחליף כללי: `showSuccessNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 16.1%
   - חומרה: LOW
9. **showCriticalErrorModal** (שורה 2408)
   - תחליף כללי: `showErrorNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 22.7%
   - חומרה: LOW
10. **showDetailsModal** (שורה 2609)
   - תחליף כללי: `showModal` (modal-manager-v2.js)
   - קטגוריה: UI_MANAGEMENT
   - דמיון: 31.3%
   - חומרה: LOW
11. **showNotificationLegacy** (שורה 2825)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 72.7%
   - חומרה: MEDIUM

### data-advanced.js

1. **clearUserPreferencesCache** (שורה 460)
   - תחליף כללי: `clearAllCache` (unified-cache-manager.js)
   - קטגוריה: CACHE
   - דמיון: 20.0%
   - חומרה: LOW

