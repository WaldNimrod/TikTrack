# Button System - API Reference

## Overview
מערכת כפתורים מרכזית עם שתי שכבות: בסיסית (כפתורים בודדים) ומתקדמת (כפתורי פעולות לטבלאות).

## Core Button Functions

### `createEditButton(onClick, additionalClasses)`
יצירת כפתור עריכה

**Parameters:**
- `onClick` (function) - פונקציית לחיצה
- `additionalClasses` (string, optional) - מחלקות CSS נוספות

**Returns:** `string` - HTML של הכפתור

**Example:**
```javascript
const editBtn = createEditButton(() => editItem(id), 'btn-sm');
// Returns: <button class="btn btn-primary edit-button btn-sm" onclick="...">✏️ ערוך</button>
```

### `createDeleteButton(onClick, additionalClasses)`
יצירת כפתור מחיקה

**Parameters:**
- `onClick` (function) - פונקציית לחיצה
- `additionalClasses` (string, optional) - מחלקות CSS נוספות

**Returns:** `string` - HTML של הכפתור

**Example:**
```javascript
const deleteBtn = createDeleteButton(() => deleteItem(id), 'btn-sm');
// Returns: <button class="btn btn-danger delete-button btn-sm" onclick="...">🗑️ מחק</button>
```

### `createCancelButton(onClick, additionalClasses)`
יצירת כפתור ביטול

**Parameters:**
- `onClick` (function) - פונקציית לחיצה
- `additionalClasses` (string, optional) - מחלקות CSS נוספות

**Returns:** `string` - HTML של הכפתור

**Example:**
```javascript
const cancelBtn = createCancelButton(() => cancelAction(), 'btn-sm');
// Returns: <button class="btn btn-secondary cancel-button btn-sm" onclick="...">❌ ביטול</button>
```

### `createLinkButton(onClick, additionalClasses)`
יצירת כפתור קישור

**Parameters:**
- `onClick` (function) - פונקציית לחיצה
- `additionalClasses` (string, optional) - מחלקות CSS נוספות

**Returns:** `string` - HTML של הכפתור

**Example:**
```javascript
const linkBtn = createLinkButton(() => linkItems(id), 'btn-sm');
// Returns: <button class="btn btn-info link-button btn-sm" onclick="...">🔗 קישור</button>
```

### `createAddButton(onClick, additionalClasses)`
יצירת כפתור הוספה

**Parameters:**
- `onClick` (function) - פונקציית לחיצה
- `additionalClasses` (string, optional) - מחלקות CSS נוספות

**Returns:** `string` - HTML של הכפתור

**Example:**
```javascript
const addBtn = createAddButton(() => addNewItem(), 'btn-sm');
// Returns: <button class="btn btn-success add-button btn-sm" onclick="...">➕ הוסף</button>
```

### `createSaveButton(onClick, additionalClasses)`
יצירת כפתור שמירה

**Parameters:**
- `onClick` (function) - פונקציית לחיצה
- `additionalClasses` (string, optional) - מחלקות CSS נוספות

**Returns:** `string` - HTML של הכפתור

**Example:**
```javascript
const saveBtn = createSaveButton(() => saveItem(), 'btn-sm');
// Returns: <button class="btn btn-primary save-button btn-sm" onclick="...">💾 שמור</button>
```

## Advanced Button System

### `AdvancedButtonSystem` Class
מערכת כפתורים מתקדמת עם caching ו-performance monitoring

**Constructor:**
```javascript
const buttonSystem = new AdvancedButtonSystem(config);
```

**Configuration:**
```javascript
const config = {
    logging: {
        enabled: true,
        level: 'info',
        prefix: '🔘 Button System'
    },
    performance: {
        batchSize: 50,
        debounceDelay: 100,
        cacheEnabled: true
    },
    fallback: {
        enabled: true,
        showErrors: true,
        defaultButtonClass: 'btn'
    }
};
```

### `generateActionButtons(actions, rowData)`
יצירת כפתורי פעולה לטבלה

**Parameters:**
- `actions` (array) - רשימת פעולות
- `rowData` (object) - נתוני השורה

**Returns:** `string` - HTML של כפתורי הפעולה

**Example:**
```javascript
const actions = [
    { type: 'edit', onClick: (id) => editItem(id) },
    { type: 'delete', onClick: (id) => deleteItem(id) }
];
const buttons = generateActionButtons(actions, { id: 123 });
```

### `loadTableActionButtons(tableId, actions)`
טעינת כפתורי פעולה לטבלה

**Parameters:**
- `tableId` (string) - מזהה הטבלה
- `actions` (array) - רשימת פעולות

**Returns:** `void`

**Example:**
```javascript
loadTableActionButtons('trades-table', [
    { type: 'edit', onClick: editTrade },
    { type: 'delete', onClick: deleteTrade }
]);
```

## Button Icons System

### `BUTTON_ICONS` Object
איקונים מרכזיים לכל סוגי הכפתורים

```javascript
const BUTTON_ICONS = {
    EDIT: '✏️',
    DELETE: '🗑️',
    CANCEL: '❌',
    LINK: '🔗',
    ADD: '➕',
    SAVE: '💾',
    VIEW: '👁️',
    COPY: '📋',
    REFRESH: '🔄',
    SEARCH: '🔍',
    FILTER: '🔽',
    SORT: '↕️',
    EXPORT: '📤',
    IMPORT: '📥',
    SETTINGS: '⚙️',
    HELP: '❓',
    INFO: 'ℹ️',
    WARNING: '⚠️',
    SUCCESS: '✅',
    ERROR: '❌'
};
```

