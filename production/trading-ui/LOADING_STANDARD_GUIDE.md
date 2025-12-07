# תקן טעינה אחיד לכל העמודים - TikTrack

## סקירה כללית

תקן זה מגדיר את הסדר והמבנה האחיד לטעינת קבצי CSS ו-JavaScript בכל עמוד במערכת TikTrack.

## עקרונות יסוד

### 1. סדר טעינה קריטי
- **CSS**: Bootstrap חייב להיטען לפני CSS שלנו
- **JavaScript**: המערכת המאוחדת חייבת להיטען בסדר הנכון
- **IndexedDB**: חייב להיות מאותחל לפני כל מערכת אחרת

### 2. ארכיטקטורה מאוחדת
- כל העמודים משתמשים באותה מערכת אתחול
- אין קבצי `*-init.js` נפרדים
- כל הפונקציונליות נמצאת במערכת המאוחדת

## מבנה תקן הטעינה

### שלב 1: CSS Loading
```html
<!-- Bootstrap CSS (חובה ראשון) -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- CSS Files - אחרי Bootstrap כדי לדרוס אותו -->
<link rel="stylesheet" href="styles-new/01-settings/_variables.css?v=1.0.0">
<link rel="stylesheet" href="styles-new/01-settings/_colors-dynamic.css?v=1.0.1">
<!-- ... שאר קבצי CSS לפי הסדר הנכון ... -->

<!-- Bootstrap Icons -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

<!-- Font Awesome -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

<!-- Header Styles -->
<link rel="stylesheet" href="styles-new/header-styles.css?v=v6.0.0">

<!-- Page-specific CSS (אופציונלי) -->
<!-- <link rel="stylesheet" href="styles-new/06-components/_page-specific.css?v=1.0.0"> -->
```

### שלב 2: JavaScript Loading (בסדר קריטי)
```html
<!-- Error Handlers (חובה ראשון) -->
<script src="scripts/error-handlers.js"></script>

<!-- Header System -->
<script src="scripts/header-system.js?v=v6.0.0"></script>

<!-- Dynamic Systems -->
<script src="scripts/color-scheme-system.js"></script>
<script src="scripts/preferences-core.js"></script>
<script src="scripts/color-demo-toggle.js"></script>

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<!-- Floating UI (Optional - for smart positioning) -->
<!-- Note: UnifiedUIPositioningService has fallback if not loaded -->
<script src="https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.6.0/dist/floating-ui.dom.min.js"></script>

<!-- GSAP (Optional - for smooth animations) -->
<!-- Note: UnifiedUIPositioningService has CSS transitions fallback if not loaded -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>

<!-- Core System Scripts -->
<script src="scripts/console-cleanup.js"></script>
<script src="scripts/translation-utils.js"></script>
<script src="scripts/data-utils.js"></script>
<script src="scripts/global-favicon.js"></script>
<script src="scripts/ui-utils.js"></script>
<script src="scripts/table-mappings.js"></script>
<script src="scripts/date-utils.js"></script>
<script src="scripts/tables.js"></script>
<script src="scripts/linked-items.js"></script>
<script src="scripts/page-utils.js"></script>

<!-- Unified Initialization System (CRITICAL ORDER) -->
<script src="scripts/page-initialization-configs.js"></script>
<script src="scripts/unified-app-initializer.js"></script>

<!-- Page-specific scripts -->
<!-- <script src="scripts/page-specific.js"></script> -->
```

## דרישות חובה

### 1. מערכת אתחול מאוחדת
- **חובה**: כל עמוד חייב לטעון את המערכת המאוחדת
- **אסור**: שימוש בקבצי `*-init.js` נפרדים
- **חובה**: סדר טעינה נכון של המערכת המאוחדת

### 2. IndexedDB Initialization
- **חובה**: IndexedDB מאותחל במערכת המאוחדת
- **אסור**: אתחול IndexedDB מחוץ למערכת המאוחדת
- **חובה**: המתנה לאתחול IndexedDB לפני שימוש

### 3. Template Structure
```html
<body>
    <div class="background-wrapper">
        <div id="unified-header"></div>
        <div class="page-body">
            <div class="main-content">
                <!-- Page content goes here -->
            </div>
        </div>
    </div>
</body>
```

## עמודים שעברו סטנדרטיזציה

✅ **כל 22 העמודים הראשיים** עברו סטנדרטיזציה מלאה:

1. index.html
2. alerts.html
3. background-tasks.html (תוקן)
4. cash_flows.html
5. chart-management.html
6. constraints.html
7. css-management.html
8. db_display.html
9. db_extradata.html
10. designs.html
11. executions.html
12. external-data-dashboard.html
13. js-map.html (הועבר לארכיון בנובמבר 2025)
14. notes.html
15. notifications-center.html
16. preferences.html
17. research.html
18. system-management.html
19. tickers.html
20. trade_plans.html
21. trades.html
22. trading_accounts.html

## בדיקות איכות

### בדיקות חובה לכל עמוד חדש:
1. **טעינה**: האם העמוד נטען ללא שגיאות?
2. **מערכת מאוחדת**: האם המערכת המאוחדת נטענת?
3. **IndexedDB**: האם IndexedDB מאותחל?
4. **Race Condition**: האם אין הודעות "UnifiedIndexedDB not initialized yet"?
5. **פונקציונליות**: האם כל הפונקציות עובדות?

### בדיקות בקונסולה:
```javascript
// בדיקה שהמערכת המאוחדת נטענה
console.log('Unified App Initializer:', window.unifiedAppInit);

// בדיקה ש-IndexedDB מאותחל
console.log('IndexedDB Ready:', window.UnifiedIndexedDB && window.UnifiedIndexedDB.isInitialized);

// בדיקה שאין שגיאות
// (אין הודעות "UnifiedIndexedDB not initialized yet")
```

## קבצים אסורים

❌ **אסור לשימוש** (נמחקו):
- `background-tasks-init.js`
- `cash-flows-init.js`
- `executions-init.js`
- `notes-init.js`
- `tickers-init.js`
- `trade-plans-init.js`

## קבצים נדרשים

✅ **חובה לשימוש**:
- `page-initialization-configs.js`
- `unified-app-initializer.js`

## תחזוקה

### עדכון התקן:
1. עדכן את `LOADING_STANDARD_TEMPLATE.html`
2. עדכן את `LOADING_STANDARD_GUIDE.md`
3. בדוק שכל העמודים עומדים בתקן
4. עדכן את רשימת העמודים שעברו סטנדרטיזציה

### בדיקות תקופתיות:
- בדוק שאין עמודים חדשים שלא עומדים בתקן
- בדוק שאין חזרה לשימוש בקבצי `*-init.js`
- בדוק שהמערכת המאוחדת עובדת בכל העמודים

---

**תאריך עדכון אחרון**: ספטמבר 2025  
**גרסה**: 1.0.0  
**מחבר**: TikTrack Development Team


