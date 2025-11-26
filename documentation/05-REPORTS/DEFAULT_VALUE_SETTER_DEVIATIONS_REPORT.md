# דוח סטיות - Default Value Setter
## Default Value Setter Deviations Report

**תאריך:** 1764123259.2371323

**סה"כ קבצים נסרקים:** 315
**קבצים עם סטיות:** 106
**סה"כ סטיות:** 582

---

## trading-ui/scripts/account-activity.js

**סה"כ סטיות:** 9

### date_formatting - HIGH

- **שורה:** 1143
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
window.Logger.info(`  - תאריך התחלה: ${startDate ? startDate.toISOString().split('T')[0] : 'null'}`, { page: 'trading_accounts' });
```

### date_formatting - HIGH

- **שורה:** 1144
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
window.Logger.info(`  - תאריך סיום: ${endDate ? endDate.toISOString().split('T')[0] : 'null'}`, { page: 'trading_accounts' });
```

### date_formatting - HIGH

- **שורה:** 1149
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
window.Logger.info(`  - תאריך פתיחת חשבון: ${accountOpeningDate ? accountOpeningDate.toISOString().split('T')[0] : 'null'}`, { page: 'trading_accounts' });
```

### date_formatting - HIGH

- **שורה:** 1186
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
window.Logger.info(`  - stats.dateRange: start=${startDate ? new Date(startDate).toISOString().split('T')[0] : 'null'}, end=${endDate ? new Date(endDate).toISOString().split('T')[0] : 'null'}`, { page: 'trading_accounts' });
```

### date_formatting - HIGH

- **שורה:** 1186
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
window.Logger.info(`  - stats.dateRange: start=${startDate ? new Date(startDate).toISOString().split('T')[0] : 'null'}, end=${endDate ? new Date(endDate).toISOString().split('T')[0] : 'null'}`, { page: 'trading_accounts' });
```

### date_formatting - HIGH

- **שורה:** 1762
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
window.Logger.info(`  - Using full date range for annualization: ${daysForAnnual} days (from ${stats.dateRange.start ? new Date(stats.dateRange.start).toISOString().split('T')[0] : 'null'} to ${stats.dateRange.end ? new Date(stats.dateRange.end).toISOString().split('T')[0] : 'null'})`, { page: 'trading_accounts' });
```

### date_formatting - HIGH

- **שורה:** 1762
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
window.Logger.info(`  - Using full date range for annualization: ${daysForAnnual} days (from ${stats.dateRange.start ? new Date(stats.dateRange.start).toISOString().split('T')[0] : 'null'} to ${stats.dateRange.end ? new Date(stats.dateRange.end).toISOString().split('T')[0] : 'null'})`, { page: 'trading_accounts' });
```

### date_formatting - HIGH

- **שורה:** 1847
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
window.Logger.info(`  - Using full date range for annualization: ${daysForAnnual} days (from ${stats.dateRange.start ? new Date(stats.dateRange.start).toISOString().split('T')[0] : 'null'} to ${stats.dateRange.end ? new Date(stats.dateRange.end).toISOString().split('T')[0] : 'null'})`, { page: 'trading_accounts' });
```

### date_formatting - HIGH

- **שורה:** 1847
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
window.Logger.info(`  - Using full date range for annualization: ${daysForAnnual} days (from ${stats.dateRange.start ? new Date(stats.dateRange.start).toISOString().split('T')[0] : 'null'} to ${stats.dateRange.end ? new Date(stats.dateRange.end).toISOString().split('T')[0] : 'null'})`, { page: 'trading_accounts' });
```

## trading-ui/scripts/active-alerts-component.js

**סה"כ סטיות:** 2

### date_formatting - HIGH

- **שורה:** 1215
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
utc: date.toISOString(),
```

### date_formatting - HIGH

- **שורה:** 1391
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
iso: date.toISOString(),
```

## trading-ui/scripts/alerts.js

**סה"כ סטיות:** 5

### date_formatting - HIGH

- **שורה:** 3480
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
```

### date_formatting - HIGH

- **שורה:** 3480
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
```

### date_formatting - HIGH

- **שורה:** 3480
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
```

### date_formatting - HIGH

- **שורה:** 3482
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
startOfTomorrow.setDate(startOfToday.getDate() + 1);
```

### date_formatting - HIGH

- **שורה:** 3484
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
weekAgo.setDate(weekAgo.getDate() - 7);
```

## trading-ui/scripts/auth.js

**סה"כ סטיות:** 1

### logical_default_assignment - MEDIUM

- **שורה:** 117
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
if (rememberMeField) {rememberMeField.checked = true;}
```

## trading-ui/scripts/background-tasks.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 1110
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
log.push(`Server Time: ${new Date().toISOString()}`);
```

## trading-ui/scripts/button-system-init.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 60
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const timestamp = new Date().toISOString();
```

## trading-ui/scripts/cache-clear-menu.js

**סה"כ סטיות:** 2

### date_formatting - HIGH

- **שורה:** 413
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 481
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: metadata.timestamp || new Date().toISOString(),
```

## trading-ui/scripts/cache-management.js

**סה"כ סטיות:** 5

### date_formatting - HIGH

- **שורה:** 99
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 727
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
a.download = `cache-data-${new Date().toISOString().slice(0, 10)}.json`;
```

### date_slicing - HIGH

- **שורה:** 727
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
a.download = `cache-data-${new Date().toISOString().slice(0, 10)}.json`;
```

### date_formatting - HIGH

- **שורה:** 840
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 883
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

## trading-ui/scripts/calendar/calendar-data-loader.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 264
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
return d.getDate();
```

## trading-ui/scripts/calendar/calendar-date-utils.js

**סה"כ סטיות:** 6

### date_formatting - HIGH

- **שורה:** 39
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
return new Date(year, month + 1, 0).getDate();
```

### date_formatting - HIGH

- **שורה:** 53
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
today.getDate() === day;
```

### date_formatting - HIGH

- **שורה:** 83
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
year: newDate.getFullYear(),
```

### date_formatting - HIGH

- **שורה:** 84
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
month: newDate.getMonth()
```

### date_formatting - HIGH

- **שורה:** 180
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
return date.getFullYear() === year && date.getMonth() === month;
```

### date_formatting - HIGH

- **שורה:** 180
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
return date.getFullYear() === year && date.getMonth() === month;
```

## trading-ui/scripts/calendar/calendar-renderer.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 62
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
new Date(year, month + 1, 0).getDate();
```

## trading-ui/scripts/cash_flows.js

**סה"כ סטיות:** 4

### date_formatting - HIGH

- **שורה:** 857
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
```

### date_formatting - HIGH

- **שורה:** 857
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
```

### date_formatting - HIGH

- **שורה:** 857
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
```

### date_formatting - HIGH

- **שורה:** 3173
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const day = String(d.getDate()).padStart(2, '0');
```

## trading-ui/scripts/charts/adapters/performance-adapter.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 108
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
date.setDate(date.getDate() - i);
```

## trading-ui/scripts/charts/adapters/trades-adapter.js

**סה"כ סטיות:** 2

### date_formatting - HIGH

- **שורה:** 148
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
```

### date_formatting - HIGH

- **שורה:** 148
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
```

## trading-ui/scripts/comparative-analysis-page.js

**סה"כ סטיות:** 47

### date_formatting - HIGH

- **שורה:** 211
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
dateRangeStart: start ? start.toISOString().split('T')[0] : '',
```

### date_formatting - HIGH

