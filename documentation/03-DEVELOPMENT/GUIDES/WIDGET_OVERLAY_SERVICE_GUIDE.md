# Widget Overlay Service - Developer Guide

## סקירה כללית

`WidgetOverlayService` היא מערכת מרכזית לניהול overlay של פרטים נוספים בוויג'טים. המערכת מספקת פתרון אחיד ואיכותי להצגת מידע נוסף על hover, עם תמיכה מלאה ב-RTL, scroll, ו-resize.

## ארכיטקטורה

המערכת מבוססת על:

- **Event Delegation**: שימוש ב-event delegation על ה-list container במקום binding לכל item
- **Fixed Positioning**: שימוש ב-`position: fixed` כדי לאפשר ל-overlay לברוח מגבולות הקונטיינר
- **Viewport-Relative**: חישוב מיקום יחסית ל-viewport (ללא scroll offsets)

## מבנה HTML נדרש

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
2. **data-overlay="true"** - על ה-details container
3. מבנה אחיד של header + details
4. תמיכה ב-RTL

### דוגמה מלאה

```html
<li class="list-group-item recent-items-widget-item" 
    data-entity-type="trade" 
    data-entity-id="123"
    data-widget-overlay="true">
  <!-- Header Section - Always Visible -->
  <div class="recent-items-widget-header">
    <div class="recent-items-widget-title">
      <div class="recent-items-widget-title-main-row">
        <img src="icon.svg" alt="טרייד" class="recent-items-widget-icon">
        <span class="recent-items-widget-title-main">AAPL</span>
      </div>
      <div class="recent-items-widget-title-meta">
        <span class="recent-items-widget-meta-item">פתוח</span>
        <span class="recent-items-widget-meta-item">2025-01-15</span>
      </div>
    </div>
    <div class="recent-items-widget-amount">
      <div class="recent-items-widget-amount-value">$1,000</div>
    </div>
  </div>
  <!-- Details Section - Hidden by default, shown on hover -->
  <div class="recent-items-widget-details-container" data-overlay="true">
    <div class="recent-items-widget-details-content">
      <div class="recent-items-widget-details-row">
        <span class="recent-items-widget-details-label">צד:</span>
        <span class="recent-items-widget-details-value">לונג</span>
      </div>
      <div class="recent-items-widget-details-row">
        <span class="recent-items-widget-details-label">כמות:</span>
        <span class="recent-items-widget-details-value">100</span>
      </div>
    </div>
  </div>
</li>
```

## API

### setupOverlayHover(listElement, itemSelector, detailsSelector, options)

מגדיר event handlers ל-overlay hover.

**פרמטרים:**

- `listElement` (HTMLElement) - אלמנט הרשימה (container)
- `itemSelector` (string) - CSS selector ל-items (לדוגמה: `.widget-item`)
- `detailsSelector` (string) - CSS selector ל-details container (לדוגמה: `.widget-item-details`)
- `options` (Object, אופציונלי) - אפשרויות קונפיגורציה:
  - `hoverClass` (string, default: `'is-hovered'`) - CSS class להוספה על hover
  - `transitionDuration` (number, default: `200`) - משך transition במילישניות
  - `gap` (number, default: `8`) - רווח בין item ל-overlay בפיקסלים
  - `minWidth` (number, default: `280`) - רוחב מינימלי של overlay בפיקסלים
  - `maxWidth` (number, default: `400`) - רוחב מקסימלי של overlay בפיקסלים
  - `zIndex` (number, default: `1050`) - z-index של overlay

**דוגמה:**

```javascript
if (window.WidgetOverlayService && elements.tradesList) {
  window.WidgetOverlayService.setupOverlayHover(
    elements.tradesList,
    '.recent-items-widget-item',
    '.recent-items-widget-details-container',
    {
      hoverClass: 'is-hovered',
      gap: 8,
      minWidth: 280,
      maxWidth: 400,
      zIndex: 1050
    }
  );
}
```

