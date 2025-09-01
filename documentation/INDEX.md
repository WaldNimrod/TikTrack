# TikTrack - תיעוד מערכת

## סקירה כללית

TikTrack היא מערכת ניהול מסחר מתקדמת המאפשרת מעקב אחר טריידים, ניהול חשבונות, התראות מתקדמות ואינטגרציה עם נתונים חיצוניים.

## תכונות מרכזיות

### ניהול טריידים
- **תכנוני מסחר**: יצירה וניהול תכניות מסחר
- **טריידים**: מעקב אחר עסקאות פעילות וסגורות
- **ביצועים**: ניהול ביצועי עסקאות
- **תזרימי מזומן**: מעקב אחר תזרימי כספים

### ניהול חשבונות
- **חשבונות**: ניהול חשבונות מרובים
- **טיקרים**: מעקב אחר מניות וניירות ערך
- **הערות**: מערכת הערות מתקדמת

### התראות מתקדמות
- **התראות**: מערכת התראות מותאמת אישית
- **תנאים**: הגדרת תנאי התראה מתקדמים
- **מעקב**: מעקב אחר התראות פעילות

### הגדרות מערכת
- **העדפות**: הגדרות מערכת מותאמות אישית
- **פילטרים**: מערכת פילטרים גלובלית
- **ממשק**: ממשק משתמש אחיד ומתקדם

## ארכיטקטורה

### Frontend
- **HTML**: דפים מותאמים אישית לכל מודול
- **JavaScript**: סקריפטים מודולריים
- **CSS**: עיצוב אחיד ומתקדם
- **RTL**: תמיכה מלאה בעברית עם CSS Logical Properties

### Backend
- **Python**: Flask framework
- **Database**: SQLite עם SQLAlchemy ORM
- **API**: RESTful API endpoints

### נתונים חיצוניים
- **Yahoo Finance**: נתוני מניות בזמן אמת
- **Google Finance**: נתונים פיננסיים
- **Alpha Vantage**: נתוני שוק מתקדמים

## תיקונים אחרונים (אוגוסט 2025)

### בעיות שתוקנו:
1. **שגיאת מערכת פילטרים**: `window.filterSystem.resetFilters is not a function`
2. **סקריפטים חסרים**: הוספת קבצים חיוניים לעמוד ההעדפות
3. **קוד כפול**: ניקוי קוד כפול ופגום
4. **אתחול שגוי**: תיקון אתחול מערכות
5. **סטטוסי טיקרים לא נכונים**: הפעלת טריגרים אוטומטיים לעדכון סטטוסים
6. **צ'קבוקסים ב-RTL**: תיקון מיקום צ'קבוקסים בעברית עם CSS Logical Properties

### שינויים שבוצעו:
- הוספת `filter-system.js`, `main.js`, `tables.js` לעמוד ההעדפות
- תיקון סדר הטעינה של הסקריפטים
- ניקוי קוד כפול בפונקציה `resetToDefaults`
- הוספת פונקציות עזר גלובליות ב-`header-system.js`
- תיקון אתחול מערכת הפילטרים
- **הפעלת טריגרים אוטומטיים** לעדכון סטטוסי טיקרים
- **הוספת טריגרים למודל TradePlan** לעדכון סטטוסי טיקרים
- **תיקון פונקציית reactivateTicker** להחזרת סטטוס 'open' במקום 'closed'
- **יצירת סקריפט תיקון** לסטטוסי טיקרים קיימים

### פונקציות חדשות שנוספו:
- `getVisibleContainers()` - קבלת כל הקונטיינרים הנראים
- `showAllRecordsInTable()` - הצגת כל הרשומות בטבלה
- `updateTableCount()` - עדכון מספר הרשומות בטבלה
- `resetFiltersManually()` - איפוס ידני של פילטרים (גיבוי)
- `handleElementNotFound()` - טיפול במקרה שאלמנט לא נמצא
- `handleDataLoadError()` - טיפול בשגיאות טעינת נתונים
- `tryLoadData()` - ניסיון לטעינת נתונים
- **טריגרים אוטומטיים** לעדכון סטטוסי טיקרים (Trade, TradePlan)
- **סקריפט תיקון סטטוסים** - `fix_ticker_statuses.py`
- **מדריך RTL מקיף** - `RTL_HEBREW_GUIDE.md` עם דוגמאות קוד ופתרונות

