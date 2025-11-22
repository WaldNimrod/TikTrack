# TradingView Lightweight Charts - Limitations
# מגבלות ופתרונות

**תאריך יצירה:** 27 בינואר 2025  
**גרסה:** 1.0.0

---

## מגבלות ידועות

### 1. Stepped Lines

**מגבלה:** לא תומך ב-Stepped Lines ישירות כמו Chart.js.

**פתרון:** יש תמיכה ב-`lineType: 1` (LineType.WithSteps) אבל זה לא בדיוק כמו Stepped Line של Chart.js.

**Workaround:**
```javascript
// אופציה 1: שימוש ב-lineType: 1
const lineSeries = chart.addLineSeries({
    lineType: 1, // LineType.WithSteps
});

// אופציה 2: יצירת נתונים עם נקודות כפולות
const steppedData = [];
for (let i = 0; i < data.length; i++) {
    steppedData.push({ time: data[i].time, value: data[i].value });
    if (i < data.length - 1) {
        // הוספת נקודה לפני השינוי
        steppedData.push({ time: data[i].time, value: data[i + 1].value });
    }
}
lineSeries.setData(steppedData);

// אופציה 3: שימוש ב-Markers להדגשת נקודות שינוי
lineSeries.setMarkers([
    {
        time: '2025-01-01',
        position: 'inBar',
        color: '#2962FF',
        shape: 'circle',
        size: 1,
    },
]);
```

**סטטוס:** ✅ פתור (עם workaround)

---

### 2. RTL Support

**מגבלה:** תמיכה מוגבלת ב-RTL. הגרפים תמיד משמאל לימין.

**פתרון:**
- הגרפים משמאל לימין - זה בסדר גמור
- רק צריך לוודא שטקסט בתוך הגרפים (tooltips, labels) מוצג נכון (RTL)

**Workaround:**
```javascript
// וידוא שטקסט מוצג נכון
const tooltip = document.createElement('div');
tooltip.style.direction = 'rtl';
tooltip.style.textAlign = 'right';

// או שימוש ב-CSS
.tooltip {
    direction: rtl;
    text-align: right;
}
```

**סטטוס:** ✅ פתור (עם workaround)

---

### 3. Labels על נקודות

**מגבלה:** לא תומך ב-Labels על נקודות ישירות כמו Chart.js.

**פתרון:** שימוש ב-Markers עם text.

**Workaround:**
```javascript
lineSeries.setMarkers([
    {
        time: '2025-01-01',
        position: 'aboveBar',
        color: '#2962FF',
        shape: 'circle',
        text: 'Label Text',
        size: 1,
    },
]);
```

**סטטוס:** ✅ פתור (עם workaround)

---

### 4. Custom Tooltips

**מגבלה:** Tooltips מובנים מוגבלים.

**פתרון:** יצירת Custom Tooltips עם `subscribeCrosshairMove`.

**Workaround:**
```javascript
const tooltip = document.createElement('div');
tooltip.className = 'custom-tooltip';
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
            <div>Date: ${data.time}</div>
            <div>Value: ${data.value}</div>
        `;
    }
});
```

**סטטוס:** ✅ פתור (עם workaround)

---

### 5. Multiple Y-Axes

**מגבלה:** לא תומך ב-Multiple Y-Axes כמו Chart.js.

**פתרון:** כל series על Price Scale משלה - זה מספיק.

**Workaround:**
```javascript
// Scale שמאלי
const positionSizeSeries = chart.addLineSeries({
    priceScaleId: 'left',
});

// Scale ימני
const plSeries = chart.addLineSeries({
    priceScaleId: 'right',
});
```

**סטטוס:** ✅ פתור (עם workaround)

---

## השוואה לדרישות שלנו

### דרישות מהמוקאפ trade-history-page.html

| דרישה | תמיכה | פתרון |
|--------|-------|-------|
| Dual Y-Axes (Position Size + P/L) | ✅ | כל series על Price Scale משלה |
| Stepped Line (Position Size) | ⚠️ | `lineType: 1` או נתונים עם נקודות כפולות |
| Smooth Line (P/L) | ✅ | Line Series רגיל |
| Custom Tooltips | ⚠️ | Custom Tooltips עם `subscribeCrosshairMove` |
| Interactive Points (onClick) | ⚠️ | Markers עם event handlers |
| Time-based X-Axis | ✅ | Time Scale מובנה |
| Multiple Data Types | ✅ | Multiple Series |

---

## מסמכים קשורים

- [FEATURES.md](FEATURES.md) - רשימת תכונות מפורטת
- [EXAMPLES.md](EXAMPLES.md) - דוגמאות קוד
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - מדריך למפתח

