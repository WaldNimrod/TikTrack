# Widget Overlay System - Architecture

## סקירה כללית

מערכת Overlay מרכזית לניהול הצגת פרטים נוספים בוויג'טים על hover. המערכת מספקת פתרון אחיד, איכותי וגמיש לכל הוויג'טים והממשקים.

## ארכיטקטורה כללית

### רכיבים עיקריים

1. **WidgetOverlayService** (`trading-ui/scripts/services/widget-overlay-service.js`)
   - שירות מרכזי לניהול overlay
   - מטפל ב-positioning, event handling, ו-lifecycle
   - כולל GapBridge functionality לטיפול ב-gaps בין items

2. **WidgetZIndexManager** (`trading-ui/scripts/services/widget-z-index-manager.js`)
   - מערכת ניהול z-index דינמית ל-widget overlays
   - מחשב z-index לפי stack depth
   - מבטיח שכל overlay חדש מופיע מעל הקודם

3. **CSS מרכזי** (`trading-ui/styles-new/06-components/_widget-overlay.css`)
   - CSS בסיסי ל-overlay
   - תמיכה ב-RTL, transitions, responsive
   - כולל styles ל-gap bridge elements

4. **Widget Integration**
   - כל וויג'ט משתמש ב-WidgetOverlayService
   - מבנה HTML אחיד עם `data-widget-overlay="true"` ו-`data-overlay="true"`

## מבנה HTML תקני

### מבנה בסיסי

```html
<li class="widget-item" data-widget-overlay="true">
  <!-- Header Section - Always Visible -->
  <div class="widget-item-header">
    <!-- Content -->
  </div>
  <!-- Details Section - Hidden by default, shown on hover -->
  <div class="widget-item-details" data-overlay="true">
    <div class="widget-item-details-content">
      <!-- Details rows -->
    </div>
  </div>
</li>
```

### דרישות מבנה

1. **data-widget-overlay="true"** - על ה-item (li או div)
   - מסמן שהאלמנט תומך ב-overlay
   - מאפשר ל-CSS לזהות את האלמנט

2. **data-overlay="true"** - על ה-details container
   - מסמן שזה overlay container
   - מאפשר ל-JavaScript לזהות את האלמנט

3. **מבנה אחיד** - header + details
   - Header תמיד נראה
   - Details מוסתר כברירת מחדל, מוצג על hover

### דוגמאות מימוש

#### Recent Items Widget

```html
<li class="list-group-item recent-items-widget-item" 
    data-entity-type="trade" 
    data-entity-id="123"
    data-widget-overlay="true">
  <div class="recent-items-widget-header">
    <!-- Header -->
  </div>
  <div class="recent-items-widget-details-container" data-overlay="true">
    <div class="recent-items-widget-details-content">
      <!-- Details -->
    </div>
  </div>
</li>
```

#### Unified Pending Actions Widget

```html
<li class="list-group-item unified-pending-list-item" 
    data-execution-id="456"
    data-widget-overlay="true">
  <div class="unified-pending-item-header">
    <!-- Header -->
  </div>
  <div class="unified-pending-details" data-overlay="true">
    <div class="unified-pending-details-content">
      <!-- Details -->
    </div>
  </div>
</li>
```

## זרימת אירועים

### 1. Mouse Enter

```
User hovers over item
  ↓
Event delegation on list container catches mouseenter
  ↓
WidgetOverlayService.setupOverlayHover handler triggered
  ↓
Item found via closest(itemSelector)
  ↓
Details found via querySelector(detailsSelector)
  ↓
Item.classList.add('is-hovered')
  ↓
Details.style.display = 'block'
  ↓
requestAnimationFrame(() => {
  positionOverlay(item, details, config)
})
  ↓
Overlay positioned and shown
```

### 2. Mouse Leave

```
User moves mouse away from item
  ↓
Event delegation on list container catches mouseleave
  ↓
Check if mouse is moving to overlay
  ↓
If moving to overlay: Keep overlay visible
  ↓
If not: Item.classList.remove('is-hovered')
  ↓
Details.style.opacity = '0'
  ↓
After transition: Reset positioning
```

