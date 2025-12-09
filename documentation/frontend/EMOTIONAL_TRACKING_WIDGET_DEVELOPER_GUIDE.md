# מדריך מפתח - Emotional Tracking Widget

## Developer Guide - Emotional Tracking Widget

**תאריך עדכון אחרון:** 29 בינואר 2025  
**גרסה:** 2.0.0  
**סטטוס:** מוקאפ עם נתוני דמה

---

## סקירה כללית

Emotional Tracking Widget הוא ווידג'ט לתיעוד רגשי המציג:

- גרף דפוסים רגשיים (Bar Chart)
- רשימת תיעודים אחרונים
- תובנות וניתוח דפוסים
- טופס תיעוד מהיר

**מיקום קבצים:**

- HTML: `trading-ui/mockups/daily-snapshots/emotional-tracking-widget.html`
- JavaScript: `trading-ui/scripts/emotional-tracking-widget.js`
- קונפיגורציה: `trading-ui/scripts/page-initialization-configs.js`

---

## מבנה הקוד

### מבנה HTML

```html
<!-- Emotional Tracking Widget Section -->
<div class="top-section" id="emotional_tracking_widget_top_section">
    <!-- Quick Emotional Entry -->
    <div class="card mb-4">
        <div class="card-body">
            <!-- Form for quick entry -->
        </div>
    </div>
    
    <!-- Emotional Patterns Chart -->
    <div class="card mb-4">
        <div id="emotionalPatternsChartContainer">
            <!-- Chart will be rendered here -->
        </div>
    </div>
    
    <!-- Recent Emotional Entries -->
    <div class="card mb-4">
        <div id="recentEntriesContainer">
            <!-- Entries will be rendered here -->
        </div>
    </div>
    
    <!-- Insights -->
    <div class="card mb-4">
        <div id="insightsContainer">
            <!-- Insights will be rendered here -->
        </div>
    </div>
</div>
```

### מבנה JavaScript

```javascript
// Global state
let emotionalPatternsChart = null;
let emotionalPatternsSeries = null;
let selectedEmotion = null;
let mockEmotionalEntries = [];

// Main functions
- initializeHeader() - איתחול Header System
- initEmotionalPatternsChart() - יצירת גרף דפוסים רגשיים
- updateRecentEntries() - עדכון רשימת תיעודים אחרונים
- updateInsights() - עדכון תובנות
- setupQuickEntryForm() - הגדרת טופס תיעוד מהיר
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
emotionalPatternsChart = window.TradingViewChartAdapter.createChart(container, options);

// הוספת bar series
emotionalPatternsSeries = window.TradingViewChartAdapter.addBarSeries(emotionalPatternsChart, options);

// הגדרת נתונים
emotionalPatternsSeries.setData(data);
```

**תיעוד:** `documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_LIGHTWEIGHT_CHARTS/`

### 2. Field Renderer Service

**קובץ:** `trading-ui/scripts/services/field-renderer-service.js`

**שימוש:**

```javascript
// רנדור תאריך
window.FieldRendererService.renderDate(date, true); // עם זמן
window.FieldRendererService.renderDate(date, false); // ללא זמן

// רנדור ערך מספרי עם צבעים
window.FieldRendererService.renderNumericValue(value, suffix, showPrefix);
```

**תיעוד:** `documentation/frontend/JAVASCRIPT_ARCHITECTURE.md`

### 3. Icon System

**קובץ:** `trading-ui/scripts/icon-system.js`

**שימוש:**

```javascript
// רנדור אייקון
window.IconSystem.renderIcon('tabler', 'check', { width: 16, height: 16 });

// קבלת נתיב אייקון
window.IconSystem.getIconPath('tabler', 'check');
```

### 4. Color Scheme System

**קובץ:** `trading-ui/scripts/color-scheme-system-clean.js`

**שימוש:**

```javascript
// קבלת צבע מ-CSS variable
getCSSVariableValue('--primary-color', '#26baac');
getCSSVariableValue('--text-color', '#212529');
getCSSVariableValue('--card-background', '#ffffff');
getCSSVariableValue('--border-color', '#e0e0e0');
```

