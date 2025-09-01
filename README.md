# TikTrack - מערכת ניהול טריידים

## 📋 **משימות מרכזיות**

> 📋 **משימות מערכת הנתונים החיצוניים**: [external_data_integration_server/EXTERNAL_DATA_TASKS_TODO.md](external_data_integration_server/EXTERNAL_DATA_TASKS_TODO.md)

> 📋 **אפיון מפורט**: [EXTERNAL_DATA_INTEGRATION_SPECIFICATION_v1.3.1.md](EXTERNAL_DATA_INTEGRATION_SPECIFICATION_v1.3.1.md)

> 📋 **מדריך RTL לעברית**: [documentation/RTL_HEBREW_GUIDE.md](documentation/RTL_HEBREW_GUIDE.md)

## סקירה כללית

TikTrack היא מערכת ניהול טריידים מתקדמת המאפשרת ניהול מלא של:
- חשבונות מסחר
- טריידים ועסקאות
- התראות מותאמות אישית
- תזרימי מזומן
- מידע חיצוני בזמן אמת

## תכונות מרכזיות

### 1. ניהול חשבונות
- יצירה ועריכה של חשבונות מסחר
- תמיכה במטבעות מרובים
- מעקב אחר יתרות
- סטטוס חשבון (פתוח/סגור)

### 2. ניהול טריידים
- רישום טריידים חדשים
- מעקב אחר סטטוס טריידים
- קישור לחשבונות וטיקרים
- היסטוריית עסקאות

### 3. מערכת התראות
- יצירת התראות מותאמות אישית
- תנאי התראה מתקדמים
- מעקב בזמן אמת
- התראות אוטומטיות

### 4. תזרימי מזומן
- רישום הכנסות והוצאות
- קישור לחשבונות
- סיווג תזרימים
- דוחות פיננסיים

### 5. תכנוני טריידים
- יצירה ועריכה של תכנוני טריידים
- ולידציה בזמן אמת
- בדיקת פריטים מקושרים
- מערכת ביטול מתקדמת
- שינוי טיקר (בפיתוח)

### 6. מידע חיצוני
- חיבור למקורות מידע חיצוניים
- מחירים בזמן אמת
- בדיקות מערכת מקיפות
- אינטגרציה מלאה

### 7. מערכות פיתוח מתקדמות
- **מערכת Cache חכמה**: עם TTL, dependencies ו-memory optimization
- **Query Optimization**: אופטימיזציה אוטומטית של queries
- **Performance Monitoring**: מעקב ביצועים בזמן אמת
- **Background Tasks**: משימות רקע אוטומטיות
- **Rate Limiting**: הגבלת בקשות מתקדמת
- **Error Handling**: טיפול שגיאות מתקדם
- **Health Monitoring**: בדיקות בריאות מערכת
- **Logging מתקדם**: עם correlation IDs ו-rotating logs

## ארכיטקטורה

### Backend
- **Python Flask**: שרת API מתקדם עם מערכות מובנות
- **SQLite**: בסיס נתונים עם אופטימיזציות
- **SQLAlchemy**: ORM עם Query Optimization
- **RESTful API**: ממשק תקשורת עם versioning
- **Advanced Caching**: מערכת Cache חכמה עם TTL ו-dependencies
- **Performance Monitoring**: מעקב ביצועים בזמן אמת
- **Background Tasks**: משימות רקע אוטומטיות
- **Rate Limiting**: הגבלת בקשות מתקדמת
- **Error Handling**: טיפול שגיאות מתקדם עם correlation IDs

### Development Infrastructure
- **Unified Restart System**: מערכת הפעלה מאוחדת עם מצבי פיתוח שונים
- **Cache Management**: ניהול Cache מתקדם עם מצבי פיתוח
- **Development Modes**: מצבי פיתוח שונים (רגיל, ללא Cache, ייצור)
- **Quick Cache Clear**: ניקוי Cache מהיר דרך UI ומקלדת
- **Environment Configuration**: הגדרות סביבה דינמיות
- **Smart Cache Preservation**: שמירה אוטומטית על מצב Cache בין restarts
- **Interactive Restart Modes**: מצבים אינטראקטיביים עם בחירת משתמש
- **Automatic Cache Detection**: זיהוי אוטומטי של מצב Cache נוכחי