### positionOverlay(item, details, options)

מחשב ומציב overlay יחסית ל-item.

**פרמטרים:**

- `item` (HTMLElement) - אלמנט ה-item
- `details` (HTMLElement) - אלמנט ה-details container
- `options` (Object, אופציונלי) - אפשרויות קונפיגורציה (כמו ב-setupOverlayHover)

**הערה:** בדרך כלל לא צריך לקרוא לפונקציה הזו ישירות - היא נקראת אוטומטית על ידי `setupOverlayHover`.

### updatePosition(item, details, options)

מעדכן מיקום overlay (לשימוש ב-scroll/resize events).

**פרמטרים:**

- `item` (HTMLElement) - אלמנט ה-item
- `details` (HTMLElement) - אלמנט ה-details container
- `options` (Object, אופציונלי) - אפשרויות קונפיגורציה

**דוגמה:**

```javascript
window.addEventListener('scroll', () => {
  const activeItems = document.querySelectorAll('.widget-item.is-hovered');
  activeItems.forEach(item => {
    const details = item.querySelector('[data-overlay="true"]');
    if (details && window.WidgetOverlayService) {
      window.WidgetOverlayService.updatePosition(item, details);
    }
  });
});
```

### destroy(listElement)

מנקה event listeners ומסיר את ה-overlay handlers.

**פרמטרים:**

- `listElement` (HTMLElement) - אלמנט הרשימה (container)

**דוגמה:**

```javascript
// ב-destroy() של הוויג'ט
if (window.WidgetOverlayService && elements.tradesList) {
  window.WidgetOverlayService.destroy(elements.tradesList);
}
```

## שימוש בוויג'ט

### 1. עדכון מבנה HTML

הוסף `data-widget-overlay="true"` על ה-item ו-`data-overlay="true"` על ה-details container:

```javascript
function buildItem(data) {
  return `
    <li class="widget-item" data-widget-overlay="true">
      <div class="widget-item-header">
        <!-- Header content -->
      </div>
      <div class="widget-item-details" data-overlay="true">
        <div class="widget-item-details-content">
          <!-- Details content -->
        </div>
      </div>
    </li>
  `;
}
```

### 2. הגדרת Overlay

קרא ל-`setupOverlayHover` לאחר רינדור הרשימה:

```javascript
function renderList(items) {
  const list = document.getElementById('myList');
  list.innerHTML = items.map(buildItem).join('');
  
  // Setup overlay hover
  if (window.WidgetOverlayService && list) {
    window.WidgetOverlayService.setupOverlayHover(
      list,
      '.widget-item',
      '.widget-item-details',
      {
        hoverClass: 'is-hovered',
        gap: 8,
        minWidth: 280,
        maxWidth: 400,
        zIndex: 1050
      }
    );
  }
}
```

### 3. ניקוי ב-destroy

קרא ל-`destroy` ב-destroy() של הוויג'ט:

```javascript
destroy() {
  if (window.WidgetOverlayService && elements.list) {
    window.WidgetOverlayService.destroy(elements.list);
  }
}
```

## CSS

### CSS מרכזי

המערכת מספקת CSS מרכזי ב-`_widget-overlay.css`:

- `.widget-item[data-widget-overlay="true"]` - בסיס ל-items
- `[data-overlay="true"]` - בסיס ל-overlay
- `.widget-item-details-content` - תוכן overlay
- `.widget-item-details-row` - שורות פרטים

### CSS ספציפי לוויג'ט

הוויג'ט יכול להוסיף CSS ספציפי לפי הצורך:

```css
/* Widget-specific styles */
.recent-items-widget-details-container {
  /* Inherits base styles from _widget-overlay.css */
  /* Widget-specific overrides can be added here if needed */
}
```

## Best Practices

### 1. מבנה HTML אחיד

- השתמש תמיד ב-`data-widget-overlay="true"` על ה-item
- השתמש תמיד ב-`data-overlay="true"` על ה-details container
- שמור על מבנה אחיד של header + details

