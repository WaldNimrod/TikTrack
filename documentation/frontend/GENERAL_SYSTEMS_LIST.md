# רשימת מערכות כלליות - TikTrack
## General Systems List

### 📋 מטרת הקובץ
קובץ זה מכיל רשימה מסודרת של כל המערכות הכלליות במערכת TikTrack, עם קישורים לדוקומנטציה ספציפית.

### 🟢 **חבילת מערכות בסיס**
מערכות המסומנות ב-🟢 **חבילת בסיס** הן מערכות חיוניות שצריכות להיות בכל עמוד כדי שיוכל לתפקד כראוי ולהציג תוכן בסיסי:

1. **מערכת אתחול מאוחדת** - טעינת המערכת
2. **מערכת התראות** - הצגת הודעות
3. **מערכת מודולים** - הצגת חלונות
4. **מערכת ניהול מצב סקשנים** - פתיחה/סגירה של סקשנים
5. **מערכת תרגום** - תצוגה בעברית
6. **מערכת ניהול מצב עמודים** - שמירת מצב
7. **מערכת החלפת confirm** - אישורים
8. **מערכת ניהול favicon** - תצוגת סטטוס
9. **מערכת רענון מרכזית** ✅ **הוחלף ב-CacheSyncManager** - רענון נתונים
10. **מערכת מטמון מאוחדת** ✅ **חדש!** - מערכת מטמון מאוחדת עם 4 שכבות

כל העמודים במערכת כוללים את חבילת הבסיס הזו.

### **קבוצות מערכות נוספות**

#### ** חבילת CRUD (יצירה, קריאה, עדכון, מחיקה)**
מערכות לניהול נתונים וטבלאות:
- מערכת טבלאות
- מערכת מיפוי טבלאות  
- מערכת אחסון מקומי (IndexedDB) ✅ **הוחלף במערכת מטמון מאוחדת**

#### ** חבילת פילטרים וחיפוש**
מערכות לחיפוש וסינון נתונים:
- מערכת כותרת (כולל פילטרים)
- מערכת מיפוי טבלאות
- מערכת זיהוי קטגוריות

#### ** חבילת גרפים ותצוגה**
מערכות להצגת נתונים ויזואלית:
- מערכת ניהול גרפים
- מערכת עמודים

#### ** חבילת ניטור ולוגים**
מערכות לניטור ולוגים:
- מערכת לוגים מאוחדת
- מערכת איסוף התראות גלובליות

#### ** חבילת התראות מתקדמות**
מערכות התראות מתקדמות:
- מערכת התראות אזהרה
- מערכת הגירת התראות
- מערכת זיהוי קטגוריות


#### ** חבילת נתונים חיצוניים**
מערכות לנתונים חיצוניים:
- מערכת נתונים חיצוניים (Yahoo Finance)
- מערכת אחסון מקומי
- מערכת ניהול מערכת

#### ** חבילת ממשק משתמש מתקדם**
מערכות לממשק משתמש מתקדם:
- מערכת כותרת
- מערכת תפריט
- מערכת ניהול צבעים

#### ** חבילת העדפות והגדרות**
מערכות להעדפות והגדרות:
- מערכת העדפות

#### ** חבילת קבצים ומיפוי**
מערכות לקבצים ומיפוי:
- מערכת מיפוי קבצים

#### ** חבילת תאריכים וזמן**
מערכות לתאריכים וזמן:
- מערכת כלי עזר לתאריכים

---

## 📦 **מערכות שהועברו לגיבוי** ⚠️ **לא בשימוש**

### מערכות מטמון ישנות (הועברו לגיבוי בינואר 2025):
- **Unified IndexedDB Adapter** - הוחלף ב-UnifiedCacheManager
- **Central Refresh System** - הוחלף ב-CacheSyncManager
- **IndexedDB Implementation Status** - הוחלף במערכת מאוחדת
- **Cache Strategy Implementation Plan** - הוחלף בתוכנית עיצוב מחדש

**מיקום גיבוי:** `documentation/backup-old-cache-docs/` ו-`trading-ui/scripts/backup-old-cache-systems/`

---

## 🗄️ **מערכת מטמון מאוחדת** ✅ **חדש! הושלם בינואר 2025**

### **Unified Cache System** 🟢 **חבילת בסיס**
מערכת מטמון מאוחדת עם 4 שכבות אופטימליות:

#### **שכבות מטמון:**
- 🧠 **Frontend Memory** - נתונים זמניים (<100KB)
- 💾 **localStorage** - נתונים פשוטים (<1MB)
- 🗄️ **IndexedDB** - נתונים מורכבים (>1MB)
- 🔄 **Backend Cache** - נתונים קריטיים עם TTL

#### **רכיבי המערכת:**
- **UnifiedCacheManager** - מנהל מטמון מרכזי
  - **קובץ:** `unified-cache-manager.js`
  - **תיאור:** מנהל מרכזי לכל שכבות המטמון עם החלטה אוטומטית
  - **דוקומנטציה:** [CACHE_IMPLEMENTATION_GUIDE.md](CACHE_IMPLEMENTATION_GUIDE.md)

- **CacheSyncManager** - מנהל סינכרון
  - **קובץ:** `cache-sync-manager.js`
  - **תיאור:** סינכרון בין Frontend ו-Backend
  - **דוקומנטציה:** [CACHE_IMPLEMENTATION_GUIDE.md](CACHE_IMPLEMENTATION_GUIDE.md)

- **CachePolicyManager** - מנהל מדיניות
  - **קובץ:** `cache-policy-manager.js`
  - **תיאור:** ניהול מדיניות מטמון אחידה
  - **דוקומנטציה:** [CACHE_IMPLEMENTATION_GUIDE.md](CACHE_IMPLEMENTATION_GUIDE.md)

- **MemoryOptimizer** - אופטימיזטור זיכרון
  - **קובץ:** `memory-optimizer.js`
  - **תיאור:** אופטימיזציה אוטומטית של זיכרון
  - **דוקומנטציה:** [CACHE_IMPLEMENTATION_GUIDE.md](CACHE_IMPLEMENTATION_GUIDE.md)

#### **דוקומנטציה מקיפה:**
- **תוכנית עיצוב מחדש:** [CACHE_ARCHITECTURE_REDESIGN_PLAN.md](CACHE_ARCHITECTURE_REDESIGN_PLAN.md)
- **סיכום ארכיטקטורה:** [CACHE_ARCHITECTURE_SUMMARY.md](CACHE_ARCHITECTURE_SUMMARY.md)
- **מדריך יישום:** [CACHE_IMPLEMENTATION_GUIDE.md](CACHE_IMPLEMENTATION_GUIDE.md)
- **תוכנית אינטגרציה:** [CACHE_INTEGRATION_PLAN.md](CACHE_INTEGRATION_PLAN.md)

---

## 🏗️ **מערכות אתחול מאוחדות**

