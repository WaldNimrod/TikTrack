# TikTrack Server Stability Guide
# מדריך יציבות השרת

## 🚀 אופציות הפעלה יציבות

### אופציה 1: Development Server עם Auto-Reload (מומלצת לפיתוח - חדש!)
```bash
# הפעלה עם auto-reload, caffeinate ו-migrations
./start_dev.sh

# או הפעלה ישירה
cd Backend && python3 dev_server.py
```

**יתרונות:**
- ✅ מתעדכן אוטומטית בשינויים בקוד
- ✅ מתעדכן אוטומטית בשינויים במודלים
- ✅ מתעדכן אוטומטית בשינויים בבסיס הנתונים
- ✅ לוגים מפורטים לפיתוח
- ✅ יציבות משופרת עם Waitress
- ✅ מניעת שינה עם caffeinate
- ✅ health check endpoint
- ✅ auto-restart במקרה של קריסה

### אופציה 2: Monitored Server (מומלצת לייצור)
```bash
# הפעלה עם מנטור אוטומטי ו-caffeinate
./run_monitored.sh

# או הפעלה ישירה של המנטור
python3 monitor_server.py
```

### אופציה 3: Waitress (יציב)
```bash
# הפעלה עם caffeinate למניעת שינה
./run_stable.sh

# או הפעלה ישירה
python3 run_waitress.py
```

### אופציה 4: Flask משופר
```bash
# הפעלה עם caffeinate
caffeinate -dims python3 app.py

# או הפעלה ישירה
python3 app.py
```

## 🗄️ מערכת Migrations (חדש!)

### ניהול שינויים בבסיס הנתונים:
```bash
# הצגת סטטוס migrations
python3 migrations_manager.py status

# החלת כל migrations ממתינים
python3 migrations_manager.py migrate

# יצירת migration חדש
python3 migrations_manager.py create_notes

# החלת migration ספציפי
python3 migrations_manager.py apply <version>

# ביטול migration
python3 migrations_manager.py rollback <version>
```

**יתרונות:**
- ✅ ניהול שינויים בבסיס הנתונים
- ✅ היסטוריה של שינויים
- ✅ rollback לשינויים קודמים
- ✅ בדיקת תקינות

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

### 4. Auto-Monitoring System
- מנטור אוטומטי שמפעיל את השרת מחדש אם הוא נופל
- בדיקת בריאות כל 30 שניות
- לוגים מפורטים ב-`server_detailed.log`
- endpoint בריאות ב-`/api/health`
- הגבלת ניסיונות הפעלה מחדש (10 ניסיונות)

### 5. Development Server עם Auto-Reload (חדש!)
- צופה בשינויים בקבצים אוטומטית
- הפעלה מחדש אוטומטית בשינויים
- לוגים מפורטים לכל שינוי
- תמיכה ב-multiple threads
- health check אוטומטי

## 🔧 פתרון בעיות

### אם השרת עדיין "נרדם":
1. ודא שאתה משתמש ב-`caffeinate -dims`
2. בדוק שאין תהליכים כפולים: `lsof -i :8080`
3. סגור תהליכים ישנים: `kill -9 <PID>`

### אם יש בעיות חיבור:
1. בדוק שהפורט 8080 פנוי
2. נסה להפעיל מחדש את השרת
3. בדוק את הלוגים בטרמינל

### אם יש בעיות עם migrations:
1. בדוק את סטטוס migrations: `python3 migrations_manager.py status`
2. החל migrations ממתינים: `python3 migrations_manager.py migrate`
3. בדוק את הלוגים לפרטי שגיאות

### אם השרת לא מתעדכן אוטומטית:
1. ודא שאתה משתמש ב-`./start_dev.sh`
2. בדוק שהצופה פעיל בלוגים
3. נסה להפעיל מחדש את השרת

## 📝 הערות חשובות

- **תמיד השתמש בפורט 8080** - זה חשוב לזכור!
- **לפיתוח**: השתמש ב-`./start_dev.sh` (auto-reload)
- **לייצור**: השתמש ב-`./run_monitored.sh` (יציבות)
- **השתמש ב-Waitress** לפרויקטים יציבים
- **השתמש ב-caffeinate** למניעת שינה
- **שמור על הטרמינל פתוח** כדי לראות שגיאות

## 🎯 המלצות יומיות

1. **לפיתוח יומיומי**: השתמש ב-`./start_dev.sh` (מומלץ ביותר!)
2. **לייצור יציב**: השתמש ב-`./run_monitored.sh`
3. **לבדיקות**: השתמש ב-`python3 run_waitress.py`
4. **לגיבוי**: השתמש ב-`caffeinate -dims python3 app.py`

## 📊 מעקב אחר השרת

### בדיקת בריאות השרת:
```bash
curl http://127.0.0.1:8080/api/health
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

### בדיקת סטטוס migrations:
```bash
# הצגת סטטוס
python3 migrations_manager.py status

# רשימת migrations שהוחלו
sqlite3 db/simpleTrade_new.db "SELECT * FROM schema_migrations;"
```

## 📝 מערכת הערות (חדש!)

### תכונות שהושלמו:
- ✅ דף הערות מלא עם טבלה ותצוגת נתונים
- ✅ מודלים להוספה ועריכה של הערות
- ✅ עורך טקסט עשיר עם כפתורי עיצוב
- ✅ מערכת קבצים מצורפים (העלאה, שמירה, מחיקה)
- ✅ שילוב בתפריט הניווט הראשי
- ✅ תמיכה בקישור הערות לחשבונות, טריידים ותוכניות טרייד
- ✅ מערכת פילטרים מתקדמת

### מבנה בסיס הנתונים:
```sql
-- טבלת סוגי קשרים
CREATE TABLE note_relation_types (
    id INTEGER PRIMARY KEY,
    note_relation_type VARCHAR(20) NOT NULL UNIQUE
);

-- טבלת הערות
CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    content VARCHAR(1000) NOT NULL,
    attachment VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    related_type_id INTEGER REFERENCES note_relation_types(id),
    related_id INTEGER
);
```

### API Endpoints:
- `GET /api/v1/notes/` - קבלת כל ההערות
- `POST /api/v1/notes/` - יצירת הערה חדשה
- `PUT /api/v1/notes/<id>` - עדכון הערה
- `DELETE /api/v1/notes/<id>` - מחיקת הערה
- `GET /api/v1/notes/files/<filename>` - קבלת קובץ
- `DELETE /api/v1/notes/files/<filename>` - מחיקת קובץ

### קבצים עיקריים:
- `trading-ui/notes.html` - דף ההערות הראשי
- `trading-ui/scripts/notes.js` - לוגיקת JavaScript
- `Backend/routes/api/notes.py` - API endpoints
- `Backend/models/note.py` - מודל SQLAlchemy
- `Backend/models/note_relation_type.py` - מודל סוגי קשרים

## 🚀 Workflow לפיתוח

### 1. הפעלת השרת:
```bash
./start_dev.sh
```

### 2. שינוי קוד:
- השרת מתעדכן אוטומטית
- לוגים מוצגים בטרמינל

### 3. שינוי מבנה בסיס הנתונים:
```bash
# יצירת migration
python3 migrations_manager.py create_notes

# החלת migration
python3 migrations_manager.py migrate

# בדיקת סטטוס
python3 migrations_manager.py status
```

### 4. בדיקת שינויים:
- השרת מתעדכן אוטומטית
- בדוק את הלוגים לפרטי שגיאות
- בדוק את ה-API: `curl http://127.0.0.1:8080/api/health`

**המערכת מוכנה לשימוש יומיומי! 🚀**
