# TradingView Widgets System - Architecture Documentation

**תאריך יצירה:** 24 נובמבר 2025  
**גרסה:** 1.0.0  
**מטרה:** מערכת מרכזית לניהול כל הווידג'טים הרשמיים של TradingView

---

## סקירה כללית

מערכת TradingView Widgets היא תשתית מרכזית לניהול כל 11 הווידג'טים הרשמיים של TradingView עם אינטגרציה מלאה למערכות האתר:

- **אינטגרציה עם מערכת האיתחול** - טעינה אוטומטית דרך package-manifest.js
- **אינטגרציה עם מערכת הצבעים הדינמית** - צבעים מהעדפות המשתמש
- **תמיכה ב-Responsive Design** - התאמה אוטומטית לגודל המסך
- **ניהול מרכזי** - יצירה, עדכון, והרס של ווידג'טים
- **יצירת IDs אוטומטית** - מניעת התנגשויות

---

## ארכיטקטורה

### מבנה הקבצים

```
trading-ui/scripts/tradingview-widgets/
├── tradingview-widgets-config.js      # הגדרות לכל 11 הווידג'טים
├── tradingview-widgets-colors.js       # אינטגרציה עם מערכת הצבעים
├── tradingview-widgets-factory.js     # Factory ליצירת ווידג'טים
└── tradingview-widgets-core.js         # מערכת ניהול מרכזית
```

### תלויות

- **base** - מערכות ליבה (Logger, NotificationSystem)
- **preferences** - מערכת העדפות (לקריאת צבעים ו-theme)

---

## רכיבי המערכת

### 1. TradingViewWidgetsConfig

**קובץ:** `tradingview-widgets-config.js`

**תפקיד:** הגדרות ברירת מחדל לכל 11 הווידג'טים

**פונקציות עיקריות:**
- `getConfig(widgetType)` - קבלת הגדרות לווידג'ט מסוים
- `validateConfig(widgetType, config)` - ולידציה של קונפיגורציה
- `getAvailableTypes()` - קבלת רשימת כל סוגי הווידג'טים
- `supportsRTL(widgetType)` - בדיקה אם ווידג'ט תומך ב-RTL

**11 סוגי ווידג'טים:**
1. `advanced-chart` - Advanced Real-Time Chart
2. `symbol-overview` - Symbol Overview
3. `mini-chart` - Mini Chart
4. `ticker-tape` - Ticker Tape
5. `market-overview` - Market Overview
6. `market-quotes` - Market Quotes
7. `economic-calendar` - Economic Calendar
8. `financials` - Financials
9. `screener` - Screener
10. `heatmap` - Heatmap
11. `symbol-profile` - Symbol Profile

### 2. TradingViewWidgetsColors

**קובץ:** `tradingview-widgets-colors.js`

**תפקיד:** אינטגרציה עם מערכת הצבעים הדינמית

**Fallback Chain:**
1. העדפות משתמש (`window.currentPreferences`)
2. ColorManager cache
3. CSS variables
4. Entity colors
5. Logo colors (final fallback)

**פונקציות עיקריות:**
- `getChartColors()` - קבלת צבעי גרפים מהעדפות
- `getWidgetColorConfig(widgetType, userColors)` - קבלת קונפיגורציית צבעים לווידג'ט
- `watchColorChanges(callback)` - מעקב אחר שינויי צבעים
- `getTheme()` - קבלת theme נוכחי
- `getLocale()` - קבלת locale נוכחי

**מפתחות צבעים:**
- `chartPrimaryColor` → Primary color (`#26baac`)
- `chartSecondaryColor` → Secondary color (`#fc5a06`)
- `chartBackgroundColor` → Background
- `chartTextColor` → Text
- `chartGridColor` → Grid
- `chartBorderColor` → Border
- `chartPointColor` → Points

### 3. TradingViewWidgetsFactory

**קובץ:** `tradingview-widgets-factory.js`

**תפקיד:** Factory ליצירת ווידג'טים עם יצירת IDs אוטומטית

