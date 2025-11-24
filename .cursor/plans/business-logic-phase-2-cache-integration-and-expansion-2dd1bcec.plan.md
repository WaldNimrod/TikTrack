<!-- 2dd1bcec-1fc6-4d00-b468-644745a93ce0 5333fdec-24d7-4f75-ac0d-f197a3c72a10 -->
# תוכנית עבודה מקיפה - בדיקות ותיקונים Phase 2

## מטרת התוכנית

ביצוע בדיקות מקיפות ותיקונים לכל הישויות, העמודים, המודולים והתהליכים שעברו שיכתוב של שכבת הלוגיקה העסקית בשלב 2, בהתאם לנוהל העבודה:

1. **בדיקה** -> **תיקון** -> **בדיקה חוזרת** - עד לקבלת תוצאה מדויקת ב-100%
2. **מעבר לישות הבאה**
3. **בדיקה סופית חוזרת** לכל הישויות

---

## ישויות שעברו שיכתוב (9 ישויות)

לפי `BUSINESS_LOGIC_COMPLETE_SYSTEM_REFERENCE.md`, הישויות הבאות עברו שיכתוב מלא:

1. **Trade** - `TradeBusinessService` + `trades-data.js` + `trades.js`
2. **Execution** - `ExecutionBusinessService` + `executions-data.js` + `executions.js`
3. **Alert** - `AlertBusinessService` + `alerts-data.js` + `alerts.js`
4. **CashFlow** - `CashFlowBusinessService` + `cash-flows-data.js` + `cash_flows.js`
5. **Note** - `NoteBusinessService` + `notes-data.js` + `notes.js`
6. **TradingAccount** - `TradingAccountBusinessService` + `trading-accounts-data.js` + `trading_accounts.js`
7. **TradePlan** - `TradePlanBusinessService` + `trade-plans-data.js` + `trade_plans.js`
8. **Ticker** - `TickerBusinessService` + `tickers-data.js` + `tickers.js`
9. **Statistics** - `StatisticsBusinessService` (אין עמוד ייעודי, משולב בעמודים אחרים)

---

## עמודים שעברו שיכתוב (9 עמודים)

לפי `BUSINESS_LOGIC_COMPLETE_SYSTEM_REFERENCE.md` ו-`PAGES_LIST.md`:

1. **trades.html** - עמוד טריידים
2. **executions.html** - עמוד ביצועים
3. **alerts.html** - עמוד התראות
4. **cash_flows.html** - עמוד תזרימי מזומנים
5. **notes.html** - עמוד הערות
6. **trading_accounts.html** - עמוד חשבונות מסחר
7. **trade_plans.html** - עמוד תוכניות מסחר
8. **tickers.html** - עמוד טיקרים
9. **index.html** - דשבורד (משתמש ב-StatisticsBusinessService)

---

## מודולים שצריך לבדוק

### מודולים מרכזיים:

1. **Linked Items System** - `linked-items-service.js`, `linked-items.js`

- כפתור "Linked Items" בכל עמוד
- חלון Linked Items נפתח
- רשימת פריטים מקושרים מוצגת נכון

2. **Entity Details Modal** - `entity-details-modal.js`, `entity-details-renderer.js`

- פתיחת modal פרטים
- הצגת פרטי ישות
- סגירה וחזרה לעמוד

3. **Conditions Modal** - `conditions-modal-controller.js`, `conditions-*.js`

- פתיחת modal תנאים מתוך טרייד/תוכנית
- יצירת תנאים חדשים
- עריכת תנאים קיימים
- סגירה וחזרה למודל הקודם

4. **Nested Modals** - `modal-navigation-manager.js`

- פתיחת modal מתוך modal
- ניווט בין מודלים
- סגירה וחזרה למודל הקודם
- בדיקת z-index וניהול focus

5. **Tag Management** - `tag-ui-manager.js`, `tag-service.js`

- בחירת תגיות במודלים
- שמירת תגיות
- הצגת תגיות בטבלאות

---

## תהליכים שצריך לבדוק

### 1. תהליכי CRUD (Create, Read, Update, Delete)

לכל ישות:

- **Create:**
- פתיחת modal יצירה
- מילוי טופס
- ולידציה (Business Logic API)
- חישובים (אם רלוונטי)
- שמירה
- סגירת modal
- עדכון טבלה
- עדכון סיכום (אם רלוונטי)

