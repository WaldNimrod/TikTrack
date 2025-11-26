<!-- 872191ce-71bc-4be6-8cdf-3615f67375ca 66afe42d-69e2-4240-9889-77dd60877a1c -->
# תוכנית: שילוב מלא של מערכות כלליות בעמודי Watch List

## מטרה

לממש בצורה מדויקת ומלאה את כל המערכות הכלליות של TikTrack בעמודי Watch List, תוך שמירה על סטנדרטים זהים לכל העמודים האחרים במערכת.

## שלב 1: בדיקה וניתוח המצב הנוכחי

### 1.1 בדיקת עמודי Watch List הקיימים

- [ ] בדיקת `watch-lists-page.html` - איזה סקריפטים נטענים
- [ ] בדיקת `watch-list-modal.html` - האם זה עמוד או רק מוקאפ
- [ ] בדיקת `add-ticker-modal.html` - האם זה עמוד או רק מוקאפ  
- [ ] בדיקת `flag-quick-action.html` - האם זה עמוד או רק מוקאפ

### 1.2 השוואה לעמודים קיימים

- [ ] השוואה ל-`tag-management.html` (עמוד מלא עם כל המערכות)
- [ ] השוואה ל-`portfolio-state-page.html` (עמוד מוקאפ עם מערכות)
- [ ] זיהוי פערים בין Watch List לעמודים הקיימים

### 1.3 זיהוי קבצי JavaScript חסרים

- [ ] בדיקה האם קיימים `watch-lists-data.js` ו-`watch-lists-ui-service.js`
- [ ] אם לא קיימים - ציין שיש ליצור אותם כחלק מהמימוש

## שלב 2: הוספת חבילת Watch Lists ל-Package Manifest

### 2.1 עדכון `package-manifest.js`

- [ ] הוספת חבילה חדשה `watch-lists`:
- `id`: 'watch-lists'
- `name`: 'Watch Lists Package'
- `description`: 'Watch lists management system'
- `dependencies`: ['base', 'services', 'modules', 'ui-advanced', 'crud', 'preferences', 'validation', 'external-data', 'entity-services']
- `scripts`:
  - `watch-lists-data.js` (Data Service) - אם קיים
  - `watch-lists-ui-service.js` (UI Service) - אם קיים
  - `modal-configs/watch-lists-config.js` (Modal Configuration) - אם נדרש

### 2.2 הגדרת Global Checks

- [ ] כל סקריפט צריך `globalCheck` ייחודי:
- `watch-lists-data.js` → `window.WatchListsData`
- `watch-lists-ui-service.js` → `window.WatchListsUIService`
- `watch-lists-config.js` → `window.watchListsModalConfig`

## שלב 3: הוספת קונפיגורציה ל-Page Initialization Configs

### 3.1 קונפיגורציה ל-`watch-lists-page`

- [ ] הוספת entry ב-`page-initialization-configs.js`:
- `packages`: ['base', 'services', 'modules', 'ui-advanced', 'crud', 'preferences', 'validation', 'external-data', 'entity-services', 'watch-lists', 'init-system']
- `requiredGlobals`: כולל את כל ה-Globals הנדרשים
- `customInitializers`: פונקציית אתחול מותאמת
- `requiresFilters`: false (או true אם נדרש)
- `requiresTables`: true
- `requiresValidation`: true

### 3.2 קונפיגורציה למודלים (אם נדרש)

- [ ] `watch-list-modal.html` - האם זה עמוד נפרד או חלק מ-modal system?
- [ ] `add-ticker-modal.html` - האם זה עמוד נפרד או חלק מ-modal system?
- [ ] `flag-quick-action.html` - האם זה עמוד נפרד או חלק מ-modal system?

## שלב 4: עדכון HTML - טעינת סקריפטים

### 4.1 עדכון `watch-lists-page.html`

- [ ] הוספת טעינת סקריפטים לפי הסדר הנכון:

1. `package-manifest.js`
2. `page-initialization-configs.js`
3. `core-systems.js` (UnifiedAppInitializer)

- [ ] הוספת הערות LOCK עם סדר הטעינה
- [ ] הוספת container ל-notifications (אם חסר)
- [ ] הוספת container ל-toast (אם חסר)
- [ ] וידוא ש-`unified-header` נטען

