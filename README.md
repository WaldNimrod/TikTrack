# מערכת ניהול טריידים - TikTrack

מערכת לניהול תכנוני טריידים ומעקב אחר טריידים פעילים.

## 🎯 זיכרון קבוע - נקודות קריטיות לכל צט חדש

**⚠️ חשוב מאוד - קרא לפני התחלת עבודה:**

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

### 📚 קבצי תיעוד חשובים:
- `CRITICAL_REMINDERS.md` - **קרא קודם!** - נקודות קריטיות לכל צט חדש
- `Backend/README_SERVER_STABILITY.md` - מדריך יציבות השרת
- `documentation/backend_architecture_new.html` - ארכיטקטורה מפורטת

---

## תכונות עיקריות

- **תכנון טריידים**: יצירה ועריכה של תכנוני טריידים
- **מעקב טריידים**: מעקב אחר טריידים פעילים וסגורים
- **התראות**: מערכת התראות למחירים ותנאים
- **סטטיסטיקות**: דשבורד עם סטטיסטיקות כלליות
- **ממשק משתמש**: עיצוב מודרני בהשראת Apple

## מבנה הפרויקט

```
SimpleTradeApp/
├── Backend/
│   ├── app.py              # Flask API
│   └── db/
│       └── simpleTrade.db  # בסיס נתונים SQLite
└── trading-ui/
    └── mockups/
        ├── planning.html   # עמוד תכנון טריידים
        ├── tracking.html   # עמוד מעקב טריידים
        ├── main.js         # JavaScript ראשי
        └── apple-theme.css # עיצוב Apple
```

## התקנה והפעלה

### דרישות מערכת

- Python 3.7+
- Flask
- Flask-CORS

### התקנת תלויות

```bash
cd Backend
pip3 install flask flask-cors
```

### הפעלת השרת

#### אופציה 1: הפעלה עם מנטור אוטומטי (מומלץ ביותר!)
```bash
cd Backend && ./run_monitored.sh
```

#### אופציה 2: הפעלה רגילה
```bash
cd Backend
python3 run_waitress.py
```

#### אופציה 3: הפעלה עם מנטור (ישן)
```bash
./start_server.sh
```

#### עצירת השרת
```bash
./stop_server.sh
```

#### הפעלה אוטומטית אחרי אתחול המחשב
```bash
# הגדרת הפעלה אוטומטית
./setup_autostart.sh

# ביטול הפעלה אוטומטית
./disable_autostart.sh

# בדיקת סטטוס הפעלה אוטומטית
./check_autostart.sh
```

השרת יפעל על `http://127.0.0.1:8080`

### בדיקת השרת

```bash
# בדיקת בריאות השרת
curl http://localhost:8080/api/health

# בדיקת API חדש
curl http://localhost:8080/api/v1/accounts/

# בדיקת CRUD מלא
curl -X POST http://localhost:8080/api/v1/accounts/ -H "Content-Type: application/json" -d '{"name":"חשבון בדיקה","currency":"USD","status":"active"}'
```

אם השרת פועל כראוי, תקבל תשובה כמו:
```json
{
  "active_alerts": 2,
  "active_plans": 3,
  "open_trades": 1,
  "total_pl": 0
}
```

### פתיחת הממשק

1. פתח את הקובץ `trading-ui/mockups/planning.html` בדפדפן
2. או פתח את הקובץ `trading-ui/mockups/tracking.html` בדפדפן

## API Endpoints

### תכנוני טריידים
- `GET /api/tradeplans` - קבלת כל תכנוני הטריידים
- `POST /api/tradeplans` - יצירת תכנון טרייד חדש
- `PUT /api/tradeplans/<id>` - עדכון תכנון טרייד
- `DELETE /api/tradeplans/<id>` - ביטול תכנון טרייד

### טריידים
- `GET /api/trades` - קבלת כל הטריידים
- `POST /api/trades` - יצירת טרייד חדש

### התראות
- `GET /api/alerts` - קבלת כל ההתראות
- `POST /api/alerts` - יצירת התראה חדשה

### סטטיסטיקות
- `GET /api/stats` - קבלת סטטיסטיקות כלליות

## שימוש במערכת

### יצירת תכנון טרייד

1. פתח את עמוד התכנון
2. לחץ על "הוסף תכנון חדש"
3. מלא את הפרטים:
   - נכס (סימול המניה)
   - סוג השקעה (סווינג/השקעה/פאסיבי)
   - סכום השקעה
   - מחיר יעד
   - מחיר סטופ
   - סיבות להשקעה

### המרה לטרייד

1. בעמוד התכנון, לחץ על "המר לטרייד" בשורה הרצויה
2. הטרייד ייווצר אוטומטית עם סטטוס "פתוח"

### מעקב טריידים

1. פתח את עמוד המעקב
2. צפה בטריידים הפעילים והסגורים
3. לחץ על "הוסף טרייד חדש" ליצירת טרייד ידני

## בסיס נתונים

המערכת משתמשת ב-SQLite עם הטבלאות הבאות:

- `accounts` - חשבונות משתמשים
- `tickers` - מניות ונכסים
- `trade_plans` - תכנוני טריידים
- `trades` - טריידים פעילים וסגורים
- `executions` - ביצועי טריידים
- `alerts` - התראות
- `performance_snapshots` - תמונת זמן

## פיתוח

### הוספת תכונות חדשות

1. הוסף endpoints חדשים ב-`Backend/app.py`
2. עדכן את ה-JavaScript ב-`trading-ui/mockups/main.js`
3. הוסף עיצובים ב-`trading-ui/mockups/apple-theme.css`

### בדיקת המערכת

1. וודא שהשרת פועל
2. פתח את העמודים בדפדפן
3. בדוק שהנתונים נטענים מהשרת
4. בדוק יצירה ועריכה של נתונים

## תמיכה

לשאלות ותמיכה, פנה למפתח המערכת.
