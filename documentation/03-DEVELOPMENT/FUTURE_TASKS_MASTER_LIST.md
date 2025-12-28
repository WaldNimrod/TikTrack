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
- ✅ **בוצע (11.2025):** צבעי כותרות דינמיים.
- 🔶 **חשוב:** מינוח אחיד בכל המערכת.
- 🟦 **עתידי (אופציונלי):** החלפת Bootstrap Tooltips ב-Floating UI - Bootstrap Tooltips עובדים טוב כרגע, אך ניתן לשקול מעבר ל-Floating UI בעתיד למעטפת אחידה אחת. ראה: `documentation/03-DEVELOPMENT/PLANS/EXTERNAL_UI_LIBRARIES_PLAN.md`

### 1.2 FUTURE_DEVELOPMENT_ROADMAP – שיפורי נגישות

- 🟦 **עתידי:** תמיכה בקוראי מסך.
- 🟦 **עתידי:** ניווט במקלדת.
- 🚨 **דחוף:** תמיכה בגדלי מסך שונים.
- 🟦 **עתידי:** שיפור ניגודיות צבעים.

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

- ⚙️ **אחר (נדרש פתרון שמירת View State):** מודל פרטי היסטוריה ב-`background-tasks.js`:
  - עיצוב מודל מפורט.
  - הצגת מידע מפורט.
  - פעולות נוספות.
  - התאמת עיצוב לנתונים.
- ⚙️ **אחר (בוטל ומיועד להסרה):** אימות משתמש והצטרפות לחדר ב-`realtime-notifications-client.js`:
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
- 🔶 **חשוב:** מערכת תבניות מתקדמת:
  - תבניות למודולים שונים.
  - ממשק ניהול תבניות.
  - תבניות ברירת מחדל.
- 🚨 **דחוף:** מערכת תגיות מתקדמת:
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

- ⚙️ **אחר (נדרש פתרון שמירת View State):** הוספת עמודת "עודכן" אחרי עמודת הערות בכל אחד מהעמודים:
  - `trades.html`, `accounts.html`, `alerts.html`, `cash_flows.html`, `notes.html`, `trade_plans.html`, `executions.html`.
- ✅ **בוצע (11.2025):** עדכון CSS להבטחת רוחב טבלאות 100% ויישור כותרות למרכז.
- ✅ **בוצע (11.2025):** יישום פונקציית `getTimeDuration` להצגת זמן שעבר מעדכון אחרון.
- ✅ **בוצע (11.2025):** תיקון race condition במחלקות צבע כותרות באמצעות `color-scheme-system.js`.
- ✅ **בוצע (11.2025):** עיצוב עמודת Has Trades עם אייקונים תואמי מערכת.
- ✅ **בוצע (11.2025):** עיצוב מספרים עם שתי ספרות אחרי הנקודה.
- ✅ **בוצע (11.2025):** הטמעת סגנונות RTL בטבלאות, מודלים ורכיבי linked items.
- ✅ **בוצע (11.2025):** הבטחת שימוש ב-CSS variables לצבעי ישויות.
- ✅ **בוצע (11.2025):** עדכון מפת עמודות ומערכת מיון גלובלית (`tables.js`, `table-mappings.js`).
- ✅ **בוצע (11.2025):** סט קבצים תומכים (table.css, styles.css, linked-items.css, tables.js, table-mappings.js, color-scheme-system.js, preferences-v2.js) סגור לעדכון.

### 1.7 DEVELOPMENT_TOOLS_STANDARDIZATION_TASKS – סטנדרטיזציה לעמודי כלי פיתוח

- ⚙️ **אחר (מאוחד בפרויקט עמודי כלי פיתוח):** המעקב מתבצע כעת במסמך הפרויקט הייעודי, אך הסעיפים נשמרים כאן לעיון.
- לכל אחד מהעמודים (`background_tasks.html`, `cache-test.html`, `db_display.html`, `db_extradata.html`, `linter-realtime-monitor.html`, `notifications_center.html`, `server_monitor.html`, `system_management.html`):
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

- ⬜ **טרם נקבע סטטוס:** אופטימיזציה של טעינת נתונים.
- ⬜ **טרם נקבע סטטוס:** שיפור זמני תגובה.
- ⬜ **טרם נקבע סטטוס:** מיטוב שימוש בזיכרון.
- יישום מנגנון Cache חכם.

### 2.2 CENTRAL_TASKS_TODO – משימות תשתית כלליות