### 4.2 בדיקת מבנה HTML

- [ ] וידוא מבנה סטנדרטי: `container-fluid` → `header` → `main` → `footer`
- [ ] וידוא ש-sections משתמשים ב-`data-section` attributes
- [ ] וידוא ש-buttons משתמשים ב-`data-onclick` attributes
- [ ] וידוא ש-tables משתמשים ב-`data-table-type` attributes

## שלב 5: אינטגרציה עם מערכות כלליות

### 5.1 מערכת איתחול (UnifiedAppInitializer)

- [ ] וידוא שהעמוד רשום ב-`page-initialization-configs.js`
- [ ] וידוא שכל החבילות הנדרשות נטענות
- [ ] וידוא שה-5 שלבי האתחול רצים (PreInit, Init, PostInit, Ready, Complete)

### 5.2 מערכות בסיס (BASE Package)

- [ ] NotificationSystem - טעינה והטמעה
- [ ] UnifiedCacheManager - שימוש ב-caching
- [ ] CacheSyncManager - סנכרון מטמון
- [ ] IconSystem - שימוש באיקונים דינמיים
- [ ] EventHandlerManager - שימוש ב-data-onclick
- [ ] ButtonSystem - שימוש ב-button-system-init
- [ ] ColorSchemeSystem - שימוש בצבעים דינמיים
- [ ] HeaderSystem - טעינת header
- [ ] PageStateManager - שמירת מצב עמוד

### 5.3 מערכות CRUD ונתונים