### **Unified Initialization System** 🟢 **חבילת בסיס**
- **קובץ:** `unified-app-initializer.js`
- **תיאור:** מערכת אתחול מרכזית עם 5 שלבים
- **דוקומנטציה:** [UNIFIED_INITIALIZATION_SYSTEM.md](UNIFIED_INITIALIZATION_SYSTEM.md)

### **Application Initializer**
- **קובץ:** `application-initializer.js`
- **תיאור:** מערכת אתחול היררכית
- **דוקומנטציה:** [UNIFIED_INITIALIZATION_SYSTEM.md](UNIFIED_INITIALIZATION_SYSTEM.md) (אוחד עם המערכת המאוחדת)

### **Page Initialization Configs**
- **קובץ:** `page-initialization-configs.js`
- **תיאור:** הגדרות אתחול ספציפיות לעמודים
- **דוקומנטציה:** [UNIFIED_INITIALIZATION_SYSTEM.md](UNIFIED_INITIALIZATION_SYSTEM.md) (אוחד עם המערכת המאוחדת)

---

## 🔔 **מערכות התראות והודעות**

### **Notification System** 🟢 **חבילת בסיס**
- **קובץ:** `notification-system.js`
- **תיאור:** מערכת התראות מרכזית
- **דוקומנטציה:** [NOTIFICATION_SYSTEM.md](NOTIFICATION_SYSTEM.md)
- **פונקציות עיקריות:**
  - `showNotification()`
  - `showSuccessNotification()`
  - `showErrorNotification()`
  - `showWarningNotification()`
  - `showInfoNotification()`
  - `showDetailsModal()` ⭐ **חדש**

### **Logger Service** 🔔 **חבילת ניטור ולוגים** 🟢 **חבילת בסיס**
- **קובץ:** `logger-service.js`
- **תיאור:** מערכת לוגים מאוחדת עם רמות לוג, ניטור ביצועים, ומעקב שגיאות
- **דוקומנטציה:** [logger-service.md](../03-API_REFERENCE/logger-service.md), [UNIFIED_LOG_SYSTEM_GUIDE.md](UNIFIED_LOG_SYSTEM_GUIDE.md)
- **פונקציות עיקריות:**
  - `window.Logger.info()`, `warn()`, `error()`, `debug()`
  - `generateDetailedLog()` - דוח מפורט על מצב המערכת
  - תמיכה ב-logging מובנה עם קטגוריות וניטור

### **Warning System** 🔔 **חבילת התראות מתקדמות**
- **קובץ:** `warning-system.js`
- **תיאור:** מערכת התראות אזהרה ואישור
- **דוקומנטציה:** [NOTIFICATION_SYSTEM.md](NOTIFICATION_SYSTEM.md) (חלק ממערכת ההודעות)

### **Global Notification Collector**
- **קובץ:** `global-notification-collector.js`
- **תיאור:** איסוף התראות גלובליות
- **דוקומנטציה:** [GLOBAL_NOTIFICATION_COLLECTOR_SYSTEM.md](GLOBAL_NOTIFICATION_COLLECTOR_SYSTEM.md)

### **Notification Migration System** 🔔 **חבילת התראות מתקדמות**
- **קובץ:** `notification-migration.js`
- **תיאור:** מערכת הגירת התראות
- **דוקומנטציה:** [NOTIFICATION_MIGRATION_SYSTEM.md](NOTIFICATION_MIGRATION_SYSTEM.md)

### **Notification Category Detector** 🔔 **חבילת התראות מתקדמות** 🔍 **חבילת פילטרים**
- **קובץ:** `notification-category-detector.js`
- **תיאור:** זיהוי קטגוריות התראות
- **דוקומנטציה:** [NOTIFICATION_CATEGORY_DETECTOR_SYSTEM.md](NOTIFICATION_CATEGORY_DETECTOR_SYSTEM.md)

---

## 🎨 **מערכות ממשק משתמש**

