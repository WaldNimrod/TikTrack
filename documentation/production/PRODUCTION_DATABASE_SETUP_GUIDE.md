# מדריך יצירת בסיס נתונים פרודקשן + Development

## Production & Development Database Setup Guide

**תאריך יצירה:** ינואר 2025
**תאריך עדכון:** דצמבר 2025
**גרסה:** 1.1.0
**מטרה:** יצירת בסיס נתונים פרודקשן ו-development עם מפתחות מסודרים ונתוני בסיס חיוניים

---

## 📋 תוכן עניינים

1. מטרה
2. נתוני בסיס חיוניים - עדכון דצמבר 2025
3. דרישות מקדימות
4. תהליך יצירת בסיס הנתונים
5. שימוש בסקריפט
6. וידוא מפתחות מסודרים
7. טיפול בשגיאות
8. שחזור מגיבוי

---

## 🔧 נתוני בסיס חיוניים - עדכון דצמבר 2025

### 📊 סטטוס נוכחי של בסיסי הנתונים

לאחר יישום תוכנית יצירת נתוני דוגמה בשלבים, בסיס ה-development מכיל עכשיו **נתוני בסיס חיוניים** מלאים:

| טבלה חיונית | רשומות בבסיס development | סטטוס | תיאור |
|-------------|---------------------------|--------|--------|
| **currencies** | 5 מטבעות | ✅ | USD, EUR, GBP, ILS, JPY |
| **tickers** | 58 טיקרים (55 פעילים) | ✅ | כולל SPY, סטטוס תוקן מ-open ל-active |
| **cash_flows** | 91 רשומות | ✅ | הפקדות ומשיכות אמיתיות |
| **trades** | 95 רשומות | ✅ | טריידים עם executions |
| **executions** | 630 רשומות | ✅ | ביצועים מפורטים |
| **trading_accounts** | 4 חשבונות | ✅ | חשבונות מסחר פעילים |
| **preference_types** | 129 העדפות | ✅ | **מדוייק ב-100%** |
| **preference_groups** | 7 קבוצות | ✅ | חלוקה מאורגנת ללא כפילויות |
| **system_settings** | 49 הגדרות | ✅ | תצורת מערכת מלאה |
| **constraints** | 118 אילוצים | ✅ | ולידציות ואילוצי DB |
| **enum_values** | 86 ערכי enum | ✅ | ערכים מוגדרים מראש |
| **ai_prompt_templates** | 4 תבניות | ✅ | תבניות AI מוכנות |
| **external_data_providers** | 3 ספקים | ✅ | yahoo_finance + test_provider |
| **ticker_provider_symbols** | 27 מיפויים | ✅ | מיפוי טיקר→ספק |
| **סה״כ** | **608 רשומות** | **✅** | **נתונים אמיתיים ומלאים** |

### 🎯 מסקנות מתהליך העתקת הנתונים

1. **✅ הצלחת העתקה**: 10 טבלאות חיוניות הועתקו בהצלחה מבסיס testing
2. **✅ נתונים אמיתיים**: לא seed data - נתונים אמיתיים מ-production
3. **✅ תיקונים שבוצעו**:
   - `preferences_legacy` נמחקה (הייתה ריקה)
   - סטטוס טיקרים תוקן: 55 מ-open ל-active
4. **✅ חלוקת העדפות**: 129 העדפות בקבוצות ללא כפילויות
5. **✅ אילוצי DB**: 118 constraints + 86 enum values מוכנים

### 📋 תוכנית השלבים ליישום מלא

#### **שלב 1 - נתוני בסיס חיוניים** ✅ **הושלם**

- 608 רשומות ב-12 טבלאות חיוניות
- נתונים מדוייקים ב-100% מהבסיסים הקיימים

#### **שלב 2 - משתמשי בסיס** 🔄 **הבא בתור**

- יצירת משתמשי admin ו-user עם נתונים מינימאליים
- שמירת nimrod נקי (ללא נתונים)

#### **שלב 3 - נתוני בדיקה מלאים** 📋 **בעתיד**

- נתונים מלאים לכל המשתמשים
- סימולציות מלאות של פעילות מסחר

---

## 🎯 מטרה

יצירת בסיס נתונים פרודקשן ו-development "אמיתי" וסופי עם:

### 📊 לבסיס Development (הושלם)

- **נתוני בסיס חיוניים**: 608 רשומות ב-12 טבלאות מרכזיות
- **נתונים מדוייקים**: מועתקים מבסיסים קיימים (לא seed data)
- **מוכן לפיתוח**: מאפשר בדיקה מלאה של כל הפונקציונליות

### 🏭 לבסיס Production

