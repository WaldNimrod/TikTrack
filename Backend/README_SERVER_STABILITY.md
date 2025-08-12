# TikTrack Server Stability Guide
# מדריך יציבות השרת

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

### אופציה 2: Flask משופר
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

## 🔧 פתרון בעיות

### אם השרת עדיין "נרדם":
1. ודא שאתה משתמש ב-`caffeinate -dims`
2. בדוק שאין תהליכים כפולים: `lsof -i :5002`
3. סגור תהליכים ישנים: `kill -9 <PID>`

### אם יש בעיות חיבור:
1. בדוק שהפורט 5002 פנוי
2. נסה להפעיל מחדש את השרת
3. בדוק את הלוגים בטרמינל

## 📝 הערות חשובות

- **תמיד השתמש בפורט 5002** - זה חשוב לזכור!
- **השתמש ב-Waitress** לפרויקטים יציבים
- **השתמש ב-caffeinate** למניעת שינה
- **שמור על הטרמינל פתוח** כדי לראות שגיאות

## 🎯 המלצות יומיות

1. **לשימוש יומיומי**: השתמש ב-`./run_monitored.sh` (מומלץ ביותר!)
2. **לפיתוח**: השתמש ב-`./run_stable.sh`
3. **לבדיקות**: השתמש ב-`python3 run_waitress.py`
4. **לגיבוי**: השתמש ב-`caffeinate -dims python3 app.py`

## 📊 מעקב אחר השרת

### בדיקת בריאות השרת:
```bash
curl http://127.0.0.1:5002/api/health
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
lsof -i :5002

# בדיקת תהליכי Python
ps aux | grep python
```
