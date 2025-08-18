# Changelog - TikTrack

כל השינויים המשמעותיים בפרויקט מתועדים בקובץ זה.

## [2025-08-19] - מערכת בדיקות מקיפה

### ✅ הוספו
- **מערכת בדיקות מאורגנת** - תיקייה ייעודית `testing_suite/` עם מבנה מקצועי
- **בדיקות Unit** - 5 בדיקות למודלים (Ticker, Account, Trade, Alert)
- **בדיקות Integration** - 10 בדיקות ל-API endpoints
- **בדיקות E2E** - 9 בדיקות לזרימות עבודה מלאות
- **Makefile** - פקודות נוחות להרצת בדיקות
- **תיעוד בדיקות** - README מפורט ומדריכי הגדרה
- **קבצי הגדרות** - pytest.ini, test_config.py, requirements.txt
- **דוחות כיסוי** - HTML reports עם ניתוח מפורט

### 🔧 שונה
- **ארגון קבצים** - העברת כל קבצי הבדיקות לתיקייה ייעודית
- **מבנה תיקיות** - חלוקה ל-unit_tests, integration_tests, e2e_tests
- **הגדרות pytest** - עדכון conftest.py לעבודה מהמיקום החדש
- **תיעוד ראשי** - עדכון README.md עם מידע על מערכת הבדיקות

### 🐛 תוקן
- **Import errors** - תיקון נתיבים למודלים
- **Database fixtures** - תיקון הגדרות בסיס נתונים לבדיקות
- **Test structure** - התאמת בדיקות למבנה המודלים האמיתי

### 📁 קבצים חדשים
- `Backend/testing_suite/` - תיקיית מערכת הבדיקות המלאה
- `Backend/testing_suite/README.md` - תיעוד מפורט
- `Backend/testing_suite/Makefile` - פקודות להרצה
- `Backend/testing_suite/requirements.txt` - תלויות בדיקות
- `Backend/testing_suite/configs/test_config.py` - הגדרות מתקדמות
- `Backend/README_TESTING.md` - סיכום בדיקות
- `Backend/testing_suite/documentation/TESTING_SUITE_SETUP.md` - מדריך הגדרה

### 📁 קבצים שעודכנו
- `README.md` - הוספת מידע על מערכת הבדיקות
- `CHANGELOG.md` - קובץ זה

### 🔄 מיגרציות בסיס נתונים
- **בסיס נתונים שוחזר** - עם המבנה העדכני
- **כל הבדיקות עובדות** - 23 בדיקות עוברות, 2 דילוגו

## [2025-08-19] - איחוד סוגי טריידים

### ✅ הוספו
- **סקריפט מיגרציה** - `update_trade_types.py` לעדכון נתונים קיימים
- **תיעוד מקיף** - `TRADE_TYPES_STANDARDIZATION.md` לתהליך האיחוד
- **תאימות לאחור** - תמיכה בערכים ישנים עם המרה אוטומטית

### 🔧 שונה
- **איחוד ערכי סוגי טריידים** לשלושה ערכים קבועים:
  - `swing` = סווינג (ברירת מחדל)
  - `investment` = השקעה
  - `passive` = פאסיבי
- **עדכון ברירות מחדל** במודלים:
  - `Trade.type` מ-`buy` ל-`swing`
  - `TradePlan.investment_type` מ-`long` ל-`swing`
- **עדכון קבצי HTML** - ערכי `value` מ-`invest`/`pasive` ל-`investment`/`passive`
- **עדכון JavaScript** - מיפוי ערכים ווולידציה

### 🐛 תוקן
- **אי-עקביות בין קבצים** - איחוד ערכים בין HTML ו-JavaScript
- **מיפוי ערכים שגוי** - תיקון המרה בין עברית לאנגלית
- **וולידציה לא נכונה** - עדכון רשימת ערכים תקינים

### 📁 קבצים חדשים
- `Backend/update_trade_types.py` - סקריפט מיגרציה (הוסר לאחר השימוש)

### 📁 קבצים שעודכנו
- `Backend/models/trade.py` - עדכון ברירת מחדל
- `Backend/models/trade_plan.py` - עדכון ברירת מחדל
- `trading-ui/database.html` - עדכון ערכי HTML
- `trading-ui/tracking.html` - עדכון ערכי HTML
- `trading-ui/scripts/trades.js` - עדכון מיפוי וולידציה
- `DATABASE_CHANGES_AUGUST_2025.md` - הוספת תיעוד איחוד סוגי טריידים

### 🔄 מיגרציות בסיס נתונים
- **10 רשומות trades** עודכנו מ-`buy` ל-`swing`
- **3 רשומות trade_plans** עודכנו מ-`long` ל-`swing`
- **גיבוי אוטומטי** נוצר לפני השינויים
- **כל הבדיקות עוברות** בהצלחה

## [2025-08-18] - שיפורי ממשק ופיצול קוד

### ✅ הוספו
- **קובץ trades.js** - פיצול פונקציות טריידים לקובץ נפרד
- **עיצוב כפתורי שמירה** - כפתורים מעוצבים עם צבע הלוגו ורקע לבן
- **איקונים לכפתורים** - איקון שמירה (💾) לכפתורי שמירה
- **תיעוד מקיף** - עדכון כל קבצי התיעוד עם השינויים האחרונים
- **קובץ תיעוד בסיס נתונים** - `DATABASE_CHANGES_AUGUST_2025.md`

### 🔧 שונה
- **מבנה בסיס הנתונים** - הסרת שדה `opened_at` והחלפתו ב-`created_at`
- **ערכי סוגי טריידים** - הגבלה לשלושה סוגים: `swing`, `invest`, `pasive`
- **ערכי סטטוס** - תיקון איות מ-`canceled` ל-`cancelled`
- **מבנה טופסי טריידים** - סידור מחדש של שדות לנוחות המשתמש
- **מרווחים בטופסים** - צמצום מרווחים מ-`mb-3` ל-`mb-2`

