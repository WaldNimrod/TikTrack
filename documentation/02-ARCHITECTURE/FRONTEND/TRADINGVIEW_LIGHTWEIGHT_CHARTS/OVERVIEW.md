# TradingView Lightweight Charts - Overview
# סקירה כללית

**תאריך יצירה:** 27 בינואר 2025  
**גרסה:** 1.0.0

---

## מה זה TradingView Lightweight Charts?

TradingView Lightweight Charts היא ספריית JavaScript קלה ומהירה ליצירת גרפים פיננסיים אינטראקטיביים. הספרייה פותחה על ידי TradingView ומתמחה בהצגת נתונים פיננסיים (מחירים, נפחים, וכו').

### תכונות עיקריות:
- ✅ **ביצועים מעולים** - מותאם לנתונים רבים (עד מאות אלפי נקודות)
- ✅ **קל משקל** - ~35KB (gzipped)
- ✅ **אינטראקטיבי** - zoom, pan, crosshair, tooltips
- ✅ **גמיש** - תמיכה במספר סוגי series (Line, Area, Candlestick, Bar, Histogram)
- ✅ **תמיכה ב-Multiple Price Scales** - כל series על scale משלה
- ✅ **Time-based X-Axis** - מותאם לתאריכים ושעות
- ✅ **Real-time Updates** - עדכון נתונים בזמן אמת
- ✅ **Open Source** - Apache 2.0 License

---

## למה בחרנו בו?

### יתרונות:
1. **ביצועים מעולים** - מהיר יותר מ-Chart.js לנתונים רבים
2. **מותאם לפיננסים** - בנוי במיוחד לגרפים פיננסיים
3. **קל משקל** - קטן יותר מ-Chart.js
4. **תמיכה ב-Multiple Price Scales** - כל series על scale משלה (מתאים ל-Dual Y-Axes)
5. **Time-based X-Axis** - מותאם לתאריכים ושעות
6. **Real-time Updates** - עדכון נתונים בזמן אמת
7. **Open Source** - Apache 2.0 License (חינמי לשימוש מסחרי)

### חסרונות:
1. **לא תומך ב-Stepped Lines ישירות** - צריך workaround (אבל יש `lineType: 1` ל-LineType.WithSteps)
2. **RTL Support מוגבל** - הגרפים משמאל לימין (זה בסדר), רק טקסט צריך להיות נכון
3. **לא תומך ב-Labels על נקודות ישירות** - צריך להשתמש ב-Markers

---

## השוואה למערכות אחרות

### TradingView Lightweight Charts vs Chart.js

| תכונה | TradingView | Chart.js |
|-------|-----------|----------|
| גודל | ~35KB | ~60KB |
| ביצועים (נתונים רבים) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| תמיכה בפיננסים | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Multiple Price Scales | ✅ | ⚠️ (מוגבל) |
| Time-based X-Axis | ✅ | ⚠️ (צריך plugin) |
| Stepped Lines | ⚠️ (lineType: 1) | ✅ |
| RTL Support | ⚠️ (מוגבל) | ✅ |
| Real-time Updates | ✅ | ✅ |

### TradingView Lightweight Charts vs ApexCharts

| תכונה | TradingView | ApexCharts |
|-------|-----------|------------|
| גודל | ~35KB | ~100KB |
| ביצועים | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| תמיכה בפיננסים | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| RTL Support | ⚠️ (מוגבל) | ✅ |
| Documentation | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## ארכיטקטורה בסיסית

### מבנה בסיסי:

```javascript
// 1. יצירת Chart
const chart = createChart(container, {
    width: 600,
    height: 400,
    layout: {
        background: { color: '#ffffff' },
        textColor: '#000000',
    },
});

// 2. הוספת Series
const lineSeries = chart.addLineSeries({
    lineType: 1, // Stepped Line
    color: '#2962FF',
});

// 3. הגדרת נתונים
lineSeries.setData([
    { time: '2025-01-01', value: 100 },
    { time: '2025-01-02', value: 105 },
]);

// 4. עדכון נתונים (real-time)
lineSeries.update({ time: '2025-01-03', value: 110 });
```

### Price Scales:

```javascript
// כל series על Price Scale משלה
const positionSizeSeries = chart.addLineSeries({
    priceScaleId: 'left', // Scale שמאלי
});

const plSeries = chart.addLineSeries({
    priceScaleId: 'right', // Scale ימני
});
```

---

## רישיון

### Apache 2.0 License

- **חינמי:** כן, חינמי לשימוש מסחרי
- **עלות:** אין עלות
- **Development:** אותו רישיון
- **Production:** אותו רישיון

### דרישות Attribution

**חובה לכלול:**
1. **NOTICE file** - קובץ NOTICE מ-GitHub repository
2. **קישור ל-TradingView** - קישור ל-https://www.tradingview.com

**מיקום Attribution:**
- Development: בקובץ README או footer
- Production: בקובץ README או footer (אותו מקום)

---

## קישורים

- **GitHub:** https://github.com/tradingview/lightweight-charts
- **Documentation:** https://tradingview.github.io/lightweight-charts/docs/
- **Examples:** https://tradingview.github.io/lightweight-charts/examples/
- **CDN:** https://cdn.jsdelivr.net/npm/lightweight-charts/dist/lightweight-charts.standalone.production.js

---

## מסמכים קשורים

- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - מדריך אינטגרציה
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - מדריך למפתח
- [FEATURES.md](FEATURES.md) - רשימת תכונות מפורטת
- [LIMITATIONS.md](LIMITATIONS.md) - מגבלות ופתרונות