- ⬜ **טרם נקבע סטטוס:** בדיקת תאימות SSL לפני עדכון תלות (`urllib3`): שמירת הגבלות גרסאות, בדיקת לוגים, בדיקות התאמה.
- ⬜ **טרם נקבע סטטוס:** מערכת מיגרציות מתקדמת:
  - מיגרציות אוטומטיות בהפעלת השרת.
  - בדיקת תקינות ו-rollback.
  - לוגים מפורטים.
- 🔶 **חשוב:** אופטימיזציית בסיס נתונים:
  - ניתוח ביצועי שאילתות.
  - יצירת אינדקסים מתקדמים.
  - אופטימיזציית סכמות וניטור ביצועים.
- 🔶 **חשוב:** Advanced Security Features:
  - הצפנת נתונים רגישים.
  - ניהול מפתחות הצפנה (כולל backups).
  - הצפנה בזמן אמת וגיבויים מוצפנים.
  - מערכת הרשאות מתקדמת (ניהול הרשאות גרגולרי, קבוצות, לוג הרשאות).
  - ניהול API Keys (יצירה, הרשאות, מעקב שימוש, ביטול).
- 🔶 **חשוב:** Performance and Scaling:
  - אינטגרציית Redis (התקנה, אינטגרציה, ניהול cache, ניטור).
  - Load Balancing (הגדרת load balancer, בריאות, failover).
  - Horizontal Scaling (ניהול state, סנכרון, ניטור).
- 🔶 **חשוב:** Advanced Testing:
  - Load Testing (תרחישים, סימולציה, ניתוח, אופטימיזציה).
  - Security Testing (penetration, vulnerability scanning, security audit, compliance).

### 2.3 SERVER_TASKS_LIST – שיפורי Backend ייעודיים (שאינם הושלמו)

- 🔶 **חשוב:** השלמת Backend APIs למערכות קיימות:
  - Query Optimization – נתונים אמיתיים מהדאטהבייס.
  - External Data – נתונים אמיתיים.
  - Performance – מדדי מערכת אמיתיים.
  - בדיקות API מלאות עם נתונים אמיתיים.
- 🟧 **בוצע חלקית:** מערכת Background Tasks מתקדמת:
  - `AdvancedBackgroundTaskManager`.
  - Task Queue עם עדיפויות.
  - Worker system וניהול התקדמות.
  - Error handling ו-API לניהול משימות.
  - UI לנהל משימות (`background_tasks.html`, CSS, JS).
- ✅ **בוצע:** מערכת Real-time Notifications:
  - אינטגרציית Flask-SocketIO.
  - ניהול חדרים אישיים, שידור אירועים, הרשאות.
  - מנגנון subscribe/unsubscribe.
- 🔶 **חשוב:** מערכת API Versioning חכמה:
  - ניהול גרסאות.
  - תאימות לאחור.
  - כלי מיגרציה בין גרסאות.
  - זיהוי גרסה אוטומטי.
- 🔶 **חשוב:** מערכת Data Validation מתקדמת:
  - מנוע חוקים (rules engine).
  - מאמתים מותאמים אישית.
  - ולידציה לפי סכמות.
  - דיווח שגיאות מפורט.
- 🟦 **עתידי:** מערכת Analytics מתקדמת:
  - Dashboard למדדי שימוש וביצועים.
  - איסוף metrics.
- 🟦 **עתידי:** Plugin Architecture:
  - תכנון ארכיטקטורה מודולרית.
  - ממשקי הרחבה.
  - ניהול lifecycle של plugins.

---

## 3. בסיס נתונים, טריגרים ומיגרציות

### 3.1 TRIGGERS_AND_FUTURE_FEATURES_TASKS – סבב טריגרים (סבב ג)

- ✅ **בוצע:** השלמת טריגרי `active_trades`:
  - יצירת/השלמת `trigger_trade_insert_active_trades`.
  - `trigger_trade_update_active_trades`.
  - `trigger_trade_delete_active_trades`.
  - בדיקות תקינות וביצועים.
- ✅ **בוצע:** יצירת טריגרי סטטוס טיקר:
  - טריגרים לכל CRUD על `trade` ו-`trade_plan`.
  - סנכרון `status` בטיקר.
- ✅ **בוצע:** בדיקת טריגרים קיימים למניעת התנגשויות (ראו `documentation/03-DEVELOPMENT/DB/TRIGGER_AUDIT_REPORT.md`).
- ✅ **בוצע:** תיעוד מלא של הטריגרים (כולל מדריך תחזוקה ודוגמאות מעודכנות).

