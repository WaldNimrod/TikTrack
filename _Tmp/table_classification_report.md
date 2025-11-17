# סיווג טבלאות בסיס הנתונים - TikTrack

## 📊 סיכום כללי
- **סה"כ טבלאות**: 37
- **טבלאות עם נתוני בסיס** (יועתקו): 14
- **טבלאות ריקות** (נתוני מסחר/רשומות): 23

---

## ✅ טבלאות עם נתוני בסיס (יועתקו עם המידע המדויק הקיים)

### 1. מטבעות והגדרות בסיס
- **currencies** - מטבעות (3 רשומות)
- **users** - משתמשים (9 רשומות)
- **note_relation_types** - סוגי קשרי הערות (4 רשומות)

### 2. ספקי נתונים חיצוניים
- **external_data_providers** - ספקי נתונים חיצוניים (3 רשומות)

### 3. שיטות מסחר ותנאים
- **trading_methods** - שיטות מסחר (6 רשומות)
- **method_parameters** - פרמטרים לשיטות מסחר (19 רשומות)

### 4. העדפות משתמש
- **preference_groups** - קבוצות העדפות (16 רשומות)
- **preference_types** - סוגי העדפות (126 רשומות)

### 5. הגדרות מערכת
- **system_setting_groups** - קבוצות הגדרות מערכת (1 רשומה)
- **system_setting_types** - סוגי הגדרות מערכת (0 רשומות - אבל טבלת הגדרות)

### 6. קטגוריות תגיות
- **tag_categories** - קטגוריות תגיות (0 רשומות - אבל טבלת הגדרות)

### 7. אילוצים ואימותים
- **constraints** - אילוצים (118 רשומות)
- **enum_values** - ערכי enum (92 רשומות)
- **constraint_validations** - אימותי אילוצים (0 רשומות - אבל טבלת הגדרות)

---

## 📭 טבלאות שיווצרו ריקות (נתוני מסחר ורשומות מרכזיות)

### 1. נתוני מסחר
- **trades** - עסקאות (19 רשומות קיימות - יווצר ריק)
- **trade_plans** - תוכניות מסחר (25 רשומות קיימות - יווצר ריק)
- **executions** - ביצועים (31 רשומות קיימות - יווצר ריק)
- **cash_flows** - תזרימי מזומנים (250 רשומות קיימות - יווצר ריק)
- **plan_conditions** - תנאים לתוכניות מסחר
- **trade_conditions** - תנאים לעסקאות
- **condition_alerts_mapping** - מיפוי התראות לתנאים

### 2. חשבונות ונכסים
- **trading_accounts** - חשבונות מסחר (6 רשומות קיימות - יווצר ריק)
- **tickers** - נכסים/מניות (27 רשומות קיימות - יווצר ריק)

### 3. התראות והערות
- **alerts** - התראות (28 רשומות קיימות - יווצר ריק)
- **notes** - הערות (7 רשומות קיימות - יווצר ריק)

### 4. נתוני שוק
- **market_data_quotes** - ציטוטי נתוני שוק
- **data_refresh_logs** - לוגי רענון נתונים
- **intraday_data_slots** - נתוני תוך-יומיים
- **quotes_last** - ציטוטים אחרונים

### 5. ייבוא נתונים
- **import_sessions** - סשני ייבוא

### 6. תגיות
- **tags** - תגיות
- **tag_links** - קישורי תגיות

### 7. העדפות משתמש (רשומות)
- **user_preferences** - העדפות משתמש (גרסה ישנה)
- **user_preferences_v3** - העדפות משתמש (גרסה 3)
- **preference_profiles** - פרופילי העדפות
- **preferences_legacy** - העדפות ישנות

### 8. הגדרות מערכת (רשומות)
- **system_settings** - הגדרות מערכת (ערכים)

### 9. אחר
- **lost_and_found** - רשומות אבודות

---

## ❓ שאלות להחלטה

### 1. **trading_accounts** ו-**tickers**
- **שאלה**: האם אלה נחשבים "נתוני בסיס" או "נתוני מסחר"?
- **הצעה**: להשאיר ריקים - המשתמש יוצר אותם לפי הצורך

### 2. **system_setting_types**, **tag_categories**, **constraint_validations**
- **שאלה**: אלה טבלאות הגדרות אבל ריקות כרגע - האם להעתיק אותן בכל זאת?
- **הצעה**: כן - אלה טבלאות מבנה/הגדרות, גם אם ריקות

### 3. **preference_profiles**
- **שאלה**: האם זה נתון בסיס או רשומה משתמש?
- **הצעה**: ריק - זה פרופיל משתמש ספציפי

---

## 📝 הערות חשובות

1. **טבלאות מערכת** (sqlite_sequence, sqlite_stat1) - לא יועתקו
2. **טבלאות גיבוי** (tickers_backup, tickers_new) - לא יועתקו
3. **טריגרים ואינדקסים** - יועתקו במלואם
4. **אילוצים וקשרים** - יועתקו במלואם

---

## ✅ המלצה סופית (מאושרת)

### טבלאות עם נתונים (16):
1. **currencies** - מטבעות (3 רשומות)
2. **users** - רק משתמש אחד: nimrod (id=1)
3. **note_relation_types** - סוגי קשרי הערות (4 רשומות)
4. **external_data_providers** - ספקי נתונים חיצוניים (3 רשומות)
5. **trading_methods** - שיטות מסחר (6 רשומות)
6. **method_parameters** - פרמטרים לשיטות מסחר (19 רשומות)
7. **preference_groups** - קבוצות העדפות (16 רשומות)
8. **preference_types** - סוגי העדפות (126 רשומות)
9. **preference_profiles** - כל הפרופילים הקיימים (2 פרופילים)
10. **user_preferences** - העדפות משתמש (113 רשומות עבור user_id=1, profile_id=2)
11. **system_setting_groups** - קבוצות הגדרות מערכת (1 רשומה)
12. **system_setting_types** - סוגי הגדרות מערכת (0 רשומות - טבלת מבנה)
13. **constraints** - אילוצים (118 רשומות)
14. **enum_values** - ערכי enum (92 רשומות)
15. **constraint_validations** - אימותי אילוצים (0 רשומות - טבלת מבנה)
16. **tickers** - רק SPY אחד (id=9)

### טבלאות ריקות (21):
1. trades
2. trade_plans
3. executions
4. cash_flows
5. plan_conditions
6. trade_conditions
7. condition_alerts_mapping
8. trading_accounts
9. alerts
10. notes
11. market_data_quotes
12. data_refresh_logs
13. intraday_data_slots
14. quotes_last
15. import_sessions
16. tags
17. tag_links
18. user_preferences_v3 (לא בשימוש - לא לייצר)
19. preferences_legacy
20. system_settings
21. lost_and_found

### טבלאות שלא יווצרו:
- **tag_categories** - ריק (לא לייצר)
- **user_preferences_v3** - לא בשימוש (לא לייצר)