- **Read:**
- טעינת טבלה
- הצגת נתונים
- פילטרים עובדים
- מיון עובד
- pagination עובד

- **Update:**
- פתיחת modal עריכה
- טעינת נתונים קיימים
- עריכת נתונים
- ולידציה
- חישובים
- שמירה
- עדכון טבלה

- **Delete:**
- בדיקת פריטים מקושרים (אם רלוונטי)
- אישור מחיקה
- מחיקה
- עדכון טבלה

### 2. תהליכי E2E (End-to-End)

לכל ישות:

- יצירת ישות חדשה
- עריכת ישות
- מחיקת ישות
- יצירת ישות מקושרת
- עדכון ישות מקושרת
- מחיקת ישות מקושרת
- בדיקת עדכון מטמון
- בדיקת עדכון סיכומים

### 3. תהליכי Cache Updates

לכל פעולת CRUD:

- בדיקת ניקוי מטמון לפני פעולה
- בדיקת עדכון מטמון אחרי פעולה
- בדיקת TTL expiration
- בדיקת cache invalidation patterns
- בדיקת cache sync (Frontend ↔ Backend)

### 4. תהליכי Modal Interactions

- פתיחת modal מתוך עמוד
- פתיחת modal מתוך modal (nested)
- סגירת modal וחזרה למודל קודם
- סגירת modal וחזרה לעמוד
- בדיקת z-index
- בדיקת focus management
- בדיקת keyboard navigation (ESC, Tab)

---

## סדר ביצוע מומלץ

### שלב 1: תיקון בעיות קיימות

**1.1 תיקון בעיית Trades (investment_type mapping)**

- **בעיה:** ולידציה נכשלה - "investment_type must be one of: Investment, Swing, Passive"
- **קובץ:** `trading-ui/scripts/trades.js`
- **תיקון:** וידוא שהמיפוי של `investment_type` מתבצע נכון לפני שליחת הנתונים ל-API
- **בדיקה:** יצירת טרייד חדש - ולידציה עוברת, שמירה מצליחה

### שלב 2: בדיקות CRUD לכל ישות (סדר מומלץ)

**2.1 Trades (טריידים)**

- בדיקת Create (כולל תיקון בעיית investment_type)
- בדיקת Read
- בדיקת Update
- בדיקת Delete
- בדיקת Linked Items
- בדיקת Modals (יצירה, עריכה, פרטים)
- בדיקת Nested Modals (Conditions Modal מתוך Trade Modal)
- בדיקת Cache Updates

**2.2 Executions (ביצועים)**

- בדיקת Create (כולל חישובי ערכים)
- בדיקת Read
- בדיקת Update
- בדיקת Delete
- בדיקת Linked Items
- בדיקת Modals
- בדיקת Cache Updates

**2.3 Alerts (התראות)**

- בדיקת Create (כולל ולידציה של ערך תנאי)
- בדיקת Read
- בדיקת Update
- בדיקת Delete
- בדיקת Linked Items
- בדיקת Modals
- בדיקת Cache Updates

**2.4 Notes (הערות)**

- בדיקת Create (כולל Rich Text Editor)
- בדיקת Read
- בדיקת Update
- בדיקת Delete
- בדיקת Linked Items
- בדיקת Modals
- בדיקת Cache Updates

**2.5 Trading Accounts (חשבונות מסחר)**

- בדיקת Create
- בדיקת Read
- בדיקת Update
- בדיקת Delete (כולל בדיקת פריטים מקושרים)
- בדיקת Linked Items
- בדיקת Modals
- בדיקת Cache Updates

**2.6 Trade Plans (תוכניות מסחר)**

- בדיקת Create (כולל חישובי מחירים)
- בדיקת Read
- בדיקת Update
- בדיקת Delete
- בדיקת Linked Items
- בדיקת Modals
- בדיקת Nested Modals (Conditions Modal)
- בדיקת Cache Updates

**2.7 Tickers (טיקרים)**

- בדיקת Create (כולל ולידציה של סמל)
- בדיקת Read
- בדיקת Update
- בדיקת Delete (כולל בדיקת פריטים מקושרים)
- בדיקת Linked Items
- בדיקת Modals
- בדיקת Cache Updates