### 5. Notification System

**קובץ:** `trading-ui/scripts/notification-system.js`

**שימוש:**

```javascript
window.NotificationSystem.showSuccess('תיעוד נשמר בהצלחה', 'תיעוד רגשי');
window.NotificationSystem.showError('שגיאה בשמירה', 'לא ניתן לשמור את התיעוד');
window.NotificationSystem.showInfo('מעדכן נתונים...', 'תיעוד רגשי');
```

### 6. Logger Service

**קובץ:** `trading-ui/scripts/logger-service.js`

**שימוש:**

```javascript
window.Logger.info('✅ Widget initialized', { page: 'emotional-tracking-widget' });
window.Logger.error('Error initializing widget', { page: 'emotional-tracking-widget', error });
window.Logger.warn('Warning message', { page: 'emotional-tracking-widget' });
```

### 7. Button System

**קבצים:**

- `trading-ui/scripts/button-system-init.js`
- `trading-ui/scripts/button-icons.js`

**שימוש ב-HTML:**

```html
<button data-button-type="ADD" 
        data-variant="small" 
        data-text="הוסף תיעוד" 
        title="הוסף תיעוד רגשי חדש">
</button>
```

### 8. date-utils

**קובץ:** `trading-ui/scripts/date-utils.js`

**שימוש:**

```javascript
// פורמט תאריך
window.dateUtils.formatDate(date, { includeTime: true });
window.dateUtils.formatDateTime(date);

// המרה ל-Date object
window.dateUtils.toDateObject({ epochMs: timestamp });
```

---

## ווידג'טים

### 1. גרף דפוסים רגשיים

**מיקום:** `emotional-tracking-widget.html` שורות 156-167

**תיאור:**
גרף Bar Chart המציג התפלגות רגשות לאורך זמן (7 ימים) עם TradingView Lightweight Charts.

**נתוני דמה:**

```javascript
const emotionData = [
    { time: '2025-01-20', open: 0, high: 3, low: 0, close: 3 },
    { time: '2025-01-21', open: 0, high: 5, low: 0, close: 5 },
    // ...
];
```

**פונקציה:** `initEmotionalPatternsChart()`

**איך לעדכן נתונים:**

1. עדכן את `generateEmotionChartData()` בפונקציה `initEmotionalPatternsChart()`
2. קרא ל-`emotionalPatternsSeries.setData(emotionData)`
3. קרא ל-`emotionalPatternsChart.timeScale().fitContent()`

**איך לחבר לנתונים אמיתיים:**

```javascript
async function loadEmotionalPatternsData() {
    try {
        const response = await fetch('/api/emotional-entries/chart-data');
        const data = await response.json();
        
        const chartData = data.map(item => ({
            time: item.date,
            open: 0,
            high: item.count,
            low: 0,
            close: item.count
        }));
        
        emotionalPatternsSeries.setData(chartData);
        emotionalPatternsChart.timeScale().fitContent();
    } catch (error) {
        window.Logger.error('Error loading emotional patterns data', { error });
    }
}
```

### 2. רשימת תיעודים אחרונים

**מיקום:** `emotional-tracking-widget.html` שורות 169-206

**תיאור:**
רשימה של 10-20 תיעודים אחרונים עם תאריך, רגש, וקישור לטרייד (אם קיים).

**נתוני דמה:**

```javascript
const entries = [
    {
        id: 1,
        emotion_type: 'satisfied',
        emotion_display: 'מרוצה',
        recorded_at: '2025-01-15T14:30:00Z',
        notes: 'טרייד מוצלח',
        trade_id: 123,
        trade_display: 'Trade #123 - AAPL',
        has_trade_link: true
    },
    // ...
];
```

**פונקציה:** `updateRecentEntries()`

**איך לעדכן נתונים:**

1. עדכן את `generateMockEmotionalEntries()` בפונקציה `updateRecentEntries()`
2. הפונקציה תעדכן את DOM אוטומטית

**איך לחבר לנתונים אמיתיים:**

```javascript
async function loadRecentEntries() {
    try {
        const response = await fetch('/api/emotional-entries/recent?limit=10');
        const data = await response.json();
        
        updateRecentEntries(data);
    } catch (error) {
        window.Logger.error('Error loading recent entries', { error });
    }
}
```

