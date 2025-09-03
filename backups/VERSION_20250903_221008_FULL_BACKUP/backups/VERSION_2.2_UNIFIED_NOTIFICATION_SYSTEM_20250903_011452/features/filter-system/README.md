# מערכת פילטרים - TikTrack

## סקירה כללית

מערכת הפילטרים הגלובלית מאפשרת סינון נתונים בכל הדפים של TikTrack, כולל פילטרים לפי סטטוס, סוג, חשבון, טווח תאריכים וחיפוש טקסט.

## תכונות מרכזיות

### פילטרים זמינים
- **פילטר סטטוס**: open, closed, cancelled, all
- **פילטר סוג**: swing, investment, passive, all
- **פילטר חשבון**: all + חשבונות דינמיים
- **פילטר טווח תאריכים**: all, this_week, week, mtd, 30_days, 60_days, 90_days, year, ytd
- **פילטר חיפוש**: חיפוש טקסט חופשי

### תכונות מתקדמות
- **שמירת פילטרים**: פילטרים נשמרים בין דפים
- **איפוס פילטרים**: איפוס מהיר לכל הפילטרים
- **עדכון דינמי**: עדכון אוטומטי של מספר הרשומות
- **תמיכה בטבלאות מרובות**: פילטרים עובדים על כל הטבלאות

## ארכיטקטורה

### Frontend
- **קובץ ראשי**: `trading-ui/scripts/filter-system.js`
- **קובץ כותרת**: `trading-ui/scripts/header-system.js`
- **תלויות**: `tables.js`, `main.js`, `ui-utils.js`

### Backend
- **API**: `Backend/routes/api/accounts.py` (לפילטר חשבונות)
- **נתונים**: SQLite database

## פונקציות עיקריות

### `initialize()`
מאתחל את מערכת הפילטרים.

```javascript
function initialize() {
  console.log('🔄 Initializing filter system...');
  
  // רישום טבלאות
  registerTables();
  
  // טעינת פילטרים שמורים
  loadSavedFilters();
  
  // הגדרת מאזיני אירועים
  setupEventListeners();
  
  // עדכון אפשרויות חשבונות
  updateAccountOptions();
  
  console.log('✅ Filter system initialized');
}
```

### `resetFilters()`
מאפס את כל הפילטרים לברירות מחדל.

```javascript
function resetFilters() {
  console.log('🔄 Resetting all filters...');
  
  // איפוס פילטרים
  currentFilters = {
    status: 'all',
    type: 'all',
    account: 'all',
    dateRange: 'all',
    search: ''
  };
  
  // עדכון ממשק
  updateFilterUI();
  
  // הפעלת פילטרים
  applyAllFilters();
  
  // שמירת פילטרים
  saveFilters();
  
  console.log('✅ All filters reset');
}
```

### `applyAllFilters()`
מפעיל את כל הפילטרים על כל הטבלאות.

```javascript
function applyAllFilters() {
  console.log('🔄 Applying all filters...');
  
  const tables = getRegisteredTables();
  
  for (const tableId of tables) {
    applyFiltersToTable(tableId);
  }
  
  console.log('✅ All filters applied');
}
```

### `applyFiltersToTable(tableId)`
מפעיל פילטרים על טבלה ספציפית.

```javascript
function applyFiltersToTable(tableId) {
  const container = document.getElementById(tableId);
  if (!container) {
    console.warn(`⚠️ Table container not found: ${tableId}`);
    return;
  }
  
  const rows = container.querySelectorAll('tbody tr');
  let visibleCount = 0;
  
  rows.forEach(row => {
    const shouldShow = evaluateFilters(row);
    row.style.display = shouldShow ? '' : 'none';
    if (shouldShow) visibleCount++;
  });
  
  updateTableCount(tableId, visibleCount, rows.length);
}
```

### `evaluateFilters(row)`
מעריך האם שורה עומדת בקריטריונים של הפילטרים.

