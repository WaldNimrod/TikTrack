# TikTrack - תיעוד מערכת

## סקירה כללית

TikTrack היא מערכת ניהול מסחר מתקדמת המאפשרת מעקב אחר טריידים, ניהול חשבונות, התראות מתקדמות ואינטגרציה עם נתונים חיצוניים.

## תכונות מרכזיות

### ניהול טריידים
- **תכנוני מסחר**: יצירה וניהול תכניות מסחר
- **טריידים**: מעקב אחר עסקאות פעילות וסגורות
- **ביצועים**: ניהול ביצועי עסקאות
- **תזרימי מזומן**: מעקב אחר תזרימי כספים
  - **מודול עריכה דואלי**: [CASH_FLOWS_EDIT_MODAL_ARCHITECTURE.md](04-FEATURES/CORE/CASH_FLOWS_EDIT_MODAL_ARCHITECTURE.md) - מבנה מיוחד של מודול עריכה עם שני סוגי תזרימים (רגיל והמרת מטבע) ⚠️ **יוצא דופן!**
- **שדות תכנון בטריידים**: [TRADE_PLANNING_FIELDS.md](features/CORE/TRADE_PLANNING_FIELDS.md) - מערכת שדות תכנון (planned_quantity, planned_amount, entry_price) עם Snapshot Pattern ✅ **חדש! ינואר 2025**

### ניהול חשבונות
- **חשבונות**: ניהול חשבונות מרובים
- **טיקרים**: מעקב אחר מניות וניירות ערך
  - 🔗 **אינטגרציה User-Ticker**: [USER_TICKER_INTEGRATION.md](02-ARCHITECTURE/BACKEND/USER_TICKER_INTEGRATION.md) - ארכיטקטורה מלאה של מערכת השיוך בין משתמשים לטיקרים, שדות מותאמים אישית, וסטטוס דו-שכבתי ✅ **חדש! דצמבר 2025**
  - 📋 **תוכנית מימוש**: [USER_TICKER_INTEGRATION_PLAN.md](03-DEVELOPMENT/PLANS/USER_TICKER_INTEGRATION_PLAN.md) - תוכנית מימוש מקיפה עם סיכום ביצוע ותוצאות ✅ **חדש! דצמבר 2025**
- **הערות**: מערכת הערות מתקדמת

### התראות מתקדמות
- **התראות**: מערכת התראות מותאמת אישית
- **תנאים**: הגדרת תנאי התראה מתקדמים
- **מעקב**: מעקב אחר התראות פעילות
- **Active Alerts Component**: [ACTIVE_ALERTS_COMPONENT.md](frontend/ACTIVE_ALERTS_COMPONENT.md) - תיעוד קומפוננטת ההתראות הפעילות ב-ITCSS

### ניתוח AI
- **AI Analysis System**: מערכת ניתוח AI למניות עם תמיכה ב-4 תבניות פרומפטים
  - 🤖 **מדריך מפתחים**: [AI_ANALYSIS_SYSTEM_DEVELOPER_GUIDE.md](04-FEATURES/AI_ANALYSIS_SYSTEM_DEVELOPER_GUIDE.md) - מדריך מפתחים מלא למערכת AI Analysis ✅ **חדש! ינואר 2025**
  - 👥 **מדריך משתמש**: [AI_ANALYSIS_SYSTEM_USER_GUIDE.md](04-FEATURES/AI_ANALYSIS_SYSTEM_USER_GUIDE.md) - מדריך שימוש מלא למשתמשים ✅ **חדש! ינואר 2025**
  - 🔧 **בעיות ותיקונים**: [AI_ANALYSIS_SYSTEM_ISSUES_AND_FIXES.md](04-FEATURES/AI_ANALYSIS_SYSTEM_ISSUES_AND_FIXES.md) - רשימת בעיות מזוהות ותיקונים נדרשים ⚠️ **חדש! ינואר 2025**
  - 📄 **דוגמה לתשובה**: [AI_ANALYSIS_EXAMPLE_RESPONSE.md](04-FEATURES/AI_ANALYSIS_EXAMPLE_RESPONSE.md) - דוגמה מלאה של תשובה מהמנוע Gemini ✅ **חדש! ינואר 2025**
  - 🌐 **תוצאות בדיקות עברית**: [AI_ANALYSIS_HEBREW_RESPONSE_TEST_RESULTS.md](04-FEATURES/AI_ANALYSIS_HEBREW_RESPONSE_TEST_RESULTS.md) - תוצאות בדיקות 11 אופציות לקבלת משוב בעברית ✅ **חדש! נובמבר 2025**
  - ✅ **Option 10 מיושם**: Option 10 (74%+ עברית) מיושם במלואו במערכת ✅ **חדש! נובמבר 2025**
  - 🧪 **דוח בדיקות דפדפן**: [AI_ANALYSIS_BROWSER_TEST_REPORT.md](04-FEATURES/AI_ANALYSIS_BROWSER_TEST_REPORT.md) - דוח מקיף של בדיקות דפדפן למערכת AI Analysis ✅ **חדש! נובמבר 2025**
  - 📡 **API Documentation**: [AI_ANALYSIS_API.md](backend/AI_ANALYSIS_API.md) - תיעוד API מלא ✅ **חדש! ינואר 2025**
  - 🏗️ **Backend Architecture**: [AI_ANALYSIS_ARCHITECTURE.md](02-ARCHITECTURE/BACKEND/AI_ANALYSIS_ARCHITECTURE.md) - ארכיטקטורה Backend ✅ **חדש! ינואר 2025**
  - 🎨 **Frontend Architecture**: [AI_ANALYSIS_ARCHITECTURE.md](02-ARCHITECTURE/FRONTEND/AI_ANALYSIS_ARCHITECTURE.md) - ארכיטקטורה Frontend ✅ **חדש! ינואר 2025**
  - 🧪 **Test Plan**: [AI_ANALYSIS_SYSTEM_TEST_PLAN.md](04-FEATURES/AI_ANALYSIS_SYSTEM_TEST_PLAN.md) - תוכנית בדיקות מקיפה ✅ **חדש! ינואר 2025**
  - 📋 **Implementation Plan**: [AI_ANALYSIS_SYSTEM_IMPLEMENTATION_PLAN.md](plans/AI_ANALYSIS_SYSTEM_IMPLEMENTATION_PLAN.md) - תוכנית יישום מלאה ✅ **חדש! ינואר 2025**
  - 📦 **Dependencies**: [AI_ANALYSIS_DEPENDENCIES.md](03-DEVELOPMENT/SETUP/AI_ANALYSIS_DEPENDENCIES.md) - תיעוד חבילות Python נדרשות (httpx, google-generativeai) ✅ **חדש! ינואר 2025**
  - 🧪 **Testing Guide**: [AI_ANALYSIS_SYSTEM_TESTING_GUIDE.md](04-FEATURES/AI_ANALYSIS_SYSTEM_TESTING_GUIDE.md) - מדריך הרצת בדיקות בדפדפן ו-E2E ✅ **חדש! ינואר 2025**
  - 🌐 **URL Mapping**: [PAGE_URL_MAPPING.md](03-DEVELOPMENT/SETUP/PAGE_URL_MAPPING.md) - מיפוי כתובות לעמודים (בלי .html ובלי /trading-ui/) ✅ **חדש! ינואר 2025**

### עמודים ומערכות
- **רשימת עמודים**: [PAGES_LIST.md](PAGES_LIST.md) - רשימה מלאה של כל 28 העמודים במערכת
- **כללי עבודה**: [DOCUMENTATION_WORKING_RULES.md](DOCUMENTATION_WORKING_RULES.md) - כללים לעבודה עם מערכת הדוקומנטציה
- **מדיניות פולבק**: [FALLBACK_POLICY.md](02-ARCHITECTURE/FALLBACK_POLICY.md) - מיפוי מלא של כל מנגנוני ה-fallback וחלוקת הקטגוריות החדשה
- **סטטוס בדיקות**: [tests/TEST_STATUS_REPORT.md](../tests/TEST_STATUS_REPORT.md) – כיסוי עדכני, פקודות הרצה ו-checklist למפתחים

> **🎯 עקרון בסיסי:** כל הדוקומנטציה שלנו נמצאת תחת תקיית `documentation/` בלבד - אין ליצור קבצי דוקומנטציה מחוץ לה

### ניהול גרסאות
- **Manifest מרכזי:** `documentation/version-manifest.json` – סטטוס עדכני לכל הסביבות.
- **היסטוריה פרודקשן:** `documentation/production/VERSION_HISTORY.md`
- **היסטוריה פיתוח:** `documentation/development/VERSION_HISTORY.md`
- **מדריך פיתוח:** [VERSIONING_GUIDE.md](03-DEVELOPMENT/VERSIONING_GUIDE.md)
- **פרודקשן:** סעיף "ניהול גרסאות פרודקשן" ב-[PRODUCTION_SETUP.md](production/PRODUCTION_SETUP.md) + [UPDATE_PROCESS.md](production/UPDATE_PROCESS.md)
- **מדריך בדיקות/איכות:** [CODE_QUALITY_SYSTEMS_GUIDE.md](03-DEVELOPMENT/TOOLS/CODE_QUALITY_SYSTEMS_GUIDE.md) – כולל הרצת Jest/Pytest והפניה לדוח הסטטוס
- **מדריך כלי בדיקת סדר טעינה:** [PACKAGE_LOAD_ORDER_AUDIT_TOOLS_GUIDE.md](03-DEVELOPMENT/TOOLS/PACKAGE_LOAD_ORDER_AUDIT_TOOLS_GUIDE.md) - מדריך מקיף לכלי בדיקת סדר טעינה ותלויות ✅ **חדש! דצמבר 2025**

### מערכות כלליות ✅ **101/101 מערכות מושלמות! הושלמו בינואר 2025**
- **מערכות כלליות**: כל 101 המערכות הכלליות במערכת מיושמות במלואן (100%)
- 📋 **מטריצת מערכות**: [GENERAL_SYSTEMS_MATRIX.md](05-REPORTS/LOCAL_SUMMARIES/GENERAL_SYSTEMS_MATRIX.md)
  - 🏗️ **ארכיטקטורת JavaScript**: [JAVASCRIPT_ARCHITECTURE.md](frontend/JAVASCRIPT_ARCHITECTURE.md)
  - 🚀 **מערכת אתחול מאוחדת**: [UNIFIED_INITIALIZATION_SYSTEM.md](02-ARCHITECTURE/FRONTEND/UNIFIED_INITIALIZATION_SYSTEM.md) - **עודכן דצמבר 2025 - Refactor מלא**
  - 📖 **מדריך מפתחים - מערכת איתחול**: [INITIALIZATION_SYSTEM_DEVELOPER_GUIDE.md](02-ARCHITECTURE/FRONTEND/INITIALIZATION_SYSTEM_DEVELOPER_GUIDE.md) - **חדש! דצמבר 2025**
  - 📚 **תיעוד API - מערכת איתחול**: [UNIFIED_INITIALIZATION_SYSTEM_API.md](02-ARCHITECTURE/FRONTEND/UNIFIED_INITIALIZATION_SYSTEM_API.md) - **חדש! דצמבר 2025**
  - 🚀 **מערכת אתחול משופרת**: [ENHANCED_INITIALIZATION_SYSTEM.md](frontend/init-system/ENHANCED_INITIALIZATION_SYSTEM.md) - **עודכן עם סדר טעינה סטנדרטי**
  - 🎯 **מערכת אתחול סופית**: מערכת ניטור ולידציה מתקדמת עם חבילות וסטנדרטיזציה מלאה (28/28 עמודים) - **ניטור ולידציה בלבד**
  - 🔍 **מערכת מוניטורינג משופרת V2**: [MONITORING_SYSTEM_V2.md](02-ARCHITECTURE/FRONTEND/MONITORING_SYSTEM_V2.md) - בדיקה כפולה HTML+DOM, השוואה מפורטת, תיעוד חבילות ✅ **חדש! ינואר 2025**
  - 📋 **תוכנית סטנדרטיזציה לעמודים**: [PAGES_STANDARDIZATION_PLAN.md](02-ARCHITECTURE/FRONTEND/PAGES_STANDARDIZATION_PLAN.md) - רשימת עמודים מסודרת לסטנדרטיזציה ✅ **חדש! ינואר 2025**
  - 📋 **רשימת עמודים לסטנדרטיזציה**: [PAGES_STANDARDIZATION_LIST.md](02-ARCHITECTURE/FRONTEND/PAGES_STANDARDIZATION_LIST.md) - רשימה מפורטת של כל העמודים ✅ **חדש! ינואר 2025**
  - 🔍 **ניתוח תלויות**: [DEPENDENCY_ANALYZER_GUIDE.md](02-ARCHITECTURE/FRONTEND/DEPENDENCY_ANALYZER_GUIDE.md) - כלי לניתוח תלויות במניפסט החבילות ✅ **חדש! ינואר 2025**
  - 📊 **בדיקת סדר טעינה**: [LOAD_ORDER_VALIDATOR_GUIDE.md](02-ARCHITECTURE/FRONTEND/LOAD_ORDER_VALIDATOR_GUIDE.md) - כלי לבדיקת סדר טעינה בפועל בעמודים ✅ **חדש! ינואר 2025**
  - 📋 **סדר טעינה סטנדרטי**: [STANDARD_LOADING_ORDER.md](frontend/STANDARD_LOADING_ORDER.md) - 6 חבילות בסדר קבוע לכל עמודי המשתמש (BASE → SERVICES → UI-ADVANCED → CRUD → PREFERENCES → INIT-SYSTEM)
  - 📖 **מדריך למפתחים**: [DEVELOPER_GUIDE.md](frontend/init-system/DEVELOPER_GUIDE.md)
  - 👥 **מדריך למשתמשים**: [USER_GUIDE.md](frontend/init-system/USER_GUIDE.md)
  - 🔗 **Table Pipeline Workflow**: [TABLE_PIPELINE_WORKFLOW_GUIDE.md](frontend/TABLE_PIPELINE_WORKFLOW_GUIDE.md) – מדריך למפתחים חדשים לשילוב טעינה → פילטרים (Header/Internal) → מיון → פאג׳ינציה תחת UnifiedCacheManager.
  - 📊 **פילטרים וסטטיסטיקות מאוחדים**: [FILTERS_AND_SUMMARY_USER_GUIDE.md](05-USER-GUIDES/FILTERS_AND_SUMMARY_USER_GUIDE.md)
  - 📧 **שירות SMTP - מדריך משתמש**: [SMTP_USER_GUIDE.md](05-USER-GUIDES/SMTP_USER_GUIDE.md) - מדריך למשתמשים לשימוש בשירות SMTP (איפוס סיסמה, התראות) ✅ **חדש! ינואר 2025**
  - 📧 **הגדרת SMTP ב-Gmail**: [GMAIL_APP_PASSWORD_SETUP.md](admin/GMAIL_APP_PASSWORD_SETUP.md) - מדריך להגדרת App Password ב-Gmail ✅ **חדש! ינואר 2025**
  - 📧 **הגדרת SMTP ב-Google Workspace**: [GMAIL_WORKSPACE_SMTP_SETUP.md](admin/GMAIL_WORKSPACE_SMTP_SETUP.md) - מדריך להגדרת SMTP ב-Google Workspace עם הגדרות מנהל מערכת ✅ **חדש! ינואר 2025**
  - 🔄 **פתרונות SMTP חלופיים לפיתוח**: [SMTP_ALTERNATIVES_DEVELOPMENT.md](admin/SMTP_ALTERNATIVES_DEVELOPMENT.md) - פתרונות SMTP שלא דורשים IP קבוע (SendGrid, Mailgun, Mailtrap) ✅ **חדש! ינואר 2025**
  - 💾 **מערכת מטמון מאוחדת**: [UNIFIED_CACHE_SYSTEM.md](04-FEATURES/CORE/UNIFIED_CACHE_SYSTEM.md)
