# TradingView Widgets - Developer Guide

**תאריך יצירה:** 24 נובמבר 2025  
**גרסה:** 1.0.0  
**מטרה:** מדריך מפתח לשימוש במערכת TradingView Widgets

---

## התחלה מהירה

### 1. הוספת Package לעמוד

**עדכון `page-initialization-configs.js`:**

```javascript
'my-page': {
    name: 'My Page',
    packages: ['base', 'preferences', 'tradingview-widgets', 'init-system'],
    requiredGlobals: [
        'NotificationSystem',
        'TradingViewWidgetsManager',
        'TradingViewWidgetsColors'
    ],
    // ...
}
```

### 2. יצירת ווידג'ט בסיסי

```javascript
// בדיקה שהמערכת נטענה
if (!window.TradingViewWidgetsManager) {
    console.error('TradingViewWidgetsManager not loaded');
    return;
}

// אתחול (אם לא כבר מאותחל)
await window.TradingViewWidgetsManager.init();

// יצירת ווידג'ט
const widget = window.TradingViewWidgetsManager.createWidget({
    type: 'advanced-chart',
    containerId: 'my-chart',
    config: {
        symbol: 'NASDAQ:AAPL',
        interval: 'D',
        height: 600
    }
});
```

---

## סוגי ווידג'טים

### 1. Advanced Chart

**שימוש:** גרף מלא עם כל הפיצ'רים

```javascript
const widget = window.TradingViewWidgetsManager.createWidget({
    type: 'advanced-chart',
    containerId: 'advanced-chart-container',
    config: {
        symbol: 'NASDAQ:AAPL',
        interval: 'D',
        timezone: 'Asia/Jerusalem',
        height: 600
    }
});
```

**פרמטרים נדרשים:**

- `symbol` - סמל המניה (פורמט: EXCHANGE:SYMBOL)
- `container_id` - מזהה קונטיינר

### 2. Symbol Overview

**שימוש:** גרף קטן + מידע בסיסי

```javascript
const widget = window.TradingViewWidgetsManager.createWidget({
    type: 'symbol-overview',
    containerId: 'symbol-overview-container',
    config: {
        symbols: [{
            proName: 'NASDAQ:AAPL',
            title: 'Apple Inc.'
        }],
        height: 400
    }
});
```

**פרמטרים נדרשים:**

- `symbols` - מערך של סמלים
- `container_id` - מזהה קונטיינר

### 3. Mini Chart

**שימוש:** גרף קטן בלבד

```javascript
const widget = window.TradingViewWidgetsManager.createWidget({
    type: 'mini-chart',
    containerId: 'mini-chart-container',
    config: {
        symbol: 'NASDAQ:AAPL',
        height: 220
    }
});
```

### 4. Ticker Tape

**שימוש:** פס גלילה עם מחירים

```javascript
const widget = window.TradingViewWidgetsManager.createWidget({
    type: 'ticker-tape',
    containerId: 'ticker-tape-container',
    config: {
        symbols: [
            { proName: 'NASDAQ:AAPL', title: 'Apple' },
            { proName: 'NASDAQ:MSFT', title: 'Microsoft' }
        ]
    }
});
```

### 5. Market Overview

**שימוש:** סקירה כללית של השווקים

```javascript
const widget = window.TradingViewWidgetsManager.createWidget({
    type: 'market-overview',
    containerId: 'market-overview-container',
    config: {
        tabs: [
            {
                title: 'מניות',
                symbols: [
                    { s: 'FOREXCOM:SPXUSD', d: 'S&P 500' }
                ],
                originalTitle: 'Indices'
            }
        ],
        height: 600
    }
});
```

### 6. Market Quotes

**שימוש:** רשימת נכסים + שינוי יומי

```javascript
const widget = window.TradingViewWidgetsManager.createWidget({
    type: 'market-quotes',
    containerId: 'market-quotes-container',
    config: {
        symbolsGroups: [
            {
                name: 'מניות',
                originalName: 'Indices',
                symbols: [
                    { name: 'NASDAQ:AAPL', displayName: 'Apple' }
                ]
            }
        ],
        height: 600
        }
});
```

### 7. Economic Calendar

**שימוש:** לוח אירועים כלכליים

