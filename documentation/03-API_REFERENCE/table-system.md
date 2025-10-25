# Table System - API Reference

## Overview
מערכת ניהול טבלאות מרכזית עם מיון, סינון, caching ו-performance optimization.

## Core Table Functions

### `sortTableData(columnIndex, data, tableType, updateFunction)`
מיון נתוני טבלה

**Parameters:**
- `columnIndex` (number) - אינדקס העמודה למיון
- `data` (array) - נתוני הטבלה
- `tableType` (string) - סוג הטבלה
- `updateFunction` (function) - פונקציית עדכון

**Returns:** `void`

**Example:**
```javascript
// Sort by column 2 (date)
sortTableData(2, tradesData, 'trades', updateTradesTable);

// Sort by column 0 (name)
sortTableData(0, accountsData, 'accounts', updateAccountsTable);
```

### `sortTable(columnIndex, tableId)`
מיון טבלה קיימת

**Parameters:**
- `columnIndex` (number) - אינדקס העמודה למיון
- `tableId` (string) - מזהה הטבלה

**Returns:** `void`

**Example:**
```javascript
// Sort table by column 1
sortTable(1, 'trades-table');

// Sort table by column 3
sortTable(3, 'accounts-table');
```

### `loadTableData(tableId, data, options)`
טעינת נתונים לטבלה

**Parameters:**
- `tableId` (string) - מזהה הטבלה
- `data` (array) - נתוני הטבלה
- `options` (object, optional) - אפשרויות טעינה
  - `sortable` (boolean) - האם הטבלה ניתנת למיון
  - `filterable` (boolean) - האם הטבלה ניתנת לסינון
  - `pagination` (boolean) - האם יש דפדוף

**Returns:** `void`

**Example:**
```javascript
// Load data with sorting
loadTableData('trades-table', tradesData, {
    sortable: true,
    filterable: true,
    pagination: true
});
```

### `updateTable(tableId, data)`
עדכון נתוני טבלה

**Parameters:**
- `tableId` (string) - מזהה הטבלה
- `data` (array) - נתונים חדשים

**Returns:** `void`

**Example:**
```javascript
// Update table with new data
updateTable('trades-table', newTradesData);
```

## Table State Management

### `saveTableState(tableId, state)`
שמירת מצב טבלה

**Parameters:**
- `tableId` (string) - מזהה הטבלה
- `state` (object) - מצב הטבלה
  - `sortColumn` (number) - עמודת מיון
  - `sortDirection` (string) - כיוון מיון
  - `filter` (string) - סינון
  - `page` (number) - עמוד נוכחי

**Returns:** `void`

**Example:**
```javascript
// Save table state
saveTableState('trades-table', {
    sortColumn: 2,
    sortDirection: 'asc',
    filter: 'active',
    page: 1
});
```

### `loadTableState(tableId)`
טעינת מצב טבלה

**Parameters:**
- `tableId` (string) - מזהה הטבלה

**Returns:** `object` - מצב הטבלה או null

**Example:**
```javascript
// Load table state
const state = loadTableState('trades-table');
if (state) {
    // Apply saved state
    applyTableState('trades-table', state);
}
```

### `clearTableState(tableId)`
מחיקת מצב טבלה

**Parameters:**
- `tableId` (string) - מזהה הטבלה

**Returns:** `void`

**Example:**
```javascript
// Clear table state
clearTableState('trades-table');
```

## Table Filtering

### `filterTable(tableId, filterValue)`
סינון טבלה

**Parameters:**
- `tableId` (string) - מזהה הטבלה
- `filterValue` (string) - ערך הסינון

**Returns:** `void`

**Example:**
```javascript
// Filter table by value
filterTable('trades-table', 'AAPL');

// Clear filter
filterTable('trades-table', '');
```

### `applyTableFilter(tableId, filterConfig)`
החלת סינון מתקדם

**Parameters:**
- `tableId` (string) - מזהה הטבלה
- `filterConfig` (object) - הגדרות סינון
  - `column` (string) - עמודה לסינון
  - `value` (string) - ערך הסינון
  - `operator` (string) - אופרטור סינון (equals, contains, startsWith, etc.)

**Returns:** `void`

**Example:**
```javascript
// Filter by specific column
applyTableFilter('trades-table', {
    column: 'status',
    value: 'open',
    operator: 'equals'
});
```

## Table Pagination

### `setTablePage(tableId, page)`
הגדרת עמוד טבלה

**Parameters:**
- `tableId` (string) - מזהה הטבלה
- `page` (number) - מספר עמוד

**Returns:** `void`

**Example:**
```javascript
// Go to page 2
setTablePage('trades-table', 2);

// Go to first page
setTablePage('trades-table', 1);
```

### `getTablePageInfo(tableId)`
קבלת מידע על עמוד נוכחי

**Parameters:**
- `tableId` (string) - מזהה הטבלה

**Returns:** `object` - מידע על העמוד
  - `currentPage` (number) - עמוד נוכחי
  - `totalPages` (number) - סה"כ עמודים
  - `totalItems` (number) - סה"כ פריטים
  - `itemsPerPage` (number) - פריטים לעמוד

**Example:**
```javascript
const pageInfo = getTablePageInfo('trades-table');
console.log(`Page ${pageInfo.currentPage} of ${pageInfo.totalPages}`);
```

## Table Actions

### `generateTableActions(tableId, actions)`
יצירת כפתורי פעולה לטבלה

