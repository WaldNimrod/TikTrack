# הוראות מיגרציה למערכת Multi-User

## סקירה כללית

סקריפט המיגרציה `migrate_to_multi_user.py` מבצע את הפעולות הבאות:

1. **גיבוי בסיס הנתונים** - יוצר גיבוי PostgreSQL לפני המיגרציה
2. **הוספת עמודות user_id** - מוסיף עמודת `user_id` לכל הטבלאות הרלוונטיות
3. **יצירת משתמש ברירת מחדל** - יוצר משתמש ברירת מחדל אם לא קיים
4. **העברת נתונים** - מעביר את כל הנתונים הקיימים למשתמש ברירת מחדל
5. **יצירת טבלת user_tickers** - יוצרת טבלת junction לקשר בין משתמשים לטיקרים
6. **העברת טיקרים** - מעביר את כל הטיקרים לרשימת המשתמש ברירת מחדל

## דרישות מוקדמות

1. **PostgreSQL** - המערכת משתמשת ב-PostgreSQL (לא SQLite)
2. **pg_dump** - כלי גיבוי PostgreSQL (חייב להיות מותקן)
3. **משתני סביבה** - משתני הסביבה של PostgreSQL מוגדרים:
   - `POSTGRES_HOST`
   - `POSTGRES_DB`
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`

## הרצת המיגרציה

### שיטה 1: הרצה ישירה

```bash
cd /path/to/TikTrackApp
python3 Backend/scripts/migrate_to_multi_user.py
```

### שיטה 2: עם משתני סביבה

```bash
export POSTGRES_HOST=localhost
export POSTGRES_DB=TikTrack-db-development
export POSTGRES_USER=TikTrakDBAdmin
export POSTGRES_PASSWORD="BigMeZoo1974!?"

python3 Backend/scripts/migrate_to_multi_user.py
```

### שיטה 3: שימוש ב-start_server.sh (מגדיר משתנים אוטומטית)

```bash
# הסקריפט start_server.sh מגדיר את משתני הסביבה אוטומטית
# הרץ אותו פעם אחת ואז הרץ את המיגרציה
./start_server.sh --check-only  # רק לבדיקה, לא מפעיל את השרת
python3 Backend/scripts/migrate_to_multi_user.py
```

## מה המיגרציה עושה

### שלב 1: גיבוי

- יוצר גיבוי של בסיס הנתונים ב-`backup/multi_user_migration_YYYYMMDD_HHMMSS/`
- הגיבוי הוא בפורמט PostgreSQL custom format (דחוס)

### שלב 2: הוספת עמודות user_id

מוסיף עמודת `user_id` לטבלאות הבאות:

- `trading_accounts`
- `trades`
- `trade_plans`
- `executions`
- `cash_flows`
- `alerts`
- `notes`
- `import_sessions`

כל עמודה כוללת:

- Foreign key ל-`users.id`
- Index לביצועים

### שלב 3: יצירת משתמש ברירת מחדל

- בודק אם קיים משתמש עם `is_default = true`
- אם לא קיים, יוצר משתמש חדש:
  - **Username**: `default_user`
  - **Password**: `default_password_change_me`
  - **⚠️ חשוב**: יש לשנות את הסיסמה אחרי המיגרציה!

### שלב 4: העברת נתונים

- מעביר את כל השורות עם `user_id = NULL` למשתמש ברירת מחדל
- מבצע UPDATE לכל הטבלאות

### שלב 5: הגדרת NOT NULL

- משנה את עמודת `user_id` ל-NOT NULL אחרי שהעביר את כל הנתונים

### שלב 6: יצירת טבלת user_tickers

- יוצרת טבלת junction `user_tickers`
- כוללת unique constraint על `(user_id, ticker_id)`

### שלב 7: העברת טיקרים

- מוסיף את כל הטיקרים הקיימים לרשימת המשתמש ברירת מחדל

### שלב 8: אימות

- בודק שהמיגרציה הצליחה
- מדווח על בעיות אם יש

## אחרי המיגרציה

### 1. שנה את סיסמת המשתמש ברירת מחדל

```bash
# דרך API
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "default_user", "password": "default_password_change_me"}'

# או דרך UI - התחבר והחלף סיסמה
```

### 2. בדוק שהכל עובד

```bash
# בדוק שהשרת עובד
curl http://localhost:8080/api/health

# בדוק התחברות
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "default_user", "password": "YOUR_NEW_PASSWORD"}'
```

### 3. בדוק שהנתונים נשמרו

```bash
# בדוק שיש נתונים למשתמש ברירת מחדל
curl http://localhost:8080/api/trading-accounts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## שחזור מגיבוי

אם משהו השתבש, ניתן לשחזר מהגיבוי:

```bash
# מצא את קובץ הגיבוי
ls -la backup/multi_user_migration_*/

# שחזר את הגיבוי
pg_restore -h localhost -U TikTrakDBAdmin -d TikTrack-db-development \
  backup/multi_user_migration_YYYYMMDD_HHMMSS/database_backup_YYYYMMDD_HHMMSS.sql
```

## פתרון בעיות

### שגיאה: "pg_dump: command not found"

**פתרון**: התקן את PostgreSQL client tools:

```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client
```

### שגיאה: "DATABASE_URL is not configured"

**פתרון**: הגדר את משתני הסביבה או השתמש ב-`start_server.sh`

### שגיאה: "Column already exists"

**פתרון**: זה תקין - המיגרציה כבר רצה בעבר. הסקריפט בטוח להרצה חוזרת.

### שגיאה: "Foreign key constraint failed"

**פתרון**: ודא שיש לפחות משתמש אחד במערכת לפני המיגרציה.

## הערות חשובות

1. **גיבוי אוטומטי**: המיגרציה יוצרת גיבוי אוטומטית לפני כל שינוי
2. **Idempotent**: הסקריפט בטוח להרצה חוזרת - הוא בודק מה כבר קיים
3. **Transaction Safe**: כל שלב מתבצע בטרנזקציה - אם משהו נכשל, הכל מתבטל
4. **Logging**: כל פעולה נרשמת בקונסול ובקובץ לוג

## תמיכה

אם נתקלת בבעיות:

1. בדוק את הלוגים בקונסול
2. בדוק את קובץ הגיבוי
3. ודא שהשרת לא רץ בזמן המיגרציה

