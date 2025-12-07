# מדריך יצירת בסיס נתונים פרודקשן
## Production Database Setup Guide

**תאריך יצירה:** ינואר 2025  
**גרסה:** 1.0.0  
**מטרה:** יצירת בסיס נתונים פרודקשן חדש עם מפתחות מסודרים מ-1 ורציפים

---

## 📋 תוכן עניינים

1. [מטרה](#מטרה)
2. [דרישות מקדימות](#דרישות-מקדימות)
3. [תהליך יצירת בסיס הנתונים](#תהליך-יצירת-בסיס-הנתונים)
4. [שימוש בסקריפט](#שימוש-בסקריפט)
5. [וידוא מפתחות מסודרים](#וידוא-מפתחות-מסודרים)
6. [טיפול בשגיאות](#טיפול-בשגיאות)
7. [שחזור מגיבוי](#שחזור-מגיבוי)

---

## 🎯 מטרה

יצירת בסיס נתונים פרודקשן "אמיתי" וסופי עם:

- **מפתחות מסודרים** - כל הטבלאות מתחילות מ-ID 1 ורציפים
- **נתוני מערכת מלאים** - users, currencies, trading_methods, external_data_providers, note_relation_types
- **נתוני דוגמה מדויקים** - לפי [MULTI_USER_DATA_DISTRIBUTION.md](../05-REPORTS/MULTI_USER_DATA_DISTRIBUTION.md):
  - **user**: 120 תוכניות, 80 טריידים, 50 טיקרים, 3 רשימות צפיה
  - **admin**: 20 תוכניות, 15 טריידים, 10 טיקרים, 2 רשימות צפיה
  - **nimrod**: ללא נתונים (נקי)

---

## ✅ דרישות מקדימות

1. **PostgreSQL Docker Container** - חייב להיות פעיל
   ```bash
   docker ps | grep postgres
   ```

2. **Environment Variables** - מוגדרים נכון:
   ```bash
   export POSTGRES_HOST=localhost
   export POSTGRES_DB=TikTrack-db-production
   export POSTGRES_USER=TikTrakDBAdmin
   export POSTGRES_PASSWORD="BigMeZoo1974!?"
   ```

3. **Database Schema** - כבר קיים (נוצר על ידי migrations)

4. **Backup Script** - `scripts/db/backup_postgresql_production.sh` קיים

---

## 🔄 תהליך יצירת בסיס הנתונים

הסקריפט `Backend/scripts/create_fresh_production_database.py` מבצע את השלבים הבאים:

### שלב 1: גיבוי בסיס הנתונים הנוכחי

- יצירת גיבוי PostgreSQL לפני ניקוי
- שימוש ב-`scripts/db/backup_postgresql_production.sh`
- שמירת גיבוי ב-`archive/database_backups/`

### שלב 2: ניקוי כל הנתונים (TRUNCATE CASCADE)

- ניקוי כל הטבלאות עם נתוני משתמש:
  - `tickers`, `trades`, `trade_plans`, `executions`, `cash_flows`
  - `trading_accounts`, `alerts`, `notes`, `tags`
  - `watch_lists`, `watch_list_items`
  - `user_tickers`, `ai_analysis_requests`
  - כל טבלאות הקשורות
- שומר על מבנה הטבלאות (לא מוחק את הטבלאות)

### שלב 3: איפוס כל ה-sequences ל-1

- זיהוי אוטומטי של כל ה-sequences ב-PostgreSQL
- איפוס כל sequence ל-1: `ALTER SEQUENCE ... RESTART WITH 1`
- וידוא שכל sequence מתחיל מ-1

### שלב 4: יצירת נתוני מערכת מחדש

- **Currencies**: USD, ILS, EUR, GBP, JPY
- **Users**: nimrod (ID: 1), admin (ID: 2), user (ID: 3)
- **Trading Methods**: כל שיטות המסחר מ-`seed_conditions_master_data.py`
- **External Data Providers**: Yahoo Finance, Google Finance
- **Note Relation Types**: כל סוגי הקשרים

### שלב 5: יצירת נתוני דוגמה

- קריאה ל-`generate_multi_user_demo_data.py`
- יצירת נתונים לפי MULTI_USER_DATA_DISTRIBUTION.md
- טעינת נתוני שוק חיצוניים ראשוניים לכל הטיקרים

### שלב 6: וידוא מפתחות מסודרים

- בדיקה שכל טבלה מתחילה מ-1
- בדיקה שהמפתחות רציפים (ללא פערים)
- דוח מפורט על כל הטבלאות

---

## 🚀 שימוש בסקריפט

### הרצה רגילה

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackApp-Production
python3 Backend/scripts/create_fresh_production_database.py --verbose
```

### Dry Run (בדיקה ללא שינויים)

```bash
python3 Backend/scripts/create_fresh_production_database.py --dry-run --verbose
```

### עם הודעות מפורטות

```bash
python3 Backend/scripts/create_fresh_production_database.py --verbose
```

### אפשרויות

- `--dry-run`: אימות מבנה DB בלבד, לא יוצר נתונים
- `--verbose`: הצגת הודעות מפורטות על כל שלב

---

## ✅ וידוא מפתחות מסודרים

לאחר הרצת הסקריפט, הוא בודק אוטומטית:

1. **כל טבלה מתחילה מ-1**
   ```sql
   SELECT MIN(id) FROM <table_name>
   -- צריך להחזיר 1
   ```

2. **מפתחות רציפים (ללא פערים)**
   ```sql
   SELECT MAX(id), COUNT(*) FROM <table_name>
   -- MAX(id) צריך להיות שווה ל-COUNT(*)
   ```

3. **Sequences מאופסים**
   ```sql
   SELECT last_value FROM <table_name>_id_seq
   -- צריך להיות 1 או מספר המשתמשים הקיימים
   ```

### דוגמה לתוצאה תקינה

```
✅ users: 1-3 (3 רשומות)
✅ currencies: 1-5 (5 רשומות)
✅ trading_methods: 1-6 (6 רשומות)
✅ tickers: 1-50 (50 רשומות) - למשתמש user
✅ trades: 1-80 (80 רשומות) - למשתמש user
```

---

## ⚠️ טיפול בשגיאות

### שגיאה: "PostgreSQL container is not running"

**פתרון:**
```bash
docker-compose -f docker/docker-compose.dev.yml up -d postgres-dev
```

### שגיאה: "Backup failed"

**פתרון:**
- בדוק שהתיקייה `archive/database_backups/` קיימת
- בדוק הרשאות כתיבה
- המשך ללא גיבוי (הסקריפט ימשיך עם אזהרה)

### שגיאה: "TRUNCATE failed"

**פתרון:**
- בדוק שהטבלאות קיימות
- בדוק Foreign Key constraints
- הסקריפט ממשיך עם טבלאות אחרות

### שגיאה: "Sequence reset failed"

**פתרון:**
- זה לא קריטי - הסקריפט ממשיך
- Sequences יתוקנו אוטומטית בעת יצירת רשומות חדשות

### שגיאה: "User creation failed"

**פתרון:**
- בדוק שהטבלת `users` קיימת
- בדוק שהטבלת `currencies` קיימת (נדרש ליצירת users)
- בדוק logs לפרטים נוספים

---

## 🔄 שחזור מגיבוי

אם משהו השתבש, ניתן לשחזר מגיבוי:

### 1. מצא את הגיבוי האחרון

```bash
ls -lt archive/database_backups/ | head -5
```

### 2. שחזר את הגיבוי

```bash
# עצור את השרת
pkill -f "python.*app.py"

# שחזר את הגיבוי
docker exec -i tiktrack-postgres-dev psql \
  -U TikTrakDBAdmin \
  -d TikTrack-db-production \
  < archive/database_backups/TikTrack-db-production_YYYYMMDD_HHMMSS.sql

# הפעל מחדש את השרת
./start_server.sh
```

---

## 📊 בדיקת התוצאות

לאחר הרצת הסקריפט, בדוק:

### 1. בדיקת משתמשים

```bash
# התחבר כמשתמש user
# בדוק: 120 תוכניות, 80 טריידים, 50 טיקרים, 3 רשימות צפיה
```

### 2. בדיקת API endpoints

```bash
# בדוק endpoints
curl http://localhost:5001/api/users
curl http://localhost:5001/api/currencies
curl http://localhost:5001/api/trading-methods
curl http://localhost:5001/api/trades
```

### 3. בדיקת מפתחות מסודרים

הסקריפט מדווח אוטומטית על כל הטבלאות. אם יש בעיות, הן יוצגו בסוף הריצה.

---

## 📝 הערות חשובות

1. **גיבוי חובה**: הסקריפט יוצר גיבוי לפני ניקוי, אבל מומלץ ליצור גיבוי ידני גם כן

2. **זמן ביצוע**: התהליך יכול לקחת 5-10 דקות (תלוי בכמות הנתונים)

3. **טעינת נתונים חיצוניים**: הסקריפט טוען נתוני שוק חיצוניים ראשוניים לכל הטיקרים - זה יכול לקחת זמן

4. **מפתחות מסודרים**: הסקריפט מוודא שכל הטבלאות מתחילות מ-1, אבל אם יש בעיות, הן יוצגו בסוף הריצה

5. **Production Environment**: הסקריפט מיועד ל-production בלבד - לא להריץ על development!

---

## 🔗 קישורים

- **מדריך חלוקת נתונים**: [MULTI_USER_DATA_DISTRIBUTION.md](../05-REPORTS/MULTI_USER_DATA_DISTRIBUTION.md)
- **מדריך יצירת נתוני דוגמה**: [DEMO_DATA_GENERATION_GUIDE.md](../05-REPORTS/DEMO_DATA_GENERATION_GUIDE.md)
- **סקריפט יצירת משתמשים**: `Backend/scripts/setup_initial_users.py`
- **סקריפט יצירת נתוני דוגמה**: `Backend/scripts/generate_multi_user_demo_data.py`

---

**סיום המסמך**