```javascript
function evaluateFilters(row) {
  // פילטר סטטוס
  if (currentFilters.status !== 'all') {
    const statusCell = row.querySelector('[data-status]');
    if (statusCell && statusCell.dataset.status !== currentFilters.status) {
      return false;
    }
  }
  
  // פילטר סוג
  if (currentFilters.type !== 'all') {
    const typeCell = row.querySelector('[data-type]');
    if (typeCell && typeCell.dataset.type !== currentFilters.type) {
      return false;
    }
  }
  
  // פילטר חשבון
  if (currentFilters.account !== 'all') {
    const accountCell = row.querySelector('[data-account]');
    if (accountCell && accountCell.dataset.account !== currentFilters.account) {
      return false;
    }
  }
  
  // פילטר תאריכים
  if (currentFilters.dateRange !== 'all') {
    const dateCell = row.querySelector('[data-date]');
    if (dateCell && !isDateInRange(dateCell.dataset.date, currentFilters.dateRange)) {
      return false;
    }
  }
  
  // פילטר חיפוש
  if (currentFilters.search) {
    const text = row.textContent.toLowerCase();
    if (!text.includes(currentFilters.search.toLowerCase())) {
      return false;
    }
  }
  
  return true;
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

## שימוש

### אתחול מערכת
```javascript
// אתחול אוטומטי
if (window.filterSystem) {
  window.filterSystem.initialize();
}
```

### הפעלת פילטרים
```javascript
// הפעלת כל הפילטרים
window.filterSystem.applyAllFilters();

// הפעלת פילטרים על טבלה ספציפית
window.filterSystem.applyFiltersToTable('tradesContainer');
```

### איפוס פילטרים
```javascript
// איפוס כל הפילטרים
window.filterSystem.resetFilters();

// איפוס ידני (גיבוי)
window.resetFiltersManually();
```

## תיקונים אחרונים (אוגוסט 2025)

### בעיות שתוקנו:
1. **שגיאת פונקציה לא קיימת**: `window.filterSystem.resetFilters is not a function`
2. **סקריפטים חסרים**: הוספת `filter-system.js` לעמוד ההעדפות
3. **אתחול שגוי**: תיקון אתחול מערכת הפילטרים
4. **פונקציות חסרות**: הוספת פונקציות עזר גלובליות

### שינויים שבוצעו:
- הוספת `filter-system.js` לעמוד ההעדפות
- תיקון סדר הטעינה של הסקריפטים
- הוספת פונקציות עזר גלובליות ב-`header-system.js`
- תיקון אתחול מערכת הפילטרים
- הוספת בדיקות קיום פונקציות

### פונקציות חדשות שנוספו:
- `getVisibleContainers()` - קבלת כל הקונטיינרים הנראים
- `showAllRecordsInTable()` - הצגת כל הרשומות בטבלה
- `updateTableCount()` - עדכון מספר הרשומות בטבלה
- `resetFiltersManually()` - איפוס ידני של פילטרים (גיבוי)
- `handleElementNotFound()` - טיפול במקרה שאלמנט לא נמצא
- `handleDataLoadError()` - טיפול בשגיאות טעינת נתונים
- `tryLoadData()` - ניסיון לטעינת נתונים

## תלויות

### Frontend Dependencies
- `tables.js` - פונקציות טבלאות
- `main.js` - פונקציות גלובליות
- `ui-utils.js` - פונקציות ממשק משתמש
- `notification-system.js` - מערכת התראות

### Backend Dependencies
- `accounts.py` - API חשבונות
- SQLite database - בסיס נתונים

## הערות טכניות

### שמירת פילטרים
פילטרים נשמרים ב-localStorage ונשמרים בין דפים.

### ביצועים
- פילטרים מופעלים רק על שורות נראות
- עדכון דינמי של מספר הרשומות
- שמירת פילטרים אוטומטית

### תאימות
המערכת עובדת עם כל הטבלאות במערכת:
- trade_plansContainer
- tradesContainer
- executionsContainer
- cash_flowsContainer
- alertsContainer
- notesContainer
- accountsContainer
- tickersContainer

## היסטוריית גרסאות

### v1.3.1 (אוגוסט 2025)
- תיקון שגיאות מערכת פילטרים
- הוספת פונקציות עזר גלובליות
- שיפור אתחול מערכת
- תיקון אינטגרציה עם עמוד ההעדפות

### v1.3.0 (אוגוסט 2025)
- הוספת תמיכה בטבלאות מרובות
- שיפור ביצועים
- הוספת שמירת פילטרים

### v1.2.0 (יולי 2025)
- הוספת פילטר תאריכים
- שיפור ממשק משתמש
- הוספת עדכון דינמי

### v1.1.0 (יוני 2025)
- הוספת פילטרים בסיסיים
- יצירת API endpoints
- אינטגרציה עם מערכת הטבלאות

### v1.0.0 (מאי 2025)
- גרסה ראשונית
- פילטרים בסיסיים בלבד