### Frontend
- **HTML5/CSS3/JavaScript**: ממשק משתמש
- **Bootstrap 5**: עיצוב רספונסיבי
- **ארכיטקטורה מאוחדת**: פונקציות מוטמעות בעמודים
- **מערכת פילטרים**: סינון ומיון מתקדם
- **תמיכה מלאה ב-RTL**: עברית עם CSS Logical Properties

## מצבי פיתוח וניהול Cache

### סקירה כללית
המערכת כוללת מערכת מתקדמת לניהול מצבי פיתוח שונים עם ניהול Cache חכם.

### מצבי פיתוח זמינים

#### 1. **מצב פיתוח ללא Cache** (מומלץ לפיתוח פעיל)
```bash
npm run dev:no-cache
```
- Cache מבוטל לחלוטין
- כל שינוי בקוד נראה מיד
- מתאים לפיתוח פעיל
- ביצועים נמוכים יותר

#### 2. **מצב פיתוח רגיל** (Cache: 10 שניות)
```bash
npm run dev:normal
```
- Cache מופעל עם TTL של 10 שניות
- מתאים לבדיקות מהירות
- עדיין יש Cache אבל הוא מתנקה מהר

#### 3. **מצב ייצור** (Cache: 5 דקות)
```bash
npm run dev:production
```
- Cache מופעל עם TTL של 5 דקות
- ביצועים מקסימליים
- מתאים לבדיקות לפני deploy

### מערכת Restart חכמה

#### **Restart רגיל (ברירת מחדל):**
```bash
./restart                    # Quick mode + שומר על מצב Cache נוכחי
./restart quick             # Quick mode + שומר על מצב Cache נוכחי
./restart complete          # Complete mode + שומר על מצב Cache נוכחי
```

#### **שינוי מצב Cache מפורש:**
```bash
./restart --cache-mode=development    # Quick + Cache TTL: 10 שניות
./restart --cache-mode=no-cache       # Quick + Cache מבוטל
./restart --cache-mode=production     # Quick + Cache TTL: 5 דקות
./restart --preserve-cache            # שומר על מצב Cache נוכחי
```

#### **מצב אינטראקטיבי:**
```bash
./restart --interactive               # תפריט עם בחירות משתמש
./restart --status                    # מצב המערכת הנוכחי
./restart --info                      # מידע על המצבים הזמינים
```

### ניהול Cache מהיר

#### **כפתור ב-UI:**
- תפריט "הגדרות" → "נקה Cache (פיתוח)"
- כפתור אדום עם אייקון פח אשפה
- מציג הודעת טעינה בזמן הניקוי
- חוזר למצב רגיל אחרי הניקוי

#### **קיצור מקלדת:**
- `Cmd+Shift+C` (במק)
- `Ctrl+Shift+C` (בווינדוס)

#### **ניקוי ידני:**
```bash
npm run cache:clear
curl -X POST http://localhost:8080/api/v1/cache/clear
```

#### **ניקוי דרך Restart:**
```bash
./restart --cache-mode=no-cache        # Restart עם Cache מבוטל
./restart --cache-mode=development     # Restart עם Cache TTL: 10 שניות
```

### הגדרות סביבה
```bash
# מצב פיתוח
export TIKTRACK_DEV_MODE=true

# ביטול Cache
export TIKTRACK_CACHE_DISABLED=true

# הפעלת השרת
./restart quick
```

### הגדרות אוטומטיות
המערכת מזהה אוטומטית את מצב ה-Cache הנוכחי ושומרת עליו בין restarts:

- **Cache TTL: 0** → מצב NO-CACHE
- **Cache TTL: 10** → מצב DEVELOPMENT  
- **Cache TTL: 300** → מצב PRODUCTION
- **Cache TTL: אחר** → מצב CUSTOM