**2.8 Cash Flows (תזרימי מזומנים)**

- בדיקת Create (כולל חישובי יתרה והמרות מטבע)
- בדיקת Read
- בדיקת Update
- בדיקת Delete
- בדיקת Linked Items
- בדיקת Modals
- בדיקת Cache Updates

### שלב 3: בדיקות E2E מקיפות

**3.1 תהליכי E2E לכל ישות:**

- יצירת ישות -> עריכה -> מחיקה
- יצירת ישות מקושרת -> עדכון -> מחיקה
- בדיקת עדכון מטמון בכל שלב
- בדיקת עדכון סיכומים בכל שלב

**3.2 תהליכי E2E בין ישויות:**

- יצירת Trade -> יצירת Execution -> עדכון Trade
- יצירת TradePlan -> יצירת Trade מתוך Plan
- יצירת Alert -> קישור ל-Trade/Execution
- יצירת Note -> קישור לישות

### שלב 4: בדיקות מודולים מקווננים

**4.1 Linked Items System:**

- פתיחת Linked Items מתוך כל עמוד
- הצגת פריטים מקושרים
- יצירת פריט מקושר חדש
- מחיקת פריט מקושר

**4.2 Entity Details Modal:**

- פתיחת modal פרטים מתוך כל עמוד
- הצגת פרטי ישות
- סגירה וחזרה לעמוד

**4.3 Conditions Modal (Nested):**

- פתיחת Conditions Modal מתוך Trade Modal
- פתיחת Conditions Modal מתוך TradePlan Modal
- יצירת תנאי חדש
- עריכת תנאי קיים
- סגירה וחזרה למודל הקודם
- בדיקת z-index
- בדיקת focus management

**4.4 Tag Management:**

- בחירת תגיות במודלים
- שמירת תגיות
- הצגת תגיות בטבלאות
- מחיקת תגיות

### שלב 5: בדיקות Cache Updates

**5.1 Cache Invalidation:**

- בדיקת ניקוי מטמון לפני כל פעולת CRUD
- בדיקת עדכון מטמון אחרי כל פעולת CRUD
- בדיקת TTL expiration
- בדיקת cache invalidation patterns

**5.2 Cache Sync:**

- בדיקת סנכרון Frontend ↔ Backend
- בדיקת cache sync אחרי פעולות CRUD
- בדיקת cache sync אחרי עדכוני ישויות מקושרות

### שלב 6: בדיקה סופית חוזרת

**6.1 בדיקה חוזרת לכל הישויות:**

- בדיקת Create לכל ישות
- בדיקת Read לכל ישות
- בדיקת Update לכל ישות
- בדיקת Delete לכל ישות

**6.2 בדיקה חוזרת לכל המודולים:**

- בדיקת Linked Items בכל עמוד
- בדיקת Entity Details בכל עמוד
- בדיקת Conditions Modal (אם רלוונטי)
- בדיקת Tag Management בכל עמוד

**6.3 בדיקה חוזרת לכל התהליכים:**

- בדיקת E2E לכל ישות
- בדיקת Cache Updates לכל פעולה
- בדיקת Modal Interactions בכל תרחיש

---

## קבצים מרכזיים לעדכון

### קבצי תיקון:

- `trading-ui/scripts/trades.js` - תיקון מיפוי investment_type
- (קבצים נוספים לפי ממצאי הבדיקות)

### קבצי דיווח:

- `documentation/05-REPORTS/BUSINESS_LOGIC_PHASE2_CRUD_TESTING_REPORT.md` - עדכון תוצאות בדיקות
- `documentation/05-REPORTS/BUSINESS_LOGIC_PHASE2_FINAL_TESTING_REPORT.md` - עדכון תוצאות בדיקות סופיות

---

## קריטריוני הצלחה

### לכל ישות:

- ✅ כל פעולות CRUD עובדות ב-100%
- ✅ כל הולידציות עובדות נכון
- ✅ כל החישובים עובדים נכון
- ✅ כל המודולים עובדים נכון
- ✅ כל עדכוני המטמון עובדים נכון
- ✅ אין שגיאות ב-console
- ✅ אין שגיאות ב-network requests

### לכל עמוד:

- ✅ העמוד נטען בהצלחה
- ✅ כל ה-Data Services זמינים
- ✅ כל ה-Business Logic API wrappers זמינים
- ✅ כל המודולים עובדים
- ✅ כל התהליכים עובדים