```javascript
const widget = window.TradingViewWidgetsManager.createWidget({
    type: 'economic-calendar',
    containerId: 'economic-calendar-container',
    config: {
        height: 600,
        importanceFilter: '-1,0,1'
    }
});
```

### 8. Financials

**שימוש:** נתונים פיננסיים

```javascript
const widget = window.TradingViewWidgetsManager.createWidget({
    type: 'financials',
    containerId: 'financials-container',
    config: {
        symbol: 'NASDAQ:AAPL',
        height: 600
    }
});
```

### 9. Screener

**שימוש:** מסנן מניות

```javascript
const widget = window.TradingViewWidgetsManager.createWidget({
    type: 'screener',
    containerId: 'screener-container',
    config: {
        screener_type: 'stock_market',
        displayCurrency: 'USD',
        height: 600
    }
});
```

### 10. Heatmap

**שימוש:** מפת חום של השוק

```javascript
const widget = window.TradingViewWidgetsManager.createWidget({
    type: 'heatmap',
    containerId: 'heatmap-container',
    config: {
        exchanges: ['NYSE', 'NASDAQ'],
        dataSource: 'SPX500',
        grouping: 'sector',
        blockSize: 'market_cap',
        blockColor: 'change'
    }
});
```

### 11. Symbol Profile

**שימוש:** פרופיל מלא של החברה

```javascript
const widget = window.TradingViewWidgetsManager.createWidget({
    type: 'symbol-profile',
    containerId: 'symbol-profile-container',
    config: {
        symbol: 'NASDAQ:AAPL',
        height: 600
    }
});
```

---

## עבודה עם צבעים

### קבלת צבעים מהעדפות

```javascript
// קבלת כל צבעי הגרפים
const colors = window.TradingViewWidgetsColors.getChartColors();
console.log(colors.primary); // #26baac
console.log(colors.secondary); // #fc5a06

// קבלת קונפיגורציית צבעים לווידג'ט
const colorConfig = window.TradingViewWidgetsColors.getWidgetColorConfig('advanced-chart');
```

### מעקב אחר שינויי צבעים

```javascript
window.TradingViewWidgetsColors.watchColorChanges((colors) => {
    console.log('Colors changed:', colors);
    // רענון הווידג'טים עם צבעים חדשים
    window.TradingViewWidgetsManager.refreshAllWidgets();
});
```

---

## ניהול Lifecycle

### יצירת ווידג'ט

```javascript
// עם ID ידוע
const widget = window.TradingViewWidgetsManager.createWidget({
    type: 'advanced-chart',
    containerId: 'my-chart',
    config: { symbol: 'NASDAQ:AAPL' }
});

// עם ID אוטומטי
const widget = window.TradingViewWidgetsManager.createWidget({
    type: 'advanced-chart',
    config: { symbol: 'NASDAQ:AAPL' }
});
// ID ייווצר: tradingview-widget-{timestamp}-{random}
```

### עדכון ווידג'ט

```javascript
// עדכון משחזר את הווידג'ט עם קונפיגורציה חדשה
window.TradingViewWidgetsManager.updateWidget('my-chart', {
    symbol: 'NASDAQ:MSFT',
    interval: '1H'
});
```

### הרס ווידג'ט

```javascript
window.TradingViewWidgetsManager.destroyWidget('my-chart');
```

### קבלת מידע על ווידג'ט

```javascript
// קבלת ווידג'ט ספציפי
const widget = window.TradingViewWidgetsManager.getWidget('my-chart');

// קבלת כל הווידג'טים
const allWidgets = window.TradingViewWidgetsManager.getAllWidgets();

// סטטיסטיקות
const stats = window.TradingViewWidgetsManager.getStats();
console.log(stats.total); // מספר הווידג'טים
console.log(stats.byType); // פילוח לפי סוג
```

---

## טיפול בשגיאות

### בדיקת זמינות

```javascript
if (!window.TradingViewWidgetsManager) {
    console.error('TradingViewWidgetsManager not loaded');
    return;
}

if (!window.TradingViewWidgetsManager._initialized) {
    await window.TradingViewWidgetsManager.init();
}
```

### טיפול בשגיאות יצירה

