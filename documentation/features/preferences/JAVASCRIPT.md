# JavaScript Documentation - מערכת העדפות

## סקירה כללית

מערכת ההעדפות משתמשת ב-JavaScript לניהול הגדרות משתמש, שמירה לטווח ארוך, ואינטגרציה עם מערכת הפילטרים הגלובלית.

## קבצים עיקריים

### `trading-ui/scripts/preferences-v2.js`
הקובץ הראשי המכיל את כל הלוגיקה של מערכת ההעדפות.

### תלויות
- `filter-system.js` - מערכת פילטרים גלובלית
- `main.js` - פונקציות גלובליות
- `tables.js` - פונקציות טבלאות
- `ui-utils.js` - פונקציות ממשק משתמש
- `notification-system.js` - מערכת התראות

## פונקציות עיקריות

### `loadPreferences()`
טוען העדפות מהשרת ומעדכן את הממשק.

```javascript
async function loadPreferences() {
  try {
    const response = await fetch('/api/v1/preferences/');
    if (response.ok) {
      const data = await response.json();
      // בדיקת מבנה התגובה
      if (data.user) {
        currentPreferences = data.user;
      } else if (data.users && data.users.nimrod) {
        currentPreferences = data.users.nimrod;
      } else if (data.defaults) {
        currentPreferences = data.defaults;
      } else if (data.defaultTypeFilter || data.primaryCurrency) {
        currentPreferences = data;
      } else {
        currentPreferences = { ...DEFAULT_PREFERENCES };
      }
    } else {
      console.warn('⚠️ לא ניתן לטעון העדפות מהשרת, משתמש בברירות מחדל');
      currentPreferences = { ...DEFAULT_PREFERENCES };
    }
  } catch (error) {
    console.error('❌ שגיאה בטעינת העדפות:', error);
    currentPreferences = { ...DEFAULT_PREFERENCES };
  }
  
  updateUI();
}
```

### `updatePreference(key, value)`
מעדכן העדפה בזיכרון (לא שומר בשרת).

```javascript
function updatePreference(key, value) {
  try {
    currentPreferences[key] = value;
    const label = getPreferenceLabel(key);
    const message = `${label} עודכן (לא נשמר עדיין)`;
    showPreferencesInfo('העדפות', message);
  } catch (error) {
    console.error(`❌ שגיאה ב-updatePreference:`, error);
  }
}
```

### `saveAllPreferences()`
שומר את כל ההעדפות בשרת.

