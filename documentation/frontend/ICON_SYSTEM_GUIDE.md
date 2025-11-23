# מדריך מערכת האיקונים - TikTrack
# Icon System Guide

## 📋 סקירה כללית

מערכת האיקונים של TikTrack מספקת ניהול מרכזי של כל האיקונים במערכת, עם תמיכה ב-Tabler Icons ואיקוני ישויות מקוריים.

### תכונות עיקריות

- **17 איקוני ישויות מקוריים** - נשארים כ-brute default
- **Tabler Icons** - מעל 5800 איקונים חינמיים (MIT license)
- **אינטגרציה מלאה** עם מערכות הטעינה, האתחול והמטמון
- **Fallback mechanism** - תמיד יש איקון להצגה
- **Cache integration** - שיפור ביצועים

## 🚀 התחלה מהירה

### שימוש בסיסי

```javascript
// קבלת נתיב לאיקון
const iconPath = await window.IconSystem.getIconPath('button', 'edit');

// רינדור איקון כ-HTML
const iconHTML = await window.IconSystem.renderIcon('button', 'edit', {
    size: '16',
    alt: 'ערוך',
    class: 'icon'
});

// שימוש ב-wrappers
const entityIcon = await window.IconSystem.getEntityIcon('trade');
const buttonIcon = await window.IconSystem.getButtonIcon('delete');
const categoryIcon = await window.IconSystem.getCategoryIcon('system');
const pageIcon = await window.IconSystem.getPageIcon('trades.html');
```

## 📚 סוגי איקונים

### 1. Entity Icons (איקוני ישויות)

17 איקוני הישויות המקוריים נמצאים ב-`trading-ui/images/icons/entities/`:

```javascript
// תמיד בודק ב-entities/ קודם, רק אם לא נמצא - Tabler
const iconPath = await window.IconSystem.getEntityIcon('trade');
// Returns: '/trading-ui/images/icons/entities/trades.svg'

// Entity types: ticker, trade, trade_plan, execution, account, alert,
// cash_flow, note, preference, research, development, home, etc.
```

### 2. Button Icons (איקוני כפתורים)

איקונים לכפתורים במערכת:

```javascript
const iconPath = await window.IconSystem.getButtonIcon('edit');
// Returns: '/trading-ui/images/icons/tabler/pencil.svg'

// Available button types:
// edit, delete, cancel, link, add, save, close, refresh, export, import,
// warning, search, filter, view, duplicate, archive, restore, etc.
```

### 3. Category Icons (איקוני קטגוריות)

איקונים לקטגוריות של התראות:

```javascript
const iconPath = await window.IconSystem.getCategoryIcon('development');
// Returns: '/trading-ui/images/icons/tabler/tools.svg'

// Available categories:
// development, system, business, performance, ui, security, network,
// database, api, cache, general
```

### 4. Page Icons (איקוני עמודים)

איקונים לעמודי המערכת:

```javascript
const iconPath = await window.IconSystem.getPageIcon('trades.html');
// Returns: '/trading-ui/images/icons/tabler/chart-line.svg'
```

### 5. Chart Icons (איקוני גרפים)

איקונים למערכת הגרפים:

```javascript
const iconPath = await window.IconSystem.getChartIcon('type-line');
// Returns: '/trading-ui/images/icons/tabler/chart-line.svg'
```

## 🔧 API Reference

### IconSystem Class

#### `getIconPath(type, name, options)`

מחזיר נתיב לאיקון.

**Parameters:**
- `type` (string): סוג האיקון (entity, button, category, chart, page)
- `name` (string): שם האיקון
- `options` (object): אפשרויות (skipCache, etc.)

**Returns:** `Promise<string>` - נתיב לאיקון

**Example:**
```javascript
const path = await window.IconSystem.getIconPath('button', 'edit');
```

#### `renderIcon(type, name, options)`

מחזיר HTML של איקון.

**Parameters:**
- `type` (string): סוג האיקון
- `name` (string): שם האיקון
- `options` (object): אפשרויות
  - `size` (string): גודל האיקון (default: '16')
  - `alt` (string): טקסט חלופי
  - `class` (string): CSS classes
  - `style` (string): CSS styles inline

**Returns:** `Promise<string>` - HTML string

**Example:**
```javascript
const html = await window.IconSystem.renderIcon('button', 'edit', {
    size: '24',
    alt: 'ערוך',
    class: 'icon icon--large'
});
```

#### `getEntityIcon(entityType)`

Wrapper ל-entity icons. תמיד בודק ב-entities/ קודם.

**Parameters:**
- `entityType` (string): סוג הישות

**Returns:** `Promise<string>` - נתיב לאיקון

#### `getButtonIcon(buttonType)`

Wrapper ל-button icons. משתמש ב-Tabler Icons.

**Parameters:**
- `buttonType` (string): סוג הכפתור

**Returns:** `Promise<string>` - נתיב לאיקון

#### `getCategoryIcon(category)`

Wrapper ל-category icons. משתמש ב-Tabler Icons.

**Parameters:**
- `category` (string): שם הקטגוריה

**Returns:** `Promise<string>` - נתיב לאיקון

#### `getPageIcon(pageName)`

Wrapper ל-page icons. משתמש ב-Tabler Icons.

