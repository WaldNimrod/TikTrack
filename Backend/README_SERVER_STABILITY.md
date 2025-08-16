# TikTrack Server Stability Guide - Version 2.0
# מדריך יציבות השרת - גרסה 2.0

## 🎯 זיכרון קבוע - נקודות קריטיות לכל צט חדש

### ⚡ תהליך העבודה הנכון - תמיד להתחיל כאן:
1. **הפעלת השרת**: `cd Backend && ./run_monitored.sh`
2. **בדיקת בריאות**: `curl http://localhost:8080/api/health`
3. **בנייה לפי ארכיטקטורה**: Models → Services → Routes → App
4. **בדיקת כל API**: GET, POST, PUT, DELETE
5. **הפרדה נכונה**: לא לכתוב routes ב-app.py - רק blueprints!

### 🔒 זיכרון קבוע - זה עובד מושלם:
- ✅ **הארכיטקטורה החדשה עובדת מושלם**
- ✅ **השרת יציב עם המנטור האוטומטי**
- ✅ **כל CRUD operations עובדים**
- ✅ **הפורט הוא 8080 בלבד**
- ✅ **תמיד להשתמש ב-./run_monitored.sh**

### 🚨 אזהרות חשובות:
- **אל תכתוב routes ישירות ב-app.py** - השתמש רק ב-blueprints!
- **אל תשנה את הפורט** - תמיד 8080
- **אל תפעיל ללא מנטור** - תמיד ./run_monitored.sh
- **אל תערבב ארכיטקטורות** - השתמש רק בחדשה

### 📋 בדיקות מהירות:
```bash
# 1. הפעלת השרת
cd Backend && ./run_monitored.sh

# 2. בדיקת בריאות
curl http://localhost:8080/api/health

# 3. בדיקת API חדש
curl http://localhost:8080/api/v1/accounts/

# 4. בדיקת CRUD מלא
curl -X POST http://localhost:8080/api/v1/accounts/ -H "Content-Type: application/json" -d '{"name":"חשבון בדיקה","currency":"USD","status":"active"}'
```

---

## 🏗️ ארכיטקטורה חדשה - Version 2.0

### ✅ מימוש שהושלם
- **ארכיטקטורה מודולרית**: שימוש ב-Flask Blueprints
- **API חדש**: כל הנתיבים משתמשים ב-`/api/v1/` prefix
- **שכבת שירות**: הפרדת לוגיקה עסקית לשירותים נפרדים
- **מודלים**: SQLAlchemy ORM עם יחסים נכונים
- **תיעוד מקיף**: הערות מפורטות בכל הקבצים

### 📁 מבנה קבצים חדש
```
Backend/
├── app.py                          # אפליקציה ראשית עם רישום blueprints
├── routes/api/
│   ├── accounts.py                 # API חשבונות (מימוש מלא)
│   ├── tickers.py                  # API טיקרים
│   ├── trades.py                   # API טריידים
│   ├── trade_plans.py              # API תוכניות טרייד
│   ├── alerts.py                   # API התראות
│   ├── cash_flows.py               # API תזרימי מזומנים
│   ├── notes.py                    # API הערות
│   └── executions.py               # API ביצועים
├── services/
│   ├── account_service.py          # לוגיקה עסקית חשבונות (מימוש מלא)
│   └── ...                         # שירותים נוספים
├── models/
│   ├── account.py                  # מודל חשבונות (מימוש מלא)
│   └── ...                         # מודלים נוספים
└── config/
    └── database.py                 # הגדרות בסיס נתונים
```

### 🔄 API Endpoints חדשים
- `GET /api/v1/accounts/` - קבלת כל החשבונות
- `GET /api/v1/accounts/<id>` - קבלת חשבון ספציפי
- `POST /api/v1/accounts/` - יצירת חשבון חדש
- `PUT /api/v1/accounts/<id>` - עדכון חשבון
- `DELETE /api/v1/accounts/<id>` - מחיקת חשבון
- `GET /api/v1/accounts/<id>/stats` - סטטיסטיקות חשבון

## 🚀 אופציות הפעלה יציבות

### אופציה 1: Monitored Server (מומלצת ביותר - חדש!)
```bash
# הפעלה עם מנטור אוטומטי ו-caffeinate
./run_monitored.sh

# או הפעלה ישירה של המנטור
python3 monitor_server.py
```

### אופציה 2: Waitress (יציב)
```bash
# הפעלה עם caffeinate למניעת שינה
./run_stable.sh

# או הפעלה ישירה
python3 run_waitress.py
```

### אופציה 3: Flask משופר
```bash
# הפעלה עם caffeinate
caffeinate -dims python3 app.py

# או הפעלה ישירה
python3 app.py
```

## ⚙️ שיפורים שבוצעו

