# תוכנית אינטגרציה: מערכת Watch List
## Integration Plan: Watch List System

**תאריך:** 28 בינואר 2025  
**גרסה:** 1.0.0  
**מטרה:** תוכנית אינטגרציה מלאה עם כל המערכות הקיימות ב-TikTrack

---

## סקירה כללית

מערכת Watch List משתלבת עם מערכות כלליות רבות במערכת. מסמך זה מפרט את כל נקודות האינטגרציה.

---

## 1. Unified Initialization System

### Integration Points

**Package Addition:**
```javascript
// trading-ui/scripts/init-system/package-manifest.js
{
  name: 'watch-lists',
  description: 'Watch Lists management system',
  scripts: [
    'services/watch-lists-data.js',
    'services/watch-lists-ui-service.js',
    'watch-lists.js' // Page-specific logic
  ],
  dependencies: ['base', 'services', 'ui-advanced', 'crud'],
  loadAfter: ['tickers-data', 'external-data-service']
}
```

**Page Config:**
```javascript
// trading-ui/scripts/page-initialization-configs.js
window.pageInitializationConfigs['watch-lists'] = {
  packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'watch-lists', 'init-system'],
  requiredGlobals: [
    'UnifiedCacheManager',
    'CRUDResponseHandler',
    'ModalManagerV2',
    'UnifiedTableSystem',
    'IconSystem',
    'FieldRendererService',
    'ExternalDataService'
  ],
  pageType: 'main',
  description: 'Watch Lists management page'
};
```

**Initialization:**
- Watch Lists Data Service יטען ב-Package `watch-lists`
- UI Service יטען יחד עם Data Service
- Page-specific logic (`watch-lists.js`) יטען אחרי כל השירותים

---

## 2. Unified Cache Manager

### Cache Keys

```javascript
const CACHE_KEYS = {
  watchLists: (userId) => `watch-lists-data:user:${userId}`,
  watchList: (listId) => `watch-list:${listId}`,
  watchListItems: (listId) => `watch-list-items:list:${listId}`,
  flaggedTickers: (userId, color) => `flagged-tickers:user:${userId}:color:${color}`,
  externalTickers: (userId) => `external-tickers:user:${userId}`
};
```

### Cache Strategy

**Watch Lists:**
- Layer: Memory → LocalStorage
- TTL: 60 seconds
- Invalidation: On create/update/delete

**Watch List Items:**
- Layer: Memory → LocalStorage
- TTL: 45 seconds (shorter - changes more frequently)
- Invalidation: On add/update/remove/reorder

**External Data:**
- Layer: Backend (shared across users)
- Managed by: ExternalDataService
- TTL: Per External Data Service settings

### Invalidation Pattern

```javascript
// On watch list CRUD
await window.CacheSyncManager.invalidateByAction('watch-list-updated', {
  dependencies: [
    `watch-lists-data:user:${userId}`,
    `watch-list:${listId}`
  ]
});

// On item CRUD
await window.CacheSyncManager.invalidateByAction('watch-list-item-updated', {
  dependencies: [
    `watch-list-items:list:${listId}`,
    `flagged-tickers:user:${userId}:*`,
    `external-tickers:user:${userId}`
  ]
});
```

---

## 3. CRUD Response Handler

### Integration

```javascript
// Create Watch List
const response = await window.WatchListsData.createWatchList(payload);
await window.CRUDResponseHandler.handleResponse(response, {
  entityType: 'watch_list',
  operation: 'create',
  onSuccess: async () => {
    await invalidateWatchListsCache();
    if (window.WatchListsPage) {
      await window.WatchListsPage.refreshLists();
    }
  },
  showNotification: true,
  closeModal: 'watchListModal'
});
```

### Supported Operations
- `create` - Watch list / Item
- `update` - Watch list / Item
- `delete` - Watch list / Item
- `reorder` - Lists / Items

---

## 4. Modal Manager V2

### Modal Configurations

**Add/Edit Watch List Modal:**
```javascript
window.ModalManagerV2.registerModal('watch-list', {
  modalId: 'watchListModal',
  title: (mode) => mode === 'add' ? 'רשימה חדשה' : 'עריכת רשימה',
  onOpen: (mode, data) => {
    // Populate form with data (if edit mode)
  },
  onSave: async (formData) => {
    if (mode === 'add') {
      return await window.WatchListsData.createWatchList(formData);
    } else {
      return await window.WatchListsData.updateWatchList(listId, formData);
    }
  },
  validation: {
    name: { required: true, maxLength: 100 }
  }
});
```

