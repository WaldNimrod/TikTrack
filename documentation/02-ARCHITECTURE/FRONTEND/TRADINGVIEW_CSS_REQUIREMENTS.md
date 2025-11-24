# TradingView Lightweight Charts - דרישות CSS

**תאריך יצירה:** ינואר 2025  
**תאריך עדכון אחרון:** ינואר 2025  
**מטרה:** תיעוד מקיף של דרישות CSS עבור TradingView Lightweight Charts במערכת TikTrack

**⚠️ חשוב מאוד:** לפני שילוב גרף TradingView בעמוד חדש, יש לקרוא את המסמך הזה במלואו ולעקוב אחר המבנה המומלץ בדיוק.

**📝 עדכון אחרון:** כל הגרפים במערכת עודכנו למבנה הסטנדרטי עם `chart-container-wrapper` ו-`chart-controls-wrapper` (ינואר 2025).

**📝 עדכון אחרון:** כל הגרפים במערכת עודכנו למבנה הסטנדרטי עם `chart-container-wrapper` ו-`chart-controls-wrapper` (ינואר 2025).

---

## דרישות Container

### Container Element (הקונטיינר עצמו)

הקונטיינר של TradingView Lightweight Charts **חייב** להיות עם התכונות הבאות:

1. **`display: block`** (חובה)
   - לא `inline`, לא `inline-block`, לא `flex`
   - TradingView דורש `display: block` על הקונטיינר

2. **`width: 100%`** (חובה)
   - או width מוגדר בפיקסלים
   - לא `auto`, לא `fit-content`

