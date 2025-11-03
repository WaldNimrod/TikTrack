# Entity Type Filters System - Documentation
# ========================================

**File:** `trading-ui/scripts/related-object-filters.js`  
**Version:** 3.2  
**Last Updated:** 2025-11-04  
**Author:** TikTrack Development Team

## Overview

מערכת מרכזית ליצירת כפתורי פילטר לפי סוגי ישויות. המערכת תומכת בשני מקרים שימוש:

1. **עמוד התראות** - פילטר סטטי ב-HTML עם `onclick` ישיר
2. **מודול הפרטים** - פילטר דינמי שנוצר ב-`entity-details-renderer.js` עם `data-onclick` ו-tooltips

## Purpose

המערכת מספקת פונקציות מרכזיות ליצירת כפתורי פילטר אחידים לפי סוגי ישויות (account, trade, trade_plan, ticker, etc.) בכל מקום במערכת.

## Key Features

- ✅ יצירת כפתורי פילטר אחידים לפי סוגי ישויות
- ✅ תמיכה בשני מקרי שימוש (עמוד התראות ומודול פרטים)
- ✅ שימוש ב-LinkedItemsService לאיקונים ותוויות
- ✅ תמיכה ב-tooltips דרך מערכת הכפתורים המרכזית
- ✅ תמיכה ב-legacy (related_type_id) ובמודרני (item.type)

## Architecture

### File Structure

```
trading-ui/scripts/related-object-filters.js
├── Legacy Functions (for backward compatibility)
│   ├── filterByRelatedObjectType()
│   ├── filterAlertsByRelatedObjectType()
│   ├── filterNotesByRelatedObjectType()
│   └── createRelatedObjectFilter()
│
└── New Centralized Functions (v3.0)
    ├── generateEntityTypeFilterButtons()
    ├── generateEntityTypeFilterButton()
    └── generateAllFilterButton()
```

## Functions Reference

### Core Filter Functions (Legacy)

#### `filterByRelatedObjectType(type, data, updateFunction, countSelector, itemName)`

פילטר בסיסי לפי סוג אובייקט מקושר.

**Parameters:**
- `type` (string): סוג אובייקט - 'all', 'account', 'trade', 'trade_plan', 'ticker'
- `data` (Array): מערך נתונים לפילטור
- `updateFunction` (Function): פונקציה לעדכון הטבלה
- `countSelector` (string): selector לאלמנט ספירה
- `itemName` (string): שם הפריט (לצורך ספירה)

**Returns:** `Array` - מערך נתונים מסונן

**Usage:**
```javascript
const filtered = filterByRelatedObjectType(
  'account',
  alertsData,
  updateAlertsTable,
  '.table-count',
  'התראות'
);
```

#### `filterAlertsByRelatedObjectType(type)`

Wrapper ספציפי להתראות.

**Parameters:**
- `type` (string): סוג אובייקט לפילטור

**Usage:**
```javascript
filterAlertsByRelatedObjectType('account');
```

### Button Generation Functions (v3.0)

#### `generateEntityTypeFilterButtons(entityTypes, options)`

יוצרת HTML של כל כפתורי הפילטר לפי סוגי ישויות.

**Parameters:**
- `entityTypes` (Array<string>): מערך סוגי ישויות (e.g., ['account', 'trade', 'trade_plan', 'ticker'])
- `options` (Object): אפשרויות תצורה
  - `filterFunctionName` (string): שם הפונקציה לקריאה (default: 'filterAlertsByRelatedObjectType')
  - `tableId` (string): ID טבלה עבור linked items (optional)
  - `containerId` (string): ID container ליצירת button IDs (optional)
  - `useDataOnclick` (boolean): שימוש ב-data-onclick במקום onclick (default: false)
  - `useTooltips` (boolean): הוספת data-tooltip attributes (default: false)
  - `iconSize` (number): גודל איקון בפיקסלים (default: 14)

**Returns:** `string` - HTML string של כל הכפתורים

**Usage Examples:**

**עמוד התראות:**
```javascript
const buttonsHtml = window.generateEntityTypeFilterButtons(
  ['account', 'trade', 'trade_plan', 'ticker'],
  {
    filterFunctionName: 'filterAlertsByRelatedObjectType',
    useDataOnclick: false,
    useTooltips: false,
    iconSize: 14
  }
);
```