### 3. תובנות

**מיקום:** `emotional-tracking-widget.html` שורות 208-221

**תיאור:**
2-3 תובנות (info + warning) על דפוסים רגשיים.

**נתוני דמה:**

```javascript
const insights = [
    {
        type: 'insight',
        severity: 'info',
        title: 'תובנה',
        message: 'אתה נוטה להיות מרוצה יותר בטריידים עם תוכנית (70% מהמקרים).',
        icon: 'info-circle'
    },
    {
        type: 'pattern',
        severity: 'warning',
        title: 'דפוס',
        message: 'רמת מתח גבוהה יותר בטריידים של יום (day trading).',
        icon: 'alert-triangle'
    }
];
```

**פונקציה:** `updateInsights()`

**איך לעדכן נתונים:**

1. עדכן את `generateMockInsights()` בפונקציה `updateInsights()`
2. הפונקציה תעדכן את DOM אוטומטית

**איך לחבר לנתונים אמיתיים:**

```javascript
async function loadInsights() {
    try {
        const response = await fetch('/api/emotional-entries/insights');
        const data = await response.json();
        
        updateInsights(data);
    } catch (error) {
        window.Logger.error('Error loading insights', { error });
    }
}
```

### 4. טופס תיעוד מהיר

**מיקום:** `emotional-tracking-widget.html` שורות 110-154

**תיאור:**
טופס מהיר ליצירת תיעוד רגשי חדש עם:

- בחירת רגש (7 כפתורים)
- קישור לטרייד (אופציונלי)
- הערות (אופציונלי)

**פונקציה:** `setupQuickEntryForm()`

**איך להוסיף רגש חדש:**

1. הוסף ל-`EMOTION_TYPES`:

```javascript
const EMOTION_TYPES = {
    // ... existing emotions
    new_emotion: { he: 'רגש חדש', icon: 'icon-name', color: '#HEX' }
};
```

2. הוסף כפתור ב-HTML:

```html
<button class="btn btn-outline-secondary emotion-button" data-emotion="new_emotion">
    <span class="emotion-icon"></span> רגש חדש
</button>
```

**איך לחבר לנתונים אמיתיים:**

```javascript
async function handleSaveEmotion() {
    const data = {
        emotion_type: selectedEmotion,
        trade_id: tradeSelect.value || null,
        notes: notesTextarea.value.trim() || null
    };

    try {
        const response = await fetch('/api/emotional-entries/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            window.NotificationSystem.showSuccess('תיעוד נשמר בהצלחה', 'תיעוד רגשי');
            // Reload data
            updateRecentEntries();
            updateEmotionalPatternsChart();
        } else {
            window.NotificationSystem.showError('שגיאה בשמירה', 'לא ניתן לשמור את התיעוד');
        }
    } catch (error) {
        window.Logger.error('Error saving emotion', { error });
        window.NotificationSystem.showError('שגיאה בשמירה', 'לא ניתן לשמור את התיעוד');
    }
}
```

---

## סוגי רגשות

המערכת תומכת ב-7 סוגי רגשות:

| ערך (English) | תרגום (Hebrew) | אייקון | צבע |
|--------------|----------------|--------|-----|
| `happy` | שמח | `check` | `#4CAF50` |
| `satisfied` | מרוצה | `check` | `#8BC34A` |
| `neutral` | ניטרלי | `minus` | `#9E9E9E` |
| `sad` | עצוב | `x` | `#2196F3` |
| `angry` | כועס | `alert-triangle` | `#F44336` |
| `confused` | מבולבל | `info-circle` | `#FF9800` |
| `stressed` | מתוח | `bolt` | `#E91E63` |

**הערה:** האייקונים הם מ-Tabler Icons (fallback) - אין אייקונים ייעודיים לרגשות במערכת.

---

## אינטגרציה עם מערכות

### 1. Page Initialization System

**קובץ:** `trading-ui/scripts/page-initialization-configs.js`

**קונפיגורציה:**