## תיעוד מפורט

### מערכות עיקריות
- [מערכת העדפות](features/preferences/README.md) - הגדרות מערכת מותאמות אישית
- [מערכת פילטרים](features/filter-system/README.md) - פילטרים גלובליים
- [מערכת התראות](features/alerts/README.md) - התראות מתקדמות
- [מערכת חשבונות](features/accounts/README.md) - ניהול חשבונות
- [מערכת טריידים](features/trades/README.md) - ניהול טריידים
- [מערכת נתונים חיצוניים](features/external-data/README.md) - אינטגרציה עם נתונים חיצוניים
- [מערכת RTL](RTL_HEBREW_GUIDE.md) - תמיכה מלאה בעברית ו-RTL

### פיתוח
- [הגדרת פיתוח](development/README.md) - הגדרת סביבת פיתוח
- [API Reference](api/README.md) - תיעוד API
- [Database Schema](database/README.md) - מבנה בסיס הנתונים
- [Testing](testing/README.md) - מדריך בדיקות
- [מדריך RTL לעברית](RTL_HEBREW_GUIDE.md) - מדריך מקיף לעבודה עם RTL בעברית
- [מערכת הכפתורים המרוכזת](frontend/button-system.md) - ניהול מרכזי של כפתורי פעולה

### שרת
- [Server Setup](server/README.md) - הגדרת שרת
- [Deployment](server/DEPLOYMENT.md) - פריסת מערכת

### משתמשים
- [User Guide](user/README.md) - מדריך משתמש
- [Troubleshooting](user/TROUBLESHOOTING.md) - פתרון בעיות

## התקנה והפעלה

### דרישות מערכת
- Python 3.9+
- Node.js 14+
- SQLite 3

### התקנה מהירה
```bash
# Clone repository
git clone <repository-url>
cd TikTrackApp

# Install dependencies
pip install -r requirements.txt

# Start development server
./start_dev.sh
```

### הפעלת שרת
```bash
# Development server
./start_dev.sh

# Production server
./start_optimized.sh
```

## פיתוח

### מבנה פרויקט
```
TikTrackApp/
├── Backend/                 # Backend Python code
│   ├── routes/             # API routes
│   ├── models/             # Database models
│   ├── services/           # Business logic
│   └── utils/              # Utilities
├── trading-ui/             # Frontend code
│   ├── scripts/            # JavaScript files
│   ├── styles/             # CSS files
│   └── *.html              # HTML pages
├── documentation/          # Documentation
└── external_data_integration_server/  # External data server
```

### כללי פיתוח
- **קוד נקי**: עקוב אחר כללי קוד נקי
- **תיעוד**: תיעד כל פונקציה וקובץ
- **בדיקות**: כתוב בדיקות לכל פונקציונליות חדשה
- **תאימות**: ווד תאימות עם דפדפנים שונים

### תיקון באגים
1. **זיהוי הבעיה**: בדוק לוגים וקונסול
2. **מציאת מקור**: חפש בקוד המקור
3. **תיקון**: תקן את הבעיה
4. **בדיקה**: בדוק שהתיקון עובד
5. **תיעוד**: עדכן תיעוד אם צריך

## תמיכה

### בעיות נפוצות
- **שגיאות JavaScript**: בדוק קונסול דפדפן
- **בעיות שרת**: בדוק לוגי שרת
- **בעיות נתונים**: בדוק בסיס נתונים

### קבלת עזרה
- בדוק תיעוד רלוונטי
- חפש בעיות דומות
- פנה לצוות הפיתוח

## רישיון

פרויקט זה מוגן תחת רישיון MIT. ראה קובץ LICENSE לפרטים.

## צוות

- **מפתח ראשי**: Nimrod
- **ארכיטקט**: TikTrack Team
- **תיעוד**: Development Team

---

**גרסה**: 1.3.1  
**עדכון אחרון**: אוגוסט 2025  
**סטטוס**: יציב ופעיל