```javascript
async function saveAllPreferences() {
  try {
    const requestBody = { preferences: currentPreferences };
    const response = await fetch('/api/v1/preferences/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (response.ok) {
      const responseData = await response.json();
      showPreferencesSuccess('הצלחה', 'כל ההעדפות נשמרו בהצלחה');
    } else {
      const errorText = await response.text();
      console.error('❌ שגיאה בשמירת העדפות:', response.status, errorText);
      showPreferencesError('שגיאה', `שגיאה בשמירת העדפות: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ שגיאה בשמירת העדפות:', error);
    showPreferencesError('שגיאה', `שגיאה בשמירת העדפות: ${error.message}`);
  }
}
```

### `resetToDefaults()`
מאפס את כל ההעדפות לברירות מחדל.

```javascript
async function resetToDefaults() {
  try {
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'איפוס הגדרות',
        'האם אתה בטוח שברצונך לאפס את כל ההעדפות לברירות מחדל?',
        async () => {
          currentPreferences = { ...DEFAULT_PREFERENCES };
          updateUI();
          
          try {
            await saveAllPreferences();
            showPreferencesSuccess('הצלחה', 'העדפות אופסו לברירות מחדל');
          } catch (error) {
            showPreferencesError('שגיאה', 'שגיאה באיפוס העדפות');
          }
        }
      );
    } else {
      if (confirm('האם אתה בטוח שברצונך לאפס את כל ההעדפות לברירות מחדל?')) {
        currentPreferences = { ...DEFAULT_PREFERENCES };
        updateUI();
        
        try {
          await saveAllPreferences();
          showPreferencesSuccess('הצלחה', 'העדפות אופסו לברירות מחדל');
        } catch (error) {
          showPreferencesError('שגיאה', 'שגיאה באיפוס העדפות');
        }
      }
    }
  } catch (error) {
    console.error('❌ שגיאה באיפוס העדפות:', error);
    showPreferencesError('שגיאה', 'שגיאה באיפוס העדפות');
  }
}
```

### `updateUI()`
מעדכן את הממשק עם העדפות נוכחיות.

```javascript
function updateUI() {
  const isPreferencesPage = document.getElementById('primaryCurrency') !== null;
  
  if (!isPreferencesPage) {
    return;
  }
  
  // עדכון כל השדות
  const primaryCurrencySelect = document.getElementById('primaryCurrency');
  if (primaryCurrencySelect) {
    primaryCurrencySelect.value = currentPreferences.primaryCurrency || 'USD';
  }
  
  // ... עדכון שאר השדות
}
```

### `loadAccountsToFilter()`
טוען חשבונות לפילטר חשבון.

```javascript
async function loadAccountsToFilter() {
  try {
    const response = await fetch('/api/v1/accounts/');
    if (response.ok) {
      const result = await response.json();
      if (result.status === 'success' && result.data) {
        updateAccountFilter(result.data);
      } else if (Array.isArray(result)) {
        updateAccountFilter(result);
      } else {
        console.warn('⚠️ מבנה תגובה לא צפוי:', result);
        showPreferencesWarning('טעינת חשבונות', 'מבנה תגובה לא צפוי מהשרת, משתמש בנתונים מקומיים');
        loadLocalAccounts();
      }
    } else {
      console.warn('⚠️ לא ניתן לטעון חשבונות מהשרת, משתמש בנתונים מקומיים');
      showPreferencesWarning('טעינת חשבונות', 'לא ניתן לטעון חשבונות מהשרת, משתמש בנתונים מקומיים');
      loadLocalAccounts();
    }
  } catch (error) {
    console.error('❌ שגיאה בטעינת חשבונות:', error);
    showPreferencesError('טעינת חשבונות', 'שגיאה בטעינת חשבונות מהשרת');
    loadLocalAccounts();
  }
}
```

## פונקציות עזר

### `getPreferenceLabel(key)`
מחזיר תווית בעברית להעדפה.

```javascript
function getPreferenceLabel(key) {
  const labels = {
    primaryCurrency: 'מטבע ראשי',
    timezone: 'אזור זמן',
    defaultStopLoss: 'סטופ לוס ברירת מחדל',
    defaultTargetPrice: 'יעד ברירת מחדל',
    defaultCommission: 'עמלה ברירת מחדל',
    defaultStatusFilter: 'פילטר סטטוס ברירת מחדל',
    defaultTypeFilter: 'פילטר סוג ברירת מחדל',
    defaultAccountFilter: 'פילטר חשבון ברירת מחדל',
    defaultDateRangeFilter: 'פילטר טווח תאריכים ברירת מחדל',
    defaultSearchFilter: 'פילטר חיפוש ברירת מחדל'
  };
  
  return labels[key] || key;
}
```

### פונקציות התראות
```javascript
function showPreferencesSuccess(title, message) {
  if (typeof window.showSuccessNotification === 'function') {
    window.showSuccessNotification(title, message);
  } else if (typeof window.showNotification === 'function') {
    window.showNotification(title, message, 'success');
  } else {
    console.log('✅ הצלחה:', title, '-', message);
  }
}

function showPreferencesError(title, message) {
  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification(title, message);
  } else if (typeof window.showNotification === 'function') {
    window.showNotification(title, message, 'error');
  } else {
    console.error('❌ שגיאה:', title, '-', message);
  }
}

function showPreferencesInfo(title, message) {
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification(title, message);
  } else if (typeof window.showNotification === 'function') {
    window.showNotification(title, message, 'info');
  } else {
    console.log('ℹ️ מידע:', title, '-', message);
  }
}

