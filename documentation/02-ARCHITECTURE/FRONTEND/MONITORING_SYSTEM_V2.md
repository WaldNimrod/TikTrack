# מערכת מוניטורינג משופרת V2 - TikTrack
## Enhanced Monitoring System with HTML+DOM Comparison

**תאריך עדכון:** 2025-01-27  
**גרסה:** 2.0.0  
**סטטוס:** ✅ פעיל - בדיקה כפולה HTML+DOM  
**מטרה:** מערכת ניטור משופרת עם בדיקה כפולה, השוואה מפורטת, ומידע על תיעוד החבילות

## 📋 Overview

מערכת המוניטורינג המשופרת V2 מספקת בדיקה כפולה של קובץ HTML ושל DOM בפועל, השוואה מפורטת ביניהם, ומידע מקיף על תיעוד החבילות.

### 🎯 Key Features

- **בדיקה כפולה:** HTML + DOM comparison
- **השוואה מפורטת:** זיהוי הבדלים בסדר, סקריפטים חסרים/נוספים, הבדלים בנתיבים
- **מידע על תיעוד חבילות:** בדיקת התאמה למניפסט, סקריפטים חסרים, בעיות תיעוד
- **דוח מפורט:** פירוט מלא של כל שגיאה עם המלצות תיקון
- **ייצוא תוצאות:** JSON export ורשימת משימות תיקון

## 🔍 מה רלוונטי לתפקוד העמוד?

**ה-DOM בפועל** הוא מה שקובע את הסדר שבו הסקריפטים נטענים ומתבצעים. הסדר בקובץ HTML משפיע על הסדר ב-DOM, אבל אם יש cache או טעינה אסינכרונית, הסדר בפועל ב-DOM יכול להיות שונה. לכן חשוב לבדוק את שניהם ולהשוות.

## 🏗️ Architecture

### Core Files

| File | Purpose | Key Features |
|------|---------|--------------|
| `monitoring-functions.js` | פונקציות ניטור משופרות | בדיקה כפולה HTML+DOM, השוואה, תיעוד חבילות |
| `init-system-check.js` | ממשק בדיקה | הצגת תוצאות משופרות עם טאבים |
| `all-pages-monitoring-test.js` | בדיקה אוטומטית | סריקה של כל העמודים, יצירת רשימת משימות |

### Main Functions

#### `parseHTMLFile(pageName)`
קורא את קובץ ה-HTML דרך fetch ומחזיר את התוכן ורשימת הסקריפטים.

#### `extractScriptsFromHTML(htmlContent, pageName)`
מחלץ את כל תגי `<script src>` מהקובץ עם מידע על מיקום, נתיב, גרסה.

#### `compareHTMLvsDOM(htmlScripts, domScripts, pageConfig, packageManifest)`
משווה בין HTML ל-DOM ומזהה:
- הבדלים בסדר הטעינה
- סקריפטים ב-HTML שלא נטענו ב-DOM
- סקריפטים ב-DOM שלא ב-HTML (טעינה דינמית)
- הבדלים בנתיבים (versioning, query params)

#### `getPackageDocumentation(pageConfig, packageManifest)`
מאסוף מידע על כל חבילה:
- שם, תיאור, גרסה, dependencies, loadOrder
- רשימת סקריפטים עם סטטוס טעינה
- בעיות תיעוד

#### `runDetailedPageScan(pageName, pageConfig)`
מבצע סריקה מפורטת עם:
- קריאת HTML
- ניתוח DOM
- השוואה
- איסוף מידע על חבילות

## 📊 Report Structure

הדוח המשופר כולל:

### Summary
- סה"כ בעיות
- שגיאות קריטיות
- אזהרות
- סקריפטים ב-HTML
- סקריפטים ב-DOM
- הבדלים

### HTML Analysis
- רשימת כל הסקריפטים בקובץ HTML
- מיקום בקובץ
- LoadOrder מהמניפסט
- התאמה למניפסט

### DOM Analysis
- רשימת כל הסקריפטים ב-DOM
- סטטוס טעינה (נטען/נכשל)
- זמני טעינה
- סקריפטים שנכשלו בטעינה

### Comparison
- הבדלים בסדר טעינה
- סקריפטים חסרים ב-DOM
- סקריפטים נוספים ב-DOM
- הבדלים בנתיבים

### Package Documentation
- מידע על כל חבילה
- התאמה לתיעוד
- סקריפטים חסרים
- בעיות תיעוד

### Detailed Errors
- פירוט מפורט של כל שגיאה
- המלצות תיקון
- קישורים לתיעוד

## 🔧 Usage

### בדיקה ידנית של עמוד

1. פתח את העמוד בדפדפן
2. לחץ על כפתור הניטור (🔍) בראש הדף
3. התוצאות יוצגו במודל עם טאבים:
   - סיכום
   - ניתוח HTML
   - ניתוח DOM
   - השוואה
   - תיעוד חבילות
   - שגיאות מפורטות

### בדיקה אוטומטית של כל העמודים

```javascript
// הרצת בדיקה על כל העמודים
window.allPagesMonitoringTest.runAllPagesTest();

// ייצוא תוצאות
window.allPagesMonitoringTest.exportResults();

// ייצוא רשימת משימות תיקון
window.allPagesMonitoringTest.exportFixTasks();
```

## 📝 Related Documentation

- [Unified Initialization System](UNIFIED_INITIALIZATION_SYSTEM.md)
- [Package Manifest](../init-system/PACKAGE_MANIFEST.md)
- [Page Initialization Configs](../init-system/PAGE_INITIALIZATION_CONFIGS.md)

## 🔗 Files

- `trading-ui/scripts/monitoring-functions.js` - פונקציות ניטור משופרות
- `trading-ui/scripts/init-system-check.js` - ממשק בדיקה
- `trading-ui/scripts/init-system/all-pages-monitoring-test.js` - בדיקה אוטומטית

## 📅 Changelog

### Version 2.0.0 (2025-01-27)
- ✅ הוספת בדיקה כפולה HTML+DOM
- ✅ הוספת השוואה מפורטת
- ✅ הוספת מידע על תיעוד חבילות
- ✅ שיפור הדוח עם טאבים ופירוט מפורט
- ✅ הוספת פונקציות עזר (formatComparisonReport, generateFixRecommendations)
- ✅ יצירת סקריפט בדיקה אוטומטי לכל העמודים

### Version 1.0.0 (2025-01-20)
- בדיקה בסיסית של DOM
- זיהוי סקריפטים חסרים/נוספים
- בדיקת סדר טעינה