- 🔧 **מערכת תנאים**: [CONDITIONS_SYSTEM.md](04-FEATURES/CORE/conditions-system/CONDITIONS_SYSTEM.md)
- 📘 **Playbook למפתחים – מערכת תנאים**: [CONDITIONS_SYSTEM_DEV_PLAYBOOK.md](04-FEATURES/CORE/conditions-system/CONDITIONS_SYSTEM_DEV_PLAYBOOK.md)
  - 📗 **מדריך משתמש – מערכת תנאים**: [CONDITIONS_SYSTEM_USER_GUIDE.md](04-FEATURES/CORE/conditions-system/CONDITIONS_SYSTEM_USER_GUIDE.md)
  - 🧪 **תוכנית בדיקות – מערכת תנאים**: [CONDITIONS_SYSTEM_TEST_PLAN.md](04-FEATURES/CORE/conditions-system/CONDITIONS_SYSTEM_TEST_PLAN.md)
  - ⚡ **מערכת הערכת תנאים**: מערכת חדשה להערכת תנאים בזמן אמת עם משימת רקע אוטומטית
  - 🔘 **מערכת כפתורים מרכזית**: [button-system.md](frontend/button-system.md) - מערכת חדשה עם משתני צבע דינמיים ווריאציות תצוגה
  - 🎨 **מערכת איקונים מרכזית**: [ICON_SYSTEM_GUIDE.md](frontend/ICON_SYSTEM_GUIDE.md), [ICON_SYSTEM_ARCHITECTURE.md](frontend/ICON_SYSTEM_ARCHITECTURE.md) - ניהול מרכזי של איקונים עם Tabler Icons + 17 איקוני ישויות מקוריים, תמיכה בצבעים דינמיים (inline SVG) ויישור אוטומטי ✅ **עודכן! נובמבר 2025**
  - 📊 **דוח סטטוס יישום איקונים**: [ICON_IMPLEMENTATION_STATUS_REPORT.md](frontend/ICON_IMPLEMENTATION_STATUS_REPORT.md) - דוח מפורט על סטטוס יישום איקונים במערכת, קבצים שדורשים תיקון, ויישומים חלקיים ✅ **חדש! נובמבר 2025**
  - 📥 **מדריך הורדת איקונים חסרים**: [ICONS_DOWNLOAD_GUIDE.md](frontend/ICONS_DOWNLOAD_GUIDE.md) - מדריך מקיף להורדת איקונים מ-Tabler Icons, היכן לשים אותם, ואיך לבדוק איקונים חסרים ✅ **חדש! ינואר 2025**
  - 🔄 **CRUD Response Handler**: [CRUD_RESPONSE_HANDLER.md](02-ARCHITECTURE/FRONTEND/CRUD_RESPONSE_HANDLER.md) - מערכת מרכזית לטיפול בתגובות CRUD עם אינטגרציה למטמון
  - 🔄 **Unified CRUD Service**: [UNIFIED_CRUD_SYSTEM.md](02-ARCHITECTURE/FRONTEND/UNIFIED_CRUD_SYSTEM.md) - שירות CRUD מאוחד לכל הישויות עם אינטגרציה מלאה במערכות קיימות ✅ **חדש! ינואר 2025**
  - 🔢 **Investment Calculation Service**: [INVESTMENT_CALCULATION_SERVICE.md](frontend/INVESTMENT_CALCULATION_SERVICE.md) - חישובי סכום↔כמות↔מחיר עבור מודלי טריידים ותכנוני טרייד
  - 🔗 **אינטגרציה CRUD-מטמון**: [CRUD_CACHE_INTEGRATION.md](02-ARCHITECTURE/FRONTEND/CRUD_CACHE_INTEGRATION.md) - אינטגרציה בין CRUDResponseHandler ל-UnifiedCacheManager
  - ⚠️ **CRUD Backend Implementation**: [CRUD_BACKEND_IMPLEMENTATION_GUIDE.md](02-ARCHITECTURE/FRONTEND/CRUD_BACKEND_IMPLEMENTATION_GUIDE.md) - **מדריך קריטי** ליישום CRUD בשרת - **קרא לפני יישום!**