### 3.2 TRIGGERS_AND_FUTURE_FEATURES_TASKS – משימות בסיס נתונים מתקדמות

- ✅ **בוצע:** יצירת טבלאות חדשות:
  - `users`.
  - `user_preferences`.
  - `quotes_last`.
  - `intraday_slots` (שלב אופציונלי).
- ✅ **בוצע:** העברת מודלים למיקומים נכונים ועדכון imports.
- 🔶 **חשוב:** יצירת מודל `User` עם יצירה, אימות, הרשאות.
- ✅ **בוצע:** עדכון קשרים (Foreign Keys ו-relationships) בכל המודלים.
- 🔶 **חשוב:** יצירת אינדקסים נדרשים (`ticker_id`, `user_id`, `timestamp`).
- ✅ **בוצע:** הוספת ולידציות מתקדמות (אימות אימייל, סיסמה, טלפון).
- ✅ **בוצע:** הוספת audit logs לשינויים.
- 🔶 **חשוב:** אופטימיזציית ביצועים לשאילתות.

### 3.3 CENTRAL_TASKS_TODO – משימות בסיס נתונים קריטיות

- ⚙️ **אחר (מאוחד עם בניית מערכת משתמשים):** טבלת `users` עם כל השדות הנלווים.
- ✅ **בוצע:** טבלת `user_preferences` (קשר ל-users, preference_key/value).
- 🔶 **חשוב:** מודל `User` ואז מערכת הרשאות בסיסית (admin/user/guest).
- ⚙️ **אחר (מאוחד עם בניית מערכת משתמשים):** מערכת אימות משתמשים (login/logout, JWT, refresh).
- ⚙️ **אחר (מאוחד עם בניית מערכת משתמשים):** ניהול פרופיל משתמש (עריכה, שינוי סיסמה, העדפות).
- ⚙️ **אחר (מאוחד עם בניית מערכת משתמשים):** מערכת הרשאות מתקדמת (בסיס למערכת granular).
- ✅ **בוצע:** הוספת ולידציות מתקדמות, גיבוי אוטומטי, מערכת לוגים מתקדמת.

### 3.4 V2_CLEANUP_TASKS – ניקוי מערכת ההעדפות

- ✅ **בוצע:** גיבוי בסיס הנתונים לפני כל פעולה.
- ✅ **בוצע:** עדכון סקריפטי המיגרציה:
  - `migrate_preferences_v1_to_v2.py` → `migrate_preferences.py` + עדכון שמות פונקציות.
  - `simple_migrate_v1_to_v2.py` → `simple_migrate_preferences.py`.
- ✅ **בוצע:** עדכון בדיקות:
  - `test_v2_system.py` → `test_preferences_system.py`.
  - תיקון התייחסויות לטבלאות V2.
- ✅ **בוצע:** ניקוי טבלת `user_data_preferences`.
- ✅ **בוצע:** בדיקת שלמות ואינטגריטי של טבלאות העדפות.
- ✅ **בוצע:** תיקון קבצי Frontend:
  - `preferences-v2.js` → `preferences.js`.
  - `preferences-v2-compatibility.js` → `preferences-compatibility.js`.
  - `preferences-v2.html` → `preferences.html`.
  - עדכון קישורים בכל העמודים (`index`, `tickers`, `executions`).
- ✅ **בוצע:** הסרת כל התייחסויות V1/V2 מדוקומנטציה:
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
- ✅ **בוצע:** עדכון קבצי תצורה (JSON, `js_map.py`, `pages.py`, `app.py`).
- ✅ **בוצע:** בדיקות נדרשות:
  - בדיקות DB (מבנה, אינדקסים, constraints).
  - בדיקות API (Endpoints, error handling, performance).
  - בדיקות Frontend (HTML, CSS, JS, קישורים).
  - בדיקות אינטגרציה מלאות.
- ✅ **בוצע:** ניהול גיבויים (DB, Backend, Frontend) לפני כל שינוי.
- ✅ **בוצע:** תיקון שגיאות SQLAlchemy mapper המופיעות בלוגים.

---

## 4. תכונות עתידיות ומודולים חדשים

### 4.1 FUTURE_DEVELOPMENT_ROADMAP – תכונות חדשות

