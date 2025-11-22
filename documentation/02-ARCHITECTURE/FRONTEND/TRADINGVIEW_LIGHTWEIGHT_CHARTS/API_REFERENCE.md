# TradingView Lightweight Charts - API Reference
# הפניה ל-API

**תאריך יצירה:** 27 בינואר 2025  
**גרסה:** 1.0.0

---

## קישורים לתיעוד הרשמי

- **Full API Reference:** https://tradingview.github.io/lightweight-charts/docs/api
- **TypeScript Definitions:** https://github.com/tradingview/lightweight-charts/tree/master/packages/lightweight-charts/src

---

## פונקציות מרכזיות

### createChart

יצירת גרף חדש.

```javascript
const chart = createChart(container, options);
```

**Parameters:**
- `container` (HTMLElement) - אלמנט HTML להצגת הגרף
- `options` (ChartOptions) - אפשרויות הגרף

**Returns:**
- `IChartApi` - אובייקט גרף

**Example:**
```javascript
const chart = createChart(document.getElementById('chart'), {
    width: 600,
    height: 400,
    layout: {
        background: { color: '#ffffff' },
        textColor: '#000000',
    },
});
```

---

### addLineSeries

הוספת Line Series.

```javascript
const lineSeries = chart.addLineSeries(options);
```

**Parameters:**
- `options` (LineSeriesOptions) - אפשרויות הסדרה

**Returns:**
- `ISeriesApi<'Line'>` - אובייקט סדרה

**Example:**
```javascript
const lineSeries = chart.addLineSeries({
    color: '#2962FF',
    lineWidth: 2,
    lineType: 1, // Stepped Line
});
```

---

### addAreaSeries

הוספת Area Series.

```javascript
const areaSeries = chart.addAreaSeries(options);
```

**Parameters:**
- `options` (AreaSeriesOptions) - אפשרויות הסדרה

**Returns:**
- `ISeriesApi<'Area'>` - אובייקט סדרה

**Example:**
```javascript
const areaSeries = chart.addAreaSeries({
    lineColor: '#2962FF',
    topColor: '#2962FF',
    bottomColor: 'rgba(41, 98, 255, 0.28)',
});
```

---

### addCandlestickSeries

הוספת Candlestick Series.

```javascript
const candlestickSeries = chart.addCandlestickSeries(options);
```

**Parameters:**
- `options` (CandlestickSeriesOptions) - אפשרויות הסדרה

**Returns:**
- `ISeriesApi<'Candlestick'>` - אובייקט סדרה

**Example:**
```javascript
const candlestickSeries = chart.addCandlestickSeries({
    upColor: '#26baac',
    downColor: '#fc5a06',
});
```

---

### setData

הגדרת נתונים לסדרה.

```javascript
series.setData(data);
```

**Parameters:**
- `data` (Array) - מערך של נקודות נתונים

**Example:**
```javascript
lineSeries.setData([
    { time: '2025-01-01', value: 100 },
    { time: '2025-01-02', value: 105 },
]);
```

---

### update

עדכון נקודה אחת בסדרה.

```javascript
series.update(point);
```

**Parameters:**
- `point` (Object) - נקודת נתונים

**Example:**
```javascript
lineSeries.update({ time: '2025-01-03', value: 110 });
```

---

### priceScale

גישה ל-Price Scale.

```javascript
const priceScale = chart.priceScale(priceScaleId);
```

**Parameters:**
- `priceScaleId` (string) - מזהה ה-scale ('left' או 'right')

**Returns:**
- `IPriceScaleApi` - אובייקט scale

**Example:**
```javascript
const leftScale = chart.priceScale('left');
leftScale.applyOptions({
    autoScale: true,
});
```

---

### timeScale

גישה ל-Time Scale.

```javascript
const timeScale = chart.timeScale();
```

**Returns:**
- `ITimeScaleApi` - אובייקט time scale

**Example:**
```javascript
const timeScale = chart.timeScale();
timeScale.applyOptions({
    timeVisible: true,
    rightOffset: 12,
});
```

---

### subscribeCrosshairMove

האזנה לתנועת Crosshair.

```javascript
chart.subscribeCrosshairMove(callback);
```

**Parameters:**
- `callback` (Function) - פונקציה שמתבצעת בכל תנועה

**Example:**
```javascript
chart.subscribeCrosshairMove(param => {
    if (param.point === undefined || !param.time) {
        return;
    }
    const data = param.seriesData.get(lineSeries);
    if (data) {
        console.log('Value:', data.value);
    }
});
```

---

### applyOptions

החלת אפשרויות על הגרף.

```javascript
chart.applyOptions(options);
```

**Parameters:**
- `options` (ChartOptions) - אפשרויות חדשות

**Example:**
```javascript
chart.applyOptions({
    layout: {
        background: { color: '#f0f0f0' },
    },
});
```

---

### remove

הסרת הגרף.

```javascript
chart.remove();
```

**Example:**
```javascript
chart.remove();
```

---

## טבלת פונקציות מרכזיות

| פונקציה | תיאור | Parameters | Returns |
|---------|-------|------------|---------|
| `createChart` | יצירת גרף | container, options | IChartApi |
| `addLineSeries` | הוספת Line Series | options | ISeriesApi<'Line'> |
| `addAreaSeries` | הוספת Area Series | options | ISeriesApi<'Area'> |
| `addCandlestickSeries` | הוספת Candlestick Series | options | ISeriesApi<'Candlestick'> |
| `setData` | הגדרת נתונים | data | void |
| `update` | עדכון נקודה | point | void |
| `priceScale` | גישה ל-Price Scale | priceScaleId | IPriceScaleApi |
| `timeScale` | גישה ל-Time Scale | - | ITimeScaleApi |
| `subscribeCrosshairMove` | האזנה ל-Crosshair | callback | void |
| `applyOptions` | החלת אפשרויות | options | void |
| `remove` | הסרת הגרף | - | void |

---

## מסמכים קשורים

- [EXAMPLES.md](EXAMPLES.md) - דוגמאות קוד
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - מדריך למפתח
- [EXTERNAL_LINKS.md](EXTERNAL_LINKS.md) - קישורים חיצוניים