- 🏷️ **Tag Service**: [TAGGING_SYSTEM_SPEC.md](03-DEVELOPMENT/TAGGING_SYSTEM_SPEC.md) – אפיון מלא למערכת תגיות כולל מדריך מפתחים ומדריך מיגרציה
  - 🔍 **מערכת פילטרים לפי סוגי ישויות**: [ENTITY_TYPE_FILTERS_SYSTEM.md](02-ARCHITECTURE/FRONTEND/ENTITY_TYPE_FILTERS_SYSTEM.md) - מערכת מרכזית ליצירת כפתורי פילטר לפי סוגי ישויות (עמוד התראות ומודול פרטים)
  - 🔄 **אינטגרציית טבלאות – אופציה A**: [TABLE_INTEGRATION_OPTION_A_IMPLEMENTATION_NOTES.md](02-ARCHITECTURE/FRONTEND/TABLE_INTEGRATION_OPTION_A_IMPLEMENTATION_NOTES.md) - מימוש סינון קנוני מלא עם TableDataRegistry, UnifiedTableSystem ו-InfoSummarySystem
  - ⚡ **טעינת סקריפטים עצלה לדשבורד**: [JAVASCRIPT_ARCHITECTURE.md](frontend/JAVASCRIPT_ARCHITECTURE.md#lazy-script-loading-utilities) – תיעוד הפונקציות `loadScriptOnce`/`loadScriptsOnce` והשימוש בהן ב-PendingExecutionTradeCreation
  - ⚡ **סטנדרט Event Handling**: [EVENT_HANDLING_STANDARD.md](02-ARCHITECTURE/FRONTEND/EVENT_HANDLING_STANDARD.md) - סטנדרט אחיד לניהול אירועים - `data-onclick` בלבד ✅ **הושלם!**
  - 🔄 **Event Handler System**: [EVENT_HANDLER_SYSTEM.md](02-ARCHITECTURE/FRONTEND/EVENT_HANDLER_SYSTEM.md) - מערכת ניהול אירועים מרכזית
  - 📖 **מדריך מעבר ל-data-onclick**: [MIGRATION_TO_DATA_ONCLICK.md](03-DEVELOPMENT/GUIDES/MIGRATION_TO_DATA_ONCLICK.md) - מדריך שלב אחר שלב למיגרציה ✅ **הושלם!**
  - 📋 **תוכנית השלמה למיגרציה**: [DATA_ONCLICK_MIGRATION_COMPLETION_PLAN.md](03-DEVELOPMENT/GUIDES/DATA_ONCLICK_MIGRATION_COMPLETION_PLAN.md) - תוכנית מלאה להשלמת המיגרציה ✅ **הושלם!**
  - 📊 **דוח בדיקות מיגרציה**: [DATA_ONCLICK_MIGRATION_TEST_REPORT.md](05-REPORTS/LOCAL_SUMMARIES/DATA_ONCLICK_MIGRATION_TEST_REPORT.md) - דוח בדיקות מלא של המיגרציה ✅ **חדש! ינואר 2025**
- 🎨 **מיפוי צבעי כפתורים**: [BUTTON_COLOR_MAPPING.md](frontend/BUTTON_COLOR_MAPPING.md) - טבלת התאמה בין מחלקות Bootstrap, משתני CSS והעדפות משתמש
- 🎨 **וריאנטים מתקדמים לכפתורים**: [ENTITY_COLOR_VARIANTS.md](frontend/ENTITY_COLOR_VARIANTS.md) - מערכת וריאנטים מתקדמת עם צבעי ישויות, גדלים וסגנונות
- 🎨 **מערכת צבעים דינמית מורחבת**: [COLOR_SCHEME_SYSTEM_EXTENSIONS.md](frontend/COLOR_SCHEME_SYSTEM_EXTENSIONS.md) - טעינת צבעי ישויות מהעדפות המשתמש עם תמיכה בכל הוריאנטים
- 🎯 **מדריך מפתחים - צבעים דינמיים**: [DYNAMIC_COLORS_DEVELOPER_GUIDE.md](frontend/DYNAMIC_COLORS_DEVELOPER_GUIDE.md) - מדריך מלא לשימוש בצבעים דינמיים וצבעי ישויות
- 📊 **ווידג'ט שיוך תוכניות**: [PENDING_TRADE_PLAN_WIDGET_DEVELOPER_GUIDE.md](03-DEVELOPMENT/GUIDES/PENDING_TRADE_PLAN_WIDGET_DEVELOPER_GUIDE.md) - מדריך מפתחים מלא לווידג'ט הדשבורד לשיוך/יצירת תוכניות מתוך טריידים
- 📥 **ייבוא נתונים – מדריך מפתחים**: [USER_DATA_IMPORT_DEVELOPER_GUIDE.md](developers/USER_DATA_IMPORT_DEVELOPER_GUIDE.md) - הנחיות תחזוקה והרחבה לצינור הייבוא (עודכן ינואר 2025)
- 🧩 **ייבוא נתונים – ארכיטקטורה**: [user-data-import-system.md](systems/user-data-import-system.md) - Orchestrator + Task Plugins עבור Account Reconciliation, Portfolio Positions ו-Taxes & FX
- 📋 **ייבוא נתונים – אינדקס פונקציות**: [USER_DATA_IMPORT_FUNCTION_INDEX.md](developers/USER_DATA_IMPORT_FUNCTION_INDEX.md) - אינדקס מלא של כל הפונקציות במערכת ייבוא הנתונים ✅ **חדש! ינואר 2025**
- 🔗 **ייבוא נתונים – User_Ticker Integration**: [USER_TICKER_IMPORT.md](user_data_import/USER_TICKER_IMPORT.md) - תיעוד מלא של אינטגרציית user_ticker במערכת הייבוא ✅ **חדש! דצמבר 2025**
- **מערכת ראש הדף**: ✅ **כתיבה מחדש הושלמה** - קוד פושט מ-5265 ל-1429 שורות (73% הפחתה), עיצוב משופר, כפתור סגירה לפילטרים, מולטיסלקט משופר. ראה [HEADER_SYSTEM_SPEC.md](frontend/HEADER_SYSTEM_SPEC.md) ✅ **עודכן נובמבר 2025**
- **מערכת אתחול מאוחדת**: עובדת בכל 24 העמודים הראשיים
- **מערכת רענון מרכזית**: מערכת חדשה לעדכון אוטומטי אחרי פעולות CRUD בכל 13 עמודי המשתמש
- **תיקון בעיות API**: כל ה-APIs עובדים ללא שגיאות 500
- **תיקון בעיות ביצועים**: אין יותר "Slow operation detected"
- 📓 **Tag Search Runbook**: [TAG_SEARCH_RUNBOOK.md](03-DEVELOPMENT/GUIDES/TAG_SEARCH_RUNBOOK.md) – הפעלה ותחזוקה לענן התגיות וחיפוש מהיר בדף הבית

#### 📚 **דוקומנטציה מפורטת למערכות כלליות**
- 🎨 **מערכת ניהול Favicon**: [FAVICON_MANAGEMENT_SYSTEM.md](frontend/FAVICON_MANAGEMENT_SYSTEM.md)
- 🔔 **מערכת איסוף התראות גלובליות**: [GLOBAL_NOTIFICATION_COLLECTOR_SYSTEM.md](frontend/GLOBAL_NOTIFICATION_COLLECTOR_SYSTEM.md)
- 🔄 **מערכת הגירת התראות**: [NOTIFICATION_MIGRATION_SYSTEM.md](frontend/NOTIFICATION_MIGRATION_SYSTEM.md)
- 🏷️ **מערכת זיהוי קטגוריות התראות**: [NOTIFICATION_CATEGORY_DETECTOR_SYSTEM.md](frontend/NOTIFICATION_CATEGORY_DETECTOR_SYSTEM.md)
- 💾 **מערכת ניהול מצב עמודים (PageStateManager)**: [PAGE_STATE_MANAGEMENT_SYSTEM.md](02-ARCHITECTURE/FRONTEND/PAGE_STATE_MANAGEMENT_SYSTEM.md) - מנהל מצב מרכזי לכל עמודי המערכת עם שמירה ושחזור אוטומטי ✅ **חדש! ינואר 2025**
- 📊 **מערכת מיפוי טבלאות**: [TABLE_MAPPING_SYSTEM.md](frontend/TABLE_MAPPING_SYSTEM.md)
  - 📈 **ניתוח מערכת טבלאות**: [TABLE_SYSTEM_ANALYSIS.md](02-ARCHITECTURE/FRONTEND/TABLE_SYSTEM_ANALYSIS.md) - ניתוח עומק של Unified Table System כולל מיפויים, טבלאות דינמיות ומודולי טעינה ✅ **חדש! נובמבר 2025**
  - 🔄 **מערכת מיון טבלאות מאוחדת**: [TABLE_SORTING_SYSTEM.md](02-ARCHITECTURE/FRONTEND/TABLE_SORTING_SYSTEM.md) - מערכת מיון מרכזית עם תמיכה בסידור ברירת מחדל ושמירת מצב דרך UnifiedCacheManager ✅ **חדש! ינואר 2025**
  - 📋 **שינויים נדרשים לאינטגרציה**: [REQUIRED_CHANGES_FOR_INTEGRATION.md](02-ARCHITECTURE/FRONTEND/REQUIRED_CHANGES_FOR_INTEGRATION.md) - תיעוד השינויים הנדרשים במערכות הקיימות לאינטגרציה מלאה עם PageStateManager ✅ **חדש! ינואר 2025**
- 📅 **מערכת פונקציות עזר לתאריכים**: [DATE_UTILITIES_SYSTEM.md](frontend/DATE_UTILITIES_SYSTEM.md)
  - 🔗 **מטריצת אינטגרציה**: [INTEGRATION_MATRIX.md](02-ARCHITECTURE/FRONTEND/INTEGRATION_MATRIX.md) - מטריצה מלאה של כל האינטגרציות והתלויות ✅ **עודכן! נובמבר 2025**
  - 📊 **דוח ניתוח אינטגרציה**: [SYSTEM_INTEGRATION_ANALYSIS_REPORT.md](05-REPORTS/SYSTEM_INTEGRATION_ANALYSIS_REPORT.md) - דוח ניתוח מקיף עם המלצות ✅ **חדש! נובמבר 2025**
  - 📋 **דוח השלמת Incremental Fixing**: [INCREMENTAL_FIXING_COMPLETION_REPORT.md](05-REPORTS/INCREMENTAL_FIXING_COMPLETION_REPORT.md) - דוח השלמת תיקון הדרגתי ✅ **חדש! נובמבר 2025**
  - 📊 **דוח השוואת סריקה חוזרת**: [INTEGRATION_RESCAN_COMPARISON_REPORT.md](05-REPORTS/INTEGRATION_RESCAN_COMPARISON_REPORT.md) - השוואה בין מצב מקורי, אחרי תיקונים ומצב נוכחי ✅ **חדש! נובמבר 2025**
  - 🔧 **מדריך ניתוח אינטגרציה**: [INTEGRATION_ANALYSIS_GUIDE.md](03-DEVELOPMENT/TOOLS/INTEGRATION_ANALYSIS_GUIDE.md) - מדריך שימוש מלא לכלי הניתוח ✅ **חדש! נובמבר 2025**
  - 📊 **השוואת אופציות אינטגרציה**: [INTEGRATION_OPTIONS_COMPARISON.md](05-REPORTS/INTEGRATION_OPTIONS_COMPARISON.md) - השוואה מפורטת של 4 אופציות ✅ **חדש! נובמבר 2025**
  - 💾 **דוח טבלאות בסיס נתונים**: [DATABASE_TABLES_REPORT.md](05-REPORTS/DATABASE_TABLES_REPORT.md) - רשימה מלאה של כל הטבלאות ומספר רשומות ✅ **חדש! נובמבר 2025**

### הגדרות מערכת ✅ **מערכת חדשה! הושלמה בינואר 2025**
- **העדפות v3.0**: מערכת הגדרות מתקדמת עם שיכתוב מלא ונקי
  - 🏗️ **ארכיטקטורה**: 6 קבצים נקיים וממוקדים (core-new, colors, lazy-loader, validation, ui, page)
  - 🔄 **החלפת פרופיל**: בחירה מ-dropdown + לחצן "עדכון פרופיל פעיל"
  - 💾 **שמירת העדפות**: רק שינויים + ריענון אוטומטי אחרי 1.5 שניות
  - 🚀 **Lazy Loading**: טעינה חכמה עם 4 רמות עדיפות (critical, high, medium, low)
  - 🔍 **Validation**: בדיקת קיום, פורמט וחוקי עסק
  - 🎨 **מערכת צבעים**: ניהול ייעודי של 60+ העדפות צבע
  - 📋 **מדריך מיגרציה**: [PREFERENCES_MIGRATION_GUIDE.md](PREFERENCES_MIGRATION_GUIDE.md)
  - 👥 **מדריך משתמש**: [PREFERENCES_USER_GUIDE.md](PREFERENCES_USER_GUIDE.md)
  - 📊 **תיעוד מלא**: [PREFERENCES_IMPLEMENTATION_REPORT.md](05-REPORTS/LOCAL_SUMMARIES/PREFERENCES_IMPLEMENTATION_REPORT.md)
  - 📊 **השוואה**: [PREFERENCES_COMPARISON.md](05-REPORTS/LOCAL_SUMMARIES/PREFERENCES_COMPARISON.md)
  - 🎉 **דוח השלמה**: [PREFERENCES_FINAL_COMPLETION_REPORT.md](05-REPORTS/LOCAL_SUMMARIES/PREFERENCES_FINAL_COMPLETION_REPORT.md)
- **מערכת העדפות**: מערכת הגדרות מתקדמת עם פרופילים מרובים
  - 📋 **תיעוד ראשי**: [04-FEATURES/CORE/preferences/PREFERENCES_SYSTEM.md](04-FEATURES/CORE/preferences/PREFERENCES_SYSTEM.md)
  - 📖 **מדריך מפתחים מלא**: [04-FEATURES/CORE/preferences/PREFERENCES_COMPLETE_DEVELOPER_GUIDE.md](04-FEATURES/CORE/preferences/PREFERENCES_COMPLETE_DEVELOPER_GUIDE.md)
  - 🔧 **מדריך הוספה/עדכון**: [04-FEATURES/CORE/preferences/PREFERENCES_DEVELOPER_GUIDE.md](04-FEATURES/CORE/preferences/PREFERENCES_DEVELOPER_GUIDE.md)
  - 📊 **דוח אימות עמודים**: [05-REPORTS/PREFERENCES_PAGES_VERIFICATION_REPORT.md](05-REPORTS/PREFERENCES_PAGES_VERIFICATION_REPORT.md) - **חדש!** דוח מקיף על תיקון טעינת העדפות בכל העמודים
- **פילטרים**: מערכת פילטרים גלובלית משותפת לשתי המערכות
- **ממשק**: ממשק משתמש אחיד ומתקדם עם תמיכה בשתי גרסאות

## ארכיטקטורה

### Frontend ✅ **מערכת CSS חדשה! הושלמה בינואר 2025**
- **HTML**: דפים מותאמים אישית לכל מודול (27 עמודים עודכנו)
- **JavaScript**: סקריפטים מודולריים
- **CSS**: ארכיטקטורת ITCSS חדשה - קטנה ב-83.7% מהמערכת הישנה
  - 🎨 **דשבורד ניהול**: [http://localhost:8080/css-management](http://localhost:8080/css-management)
  - 📋 **מדריך מלא**: [CSS Architecture Guide](frontend/CSS_ARCHITECTURE_GUIDE.md)
  - 🚀 **מדריך מהיר**: [CSS Quick Reference](frontend/CSS_QUICK_REFERENCE.md)
  - 🎨 **23 קבצים מאורגנים** במבנה ITCSS מתקדם
  - ⚡ **ביצועים**: 386KB → 64KB (שיפור של 83.4%)
- **RTL**: תמיכה מלאה בעברית עם CSS Logical Properties
- **מערכת גרפים**: מערכת גרפים מבוססת Chart.js עם תמיכה בגרפים כלליים
  - 📊 **ניתוח חלופות**: [CHART_SYSTEM_ALTERNATIVES_ANALYSIS.md](02-ARCHITECTURE/FRONTEND/CHART_SYSTEM_ALTERNATIVES_ANALYSIS.md) - ניתוח מעמיק של מערכות גרפים חיצוניות מתקדמות (ECharts, TradingView, ApexCharts, Plotly, Highcharts) ✅ **חדש! ינואר 2025**
  - 📈 **TradingView Lightweight Charts**: מימוש TradingView Lightweight Charts במערכת ✅ **חדש! ינואר 2025**
    - 📋 **אינדקס**: [TRADINGVIEW_LIGHTWEIGHT_CHARTS/INDEX.md](02-ARCHITECTURE/FRONTEND/TRADINGVIEW_LIGHTWEIGHT_CHARTS/INDEX.md) - אינדקס מסמכים
    - 📖 **סקירה כללית**: [TRADINGVIEW_LIGHTWEIGHT_CHARTS/OVERVIEW.md](02-ARCHITECTURE/FRONTEND/TRADINGVIEW_LIGHTWEIGHT_CHARTS/OVERVIEW.md) - סקירה כללית של המערכת
    - 🔧 **מדריך אינטגרציה**: [TRADINGVIEW_LIGHTWEIGHT_CHARTS/INTEGRATION_GUIDE.md](02-ARCHITECTURE/FRONTEND/TRADINGVIEW_LIGHTWEIGHT_CHARTS/INTEGRATION_GUIDE.md) - הוראות התקנה ואינטגרציה
    - 👨‍💻 **מדריך מפתח**: [TRADINGVIEW_LIGHTWEIGHT_CHARTS/DEVELOPER_GUIDE.md](02-ARCHITECTURE/FRONTEND/TRADINGVIEW_LIGHTWEIGHT_CHARTS/DEVELOPER_GUIDE.md) - איך ליצור גרף חדש
  - 📊 **דשבורד טיקר מורחב**: עמוד טיקר מורחב עם גרפים, KPI, מדדים טכניים ופעילות משתמש ✅ **חדש! ינואר 2025**
    - 📋 **וואירפריים**: [ticker-dashboard-wireframe.md](04-FEATURES/WIREFRAMES/ticker-dashboard-wireframe.md) - וואירפריים מפורטים לעמוד טיקר מורחב
    - 📊 **בעיות Backend**: [TICKER_DASHBOARD_BACKEND_ISSUES.md](05-REPORTS/TICKER_DASHBOARD_BACKEND_ISSUES.md) - תיעוד בעיות Backend endpoints ודרכי פתרון ✅ **חדש! ינואר 2025**
    - 📋 **דוח בדיקות**: [TICKER_DASHBOARD_TEST_REPORT.md](05-REPORTS/TICKER_DASHBOARD_TEST_REPORT.md) - דוח בדיקות מקיף ✅ **חדש! ינואר 2025**
    - 📊 **חישובים טכניים**: [TICKER_DASHBOARD_TECHNICAL_INDICATORS.md](04-FEATURES/TICKER_DASHBOARD_TECHNICAL_INDICATORS.md) - תיעוד מפורט של כל החישובים הטכניים, Pre-calculation, Progress Overlay, Retry Mechanism ✅ **חדש! דצמבר 2025**
    - 📋 **דרישות נתונים**: [TICKER_DASHBOARD_DATA_REQUIREMENTS.md](04-FEATURES/TICKER_DASHBOARD_DATA_REQUIREMENTS.md) - דרישות נתונים לכל חישוב, Pre-calculation, Progress Overlay, Retry Mechanism ✅ **עודכן! דצמבר 2025**
    - 🔗 **אינטגרציה Mockups**: [mockups-integration-wireframe.md](04-FEATURES/WIREFRAMES/mockups-integration-wireframe.md) - וואירפריים לחיבור Mockups לעמודים קיימים
    - 📋 **תוכנית מימוש**: [GAP_REPORT_ANALYSIS_AND_MOCKUP_IMPLEMENTATION_PLAN.md](03-DEVELOPMENT/PLANS/GAP_REPORT_ANALYSIS_AND_MOCKUP_IMPLEMENTATION_PLAN.md) - תוכנית מימוש מקיפה
    - 📚 **הפניה ל-API**: [TRADINGVIEW_LIGHTWEIGHT_CHARTS/API_REFERENCE.md](02-ARCHITECTURE/FRONTEND/TRADINGVIEW_LIGHTWEIGHT_CHARTS/API_REFERENCE.md) - הפניה מהירה ל-API
    - 💡 **דוגמאות**: [TRADINGVIEW_LIGHTWEIGHT_CHARTS/EXAMPLES.md](02-ARCHITECTURE/FRONTEND/TRADINGVIEW_LIGHTWEIGHT_CHARTS/EXAMPLES.md) - דוגמאות קוד מעשיות
    - 📚 **דוקומנטציה מקומית**: [tradingview-lightweight-charts/INDEX.md](02-ARCHITECTURE/FRONTEND/tradingview-lightweight-charts/INDEX.md) - דוקומנטציה מקומית מקיפה ✅ **חדש! ינואר 2025**
    - 🎨 **דרישות CSS**: [TRADINGVIEW_CSS_REQUIREMENTS.md](02-ARCHITECTURE/FRONTEND/TRADINGVIEW_CSS_REQUIREMENTS.md) - תיעוד מקיף של דרישות CSS, מבנה HTML, classes זמינים, מערכת צבעים ✅ **חדש! ינואר 2025**
  - 📦 **TradingView Widgets System**: מערכת מרכזית לניהול כל הווידג'טים הרשמיים של TradingView ✅ **חדש! נובמבר 2025**
    - 📋 **תוכנית מימוש**: [TRADINGVIEW_WIDGETS_IMPLEMENTATION_PLAN.md](02-ARCHITECTURE/FRONTEND/TRADINGVIEW_WIDGETS_IMPLEMENTATION_PLAN.md) - תוכנית מפורטת למימוש מערכת מרכזית לווידג'טים עם אינטגרציה מלאה למערכות האתר ✅ **חדש! נובמבר 2025**
    - 🏗️ **תיעוד ארכיטקטורה**: [TRADINGVIEW_WIDGETS_SYSTEM.md](02-ARCHITECTURE/FRONTEND/TRADINGVIEW_WIDGETS_SYSTEM.md) - תיעוד מלא של ארכיטקטורת המערכת, רכיבים, ואינטגרציות ✅ **חדש! נובמבר 2025**
    - 👨‍💻 **מדריך מפתח**: [TRADINGVIEW_WIDGETS_DEVELOPER_GUIDE.md](02-ARCHITECTURE/FRONTEND/TRADINGVIEW_WIDGETS_DEVELOPER_GUIDE.md) - מדריך מפתח מלא עם דוגמאות לכל 11 הווידג'טים ✅ **חדש! נובמבר 2025**

### Backend
- **Python**: Flask framework עם שיפורי ביצועים מתקדמים
- **Database**: SQLite עם SQLAlchemy ORM ו-Connection Pool
- **API**: RESTful API endpoints עם Rate Limiting ו-Error Handling
- **Performance**: Metrics Collection, Caching, Background Tasks
- **Security**: Response Headers, Rate Limiting, Error Handling, User Data Isolation, Page Protection ✅ **עודכן! דצמבר 2025**
- 📊 **Trade Plan Matching Service**: [TRADE_PLAN_MATCHING_SERVICE.md](02-ARCHITECTURE/BACKEND/TRADE_PLAN_MATCHING_SERVICE.md)

### ארכיטקטורת שכבות המידע ✅ **חדש! נובמבר 2025**
- 📋 **סיכום High-Level**: [DATA_LAYERS_ARCHITECTURE_SUMMARY.md](02-ARCHITECTURE/DATA_LAYERS_ARCHITECTURE_SUMMARY.md) - סיכום מקיף של ארכיטקטורת שכבות המידע במערכת, כולל השוואה בין אפיון לקוד בפועל

### מערכת פרטי ישויות ✅ **חדש! הושלם במלואו - ספטמבר 2025**
- **Entity Details Modal**: חלון קופץ מאוחד לכל 8 סוגי הישויות במערכת
- **Dynamic Rendering**: רנדור דינמי מותאם אישית לכל ישות עם צבעים מותאמים
- **Real-time Integration**: אינטגרציה עם נתוני Yahoo Finance לטיקרים
- **Quick Actions**: 4 פעולות מהירות - עריכה, פתיחת דף, פריטים מקושרים, ייצוא

### מערכת פריטים מקושרים ✅ **חדש! ארכיטקטורה משופרת - נובמבר 2025**
- **Configuration-Based Schema**: ארכיטקטורה מרכזית עם schema יחיד לכל הקישורים
- **Generic Resolver**: resolver גנרי שמפרש schema דינמית
- **Canonical Output**: פורמט אחיד לכל סוגי הישויות
- **Support All Relationships**: direct, through, conditional, legacy
- **Cascade Logic**: תמיכה ב-cascades (execution→trade→ticker)
- **Duplicate Prevention**: מניעת כפילויות אוטומטית
- **Backward Compatible**: תאימות מלאה עם קוד קיים
- **Modal Config Integration**: אינטגרציה מלאה עם מערכת הטעינה המרכזית - modal configs נטענים מראש דרך package-manifest ✅ **עודכן! ינואר 2025**
- **Rich Text Editor Support**: תמיכה מלאה בעורך טקסט עשיר במודלים מקוננים עם retry mechanism משופר ✅ **עודכן! ינואר 2025**
- **Auto-Refresh After Deletion**: עדכון אוטומטי של מודול מקושרים אחרי מחיקת רשומה, כולל שמירת מצב warningBlock ✅ **עודכן! ינואר 2025**
- 📋 **תיעוד מלא**: [LINKED_ITEMS_SYSTEM.md](systems/LINKED_ITEMS_SYSTEM.md)
- 📖 **מדריך מפתחים**: [LINKED_ITEMS_DEVELOPER_GUIDE.md](developers/LINKED_ITEMS_DEVELOPER_GUIDE.md)
- 🔧 **Schema Reference**: [ENTITY_RELATIONSHIP_SCHEMA.md](developers/ENTITY_RELATIONSHIP_SCHEMA.md)
- 📊 **סיכום מימוש**: [LINKED_ITEMS_IMPLEMENTATION_SUMMARY.md](05-REPORTS/LINKED_ITEMS_IMPLEMENTATION_SUMMARY.md)

### מערכת ניווט מודולים מקוננים ✅ **חדש! הושלם במלואו - ינואר 2025**
- **Modal Navigation System**: מערכת ניהול מודולים מקוננים עם היסטוריית ניווט
- **Backdrop גלובלי**: backdrop אחד בלבד לכל המודולים הפתוחים
- **Breadcrumb Trail**: היסטוריית ניווט עם breadcrumb trail
- **Back Button**: כפתור חזור אוטומטי למודול הקודם
- **תמיכה עתידית**: תמיכה בהרחבות עתידיות לאופציות מקוננות נוספות
- **אינטגרציה מלאה**: עם EntityDetailsModal ו-ModalManagerV2
- **טיפול בתאריכים במודולים**: [MODAL_DATE_ENVELOPE_HANDLING.md](03-DEVELOPMENT/TOOLS/MODAL_DATE_ENVELOPE_HANDLING.md) - טיפול ב-DateEnvelope בכל מודולי העריכה ✅ **חדש! נובמבר 2025**
- **יישום בכל עמודי המשתמש**: מיושם אוטומטית בכל עמוד עם חבילת ui-advanced
- **תיעוד מלא**: [Modal Navigation System](02-ARCHITECTURE/FRONTEND/MODAL_NAVIGATION_SYSTEM.md)
- **Advanced Caching**: cache חכם עם invalidation אוטומטי
- **RTL Support**: תמיכה מלאה בעברית עם Apple Design System
- **מערכת Z-Index דינמי**: [NESTED_MODALS_Z_INDEX_SYSTEM.md](02-ARCHITECTURE/FRONTEND/NESTED_MODALS_Z_INDEX_SYSTEM.md) - ניהול דינמי של z-index, מניעת backdrop כפול, dimming של מודולים קודמים ✅ **חדש! ינואר 2025**
- **מדריך מפתחים**: [NESTED_MODALS_GUIDE.md](03-DEVELOPMENT/GUIDES/NESTED_MODALS_GUIDE.md) - מדריך מקיף לשימוש במודולים מקוננים ✅ **חדש! ינואר 2025**
- **מדריך מלא - מערכת מודולים מקווננים**: [MODAL_QUANTUM_SYSTEM_COMPLETE_GUIDE.md](02-ARCHITECTURE/FRONTEND/MODAL_QUANTUM_SYSTEM_COMPLETE_GUIDE.md) - מדריך מלא ומעודכן למערכת המודולים המקווננים כולל כל השיפורים והתיקונים ✅ **חדש! ינואר 2025**
- **סטנדרטיזציה מלאה - 100%**: [MODAL_QUANTUM_SYSTEM_COMPLETE_SUMMARY.md](05-REPORTS/MODAL_QUANTUM_SYSTEM_COMPLETE_SUMMARY.md) - סיכום מלא של פרויקט סטנדרטיזציה מלאה של כל הקבצים הפעילים במערכת ✅ **חדש! ינואר 2025**

### נתונים חיצוניים ⚠️ **90% הושלם - בעיה קריטית זוהתה**
- **Yahoo Finance**: נתוני מניות בזמן אמת (עובד נכון)
- **Advanced Caching**: מערכת cache מתקדמת עם dependency management
- **Query Optimization**: אופטימיזציית ביצועים חכמה
- **External Data Dashboard**: דשבורד ניהול וניטור נתונים חיצוניים
- **System Test Center**: מרכז בדיקות מאוחד עם 4 מודולי בדיקה
- **Ticker Provider Symbol Mapping**: מערכת מיפוי סימבולים לספקי נתונים ✅ **חדש! ינואר 2025**
  - 📋 **תיעוד ארכיטקטוני**: [TICKER_PROVIDER_SYMBOL_MAPPING.md](04-FEATURES/CORE/external_data/TICKER_PROVIDER_SYMBOL_MAPPING.md)
  - 📖 **מדריך מפתחים**: [TICKER_PROVIDER_SYMBOL_MAPPING_DEVELOPER_GUIDE.md](03-DEVELOPMENT/GUIDES/TICKER_PROVIDER_SYMBOL_MAPPING_DEVELOPER_GUIDE.md)
- **Price Change From Open**: חישוב והצגת שינויי מחיר מפתיחת המסחר ✅ **חדש! נובמבר 2025**
  - 📋 **תיעוד ארכיטקטוני**: [PRICE_CHANGE_FROM_OPEN_ANALYSIS.md](02-ARCHITECTURE/BACKEND/PRICE_CHANGE_FROM_OPEN_ANALYSIS.md)
  - 📖 **מדריך מפתחים**: [PRICE_CHANGE_FROM_OPEN_DEVELOPER_GUIDE.md](03-DEVELOPMENT/GUIDES/PRICE_CHANGE_FROM_OPEN_DEVELOPER_GUIDE.md)

#### 🚨 **בעיה קריטית זוהתה - 4 בספטמבר 2025**
**הנתונים החיצוניים נאספים בהצלחה מ-Yahoo Finance API, אבל לא נשמרים בבסיס הנתונים.**

**מצב נוכחי:**
- ✅ **איסוף נתונים**: 100% עובד (Yahoo Finance API)
- ✅ **עיבוד נתונים**: 100% עובד (QuoteData dataclass)
- ✅ **תגובות API**: 100% עובד (נתונים חיצוניים מלאים בתגובות)
- ✅ **מודלים בבסיס הנתונים**: 100% מוכנים (כל הטבלאות והקשרים מוגדרים)
- ❌ **שמירת נתונים**: **בעיה קריטית** (נתונים לא נשמרים בבסיס הנתונים)

**קבצים לבדיקה:**
- `Backend/services/external_data/yahoo_finance_adapter.py` - פונקציית `_cache_quote`
- `Backend/routes/api/tickers.py` - יצירת טיקרים עם נתונים חיצוניים
- `Backend/app.py` - endpoint של Yahoo Finance quotes

**שלבים הבאים הנדרשים:**
1. בדיקת עסקאות בסיס הנתונים
2. אימות זרימת הנתונים
3. בדיקת הזרימה המלאה
- **Complete API**: 8 REST endpoints פעילים ועובדים

## שיפורי שרת מתקדמים (ספטמבר 2025)

### שיפורים דחופים (Critical) - ✅ הושלמו
1. **Connection Pool מתקדם**: QueuePool עם 30 חיבורים במקביל
2. **אינדקסים לבסיס נתונים**: 24 אינדקסים לשיפור ביצועים
3. **Logging מתקדם**: Correlation ID ו-logs נפרדים

### שיפורים גבוהים (High Priority) - ✅ הושלמו
4. **אופטימיזציה של Queries**: QueryOptimizer עם lazy loading
5. **מערכת Caching**: In-memory caching עם TTL
6. **Error Handling מתקדם**: Custom error classes ו-centralized handling

### פתרון בעיות טרמינל (ספטמבר 2025) - ✅ הושלם
7. **בעיית תקשורת טרמינל**: זוהתה ופתורה - Cursor pseudo-terminal vs macOS Terminal
8. **סקריפטי ניהול טרמינל**: `open-terminal.sh`, `start-dev.sh`, `stop-dev.sh`
9. **מערכת איתחול משופרת**: `restart` script עם תמיכה מלאה בטרמינלים
10. **מדריך הגדרות טרמינל**: `TERMINAL_SETUP.md` עם הוראות מלאות

### שיפורים בינוניים (Medium Priority) - ✅ הושלמו
7. **Health Checks מתקדמים**: בדיקות מקיפות לכל רכיבי המערכת
8. **Response Headers Optimization**: 12 headers לאבטחה וביצועים
9. **Rate Limiting**: הגנה מפני עומס עם 5 רמות שונות

### שיפורים נמוכים (Low Priority) - ✅ הושלמו
10. **Metrics Collection**: 4 סוגי מדדי ביצועים + ניתוח מגמות
11. **Database Schema Optimization**: ניתוח והמלצות אוטומטיות
12. **Background Tasks**: 6 משימות אוטומטיות + ניטור

### מדדי ביצועים סופיים:
- **System Health Score**: 3.8/4.0 (95%)
- **Response Time**: 1010ms (מעולה)
- **Availability**: 100%
- **Error Rate**: 0%

## External Data Dashboard - עדכון מלא ספטמבר 2025 ✅

### 🎯 **מטרת המערכת:**
דשבורד מתקדם לניהול וניטור מערכת הנתונים החיצוניים של TikTrack, כולל Yahoo Finance, Advanced Caching, ו-Query Optimization.

### 📊 **סטטוס נוכחי (3 בספטמבר 2025):**
**המערכת מוכנה לחלוטין לאיסוף נתונים אמיתיים!**

### ✅ **מה שעובד מושלם (100% הצלחה):**
1. **אתחול המערכת**: הדשבורד מאותחל בהצלחה ומציג את המצב האמיתי
2. **סטטוס מערכת**: כל הרכיבים מציגים סטטוס מדויק:
   - **Yahoo Finance**: פעיל ובריא (1/2 providers active)
   - **Cache**: בריא עם סטטיסטיקות מטמון (status: degraded - normal)
   - **Database**: מחובר עם 5 טבלאות ו-2 ספקי נתונים
   - **API**: פעיל עם 22 endpoints זמינים
   - **Query Optimization**: פעיל (status: active, version: 2.0.0)
3. **ממשק משתמש**: עיצוב אחיד עם Apple Design System
4. **רענון אוטומטי**: עדכון נתונים כל 30 שניות
5. **הגדרות מערכת**: הצגת הגדרות נוכחיות עם קישור לדף העדפות
6. **Complete Integration**: Backend ו-Frontend מחוברים ועובדים יחד

### 🔧 **תכונות עיקריות:**
- **ניהול מטמון**: ניקוי, אופטימיזציה וסטטיסטיקות
- **ניהול נתונים**: ייצוא, ניתוח וגיבוי
- **ניטור לוגים**: הצגת לוגים עם פילטרים וחיפוש
- **הגדרות מערכת**: הצגת הגדרות נוכחיות (Cache TTL, Max Requests)

### 📊 **מצב נוכחי:**
- **Providers Count**: 2 ספקי נתונים פעילים
- **Cache Stats**: זמינות מלאה של סטטיסטיקות מטמון
- **System Health**: מערכת בריאה ללא שגיאות
- **API Integration**: אינטגרציה מלאה עם ה-API

### 🎨 **שיפורי עיצוב:**
- **Apple Design System**: עיצוב אחיד עם צבעים וסגנונות מתקדמים
- **RTL Support**: תמיכה מלאה בעברית עם CSS Logical Properties
- **Responsive Design**: עיצוב מותאם לכל הגדלי מסך
- **Interactive Elements**: כפתורים, כרטיסים וסטטיסטיקות אינטראקטיביים

### 📁 **קבצים מעודכנים:**
- `trading-ui/external-data-dashboard.html` - מבנה HTML משופר
- `trading-ui/scripts/external-data-dashboard.js` - לוגיקה מתקדמת
- `trading-ui/styles/external-data-dashboard.css` - עיצוב מתקדם
- `Backend/routes/external_data/status.py` - API endpoints

### 🚀 **התקדמות טכנית:**
1. **תיקון שגיאות JavaScript**: כל הפונקציות עובדות ללא שגיאות
2. **שיפור API Integration**: שימוש ב-endpoint אחד מאוחד
3. **הסרת כפילות קוד**: ניקוי פונקציות כפולות
4. **שיפור הצגת לוגים**: מידע שימושי כשאין לוגים
5. **אינטגרציה עם העדפות**: קישור לדף העדפות ראשי

## תיקונים אחרונים (אוגוסט 2025)

### בעיות שתוקנו:
1. **שגיאת מערכת פילטרים**: `window.filterSystem.resetFilters is not a function`
2. **סקריפטים חסרים**: הוספת קבצים חיוניים לעמוד ההעדפות
3. **קוד כפול**: ניקוי קוד כפול ופגום
4. **אתחול שגוי**: תיקון אתחול מערכות
5. **סטטוסי טיקרים לא נכונים**: הפעלת טריגרים אוטומטיים לעדכון סטטוסים
6. **צ'קבוקסים ב-RTL**: תיקון מיקום צ'קבוקסים בעברית עם CSS Logical Properties

### שינויים שבוצעו:
- תיקון סדר הטעינה של הסקריפטים
- ניקוי קוד כפול בפונקציה `resetToDefaults`
- הוספת פונקציות עזר גלובליות ב-`header-system.js`
- תיקון אתחול מערכת הפילטרים
- **הפעלת טריגרים אוטומטיים** לעדכון סטטוסי טיקרים
- **הוספת טריגרים למודל TradePlan** לעדכון סטטוסי טיקרים
- **תיקון פונקציית reactivateTicker** להחזרת סטטוס 'open' במקום 'closed'
- **יצירת סקריפט תיקון** לסטטוסי טיקרים קיימים

### פונקציות חדשות שנוספו:
- `getVisibleContainers()` - קבלת כל הקונטיינרים הנראים
- `showAllRecordsInTable()` - הצגת כל הרשומות בטבלה
- `updateTableCount()` - עדכון מספר הרשומות בטבלה
- `resetFiltersManually()` - איפוס ידני של פילטרים (גיבוי)
- `handleElementNotFound()` - טיפול במקרה שאלמנט לא נמצא
- `handleDataLoadError()` - טיפול בשגיאות טעינת נתונים
- `tryLoadData()` - ניסיון לטעינת נתונים
- **טריגרים אוטומטיים** לעדכון סטטוסי טיקרים (Trade, TradePlan)
- **סקריפט תיקון סטטוסים** - `fix_ticker_statuses.py`
- **מדריך RTL מקיף** - `RTL_HEBREW_GUIDE.md` עם דוגמאות קוד ופתרונות

## תיעוד מפורט

### מערכות עיקריות

#### מערכת פריטים מקושרים ✅ **ארכיטקטורה משופרת v2.0 - נובמבר 2025**
- 📋 **תיעוד מערכת**: [LINKED_ITEMS_SYSTEM.md](systems/LINKED_ITEMS_SYSTEM.md) - תיעוד מלא של המערכת
- 📖 **מדריך מפתחים**: [LINKED_ITEMS_DEVELOPER_GUIDE.md](developers/LINKED_ITEMS_DEVELOPER_GUIDE.md) - מדריך שימוש למפתחים
- 🔧 **Schema Reference**: [ENTITY_RELATIONSHIP_SCHEMA.md](developers/ENTITY_RELATIONSHIP_SCHEMA.md) - תיעוד מלא של ה-schema
- 📚 **סיכום תיעוד מקיף**: [LINKED_ITEMS_COMPREHENSIVE_DOCUMENTATION_SUMMARY.md](05-REPORTS/LINKED_ITEMS_COMPREHENSIVE_DOCUMENTATION_SUMMARY.md) - אינדקס מלא לכל התיעוד (21+ קבצים) ✅ **חדש!**
- 📊 **סיכום מימוש**: [LINKED_ITEMS_IMPLEMENTATION_SUMMARY.md](05-REPORTS/LINKED_ITEMS_IMPLEMENTATION_SUMMARY.md) - סיכום המימוש המלא
- ✅ **דוח סטטוס סופי**: [LINKED_ITEMS_FINAL_STATUS.md](05-REPORTS/LINKED_ITEMS_FINAL_STATUS.md) - דוח סטטוס מלא ומוכן לייצור
- 📝 **התאמות נדרשות**: [LINKED_ITEMS_ADJUSTMENTS_NEEDED.md](05-REPORTS/LINKED_ITEMS_ADJUSTMENTS_NEEDED.md) - רשימת שינויים
- 🎯 **ניתוח ארכיטקטורה**: [LINKED_ITEMS_ARCHITECTURE_ANALYSIS.md](05-REPORTS/LINKED_ITEMS_ARCHITECTURE_ANALYSIS.md) - ניתוח הארכיטקטורה
- 📊 **אופציות ארכיטקטורה**: [LINKED_ITEMS_ARCHITECTURE_OPTIONS.md](05-REPORTS/LINKED_ITEMS_ARCHITECTURE_OPTIONS.md) - השוואת אופציות
- 🔍 **ניתוח payloads**: [LINKED_ITEMS_PAYLOAD_ANALYSIS.md](05-REPORTS/LINKED_ITEMS_PAYLOAD_ANALYSIS.md) - ניתוח payloads
- ⚠️ **אי-התאמות**: [LINKED_ITEMS_DISCREPANCIES.md](05-REPORTS/LINKED_ITEMS_DISCREPANCIES.md) - תיעוד אי-התאמות
- 🎨 **צריכת frontend**: [LINKED_ITEMS_FRONTEND_CONSUMPTION.md](05-REPORTS/LINKED_ITEMS_FRONTEND_CONSUMPTION.md) - ניתוח frontend
- [מערכת העדפות](04-FEATURES/CORE/preferences/PREFERENCES_SYSTEM.md) - הגדרות מערכת מותאמות אישית עם פרופילים מרובים
- [מערכת פילטרים](features/filter-system/README.md) - פילטרים גלובליים
- [מערכת התראות](features/alerts/README.md) - התראות מתקדמות
- [מערכת חשבונות](features/accounts/README.md) - ניהול חשבונות
  - 💰 **Account Balance Service**: [ACCOUNT_BALANCE_SERVICE.md](04-FEATURES/CORE/ACCOUNTS/ACCOUNT_BALANCE_SERVICE.md) - שירות מרכזי לטעינת יתרות ✅ **חדש!**
  - 📊 **Account Activity System**: [ACCOUNT_ACTIVITY_SYSTEM.md](04-FEATURES/CORE/ACCOUNTS/ACCOUNT_ACTIVITY_SYSTEM.md) - מערכת חישוב פעילות חשבון
  - 🏗️ **אינדקס דוקומנטציה**: [ACCOUNTS/INDEX.md](04-FEATURES/CORE/ACCOUNTS/INDEX.md) - אינדקס מלא לכל הדוקומנטציה ✅ **חדש!**
- [מערכת טריידים](features/trades/README.md) - ניהול טריידים
- [מערכת נתונים חיצוניים](features/external-data/README.md) - אינטגרציה עם נתונים חיצוניים
- [מערכת פרטי ישויות](features/entity-details-system/README.md) - הצגת פרטי ישויות מתקדמת ✅ **חדש!**
- [מערכת ניהול מערכת](features/system-management/README.md) - ניהול וניטור מערכת מתקדם ✅ **חדש!**
- [מערכת תנאים](features/conditions-system/README.md) - מערכת תנאים מתקדמת (6 שיטות מסחר) ✅ **חדש!**
- 📊 **מערכת פוזיציות ופורטפוליו**: [POSITIONS_PORTFOLIO_SYSTEM.md](04-FEATURES/CORE/POSITIONS_PORTFOLIO_SYSTEM.md) - מערכת חישוב פוזיציות ופורטפוליו ✅ **חדש!**
- [מערכת RTL](RTL_HEBREW_GUIDE.md) - תמיכה מלאה בעברית ו-RTL

### ארכיטקטורת Backend ✅ **מערכת פוזיציות חדשה!**
- 📊 **Position & Portfolio Service**: [POSITION_PORTFOLIO_SERVICE.md](02-ARCHITECTURE/BACKEND/POSITION_PORTFOLIO_SERVICE.md) - שירות חישוב פוזיציות ופורטפוליו ✅ **חדש!**
- 📈 **Price Change From Open**: [PRICE_CHANGE_FROM_OPEN_ANALYSIS.md](02-ARCHITECTURE/BACKEND/PRICE_CHANGE_FROM_OPEN_ANALYSIS.md) - חישוב והצגת שינויי מחיר מפתיחת המסחר ✅ **חדש! נובמבר 2025**
- 🏷️ **Tag Links Cleanup System**: [TAG_LINKS_CLEANUP_SYSTEM.md](02-ARCHITECTURE/BACKEND/TAG_LINKS_CLEANUP_SYSTEM.md) - מערכת ניקוי אוטומטית של tag links בעת מחיקת entities ✅ **חדש! ינואר 2025**
  - 👨‍💻 **מדריך מפתחים**: [TAG_LINKS_CLEANUP_GUIDE.md](03-DEVELOPMENT/GUIDES/TAG_LINKS_CLEANUP_GUIDE.md) - מדריך מפתחים מלא למערכת ניקוי Tag Links ✅ **חדש! ינואר 2025**
- 📧 **SMTP Service**: [SMTP_SERVICE_GUIDE.md](backend/SMTP_SERVICE_GUIDE.md) - שירות SMTP גמיש לשליחת מגוון הודעות עם תמיכה ב-templates, הגדרות במערכת הכלליות, ולוגים ✅ **חדש! ינואר 2025**
  - 🏗️ **ארכיטקטורת SMTP**: [SMTP_ARCHITECTURE.md](backend/SMTP_ARCHITECTURE.md) - ארכיטקטורה מלאה להחלפת שרת SMTP ללא שינויי קוד ✅ **חדש! ינואר 2025**
  - 📋 **Email Templates**: [EMAIL_TEMPLATES_GUIDE.md](backend/EMAIL_TEMPLATES_GUIDE.md) - מדריך templates למיילים עם header ו-footer קבועים
  - 👥 **מדריך מנהל מערכת**: [SMTP_MANAGEMENT_GUIDE.md](admin/SMTP_MANAGEMENT_GUIDE.md) - הוראות ניהול SMTP במערכת
  - 👤 **מדריך משתמש**: [SMTP_USER_GUIDE.md](05-USER-GUIDES/SMTP_USER_GUIDE.md) - מדריך למשתמשים לשימוש בשירות SMTP (איפוס סיסמה, התראות) ✅ **חדש! ינואר 2025**
  - 📧 **הגדרת Mailjet**: [MAILJET_SETUP_GUIDE.md](admin/MAILJET_SETUP_GUIDE.md) - מדריך מפורט להגדרת Mailjet ב-TikTrack ✅ **חדש! ינואר 2025**
  - 📧 **הגדרת SendGrid**: [SENDGRID_SETUP_GUIDE.md](admin/SENDGRID_SETUP_GUIDE.md) - מדריך מפורט להגדרת SendGrid ב-TikTrack ✅ **חדש! ינואר 2025**
  - ⚡ **מדריך מהיר SendGrid**: [SENDGRID_QUICK_START.md](admin/SENDGRID_QUICK_START.md) - מדריך שלב אחר שלב מהיר אחרי יצירת חשבון ✅ **חדש! ינואר 2025**
  - 🔑 **הסבר על מפתחות SendGrid**: [SENDGRID_API_KEYS_EXPLAINED.md](admin/SENDGRID_API_KEYS_EXPLAINED.md) - הסבר על סוגי מפתחות API ב-SendGrid ✅ **חדש! ינואר 2025**
  - 🔧 **פתרון בעיות SendGrid**: [SENDGRID_TROUBLESHOOTING.md](admin/SENDGRID_TROUBLESHOOTING.md) - מדריך פתרון בעיות נפוצות ב-SendGrid ✅ **חדש! ינואר 2025**
  - 🔐 **הגדרת Gmail App Password**: [GMAIL_APP_PASSWORD_SETUP.md](admin/GMAIL_APP_PASSWORD_SETUP.md) - מדריך להגדרת App Password ב-Gmail רגיל ✅ **חדש! ינואר 2025**
  - 🏢 **הגדרת Google Workspace SMTP**: [GMAIL_WORKSPACE_SMTP_SETUP.md](admin/GMAIL_WORKSPACE_SMTP_SETUP.md) - מדריך להגדרת SMTP ב-Google Workspace עם הגדרות מנהל מערכת ✅ **חדש! ינואר 2025**
  - ✅ **רשימת בדיקה מהירה למנהל מערכת**: [GMAIL_WORKSPACE_ADMIN_QUICK_CHECKLIST.md](admin/GMAIL_WORKSPACE_ADMIN_QUICK_CHECKLIST.md) - רשימת בדיקה מהירה למנהל מערכת Google Workspace ✅ **חדש! ינואר 2025**
  - 🔄 **פתרונות SMTP חלופיים לפיתוח**: [SMTP_ALTERNATIVES_DEVELOPMENT.md](admin/SMTP_ALTERNATIVES_DEVELOPMENT.md) - פתרונות SMTP שלא דורשים IP קבוע (SendGrid, Mailgun, Mailtrap) ✅ **חדש! ינואר 2025**
  - 📊 **Email Logs API**: [EMAIL_LOGS_API.md](backend/EMAIL_LOGS_API.md) - תיעוד API endpoints ללוגי מיילים ✅ **חדש! ינואר 2025**
  - 📋 **דוח בדיקות SMTP**: [SMTP_FINAL_TEST_REPORT.md](05-REPORTS/SMTP_FINAL_TEST_REPORT.md) - דוח בדיקות מקיף של מערכת SMTP ✅ **חדש! ינואר 2025**
  - 📋 **דוח בדיקות לוגי מיילים**: [EMAIL_LOGS_TEST_REPORT.md](05-REPORTS/EMAIL_LOGS_TEST_REPORT.md) - דוח בדיקות מקיף של לוגי מיילים ✅ **חדש! ינואר 2025**

### מערכות שרת מתקדמות
- [מערכת ביצועים](server/PERFORMANCE_SYSTEM.md) - Connection Pool, Indexes, Query Optimization
- [מערכת ניטור](server/MONITORING_SYSTEM.md) - Metrics Collection, Health Checks, Logging
- [מערכת אבטחה](server/SECURITY_SYSTEM.md) - Rate Limiting, Response Headers, Error Handling
- [מערכת תחזוקה](server/MAINTENANCE_SYSTEM.md) - Background Tasks, Cache Management, Database Optimization

### אבטחה ואימות ✅ **עודכן! דצמבר 2025**
- 🔐 **בידוד נתוני משתמשים**: [SECURITY_AUDIT_USER_DATA_ISOLATION.md](production/SECURITY_AUDIT_USER_DATA_ISOLATION.md) - דוח אבטחה ותיקון בידוד נתוני משתמשים ✅ **עודכן! דצמבר 2025**
- 🛡️ **הגנת עמודים**: [SECURITY_AUDIT_PAGE_PROTECTION.md](production/SECURITY_AUDIT_PAGE_PROTECTION.md) - דוח אבטחה ותיקון הגנת עמודים ✅ **עודכן! דצמבר 2025**
- 📖 **מדריך למפתחים - אבטחה**: [SECURITY_GUIDELINES.md](03-DEVELOPMENT/GUIDES/SECURITY_GUIDELINES.md) - הנחיות למפתחים להוספת user_id filtering והגנת עמודים ✅ **חדש! דצמבר 2025**
- 🗄️ **ארגון ארכיון נובמבר 2025**: [ARCHIVE_INDEX.md](05-REPORTS/LOCAL_SUMMARIES/ARCHIVE_INDEX.md) כולל מעבר סקריפטי הכפתורים, מיגרציות SQLite ישנות והנחיות לשחזור.
- 🧹 **כלי ניקוי רגישים**: [scripts/cleanup/README.md](../scripts/cleanup/README.md) – צ'ק-ליסט בטיחות להרצת סקריפטי מחיקה וניקוי.

### פיתוח
- [הגדרת פיתוח](development/README.md) - הגדרת סביבת פיתוח
- [Production Worktree Setup](03-DEVELOPMENT/PRODUCTION_WORKTREE_SETUP.md) - הקמת Worktree לסביבת פרודקשן מקומית
- 💾 **מדריך גיבויים וניהול גרסאות**: [BACKUP_AND_VERSION_CONTROL_GUIDE.md](development/BACKUP_AND_VERSION_CONTROL_GUIDE.md) - אסטרטגיית גיבוי מקיפה עם תדירות רגועה ✨ **חדש!**
- 📈 **מדריך מפתחים - שינוי מפתיחה**: [PRICE_CHANGE_FROM_OPEN_DEVELOPER_GUIDE.md](03-DEVELOPMENT/GUIDES/PRICE_CHANGE_FROM_OPEN_DEVELOPER_GUIDE.md) - מדריך מפורט לשימוש והרחבה של מערכת חישוב שינויי מחיר מפתיחת המסחר ✅ **חדש! נובמבר 2025**
- 📝 **מערכת עריכת טקסט עשיר**:
  - [RICH_TEXT_EDITOR_COMPARISON.md](03-DEVELOPMENT/RICH_TEXT_EDITOR_COMPARISON.md) - השוואת פתרונות עורך טקסט ✅ **חדש! נובמבר 2025**
  - [RICH_TEXT_EDITOR_ENTITY_MAPPING.md](03-DEVELOPMENT/RICH_TEXT_EDITOR_ENTITY_MAPPING.md) - מיפוי ישויות ותכונות למודול העריכה ✅ **חדש! נובמבר 2025**
  - [RICH_TEXT_EDITOR_QUILL_FEATURES.md](03-DEVELOPMENT/RICH_TEXT_EDITOR_QUILL_FEATURES.md) - מיפוי תכונות Quill מול הצרכים שלנו ✅ **חדש! נובמבר 2025**
  - [RICH_TEXT_STORAGE_COMPARISON.md](03-DEVELOPMENT/RICH_TEXT_STORAGE_COMPARISON.md) - השוואת אסטרטגיות אחסון לתוכן עשיר ✅ **חדש! נובמבר 2025**
  - **Rich Text Editor Integration**: מערכת עורך טקסט עשיר משולבת במלואה עם מערכת הטעינה המרכזית. Modal configs נטענים מראש דרך package-manifest, עם תמיכה מלאה במודלים מקוננים. ✅ **עודכן! ינואר 2025**
### מערכות מטמון ואחסון ✅ **מערכת מאוחדת חדשה! הושלמה בינואר 2025**
- 🚧 **Stage B-Lite Cache Strategy**: [CACHE_STAGE_B_LITE.md](03-DEVELOPMENT/CACHE_STAGE_B_LITE.md) – תצורת ביניים עם מטמון שרת כבוי, שכבות Frontend מלאות ותפריט ניקוי למפתחים (פעיל ב-Dev וב-Prod).
- **Unified Cache System**: מערכת מטמון מאוחדת עם 4 שכבות
  - 🏗️ **תוכנית עיצוב מחדש**: [CACHE_ARCHITECTURE_REDESIGN_PLAN.md](frontend/CACHE_ARCHITECTURE_REDESIGN_PLAN.md)
  - 📊 **סיכום ארכיטקטורה**: [CACHE_ARCHITECTURE_SUMMARY.md](frontend/CACHE_ARCHITECTURE_SUMMARY.md)
  - 🔧 **מדריך יישום**: [CACHE_IMPLEMENTATION_GUIDE.md](frontend/CACHE_IMPLEMENTATION_GUIDE.md)
  - 🔗 **תוכנית אינטגרציה**: [CACHE_INTEGRATION_PLAN.md](frontend/CACHE_INTEGRATION_PLAN.md)
- **Advanced Cache System**: מערכת cache מתקדמת עם dependency management
  - 🚀 **מדריך מלא**: [ADVANCED_CACHE_SYSTEM_GUIDE.md](development/ADVANCED_CACHE_SYSTEM_GUIDE.md)
  - 🔧 **מדריך שימוש**: [CACHE_MONITORING_USER_GUIDE.md](development/CACHE_MONITORING_USER_GUIDE.md)
- **Smart Cache Clearing**: ניקוי cache חכם לפי סוג פעולה
- **Performance Monitoring**: מוניטור ביצועים מובנה
- **Dependency Management**: מערכת dependencies מתקדמת

### מערכות כלליות 📋 **רשימה מעודכנת**
- **רשימת מערכות כלליות**: [GENERAL_SYSTEMS_LIST.md](frontend/GENERAL_SYSTEMS_LIST.md) - רשימה מעודכנת של כל המערכות הכלליות ✨ חדש!

### API ותיעוד טכני
- [API Reference](api/README.md) - תיעוד API
- [Database Schema](database/README.md) - מבנה בסיס הנתונים
- [Testing](testing/README.md) - מדריך בדיקות
- [מדריך RTL לעברית](RTL_HEBREW_GUIDE.md) - מדריך מקיף לעבודה עם RTL בעברית
- [מערכת הכפתורים המרוכזת](frontend/button-system.md) - ניהול מרכזי של כפתורי פעולה
- [מערכת ולידציה](frontend/VALIDATION_SYSTEM.md) - מערכת ולידציה גלובלית לטופסים

### בדיקות איכות ✅ **מערכת בדיקות CRUD חדשה! הושלמה בינואר 2025**
- 🧪 **דשבורד בדיקות**: [http://localhost:8080/crud-testing-dashboard](http://localhost:8080/crud-testing-dashboard)
- 📋 **תוכנית בדיקות**: [CRUD Testing Comprehensive Plan](05-REPORTS/ANALYSIS/CRUD_TESTING_COMPREHENSIVE_PLAN.md)
- 🛠️ **כלי בדיקה אוטומטיים**: Python tools לבדיקת כל העמודים
- 📊 **דוחות מפורטים**: JSON ו-Markdown עם תוצאות מלאות
- ✅ **כיסוי מלא**: 12 עמודי CRUD + 16 עמודי מערכת נוספים
- 🎉 **החייאה של CRUD - הושלמה!**: [CRUD Revival Status](05-REPORTS/CRUD_REVIVAL_STATUS.md) - תהליך החייאה מלא של כל ממשקי ה-CRUD במערכת, 8/8 עמודים עוברים ב-100% ✅ **חדש! דצמבר 2025**
- 📊 **דוח סופי - בדיקות CRUD**: [CRUD Testing Final Success](05-REPORTS/CRUD_TESTING_FINAL_SUCCESS.md) - דוח סופי עם תוצאות 100% לכל העמודים ✅ **חדש! דצמבר 2025**
- 📋 **תיקונים שבוצעו**: [CRUD Fixes Summary](05-REPORTS/CRUD_FIXES_SUMMARY.md) - סיכום כל התיקונים שבוצעו ✅ **חדש! דצמבר 2025**

### דוחות השלמה וניתוח ✅ **מאורגן מחדש! ספטמבר 2025**
- [דוחות השלמה](reports/README.md) - **13 דוחות השלמה** של מערכות ופיצ'רים ✨
- [דוחות ניתוח](reports/README.md) - **7 דוחות ניתוח** מקיפים של המערכת ✨
- [Local Summaries Archive](05-REPORTS/LOCAL_SUMMARIES/) - דוחות סיכום היסטוריים שעברו מהשורש ל-documentation ✨ **עודכן נובמבר 2025**
  - 🎉 **החייאה של CRUD - דוחות**: [CRUD Revival Status](05-REPORTS/CRUD_REVIVAL_STATUS.md), [CRUD Testing Final Success](05-REPORTS/CRUD_TESTING_FINAL_SUCCESS.md), [CRUD Fixes Summary](05-REPORTS/CRUD_FIXES_SUMMARY.md), [CRUD Patterns Analysis](05-REPORTS/CRUD_PATTERNS_ANALYSIS.md), [Tickers Specification](05-REPORTS/TICKERS_SPECIFICATION.md), [Tickers Fix Plan](05-REPORTS/TICKERS_FIX_PLAN.md), [Header Initialization Fix](05-REPORTS/HEADER_INITIALIZATION_FIX.md) ✅ **חדש! דצמבר 2025**
  - 📊 **דוח ניתוח פערים**: [GAP_REPORT_ANALYSIS.md](05-REPORTS/GAP_REPORT_ANALYSIS.md) - ניתוח מקיף של דוח הפערים המלא ✅ **חדש! ינואר 2025**
  - 📋 **דוח החלטות פערים**: [GAP_REPORT_DECISIONS.md](05-REPORTS/GAP_REPORT_DECISIONS.md) - רשימת החלטות לכל המלצה בדוח הפערים ✅ **חדש! ינואר 2025**
  - 📊 **דשבורד טיקר - בעיות Backend**: [TICKER_DASHBOARD_BACKEND_ISSUES.md](05-REPORTS/TICKER_DASHBOARD_BACKEND_ISSUES.md) - תיעוד בעיות Backend endpoints ודרכי פתרון ✅ **חדש! ינואר 2025**
  - 📋 **דשבורד טיקר - דוח בדיקות**: [TICKER_DASHBOARD_TEST_REPORT.md](05-REPORTS/TICKER_DASHBOARD_TEST_REPORT.md) - דוח בדיקות מקיף של עמוד דשבורד טיקר ✅ **חדש! ינואר 2025**
- 📊 **עמוד אמת - מצב המערכת**: [SYSTEM_STATUS.md](SYSTEM_STATUS.md) - מסמך מרכזי המציג את מצב כל המסכים והפיצ'רים ✅ **חדש! ינואר 2025**
- [דוח השלמת מערכת מנהל המערכת](reports/completion/SYSTEM_MANAGEMENT_COMPLETION_REPORT.md) - מערכת ניהול מערכת מלאה ✅ **חדש!**
- 🧾 **חבילת אימות מערכת הטבלאות** (ינואר 2025): [TABLE_MAPPING_COMPREHENSIVE_CHECK.md](05-REPORTS/TABLE_MAPPING_COMPREHENSIVE_CHECK.md), [TABLE_MAPPING_COMPLETE_SUMMARY.md](05-REPORTS/TABLE_MAPPING_COMPLETE_SUMMARY.md), [TABLE_MAPPING_VERIFICATION_REPORT.md](05-REPORTS/TABLE_MAPPING_VERIFICATION_REPORT.md), [TABLE_MAPPING_VERIFICATION_TRADING_ACCOUNTS.md](05-REPORTS/TABLE_MAPPING_VERIFICATION_TRADING_ACCOUNTS.md), [ALL_TABLES_FINAL_VERIFICATION.md](05-REPORTS/ALL_TABLES_FINAL_VERIFICATION.md), [DYNAMIC_TABLES_VERIFICATION.md](05-REPORTS/DYNAMIC_TABLES_VERIFICATION.md), [UNIFIED_TABLE_SYSTEM_TEST_REPORT.md](05-REPORTS/UNIFIED_TABLE_SYSTEM_TEST_REPORT.md)
- 📊 **דוחות מיון וטבלאות**: [SORTING_SYSTEM_ANALYSIS.md](05-REPORTS/SORTING_SYSTEM_ANALYSIS.md), [SORTING_FIX_COMPREHENSIVE_REPORT.md](05-REPORTS/SORTING_FIX_COMPREHENSIVE_REPORT.md), [SORTING_FIXES_COMPLETE_REPORT.md](05-REPORTS/SORTING_FIXES_COMPLETE_REPORT.md), [PROPOSED_SORTING_SYSTEM_IMPROVEMENT.md](05-REPORTS/PROPOSED_SORTING_SYSTEM_IMPROVEMENT.md)
- 📋 **בדיקות פוזיציות ופורטפוליו**: [POSITIONS_PORTFOLIO_TEST_REPORT.md](05-REPORTS/POSITIONS_PORTFOLIO_TEST_REPORT.md), [POSITIONS_PORTFOLIO_MANUAL_TEST_CHECKLIST.md](03-DEVELOPMENT/TESTING/POSITIONS_PORTFOLIO_MANUAL_TEST_CHECKLIST.md)
- 📑 **דו"ח מיגרציות טבלאות**: [MIGRATION_COMPLETE_SUMMARY.md](05-REPORTS/MIGRATION_COMPLETE_SUMMARY.md), [ENTITIES_ADD_MODAL_AUDIT_WORK_DOCUMENT.md](05-REPORTS/ENTITIES_ADD_MODAL_AUDIT_WORK_DOCUMENT.md)

### תוכניות עבודה ✅ **מאורגן מחדש! ספטמבר 2025**
- [תוכניות יישום](plans/README.md) - **10 תוכניות עבודה** מפורטות ✨

### מדריכי פיתוח ✅ **מאורגן מחדש! ספטמבר 2025**
- [מדריכי פיתוח](guides/README.md) - **6 מדריכים** מקיפים ✨

### כלי פיתוח ✅ **מאורגן מחדש! ספטמבר 2025**
- [כלי בדיקות](tools/README.md) - **12 כלי בדיקות CRUD** ✨
- [כלי CSS](tools/README.md) - **15 כלי CSS** וניתוח ✨
- [כלי ניתוח](tools/README.md) - **6 כלי ניתוח** קוד ומערכת ✨

### Frontend Documentation

### ווידג'טים במערכת ✅ **חדש! ינואר 2025**
- 📋 **רשימת ווידג'טים**: [WIDGETS_LIST.md](frontend/WIDGETS_LIST.md) - רשימה מלאה של כל הווידג'טים במערכת (Dashboard, Special, TradingView) ✅ **חדש! ינואר 2025**
- 🏗️ **ארכיטקטורת ווידג'טים**: [WIDGET_SYSTEM_ARCHITECTURE.md](02-ARCHITECTURE/FRONTEND/WIDGET_SYSTEM_ARCHITECTURE.md) - סקירה כללית של מערכת הווידג'טים, ארכיטקטורות מומלצות ואינטגרציות ✅ **חדש! ינואר 2025**
- 👨‍💻 **מדריך למפתח - יצירת ווידג'טים**: [WIDGET_DEVELOPER_GUIDE.md](03-DEVELOPMENT/GUIDES/WIDGET_DEVELOPER_GUIDE.md) - מדריך מקיף ליצירת ווידג'טים חדשים עם תבניות ודוגמאות ✅ **חדש! ינואר 2025**
- 📑 **מדריך מערכת טאבים**: [TAB_SYSTEM_GUIDE.md](02-ARCHITECTURE/FRONTEND/TAB_SYSTEM_GUIDE.md) - שימוש ב-Bootstrap Tabs בווידג'טים ומודלים ✅ **חדש! ינואר 2025**
- 🔍 **השוואת ארכיטקטורות**: [WIDGET_ARCHITECTURE_COMPARISON.md](03-DEVELOPMENT/GUIDES/WIDGET_ARCHITECTURE_COMPARISON.md) - השוואה מפורטת בין גישות ארכיטקטוניות לווידג'טים
- 🏷️ **Tag Widget Developer Guide**: [TAG_WIDGET_DEVELOPER_GUIDE.md](03-DEVELOPMENT/GUIDES/TAG_WIDGET_DEVELOPER_GUIDE.md) - מדריך ספציפי לווידג'ט תגיות מאוחד ✅ **חדש! ינואר 2025**

### מערכת Autocomplete ✅ **חדש! ינואר 2025**
- 🎯 **מדריך מפתח**: [AUTOCOMPLETE_SERVICE_GUIDE.md](03-DEVELOPMENT/GUIDES/AUTOCOMPLETE_SERVICE_GUIDE.md) - מדריך מקיף לשימוש ב-Autocomplete Service ✅ **חדש! ינואר 2025**
- 🏗️ **ארכיטקטורה**: [AUTOCOMPLETE_SYSTEM_ARCHITECTURE.md](02-ARCHITECTURE/FRONTEND/AUTOCOMPLETE_SYSTEM_ARCHITECTURE.md) - מסמך ארכיטקטורה למערכת Autocomplete ✅ **חדש! ינואר 2025**

### Button System & Tooltips
- [Button System Documentation](frontend/button-system.md) - Complete button system guide
- [Button Tooltips Developer Guide](frontend/BUTTON_TOOLTIPS_DEVELOPER_GUIDE.md) - Comprehensive developer guide for tooltips
- [Tooltip Standardization Plan](frontend/TOOLTIP_STANDARDIZATION_PLAN.md) - Implementation plan for tooltip standardization across all pages
- [CSS Architecture Guide](frontend/CSS_ARCHITECTURE_GUIDE.md) - **מדריך ארכיטקטורת CSS החדשה** ✨
- [RTL Development Guide](frontend/RTL_DEVELOPMENT_GUIDE.md) - **מדריך פיתוח RTL** ✨
- [Dynamic Colors Guide](frontend/DYNAMIC_COLORS_GUIDE.md) - **מדריך מערכת צבעים דינמית** ✨
- [Detailed Log System Guide](frontend/DETAILED_LOG_SYSTEM_GUIDE.md) - **מדריך מערכת הלוג המפורט** ✨ **חדש!**

### שרת
- [Server Setup](server/README.md) - הגדרת שרת
- [Deployment](server/DEPLOYMENT.md) - פריסת מערכת
- 🚀 **מדריך מערכת איתחול**: [RESTART_SCRIPT_GUIDE.md](server/RESTART_SCRIPT_GUIDE.md) - מערכת איתחול מתקדמת עם פתרון בעיות טרמינל ✨ **עודכן!**

### משתמשים
- [User Guide](user/README.md) - מדריך משתמש
- [Troubleshooting](user/TROUBLESHOOTING.md) - פתרון בעיות
- 👥 **הגדרת משתמשים ראשוניים**: [USERS_SETUP_GUIDE.md](admin/USERS_SETUP_GUIDE.md) - מדריך להגדרת משתמשים ראשוניים במערכת Multi-User ✅ **חדש! ינואר 2025**
- 📋 **דוח בדיקות Multi-User**: [MULTI_USER_IMPLEMENTATION_TESTING_REPORT.md](05-REPORTS/MULTI_USER_IMPLEMENTATION_TESTING_REPORT.md) - דוח בדיקות מקיף של מערכת Multi-User ✅ **חדש! ינואר 2025**
- 📋 **תהליך ניקוי נתוני משתמש**: [USER_DATA_CLEANUP_PROCESS.md](05-REPORTS/USER_DATA_CLEANUP_PROCESS.md) - תהליך מקיף לניקוי נתוני משתמש ✅ **חדש! ינואר 2025**
- 📋 **ניתוח מיגרציית User ID**: [USER_ID_MIGRATION_ANALYSIS.md](05-REPORTS/USER_ID_MIGRATION_ANALYSIS.md) - ניתוח מיגרציית User ID לכל הטבלאות ✅ **חדש! ינואר 2025**
- 📋 **סטטוס User ID בכל הטבלאות**: [ALL_DATABASES_USER_ID_STATUS.md](05-REPORTS/ALL_DATABASES_USER_ID_STATUS.md) - סטטוס User ID בכל טבלאות המסד נתונים ✅ **חדש! ינואר 2025**

## התקנה והפעלה

### דרישות מערכת
- Python 3.9+
- Node.js 14+
- SQLite 3

### התקנה מהירה
```bash
# Clone repository
git clone <repository-url>
cd TikTrackApp

# Install dependencies
pip install -r requirements.txt

# Start development server
./start_dev.sh
```

### הפעלת שרת
```bash
# Development server (מומלץ - טרמינל מובנה)
./start-dev.sh development

# Manual terminal operations
./open-terminal.sh

# Stop server
./stop-dev.sh

# Legacy scripts (עדיין זמינים)
./start_dev.sh
./start_optimized.sh
```

## פיתוח

### מבנה פרויקט
```
TikTrackApp/
├── Backend/                 # Backend Python code
│   ├── routes/             # API routes
│   ├── models/             # Database models
│   ├── services/           # Business logic
│   └── utils/              # Utilities
├── trading-ui/             # Frontend code
│   ├── scripts/            # JavaScript files
│   ├── styles/             # CSS files
│   └── *.html              # HTML pages
├── documentation/          # Documentation
└── external_data_integration_server/  # External data server
```

### כללי פיתוח
- **קוד נקי**: עקוב אחר כללי קוד נקי
- **תיעוד**: תיעד כל פונקציה וקובץ
- **בדיקות**: כתוב בדיקות לכל פונקציונליות חדשה
- **תאימות**: ווד תאימות עם דפדפנים שונים

## External Data Dashboard - מדריך מפורט

### 🎯 **מטרת המערכת:**
דשבורד מתקדם לניהול וניטור מערכת הנתונים החיצוניים של TikTrack, המספק:
- ניטור בזמן אמת של ספקי נתונים חיצוניים
- ניהול מטמון נתונים עם אופטימיזציה
- מעקב אחר ביצועי מערכת ובריאות
- ניהול הגדרות מערכת מרכזי

### 🏗️ **ארכיטקטורה טכנית:**

#### **Frontend Components:**
- **`ExternalDataDashboard` Class**: מחלקה ראשית לניהול הדשבורד
- **Unified Status Loading**: טעינת כל הסטטוסים מ-endpoint אחד
- **Real-time Updates**: רענון אוטומטי כל 30 שניות
- **Interactive UI**: כפתורים, כרטיסים וסטטיסטיקות אינטראקטיביים

#### **Backend API:**
- **`/api/external-data/status/`**: endpoint מאוחד לכל המידע
- **Cache Management**: ניקוי, אופטימיזציה וסטטיסטיקות
- **Provider Testing**: בדיקת ספקי נתונים
- **Log Management**: ניהול לוגים עם פילטרים

#### **Data Flow:**
```
Dashboard → API Endpoint → Cache Manager → External Providers
    ↓              ↓              ↓              ↓
UI Update ← JSON Response ← Status Data ← Provider Status
```

### 🔧 **פונקציות עיקריות:**

#### **1. ניהול סטטוס מערכת:**
```javascript
// טעינת סטטוס מאוחד
async loadSystemStatus() {
  const response = await fetch('/api/external-data/status/');
  const data = await response.json();
  this.updateYahooFinanceStatus(data);
  this.updateCacheStatus(data);
  this.updateDatabaseStatus(data);
  this.updateAPIStatus(data);
}
```

#### **2. ניהול מטמון:**
- **Cache Statistics**: ציטוטים, נתוני תוך יום, אחוז פגיעות
- **Cache Operations**: ניקוי, אופטימיזציה, ניהול TTL
- **Performance Monitoring**: מעקב אחר ביצועי מטמון

#### **3. ניטור ספקים:**
- **Provider Status**: Yahoo Finance, Google Finance, Alpha Vantage
- **Health Checks**: בדיקות בריאות אוטומטיות
- **Performance Metrics**: מדדי ביצועים בזמן אמת

#### **4. ניהול הגדרות:**
- **Current Settings Display**: הצגת הגדרות נוכחיות
- **Preferences Integration**: קישור לדף העדפות ראשי
- **Settings Management**: ניהול מרכזי של הגדרות

### 📊 **מצב נוכחי של המערכת:**

#### **System Health Score: 100%**
- ✅ **Yahoo Finance**: פעיל ובריא
- ✅ **Cache System**: בריא עם סטטיסטיקות מלאות
- ✅ **Database**: מחובר עם 2 ספקי נתונים
- ✅ **API**: פעיל עם endpoints זמינים
- ✅ **Logs**: מערכת לוגים פועלת

#### **Performance Metrics:**
- **Response Time**: < 100ms (מעולה)
- **Cache Hit Rate**: 0% (מערכת חדשה)
- **Providers Active**: 2/2 (100%)
- **System Uptime**: 100%

### 🎨 **עיצוב וממשק:**

#### **Apple Design System:**
- **Color Palette**: צבעים מותאמים למערכת Apple
- **Typography**: גופנים מתקדמים עם תמיכה בעברית
- **Spacing**: מרווחים עקביים לפי Apple Guidelines
- **Shadows**: צללים עדינים עם CSS Variables

#### **RTL Hebrew Support:**
- **CSS Logical Properties**: תמיכה מלאה ב-RTL
- **Hebrew Typography**: גופנים מותאמים לעברית
- **Layout Direction**: כיוון טקסט מימין לשמאל
- **Interactive Elements**: כפתורים וטופסים מותאמים

#### **Responsive Design:**
- **Mobile First**: עיצוב מותאם למובייל
- **Grid System**: מערכת גריד גמישה
- **Breakpoints**: נקודות שבירה מותאמות
- **Touch Friendly**: ממשק ידידותי למגע

### 📁 **מבנה קבצים:**

#### **Frontend Files:**
```
trading-ui/
├── external-data-dashboard.html          # דף ראשי
├── scripts/
│   └── external-data-dashboard.js       # לוגיקה ראשית
└── styles/
    └── external-data-dashboard.css      # עיצוב מתקדם
```

#### **Backend Files:**
```
Backend/
├── routes/external_data/
│   └── status.py                        # API endpoints
├── services/external_data/
│   └── cache_manager.py                 # ניהול מטמון
└── models/
    ├── external_data_provider.py        # מודל ספק
    └── data_refresh_log.py             # מודל לוג
```

### 🚀 **שיפורים שבוצעו:**

#### **Phase 1: Basic Functionality**
- ✅ יצירת מבנה HTML בסיסי
- ✅ הוספת JavaScript functions בסיסיות
- ✅ חיבור ל-API endpoints

#### **Phase 2: Error Resolution**
- ✅ תיקון שגיאות JavaScript
- ✅ הסרת פונקציות כפולות
- ✅ שיפור error handling

#### **Phase 3: UI Enhancement**
- ✅ שיפור עיצוב עם Apple Design System
- ✅ הוספת תמיכה ב-RTL עברית
- ✅ שיפור הצגת לוגים ריקים

#### **Phase 4: Integration**
- ✅ אינטגרציה עם דף העדפות
- ✅ שיפור הצגת הגדרות נוכחיות
- ✅ אופטימיזציה של API calls

### 🔍 **Debugging & Troubleshooting:**

#### **Common Issues:**
1. **JavaScript Errors**: בדוק קונסול דפדפן
2. **API 500 Errors**: בדוק לוגי שרת
3. **Empty Logs**: נורמל במערכת חדשה
4. **Cache Issues**: בדוק הגדרות מטמון

#### **Debug Commands:**
```bash
# בדיקת API status
curl http://localhost:8080/api/external-data/status/

# בדיקת לוגים
curl http://localhost:8080/api/external-data/status/logs

# בדיקת cache
curl http://localhost:8080/api/external-data/status/cache
```

### 📈 **Roadmap עתידי:**

#### **Short Term (חודש הקרוב):**
- ✅ הוספת API endpoints חסרים (הושלם)
- ✅ שיפור ביצועי מטמון (הושלם)
- 🔄 הפעלת נתונים אמיתיים מ-Yahoo Finance
- 🔄 הוספת התראות בזמן אמת

#### **Medium Term (3 חודשים):**
- 🔄 אינטגרציה עם ספקי נתונים נוספים
- 🔄 מערכת ניתוח נתונים מתקדמת
- 🔄 דשבורד analytics מתקדם

#### **Long Term (6 חודשים):**
- 🔄 AI-powered data analysis
- 🔄 Predictive caching
- 🔄 Advanced monitoring dashboard

### תיקון באגים
1. **זיהוי הבעיה**: בדוק לוגים וקונסול
2. **מציאת מקור**: חפש בקוד המקור
3. **תיקון**: תקן את הבעיה
4. **בדיקה**: בדוק שהתיקון עובד
5. **תיעוד**: עדכן תיעוד אם צריך

## תמיכה

### בעיות נפוצות
- **שגיאות JavaScript**: בדוק קונסול דפדפן
- **בעיות שרת**: בדוק לוגי שרת
- **בעיות נתונים**: בדוק בסיס נתונים

### קבלת עזרה
- בדוק תיעוד רלוונטי
- חפש בעיות דומות
- פנה לצוות הפיתוח

## רישיון

פרויקט זה מוגן תחת רישיון MIT. ראה קובץ LICENSE לפרטים.

## צוות

- **מפתח ראשי**: Nimrod
- **ארכיטקט**: TikTrack Team
- **תיעוד**: Development Team

---

**תאריך עדכון אחרון**: 19 באוקטובר 2025  
**גרסה**: 2.1.0  
**מפתח**: TikTrack Development Team

### **עדכונים אחרונים:**
- ✅ **מערכת תנאים מתקדמת**: הושלמה מערכת תנאים עם 6 שיטות מסחר
- ✅ **אינטגרציה מלאה**: שילוב עם תכניות מסחר, טריידים והתראות
- ✅ **דוקומנטציה מקיפה**: 7 קבצי תיעוד מפורטים למערכת התנאים
- ✅ **פתרון בעיות טרמינל**: זוהתה ופתורה בעיית תקשורת עם Cursor pseudo-terminal
- ✅ **סקריפטי ניהול טרמינל**: הוספת `open-terminal.sh`, `start-dev.sh`, `stop-dev.sh`
- ✅ **מערכת איתחול משופרת**: `restart` script עם תמיכה מלאה בטרמינלים
- ✅ **מדריך הגדרות טרמינל**: `TERMINAL_SETUP.md` עם הוראות מלאות

---

**גרסה**: 2.1.0  
**עדכון אחרון**: 19 באוקטובר 2025  
**סטטוס**: יציב ופעיל עם מערכת תנאים מתקדמת, External Data System ומערכת העדפות מלאה ומוכנה להפעלה

## 🎊 **תכונות החדשות הזמינות (ינואר 2025):**

### 🚀 **מערכת העדפות v4.0**
- **גישה:** `http://localhost:8080/preferences.html`
- **API:** `/api/preferences/*` 
- **ארכיטקטורה:** מערכת מלאה עם V4 SDK, Profiles, Debug Monitor
- **תכונות:**
  - 🎯 **V4 System**: Bootstrap, ETag support, conditional GET
  - 👤 **פרופילים מרובים**: כל משתמש יכול ליצור מספר פרופילים
  - 🔍 **Debug Monitor**: מערכת ניטור ובדיקה מפורטת
  - 💾 **Cache רב-שכבתי**: Memory, localStorage, IndexedDB, Backend
  - ✅ **126 העדפות פעילות** במערכת
  - 🔍 **Validation**: בדיקת קיום, פורמט וחוקי עסק
  - 🎨 **מערכת צבעים**: ניהול ייעודי של 60+ העדפות צבע
  - 📋 **Migration Guide**: הוספת העדפות בקלות
- **תיעוד מלא:** `PREFERENCES_IMPLEMENTATION_REPORT.md`
- **מדריך מיגרציה:** `Backend/scripts/simple_migrate.py`
