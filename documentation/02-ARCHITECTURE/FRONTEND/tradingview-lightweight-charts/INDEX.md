# TradingView Lightweight Charts - אינדקס דוקומנטציה
# TradingView Lightweight Charts Documentation Index

**תאריך יצירה:** 27 ינואר 2025  
**גרסה:** 1.0  
**סטטוס:** 📚 דוקומנטציה פעילה

---

## 📋 סקירה כללית

דוקומנטציה מקומית מקיפה למערכת TradingView Lightweight Charts במערכת TikTrack.

### מה זה TradingView Lightweight Charts?

TradingView Lightweight Charts™ היא ספריית קוד פתוח (Apache 2.0) ליצירת גרפים פיננסיים אינטראקטיביים. הספרייה מתאפיינת בגודל קטן (~35KB), ביצועים גבוהים ותמיכה מלאה בגרפים פיננסיים.

### למה TradingView Lightweight Charts?

- ✅ **מיועד לגרפים פיננסיים** - בנוי במיוחד למסחר
- ✅ **ביצועים מעולים** - אופטימיזציה לכמויות נתונים גדולות
- ✅ **קוד פתוח** - Apache 2.0
- ✅ **פיתוח פעיל** - מתוחזק על ידי TradingView
- ✅ **תמיכה מתקדמת** - candlesticks, volume, drawing tools

---

## 📚 מבנה הדוקומנטציה

### מדריכים מהירים
- **[Quick Start Guide](QUICK_START_GUIDE.md)** - התחלה מהירה עם דוגמאות
- **[Integration Guide](INTEGRATION_GUIDE.md)** - אינטגרציה במערכת TikTrack

### הפניות טכניות
- **[API Reference](API_REFERENCE.md)** - הפניה מלאה ל-API
- **[Examples](EXAMPLES.md)** - דוגמאות קוד מפורטות

### מדריכים מפורטים
- **[User Guide](USER_GUIDE.md)** - מדריך משתמש מלא
- **[Developer Guide](DEVELOPER_GUIDE.md)** - מדריך מפתח מלא
- **[Troubleshooting](TROUBLESHOOTING.md)** - פתרון בעיות

### מידע נוסף
- **[License and Attribution](LICENSE_AND_ATTRIBUTION.md)** - רישיון ואטריביוציה
- **[External Links](EXTERNAL_LINKS.md)** - קישורים לתיעוד הרשמי

---

## 🔗 קישורים מהירים

### תיעוד רשמי
- **Documentation**: https://tradingview.github.io/lightweight-charts/
- **API Reference**: https://tradingview.github.io/lightweight-charts/docs/api
- **Examples**: https://tradingview.github.io/lightweight-charts/examples/
- **Tutorials**: https://tradingview.github.io/lightweight-charts/tutorials/

### GitHub
- **Repository**: https://github.com/tradingview/lightweight-charts
- **Releases**: https://github.com/tradingview/lightweight-charts/releases
- **Issues**: https://github.com/tradingview/lightweight-charts/issues

### מידע נוסף
- **Website**: https://www.tradingview.com/lightweight-charts/
- **License**: Apache 2.0
- **Attribution**: https://www.tradingview.com/

---

## 🚀 התחלה מהירה

### התקנה
```bash
npm install lightweight-charts
```

### דוגמה בסיסית
```javascript
import { createChart } from 'lightweight-charts';

const chart = createChart(document.getElementById('chart'), {
    width: 800,
    height: 400,
});

const lineSeries = chart.addLineSeries();
lineSeries.setData([
    { time: '2025-01-01', value: 100 },
    { time: '2025-01-02', value: 105 },
]);
```

### קישורים נוספים
- 📖 [Quick Start Guide](QUICK_START_GUIDE.md) - מדריך התחלה מפורט
- 🔧 [Integration Guide](INTEGRATION_GUIDE.md) - אינטגרציה במערכת

---

## 📊 תכונות עיקריות

### סוגי גרפים
- ✅ **Line Series** - קווי גרף
- ✅ **Area Series** - גרפי שטח
- ✅ **Bar Series** - גרפי עמודות
- ✅ **Candlestick Series** - גרפי נרות
- ✅ **Histogram Series** - היסטוגרמות
- ✅ **Baseline Series** - קווי בסיס

### תכונות מתקדמות
- ✅ **Multiple Series** - מספר סדרות על גרף אחד
- ✅ **Price Scales** - צירי מחיר (left/right)
- ✅ **Time Scale** - ציר זמן מתקדם
- ✅ **Crosshair** - crosshair אינטראקטיבי
- ✅ **Tooltip** - tooltips מותאמים
- ✅ **Zoom & Pan** - זום ופאן מובנים
- ✅ **Real-time Updates** - עדכונים בזמן אמת

---

## ⚠️ מגבלות ידועות

### מגבלות טכניות
- ⚠️ **לא תומך ב-Dual Y-Axes** - כל סדרה על ציר Y משלה (אבל אפשר לעבוד עם price scales)
- ⚠️ **לא תומך ב-Stepped Lines** - רק קווים חלקים
- ⚠️ **RTL Support מוגבל** - צריך עבודה נוספת
- ⚠️ **לא תומך ב-Labels על נקודות** - רק tooltips

### פתרונות אפשריים
- **Dual Y-Axes**: שימוש ב-price scales (left/right) עם priceFormatter
- **Stepped Lines**: שימוש ב-Area Series עם step line effect
- **RTL**: CSS transforms או custom rendering
- **Labels**: custom overlay עם HTML/CSS

---

## 📝 עדכונים אחרונים

### 27 ינואר 2025
- ✅ יצירת מבנה דוקומנטציה
- ✅ יצירת INDEX.md
- ✅ תוכנית מימוש ראשונית

---

**מחבר:** TikTrack Development Team  
**עדכון אחרון:** 27 ינואר 2025

