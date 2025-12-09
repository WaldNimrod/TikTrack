# Ticker List Widget - Developer Guide

**תאריך יצירה:** דצמבר 2025  
**גרסה:** 1.0.0  
**מטרה:** מדריך מפתח לוויגיט רשימת טיקרים עם KPI Cards

---

## סקירה כללית

Ticker List Widget הוא וויגיט לדשבורד הבית המציג טיקרים עם KPI Cards מיניאטוריים. הוויגיט כולל 3 טאבים:

- **טיקרים פעילים** - טיקרים של המשתמש עם נתונים ראשוניים
- **רשימת צפיה** - טיקרים מרשימת צפיה (mockup עכשיו)
- **כל הטיקרים** - כל הטיקרים של המשתמש עם נתונים ראשוניים

---

## קבצים

### JavaScript

- `trading-ui/scripts/widgets/ticker-list-widget.js`

### CSS

- `trading-ui/styles-new/06-components/_ticker-list-widget.css`

### HTML

- `trading-ui/index.html` - מיקום: שורה שנייה, עמודה ימנית

---

## API

### `init(containerId, config)`

מאתחל את הוויגיט.

**Parameters:**

- `containerId` (string, optional) - ID של הקונטיינר (ברירת מחדל: `tickerListWidgetContainer`)
- `config` (object, optional) - קונפיגורציה:
  - `maxItems` (number) - מספר מקסימלי של טיקרים להצגה (ברירת מחדל: 5)
  - `defaultTab` (string) - טאב ברירת מחדל: `'active'` | `'watchlist'` | `'all'` (ברירת מחדל: `'active'`)
  - `watchListId` (number | null) - ID של רשימת צפיה (null עבור mockup)

**Example:**

```javascript
window.TickerListWidget.init('tickerListWidgetContainer', {
  maxItems: 5,
  defaultTab: 'active',
  watchListId: null
});
```

### `render(data)`

מעדכן את הוויגיט עם נתונים חדשים.

**Parameters:**

- `data` (object, optional) - נתונים לעדכון:
  - `activeTickers` (Array) - טיקרים פעילים
  - `watchListTickers` (Array) - טיקרים מרשימת צפיה
  - `allTickers` (Array) - כל הטיקרים

**Example:**

```javascript
window.TickerListWidget.render({
  activeTickers: [...],
  watchListTickers: [...],
  allTickers: [...]
});
```

### `refresh()`

מרענן את הנתונים מה-API.

**Example:**

```javascript
window.TickerListWidget.refresh();
```

### `destroy()`

מנקה את הוויגיט ומסיר event listeners.

**Example:**

```javascript
window.TickerListWidget.destroy();
```

---

## מבנה KPI Card

כל KPI Card כולל:

1. **כותרת:**
   - סמל טיקר
   - שם (custom או רגיל)
   - מחיר נוכחי
   - שינוי יומי (%)

2. **מדדים:**
   - ATR
   - נפח
   - יחס ל-MA 20

3. **פעולות:**
   - כפתור "דשבורד מלא"

---

## תלויות

### מערכות כלליות

- `FieldRendererService` - עיצוב נתונים
- `ButtonSystem` - כפתורים
- `NotificationSystem` - התראות שגיאה
- `UnifiedCacheManager` - ניהול מטמון

### API Endpoints

- `GET /api/tickers/with-initial-data` - טיקרים עם נתונים ראשוניים

### Services

- `WatchListsWidgetService` - ניהול רשימות צפיה (mockup)

---

## קונפיגורציה

### Package Manifest

הוויגיט נטען דרך החבילה `dashboard-widgets`:

- `trading-ui/scripts/init-system/package-manifest.js`

### Page Config

הוויגיט מאותחל ב-`page-initialization-configs.js`:

- `index` page → `customInitializers`

---

## ביצועים

- **הגבלת מספר טיקרים:** configurable (ברירת מחדל: 5)
- **Cache:** TTL של 5 דקות
- **Batch Queries:** מניעת N+1 queries

---

## Responsive Design

הוויגיט תומך ב-responsive design:

- Desktop: 3 עמודות
- Tablet: 2 עמודות
- Mobile: עמודה אחת

---

## תיעוד נוסף

- [WIDGETS_LIST.md](../../frontend/WIDGETS_LIST.md)
- [WIDGET_DEVELOPER_GUIDE.md](WIDGET_DEVELOPER_GUIDE.md)
- [TICKER_DASHBOARD_WIDGET_PROPOSAL.md](../../03-DEVELOPMENT/PLANS/TICKER_DASHBOARD_WIDGET_PROPOSAL.md)

---

**מקור:** `documentation/03-DEVELOPMENT/GUIDES/TICKER_LIST_WIDGET_DEVELOPER_GUIDE.md`  
**עודכן:** דצמבר 2025

