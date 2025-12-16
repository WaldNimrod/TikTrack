# מפרט שירותי Frontend: מערכת Watch List

## Frontend Services Specification: Watch List System

**תאריך:** 28 בינואר 2025  
**גרסה:** 1.0.0  
**מטרה:** מפרט מלא של שירותי Frontend למערכת Watch List

---

## סקירה כללית

מערכת Watch List דורשת שני שירותי Frontend עיקריים:

1. **watch-lists-data.js** - Data Service (CRUD + Cache)
2. **watch-lists-ui-service.js** - UI Service (תצוגות, דגלים, Quick Actions)

---

## 1. Watch Lists Data Service

**קובץ:** `trading-ui/scripts/services/watch-lists-data.js`

### מטרה

שירות נתונים מאוחד ל-Watch Lists עם אינטגרציה מלאה ל-UnifiedCacheManager, CRUDResponseHandler, ו-CacheSyncManager.

### מבנה

```javascript
(function watchListsDataService() {
  const WATCH_LISTS_DATA_KEY = 'watch-lists-data';
  const WATCH_LIST_ITEMS_KEY = 'watch-list-items';
  const WATCH_LISTS_TTL = 60 * 1000; // 60 seconds
  const PAGE_LOG_CONTEXT = { page: 'watch-lists-data' };
  
  // ... implementation
})();
```

### Functions

#### Cache Management

**`saveWatchListsCache(data, options)`**

- שמירת רשימות ב-UnifiedCacheManager
- TTL: 60 שניות
- Key: `watch-lists-data:user:{user_id}`

**`invalidateWatchListsCache()`**

- Invalidation דרך CacheSyncManager
- Fallback ל-direct invalidation
- Pattern: `watch-lists-*`

**`clearWatchListsCache(patternOnly)`**

- ניקוי מטמון לפי pattern או key ספציפי

---

#### Data Loading

**`fetchWatchListsFromApi({ signal })`**

- GET `/api/watch-lists`
- Returns: Promise<Array<WatchList>>
- Error handling עם NotificationSystem

**`loadWatchListsData(options)`**

- טעינה עם cache support
- Options: `{ force, signal }`
- Returns: Promise<Array<WatchList>>

**`fetchWatchListItems(listId, options)`**

- GET `/api/watch-lists/:id/items`
- Options: `{ includeExternalData: true }`
- Returns: Promise<Array<WatchListItem>>

**`loadWatchListItemsData(listId, options)`**

- טעינה עם cache
- Cache key: `watch-list-items:list:{listId}`

---

#### CRUD Operations - Lists

**`createWatchList(payload, options)`**

- POST `/api/watch-lists`
- Payload: `{ name, icon?, color_hex?, view_mode? }`
- Integration עם CRUDResponseHandler
- Cache invalidation

**`updateWatchList(listId, payload, options)`**

- PUT `/api/watch-lists/:id`
- Payload: כל השדות אופציונליים
- Cache invalidation

**`deleteWatchList(listId, options)`**

- DELETE `/api/watch-lists/:id`
- Cache invalidation
- Confirm modal (optional)

**`fetchWatchListDetails(listId, options)`**

- GET `/api/watch-lists/:id`
- Returns: Promise<WatchList>

---

#### CRUD Operations - Items

**`addTickerToList(listId, payload, options)`**

- POST `/api/watch-lists/:id/items`
- Payload: `{ ticker_id }` OR `{ external_symbol, external_name? }`
- Optional: `{ flag_color, notes, display_order }`
- Validation: max 50 items
- Cache invalidation

**`updateWatchListItem(listId, itemId, payload, options)`**

- PUT `/api/watch-lists/:id/items/:item_id`
- Payload: `{ flag_color?, notes?, display_order? }`

**`removeTickerFromList(listId, itemId, options)`**

- DELETE `/api/watch-lists/:id/items/:item_id`

**`copyItemToList(sourceListId, itemId, targetListId, options)`**

- POST `/api/watch-lists/:id/items/copy`
- Payload: `{ item_id, target_list_id }`

---

#### Reordering

**`reorderWatchLists(order, options)`**