### 1. הגדרות SQLite משופרות
- `timeout=30.0` - timeout ארוך יותר
- `check_same_thread=False` - תמיכה ב-multiple threads
- `PRAGMA journal_mode=WAL` - ביצועים טובים יותר
- `PRAGMA foreign_keys=ON` - אכיפת foreign keys

### 2. הגדרות Flask משופרות
- `debug=False` - כיבוי debug mode
- `use_reloader=False` - כיבוי reloader אוטומטי
- `threaded=True` - תמיכה ב-multiple threads

### 3. Waitress Server
- יציב יותר מ-Flask development server
- לא "נרדם" כמו Flask
- תמיכה ב-multiple threads
- connection pooling

### 4. Auto-Monitoring System (חדש!)
- מנטור אוטומטי שמפעיל את השרת מחדש אם הוא נופל
- בדיקת בריאות כל 30 שניות
- לוגים מפורטים ב-`server_detailed.log`
- endpoint בריאות ב-`/api/health`
- הגבלת ניסיונות הפעלה מחדש (10 ניסיונות)

### 5. ארכיטקטורה מודולרית חדשה (Version 2.0)
- **הפרדת אחריות**: כל שכבה אחראית על תחום ספציפי
- **קוד נקי**: כל פונקציה מתועדת ומתועדת היטב
- **תחזוקה קלה**: שינויים נעשים בשכבה המתאימה בלבד
- **בדיקות**: מבנה מוכן לבדיקות יחידה
- **הרחבה**: הוספת פיצ'רים חדשים קלה ומהירה

## 🔧 פתרון בעיות

### אם השרת עדיין "נרדם":
1. ודא שאתה משתמש ב-`caffeinate -dims`
2. בדוק שאין תהליכים כפולים: `lsof -i :8080`
3. סגור תהליכים ישנים: `kill -9 <PID>`

### אם יש בעיות חיבור:
1. בדוק שהפורט 8080 פנוי
2. נסה להפעיל מחדש את השרת
3. בדוק את הלוגים בטרמינל

### אם יש בעיות עם ה-API החדש:
1. ודא שהשרת רץ עם הגרסה החדשה
2. בדוק שהנתיבים משתמשים ב-`/api/v1/`
3. בדוק את הלוגים לפרטי שגיאות

## 📝 הערות חשובות

- **תמיד השתמש בפורט 8080** - זה חשוב לזכור!
- **השתמש ב-Waitress** לפרויקטים יציבים
- **השתמש ב-caffeinate** למניעת שינה
- **שמור על הטרמינל פתוח** כדי לראות שגיאות
- **השתמש ב-API החדש** - `/api/v1/` endpoints
- **קרא את התיעוד** - כל פונקציה מתועדת היטב

## 🎯 המלצות יומיות

1. **לשימוש יומיומי**: השתמש ב-`./run_monitored.sh` (מומלץ ביותר!)
2. **לפיתוח**: השתמש ב-`./run_stable.sh`
3. **לבדיקות**: השתמש ב-`python3 run_waitress.py`
4. **לגיבוי**: השתמש ב-`caffeinate -dims python3 app.py`

## 📊 מעקב אחר השרת

### בדיקת בריאות השרת:
```bash
curl http://127.0.0.1:8080/api/health
```

### בדיקת API חדש:
```bash
# בדיקת חשבונות
curl http://127.0.0.1:8080/api/v1/accounts/

# בדיקת חשבון ספציפי
curl http://127.0.0.1:8080/api/v1/accounts/1
```

### צפייה בלוגים:
```bash
# לוגים מפורטים
tail -f server_detailed.log

# לוגים רגילים
tail -f server.log
```

### בדיקת תהליכים:
```bash
# בדיקה איזה תהליכים רצים על הפורט
lsof -i :8080

# בדיקת תהליכי Python
ps aux | grep python
```

## 🔄 מעבר לארכיטקטורה החדשה

### מה השתנה:
- **API endpoints**: מ-`/api/accounts` ל-`/api/v1/accounts/`
- **מבנה קבצים**: ארכיטקטורה מודולרית עם blueprints
- **לוגיקה עסקית**: הפרדה לשירותים נפרדים
- **תיעוד**: הערות מפורטות בכל הקבצים

### מה נשאר אותו דבר:
- **פורט**: עדיין 8080
- **בסיס נתונים**: עדיין SQLite
- **פונקציונליות**: כל הפיצ'רים עובדים כמו קודם
- **Frontend**: עדיין אותו דף database.html

### יתרונות הארכיטקטורה החדשה:
- **תחזוקה קלה**: קוד מאורגן ומתועד היטב
- **הרחבה מהירה**: הוספת פיצ'רים חדשים קלה
- **בדיקות**: מבנה מוכן לבדיקות יחידה
- **ביצועים**: אופטימיזציה של שאילתות בסיס נתונים
- **אבטחה**: הפרדה נכונה של אחריות
