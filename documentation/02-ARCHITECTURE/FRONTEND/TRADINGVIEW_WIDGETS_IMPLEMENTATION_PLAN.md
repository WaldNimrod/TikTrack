# תוכנית מימוש - מערכת TradingView Widgets

**תאריך יצירה:** 24 נובמבר 2025  
**מטרה:** יצירת מערכת מרכזית לניהול כל הווידג'טים הרשמיים של TradingView עם אינטגרציה מלאה למערכות האתר

---

## מטרה

יצירת תשתית מרכזית לניהול כל הווידג'טים של TradingView עם אינטגרציה מלאה למערכות האתר: איתחול, צבעים דינמיים, responsive design, וניטור.

---

## שלב 1: יצירת חבילה חדשה במערכת האיתחול

### 1.1 עדכון package-manifest.js

**קובץ:** `trading-ui/scripts/init-system/package-manifest.js`

**הוספת package חדש:**

```javascript
'tradingview-widgets': {
  id: 'tradingview-widgets',
  name: 'TradingView Widgets Package',
  description: 'מערכת מרכזית לניהול ווידג'טים של TradingView',
  version: '1.0.0',
  critical: false,
  loadOrder: 5,
  dependencies: ['base', 'preferences', 'color-scheme'],
  scripts: [
    {
      file: 'tradingview-widgets/tradingview-widgets-core.js',
      globalCheck: 'window.TradingViewWidgetsManager',
      description: 'מערכת ניהול מרכזית לווידג'טים',
      required: true,
      loadOrder: 1
    },
    {
      file: 'tradingview-widgets/tradingview-widgets-config.js',
      globalCheck: 'window.TradingViewWidgetsConfig',
      description: 'הגדרות ווידג'טים',
      required: true,
      loadOrder: 2
    },
    {
      file: 'tradingview-widgets/tradingview-widgets-colors.js',
      globalCheck: 'window.TradingViewWidgetsColors',
      description: 'אינטגרציה עם מערכת הצבעים',
      required: true,
      loadOrder: 3
    },
    {
      file: 'tradingview-widgets/tradingview-widgets-factory.js',
      globalCheck: 'window.TradingViewWidgetsFactory',
      description: 'Factory ליצירת ווידג'טים',
      required: true,
      loadOrder: 4
    }
  ]
}
```

### 1.2 עדכון page-initialization-configs.js

**קובץ:** `trading-ui/scripts/page-initialization-configs.js`

**הוספת tradingview-widgets לעמודים רלוונטיים:**

- `price-history-page` (mockup)
- `tradingview-widgets-showcase` (עמוד דוגמה)
- עמודים נוספים שישתמשו בווידג'טים

**דוגמה:**

```javascript
'price-history-page': {
  packages: ['base', 'preferences', 'color-scheme', 'tradingview-widgets'],
  requiredGlobals: ['TradingViewWidgetsManager', 'TradingViewWidgetsColors']
}
```

---

## שלב 2: יצירת קבצי Core System

### 2.1 tradingview-widgets-core.js

**תפקיד:** מערכת ניהול מרכזית

**פונקציות עיקריות:**

- `init()` - אתחול המערכת
- `createWidget(config)` - יצירת ווידג'ט
- `updateWidget(widgetId, updates)` - עדכון ווידג'ט
- `destroyWidget(widgetId)` - הרס ווידג'ט
- `getWidget(widgetId)` - קבלת ווידג'ט
- `getAllWidgets()` - קבלת כל הווידג'טים
- `refreshAllWidgets()` - רענון כל הווידג'טים
- `applyTheme(theme)` - החלת theme
- `applyLocale(locale)` - החלת locale
- `handleResize()` - טיפול ב-resize events

**אינטגרציה:**

- ממתין לטעינת `TradingView` library
- ממתין לטעינת העדפות (`window.currentPreferences`)
- ממתין לטעינת מערכת הצבעים (`window.TradingViewWidgetsColors`)
- ממתין לטעינת Factory (`window.TradingViewWidgetsFactory`)

**API:**

```javascript
window.TradingViewWidgetsManager = {
    init: async function() {},
    createWidget: function(config) {},
    updateWidget: function(widgetId, updates) {},
    destroyWidget: function(widgetId) {},
    getWidget: function(widgetId) {},
    getAllWidgets: function() {},
    refreshAllWidgets: function() {},
    applyTheme: function(theme) {},
    applyLocale: function(locale) {},
    handleResize: function() {}
}
```

