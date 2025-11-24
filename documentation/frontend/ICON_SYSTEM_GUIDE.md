# מדריך מערכת האיקונים - TikTrack
# Icon System Guide

## 📋 סקירה כללית

מערכת האיקונים של TikTrack מספקת ניהול מרכזי של כל האיקונים במערכת, עם תמיכה ב-Tabler Icons ואיקוני ישויות מקוריים.

### תכונות עיקריות

- **17 איקוני ישויות מקוריים** - נשארים כ-brute default (צבעים קבועים)
- **Tabler Icons** - מעל 5800 איקונים חינמיים (MIT license)
- **תמיכה בצבעים דינמיים** - Tabler Icons מוטמעים כ-inline SVG עם `currentColor` ✅ **חדש! נובמבר 2025**
- **יישור אוטומטי** - איקונים בכפתורים עם רק איקון ממורכזים אוטומטית ✅ **חדש! נובמבר 2025**
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

**חשוב:** עבור Tabler Icons, הפונקציה מחזירה **inline SVG** במקום `<img>` tag, מה שמאפשר תמיכה בצבעים דינמיים דרך CSS. Entity Icons נשארים כ-`<img>` tags (צבעים קבועים).

**Parameters:**
- `type` (string): סוג האיקון
- `name` (string): שם האיקון
- `options` (object): אפשרויות
  - `size` (string): גודל האיקון (default: '16')
  - `alt` (string): טקסט חלופי
  - `class` (string): CSS classes
  - `style` (string): CSS styles inline

**Returns:** `Promise<string>` - HTML string (inline SVG עבור Tabler Icons, `<img>` עבור Entity Icons)

**Example:**
```javascript
// Tabler Icon - מחזיר inline SVG עם תמיכה בצבעים דינמיים
const html = await window.IconSystem.renderIcon('button', 'edit', {
    size: '24',
    alt: 'ערוך',
    class: 'icon icon--large'
});
// Returns: '<svg ... stroke="currentColor">...</svg>'

// Entity Icon - מחזיר img tag (צבעים קבועים)
const entityHtml = await window.IconSystem.renderIcon('entity', 'trade', {
    size: '24',
    alt: 'טרייד'
});
// Returns: '<img src="/trading-ui/images/icons/entities/trades.svg" ...>'
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

## 🎨 תמיכה בצבעים דינמיים

### איך זה עובד

**Tabler Icons** מוטמעים כ-**inline SVG** עם `stroke="currentColor"`, מה שמאפשר לאיקונים לייצג את הצבע מהכפתור או מהאלמנט ההורה דרך CSS.

**Entity Icons** נשארים כ-`<img>` tags עם צבעים קבועים (לא ניתן לשנות צבע).

### דוגמאות שימוש

```javascript
// איקון בכפתור - יורש את הצבע מהכפתור
const button = document.createElement('button');
button.className = 'btn btn-primary'; // צבע כחול
const iconHTML = await window.IconSystem.renderIcon('button', 'edit');
button.innerHTML = iconHTML; // האיקון יהיה כחול (יורש מ-currentColor)

// איקון עם צבע מותאם אישית
const iconHTML = await window.IconSystem.renderIcon('button', 'delete', {
    size: '16',
    class: 'icon',
    style: 'color: red;' // צבע אדום מותאם
});
```

### CSS Styling

```css
/* איקון יורש צבע מהכפתור */
.btn-primary .icon {
    color: inherit; /* האיקון יהיה באותו צבע כמו הכפתור */
}

