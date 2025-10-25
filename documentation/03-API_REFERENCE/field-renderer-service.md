# Field Renderer Service - API Reference

## Overview
מערכת מרכזית לרנדור שדות מורכבים: badges, currency, dates. מחליפה קוד חוזר ב-138 מקומות במערכת.

## Core Rendering Functions

### `renderStatus(status, entityType)`
רנדור status badge עם צבעים דינמיים ותרגום

**Parameters:**
- `status` (string) - סטטוס: `open`, `closed`, `cancelled`, `triggered`, `not_triggered`
- `entityType` (string, optional) - סוג ישות: `account`, `trade`, `alert`, `note`, etc.

**Returns:** `string` - HTML של ה-badge

**Supported Statuses:**
- `open`, `closed`, `cancelled` - צבעים מהעדפות משתמש
- `triggered` - צבע אזהרה (warning)
- `not_triggered` - צבע מידע (info)

**Example:**
```javascript
// Basic status
const html = FieldRendererService.renderStatus('open', 'account');

// Alert status
const html = FieldRendererService.renderStatus('triggered', 'alert');
```

### `renderSide(side)`
רנדור side badge (Long/Short)

**Parameters:**
- `side` (string) - צד: `Long`, `Short`

**Returns:** `string` - HTML של ה-badge

**Example:**
```javascript
const html = FieldRendererService.renderSide('Long');
// Returns: <span class="side-badge side-long">Long</span>
```

### `renderNumeric(value, type)`
רנדור numeric badge עם צבעים לפי ערך

**Parameters:**
- `value` (number) - הערך המספרי
- `type` (string, optional) - סוג: `currency`, `percentage`, `number`

**Returns:** `string` - HTML של ה-badge

**Color Logic:**
- Positive values: green
- Negative values: red  
- Zero/neutral: gray

**Example:**
```javascript
const html = FieldRendererService.renderNumeric(150.50, 'currency');
// Returns: <span class="numeric-badge positive">$150.50</span>
```

### `renderCurrency(currencyId)`
רנדור currency display (1 → US Dollar)

**Parameters:**
- `currencyId` (number|string) - מזהה מטבע

**Returns:** `string` - HTML של המטבע

**Example:**
```javascript
const html = FieldRendererService.renderCurrency(1);
// Returns: <span class="currency-display">US Dollar</span>
```

### `renderType(type)`
רנדור type badge (swing, investment, passive)

**Parameters:**
- `type` (string) - סוג: `swing`, `investment`, `passive`

**Returns:** `string` - HTML של ה-badge

**Example:**
```javascript
const html = FieldRendererService.renderType('swing');
// Returns: <span class="type-badge type-swing">Swing</span>
```

### `renderAction(action)`
רנדור action badge (buy, sale)

**Parameters:**
- `action` (string) - פעולה: `buy`, `sale`

**Returns:** `string` - HTML של ה-badge

**Example:**
```javascript
const html = FieldRendererService.renderAction('buy');
// Returns: <span class="action-badge action-buy">Buy</span>
```

### `renderPriority(priority)`
רנדור priority badge (high, medium, low)

**Parameters:**
- `priority` (string) - עדיפות: `high`, `medium`, `low`

**Returns:** `string` - HTML של ה-badge

**Example:**
```javascript
const html = FieldRendererService.renderPriority('high');
// Returns: <span class="priority-badge priority-high">High</span>
```

### `renderShares(quantity)`
רנדור shares/quantity עם # prefix

**Parameters:**
- `quantity` (number|string) - כמות

**Returns:** `string` - HTML של הכמות

**Example:**
```javascript
const html = FieldRendererService.renderShares(100);
// Returns: <span class="shares-display">#100</span>
```

### `renderBoolean(value)`
רנדור boolean עם איקונים ✓/✗

**Parameters:**
- `value` (boolean) - ערך boolean

**Returns:** `string` - HTML של ה-boolean

**Example:**
```javascript
const html = FieldRendererService.renderBoolean(true);
// Returns: <span class="boolean-display positive">✓ כן</span>
```

### `renderTickerInfo(tickerData)`
רנדור פרטי טיקר (מחיר, שינוי, נפח) בשורה אחת