function showPreferencesWarning(title, message) {
  if (typeof window.showWarningNotification === 'function') {
    window.showWarningNotification(title, message);
  } else if (typeof window.showNotification === 'function') {
    window.showNotification(title, message, 'warning');
  } else {
    console.warn('⚠️ אזהרה:', title, '-', message);
  }
}
```

## פונקציות חדשות (אוגוסט 2025)

### `getVisibleContainers()`
קבלת כל הקונטיינרים הנראים.

```javascript
function getVisibleContainers() {
  const containers = [];
  const possibleContainers = [
    'trade_plansContainer',
    'tradesContainer', 
    'executionsContainer',
    'cash_flowsContainer',
    'alertsContainer',
    'notesContainer',
    'accountsContainer',
    'tickersContainer'
  ];
  
  for (const containerId of possibleContainers) {
    const container = document.getElementById(containerId);
    if (container && container.style.display !== 'none') {
      containers.push(containerId);
    }
  }
  
  return containers;
}
```

### `showAllRecordsInTable(containerId)`
הצגת כל הרשומות בטבלה.

```javascript
function showAllRecordsInTable(containerId) {
  console.log(`🔄 Showing all records in container: ${containerId}`);
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`⚠️ Container not found: ${containerId}`);
    return;
  }
  
  const rows = container.querySelectorAll('tbody tr');
  let visibleCount = 0;
  
  rows.forEach(row => {
    row.style.display = '';
    visibleCount++;
  });
  
  console.log(`✅ All records shown: ${visibleCount} rows visible`);
  updateTableCount(containerId, visibleCount, rows.length);
}
```

### `updateTableCount(containerId, visibleCount, totalCount)`
עדכון מספר הרשומות בטבלה.

```javascript
function updateTableCount(containerId, visibleCount, totalCount) {
  const tableCountElement = document.querySelector('.table-count');
  if (tableCountElement) {
    let pageType = '';
    
    if (containerId.includes('trade_plans')) {
      pageType = 'תכנונים';
    } else if (containerId.includes('trades')) {
      pageType = 'טריידים';
    } else if (containerId.includes('executions')) {
      pageType = 'ביצועים';
    } else if (containerId.includes('cash_flows')) {
      pageType = 'תזרימי מזומן';
    } else if (containerId.includes('alerts')) {
      pageType = 'התראות';
    } else if (containerId.includes('notes')) {
      pageType = 'הערות';
    } else if (containerId.includes('accounts')) {
      pageType = 'חשבונות';
    } else if (containerId.includes('tickers')) {
      pageType = 'טיקרים';
    } else {
      pageType = 'רשומות';
    }
    
    tableCountElement.textContent = `${visibleCount} ${pageType}`;
    console.log(`✅ Updated table count for ${containerId}: ${visibleCount} ${pageType}`);
  }
}
```

### `resetFiltersManually()`
איפוס ידני של פילטרים (גיבוי).

```javascript
function resetFiltersManually() {
  console.log('🔄 Manual reset filters fallback');

  // הסרת סימון מכל הפילטרים
  document.querySelectorAll('#statusFilterMenu .status-filter-item.selected').forEach(item => item.classList.remove('selected'));
  document.querySelectorAll('#typeFilterMenu .type-filter-item.selected').forEach(item => item.classList.remove('selected'));
  document.querySelectorAll('#accountFilterMenu .account-filter-item.selected').forEach(item => item.classList.remove('selected'));
  document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item.selected').forEach(item => item.classList.remove('selected'));

  // בחירת "הכול" בכל הפילטרים
  const allStatusItem = document.querySelector('#statusFilterMenu .status-filter-item[data-value="הכול"]');
  const allTypeItem = document.querySelector('#typeFilterMenu .type-filter-item[data-value="הכול"]');
  const allAccountItem = document.querySelector('#accountFilterMenu .account-filter-item[data-value="הכול"]');
  const allDateRangeItem = document.querySelector('#dateRangeFilterMenu .date-range-filter-item[data-value="כל זמן"]');

  if (allStatusItem) allStatusItem.classList.add('selected');
  if (allTypeItem) allTypeItem.classList.add('selected');
  if (allAccountItem) allAccountItem.classList.add('selected');
  if (allDateRangeItem) allDateRangeItem.classList.add('selected');

  // ניקוי פילטר חיפוש
  const searchInput = document.querySelector('#searchFilterInput');
  if (searchInput) {
    searchInput.value = '';
  }

  // עדכון טקסטים
  updateStatusFilterText();
  updateTypeFilterText();
  updateAccountFilterText();
  
  // עדכון טקסט פילטר תאריכים
  const selectedDateRangeElement = document.getElementById('selectedDateRange');
  if (selectedDateRangeElement) {
    selectedDateRangeElement.textContent = 'כל זמן';
  }
  
  // הפעלת הפילטרים המעודכנים
  const visibleContainers = getVisibleContainers();
  for (const containerId of visibleContainers) {
    showAllRecordsInTable(containerId);
  }
}
```

## ברירות מחדל

```javascript
const DEFAULT_PREFERENCES = {
  primaryCurrency: 'USD',
  timezone: 'Asia/Jerusalem',
  defaultStopLoss: 5,
  defaultTargetPrice: 10,
  defaultCommission: 1.0,
  defaultStatusFilter: 'all',
  defaultTypeFilter: 'all',
  defaultAccountFilter: 'all',
  defaultDateRangeFilter: 'all',
  defaultSearchFilter: ''
};
```

## אתחול

```javascript
async function initializePreferences() {
  try {
    // שחזור מצב הסקשנים
    if (typeof window.restoreAllSectionStates === 'function') {
      window.restoreAllSectionStates();
    } else {
      console.error('❌ restoreAllSectionStates function not found');
    }

    // טען העדפות
    await loadPreferences();
    
    // טען חשבונות
    await loadAccountsToFilter();
  } catch (error) {
    console.error('❌ שגיאה באתחול דף העדפות:', error);
    showPreferencesError('שגיאה', 'שגיאה באתחול דף העדפות');
  }
}

