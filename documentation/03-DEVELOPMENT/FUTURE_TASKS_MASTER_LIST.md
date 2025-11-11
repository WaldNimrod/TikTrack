# 📌 Future Development Master Task Registry

## מקור המסמכים שאוחדו
- `documentation/FUTURE_DEVELOPMENT_ROADMAP.md`
- `documentation/plans/implementation/CENTRAL_TASKS_TODO.md`
- `documentation/plans/implementation/TRIGGERS_AND_FUTURE_FEATURES_TASKS.md`
- `documentation/plans/implementation/GLOBAL_UI_IMPROVEMENTS_TASKS.md`
- `documentation/plans/implementation/DEVELOPMENT_TOOLS_STANDARDIZATION_TASKS.md`
- `documentation/plans/implementation/V2_CLEANUP_TASKS.md`
- `documentation/plans/implementation/LINTER_IMPLEMENTATION_PLAN.md`
- `documentation/plans/implementation/SERVER_TASKS_LIST.md`

---

## 1. ממשק משתמש וחוויית משתמש

### 1.1 FUTURE_DEVELOPMENT_ROADMAP – UI/UX כלליים
- תיקון כפתורי סגירה במודולים.
- יישור כפתורים בפוטרים (RTL).
- צבעי כותרות דינמיים.
- מינוח אחיד בכל המערכת.

### 1.2 FUTURE_DEVELOPMENT_ROADMAP – שיפורי נגישות
- תמיכה בקוראי מסך.
- ניווט במקלדת.
- תמיכה בגדלי מסך שונים.
- שיפור ניגודיות צבעים.

### 1.3 CENTRAL_TASKS_TODO – עמוד עסקעות `executions.js`
- ניתוב לדף טיקר:
  - יצירת דף טיקר ייעודי.
  - מערכת ניתוב בין עמודים.
  - העברת פרמטר `symbol`.
- מודל הוספת טיקר:
  - עיצוב מודל.
  - ולידציה לנתוני טיקר.
  - שמירה לשרת.
  - רענון רשימת טיקרים.
- מודל הוספת תכנון:
  - עיצוב מודל תכנון.
  - בחירת טיקר קיים.
  - הגדרת פרמטרי תכנון.
  - שמירה לשרת.
- מודל הוספת טרייד:
  - עיצוב מודל טרייד.
  - בחירת טיקר קיים.
  - הגדרת פרמטרי טרייד.
  - שמירה לשרת.

### 1.4 CENTRAL_TASKS_TODO – תצוגות נוספות
- מודל פרטי היסטוריה ב-`background-tasks.js`:
  - עיצוב מודל מפורט.
  - הצגת מידע מפורט.
  - פעולות נוספות.
  - התאמת עיצוב לנתונים.
- אימות משתמש והצטרפות לחדר ב-`realtime-notifications-client.js`:
  - מערכת אימות משתמש.
  - חדרים אישיים.
  - אבטחת חיבור WebSocket.
  - ניהול הרשאות חדר.

### 1.5 CENTRAL_TASKS_TODO – תכונות עתידיות (UX)
- הצגת טריידים סגורים בטפסי עסקה:
  - הוספת תיבות סימון.
  - לוגיקת פילטר.
  - אינדיקטורים ויזואליים לסטטוס.
  - עדכון רשימות בחירה.
  - הודעת "בפיתוח" זמנית.
- מערכת תבניות מתקדמת:
  - תבניות למודולים שונים.
  - ממשק ניהול תבניות.
  - תבניות ברירת מחדל.
- מערכת תגיות מתקדמת:
  - יצירת תגיות וניהולן.
  - סינון וחיפוש לפי תגיות.
  - אנליטיקה לשימוש.
  - הצעות אוטומטיות.
- מערכת הערות עשירה:
  - עורך טקסט עשיר.
  - צירוף תמונות/גרפים.
  - היסטוריית גרסאות.
  - כללי עיצוב.