### `BUTTON_TEXTS` Object
טקסטים לנגישות לכל סוגי הכפתורים

```javascript
const BUTTON_TEXTS = {
    EDIT: 'ערוך',
    DELETE: 'מחק',
    CANCEL: 'ביטול',
    LINK: 'קישור',
    ADD: 'הוסף',
    SAVE: 'שמור',
    VIEW: 'צפה',
    COPY: 'העתק',
    REFRESH: 'רענן',
    SEARCH: 'חפש',
    FILTER: 'סנן',
    SORT: 'מיין',
    EXPORT: 'ייצא',
    IMPORT: 'ייבא',
    SETTINGS: 'הגדרות',
    HELP: 'עזרה',
    INFO: 'מידע',
    WARNING: 'אזהרה',
    SUCCESS: 'הצלחה',
    ERROR: 'שגיאה'
};
```

## Button Variants

### Standard Variants
```javascript
// Primary buttons
createEditButton(onClick); // Blue
createSaveButton(onClick); // Blue

// Danger buttons  
createDeleteButton(onClick); // Red

// Secondary buttons
createCancelButton(onClick); // Gray

// Info buttons
createLinkButton(onClick); // Light blue

// Success buttons
createAddButton(onClick); // Green
```

### Size Variants
```javascript
// Small buttons
createEditButton(onClick, 'btn-sm');

// Large buttons
createEditButton(onClick, 'btn-lg');

// Extra small buttons
createEditButton(onClick, 'btn-xs');
```

## Action Menu System

### `ActionsMenuSystem` Class
מערכת תפריט פעולות מתקדמת

**Features:**
- CSS-based hover (no JavaScript delays)
- RTL aware positioning
- Supports 2-5 buttons dynamically
- Integrated with new button system

**Usage:**
```javascript
// Initialize actions menu
const actionsMenu = new ActionsMenuSystem();

// Add action buttons
actionsMenu.addAction('edit', () => editItem(id));
actionsMenu.addAction('delete', () => deleteItem(id));
```

## Performance Features

### Caching System
```javascript
// Enable/disable caching
buttonSystem.config.performance.cacheEnabled = true;

// Get cache statistics
const stats = buttonSystem.cache.getStats();
console.log('Cache hits:', stats.hits);
console.log('Cache misses:', stats.misses);
```

### Performance Monitoring
```javascript
// Get performance metrics
const metrics = buttonSystem.getPerformanceMetrics();
console.log('Processed buttons:', metrics.processedButtons);
console.log('Errors:', metrics.errors);
console.log('Duration:', metrics.duration);
```

## Usage Examples

### Basic Button Creation
```javascript
// Create individual buttons
const editBtn = createEditButton(() => editItem(id));
const deleteBtn = createDeleteButton(() => deleteItem(id));
const saveBtn = createSaveButton(() => saveItem());

// Add to container
document.getElementById('actions').innerHTML = editBtn + deleteBtn + saveBtn;
```

### Table Action Buttons
```javascript
// Define actions for table
const tableActions = [
    { type: 'edit', onClick: (id) => editTrade(id) },
    { type: 'delete', onClick: (id) => deleteTrade(id) },
    { type: 'view', onClick: (id) => viewTrade(id) }
];

// Load actions for specific table
loadTableActionButtons('trades-table', tableActions);
```

### Advanced Button System
```javascript
// Initialize advanced system
const buttonSystem = new AdvancedButtonSystem({
    logging: { enabled: true, level: 'debug' },
    performance: { cacheEnabled: true, batchSize: 100 }
});

// Generate action buttons
const actions = [
    { type: 'edit', onClick: editHandler },
    { type: 'delete', onClick: deleteHandler }
];
const buttons = buttonSystem.generateActionButtons(actions, rowData);
```

## Best Practices

1. **Use appropriate button types:**
   ```javascript
   // Good - specific button types
   createEditButton(onClick);
   createDeleteButton(onClick);
   
   // Avoid - generic buttons
   // Bad: createButton('edit', onClick);
   ```

2. **Handle errors gracefully:**
   ```javascript
   const editBtn = createEditButton(() => {
       try {
           editItem(id);
       } catch (error) {
           showErrorNotification('שגיאה בעריכה: ' + error.message);
       }
   });
   ```

3. **Use consistent styling:**
   ```javascript
   // Consistent size across all buttons
   const editBtn = createEditButton(onClick, 'btn-sm');
   const deleteBtn = createDeleteButton(onClick, 'btn-sm');
   ```

4. **Optimize for performance:**
   ```javascript
   // Enable caching for large tables
   buttonSystem.config.performance.cacheEnabled = true;
   buttonSystem.config.performance.batchSize = 50;
   ```

## Dependencies
- Bootstrap 5.3.0 (for button styling)
- CSS Framework (for button variants)
- Notification System (for error handling)

## File Locations
- `trading-ui/scripts/button-icons.js` - Basic button system
- `trading-ui/scripts/button-system-init.js` - Advanced button system
- `trading-ui/scripts/actions-menu-system.js` - Actions menu system

## Version
2.0 (Last updated: January 2025)

## Usage Statistics
- 30+ button types supported
- Used across all 29 pages
- 138+ locations with button code
- 3 color variants per button type