- 🟦 **עתידי:** מערכת דוחות מתקדמת.
- 🔶 **חשוב:** אינטגרציה עם פלטפורמות נוספות.
- 🟦 **עתידי:** מערכת התראות חכמה.
- 🔶 **חשוב:** אנליטיקה מתקדמת.

### 4.2 CENTRAL_TASKS_TODO – תכונות עתידיות (עדיפות גבוהה)

- 🚨 **דחוף:** כפילות תכניות וטריידים (כפתור "שכפל", דיאלוג אישור, שימור קשרים).
- ✅ **בוצע:** מערכת תבניות מתקדמת (יצירה, שמירה, תבניות ברירת מחדל).
- ✅ **בוצע:** חישוב אוטומטי של יעד וסטופ (RR, ATR, overrides, real-time updates).
- ⚙️ **אחר (דורש שמירת View State):** Trading Journal Database Design (מבנה טבלה, קשרים, קטגוריות, חיפוש).
- 🟦 **עתידי:** מערכת התראות מתקדמת (push, email, SMS, הגדרות אישיות).
- 🔶 **חשוב:** מערכת דוחות מתקדמת (גרפים, ייצוא, שמירה).

### 4.3 CENTRAL_TASKS_TODO – תכונות עתידיות (עדיפות בינונית/נמוכה)

- ✅ **בוצע:** שדה `open_plans` לטיקרים (DB triggers, event listeners, UI, API, בדיקות).
- ✅ **בוצע:** מערכת קישור אובייקטים מתקדמת (קישורים מותאמים, פוליניווטיבה, היסטוריה).
- ✅ **בוצע:** מערכת הערות מתקדמת עם rich text.
- ⚙️ **אחר (דורש פתרון שמירת View State):** מערכת היסטוריה מפורטת לכל הפעולות (חיפוש, סינון, ייצוא).
- ✅ **בוצע:** מערכת סינון מתקדמת (סינונים מורכבים, שמירת פילטרים, שיתוף).
- 🟦 **עתידי:** מערכת חיפוש מתקדמת (Full-text, היסטוריה).
- 🔶 **חשוב:** מערכת ייצוא מתקדמת (PDF, Excel, CSV, עיצובים).
- ⚙️ **אחר (משוייך לפרויקט תגיות):** מערכת אנליטיקה לתגיות/Linked Objects/Alerts.
- ✅ **בוצע:** Field rename "Reasons" → "Strategy" (DB, API, UI, תרגום).
- ⚙️ **אחר (הרחבת מודול פרטי טיקר – עתידי):** Symbol Page ייעודי (מידע, גרפים, חדשות, אינטגרציות).
- ✅ **בוצע:** Linked Objects Modal Windows – שלב טבלה ושלב מודל עם דרישות UI, עדכוני נתונים בזמן אמת, bulk operations.
- ✅ **בוצע:** Transaction Association System (טבלת קשר, כלי bulk, ולידציה, UI).
- ⚙️ **אחר (בתהליך במסגרת מערכת הייבוא):** Account Management Functions (עריכה, מחיקה, ולידציה, היסטוריה).
- ✅ **בוצע:** Data Update Verification Across All Pages (עדכונים בזמן אמת, polling fallback, כפתורי רענון, מסכי סטטוס).
- ✅ **בוצע:** Preferences Page bug – שמירת ברירות מחדל (API file write, לוגים, בדיקות לכל סוגי ההעדפות).
- 🔶 **חשוב:** Price Data & Ticker Information API (אינטגרציות, נתונים היסטוריים, אחסון, caching, error handling).
- ⚙️ **אחר (דורש פתרון שמירת View State):** Trading Journal Implementation מלא (עורך עשיר, קבצים מצורפים, תבניות, חיפוש, אנליטיקה, ייצוא).
- ⚙️ **אחר (משוייך לפרויקט תגיות):** Tagging System נרחב (ניהול, סינון, אנליטיקה, הצעות, צבעים, היררכיות, פעולות מרובות).
- ✅ **בוצע:** Trade Alerts System (יצירה, ניהול, היסטוריה, התראות).
- 🔶 **חשוב:** Advanced Alert Types (נפח, תנאים מותאמים).
- 🟦 **עתידי:** Advanced Template Features, General Functionality Placeholders.
- ✅ **בוצע:** Top Section Spacing Enhancement (מרווח עליון קבוע, בדיקות responsiveness, תאימות header).
- 🔶 **קריטי – בתהליך:** דגשים למערכות תנאים, אסטרטגיות ותיוג (הרחבת מערכת סיבות ותנאים).

