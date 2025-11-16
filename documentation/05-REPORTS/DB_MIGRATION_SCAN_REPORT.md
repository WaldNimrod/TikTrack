# DB Migration – Scan Report

**Date:** 16 November 2025  
**Source Database:** `Backend/db/tiktrack.db`  
**Purpose:** סריקה מלאה של מבנה בסיס הנתונים הפעיל והשוואה למתוכנן

---

## סיכום ביצוע

### טבלאות שנמצאו ב-DB
סה"כ: **38 טבלאות** (לא כולל `lost_and_found` - טבלת SQLite פנימית)

### טבלאות חסרות ב-Models
1. **`quotes_last`** - טבלת cache לנתוני מחירים אחרונים
   - **סטטוס:** ✅ נוצר model חדש (`Backend/models/quotes_last.py`)
   - **שימוש:** Routes ו-services משתמשים בה ישירות ב-SQLite
   - **פעולה נדרשת:** עדכון routes להשתמש ב-model

### טבלאות ב-Models שלא ב-DB
1. **`cache_change_log`** - model קיים אבל לא ב-DB
   - **סטטוס:** ⚠️ לבדוק אם זו טבלה חדשה או legacy

### טבלאות שצריכות איחוד
1. **`tickers`, `tickers_backup`, `tickers_new`** → `tickers` (אחד)
   - **מקור נתונים:** `tickers_new` (המבנה העדכני ביותר)
   - **פעולה:** איחוד נתונים ל-`tickers` ב-PostgreSQL

2. **`user_preferences`, `user_preferences_v3`** → `user_preferences` (אחד)
   - **מקור נתונים:** `user_preferences_v3` (המבנה העדכני ביותר)
   - **פעולה:** איחוד נתונים ל-`user_preferences` ב-PostgreSQL

### טבלאות חדשות שלא היו בתוכנית המקורית
1. **`tag_categories`, `tags`, `tag_links`** - מערכת תגיות
   - **סטטוס:** ✅ יש models
   - **פעולה:** הוספה לתוכנית המיגרציה (קבוצה F)

2. **`preferences_legacy`** - טבלת העדפות legacy
   - **סטטוס:** ✅ יש model
   - **פעולה:** הוספה לתוכנית המיגרציה (קבוצה B)

3. **`quotes_last`** - טבלת cache לנתוני מחירים אחרונים
   - **סטטוס:** ✅ נוצר model
   - **פעולה:** הוספה לתוכנית המיגרציה (קבוצה D)

---

## השוואת מבנים

### טבלאות ב-DB שלא ב-Models (לפני תיקון)
- `quotes_last` ✅ **תוקן** - נוצר model
- `tickers_backup` ⚠️ **לא נדרש** - טבלה זמנית לאיחוד
- `tickers_new` ⚠️ **לא נדרש** - טבלה זמנית לאיחוד
- `user_preferences_v3` ⚠️ **לא נדרש** - טבלה זמנית לאיחוד
- `lost_and_found` ⚠️ **לא רלוונטי** - טבלת SQLite פנימית

### טבלאות ב-Models שלא ב-DB
- `cache_change_log` ⚠️ **לבדוק** - האם זו טבלה חדשה?

---

## עדכונים שבוצעו

### 1. יצירת Models חסרים
- ✅ `Backend/models/quotes_last.py` - model חדש ל-`quotes_last`
- ✅ עדכון `Backend/models/ticker.py` - הוספת relationship ל-`QuotesLast`
- ✅ עדכון `Backend/models/__init__.py` - הוספת `QuotesLast` ל-exports

### 2. עדכון תוכנית המיגרציה
- ✅ עדכון `documentation/05-REPORTS/DB_MIGRATION_TABLE_GROUPS.md`
- ✅ הוספת קבוצה F - מערכת תגיות
- ✅ הוספת `quotes_last` לקבוצה D
- ✅ הוספת `preferences_legacy` לקבוצה B
- ✅ הוספת `tag_links` לקבוצה A

### 3. עדכון סקריפט המיגרציה
- ✅ עדכון `scripts/db/migrate_sqlite_to_pg.py` עם טבלאות חדשות

---

## פעולות נדרשות נוספות

### 1. עדכון Routes
- [ ] `Backend/routes/api/quotes_last.py` - לעדכן להשתמש ב-SQLAlchemy במקום SQLite ישיר
- [ ] בדיקה של כל routes אחרות שמשתמשות ב-SQLite ישיר

### 2. עדכון Services
- [ ] `Backend/services/external_data/yahoo_finance_adapter.py` - לעדכן `_update_quotes_last()` להשתמש ב-model
- [ ] בדיקה של כל services אחרות שמשתמשות ב-SQLite ישיר

### 3. בדיקת Models
- [ ] לבדוק אם `cache_change_log` צריך להיות ב-DB או להסיר את ה-model
- [ ] לוודא שכל ה-relationships ב-models נכונים

### 4. בדיקת Constraints
- [ ] לבדוק אם כל ה-constraints ב-DB מתורגמים נכון ל-PostgreSQL
- [ ] לבדוק foreign keys ו-indexes

---

## רשימת טבלאות מלאה לפי קבוצות

### קבוצה A - ישויות עסקיות (Reset)
- trades ✅
- executions ✅
- trade_plans ✅
- plan_conditions ✅
- trade_conditions ✅
- condition_alerts_mapping ✅
- alerts ✅
- cash_flows ✅
- market_data_quotes ✅
- intraday_data_slots ✅
- data_refresh_logs ✅
- tickers ✅ (לאחד עם tickers_backup, tickers_new)
- trading_accounts ✅
- notes ✅
- tag_links ✅

### קבוצה B - משתמשים, העדפות ושיטות (Preserve)
- users ✅
- preference_types ✅
- preference_groups ✅
- preference_profiles ✅
- user_preferences ✅ (לאחד עם user_preferences_v3)
- user_preferences_v3 ✅ (מקור נתונים)
- preferences_legacy ✅
- trading_methods ✅
- method_parameters ✅

### קבוצה C - אילוצים וקישוריות (Preserve)
- constraints ✅
- constraint_validations ✅
- enum_values ✅
- note_relation_types ✅
- link_types ⚠️ (לבדוק אם קיים)

### קבוצה D - מטבעות ונתוני עזר פיננסיים (Preserve)
- currencies ✅
- external_data_providers ✅
- quotes_last ✅ (חדש)

### קבוצה E - מערכות תצורה ו-import (Mixed)
- import_sessions ✅
- system_setting_types ✅
- system_settings ✅
- system_setting_groups ✅
- system_setting_profiles ⚠️ (לבדוק אם קיים)
- data_refresh_logs ✅

### קבוצה F - מערכת תגיות (Preserve)
- tag_categories ✅
- tags ✅
- tag_links ✅ (בקבוצה A - קשור לישויות עסקיות)

---

## סיכום

✅ **הושלם:**
- סריקה מלאה של בסיס הנתונים
- יצירת model חסר (`quotes_last`)
- עדכון תוכנית המיגרציה
- עדכון סקריפט המיגרציה

⏳ **בתהליך:**
- עדכון routes להשתמש ב-models
- עדכון services להשתמש ב-models
- בדיקת models ו-relationships

📋 **להמשך:**
- בדיקת constraints ו-foreign keys
- בדיקת indexes
- בדיקת triggers (אם קיימים)

---

**הערה:** כל העדכונים מתועדים ב-`documentation/05-REPORTS/DB_MIGRATION_TABLE_GROUPS.md`