### 3. Overlay Hover

```
User hovers over overlay itself
  ↓
Overlay mouseenter handler triggered
  ↓
Item.classList.add('is-hovered')
  ↓
Overlay stays visible
```

## Positioning Logic

### Fixed Positioning

המערכת משתמשת ב-`position: fixed` כדי לאפשר ל-overlay לברוח מגבולות הקונטיינר.

**חשוב:** עם `position: fixed`, `getBoundingClientRect()` כבר מחזיר מיקום יחסית ל-viewport, אז **לא צריך** `window.scrollY`/`window.scrollX`.

### Positioning Algorithm

1. **Get item position** - `item.getBoundingClientRect()`
2. **Get overlay dimensions** - `details.offsetWidth`, `details.offsetHeight`
3. **Calculate position below item** - `itemRect.bottom + gap`
4. **Check viewport boundaries**:
   - אם לא נכנס למטה → מעל ה-item
   - אם לא נכנס למעלה → בחלק העליון של viewport
5. **Check horizontal overflow**:
   - אם לא נכנס מימין → שמאלה
   - אם לא נכנס משמאל → ימינה
6. **Apply fixed positioning** - `position: fixed`, `top`, `left`/`right`

### RTL Support

```javascript
const isRTL = document.documentElement.dir === 'rtl' || 
              getComputedStyle(document.body).direction === 'rtl';

if (isRTL) {
  details.style.right = `${right}px`;
  details.style.left = 'auto';
} else {
  details.style.left = `${left}px`;
  details.style.right = 'auto';
}
```

## CSS Architecture

### CSS מרכזי (_widget-overlay.css)

```css
/* Base item styles */
[data-widget-overlay="true"] {
  position: relative;
  overflow: visible;
  z-index: 1;
}

[data-widget-overlay="true"].is-hovered {
  z-index: 10;
}

/* Base overlay styles */
[data-overlay="true"] {
  display: none;
  position: fixed;
  z-index: 1100; /* Managed dynamically by WidgetZIndexManager */
  /* ... */
}

.is-hovered [data-overlay="true"] {
  display: block;
  opacity: 1;
}
```

### CSS ספציפי לוויג'ט

הוויג'ט יכול להוסיף CSS ספציפי:

```css
/* Widget-specific styles */
.recent-items-widget-details-container {
  /* Inherits base styles from _widget-overlay.css */
  /* Widget-specific overrides */
}
```

## Event Delegation

המערכת משתמשת ב-event delegation על ה-list container:

```javascript
listElement.addEventListener('mouseenter', function(event) {
  const item = event.target.closest(itemSelector);
  if (!item) return;
  
  const details = item.querySelector(detailsSelector);
  if (!details) return;
  
  // Handle hover
}, true); // Use capture phase
```

**יתרונות:**

- ביצועים טובים יותר (פחות event listeners)
- תמיכה ב-dynamic content (items שנוספים/מוסרים)
- ניקוי קל יותר

## Gap Bridge System

### בעיית ה-Gap

כשהעכבר עובר על gap בין items (למשל `margin-bottom: 0.75rem`), ה-overlay נסגר כי אין אלמנט שמקבל את ה-hover event.

### פתרון: Invisible Bridge Elements

המערכת יוצרת אלמנטים בלתי נראים שממלאים את ה-gaps בין items:

```javascript
// Gap bridges are created automatically by WidgetOverlayService
// They fill the gaps between items and maintain hover state
```

**תכונות:**

- אלמנטים בלתי נראים (`opacity: 0`, `background: transparent`)
- מקבלים event listeners זהים ל-items
- נמחקים אוטומטית ב-destroy()
- z-index: 5 (בין items (1) ל-hovered items (10))

**CSS:**

```css
.widget-overlay-gap-bridge,
[data-gap-bridge="true"] {
  position: absolute;
  background: transparent;
  pointer-events: auto;
  z-index: 5;
  opacity: 0;
}
```