- מערכת גיבוי מתקדמת:
  - גיבוי אוטומטי.
  - שחזור נקודתי.
  - ניהול גרסאות.

### 1.6 GLOBAL_UI_IMPROVEMENTS_TASKS – פריסת שדרוגים רוחביים
- הוספת עמודת "עודכן" אחרי עמודת הערות בכל אחד מהעמודים:
  - `trades.html`, `accounts.html`, `alerts.html`, `cash-flows.html`, `notes.html`, `trade-plans.html`, `executions.html`.
- עדכון CSS להבטחת רוחב טבלאות 100% ויישור כותרות למרכז.
- יישום פונקציית `getTimeDuration` להצגת זמן שעבר מעדכון אחרון.
- תיקון race condition במחלקות צבע כותרות באמצעות `color-scheme-system.js`.
- עיצוב עמודת Has Trades עם אייקונים תואמי מערכת.
- עיצוב מספרים עם שתי ספרות אחרי הנקודה.
- הטמעת סגנונות RTL בטבלאות, מודלים ורכיבי linked items.
- הבטחת שימוש ב-CSS variables לצבעי ישויות.
- עדכון מפת עמודות ומערכת מיון גלובלית (`tables.js`, `table-mappings.js`).
- קבצים לעדכון:
  - `trading-ui/styles/table.css`.
  - `trading-ui/styles/styles.css`.
  - `trading-ui/styles/linked-items.css`.
  - `trading-ui/scripts/tables.js`.
  - `trading-ui/scripts/table-mappings.js`.
  - `trading-ui/scripts/color-scheme-system.js`.
  - `trading-ui/scripts/preferences-v2.js` (לתיקון שימוש בצבעים).

### 1.7 DEVELOPMENT_TOOLS_STANDARDIZATION_TASKS – סטנדרטיזציה לעמודי כלי פיתוח
- לכל אחד מהעמודים (`background-tasks.html`, `cache-test.html`, `db_display.html`, `db_extradata.html`, `linter-realtime-monitor.html`, `notifications-center.html`, `server-monitor.html`, `system-management.html`):
  - ניקוי CSS מיותר.
  - שיוך לכל קבצי ה-CSS המאוחדים (apple-theme, bootstrap, styles, header-system, typography, table, notification-system).
  - שימוש עקבי במחלקות Bootstrap.
  - בניית כותרת סטנדרטית עם `top-section`, `section-header`, `table-actions`.
  - הוספת כפתור "העתק לוג מפורט" ופונקציית `copyDetailedLog`.
  - בדיקת פונקציונליות כפתורי toggles (`toggleTopSection`).
  - הבטחת ניהול Active Alerts ו-summary בכל עמוד.
  - הערכות זמן: עדכון מלא (30–60 דק׳), עדכון חלקי (15–30 דק׳).

---

## 2. Backend, תשתיות ושרת

### 2.1 FUTURE_DEVELOPMENT_ROADMAP – מערכת ביצועים ואופטימיזציה
- אופטימיזציה של טעינת נתונים.
- שיפור זמני תגובה.
- מיטוב שימוש בזיכרון.
- יישום מנגנון Cache חכם.

### 2.2 CENTRAL_TASKS_TODO – משימות תשתית כלליות
- בדיקת תאימות SSL לפני עדכון תלות (`urllib3`): שמירת הגבלות גרסאות, בדיקת לוגים, בדיקות התאמה.
- מערכת מיגרציות מתקדמת:
  - מיגרציות אוטומטיות בהפעלת השרת.
  - בדיקת תקינות ו-rollback.
  - לוגים מפורטים.
- אופטימיזציית בסיס נתונים:
  - ניתוח ביצועי שאילתות.
  - יצירת אינדקסים מתקדמים.
  - אופטימיזציית סכמות וניטור ביצועים.