### 2.2 tradingview-widgets-config.js

**תפקיד:** הגדרות ווידג'טים

**תוכן:**

- הגדרות ברירת מחדל לכל סוג ווידג'ט
- **סקריפט יחיד:** כל הווידג'טים משתמשים ב-`https://s3.tradingview.com/tv.js` (לא צריך טעינה דינמית)
- פרמטרים נדרשים לכל סוג
- תיעוד פרמטרים
- בדיקת תמיכה ב-RTL (לפי תיעוד רשמי)

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

**טעינת ספריות:**

- **סקריפט יחיד:** כל הווידג'טים משתמשים ב-`https://s3.tradingview.com/tv.js`
- **טעינה סטטית:** הסקריפט נטען פעם אחת ב-HTML (לא טעינה דינמית)
- **ביצועים:** טעינה אחת חוסכת זמן ומשפרת ביצועים
- **קוד פשוט:** אין צורך בניהול טעינה דינמית של סקריפטים

**מבנה:**

```javascript
window.TradingViewWidgetsConfig = {
    // סקריפט יחיד לכל הווידג'טים
    WIDGET_SCRIPT: 'https://s3.tradingview.com/tv.js',
    
    WIDGET_TYPES: {
        'advanced-chart': {
            defaultConfig: { /* ... */ },
            requiredParams: ['symbol'],
            supportsRTL: false, // לבדוק בתיעוד הרשמי
            responsive: true
        },
        // ... כל 11 הווידג'טים
    },
    getConfig: function(widgetType) {},
    validateConfig: function(widgetType, config) {}
}
```

### 2.3 tradingview-widgets-colors.js

**תפקיד:** אינטגרציה עם מערכת הצבעים הדינמית

**פונקציות:**

- `getChartColors()` - קבלת צבעים מהעדפות
- `getWidgetColorConfig(widgetType)` - קבלת קונפיגורציית צבעים לווידג'ט
- `applyColorsToWidget(widget, colors)` - החלת צבעים על ווידג'ט
- `watchColorChanges(callback)` - מעקב אחר שינויי צבעים
- `updateAllWidgetsColors()` - עדכון צבעים לכל הווידג'טים

**מפתחות צבעים מהעדפות:**

- `chartPrimaryColor` → `--chart-primary-color` → `#26baac` (fallback)
- `chartSecondaryColor` → `--chart-secondary-color` → `#fc5a06` (fallback)
- `chartBackgroundColor` → `--chart-background-color`
- `chartTextColor` → `--chart-text-color`
- `chartGridColor` → `--chart-grid-color`
- `chartBorderColor` → `--chart-border-color`
- `chartPointColor` → `--chart-point-color`

**Fallback Chain:**

```
העדפות משתמש → CSS variables → צבעי ישויות → ברירות מחדל
```

**צבעי הלוגו:**

- Primary: `#26baac` (Turquoise-Green)
- Secondary: `#fc5a06` (Orange-Red)

**API:**

```javascript
window.TradingViewWidgetsColors = {
    getChartColors: function() {},
    getWidgetColorConfig: function(widgetType) {},
    applyColorsToWidget: function(widget, colors) {},
    watchColorChanges: function(callback) {},
    updateAllWidgetsColors: function() {}
}
```

### 2.4 tradingview-widgets-factory.js

**תפקיד:** Factory ליצירת ווידג'טים

**פונקציות:**

- `createAdvancedChart(config)` - יצירת Advanced Chart
- `createSymbolOverview(config)` - יצירת Symbol Overview
- `createMiniChart(config)` - יצירת Mini Chart
- `createTickerTape(config)` - יצירת Ticker Tape
- `createMarketOverview(config)` - יצירת Market Overview
- `createMarketQuotes(config)` - יצירת Market Quotes
- `createEconomicCalendar(config)` - יצירת Economic Calendar
- `createFinancials(config)` - יצירת Financials
- `createScreener(config)` - יצירת Screener
- `createHeatmap(config)` - יצירת Heatmap
- `createSymbolProfile(config)` - יצירת Symbol Profile
- `createWidget(widgetType, config)` - Factory method כללי

**כל פונקציה:**

- בודקת פרמטרים נדרשים
- טוענת צבעים דינמיים
- יוצרת את הווידג'ט עם הפרמטרים
- מחזירה instance של הווידג'ט
- תומכת ב-responsive design