**מודול הפרטים:**
```javascript
const buttonsHtml = window.generateEntityTypeFilterButtons(
  ['account', 'trade', 'trade_plan', 'ticker', 'execution', 'cash_flow', 'note'],
  {
    filterFunctionName: 'window.filterLinkedItemsByType',
    tableId: 'linkedItemsTable_alert_2',
    containerId: 'linkedItemsFilter_linkedItemsTable_alert_2',
    useDataOnclick: true,
    useTooltips: true,
    iconSize: 20
  }
);
```

#### `generateEntityTypeFilterButton(entityType, options)`

יוצרת HTML של כפתור פילטר בודד.

**Parameters:**
- `entityType` (string): סוג ישות (e.g., 'account', 'trade')
- `options` (Object): אפשרויות תצורה (זהה ל-`generateEntityTypeFilterButtons`)

**Returns:** `string` - HTML string של הכפתור

**Usage:**
```javascript
const buttonHtml = window.generateEntityTypeFilterButton('account', {
  filterFunctionName: 'filterAlertsByRelatedObjectType',
  iconSize: 14
});
```

#### `generateAllFilterButton(options)`

יוצרת HTML של כפתור "הכל".

**Parameters:**
- `options` (Object): אפשרויות תצורה
  - `filterFunctionName` (string): שם הפונקציה לקריאה (default: 'filterAlertsByRelatedObjectType')
  - `tableId` (string): ID טבלה עבור linked items (optional)
  - `useOnclick` (boolean): שימוש ב-onclick במקום data-onclick (default: true)

**Returns:** `string` - HTML string של כפתור "הכל"

**Usage:**

**עמוד התראות:**
```javascript
const allButtonHtml = window.generateAllFilterButton({
  filterFunctionName: 'filterAlertsByRelatedObjectType',
  useOnclick: true
});
```

**מודול הפרטים:**
```javascript
const allButtonHtml = window.generateAllFilterButton({
  filterFunctionName: 'window.filterLinkedItemsByType',
  tableId: 'linkedItemsTable_alert_2',
  useOnclick: false
});
```

## Usage Patterns

### Pattern 1: Alerts Page (Static HTML)

```html
<div class="filter-buttons-container button-row">
  <button class="btn btn-sm active" onclick="filterAlertsByRelatedObjectType('all')" data-type="all">
    הכל
  </button>
  <!-- Buttons generated dynamically or statically -->
</div>
```

### Pattern 2: Entity Details Modal (Dynamic Generation)

```javascript
// In entity-details-renderer.js
const filterButtonsHtml = window.generateEntityTypeFilterButtons(
  ['account', 'trade', 'trade_plan', 'ticker'],
  {
    filterFunctionName: 'window.filterLinkedItemsByType',
    tableId: tableId,
    containerId: `linkedItemsFilter_${tableId}`,
    useDataOnclick: true,
    useTooltips: true,
    iconSize: 20
  }
);
```

## Integration Points

### 1. Alerts Page (`alerts-smart.html`)

**Current State:** HTML סטטי עם כפתורים מוגדרים מראש