**Parameters:**
- `pageName` (string): שם העמוד (למשל 'trades.html')

**Returns:** `Promise<string>` - נתיב לאיקון

#### `getChartIcon(chartIcon)`

Wrapper ל-chart icons. משתמש ב-Tabler Icons.

**Parameters:**
- `chartIcon` (string): שם איקון הגרף

**Returns:** `Promise<string>` - נתיב לאיקון

## 🎨 CSS Classes

מערכת האיקונים כוללת CSS classes מוגדרים מראש:

```html
<!-- גודל בסיסי -->
<img src="..." class="icon">

<!-- גדלים -->
<img src="..." class="icon icon--small">
<img src="..." class="icon icon--large">
<img src="..." class="icon icon--xlarge">

<!-- מצבים -->
<img src="..." class="icon icon--active">
<img src="..." class="icon icon--disabled">
<img src="..." class="icon icon--error">
<img src="..." class="icon icon--success">
<img src="..." class="icon icon--warning">
```

### CSS Variables

```css
--icon-size-base: 16px;
--icon-size-small: 12px;
--icon-size-large: 24px;
--icon-size-xlarge: 32px;

--icon-color-base: currentColor;
--icon-color-active: var(--primary-color);
--icon-color-disabled: #6c757d;
```

## 🔄 אינטגרציה עם מערכות אחרות

### Entity Details Modal

```javascript
// entity-details-modal.js
async getEntityIcon(entityType) {
    if (typeof window.IconSystem !== 'undefined') {
        return await window.IconSystem.getEntityIcon(entityType);
    }
    // Fallback...
}
```

### Button System

```javascript
// button-icons.js
const BUTTON_ICONS = {
    EDIT: '/trading-ui/images/icons/tabler/pencil.svg',
    DELETE: '/trading-ui/images/icons/tabler/trash.svg',
    // ...
};
```

### Category Detector

```javascript
// notification-category-detector.js
async function getCategoryIcon(category, options = {}) {
    if (typeof window.IconSystem !== 'undefined') {
        const iconPath = await window.IconSystem.getCategoryIcon(category);
        // ...
    }
    // Fallback...
}
```

## 💾 Cache Integration

מערכת האיקונים משתמשת ב-UnifiedCacheManager לשמירת נתיבי איקונים:

```javascript
// Cache key format: `icon-path:${type}:${name}`
// TTL: 5 minutes
// Layer: Memory Cache

// Invalidate cache after icon updates
await window.IconSystem.invalidateCache('button', 'edit');

// Clear all icon cache
await window.IconSystem.clearCache();
```

## 📝 דוגמאות שימוש

### דוגמה 1: הוספת איקון לכפתור

```javascript
const button = document.createElement('button');
const iconHTML = await window.IconSystem.renderIcon('button', 'edit', {
    size: '16',
    class: 'icon me-2'
});
button.innerHTML = iconHTML + 'ערוך';
```

### דוגמה 2: עדכון איקון entity במודל

```javascript
const iconPath = await window.IconSystem.getEntityIcon('trade');
const iconElement = document.querySelector('.entity-icon img');
iconElement.src = iconPath;
```

### דוגמה 3: הצגת איקון קטגוריה

```javascript
const category = 'development';
const iconHTML = await window.IconSystem.renderIcon('category', category, {
    size: '20',
    class: 'icon me-1'
});
badge.innerHTML = iconHTML + 'פיתוח';
```

## 🔍 פתרון בעיות

### איקון לא מוצג

1. **בדוק שהמערכת נטענה:**
   ```javascript
   if (typeof window.IconSystem === 'undefined') {
       console.error('IconSystem not loaded');
   }
   ```

2. **בדוק את הקובץ קיים:**
   - Entity icons: `trading-ui/images/icons/entities/${entityType}.svg`
   - Tabler icons: `trading-ui/images/icons/tabler/${iconName}.svg`

3. **נקה cache:**
   ```javascript
   await window.IconSystem.clearCache();
   ```

### Fallback לא עובד

- בדוק ש-fallback path קיים: `/trading-ui/images/icons/entities/home.svg`
- ודא ש-IconMappings נטען: `typeof window.IconMappings !== 'undefined'`

### Cache לא מתעדכן

- נקה cache ידנית:
  ```javascript
  await window.IconSystem.invalidateCache('button', 'edit');
  ```

## 📚 מיפוי איקונים

כל המיפויים נמצאים ב-`trading-ui/scripts/icon-mappings.js`:

- **Entities**: `IconMappings.entities`
- **Buttons**: `IconMappings.buttons`
- **Categories**: `IconMappings.categories`
- **Charts**: `IconMappings.charts`
- **Pages**: `IconMappings.pages`

## 🔗 קישורים נוספים

- [Icon System Architecture](ICON_SYSTEM_ARCHITECTURE.md) - ארכיטקטורה מפורטת
- [Tabler Icons Integration Plan](TABLER_ICONS_INTEGRATION_PLAN.md) - תוכנית האינטגרציה
- [JavaScript Architecture](JAVASCRIPT_ARCHITECTURE.md) - ארכיטקטורת JavaScript
- [General Systems List](GENERAL_SYSTEMS_LIST.md) - רשימת מערכות כלליות