- Advanced Security Features:
  - הצפנת נתונים רגישים.
  - ניהול מפתחות הצפנה (כולל backups).
  - הצפנה בזמן אמת וגיבויים מוצפנים.
  - מערכת הרשאות מתקדמת (ניהול הרשאות גרגולרי, קבוצות, לוג הרשאות).
  - ניהול API Keys (יצירה, הרשאות, מעקב שימוש, ביטול).
- Performance and Scaling:
  - אינטגרציית Redis (התקנה, אינטגרציה, ניהול cache, ניטור).
  - Load Balancing (הגדרת load balancer, בריאות, failover).
  - Horizontal Scaling (ניהול state, סנכרון, ניטור).
- Advanced Testing:
  - Load Testing (תרחישים, סימולציה, ניתוח, אופטימיזציה).
  - Security Testing (penetration, vulnerability scanning, security audit, compliance).

### 2.3 SERVER_TASKS_LIST – שיפורי Backend ייעודיים (שאינם הושלמו)
- השלמת Backend APIs למערכות קיימות:
  - Query Optimization – נתונים אמיתיים מהדאטהבייס.
  - External Data – נתונים אמיתיים.
  - Performance – מדדי מערכת אמיתיים.
  - בדיקות API מלאות עם נתונים אמיתיים.
- מערכת Background Tasks מתקדמת:
  - `AdvancedBackgroundTaskManager`.
  - Task Queue עם עדיפויות.
  - Worker system וניהול התקדמות.
  - Error handling ו-API לניהול משימות.
  - UI לנהל משימות (`background-tasks.html`, CSS, JS).
- מערכת Real-time Notifications:
  - אינטגרציית Flask-SocketIO.
  - ניהול חדרים אישיים, שידור אירועים, הרשאות.
  - מנגנון subscribe/unsubscribe.
- מערכת API Versioning חכמה:
  - ניהול גרסאות.
  - תאימות לאחור.
  - כלי מיגרציה בין גרסאות.
  - זיהוי גרסה אוטומטי.
- מערכת Data Validation מתקדמת:
  - מנוע חוקים (rules engine).
  - מאמתים מותאמים אישית.
  - ולידציה לפי סכמות.
  - דיווח שגיאות מפורט.
- מערכת Analytics מתקדמת:
  - Dashboard למדדי שימוש וביצועים.
  - איסוף metrics.
- Plugin Architecture:
  - תכנון ארכיטקטורה מודולרית.
  - ממשקי הרחבה.
  - ניהול lifecycle של plugins.

---

## 3. בסיס נתונים, טריגרים ומיגרציות

### 3.1 TRIGGERS_AND_FUTURE_FEATURES_TASKS – סבב טריגרים (סבב ג)
- השלמת טריגרי `active_trades`:
  - יצירת/השלמת `trigger_trade_insert_active_trades`.
  - `trigger_trade_update_active_trades`.
  - `trigger_trade_delete_active_trades`.
  - בדיקות תקינות וביצועים.
- יצירת טריגרי סטטוס טיקר:
  - טריגרים לכל CRUD על `trade` ו-`trade_plan`.
  - סנכרון `status` בטיקר.
- בדיקת טריגרים קיימים למניעת התנגשויות.
- תיעוד מלא של הטריגרים (כולל מדריך תחזוקה ודוגמאות).

### 3.2 TRIGGERS_AND_FUTURE_FEATURES_TASKS – משימות בסיס נתונים מתקדמות
- יצירת טבלאות חדשות:
  - `users`.
  - `user_preferences`.
  - `quotes_last`.
  - `intraday_slots` (שלב אופציונלי).
- העברת מודלים למיקומים נכונים ועדכון imports.
- יצירת מודל `User` עם יצירה, אימות, הרשאות.
- עדכון קשרים (Foreign Keys ו-relationships) בכל המודלים.
- יצירת אינדקסים נדרשים (`ticker_id`, `user_id`, `timestamp`).
- הוספת ולידציות מתקדמות (אימות אימייל, סיסמה, טלפון).
- הוספת audit logs לשינויים.
- אופטימיזציית ביצועים לשאילתות.