**API:**

```javascript
window.TradingViewWidgetsFactory = {
    createWidget: function(widgetType, config) {},
    createAdvancedChart: function(config) {},
    createSymbolOverview: function(config) {},
    // ... כל 11 הווידג'טים
}
```

---

## שלב 3: הוספת `chartSecondaryColor` להעדפות המשתמש

### 3.1 יצירת Migration

**קובץ:** `Backend/migrations/add_chart_secondary_color_preference.py`

**תוכן:**

```python
#!/usr/bin/env python3
"""
Add chartSecondaryColor Preference
===================================

This script adds chartSecondaryColor preference to the preference_types table.

Author: TikTrack Development Team
Date: November 2025
"""

import sqlite3
import os
from datetime import datetime

def add_chart_secondary_color_preference():
    """Add chartSecondaryColor preference to preference_types table"""
    
    # Database path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, "..", "db", "simpleTrade_new.db")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("📊 Adding chartSecondaryColor preference...")
        
        # Get chart_colors group
        cursor.execute("SELECT id FROM preference_groups WHERE group_name = 'chart_colors'")
        chart_colors_group = cursor.fetchone()
        
        if not chart_colors_group:
            print("❌ chart_colors group not found. Please run add_chart_preferences.py first.")
            return False
        
        chart_colors_group_id = chart_colors_group[0]
        
        # Check if preference already exists
        cursor.execute("SELECT id FROM preference_types WHERE preference_name = 'chartSecondaryColor'")
        if cursor.fetchone():
            print("⚠️  chartSecondaryColor already exists, skipping")
            return True
        
        # Insert new preference
        cursor.execute("""
            INSERT INTO preference_types 
            (group_id, data_type, preference_name, description, default_value, is_required, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            chart_colors_group_id,
            'color',
            'chartSecondaryColor',
            'Secondary color for charts (Orange-Red from logo)',
            '#fc5a06',
            0,
            1,
            datetime.now(),
            datetime.now()
        ))
        
        conn.commit()
        print("✅ Added chartSecondaryColor preference")
        
        return True
        
    except Exception as e:
        print(f"❌ Error adding chartSecondaryColor preference: {e}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    add_chart_secondary_color_preference()
```

### 3.2 עדכון preferences-colors.js

**קובץ:** `trading-ui/scripts/preferences-colors.js`

**שינויים:**

- הוספת `chartSecondaryColor` ל-`colorKeys.chart`
- הוספת `chartSecondaryColor: '#fc5a06'` ל-`defaultColors`

### 3.3 עדכון ממשק העדפות

**קובץ:** `trading-ui/preferences.html`

**שינויים:**

- הוספת שדה `chartSecondaryColor` לסקשן צבעי גרפים
- הוספת color picker עם ערך ברירת מחדל `#fc5a06`

---

## שלב 4: אינטגרציה עם מערכת הצבעים הדינמית

### 4.1 חיבור למערכת העדפות

**מקורות צבעים:**

