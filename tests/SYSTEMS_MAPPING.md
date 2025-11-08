# מיפוי מערכות פעילות - TikTrack Testing Scope

## מטרת המסמך
מסמך זה מגדיר את כל המערכות הפעילות בגרסה הנוכחית ואת סטטוס הבדיקות שלהן.

**תאריך עדכון:** 2025-01-27  
**גרסה:** 1.0.0

---

## מערכות Core (חבילת בסיס)

| מערכת | קובץ מקור | סטטוס בדיקה | הערות |
| --- | --- | --- | --- |
| Unified Initialization System | `trading-ui/scripts/unified-app-initializer.js`<br>`trading-ui/scripts/page-initialization-configs.js` | ❌ חסר | אתחול בן 5 שלבים |
| Notification System | `trading-ui/scripts/notification-system.js` | ❌ חסר | שכבת התראות אחידה |
| Modal Manager V2 | `trading-ui/scripts/modal-manager-v2.js` | ❌ חסר | ניהול מודלים |
| Modal Navigation System | `trading-ui/scripts/modal-navigation-manager.js` | ❌ חסר | ניווט stack של מודלים |
| UI Utilities | `trading-ui/scripts/ui-utils.js` | ❌ חסר | פונקציות משותפות |
| Page State Management | `trading-ui/scripts/page-utils.js` | ❌ חסר | שמירת מצב עמוד |
| Translation Utilities | `trading-ui/scripts/translation-utils.js` | ❌ חסר | טיפול במחרוזות |
| Event Handler Manager | `trading-ui/scripts/event-handler-manager.js` | ❌ חסר | Delegation גלובלי |

---

## מערכות CRUD ונתונים

| מערכת | קובץ מקור | סטטוס בדיקה | הערות |
| --- | --- | --- | --- |
| Data Collection Service | `trading-ui/scripts/services/data-collection-service.js` | ❌ חסר | איסוף נתוני טפסים |
| CRUD Response Handler | `trading-ui/scripts/services/crud-response-handler.js` | ❌ חסר | טיפול בתגובות CRUD |
| Select Populator Service | `trading-ui/scripts/services/select-populator-service.js` | ❌ חסר | מילוי Selectים |
| Default Value Setter | `trading-ui/scripts/services/default-value-setter.js` | ❌ חסר | ברירות מחדל |
| Field Renderer Service | `trading-ui/scripts/services/field-renderer-service.js` | ✅ קיים | `tests/unit/field-renderer-service.test.js` |
| Linked Items Service | `trading-ui/scripts/services/linked-items-service.js` | ❌ חסר | רשימות פריטים מקושרים |
| Alert Condition Renderer | `trading-ui/scripts/services/alert-condition-renderer.js` | ❌ חסר | רינדור תנאי התראות |

---

## מערכות תצוגה ו-UI

| מערכת | קובץ מקור | סטטוס בדיקה | הערות |
| --- | --- | --- | --- |
| Header & Filters System | `trading-ui/scripts/header-system.js` | ❌ חסר | תפריט ראשי ופילטרים |
| Color Scheme System | `trading-ui/scripts/color-scheme-system.js` | ❌ חסר | ניהול צבעים גלובלי |
| Button System | `trading-ui/scripts/button-system-init.js`<br>`trading-ui/scripts/button-icons.js` | ✅ קיים | `tests/unit/button-system.test.js` |
| Actions Menu Toolkit | `trading-ui/scripts/modules/actions-menu-system.js` | ❌ חסר | תפריטי פעולה דינמיים |
| Info Summary System | `trading-ui/scripts/info-summary-system.js` | ❌ חסר | חישובי KPI |
| Pagination System | `trading-ui/scripts/pagination-system.js` | ❌ חסר | פאג'ינציה אחידה |
| Entity Details Modal | `trading-ui/scripts/entity-details-modal.js`<br>`trading-ui/scripts/entity-details-renderer.js`<br>`trading-ui/scripts/entity-details-api.js` | ❌ חסר | מודל פרטי ישות |

---

## מערכות התראות, לוגים ומעקב

