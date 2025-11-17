# מדריך בדיקת סקריפט יצירת בסיס נתונים מחדש

## 🎯 מטרה
לבדוק את הסקריפט `recreate_database_with_base_data.py` בלי לפגוע בבסיס הנתונים הפעיל.

## 📋 דרישות מוקדמות
- בסיס נתונים פעיל: `Backend/db/tiktrack.db`
- Python 3 מותקן
- גישה לכתיבה בתיקיית `Backend/db/`

## 🧪 שיטת בדיקה מומלצת

### אפשרות 1: שימוש בסקריפט בדיקה אוטומטי (מומלץ)

```bash
# הרצת סקריפט הבדיקה
./Backend/scripts/test_recreate_database.sh
```

הסקריפט:
1. ✅ יוצר גיבוי אוטומטי של בסיס הנתונים הפעיל
2. ✅ יוצר בסיס נתונים בדיקה (`tiktrack_test_recreate.db`)
3. ✅ מריץ את הסקריפט על בסיס הבדיקה
4. ✅ בודק את התוצאות ומציג דוח מפורט
5. ✅ לא נוגע בבסיס הנתונים הפעיל

### אפשרות 2: בדיקה ידנית

```bash
# 1. יצירת גיבוי
cp Backend/db/tiktrack.db Backend/db/tiktrack_backup_$(date +%Y%m%d_%H%M%S).db

# 2. הרצת הסקריפט על בסיס בדיקה
python3 Backend/scripts/recreate_database_with_base_data.py \
    --source-db Backend/db/tiktrack.db \
    --db-path Backend/db/tiktrack_test.db

# 3. בדיקת התוצאות
sqlite3 Backend/db/tiktrack_test.db "SELECT COUNT(*) FROM users;"
sqlite3 Backend/db/tiktrack_test.db "SELECT COUNT(*) FROM tickers;"
sqlite3 Backend/db/tiktrack_test.db "SELECT COUNT(*) FROM trades;"
```

## ✅ רשימת בדיקות

### בדיקות בסיסיות
- [ ] בסיס הנתונים נוצר בהצלחה
- [ ] מספר הטבלאות תואם למקור
- [ ] כל הטבלאות נוצרו עם המבנה הנכון

### בדיקות נתוני בסיס
- [ ] **users**: רק nimrod (id=1) קיים
- [ ] **tickers**: רק SPY (id=9) קיים
- [ ] **currencies**: כל המטבעות הועתקו
- [ ] **trading_methods**: כל השיטות הועתקו
- [ ] **preference_profiles**: כל הפרופילים הועתקו
- [ ] **user_preferences**: רק עבור user_id=1 ופרופילים קיימים

### בדיקות טבלאות ריקות
- [ ] **trades**: ריק
- [ ] **trade_plans**: ריק
- [ ] **executions**: ריק
- [ ] **cash_flows**: ריק
- [ ] **trading_accounts**: ריק
- [ ] **alerts**: ריק

### בדיקות טבלאות לא קיימות
- [ ] **tag_categories**: לא קיים
- [ ] **user_preferences_v3**: לא קיים

### בדיקות מבנה
- [ ] כל הטריגרים הועתקו
- [ ] כל האינדקסים הועתקו
- [ ] כל האילוצים (constraints) הועתקו
- [ ] כל הקשרים (foreign keys) עובדים

## 🔍 בדיקות מתקדמות

### בדיקת קשרים (Foreign Keys)
```sql
-- בדיקה שהקשרים עובדים
PRAGMA foreign_key_check;
```

### בדיקת טריגרים
```sql
-- רשימת כל הטריגרים
SELECT name FROM sqlite_master WHERE type='trigger';
```

### בדיקת אינדקסים
```sql
-- רשימת כל האינדקסים
SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_autoindex_%';
```

## 🧹 ניקוי אחרי בדיקה

לאחר שהבדיקה הושלמה בהצלחה:

```bash
# מחיקת קבצי בדיקה
rm Backend/db/tiktrack_test_recreate.db
rm Backend/db/tiktrack_backup_for_test_*.db  # אם לא רוצים לשמור גיבוי
```

## ⚠️ אזהרות

1. **אל תריץ את הסקריפט ישירות על בסיס הנתונים הפעיל** ללא גיבוי!
2. **ודא שיש מספיק מקום בדיסק** לפני הרצת הבדיקה
3. **בדוק את התוצאות** לפני שימוש בסקריפט על בסיס נתונים אמיתי

## 📝 דוגמת פלט צפוי

```
🚀 TikTrack Database Recreation Script
============================================================
📁 Source database: Backend/db/tiktrack.db
📁 Target database: Backend/db/tiktrack_test.db
============================================================

📋 TABLE CLASSIFICATION
============================================================
...

✅ Database recreation completed successfully!
📁 Target database: Backend/db/tiktrack_test.db
📊 Tables created: 35
💾 Backup saved: Backend/db/tiktrack_test.db.backup_20250115_120000

🔍 Verifying database...
✅ nimrod user verified
✅ Only 1 user in database
✅ SPY ticker verified
✅ Only 1 ticker in database
✅ Preference profiles: 2
✅ User preferences for nimrod: 113
✅ tag_categories correctly excluded
✅ user_preferences_v3 correctly excluded
✅ trades is empty
✅ trade_plans is empty
...

✅ All verifications passed!
```

## 🚀 לאחר בדיקה מוצלחת

אם כל הבדיקות עברו בהצלחה, אפשר להשתמש בסקריפט על בסיס נתונים אמיתי:

```bash
# רק אחרי שכל הבדיקות עברו!
python3 Backend/scripts/recreate_database_with_base_data.py
```

