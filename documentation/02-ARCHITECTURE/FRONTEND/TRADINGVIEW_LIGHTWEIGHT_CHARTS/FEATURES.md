# TradingView Lightweight Charts - Features
# רשימת תכונות מפורטת

**תאריך יצירה:** 27 בינואר 2025  
**גרסה:** 1.0.0

---

## סוגי Series

### 1. Line Series
קו פשוט - מתאים לרוב הגרפים.

```javascript
const lineSeries = chart.addLineSeries({
    color: '#2962FF',
    lineWidth: 2,
    lineType: 0, // 0: Normal, 1: Stepped, 2: With Gaps
});
```

**תכונות:**
- ✅ Stepped Lines (`lineType: 1`)
- ✅ With Gaps (`lineType: 2`)
- ✅ Custom Colors
- ✅ Line Width

### 2. Area Series
אזור מלא - מתאים להדגשת אזורים.

```javascript
const areaSeries = chart.addAreaSeries({
    lineColor: '#2962FF',
    topColor: '#2962FF',
    bottomColor: 'rgba(41, 98, 255, 0.28)',
});
```

**תכונות:**
- ✅ Gradient Fill
- ✅ Custom Colors

### 3. Histogram Series
היסטוגרמה - מתאים לנפחים.

```javascript
const histogramSeries = chart.addHistogramSeries({
    color: '#2962FF',
    priceFormat: {
        type: 'volume',
    },
});
```

**תכונות:**
- ✅ Volume Format
- ✅ Custom Colors

### 4. Candlestick Series
נרות - מתאים למחירי שוק.

```javascript
const candlestickSeries = chart.addCandlestickSeries({
    upColor: '#26baac',
    downColor: '#fc5a06',
    borderVisible: false,
});
```

**תכונות:**
- ✅ Up/Down Colors
- ✅ Border Control

### 5. Bar Series
בר - מתאים לנתונים דיסקרטיים.

```javascript
const barSeries = chart.addBarSeries({
    upColor: '#26baac',
    downColor: '#fc5a06',
});
```

**תכונות:**
- ✅ Up/Down Colors

---

## Time Scale Configuration

### תמיכה בתאריכים ושעות

```javascript
chart.timeScale().applyOptions({
    timeVisible: true,
    secondsVisible: false,
    rightOffset: 12,
    barSpacing: 3,
    fixLeftEdge: false,
    fixRightEdge: false,
    lockVisibleTimeRangeOnResize: true,
    rightBarStaysOnScroll: true,
    borderVisible: false,
    borderColor: '#fff000',
    visible: true,
    ticksVisible: true,
});
```

**תכונות:**
- ✅ Time-based X-Axis
- ✅ Custom Formatting
- ✅ Zoom & Pan
- ✅ Right Bar Stays On Scroll

---

## Price Scale Configuration

### Multiple Price Scales

```javascript
// Scale שמאלי
const leftPriceScale = chart.priceScale('left');
leftPriceScale.applyOptions({
    autoScale: true,
    scaleMargins: {
        top: 0.1,
        bottom: 0.1,
    },
});

// Scale ימני
const rightPriceScale = chart.priceScale('right');
rightPriceScale.applyOptions({
    autoScale: true,
    scaleMargins: {
        top: 0.1,
        bottom: 0.1,
    },
});

// כל series על scale משלה
const positionSizeSeries = chart.addLineSeries({
    priceScaleId: 'left',
});

const plSeries = chart.addLineSeries({
    priceScaleId: 'right',
});
```

**תכונות:**
- ✅ Multiple Price Scales
- ✅ Auto Scale
- ✅ Custom Margins
- ✅ כל series על scale משלה

---

## Crosshair & Tooltip

### Custom Tooltips

```javascript
chart.subscribeCrosshairMove(param => {
    if (param.point === undefined || !param.time || param.point.x < 0 || param.point.x > chartContainer.clientWidth || param.point.y < 0 || param.point.y > chartContainer.clientHeight) {
        // Hide tooltip
        return;
    }

    const data = param.seriesData.get(lineSeries);
    if (data) {
        // Show custom tooltip
        tooltip.style.display = 'block';
        tooltip.innerHTML = `
            <div>Date: ${data.time}</div>
            <div>Value: ${data.value}</div>
        `;
    }
});
```

**תכונות:**
- ✅ Custom Tooltips
- ✅ Crosshair Events
- ✅ Series Data Access

---

## Markers & Annotations

### Markers

```javascript
lineSeries.setMarkers([
    {
        time: '2025-01-01',
        position: 'belowBar',
        color: '#f68410',
        shape: 'circle',
        text: 'Buy',
        size: 1,
    },
    {
        time: '2025-01-02',
        position: 'aboveBar',
        color: '#2196F3',
        shape: 'circle',
        text: 'Sell',
        size: 1,
    },
]);
```

**תכונות:**
- ✅ Custom Markers
- ✅ Multiple Positions
- ✅ Custom Shapes
- ✅ Custom Colors
- ✅ Text Labels

---

## Real-time Updates

### עדכון נתונים בזמן אמת

```javascript
// עדכון נקודה אחת
lineSeries.update({ time: '2025-01-03', value: 110 });

// עדכון מספר נקודות
lineSeries.setData([
    { time: '2025-01-01', value: 100 },
    { time: '2025-01-02', value: 105 },
    { time: '2025-01-03', value: 110 },
]);
```

**תכונות:**
- ✅ Real-time Updates
- ✅ Efficient Updates
- ✅ No Re-render

---

## Styling & Theming

### Layout Options

```javascript
chart.applyOptions({
    layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#000000',
    },
    grid: {
        vertLines: {
            color: '#e0e0e0',
            style: LineStyle.Solid,
            visible: true,
        },
        horzLines: {
            color: '#e0e0e0',
            style: LineStyle.Solid,
            visible: true,
        },
    },
    crosshair: {
        mode: CrosshairMode.Normal,
    },
    rightPriceScale: {
        borderColor: '#485065',
    },
    timeScale: {
        borderColor: '#485065',
    },
});
```

**תכונות:**
- ✅ Custom Colors
- ✅ Grid Configuration
- ✅ Crosshair Configuration
- ✅ Price Scale Styling
- ✅ Time Scale Styling

---

## תכונות נוספות

### 1. Zoom & Pan
- ✅ Mouse Wheel Zoom
- ✅ Touch Gestures
- ✅ Programmatic Zoom

### 2. Responsive
- ✅ Auto Resize
- ✅ Custom Width/Height

### 3. Performance
- ✅ Efficient Rendering
- ✅ Large Data Sets Support
- ✅ Smooth Animations

### 4. Accessibility
- ⚠️ Limited (צריך לבדוק)

---

## מסמכים קשורים

- [API_REFERENCE.md](API_REFERENCE.md) - הפניה ל-API
- [EXAMPLES.md](EXAMPLES.md) - דוגמאות קוד
- [LIMITATIONS.md](LIMITATIONS.md) - מגבלות ופתרונות