- [ ] UnifiedTableSystem - רינדור טבלאות
- [ ] DataCollectionService - איסוף נתונים מטפסים
- [ ] FieldRendererService - רינדור שדות (מחירים, סטטוס, וכו')
- [ ] SelectPopulatorService - מילוי dropdowns
- [ ] CRUDResponseHandler - טיפול בתגובות CRUD
- [ ] TableSortValueAdapter - התאמת ערכי מיון
- [ ] LinkedItemsService - פריטים מקושרים

### 5.4 מערכות UI

- [ ] ModalManagerV2 - ניהול מודלים
- [ ] ModalNavigationManager - ניווט בין מודלים
- [ ] PaginationSystem - פאג'ינציה
- [ ] ActionsMenuSystem - תפריטי פעולות
- [ ] InfoSummarySystem - סיכומי נתונים (אם נדרש)
- [ ] EntityDetailsModal - מודל פרטי ישות

### 5.5 מערכות חיצוניות

- [ ] ExternalDataService - נתוני מחירים חיצוניים
- [ ] YahooFinanceService - אינטגרציה עם Yahoo Finance

### 5.6 מערכות העדפות

- [ ] PreferencesCore - קריאת העדפות
- [ ] ColorManager - ניהול צבעים
- [ ] ProfileManager - ניהול פרופילים

### 5.7 מערכות ולידציה

- [ ] ValidationUtils - ולידציה של טפסים
- [ ] DataCollectionService - ולידציה של שדות

## שלב 6: בדיקה ואימות

### 6.1 בדיקת טעינת סקריפטים בדפדפן

- [ ] פתיחת העמוד בדפדפן
- [ ] בדיקת Console ללוגים של טעינת סקריפטים
- [ ] בדיקת Network tab לטעינת קבצים
- [ ] זיהוי קבצים חסרים או שגיאות טעינה

### 6.2 שימוש בכלי ניטור

- [ ] הרצת `initSystemCheck.runPageCheck()` בדפדפן
- [ ] בדיקת דוחות:
- רשימת סקריפטים נטענים vs צפוי
- Global checks - איזה globals קיימים/חסרים
- Package dependencies - האם כל התלויות נטענו
- Load order - האם הסדר נכון
- [ ] תיקון כל הבעיות שזוהו

### 6.3 בדיקת פונקציונליות

- [ ] בדיקת טעינת נתונים
- [ ] בדיקת רינדור טבלאות
- [ ] בדיקת פעולות CRUD
- [ ] בדיקת מודלים
- [ ] בדיקת התראות
- [ ] בדיקת caching

## שלב 7: תיעוד ועדכון מסמכים

### 7.1 עדכון רשימת מערכות כלליות

- [ ] הוספת Watch Lists ל-GENERAL_SYSTEMS_LIST.md (אם נדרש)

### 7.2 עדכון דוקומנטציה

- [ ] עדכון API_REFERENCE.md אם יש שינו

### To-dos

- [ ] בדיקת מערכות Watch List מקבילות (TradingView, Yahoo Finance, Bloomberg) ותיעוד דפוסים נפוצים
- [ ] אפיון מלא של שכבת Database - טבלאות watch_lists ו-watch_list_items עם כל השדות והקשרים
- [ ] אפיון API Backend - Routes, Business Logic Service, External Data Integration
- [ ] אפיון Frontend Services - watch-lists-data.js, watch-lists-ui-service.js עם אינטגרציה למערכות קיימות
- [ ] אפיון ממשק משתמש - מבנה עמוד, תצוגות, Quick Actions, Modals
- [ ] תיעוד תוכנית אינטגרציה מלאה עם כל המערכות הקיימות (Cache, Initialization, Tables, Modals, External Data)
- [ ] יצירת מוקאפ עמוד ראשי watch-lists-page.html לפי תבנית סטנדרטית עם כל Sections והאינטגרציות
- [ ] יצירת מוקאפי Modals - Add/Edit Watch List, Flag Quick Action, Add Ticker
- [ ] יצירת מסמכי אפיון מלאים - SPEC.md, DATABASE_SCHEMA.md, API_REFERENCE.md
- [ ] יצירת מדריכים - UI_GUIDE.md, DEVELOPER_GUIDE.md, INTEGRATION_GUIDE.md
- [ ] בדיקת מערכות Watch List מקבילות (TradingView, Yahoo Finance, Bloomberg) ותיעוד דפוסים נפוצים
- [ ] אפיון מלא של שכבת Database - טבלאות watch_lists ו-watch_list_items עם כל השדות והקשרים
- [ ] אפיון API Backend - Routes, Business Logic Service, External Data Integration
- [ ] אפיון Frontend Services - watch-lists-data.js, watch-lists-ui-service.js עם אינטגרציה למערכות קיימות
- [ ] אפיון ממשק משתמש - מבנה עמוד, תצוגות, Quick Actions, Modals
- [ ] תיעוד תוכנית אינטגרציה מלאה עם כל המערכות הקיימות (Cache, Initialization, Tables, Modals, External Data)
- [ ] יצירת מוקאפ עמוד ראשי watch-lists-page.html לפי תבנית סטנדרטית עם כל Sections והאינטגרציות
- [ ] יצירת מוקאפי Modals - Add/Edit Watch List, Flag Quick Action, Add Ticker
- [ ] יצירת מסמכי אפיון מלאים - SPEC.md, DATABASE_SCHEMA.md, API_REFERENCE.md
- [ ] יצירת מדריכים - UI_GUIDE.md, DEVELOPER_GUIDE.md, INTEGRATION_GUIDE.md
- [ ] בדיקת מערכות Watch List מקבילות (TradingView, Yahoo Finance, Bloomberg) ותיעוד דפוסים נפוצים
- [ ] אפיון מלא של שכבת Database - טבלאות watch_lists ו-watch_list_items עם כל השדות והקשרים
- [ ] אפיון API Backend - Routes, Business Logic Service, External Data Integration
- [ ] אפיון Frontend Services - watch-lists-data.js, watch-lists-ui-service.js עם אינטגרציה למערכות קיימות
- [ ] אפיון ממשק משתמש - מבנה עמוד, תצוגות, Quick Actions, Modals
- [ ] תיעוד תוכנית אינטגרציה מלאה עם כל המערכות הקיימות (Cache, Initialization, Tables, Modals, External Data)
- [ ] יצירת מוקאפ עמוד ראשי watch-lists-page.html לפי תבנית סטנדרטית עם כל Sections והאינטגרציות
- [ ] יצירת מוקאפי Modals - Add/Edit Watch List, Flag Quick Action, Add Ticker
- [ ] יצירת מסמכי אפיון מלאים - SPEC.md, DATABASE_SCHEMA.md, API_REFERENCE.md
- [ ] יצירת מדריכים - UI_GUIDE.md, DEVELOPER_GUIDE.md, INTEGRATION_GUIDE.md
- [ ] בדיקת מערכות Watch List מקבילות (TradingView, Yahoo Finance, Bloomberg) ותיעוד דפוסים נפוצים
- [ ] אפיון מלא של שכבת Database - טבלאות watch_lists ו-watch_list_items עם כל השדות והקשרים
- [ ] אפיון API Backend - Routes, Business Logic Service, External Data Integration
- [ ] אפיון Frontend Services - watch-lists-data.js, watch-lists-ui-service.js עם אינטגרציה למערכות קיימות
- [ ] אפיון ממשק משתמש - מבנה עמוד, תצוגות, Quick Actions, Modals
- [ ] תיעוד תוכנית אינטגרציה מלאה עם כל המערכות הקיימות (Cache, Initialization, Tables, Modals, External Data)
- [ ] יצירת מוקאפ עמוד ראשי watch-lists-page.html לפי תבנית סטנדרטית עם כל Sections והאינטגרציות
- [ ] יצירת מוקאפי Modals - Add/Edit Watch List, Flag Quick Action, Add Ticker
- [ ] יצירת מסמכי אפיון מלאים - SPEC.md, DATABASE_SCHEMA.md, API_REFERENCE.md
- [ ] יצירת מדריכים - UI_GUIDE.md, DEVELOPER_GUIDE.md, INTEGRATION_GUIDE.md
- [ ] בדיקת מערכות Watch List מקבילות (TradingView, Yahoo Finance, Bloomberg) ותיעוד דפוסים נפוצים
- [ ] אפיון מלא של שכבת Database - טבלאות watch_lists ו-watch_list_items עם כל השדות והקשרים
- [ ] אפיון API Backend - Routes, Business Logic Service, External Data Integration
- [ ] אפיון Frontend Services - watch-lists-data.js, watch-lists-ui-service.js עם אינטגרציה למערכות קיימות
- [ ] אפיון ממשק משתמש - מבנה עמוד, תצוגות, Quick Actions, Modals
- [ ] תיעוד תוכנית אינטגרציה מלאה עם כל המערכות הקיימות (Cache, Initialization, Tables, Modals, External Data)
- [ ] יצירת מוקאפ עמוד ראשי watch-lists-page.html לפי תבנית סטנדרטית עם כל Sections והאינטגרציות
- [ ] יצירת מוקאפי Modals - Add/Edit Watch List, Flag Quick Action, Add Ticker
- [ ] יצירת מסמכי אפיון מלאים - SPEC.md, DATABASE_SCHEMA.md, API_REFERENCE.md
- [ ] יצירת מדריכים - UI_GUIDE.md, DEVELOPER_GUIDE.md, INTEGRATION_GUIDE.md
- [ ] בדיקת מערכות Watch List מקבילות (TradingView, Yahoo Finance, Bloomberg) ותיעוד דפוסים נפוצים
- [ ] אפיון מלא של שכבת Database - טבלאות watch_lists ו-watch_list_items עם כל השדות והקשרים
- [ ] אפיון API Backend - Routes, Business Logic Service, External Data Integration
- [ ] אפיון Frontend Services - watch-lists-data.js, watch-lists-ui-service.js עם אינטגרציה למערכות קיימות
- [ ] אפיון ממשק משתמש - מבנה עמוד, תצוגות, Quick Actions, Modals
- [ ] תיעוד תוכנית אינטגרציה מלאה עם כל המערכות הקיימות (Cache, Initialization, Tables, Modals, External Data)
- [ ] יצירת מוקאפ עמוד ראשי watch-lists-page.html לפי תבנית סטנדרטית עם כל Sections והאינטגרציות
- [ ] יצירת מוקאפי Modals - Add/Edit Watch List, Flag Quick Action, Add Ticker
- [ ] יצירת מסמכי אפיון מלאים - SPEC.md, DATABASE_SCHEMA.md, API_REFERENCE.md
- [ ] יצירת מדריכים - UI_GUIDE.md, DEVELOPER_GUIDE.md, INTEGRATION_GUIDE.md