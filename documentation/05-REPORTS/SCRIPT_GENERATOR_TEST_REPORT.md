# דוח בדיקת כלי ייצור קוד טעינה

**תאריך:** 1.11.2025

## סיכום

נבדקו 8 עמודים:

- **trades**: 11 חבילות, 66 סקריפטים
- **executions**: 12 חבילות, 67 סקריפטים
- **alerts**: 11 חבילות, 66 סקריפטים
- **trade_plans**: 11 חבילות, 66 סקריפטים
- **trading_accounts**: 11 חבילות, 66 סקריפטים
- **cash_flows**: 11 חבילות, 66 סקריפטים
- **tickers**: 11 חבילות, 66 סקריפטים
- **notes**: 11 חבילות, 66 סקריפטים

## דוגמאות קוד מיוצר

### trades

```html
    <!-- ===== START SCRIPT LOADING ORDER ===== -->
    <!-- ⚠️ DO NOT MODIFY MANUALLY - Use PageTemplateGenerator.generateScriptTagsForPage() -->
    <!-- 🎯 Page: trades | Generated: 2025-11-01T18:21:43.277Z -->
    <!-- 📦 Packages: base, services, ui-advanced, crud, preferences, validation, entity-details, entity-services, info-summary, modules, init-system -->

    <!-- ===== PACKAGE 1: BASE PACKAGE (loadOrder: 1) ===== -->
    <!-- מערכות ליבה חובה לכל עמוד -->
    <!-- Dependencies:  -->
    <!-- Critical: YES | Version: 2.0.0 -->
    <script src="scripts/global-favicon.js?v=1.0.0"></script> <!-- [1] ניהול favicon -->
    <script src="scripts/notification-system.js?v=1.0.0"></script> <!-- [2] מערכת התראות -->
    <script src="scripts/ui-utils.js?v=1.0.0"></script> <!-- [3] כלי עזר UI -->
    <script src="scripts/warning-system.js?v=1.0.0"></script> <!-- [4] מערכת אזהרות -->
    <script src="scripts/error-handlers.js?v=1.0.0"></script> <!-- [5] מערכת טיפול בשגיאות -->
    <script src="scripts/unified-cache-manager.js?v=1.0.0"></script> <!-- [6] מנהל מטמון מאוחד -->
    <script src="scripts/cache-sync-manager.js?v=1.0.0"></script> <!-- [7] מנהל סנכרון מטמון -->
    <script src="scripts/header-system.js?v=1.0.0"></script> <!-- [8] מערכת כותרת -->
    <script src="scripts/page-utils.js?v=1.0.0"></script> <!-- [9] כלי עזר עמוד -->
    <script src="scripts/translation-utils.js?v=1.0.0"></script> <!-- [10] תרגומים -->
    <script src="scripts/button-icons.js?v=1.0.0"></script> <!-- [11] מערכת איקונים וכפתורים -->
    <script src="scripts/event-handler-manager.js?v=1.0.0"></script> <!-- [12] מערכת ניהול אירועים מרכזית -->
    <script src="scripts/button-system-init.js?v=1.0.0"></script> <!-- [13] מערכת כפתורים -->
    <script src="scripts/color-scheme-system.js?v=1.0.0"></script> <!-- [14] מערכת צבעים דינמית -->

    <!-- ===== PACKAGE 2: SERVICES PACKAGE (loadOrder: 2) ===== -->
    <!-- שירותים כלליים -->
    <!-- Dependencies: base -->
    <!-- Critical: NO | Version: 2.0.0 -->
    <script src="scripts/services/data-collection-service.js?v=1.0.0"></script> <!-- [15] שירות איסוף נתונים -->
    <script src="scripts/services/field-renderer-service.js?v=1.0.0"></script> <!-- [16] שירות רנדור שדות -->
    <script src="scripts/services/select-populator-service.js?v=1.0.0"></script> <!-- [17] שירות מילוי select boxes -->
    <script src="scripts/services/statistics-calculator.js?v=1.0.0"></script> <!-- [18] מחשבון סטטיסטיקות -->
    <script src="scripts/services/default-value-setter.js?v=1.0.0"></script> <!-- [19] שירות ברירות מחדל -->
    <script src="scripts/services/crud-response-handler.js?v=1.0.0"></script> <!-- [20] מטפל בתגובות CRUD -->
    <script src="scripts/services/linked-items-service.js?v=1.0.0"></script> <!-- [21] שירות לוגיקה משותפת לפריטים מקושרים -->

    <!-- ===== PACKAGE 3: UI ADVANCED PACKAGE (loadOrder: 3) ===== -->
    <!-- ממשק משתמש מתקדם -->
    <!-- Dependencies: base, services -->
    <!-- Critical: NO | Version: 2.0.0 -->
    <script src="scripts/tables.js?v=1.0.0"></script> <!-- [22] מערכת טבלאות -->
    <script src="scripts/pagination-system.js?v=1.0.0"></script> <!-- [23] מערכת עימוד -->
    <script src="scripts/modules/actions-menu-system.js?v=1.0.0"></script> <!-- [24] מערכת תפריט פעולות -->

    <!-- ===== PACKAGE 4: MODULES PACKAGE (loadOrder: 3.5) ===== -->
    <!-- מודולים כלליים -->
    <!-- Dependencies: base, services -->
    <!-- Critical: NO | Version: 2.0.0 -->
    <script src="scripts/modal-navigation-manager.js?v=1.0.0"></script> <!-- [25] מערכת ניווט מודולים מקוננים -->
    <script src="scripts/modal-manager-v2.js?v=1.0.0"></script> <!-- [26] מנהל מודלים V2 -->
    <script src="scripts/modules/core-systems.js?v=1.0.0"></script> <!-- [27] מערכות ליבה -->
    <script src="scripts/modules/data-basic.js?v=1.0.0"></script> <!-- [28] נתונים בסיסיים -->
    <script src="scripts/modules/ui-basic.js?v=1.0.0"></script> <!-- [29] ממשק בסיסי -->
    <script src="scripts/modules/cache-module.js?v=1.0.0"></script> <!-- [30] מודול מטמון -->
    <script src="scripts/modules/data-advanced.js?v=1.0.0"></script> <!-- [31] נתונים מתקדמים -->
    <script src="scripts/modules/ui-advanced.js?v=1.0.0"></script> <!-- [32] ממשק מתקדם -->
    <script src="scripts/modules/communication-module.js?v=1.0.0"></script> <!-- [33] מודול תקשורת -->
    <script src="scripts/modules/business-module.js?v=1.0.0"></script> <!-- [34] מודול עסקי -->
    <script src="scripts/modules/localstorage-sync.js?v=1.0.0"></script> <!-- [35] סנכרון localStorage -->
    <script src="scripts/modules/polling-manager.js?v=1.0.0"></script> <!-- [36] מנהל סקר -->
    <script src="scripts/modules/dynamic-loader-config.js?v=1.0.0"></script> <!-- [37] תצורת טעינה דינמית -->

    <!-- ===== PACKAGE 5: CRUD OPERATIONS PACKAGE (loadOrder: 4) ===== -->
    <!-- מערכות לניהול נתונים וטבלאות -->
    <!-- Dependencies: base, services -->
    <!-- Critical: NO | Version: 2.0.0 -->
    <script src="scripts/date-utils.js?v=1.0.0"></script> <!-- [38] כלי עזר תאריכים -->
    <script src="scripts/data-utils.js?v=1.0.0"></script> <!-- [39] כלי עזר נתונים כלליים -->

    <!-- ===== PACKAGE 6: PREFERENCES PACKAGE (loadOrder: 5) ===== -->
    <!-- מערכת העדפות משתמש v2.0 (6 קבצים) -->
    <!-- Dependencies: base -->
    <!-- Critical: NO | Version: 2.0.0 -->
    <script src="scripts/preferences-core-new.js?v=1.0.0"></script> <!-- [40] ליבת העדפות (ללא צבעים) -->
    <script src="scripts/preferences-colors.js?v=1.0.0"></script> <!-- [41] מערכת צבעים (60+ העדפות) -->
    <script src="scripts/preferences-profiles.js?v=1.0.0"></script> <!-- [42] ניהול פרופילים -->
    <script src="scripts/preferences-lazy-loader.js?v=1.0.0"></script> <!-- [43] lazy loading system -->
    <script src="scripts/preferences-validation.js?v=1.0.0"></script> <!-- [44] validation system -->
    <script src="scripts/preferences-ui.js?v=1.0.0"></script> <!-- [45] ממשק משתמש -->

    <!-- ===== PACKAGE 7: VALIDATION PACKAGE (loadOrder: 6) ===== -->
    <!-- מערכות ולידציה -->
    <!-- Dependencies: base -->
    <!-- Critical: NO | Version: 2.0.0 -->
    <script src="scripts/validation-utils.js?v=1.0.0"></script> <!-- [46] כלי ולידציה -->

    <!-- ===== PACKAGE 8: ENTITY SERVICES PACKAGE (loadOrder: 10) ===== -->
    <!-- שירותי ישויות -->
    <!-- Dependencies: base, services -->
    <!-- Critical: NO | Version: 2.0.0 -->
    <script src="scripts/account-service.js?v=1.0.0"></script> <!-- [47] שירות חשבונות -->
    <script src="scripts/services/account-balance-service.js?v=1.0.0"></script> <!-- [48] שירות יתרות חשבונות -->
    <script src="scripts/alert-service.js?v=1.0.0"></script> <!-- [49] שירות התראות -->
    <script src="scripts/ticker-service.js?v=1.0.0"></script> <!-- [50] שירות טיקרים -->
    <script src="scripts/trade-plan-service.js?v=1.0.0"></script> <!-- [51] שירות תכניות מסחר -->
    <script src="scripts/active-alerts-component.js?v=1.0.0"></script> <!-- [52] רכיב התראות פעילות -->
    <script src="scripts/condition-translator.js?v=1.0.0"></script> <!-- [53] מתרגם תנאים -->
    <script src="scripts/constraints.js?v=1.0.0"></script> <!-- [54] מערכת אילוצים -->
    <script src="scripts/linked-items.js?v=1.0.0"></script> <!-- [55] פריטים מקושרים -->
    <script src="scripts/related-object-filters.js?v=1.0.0"></script> <!-- [56] פילטרים של אובייקטים קשורים -->

    <!-- ===== PACKAGE 9: ENTITY DETAILS PACKAGE (loadOrder: 17) ===== -->
    <!-- מערכות פרטי ישויות -->
    <!-- Dependencies: base, services, ui-advanced, crud, preferences -->
    <!-- Critical: NO | Version: 2.0.0 -->
    <script src="scripts/entity-details-api.js?v=1.0.0"></script> <!-- [57] API פרטי ישויות -->
    <script src="scripts/entity-details-renderer.js?v=1.0.0"></script> <!-- [58] מציג פרטי ישויות -->
    <script src="scripts/entity-details-modal.js?v=1.0.0"></script> <!-- [59] מודל פרטי ישויות -->

    <!-- ===== PACKAGE 10: INFO SUMMARY PACKAGE (loadOrder: 18) ===== -->
    <!-- מערכת סיכום נתונים מאוחדת לכל העמודים -->
    <!-- Dependencies: base, services -->
    <!-- Critical: NO | Version: 1.0.0 -->
    <script src="scripts/info-summary-system.js?v=1.0.0"></script> <!-- [60] מערכת סיכום נתונים ליבה -->
    <script src="scripts/info-summary-configs.js?v=1.0.0"></script> <!-- [61] תצורות עמודים לסיכום נתונים -->

    <!-- ===== PACKAGE 11: INITIALIZATION PACKAGE (loadOrder: 19) ===== -->
    <!-- מערכות אתחול וניטור -->
    <!-- Dependencies: base, crud, services, ui-advanced, modules, preferences, validation, conditions, external-data, charts, logs, cache, entity-services, helper, system-management, management, dev-tools, filters, advanced-notifications, entity-details, info-summary, import -->
    <!-- Critical: NO | Version: 2.0.0 -->
    <script src="scripts/init-system/package-manifest.js?v=1.0.0"></script> <!-- [62] מנפסט חבילות -->
    <script src="scripts/page-initialization-configs.js?v=1.0.0"></script> <!-- [63] הגדרות אתחול עמודים -->
    <script src="scripts/init-system-check.js?v=1.0.0"></script> <!-- [64] בדיקת מערכת איתחול -->
    <script src="scripts/monitoring-functions.js?v=1.0.0"></script> <!-- [65] פונקציות ניטור עמודים -->
    <script src="scripts/unified-app-initializer.js?v=1.0.0"></script> <!-- [66] מאתחל אפליקציה מאוחד -->

    <!-- ===== END SCRIPT LOADING ORDER ===== -->
    <!-- 🔧 Total Scripts: 66 | For maintenance: Use PageTemplateGenerator.generateScriptTagsForPage("trades") -->
```