### 3.3 CENTRAL_TASKS_TODO – משימות בסיס נתונים קריטיות
- טבלת `users` עם כל השדות הנלווים.
- טבלת `user_preferences` (קשר ל-users, preference_key/value).
- מודל `User` ואז מערכת הרשאות בסיסית (admin/user/guest).
- מערכת אימות משתמשים (login/logout, JWT, refresh).
- ניהול פרופיל משתמש (עריכה, שינוי סיסמה, העדפות).
- מערכת הרשאות מתקדמת (בסיס למערכת granular).
- הוספת ולידציות מתקדמות, גיבוי אוטומטי, מערכת לוגים מתקדמת.

### 3.4 V2_CLEANUP_TASKS – ניקוי מערכת ההעדפות
- גיבוי בסיס הנתונים לפני כל פעולה.
- עדכון סקריפטי המיגרציה:
  - `migrate_preferences_v1_to_v2.py` → `migrate_preferences.py` + עדכון שמות פונקציות.
  - `simple_migrate_v1_to_v2.py` → `simple_migrate_preferences.py`.
- עדכון בדיקות:
  - `test_v2_system.py` → `test_preferences_system.py`.
  - תיקון התייחסויות לטבלאות V2.
- ניקוי טבלת `user_data_preferences`.
- בדיקת שלמות ואינטגריטי של טבלאות העדפות.
- תיקון קבצי Frontend:
  - `preferences-v2.js` → `preferences.js`.
  - `preferences-v2-compatibility.js` → `preferences-compatibility.js`.
  - `preferences-v2.html` → `preferences.html`.
  - עדכון קישורים בכל העמודים (`index`, `tickers`, `executions`).
- הסרת כל התייחסויות V1/V2 מדוקומנטציה:
  - `documentation/INDEX.md`.
  - `documentation/features/preferences/INDEX.md`.
  - `documentation/frontend/README.md`.
  - `documentation/frontend/JAVASCRIPT_ARCHITECTURE.md`.
  - `documentation/frontend/JS_ORGANIZATION.md`.
  - `documentation/development/README.md`.
  - `documentation/development/NOTIFICATION_SYSTEM_IMPLEMENTATION.md`.
  - `documentation/USER_MANAGEMENT_SYSTEM.md`.
  - `JAVASCRIPT_ARCHITECTURE_ANALYSIS.md`.
  - `PREFERENCES_SYSTEM_ARCHITECTURE_SPECIFICATION.md`.
  - כל דוחות ה-V2 (`PREFERENCES_V2_*`, `SITE_WIDE_V2_SCAN_REPORT.md`).
- עדכון קבצי תצורה (JSON, `js_map.py`, `pages.py`, `app.py`).
- בדיקות נדרשות:
  - בדיקות DB (מבנה, אינדקסים, constraints).
  - בדיקות API (Endpoints, error handling, performance).
  - בדיקות Frontend (HTML, CSS, JS, קישורים).
  - בדיקות אינטגרציה מלאות.
- ניהול גיבויים (DB, Backend, Frontend) לפני כל שינוי.
- תיקון שגיאות SQLAlchemy mapper המופיעות בלוגים.

---

## 4. תכונות עתידיות ומודולים חדשים

### 4.1 FUTURE_DEVELOPMENT_ROADMAP – תכונות חדשות
- מערכת דוחות מתקדמת.
- אינטגרציה עם פלטפורמות נוספות.
- מערכת התראות חכמה.
- אנליטיקה מתקדמת.

