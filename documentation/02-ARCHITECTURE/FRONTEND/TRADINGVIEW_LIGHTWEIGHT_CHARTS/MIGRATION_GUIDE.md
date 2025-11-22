# TradingView Lightweight Charts - Migration Guide
# מדריך מיגרציה מ-Chart.js

**תאריך יצירה:** 27 בינואר 2025  
**גרסה:** 1.0.0

---

## השוואת API

### יצירת גרף

#### Chart.js
```javascript
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [{
            data: [10, 20, 30]
        }]
    }
});
```

#### TradingView
```javascript
const chart = TradingViewChartAdapter.createChart(container);
const lineSeries = TradingViewChartAdapter.addLineSeries(chart);
lineSeries.setData([
    { time: '2025-01-01', value: 10 },
    { time: '2025-01-02', value: 20 },
    { time: '2025-01-03', value: 30 },
]);
```

---

## טבלת המרה

| Chart.js | TradingView |
|----------|-------------|
| `new Chart(ctx, config)` | `TradingViewChartAdapter.createChart(container)` |
| `chart.data.datasets[0].data` | `series.setData([...])` |
| `chart.update()` | `series.update({...})` |
| `chart.destroy()` | `TradingViewChartAdapter.destroyChart(chart)` |
| `scales.y.id` | `priceScaleId: 'left'` |
| `scales.y1.id` | `priceScaleId: 'right'` |
| `stepped: 'after'` | `lineType: 1` |

---

## מסמכים קשורים

- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - מדריך למפתח
- [EXAMPLES.md](EXAMPLES.md) - דוגמאות קוד