- POST `/api/watch-lists/reorder`
- Payload: `{ order: [{ id, display_order }] }`

**`reorderWatchListItems(listId, order, options)`**

- POST `/api/watch-lists/:id/items/reorder`
- Payload: `{ order: [{ id, display_order }] }`

---

#### Flag-based Queries

**`fetchFlaggedTickers(color, options)`**

- GET `/api/watch-lists/flags/:color`
- Returns: Promise<Array<WatchListItem>> (מכל הרשימות)

**`fetchExternalTickers(options)`**

- GET `/api/watch-lists/external-tickers`
- Returns: Promise<Array<WatchListItem>> (רק טיקרים חיצוניים)

---

### Integration Points

#### UnifiedCacheManager

```javascript
await window.UnifiedCacheManager.save(WATCH_LISTS_DATA_KEY, data, { ttl: WATCH_LISTS_TTL });
const cached = await window.UnifiedCacheManager.get(WATCH_LISTS_DATA_KEY);
await window.UnifiedCacheManager.invalidate(WATCH_LISTS_DATA_KEY);
```

#### CacheSyncManager

```javascript
await window.CacheSyncManager.invalidateByAction('watch-list-updated');
```

#### CRUDResponseHandler

```javascript
const response = await window.CRUDResponseHandler.handleResponse(
  apiResponse,
  {
    entityType: 'watch_list',
    operation: 'create',
    onSuccess: () => invalidateWatchListsCache(),
    showNotification: true
  }
);
```

#### NotificationSystem

```javascript
window.showSuccessNotification('רשימה נוצרה בהצלחה');
window.showErrorNotification('שגיאה ביצירת רשימה', errorMessage);
```

---

## 2. Watch Lists UI Service

**קובץ:** `trading-ui/scripts/services/watch-lists-ui-service.js`

### מטרה

ניהול UI logic: תצוגות, דגלים, Quick Actions, סידור ידני.

### מבנה

```javascript
class WatchListsUIService {
  constructor() {
    this.currentViewMode = 'table'; // 'table', 'cards', 'compact'
    this.flagColors = this.getFlagColors(); // 8 colors from entity colors
  }
  
  // ... implementation
}

window.WatchListsUIService = new WatchListsUIService();
```

### Functions

#### View Management

**`setViewMode(listId, mode)`**

- מצב: 'table', 'cards', 'compact'
- שמירה ב-localStorage: `watch-list-{listId}-view-mode`
- עדכון UI

**`getViewMode(listId)`**

- קריאה מ-localStorage או default: 'table'

**`renderTableView(items, containerId)`**

- רינדור טבלה עם UnifiedTableSystem
- Columns: Symbol, Name, Price, Change, Change%, Flag, Actions
- Integration עם FieldRendererService

**`renderCardsView(items, containerId)`**

- רינדור cards grid
- כל card: Symbol, Name, Price, Change%, Flag

**`renderCompactView(items, containerId)`**

- רינדור רשימה קומפקטית
- מינימלי: Symbol, Price, Change%, Flag

---

#### Flag Management

**`getFlagColors()`**

- החזרת 8 צבעי דגלים מ-entity colors
- Source: `window.ENTITY_COLORS` או preferences
- Default: trade, tradePlan, account, cashFlow, ticker, alert, note, execution

**`renderFlagIcon(flagColor)`**

- רינדור איקון דגל עם צבע
- SVG icon מ-IconSystem

**`showFlagPalette(itemId, callback)`**

- הצגת Quick Palette עם 8 צבעים
- Click → callback עם צבע נבחר
- אפשרות להסרת דגל

**`updateItemFlag(listId, itemId, color)`**

- קריאה ל-updateWatchListItem
- עדכון UI
- Cache invalidation

---

#### Quick Actions

**`showAddTickerModal(listId)`**

- פתיחת modal להוספת טיקר
- Search + Typeahead
- תמיכה בטיקרים במערכת וחיצוניים

**`showEditItemModal(listId, itemId)`**

- פתיחת modal לעריכת פריט
- Fields: Flag, Notes

**`showCopyItemMenu(itemId, callback)`**

- Context menu עם רשימת רשימות יעד
- בחירה → העתקה

