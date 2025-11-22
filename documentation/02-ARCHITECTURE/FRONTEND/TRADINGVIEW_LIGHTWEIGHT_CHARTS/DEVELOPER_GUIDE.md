# TradingView Lightweight Charts - Developer Guide
# מדריך למפתח

**תאריך יצירה:** 27 בינואר 2025  
**גרסה:** 1.0.0

---

## איך ליצור גרף חדש

### 1. יצירת גרף בסיסי

```javascript
// יצירת container
const container = document.getElementById('chart-container');

// יצירת גרף
const chart = TradingViewChartAdapter.createChart(container, {
    width: 600,
    height: 400,
});

// הוספת Line Series
const lineSeries = TradingViewChartAdapter.addLineSeries(chart, {
    color: '#26baac',
    lineWidth: 2,
});

// הגדרת נתונים
lineSeries.setData([
    { time: '2025-01-01', value: 100 },
    { time: '2025-01-02', value: 105 },
]);
```

### 2. יצירת גרף עם Theme

```javascript
// יצירת גרף עם theme אוטומטי
const chart = TradingViewChartAdapter.createChart(container);

// Theme מוחל אוטומטית מ-TradingViewTheme
```

### 3. יצירת גרף עם Multiple Series

```javascript
const chart = TradingViewChartAdapter.createChart(container);

// Series 1 - Position Size (Scale שמאלי)
const positionSizeSeries = TradingViewChartAdapter.addLineSeries(chart, {
    priceScaleId: 'left',
    color: '#6c757d',
    lineType: 1, // Stepped Line
});

// Series 2 - P/L (Scale ימני)
const plSeries = TradingViewChartAdapter.addLineSeries(chart, {
    priceScaleId: 'right',
    color: '#26baac',
    lineType: 0, // Normal Line
});
```

---

## איך להוסיף Series

### Line Series

```javascript
const lineSeries = TradingViewChartAdapter.addLineSeries(chart, {
    color: '#26baac',
    lineWidth: 2,
    lineType: 1, // 0: Normal, 1: Stepped, 2: With Gaps
    priceScaleId: 'left', // או 'right'
});
```

### Area Series

```javascript
const areaSeries = TradingViewChartAdapter.addAreaSeries(chart, {
    lineColor: '#26baac',
    topColor: '#26baac',
    bottomColor: 'rgba(38, 186, 172, 0.28)',
});
```

### Candlestick Series

```javascript
const candlestickSeries = TradingViewChartAdapter.addCandlestickSeries(chart, {
    upColor: '#26baac',
    downColor: '#fc5a06',
});
```

---

## איך להתאים אישית

### Custom Colors

```javascript
// שימוש ב-Theme System
const colors = TradingViewTheme.getChartColors();
const chart = TradingViewChartAdapter.createChart(container, {
    layout: {
        background: { color: colors.background },
        textColor: colors.text,
    },
});
```

### Custom Tooltips

```javascript
const tooltip = document.createElement('div');
tooltip.className = 'custom-tooltip';
tooltip.style.direction = 'rtl'; // RTL support
document.body.appendChild(tooltip);

chart.subscribeCrosshairMove(param => {
    if (param.point === undefined || !param.time) {
        tooltip.style.display = 'none';
        return;
    }

    const data = param.seriesData.get(lineSeries);
    if (data) {
        tooltip.style.display = 'block';
        tooltip.style.left = param.point.x + 'px';
        tooltip.style.top = param.point.y + 'px';
        tooltip.innerHTML = `
            <div>תאריך: ${data.time}</div>
            <div>ערך: ${data.value}</div>
        `;
    }
});
```

### Interactive Points

```javascript
// הוספת Markers
lineSeries.setMarkers([
    {
        time: '2025-01-01',
        position: 'belowBar',
        color: '#f68410',
        shape: 'circle',
        text: 'קנייה',
        size: 1,
    },
]);

// Click handler
chart.subscribeClick((param) => {
    if (param.point === undefined || !param.time) {
        return;
    }
    
    const data = param.seriesData.get(lineSeries);
    if (data) {
        // Open details modal
        showDetailsModal(data);
    }
});
```

---

## Best Practices

### 1. תמיד להשתמש ב-Adapter

```javascript
// ✅ טוב
const chart = TradingViewChartAdapter.createChart(container);

// ❌ רע
const chart = lightweightCharts.createChart(container);
```

### 2. תמיד להשתמש ב-Theme

```javascript
// ✅ טוב - Theme מוחל אוטומטית
const chart = TradingViewChartAdapter.createChart(container);

// ❌ רע - צבעים קשיחים
const chart = TradingViewChartAdapter.createChart(container, {
    layout: {
        background: { color: '#ffffff' }, // קשיח!
    },
});
```

### 3. תמיד לנקות Charts

```javascript
// בעת הסרת העמוד
window.addEventListener('beforeunload', () => {
    TradingViewChartAdapter.destroyChart(chart);
});
```

### 4. RTL Support

```javascript
// ✅ טוב - וידוא שטקסט מוצג נכון
const tooltip = document.createElement('div');
tooltip.style.direction = 'rtl';
tooltip.style.textAlign = 'right';

// הגרפים משמאל לימין - זה בסדר
```

### 5. אינטגרציה עם Preferences

```javascript
// טעינת העדפות
const chartQuality = await PreferencesData.loadPreference({
    preferenceName: 'chart-quality',
});

// החלת העדפות
if (chartQuality?.value === 'low') {
    chart.applyOptions({
        // ... אפשרויות לביצועים נמוכים
    });
}
```

---

## מסמכים קשורים

- [EXAMPLES.md](EXAMPLES.md) - דוגמאות קוד
- [API_REFERENCE.md](API_REFERENCE.md) - הפניה ל-API
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - מדריך אינטגרציה

