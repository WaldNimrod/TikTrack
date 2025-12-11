# מדריך מפתח - History Widget

## Developer Guide - History Widget

**תאריך עדכון אחרון:** 27 בינואר 2025  
**גרסה:** 2.0.0  
**סטטוס:** מוקאפ עם נתוני דמה

---

## סקירה כללית

History Widget הוא ווידג'ט מהיר לדשבורד המציג:

- מיני-גרף P/L שבועי (7 ימים)
- סטטיסטיקות מהירות (P/L היום, שינוי תיק, טריידים פעילים)
- קישורים מהירים לעמודי היסטוריה
- כפתור רענון

**מיקום קבצים:**

- HTML: `trading-ui/mockups/daily-snapshots/history-widget.html`
- JavaScript: `trading-ui/scripts/history-widget.js`
- קונפיגורציה: `trading-ui/scripts/page-initialization-configs.js`

---

## מבנה הקוד

### מבנה HTML

```html
<!-- History Widget Section -->
<div class="top-section" id="history_widget_top_section">
    <!-- Quick Links -->
    <div class="card mb-4">
        <div class="list-group" id="quickLinksContainer">
            <!-- Links -->
        </div>
    </div>
    
    <!-- Mini Chart -->
    <div class="card mb-4">
        <div id="weeklyPLChartContainer">
            <!-- Chart will be rendered here -->
        </div>
    </div>
    
    <!-- Quick Stats -->
    <div class="card mb-4">
        <div id="quickStatsContainer">
            <!-- Stats will be rendered here -->
        </div>
    </div>
</div>
```

### מבנה JavaScript

```javascript
// Global state
let weeklyPLChart = null;
let weeklyPLSeries = null;

// Main functions
- initializeHeader() - איתחול Header System
- initWeeklyPLChart() - יצירת מיני-גרף P/L שבועי
- updateQuickStats() - עדכון סטטיסטיקות מהירות
- setupQuickLinks() - הגדרת קישורים מהירים
- refreshWidget() - רענון כל הווידג'טים
- initializeWidgets() - איתחול כל הווידג'טים
```

---

## מערכות משולבות

### 1. TradingView Charts System

**קבצים:**

- `trading-ui/scripts/charts/vendor/lightweight-charts.standalone.production.js`
- `trading-ui/scripts/charts/tradingview-theme.js`
- `trading-ui/scripts/charts/tradingview-adapter.js`

**שימוש:**

```javascript
// יצירת גרף
weeklyPLChart = window.TradingViewChartAdapter.createChart(container, options);

// הוספת line series
weeklyPLSeries = window.TradingViewChartAdapter.addLineSeries(weeklyPLChart, options);

// הגדרת נתונים
weeklyPLSeries.setData(data);
```

**תיעוד:** `documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_LIGHTWEIGHT_CHARTS/`

### 2. Field Renderer Service

**קובץ:** `trading-ui/scripts/services/field-renderer-service.js`

**שימוש:**

```javascript
// רנדור ערך מספרי עם צבעים
window.FieldRendererService.renderNumericValue(value, suffix, showPrefix);
// דוגמה: renderNumericValue(500, '$', true) → "+$500.00"
```

**תיעוד:** `documentation/frontend/JAVASCRIPT_ARCHITECTURE.md`

### 3. Color Scheme System

**קובץ:** `trading-ui/scripts/color-scheme-system-clean.js`

**שימוש:**

```javascript
// קבלת צבע מ-CSS variable
getCSSVariableValue('--primary-color', '#26baac');
```

### 4. Notification System

**קובץ:** `trading-ui/scripts/notification-system.js`

**שימוש:**

```javascript
window.NotificationSystem.showSuccess('נתונים עודכנו', 'ווידג\'ט היסטוריה');
window.NotificationSystem.showError('שגיאה ברענון', 'לא ניתן לרענן את הנתונים');
window.NotificationSystem.showInfo('מרענן נתונים...', 'רענון ווידג\'ט היסטוריה');
```

### 5. Logger Service

**קובץ:** `trading-ui/scripts/logger-service.js`

**שימוש:**

```javascript
window.Logger.info('✅ Widget initialized', { page: 'history-widget' });
window.Logger.error('Error initializing widget', { page: 'history-widget', error });
window.Logger.warn('Warning message', { page: 'history-widget' });
```

### 6. Button System

**קבצים:**

- `trading-ui/scripts/button-system-init.js`
- `trading-ui/scripts/button-icons.js`

**שימוש ב-HTML:**