### שמירת מצב Cache
```bash
# שמירה אוטומטית (ברירת מחדל)
./restart                    # שומר על מצב Cache נוכחי

# שינוי מפורש
./restart --cache-mode=development    # משנה ל-10 שניות
./restart --cache-mode=no-cache       # מבטל Cache
./restart --cache-mode=production     # משנה ל-5 דקות
```

## מערכת חיבור מידע חיצוני

### סקירה כללית

מערכת חיבור המידע החיצוני מאפשרת חיבור למקורות מידע חיצוניים כמו Yahoo Finance לקבלת מחירים בזמן אמת.

### עמודי בדיקה

- `/external-data-test` - בדיקת מידע חיצוני
- `/models-test` - בדיקת מודלים
- `/system-stats-test` - בדיקת סטטיסטיקות מערכת
- `/integration-test` - בדיקת אינטגרציה

### תכונות מרכזיות

1. **בדיקת מידע חיצוני**:
   - טעינת טיקרים מבסיס הנתונים
   - בדיקת חיבור לבסיס הנתונים
   - הבאת מחירים בודדים ומרובים
   - תצוגת תוצאות ולוגים

2. **בדיקת מודלים**:
   - בדיקת מודל העדפות
   - בדיקת מודל מחיר
   - בדיקת מודל טיקר
   - ולידציה של נתונים ומבנה

3. **בדיקת סטטיסטיקות מערכת**:
   - שימוש זיכרון ודליפות
   - שימוש CPU וצווארי בקבוק
   - ביצועי בסיס נתונים ורשת
   - מידע מערכת ופקודות מותאמות

4. **בדיקת אינטגרציה**:
   - חיבור API
   - אינטגרציה בסיס נתונים
   - אינטגרציה UI
   - אינטגרציה פונקציות, סגנונות וסקריפטים

## התקנה והפעלה

### דרישות מערכת
- Python 3.9+
- SQLite3
- דפדפן מודרני

### התקנה
```bash
# שכפול הפרויקט
git clone [repository-url]
cd TikTrackApp

# התקנת תלויות
pip install -r requirements.txt

# הפעלת השרת
./start_dev.sh
```

### הפעלת השרת
```bash
# הפעלה מהירה (מומלץ לפיתוח)
./restart quick

# הפעלה מלאה (מומלץ לבעיות)
./restart complete

# הפעלה אינטראקטיבית
./restart --interactive

# בדיקת מצב
./restart --status
```

### גישה למערכת
- **ממשק משתמש**: http://127.0.0.1:8080
- **API**: http://127.0.0.1:8080/api/v1/
- **בדיקות מידע חיצוני**: http://127.0.0.1:8080/external-data-test

## מבנה הפרויקט

```
TikTrackApp/
├── Backend/                    # שרת Python Flask
│   ├── models/                # מודלים של בסיס הנתונים
│   ├── routes/                # נתיבי API
│   ├── services/              # שירותים עסקיים
│   ├── config/                # הגדרות מערכת
│   └── db/                    # בסיס הנתונים
├── trading-ui/                # ממשק משתמש
│   ├── *.html                 # עמודי HTML
│   ├── scripts/               # קבצי JavaScript
│   ├── styles/                # קבצי CSS
│   └── external_data_integration_client/  # מערכת מידע חיצוני
├── documentation/             # דוקומנטציה
├── scripts/                   # סקריפטי הפעלה
│   ├── restart                # מערכת restart מאוחדת
│   ├── restart_server_quick.sh    # restart מהיר
│   └── restart_server_complete.sh # restart מלא
└── backups/                   # גיבויים
```

## ארכיטקטורה מתוקנת

### עקרון יסוד: פונקציות מוטמעות בעמודים

לאחר תיקון בעיות יסוד, המערכת עובדת לפי העיקרון הבא:

**כל עמוד HTML מכיל את הפונקציות שלו ישירות בסוף הקובץ**, ולא בקריאות לקבצים חיצוניים. זה מבטיח:

