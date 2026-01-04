# Table Integration Option A Implementation Notes - TikTrack

## סקירה כללית

**Table Integration Option A** מתארת את היישום של אינטגרציה בין `TableDataRegistry` לבין `UnifiedTableSystem`. אופציה זו מתמקדת ביצירת ממשק אחיד לניהול נתוני טבלאות עם רישום דינמי של מקורות נתונים.

## ארכיטקטורה

### רכיבי הליבה

#### 1. TableDataRegistry

- **תפקיד:** רישום וחיפוש מקורות נתונים לטבלאות
- **פונקציות:** register, unregister, getDataSource
- **אחסון:** Map של tableId → dataSource configuration

#### 2. UnifiedTableSystem

- **תפקיד:** מערכת טבלאות אחידה עם API נקי
- **פונקציות:** render, update, filter, sort
- **אינטגרציה:** משתמש ב-TableDataRegistry למקורות נתונים

#### 3. Data Source Adapters

- **תפקיד:** התאמת מקורות נתונים שונים ל-API אחיד
- **סוגים:** API, Cache, Static, Computed
- **פלט:** Promise עם data array

### זרימת אינטגרציה

```javascript
// Complete table integration flow
async function renderTable(tableId, container) {
  // 1. Get data source from registry
  const dataSource = TableDataRegistry.getDataSource(tableId);

  // 2. Fetch data using adapter
  const data = await dataSource.fetch();

  // 3. Create table with UnifiedTableSystem
  const table = new UnifiedTableSystem({
    container,
    data,
    columns: dataSource.columns,
    onDataRefresh: () => dataSource.fetch()
  });

  return table;
}
```

## TableDataRegistry API

### רישום מקור נתונים

```javascript
// Register a data source
TableDataRegistry.register('tradesTable', {
  type: 'api',
  endpoint: '/api/trades/',
  columns: ['symbol', 'quantity', 'price', 'status'],
  filters: ['status', 'date'],
  sort: ['created_at'],
  refreshInterval: 30000 // 30 seconds
});
```

### חיפוש מקור נתונים

```javascript
// Get registered data source
const dataSource = TableDataRegistry.getDataSource('tradesTable');

// Returns: DataSource object with fetch() method
```

### עדכון מקור נתונים

```javascript
// Update existing registration
TableDataRegistry.update('tradesTable', {
  refreshInterval: 60000, // Change to 1 minute
  filters: ['status', 'date', 'symbol'] // Add symbol filter
});
```

### הסרת רישום

```javascript
// Unregister data source
TableDataRegistry.unregister('tradesTable');
```

## Data Source Types

### API Data Source

```javascript
const apiDataSource = {
  type: 'api',
  endpoint: '/api/trades/',
  method: 'GET',
  headers: { 'Authorization': `Bearer ${token}` },
  params: { status: 'active', limit: 100 },

  async fetch() {
    const response = await fetch(this.endpoint, {
      method: this.method,
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return this.transform ? this.transform(data) : data;
  }
};
```

### Cache Data Source

```javascript
const cacheDataSource = {
  type: 'cache',
  cacheKey: 'trades:list',
  fallbackSource: apiDataSource, // Fallback if cache miss

  async fetch() {
    // Try cache first
    const cached = await CacheManager.get(this.cacheKey);
    if (cached && CacheTTLGuard.isValid(cached.timestamp)) {
      return cached.data;
    }

    // Fallback to API
    const data = await this.fallbackSource.fetch();

    // Cache the result
    await CacheManager.set(this.cacheKey, data, { ttl: 300000 });

    return data;
  }
};
```

### Static Data Source

```javascript
const staticDataSource = {
  type: 'static',
  data: [
    { id: 1, name: 'Item 1', status: 'active' },
    { id: 2, name: 'Item 2', status: 'inactive' }
  ],

  async fetch() {
    return this.data; // Return static data
  }
};
```

### Computed Data Source

```javascript
const computedDataSource = {
  type: 'computed',
  dependencies: ['tradesTable', 'executionsTable'],

  async fetch() {
    // Get data from dependencies
    const trades = await TableDataRegistry.getDataSource('tradesTable').fetch();
    const executions = await TableDataRegistry.getDataSource('executionsTable').fetch();

    // Compute combined data
    return trades.map(trade => ({
      ...trade,
      executionCount: executions.filter(e => e.trade_id === trade.id).length
    }));
  }
};
```