```html
<button data-button-type="REFRESH" 
        data-variant="small" 
        data-icon="🔄" 
        data-text="רענון" 
        data-onclick="window.historyWidget.refreshWidget()">
</button>
```

### 7. Icon System

**קבצים:**

- `trading-ui/scripts/icon-system.js`
- `trading-ui/scripts/icon-mappings.js`

**שימוש:**

```javascript
window.IconSystem.getIconPath('tabler', 'clock');
window.IconSystem.renderIcon('tabler', 'clock', { width: 16, height: 16 });
```

---

## ווידג'טים

### 1. מיני-גרף P/L שבועי

**מיקום:** `history-widget.html` שורות 129-138

**תיאור:**
גרף קטן (extra-small) המציג P/L שבועי (7 ימים) עם TradingView Lightweight Charts.

**נתוני דמה:**

```javascript
const weeklyPLData = [
    { time: '2025-01-20', value: 100 },  // Mon
    { time: '2025-01-21', value: 150 },  // Tue
    { time: '2025-01-22', value: 120 },  // Wed
    { time: '2025-01-23', value: 180 },  // Thu
    { time: '2025-01-24', value: 200 },  // Fri
    { time: '2025-01-25', value: 250 },  // Sat
    { time: '2025-01-26', value: 300 }   // Sun
];
```

**פונקציה:** `initWeeklyPLChart()`

**איך לעדכן נתונים:**

1. עדכן את `weeklyPLData` בפונקציה `initWeeklyPLChart()`
2. קרא ל-`weeklyPLSeries.setData(weeklyPLData)`
3. קרא ל-`weeklyPLChart.timeScale().fitContent()`

**איך לחבר לנתונים אמיתיים:**

```javascript
async function loadWeeklyPLData() {
    try {
        const response = await fetch('/api/portfolio/weekly-pl');
        const data = await response.json();
        
        const chartData = data.map(item => ({
            time: item.date,
            value: item.pl
        }));
        
        weeklyPLSeries.setData(chartData);
        weeklyPLChart.timeScale().fitContent();
    } catch (error) {
        window.Logger.error('Error loading weekly P/L data', { error });
    }
}
```

### 2. סטטיסטיקות מהירות

**מיקום:** `history-widget.html` שורות 142-160

**תיאור:**
3 סטטיסטיקות מהירות:

- P/L היום (עם FieldRendererService)
- שינוי שווי תיק (עם FieldRendererService)
- טריידים פעילים (מספר פשוט)

**נתוני דמה:**

```javascript
const stats = {
    dailyPL: 500,
    portfolioChange: 2.5,
    activeTrades: 5
};
```

**פונקציה:** `updateQuickStats()`

**איך לעדכן נתונים:**

1. עדכן את `stats` בפונקציה `updateQuickStats()`
2. הפונקציה תעדכן את DOM אוטומטית

**איך לחבר לנתונים אמיתיים:**

```javascript
async function loadQuickStats() {
    try {
        const response = await fetch('/api/dashboard/quick-stats');
        const data = await response.json();
        
        const stats = {
            dailyPL: data.dailyPL,
            portfolioChange: data.portfolioChange,
            activeTrades: data.activeTrades
        };
        
        updateQuickStats(stats);
    } catch (error) {
        window.Logger.error('Error loading quick stats', { error });
    }
}
```

### 3. קישורים מהירים

**מיקום:** `history-widget.html` שורות 111-126

**תיאור:**
3 קישורים מהירים לעמודי היסטוריה:

- מצב תיק אתמול → `portfolio-state-page.html`
- טריידים פעילים → `trade-history-page.html`
- שינויי מחיר היום → `price-history-page.html`

**פונקציה:** `setupQuickLinks()`

**איך להוסיף קישור חדש:**

1. הוסף קישור ב-HTML:

```html
<a href="new-page.html" class="list-group-item list-group-item-action" id="quickLinkNew">
    <img src="../../images/icons/tabler/icon-name.svg" width="16" height="16" alt="icon" class="icon"> טקסט קישור
</a>
```

2. הוסף event listener ב-`setupQuickLinks()`:

```javascript
const newLink = document.getElementById('quickLinkNew');
if (newLink) {
    newLink.addEventListener('click', () => {
        window.Logger.info('Quick link clicked: New Page', { page: 'history-widget' });
    });
}
```

### 4. כפתור רענון

**מיקום:** `history-widget.html` שורה 105

**תיאור:**
כפתור רענון המרענן את כל הווידג'טים.

**פונקציה:** `refreshWidget()`

**איך זה עובד:**

