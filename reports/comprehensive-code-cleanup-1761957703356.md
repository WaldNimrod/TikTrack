# דוח מקיף לניקוי קוד כפול ופונקציות לא בשימוש

**תאריך**: 1.11.2025, 2:41:43

---

## סיכום

- **סה"כ קבצים**: 61
- **סה"כ פונקציות**: 840
- **פונקציות לא בשימוש**: 12
- **קבוצות כפולות**: 6
- **פונקציות מקומיות עם תחליף כללי**: 12

## המלצות

### 1. Unused functions found (HIGH)

- **כמות**: 12
- **קבצים מעורבים**: trade_plans.js, cash_flows.js, notes.js, translation-utils.js, core-systems.js, ui-advanced.js, date-utils.js
- **פעולה מומלצת**: Review and remove unused functions to reduce code complexity

### 2. Duplicate functions found within files (HIGH)

- **כמות**: 6
- **קבצים מעורבים**: trades.js, alerts.js, trade_plans.js, tickers.js
- **פעולה מומלצת**: Consolidate duplicate functions into single implementation

### 3. Local functions with global alternatives found (MEDIUM)

- **כמות**: 12
- **קבצים מעורבים**: core-systems.js, data-advanced.js
- **פעולה מומלצת**: Replace local functions with global system functions for consistency

## 1. פונקציות לא בשימוש (12)

### trade_plans.js

1. **hasActiveFilters** (שורה 2059, arrow) - MEDIUM

### cash_flows.js

1. **validateCashFlowAmount** (שורה 377, function) - HIGH
2. **validateCashFlowDate** (שורה 390, function) - HIGH

### notes.js

1. **getFieldByErrorId** (שורה 1187, function) - HIGH

### translation-utils.js

1. **translateAlertConditionById** (שורה 730, function) - HIGH

### core-systems.js

1. **showFinalSuccessNotification** (שורה 1853, function) - HIGH
2. **showFinalSuccessNotificationWithReload** (שורה 2242, function) - HIGH
3. **showNotificationLegacy** (שורה 2825, function) - HIGH

### ui-advanced.js

1. **loadStatusColorsFromPreferences** (שורה 310, function) - HIGH
2. **loadInvestmentTypeColorsFromPreferences** (שורה 324, function) - HIGH
3. **updateNumericValueColors** (שורה 1230, function) - HIGH

### date-utils.js

1. **initializeDateUtils** (שורה 577, function) - HIGH

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