**Parameters:**
- `tickerData` (object) - נתוני טיקר
  - `price` (number) - מחיר
  - `change` (number) - שינוי
  - `volume` (number) - נפח

**Returns:** `string` - HTML של פרטי הטיקר

**Example:**
```javascript
const tickerData = {
  price: 150.50,
  change: 2.30,
  volume: 1000000
};
const html = FieldRendererService.renderTickerInfo(tickerData);
```

## Date Rendering Functions

### `renderDate(date, format)`
רנדור תאריך עם פורמט מותאם

**Parameters:**
- `date` (string|Date) - תאריך
- `format` (string, optional) - פורמט תאריך

**Returns:** `string` - HTML של התאריך

**Example:**
```javascript
const html = FieldRendererService.renderDate('2025-01-24');
const html2 = FieldRendererService.renderDate('2025-01-24', 'short');
```

### `renderDateTime(dateTime)`
רנדור תאריך ושעה

**Parameters:**
- `dateTime` (string|Date) - תאריך ושעה

**Returns:** `string` - HTML של התאריך והשעה

**Example:**
```javascript
const html = FieldRendererService.renderDateTime('2025-01-24 14:30:00');
```

## Linked Entity Functions

### `renderLinkedEntity(entityData)`
רנדור linked entity badge

**Parameters:**
- `entityData` (object) - נתוני ישות מקושרת
  - `type` (string) - סוג ישות
  - `id` (number) - מזהה
  - `name` (string) - שם
  - `status` (string) - סטטוס

**Returns:** `string` - HTML של ה-linked entity

**Example:**
```javascript
const entityData = {
  type: 'trade',
  id: 123,
  name: 'AAPL Trade',
  status: 'open'
};
const html = FieldRendererService.renderLinkedEntity(entityData);
```

## Usage Examples

### Basic Badge Rendering
```javascript
// Status badges
const statusHtml = FieldRendererService.renderStatus('open', 'trade');
const sideHtml = FieldRendererService.renderSide('Long');
const numericHtml = FieldRendererService.renderNumeric(150.50, 'currency');
```

### Table Cell Rendering
```javascript
// In table cell
function renderTableCell(value, type) {
  switch(type) {
    case 'status':
      return FieldRendererService.renderStatus(value);
    case 'side':
      return FieldRendererService.renderSide(value);
    case 'currency':
      return FieldRendererService.renderCurrency(value);
    case 'shares':
      return FieldRendererService.renderShares(value);
    case 'boolean':
      return FieldRendererService.renderBoolean(value);
  }
}
```

### Dynamic Color Integration
```javascript
// The service automatically uses dynamic colors from user preferences
// No need to manually specify colors - they're applied based on:
// 1. User color preferences
// 2. Entity type
// 3. Value type (positive/negative/neutral)
```

## Color System Integration

The service automatically integrates with the dynamic color system:

1. **User Preferences** - Colors from user settings
2. **Entity Types** - Different colors per entity type
3. **Value Types** - Positive/negative/neutral colors
4. **Status Categories** - Appropriate colors for each status

## Best Practices

1. **Use appropriate functions:**
   ```javascript
   // Good
   FieldRendererService.renderStatus('open', 'trade');
   
   // Avoid manual HTML
   // Bad: '<span class="status-badge">Open</span>'
   ```

2. **Handle null/undefined values:**
   ```javascript
   const html = FieldRendererService.renderStatus(status || 'unknown');
   ```

3. **Use entity types for better colors:**
   ```javascript
   // Better colors with entity type
   FieldRendererService.renderStatus('open', 'trade');
   FieldRendererService.renderStatus('open', 'alert');
   ```

4. **Combine with other systems:**
   ```javascript
   // Combine with linked items
   const linkedHtml = FieldRendererService.renderLinkedEntity(entityData);
   const statusHtml = FieldRendererService.renderStatus(entityData.status);
   ```

## Dependencies
- Date Utils (for date formatting)
- Color Scheme System (for dynamic colors)
- Linked Items System (for entity rendering)

## File Location
`trading-ui/scripts/services/field-renderer-service.js`

## Version
1.4.0 (Last updated: January 2025)

## Usage Statistics
- Replaces code in 138+ locations
- Supports 20+ field types
- Integrates with 3 color variants
- Used across all 29 pages