### 4.2 CENTRAL_TASKS_TODO – תכונות עתידיות (עדיפות גבוהה)
- כפילות תכניות וטריידים (כפתור "שכפל", דיאלוג אישור, שימור קשרים).
- מערכת תבניות מתקדמת (יצירה, שמירה, תבניות ברירת מחדל).
- חישוב אוטומטי של יעד וסטופ (RR, ATR, overrides, real-time updates).
- Trading Journal Database Design (מבנה טבלה, קשרים, קטגוריות, חיפוש).
- מערכת התראות מתקדמת (push, email, SMS, הגדרות אישיות).
- מערכת דוחות מתקדמת (גרפים, ייצוא, שמירה).

### 4.3 CENTRAL_TASKS_TODO – תכונות עתידיות (עדיפות בינונית/נמוכה)
- שדה `open_plans` לטיקרים (DB triggers, event listeners, UI, API, בדיקות).
- מערכת קישור אובייקטים מתקדמת (קישורים מותאמים, פוליניווטיבה, היסטוריה).
- מערכת הערות מתקדמת עם rich text.
- מערכת היסטוריה מפורטת לכל הפעולות (חיפוש, סינון, ייצוא).
- מערכת סינון מתקדמת (סינונים מורכבים, שמירת פילטרים, שיתוף).
- מערכת חיפוש מתקדמת (Full-text, היסטוריה).
- מערכת ייצוא מתקדמת (PDF, Excel, CSV, עיצובים).
- מערכת אנליטיקה לתגיות/Linked Objects/Alerts.
- Field rename "Reasons" → "Strategy" (DB, API, UI, תרגום).
- Symbol Page ייעודי (מידע, גרפים, חדשות, אינטגרציות).
- Rich comments system, trade alerts system, advanced entry conditions, advanced reasons/strategy system.
- Linked Objects Modal Windows – שלב טבלה ושלב מודל עם דרישות UI, עדכוני נתונים בזמן אמת, bulk operations.
- Transaction Association System (טבלת קשר, כלי bulk, ולידציה, UI).
- Account Management Functions (עריכה, מחיקה, ולידציה, היסטוריה).
- Data Update Verification Across All Pages (עדכונים בזמן אמת, polling fallback, כפתורי רענון, מסכי סטטוס).
- Preferences Page bug – שמירת ברירות מחדל (API file write, לוגים, בדיקות לכל סוגי ההעדפות).
- Price Data & Ticker Information API (אינטגרציות, נתונים היסטוריים, אחסון, caching, error handling).
- Trading Journal Implementation מלא (עורך עשיר, קבצים מצורפים, תבניות, חיפוש, אנליטיקה, ייצוא).
- Tagging System נרחב (ניהול, סינון, אנליטיקה, הצעות, צבעים, היררכיות, פעולות מרובות).
- Trade Alerts System (יצירה, ניהול, היסטוריה, התראות).
- Advanced Alert Types (נפח, תנאים מותאמים).
- Advanced Template Features, General Functionality Placeholders.
- Top Section Spacing Enhancement (מרווח עליון קבוע, בדיקות responsiveness, תאימות header).

### 4.4 TRIGGERS_AND_FUTURE_FEATURES_TASKS – השלמה/דגשים נוספים
- הדגשת הצורך בתנאי כניסה מתקדמים, מערכת אסטרטגיות, מערכת תיוג, אימות עדכון נתונים, עמוד סימבול, חלונות מודל לפריטים מקושרים, Real-time alerts, פונקציות ניהול בדיקות, שינוי שם שדות.
- הרחבה על `open_plans` (מיגרציה, מודל, API, UI, בדיקות).

---

## 5. איכות, בדיקות וכלי פיתוח

### 5.1 CENTRAL_TASKS_TODO – משימות בדיקה
- בדיקות יחידה:
  - מודלים, שירותים, API endpoints, רכיבי UI.
- בדיקות אינטגרציה:
  - בין מודולים, End-to-End, בסיס נתונים, מערכת מלאה.
- בדיקות UI/UX:
  - תאימות דפדפנים, רספונסיביות, נגישות, ביצועים.

