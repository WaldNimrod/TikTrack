# רשימת מערכות כלליות - TikTrack
## General Systems List

### 📋 מטרת הקובץ
מסמך זה מרכז את המערכות הכלליות שזמינות בכל הפרויקט, יחד עם מיקומי הקבצים והדוקומנטציה הרלוונטית. לפני כתיבת קוד מקומי חובה לבדוק אם קיימת מערכת כללית התומכת בצורך.

### 🟢 חבילת בסיס (Core Systems)
| מערכת | קובץ(ים) עיקריים | דוקומנטציה | הערות |
| --- | --- | --- | --- |
| מערכת אתחול מאוחדת | `trading-ui/scripts/unified-app-initializer.js`<br>`trading-ui/scripts/page-initialization-configs.js` | [UNIFIED_INITIALIZATION_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/UNIFIED_INITIALIZATION_SYSTEM.md) | אתחול בן 5 שלבים, טוען מודולים ומגדיר תצורת עמוד |
| מערכת התראות | `trading-ui/scripts/notification-system.js` | [NOTIFICATION_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/NOTIFICATION_SYSTEM.md) | שכבת התראות אחידה (Success/Error/Info/Warning/Details) |
| Modal Manager V2 | `trading-ui/scripts/modal-manager-v2.js` | [MODAL_SYSTEM_V2.md](../02-ARCHITECTURE/FRONTEND/MODAL_SYSTEM_V2.md) | ניהול פתיחה, עריכה, מחיקה ותרחישי CRUD אחידים במודלים |
| Modal Navigation System | `trading-ui/scripts/modal-navigation-manager.js` | [MODAL_NAVIGATION_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/MODAL_NAVIGATION_SYSTEM.md) | ניווט stack של מודלים, breadcrumb, backdrop מאוחד |
| UI Utilities & Section Toggle | `trading-ui/scripts/ui-utils.js` | [SECTION_TOGGLE_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/SECTION_TOGGLE_SYSTEM.md)<br>[JAVASCRIPT_ARCHITECTURE.md](../02-ARCHITECTURE/FRONTEND/JAVASCRIPT_ARCHITECTURE.md#ui-utilities) | פונקציות משותפות ל-Toggle, Refresh, טיפול בפעולות UI כלליות |
| Page State Management | `trading-ui/scripts/page-utils.js` | [PAGE_STATE_MANAGEMENT_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/PAGE_STATE_MANAGEMENT_SYSTEM.md) | שמירת מצב עמוד, שחזור פילטרים וסקשנים, איפוס מצב |
| Translation Utilities | `trading-ui/scripts/translation-utils.js` | [TRANSLATION_FUNCTIONS.md](../02-ARCHITECTURE/FRONTEND/TRANSLATION_FUNCTIONS.md) | טיפול במחרוזות, בחירת שפה ותמיכה ב-RTL |
| Event Handler Manager | `trading-ui/scripts/event-handler-manager.js` | [EVENT_HANDLER_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/EVENT_HANDLER_SYSTEM.md) | Delegation גלובלי, מניעת כפילויות, ניטור האזנות |

### 🔵 מערכות CRUD ונתונים
| מערכת | קובץ(ים) עיקריים | דוקומנטציה | הערות |
| --- | --- | --- | --- |
| Data Collection Service | `trading-ui/scripts/services/data-collection-service.js` | [SERVICES_INTEGRATION_COMPLETION_REPORT.md](SERVICES_INTEGRATION_COMPLETION_REPORT.md) | איסוף/הצבת נתוני טפסים במפה אחידה והמרות טיפוס |
| CRUD Response Handler | `trading-ui/scripts/services/crud-response-handler.js` | [CRUD_RESPONSE_HANDLER.md](../02-ARCHITECTURE/FRONTEND/CRUD_RESPONSE_HANDLER.md) | טיפול בתגובות CRUD, סגירת מודלים, הודעות ושחזור טבלאות |
| Select Populator Service | `trading-ui/scripts/services/select-populator-service.js` | [SELECT_POPULATOR_SERVICE.md](../02-ARCHITECTURE/FRONTEND/SELECT_POPULATOR_SERVICE.md) | מילוי Selectים מבוססי API כולל caching, fallback ושמירת העדפות |
| Default Value Setter | `trading-ui/scripts/services/default-value-setter.js` | [SERVICES_INTEGRATION_COMPLETION_REPORT.md](SERVICES_INTEGRATION_COMPLETION_REPORT.md) | ברירות מחדל לטפסים (תאריך/שעה/העדפות) וטעינה מרוכזת |
| Field Renderer Service | `trading-ui/scripts/services/field-renderer-service.js` | [field-renderer-service.md](../03-API_REFERENCE/field-renderer-service.md) | רינדור Status/Amount/Date/Badges אחיד לכל הטבלאות |
| Linked Items Service | `trading-ui/scripts/services/linked-items-service.js` | [LINKED_ITEMS_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/LINKED_ITEMS_SYSTEM.md) | רשימות פריטים מקושרים, פורמט תצוגה וכפתורי פעולה אחידים |
| Alert Condition Renderer | `trading-ui/scripts/services/alert-condition-renderer.js` | [ALERT_CONDITION_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/ALERT_CONDITION_SYSTEM.md) | רינדור תנאי התראות כולל תמיכה בשיטות המסחר |

### 🎨 מערכות תצוגה ו-UI
| מערכת | קובץ(ים) עיקריים | דוקומנטציה | הערות |
| --- | --- | --- | --- |
| Header & Filters System | `trading-ui/scripts/header-system.js` | [HEADER_SYSTEM_README.md](../02-ARCHITECTURE/FRONTEND/HEADER_SYSTEM_README.md) | תפריט ראשי, פילטרים מאוחדים, שמירת מצב ו-RTL |
| Color Scheme System | `trading-ui/scripts/color-scheme-system.js` | [COLOR_SCHEME_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/COLOR_SCHEME_SYSTEM.md) | ניהול צבעים גלובלי, יישום צבעי המותג והנמכת התנגשויות |
| Button System | `trading-ui/scripts/button-system-init.js`<br>`trading-ui/scripts/button-icons.js` | [button-system.md](../02-ARCHITECTURE/FRONTEND/button-system.md) | יצירת כפתורי פעולה, עבודה עם `data-onclick`, כללי נגישות |
| Actions Menu Toolkit | `trading-ui/scripts/modules/actions-menu-system.js`<br>`trading-ui/scripts/ui-utils.js` | [button-system.md](../02-ARCHITECTURE/FRONTEND/button-system.md) | תפריטי פעולה דינמיים לשורות טבלה עם התאמה ל-RTL |
| Info Summary System | `trading-ui/scripts/info-summary-system.js`<br>`trading-ui/scripts/services/statistics-calculator.js` | [INFO_SUMMARY_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/INFO_SUMMARY_SYSTEM.md) | חישובי KPI, תמיכה בסינונים, רינדור RTL |
| Pagination System | `trading-ui/scripts/pagination-system.js` | [PAGINATION_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/PAGINATION_SYSTEM.md) | פאג’ינציה אחידה לטבלאות, תמיכה במצבי חיפוש |
| Entity Details Modal | `trading-ui/scripts/entity-details-modal.js`<br>`trading-ui/scripts/entity-details-renderer.js`<br>`trading-ui/scripts/entity-details-api.js` | [entity-details-system/README.md](../features/entity-details-system/README.md) | מודל פרטי ישות מאוחד עם תמיכה ב-linked items והעדפות תצוגה |

### 🔔 התראות, לוגים ומעקב
| מערכת | קובץ(ים) עיקריים | דוקומנטציה | הערות |
| --- | --- | --- | --- |
| Logger Service | `trading-ui/scripts/logger-service.js` | [UNIFIED_LOG_SYSTEM_GUIDE.md](../02-ARCHITECTURE/FRONTEND/UNIFIED_LOG_SYSTEM_GUIDE.md)<br>[logger-service.md](../03-API_REFERENCE/logger-service.md) | מערכת לוגים מאוחדת (info/warn/error/debug) + דוחות מפורטים |
| Warning System | `trading-ui/scripts/warning-system.js` | [NOTIFICATION_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/NOTIFICATION_SYSTEM.md) | תצוגת אזהרות/אישורים, החלפה ל-confirm גלובלי |
| Notification Category Detector | `trading-ui/scripts/notification-category-detector.js` | [NOTIFICATION_CATEGORY_DETECTOR_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/NOTIFICATION_CATEGORY_DETECTOR_SYSTEM.md) | זיהוי קטגוריות והתאמת מסרים לפי Severity |

### ♻️ מטמון, ביצועים וסנכרון
| מערכת | קובץ(ים) עיקריים | דוקומנטציה | הערות |
| --- | --- | --- | --- |
| Unified Cache Manager | `trading-ui/scripts/unified-cache-manager.js` | [CACHE_IMPLEMENTATION_GUIDE.md](../02-ARCHITECTURE/FRONTEND/CACHE_IMPLEMENTATION_GUIDE.md) | בחירת שכבת מטמון (Memory/LocalStorage/IndexedDB/Backend) והחזרות TTL |
| Cache Sync Manager | `trading-ui/scripts/cache-sync-manager.js` | [CACHE_IMPLEMENTATION_GUIDE.md](../02-ARCHITECTURE/FRONTEND/CACHE_IMPLEMENTATION_GUIDE.md) | סנכרון Frontend ↔ Backend, ניהול invalidation והפעלת reload חובה |
| Cache Policy Manager | `trading-ui/scripts/cache-policy-manager.js` | [CACHE_IMPLEMENTATION_GUIDE.md](../02-ARCHITECTURE/FRONTEND/CACHE_IMPLEMENTATION_GUIDE.md) | כלל אחיד למדיניות מטמון לפי סוג נתון ותוקף |
| LocalStorage Events Sync | `trading-ui/scripts/modules/localstorage-sync.js` | [LOCALSTORAGE_EVENTS_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/LOCALSTORAGE_EVENTS_SYSTEM.md) | האזנה לאירועי שינוי אחסון ושמירת עקביות בין טאבים |

### 🧰 כלי פיתוח ומעקב איכות
| מערכת | קובץ(ים) עיקריים | דוקומנטציה | הערות |
| --- | --- | --- | --- |
| Linter File Analysis Module | `trading-ui/scripts/linter-file-analysis.js` | [LINTER_REALTIME_MONITOR.md](../02-ARCHITECTURE/FRONTEND/LINTER_REALTIME_MONITOR.md) | ניתוח קבצים, סריקת HTML/CSS/JS/Python והחזרת ממצאים ל-Dashboard |
| Linter Testing System | `trading-ui/scripts/linter-testing-system.js` | [LINTER_REALTIME_MONITOR.md](../02-ARCHITECTURE/FRONTEND/LINTER_REALTIME_MONITOR.md) | הרצת בדיקות זמינות, מדדי ביצועים וסטטוס מערכת |
| Linter Export System | `trading-ui/scripts/linter-export-system.js` | [LINTER_REALTIME_MONITOR.md](../02-ARCHITECTURE/FRONTEND/LINTER_REALTIME_MONITOR.md) | יצוא JSON/CSV, צילום snapshot של מצב המערכת |

### 🗄️ מערכות שהועברו לארכיון (לא בשימוש פעיל)
| מערכת | מיקום ארכיון | הערה |
| --- | --- | --- |
| Central Refresh System | `archive/trading-ui/scripts/central-refresh-system.js` | הוחלפה ב-CacheSyncManager החל מינואר 2025 |
| Unified IndexedDB Adapter | `archive/trading-ui/scripts/unified-indexeddb-adapter.js` | פונקציונליות מוזגה ל-Unified Cache Manager |
| Global Notification Collector (גרסה ישנה) | `backup/fixing-20251025-042922/global-notification-collector.js` | נותר כגיבוי בלבד, אין טעינה ב-build הראשי |
| Memory Optimizer (גרסה קודמת) | `trading-ui/scripts/memory-optimizer.js.backup` | כלול רק כגיבוי, ההגדרות מוזגו ל-Cache Policy |

### ✅ סיכום
- **סה״כ מערכות פעילות מתועדות:** 27 (לפי הטבלאות לעיל).
- **חובת שימוש:** לפני כל פיתוח חדש יש לבדוק התאמה למערכת קיימת ולהשתמש בה דרך ה-API המתועד.
- **עדכון אחרון:** 7 בנובמבר 2025 (בהתאם למיפוי מאותו היום).
- **אחריות המשך:** כל מערכת חדשה שנכנסת לפרויקט חייבת להוסיף שורה בטבלה הרלוונטית + לינק לדוקומנטציה מעודכנת.