### 2. Event Delegation

- השתמש ב-event delegation על ה-list container
- אל תוסיף event listeners לכל item בנפרד

### 3. Cleanup

- תמיד נקה את ה-overlay handlers ב-destroy()
- השתמש ב-`WidgetOverlayService.destroy()` לניקוי

### 4. Positioning

- אל תשתמש ב-`window.scrollY`/`window.scrollX` - המערכת מטפלת בזה אוטומטית
- עם `position: fixed`, `getBoundingClientRect()` כבר מחזיר מיקום יחסית ל-viewport

## Troubleshooting

### Overlay לא נפתח

**סיבות אפשריות:**

1. `WidgetOverlayService` לא נטען - וודא שהוא נטען לפני הוויג'ט
2. מבנה HTML לא נכון - וודא שיש `data-widget-overlay="true"` ו-`data-overlay="true"`
3. Selectors לא נכונים - וודא שה-selectors תואמים למבנה HTML

**פתרון:**

```javascript
// בדוק אם המערכת נטענה
if (!window.WidgetOverlayService) {
  console.error('WidgetOverlayService not loaded!');
  return;
}

// בדוק את המבנה HTML
const item = document.querySelector('.widget-item');
const details = item?.querySelector('[data-overlay="true"]');
if (!item || !details) {
  console.error('HTML structure incorrect!');
  return;
}
```

### Overlay לא ממוקם נכון

**סיבות אפשריות:**

1. שימוש ב-`window.scrollY`/`window.scrollX` - לא נחוץ עם `position: fixed`
2. CSS שמשפיע על positioning - בדוק CSS ספציפי לוויג'ט

**פתרון:**

- הסר כל שימוש ב-`window.scrollY`/`window.scrollX`
- בדוק CSS ספציפי לוויג'ט שלא משפיע על positioning

### Overlay נחתך על ידי container

**סיבות אפשריות:**

1. `overflow: hidden` על container - צריך `overflow: visible`
2. z-index נמוך מדי - בדוק את ה-z-index

**פתרון:**

```css
/* Container צריך overflow: visible */
.widget-container {
  overflow: visible;
}

/* Item צריך position: relative */
.widget-item {
  position: relative;
  overflow: visible;
}
```

## דוגמאות

### דוגמה מלאה - Recent Items Widget

```javascript
// 1. Build item HTML
function buildTradeItem(trade) {
  return `
    <li class="list-group-item recent-items-widget-item" 
        data-entity-type="trade" 
        data-entity-id="${trade.id}"
        data-widget-overlay="true">
      <div class="recent-items-widget-header">
        <!-- Header content -->
      </div>
      <div class="recent-items-widget-details-container" data-overlay="true">
        <div class="recent-items-widget-details-content">
          <!-- Details content -->
        </div>
      </div>
    </li>
  `;
}

// 2. Render list
function renderTrades(trades) {
  const list = document.getElementById('tradesList');
  list.innerHTML = trades.map(buildTradeItem).join('');
  
  // 3. Setup overlay
  if (window.WidgetOverlayService && list) {
    window.WidgetOverlayService.setupOverlayHover(
      list,
      '.recent-items-widget-item',
      '.recent-items-widget-details-container',
      {
        hoverClass: 'is-hovered',
        gap: 8,
        minWidth: 280,
        maxWidth: 400,
        zIndex: 1050
      }
    );
  }
}

// 4. Cleanup in destroy()
destroy() {
  if (window.WidgetOverlayService && elements.tradesList) {
    window.WidgetOverlayService.destroy(elements.tradesList);
  }
}
```

## קישורים

- [ארכיטקטורה מלאה](../02-ARCHITECTURE/FRONTEND/WIDGET_OVERLAY_SYSTEM.md)
- [רשימת מערכות כלליות](../../frontend/GENERAL_SYSTEMS_LIST.md)
- [מדריך וויג'טים](WIDGET_DEVELOPER_GUIDE.md)