### 5.2 LINTER_IMPLEMENTATION_PLAN – אסטרטגיית ניקוי קוד
- הפחתת אזהרות `no-console` ל-300 תוך החלפתם במערכת הלוגים המאוחדת.
- טיפול ב-`class-methods-use-this` (המרה ל-static).
- טיפול ב-`require-await`, `max-len`, `no-unused-vars`, `no-shadow`.
- ניקוי קבצים עם אזהרות רבות (`header-system.js`, `system-test-center*.js`, `external-data-dashboard.js`, `server-monitor.js`, `realtime-notifications-client.js`, `notifications-center.js`, `db-extradata.js`, `notifications-center-backup.js`, `console-cleanup.js`).
- השלמת ניקוי 5 קבצים לחלוטין (בכל גל עבודה).
- יעדי טווח בינוני וארוך:
  - הפחתת אזהרות ל-500 ואז ל-200.
  - ניקוי 15 קבצים נוספים ואז 80% מהקבצים.
  - השגת איכות קוד מקצועית תוך 60–80 שעות עבודה מצטברת.
- שימוש בפקודות `eslint --fix`, דוחות מפורטים, קונבנציות תיעוד.

### 5.3 DEVELOPMENT_TOOLS_STANDARDIZATION_TASKS – סטנדרטיזציה של כלי פיתוח
- הוספת העיצוב והמבנה החדשים לכל עמודי כלי הפיתוח.
- הבטחת שימוש בסגנונות המאוחדים והכפתורים הסטנדרטיים.
- אינטגרציה עם מערכת ההודעות להצלחות/שגיאות.
- בדיקת כפתורי copyDetailedLog בכל עמוד ואימות הפלט.
- סידור סדר עבודה מומלץ (תחילה עמודים עם עדכון חלקי, לאחר מכן מלאים).

### 5.4 SERVER_TASKS_LIST – ניטור והמשך שיפורים
- לאחר השלמת המערכות הקריטיות, להתמקד במערכת Background Tasks כמשימה הבאה.
- ליישר קו על הפעלת APIs אמיתיים עבור Query Optimization/External Data/Performance.
- להרחיב את Unified Test Center עם נתונים אמיתיים לאחר השלמת ה-APIs.
- למדוד מדדי הצלחה (זמני תגובה, שימוש CPU/זיכרון, throughput, UX, אמינות, Maintainability, Scalability).

---

## 6. תעדוף וצעדים מומלצים
- **שלב מיידי (0–2 שבועות):**
  - טיפול בשגיאות SQLAlchemy הקשורות ל-V2.
  - השלמת טריגרי `active_trades` וסטטוס טיקר.
  - בדיקות API ו-Frontend למערכת ההעדפות.
  - התחלת ניקוי לינטינג לפי היעדים הקצרים.
- **שלב קצר טווח (1–2 חודשים):**
  - פיתוח מערכת Background Tasks.
  - הטמעת Price Data & Ticker Information API.
  - השלמת תכונות UX קריטיות (כפילות טריידים, Trading Journal DB).
  - הסרת התייחסויות V2 מדוקומנטציה וקבצים.
  - המשך ניקוי אזהרות ל-700 ול-500.
- **שלב בינוני/ארוך:**
  - אינטגרציית Redis, Load Balancing, Horizontal Scaling.
  - פיתוח Real-time Notifications מלא.
  - בניית מערכת Analytics מתקדמת ו-Plugin Architecture.
  - השלמת כל התכונות העתידיות והמודולים החדשים ברשימות.

---

## הערות תחזוקה
- הקובץ יעודכן בכל פעם שמסמך מקור משתנה.
- בזמן ביצוע משימה יש לסמן סטטוס הן בקובץ המקורי והן כאן לשמירה על עקביות.
- בכל שינוי מערכת משמעותי מומלץ לעדכן גם את `documentation/INDEX.md` כדי שהקובץ הזה יופיע ברשימות המרכזיות.