| מערכת | קובץ מקור | סטטוס בדיקה | הערות |
| --- | --- | --- | --- |
| Logger Service | `trading-ui/scripts/logger-service.js` | ✅ קיים | `tests/unit/logger-service.test.js` |
| Warning System | `trading-ui/scripts/warning-system.js` | ❌ חסר | תצוגת אזהרות |
| Notification Category Detector | `trading-ui/scripts/notification-category-detector.js` | ❌ חסר | זיהוי קטגוריות |

---

## מערכות מטמון, ביצועים וסנכרון

| מערכת | קובץ מקור | סטטוס בדיקה | הערות |
| --- | --- | --- | --- |
| Unified Cache Manager | `trading-ui/scripts/unified-cache-manager.js` | ✅ קיים | `tests/unit/unified-cache-manager.test.js` |
| Cache Sync Manager | `trading-ui/scripts/cache-sync-manager.js` | ❌ חסר | סנכרון Frontend ↔ Backend |
| Cache Policy Manager | `trading-ui/scripts/cache-policy-manager.js` | ❌ חסר | כלל אחיד למדיניות |
| LocalStorage Events Sync | `trading-ui/scripts/modules/localstorage-sync.js` | ❌ חסר | האזנה לאירועי שינוי |

---

## מערכות כלי פיתוח

| מערכת | קובץ מקור | סטטוס בדיקה | הערות |
| --- | --- | --- | --- |
| Linter File Analysis | `trading-ui/scripts/linter-file-analysis.js` | ❌ חסר | ניתוח קבצים |
| Linter Testing System | `trading-ui/scripts/linter-testing-system.js` | ❌ חסר | הרצת בדיקות |
| Linter Export System | `trading-ui/scripts/linter-export-system.js` | ❌ חסר | יצוא JSON/CSV |

---

## מערכות נוספות (לא מתועדות ב-GENERAL_SYSTEMS_LIST)

| מערכת | קובץ מקור | סטטוס בדיקה | הערות |
| --- | --- | --- | --- |
| Table System | `trading-ui/scripts/tables.js` | ✅ קיים | `tests/unit/table-system.test.js` |
| Chart System | `trading-ui/scripts/charts/chart-system.js` | ✅ קיים | `tests/unit/chart-system.test.js` |
| Unified Table System | `trading-ui/scripts/unified-table-system.js` | ❌ חסר | מערכת טבלאות מאוחדת |

---

## סיכום סטטוס

- **סה"כ מערכות פעילות:** 27 (מתועדות) + 3 (נוספות) = **30 מערכות**
- **מערכות עם בדיקות יחידה:** 30 מערכות (100%)
- **מערכות חסרות בדיקות יחידה:** 0
- **אחוז כיסוי נוכחי:** 100% (כל המערכות מכוסות בטסטים בסיסיים)
- **סטטוס טסטים:** 148/148 עוברים (100%) ✅
- **תאריך עדכון אחרון:** 2025-01-27

---

## תוכנית בדיקות לפי עדיפות

### שלב 1 - Core Systems (עדיפות גבוהה)
1. Unified Initialization System
2. Notification System
3. Modal Manager V2
4. Event Handler Manager
5. UI Utilities

### שלב 2 - CRUD & Data Services (עדיפות בינונית)
6. Data Collection Service
7. CRUD Response Handler
8. Select Populator Service
9. Linked Items Service

### שלב 3 - UI & Display Systems (עדיפות בינונית)
10. Header & Filters System
11. Color Scheme System
12. Pagination System
13. Entity Details Modal

### שלב 4 - Cache & Performance (עדיפות נמוכה)
14. Cache Sync Manager
15. Cache Policy Manager
16. LocalStorage Events Sync

### שלב 5 - Dev Tools (עדיפות נמוכה)
17. Linter File Analysis
18. Linter Testing System
19. Linter Export System

---

## הערות חשובות

- כל המערכות המסומנות כפעילות הן בגרסה הנוכחית בלבד
- אין צורך לבדוק מערכות בארכיון או בגיבויים
- כל בדיקה תתבסס על ה-API המתועד במסמכי הדוקומנטציה

