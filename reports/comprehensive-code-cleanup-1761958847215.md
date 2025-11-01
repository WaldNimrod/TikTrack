# דוח מקיף לניקוי קוד כפול ופונקציות לא בשימוש

**תאריך**: 1.11.2025, 3:00:47

---

## סיכום

- **סה"כ קבצים**: 61
- **סה"כ פונקציות**: 826
- **פונקציות לא בשימוש**: 1
- **קבוצות כפולות**: 4
- **פונקציות מקומיות עם תחליף כללי**: 10

## המלצות

### 1. Unused functions found (HIGH)

- **כמות**: 1
- **קבצים מעורבים**: trade_plans.js
- **פעולה מומלצת**: Review and remove unused functions to reduce code complexity

### 2. Duplicate functions found within files (HIGH)

- **כמות**: 4
- **קבצים מעורבים**: trades.js, alerts.js, trade_plans.js, tickers.js
- **פעולה מומלצת**: Consolidate duplicate functions into single implementation

### 3. Local functions with global alternatives found (MEDIUM)

- **כמות**: 10
- **קבצים מעורבים**: core-systems.js, data-advanced.js
- **פעולה מומלצת**: Replace local functions with global system functions for consistency

## 1. פונקציות לא בשימוש (1)

### trade_plans.js

1. **hasActiveFilters** (שורה 2059, arrow) - MEDIUM

## 2. פונקציות כפולות בתוך קובץ (4)

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

### 4. tickers.js - onSuccess

- **כמות כפילויות**: 3
- **מיקומים**:
  1. שורה 1016 (arrow-method)
  2. שורה 1324 (arrow-method)
  3. שורה 1373 (arrow-method)

## 3. פונקציות מקומיות עם תחליף כללי (10)

### core-systems.js

1. **shouldShowNotification** (שורה 1310)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 22.7%
   - חומרה: LOW
2. **showSimpleErrorNotification** (שורה 1504)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 18.5%
   - חומרה: LOW
3. **showFinalSuccessNotification** (שורה 1586)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 14.3%
   - חומרה: LOW
4. **showCriticalErrorNotification** (שורה 1653)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 13.8%
   - חומרה: LOW
5. **showFinalSuccessModal** (שורה 1896)
   - תחליף כללי: `showSuccessNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 21.7%
   - חומרה: LOW
6. **showFinalSuccessNotificationWithReload** (שורה 1975)
   - תחליף כללי: `showNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 10.5%
   - חומרה: LOW
7. **showFinalSuccessModalWithReload** (שורה 2027)
   - תחליף כללי: `showSuccessNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 16.1%
   - חומרה: LOW
8. **showCriticalErrorModal** (שורה 2141)
   - תחליף כללי: `showErrorNotification` (notification-system.js)
   - קטגוריה: NOTIFICATION
   - דמיון: 22.7%
   - חומרה: LOW
9. **showDetailsModal** (שורה 2342)
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

