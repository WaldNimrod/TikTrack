# מדריך Load Order Validator - TikTrack
## Load Order Validator Guide

**תאריך יצירה:** 27 בינואר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ מוכן לשימוש

---

## 📋 סקירה כללית

`Load Order Validator` הוא כלי לבדיקת סדר טעינה בפועל בעמודים. הכלי משווה:
- סדר טעינה בפועל (מה שנטען ב-DOM)
- סדר טעינה צפוי (מה שמוגדר במניפסט)

---

## 🚀 שימוש

### בדיקת סדר טעינה לעמוד

```javascript
// בדפדפן, פתח את העמוד וקונסולה והרץ:
window.loadOrderValidator.run('page-name');
```

### בדיקה ידנית

```javascript
// בדיקת עמוד נוכחי
const pageName = window.location.pathname.split('/').pop().replace('.html', '');
window.loadOrderValidator.run(pageName);
```

### הצגת תוצאות

התוצאות יוצגו אוטומטית במודל, או ניתן לגשת אליהן דרך:
```javascript
window.loadOrderValidationResults
```

### ייצוא תוצאות

```javascript
window.loadOrderValidator.exportResults();
```

---

## 📊 סוגי אי-התאמות

### 1. סקריפטים חסרים (Missing Scripts)
- **חומרה**: error (אם required) / warning (אם לא required)
- **תיאור**: סקריפט צפוי במניפסט אבל לא נטען ב-DOM
- **דוגמה**: `core-systems.js` צפוי אבל לא נמצא

### 2. אי-התאמות בסדר (Order Mismatches)
- **חומרה**: error (אם הפרש > 5) / warning (אם הפרש 2-5)
- **תיאור**: סקריפט נטען בסדר שונה מהצפוי
- **דוגמה**: `preferences-v4.js` צפוי לפני `preferences-core-new.js` אבל נטען אחרי

### 3. סקריפטים נוספים (Extra Scripts)
- **חומרה**: info
- **תיאור**: סקריפט נטען אבל לא מוגדר במניפסט
- **דוגמה**: `custom-script.js` נטען אבל לא במניפסט

---

## 🔧 תיקון בעיות

### סקריפטים חסרים
1. זהה את הסקריפט החסר
2. הוסף את הסקריפט ל-HTML
3. או הסר אותו מהמניפסט אם הוא לא נדרש

### אי-התאמות בסדר
1. זהה את הסקריפטים בסדר שגוי
2. תקן את סדר הטעינה ב-HTML
3. או עדכן את ה-loadOrder במניפסט

### סקריפטים נוספים
1. זהה את הסקריפט הנוסף
2. הוסף אותו למניפסט אם הוא נדרש
3. או הסר אותו מה-HTML אם הוא לא נדרש

---

## 📖 תיעוד נוסף

- [Package Manifest](../../trading-ui/scripts/init-system/package-manifest.js) - מניפסט החבילות
- [Monitoring System V2](MONITORING_SYSTEM_V2.md) - מערכת מוניטורינג משופרת
- [Pages Standardization Plan](PAGES_STANDARDIZATION_PLAN.md) - תוכנית סטנדרטיזציה

---

**Last Updated:** January 27, 2025  
**Version:** 1.0.0  
**Author:** TikTrack Development Team