1. **עצמאות מלאה**: כל עמוד עובד ללא תלות בקבצים חיצוניים
2. **ביצועים טובים יותר**: אין צורך בטעינת קבצים נוספים
3. **תחזוקה פשוטה**: כל הפונקציות נמצאות במקום אחד
4. **אין כפילויות**: כל פונקציה מוגדרת פעם אחת בלבד

## API Reference

### נתיבי API ראשיים
- `GET /api/v1/accounts/` - רשימת חשבונות
- `GET /api/v1/trades/` - רשימת טריידים
- `GET /api/v1/alerts/` - רשימת התראות
- `GET /api/v1/cash_flows/` - רשימת תזרימי מזומן
- `GET /api/v1/tickers/` - רשימת טיקרים

### נתיבי בדיקה
- `GET /external-data-test` - בדיקת מידע חיצוני
- `GET /models-test` - בדיקת מודלים
- `GET /system-stats-test` - בדיקת סטטיסטיקות מערכת
- `GET /integration-test` - בדיקת אינטגרציה

## פיתוח ותחזוקה

### הוספת עמוד חדש
1. צור קובץ HTML חדש
2. הוסף את הפונקציות בסוף הקובץ
3. הוסף נתיב בשרת
4. בדוק שהעמוד עובד

### הוספת פונקציות חדשות
1. הוסף את הפונקציה בסוף העמוד הרלוונטי
2. הוסף event listener בפונקציית האתחול
3. הוסף לוגים לניטור
4. בדוק שהפונקציה עובדת

### ניהול מצבי פיתוח
1. **בחירת מצב Cache:**
   ```bash
   npm run dev:development    # Cache TTL: 10 שניות
   npm run dev:no-cache       # Cache מבוטל
   npm run dev:production     # Cache TTL: 5 דקות
   ```

2. **Restart עם שמירת מצב:**
   ```bash
   ./restart                   # שומר על מצב Cache נוכחי
   ./restart --cache-mode=development  # משנה למצב פיתוח
   ```

3. **בדיקת מצב:**
   ```bash
   ./restart --status          # מצב המערכת
   ./restart --info            # מידע על מצבים
   ```

## בדיקות ואיכות

### בדיקות אוטומטיות
כל עמוד כולל בדיקות אוטומטיות:
- בדיקת טעינה
- בדיקת פונקציות
- בדיקת UI
- בדיקת נתונים

### לוגים וניטור
```javascript
console.log('🔄 Loading data...');
console.log('✅ Data loaded successfully');
console.log('❌ Error loading data:', error);
```

## סיכום

הארכיטקטורה המתוקנת מבטיחה:

- ✅ **עצמאות מלאה** לכל עמוד
- ✅ **ביצועים מיטביים** ללא טעינות מיותרות
- ✅ **תחזוקה פשוטה** עם קוד מאורגן
- ✅ **אין כפילויות** בפונקציות
- ✅ **בדיקות מקיפות** בכל עמוד
- ✅ **לוגים מפורטים** לניטור
- ✅ **מערכת Cache חכמה** עם שמירה אוטומטית על מצב
- ✅ **מערכת Restart מאוחדת** עם שמירת מצב Cache
- ✅ **מצבי פיתוח גמישים** עם מעבר קל בין מצבים
- ✅ **ניהול Cache מתקדם** דרך UI, מקלדת ו-command line

### תכונות חדשות נוספו:
- 🧠 **שמירה אוטומטית על מצב Cache** בין restarts
- 🔄 **מערכת Restart חכמה** עם זיהוי אוטומטי של מצב
- 🎮 **מצב אינטראקטיבי** לבחירת משתמש
- ⚡ **ניקוי Cache מהיר** דרך UI ומקלדת
- 🔧 **ניהול סביבה דינמי** עם environment variables

המערכת מוכנה לשימוש ולפיתוח עתידי!

---

**תאריך עדכון אחרון**: 1 בספטמבר 2025  
**גרסה**: 2.0.1.0  
**מפתח**: TikTrack Development Team
