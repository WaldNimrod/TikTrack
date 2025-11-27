# תהליך ניקוי נתוני משתמש - מסמך עבודה
## User Data Cleanup Process - Working Document

**תאריך יצירה:** 29 בינואר 2025  
**גרסה:** 1.0.0  
**מטרה:** הגדרת תהליך מקיף לניקוי כל נתוני המשתמש מהמערכת לצורך יצירת סט נתונים למשתמש חדש

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [שלב מקדים - שיכפול בסיס נתונים](#שלב-מקדים---שיכפול-בסיס-נתונים)
3. [שלב ניקוי המידע - טבלאות לניקוי](#שלב-ניקוי-המידע---טבלאות-לניקוי)
4. [טבלאות לבדיקה](#טבלאות-לבדיקה)
5. [טבלאות למחיקה מלאה](#טבלאות-למחיקה-מלאה)
6. [סדר ביצוע הפעולות](#סדר-ביצוע-הפעולות)

---

## 🎯 סקירה כללית

### מטרת התהליך
יצירת בסיס נתונים נקי למשתמש חדש על ידי:
1. שיכפול בסיס הנתונים הקיים
2. ניקוי כל נתוני המשתמש מהשיכפול
3. שמירה על נתוני מערכת בסיסיים

### עקרונות כלליים
- **נתוני מערכת נשמרים:** מטבעות, שיטות מסחר, ספקי נתונים, אילוצים, מבנה העדפות
- **משתמש:** **נשמר במלואו** - המשתמש הקיים במערכת נשמר (אין מערכת משתמשים מלאה עדיין, רק תשתית בסיסית)
- **נתוני משתמש נמחקים:** 
  - **הערות** (`notes`)
  - **ביצועים** (`executions`)
  - **טריידים** (`trades`)
  - **תוכניות טריידים** (`trade_plans`)
  - **חשבונות מסחר** (`trading_accounts`)
  - **תזרימי מזומן** (`cash_flows`)
  - **התראות** (`alerts`)
  - **העדפות** (ערכי `user_preferences`)
- **טיקרים:** נמחקים כולם חוץ מ-SPY (ברירת מחדל)
- **נתוני שוק:** נמחקים כולם (ציטוטים, יומנים, חריצים)
- **תנאים וסיבות:** נשמרים רק המבנה הבסיסי (trading_methods, method_parameters), נמחקים רק המיקרים הספציפיים (plan_conditions, trade_conditions)
- **תגיות:** נשמרות תגיות מובנות של ייבוא נתונים, נמחקות תגיות שהמשתמש יצר
- **פרופילים והעדפות:** נשמר רק הפרופיל הפעיל של המשתמש הקיים, נמחקים כל השאר. הערכי העדפות נמחקים (המשתמש יכול להגדיר מחדש)

### כלל כללי
**מה שאין בממשק מודול הוספת רשומה - נשמר.**
- כל טבלה שאין לה ממשק הוספה במערכת = נתון מערכת = נשמר
- כל טבלה שיש לה ממשק הוספה = נתון משתמש = נמחק (או חלקי)

---

## 🔄 שלב מקדים - שיכפול בסיס נתונים

### מטרה
יצירת עותק מלא של בסיס הנתונים הקיים לשיכפול. **כל העבודה תתבצע על השיכפול בלבד** - בסיס הנתונים המקורי לא יושפע.

### פעולות נדרשות

#### 1. יצירת בסיס נתונים חדש לשיכפול

**PostgreSQL:**
```bash
# צור database חדש
docker exec tiktrack-postgres-dev psql -U TikTrakDBAdmin -c \
  "CREATE DATABASE \"TikTrack-db-cleanup-test\" WITH OWNER = TikTrakDBAdmin ENCODING = 'UTF8';"

# העתק את כל הנתונים מהמקורי לשיכפול
docker exec tiktrack-postgres-dev pg_dump -U TikTrakDBAdmin -d TikTrack-db-development | \
  docker exec -i tiktrack-postgres-dev psql -U TikTrakDBAdmin -d TikTrack-db-cleanup-test
```

**SQLite:**
```bash
# העתק את הקובץ
cp Backend/db/tiktrack.db Backend/db/tiktrack_cleanup_test.db
```

#### 2. הגדרת בסיס הנתונים לשיכפול

**PostgreSQL:**
```bash
# הגדר את ה-DATABASE_URL לשיכפול
export POSTGRES_DB=TikTrack-db-cleanup-test
```

**SQLite:**
```bash
# הגדר את ה-DATABASE_URL לשיכפול
export DATABASE_URL=sqlite:///Backend/db/tiktrack_cleanup_test.db
```

#### 3. אימות השיכפול
- בדיקת מספר רשומות בכל טבלה
- השוואה בין בסיס הנתונים המקורי לשיכפול
- אימות תקינות Foreign Keys

**⚠️ חשוב:** כל השלבים הבאים יתבצעו על השיכפול בלבד. בסיס הנתונים המקורי לא יושפע.

---

## 🧹 שלב ניקוי המידע - טבלאות לניקוי

### קטגוריה 1: טיקרים ונתוני שוק

#### 1.1 `tickers` - טיקרים
**פעולה:** מחיקת כל הרשומות **חוץ מ-SPY**

```sql
-- שמירת SPY לפני המחיקה
CREATE TEMP TABLE spy_ticker_backup AS 
SELECT * FROM tickers WHERE symbol = 'SPY';

-- מחיקת כל הטיקרים חוץ מ-SPY
DELETE FROM tickers WHERE symbol != 'SPY';

-- אימות שנותר רק SPY
SELECT COUNT(*) FROM tickers; -- צריך להחזיר 1
SELECT symbol FROM tickers; -- צריך להחזיר 'SPY'
```

**הערות:**
- Foreign Keys עם CASCADE ימחקו אוטומטית:
  - `ticker_provider_symbols` (CASCADE)
  - `market_data_quotes` (אם יש FK)
  - `quotes_last` (אם יש FK)

#### 1.2 `market_data_quotes` - ציטוטי נתוני שוק
**פעולה:** מחיקת כל הרשומות

```sql
DELETE FROM market_data_quotes;
```

**הערות:**
- טבלה זו מכילה היסטוריית מחירים
- אין צורך בשמירת נתונים

#### 1.3 `data_refresh_logs` - יומני רענון נתונים
**פעולה:** מחיקת כל הרשומות

```sql
DELETE FROM data_refresh_logs;
```

**הערות:**
- טבלה זו מכילה לוגים של רענון נתונים
- אין צורך בשמירת נתונים

#### 1.4 `intraday_data_slots` - חריצי נתונים תוך-יומיים
**פעולה:** מחיקת כל הרשומות

```sql
DELETE FROM intraday_data_slots;
```

**הערות:**
- טבלה זו מכילה נתונים תוך-יומיים
- אין צורך בשמירת נתונים

#### 1.5 `quotes_last` - ציטוטים אחרונים
**פעולה:** מחיקת כל הרשומות

```sql
DELETE FROM quotes_last;
```

**הערות:**
- טבלה זו מכילה את הציטוט האחרון לכל טיקר
- תתעדכן מחדש עם הזמן

---

### קטגוריה 2: חשבונות מסחר ועסקאות

#### 2.1 `trading_accounts` - חשבונות מסחר
**פעולה:** מחיקת כל הרשומות

```sql
DELETE FROM trading_accounts;
```

**הערות:**
- Foreign Keys עם CASCADE ימחקו אוטומטית:
  - `trades` (CASCADE)
  - `trade_plans` (CASCADE)
  - `cash_flows` (CASCADE)
  - `import_sessions` (CASCADE)

#### 2.2 `cash_flows` - תזרימי מזומן
**פעולה:** מחיקת כל הרשומות (או CASCADE מ-trading_accounts)

```sql
-- אם לא CASCADE, למחוק ידנית:
DELETE FROM cash_flows;
```

#### 2.3 `executions` - ביצועים
**פעולה:** מחיקת כל הרשומות

```sql
DELETE FROM executions;
```

**הערות:**
- ביצועים יכולים להיות קשורים ל-trades או עצמאיים
- יש למחוק את כולם

#### 2.4 `trade_plans` - תוכניות טרייד
**פעולה:** מחיקת כל הרשומות (או CASCADE מ-trading_accounts)

```sql
-- אם לא CASCADE, למחוק ידנית:
DELETE FROM trade_plans;
```

**הערות:**
- Foreign Keys עם CASCADE ימחקו אוטומטית:
  - `plan_conditions` (CASCADE)
  - `trades` (אם יש FK ל-trade_plan)

#### 2.5 `trades` - טריידים
**פעולה:** מחיקת כל הרשומות (או CASCADE מ-trading_accounts)

```sql
-- אם לא CASCADE, למחוק ידנית:
DELETE FROM trades;
```

**הערות:**
- Foreign Keys עם CASCADE ימחקו אוטומטית:
  - `trade_conditions` (CASCADE)
  - `executions` (אם יש FK)

---

### קטגוריה 3: תנאים והתראות

**⚠️ חשוב מאוד:** רק המיקרים הספציפיים שהמשתמש יצר נמחקים. המבנה הבסיסי נשמר!

#### 3.1 `trading_methods` - שיטות מסחר (מבנה בסיסי)
**פעולה:** **לא למחוק - נשמר!**

**הערות:**
- טבלה זו מכילה את המבנה הבסיסי של שיטות המסחר
- אין ממשק הוספה למשתמש - זה נתון מערכת
- **לא לגעת בטבלה זו**

#### 3.2 `method_parameters` - פרמטרים של שיטות (מבנה בסיסי)
**פעולה:** **לא למחוק - נשמר!**

**הערות:**
- טבלה זו מכילה את הפרמטרים של כל שיטת מסחר
- אין ממשק הוספה למשתמש - זה נתון מערכת
- **לא לגעת בטבלה זו**

#### 3.3 `plan_conditions` - תנאים של תוכניות (מיקרים ספציפיים)
**פעולה:** מחיקת כל הרשומות (או CASCADE מ-trade_plans)

```sql
-- אם לא CASCADE, למחוק ידנית:
DELETE FROM plan_conditions;
```

**הערות:**
- רק המיקרים הספציפיים שהמשתמש יצר נמחקים
- המבנה הבסיסי (`trading_methods`, `method_parameters`) נשמר
- Foreign Keys עם CASCADE ימחקו אוטומטית:
  - `condition_alerts_mapping` (אם יש FK)

#### 3.4 `trade_conditions` - תנאים של עסקאות (מיקרים ספציפיים)
**פעולה:** מחיקת כל הרשומות (או CASCADE מ-trades)

```sql
-- אם לא CASCADE, למחוק ידנית:
DELETE FROM trade_conditions;
```

**הערות:**
- רק המיקרים הספציפיים שהמשתמש יצר נמחקים
- המבנה הבסיסי (`trading_methods`, `method_parameters`) נשמר
- Foreign Keys עם CASCADE ימחקו אוטומטית:
  - `condition_alerts_mapping` (אם יש FK)

#### 3.3 `condition_alerts_mapping` - מיפוי התראות לתנאים
**פעולה:** מחיקת כל הרשומות (או CASCADE)

```sql
DELETE FROM condition_alerts_mapping;
```

#### 3.4 `alerts` - התראות
**פעולה:** מחיקת כל הרשומות

```sql
DELETE FROM alerts;
```

**הערות:**
- התראות יכולות להיות קשורות ל-trades, trade_plans, או tickers
- יש למחוק את כולם

---

### קטגוריה 4: הערות ותגיות

#### 4.1 `notes` - הערות
**פעולה:** מחיקת כל הרשומות

```sql
DELETE FROM notes;
```

**הערות:**
- הערות קשורות לישויות דרך `related_type_id` ו-`related_id`
- יש למחוק את כולם

#### 4.2 `tag_categories` - קטגוריות תגים
**פעולה:** מחיקה חלקית - רק קטגוריות שהמשתמש יצר

```sql
-- שמירת קטגוריות מובנות של ייבוא נתונים
-- קטגוריות ששמן מתחיל ב"ייבוא נתונים" נשמרות

-- מחיקת קטגוריות שהמשתמש יצר (לא מובנות)
DELETE FROM tag_categories 
WHERE name NOT LIKE 'ייבוא נתונים%';
```

**הערות:**
- **נשמרות:** קטגוריות ששמן מתחיל ב"ייבוא נתונים" (למשל: "ייבוא נתונים IBKR", "ייבוא נתונים Demo")
- **נמחקות:** כל שאר הקטגוריות שהמשתמש יצר
- Foreign Keys עם CASCADE ימחקו אוטומטית:
  - `tags` (CASCADE) - אבל רק תגים של קטגוריות שנמחקו

#### 4.3 `tags` - תגים
**פעולה:** מחיקה חלקית - רק תגים שהמשתמש יצר

```sql
-- שמירת תגים מובנים של ייבוא נתונים
-- תגים ששייכים לקטגוריות "ייבוא נתונים" נשמרים

-- מחיקת תגים שהמשתמש יצר (לא מובנים)
DELETE FROM tags 
WHERE category_id NOT IN (
    SELECT id FROM tag_categories 
    WHERE name LIKE 'ייבוא נתונים%'
);
```

**הערות:**
- **נשמרות:** תגים ששייכים לקטגוריות "ייבוא נתונים"
  - תגים מובנים: 'Dividends', 'Interest', 'Deposits & Withdrawals', 'Withholding Tax', 'Borrow Fee Details', 'Transfers', 'Forex Conversion'
- **נמחקות:** כל שאר התגים שהמשתמש יצר
- Foreign Keys עם CASCADE ימחקו אוטומטית:
  - `tag_links` (CASCADE) - אבל רק קישורים של תגים שנמחקו

#### 4.4 `tag_links` - קישורי תגים
**פעולה:** מחיקת כל הרשומות (או CASCADE מ-tags)

```sql
-- אם לא CASCADE, למחוק ידנית:
DELETE FROM tag_links;
```

**הערות:**
- כל הקישורים נמחקים (גם של תגים מובנים)
- הקישורים ייווצרו מחדש בעת ייבוא נתונים חדש

---

### קטגוריה 5: העדפות משתמש

#### 5.1 `preference_profiles` - פרופילי העדפות
**פעולה:** שמירת רק הפרופיל הפעיל של המשתמש הקיים, מחיקת כל השאר

```sql
-- שלב 1: זיהוי המשתמש הקיים במערכת
SELECT id, username FROM users LIMIT 1;  -- המשתמש הקיים (נוצר ידנית)

-- שלב 2: זיהוי הפרופיל הפעיל של המשתמש הקיים
SELECT id, user_id, profile_name, is_active, is_default 
FROM preference_profiles 
WHERE is_active = TRUE 
  AND user_id = (SELECT id FROM users LIMIT 1);

-- שלב 3: מחיקת כל הפרופילים חוץ מהפרופיל הפעיל של המשתמש הקיים
DELETE FROM preference_profiles 
WHERE is_active = FALSE 
   OR user_id != (SELECT id FROM users LIMIT 1);

-- שלב 4: אימות שנותר רק פרופיל אחד (הפרופיל הפעיל)
SELECT COUNT(*) FROM preference_profiles; -- צריך להחזיר 1
SELECT id, profile_name, is_active FROM preference_profiles; -- צריך להציג רק את הפרופיל הפעיל
```

**הערות חשובות:**
- **⚠️ חשוב:** המשתמש הקיים במערכת **נשמר במלואו** (אין מערכת משתמשים מלאה עדיין)
- **נשמר:** רק הפרופיל הפעיל (`is_active = TRUE`) של המשתמש הקיים במערכת
- **נמחקים:** כל שאר הפרופילים
- Foreign Keys עם CASCADE ימחקו אוטומטית:
  - `user_preferences` (CASCADE) - אבל רק של פרופילים שנמחקו

#### 5.2 `user_preferences` - העדפות משתמש
**פעולה:** מחיקת כל ההעדפות (כי הפרופיל נשמר אבל הערכים מתחילים מחדש)

```sql
-- מחיקת כל העדפות המשתמש
DELETE FROM user_preferences;
```

**הערות חשובות:**
- **לא למחוק את מבנה ההעדפות** (`preference_types`, `preference_groups`) - נשמר!
- **הפרופיל נשמר** (`preference_profiles`) - רק הערכים נמחקים
- המשתמש יכול להגדיר מחדש את העדפותיו בפרופיל שנשמר

---

### קטגוריה 6: ייבוא וניהול

#### 6.1 `import_sessions` - סשני ייבוא
**פעולה:** מחיקת כל הרשומות (או CASCADE מ-trading_accounts)

```sql
-- אם לא CASCADE, למחוק ידנית:
DELETE FROM import_sessions;
```

---

## 🔍 טבלאות לבדיקה

### `ticker_provider_symbols` - סמלי ספקים

#### מבנה הטבלה

```sql
CREATE TABLE ticker_provider_symbols (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- או SERIAL ב-PostgreSQL
    ticker_id INTEGER NOT NULL,
    provider_id INTEGER NOT NULL,
    provider_symbol VARCHAR(50) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- או TIMESTAMP WITH TIME ZONE ב-PostgreSQL
    updated_at DATETIME,  -- או TIMESTAMP WITH TIME ZONE ב-PostgreSQL
    
    CONSTRAINT uq_ticker_provider_symbols_ticker_provider 
        UNIQUE (ticker_id, provider_id),
    CONSTRAINT fk_ticker_provider_symbols_ticker 
        FOREIGN KEY (ticker_id) REFERENCES tickers(id) ON DELETE CASCADE,
    CONSTRAINT fk_ticker_provider_symbols_provider 
        FOREIGN KEY (provider_id) REFERENCES external_data_providers(id)
);

-- Indexes
CREATE INDEX idx_ticker_provider_symbols_ticker_id ON ticker_provider_symbols(ticker_id);
CREATE INDEX idx_ticker_provider_symbols_provider_id ON ticker_provider_symbols(provider_id);
CREATE INDEX idx_ticker_provider_symbols_provider_symbol ON ticker_provider_symbols(provider_symbol);
```

#### שדות הטבלה

| שם שדה | טיפוס | אילוצים | תיאור |
|---------|-------|---------|-------|
| `id` | INTEGER/SERIAL | PRIMARY KEY, AUTO_INCREMENT | מזהה ייחודי |
| `ticker_id` | INTEGER | NOT NULL, FK → tickers.id (CASCADE) | מזהה טיקר |
| `provider_id` | INTEGER | NOT NULL, FK → external_data_providers.id | מזהה ספק נתונים |
| `provider_symbol` | VARCHAR(50) | NOT NULL | סמל בפורמט של הספק (למשל: '500X.MI') |
| `is_primary` | BOOLEAN | NOT NULL, DEFAULT FALSE | האם זה המיפוי הראשי לספק זה |
| `created_at` | DATETIME/TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | תאריך יצירה |
| `updated_at` | DATETIME/TIMESTAMP | NULL | תאריך עדכון אחרון |

#### 3 רשומות דוגמה

```json
[
  {
    "id": 1,
    "ticker_id": 5,
    "provider_id": 1,
    "provider_symbol": "AAPL",
    "is_primary": true,
    "created_at": "2025-01-15 10:30:00",
    "updated_at": null
  },
  {
    "id": 2,
    "ticker_id": 12,
    "provider_id": 1,
    "provider_symbol": "500X.MI",
    "is_primary": true,
    "created_at": "2025-01-16 14:20:00",
    "updated_at": "2025-01-20 09:15:00"
  },
  {
    "id": 3,
    "ticker_id": 5,
    "provider_id": 2,
    "provider_symbol": "AAPL.US",
    "is_primary": false,
    "created_at": "2025-01-15 10:35:00",
    "updated_at": null
  }
]
```

#### החלטה: מה לעשות עם הטבלה?

**פעולה:** שמירה רק של רשומות הטיקר היחיד שנשמר במערכת (SPY), מחיקת כל השאר

```sql
-- שלב 1: זיהוי מזהה הטיקר היחיד שנשמר (SPY)
SELECT id, symbol FROM tickers WHERE symbol = 'SPY';
-- שמור את ה-id שהתקבל (למשל: spy_id = 9)

-- שלב 2: מחיקת כל הרשומות חוץ מאלו של הטיקר היחיד שנשמר
DELETE FROM ticker_provider_symbols 
WHERE ticker_id NOT IN (SELECT id FROM tickers WHERE symbol = 'SPY');

-- שלב 3: אימות שנותרו רק רשומות של הטיקר היחיד שנשמר
SELECT COUNT(*) FROM ticker_provider_symbols; 
SELECT tps.*, t.symbol 
FROM ticker_provider_symbols tps
JOIN tickers t ON tps.ticker_id = t.id;
-- צריך להציג רק רשומות של SPY
```

**הערות:**
- הטבלה מכילה מיפוי של טיקרים לסמלי ספקים חיצוניים
- מכיוון שרק טיקר אחד נשמר במערכת (SPY), רק הרשומות שלו נשמרות
- אם יש Foreign Key עם `ON DELETE CASCADE` מ-`tickers`, הרשומות של טיקרים שנמחקו יימחקו אוטומטית
- אבל צריך לוודא שנותרו רק רשומות של הטיקר היחיד שנשמר
- אם אין CASCADE, יש למחוק ידנית כפי שמוצג לעיל

---

## 🗑️ טבלאות למחיקה מלאה

**⚠️ הערה:** טבלת `preferences_legacy` הוסרה מהמסמך לאחר בדיקה ומחיקה מהבסיס הנתונים הפעיל.

---

## 🚫 טבלאות אסורות - אסור לגעת בהן!

### רשימת טבלאות שאסור למחוק או לשנות

**⚠️ אזהרה:** הטבלאות הבאות הן נתוני מערכת בסיסיים. **אסור למחוק או לשנות אותן!**

| # | שם טבלה | סיבה | הערות |
|---|---------|------|-------|
| 1 | `currencies` | מטבעות בסיסיים | נתוני מערכת - נשמר |
| 2 | `external_data_providers` | ספקי נתונים חיצוניים | נתוני מערכת - נשמר |
| 3 | `trading_methods` | שיטות מסחר (מבנה) | מבנה בסיסי - נשמר |
| 4 | `method_parameters` | פרמטרים של שיטות | מבנה בסיסי - נשמר |
| 5 | `note_relation_types` | סוגי קשרים להערות | נתוני מערכת - נשמר |
| 6 | `preference_groups` | קבוצות העדפות (מבנה) | מבנה בסיסי - נשמר |
| 7 | `preference_types` | סוגי העדפות (מבנה) | מבנה בסיסי - נשמר |
| 8 | `constraints` | אילוצים | נתוני מערכת - נשמר |
| 9 | `enum_values` | ערכי enum | נתוני מערכת - נשמר |
| 10 | `constraint_validations` | אימותי אילוצים | נתוני מערכת - נשמר |
| 11 | `system_setting_groups` | קבוצות הגדרות מערכת | נתוני מערכת - נשמר |
| 12 | `system_setting_types` | סוגי הגדרות מערכת | נתוני מערכת - נשמר |
| 13 | `system_settings` | הגדרות מערכת | נתוני מערכת - נשמר |

### טבלאות עם ניקוי חלקי

| # | שם טבלה | פעולה | הערות |
|---|---------|-------|-------|
| 1 | `users` | **שמירה מלאה** | המשתמש הקיים נשמר (אין מערכת משתמשים מלאה עדיין) |
| 2 | `tickers` | שמירת SPY בלבד | רק טיקר SPY נשמר |
| 3 | `preference_profiles` | שמירת פרופיל פעיל | רק הפרופיל הפעיל של המשתמש הקיים |
| 4 | `tag_categories` | שמירת קטגוריות ייבוא | רק קטגוריות "ייבוא נתונים" |
| 5 | `tags` | שמירת תגים מובנים | רק תגים של קטגוריות ייבוא |
| 6 | `ticker_provider_symbols` | שמירת רשומות SPY | רק רשומות של טיקר SPY |

---

## 📝 סדר ביצוע הפעולות

**⚠️ חשוב:** הסדר הבא נקבע למניעת בעיות תלויות (Foreign Keys). יש לבצע בדיוק לפי הסדר!

### שלב 1: הכנות מקדימות ושיכפול
1. ✅ יצירת בסיס נתונים חדש לשיכפול
2. ✅ העתקת כל הנתונים מהמקורי לשיכפול
3. ✅ הגדרת DATABASE_URL לשיכפול
4. ✅ אימות השיכפול (מספר רשומות, תקינות Foreign Keys)

**⚠️ חשוב:** כל העבודה תתבצע על השיכפול בלבד. בסיס הנתונים המקורי לא יושפע.

### שלב 2: הערות והתראות
1. ✅ מחיקת `notes` - כל ההערות
2. ✅ מחיקת `alerts` - כל ההתראות
3. ✅ מחיקת `condition_alerts_mapping` - מיפוי התראות לתנאים

**הערות:**
- שלב זה מוקדם כדי למנוע תלויות מ-trades, trade_plans וכו'
- התראות יכולות להיות קשורות לישויות שונות, אבל הן עצמאיות

### שלב 3: תזרימי מזומן וביצועים
1. ✅ מחיקת `cash_flows` - כל תזרימי המזומן
2. ✅ מחיקת `executions` - כל הביצועים

**הערות:**
- ביצועים יכולים להיות קשורים ל-trades או עצמאיים
- תזרימי מזומן קשורים ל-trading_accounts, אבל נמחקים לפני כדי למנוע תלויות

### שלב 4: תנאים וסיבות
1. ✅ **לא למחוק** `trading_methods` - נשמר! (מבנה בסיסי)
2. ✅ **לא למחוק** `method_parameters` - נשמר! (מבנה בסיסי)
3. ✅ מחיקת `plan_conditions` - תנאים של תוכניות (מיקרים ספציפיים)
4. ✅ מחיקת `trade_conditions` - תנאים של עסקאות (מיקרים ספציפיים)

**הערות:**
- רק המיקרים הספציפיים שהמשתמש יצר נמחקים
- המבנה הבסיסי (trading_methods, method_parameters) נשמר

### שלב 5: תוכניות טריידים וטריידים
1. ✅ מחיקת `trade_plans` - כל תוכניות הטרייד
2. ✅ מחיקת `trades` - כל הטריידים

**הערות:**
- תוכניות טריידים קשורות ל-trading_accounts, אבל נמחקות לפני כדי למנוע תלויות
- טריידים קשורים ל-trade_plans, אבל נמחקים אחרי trade_plans

### שלב 6: סשני ייבוא ותגיות
1. ✅ מחיקת `import_sessions` - כל סשני הייבוא
2. ✅ מחיקת `tag_links` - כל קישורי התגים
3. ✅ מחיקת `tags` חלקית - רק תגים שהמשתמש יצר (שמירת תגים מובנים של ייבוא)
4. ✅ מחיקת `tag_categories` חלקית - רק קטגוריות שהמשתמש יצר (שמירת "ייבוא נתונים")

**הערות:**
- תגיות מובנות של ייבוא נשמרות (קטגוריות "ייבוא נתונים" ותגים שלהן)
- סשני ייבוא קשורים ל-trading_accounts, אבל נמחקים לפני

### שלב 7: חשבונות מסחר
1. ✅ מחיקת `trading_accounts` - כל חשבונות המסחר

**הערות:**
- שלב זה מאוחר כדי שכל התלויות כבר נמחקו
- אם יש CASCADE, זה ימחק אוטומטית: trades, trade_plans, cash_flows, import_sessions
- אבל כבר מחקנו אותם בשלבים הקודמים

### שלב 8: טיקרים ומחירים
1. ✅ שמירת SPY, מחיקת כל הטיקרים חוץ מ-SPY
2. ✅ אימות שנותר רק SPY
3. ✅ ניקוי `ticker_provider_symbols` - שמירה רק של רשומות הטיקר היחיד שנשמר (SPY)
4. ✅ מחיקת `market_data_quotes` - כל ציטוטי נתוני השוק
5. ✅ מחיקת `data_refresh_logs` - כל יומני רענון הנתונים
6. ✅ מחיקת `intraday_data_slots` - כל חריצי הנתונים התוך-יומיים
7. ✅ מחיקת `quotes_last` - כל הציטוטים האחרונים

**הערות:**
- שלב זה מאוחר כדי שכל התלויות כבר נמחקו
- רק טיקר SPY נשמר
- רק רשומות `ticker_provider_symbols` של SPY נשמרות

### שלב 9: העדפות ופרופילים
1. ✅ **לא למחוק** `preference_groups` - נשמר! (מבנה בסיסי)
2. ✅ **לא למחוק** `preference_types` - נשמר! (מבנה בסיסי)
3. ✅ **לא למחוק** `users` - המשתמש הקיים נשמר במלואו (אין מערכת משתמשים מלאה עדיין)
4. ✅ שמירת רק הפרופיל הפעיל של המשתמש הקיים ב-`preference_profiles`, מחיקת כל השאר
5. ✅ מחיקת כל `user_preferences` - כל הערכים (הפרופיל נשמר)

**הערות:**
- ⚠️ **המשתמש הקיים נשמר במלואו** - אין מערכת משתמשים מלאה עדיין, רק תשתית בסיסית
- נשמר רק הפרופיל הפעיל (`is_active=TRUE`) של המשתמש הקיים במערכת
- כל הערכים נמחקים, המשתמש יכול להגדיר מחדש

### שלב 10: בדיקות סופיות
1. ✅ ספירת רשומות בכל טבלה
2. ✅ בדיקת Foreign Keys תקינים
3. ✅ בדיקת תקינות בסיס הנתונים
4. ✅ בדיקת שנותר רק SPY בטיקרים
5. ✅ בדיקת שנותר רק הפרופיל הפעיל של המשתמש היחיד
6. ✅ בדיקת שתגיות מובנות של ייבוא נשמרו
7. ✅ בדיקת שתנאים בסיסיים נשמרו (trading_methods, method_parameters)
8. ✅ **הרצת השרת מול בסיס הנתונים החדש** לבדיקה ותיקונים בהתאם לצורך

### שלב 10.5: עצירה לבדיקה ידנית בדפדפן ⏸️

**⚠️ עצירה חובה לפני המשך!**

לפני המשך לפייז 2, יש לבצע בדיקה ידנית מלאה של בסיס הנתונים הנקי:

1. ✅ **הרצת השרת** מול בסיס הנתונים החדש
2. ✅ **פתיחת המערכת בדפדפן** ובדיקת כל הדפים
3. ✅ **אימות תקינות:**
   - אין שגיאות בקונסול
   - כל הדפים נטענים כראוי
   - אין נתוני משתמש ישנים
   - רק SPY בטיקרים
   - רק פרופיל פעיל אחד
4. ✅ **אישור המשתמש** להמשך לפייז 2 (אופציונלי)

**רק לאחר אישור המשתמש** - ניתן להמשיך לפייז 2 (יצירת נתוני דוגמה).

---

## 🎨 פייז 2: יצירת נתוני דוגמה (אופציונלי)

### מטרה
יצירת בסיס נתונים עם נתוני דוגמה מלאים המאפשרים הדגמה מרשימה של כל יכולות המערכת.

### מתי להשתמש בפייז זה?
- ✅ לאחר השלמת פייז 1 (ניקוי נתונים) ואישור בדיקה ידנית
- ✅ כאשר רוצים להדגים את המערכת עם נתונים ריאליסטיים
- ✅ לצורך פרזנטציות והדגמות
- ✅ לבדיקות UI עם נתונים מלאים

### מה יוצר הפייז?
הפייז יוצר נתוני דוגמה מלאים:

- **50 טיקרים** - מגוון סוגים ומטבעות
- **3 חשבונות מסחר:**
  - חשבון ראשי: 70% מהפעילות, כל הסווינג
  - חשבון פנסיוני: השקעות ארוכות טווח
  - חשבון מטבע אחר: ILS/EUR, השקעות ארוכות טווח
- **120 תוכניות טרייד** - 50% סווינג, 90% לונג
- **80 טריידים** - 70% מתוכניות, 30% עצמאיים
- **ביצועים** - לכל טרייד לפחות 2 ביצועים
- **תזרימי מזומן** - הפקדות, משיכות, דיבידנדים, עמלות
- **התראות** - על טיקרים, טריידים ותוכניות
- **הערות** - על כל סוגי הישויות

### פיזור תאריכים
- **40% מהנתונים** בחצי שנה האחרונה
- **מתוכם 70%** בשלושת החודשים האחרונים
- **60% מהנתונים** בשנה וחצי הקודמת
- **סך הכל:** כשנתיים אחורה (ממועד ביצוע הסקריפט)

### מאפיינים נוספים
- **90% פעילות בדולרים**, 10% במטבעות אחרים
- **בעיקר פוזיציות לונג** (90%)
- **50% השקעות מסוג סווינג**
- **קישורים מלאים ונכונים** בין כל הישויות

### איך להריץ?

#### שיטה 1: הרצה ישירה
```bash
cd Backend
python3 scripts/generate_demo_data.py
```

#### שיטה 2: עם פרמטרים
```bash
python3 Backend/scripts/generate_demo_data.py --help
```

### דוקומנטציה
למדריך מפורט, ראה: [DEMO_DATA_GENERATION_GUIDE.md](DEMO_DATA_GENERATION_GUIDE.md)

### הערות חשובות
- ⚠️ **הפייז אופציונלי** - ניתן לדלג עליו אם לא נדרשים נתוני דוגמה
- ⚠️ **הסקריפט בודק את מבנה DB** לפני יצירה - אם יש שינויים, יודיע בבירור
- ⚠️ **כל שגיאה תכלול מיקום מדויק** לניווט מהיר ותיקון קל
- ✅ **הנתונים ריאליסטיים** עם קשרים נכונים ולוגיים

---

## 📊 סיכום טבלאות

### טבלאות לניקוי (מחיקת כל הרשומות)

| # | שם טבלה | פעולה | הערות |
|---|---------|-------|-------|
| 1 | `tickers` | מחיקה חוץ מ-SPY | שמירת SPY, מחיקת השאר |
| 2 | `market_data_quotes` | מחיקה מלאה | |
| 3 | `data_refresh_logs` | מחיקה מלאה | |
| 4 | `intraday_data_slots` | מחיקה מלאה | |
| 5 | `quotes_last` | מחיקה מלאה | |
| 6 | `trading_accounts` | מחיקה מלאה | CASCADE: trades, trade_plans, cash_flows, import_sessions |
| 7 | `cash_flows` | מחיקה מלאה | או CASCADE |
| 8 | `executions` | מחיקה מלאה | |
| 9 | `notes` | מחיקה מלאה | |
| 10 | `alerts` | מחיקה מלאה | |
| 11 | `trade_plans` | מחיקה מלאה | או CASCADE |
| 12 | `trades` | מחיקה מלאה | או CASCADE |
| 13 | `user_preferences` | מחיקה מלאה | כל הערכים נמחקים, הפרופיל נשמר |
| 14 | `preference_profiles` | מחיקה חלקית | רק הפרופיל הפעיל של המשתמש היחיד נשמר |
| 15 | `tag_categories` | מחיקה חלקית | רק קטגוריות "ייבוא נתונים" נשמרות |
| 16 | `tags` | מחיקה חלקית | רק תגים מובנים של ייבוא נשמרים |

### טבלאות לבדיקה

| # | שם טבלה | פעולה | הערות |
|---|---------|-------|-------|
| 1 | `ticker_provider_symbols` | שמירה חלקית | שמירה רק של רשומות SPY |

### טבלאות למחיקה מלאה

**⚠️ הערה:** טבלת `preferences_legacy` הוסרה מהמסמך לאחר בדיקה ומחיקה מהבסיס הנתונים הפעיל.

---

## ✅ רשימת בדיקות סופית

לאחר ביצוע כל הפעולות, יש לבדוק:

- [ ] בסיס הנתונים השיכפול קיים ונפרד מהמקורי
- [ ] כל נתוני השוק נמחקו (5 טבלאות)
- [ ] נותר רק טיקר SPY ב-`tickers`
- [ ] כל חשבונות המסחר נמחקו
- [ ] כל העסקאות נמחקו
- [ ] כל ההתראות נמחקו
- [ ] כל ההערות נמחקו
- [ ] תגיות מובנות של ייבוא נשמרו (קטגוריות "ייבוא נתונים" ותגים שלהן)
- [ ] תגיות שהמשתמש יצר נמחקו
- [ ] הפרופיל הפעיל של המשתמש היחיד נשמר, כל השאר נמחקו
- [ ] העדפות המשתמש נמחקו (הערכים, הפרופיל נשמר)
- [ ] מבנה התנאים נשמר (trading_methods, method_parameters)
- [ ] רק מיקרים ספציפיים של תנאים נמחקו (plan_conditions, trade_conditions)
- [ ] הרצת השרת מול בסיס הנתונים החדש - בדיקה ותיקונים בהתאם לצורך
- [ ] Foreign Keys תקינים
- [ ] בסיס הנתונים תקין ופועל

---

**סיום המסמך**