/* איקון עם צבע ספציפי */
.icon--error {
    color: var(--icon-color-error, #dc3545);
}

/* איקון בכפתור עם צבע דינמי */
.btn[data-color="success"] .icon {
    color: var(--success-color, #28a745);
}
```

### יישור איקונים בכפתורים

כפתורים עם **רק איקון** (ללא טקסט) ממורכזים אוטומטית:

```css
/* כפתור עם רק איקון - ממורכז */
button:has(> .icon:only-child),
.btn:has(> svg.icon:only-child) {
    justify-content: center !important;
    align-items: center !important;
}

/* האיקון עצמו - ללא margins */
button > .icon:only-child {
    margin: 0 !important;
}
```

**דוגמה:**
```html
<!-- כפתור עם רק איקון - ממורכז אוטומטית -->
<button class="btn">
    <svg class="icon" ...>...</svg>
</button>

<!-- כפתור עם איקון + טקסט - האיקון משמאל, טקסט מימין -->
<button class="btn">
    <svg class="icon">...</svg>
    ערוך
</button>
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

מערכת הכפתורים משתמשת ב-`IconSystem` להמרה אוטומטית של Tabler Icons ל-inline SVG:

```javascript
// button-system-init.js
// כפתורים עם Tabler icons מומרים אוטומטית ל-inline SVG
// זה מאפשר לאיקונים לייצג צבעים דינמיים מהכפתור

// button-icons.js
const BUTTON_ICONS = {
    EDIT: '/trading-ui/images/icons/tabler/pencil.svg',
    DELETE: '/trading-ui/images/icons/tabler/trash.svg',
    // ...
};

// המרה אוטומטית מתבצעת ב-_enhanceButtonIcons():
// img.icon[data-icon-enhance="true"] → inline SVG
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

### דוגמה 1: הוספת איקון לכפתור עם צבע דינמי

```javascript
const button = document.createElement('button');
button.className = 'btn btn-primary'; // כפתור כחול
const iconHTML = await window.IconSystem.renderIcon('button', 'edit', {
    size: '16',
    class: 'icon me-2'
});
button.innerHTML = iconHTML + 'ערוך';
// האיקון יהיה כחול (יורש מ-currentColor של הכפתור)
```

### דוגמה 2: כפתור עם רק איקון (ממורכז אוטומטית)

```javascript
const iconButton = document.createElement('button');
iconButton.className = 'btn btn-danger'; // כפתור אדום
const iconHTML = await window.IconSystem.renderIcon('button', 'delete', {
    size: '16',
    class: 'icon'
});
iconButton.innerHTML = iconHTML; // רק איקון, ללא טקסט
// הכפתור והאיקון ממורכזים אוטומטית, האיקון אדום
```

### דוגמה 3: איקון עם צבע מותאם אישית

```javascript
const warningIcon = await window.IconSystem.renderIcon('button', 'warning', {
    size: '20',
    class: 'icon',
    style: 'color: #ffc107;' // צבע צהוב מותאם
});
```

### דוגמה 4: עדכון איקון entity במודל

```javascript
const iconPath = await window.IconSystem.getEntityIcon('trade');
const iconElement = document.querySelector('.entity-icon img');
iconElement.src = iconPath;
// Entity icons נשארים כ-img tags (צבעים קבועים)
```

### דוגמה 5: הצגת איקון קטגוריה

```javascript
const category = 'development';
const iconHTML = await window.IconSystem.renderIcon('category', category, {
    size: '20',
    class: 'icon me-1'
});
badge.innerHTML = iconHTML + 'פיתוח';
```

### דוגמה 6: יצירת כפתור עם צבע דינמי לפי משתנה CSS

```javascript
// HTML/CSS
// .btn-success { --icon-color: var(--success-color, #28a745); }

const successButton = document.createElement('button');
successButton.className = 'btn btn-success';
const checkIcon = await window.IconSystem.renderIcon('button', 'check', {
    size: '16',
    class: 'icon'
});
successButton.innerHTML = checkIcon;
// האיקון יקבל את הצבע מה-CSS variable של הכפתור
```

## 👨‍💻 מדריך למפתח העתידי

### מתי להשתמש ב-Tabler Icons vs Entity Icons?

**Tabler Icons** - לכל איקון שצריך:
- ✅ שינוי צבע דינמי
- ✅ התאמה לצבע הכפתור/אלמנט
- ✅ איקונים כלליים (כפתורים, קטגוריות, עמודים)

**Entity Icons** - רק ל-17 הישויות המקוריות:
- ✅ איקוני ישויות ספציפיים (trades, alerts, accounts, etc.)
- ✅ צבעים קבועים (לא ניתן לשנות)

### דפוסי שימוש נפוצים

#### 1. כפתור עם איקון + טקסט

```javascript
const button = document.createElement('button');
button.className = 'btn btn-primary';
const icon = await window.IconSystem.renderIcon('button', 'save', {
    size: '16',
    class: 'icon me-2'
});
button.innerHTML = icon + 'שמור';
// האיקון משמאל, הטקסט מימין, האיקון יורש צבע מהכפתור
```

#### 2. כפתור עם רק איקון

```javascript
const iconButton = document.createElement('button');
iconButton.className = 'btn btn-outline-secondary';
iconButton.setAttribute('aria-label', 'ערוך');
const icon = await window.IconSystem.renderIcon('button', 'edit', {
    size: '16',
    class: 'icon'
});
iconButton.innerHTML = icon;
// הכפתור ממורכז אוטומטית, האיקון ממורכז בכפתור
```

#### 3. איקון עם מצבים (active, disabled, etc.)

```html
<!-- בדף HTML -->
<button class="btn">
    <svg class="icon icon--active">...</svg>
    כפתור פעיל
</button>

<button class="btn" disabled>
    <svg class="icon icon--disabled">...</svg>
    כפתור מושבת
</button>
```

```css
/* ב-CSS */
.icon--active {
    color: var(--icon-color-active, #26baac);
}

.icon--disabled {
    color: var(--icon-color-disabled, #6c757d);
    opacity: 0.5;
}
```

#### 4. שילוב עם מערכת הכפתורים הקיימת

```javascript
// השימוש ב-button-system-init.js כבר מטפל בהכל אוטומטית
// רק צריך להגדיר את נתיב האיקון ב-button-icons.js
const BUTTON_ICONS = {
    EDIT: '/trading-ui/images/icons/tabler/pencil.svg',
    // המערכת תמיר אוטומטית ל-inline SVG
};
```

### טיפים וביטולי

1. **תמיד השתמש ב-`await`** - `renderIcon()` היא async function
2. **בדוק שהמערכת נטענה** - לפני שימוש, וודא ש-`window.IconSystem` קיים
3. **אל תשנה צבעים ידנית ל-Entity Icons** - הם נשארים קבועים
4. **השתמש ב-CSS variables** - לצבעים דינמיים, השתמש ב-CSS variables
5. **כפתורים עם רק איקון** - אל תוסיף margins ידנית, המערכת מטפלת בזה

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

### איקון לא משנה צבע (Tabler Icons)

1. **בדוק שהאיקון מוטמע כ-inline SVG:**
   ```javascript
   // בדוק ב-console
   const icon = document.querySelector('.icon');
   console.log(icon.tagName); // צריך להיות 'svg', לא 'img'
   ```

2. **בדוק שה-SVG משתמש ב-currentColor:**
   ```javascript
   const svg = document.querySelector('svg.icon');
   console.log(svg.getAttribute('stroke')); // צריך להיות 'currentColor'
   ```

3. **ודא שהכפתור/אלמנט ההורה מגדיר צבע:**
   ```css
   .btn {
       color: var(--primary-color); /* האיקון יורש את זה */
   }
   ```

### איקון לא ממורכז בכפתור

- בדוק שיש רק איקון בכפתור (ללא טקסט):
  ```html
  <!-- ✅ נכון - ימורכז -->
  <button class="btn"><svg class="icon">...</svg></button>
  
  <!-- ❌ לא נכון - לא ימורכז -->
  <button class="btn"><svg class="icon">...</svg>טקסט</button>
  ```

- בדוק שה-CSS נטען:
  ```css
  button:has(> .icon:only-child) {
      justify-content: center !important;
  }
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