// אתחול כשהדף נטען
document.addEventListener('DOMContentLoaded', initializePreferences);
```

## ייצוא פונקציות

```javascript
// Export main functions
window.saveAllPreferences = saveAllPreferences;
window.resetToDefaults = resetToDefaults;
window.updatePreference = updatePreference;
window.loadPreferences = loadPreferences;
window.initializePreferences = initializePreferences;

// Export notification functions
window.showPreferencesSuccess = showPreferencesSuccess;
window.showPreferencesError = showPreferencesError;
window.showPreferencesInfo = showPreferencesInfo;
window.showPreferencesWarning = showPreferencesWarning;

// Export utility functions
window.getPreferenceLabel = getPreferenceLabel;
window.loadAccountsToFilter = loadAccountsToFilter;
```

## טיפול בשגיאות

### שגיאות נפוצות ותיקונים

1. **שגיאת מערכת פילטרים**: `window.filterSystem.resetFilters is not a function`
   - **תיקון**: הוספת `filter-system.js` לעמוד ההעדפות
   - **תיקון**: תיקון אתחול מערכת הפילטרים

2. **סקריפטים חסרים**: פונקציות לא זמינות
   - **תיקון**: הוספת `main.js`, `tables.js` לעמוד ההעדפות
   - **תיקון**: תיקון סדר הטעינה של הסקריפטים

3. **קוד כפול**: פונקציה `resetToDefaults` כפולה
   - **תיקון**: ניקוי הקוד הכפול
   - **תיקון**: פישוט הלוגיקה

4. **אתחול שגוי**: מערכת פילטרים לא מאותחלת
   - **תיקון**: שינוי מ-`simpleFilter` ל-`filterSystem` ✅ הושלם
   - **תיקון**: הוספת בדיקות קיום פונקציות

## הערות טכניות

### סדר טעינת קבצים
1. `filter-system.js`
2. `tables.js`
3. `main.js`
4. `preferences-v2.js`

### תלויות גלובליות
- `window.showConfirmationDialog` - דיאלוג אישור
- `window.showSuccessNotification` - הודעות הצלחה
- `window.showErrorNotification` - הודעות שגיאה
- `window.showInfoNotification` - הודעות מידע
- `window.showWarningNotification` - הודעות אזהרה
- `window.restoreAllSectionStates` - שחזור מצב סקשנים

### מבנה נתונים
העדפות נשמרות כאובייקט JavaScript עם המבנה הבא:
```javascript
{
  primaryCurrency: "USD",
  timezone: "Asia/Jerusalem",
  defaultStopLoss: 5,
  defaultTargetPrice: 10,
  defaultCommission: 1.0,
  defaultStatusFilter: "open",
  defaultTypeFilter: "swing",
  defaultAccountFilter: "all",
  defaultDateRangeFilter: "this_week",
  // ... הגדרות נוספות
}
```
