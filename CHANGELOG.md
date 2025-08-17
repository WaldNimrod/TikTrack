# Changelog - TikTrack

כל השינויים המשמעותיים בפרויקט מתועדים בקובץ זה.

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