### **UI Utilities** 🔵 **חבילת CRUD**
- **קובץ:** `ui-utils.js`
- **תיאור:** כלי עזר לממשק משתמש
- **דוקומנטציה:** [JAVASCRIPT_ARCHITECTURE.md](JAVASCRIPT_ARCHITECTURE.md#ui-utilities)
- **פונקציות עיקריות:**
  - `toggleSection()` ✅ **מערכת כללית - יש להשתמש במקום פונקציות מקומיות**
  - `toggleAllSections()`
  - `restoreSectionStates()`
  - `enhancedTableRefresh()`
  - `handleApiResponseWithRefresh()`

### **Modal Manager V2** 🔵 **חבילת CRUD** 🟢 **חבילת בסיס**
- **קובץ:** `modal-manager-v2.js`
- **תיאור:** מערכת ניהול מודלים מאוחדת לכל פעולות CRUD
- **דוקומנטציה:** [MODAL_SYSTEM_V2.md](../02-ARCHITECTURE/FRONTEND/MODAL_SYSTEM_V2.md)
- **פונקציות עיקריות:**
  - `window.ModalManagerV2.showModal(modalId, mode)` ✅ **יש להשתמש במקום פונקציות מקומיות `showAdd*Modal`**
  - `window.ModalManagerV2.showEditModal(modalId, entityType, entityId)` ✅ **יש להשתמש במקום פונקציות מקומיות `showEdit*Modal`**
  - תמיכה מלאה ב-CRUD operations, validation, ועוד

### **Data Collection Service** 🔵 **חבילת CRUD** ✅ **חדש! ינואר 2025**
- **קובץ:** `services/data-collection-service.js`
- **תיאור:** מערכת מרכזית לאיסוף נתונים מטפסים והמרות טיפוס - מחליפה 3,131 קריאות ידניות ל-getElementById
- **דוקומנטציה:** [SERVICES_ARCHITECTURE.md](SERVICES_ARCHITECTURE.md), [SERVICES_INTEGRATION_COMPLETION_REPORT.md](SERVICES_INTEGRATION_COMPLETION_REPORT.md)
- **פונקציות עיקריות:**
  - `DataCollectionService.collectFormData(fieldMap)` ✅ **יש להשתמש במקום getElementById ידני**
  - `DataCollectionService.setFormData(fieldMap, values)` - הגדרת ערכים בטופס
  - `DataCollectionService.resetForm(formId)` - ניקוי טפסים
  - המרות טיפוס אוטומטיות (int, float, date, bool)

### **CRUD Response Handler** 🔵 **חבילת CRUD** ✅ **חדש! ינואר 2025**
- **קובץ:** `services/crud-response-handler.js`
- **תיאור:** מערכת מרכזית לטיפול בתגובות API של פעולות CRUD - מחליפה לוגיקה זהה ב-18 פונקציות save/update/delete
- **דוקומנטציה:** [CRUD_RESPONSE_HANDLER.md](../02-ARCHITECTURE/FRONTEND/CRUD_RESPONSE_HANDLER.md), [SERVICES_ARCHITECTURE.md](SERVICES_ARCHITECTURE.md)
- **פונקציות עיקריות:**
  - `CRUDResponseHandler.handleSaveResponse(response, options)` ✅ **יש להשתמש במקום לוגיקה ידנית**
  - `CRUDResponseHandler.handleUpdateResponse(response, options)`
  - `CRUDResponseHandler.handleDeleteResponse(response, options)`
  - `CRUDResponseHandler.handleLoadResponse(response, options)` ⭐ **v2.0.0 - טיפול בשגיאות טעינה עם Retry + Copy Error Log**
  - הפרדה אוטומטית בין שגיאות ולידציה (400) לשגיאות מערכת (500)
  - סגירת modal אוטומטית ורענון טבלה

### **Linked Items Service** 🔵 **חבילת CRUD** ✅ **חדש!**
- **קובץ:** `services/linked-items-service.js`
- **תיאור:** מערכת מרכזית לניהול וצגת פריטים מקושרים (trades, plans, executions, alerts, וכו')
- **דוקומנטציה:** [LINKED_ITEMS_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/LINKED_ITEMS_SYSTEM.md), [LINKED_ITEMS_SYSTEM.md](LINKED_ITEMS_SYSTEM.md)
- **פונקציות עיקריות:**
  - `LinkedItemsService.sortLinkedItems(items)` - מיון פריטים מקושרים
  - `LinkedItemsService.getLinkedItemIcon(itemType)` - קבלת אייקון לפי סוג ישות
  - `LinkedItemsService.formatLinkedItemName(item)` - עיצוב שם פריט
  - `LinkedItemsService.generateLinkedItemActions(item, context)` - יצירת כפתורי פעולות

### **Select Populator Service** 🔵 **חבילת CRUD** ✅ **חדש! ינואר 2025**
- **קובץ:** `services/select-populator-service.js`
- **תיאור:** מערכת מרכזית למילוי select boxes מ-API - מחליפה קוד חוזר ב-16 מקומות
- **דוקומנטציה:** [SELECT_POPULATOR_SERVICE.md](../02-ARCHITECTURE/FRONTEND/SELECT_POPULATOR_SERVICE.md), [SERVICES_ARCHITECTURE.md](SERVICES_ARCHITECTURE.md)
- **פונקציות עיקריות:**
  - `SelectPopulatorService.populateTickersSelect(selectId, options)` ✅ **יש להשתמש במקום קוד ידני**
  - `SelectPopulatorService.populateAccountsSelect(selectId, options)`
  - `SelectPopulatorService.populateCurrenciesSelect(selectId, options)`
  - `SelectPopulatorService.populateTradePlansSelect(selectId, options)`
  - `SelectPopulatorService.populateGenericSelect(selectId, endpoint, config)` - כללי לכל endpoint
  - cache של נתונים ושימוש בהעדפות משתמש

### **Default Value Setter** 🔵 **חבילת CRUD** ✅ **חדש! ינואר 2025**
- **קובץ:** `services/default-value-setter.js`
- **תיאור:** מערכת מרכזית להגדרת ברירות מחדל בטפסים - מחליפה קוד זהה ב-16 פונקציות showAddModal
- **דוקומנטציה:** [SERVICES_ARCHITECTURE.md](SERVICES_ARCHITECTURE.md)
- **פונקציות עיקריות:**
  - `DefaultValueSetter.setCurrentDate(fieldId)` - הגדרת תאריך נוכחי
  - `DefaultValueSetter.setCurrentDateTime(fieldId)` - הגדרת תאריך ושעה נוכחיים
  - `DefaultValueSetter.setPreferenceValue(fieldId, preferenceName)` - טעינת ברירות מחדל מהעדפות
  - `DefaultValueSetter.setAllDefaults(config)` - הגדרה מרובה בקריאה אחת

### **Alert Condition Renderer** 🔔 **חבילת התראות מתקדמות** ✅ **חדש!**
- **קובץ:** `services/alert-condition-renderer.js`
- **תיאור:** מערכת מרכזית לעיצוב והצגת תנאי התראות
- **דוקומנטציה:** חלק מ-[ALERT_CONDITION_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/ALERT_CONDITION_SYSTEM.md)
- **פונקציות עיקריות:**
  - `AlertConditionRenderer.render(condition)` - רינדור תנאי התראה
  - תמיכה בכל סוגי התנאים (price, volume, time, וכו')

### **Actions Menu System** 🎨 **חבילת ממשק משתמש מתקדם** ✅ **חדש!**
- **קובץ:** `modules/actions-menu-system.js`
- **תיאור:** מערכת ניהול תפריטי פעולות (hover-based popup menus) בטבלאות
- **דוקומנטציה:** מוזכר ב-[button-system.md](../02-ARCHITECTURE/FRONTEND/button-system.md)
- **תכונות:**
  - Pure CSS hover (ללא JavaScript delays)
  - Auto-positioning (RTL aware)
  - Material Design
  - תמיכה ב-2-5 כפתורים דינמית

### **Button System Init** 🎨 **חבילת ממשק משתמש מתקדם** ✅ **חדש!**
- **קובץ:** `button-system-init.js`
- **תיאור:** מערכת אתחול כפתורים מתקדמת עם logging, caching, וניטור ביצועים
- **דוקומנטציה:** [button-system.md](../02-ARCHITECTURE/FRONTEND/button-system.md)
- **תכונות:**
  - אוטומציה מלאה ליצירת כפתורים
  - תמיכה ב-data-onclick לאירועים מרוכזים
  - ניטור ביצועים ו-caching

### **Event Handler Manager** 🔧 **מערכות ליבה קריטיות** ✅ **חדש!**
- **קובץ:** `event-handler-manager.js`
- **תיאור:** מערכת ניהול אירועים מרכזית למניעת כפילויות ושיפור ביצועים
- **דוקומנטציה:** [EVENT_HANDLER_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/EVENT_HANDLER_SYSTEM.md)
- **פונקציות עיקריות:**
  - `EventHandlerManager.init()` - אתחול מערכת
  - `setupGlobalDelegation()` - הגדרת event delegation גלובלי
  - ניהול listeners מרכזי למניעת duplicates

### **Info Summary System** 📊 **חבילת גרפים ותצוגה**
- **קובץ:** `services/statistics-calculator.js` (InfoSummarySystem)
- **תיאור:** מערכת סיכום נתונים מאוחדת לכל עמודי המשתמש
- **דוקומנטציה:** [INFO_SUMMARY_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/INFO_SUMMARY_SYSTEM.md)
- **פונקציות עיקריות:**
  - `window.InfoSummarySystem.calculateAndRender(data, config)` ✅ **יש להשתמש במקום פונקציות מקומיות `updatePageSummaryStats`**
  - תמיכה במחשבונים מובנים (count, sum, avg, min, max)
  - תמיכה בפרמטרים דינמיים וסטטיסטיקות משניות

### **Validation Utilities** 🔵 **חבילת CRUD**
- **קובץ:** `validation-utils.js` (או `modules/ui-basic.js` - בהתאם לגרסה)
- **תיאור:** מערכת ולידציה מאוחדת לכל הטפסים
- **דוקומנטציה:** [VALIDATION_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/VALIDATION_SYSTEM.md), [STANDARD_VALIDATION_GUIDE.md](../03-DEVELOPMENT/GUIDELINES/STANDARD_VALIDATION_GUIDE.md)
- **פונקציות עיקריות:**
  - `window.showFieldError(field, message)` ✅ **יש להשתמש במקום פונקציות מקומיות לוולידציה**
  - `window.showFieldSuccess(field)`
  - `window.clearFieldError(field)`
  - `window.validateEntityForm(formId, rules)`

### **Field Renderer Service** 🔵 **חבילת CRUD** ✅ **חדש! ינואר 2025**
- **קובץ:** `services/field-renderer-service.js`
- **תיאור:** מערכת מרכזית לעיצוב והצגת שדות בטבלאות (status badges, amounts, dates, וכו') - מחליפה 138 מקומות עם HTML ידני
- **דוקומנטציה:** [field-renderer-service.md](../03-API_REFERENCE/field-renderer-service.md), [SERVICES_ARCHITECTURE.md](SERVICES_ARCHITECTURE.md)
- **פונקציות עיקריות:**
  - `FieldRendererService.renderStatus(status, entityType)` ✅ **יש להשתמש במקום קוד HTML ידני**
  - `FieldRendererService.renderSide(side)`
  - `FieldRendererService.renderAmount(value, currencySymbol, decimals)`
  - `FieldRendererService.renderType(type, amountForColor)`
  - `FieldRendererService.renderDate(date, includeTime)`
  - `FieldRendererService.renderTickerInfo(ticker, cssClass)` ⭐ **חדש - תצוגת מחיר טיקר**
  - `FieldRendererService.renderNumericValue(value, suffix, showPrefix)` - ערך מספרי כללי
  - `FieldRendererService.renderPosition(quantity, averagePrice, currencySymbol)` - מיקום מסחר

### **Header System** 🎨 **חבילת ממשק משתמש מתקדם** 🔍 **חבילת פילטרים**
- **קובץ:** `header-system.js`
- **תיאור:** מערכת כותרת מאוחדת
- **דוקומנטציה:** [HEADER_SYSTEM_README.md](HEADER_SYSTEM_README.md)

### **Menu System** 🎨 **חבילת ממשק משתמש מתקדם**
- **קובץ:** `menu.js`
- **תיאור:** מערכת תפריט
- **דוקומנטציה:** [HEADER_SYSTEM_README.md](HEADER_SYSTEM_README.md) (חלק ממערכת ראש הדף)

### **Color Scheme System** 🎨 **חבילת ממשק משתמש מתקדם**
- **קובץ:** `color-scheme-system.js`
- **תיאור:** מערכת ניהול צבעים
- **דוקומנטציה:** [COLOR_SCHEME_SYSTEM.md](COLOR_SCHEME_SYSTEM.md)

---

## 📊 **מערכות נתונים וטבלאות**

### **Table System** 🔵 **חבילת CRUD**
- **קובץ:** `tables.js`
- **תיאור:** מערכת טבלאות גלובלית
- **דוקומנטציה:** [JAVASCRIPT_ARCHITECTURE.md](JAVASCRIPT_ARCHITECTURE.md#table-system)
- **פונקציות עיקריות:**
  - `sortTableData()`
  - `sortTable()`

### **Entity Services** 🔵 **חבילת CRUD** ✅ **חדש!**
מערכות שירות ספציפיות לישויות - ניהול נתונים ופעולות CRUD:

#### **Alert Service** 🔔 **חבילת התראות מתקדמות**
- **קובץ:** `alert-service.js`
- **תיאור:** שירות מרכזי לניהול התראות - state management, validation, ופעולות utility
- **דוקומנטציה:** [ALERT_SERVICE_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/ALERT_SERVICE_SYSTEM.md) (מוזכר בקוד)
- **פונקציות עיקריות:**
  - `getAlertState(status, isTriggered)` - קביעת מצב תצוגה של התראה
  - `formatAlertCondition(condition)` / `parseAlertCondition(condition)` - עיבוד תנאים
  - `cancelAlert()`, `deleteAlert()`, `updateAlertStatus()` - פעולות CRUD

#### **Ticker Service**
- **קובץ:** `ticker-service.js`
- **תיאור:** שירות מתקדם לניהול טיקרים עם caching וסינון
- **דוקומנטציה:** [TICKER_SERVICE_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/TICKER_SERVICE_SYSTEM.md) (מוזכר בקוד)
- **פונקציות עיקריות:**
  - `getTickers()`, `getTickersWithTrades()`, `getTickersWithPlans()`
  - `getTickersByStatus()`, `getTickersByType()` - סינון מתקדם
  - `updateTickerSelect()` - עדכון select box

#### **Trade Plan Service**
- **קובץ:** `trade-plan-service.js`
- **תיאור:** שירות לניהול תוכניות מסחר
- **דוקומנטציה:** מוזכר ב-[SERVICES_ARCHITECTURE.md](SERVICES_ARCHITECTURE.md)
- **פונקציות עיקריות:**
  - `getTradePlans()`, `getTradePlansByStatus()`, `getTradePlansByInvestmentType()`
  - `filterTradePlans(filters)` - סינון מתקדם
  - `formatTradePlanStatus()` / `parseTradePlanStatus()` - עיבוד סטטוס

#### **Account Service**
- **קובץ:** `account-service.js`
- **תיאור:** שירות לניהול חשבונות מסחר
- **דוקומנטציה:** מוזכר ב-[SERVICES_ARCHITECTURE.md](SERVICES_ARCHITECTURE.md)
- **פונקציות עיקריות:**
  - `getAccounts()`, `getActiveAccounts()`, `getAccountsByStatus()`
  - `cancelAccount()`, `reactivateAccount()` - ניהול סטטוס

#### **Account Balance Service** ✅ **חדש! נובמבר 2025**
- **קובץ:** `services/account-balance-service.js`
- **תיאור:** שירות מרכזי לטעינת יתרות חשבונות מסחר
- **דוקומנטציה:** [ACCOUNT_BALANCE_SERVICE.md](../04-FEATURES/CORE/ACCOUNTS/ACCOUNT_BALANCE_SERVICE.md)
- **פונקציות עיקריות:**
  - `getBalance(accountId, options)` - טעינת יתרה עבור חשבון בודד
  - `getBalances(accountIds, options)` - טעינת יתרות עבור מספר חשבונות (batch)
  - `refreshBalance(accountId)` - רענון יתרה (נקיית cache וטעינה מחדש)
  - `refreshBalances(accountIds)` - רענון מספר יתרות
  - `clearCache(accountId)` - נקיית cache עבור חשבון ספציפי
  - `clearCaches(accountIds)` - נקיית cache עבור מספר חשבונות
- **תכונות:**
  - Cache אוטומטי דרך UnifiedCacheManager (TTL: 60 שניות)
  - Batch loading יעיל (Promise.all)
  - Cache invalidation אוטומטי דרך CacheSyncManager
  - API פשוט ונוח לשימוש בכל המערכת

### **Table Mapping System** 🔵 **חבילת CRUD** 🔍 **חבילת פילטרים**
- **קובץ:** `table-mapping.js`
- **תיאור:** מערכת מיפוי טבלאות
- **דוקומנטציה:** [TABLE_MAPPING_SYSTEM.md](TABLE_MAPPING_SYSTEM.md)

### **Unified IndexedDB System** 🔵 **חבילת CRUD** 🌐 **חבילת נתונים חיצוניים**
- **קובץ:** `unified-indexeddb-adapter.js`
- **תיאור:** מערכת אחסון מקומי מאוחדת
- **דוקומנטציה:** [UNIFIED_INDEXEDDB_SPECIFICATION.md](UNIFIED_INDEXEDDB_SPECIFICATION.md)
- **פונקציות עיקריות:**
  - `UnifiedIndexedDB`
  - `saveFileMapping()`
  - `saveNotificationHistory()`
  - `saveHeaderState()`
  - `saveLinterScanningResults()`

---

## ⚙️ **מערכות העדפות והגדרות**

### **Preferences System** ⚙️ **חבילת העדפות והגדרות**
- **קובץ:** `preferences.js`
- **תיאור:** מערכת העדפות משתמש
- **דוקומנטציה:** [PREFERENCES_SYSTEM.md](../features/preferences/PREFERENCES_SYSTEM.md)
- **פונקציות עיקריות:**
  - `getPreference()`
  - `savePreference()`

### **Preferences Group Manager** ⚙️ **חבילת העדפות והגדרות** ✅ **חדש!**
- **קובץ:** `preferences-group-manager.js`
- **תיאור:** מנהל קבוצות העדפות - אקורדיון ייחודי + lazy loading (רק section אחד פתוח בכל זמן)
- **דוקומנטציה:** חלק מ-[PREFERENCES_SYSTEM.md](../features/preferences/PREFERENCES_SYSTEM.md)
- **פונקציות עיקריות:**
  - `PreferencesGroupManager.openSection(sectionId)` - פתיחת section (סוגר אחרים אוטומטית)
  - `PreferencesGroupManager.closeSection(sectionId)` - סגירת section
  - טעינת העדפות רק כשפותחים section + שמירת העדפות לפי קבוצה

---

## 🔄 **מערכות רענון וניהול**

### **Central Refresh System** 🟢 **חבילת בסיס**
- **קובץ:** `central-refresh-system.js`
- **תיאור:** מערכת רענון מרכזית
- **דוקומנטציה:** [CENTRAL_REFRESH_SYSTEM.md](CENTRAL_REFRESH_SYSTEM.md)

### **System Management**
- **קובץ:** `system-management.js`
- **תיאור:** ניהול מערכת כללי
- **דוקומנטציה:** [JAVASCRIPT_ARCHITECTURE.md](JAVASCRIPT_ARCHITECTURE.md#system-management)

### **Cache Management System** 🟢 **חבילת בסיס**
- **קובץ:** `cache-management.js`
- **תיאור:** מערכת ניהול מטמון
- **דוקומנטציה:** [ADVANCED_CACHE_SYSTEM_GUIDE.md](../development/ADVANCED_CACHE_SYSTEM_GUIDE.md)
- **פונקציות עיקריות:**
  - `clearAllCache()`
  - `clearDevelopmentCache()`
  - `clearCacheBeforeCRUD()`
  - `clearExpiredCache()`

---

## 📁 **מערכות קבצים ומיפוי**

### **File Mapping System** 📁 **חבילת קבצים ומיפוי**
- **קובץ:** `file-mapping.js`
- **תיאור:** מערכת מיפוי קבצי הפרויקט
- **דוקומנטציה:** [PROJECT_FILES_SCANNER.md](PROJECT_FILES_SCANNER.md)
- **פונקציות עיקריות:**
  - `discoverProjectFiles()`
  - `getFileMapping()`
  - `updateFileMappingStatus()`

### **Favicon Management System** 🟢 **חבילת בסיס**
- **קובץ:** `favicon-management.js`
- **תיאור:** מערכת ניהול favicon
- **דוקומנטציה:** [FAVICON_MANAGEMENT_SYSTEM.md](FAVICON_MANAGEMENT_SYSTEM.md)

---

## 📈 **מערכות גרפים ותצוגה**

### **Chart Management System** 📈 **חבילת גרפים ותצוגה**
- **קובץ:** `chart-management.js`
- **תיאור:** מערכת ניהול גרפים
- **דוקומנטציה:** [CHART_SYSTEM_COMPLETE_GUIDE.md](CHART_SYSTEM_COMPLETE_GUIDE.md)

### **Pagination System** 📈 **חבילת גרפים ותצוגה**
- **קובץ:** `pagination-system.js`
- **תיאור:** מערכת עמודים
- **דוקומנטציה:** [PAGINATION_SYSTEM.md](PAGINATION_SYSTEM.md)

---

## 🗓️ **מערכות תאריך וזמן**

### **Date Utilities System** 🗓️ **חבילת תאריכים וזמן**
- **קובץ:** `date-utilities.js`
- **תיאור:** כלי עזר לתאריכים
- **דוקומנטציה:** [DATE_UTILITIES_SYSTEM.md](DATE_UTILITIES_SYSTEM.md)
- **פונקציות עיקריות:**
  - `parseDate()`

---

## 🏠 **מערכות ניהול מצב עמודים**

### **Page State Management System** 🟢 **חבילת בסיס**
- **קובץ:** `page-state-management.js`
- **תיאור:** ניהול מצב עמודים
- **דוקומנטציה:** [PAGE_STATE_MANAGEMENT_SYSTEM.md](PAGE_STATE_MANAGEMENT_SYSTEM.md)
- **פונקציות עיקריות:**
  - `restoreAllSectionStates()`

---

## 🌐 **מערכות תרגום ובינלאומיות**

### **Translation System** 🟢 **חבילת בסיס**
- **קובץ:** `translation-system.js`
- **תיאור:** מערכת תרגום ובינלאומיות
- **דוקומנטציה:** [TRANSLATION_FUNCTIONS.md](TRANSLATION_FUNCTIONS.md)
- **פונקציות עיקריות:**
  - `setLanguage()`

---

## 🔍 **מערכות זיהוי וקטגוריות**

### **Category Detection System** 🔔 **חבילת התראות מתקדמות** 🔍 **חבילת פילטרים**
- **קובץ:** `category-detection.js`
- **תיאור:** זיהוי קטגוריות אוטומטי
- **דוקומנטציה:** [NOTIFICATION_CATEGORY_DETECTOR_SYSTEM.md](NOTIFICATION_CATEGORY_DETECTOR_SYSTEM.md)
- **פונקציות עיקריות:**
  - `getCategoryIcon()`

---

## 🎛️ **מערכות ניהול מודולים**

### **Modal Management System** 🟢 **חבילת בסיס**
- **קובץ:** `modal-management.js`
- **תיאור:** מערכת ניהול מודולים
- **דוקומנטציה:** [MODAL_MANAGEMENT_SYSTEM.md](MODAL_MANAGEMENT_SYSTEM.md)
- **פונקציות עיקריות:**
  - `showModal()`
  - `closeModal()`
  - `closeModalGlobal()`

### **Modal Navigation System** 🎨 **חבילת ממשק משתמש מתקדם**
- **קובץ:** `modal-navigation-manager.js`
- **תיאור:** מערכת ניווט מודולים מקוננים עם היסטוריית ניווט, backdrop גלובלי, ו-breadcrumb
- **דוקומנטציה:** [MODAL_NAVIGATION_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/MODAL_NAVIGATION_SYSTEM.md)
- **פונקציות עיקריות:**
  - `pushModal()` - הוספת מודול ל-stack
  - `popModal()` - הסרת מודול אחרון
  - `goBack()` - חזרה למודול הקודם
  - `getBreadcrumb()` - יצירת breadcrumb trail
  - `updateModalNavigation()` - עדכון UI של הניווט
  - `manageBackdrop()` - ניהול backdrop גלובלי

### **Entity Details System** 🔵 **חבילת CRUD** ✅ **חדש!**
- **קובץ:** `entity-details-modal.js`, `entity-details-renderer.js`, `entity-details-api.js`
- **תיאור:** מערכת מאוחדת להצגת פרטי ישויות (tickers, trades, plans, executions, וכו') במודל
- **דוקומנטציה:** [README.md](../features/entity-details-system/README.md), [LINKED_ITEMS_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/LINKED_ITEMS_SYSTEM.md)
- **רכיבי המערכת:**
  - **EntityDetailsModal** - מודל להצגת פרטי ישות
  - **EntityDetailsRenderer** - רינדור נתוני ישות בפורמט אחיד
  - **EntityDetailsAPI** - API integration עם retry logic ו-caching
- **פונקציות עיקריות:**
  - `window.entityDetailsAPI.getEntityDetails(entityType, entityId, apiOptions)`
  - תמיכה ב-linked items, external data integration, ועיצוב אחיד

---

## 🔄 **מערכות החלפת פונקציות מובנות**

### **Global confirm() Replacement System** 🟢 **חבילת בסיס**
- **קובץ:** `confirm-replacement.js`
- **תיאור:** החלפת פונקציות confirm() מובנות
- **דוקומנטציה:** [NOTIFICATION_SYSTEM.md](NOTIFICATION_SYSTEM.md) (חלק ממערכת ההודעות)
- **פונקציות עיקריות:**
  - `overrideNativeConfirm()`

---

## 📊 **מערכות ניהול מצב סקשנים**

### **Section State Persistence System** 🟢 **חבילת בסיס**
- **קובץ:** `section-state-persistence.js`
- **תיאור:** שמירת מצב סקשנים בין עמודים
- **דוקומנטציה:** [SECTION_TOGGLE_SYSTEM.md](SECTION_TOGGLE_SYSTEM.md)
- **פונקציות עיקריות:**
  - `toggleTopSection()`
  - `toggleMainSection()`
  - `loadSectionStates()`

---

## 🔧 **מערכות ליבה קריטיות**

### **Core System Functions**
- **קובץ:** `page-utils.js`
- **תיאור:** פונקציות ליבה למערכת
- **דוקומנטציה:** [JAVASCRIPT_ARCHITECTURE.md](JAVASCRIPT_ARCHITECTURE.md#core-system-functions)
- **פונקציות עיקריות:**
  - `initializeApplication()`
  - `initializeCoreSystems()`
  - `initializeCurrentPage()`
  - `checkDependencies()`
  - `isModuleAvailable()`
  - `getSystemInfo()`

---

## 📋 **סיכום**

### **סטטוס כללי:**
- **סה"כ מערכות:** 50+ מערכות כלליות (עודכן!)
- **חבילת בסיס:** 10 מערכות חיוניות לכל עמוד
- **דוקומנטציה:** 100% מפורטת
- **יישום:** כל המערכות מיושמות במלואן
- **בדיקה:** כל המערכות נבדקו ועובדות

### **קטגוריות עיקריות (עודכן):**
1. **מערכות אתחול** - 3 מערכות
2. **מערכות התראות והודעות** - 7 מערכות (נוספו: Logger, Alert Condition Renderer, Alert Service)
3. **מערכות ממשק משתמש** - 8 מערכות (נוספו: Actions Menu, Button System, Event Handler)
4. **מערכות נתונים וטבלאות** - 8 מערכות (נוספו: DataCollection, CRUDResponse, SelectPopulator, DefaultValueSetter, LinkedItems, Entity Services, Entity Details)
5. **מערכות העדפות** - 2 מערכות (נוסף: Preferences Group Manager)
6. **מערכות רענון** - 1 מערכת (2 נוספות בחבילת בסיס)
7. **מערכות קבצים** - 2 מערכות
8. **מערכות גרפים** - 2 מערכות
9. **מערכות תאריך** - 1 מערכת
10. **מערכות ניהול מצב עמודים** - 1 מערכת
11. **מערכות תרגום** - 1 מערכת
12. **מערכות זיהוי וקטגוריות** - 1 מערכת
13. **מערכות ניהול מודולים** - 2 מערכות (נוסף: Entity Details System)
14. **מערכות החלפת פונקציות** - 1 מערכת
15. **מערכות ניהול מצב סקשנים** - 1 מערכת
16. **מערכות ליבה** - 2 מערכות (נוסף: Event Handler Manager)

### **מערכות חדשות שנוספו (עדכון נובמבר 2025):**
✅ **DataCollectionService** - איסוף נתונים מטפסים (חוסך 3,131 קריאות ל-getElementById)  
✅ **CRUDResponseHandler** - טיפול בתגובות CRUD (חוסך ~550 שורות קוד)  
✅ **SelectPopulatorService** - מילוי select boxes (חוסך 18 מיקומים)  
✅ **DefaultValueSetter** - ברירות מחדל בטפסים (חוסך ~35 שורות)  
✅ **LinkedItemsService** - ניהול פריטים מקושרים  
✅ **AlertConditionRenderer** - עיצוב תנאי התראות  
✅ **ActionsMenuSystem** - תפריטי פעולות בטבלאות  
✅ **ButtonSystemInit** - אתחול כפתורים מתקדם  
✅ **EventHandlerManager** - ניהול אירועים מרכזי  
✅ **EntityDetailsSystem** - מערכת פרטי ישויות (Modal + Renderer + API)  
✅ **LoggerService** - מערכת לוגים מאוחדת  
✅ **PreferencesGroupManager** - ניהול קבוצות העדפות  
✅ **Entity Services** - AlertService, TickerService, TradePlanService, AccountService
✅ **Account Balance Service** - שירות מרכזי לטעינת יתרות חשבונות ✅ **חדש! נובמבר 2025**

### **עדכון אחרון:**
- **תאריך:** 1 בנובמבר 2025
- **שינוי:** עדכון מקיף - הוספת 15+ מערכות חדשות שנוספו מאז יצירת הרשימה המקורית
- **סטטוס:** מעודכן ומתועד במלואן

---

## 📄 **רשימת עמודים במערכת**

### **עמודים ראשיים** 🟢 **חבילת בסיס**

#### **דף הבית** (`/`) - סקירה כללית של המערכת
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** לא נדרש
- **🔍 חבילת פילטרים:** לא נדרש  
- **📈 חבילת גרפים ותצוגה:** מלא (גרפים + עמודים)
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

#### **תכנון** (`/trade_plans`) - ניהול תוכניות מסחר
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** מלא (טבלאות + מיפוי + אחסון)
- **🔍 חבילת פילטרים:** מלא (כותרת + מיפוי + זיהוי)
- **📈 חבילת גרפים ותצוגה:** חלקי (עמודים בלבד)
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

#### **מעקב** (`/trades`) - מעקב אחר עסקאות
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** מלא (טבלאות + מיפוי + אחסון)
- **🔍 חבילת פילטרים:** מלא (כותרת + מיפוי + זיהוי)
- **📈 חבילת גרפים ותצוגה:** מלא (גרפים + עמודים)
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

#### **מחקר** (`/research`) - כלי מחקר וניתוח
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** חלקי (טבלאות + אחסון)
- **🔍 חבילת פילטרים:** לא נדרש
- **📈 חבילת גרפים ותצוגה:** מלא (גרפים + עמודים)
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** מלא (Yahoo Finance + אחסון + ניהול)

### **הגדרות** 🟢 **חבילת בסיס**

#### **התראות** (`/alerts`) - ניהול התראות
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** מלא (טבלאות + מיפוי + אחסון)
- **🔍 חבילת פילטרים:** מלא (כותרת + מיפוי + זיהוי)
- **📈 חבילת גרפים ותצוגה:** חלקי (עמודים בלבד)
- **🔔 חבילת התראות מתקדמות:** מלא (התראות + הגירה + זיהוי)
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

#### **הערות** (`/notes`) - ניהול הערות
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** מלא (טבלאות + מיפוי + אחסון)
- **🔍 חבילת פילטרים:** מלא (כותרת + מיפוי + זיהוי)
- **📈 חבילת גרפים ותצוגה:** חלקי (עמודים בלבד)
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

#### **חשבונות מסחר** (`/trading_accounts`) - ניהול חשבונות
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** מלא (טבלאות + מיפוי + אחסון)
- **🔍 חבילת פילטרים:** מלא (כותרת + מיפוי + זיהוי)
- **📈 חבילת גרפים ותצוגה:** חלקי (עמודים בלבד)
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

#### **טיקרים** (`/tickers`) - ניהול טיקרים
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** מלא (טבלאות + מיפוי + אחסון)
- **🔍 חבילת פילטרים:** מלא (כותרת + מיפוי + זיהוי)
- **📈 חבילת גרפים ותצוגה:** חלקי (עמודים בלבד)
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

#### **עסקאות** (`/executions`) - ניהול עסקאות
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** מלא (טבלאות + מיפוי + אחסון)
- **🔍 חבילת פילטרים:** מלא (כותרת + מיפוי + זיהוי)
- **📈 חבילת גרפים ותצוגה:** חלקי (עמודים בלבד)
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

#### **תזרימי מזומנים** (`/cash_flows`) - ניהול תזרימים
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** מלא (טבלאות + מיפוי + אחסון)
- **🔍 חבילת פילטרים:** מלא (כותרת + מיפוי + זיהוי)
- **📈 חבילת גרפים ותצוגה:** חלקי (עמודים בלבד)
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

#### **העדפות** (`/preferences`) - הגדרות מערכת
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** לא נדרש
- **🔍 חבילת פילטרים:** לא נדרש
- **📈 חבילת גרפים ותצוגה:** לא נדרש
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** מלא (העדפות)
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

#### **בסיס נתונים** (`/db_display`) - תצוגת בסיס נתונים
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** חלקי (טבלאות + אחסון)
- **🔍 חבילת פילטרים:** מלא (כותרת + מיפוי + זיהוי)
- **📈 חבילת גרפים ותצוגה:** חלקי (עמודים בלבד)
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

#### **טבלאות עזר** (`/db_extradata`) - טבלאות עזר
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** חלקי (טבלאות + אחסון)
- **🔍 חבילת פילטרים:** מלא (כותרת + מיפוי + זיהוי)
- **📈 חבילת גרפים ותצוגה:** חלקי (עמודים בלבד)
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

### **כלי פיתוח - ניהול מערכת** 🟢 **חבילת בסיס**

#### **ניהול מערכת** (`/system-management`) - כלי ניהול כלליים
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** לא נדרש
- **🔍 חבילת פילטרים:** לא נדרש
- **📈 חבילת גרפים ותצוגה:** לא נדרש
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

#### **דשבורד נתונים חיצוניים** (`/external-data-dashboard`) - ניהול נתונים חיצוניים
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** חלקי (טבלאות + אחסון)
- **🔍 חבילת פילטרים:** לא נדרש
- **📈 חבילת גרפים ותצוגה:** מלא (גרפים + עמודים)
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** מלא (Yahoo Finance + אחסון + ניהול)

#### **מרכז התראות** (`/notifications-center`) - ניהול התראות
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** לא נדרש
- **🔍 חבילת פילטרים:** לא נדרש
- **📈 חבילת גרפים ותצוגה:** לא נדרש
- **🔔 חבילת התראות מתקדמות:** מלא (התראות + הגירה + זיהוי)
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

#### **ניהול משימות ברקע** (`/background-tasks`) - ניהול משימות
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** לא נדרש
- **🔍 חבילת פילטרים:** לא נדרש
- **📈 חבילת גרפים ותצוגה:** לא נדרש
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

#### **ניטור שרת** (`/server-monitor`) - ניטור ביצועים
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** לא נדרש
- **🔍 חבילת פילטרים:** לא נדרש
- **📈 חבילת גרפים ותצוגה:** מלא (גרפים + עמודים)
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

### **כלי פיתוח - כלי פיתוח** 🟢 **חבילת בסיס**

#### **מטריקס JS** (`/page-scripts-matrix`) - מטריקס קבצי JavaScript
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** חלקי (טבלאות + אחסון)
- **🔍 חבילת פילטרים:** מלא (כותרת + מיפוי + זיהוי)
- **📈 חבילת גרפים ותצוגה:** חלקי (עמודים בלבד)
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** מלא (מיפוי קבצים)
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

#### **מפת JS** (`/js-map`) - מפת פונקציות JavaScript
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** חלקי (טבלאות + אחסון)
- **🔍 חבילת פילטרים:** מלא (כותרת + מיפוי + זיהוי)
- **📈 חבילת גרפים ותצוגה:** חלקי (עמודים בלבד)
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** מלא (מיפוי קבצים)
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

#### **דשבורד Linter** (`/linter-realtime-monitor.html`) - ניטור איכות קוד
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** לא נדרש
- **🔍 חבילת פילטרים:** לא נדרש
- **📈 חבילת גרפים ותצוגה:** לא נדרש
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

#### **ניהול גרפים** (`/chart-management`) - ניהול גרפים
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** חלקי (טבלאות + אחסון)
- **🔍 חבילת פילטרים:** לא נדרש
- **📈 חבילת גרפים ותצוגה:** מלא (גרפים + עמודים)
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש
#### **מנהל CSS** (`/css-management`) - ניהול עיצובים
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** חלקי (טבלאות + אחסון)
- **🔍 חבילת פילטרים:** מלא (כותרת + מיפוי + זיהוי)
- **📈 חבילת גרפים ותצוגה:** חלקי (עמודים בלבד)
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

#### **בדיקות CRUD** (`/crud-testing-dashboard`) - בדיקות CRUD
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** מלא (טבלאות + מיפוי + אחסון)
- **🔍 חבילת פילטרים:** מלא (כותרת + מיפוי + זיהוי)
- **📈 חבילת גרפים ותצוגה:** חלקי (עמודים בלבד)
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

#### **בדיקת Cache** (`/cache-test`) - בדיקת מטמון
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** לא נדרש
- **🔍 חבילת פילטרים:** לא נדרש
- **📈 חבילת גרפים ותצוגה:** לא נדרש
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש
#### **אילוצים** (`/constraints`) - ניהול אילוצים
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** חלקי (טבלאות + אחסון)
- **🔍 חבילת פילטרים:** מלא (כותרת + מיפוי + זיהוי)
- **📈 חבילת גרפים ותצוגה:** חלקי (עמודים בלבד)
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

### **כלי פיתוח - ממשק משתמש** 🟢 **חבילת בסיס**
#### **צבעים דינמיים** (`/dynamic-colors-display`) - תצוגת צבעים
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** לא נדרש
- **🔍 חבילת פילטרים:** לא נדרש
- **📈 חבילת גרפים ותצוגה:** מלא (גרפים + עמודים)
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

#### **בדיקת כותרת** (`/test-header-only`) - בדיקת מערכת כותרת
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** לא נדרש
- **🔍 חבילת פילטרים:** מלא (כותרת + מיפוי + זיהוי)
- **📈 חבילת גרפים ותצוגה:** לא נדרש
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש

#### **עיצובים** (`/designs`) - גלריית עיצובים
- **🟢 חבילת בסיס:** מלא (כל המערכות)
- **🔵 חבילת CRUD:** לא נדרש
- **🔍 חבילת פילטרים:** לא נדרש
- **📈 חבילת גרפים ותצוגה:** לא נדרש
- **🔔 חבילת התראות מתקדמות:** לא נדרש
- **🎨 חבילת ממשק משתמש מתקדם:** מלא (כותרת + תפריט + צבעים)
- **⚙️ חבילת העדפות והגדרות:** לא נדרש
- **📁 חבילת קבצים ומיפוי:** לא נדרש
- **🗓️ חבילת תאריכים וזמן:** לא נדרש
- **🌐 חבילת נתונים חיצוניים:** לא נדרש
---

## 📊 **סיכום ניתוח קבוצות מערכות**

### **סטטיסטיקות כלליות:**
- **סה"כ עמודים:** 29 עמודים
- **סה"כ קבוצות:** 10 קבוצות מערכות
- **חבילת בסיס:** נדרשת בכל עמוד (100%)
- **חבילת ממשק משתמש:** נדרשת בכל עמוד (100%)

### **חלוקת קבוצות לפי עמודים:**

#### **🟢 חבילת בסיס** - 100% מהעמודים
- **מלא:** 29/29 עמודים (100%)

#### **🔵 חבילת CRUD** - 48% מהעמודים
- **מלא:** 14/29 עמודים (48%)
- **חלקי:** 6/29 עמודים (21%)
- **לא נדרש:** 9/29 עמודים (31%)

#### **🔍 חבילת פילטרים** - 55% מהעמודים
- **מלא:** 16/29 עמודים (55%)
- **לא נדרש:** 13/29 עמודים (45%)

#### **📈 חבילת גרפים ותצוגה** - 45% מהעמודים
- **מלא:** 6/29 עמודים (21%)
- **חלקי:** 7/29 עמודים (24%)
- **לא נדרש:** 16/29 עמודים (55%)

#### **🔔 חבילת התראות מתקדמות** - 7% מהעמודים
- **מלא:** 2/29 עמודים (7%)
- **לא נדרש:** 27/29 עמודים (93%)

#### **🎨 חבילת ממשק משתמש מתקדם** - 100% מהעמודים
- **מלא:** 29/29 עמודים (100%)

#### **⚙️ חבילת העדפות והגדרות** - 3% מהעמודים
- **מלא:** 1/29 עמודים (3%)
- **לא נדרש:** 28/29 עמודים (97%)

#### **📁 חבילת קבצים ומיפוי** - 7% מהעמודים
- **מלא:** 2/29 עמודים (7%)
- **לא נדרש:** 27/29 עמודים (93%)

#### **🗓️ חבילת תאריכים וזמן** - 0% מהעמודים
- **לא נדרש:** 29/29 עמודים (100%)

#### **🌐 חבילת נתונים חיצוניים** - 7% מהעמודים
- **מלא:** 2/29 עמודים (7%)
- **לא נדרש:** 27/29 עמודים (93%)

### **מסקנות:**
1. **חבילת בסיס** ו**חבילת ממשק משתמש** נדרשות בכל עמוד
2. **חבילת CRUD** ו**חבילת פילטרים** נדרשות ברוב העמודים
3. **חבילת גרפים** נדרשת בכמחצית מהעמודים
4. **חבילות מתקדמות** נדרשות רק בעמודים ספציפיים
5. **חבילת תאריכים** לא נדרשת באף עמוד (עתידית)

---

**קובץ זה מחליף את המטריצה המורכבת ומספק רשימה פשוטה וברורה של כל המערכות הכלליות במערכת.**