### 🐛 תוקן
- **בעיית רשימת תוכניות** - תיקון טעינת תוכניות טרייד בטופסים
- **בעיית שמירת נתונים** - תיקון בעיות שמירה בעריכת טריידים
- **בעיית תצוגת נתונים** - הצגת שמות חשבונות וטיקרים במקום מזהה
- **בעיית סוגי טריידים** - הסרת ערכים לא תקינים מהבסיס נתונים

### 📁 קבצים חדשים
- `trading-ui/scripts/trades.js` - פונקציות ייעודיות לטריידים
- `DATABASE_CHANGES_AUGUST_2025.md` - תיעוד שינויים בבסיס הנתונים

### 📁 קבצים שעודכנו
- `trading-ui/tracking.html` - עדכון טופסי טריידים ועיצוב
- `trading-ui/database.html` - עדכון טופסי טריידים ועיצוב
- `trading-ui/styles/styles.css` - הוספת סגנונות לכפתורי שמירה
- `README.md` - עדכון תיעוד ראשי
- `trading-ui/docs/UI_DOCUMENTATION.md` - עדכון תיעוד UI
- `trading-ui/scripts/README_GRID_SYSTEM.md` - הוספת תיעוד trades.js
- `CHANGELOG.md` - קובץ זה

### 🔄 מיגרציות בסיס נתונים
- `remove_opened_at_column.py` - הסרת עמודת `opened_at`
- `update_trade_dates.py` - עדכון תאריכים קיימים
- `update_status_values.py` - עדכון ערכי סטטוס

## [2025-08-18] - מערכת הערות מלאה

## [2025-08-18] - מערכת הערות מלאה

### ✅ הוספו
- **דף הערות מלא** - `trading-ui/notes.html` עם טבלה, מודלים ועורך טקסט
- **מערכת קבצים** - העלאה, שמירה ומחיקה של קבצים מצורפים
- **עורך טקסט עשיר** - עם כפתורי עיצוב בטופסי הוספה ועריכה
- **שילוב בתפריט** - הוספת "הערות" לתפריט הניווט הראשי
- **מערכת פיתוח משופרת** - `dev_server.py` עם auto-reload
- **מערכת migrations** - `migrations_manager.py` לניהול שינויים בבסיס הנתונים
- **שיפור מבנה בסיס הנתונים** - שינוי מ-`account_id`, `trade_id`, `trade_plan_id` ל-`related_type_id`, `related_id`

### 🔧 שונה
- **מבנה בסיס הנתונים** - הוספת טבלת `note_relation_types` ושינוי מבנה `notes`
- **API endpoints** - הוספת endpoints לקבצים וניהול הערות
- **תפריט ניווט** - הוספת "הערות" לתפריט הראשי
- **סקריפטי הפעלה** - שיפור `start_dev.sh` עם auto-reload

### 🐛 תוקן
- **בעיות יציבות שרת** - שיפור עם Waitress ו-auto-reload
- **בעיות טעינת קבצים** - תיקון CORS ו-FormData
- **בעיות SQLAlchemy** - הוספת מודל `NoteRelationType`

### 📁 קבצים חדשים
- `trading-ui/notes.html` - דף ההערות הראשי
- `Backend/dev_server.py` - שרת פיתוח עם auto-reload
- `Backend/migrations_manager.py` - מערכת migrations
- `Backend/models/note_relation_type.py` - מודל סוגי קשרים
- `NOTES_SYSTEM_README.md` - תיעוד מערכת ההערות
- `CHANGELOG.md` - קובץ זה

### 📁 קבצים שעודכנו
- `trading-ui/scripts/notes.js` - לוגיקת JavaScript מלאה
- `trading-ui/scripts/app-header.js` - הוספת "הערות" לתפריט
- `Backend/routes/api/notes.py` - API endpoints מלאים
- `Backend/models/note.py` - מודל SQLAlchemy מעודכן
- `Backend/models/__init__.py` - ייבוא המודלים החדשים
- `Backend/app.py` - רישום blueprints
- `Backend/routes/pages.py` - הוספת route לדף הערות
- `Backend/README_SERVER_STABILITY.md` - עדכון תיעוד

## [2025-08-17] - שיפורי יציבות שרת

### ✅ הוספו
- **Waitress Server** - שרת יציב יותר מ-Flask development server
- **Auto-Monitoring System** - מנטור אוטומטי עם health checks
- **Caffeinate Integration** - מניעת שינה של המערכת
- **Health Check Endpoint** - `/api/health` לבדיקת בריאות השרת

### 🔧 שונה
- **סקריפטי הפעלה** - שיפור עם caffeinate ו-monitoring
- **הגדרות SQLite** - שיפור timeout ו-WAL mode
- **הגדרות Flask** - כיבוי debug mode ו-reloader

## [2025-08-16] - מערכת בסיסית

### ✅ הוספו
- **דף בסיס נתונים** - תצוגת כל הטבלאות
- **API בסיסי** - endpoints לכל הטבלאות
- **מערכת פילטרים** - פילטרים מתקדמים לכל הדפים
- **תפריט ניווט** - תפריט ראשי עם כל הדפים

---

## פורמט

הקובץ הזה עוקב אחרי [Keep a Changelog](https://keepachangelog.com/) ומשתמש ב-[Semantic Versioning](https://semver.org/).

### סוגי שינויים
- `✅ הוספו` - תכונות חדשות
- `🔧 שונה` - שינויים בתכונות קיימות
- `🐛 תוקן` - תיקוני באגים
- `🚧 בעיות ידועות` - בעיות שטרם נפתרו