1. מציג הודעת מידע "מרענן נתונים..."
2. מרענן את הגרף (`initWeeklyPLChart()`)
3. מרענן את הסטטיסטיקות (`updateQuickStats()`)
4. מציג הודעת הצלחה "נתונים עודכנו"

---

## איך להוסיף ווידג'ט חדש

### שלב 1: הוסף HTML

```html
<div class="card mb-4">
    <div class="card-body">
        <h6 class="card-title">כותרת ווידג'ט</h6>
        <div id="newWidgetContainer">
            <!-- תוכן ווידג'ט -->
        </div>
    </div>
</div>
```

### שלב 2: הוסף פונקציה JavaScript

```javascript
function initNewWidget() {
    const container = document.getElementById('newWidgetContainer');
    if (!container) {
        if (window.Logger) {
            window.Logger.warn('New widget container not found', { page: 'history-widget' });
        }
        return;
    }
    
    try {
        // מימוש הווידג'ט
        // ...
        
        if (window.Logger) {
            window.Logger.info('✅ New widget initialized', { page: 'history-widget' });
        }
    } catch (error) {
        if (window.Logger) {
            window.Logger.error('Error initializing new widget', { 
                page: 'history-widget', 
                error 
            });
        }
    }
}
```

### שלב 3: הוסף לאיתחול

```javascript
async function initializeWidgets() {
    // ... קוד קיים ...
    
    // Initialize new widget
    await initNewWidget();
}
```

### שלב 4: הוסף לרענון

```javascript
async function refreshWidget() {
    // ... קוד קיים ...
    
    // Refresh new widget
    await initNewWidget();
}
```

### שלב 5: הוסף ל-export

```javascript
window.historyWidget = {
    // ... קוד קיים ...
    initNewWidget
};
```

---

## איך לעדכן נתוני דמה

### עדכון נתוני גרף

**קובץ:** `trading-ui/scripts/history-widget.js`  
**פונקציה:** `initWeeklyPLChart()`

```javascript
// מצא את השורה:
const weeklyPLData = [];

// עדכן את הנתונים:
const weeklyPLData = [
    { time: '2025-01-20', value: 100 },
    { time: '2025-01-21', value: 150 },
    // ... עוד נתונים
];
```

### עדכון סטטיסטיקות

**קובץ:** `trading-ui/scripts/history-widget.js`  
**פונקציה:** `updateQuickStats()`

```javascript
// מצא את השורה:
const stats = {
    dailyPL: 500,
    portfolioChange: 2.5,
    activeTrades: 5
};

// עדכן את הערכים:
const stats = {
    dailyPL: 750,        // עדכן P/L היום
    portfolioChange: 3.2, // עדכן שינוי תיק
    activeTrades: 8       // עדכן טריידים פעילים
};
```

---

## איך לחבר לנתונים אמיתיים

### שלב 1: יצירת API Endpoints

**Backend:** `Backend/routes/api/dashboard.py`

```python
@dashboard_bp.route('/weekly-pl', methods=['GET'])
def get_weekly_pl():
    # חישוב P/L שבועי
    # החזרת נתונים ב-format: [{date: 'YYYY-MM-DD', pl: number}, ...]
    pass

@dashboard_bp.route('/quick-stats', methods=['GET'])
def get_quick_stats():
    # חישוב סטטיסטיקות מהירות
    # החזרת נתונים ב-format: {dailyPL: number, portfolioChange: number, activeTrades: number}
    pass
```

### שלב 2: עדכון JavaScript

**קובץ:** `trading-ui/scripts/history-widget.js`

```javascript
// הוסף פונקציות טעינת נתונים:
async function loadWeeklyPLData() {
    try {
        const response = await fetch('/api/dashboard/weekly-pl');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const chartData = data.map(item => ({
            time: item.date,
            value: item.pl
        }));
        
        if (weeklyPLSeries) {
            weeklyPLSeries.setData(chartData);
            weeklyPLChart.timeScale().fitContent();
        }
    } catch (error) {
        window.Logger.error('Error loading weekly P/L data', { error });
        if (window.NotificationSystem) {
            window.NotificationSystem.showError('שגיאה בטעינת נתונים', 'לא ניתן לטעון נתוני P/L שבועי');
        }
    }
}

async function loadQuickStats() {
    try {
        const response = await fetch('/api/dashboard/quick-stats');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // עדכן את updateQuickStats לקבל פרמטר:
        updateQuickStats(data);
    } catch (error) {
        window.Logger.error('Error loading quick stats', { error });
        if (window.NotificationSystem) {
            window.NotificationSystem.showError('שגיאה בטעינת נתונים', 'לא ניתן לטעון סטטיסטיקות מהירות');
        }
    }
}

// עדכן את initializeWidgets:
async function initializeWidgets() {
    // ... קוד קיים ...
    
    // טען נתונים אמיתיים במקום נתוני דמה
    await loadWeeklyPLData();
    await loadQuickStats();
}

// עדכן את refreshWidget:
async function refreshWidget() {
    // ... קוד קיים ...
    
    // טען נתונים אמיתיים
    await loadWeeklyPLData();
    await loadQuickStats();
}
```

