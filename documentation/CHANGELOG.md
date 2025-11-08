# Changelog - TikTrack Application

All notable changes to this project will be documented in this file.

## [2.0.5.1] - 2025-11-08

### Changed
- **Notes Entity Details** – חלון "פרטי הערה" משלים כעת תצוגה דו-עמודית: התוכן מסונן ומוצג בעמודה ייעודית, קבצים מצורפים מוצגים עם תצוגה מקדימה, שם מקוצר וטיפ מידע, והישות המקושרת נשלפת ומעוצבת באמצעות `FieldRendererService.renderLinkedEntity`.
- **EntityDetailsService** – נתוני הערה כוללים עתה את המטא-דאטה של ההיקשר (סוג ומזהה), נתוני הקובץ המצורף, סיכום ישות מקושרת ומערך `linked_items` מובנה, כך שה-Frontend אינו נדרש לבצע העשרות ידניות.

### Enhanced
- **User Tables** – כל 8 טבלאות המשתמש המרכזיות הועברו לסטנדרט `table table-hover`, ליישור אפקט הצפת השורות עם הטבלה במודול הפריטים המקושרים ולהבטחת חוויית ריחוף אחידה במערכת.

---

## [2.0.8] - 2025-10-15

### Added
- **Dynamic Service Cache Clearing** - מערכת סריקה אוטומטית של כל Service Caches במערכת
- **Comprehensive ORPHAN_KEYS Inventory** - הרחבה ל-6 קטגוריות: state, preferences, auth, testing, notifications, app
- **Post-Clear Validation System** - בדיקה אוטומטית מקיפה אחרי כל ניקוי מטמון
- **Detailed Reporting System** - דוחות מפורטים עם JSON export והעתקה ללוח
- **Enhanced Cache Clearing UI** - checkbox ולידציה אופציונלית בעמוד ניהול המטמון

### Enhanced
- **Cache Clearing Levels** - 4 רמות ניקוי משופרות:
  - Light (25%): Memory + Service Caches בלבד
  - Medium (60%): + localStorage/IndexedDB/Backend cache
  - Full (100%): + כל ה-Orphan Keys (כולל הגדרות משתמש)
  - Nuclear (150%+): כל localStorage/IndexedDB כולל נתונים לא של TikTrack

### Changed
- **clearServiceCaches()** - המרה מרשימה סטטית לסריקה דינמית של window objects
- **ORPHAN_KEYS** - הוספת קטגוריות חדשות: notifications, app + 5 מפתחות נוספים
- **clearAllCache()** - תמיכה בפרמטר `validateAfter` לולידציה אופציונלית
- **system-management.html** - הוספת checkbox ולידציה (כבוי כברירת מחדל)
- **Header cache button** - שינוי ברירת מחדל מ-Medium ל-Full

### Technical Improvements
- **Validation Functions**:
  - `validateCacheClearing()` - בדיקת תוצאות ניקוי
  - `collectCacheStats()` - איסוף סטטיסטיקות מטמון
  - `countServiceCaches()` - ספירת service cache entries
- **Reporting Functions**:
  - `copyCacheReportToClipboard()` - העתקת דוחות JSON ללוח
  - Enhanced `detailedReport` object עם מידע מקיף

### Documentation
- **Updated:** `CACHE_IMPLEMENTATION_GUIDE.md` - סקשן חדש על מערכת ניקוי מתקדמת
- **Updated:** `GENERAL_SYSTEMS_LIST.md` - עדכון רשימת מערכות מטמון
- **New:** `CACHE_CLEARING_GUIDE.md` - מדריך מפורט לשימוש במערכת
- **Updated:** `README.md` - תיעוד המערכת המשופרת

---

## [2.0.7] - 2025-10-14

### Added
- **תמיכה בשיוך עסקאות גמיש:** עסקאות (Executions) יכולות להישמר במצב זמני עם שיוך לטיקר בלבד, או במצב מלא עם שיוך לטרייד
- **Endpoint חדש:** `GET /api/executions/pending-assignment` - מחזיר עסקאות המשוייכות לטיקר בלבד
- **Widget דף הבית:** קומפוננטה חדשה המציגה עסקאות הדורשות שיוך לטרייד
- **רדיו באטן בטפסים:** בחירה דינמית בין שיוך לטיקר או לטרייד בממשק הוספה/עריכה
- **עמודת "קשור ל":** בטבלת העסקאות, מציגה באופן ויזואלי את סוג השיוך

### Changed
- **מבנה טבלת Executions:** 
  - הוספת שדה `ticker_id` (NULLABLE, FK)
  - שינוי `trade_id` מ-NOT NULL ל-NULLABLE
  - שינוי `trading_account_id` ל-NULLABLE (חובה רק עם trade_id)
- **ממשק הוספה/עריכה:** רדיו באטן לבחירת סוג שיוך עם שדות דינמיים
- **API validation:** בדיקת XOR constraint (ticker_id או trade_id, לא שניהם)
- **תצוגת טבלה:** שימוש בפורמט אחיד `linked_display` לכל העסקאות

### Database
- **Migration:** `20251014_executions_flexible_association.py`
  - 6 עסקאות קיימות הומרו בהצלחה
  - CHECK constraint: `(ticker_id IS NOT NULL AND trade_id IS NULL) OR (ticker_id IS NULL AND trade_id IS NOT NULL)`
  - Foreign Keys ל-tickers, trades, trading_accounts

### Frontend
- **קבצים חדשים:**
  - `trading-ui/scripts/pending-executions-widget.js` - Widget לדף הבית
- **קבצים מעודכנים:**
  - `trading-ui/executions.html` - מודלי הוספה/עריכה עם רדיו באטן
  - `trading-ui/scripts/executions.js` - לוגיקת שיוך גמיש
  - `trading-ui/index.html` - אינטגרציה של widget
  - `trading-ui/styles-new/06-components/_linked-items.css` - סטיילים חדשים

### Backward Compatibility
- ✅ כל העסקאות הקיימות עם `trade_id` ממשיכות לעבוד ללא שינוי
- ✅ ממשק קיים תומך בשני מצבי השיוך
- ✅ API מחזירה פורמט אחיד לכל המצבים

---

## [2.0.6] - 2025-10-13

### Changed
- UI improvements for cash flows, executions, and trade plans
- Updated linked items badges and page headers
- CRUD UI fixes and enhancements

---

_For complete version history, see git tags and commits._

