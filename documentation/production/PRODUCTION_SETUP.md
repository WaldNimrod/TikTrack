# TikTrack Production Environment Setup Guide

**תאריך:** 2025-01-16  
**גרסה:** 1.0

## 🚀 עדכון פרודקשן - תהליך מהיר

**לעדכון מלא ומפורט, ראה:** [`UPDATE_PROCESS.md`](./UPDATE_PROCESS.md)

### תהליך עדכון מהיר:

```bash
# 1. עדכון ומיזוג
git checkout main && git pull origin main
git checkout production && git pull origin production
git merge main

# 2. סינכרון קוד
./scripts/sync_to_production.py

# 3. בדיקות
./scripts/verify_production_isolation.sh

# 4. Commit & Push
git add production/ scripts/ documentation/production/
git commit -m "feat: Update production from main"
git push origin production
```

---

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
- **בסיס נתונים:** `production/Backend/db/TikTrack_DB.db`
- **לוגים:** `production/Backend/logs/`
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
- בסיס נתונים: `production/Backend/db/TikTrack_DB.db`
- לוגים: `production/Backend/logs/`
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

#### סקריפטי הפעלה:
- `start_server.sh` - הפעלת פיתוח (פורט 8080)
- `start_production.sh` - הפעלת פרודקשן (פורט 5001)

#### סקריפטי פרודקשן:
- `production/Backend/scripts/create_production_db.py` - יצירת DB פרודקשן (כולל מיגרציות אוטומטיות)
- `production/Backend/scripts/backup_database.py` - גיבוי בסיס נתונים פרודקשן
- `production/Backend/scripts/cleanup_import_sessions.py` - ניקוי סשני ייבוא ישנים (מעל 90 יום)
- `scripts/run_production_migration.py` - הרצת מיגרציות ידנית על פרודקשן

### משתני סביבה

המערכת משתמשת במשתנה סביבה `TIKTRACK_ENV`:
- `development` (ברירת מחדל) - פיתוח
- `production` - פרודקשן

הסקריפט `start_production.sh` מגדיר אוטומטית `TIKTRACK_ENV=production`.

## עדכון קוד לפרודקשן

**📖 למדריך מפורט ומלא:** [`UPDATE_PROCESS.md`](./UPDATE_PROCESS.md)

### ניהול גרסאות פרודקשן

- המערכת משתמשת ב-4 ספרות: `Major.Minor.Patch.Build`.
  - `Major` / `Minor` – נקבעים ידנית ע״י נמרוד בלבד.
  - `Patch` – מתקדם אוטומטית בכל פעם שמקדמים קוד מ-`main` לפרודקשן.
  - `Build` – מתקדם בכל הפעלה/פריסה של אותה גרסת קוד.
- הסטטוס העדכני נשמר ב-`documentation/version-manifest.json` והיסטוריה מלאה ב-`documentation/production/VERSION_HISTORY.md`.
- כלי העדכון: `scripts/versioning/bump-version.py`.

דוגמאות:

```bash
# אחרי מיזוג main → production (קידום גרסת קוד)
python3 scripts/versioning/bump-version.py \
  --env production \
  --bump patch \
  --note "Sync main into production"

# הפעלת שרת נוספת עם אותה גרסה (למשל ריענון בלבד)
python3 scripts/versioning/bump-version.py \
  --env production \
  --bump build \
  --note "Restart production server"

# עדכון Major/Minor - נמרוד בלבד
python3 scripts/versioning/bump-version.py \
  --env production \
  --set-version 2.1.0.0 \
  --allow-major-minor \
  --note "Manual major release (approved)"
```

> ℹ️ כל פקודה מעדכנת אוטומטית את ה-manifest ואת קובץ ההיסטוריה, כולל החתימה (`commit`) והתאריך.

### תהליך עדכון מומלץ:

1. **עדכון Main Branch:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **מיזוג ל-Production:**
   ```bash
   git checkout production
   git pull origin production
   git merge main
   ```

3. **סינכרון קוד:**
   ```bash
   ./scripts/sync_to_production.py
   ```

4. **בדיקות:**
   ```bash
   ./scripts/verify_production_isolation.sh
   ```

5. **Commit & Push:**
   ```bash
   git add production/ scripts/ documentation/production/
   git commit -m "feat: Update production from main"
   git push origin production
   ```

**⚠️ חשוב:** ראה [`UPDATE_PROCESS.md`](./UPDATE_PROCESS.md) לפרטים מלאים, פתרון בעיות, ו-checklist.

## תחזוקה

### גיבוי בסיס נתונים פרודקשן

```bash
python3 Backend/scripts/backup_database.py --output-dir Backend/db/backups
```

### עדכון בסיס נתונים פרודקשן

#### מיגרציות אוטומטיות

הסקריפט `create_production_db.py` מריץ מיגרציות אוטומטית אחרי יצירת המבנה. כדי להוסיף מיגרציה חדשה:

1. פתח `production/Backend/scripts/create_production_db.py`
2. הוסף את שם קובץ המיגרציה לרשימה `migrations_to_run` בפונקציה `run_migrations()`
3. הסקריפט יזהה אם המיגרציה כבר רצה (לפי בדיקת מבנה)

#### מיגרציות ידניות

אם צריך להריץ מיגרציה ידנית:

```bash
# הרצת מיגרציה ספציפית על בסיס הנתונים של הפרודקשן
python3 scripts/run_production_migration.py Backend/migrations/add_entry_price_to_trade_plans.py
```

**תהליך:**
1. עצור את שרת הפרודקשן
2. הרץ את המיגרציה (או השתמש ב-`run_production_migration.py`)
3. הפעל מחדש את השרת

### ניקוי תקופתי

#### ניקוי סשני ייבוא ישנים

הרץ את הסקריפט לניקוי סשני ייבוא ישנים (מעל 90 יום):

```bash
python3 production/Backend/scripts/cleanup_import_sessions.py
```

הסקריפט:
- מזהה סשני ייבוא ישנים יותר מ-90 יום
- מוחק אותם אוטומטית
- מדווח על מספר הסשנים שנמחקו

**מומלץ להריץ פעם בחודש** או כחלק מתהליך תחזוקה תקופתי.

#### ניקוי לוגים

לוגים בפרודקשן נמצאים ב-`production/Backend/logs/`:
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