**Add Ticker Modal:**
```javascript
window.ModalManagerV2.registerModal('add-ticker', {
  modalId: 'addTickerModal',
  title: 'הוסף טיקר לרשימה',
  onSave: async (formData) => {
    return await window.WatchListsData.addTickerToList(listId, formData);
  }
});
```

---

## 5. Unified Table System

### Table Registration

```javascript
// Register watch list items table
window.UnifiedTableSystem.registry.register('watch_list_items', {
  dataGetter: () => window.WatchListsPage?.currentItems || [],
  updateFunction: (data) => {
    window.WatchListsPage?.updateTableView(data);
  },
  tableSelector: '#watchListItemsTable',
  columns: [
    { key: 'symbol', sortable: true },
    { key: 'name', sortable: true },
    { key: 'price', sortable: true, renderer: 'amount' },
    { key: 'change_percent', sortable: true, renderer: 'percentage' },
    { key: 'flag_color', sortable: false, renderer: 'flag' }
  ],
  defaultSort: { column: 'display_order', direction: 'asc' }
});
```

### Sorting Integration
- Manual order (`display_order`) - default sort
- Column sorting - override manual order temporarily
- Restore manual order on refresh

---

## 6. Icon System

### Usage

```javascript
// Watch List Icon
const icon = await window.IconSystem.renderIcon('section', 'eye', {
  size: '16',
  class: 'section-icon'
});

// Flag Icon
const flagIcon = await window.IconSystem.renderIcon('button', 'flag-filled', {
  size: '16',
  color: flagColor,
  class: 'flag-icon'
});

// View Mode Icons
const tableIcon = await window.IconSystem.renderIcon('button', 'table', {
  size: '16'
});
```

### Icons Needed
- `eye` - Watch Lists main icon
- `flag` / `flag-filled` - Flag icons
- `table` - Table view
- `cards` - Cards view
- `list` - Compact view
- `grip-vertical` - Drag handle

---

## 7. Field Renderer Service

### Usage

```javascript
// Price rendering
window.FieldRendererService.renderAmount(item.price, 'currency');

// Percentage rendering
window.FieldRendererService.renderPercentage(item.change_percent);

// Status/Badge rendering (for external tickers)
window.FieldRendererService.renderBadge('חיצוני', 'secondary');
```

---

## 8. External Data Service

### Integration Strategy

**Loading External Data:**
```javascript
async function loadExternalDataForItems(items) {
  const externalSymbols = items
    .filter(item => item.external_symbol)
    .map(item => item.external_symbol);
  
  // Batch load with caching
  const promises = externalSymbols.map(symbol =>
    window.ExternalDataService.getQuote(symbol, {
      forceRefresh: false // Use cache
    })
  );
  
  const results = await Promise.allSettled(promises);
  return results.map((result, index) => ({
    symbol: externalSymbols[index],
    data: result.status === 'fulfilled' ? result.value : null
  }));
}
```

**Caching:**
- External data נשמר ב-Backend cache (shared)
- Frontend cache דרך ExternalDataService
- TTL: לפי הגדרות External Data Service

**Performance:**
- Batch requests במקום individual requests
- Use cache when possible
- Lazy load רק כש-`includeExternalData=true`

---

## 9. Button System

### Usage

```html
<!-- Add Button -->
<button type="button"
        data-button-type="ADD"
        data-variant="primary"
        data-icon="➕"
        data-text="רשימה חדשה"
        data-onclick="window.WatchListsPage?.openAddListModal()">
</button>

<!-- Edit Button -->
<button type="button"
        data-button-type="EDIT"
        data-variant="small"
        data-onclick="window.WatchListsPage?.editList(id)">
</button>

<!-- Delete Button -->
<button type="button"
        data-button-type="DELETE"
        data-variant="small"
        data-onclick="window.WatchListsPage?.deleteList(id)">
</button>
```

---

## 10. Color Scheme System

### Flag Colors from Entity Colors

```javascript
function getFlagColors() {
  const entityColors = window.ENTITY_COLORS || {};
  
  // Select 8 colors from entity colors
  return [
    { name: 'Trade', color: entityColors.trade || '#26baac' },
    { name: 'Trade Plan', color: entityColors.tradePlan || '#0056b3' },
    { name: 'Account', color: entityColors.account || '#28a745' },
    { name: 'Cash Flow', color: entityColors.cashFlow || '#20c997' },
    { name: 'Ticker', color: entityColors.ticker || '#dc3545' },
    { name: 'Alert', color: entityColors.alert || '#ff9c05' },
    { name: 'Note', color: entityColors.note || '#6f42c1' },
    { name: 'Execution', color: entityColors.execution || '#17a2b8' }
  ];
}
```

---

## 11. Info Summary System

### Summary Cards