- `window.currentPreferences` - העדפות נוכחיות
- `window.userPreferences` - העדפות משתמש
- CSS variables (`--chart-primary-color`, `--chart-secondary-color`, וכו')
- צבעי ישויות (entity colors)

**האזנה לשינויים:**

- האזנה ל-`preferences:all-loaded` event
- האזנה לשינויי CSS variables
- עדכון אוטומטי של כל הווידג'טים בעת שינוי צבעים

### 4.2 מיפוי צבעים

**מיפוי מפתחות צבעים מהעדפות לפרמטרי ווידג'טים:**

- `chartPrimaryColor` → `colorTheme.palette` → `#26baac` (Turquoise-Green)
- `chartSecondaryColor` → `colorTheme.palette` → `#fc5a06` (Orange-Red)
- `chartBackgroundColor` → `theme` → `light/dark`
- `chartTextColor` → `colorTheme.text`
- `chartGridColor` → `colorTheme.grid`
- `chartBorderColor` → `colorTheme.border`
- `chartPointColor` → `colorTheme.point`

**תמיכה ב-theme:**

- `light` - theme בהיר
- `dark` - theme כהה
- אוטומטי מהעדפות המשתמש

**תמיכה בצבעי ישויות:**

- אם יש צבע ישות (entity color) - להשתמש בו
- אם לא - להשתמש בצבעי הלוגו

**Fallback Chain:**

```
העדפות משתמש → CSS variables → צבעי ישויות → צבעי לוגו → ברירות מחדל
```

---

## שלב 5: ניהול Container IDs

### 5.1 Container ייחודי לכל ווידג'ט

**החלטה:** כל ווידג'ט חייב `containerId` ייחודי

**יתרונות:**

- ✅ **בידוד מלא:** כל ווידג'ט עובד באופן עצמאי
- ✅ **ניהול קל:** קל לזהות ולנהל כל ווידג'ט בנפרד
- ✅ **מניעת התנגשויות:** אין סיכון של התנגשות בין ווידג'טים
- ✅ **תמיכה ב-multiple widgets:** אפשר להציג מספר ווידג'טים באותו עמוד
- ✅ **ניקוי קל:** קל להרוס ווידג'ט ספציפי בלי להשפיע על אחרים
- ✅ **Debugging:** קל לזהות בעיות ספציפיות לווידג'ט

**חסרונות:**

- ⚠️ **ניהול IDs:** צריך לוודא שכל ID ייחודי
- ⚠️ **קוד נוסף:** צריך ליצור ID אוטומטי אם לא מסופק

**פתרון:**

- יצירת ID אוטומטי אם לא מסופק: `tradingview-widget-${Date.now()}-${Math.random()}`
- בדיקת ייחודיות לפני יצירת ווידג'ט
- שמירת מיפוי `containerId` → `widgetInstance` במערכת

**דוגמה:**

```javascript
// אם containerId לא מסופק, נוצר אוטומטית
const widgetId = config.containerId || `tradingview-widget-${Date.now()}-${Math.random()}`;

// בדיקת ייחודיות
if (this.widgets.has(widgetId)) {
    throw new Error(`Widget with containerId "${widgetId}" already exists`);
}
```

---

## שלב 6: תמיכה ב-Responsive Design (חובה)

### 6.1 ניהול גודל

**כל ווידג'ט:**

- חייב להיות בתוך container עם `width: 100%`
- תמיכה ב-`autosize: true` (ברירת מחדל)
- תמיכה ב-resize events
- תמיכה ב-`height` דינמי

**פרמטרים:**

```javascript
{
    autosize: true,
    width: "100%",
    height: 500, // או דינמי
    responsive: true
}
```

### 6.2 CSS Classes

**הוספת classes ל-containers:**

- `tradingview-widget-container` - container ראשי
- `tradingview-widget-responsive` - responsive wrapper
- תמיכה ב-Bootstrap responsive classes
- תמיכה ב-media queries

**CSS:**

```css
.tradingview-widget-container {
    width: 100%;
    position: relative;
}

.tradingview-widget-responsive {
    width: 100%;
    height: auto;
}

@media (max-width: 768px) {
    .tradingview-widget-container {
        height: 400px;
    }
}
```

### 6.3 JavaScript Resize Handling

**פונקציות:**

- `handleResize(widgetId)` - טיפול ב-resize
- `updateWidgetSize(widgetId, width, height)` - עדכון גודל
- `debounceResize()` - debounce ל-resize events
- `setupResizeObserver()` - MutationObserver ל-resize

**אינטגרציה:**

- האזנה ל-`window.resize` event
- האזנה ל-`MutationObserver` לשינויים ב-DOM
- עדכון אוטומטי של כל הווידג'טים בעת resize

---

## שלב 7: בדיקת תמיכה ב-RTL

### 7.1 בדיקת תיעוד רשמי (לפני המימוש)

**לבדוק בתיעוד TradingView:**

- האם יש פרמטר `rtl` או `direction`
- האם יש תמיכה ב-`locale: 'he'` עם RTL
- האם יש CSS classes ל-RTL
- האם יש תמיכה ב-RTL בכל הווידג'טים

### 7.2 מימוש (אם נתמך)

**אם נתמך:**

- הוספת `rtl: true` או `direction: 'rtl'` לפרמטרים
- עדכון CSS containers ל-RTL
- בדיקת תצוגה נכונה
- תיעוד במערכת

**אם לא נתמך:**

- תיעוד במסמך שהתכונה לא נתמכת
- הערה בקוד שלא ניתן להשתמש ב-RTL
- הצגת הודעה למשתמש (אם רלוונטי)

---

## שלב 8: עדכון עמוד הדוגמה

### 8.1 עדכון tradingview-widgets-showcase.html

**שינויים:**

- החלפת כל הקוד הישיר ב-`TradingViewWidgetsManager`
- שימוש ב-API המרכזי
- הוספת ממשק בדיקה
- הוספת controls לשינוי פרמטרים
- הוספת תצוגת מידע על צבעים והעדפות

**דוגמה:**

```javascript
// במקום:
new TradingView.widget({
    // ...
});

// נשתמש ב:
window.TradingViewWidgetsManager.createWidget({
    type: 'advanced-chart',
    containerId: 'widget-container',
    config: {
        symbol: 'NASDAQ:AAPL',
        // ...
    }
});
```

### 8.2 ממשק בדיקה

**תכונות:**

- בחירת סוג ווידג'ט (dropdown)
- טופס לשינוי פרמטרים (symbol, theme, locale, וכו')
- כפתור "רינדור מחדש"
- תצוגת קונפיגורציה נוכחית (JSON)
- תצוגת צבעים פעילים
- תצוגת העדפות
- בדיקת responsive (resize window)
- בדיקת RTL (אם נתמך)

**UI:**

```html
<div class="widget-test-controls">
    <select id="widget-type-select">
        <option value="advanced-chart">Advanced Chart</option>
        <!-- ... כל 11 הווידג'טים -->
    </select>
    <input type="text" id="symbol-input" placeholder="Symbol (e.g., NASDAQ:AAPL)">
    <select id="theme-select">
        <option value="light">Light</option>
        <option value="dark">Dark</option>
    </select>
    <button id="render-btn">רינדור מחדש</button>
    <button id="refresh-colors-btn">רענון צבעים</button>
</div>
<div id="widget-info">
    <h3>קונפיגורציה נוכחית:</h3>
    <pre id="config-display"></pre>
    <h3>צבעים פעילים:</h3>
    <pre id="colors-display"></pre>
</div>
```

---

## שלב 9: עדכון עמוד price-history-page.html

### 9.1 הוספת ווידג'ט בנוסף (לא החלפה)

**שינויים:**

- **שמירה על הגרף הקיים:** הגרף הקיים (Lightweight Charts) נשאר במקומו
- **הוספת ווידג'ט חדש:** הוספת TradingView Widget (Charting Library) בסקשן נפרד
- **שימוש ב-API המרכזי:** הווידג'ט החדש משתמש ב-`TradingViewWidgetsManager`
- **אינטגרציה עם בחירת טיקרים:** שני הגרפים מתעדכנים יחד

**מבנה HTML:**

```html
<!-- סקשן חדש - TradingView Widget -->
<div class="content-section" id="tradingview-widget-section">
    <h2>TradingView Charting Library Widget</h2>
    <div class="tradingview-widget-container">
        <div id="tradingview_chart_widget" style="height: 500px; width: 100%;"></div>
    </div>
</div>

<!-- סקשן קיים - Lightweight Charts -->
<div class="content-section" id="price-chart-section">
    <h2>Price Chart (Lightweight Charts)</h2>
    <!-- ... קוד קיים ... -->
</div>
```

**דוגמה:**

```javascript
// הוספת ווידג'ט חדש (בנוסף לגרף הקיים)
window.TradingViewWidgetsManager.createWidget({
    type: 'advanced-chart',
    containerId: 'tradingview_chart_widget',
    config: {
        symbol: symbol,
        autosize: true,
        // ...
    }
});

// הגרף הקיים נשאר כפי שהוא
// initPriceChart() - נשאר ללא שינוי
```

---

## שלב 10: תיעוד

### 10.1 מסמך ארכיטקטורה

**קובץ:** `documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_WIDGETS_SYSTEM.md`

**תוכן:**

- סקירה כללית
- ארכיטקטורה
- API Reference
- דוגמאות שימוש
- אינטגרציה עם מערכות אחרות
- פתרון בעיות נפוצות

### 10.2 מדריך מפתח

**קובץ:** `documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_WIDGETS_DEVELOPER_GUIDE.md`

**תוכן:**

- איך ליצור ווידג'ט חדש
- איך לעדכן ווידג'ט
- איך להשתמש בצבעים דינמיים
- דוגמאות קוד
- Best practices

---

## קבצים ליצירה/עדכון

### קבצים חדשים:

1. `trading-ui/scripts/tradingview-widgets/tradingview-widgets-core.js`
2. `trading-ui/scripts/tradingview-widgets/tradingview-widgets-config.js`
3. `trading-ui/scripts/tradingview-widgets/tradingview-widgets-colors.js`
4. `trading-ui/scripts/tradingview-widgets/tradingview-widgets-factory.js`
5. `Backend/migrations/add_chart_secondary_color_preference.py` - הוספת העדפה חדשה
6. `documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_WIDGETS_SYSTEM.md`
7. `documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_WIDGETS_DEVELOPER_GUIDE.md`

### קבצים לעדכון:

1. `trading-ui/scripts/init-system/package-manifest.js` - הוספת package
2. `trading-ui/scripts/page-initialization-configs.js` - הוספת ל-pages
3. `trading-ui/scripts/preferences-colors.js` - הוספת `chartSecondaryColor`
4. `trading-ui/preferences.html` - הוספת שדה `chartSecondaryColor` בממשק
5. `trading-ui/tradingview-widgets-showcase.html` - עדכון לשימוש ב-Core
6. `trading-ui/mockups/daily-snapshots/price-history-page.html` - הוספת ווידג'ט (בנוסף לגרף הקיים)

---

## קריטריוני הצלחה

1. ✅ כל הווידג'טים עובדים דרך המערכת המרכזית
2. ✅ כל הצבעים דינמיים מהעדפות המשתמש (חובה)
3. ✅ תמיכה מלאה ב-responsive design (חובה)
4. ✅ אינטגרציה מלאה עם מערכת האיתחול (מוניטור ותיעוד)
5. ✅ תיעוד מלא למפתחים
6. ✅ ממשק בדיקה פונקציונלי
7. ✅ בדיקת תמיכה ב-RTL (אם נתמך רשמית)

---

## הערות חשובות

1. **צבעים דינמיים (חובה):** כל הצבעים חייבים להיות משתנים דינמיים מהעדפות המשתמש, עם fallback chain: העדפות → CSS variables → צבעי ישויות → צבעי לוגו → ברירות מחדל
2. **`chartSecondaryColor` (חובה):** הוספת העדפה חדשה `chartSecondaryColor` עם ערך ברירת מחדל `#fc5a06` (Orange-Red מהלוגו)
3. **טעינת ספריות:** כל הווידג'טים משתמשים בסקריפט יחיד `https://s3.tradingview.com/tv.js` - טעינה סטטית (לא דינמית) לביצועים טובים וקוד פשוט
4. **Container IDs:** כל ווידג'ט חייב `containerId` ייחודי - יצירת ID אוטומטי אם לא מסופק
5. **Responsive Design (חובה):** כל הווידג'טים חייבים להיות responsive עם `autosize: true` ו-`width: "100%"`
6. **RTL:** לבדוק בתיעוד הרשמי של TradingView לפני המימוש - רק אם נתמך רשמית
7. **אין Cache:** ווידג'טים לא נשמרים במטמון (לפי דרישת המשתמש)
8. **ניטור:** כל פעולה מתועדת דרך `window.Logger` (אם קיים)
9. **אינטגרציה עם מערכת האיתחול:** חובה - כל הווידג'טים חייבים להיות חלק ממערכת האיתחול עם מוניטור ותיעוד
10. **price-history-page:** הוספת ווידג'ט בנוסף לגרף הקיים (Lightweight Charts) - לא החלפה

---

## סדר ביצוע מומלץ

1. **הוספת העדפה חדשה:**
   - יצירת migration: `add_chart_secondary_color_preference.py`
   - הרצת migration
   - עדכון `preferences-colors.js`
   - עדכון `preferences.html` (ממשק)

2. **בדיקת תמיכה ב-RTL בתיעוד הרשמי** (לפני המימוש)

3. **יצירת Core System:**
   - יצירת package ב-package-manifest.js
   - יצירת tradingview-widgets-config.js (כל 11 הווידג'טים, סקריפט יחיד)
   - יצירת tradingview-widgets-colors.js (אינטגרציה עם צבעים, כולל `chartSecondaryColor`)
   - יצירת tradingview-widgets-factory.js (יצירת IDs אוטומטית)
   - יצירת tradingview-widgets-core.js

4. **עדכון עמודים:**
   - עדכון עמוד הדוגמה (`tradingview-widgets-showcase.html`)
   - עדכון `price-history-page.html` (הוספת ווידג'ט בנוסף לגרף הקיים)

5. **כתיבת תיעוד:**
   - מסמך ארכיטקטורה
   - מדריך מפתח

---

**תאריך עדכון אחרון:** 24 נובמבר 2025