## Z-Index Management

### WidgetZIndexManager

המערכת משתמשת ב-`WidgetZIndexManager` לניהול z-index דינמי:

```javascript
// Base z-index: 1100 (above modals which use 1040-1090)
// Increment: 10 per overlay
// Formula: BASE_Z_INDEX + (stackIndex * Z_INDEX_INCREMENT)
```

**תכונות:**

- ניהול stack של overlays פעילים
- כל overlay חדש מקבל z-index גבוה יותר
- עדכון אוטומטי בעת פתיחה/סגירה
- Cleanup אוטומטי

**שימוש:**

```javascript
// Automatically called by WidgetOverlayService
const zIndex = window.WidgetZIndexManager.registerOverlay(overlayElement, itemElement);
// Later, when overlay closes:
window.WidgetZIndexManager.unregisterOverlay(overlayElement);
```

## Lifecycle Management

### Initialization

```javascript
// ב-render() של הוויג'ט
if (window.WidgetOverlayService && list) {
  window.WidgetOverlayService.setupOverlayHover(
    list,
    '.widget-item',
    '.widget-item-details',
    options
  );
}
```

### Cleanup

```javascript
// ב-destroy() של הוויג'ט
if (window.WidgetOverlayService && list) {
  window.WidgetOverlayService.destroy(list);
}
```

### Active Overlays Tracking

המערכת עוקבת אחרי active overlays באמצעות `WeakMap`:

```javascript
const activeOverlays = new WeakMap();

// Store config
activeOverlays.set(listElement, overlayConfig);

// Retrieve for cleanup
const overlayConfig = activeOverlays.get(listElement);
```

## Integration Points

### Package Manifest

המערכת נטענת דרך חבילת `services`:

```javascript
'services': {
  scripts: [
    {
      file: 'services/widget-overlay-service.js',
      globalCheck: 'window.WidgetOverlayService',
      description: 'Central widget overlay service for hover details',
      required: false,
      loadOrder: 8.2
    }
  ]
}
```

### Widget Dependencies

הוויג'טים תלויים ב-`WidgetOverlayService`:

- RecentItemsWidget
- UnifiedPendingActionsWidget
- כל וויג'ט עתידי עם overlay

## Performance Considerations

### 1. Event Delegation

שימוש ב-event delegation במקום binding לכל item:

- פחות event listeners
- ביצועים טובים יותר
- תמיכה ב-dynamic content

### 2. requestAnimationFrame

שימוש ב-`requestAnimationFrame` ל-positioning:

- מבטיח ש-DOM מוכן
- מבטיח positioning מדויק
- מבטיח smooth animations

### 3. WeakMap for Tracking

שימוש ב-`WeakMap` לעיקוב active overlays:

- לא מונע garbage collection
- אוטומטי cleanup

## Best Practices

### 1. מבנה HTML אחיד

- תמיד השתמש ב-`data-widget-overlay="true"` על ה-item
- תמיד השתמש ב-`data-overlay="true"` על ה-details container
- שמור על מבנה אחיד של header + details

### 2. CSS Inheritance

- השתמש ב-CSS המרכזי כבסיס
- הוסף CSS ספציפי לוויג'ט רק אם נדרש
- אל תכפול CSS בסיסי

### 3. Cleanup

- תמיד נקה את ה-overlay handlers ב-destroy()
- השתמש ב-`WidgetOverlayService.destroy()` לניקוי

### 4. Positioning

- אל תשתמש ב-`window.scrollY`/`window.scrollX`
- המערכת מטפלת בזה אוטומטית עם `position: fixed`

## קישורים

- [מדריך למפתח](../03-DEVELOPMENT/GUIDES/WIDGET_OVERLAY_SERVICE_GUIDE.md)
- [רשימת מערכות כלליות](../../frontend/GENERAL_SYSTEMS_LIST.md)
- [מדריך וויג'טים](../03-DEVELOPMENT/GUIDES/WIDGET_DEVELOPER_GUIDE.md)



