# TikTrack Production Environment Setup Guide

**תאריך:** 2025-01-16  
**גרסה:** 1.0

## סקירה כללית

מדריך זה מסביר כיצד להקים ולהפעיל את סביבת הפרודקשן של TikTrack לצד סביבת הפיתוח.

## מבנה הסביבות

### סביבת פיתוח (Development)
- **פורט:** 8080
- **בסיס נתונים:** `Backend/db/simpleTrade_new.db`
- **לוגים:** `Backend/logs/`
- **הפעלה:** `./start_server.sh`

### סביבת פרודקשן (Production)
- **פורט:** 5001
- **בסיס נתונים:** `Backend/db/TikTrack_DB.db`
- **לוגים:** `Backend/logs-production/`
- **הפעלה:** `./start_production.sh`

## דרישות מוקדמות

1. Python 3.x מותקן
2. כל התלויות מ-`Backend/requirements.txt` מותקנות
3. בסיס נתונים פיתוח קיים (`Backend/db/simpleTrade_new.db`)

## תהליך ההקמה

### שלב 1: יצירת בסיס נתונים פרודקשן

הרץ את הסקריפט ליצירת בסיס הנתונים:

```bash
python3 Backend/scripts/create_production_db.py
```

הסקריפט:
- יוצר בסיס נתונים חדש בשם `TikTrack_DB.db`
- מעתיק את כל המבנה והטבלאות
- מעתיק את כל טבלאות העזר והעדפות
- מנקה את טבלאות המשתמש (trades, executions, cash_flows, וכו')
- משאיר רק חשבון מסחר אחד (לפי preference `default_trading_account`)

### שלב 2: הפעלת שרת פרודקשן

```bash
./start_production.sh
```

השרת יתחיל על פורט 5001 עם:
- בסיס נתונים: `TikTrack_DB.db`
- לוגים: `logs-production/`
- סביבה: Production

### שלב 3: בדיקת הפעלה

פתח בדפדפן:
- **פיתוח:** http://127.0.0.1:8080
- **פרודקשן:** http://127.0.0.1:5001

## קבצים חשובים

### קבצי הגדרות
- `Backend/config/settings.py` - הגדרות משותפות (קורא מ-env)
- `Backend/config/settings.prod.py` - הגדרות פרודקשן (לא בשימוש כרגע)

### סקריפטים
- `start_server.sh` - הפעלת פיתוח (פורט 8080)
- `start_production.sh` - הפעלת פרודקשן (פורט 5001)
- `Backend/scripts/create_production_db.py` - יצירת DB פרודקשן

### משתני סביבה

המערכת משתמשת במשתנה סביבה `TIKTRACK_ENV`:
- `development` (ברירת מחדל) - פיתוח
- `production` - פרודקשן

הסקריפט `start_production.sh` מגדיר אוטומטית `TIKTRACK_ENV=production`.

## עדכון קוד לפרודקשן

### גישה מומלצת: Tagged Releases

1. **עבודה על פיתוח:**
   ```bash
   git checkout main
   # עבודה על שינויים...
   git commit -m "Feature: ..."
   ```

2. **יצירת tag לגרסה יציבה:**
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

3. **עדכון פרודקשן:**
   ```bash
   git checkout v1.0.1
   ./start_production.sh
   ```

## תחזוקה

### גיבוי בסיס נתונים פרודקשן

```bash
python3 Backend/scripts/backup_database.py --output-dir Backend/db/backups
```

### עדכון בסיס נתונים פרודקשן

אם צריך להריץ migrations:
1. עצור את שרת הפרודקשן
2. הרץ migrations ידנית על `TikTrack_DB.db`
3. הפעל מחדש את השרת

### ניקוי לוגים

לוגים בפרודקשן נמצאים ב-`Backend/logs-production/`:
- `app.log` - לוגים כלליים
- `errors.log` - שגיאות בלבד
- `performance.log` - ביצועים
- `database.log` - פעולות DB
- `cache.log` - פעולות cache

## פתרון בעיות

### פורט תפוס

אם הפורט 5001 תפוס:
```bash
# בדוק מה רץ על הפורט
lsof -i :5001

# עצור את התהליך
kill <PID>
```

### בסיס נתונים לא נמצא

אם השרת מתלונן על בסיס נתונים חסר:
```bash
# צור בסיס נתונים חדש
python3 Backend/scripts/create_production_db.py
```

### שגיאת foreign keys

אם יש שגיאות foreign keys, ודא שהסקריפט הפעיל foreign keys בסוף:
```sql
PRAGMA foreign_keys = ON;
```

## הערות חשובות

1. **הפרדה מלאה:** שתי הסביבות נפרדות לחלוטין - אין שיתוף נתונים
2. **פורטים שונים:** פיתוח על 8080, פרודקשן על 5001
3. **לוגים נפרדים:** כל סביבה יש לה תיקיית לוגים משלה
4. **בסיס נתונים נפרד:** כל סביבה יש לה בסיס נתונים משלה

## תמיכה

לשאלות או בעיות, בדוק:
- `PRODUCTION_FILES_LIST.md` - רשימת קבצים פעילים
- `Backend/scripts/create_production_db.py` - קוד הסקריפט
- `Backend/config/settings.py` - הגדרות סביבה

