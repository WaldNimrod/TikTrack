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
| Conditions Dev Playbook | `documentation/04-FEATURES/CORE/conditions-system/CONDITIONS_SYSTEM_DEV_PLAYBOOK.md` | [CONDITIONS_SYSTEM_DEV_PLAYBOOK.md](../04-FEATURES/CORE/conditions-system/CONDITIONS_SYSTEM_DEV_PLAYBOOK.md) | מדריך מפתחים מלא למערכת התנאים – ארכיטקטורה, זרימות Modal, בדיקות, Plan→Trade→Alert |
| Conditions Test Plan | `documentation/04-FEATURES/CORE/conditions-system/CONDITIONS_SYSTEM_TEST_PLAN.md` | [CONDITIONS_SYSTEM_TEST_PLAN.md](../04-FEATURES/CORE/conditions-system/CONDITIONS_SYSTEM_TEST_PLAN.md) | תוכנית בדיקות מלאה: CRUD, Evaluate (באלק/שורה), Auto Alerts, ירושה Plan→Trade, RTL, ביצועים |
| UI Utilities & Section Toggle | `trading-ui/scripts/ui-utils.js` | [SECTION_TOGGLE_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/SECTION_TOGGLE_SYSTEM.md)<br>[JAVASCRIPT_ARCHITECTURE.md](../02-ARCHITECTURE/FRONTEND/JAVASCRIPT_ARCHITECTURE.md#ui-utilities) | פונקציות משותפות ל-Toggle, Refresh, טיפול בפעולות UI כלליות + כלי טעינת סקריפטים עצלה (`loadScriptOnce`, `loadScriptsOnce`) |
| Page State Management | `trading-ui/scripts/page-utils.js` | [PAGE_STATE_MANAGEMENT_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/PAGE_STATE_MANAGEMENT_SYSTEM.md) | שמירת מצב עמוד, שחזור פילטרים וסקשנים, איפוס מצב |
| Translation Utilities | `trading-ui/scripts/translation-utils.js` | [TRANSLATION_FUNCTIONS.md](../02-ARCHITECTURE/FRONTEND/TRANSLATION_FUNCTIONS.md) | טיפול במחרוזות, בחירת שפה ותמיכה ב-RTL |
| Event Handler Manager | `trading-ui/scripts/event-handler-manager.js` | [EVENT_HANDLER_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/EVENT_HANDLER_SYSTEM.md) | Delegation גלובלי, מניעת כפילויות, ניטור האזנות |

### 🔵 מערכות CRUD ונתונים
| מערכת | קובץ(ים) עיקריים | דוקומנטציה | הערות |
| --- | --- | --- | --- |
| **שירותי נתונים ייעודיים** | `trading-ui/scripts/services/*-data.js` | [DATA_SERVICES_DEVELOPER_GUIDE.md](../03-DEVELOPMENT/GUIDES/DATA_SERVICES_DEVELOPER_GUIDE.md)<br>[DATA_SERVICES_ARCHITECTURE.md](../02-ARCHITECTURE/FRONTEND/DATA_SERVICES_ARCHITECTURE.md) | שירותי נתונים מאוחדים לכל ישות: trades-data.js, executions-data.js, cash-flows-data.js, notes-data.js, trading-accounts-data.js, data-import-data.js, research-data.js, preferences-data.js, alerts-data.js, tickers-data.js |
| Data Collection Service | `trading-ui/scripts/services/data-collection-service.js` | [SERVICES_INTEGRATION_COMPLETION_REPORT.md](SERVICES_INTEGRATION_COMPLETION_REPORT.md) | איסוף/הצבת נתוני טפסים במפה אחידה והמרות טיפוס |
| Dashboard Data Loader | `trading-ui/scripts/index.js` | [JAVASCRIPT_ARCHITECTURE.md](JAVASCRIPT_ARCHITECTURE.md#dashboard-loader-indexjs) | טעינת נתוני דשבורד אמיתיים + עיבוד מטבעות/סיכומים עם CacheTTLGuard |
| Investment Calculation Service | `trading-ui/scripts/services/investment-calculation-service.js` | [INVESTMENT_CALCULATION_SERVICE.md](INVESTMENT_CALCULATION_SERVICE.md) | חישוב דו־כיווני סכום↔כמות↔מחיר + ריסק ברירת מחדל |
| CRUD Response Handler | `trading-ui/scripts/services/crud-response-handler.js` | [CRUD_RESPONSE_HANDLER.md](../02-ARCHITECTURE/FRONTEND/CRUD_RESPONSE_HANDLER.md) | טיפול בתגובות CRUD, סגירת מודלים, הודעות ושחזור טבלאות |
| Select Populator Service | `trading-ui/scripts/services/select-populator-service.js` | [SELECT_POPULATOR_SERVICE.md](../02-ARCHITECTURE/FRONTEND/SELECT_POPULATOR_SERVICE.md) | מילוי Selectים מבוססי API כולל caching, fallback ושמירת העדפות |
| Default Value Setter | `trading-ui/scripts/services/default-value-setter.js` | [SERVICES_INTEGRATION_COMPLETION_REPORT.md](SERVICES_INTEGRATION_COMPLETION_REPORT.md) | ברירות מחדל לטפסים (תאריך/שעה/העדפות) וטעינה מרוכזת |
| Field Renderer Service | `trading-ui/scripts/services/field-renderer-service.js` | [field-renderer-service.md](../03-API_REFERENCE/field-renderer-service.md) | רינדור Status/Amount/Date/Badges אחיד לכל הטבלאות |
| Table Sort Value Adapter | `trading-ui/scripts/services/table-sort-value-adapter.js` | [TABLE_SORTING_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/TABLE_SORTING_SYSTEM.md) | המרת DateEnvelope/ISO/מספרים לערכי מיון יציבים עבור UnifiedTableSystem |
| Linked Items Service | `trading-ui/scripts/services/linked-items-service.js` | [LINKED_ITEMS_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/LINKED_ITEMS_SYSTEM.md) | רשימות פריטים מקושרים, פורמט תצוגה וכפתורי פעולה אחידים |
| Trade Plan Matching Service | `Backend/services/trade_plan_matching_service.py` | [TRADE_PLAN_MATCHING_SERVICE.md](../02-ARCHITECTURE/BACKEND/TRADE_PLAN_MATCHING_SERVICE.md) | התאמת טריידים לתוכניות והפקת הצעות ליצירת תוכניות חדשות |
| Tag Service | `trading-ui/scripts/services/tag-service.js`<br>`trading-ui/scripts/tag-ui-manager.js` | [TAGGING_SYSTEM_SPEC.md](../03-DEVELOPMENT/TAGGING_SYSTEM_SPEC.md)<br>[TAG_SERVICE_DEVELOPER_GUIDE.md](../03-DEVELOPMENT/GUIDES/TAG_SERVICE_DEVELOPER_GUIDE.md) | מערכת ניהול תגיות: קטגוריות, תגיות, שיוכים, אנליטיקה והצעות |
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
| Pending Trade Plan Widget | `trading-ui/scripts/pending-trade-plan-widget.js` | [PENDING_TRADE_PLAN_WIDGET_DEVELOPER_GUIDE.md](../03-DEVELOPMENT/GUIDES/PENDING_TRADE_PLAN_WIDGET_DEVELOPER_GUIDE.md) | ווידג'ט דשבורד להצעות שיוך/יצירה, כולל Prefill מודלים ועדכון מטמון מאוחד |

### 🔔 התראות, לוגים ומעקב
| מערכת | קובץ(ים) עיקריים | דוקומנטציה | הערות |
| --- | --- | --- | --- |
| Logger Service | `trading-ui/scripts/logger-service.js` | [UNIFIED_LOG_SYSTEM_GUIDE.md](../02-ARCHITECTURE/FRONTEND/UNIFIED_LOG_SYSTEM_GUIDE.md)<br>[logger-service.md](../03-API_REFERENCE/logger-service.md) | מערכת לוגים מאוחדת (info/warn/error/debug) + דוחות מפורטים |
| Warning System | `trading-ui/scripts/warning-system.js` | [NOTIFICATION_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/NOTIFICATION_SYSTEM.md) | תצוגת אזהרות/אישורים, החלפה ל-confirm גלובלי |
| Notification Category Detector | `trading-ui/scripts/notification-category-detector.js` | [NOTIFICATION_CATEGORY_DETECTOR_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/NOTIFICATION_CATEGORY_DETECTOR_SYSTEM.md) | זיהוי קטגוריות והתאמת מסרים לפי Severity |

### ♻️ מטמון, ביצועים וסנכרון
| מערכת | קובץ(ים) עיקריים | דוקומנטציה | הערות |
| --- | --- | --- | --- |
| Cache Stage B-Lite (תצורה זמנית) | `trading-ui/scripts/unified-cache-manager.js`<br>`trading-ui/scripts/cache-clear-menu.js`<br>`trading-ui/scripts/cache-ttl-guard.js` | [CACHE_STAGE_B_LITE.md](../03-DEVELOPMENT/CACHE_STAGE_B_LITE.md) | שכבות Memory/LocalStorage/IndexedDB פעילות, מטמון שרת כבוי (`CACHE_DISABLED=true`), תפריט ניקוי מטמון אחיד, ניהול מפתחות פרופיל ועטיפת TTL לטעינת נתונים |
| Unified Cache Manager | `trading-ui/scripts/unified-cache-manager.js` | [CACHE_IMPLEMENTATION_GUIDE.md](../02-ARCHITECTURE/FRONTEND/CACHE_IMPLEMENTATION_GUIDE.md) | בחירת שכבת מטמון (Memory/LocalStorage/IndexedDB/Backend) והחזרות TTL |
| Cache Sync Manager | `trading-ui/scripts/cache-sync-manager.js` | [CACHE_SYNC_SPECIFICATION.md](../04-FEATURES/CORE/CACHE_SYNC_SPECIFICATION.md) | סנכרון Frontend ↔ Backend, ניהול invalidation patterns, dependencies, והפעלת reload חובה. **שילוב מלא הושלם ב-9 עמודים מרכזיים (ינואר 2025)** |
| Cache Policy Manager | `trading-ui/scripts/cache-policy-manager.js` | [CACHE_IMPLEMENTATION_GUIDE.md](../02-ARCHITECTURE/FRONTEND/CACHE_IMPLEMENTATION_GUIDE.md) | כלל אחיד למדיניות מטמון לפי סוג נתון ותוקף |
| LocalStorage Events Sync | `trading-ui/scripts/modules/localstorage-sync.js` | [LOCALSTORAGE_EVENTS_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/LOCALSTORAGE_EVENTS_SYSTEM.md) | האזנה לאירועי שינוי אחסון ושמירת עקביות בין טאבים |

### 🧰 כלי פיתוח ומעקב איכות
| מערכת | קובץ(ים) עיקריים | דוקומנטציה | הערות |
| --- | --- | --- | --- |
| Lint Status Service | `trading-ui/scripts/services/lint-status-service.js` | [LINTER_MONITOR_REBUILD_PLAN.md](../02-ARCHITECTURE/FRONTEND/LINTER_MONITOR_REBUILD_PLAN.md) | שליפת דוחות lint מאוחדים (ESLint/Stylelint/HTMLHint/Prettier) והמרתם למודל תצוגה |
| Lint Monitor Dashboard | `trading-ui/scripts/linter-realtime-monitor.js` | [LINTER_REALTIME_MONITOR.md](../02-ARCHITECTURE/FRONTEND/LINTER_REALTIME_MONITOR.md) | מוטמע בתוך `code-quality-dashboard.html`: מציג כרטיסי מצב, סטטוס כלי, סוגיות פעילות והיסטוריה |

### 🗄️ מערכות שהועברו לארכיון (לא בשימוש פעיל)
| מערכת | מיקום ארכיון | הערה |
| --- | --- | --- |
| Central Refresh System | `archive/trading-ui/scripts/central-refresh-system.js` | הוחלפה ב-CacheSyncManager החל מינואר 2025 |
| Unified IndexedDB Adapter | `archive/trading-ui/scripts/unified-indexeddb-adapter.js` | פונקציונליות מוזגה ל-Unified Cache Manager |
| Global Notification Collector (גרסה ישנה) | `backup/fixing-20251025-042922/global-notification-collector.js` | נותר כגיבוי בלבד, אין טעינה ב-build הראשי |
| Memory Optimizer (גרסה קודמת) | `trading-ui/scripts/memory-optimizer.js.backup` | כלול רק כגיבוי, ההגדרות מוזגו ל-Cache Policy |

### ✅ סיכום
- **סה״כ מערכות פעילות מתועדות:** 28 (לפי הטבלאות לעיל).
- **חובת שימוש:** לפני כל פיתוח חדש יש לבדוק התאמה למערכת קיימת ולהשתמש בה דרך ה-API המתועד.
- **עדכון אחרון:** 27 בינואר 2025 (הוספת alerts-data.js, tickers-data.js, עדכון תיעוד שירותי נתונים).
- **אחריות המשך:** כל מערכת חדשה שנכנסת לפרויקט חייבת להוסיף שורה בטבלה הרלוונטית + לינק לדוקומנטציה מעודכנת.