```javascript
window.InfoSummarySystem.registerSummary('watch-lists', {
  cards: [
    {
      id: 'totalWatchLists',
      label: 'סה״כ רשימות',
      value: (data) => data.watchLists?.length || 0,
      variant: 'primary'
    },
    {
      id: 'totalTickers',
      label: 'טיקרים כולל',
      value: (data) => {
        const allItems = data.watchLists?.flatMap(list => list.items || []);
        return allItems?.length || 0;
      },
      variant: 'secondary'
    },
    {
      id: 'activeFlags',
      label: 'דגלים פעילים',
      value: (data) => {
        const allItems = data.watchLists?.flatMap(list => list.items || []);
        return new Set(allItems?.filter(item => item.flag_color).map(item => item.flag_color)).size;
      },
      variant: 'success'
    },
    {
      id: 'externalTickers',
      label: 'טיקרים חיצוניים',
      value: (data) => {
        const allItems = data.watchLists?.flatMap(list => list.items || []);
        return allItems?.filter(item => item.external_symbol).length || 0;
      },
      variant: 'warning'
    }
  ]
});
```

---

## 12. Notification System

### Usage

```javascript
// Success
window.showSuccessNotification('רשימה נוצרה בהצלחה');

// Error
window.showErrorNotification('שגיאה ביצירת רשימה', errorMessage);

// Warning
window.showWarningNotification('הרשימה כבר מכילה את הטיקר הזה');

// Info
window.showInfoNotification('טיקרים עודכנו', 'נתוני מחיר עודכנו מהשרת');
```

---

## 13. Page State Management

### State to Save

```javascript
// Save view mode per list
window.savePageState('watch-lists', {
  activeListId: currentListId,
  viewMode: currentViewMode,
  selectedFlagColor: selectedFlagColor
});

// Restore on load
const state = window.loadPageState('watch-lists');
if (state) {
  if (state.activeListId) {
    await window.WatchListsPage.selectList(state.activeListId);
  }
  if (state.viewMode) {
    window.WatchListsPage.setViewMode(state.viewMode);
  }
}
```

---

## 14. Section Toggle System

### Integration

```html
<div class="section-header">
  <button type="button"
          data-button-type="TOGGLE"
          data-variant="small"
          data-onclick="toggleSection('watch-lists-section')"
          data-text="הצג/הסתר">
  </button>
</div>
```

- State נשמר ב-localStorage
- Restore on page load
- Icon updates (▲/▼)

---

## 15. Linked Items System (Future)

### Integration with Tickers

כשטיקר נמחק מהמערכת:
- Item ברשימה נשאר עם `external_symbol`
- אם אין `external_symbol` → ה-Item מוסר

כשטיקר חדש נוצר:
- אפשרות להוסיף אוטומטית לרשימה (אופציונלי)

---

## 16. Alerts System (Future Integration)

### Price Alert Integration

**תכנון עתידי:**
- Alert על שינוי מחיר לטיקר ב-Watch List
- Alert על breakout/breakdown
- Alert על volume spike

**Integration Points:**
- Button "Create Alert" ב-item row
- Pre-fill alert form עם ticker info
- Link back to watch list from alert

---

## 17. Export System (Future)

### Export Formats

**CSV:**
```
Symbol,Name,Price,Change%,Flag
AAPL,Apple Inc.,150.25,1.42%,#26baac
```

**JSON:**
```json
{
  "watch_list": "Tech Stocks",
  "items": [...]
}
```

**Symbols List:**
```
AAPL,MSFT,GOOGL,TSLA
```

---

## Dependency Graph

```
watch-lists.js (Page Logic)
  ├── watch-lists-data.js
  │   ├── UnifiedCacheManager
  │   ├── CRUDResponseHandler
  │   ├── CacheSyncManager
  │   └── ExternalDataService
  ├── watch-lists-ui-service.js
  │   ├── IconSystem
  │   ├── FieldRendererService
  │   ├── ModalManagerV2
  │   └── UnifiedTableSystem
  └── External Systems
      ├── NotificationSystem
      ├── ColorSchemeSystem
      ├── InfoSummarySystem
      └── PageStateManagement
```

---

## Testing Integration Points

### Unit Tests
- Data Service CRUD operations
- UI Service view rendering
- Cache invalidation logic

### Integration Tests
- ModalManagerV2 integration
- UnifiedTableSystem integration
- ExternalDataService integration

### E2E Tests
- Full CRUD flow
- View mode switching
- Drag & drop reordering
- Flag management

---

**סיכום:** כל האינטגרציות מתוכננות בקפידה עם שימוש במערכות הקיימות ללא יצירת כפילות קוד.


















