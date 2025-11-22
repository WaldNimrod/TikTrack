# מדריך התחלה מהירה - TradingView Lightweight Charts
# Quick Start Guide - TradingView Lightweight Charts

**תאריך יצירה:** 27 ינואר 2025  
**גרסה:** 1.0

---

## 🚀 התחלה מהירה

### התקנה

#### דרך NPM
```bash
npm install lightweight-charts
```

#### דרך CDN
```html
<script src="https://unpkg.com/lightweight-charts@4.1.0/dist/lightweight-charts.standalone.production.js"></script>
```

### דוגמה בסיסית

```javascript
import { createChart } from 'lightweight-charts';

// יצירת container
const chartContainer = document.getElementById('chart');
const chart = createChart(chartContainer, {
    width: 800,
    height: 400,
    layout: {
        backgroundColor: '#ffffff',
        textColor: '#333',
    },
    grid: {
        vertLines: {
            color: '#f0f0f0',
        },
        horzLines: {
            color: '#f0f0f0',
        },
    },
    timeScale: {
        timeVisible: true,
        secondsVisible: false,
    },
});

// הוספת סדרת נתונים
const lineSeries = chart.addLineSeries({
    color: '#26baac',
    lineWidth: 2,
});

// הגדרת נתונים
lineSeries.setData([
    { time: '2025-01-01', value: 100 },
    { time: '2025-01-02', value: 105 },
    { time: '2025-01-03', value: 110 },
]);
```

---

## 📊 סוגי גרפים

### Line Chart
```javascript
const lineSeries = chart.addLineSeries();
lineSeries.setData([...]);
```

### Area Chart
```javascript
const areaSeries = chart.addAreaSeries();
areaSeries.setData([...]);
```

### Candlestick Chart
```javascript
const candlestickSeries = chart.addCandlestickSeries();
candlestickSeries.setData([
    { time: '2025-01-01', open: 100, high: 105, low: 95, close: 103 },
    ...
]);
```

### Bar Chart
```javascript
const barSeries = chart.addBarSeries();
barSeries.setData([
    { time: '2025-01-01', open: 100, high: 105, low: 95, close: 103 },
    ...
]);
```

---

## 🎨 התאמה אישית

### צבעים
```javascript
const lineSeries = chart.addLineSeries({
    color: '#26baac',
    lineWidth: 2,
    lineStyle: 0, // 0 = solid, 1 = dotted, 2 = dashed
});
```

### Price Scales
```javascript
// Left price scale
const leftSeries = chart.addLineSeries({
    priceScaleId: 'left',
});

// Right price scale
const rightSeries = chart.addLineSeries({
    priceScaleId: 'right',
});
```

### Time Scale
```javascript
chart.applyOptions({
    timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderVisible: true,
    },
});
```

---

## 🔗 קישורים נוספים

- 📖 [API Reference](API_REFERENCE.md) - הפניה מלאה ל-API
- 📚 [Examples](EXAMPLES.md) - דוגמאות קוד מפורטות
- 🔧 [Integration Guide](INTEGRATION_GUIDE.md) - אינטגרציה במערכת
- 🌐 [External Links](EXTERNAL_LINKS.md) - קישורים לתיעוד הרשמי

---

**מחבר:** TikTrack Development Team  
**עדכון אחרון:** 27 ינואר 2025