**Parameters:**
- `tableId` (string) - מזהה הטבלה
- `actions` (array) - רשימת פעולות
  - `type` (string) - סוג פעולה
  - `onClick` (function) - פונקציית לחיצה
  - `visible` (function, optional) - פונקציית נראות

**Returns:** `void`

**Example:**
```javascript
// Generate table actions
generateTableActions('trades-table', [
    { type: 'edit', onClick: (id) => editTrade(id) },
    { type: 'delete', onClick: (id) => deleteTrade(id) },
    { type: 'view', onClick: (id) => viewTrade(id) }
]);
```

### `loadTableActionButtons(tableId, actions)`
טעינת כפתורי פעולה לטבלה

**Parameters:**
- `tableId` (string) - מזהה הטבלה
- `actions` (array) - רשימת פעולות

**Returns:** `void`

**Example:**
```javascript
// Load action buttons
loadTableActionButtons('trades-table', [
    { type: 'edit', onClick: editTrade },
    { type: 'delete', onClick: deleteTrade }
]);
```

## Table Performance

### `optimizeTablePerformance(tableId, options)`
אופטימיזציה של ביצועי טבלה

**Parameters:**
- `tableId` (string) - מזהה הטבלה
- `options` (object) - אפשרויות אופטימיזציה
  - `virtualScrolling` (boolean) - גלילה וירטואלית
  - `lazyLoading` (boolean) - טעינה עצלה
  - `batchSize` (number) - גודל אצווה

**Returns:** `void`

**Example:**
```javascript
// Optimize table performance
optimizeTablePerformance('trades-table', {
    virtualScrolling: true,
    lazyLoading: true,
    batchSize: 50
});
```

### `getTablePerformanceMetrics(tableId)`
קבלת מדדי ביצועים של טבלה

**Parameters:**
- `tableId` (string) - מזהה הטבלה

**Returns:** `object` - מדדי ביצועים
  - `renderTime` (number) - זמן רינדור
  - `dataSize` (number) - גודל נתונים
  - `memoryUsage` (number) - שימוש בזיכרון

**Example:**
```javascript
const metrics = getTablePerformanceMetrics('trades-table');
console.log(`Render time: ${metrics.renderTime}ms`);
```

## Table Caching

### `cacheTableData(tableId, data)`
שמירת נתוני טבלה במטמון

**Parameters:**
- `tableId` (string) - מזהה הטבלה
- `data` (array) - נתוני הטבלה

**Returns:** `void`

**Example:**
```javascript
// Cache table data
cacheTableData('trades-table', tradesData);
```

### `getCachedTableData(tableId)`
קבלת נתוני טבלה מהמטמון

**Parameters:**
- `tableId` (string) - מזהה הטבלה

**Returns:** `array` - נתוני הטבלה או null

**Example:**
```javascript
// Get cached data
const cachedData = getCachedTableData('trades-table');
if (cachedData) {
    // Use cached data
    loadTableData('trades-table', cachedData);
}
```

### `clearTableCache(tableId)`
מחיקת מטמון טבלה

**Parameters:**
- `tableId` (string) - מזהה הטבלה

**Returns:** `void`

**Example:**
```javascript
// Clear table cache
clearTableCache('trades-table');
```

## Usage Examples

### Basic Table Setup
```javascript
// Load table with data
loadTableData('trades-table', tradesData, {
    sortable: true,
    filterable: true,
    pagination: true
});

// Add action buttons
generateTableActions('trades-table', [
    { type: 'edit', onClick: editTrade },
    { type: 'delete', onClick: deleteTrade }
]);
```

### Table State Management
```javascript
// Save table state
saveTableState('trades-table', {
    sortColumn: 2,
    sortDirection: 'desc',
    filter: 'active',
    page: 1
});

// Load table state on page load
const state = loadTableState('trades-table');
if (state) {
    applyTableState('trades-table', state);
}
```

### Performance Optimization
```javascript
// Optimize large tables
optimizeTablePerformance('trades-table', {
    virtualScrolling: true,
    lazyLoading: true,
    batchSize: 100
});

// Monitor performance
const metrics = getTablePerformanceMetrics('trades-table');
console.log('Table performance:', metrics);
```

## Best Practices

1. **Use appropriate table configuration:**
   ```javascript
   // Good - specific configuration
   loadTableData('trades-table', data, {
       sortable: true,
       filterable: true,
       pagination: true
   });
   ```

2. **Handle table state properly:**
   ```javascript
   // Save state before navigation
   saveTableState('trades-table', getCurrentTableState());
   
   // Restore state after navigation
   const state = loadTableState('trades-table');
   if (state) applyTableState('trades-table', state);
   ```

3. **Optimize for performance:**
   ```javascript
   // Use caching for large datasets
   cacheTableData('trades-table', data);
   
   // Enable virtual scrolling for large tables
   optimizeTablePerformance('trades-table', {
       virtualScrolling: true
   });
   ```

4. **Handle errors gracefully:**
   ```javascript
   try {
       loadTableData('trades-table', data);
   } catch (error) {
       showErrorNotification('שגיאה בטעינת טבלה: ' + error.message);
   }
   ```

## Dependencies
- Unified Cache Manager (for table data caching)
- Button System (for action buttons)
- Notification System (for error handling)

## File Location
`trading-ui/scripts/tables.js`

## Version
2.0 (Last updated: January 2025)

## Usage Statistics
- Used across all 29 pages
- 15+ table functions
- Integrated with unified cache system
- Performance optimized for large datasets