**פונקציות עיקריות:**
- `generateContainerId(prefix)` - יצירת ID ייחודי
- `ensureUniqueContainerId(containerId)` - וידוא ייחודיות ID
- `releaseContainerId(containerId)` - שחרור ID
- `createWidget(widgetType, config)` - יצירת ווידג'ט (גנרי)
- `createAdvancedChart(config)` - יצירת Advanced Chart
- `createSymbolOverview(config)` - יצירת Symbol Overview
- ... (פונקציות לכל 11 הווידג'טים)

**יצירת IDs אוטומטית:**
- אם `containerId` לא מסופק, נוצר אוטומטית
- פורמט: `{prefix}-{timestamp}-{random}`
- מניעת התנגשויות עם registry פנימי

### 4. TradingViewWidgetsManager

**קובץ:** `tradingview-widgets-core.js`

**תפקיד:** מערכת ניהול מרכזית לכל הווידג'טים

**פונקציות עיקריות:**
- `init()` - אתחול המערכת (ממתין לתלויות)
- `createWidget(config)` - יצירת ווידג'ט חדש
- `updateWidget(widgetId, updates)` - עדכון ווידג'ט (משחזר עם קונפיגורציה חדשה)
- `destroyWidget(widgetId)` - הרס ווידג'ט
- `getWidget(widgetId)` - קבלת ווידג'ט
- `getAllWidgets()` - קבלת כל הווידג'טים
- `refreshAllWidgets()` - רענון כל הווידג'טים
- `applyTheme(theme)` - החלת theme על כל הווידג'טים
- `applyLocale(locale)` - החלת locale על כל הווידג'טים
- `handleResize()` - טיפול ב-resize events
- `getStats()` - סטטיסטיקות על הווידג'טים

**ניהול Lifecycle:**
- Registry פנימי (`_widgets` Map) - מעקב אחר כל הווידג'טים
- ResizeObserver - מעקב אחר שינויי גודל
- Color watchers - עדכון אוטומטי בעת שינוי צבעים

---

## אינטגרציה עם מערכות האתר

### 1. מערכת האיתחול

**Package:** `tradingview-widgets`

**Dependencies:** `base`, `preferences`

**Load Order:** 21

**קבצים:**
1. `tradingview-widgets-config.js` (loadOrder: 1)
2. `tradingview-widgets-colors.js` (loadOrder: 2)
3. `tradingview-widgets-factory.js` (loadOrder: 3)
4. `tradingview-widgets-core.js` (loadOrder: 4)

**עמודים מוגדרים:**
- `tradingview-widgets-showcase` - עמוד showcase
- `price-history-page` - עמוד היסטוריית מחירים

### 2. מערכת הצבעים

**אינטגרציה:**
- קריאת צבעים מ-`window.currentPreferences`
- Fallback ל-CSS variables
- עדכון אוטומטי בעת שינוי צבעים

**מפתחות צבעים:**
- `chartPrimaryColor` - צבע ראשי (`#26baac`)
- `chartSecondaryColor` - צבע משני (`#fc5a06`)
- `chartBackgroundColor` - רקע
- `chartTextColor` - טקסט
- `chartGridColor` - רשת
- `chartBorderColor` - גבול
- `chartPointColor` - נקודות

### 3. Responsive Design

**תמיכה:**
- `autosize: true` (ברירת מחדל) - התאמה אוטומטית
- ResizeObserver - מעקב אחר שינויי גודל
- Debounce של resize events (150ms)

---

## דוגמאות שימוש

### יצירת ווידג'ט בסיסי

```javascript
// יצירת Advanced Chart
const widget = window.TradingViewWidgetsManager.createWidget({
    type: 'advanced-chart',
    containerId: 'my-chart-container',
    config: {
        symbol: 'NASDAQ:AAPL',
        interval: 'D',
        height: 600
    }
});
```

### יצירת ווידג'ט עם ID אוטומטי

```javascript
// ID ייווצר אוטומטית
const widget = window.TradingViewWidgetsManager.createWidget({
    type: 'symbol-overview',
    config: {
        symbols: [{ proName: 'NASDAQ:AAPL', title: 'Apple Inc.' }]
    }
});
```

### עדכון ווידג'ט

```javascript
// עדכון סמל (משחזר את הווידג'ט)
window.TradingViewWidgetsManager.updateWidget('my-chart-container', {
    symbol: 'NASDAQ:MSFT'
});
```

### הרס ווידג'ט

```javascript
window.TradingViewWidgetsManager.destroyWidget('my-chart-container');
```

### רענון כל הווידג'טים

```javascript
// משחזר את כל הווידג'טים עם צבעים/theme נוכחיים
window.TradingViewWidgetsManager.refreshAllWidgets();
```

---

## הערות חשובות

### 1. TradingView Widgets לא תומכים בעדכון דינמי

**בעיה:** TradingView widgets לא תומכים בעדכון צבעים/theme אחרי יצירה

**פתרון:** `updateWidget()` משחזר את הווידג'ט עם קונפיגורציה חדשה

### 2. RTL Support

**סטטוס:** לא נתמך רשמית על ידי TradingView

**פתרון:** המערכת לא מנסה להחיל RTL, אבל תומכת ב-`locale: 'he'`

### 3. Responsive Design

**תמיכה:** כל הווידג'טים תומכים ב-`autosize: true` (ברירת מחדל)

**התנהגות:** הווידג'טים מתאימים את עצמם אוטומטית לגודל הקונטיינר

### 4. יצירת IDs

**אוטומטית:** אם `containerId` לא מסופק, נוצר אוטומטית

**פורמט:** `tradingview-widget-{timestamp}-{random}`

**ייחודיות:** המערכת מטפלת במניעת התנגשויות

---

## קבצים קשורים

- **תוכנית מימוש:** `documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_WIDGETS_IMPLEMENTATION_PLAN.md`
- **מדריך מפתח:** `documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_WIDGETS_DEVELOPER_GUIDE.md`
- **Package Manifest:** `trading-ui/scripts/init-system/package-manifest.js`
- **Page Configs:** `trading-ui/scripts/page-initialization-configs.js`

---

## גרסה

**1.0.0** - 24 נובמבר 2025
- יצירת מערכת Core
- תמיכה ב-11 ווידג'טים
- אינטגרציה עם מערכת הצבעים
- אינטגרציה עם מערכת האיתחול