- **שורה:** 212
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
dateRangeEnd: end ? end.toISOString().split('T')[0] : ''
```

### date_formatting - HIGH

- **שורה:** 420
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const yearStart = new Date(today.getFullYear(), 0, 1);
```

### date_formatting - HIGH

- **שורה:** 442
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(today.getDate() - 1);
```

### date_formatting - HIGH

- **שורה:** 449
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(today.getDate() - dayOfWeek);
```

### date_formatting - HIGH

- **שורה:** 455
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(today.getDate() - 7);
```

### date_formatting - HIGH

- **שורה:** 461
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
lastWeekEnd.setDate(today.getDate() - dayOfWeek - 1);
```

### date_formatting - HIGH

- **שורה:** 465
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(lastWeekEnd.getDate() - 6);
```

### date_formatting - HIGH

- **שורה:** 471
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start = new Date(today.getFullYear(), today.getMonth(), 1);
```

### date_formatting - HIGH

- **שורה:** 471
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start = new Date(today.getFullYear(), today.getMonth(), 1);
```

### date_formatting - HIGH

- **שורה:** 477
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(today.getDate() - 30);
```

### date_formatting - HIGH

- **שורה:** 481
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
```

### date_formatting - HIGH

- **שורה:** 481
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
```

### date_formatting - HIGH

- **שורה:** 482
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
```

### date_formatting - HIGH

- **שורה:** 482
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
```

### date_formatting - HIGH

- **שורה:** 490
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start = new Date(today.getFullYear(), 0, 1);
```

### date_formatting - HIGH

- **שורה:** 496
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(today.getDate() - 365);
```

### date_formatting - HIGH

- **שורה:** 500
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
```

### date_formatting - HIGH

- **שורה:** 501
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
```

### date_formatting - HIGH

- **שורה:** 3345
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
link.setAttribute('download', `comparative-analysis-${new Date().toISOString().split('T')[0]}.csv`);
```

### logical_default_assignment - MEDIUM

- **שורה:** 2436
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('recordFilterWithPlan').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 2439
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('recordFilterWithoutPlan').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 2500
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('recordFilterWithPlan').checked = true;
```

### logical_default_assignment - MEDIUM

- **שורה:** 2503
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('recordFilterWithoutPlan').checked = true;
```

### logical_default_assignment - MEDIUM

- **שורה:** 2575
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
withPlan.checked = true;
```

### logical_default_assignment - MEDIUM

- **שורה:** 2576
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
withoutPlan.checked = true;
```

### logical_default_assignment - MEDIUM

- **שורה:** 2647
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('compareByInvestmentType').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 2648
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('compareByTradingMethods').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 2649
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('compareByTicker').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 2650
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('compareByPlan').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 2651
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('compareByTags').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 2665
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('comparisonWithPlan').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 2666
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('comparisonWithoutPlan').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 2685
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('compareByInvestmentType').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 2686
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('compareByTradingMethods').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 2687
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('compareByTicker').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 2688
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('compareByPlan').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 2689
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('compareByTags').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 2722
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('comparisonWithPlan').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 2723
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('comparisonWithoutPlan').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 3228
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('withPlan').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 3231
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('withoutPlan').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 3298
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('withPlan').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 3301
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('withoutPlan').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 3609
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('recordFilterWithPlan').checked = true;
```

### logical_default_assignment - MEDIUM

- **שורה:** 3612
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('recordFilterWithoutPlan').checked = true;
```

### logical_default_assignment - MEDIUM

- **שורה:** 3628
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
compareByInvestmentType.checked = true;
```

## trading-ui/scripts/conditions-test.js

**סה"כ סטיות:** 1

### logical_default_assignment - MEDIUM

- **שורה:** 1327
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('isActive').checked = true;
```

## trading-ui/scripts/crud-testing-enhanced.js

**סה"כ סטיות:** 10

### date_formatting - HIGH

- **שורה:** 202
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
date: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 225
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
date: new Date().toISOString().split('T')[0],
```

### date_formatting - HIGH

- **שורה:** 546
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 750
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 879
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 1591
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
savedAt: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 1819
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
prev.deepTesting = { timestamp: new Date().toISOString(), results };
```

### date_formatting - HIGH

- **שורה:** 1955
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
`crud-test-report-${new Date().toISOString().split('T')[0]}.html`,
```

### date_formatting - HIGH

- **שורה:** 1980
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
`crud-test-report-${new Date().toISOString().split('T')[0]}.md`,
```

### date_formatting - HIGH

- **שורה:** 2032
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
downloadFile(csv, `crud-test-report-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
```

## trading-ui/scripts/css-management.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 1176
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
```

## trading-ui/scripts/data_import.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 145
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const iso = dateObj.toISOString();
```

## trading-ui/scripts/date-comparison-modal.js

**סה"כ סטיות:** 24

### date_formatting - HIGH

- **שורה:** 1351
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
currentDate.setDate(date1Obj.getDate() + i);
```

### date_formatting - HIGH

- **שורה:** 1354
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const year = currentDate.getFullYear();
```

### date_formatting - HIGH

- **שורה:** 1355
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const month = String(currentDate.getMonth() + 1).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 1356
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const day = String(currentDate.getDate()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 1558
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const year = date.getFullYear();
```

### date_formatting - HIGH