### 4.4 TRIGGERS_AND_FUTURE_FEATURES_TASKS – השלמה/דגשים נוספים

- 🔶 **קריטי – בתהליך:** הדגשת הצורך בתנאי כניסה מתקדמים, מערכת אסטרטגיות, מערכת תיוג, אימות עדכון נתונים, עמוד סימבול, חלונות מודל לפריטים מקושרים, Real-time alerts, פונקציות ניהול בדיקות, שינוי שם שדות.
- ✅ **בוצע:** הרחבה על `open_plans` (מיגרציה, מודל, API, UI, בדיקות).

---

## 5. איכות, בדיקות וכלי פיתוח

### 5.1 CENTRAL_TASKS_TODO – משימות בדיקה

- 🟧 **בוצע חלקית:** בדיקות יחידה:
  - מודלים, שירותים, API endpoints, רכיבי UI.
- 🟧 **בוצע חלקית:** בדיקות אינטגרציה:
  - בין מודולים, End-to-End, בסיס נתונים, מערכת מלאה.
- 🟧 **בוצע חלקית:** בדיקות UI/UX: _(סבב נגישות נובמבר 2025 הושלם – axe, התאמות צבעים ודוקומנטציה מעודכנת)_
  - תאימות דפדפנים, רספונסיביות, נגישות, ביצועים.

### 5.2 LINTER_IMPLEMENTATION_PLAN – אסטרטגיית ניקוי קוד

- 🟧 **בוצע חלקית:** הפחתת אזהרות `no-console` ל-300 תוך החלפתם במערכת הלוגים המאוחדת.
- 🟧 **בוצע חלקית:** טיפול ב-`class-methods-use-this` (המרה ל-static).
- 🟧 **בוצע חלקית:** טיפול ב-`require-await`, `max-len`, `no-unused-vars`, `no-shadow`.
- ✅ **בוצע:** ניקוי קבצים עם אזהרות רבות (`header-system.js`, `system-test-center*.js`, `external-data-dashboard.js`, `server-monitor.js`, `realtime-notifications-client.js`, `notifications-center.js`, `db-extradata.js`, `notifications-center-backup.js`, `console-cleanup.js`).
- ✅ **בוצע:** השלמת ניקוי 5 קבצים לחלוטין (בכל גל עבודה).
- ✅ **בוצע:** יעדי טווח בינוני וארוך:
  - הפחתת אזהרות ל-500 ואז ל-200.
  - ניקוי 15 קבצים נוספים ואז 80% מהקבצים.
  - השגת איכות קוד מקצועית תוך 60–80 שעות עבודה מצטברת.
- שימוש בפקודות `eslint --fix`, דוחות מפורטים, קונבנציות תיעוד.

### 5.3 DEVELOPMENT_TOOLS_STANDARDIZATION_TASKS – סטנדרטיזציה של כלי פיתוח

- ⚙️ **אחר (מתועד בפרויקט עמודי כלי פיתוח):** הוספת העיצוב והמבנה החדשים לכל עמודי כלי הפיתוח.
- ⚙️ **אחר (מתועד בפרויקט עמודי כלי פיתוח):** הבטחת שימוש בסגנונות המאוחדים והכפתורים הסטנדרטיים.
- ⚙️ **אחר (מתועד בפרויקט עמודי כלי פיתוח):** אינטגרציה עם מערכת ההודעות להצלחות/שגיאות.
- ⚙️ **אחר (מתועד בפרויקט עמודי כלי פיתוח):** בדיקת כפתורי copyDetailedLog בכל עמוד ואימות הפלט.
- ⚙️ **אחר (מתועד בפרויקט עמודי כלי פיתוח):** סידור סדר עבודה מומלץ (תחילה עמודים עם עדכון חלקי, לאחר מכן מלאים).

### 5.4 SERVER_TASKS_LIST – ניטור והמשך שיפורים

- 🚨 **דחוף:** לאחר השלמת המערכות הקריטיות, להתמקד במערכת Background Tasks כמשימה הבאה.
- ✅ **בוצע:** ליישר קו על הפעלת APIs אמיתיים עבור Query Optimization/External Data/Performance.
- ✅ **בוצע:** להרחיב את Unified Test Center עם נתונים אמיתיים לאחר השלמת ה-APIs.
- ✅ **בוצע:** למדוד מדדי הצלחה (זמני תגובה, שימוש CPU/זיכרון, throughput, UX, אמינות, Maintainability, Scalability).

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