- **מפתחות מסודרים** - כל הטבלאות מתחילות מ-ID 1 ורציפים
- **נתוני מערכת מלאים** - users, currencies, trading_methods, external_data_providers, note_relation_types
- **נתוני דוגמה מדויקים** - לפי [MULTI_USER_DATA_DISTRIBUTION.md](../05-REPORTS/MULTI_USER_DATA_DISTRIBUTION.md):
  - **user**: 120 תוכניות, 80 טריידים, 50 טיקרים, 3 רשימות צפיה
  - **admin**: 20 תוכניות, 15 טריידים, 10 טיקרים, 2 רשימות צפיה
  - **nimrod**: ללא נתונים (נקי)

---

## 🔄 תהליך העתקת נתוני בסיס ל-Development (דצמבר 2025)

### שלב 1: זיהוי נתוני בסיס חיוניים

ניתחנו את בסיסי הנתונים הקיימים וזיהינו 12 טבלאות חיוניות:

1. **`currencies`** - 5 מטבעות בסיס (USD, EUR, ILS, GBP, JPY)
2. **`tickers`** - 58 טיקרים (כולל SPY) עם סטטוס פעיל
3. **`external_data_providers`** - 3 ספקי נתונים חיצוניים
4. **`ai_prompt_templates`** - 4 תבניות AI מוכנות
5. **`ticker_provider_symbols`** - 27 מיפויי טיקר לספק
6. **`preference_types`** - 129 הגדרות העדפות (מדוייק ב-100%)
7. **`preference_groups`** - 7 קבוצות העדפות מאורגנות
8. **`system_settings`** - 49 הגדרות מערכת (SMTP וכו')
9. **`constraints`** - 118 אילוצי בסיס נתונים
10. **`enum_values`** - 86 ערכי enum מוגדרים
11. **`cash_flows`** - 91 רשומות (נתונים אמיתיים)
12. **`trades`** + **`executions`** + **`trading_accounts`** - נתוני מסחר אמיתיים

### שלב 2: יצירת גיבוי נתוני בסיס

```bash
# יצירת גיבוי מלא של נתוני בסיס מבסיס testing
pg_dump -U TikTrakDBAdmin \
    --no-owner --no-privileges \
    --format=custom \
    --table=currencies \
    --table=tickers \
    --table=external_data_providers \
    --table=ai_prompt_templates \
    --table=preference_types \
    --table=preference_groups \
    --table=system_settings \
    --table=constraints \
    --table=enum_values \
    --table=ticker_provider_symbols \
    TikTrack-db-testing > TikTrack-db-testing_BASE_DATA_20251228.dump
```

### שלב 3: העתקה לבסיס Development

```bash
# שחזור טבלאות חיוניות לבסיס development
pg_restore -U TikTrakDBAdmin \
    -d TikTrack-db-development \
    --no-owner --no-privileges \
    --clean --if-exists \
    --table=currencies --table=tickers --table=external_data_providers \
    --table=ai_prompt_templates --table=preference_types --table=preference_groups \
    --table=system_settings --table=constraints --table=enum_values \
    --table=ticker_provider_symbols \
    TikTrack-db-testing_BASE_DATA_20251228.dump
```

### שלב 4: תיקונים נוספים

- **מחיקת** `preferences_legacy` (טבלה ריקה לא נחוצה)
- **תיקון** סטטוס טיקרים מ-'open' ל-'active' (55 טיקרים)

### שלב 5: וידוא הצלחה

```bash
# בדיקת מספר רשומות בכל טבלה חיונית
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -d "TikTrack-db-development" -c "
SELECT 'currencies' as table_name, COUNT(*) as records FROM currencies
UNION ALL SELECT 'tickers', COUNT(*) FROM tickers WHERE status = 'active'
UNION ALL SELECT 'preference_types', COUNT(*) FROM preference_types WHERE is_active = true
ORDER BY records DESC;
"
```

### תוצאות

- ✅ **608 רשומות** ב-12 טבלאות חיוניות
- ✅ **נתונים אמיתיים** (לא seed data)
- ✅ **מדוייקים ב-100%** מבסיסים קיימים
- ✅ **מערכת מוכנה** לפיתוח ובדיקה מלאה

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

```text
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

## 📅 עדכונים אחרונים

- **דצמבר 2025**: הושלם שלב 1 - העתקת נתוני בסיס חיוניים לבסיס development
  - 608 רשומות ב-12 טבלאות חיוניות
  - נתונים אמיתיים מבסיסים קיימים
  - המערכת מוכנה לפיתוח מלא

- **ינואר 2025**: יצירת המדריך המקורי לבסיס production

---

**סיום המסמך**

