# TradingView Lightweight Charts - מקורות לדוגמאות

**תאריך יצירה:** 27 ינואר 2025  
**מטרה:** רשימת מקורות לדוגמאות מלאות של TradingView Lightweight Charts עם כל הפיצ'רים

---

## 📚 מקורות רשמיים

### 1. GitHub Repository הרשמי
**קישור:** https://github.com/tradingview/lightweight-charts

**מה יש שם:**
- קוד מקור מלא של הספרייה
- דוגמאות בסיסיות בתיקייה `examples/`
- תיעוד מפורט
- Issues ו-Pull Requests עם פתרונות לבעיות נפוצות

**דוגמאות רלוונטיות:**
- `/examples/percentage-scale.html` - תצוגה באחוזים
- `/examples/price-scale-types.html` - לוגריתמי/ליניארי
- `/examples/studies-api.html` - כלי מדידה וציור

### 2. Playground אינטראקטיבי
**קישור:** https://tradingview.github.io/lightweight-charts/

**מה יש שם:**
- דוגמאות אינטראקטיביות שניתן לערוך
- כל הפיצ'רים האפשריים
- קוד שניתן להעתיק ישירות

### 3. Documentation הרשמית
**קישור:** https://tradingview.github.io/lightweight-charts/

**מה יש שם:**
- API Reference מלא
- דוגמאות קוד לכל פיצ'ר
- מדריכים מפורטים

---

## 🔍 רפוזיטוריומים פופולריים ב-GitHub

### 1. TradingView Lightweight Charts Examples
**חיפוש ב-GitHub:**
```
lightweight-charts examples complete implementation
```

**רפוזיטוריומים מומלצים:**
- `tradingview/lightweight-charts` - הרפו הרשמי ⭐
- `tradingview/lightweight-charts-examples` - דוגמאות רשמיות
- `mirror-one/react-lightweight-charts` - wrapper ל-React עם דוגמאות
- `ricardo-ch/react-tradingview-widgets` - דוגמאות עם React

### 2. דוגמאות עם כלי ציור
**חיפוש:**
```
lightweight-charts drawing tools annotations markers
```

---

## 💡 פיצ'רים ספציפיים שאנחנו מחפשים

### 1. תצוגה באחוזים (Percentage Scale)
**מה לחפש:**
- `priceFormat: { type: 'percent' }`
- Percentage calculation from base value
- Right Y-axis percentage display

**דוגמה בקוד:**
```javascript
series.applyOptions({
    priceFormat: {
        type: 'percent',
        precision: 2
    }
});
```

### 2. ציר Y לוגריתמי (Logarithmic Scale)
**מה לחפש:**
- `rightPriceScale: { mode: 1 }` - 0 = Normal, 1 = Logarithmic
- `logarithmic` scale mode

**דוגמה בקוד:**
```javascript
chart.applyOptions({
    rightPriceScale: {
        mode: 1  // Logarithmic
    }
});
```

### 3. כלי ציור ומדידה (Drawing Tools)
**מה לחפש:**
- Canvas overlay for drawing
- Markers API
- Crosshair events
- Custom drawing layer

**ספריות נוספות:**
- `fabric.js` - ספרייה לציור על canvas
- `paper.js` - כלי ציור מתקדמים
- Custom canvas overlay (מה שמימשנו)

---

## 🎯 המלצות

### אפשרות 1: שימוש בדוגמה רשמית
1. לפתוח את ה-Playground הרשמי: https://tradingview.github.io/lightweight-charts/
2. לקחת דוגמה בסיסית
3. להוסיף את הפיצ'רים שלנו:
   - תצוגת אחוזים
   - לוגריתמי/ליניארי
   - כלי ציור (canvas overlay)

### אפשרות 2: לקחת דוגמה מ-GitHub
1. לפתוח: https://github.com/tradingview/lightweight-charts
2. לבדוק את תיקיית `examples/`
3. לקחת דוגמה דומה ולהתאים

### אפשרות 3: לבדוק רפוזיטוריומים עם דוגמאות מלאות
**חיפוש:**
```
site:github.com lightweight-charts interactive chart complete
```

---

## 📝 קישורים ישירים

### דוגמאות רשמיות:
1. **Basic Line Chart:** https://tradingview.github.io/lightweight-charts/tutorials/basics
2. **Percentage Scale:** https://github.com/tradingview/lightweight-charts/tree/master/examples
3. **Price Scale Types:** https://tradingview.github.io/lightweight-charts/docs/api/interfaces/PriceScaleOptions

### דוגמאות אינטראקטיביות:
1. **Playground:** https://tradingview.github.io/lightweight-charts/
2. **CodeSandbox Examples:** https://codesandbox.io/examples/package/tradingview-lightweight-charts

---

## 🔧 מה לעשות כעת

1. **לבדוק את הדוגמאות הרשמיות:**
   - לפתוח https://github.com/tradingview/lightweight-charts/tree/master/examples
   - למצוא דוגמאות עם הפיצ'רים שאנחנו מחפשים

2. **לקחת דוגמה בסיסית ולהתאים:**
   - לקחת דוגמה של line/candlestick chart
   - להוסיף percentage scale
   - להוסיף logarithmic scale toggle
   - להוסיף canvas overlay לציור

3. **לבדוק רפוזיטוריומים נוספים:**
   - לחפש ב-GitHub: `lightweight-charts percentage logarithmic drawing`
   - לבדוק projects עם stars רבים

---

**תאריך עדכון:** 27 ינואר 2025  
**גרסה:** 1.0.0

