# Ticker Chart Widget - Developer Guide

**תאריך יצירה:** דצמבר 2025  
**גרסה:** 1.0.0  
**מטרה:** מדריך מפתח לוויגיט גרפים מהירים עם TradingView Mini Charts

---

## סקירה כללית

Ticker Chart Widget הוא וויגיט לדשבורד הבית המציג טיקרים עם TradingView Mini Charts. הוויגיט מציג עד 3 טיקרים עם גרפים מיניאטוריים ונתונים משלימים.

---

## קבצים

### JavaScript
- `trading-ui/scripts/widgets/ticker-chart-widget.js`

### CSS
- `trading-ui/styles-new/06-components/_ticker-chart-widget.css`

### HTML
- `trading-ui/index.html` - מיקום: שורה שלישית, עמודה מלאה

---

## API

### `init(containerId, config)`

מאתחל את הוויגיט.

**Parameters:**
- `containerId` (string, optional) - ID של הקונטיינר (ברירת מחדל: `tickerChartWidgetContainer`)
- `config` (object, optional) - קונפיגורציה:
  - `maxItems` (number) - מספר מקסימלי של טיקרים להצגה (ברירת מחדל: 3)
  - `defaultTickers` (Array<number>) - רשימת ID-ים של טיקרים להצגה (אופציונלי)

**Example:**
```javascript
window.TickerChartWidget.init('tickerChartWidgetContainer', {
  maxItems: 3,
  defaultTickers: [1, 2, 3]
});
```

### `render(data)`

מעדכן את הוויגיט עם נתונים חדשים.

**Parameters:**
- `data` (object, optional) - נתונים לעדכון:
  - `tickers` (Array) - רשימת טיקרים

**Example:**
```javascript
window.TickerChartWidget.render({
  tickers: [...]
});
```

### `refresh()`

מרענן את הנתונים מה-API ומשחזר את הגרפים.

**Example:**
```javascript
window.TickerChartWidget.refresh();
```

### `destroy()`

מנקה את הוויגיט, משמיד את כל הגרפים ומסיר event listeners.

**Example:**
```javascript
window.TickerChartWidget.destroy();
```

---

## מבנה Chart Card

כל Chart Card כולל:

1. **כותרת:**
   - סמל טיקר
   - שם (custom או רגיל)
   - מחיר נוכחי
   - שינוי יומי (%)

2. **גרף:**
   - TradingView Mini Chart (גובה: 200px)

3. **מדדים:**
   - ATR

4. **פעולות:**
   - כפתור "דשבורד מלא"

---

## תלויות

### מערכות כלליות
- `TradingViewWidgetsFactory` - יצירת Mini Charts
- `TradingViewWidgetsConfig` - קונפיגורציה של TradingView
- `TradingViewWidgetsColors` - צבעים דינמיים
- `FieldRendererService` - עיצוב נתונים
- `ButtonSystem` - כפתורים
- `NotificationSystem` - התראות שגיאה
- `UnifiedCacheManager` - ניהול מטמון

### API Endpoints
- `GET /api/tickers/with-initial-data` - טיקרים עם נתונים ראשוניים

---

## קונפיגורציה

### Package Manifest
הוויגיט נטען דרך החבילה `dashboard-widgets`:
- `trading-ui/scripts/init-system/package-manifest.js`

### Page Config
הוויגיט מאותחל ב-`page-initialization-configs.js`:
- `index` page → `customInitializers`

---

## TradingView Mini Chart

הוויגיט משתמש ב-TradingView Mini Chart דרך `TradingViewWidgetsFactory`:

```javascript
const chartInstance = window.TradingViewWidgetsFactory.createWidget('mini-chart', {
  symbol: 'NASDAQ:AAPL',
  width: '100%',
  height: 200,
  dateRange: '1M',
  colorTheme: 'light',
  locale: 'he',
  container_id: containerId
});
```

### תמיכה ב-Theme
הוויגיט תומך ב-theme דינמי דרך `TradingViewWidgetsColors`:
- Light/Dark mode
- צבעים מהעדפות המשתמש

---

## ביצועים

- **הגבלת מספר טיקרים:** configurable (ברירת מחדל: 3)
- **Cache:** TTL של 5 דקות
- **Lazy Loading:** גרפים נוצרים רק לאחר טעינת הנתונים

---

## Responsive Design

הוויגיט תומך ב-responsive design:
- Desktop: 3 עמודות
- Tablet: 2 עמודות
- Mobile: עמודה אחת

---

## ניהול זיכרון

הוויגיט מנהל את כל הגרפים ב-`state.charts`:
- כל גרף נוצר עם ID ייחודי
- בעת `refresh()` או `destroy()`, כל הגרפים מושמדים

---

## תיעוד נוסף

- [WIDGETS_LIST.md](../../frontend/WIDGETS_LIST.md)
- [WIDGET_DEVELOPER_GUIDE.md](WIDGET_DEVELOPER_GUIDE.md)
- [TRADINGVIEW_WIDGETS_SYSTEM.md](../../02-ARCHITECTURE/FRONTEND/TRADINGVIEW_WIDGETS_SYSTEM.md)
- [TICKER_DASHBOARD_WIDGET_PROPOSAL.md](../../03-DEVELOPMENT/PLANS/TICKER_DASHBOARD_WIDGET_PROPOSAL.md)

---

**מקור:** `documentation/03-DEVELOPMENT/GUIDES/TICKER_CHART_WIDGET_DEVELOPER_GUIDE.md`  
**עודכן:** דצמבר 2025