### לכל מודול:

- ✅ המודול נפתח נכון
- ✅ המודול נסגר נכון
- ✅ חזרה למודל/עמוד קודם עובדת
- ✅ z-index נכון
- ✅ focus management נכון

---

## הערות חשובות

1. **נוהל עבודה:** בדיקה -> תיקון -> בדיקה חוזרת - עד 100% הצלחה -> מעבר לישות הבאה
2. **עדכון דיווחים:** כל ממצא צריך להיות מתועד ב-`BUSINESS_LOGIC_PHASE2_CRUD_TESTING_REPORT.md`
3. **תיקון בעיות:** כל בעיה שנמצאה חייבת להיות מתוקנת לפני מעבר לישות הבאה
4. **בדיקה סופית:** אחרי השלמת כל הישויות, יש לבצע בדיקה סופית חוזרת לכל הישויות
5. **תיעוד:** כל תיקון צריך להיות מתועד עם הסבר על הבעיה והפתרון

### To-dos

- [ ] תיקון ולידציה ב-Trades - מיפוי investment_type ו-price/quantity
- [ ] בדיקות CRUD מקיפות לכל הישויות
- [ ] בדיקת מודולים מקווננים כולל חזרה למודול הקודם
- [ ] בדיקת עדכון ממשקים אחרי פעולות וניהול מטמון
- [ ] בדיקות E2E מקיפות
- [ ] בדיקת טעינת עמוד Alerts - העמוד נטען, כל הפונקציות זמינות
- [ ] בדיקת זמינות Business Logic API wrappers - validateConditionValue, validateAlert זמינים
- [ ] בדיקת ולידציות - validateConditionValue - price ו-change עובדים נכון
- [ ] בדיקת ולידציות - validateAlert - הולידציה המקומית עובדת נכון
- [ ] אינטגרציה עם UnifiedCacheManager - הוספת מטמון ל-Business Logic API wrappers ב-trades-data.js, executions-data.js, alerts-data.js
- [ ] אינטגרציה עם CacheTTLGuard - הוספת configs ל-CACHE_TTL_CONFIG והחלפת לוגיקת מטמון ידנית
- [ ] אינטגרציה עם CacheSyncManager - הוספת invalidation patterns וקריאה ל-invalidateByAction() אחרי mutations
- [ ] בדיקות ביצועים - מדידת response time, throughput, cache hit rate, יצירת דוח
- [ ] יצירת Note Business Logic Service - Backend service, API routes, tests, Frontend wrappers
- [ ] יצירת TradingAccount Business Logic Service - Backend service, API routes, tests, Frontend wrappers
- [ ] יצירת TradePlan Business Logic Service - Backend service, API routes, tests, Frontend wrappers
- [ ] יצירת Ticker Business Logic Service - Backend service, API routes, tests, Frontend wrappers
- [ ] יצירת Currency Business Logic Service - Backend service, API routes, tests
- [ ] יצירת Tag Business Logic Service - Backend service, API routes, tests
- [ ] בדיקות Edge Cases - ערכים שליליים, אפס, גדולים, קטנים, null/undefined, יצירת דוח
- [ ] בדיקות ביצועים - response time, throughput, memory usage, cache hit rate, error rate, יצירת דוח
- [ ] בדיקות אינטגרציה - UnifiedAppInitializer, Preferences, Cache, Notification, Logger, יצירת דוח
- [ ] בדיקת Trades page - Business Logic API wrappers עם מטמון
- [ ] בדיקת Executions page - Business Logic API wrappers עם מטמון
- [ ] בדיקת Alerts page - Business Logic API wrappers עם מטמון
- [ ] בדיקת API endpoints חדשים - כל ה-9 endpoints עובדים מצוין!
- [ ] בדיקת טעינת עמוד Alerts - העמוד נטען, כל הפונקציות זמינות
- [ ] בדיקת זמינות Business Logic API wrappers - validateConditionValue, validateAlert זמינים
- [ ] בדיקת ולידציות - validateConditionValue - price ו-change עובדים נכון
- [ ] בדיקת ולידציות - validateAlert - הולידציה המקומית עובדת נכון
- [ ] בדיקת טעינת עמוד Alerts - העמוד נטען, כל הפונקציות זמינות
- [ ] בדיקת זמינות Business Logic API wrappers - validateConditionValue, validateAlert זמינים
- [ ] בדיקת ולידציות - validateConditionValue - price ו-change עובדים נכון
- [ ] בדיקת ולידציות - validateAlert - הולידציה המקומית עובדת נכון
- [ ] אינטגרציה עם UnifiedCacheManager - הוספת מטמון ל-Business Logic API wrappers ב-trades-data.js, executions-data.js, alerts-data.js
- [ ] אינטגרציה עם CacheTTLGuard - הוספת configs ל-CACHE_TTL_CONFIG והחלפת לוגיקת מטמון ידנית
- [ ] אינטגרציה עם CacheSyncManager - הוספת invalidation patterns וקריאה ל-invalidateByAction() אחרי mutations
- [ ] בדיקות ביצועים - מדידת response time, throughput, cache hit rate, יצירת דוח
- [ ] יצירת Note Business Logic Service - Backend service, API routes, tests, Frontend wrappers
- [ ] יצירת TradingAccount Business Logic Service - Backend service, API routes, tests, Frontend wrappers
- [ ] יצירת TradePlan Business Logic Service - Backend service, API routes, tests, Frontend wrappers
- [ ] יצירת Ticker Business Logic Service - Backend service, API routes, tests, Frontend wrappers
- [ ] יצירת Currency Business Logic Service - Backend service, API routes, tests
- [ ] יצירת Tag Business Logic Service - Backend service, API routes, tests
- [ ] בדיקות Edge Cases - ערכים שליליים, אפס, גדולים, קטנים, null/undefined, יצירת דוח
- [ ] בדיקות ביצועים - response time, throughput, memory usage, cache hit rate, error rate, יצירת דוח
- [ ] בדיקות אינטגרציה - UnifiedAppInitializer, Preferences, Cache, Notification, Logger, יצירת דוח
- [ ] בדיקת Trades page - Business Logic API wrappers עם מטמון
- [ ] בדיקת Executions page - Business Logic API wrappers עם מטמון
- [ ] בדיקת Alerts page - Business Logic API wrappers עם מטמון
- [ ] בדיקת API endpoints חדשים - כל ה-9 endpoints עובדים מצוין!
- [ ] בדיקת טעינת עמוד Alerts - העמוד נטען, כל הפונקציות זמינות
- [ ] בדיקת זמינות Business Logic API wrappers - validateConditionValue, validateAlert זמינים
- [ ] בדיקת ולידציות - validateConditionValue - price ו-change עובדים נכון
- [ ] בדיקת ולידציות - validateAlert - הולידציה המקומית עובדת נכון
- [ ] תיקון ולידציה ב-Trades - מיפוי investment_type ו-price/quantity
- [ ] בדיקות CRUD מקיפות לכל הישויות
- [ ] בדיקת מודולים מקווננים כולל חזרה למודול הקודם
- [ ] בדיקת עדכון ממשקים אחרי פעולות וניהול מטמון
- [ ] בדיקות E2E מקיפות
- [ ] בדיקת טעינת עמוד Alerts - העמוד נטען, כל הפונקציות זמינות
- [ ] בדיקת זמינות Business Logic API wrappers - validateConditionValue, validateAlert זמינים
- [ ] בדיקת ולידציות - validateConditionValue - price ו-change עובדים נכון
- [ ] בדיקת ולידציות - validateAlert - הולידציה המקומית עובדת נכון
- [ ] אינטגרציה עם UnifiedCacheManager - הוספת מטמון ל-Business Logic API wrappers ב-trades-data.js, executions-data.js, alerts-data.js
- [ ] אינטגרציה עם CacheTTLGuard - הוספת configs ל-CACHE_TTL_CONFIG והחלפת לוגיקת מטמון ידנית
- [ ] אינטגרציה עם CacheSyncManager - הוספת invalidation patterns וקריאה ל-invalidateByAction() אחרי mutations
- [ ] בדיקות ביצועים - מדידת response time, throughput, cache hit rate, יצירת דוח
- [ ] יצירת Note Business Logic Service - Backend service, API routes, tests, Frontend wrappers
- [ ] יצירת TradingAccount Business Logic Service - Backend service, API routes, tests, Frontend wrappers
- [ ] יצירת TradePlan Business Logic Service - Backend service, API routes, tests, Frontend wrappers
- [ ] יצירת Ticker Business Logic Service - Backend service, API routes, tests, Frontend wrappers
- [ ] יצירת Currency Business Logic Service - Backend service, API routes, tests
- [ ] יצירת Tag Business Logic Service - Backend service, API routes, tests
- [ ] בדיקות Edge Cases - ערכים שליליים, אפס, גדולים, קטנים, null/undefined, יצירת דוח
- [ ] בדיקות ביצועים - response time, throughput, memory usage, cache hit rate, error rate, יצירת דוח
- [ ] בדיקות אינטגרציה - UnifiedAppInitializer, Preferences, Cache, Notification, Logger, יצירת דוח
- [ ] בדיקת Trades page - Business Logic API wrappers עם מטמון
- [ ] בדיקת Executions page - Business Logic API wrappers עם מטמון
- [ ] בדיקת Alerts page - Business Logic API wrappers עם מטמון
- [ ] בדיקת API endpoints חדשים - כל ה-9 endpoints עובדים מצוין!
- [ ] בדיקת טעינת עמוד Alerts - העמוד נטען, כל הפונקציות זמינות
- [ ] בדיקת זמינות Business Logic API wrappers - validateConditionValue, validateAlert זמינים
- [ ] בדיקת ולידציות - validateConditionValue - price ו-change עובדים נכון
- [ ] בדיקת ולידציות - validateAlert - הולידציה המקומית עובדת נכון
- [ ] בדיקת טעינת עמוד Alerts - העמוד נטען, כל הפונקציות זמינות
- [ ] בדיקת זמינות Business Logic API wrappers - validateConditionValue, validateAlert זמינים
- [ ] בדיקת ולידציות - validateConditionValue - price ו-change עובדים נכון
- [ ] בדיקת ולידציות - validateAlert - הולידציה המקומית עובדת נכון
- [ ] אינטגרציה עם UnifiedCacheManager - הוספת מטמון ל-Business Logic API wrappers ב-trades-data.js, executions-data.js, alerts-data.js
- [ ] אינטגרציה עם CacheTTLGuard - הוספת configs ל-CACHE_TTL_CONFIG והחלפת לוגיקת מטמון ידנית
- [ ] אינטגרציה עם CacheSyncManager - הוספת invalidation patterns וקריאה ל-invalidateByAction() אחרי mutations
- [ ] בדיקות ביצועים - מדידת response time, throughput, cache hit rate, יצירת דוח
- [ ] יצירת Note Business Logic Service - Backend service, API routes, tests, Frontend wrappers
- [ ] יצירת TradingAccount Business Logic Service - Backend service, API routes, tests, Frontend wrappers
- [ ] יצירת TradePlan Business Logic Service - Backend service, API routes, tests, Frontend wrappers
- [ ] יצירת Ticker Business Logic Service - Backend service, API routes, tests, Frontend wrappers
- [ ] יצירת Currency Business Logic Service - Backend service, API routes, tests
- [ ] יצירת Tag Business Logic Service - Backend service, API routes, tests
- [ ] בדיקות Edge Cases - ערכים שליליים, אפס, גדולים, קטנים, null/undefined, יצירת דוח
- [ ] בדיקות ביצועים - response time, throughput, memory usage, cache hit rate, error rate, יצירת דוח
- [ ] בדיקות אינטגרציה - UnifiedAppInitializer, Preferences, Cache, Notification, Logger, יצירת דוח
- [ ] בדיקת Trades page - Business Logic API wrappers עם מטמון
- [ ] בדיקת Executions page - Business Logic API wrappers עם מטמון
- [ ] בדיקת Alerts page - Business Logic API wrappers עם מטמון
- [ ] בדיקת API endpoints חדשים - כל ה-9 endpoints עובדים מצוין!
- [ ] בדיקת טעינת עמוד Alerts - העמוד נטען, כל הפונקציות זמינות
- [ ] בדיקת זמינות Business Logic API wrappers - validateConditionValue, validateAlert זמינים
- [ ] בדיקת ולידציות - validateConditionValue - price ו-change עובדים נכון
- [ ] בדיקת ולידציות - validateAlert - הולידציה המקומית עובדת נכון