```javascript
try {
    const widget = window.TradingViewWidgetsManager.createWidget({
        type: 'advanced-chart',
        containerId: 'my-chart',
        config: { symbol: 'NASDAQ:AAPL' }
    });
} catch (error) {
    console.error('Failed to create widget:', error);
    if (window.NotificationSystem) {
        window.NotificationSystem.showError('שגיאה', 'שגיאה ביצירת ווידג'ט');
    }
}
```

### ולידציה של קונפיגורציה

```javascript
const validation = window.TradingViewWidgetsConfig.validateConfig('advanced-chart', {
    symbol: 'NASDAQ:AAPL',
    container_id: 'my-chart'
});

if (!validation.valid) {
    console.error('Invalid config:', validation.errors);
    return;
}
```

---

## דוגמאות מתקדמות

### יצירת מספר ווידג'טים

```javascript
const symbols = ['NASDAQ:AAPL', 'NASDAQ:MSFT', 'NASDAQ:GOOGL'];
const widgets = [];

symbols.forEach((symbol, index) => {
    const widget = window.TradingViewWidgetsManager.createWidget({
        type: 'mini-chart',
        containerId: `mini-chart-${index}`,
        config: {
            symbol: symbol,
            height: 220
        }
    });
    widgets.push(widget);
});
```

### עדכון כל הווידג'טים

```javascript
// עדכון theme
window.TradingViewWidgetsManager.applyTheme('dark');

// עדכון locale
window.TradingViewWidgetsManager.applyLocale('en');

// רענון כל הווידג'טים
window.TradingViewWidgetsManager.refreshAllWidgets();
```

### אינטגרציה עם בחירת טיקר

```javascript
const tickerSelect = document.getElementById('tickerSelect');
tickerSelect.addEventListener('change', (e) => {
    const symbol = `NASDAQ:${e.target.value}`;
    
    // עדכון ווידג'ט
    window.TradingViewWidgetsManager.updateWidget('my-chart', {
        symbol: symbol
    });
});
```

---

## Best Practices

### 1. תמיד אתחל את המערכת

```javascript
if (!window.TradingViewWidgetsManager._initialized) {
    await window.TradingViewWidgetsManager.init();
}
```

### 2. השתמש ב-IDs ייחודיים

```javascript
// טוב - ID ייחודי
const widget = window.TradingViewWidgetsManager.createWidget({
    type: 'advanced-chart',
    containerId: `chart-${Date.now()}`,
    config: { symbol: 'NASDAQ:AAPL' }
});

// טוב - ID אוטומטי
const widget = window.TradingViewWidgetsManager.createWidget({
    type: 'advanced-chart',
    config: { symbol: 'NASDAQ:AAPL' }
});
```

### 3. נקה ווידג'טים בעת יציאה

```javascript
// לפני יציאה מהעמוד
window.addEventListener('beforeunload', () => {
    const widgets = window.TradingViewWidgetsManager.getAllWidgets();
    widgets.forEach(widget => {
        window.TradingViewWidgetsManager.destroyWidget(widget.containerId);
    });
});
```

### 4. השתמש ב-NotificationSystem לשגיאות

```javascript
try {
    const widget = window.TradingViewWidgetsManager.createWidget({...});
} catch (error) {
    if (window.NotificationSystem) {
        window.NotificationSystem.showError('שגיאה', 'שגיאה ביצירת ווידג'ט');
    }
}
```

---

## פתרון בעיות

### ווידג'ט לא מופיע

1. בדוק שהקונטיינר קיים ב-DOM
2. בדוק שהמערכת מאותחלת
3. בדוק את הקונסול לשגיאות

### צבעים לא מתעדכנים

1. TradingView widgets לא תומכים בעדכון דינמי
2. השתמש ב-`refreshAllWidgets()` לרענון

### שגיאת ID כפול

1. המערכת מטפלת בזה אוטומטית
2. אם עדיין יש בעיה, בדוק ש-`destroyWidget()` נקרא

---

## קבצים קשורים

- **תיעוד ארכיטקטורה:** `documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_WIDGETS_SYSTEM.md`
- **תוכנית מימוש:** `documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_WIDGETS_IMPLEMENTATION_PLAN.md`
- **דוגמאות:** `trading-ui/tradingview_widgets_showcase.html`

---

## גרסה

**1.0.0** - 24 נובמבר 2025

- מדריך מפתח מלא
- דוגמאות לכל 11 הווידג'טים
- Best practices
- פתרון בעיות