### שלב 3: שימוש במטמון (אופציונלי)

```javascript
async function loadWeeklyPLData() {
    try {
        // בדוק מטמון
        const cacheKey = 'dashboard-weekly-pl';
        const cached = await window.UnifiedCacheManager?.get(cacheKey);
        
        if (cached && !cached.expired) {
            // השתמש בנתונים מהמטמון
            const chartData = cached.data.map(item => ({
                time: item.date,
                value: item.pl
            }));
            
            if (weeklyPLSeries) {
                weeklyPLSeries.setData(chartData);
                weeklyPLChart.timeScale().fitContent();
            }
            return;
        }
        
        // טען מהשרת
        const response = await fetch('/api/dashboard/weekly-pl');
        const data = await response.json();
        
        // שמור במטמון
        if (window.UnifiedCacheManager) {
            await window.UnifiedCacheManager.save(cacheKey, data, {
                ttl: 5 * 60 * 1000 // 5 דקות
            });
        }
        
        // עדכן גרף
        const chartData = data.map(item => ({
            time: item.date,
            value: item.pl
        }));
        
        if (weeklyPLSeries) {
            weeklyPLSeries.setData(chartData);
            weeklyPLChart.timeScale().fitContent();
        }
    } catch (error) {
        window.Logger.error('Error loading weekly P/L data', { error });
    }
}
```

---

## אינטגרציה עם מערכת איתחול

**קובץ:** `trading-ui/scripts/page-initialization-configs.js`

**קונפיגורציה:**

```javascript
'history-widget': {
    packages: [
        'base',
        'services',
        'ui-advanced',
        'preferences',
        'tradingview-charts',  // ← הוסף package זה
        'init-system',
    ],
    requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'window.historyWidget',
        'window.TradingViewChartAdapter',  // ← הוסף
        'window.TradingViewTheme',         // ← הוסף
        'window.FieldRendererService',     // ← הוסף
    ],
    customInitializers: [
        async pageConfig => {
            // איתחול אוטומטי של הווידג'טים
            if (typeof window.historyWidget?.initializeWidgets === 'function') {
                await window.historyWidget.initializeWidgets();
            }
        },
    ],
}
```

---

## טיפול בשגיאות

כל הפונקציות כוללות טיפול בשגיאות עם:

1. **Logger Service** - רישום שגיאות
2. **Notification System** - הודעות למשתמש
3. **Fallback values** - ערכי ברירת מחדל

**דוגמה:**

```javascript
try {
    // קוד
} catch (error) {
    if (window.Logger) {
        window.Logger.error('Error message', { 
            page: 'history-widget', 
            error 
        });
    }
    if (window.NotificationSystem) {
        window.NotificationSystem.showError('שגיאה', 'תיאור שגיאה');
    }
}
```

---

## בדיקות

### בדיקות ידניות

1. **טעינת עמוד:**
   - פתח `http://localhost:8080/mockups/daily-snapshots/history-widget.html`
   - בדוק שאין שגיאות ב-console
   - בדוק שכל הווידג'טים מוצגים

2. **כפתור רענון:**
   - לחץ על כפתור רענון
   - בדוק שהגרף מתעדכן
   - בדוק שהסטטיסטיקות מתעדכנות
   - בדוק שהודעת הצלחה מוצגת

3. **קישורים מהירים:**
   - לחץ על כל קישור
   - בדוק שמוביל לעמוד הנכון

### בדיקות אוטומטיות

**קובץ:** `trading-ui/mockups/daily-snapshots/TESTING_CHECKLIST.md`

---

## תיעוד נוסף

- **JavaScript Architecture:** `documentation/frontend/JAVASCRIPT_ARCHITECTURE.md`
- **TradingView Charts:** `documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_LIGHTWEIGHT_CHARTS/`
- **Field Renderer Service:** `documentation/frontend/JAVASCRIPT_ARCHITECTURE.md`
- **Mockups Integration Status:** `trading-ui/mockups/daily-snapshots/MOCKUPS_INTEGRATION_STATUS.md`

---

**עדכון אחרון:** 27 בינואר 2025  
**מחבר:** TikTrack Development Team