**`quickRemoveItem(listId, itemId, confirm)`**

- הסרה מהירה
- Optional confirmation

---

#### Manual Reordering

**`initializeDragAndDrop(containerId, onReorder)`**

- Initialization של drag & drop
- Library: Native HTML5 Drag & Drop או SortableJS
- Callback על סיום: `onReorder(newOrder)`

**`renderDragHandle(itemId)`**

- רינדור drag handle (≡ icon)
- מיקום: תחילת שורה/card

**`handleReorderLists(newOrder)`**

- קריאה ל-reorderWatchLists
- עדכון UI
- Cache invalidation

**`handleReorderItems(listId, newOrder)`**

- קריאה ל-reorderWatchListItems
- עדכון UI

---

#### External Data Integration

**`loadExternalDataForItems(items)`**

- קבלת external data לכל הטיקרים החיצוניים
- שימוש ב-`ExternalDataService.getQuote()`
- Batch requests (אם נתמך)

**`enrichItemWithExternalData(item, externalData)`**

- הוספת external data ל-item object
- Fields: price, change_percent, change_amount, volume

**`refreshExternalData(listId)`**

- רענון נתונים חיצוניים לרשימה
- Force refresh = true

---

### Integration Points

#### IconSystem

```javascript
const icon = await window.IconSystem.renderIcon('button', 'flag', {
  size: '16',
  color: flagColor
});
```

#### FieldRendererService

```javascript
window.FieldRendererService.renderAmount(item.price, 'currency');
window.FieldRendererService.renderPercentage(item.change_percent);
```

#### ModalManagerV2

```javascript
window.ModalManagerV2.openModal('add-ticker', {
  watchListId: listId,
  onSuccess: (ticker) => addTickerToList(listId, ticker)
});
```

#### UnifiedTableSystem

```javascript
window.UnifiedTableSystem.registry.register('watch_list_items', {
  dataGetter: () => items,
  updateFunction: (data) => renderTableView(data, containerId),
  tableSelector: '#watch-list-items-table'
});
```

---

## 3. External Data Service Integration

### שימוש ב-ExternalDataService

**Loading External Data:**

```javascript
async function loadExternalDataForItem(symbol) {
  if (!window.ExternalDataService) {
    return null;
  }
  
  try {
    const quote = await window.ExternalDataService.getQuote(symbol, {
      forceRefresh: false // Use cache if available
    });
    return quote;
  } catch (error) {
    window.Logger?.warn('Failed to load external data', { symbol, error });
    return null;
  }
}
```

**Batch Loading:**

```javascript
async function loadExternalDataForItems(items) {
  const externalSymbols = items
    .filter(item => item.external_symbol)
    .map(item => item.external_symbol);
  
  const promises = externalSymbols.map(symbol => 
    loadExternalDataForItem(symbol)
  );
  
  const results = await Promise.allSettled(promises);
  // Map results back to items
}
```

**Caching Strategy:**

- External data נשמר ב-Backend cache (משותף לכל המשתמשים)
- Frontend cache דרך ExternalDataService
- TTL: לפי הגדרות External Data Service

---

## 4. Error Handling

### Standard Error Handling

```javascript
function handleWatchListError(error, operation) {
  window.Logger?.error(`Watch List ${operation} failed`, {
    error: error.message,
    page: 'watch-lists-data'
  });
  
  const message = error.message || `שגיאה ב-${operation}`;
  window.showErrorNotification(message);
}
```

### Validation Errors

- Max lists exceeded → Notification עם הודעה ברורה
- Max items exceeded → Notification עם הודעה ברורה
- Duplicate item → Warning notification

---

## 5. Performance Considerations

### Lazy Loading

- External data נטען רק כש-`includeExternalData=true`
- Batch requests לטיקרים חיצוניים

### Debouncing

- Search input: debounce 300ms
- Reorder operations: debounce 500ms

### Virtual Scrolling

- לרשימות ארוכות (50+ items)
- רק ב-Table View

---

**סיכום:** שני השירותים מספקים API מלא לניהול Watch Lists ב-Frontend עם אינטגרציה מלאה לכל המערכות הקיימות.


























