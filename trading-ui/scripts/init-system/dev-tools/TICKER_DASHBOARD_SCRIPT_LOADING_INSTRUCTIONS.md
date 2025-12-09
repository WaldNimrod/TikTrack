# הוראות לטעינת סקריפטים עבור ticker-dashboard.html

## סטטוס נוכחי

העמוד `ticker-dashboard.html` מכיל הערות והנחיות לטעינת סקריפטים, אבל עדיין לא טוען את כל הסקריפטים לפי המניפסט.

## Packages נדרשים

לפי `page-initialization-configs.js`, העמוד צריך לטעון את החבילות הבאות:

1. `base` (loadOrder: 1) - Core systems
2. `services` (loadOrder: 2) - General services
3. `ui-advanced` (loadOrder: 3) - Advanced interface
4. `modules` (loadOrder: 3.5) - General modules
5. `crud` (loadOrder: 4) - Data and table management
6. `preferences` (loadOrder: 5) - User preferences system
7. `external-data` (loadOrder: 7) - External data systems
8. `entity-services` (loadOrder: 10) - Entity services
9. `entity-details` (loadOrder: 17) - Entity details systems
10. `info-summary` (loadOrder: 18) - Info summary system
11. `init-system` (loadOrder: 22) - Initialization and monitoring

## שימוש בכלי PageTemplateGenerator

### שלב 1: טעינת המניפסטים בדפדפן

1. פתח את `ticker-dashboard.html` בדפדפן
2. פתח את הקונסולה (F12)
3. טען את המניפסטים:

   ```javascript
   // טען את package-manifest.js
   const script1 = document.createElement('script');
   script1.src = 'scripts/init-system/package-manifest.js?v=1.0.0';
   document.head.appendChild(script1);
   
   // טען את page-initialization-configs.js
   const script2 = document.createElement('script');
   script2.src = 'scripts/page-initialization-configs.js?v=1.0.0';
   document.head.appendChild(script2);
   
   // טען את PageTemplateGenerator
   const script3 = document.createElement('script');
   script3.src = 'scripts/init-system/dev-tools/page-template-generator.js?v=1.0.0';
   document.head.appendChild(script3);
   ```

### שלב 2: יצירת קוד הטעינה

לאחר שהמניפסטים נטענו, הרץ:

```javascript
// המתן שהמניפסטים יטענו
setTimeout(() => {
  if (window.PageTemplateGenerator && window.PACKAGE_MANIFEST) {
    const html = window.PageTemplateGenerator.generateScriptTagsForPage('ticker-dashboard');
    console.log(html);
    // העתק את הפלט והדבק ב-ticker-dashboard.html במקום החלק הנוכחי
  } else {
    console.error('PageTemplateGenerator or PACKAGE_MANIFEST not available');
  }
}, 2000);
```

### שלב 3: עדכון העמוד

1. העתק את הפלט מהקונסולה
2. פתח את `ticker-dashboard.html`
3. מצא את החלק שמתחיל ב-`<!-- =============================================================== -->`
4. החלף את כל החלק עד `<!-- All other scripts will be loaded... -->` עם הפלט החדש
5. שמור את הקובץ

## הערות חשובות

1. **טעינה סטטית**: כל הסקריפטים נטענים סטטית ב-HTML, לא דינמית
2. **סדר טעינה**: הסדר נקבע לפי `loadOrder` של כל package
3. **תלויות**: כל package תלוי ב-packages שמוגדרים ב-`dependencies`
4. **unified-app-initializer**: נטען אחרון ומאתחל את כל המערכות

## בדיקה

לאחר העדכון, בדוק:

1. פתח את העמוד בדפדפן
2. בדוק את הקונסולה - אין שגיאות טעינה
3. בדוק שהעמוד עובד - כל הפונקציונליות פעילה
4. הרץ את מערכת הניטור: `window.runDetailedPageScan()`

## קישורים רלוונטיים

- `trading-ui/scripts/init-system/package-manifest.js` - מניפסט כל החבילות
- `trading-ui/scripts/page-initialization-configs.js` - הגדרות עמודים
- `trading-ui/scripts/init-system/dev-tools/page-template-generator.js` - כלי יצירת קוד טעינה
- `documentation/02-ARCHITECTURE/FRONTEND/UNIFIED_INITIALIZATION_SYSTEM.md` - תיעוד מערכת האיתחול