3. **`height` מוגדר** (חובה)
   - לא `auto`, לא `0`
   - חייב להיות ערך מוגדר (px, %, vh, וכו')

4. **`position: relative`** (אם יש overlays)
   - נדרש אם יש toolbars, drawing canvas, או overlays אחרים

5. **`box-sizing: border-box`**
   - מומלץ מאוד לעבודה נכונה עם padding/border

6. **`min-width: 0`**
   - פותר בעיות flex layout
   - מומלץ מאוד

### Wrapper Element (ה-wrapper שמכיל את הקונטיינר)

ה-wrapper **יכול** להיות flex/grid, אבל חייב:

1. **`position: relative`**
   - נדרש אם יש overlays

2. **`width: 100%`**
   - חייב להיות 100% רוחב

3. **`height` מוגדר**
   - אם ה-wrapper מגדיר את הגובה

4. **`min-width: 0`**
   - פותר בעיות flex layout

5. **`box-sizing: border-box`**
   - מומלץ מאוד

### Section Layout

אם הקונטיינר בתוך section עם flex layout:

1. **`.section-body` חייב להיות `display: block`** (לא flex)
   - הקונטיינר עצמו חייב להיות block

2. **`.section-body` חייב להיות עם `width: 100%`**

3. **`.section-body` חייב להיות עם `overflow: hidden`**
   - מונע overflow issues

---

## מבנה HTML נדרש

### מבנה בסיסי (ללא Section)

```html
<div class="tradingview-chart-wrapper" id="price-chart-wrapper">
    <div class="tradingview-chart-container tradingview-price-chart-container" id="price-chart-container"></div>
</div>
```

### מבנה עם Section (מומלץ - תבנית סטנדרטית)

**⚠️ חשוב מאוד:** זהו המבנה הנכון והמומלץ לשילוב גרף TradingView בעמוד. יש לעקוב אחריו בדיוק.

```html
<div class="content-section" id="price-chart-section">
    <!-- Section Header - רק כותרת וכפתור toggle (סגנונות סטנדרטיים) -->
    <div class="section-header">
        <h2><img src="../../images/icons/tabler/chart-line.svg" width="16" height="16" alt="chart-line" class="icon"> גרף מחירים לאורך זמן</h2>
        <div class="header-actions">
            <button class="filter-toggle-btn" onclick="toggleSection('price-chart-section')" title="הצג/הסתר סקשן">
                <span class="section-toggle-icon">▼</span>
            </button>
        </div>
    </div>
    
    <!-- Section Body - קונטיינר ראשי אחיד (padding: 4px מכל צד) -->
    <div class="section-body">
        <!-- Chart Controls (LTR, בתוך section-body, מעל הגרף) -->
        <div class="chart-controls-wrapper" style="direction: ltr; text-align: left;">
            <div class="chart-controls-container">
                <!-- Row 1: Time Range & Chart Type -->
                <div class="chart-controls-row">
                    <!-- כפתורי בקרה -->
                </div>
                <!-- Row 2: Other Controls -->
                <div class="chart-controls-row">
                    <!-- כפתורי בקרה נוספים -->
                </div>
            </div>
        </div>
        
        <!-- Chart Container Wrapper (קונטיינר ייעודי לגרף) -->
        <div class="chart-container-wrapper">
            <div class="tradingview-chart-wrapper" id="price-chart-wrapper">
                <!-- Indicators Toolbar (אופציונלי) -->
                <div id="indicators-toolbar" class="chart-toolbar chart-toolbar-right">
                    <!-- Toolbar content -->
                </div>
                
                <!-- Drawing Tools Toolbar (אופציונלי) -->
                <div id="drawing-tools-toolbar" class="chart-toolbar chart-toolbar-left">
                    <!-- Toolbar content -->
                </div>
                
                <!-- Drawing Canvas Overlay (אופציונלי) -->
                <canvas id="drawing-canvas"></canvas>
                
                <!-- Chart Container - כאן יוצג הגרף -->
                <div class="tradingview-chart-container tradingview-price-chart-container" id="price-chart-container"></div>
            </div>
        </div>
        
        <!-- אפשר להוסיף אלמנטים נוספים כאן (מתחת לגרף) -->
    </div>
</div>
```

### כללי שילוב חשובים

**1. Section Header:**
- ✅ **חייב** להכיל רק את הכותרת (`<h2>`) וכפתור ה-toggle
- ❌ **אסור** לכלול כפתורי בקרה של הגרף בתוך `section-header`
- ✅ משתמש בסגנונות הסטנדרטיים של המערכת (אין סגנונות מיוחדים)

**2. Section Body:**
- ✅ **חייב** להיות קונטיינר ראשי אחיד - נשאר אחיד לכל הקונטיינרים במערכת
- ✅ מקבל `padding: 4px` מכל צד (מוגדר אוטומטית ב-CSS)
- ✅ יכול להכיל גם אלמנטים נוספים מעל או מתחת לגרף

**3. Chart Controls Wrapper:**
- ✅ **חייב** להיות בתוך `section-body` - **מעל** `chart-container-wrapper`
- ✅ **חייב** להיות עם `direction: ltr` ו-`text-align: left` (inline style)
- ✅ מקבל `margin-bottom: 4px` (ריווח בין הכפתורים לגרף)

**4. Chart Container Wrapper:**
- ✅ **חייב** להיות בתוך `section-body` - **מתחת** ל-`chart-controls-wrapper`
- ✅ **חייב** להיות עם `direction: ltr` ו-`text-align: left` (מוגדר ב-CSS)
- ✅ תופס 100% רוחב אבל יושב בתוך `section-body`

**5. TradingView Chart Wrapper & Container:**
- ✅ **חייב** להיות בתוך `chart-container-wrapper`
- ✅ **חייב** להיות עם `direction: ltr` (מוגדר ב-CSS)
- ✅ **חייב** להיות עם `display: block`, `width: 100%`, `height` מוגדר

### דוגמה מלאה - Price Chart עם Volume

```html
<div class="content-section" id="price-chart-section">
    <div class="section-header">
        <h2><img src="../../images/icons/tabler/chart-line.svg" width="16" height="16" alt="chart-line" class="icon"> גרף מחירים לאורך זמן</h2>
        <div class="header-actions">
            <button class="filter-toggle-btn" onclick="toggleSection('price-chart-section')" title="הצג/הסתר סקשן">
                <span class="section-toggle-icon">▼</span>
            </button>
        </div>
    </div>
    <div class="section-body">
        <!-- Chart Controls -->
        <div class="chart-controls-wrapper" style="direction: ltr; text-align: left;">
            <!-- כל כפתורי הבקרה -->
        </div>
        
        <!-- Chart Container Wrapper -->
        <div class="chart-container-wrapper">
            <!-- Price Chart -->
            <div class="tradingview-chart-wrapper" id="price-chart-wrapper">
                <div class="tradingview-chart-container tradingview-price-chart-container" id="price-chart-container"></div>
            </div>
            <!-- Volume Chart -->
            <div class="tradingview-chart-wrapper" id="volume-chart-wrapper">
                <div class="tradingview-chart-container tradingview-volume-chart-container" id="volume-chart-container"></div>
            </div>
        </div>
    </div>
</div>
```

### מבנה עם Overlays

```html
<div class="tradingview-chart-wrapper" id="price-chart-wrapper">
    <!-- Indicators Toolbar -->
    <div id="indicators-toolbar">
        <!-- Toolbar content -->
    </div>
    
    <!-- Drawing Tools Toolbar -->
    <div id="drawing-tools-toolbar">
        <!-- Toolbar content -->
    </div>
    
    <!-- Drawing Canvas Overlay -->
    <canvas id="drawing-canvas"></canvas>
    
    <!-- Chart Container -->
    <div class="tradingview-chart-container tradingview-price-chart-container" id="price-chart-container"></div>
</div>
```

---

## Classes זמינים

### Base Classes

- **`.tradingview-chart-container`** - קונטיינר בסיסי
- **`.tradingview-chart-wrapper`** - wrapper בסיסי

### Specific Chart Containers

- **`.tradingview-price-chart-container`** - גרף מחירים
- **`.tradingview-volume-chart-container`** - גרף נפח
- **`.tradingview-comparison-chart-container`** - גרף השוואה
- **`.tradingview-timeline-chart-container`** - גרף timeline
- **`.tradingview-portfolio-chart-container`** - גרף portfolio

### Chart Wrappers

- **`#price-chart-wrapper`** - wrapper לגרף מחירים (height: 450px)
- **`#volume-chart-wrapper`** - wrapper לגרף נפח (height: 150px)
- **`.comparison-chart-wrapper`** - wrapper לגרף השוואה

### Responsive Containers

- **`.chart-container-base`** - גובה 400px
- **`.chart-container-large`** - גובה 780px
- **`.chart-container-third`** - גובה 33.33%
- **`.chart-container-third-border`** - גובה 33.33% עם border-top

---

## מערכת הצבעים

### עדיפות ראשונה - העדפות משתמש

צבעים מהעדפות המשתמש (chart-specific):

- `--chart-primary-color` - צבע ראשי לגרפים
- `--chart-background-color` - רקע גרפים
- `--chart-text-color` - צבע טקסט
- `--chart-grid-color` - צבע רשת
- `--chart-border-color` - צבע גבול
- `--chart-point-color` - צבע נקודות

### עדיפות שניה - צבעי ישויות (3 וריאנטים)

11 ישויות × 3 וריאנטים = 33 צבעים:

**ישויות:**
- `trade`, `trade_plan`, `execution`, `trading_account`, `cash_flow`
- `ticker`, `alert`, `note`, `constraint`, `design`, `research`

**וריאנטים:**
- `base` - צבע בסיסי (`--entity-{type}-color`)
- `dark` - צבע כהה (`--entity-{type}-text`)
- `light` - צבע בהיר (`--entity-{type}-bg`)

**דוגמה:**
```css
.tradingview-series-trade-base {
    color: var(--entity-trade-color);
}

.tradingview-series-trade-dark {
    color: var(--entity-trade-text);
}

.tradingview-series-trade-light {
    color: var(--entity-trade-bg);
}
```

### Fallback Chain

```
העדפות משתמש → צבעי ישויות (3 וריאנטים) → CSS variables → ברירות מחדל
```

---

## דוגמאות שימוש

### JavaScript - יצירת גרף

```javascript
// Get container
const container = document.getElementById('price-chart-container');

// Create chart
const chart = window.TradingViewChartAdapter.createChart(container, {
    layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: getCSSVariableValue('--chart-text-color', '#333')
    },
    grid: {
        vertLines: { visible: true, color: getCSSVariableValue('--chart-grid-color', '#e0e0e0') },
        horzLines: { visible: true, color: getCSSVariableValue('--chart-grid-color', '#e0e0e0') }
    },
    width: container.clientWidth || 800,
    height: 450
});

// Add series with entity color (Priority 2)
const series = window.TradingViewChartAdapter.addLineSeries(chart, {
    entityType: 'trade',
    variant: 'base' // 'base', 'dark', or 'light'
});
```

### CSS - הגדרת Container

```css
#price-chart-wrapper {
    position: relative;
    height: 450px;
    width: 100%;
    min-width: 0;
    background: var(--chart-background-color, var(--apple-bg-primary));
    border-radius: var(--apple-radius-small) var(--apple-radius-small) 0 0;
    overflow: hidden;
    border-bottom: 2px solid var(--chart-border-color, var(--apple-border-light));
    display: block;
    box-sizing: border-box;
}

#price-chart-container {
    display: block;
    width: 100%;
    height: 100%;
    min-width: 0;
    box-sizing: border-box;
    position: relative;
}
```

---

## Troubleshooting

### בעיה: הגרף לא מוצג / צר

**סיבות אפשריות:**
1. הקונטיינר לא עם `display: block`
2. הקונטיינר לא עם `width: 100%`
3. הקונטיינר לא עם `height` מוגדר
4. בעיית flex layout - צריך `min-width: 0`
5. TradingView Adapter לא נטען - בדוק בקונסול
6. הפונקציה initChart לא נקראת - בדוק בקונסול

**פתרון:**
```css
.tradingview-chart-container {
    display: block;
    width: 100%;
    height: 100%;
    min-width: 0;
    box-sizing: border-box;
    position: relative;
}
```

**בדיקות JavaScript:**
- בדוק ש-`window.TradingViewChartAdapter` קיים
- בדוק ש-`window.LightweightCharts` קיים
- בדוק שהפונקציה `initChart()` נקראת
- בדוק שאין שגיאות JavaScript בקונסול
- בדוק ש-container קיים ב-DOM לפני יצירת הגרף

### בעיה: הגרף מוצג לצד הכפתורים

**סיבה:** Section layout לא נכון

**פתרון:**
```css
#price-chart-section {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow: hidden;
}

#price-chart-section .section-body {
    flex: 1 1 auto;
    display: block; /* לא flex! */
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    overflow: hidden;
}
```

### בעיה: Overlays לא מוצגים נכון

**סיבה:** `position: relative` חסר על ה-wrapper

**פתרון:**
```css
.tradingview-chart-wrapper {
    position: relative;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    display: block;
}

#indicators-toolbar {
    position: absolute;
    top: 10px;
    inset-inline-end: 10px;
    z-index: 20;
}
```

### בעיה: הגרף לא נטען (TradingView Adapter לא זמין)

**סיבות אפשריות:**
1. הספריות לא נטענות - בדוק 404 errors
2. הסדר של טעינת הספריות לא נכון
3. `waitForTradingViewAdapter()` לא ממתינה מספיק זמן
4. שגיאות JavaScript מונעות טעינה

**פתרון:**
```javascript
// וודא שהספריות נטענות בסדר הנכון:
// 1. lightweight-charts.standalone.production.js
// 2. tradingview-theme.js
// 3. tradingview-adapter.js

// בדוק שהפונקציה waitForTradingViewAdapter ממתינה מספיק:
async function waitForTradingViewAdapter() {
    const maxRetries = 100; // 5 שניות
    for (let i = 0; i < maxRetries; i++) {
        if (window.TradingViewChartAdapter && window.LightweightCharts) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    throw new Error('TradingView adapters not loaded');
}
```

### בעיה: הגרף לא מתאתחל (initChart לא נקראת)

**סיבות אפשריות:**
1. DOMContentLoaded event לא מופעל
2. הפונקציה initChart לא מוגדרת לפני DOMContentLoaded
3. שגיאות JavaScript מונעות ביצוע
4. Container לא קיים ב-DOM

**פתרון:**
```javascript
// וודא שהפונקציה מוגדרת לפני DOMContentLoaded
async function initChart() {
    await waitForTradingViewAdapter();
    const container = document.getElementById('chart-container');
    if (!container) {
        console.error('Container not found!');
        return;
    }
    // ... create chart
}

// וודא ש-DOMContentLoaded מופעל
document.addEventListener('DOMContentLoaded', () => {
    initChart();
});

// או אם DOM כבר נטען:
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChart);
} else {
    initChart();
}
```

---

## RTL Support

**חשוב מאוד:** TradingView charts תמיד LTR (left-to-right). כל הקונטיינרים וה-wrappers מוגדרים עם `direction: ltr` כברירת מחדל כדי למנוע בעיות RTL:

```css
/* כל הקונטיינרים וה-wrappers מוגדרים עם direction: ltr */
.tradingview-chart-container {
    direction: ltr;
    text-align: left;
}

.tradingview-chart-wrapper {
    direction: ltr;
}

/* כל הקונטיינרים הספציפיים גם מוגדרים עם direction: ltr */
#price-chart-container,
.tradingview-price-chart-container,
#volume-chart-container,
.tradingview-volume-chart-container,
#comparison-chart-container,
.tradingview-comparison-chart-container,
#timelineChart,
.tradingview-timeline-chart-container,
#portfolio-performance-chart-container,
.tradingview-portfolio-chart-container {
    direction: ltr;
    text-align: left;
}
```

**הערה:** אין צורך ב-selector `[dir="rtl"]` כי כל הקונטיינרים כבר מוגדרים עם `direction: ltr` כברירת מחדל.

---

## Responsive Behavior

```css
@media (max-width: 768px) {
    #price-chart-wrapper {
        height: 300px;
    }
    
    #volume-chart-wrapper {
        height: 100px;
    }
    
    .chart-container-large {
        height: 500px;
    }
}
```

---

## קבצים רלוונטיים

- **CSS:** `trading-ui/styles-new/06-components/_tradingview-charts.css`
- **JavaScript Theme:** `trading-ui/scripts/charts/tradingview-theme.js`
- **JavaScript Adapter:** `trading-ui/scripts/charts/tradingview-adapter.js`
- **תיעוד כללי:** `documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_RESOURCES.md`

---

## הערות חשובות

1. **TradingView Lightweight Charts הוא אובייקט רגיש מאוד** - כל שינוי CSS חייב להיות מדויק
2. **Container חייב להיות `display: block`** - לא `flex`, לא `inline-block`
3. **Height חייב להיות מוגדר** - לא `auto`, לא `0`
4. **צבעים דינמיים** - עדיפות ראשונה מהעדפות, עדיפות שניה מ-3 וריאנטים
5. **תיעוד מקיף** - כל הדרישות חייבות להיות מתועדות

---

**גרסה:** 1.0.0  
**עודכן:** ינואר 2025