## UnifiedTableSystem Integration

### יצירת טבלה עם TableDataRegistry

```javascript
// Create table using registry
const table = await UnifiedTableSystem.createFromRegistry('tradesTable', {
  container: document.getElementById('tradesContainer'),
  options: {
    pagination: true,
    sorting: true,
    filtering: true
  }
});
```

### טיפול באירועי טבלה

```javascript
// Handle table events
table.on('dataRefresh', async () => {
  Logger.info('Table data refreshed', { tableId: 'tradesTable' });
});

table.on('filterChanged', (filters) => {
  // Update URL or save state
  FilterStateManager.saveFilters('tradesTable', filters);
});

table.on('rowSelected', (rowData) => {
  // Handle row selection
  ModalSystem.openDetailModal(rowData);
});
```

### עדכון נתונים בזמן אמת

```javascript
// Real-time data updates
function setupRealTimeUpdates(tableId) {
  const dataSource = TableDataRegistry.getDataSource(tableId);

  if (dataSource.refreshInterval) {
    setInterval(async () => {
      const newData = await dataSource.fetch();
      table.updateData(newData);
    }, dataSource.refreshInterval);
  }
}
```

## יתרונות אופציה זו

### 1. הפרדה ברורה של אחריות

- **TableDataRegistry:** ניהול מקורות נתונים
- **UnifiedTableSystem:** הצגה וטיפול באירועי UI
- **Data Sources:** לוגיקת חיפוש נתונים

### 2. גמישות מקסימלית

- תמיכה במקורות נתונים שונים (API, Cache, Static, Computed)
- הרחבה קלה של סוגי data sources חדשים
- התאמה לדרישות עסקיות משתנות

### 3. ביצועים אופטימליים

- Lazy loading של data sources
- Cache-first strategy
- Incremental updates

### 4. תחזוקה פשוטה

- רישום דקלרטיבי של טבלאות
- שינויים מרוכזים ב-registry
- בדיקות מבודדות לכל רכיב

## מימוש טכני

### רישום טבלאות בעת אתחול

```javascript
// Initialize table registry on app startup
function initializeTableRegistry() {
  // Register all application tables
  TableDataRegistry.register('tradesTable', tradeDataSource);
  TableDataRegistry.register('alertsTable', alertDataSource);
  TableDataRegistry.register('portfolioTable', portfolioDataSource);

  Logger.info('Table registry initialized', {
    registeredTables: TableDataRegistry.getAllTableIds()
  });
}
```

### טיפול בשגיאות

```javascript
// Error handling for data sources
async function safeFetch(dataSource) {
  try {
    return await dataSource.fetch();
  } catch (error) {
    Logger.error('Data source fetch failed', {
      dataSource: dataSource.type,
      error: error.message
    });

    // Return fallback data or empty array
    return dataSource.fallbackData || [];
  }
}
```

### בדיקות אינטגרציה

```javascript
// Test table integration
describe('Table Integration Option A', () => {
  it('should register and fetch data source', async () => {
    const mockData = [{ id: 1, name: 'Test' }];

    TableDataRegistry.register('testTable', {
      type: 'static',
      data: mockData
    });

    const dataSource = TableDataRegistry.getDataSource('testTable');
    const data = await dataSource.fetch();

    expect(data).toEqual(mockData);
  });

  it('should handle data source errors gracefully', async () => {
    const failingSource = {
      type: 'api',
      async fetch() { throw new Error('API down'); }
    };

    TableDataRegistry.register('failingTable', failingSource);

    const table = await UnifiedTableSystem.createFromRegistry('failingTable');
    expect(table.getRowCount()).toBe(0); // Should show empty table
  });
});
```

## הערות יישום

### שיקולים לביצועים

- השתמש ב-memoization ל-data sources יקרים
- implement connection pooling ל-API calls
- השתמש ב-Web Workers ל-computed data sources כבדים

### שיקולי אבטחה

- אימות זהות למקורות API
- הצפנת נתונים רגישים ב-cache
- rate limiting למניעת abuse

### שיקולי נגישות

- תמיכה ב-keyboard navigation
- screen reader compatibility
- high contrast mode support

---

**גרסה:** 1.0.0
**תאריך:** 1 בינואר 2026
**סטטוס:** ✅ פעיל ומתועד
