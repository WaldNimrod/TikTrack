# מדריך מפתח - עמוד השוואת תאריכים

## Date Comparison Modal Developer Guide

**תאריך יצירה:** 29 בינואר 2025  
**גרסה:** 1.0.0  
**סטטוס:** מוקאפ - שלב דיוק אפיון

---

## תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [ארכיטקטורה ומבנה](#ארכיטקטורה-ומבנה)
3. [אינטגרציה עם מערכות](#אינטגרציה-עם-מערכות)
4. [מימוש ווידג'טים](#מימוש-ווידגטים)
5. [נתוני דמה](#נתוני-דמה)
6. [API Reference (לעתיד)](#api-reference-לעתיד)
7. [דוגמאות קוד](#דוגמאות-קוד)
8. [פתרון בעיות נפוצות](#פתרון-בעיות-נפוצות)

---

## סקירה כללית

עמוד השוואת תאריכים (`date-comparison-modal.html`) הוא מוקאפ המאפשר השוואה בין שני תאריכים של מצב תיק ההשקעות. העמוד מציג:

- **בחירת תאריכים** - שני שדות תאריך להשוואה
- **טבלת השוואה** - השוואה בין מדדים שונים (יתרות, שווי תיק, P/L, וכו')
- **Bar Chart** - גרף עמודות להשוואה ויזואלית
- **Line Chart** - גרף קו למגמה בין התאריכים
- **התראות** - התראות על שינויים משמעותיים
- **סיכום** - סיכום השוואה עם סטטיסטיקות

**חשוב:** בשלב זה, העמוד עובד עם **נתוני דמה** בלבד. אין חיבור ל-API או לבסיס הנתונים.

---

## ארכיטקטורה ומבנה

### קבצים

- **HTML:** `trading-ui/mockups/daily-snapshots/date-comparison-modal.html`
- **JavaScript:** `trading-ui/scripts/date-comparison-modal.js`
- **קונפיגורציה:** `trading-ui/scripts/page-initialization-configs.js`
- **InfoSummary:** `trading-ui/scripts/info-summary-configs.js`

### מבנה הקוד

הקוד מאורגן בפונקציות לפי תפקיד:

```javascript
// ===== GLOBAL STATE =====
let selectedDate1 = null;
let selectedDate2 = null;
let comparisonData = null;
let barChart = null;
let lineChart = null;

// ===== DATE SELECTION FUNCTIONS =====
// handleDate1Change, handleDate2Change, validateDates, compareDates, etc.

// ===== DATA GENERATION =====
// generateComparisonData, generateDateData

// ===== TABLE FUNCTIONS =====
// updateComparisonTable, formatCurrency, formatPLChange

// ===== CHART FUNCTIONS =====
// initBarChart, updateBarChart, initLineChart, updateLineChart

// ===== ALERTS FUNCTIONS =====
// calculateAlerts, updateAlerts

// ===== SUMMARY FUNCTIONS =====
// updateSummary
```

---

## אינטגרציה עם מערכות

### 1. UnifiedAppInitializer

העמוד משולב עם מערכת האיתחול המאוחדת:

```javascript
// page-initialization-configs.js
'date-comparison-modal': {
  packages: ['base', 'services', 'ui-advanced', 'preferences', 'init-system', 'charts'],
  requiredGlobals: [
    'NotificationSystem',
    'TradingViewChartAdapter',
    'UnifiedCacheManager',
    'FieldRendererService',
    'InfoSummarySystem',
    'PreferencesCore'
  ],
  customInitializers: [
    async pageConfig => {
      // אתחול ספציפי לעמוד
    }
  ]
}
```

### 2. UnifiedCacheManager

העמוד משתמש במערכת המטמון המאוחדת לשמירה וטעינה:

```javascript
// שמירת תאריכים נבחרים
await window.UnifiedCacheManager.save('date-comparison-selected-dates', {
  date1: selectedDate1,
  date2: selectedDate2
}, { layer: 'localStorage', ttl: 86400000 }); // 24 שעות

// שמירת תוצאות השוואה
await window.UnifiedCacheManager.save(`date-comparison-results-${date1}-${date2}`, {
  date1: date1,
  date2: date2,
  comparisonData: comparisonData
}, { layer: 'memory', ttl: 3600000 }); // 1 שעה
```

### 3. PreferencesCore

העמוד משתמש במערכת העדפות לשמירת תאריכים אחרונים:

```javascript
// שמירה
await window.PreferencesCore.savePreference('date-comparison-last-dates', {
  date1: selectedDate1,
  date2: selectedDate2
});

// טעינה
const lastDates = await window.PreferencesCore.getPreference('date-comparison-last-dates');
```

### 4. FieldRendererService

העמוד משתמש ב-FieldRendererService לרינדור ערכים:

```javascript
// רינדור P/L
const plHtml = window.FieldRendererService.renderPLChange(changeValue, changePercent, 'date_comparison');

// רינדור סכומים
const amountHtml = window.FieldRendererService.renderAmount(amount, '$', 0, false);

// רינדור אחוזים
const percentHtml = window.FieldRendererService.renderNumericValue(percent, '%', true);
```

### 5. TradingView Charts

העמוד משתמש ב-TradingView Lightweight Charts דרך ה-Adapter:

```javascript
// יצירת גרף
barChart = window.TradingViewChartAdapter.createChart(container, {
  layout: {
    background: { type: 'solid', color: 'transparent' },
    textColor: getCSSVariableValue('--text-color', '#212529')
  },
  width: containerWidth,
  height: 300
});

// הוספת סדרה
const series = window.TradingViewChartAdapter.addBarSeries(barChart, {
  title: 'תאריך 1',
  upColor: infoColor,
  downColor: infoColor
});
```

### 6. InfoSummarySystem

העמוד משתמש ב-InfoSummarySystem להצגת סיכום:

```javascript
// קונפיגורציה ב-info-summary-configs.js
'date-comparison-modal': {
  containerId: 'comparison-summary',
  stats: [
    { id: 'total_change', label: 'שינוי כולל', calculator: 'custom', ... },
    { id: 'avg_change_percent', label: 'שינוי ממוצע', calculator: 'custom', ... },
    { id: 'significant_changes', label: 'שינויים משמעותיים', calculator: 'custom', ... }
  ]
}
```

### 7. ColorSchemeSystem

העמוד משתמש במערכת הצבעים הדינמית:

```javascript
function getCSSVariableValue(variableName, fallback) {
  try {
    const value = getComputedStyle(document.documentElement).getPropertyValue(variableName);
    return value && value.trim() ? value.trim() : fallback;
  } catch (error) {
    return fallback;
  }
}

// שימוש
const textColor = getCSSVariableValue('--text-color', '#212529');
const infoColor = getCSSVariableValue('--info-color', '#17a2b8');
const successColor = getCSSVariableValue('--success-color', '#28a745');
```

---

## מימוש ווידג'טים

### 1. בחירת תאריכים

**HTML:**
```html
<div class="content-section" id="date-selection-section">
  <div class="section-header">
    <h2>בחירת תאריכים להשוואה</h2>
  </div>
  <div class="section-body">
    <div class="row g-3">
      <div class="col-md-5">
        <label for="date1" class="form-label">תאריך 1:</label>
        <input type="date" id="date1" class="form-control" onchange="handleDate1Change()">
      </div>
      <div class="col-md-5">
        <label for="date2" class="form-label">תאריך 2:</label>
        <input type="date" id="date2" class="form-control" onchange="handleDate2Change()">
      </div>
      <div class="col-md-2">
        <button data-button-type="COMPARE" data-variant="primary" data-text="השווה" data-onclick="compareDates()" class="w-100"></button>
      </div>
    </div>
    <div id="date-validation-message" class="mt-2"></div>
  </div>
</div>
```

**JavaScript:**
```javascript
function handleDate1Change() {
  const date1Input = document.getElementById('date1');
  selectedDate1 = date1Input.value;
  validateDates();
}

function validateDates() {
  const date1 = document.getElementById('date1').value;
  const date2 = document.getElementById('date2').value;
  
  if (!date1 || !date2) return false;
  
  const date1Obj = new Date(date1);
  const date2Obj = new Date(date2);
  
  if (date1Obj >= date2Obj) {
    // הצגת שגיאה
    return false;
  }
  
  return true;
}
```

### 2. טבלת השוואה

**HTML:**
```html
<table class="table" id="comparison-table">
  <thead>
    <tr>
      <th>מדד</th>
      <th id="date1-header">תאריך 1</th>
      <th id="date2-header">תאריך 2</th>
      <th>שינוי</th>
    </tr>
  </thead>
  <tbody id="comparison-table-body">
    <!-- נתונים יוטענו דינמית -->
  </tbody>
</table>
```

**JavaScript:**
```javascript
function updateComparisonTable(data) {
  const tbody = document.getElementById('comparison-table-body');
  const metrics = [
    { key: 'balance', label: 'יתרות', format: 'currency' },
    { key: 'portfolioValue', label: 'שווי תיק', format: 'currency' },
    // ...
  ];
  
  const rows = metrics.map(metric => {
    const value1 = data.data1[metric.key];
    const value2 = data.data2[metric.key];
    const change = data.changes[metric.key];
    const changePercent = data.changes[metric.key + 'Percent'];
    
    return `
      <tr>
        <td><strong>${metric.label}</strong></td>
        <td>${formatCurrency(value1)}</td>
        <td>${formatCurrency(value2)}</td>
        <td>${formatPLChange(change, changePercent)}</td>
      </tr>
    `;
  }).join('');
  
  tbody.innerHTML = rows;
}
```

### 3. Bar Chart

**HTML:**
```html
<div class="chart-container-wrapper">
  <div class="tradingview-chart-wrapper date-comparison-bar-chart-wrapper">
    <div class="tradingview-chart-container tradingview-bar-chart-container" id="bar-chart-container">
      <div class="chart-loading">
        <img src="../../images/icons/tabler/clock.svg" width="16" height="16" alt="hourglass" class="icon"> טוען גרף...
      </div>
    </div>
  </div>
</div>
```

**JavaScript:**
```javascript
async function initBarChart() {
  await waitForTradingViewAdapter();
  
  const container = document.getElementById('bar-chart-container');
  const wrapper = container.closest('.chart-container-wrapper');
  const containerWidth = wrapper.clientWidth;
  
  barChart = window.TradingViewChartAdapter.createChart(container, {
    layout: {
      background: { type: 'solid', color: 'transparent' },
      textColor: getCSSVariableValue('--text-color', '#212529')
    },
    width: containerWidth,
    height: 300
  });
}

function updateBarChart(data) {
  const barData = generateBarChartData(data);
  
  const series1 = window.TradingViewChartAdapter.addBarSeries(barChart, {
    title: 'תאריך 1',
    upColor: getCSSVariableValue('--info-color', '#17a2b8'),
    downColor: getCSSVariableValue('--info-color', '#17a2b8')
  });
  series1.setData(barData.date1Data);
  
  const series2 = window.TradingViewChartAdapter.addBarSeries(barChart, {
    title: 'תאריך 2',
    upColor: getCSSVariableValue('--success-color', '#28a745'),
    downColor: getCSSVariableValue('--success-color', '#28a745')
  });
  series2.setData(barData.date2Data);
}
```

### 4. Line Chart

**HTML:**
```html
<div class="chart-container-wrapper">
  <div class="tradingview-chart-wrapper date-comparison-line-chart-wrapper">
    <div class="tradingview-chart-container tradingview-line-chart-container" id="line-chart-container">
      <div class="chart-loading">
        <img src="../../images/icons/tabler/clock.svg" width="16" height="16" alt="hourglass" class="icon"> טוען גרף...
      </div>
    </div>
  </div>
</div>
```

**JavaScript:**
```javascript
async function initLineChart() {
  await waitForTradingViewAdapter();
  
  const container = document.getElementById('line-chart-container');
  const wrapper = container.closest('.chart-container-wrapper');
  const containerWidth = wrapper.clientWidth;
  
  lineChart = window.TradingViewChartAdapter.createChart(container, {
    layout: {
      background: { type: 'solid', color: 'transparent' },
      textColor: getCSSVariableValue('--text-color', '#212529')
    },
    width: containerWidth,
    height: 300
  });
}

function updateLineChart(data) {
  const lineData = generateLineChartData(data);
  
  const balanceSeries = window.TradingViewChartAdapter.addLineSeries(lineChart, {
    title: 'יתרות',
    color: getCSSVariableValue('--info-color', '#17a2b8'),
    lineWidth: 2
  });
  balanceSeries.setData(lineData.balanceData);
  
  // ... עוד סדרות
}
```

### 5. התראות

**HTML:**
```html
<div id="alerts-container">
  <!-- התראות יוטענו דינמית -->
</div>
```

**JavaScript:**
```javascript
function calculateAlerts(data) {
  const alerts = [];
  
  const balanceChangePercent = Math.abs(data.changes.balancePercent);
  if (balanceChangePercent > 5) {
    alerts.push({
      type: 'warning',
      message: `שינוי משמעותי: שינוי ביתרות ${balanceChangePercent.toFixed(1)}%`
    });
  }
  
  const plChangePercent = Math.abs(data.changes.totalPLPercent);
  if (plChangePercent > 10) {
    alerts.push({
      type: 'warning',
      message: `שינוי משמעותי: שינוי ב-P/L ${plChangePercent.toFixed(1)}%`
    });
  }
  
  return alerts;
}

function updateAlerts(data) {
  const alertsContainer = document.getElementById('alerts-container');
  const alerts = calculateAlerts(data);
  
  alertsContainer.innerHTML = alerts.map(alert => `
    <div class="alert alert-${alert.type}">
      <img src="../../images/icons/tabler/alert-triangle.svg" width="16" height="16" alt="alert-triangle" class="icon">
      <strong>שינוי משמעותי:</strong> ${alert.message}
    </div>
  `).join('');
}
```

---

## נתוני דמה

העמוד משתמש בנתוני דמה שנוצרים דינמית:

```javascript
function generateComparisonData(date1, date2) {
  const data1 = generateDateData(date1);
  const data2 = generateDateData(date2, data1); // משתנה מ-data1
  
  const changes = {
    balance: data2.balance - data1.balance,
    balancePercent: ((data2.balance - data1.balance) / data1.balance) * 100,
    // ...
  };
  
  return {
    date1: date1,
    date2: date2,
    data1: data1,
    data2: data2,
    changes: changes
  };
}

function generateDateData(date, baseData = null) {
  // שימוש ב-date כזרע ליצירת נתונים עקביים
  const dateObj = new Date(date);
  const seed = dateObj.getTime();
  
  // אם baseData קיים, משתנה ממנו
  if (baseData) {
    const variation = (seededRandom() - 0.5) * 0.2; // ±10%
    return {
      balance: Math.round(baseData.balance * (1 + variation)),
      // ...
    };
  }
  
  // אחרת, יוצר נתונים חדשים
  return {
    balance: Math.round(40000 + seededRandom() * 20000),
    portfolioValue: Math.round(60000 + seededRandom() * 30000),
    // ...
  };
}
```

---

## API Reference (לעתיד)

כאשר העמוד יתחבר ל-API, יש להשתמש ב-endpoints הבאים:

### GET /api/daily-snapshots/{date}/portfolio-summary

קבלת סיכום תיק לתאריך מסוים.

**Parameters:**
- `date` (string, required) - תאריך בפורמט YYYY-MM-DD

**Response:**
```json
{
  "date": "2024-01-15",
  "balance": 50000,
  "portfolioValue": 75000,
  "realizedPL": 10000,
  "unrealizedPL": 15000,
  "totalPL": 25000,
  "positions": 5
}
```

### GET /api/daily-snapshots/compare

השוואה בין שני תאריכים.

**Parameters:**
- `date1` (string, required) - תאריך ראשון בפורמט YYYY-MM-DD
- `date2` (string, required) - תאריך שני בפורמט YYYY-MM-DD

**Response:**
```json
{
  "date1": "2024-01-15",
  "date2": "2024-01-20",
  "data1": { /* portfolio summary for date1 */ },
  "data2": { /* portfolio summary for date2 */ },
  "changes": {
    "balance": 2000,
    "balancePercent": 4.0,
    "portfolioValue": 5000,
    "portfolioValuePercent": 6.7,
    // ...
  }
}
```

---

## דוגמאות קוד

### דוגמה 1: השוואת תאריכים מלאה

```javascript
// בחירת תאריכים
document.getElementById('date1').value = '2024-01-15';
document.getElementById('date2').value = '2024-01-20';

// ביצוע השוואה
await compareDates();

// התוצאות יוצגו אוטומטית בטבלה, בגרפים, בהתראות ובסיכום
```

### דוגמה 2: שמירה וטעינה של תאריכים

```javascript
// שמירה
await saveSelectedDates();

// טעינה
await loadLastSelectedDates();
```

### דוגמה 3: עדכון גרף ידני

```javascript
const comparisonData = generateComparisonData('2024-01-15', '2024-01-20');
updateBarChart(comparisonData);
updateLineChart(comparisonData);
```

---

## פתרון בעיות נפוצות

### בעיה 1: גרפים לא נטענים

**תסמינים:** הגרפים מציגים "טוען גרף..." ולא נטענים.

**פתרון:**
1. בדוק ש-TradingView Lightweight Charts נטען: `typeof window.LightweightCharts !== 'undefined'`
2. בדוק ש-TradingViewChartAdapter זמין: `typeof window.TradingViewChartAdapter !== 'undefined'`
3. בדוק את הקונסול לשגיאות JavaScript

### בעיה 2: תאריכים לא נשמרים

**תסמינים:** תאריכים נבחרים לא נשמרים בין טעינות דף.

**פתרון:**
1. בדוק ש-UnifiedCacheManager מאותחל: `window.UnifiedCacheManager && window.UnifiedCacheManager.initialized`
2. בדוק ש-PreferencesCore זמין: `typeof window.PreferencesCore !== 'undefined'`
3. בדוק את הקונסול לשגיאות שמירה

### בעיה 3: טבלה לא מתעדכנת

**תסמינים:** הטבלה נשארת ריקה או מציגה "בחר תאריכים להשוואה".

**פתרון:**
1. ודא שבוצעה השוואה: `compareDates()` נקרא
2. בדוק ש-`comparisonData` לא null
3. בדוק את הקונסול לשגיאות JavaScript

### בעיה 4: צבעים לא דינמיים

**תסמינים:** הגרפים משתמשים בצבעים קבועים ולא מתאימים ל-dark mode.

**פתרון:**
1. ודא ש-`getCSSVariableValue` משתמש ב-CSS variables
2. בדוק ש-ColorSchemeSystem נטען
3. בדוק את ערכי ה-CSS variables ב-devtools

---

## הערות חשובות

1. **נתוני דמה:** כל הנתונים הם דמה (mock) - אין חיבור ל-API בשלב זה
2. **תאימות:** העמוד תואם לכל המערכות הקיימות (UnifiedAppInitializer, UnifiedCacheManager, וכו')
3. **RTL:** העמוד תומך ב-RTL מלא
4. **Responsive:** העמוד תומך במסכים שונים
5. **Dark Mode:** העמוד תומך ב-dark mode דרך ColorSchemeSystem

---

**תאריך עדכון אחרון:** 29 בינואר 2025

