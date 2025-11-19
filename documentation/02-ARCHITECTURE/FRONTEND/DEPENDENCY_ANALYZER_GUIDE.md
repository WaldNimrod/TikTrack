# מדריך Dependency Analyzer - TikTrack
## Dependency Analyzer Guide

**תאריך יצירה:** 27 בינואר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ מוכן לשימוש

---

## 📋 סקירה כללית

`Dependency Analyzer` הוא כלי לניתוח תלויות במניפסט החבילות. הכלי מזהה:
- מעגלי תלויות (circular dependencies)
- תלויות חסרות (missing dependencies)
- תלויות לא מוגדרות (undefined dependencies)

---

## 🚀 שימוש

### הרצת ניתוח תלויות

```javascript
// בדפדפן, פתח קונסולה והרץ:
window.dependencyAnalyzer.run();
```

### הצגת תוצאות

התוצאות יוצגו אוטומטית במודל, או ניתן לגשת אליהן דרך:
```javascript
window.dependencyAnalysisResults
```

### ייצוא תוצאות

```javascript
window.dependencyAnalyzer.exportResults();
```

---

## 📊 סוגי בעיות

### 1. מעגלי תלויות (Circular Dependencies)
- **חומרה**: error
- **תיאור**: חבילה A תלויה ב-B, ו-B תלויה ב-A
- **דוגמה**: `base → services → base`

### 2. תלויות חסרות (Missing Dependencies)
- **חומרה**: error
- **תיאור**: חבילה מציינת תלות בחבילה שלא קיימת במניפסט
- **דוגמה**: `preferences` תלוי ב-`missing-package`

### 3. תלויות לא מוגדרות (Undefined Dependencies)
- **חומרה**: error
- **תיאור**: חבילה מוזכרת כתלות אבל לא מוגדרת במניפסט
- **דוגמה**: `base` תלוי ב-`undefined-package`

---

## 🔧 תיקון בעיות

### מעגלי תלויות
1. זהה את המעגל
2. הסר תלות אחת מהמעגל
3. וודא שהפונקציונליות לא נפגעת

### תלויות חסרות
1. זהה את החבילה החסרה
2. הוסף את החבילה למניפסט
3. או הסר את התלות אם היא לא נדרשת

### תלויות לא מוגדרות
1. זהה את החבילה הלא מוגדרת
2. הוסף את החבילה למניפסט
3. או הסר את התלות אם היא לא נדרשת

---

## 📖 תיעוד נוסף

- [Package Manifest](../../trading-ui/scripts/init-system/package-manifest.js) - מניפסט החבילות
- [Monitoring System V2](MONITORING_SYSTEM_V2.md) - מערכת מוניטורינג משופרת

---

**Last Updated:** January 27, 2025  
**Version:** 1.0.0  
**Author:** TikTrack Development Team