```javascript
'emotional-tracking-widget': {
    packages: [
        'base',
        'services',
        'ui-advanced',
        'preferences',
        'tradingview-charts',
        'init-system',
    ],
    requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'TradingViewChartAdapter',
        'TradingViewTheme',
        'window.LightweightCharts',
        'FieldRendererService',
    ],
    // ...
}
```

### 2. Cache System

**הערה:** למוקאפ - לא משתמשים במטמון. בעת חיבור ל-API אמיתי, יש להשתמש ב-`UnifiedCacheManager`:

```javascript
// בעתיד - כאשר יש API
const cacheKey = 'emotional-entries-recent';
const cached = await window.UnifiedCacheManager.get(cacheKey);
if (cached) {
    updateRecentEntries(cached);
} else {
    const data = await fetch('/api/emotional-entries/recent');
    await window.UnifiedCacheManager.save(cacheKey, data);
    updateRecentEntries(data);
}
```

---

## דוגמאות קוד

### יצירת תיעוד חדש

```javascript
// בחירת רגש
selectedEmotion = 'happy';

// שמירה
handleSaveEmotion();
```

### עדכון גרף

```javascript
// עדכון נתונים
const newData = generateEmotionChartData();
emotionalPatternsSeries.setData(newData);
emotionalPatternsChart.timeScale().fitContent();
```

### עדכון רשימת תיעודים

```javascript
// עדכון עם נתונים חדשים
const newEntries = generateMockEmotionalEntries();
updateRecentEntries(newEntries);
```

---

## טיפים וטריקים

1. **טעינת גרף:** הגרף נטען אוטומטית ב-`initializeWidgets()`. אם יש בעיה, בדוק ש-`TradingViewChartAdapter` זמין.

2. **אייקונים:** האייקונים משתמשים ב-IconSystem עם fallback ל-Tabler Icons. אם אייקון לא נמצא, יוצג `info-circle`.

3. **תאריכים:** כל התאריכים משתמשים ב-`FieldRendererService.renderDate()` או `dateUtils.formatDateTime()` לפורמט אחיד.

4. **צבעים:** כל הצבעים משתמשים ב-`getCSSVariableValue()` לקבלת צבעים דינמיים מהעדפות משתמש.

5. **הודעות:** כל ההודעות משתמשות ב-`NotificationSystem` להודעות אחידות.

---

## בעיות נפוצות

### הגרף לא נטען

**פתרון:**

1. בדוק ש-`TradingViewChartAdapter` זמין: `typeof window.TradingViewChartAdapter !== 'undefined'`
2. בדוק ש-`LightweightCharts` נטען: `typeof window.LightweightCharts !== 'undefined'`
3. בדוק את ה-console לשגיאות

### אייקונים לא מוצגים

**פתרון:**

1. בדוק ש-`IconSystem` זמין: `typeof window.IconSystem !== 'undefined'`
2. בדוק שהאייקון קיים ב-Tabler Icons
3. Fallback ל-`info-circle` אם האייקון לא נמצא

### תאריכים לא מוצגים

**פתרון:**

1. בדוק ש-`FieldRendererService` זמין: `typeof window.FieldRendererService !== 'undefined'`
2. בדוק ש-`dateUtils` זמין: `typeof window.dateUtils !== 'undefined'`
3. Fallback ל-`toLocaleString()` אם המערכות לא זמינות

---

## שלבים עתידיים

כאשר המערכת תתחבר ל-API אמיתי:

1. **Backend Integration:**
   - יצירת טבלת `emotional_entries`
   - יצירת מודל `EmotionalEntry`
   - יצירת Service `EmotionalEntryService`
   - יצירת API Routes

2. **Frontend Integration:**
   - יצירת Frontend Service
   - עדכון כל הפונקציות לחיבור ל-API
   - הוספת מטמון עם `UnifiedCacheManager`

3. **Business Logic:**
   - חישוב תובנות
   - ניתוח דפוסים
   - קורלציות

**תיעוד:** `documentation/frontend/EMOTIONAL_TRACKING_IMPLEMENTATION_SPEC.md`

---

**תאריך עדכון אחרון:** 29 בינואר 2025  
**גרסה:** 2.0.0