**Future:** אפשר להחליף ליצירה דינמית:
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.filter-buttons-container');
  const allButton = window.generateAllFilterButton({
    filterFunctionName: 'filterAlertsByRelatedObjectType',
    useOnclick: true
  });
  const buttons = window.generateEntityTypeFilterButtons(
    ['account', 'trade', 'trade_plan', 'ticker'],
    { filterFunctionName: 'filterAlertsByRelatedObjectType', iconSize: 14 }
  );
  container.innerHTML = allButton + buttons;
});
```

### 2. Entity Details Modal (`entity-details-renderer.js`)

**Current State:** משתמש ב-`_generateFilterButton()` מקומי

**Future:** אפשר להחליף ל:
```javascript
const filterButtonsHtml = window.generateEntityTypeFilterButtons(
  filterButtonsToShow,
  {
    filterFunctionName: 'window.filterLinkedItemsByType',
    tableId: tableId,
    containerId: `linkedItemsFilter_${tableId}`,
    useDataOnclick: true,
    useTooltips: true,
    iconSize: 20
  }
);
```

## Dependencies

- **LinkedItemsService** (`trading-ui/scripts/services/linked-items-service.js`)
  - `getLinkedItemIcon(entityType)` - קבלת נתיב איקון
  - `getEntityLabel(entityType)` - קבלת תווית בעברית

- **Button System** (`trading-ui/scripts/button-system-init.js`)
  - תמיכה ב-`data-tooltip` attributes
  - תמיכה ב-`data-onclick` attributes

- **Color System** (`trading-ui/scripts/color-scheme-system.js`)
  - `getTableColors()` - קבלת צבעים לטבלאות

## Entity Type Mappings

### Related Type ID Mapping (Legacy)
```javascript
{
  'all': null,
  'account': 1,
  'trade': 2,
  'trade_plan': 3,
  'ticker': 4
}
```

### Entity Type String Mapping (Modern)
```javascript
{
  'account': ['account', 'trading_account'],
  'trade': ['trade'],
  'trade_plan': ['trade_plan'],
  'ticker': ['ticker'],
  'alert': ['alert'],
  'execution': ['execution'],
  'cash_flow': ['cash_flow'],
  'note': ['note']
}
```

## Examples

### Example 1: Alerts Page Filter

```html
<div class="filter-buttons-container button-row">
  <button class="btn btn-sm active" onclick="filterAlertsByRelatedObjectType('all')" data-type="all" title="הצג הכל">
    הכל
  </button>
  <button class="btn btn-sm btn-outline-primary" onclick="filterAlertsByRelatedObjectType('account')" data-type="account" title="חשבונות">
    <img src="images/icons/trading_accounts.svg" alt="חשבונות מסחר" style="width: 14px; height: 14px;">
  </button>
  <!-- More buttons... -->
</div>
```

### Example 2: Entity Details Modal Filter

```html
<div class="filter-buttons-container button-row" id="linkedItemsFilter_linkedItemsTable_alert_2">
  <button class="btn btn-sm active" onclick="window.filterLinkedItemsByType('linkedItemsTable_alert_2', 'all')" data-type="all" title="הצג הכל">
    הכל
  </button>
  <button class="btn btn-sm btn-outline-primary filter-icon-btn" 
          id="filterBtn_linkedItemsTable_alert_2_account"
          data-type="account"
          data-onclick="window.filterLinkedItemsByType('linkedItemsTable_alert_2', 'account')"
          data-tooltip="סינון לפי חשבון"
          data-tooltip-placement="top"
          data-tooltip-trigger="hover">
    <img src="/trading-ui/images/icons/trading_accounts.svg" alt="חשבון" class="filter-icon" style="width: 20px; height: 20px;">
  </button>
  <!-- More buttons... -->
</div>
```

## Migration Guide

### From Static HTML to Dynamic Generation

**Before:**
```html
<button class="btn btn-sm btn-outline-primary" onclick="filterAlertsByRelatedObjectType('account')" data-type="account">
  <img src="images/icons/trading_accounts.svg" alt="חשבונות" style="width: 14px; height: 14px;">
