# TradingView Lightweight Charts - Examples
# דוגמאות קוד

**תאריך יצירה:** 27 בינואר 2025  
**גרסה:** 1.0.0

---

## דוגמה 1: גרף בסיסי

```javascript
// יצירת container
const container = document.getElementById('chart-container');

// יצירת גרף
const chart = TradingViewChartAdapter.createChart(container);

// הוספת Line Series
const lineSeries = TradingViewChartAdapter.addLineSeries(chart);

// הגדרת נתונים
lineSeries.setData([
    { time: '2025-01-01', value: 100 },
    { time: '2025-01-02', value: 105 },
    { time: '2025-01-03', value: 110 },
]);
```

---

## דוגמה 2: גרף עם Dual Y-Axes

```javascript
const container = document.getElementById('chart-container');
const chart = TradingViewChartAdapter.createChart(container);

// Position Size - Scale שמאלי
const positionSizeSeries = TradingViewChartAdapter.addLineSeries(chart, {
    priceScaleId: 'left',
    color: '#6c757d',
    lineType: 1, // Stepped Line
    lineWidth: 2,
});

// P/L - Scale ימני
const plSeries = TradingViewChartAdapter.addLineSeries(chart, {
    priceScaleId: 'right',
    color: '#26baac',
    lineType: 0, // Normal Line
    lineWidth: 2,
});

// נתונים
positionSizeSeries.setData([
    { time: '2025-01-01', value: 100 },
    { time: '2025-01-02', value: 150 },
    { time: '2025-01-03', value: 120 },
]);

plSeries.setData([
    { time: '2025-01-01', value: 0 },
    { time: '2025-01-02', value: 500 },
    { time: '2025-01-03', value: 300 },
]);
```

---

## דוגמה 3: גרף עם Custom Tooltips

```javascript
const container = document.getElementById('chart-container');
const chart = TradingViewChartAdapter.createChart(container);
const lineSeries = TradingViewChartAdapter.addLineSeries(chart);
lineSeries.setData([...]);

// יצירת Custom Tooltip
const tooltip = document.createElement('div');
tooltip.className = 'custom-tooltip';
tooltip.style.cssText = `
    position: absolute;
    display: none;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px;
    border-radius: 4px;
    direction: rtl;
    text-align: right;
    pointer-events: none;
    z-index: 1000;
`;
document.body.appendChild(tooltip);

// האזנה ל-Crosshair
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

---

## דוגמה 4: גרף עם Interactive Points

```javascript
const container = document.getElementById('chart-container');
const chart = TradingViewChartAdapter.createChart(container);
const lineSeries = TradingViewChartAdapter.addLineSeries(chart);
lineSeries.setData([...]);

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
    {
        time: '2025-01-02',
        position: 'aboveBar',
        color: '#2196F3',
        shape: 'circle',
        text: 'מכירה',
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

## דוגמה 5: גרף עם Real-time Updates

```javascript
const container = document.getElementById('chart-container');
const chart = TradingViewChartAdapter.createChart(container);
const lineSeries = TradingViewChartAdapter.addLineSeries(chart);

// נתונים ראשוניים
lineSeries.setData([
    { time: '2025-01-01', value: 100 },
    { time: '2025-01-02', value: 105 },
]);

// עדכון בזמן אמת
setInterval(() => {
    const newValue = Math.random() * 100;
    const newTime = new Date().toISOString().split('T')[0];
    
    lineSeries.update({
        time: newTime,
        value: newValue,
    });
}, 1000);
```

---

## דוגמה 6: גרף עם אינטגרציה להעדפות

```javascript
// טעינת העדפות
const chartQuality = await PreferencesData.loadPreference({
    preferenceName: 'chart-quality',
});

const chartAnimations = await PreferencesData.loadPreference({
    preferenceName: 'chart-animations',
});

// יצירת גרף עם העדפות
const chart = TradingViewChartAdapter.createChart(container, {
    layout: {
        animation: chartAnimations?.value !== false,
    },
});

// האזנה לשינויים בהעדפות
document.addEventListener('preferences:updated', async (event) => {
    if (event.detail.preferenceName === 'chart-quality' || 
        event.detail.preferenceName === 'chart-animations') {
        // עדכון הגרף
        const newQuality = await PreferencesData.loadPreference({
            preferenceName: 'chart-quality',
        });
        
        chart.applyOptions({
            // ... אפשרויות חדשות
        });
    }
});
```

---

## מסמכים קשורים

- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - מדריך למפתח
- [API_REFERENCE.md](API_REFERENCE.md) - הפניה ל-API
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - מדריך אינטגרציה