- **שורה:** 1559
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const month = String(date.getMonth() + 1).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 1560
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const day = String(date.getDate()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 1616
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(today.getDate() - 2); // Day before yesterday
```

### date_formatting - HIGH

- **שורה:** 1618
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
end.setDate(today.getDate() - 1); // Yesterday
```

### date_formatting - HIGH

- **שורה:** 1624
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(today.getDate() - dayOfWeek);
```

### date_formatting - HIGH

- **שורה:** 1630
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(today.getDate() - 7);
```

### date_formatting - HIGH

- **שורה:** 1636
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
lastWeekEnd.setDate(today.getDate() - dayOfWeek - 1);
```

### date_formatting - HIGH

- **שורה:** 1640
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(lastWeekEnd.getDate() - 6);
```

### date_formatting - HIGH

- **שורה:** 1646
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start = new Date(today.getFullYear(), today.getMonth(), 1);
```

### date_formatting - HIGH

- **שורה:** 1646
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start = new Date(today.getFullYear(), today.getMonth(), 1);
```

### date_formatting - HIGH

- **שורה:** 1652
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(today.getDate() - 30);
```

### date_formatting - HIGH

- **שורה:** 1656
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
```

### date_formatting - HIGH

- **שורה:** 1656
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
```

### date_formatting - HIGH

- **שורה:** 1657
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
```

### date_formatting - HIGH

- **שורה:** 1657
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
```

### date_formatting - HIGH

- **שורה:** 1665
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start = new Date(today.getFullYear(), 0, 1);
```

### date_formatting - HIGH

- **שורה:** 1671
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(today.getDate() - 365);
```

### date_formatting - HIGH

- **שורה:** 1675
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
```

### date_formatting - HIGH

- **שורה:** 1676
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
```

## trading-ui/scripts/date-utils.js

**סה"כ סטיות:** 27

### date_formatting - HIGH

- **שורה:** 327
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const day = String(dateObj.getDate()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 328
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const month = String(dateObj.getMonth() + 1).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 330
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
? String(dateObj.getFullYear()).slice(-2)
```

### date_formatting - HIGH

- **שורה:** 331
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
: String(dateObj.getFullYear());
```

### date_formatting - HIGH

- **שורה:** 348
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const hours = String(dateObj.getHours()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 349
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const minutes = String(dateObj.getMinutes()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 385
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
utc: dateObj.toISOString(),
```

### date_formatting - HIGH

- **שורה:** 932
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
dateObj.setDate(dateObj.getDate() + days);
```

### date_formatting - HIGH

- **שורה:** 956
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
dateObj.setMonth(dateObj.getMonth() + months);
```

### date_formatting - HIGH

- **שורה:** 1072
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
yesterday.setDate(today.getDate() - 1);
```

### date_formatting - HIGH

- **שורה:** 1083
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
startOfWeek.setDate(today.getDate() - dayOfWeek);
```

### date_formatting - HIGH

- **שורה:** 1095
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
weekAgo.setDate(today.getDate() - 7);
```

### date_formatting - HIGH

- **שורה:** 1107
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
lastWeekEnd.setDate(today.getDate() - dayOfWeek - 1); // Last Saturday
```

### date_formatting - HIGH

- **שורה:** 1110
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
lastWeekStart.setDate(lastWeekEnd.getDate() - 6); // Previous Sunday
```

### date_formatting - HIGH

- **שורה:** 1119
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
```

### date_formatting - HIGH

- **שורה:** 1119
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
```

### date_formatting - HIGH

- **שורה:** 1131
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
monthAgo.setDate(today.getDate() - 30);
```

### date_formatting - HIGH

- **שורה:** 1140
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
```

### date_formatting - HIGH

- **שורה:** 1140
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
```

### date_formatting - HIGH

- **שורה:** 1142
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of previous month
```

### date_formatting - HIGH

- **שורה:** 1142
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of previous month
```

### date_formatting - HIGH

- **שורה:** 1151
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const startOfYear = new Date(today.getFullYear(), 0, 1);
```

### date_formatting - HIGH

- **שורה:** 1163
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
yearAgo.setDate(today.getDate() - 365);
```

### date_formatting - HIGH

- **שורה:** 1173
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
```

### date_formatting - HIGH

- **שורה:** 1175
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
```

### date_formatting - HIGH

- **שורה:** 1188
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
startDate: startDate.toISOString(),
```

### date_formatting - HIGH

- **שורה:** 1189
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
endDate: endDate.toISOString()
```

## trading-ui/scripts/debug/missing-functions-scanner.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 63
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/debug-execution-ticker-complete.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 20
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/debug-execution-ticker-loading.js

**סה"כ סטיות:** 4

### date_formatting - HIGH

- **שורה:** 10
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
console.log('📅 Start time:', new Date().toISOString());
```

### date_formatting - HIGH

- **שורה:** 13
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
startTime: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 32
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
time: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 243
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
report.endTime = new Date().toISOString();
```

## trading-ui/scripts/debug-filter-tooltips-comprehensive.js

**סה"כ סטיות:** 12

### date_formatting - HIGH

- **שורה:** 21
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 38
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const timestamp = new Date().toISOString();
```

### date_formatting - HIGH

- **שורה:** 45
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const timestamp = new Date().toISOString();
```

### date_formatting - HIGH

- **שורה:** 52
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const timestamp = new Date().toISOString();
```

### date_formatting - HIGH

- **שורה:** 148
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 160
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 197
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 206
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 218
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 349
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 479
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 494
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

## trading-ui/scripts/debug-populate-form-dates.js

**סה"כ סטיות:** 10

### date_formatting - HIGH

- **שורה:** 10
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
console.log('📅 Start time:', new Date().toISOString());
```

### date_formatting - HIGH

- **שורה:** 13
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
startTime: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 27
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
time: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 89
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
dateObj: dateObj ? dateObj.toISOString() : null,
```

### date_formatting - HIGH

- **שורה:** 95
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const year = dateObj.getFullYear();
```

### date_formatting - HIGH

- **שורה:** 96
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const month = String(dateObj.getMonth() + 1).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 97
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const day = String(dateObj.getDate()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 98
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const hours = String(dateObj.getHours()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 99
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const minutes = String(dateObj.getMinutes()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 144
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
report.endTime = new Date().toISOString();
```

## trading-ui/scripts/economic-calendar-page.js

**סה"כ סטיות:** 3

### date_formatting - HIGH

- **שורה:** 419
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
date: eventData.date || new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 429
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
savedAt: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 543
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const date = prompt('הזן תאריך (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
```

## trading-ui/scripts/emotional-tracking-widget.js

**סה"כ סטיות:** 5

### date_formatting - HIGH

- **שורה:** 222
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
date.setDate(date.getDate() - i);
```

### date_formatting - HIGH

- **שורה:** 228
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
time: date.toISOString().split('T')[0],
```

### date_formatting - HIGH

- **שורה:** 294
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
date.setDate(date.getDate() - i);
```

### date_formatting - HIGH

- **שורה:** 306
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
recorded_at: date.toISOString(),
```

### date_formatting - HIGH

- **שורה:** 549
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
recorded_at: new Date().toISOString(),
```

## trading-ui/scripts/entity-details-api.js

**סה"כ סטיות:** 2

### date_formatting - HIGH

- **שורה:** 858
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
data.fetched_at = new Date().toISOString();
```

### date_formatting - HIGH

- **שורה:** 1467
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
last_updated: new Date().toISOString(),
```

## trading-ui/scripts/entity-details-modal.js

**סה"כ סטיות:** 3

### date_formatting - HIGH

- **שורה:** 1261
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 1268
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 1495
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
export_date: new Date().toISOString(),
```

## trading-ui/scripts/executions.js

**סה"כ סטיות:** 13

### date_formatting - HIGH

- **שורה:** 1577
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
yesterday.setDate(yesterday.getDate() - 1);
```

### date_formatting - HIGH

- **שורה:** 1587
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
weekAgo.setDate(weekAgo.getDate() - 7);
```

### date_formatting - HIGH

- **שורה:** 1594
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
```

### date_formatting - HIGH

- **שורה:** 1600
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
```

### date_formatting - HIGH

- **שורה:** 1600
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
```

### date_formatting - HIGH

- **שורה:** 1605
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const startOfYear = new Date(today.getFullYear(), 0, 1);
```

### date_formatting - HIGH

- **שורה:** 1611
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
yearAgo.setDate(yearAgo.getDate() - 365);
```

### date_formatting - HIGH

- **שורה:** 3367
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
yesterday.setDate(yesterday.getDate() - 1);
```

### date_formatting - HIGH

- **שורה:** 3389
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
weekAgo.setDate(weekAgo.getDate() - 7);
```

### date_formatting - HIGH

- **שורה:** 4928
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const utc = new Date(timestamp).toISOString();
```

### date_formatting - HIGH

- **שורה:** 4943
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
display = new Date(timestamp).toISOString().split('T')[0];
```

### logical_default_assignment - MEDIUM

- **שורה:** 4839
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
selectAllCheckbox.checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 4860
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
selectAllCheckbox.checked = false;
```

## trading-ui/scripts/external-data-dashboard.js

**סה"כ סטיות:** 9

### date_formatting - HIGH

- **שורה:** 1994
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
generatedAt: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 2000
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const filename = `external-data-backup-${new Date().toISOString().split('T')[0]}.json`;
```

### date_formatting - HIGH

- **שורה:** 2061
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
return { issues, timestamp: new Date().toISOString() };
```

### date_formatting - HIGH

- **שורה:** 2174
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
generatedAt: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 2189
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
this.exportToFile(`external-data-test-report-${new Date().toISOString()}.txt`, report);
```

### date_formatting - HIGH

- **שורה:** 2564
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 2579
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 2929
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
generatedAt: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 2937
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
this.exportToFile(`external-data-performance-${new Date().toISOString()}.json`, payload);
```

## trading-ui/scripts/external-data-service.js

**סה"כ סטיות:** 2

### date_formatting - HIGH

- **שורה:** 210
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
asof_utc: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 309
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
asof_utc: new Date().toISOString(),
```

## trading-ui/scripts/header-system-old.js

**סה"כ סטיות:** 40

### date_formatting - HIGH

- **שורה:** 90
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 270
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
startTime: new Date(__initializationState.startTime).toISOString(),
```

### date_formatting - HIGH

- **שורה:** 281
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date(stage1Start).toISOString(),
```

### date_formatting - HIGH

- **שורה:** 292
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date(stage1Start).toISOString(),
```

### date_formatting - HIGH

- **שורה:** 312
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date(stage2Start).toISOString(),
```

### date_formatting - HIGH

- **שורה:** 323
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date(stage2Start).toISOString(),
```

### date_formatting - HIGH

- **שורה:** 391
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date(stage3Start).toISOString(),
```

### date_formatting - HIGH

- **שורה:** 402
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date(stage3Start).toISOString(),
```

### date_formatting - HIGH

- **שורה:** 423
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date(stage4Start).toISOString(),
```

### date_formatting - HIGH

- **שורה:** 434
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date(stage4Start).toISOString(),
```

### date_formatting - HIGH

- **שורה:** 458
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date(stage5Start).toISOString(),
```

### date_formatting - HIGH

- **שורה:** 469
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date(stage5Start).toISOString(),
```

### date_formatting - HIGH

- **שורה:** 504
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 968
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 1115
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 1162
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 1833
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 2424
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
yesterday.setDate(today.getDate() - 1);
```

### date_formatting - HIGH

- **שורה:** 2440
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
startOfWeek.setDate(today.getDate() - dayOfWeek);
```

### date_formatting - HIGH

- **שורה:** 2451
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
weekAgo.setDate(today.getDate() - 7);
```

### date_formatting - HIGH

- **שורה:** 2462
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
lastWeekEnd.setDate(today.getDate() - dayOfWeek - 1); // Last Saturday
```

### date_formatting - HIGH

- **שורה:** 2465
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
lastWeekStart.setDate(lastWeekEnd.getDate() - 6); // Previous Sunday
```

### date_formatting - HIGH

- **שורה:** 2473
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
```

### date_formatting - HIGH

- **שורה:** 2473
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
```

### date_formatting - HIGH

- **שורה:** 2483
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
monthAgo.setDate(today.getDate() - 30);
```

### date_formatting - HIGH

- **שורה:** 2491
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
```

### date_formatting - HIGH

- **שורה:** 2491
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
```

### date_formatting - HIGH

- **שורה:** 2493
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of previous month
```

### date_formatting - HIGH

- **שורה:** 2493
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of previous month
```

### date_formatting - HIGH

- **שורה:** 2501
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const startOfYear = new Date(today.getFullYear(), 0, 1);
```

### date_formatting - HIGH

- **שורה:** 2511
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
yearAgo.setDate(today.getDate() - 365);
```

### date_formatting - HIGH

- **שורה:** 2520
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
```

### date_formatting - HIGH

- **שורה:** 2522
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
```

### date_formatting - HIGH

- **שורה:** 2606
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 2819
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date(timestamp).toISOString(),
```

### date_slicing - HIGH

- **שורה:** 2911
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
summary.timeline.slice(0, 10).forEach(call => {
```

### date_formatting - HIGH

- **שורה:** 2912
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const time = new Date(call.timestamp).toISOString();
```

### date_formatting - HIGH

- **שורה:** 3567
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 4700
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 4973
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/header-system-v2.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 1390
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/header-system.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 1463
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/history-widget.js

**סה"כ סטיות:** 2

### date_formatting - HIGH

- **שורה:** 235
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
date.setDate(date.getDate() - i);
```

### date_formatting - HIGH

- **שורה:** 238
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
time: date.toISOString().split('T')[0],
```

## trading-ui/scripts/index.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 1433
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/init-system/all-pages-monitoring-test.js

**סה"כ סטיות:** 4

### date_formatting - HIGH

- **שורה:** 139
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 152
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 174
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 185
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

## trading-ui/scripts/init-system/comprehensive-initialization-test.js

**סה"כ סטיות:** 1

### preference_api_call - HIGH

- **שורה:** 67
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
entry.name.includes('/api/preferences/user')
```

## trading-ui/scripts/init-system/dev-tools/page-template-generator.js

**סה"כ סטיות:** 4

### date_formatting - HIGH

- **שורה:** 213
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
lastModified: '${new Date().toISOString().split('T')[0]}',
```

### date_formatting - HIGH

- **שורה:** 285
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
* @created ${new Date().toISOString().split('T')[0]}
```

### date_formatting - HIGH

- **שורה:** 392
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
created: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 421
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
html += `    <!-- 🎯 Page: ${pageName} | Generated: ${new Date().toISOString()} -->\n`;
```

## trading-ui/scripts/init-system/load-order-validator.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 327
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/init-system/pages-standardization-plan.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 401
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/init-system-check.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 1075
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
copyText += `Date: ${results.timestamp || new Date().toISOString()}\n`;
```

## trading-ui/scripts/init-system-management.js

**סה"כ סטיות:** 8

### date_formatting - HIGH

- **שורה:** 898
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
a.download = `duplicate-initialization-report-${new Date().toISOString().split('T')[0]}.txt`;
```

### date_formatting - HIGH

- **שורה:** 1782
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 2744
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 2764
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
link.download = `init-system-tests-${new Date().toISOString().split('T')[0]}.json`;
```

### date_formatting - HIGH

- **שורה:** 2848
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
copyText += `Date: ${new Date().toISOString()}\n\n`;
```

### date_formatting - HIGH

- **שורה:** 2906
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
copyText += `Date: ${new Date().toISOString()}\n\n`;
```

### date_formatting - HIGH

- **שורה:** 2972
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
copyText += `Date: ${new Date().toISOString()}\n\n`;
```

### date_formatting - HIGH

- **שורה:** 3013
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
copyText += `Date: ${new Date().toISOString()}\n\n`;
```

## trading-ui/scripts/linked-items.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 1202
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
downloadCSV(csvContent, `linked_items_${itemType}_${itemId}_${new Date().toISOString().split('T')[0]}.csv`);
```

## trading-ui/scripts/linter-realtime-monitor.js

**סה"כ סטיות:** 8

### date_formatting - HIGH

- **שורה:** 1644
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
lastScanDate = new Date().toISOString();
```

### date_formatting - HIGH

- **שורה:** 1652
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 1685
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 1719
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 2258
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_slicing - HIGH

- **שורה:** 2902
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timelineContainer.innerHTML = sortedTimeline.slice(0, 10).map(entry => {
```

### date_formatting - HIGH

- **שורה:** 3012
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 3038
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
link.download = `linter-progress-report-${new Date().toISOString().split('T')[0]}.json`;
```

## trading-ui/scripts/log-recovery.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 73
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/logger-service.js

**סה"כ סטיות:** 3

### date_formatting - HIGH

- **שורה:** 498
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 960
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 1019
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/migration-helper.js

**סה"כ סטיות:** 3

### date_formatting - HIGH

- **שורה:** 330
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 460
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 569
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/migration-testing-suite.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 565
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/modal-configs/executions-config.js

**סה"כ סטיות:** 2

### date_formatting - HIGH

- **שורה:** 108
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
defaultValue: new Date().toISOString().slice(0, 16),
```

### date_slicing - HIGH

- **שורה:** 108
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
defaultValue: new Date().toISOString().slice(0, 16),
```

## trading-ui/scripts/modal-manager-v2.js

**סה"כ סטיות:** 47

### date_formatting - HIGH

- **שורה:** 70
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
```

### date_formatting - HIGH

- **שורה:** 824
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
dateValue = today.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
```

### date_slicing - HIGH

- **שורה:** 824
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
dateValue = today.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
```

### date_formatting - HIGH

- **שורה:** 3337
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
console.log(`✅ [populateForm] Converted DateEnvelope to Date object via dateUtils:`, dateObj ? dateObj.toISOString() : null);
```

### date_formatting - HIGH

- **שורה:** 3342
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
console.log(`✅ [populateForm] Converted DateEnvelope.epochMs to Date object:`, dateObj.toISOString());
```

### date_formatting - HIGH

- **שורה:** 3345
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
console.log(`✅ [populateForm] Converted DateEnvelope.utc to Date object:`, dateObj.toISOString());
```

### date_formatting - HIGH

- **שורה:** 3348
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
console.log(`✅ [populateForm] Converted DateEnvelope.local to Date object:`, dateObj.toISOString());
```

### date_formatting - HIGH

- **שורה:** 3360
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
console.log(`✅ [populateForm] Using Date object directly:`, dateObj.toISOString());
```

### date_formatting - HIGH

- **שורה:** 3365
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
console.log(`✅ [populateForm] Converted via dateUtils.toDateObject:`, dateObj ? dateObj.toISOString() : null);
```

### date_formatting - HIGH

- **שורה:** 3370
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
console.log(`✅ [populateForm] Parsed string value:`, dateObj.toISOString());
```

### date_formatting - HIGH

- **שורה:** 3376
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
console.log(`✅ [populateForm] Parsed via toString():`, dateObj.toISOString());
```

### date_formatting - HIGH

- **שורה:** 3384
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const year = dateObj.getFullYear();
```

### date_formatting - HIGH

- **שורה:** 3385
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const month = String(dateObj.getMonth() + 1).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 3386
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const day = String(dateObj.getDate()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 3391
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
dateObj: dateObj.toISOString(),
```

### date_formatting - HIGH

- **שורה:** 3432
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
console.log(`✅ [populateForm] Converted DateEnvelope to Date object via dateUtils:`, dateObj ? dateObj.toISOString() : null);
```

### date_formatting - HIGH

- **שורה:** 3437
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
console.log(`✅ [populateForm] Converted DateEnvelope.epochMs to Date object:`, dateObj.toISOString());
```

### date_formatting - HIGH

- **שורה:** 3440
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
console.log(`✅ [populateForm] Converted DateEnvelope.utc to Date object:`, dateObj.toISOString());
```

### date_formatting - HIGH

- **שורה:** 3443
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
console.log(`✅ [populateForm] Converted DateEnvelope.local to Date object:`, dateObj.toISOString());
```

### date_formatting - HIGH

- **שורה:** 3455
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
console.log(`✅ [populateForm] Using Date object directly:`, dateObj.toISOString());
```

### date_formatting - HIGH

- **שורה:** 3460
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
console.log(`✅ [populateForm] Converted via dateUtils.toDateObject:`, dateObj ? dateObj.toISOString() : null);
```

### date_formatting - HIGH

- **שורה:** 3465
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
console.log(`✅ [populateForm] Parsed string value:`, dateObj.toISOString());
```

### date_formatting - HIGH

- **שורה:** 3471
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
console.log(`✅ [populateForm] Parsed via toString():`, dateObj.toISOString());
```

### date_formatting - HIGH

- **שורה:** 3479
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const year = dateObj.getFullYear();
```

### date_formatting - HIGH

- **שורה:** 3480
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const month = String(dateObj.getMonth() + 1).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 3481
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const day = String(dateObj.getDate()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 3482
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const hours = String(dateObj.getHours()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 3483
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const minutes = String(dateObj.getMinutes()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 3488
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
dateObj: dateObj.toISOString(),
```

### direct_date_assignment - HIGH

- **שורה:** 4343
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
fieldElement.value = today.toISOString().slice(0, 16);
```

### date_calculation - HIGH

- **שורה:** 4343
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
fieldElement.value = today.toISOString().slice(0, 16);
```

### date_formatting - HIGH

- **שורה:** 4343
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
fieldElement.value = today.toISOString().slice(0, 16);
```

### date_slicing - HIGH

- **שורה:** 4343
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
fieldElement.value = today.toISOString().slice(0, 16);
```

### direct_date_assignment - HIGH

- **שורה:** 4387
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
fieldElement.value = today.toISOString().slice(0, 10);
```

### date_calculation - HIGH

- **שורה:** 4387
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
fieldElement.value = today.toISOString().slice(0, 10);
```

### date_formatting - HIGH

- **שורה:** 4387
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
fieldElement.value = today.toISOString().slice(0, 10);
```

### date_slicing - HIGH

- **שורה:** 4387
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
fieldElement.value = today.toISOString().slice(0, 10);
```

### date_formatting - HIGH

- **שורה:** 4447
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
createdDisplay.dataset.defaultTimestamp = now.toISOString();
```

### date_formatting - HIGH

- **שורה:** 4453
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
expiryDate.setFullYear(expiryDate.getFullYear() + 1);
```

### date_calculation - HIGH

- **שורה:** 4454
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
expiryInput.value = expiryDate.toISOString().slice(0, 10);
```

### date_formatting - HIGH

- **שורה:** 4454
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
expiryInput.value = expiryDate.toISOString().slice(0, 10);
```

### date_slicing - HIGH

- **שורה:** 4454
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
expiryInput.value = expiryDate.toISOString().slice(0, 10);
```

### date_formatting - HIGH

- **שורה:** 4470
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const isoString = date.toISOString();
```

### date_formatting - HIGH

- **שורה:** 5798
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
```

### date_formatting - HIGH

- **שורה:** 5799
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
assignedValue = today.toISOString().slice(0, 10);
```

### date_slicing - HIGH

- **שורה:** 5799
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
assignedValue = today.toISOString().slice(0, 10);
```

### logical_default_assignment - MEDIUM

- **שורה:** 2756
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
input.checked = false;
```

## trading-ui/scripts/modules/business-module.js

**סה"כ סטיות:** 6

### date_formatting - HIGH

- **שורה:** 990
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const dateStr = createdDate.toISOString().slice(0, 16);
```

### date_slicing - HIGH

- **שורה:** 990
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const dateStr = createdDate.toISOString().slice(0, 16);
```

### date_formatting - HIGH

- **שורה:** 1005
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const dateStr = closedDate.toISOString().slice(0, 16);
```

### date_slicing - HIGH

- **שורה:** 1005
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const dateStr = closedDate.toISOString().slice(0, 16);
```

### date_formatting - HIGH

- **שורה:** 1096
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const dd = String(now.getDate()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 2943
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/modules/core-systems.js

**סה"כ סטיות:** 5

### date_formatting - HIGH

- **שורה:** 1936
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
time: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 1956
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
time: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 2491
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 2558
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 2922
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/modules/data-basic.js

**סה"כ סטיות:** 1

### preference_api_call - HIGH

- **שורה:** 2038
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
'preferences': '/api/preferences/'
```

## trading-ui/scripts/modules/localstorage-sync.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 107
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/monitoring-functions.js

**סה"כ סטיות:** 3

### date_formatting - HIGH

- **שורה:** 73
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 79
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 797
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/notification-system-tester.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 227
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/notifications-center.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 1165
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/portfolio-state-page.js

**סה"כ סטיות:** 28

### date_formatting - HIGH

- **שורה:** 328
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
weekAgo.setDate(today.getDate() - 7);
```

### direct_date_assignment - HIGH

- **שורה:** 347
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
toInput.value = todayStr;
```

### date_formatting - HIGH

- **שורה:** 517
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(today.getDate() - 1);
```

### date_formatting - HIGH

- **שורה:** 524
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(today.getDate() - dayOfWeek);
```

### date_formatting - HIGH

- **שורה:** 530
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(today.getDate() - 7);
```

### date_formatting - HIGH

- **שורה:** 536
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
lastWeekEnd.setDate(today.getDate() - dayOfWeek - 1);
```

### date_formatting - HIGH

- **שורה:** 540
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(lastWeekEnd.getDate() - 6);
```

### date_formatting - HIGH

- **שורה:** 546
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start = new Date(today.getFullYear(), today.getMonth(), 1);
```

### date_formatting - HIGH

- **שורה:** 546
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start = new Date(today.getFullYear(), today.getMonth(), 1);
```

### date_formatting - HIGH

- **שורה:** 552
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(today.getDate() - 30);
```

### date_formatting - HIGH

- **שורה:** 556
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
```

### date_formatting - HIGH

- **שורה:** 556
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
```

### date_formatting - HIGH

- **שורה:** 557
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
```

### date_formatting - HIGH

- **שורה:** 557
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
```

### date_formatting - HIGH

- **שורה:** 565
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start = new Date(today.getFullYear(), 0, 1);
```

### date_formatting - HIGH

- **שורה:** 571
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(today.getDate() - 365);
```

### date_formatting - HIGH

- **שורה:** 575
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
```

### date_formatting - HIGH

- **שורה:** 576
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
```

### date_formatting - HIGH

- **שורה:** 2372
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
return date.toISOString().split('T')[0];
```

### date_formatting - HIGH

- **שורה:** 2476
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
date.setDate(date.getDate() - i);
```

### date_formatting - HIGH

- **שורה:** 2486
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
time: date.toISOString().split('T')[0],
```

### date_formatting - HIGH

- **שורה:** 2491
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
time: date.toISOString().split('T')[0],
```

### date_formatting - HIGH

- **שורה:** 2607
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
date.setDate(date.getDate() - i);
```

### date_formatting - HIGH

- **שורה:** 2629
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
time: date.toISOString().split('T')[0],
```

### date_formatting - HIGH

- **שורה:** 2741
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
date.setDate(date.getDate() - i);
```

### date_formatting - HIGH

- **שורה:** 2757
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const timeStr = date.toISOString().split('T')[0];
```

### date_formatting - HIGH

- **שורה:** 2865
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const date1 = end1 ? end1.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
```

### date_formatting - HIGH

- **שורה:** 2865
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const date1 = end1 ? end1.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
```

## trading-ui/scripts/preferences-colors.js

**סה"כ סטיות:** 2

### preference_system_direct - HIGH

- **שורה:** 186
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
window.Logger?.warn?.('[ColorManager] PreferencesData.loadPreferencesByNames API is not available - using default colors', {
```

### preference_system_direct - HIGH

- **שורה:** 240
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
window.Logger?.warn?.('[ColorManager] PreferencesData.loadPreferencesByNames API is not available - using default group colors', {
```

## trading-ui/scripts/preferences-core-new.js

**סה"כ סטיות:** 2

### preference_api_call - HIGH

- **שורה:** 106
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
constructor(baseURL = '/api/preferences') {
```

### preference_system_direct - HIGH

- **שורה:** 446
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
const defaultValue = await window.PreferencesData.loadDefaultPreference(preferenceName, {
```

## trading-ui/scripts/preferences-debug-monitor.js

**סה"כ סטיות:** 7

### date_formatting - HIGH

- **שורה:** 119
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 234
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 420
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### preference_api_call - HIGH

- **שורה:** 283
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
let testResponse = await fetch(`/api/preferences/types?_t=${Date.now()}`, {
```

### preference_api_call - HIGH

- **שורה:** 290
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
testResponse = await fetch(`/api/preferences/admin/types?_t=${Date.now()}`, {
```

### preference_api_call - HIGH

- **שורה:** 470
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
let apiResponse = await fetch(`/api/preferences/types?_t=${Date.now()}`, {
```

### preference_api_call - HIGH

- **שורה:** 475
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
apiResponse = await fetch(`/api/preferences/admin/types?_t=${Date.now()}`, {
```

## trading-ui/scripts/preferences-page.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 59
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/preferences-pages-scanner.js

**סה"כ סטיות:** 5

### date_formatting - HIGH

- **שורה:** 193
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 208
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 228
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 360
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 374
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
a.download = `preferences-pages-scan-report-${new Date().toISOString().split('T')[0]}.json`;
```

## trading-ui/scripts/preferences-refresh-monitor.js

**סה"כ סטיות:** 3

### date_formatting - HIGH

- **שורה:** 21
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 35
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 148
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/preferences-ui-v4.js

**סה"כ סטיות:** 1

### logical_default_assignment - MEDIUM

- **שורה:** 412
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
radioGroup[0].checked = true;
```

## trading-ui/scripts/preferences-ui.js

**סה"כ סטיות:** 3

### date_slicing - HIGH

- **שורה:** 1701
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
sampleValues: Object.keys(formPrefs).slice(0, 10).reduce((acc, key) => {
```

### preference_api_call - HIGH

- **שורה:** 567
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
? await window.PreferencesData.fetchJson('/api/preferences/bootstrap', { dedupe: true })
```

### logical_default_assignment - MEDIUM

- **שורה:** 184
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
radioInput.checked = true;
```

## trading-ui/scripts/quick-quality-check.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 83
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

## trading-ui/scripts/realtime-notifications-client.js

**סה"כ סטיות:** 2

### date_formatting - HIGH

- **שורה:** 260
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const timestamp = data.timestamp || new Date().toISOString();
```

### date_formatting - HIGH

- **שורה:** 474
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/server-monitor.js

**סה"כ סטיות:** 2

### date_formatting - HIGH

- **שורה:** 461
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 473
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
a.download = `server-monitor-logs-${new Date().toISOString().split('T')[0]}.json`;
```

## trading-ui/scripts/services/crud-response-handler.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 563
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/services/data-collection-service.js

**סה"כ סטיות:** 15

### date_formatting - HIGH

- **שורה:** 119
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
value = value ? new Date(value).toISOString() : null;
```

### date_formatting - HIGH

- **שורה:** 230
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const year = date.getFullYear();
```

### date_formatting - HIGH

- **שורה:** 231
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const month = String(date.getMonth() + 1).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 232
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const day = String(date.getDate()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 235
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const hours = String(date.getHours()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 236
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const minutes = String(date.getMinutes()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 334
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
return value ? new Date(value).toISOString() : defaultValue;
```

### date_formatting - HIGH

- **שורה:** 406
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const year = date.getFullYear();
```

### date_formatting - HIGH

- **שורה:** 407
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const month = String(date.getMonth() + 1).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 408
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const day = String(date.getDate()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 409
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const hours = String(date.getHours()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 410
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const minutes = String(date.getMinutes()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 419
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const year = date.getFullYear();
```

### date_formatting - HIGH

- **שורה:** 420
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const month = String(date.getMonth() + 1).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 421
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const day = String(date.getDate()).padStart(2, '0');
```

## trading-ui/scripts/services/default-value-setter.js

**סה"כ סטיות:** 2

### date_formatting - HIGH

- **שורה:** 41
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const day = String(today.getDate()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 67
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const day = String(today.getDate()).padStart(2, '0');
```

## trading-ui/scripts/services/field-renderer-service.js

**סה"כ סטיות:** 15

### date_formatting - HIGH

- **שורה:** 1120
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const dd = String(resolvedDate.getDate()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 1121
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const mm = String(resolvedDate.getMonth() + 1).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 1351
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const day = String(dateObj.getDate()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 1352
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const month = String(dateObj.getMonth() + 1).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 1353
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const year = dateObj.getFullYear();
```

### date_formatting - HIGH

- **שורה:** 1354
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const hours = String(dateObj.getHours()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 1355
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const minutes = String(dateObj.getMinutes()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 1358
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const day = String(dateObj.getDate()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 1359
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const month = String(dateObj.getMonth() + 1).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 1360
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const year = dateObj.getFullYear();
```

### date_formatting - HIGH

- **שורה:** 1431
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const day = String(dateObj.getDate()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 1432
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const month = String(dateObj.getMonth() + 1).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 1433
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const year = String(dateObj.getFullYear()).slice(-2);
```

### date_formatting - HIGH

- **שורה:** 1434
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const hours = String(dateObj.getHours()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 1435
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const minutes = String(dateObj.getMinutes()).padStart(2, '0');
```

## trading-ui/scripts/services/preferences-data.js

**סה"כ סטיות:** 20

### preference_api_call - HIGH

- **שורה:** 585
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
const payload = await fetchJson('/api/preferences/user/single', { params });
```

### preference_api_call - HIGH

- **שורה:** 637
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
const payload = await fetchJson('/api/preferences/user/group', { params });
```

### preference_api_call - HIGH

- **שורה:** 675
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
const payload = await fetchJson('/api/preferences/user/multiple', {
```

### preference_api_call - HIGH

- **שורה:** 797
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
const payload = await fetchJson('/api/preferences/user', { params });
```

### preference_api_call - HIGH

- **שורה:** 799
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
window.Logger?.debug?.('🔍 Raw API response from /api/preferences/user', {
```

### preference_api_call - HIGH

- **שורה:** 871
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
const url = buildUrlWithParams('/api/preferences/user/single', {});
```

### preference_api_call - HIGH

- **שורה:** 928
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
const payload = await fetchJson('/api/preferences/user/single', {
```

### preference_api_call - HIGH

- **שורה:** 997
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
const url = buildUrlWithParams('/api/preferences/user', {});
```

### preference_api_call - HIGH

- **שורה:** 1053
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
const payload = await fetchJson('/api/preferences/user', {
```

### preference_api_call - HIGH

- **שורה:** 1117
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
const payload = await fetchJson('/api/preferences/profiles', {
```

### preference_api_call - HIGH

- **שורה:** 1158
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
const payload = await fetchJson('/api/preferences/profiles', {
```

### preference_api_call - HIGH

- **שורה:** 1212
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
const payload = await fetchJson('/api/preferences/profiles/activate', {
```

### preference_api_call - HIGH

- **שורה:** 1261
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
const payload = await fetchJson(`/api/preferences/profiles/${profileId}`, {
```

### preference_api_call - HIGH

- **שורה:** 1295
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
const payload = await fetchJson('/api/preferences/groups');
```

### preference_api_call - HIGH

- **שורה:** 1315
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
payload = await fetchJson('/api/preferences/types', {
```

### preference_api_call - HIGH

- **שורה:** 1324
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
payload = await fetchJson('/api/preferences/admin/types', {
```

### preference_api_call - HIGH

- **שורה:** 1354
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
const payload = await fetchJson('/api/preferences/default', {
```

### preference_api_call - HIGH

- **שורה:** 1377
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
const payload = await fetchJson(`/api/preferences/info/${encodeURIComponent(preferenceName)}`);
```

### preference_api_call - HIGH

- **שורה:** 1386
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
const payload = await fetchJson('/api/preferences/types/check', {
```

### preference_api_call - HIGH

- **שורה:** 1402
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
const payload = await fetchJson('/api/preferences/health');
```

## trading-ui/scripts/services/preferences-v4.js

**סה"כ סטיות:** 3

### preference_api_call - HIGH

- **שורה:** 11
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
bootstrap: '/api/preferences/bootstrap',
```

### preference_api_call - HIGH

- **שורה:** 12
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
group: '/api/preferences/user/group',
```

### preference_api_call - HIGH

- **שורה:** 13
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
groups: '/api/preferences/user/groups',
```

## trading-ui/scripts/services/unified-crud-service.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 244
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
*   closed_at: new Date().toISOString()
```

## trading-ui/scripts/strategy-analysis-page.js

**סה"כ סטיות:** 23

### date_formatting - HIGH

- **שורה:** 245
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
dateRangeStart: start ? start.toISOString().split('T')[0] : '',
```

### date_formatting - HIGH

- **שורה:** 246
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
dateRangeEnd: end ? end.toISOString().split('T')[0] : ''
```

### date_formatting - HIGH

- **שורה:** 324
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const yearStart = new Date(today.getFullYear(), 0, 1);
```

### date_formatting - HIGH

- **שורה:** 346
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(today.getDate() - 1);
```

### date_formatting - HIGH

- **שורה:** 353
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(today.getDate() - dayOfWeek);
```

### date_formatting - HIGH

- **שורה:** 359
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(today.getDate() - 7);
```

### date_formatting - HIGH

- **שורה:** 365
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
lastWeekEnd.setDate(today.getDate() - dayOfWeek - 1);
```

### date_formatting - HIGH

- **שורה:** 369
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(lastWeekEnd.getDate() - 6);
```

### date_formatting - HIGH

- **שורה:** 375
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start = new Date(today.getFullYear(), today.getMonth(), 1);
```

### date_formatting - HIGH

- **שורה:** 375
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start = new Date(today.getFullYear(), today.getMonth(), 1);
```

### date_formatting - HIGH

- **שורה:** 381
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(today.getDate() - 30);
```

### date_formatting - HIGH

- **שורה:** 385
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
```

### date_formatting - HIGH

- **שורה:** 385
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
```

### date_formatting - HIGH

- **שורה:** 386
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
```

### date_formatting - HIGH

- **שורה:** 386
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
```

### date_formatting - HIGH

- **שורה:** 394
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start = new Date(today.getFullYear(), 0, 1);
```

### date_formatting - HIGH

- **שורה:** 400
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
start.setDate(today.getDate() - 365);
```

### date_formatting - HIGH

- **שורה:** 404
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
```

### date_formatting - HIGH

- **שורה:** 405
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
```

### logical_default_assignment - MEDIUM

- **שורה:** 759
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('compareByTradingMethods').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 760
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('compareByTicker').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 761
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
document.getElementById('compareByTags').checked = false;
```

### logical_default_assignment - MEDIUM

- **שורה:** 801
- **תיאור:** הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault
- **קוד:**
```javascript
compareByTradingMethods.checked = true;
```

## trading-ui/scripts/system-management/core/sm-base.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 76
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

## trading-ui/scripts/system-management/core/sm-error-handler.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 303
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/system-management/sections/sm-section-alerts.js

**סה"כ סטיות:** 3

### date_formatting - HIGH

- **שורה:** 44
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 158
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 744
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
link.download = `alerts-${new Date().toISOString().split('T')[0]}.json`;
```

## trading-ui/scripts/system-management/sections/sm-section-background-tasks.js

**סה"כ סטיות:** 2

### date_formatting - HIGH

- **שורה:** 44
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 158
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

## trading-ui/scripts/system-management/sections/sm-section-cache.js

**סה"כ סטיות:** 3

### date_formatting - HIGH

- **שורה:** 44
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 158
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 667
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
link.download = `cache-stats-${new Date().toISOString().split('T')[0]}.json`;
```

## trading-ui/scripts/system-management/sections/sm-section-dashboard.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 79
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

## trading-ui/scripts/system-management/sections/sm-section-database.js

**סה"כ סטיות:** 2

### date_formatting - HIGH

- **שורה:** 44
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 158
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

## trading-ui/scripts/system-management/sections/sm-section-operations.js

**סה"כ סטיות:** 2

### date_formatting - HIGH

- **שורה:** 35
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 96
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

## trading-ui/scripts/system-management/sections/sm-section-performance.js

**סה"כ סטיות:** 2

### date_formatting - HIGH

- **שורה:** 44
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 158
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

## trading-ui/scripts/system-management/sections/sm-section-server.js

**סה"כ סטיות:** 2

### date_formatting - HIGH

- **שורה:** 44
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 158
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

## trading-ui/scripts/system-management/system-management-main.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 463
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

## trading-ui/scripts/system-management.js

**סה"כ סטיות:** 2

### date_formatting - HIGH

- **שורה:** 68
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 1462
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
yesterday.setDate(yesterday.getDate() - 1);
```

## trading-ui/scripts/table-mappings.js

**סה"כ סטיות:** 3

### date_formatting - HIGH

- **שורה:** 560
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
sourceString = rawValue.toISOString();
```

### date_formatting - HIGH

- **שורה:** 576
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const utc = new Date(epochMs).toISOString();
```

### date_formatting - HIGH

- **שורה:** 590
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
display = new Date(epochMs).toISOString().split('T')[0];
```

## trading-ui/scripts/tag-events.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 22
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
triggeredAt: new Date().toISOString(),
```

## trading-ui/scripts/test-preferences-debug.js

**סה"כ סטיות:** 8

### date_formatting - HIGH

- **שורה:** 18
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_slicing - HIGH

- **שורה:** 224
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
Object.fromEntries(Object.entries(result.values).slice(0, 10)) : null;
```

### preference_api_call - HIGH

- **שורה:** 62
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
name: 'Test 2: Check /api/preferences/user API',
```

### preference_api_call - HIGH

- **שורה:** 74
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
const url = `/api/preferences/user?user_id=${userId}&profile_id=${profileId}`;
```

### preference_api_call - HIGH

- **שורה:** 124
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
name: `Test 3: Check /api/preferences/user/group API for '${groupName}'`,
```

### preference_api_call - HIGH

- **שורה:** 136
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
const url = `/api/preferences/user/group?group=${groupName}&user_id=${userId}&profile_id=${profileId}`;
```

### preference_api_call - HIGH

- **שורה:** 304
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
console.log('\n📋 Running Test 2: Check /api/preferences/user API...');
```

### preference_api_call - HIGH

- **שורה:** 311
- **תיאור:** טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue
- **קוד:**
```javascript
console.log(`\n📋 Running Test 3: Check /api/preferences/user/group API for '${group}'...`);
```

## trading-ui/scripts/test-runner.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 505
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

## trading-ui/scripts/testing/comprehensive-cache-clearing-test.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 101
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/trade-selector-modal.js

**סה"כ סטיות:** 5

### date_formatting - HIGH

- **שורה:** 563
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const day = String(date.getDate()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 564
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const month = String(date.getMonth() + 1).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 565
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const year = date.getFullYear();
```

### date_formatting - HIGH

- **שורה:** 885
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const day = String(date.getDate()).padStart(2, '0');
```

### date_formatting - HIGH

- **שורה:** 886
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const month = String(date.getMonth() + 1).padStart(2, '0');
```

## trading-ui/scripts/trade_plans.js

**סה"כ סטיות:** 6

### date_formatting - HIGH

- **שורה:** 1533
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
```

### date_formatting - HIGH

- **שורה:** 1534
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
assignedValue = today.toISOString().slice(0, 10);
```

### date_slicing - HIGH

- **שורה:** 1534
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
assignedValue = today.toISOString().slice(0, 10);
```

### date_formatting - HIGH

- **שורה:** 1546
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
```

### date_slicing - HIGH

- **שורה:** 1550
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
assignedValue = isoString.slice(0, 16);
```

### date_formatting - HIGH

- **שורה:** 3624
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
tradePlanData.created_at = parsedEntryDate.toISOString();
```

## trading-ui/scripts/trades.js

**סה"כ סטיות:** 2

### date_formatting - HIGH

- **שורה:** 4039
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 4336
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
payload.created_at = entryDate.toISOString();
```

## trading-ui/scripts/trading-journal-page.js

**סה"כ סטיות:** 2

### date_formatting - HIGH

- **שורה:** 13
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
let currentMonth = new Date().getMonth();
```

### date_formatting - HIGH

- **שורה:** 14
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
let currentYear = new Date().getFullYear();
```

## trading-ui/scripts/tradingview-test-page.js

**סה"כ סטיות:** 2

### date_formatting - HIGH

- **שורה:** 814
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
const timestamp = new Date().toISOString();
```

### date_formatting - HIGH

- **שורה:** 841
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/unified-app-initializer.js

**סה"כ סטיות:** 3

### date_formatting - HIGH

- **שורה:** 1233
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 1420
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 1522
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/unified-cache-manager.js

**סה"כ סטיות:** 2

### date_formatting - HIGH

- **שורה:** 2496
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 2542
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

## trading-ui/scripts/unified-log-manager.js

**סה"כ סטיות:** 20

### date_formatting - HIGH

- **שורה:** 517
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString()
```

### date_formatting - HIGH

- **שורה:** 527
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 658
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 676
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 696
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 716
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: activity.timestamp || new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 744
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 764
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 852
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 860
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 877
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 887
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 962
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 993
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 1007
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 1102
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
return new Date(isoStr).toISOString();
```

### date_formatting - HIGH

- **שורה:** 1105
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
return new Date().toISOString();
```

### date_formatting - HIGH

- **שורה:** 1444
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
timestamp: new Date().toISOString(),
```

### date_formatting - HIGH

- **שורה:** 1636
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
filename = `${logType}_${new Date().toISOString().split('T')[0]}.csv`;
```

### date_formatting - HIGH

- **שורה:** 1640
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
filename = `${logType}_${new Date().toISOString().split('T')[0]}.json`;
```

## trading-ui/scripts/unified-table-system.js

**סה"כ סטיות:** 1

### date_formatting - HIGH

- **שורה:** 1074
- **תיאור:** הגדרת תאריך מקומית במקום DefaultValueSetter
- **קוד:**
```javascript
return value.toISOString().toLowerCase();
```