</button>
```

**After:**
```javascript
const buttonHtml = window.generateEntityTypeFilterButton('account', {
  filterFunctionName: 'filterAlertsByRelatedObjectType',
  iconSize: 14
});
```

### From Local Function to Centralized Function

**Before (entity-details-renderer.js):**
```javascript
_generateFilterButton(entityType, tableId) {
  // Local implementation
}
```

**After:**
```javascript
const buttonHtml = window.generateEntityTypeFilterButton(entityType, {
  filterFunctionName: 'window.filterLinkedItemsByType',
  tableId: tableId,
  containerId: `linkedItemsFilter_${tableId}`,
  useDataOnclick: true,
  useTooltips: true,
  iconSize: 20
});
```

## Testing

### Test Cases

1. **Alerts Page Filter**
   - Verify buttons are created correctly
   - Verify onclick handlers work
   - Verify active state updates

2. **Entity Details Modal Filter**
   - Verify buttons are created with correct IDs
   - Verify data-onclick handlers work
   - Verify tooltips initialize
   - Verify filter function works with tableId

3. **Icon Sizes**
   - Verify 14px icons for alerts page
   - Verify 20px icons for entity details modal

4. **Tooltip Support**
   - Verify tooltips appear on hover (entity details modal)
   - Verify no tooltips on alerts page

## Future Enhancements

- [ ] Add support for custom icon sizes per entity type
- [ ] Add support for custom colors per entity type
- [ ] Add keyboard navigation support
- [ ] Add accessibility attributes (ARIA labels)
- [ ] Add unit tests for button generation functions

## Debugging Tools

### `debug-filter-tooltips-comprehensive.js`

סקריפט דיבאג מקיף לניטור ואתחול טולטיפים של כפתורי הפילטר.

**מיקום:** `trading-ui/scripts/debug-filter-tooltips-comprehensive.js`

**שימוש:**
```javascript
// קבלת דוח מקיף
debugFilterTooltips.getReport()

// ניטור כפתורים
debugFilterTooltips.monitorButtons()

// אתחול ידני של טולטיפים
debugFilterTooltips.manualInit()

// בדיקת HTML מקור
debugFilterTooltips.checkSource()

// היסטוריית לוגים
debugFilterTooltips.getHistory()
```

**תכונות:**
- ניטור אוטומטי של טעינת הדף
- ניטור אתחול מערכת הכפתורים
- ניטור שינויים ב-DOM (MutationObserver)
- דוח מקיף על מצב הטולטיפים
- אתחול ידני של טולטיפים

**הגדרה:**
הסקריפט מוגדר ב-`package-manifest.js` תחת `dev-tools` package עם `loadOrder: 4` ו-`required: false`.

האובייקט `window.debugFilterTooltips` מוגדר מיד בתחילת הקובץ כדי למנוע שגיאות `ReferenceError`.

## Related Files

- `trading-ui/scripts/related-object-filters.js` - Main implementation
- `trading-ui/scripts/entity-details-renderer.js` - Usage in entity details modal
- `trading-ui/scripts/entity-details-modal.js` - Modal management and tooltip initialization
- `trading-ui/alerts.html` - Usage in alerts page (static HTML with data-tooltip attributes)
- `trading-ui/scripts/services/linked-items-service.js` - Icon and label service
- `trading-ui/scripts/debug-filter-tooltips-comprehensive.js` - Debug script for tooltip monitoring

## Changelog

### Version 3.2 (2025-11-04)
- ✅ Fixed alert editing modal - corrected field mapping for condition_attribute, condition_operator, condition_number, and status
- ✅ Updated alerts-config.js options to match backend API values (price, change, ma, volume for alertType; more_than, less_than, etc. for alertCondition; open, closed, cancelled for alertStatus)
- ✅ Fixed potential async issue in resetForm when calling applyDefaultValues
- ✅ Updated version numbers in alerts.html to prevent cache issues
- ✅ Fixed syntax error in linked-items-service.js by commenting out debug logs
- ✅ Added early return in event-handler-manager.js for elements with onclick attributes
- ✅ Fixed duplicate script loading in notes.html, alerts.html, and trades.html

### Version 3.1 (2025-11-03)
- ✅ Added data-tooltip attributes to alerts page filter buttons
- ✅ Enhanced tooltip initialization in entity-details-modal.js with retry mechanism
- ✅ Added comprehensive debug script (debug-filter-tooltips-comprehensive.js)
- ✅ Improved tooltip initialization timing and error handling
- ✅ Added fallback manual Bootstrap tooltip initialization

### Version 3.0 (2025-01-27)
- ✅ Added centralized button generation functions
- ✅ Added support for both onclick and data-onclick patterns
- ✅ Added tooltip support for entity details modal
- ✅ Added configurable icon sizes
- ✅ Added support for button IDs

### Version 2.0 (Previous)
- Legacy filter functions for related_type_id filtering
- Basic wrapper functions for alerts and notes

## Support

For questions or issues, refer to:
- Main documentation: `documentation/INDEX.md`
- Frontend architecture: `documentation/02-ARCHITECTURE/FRONTEND/`

