# דוח טבלאות בסיס הנתונים - TikTrack
## Database Tables Report

**תאריך:** 1 נובמבר 2025  
**בסיס נתונים:** `Backend/db/simpleTrade_new.db`  
**גרסה:** 1.0

---

## 📊 סיכום כללי

| מדד | ערך |
|-----|-----|
| **סה"כ טבלאות** | 33 טבלאות |
| **סה"כ רשומות** | 144,951 רשומות |

---

## 📋 רשימת טבלאות לפי מספר רשומות (מיון יורד)

| # | שם טבלה | מספר רשומות | קטגוריה |
|---|---------|-------------|---------|
| 1 | **market_data_quotes** | 112,767 | נתוני שוק |
| 2 | **data_refresh_logs** | 31,514 | לוגים |
| 3 | **preference_types** | 122 | העדפות |
| 4 | **user_preferences** | 122 | העדפות |
| 5 | **constraints** | 116 | אילוצים |
| 6 | **enum_values** | 83 | הגדרות |
| 7 | **import_sessions** | 44 | יבוא |
| 8 | **alerts** | 28 | התראות |
| 9 | **trade_plans** | 18 | תכניות מסחר |
| 10 | **tickers** | 17 | טיקרים |
| 11 | **preference_groups** | 16 | העדפות |
| 12 | **trading_accounts** | 13 | חשבונות |
| 13 | **cash_flows** | 12 | תזרימי מזומן |
| 14 | **system_setting_types** | 12 | הגדרות מערכת |
| 15 | **trades** | 12 | טריידים |
| 16 | **executions** | 11 | ביצועים |
| 17 | **tickers_backup** | 9 | גיבוי |
| 18 | **users** | 9 | משתמשים |
| 19 | **system_settings** | 8 | הגדרות מערכת |
| 20 | **note_relation_types** | 4 | הערות |
| 21 | **notes** | 4 | הערות |
| 22 | **currencies** | 3 | מטבעות |
| 23 | **external_data_providers** | 2 | נתונים חיצוניים |
| 24 | **preference_profiles** | 2 | העדפות |
| 25 | **quotes_last** | 2 | נתוני שוק |
| 26 | **system_setting_groups** | 1 | הגדרות מערכת |
| 27 | **condition_alerts_mapping** | 0 | התראות |
| 28 | **constraint_validations** | 0 | אילוצים |
| 29 | **intraday_data_slots** | 0 | נתוני שוק |
| 30 | **method_parameters** | 0 | הגדרות |
| 31 | **plan_conditions** | 0 | תכניות מסחר |
| 32 | **trade_conditions** | 0 | תנאי מסחר |
| 33 | **trading_methods** | 0 | שיטות מסחר |

---

## 📂 טבלאות לפי קטגוריות

### נתוני שוק (Market Data)
- **market_data_quotes**: 112,767 רשומות
- **quotes_last**: 2 רשומות
- **intraday_data_slots**: 0 רשומות

**סה"כ:** 112,769 רשומות

### לוגים וניטור (Logs & Monitoring)
- **data_refresh_logs**: 31,514 רשומות

**סה"כ:** 31,514 רשומות

### העדפות (Preferences)
- **preference_types**: 122 רשומות
- **user_preferences**: 122 רשומות
- **preference_groups**: 16 רשומות
- **preference_profiles**: 2 רשומות
- **user_preferences_v3**: 0 רשומות

**סה"כ:** 262 רשומות

### התראות (Alerts)
- **alerts**: 28 רשומות
- **condition_alerts_mapping**: 0 רשומות

**סה"כ:** 28 רשומות

### טריידים ומסחר (Trades & Trading)
- **trades**: 12 רשומות
- **executions**: 11 רשומות
- **trade_plans**: 18 רשומות
- **trade_conditions**: 0 רשומות
- **plan_conditions**: 0 רשומות

**סה"כ:** 41 רשומות

### טיקרים (Tickers)
- **tickers**: 17 רשומות
- **tickers_backup**: 9 רשומות
- **tickers_new**: 0 רשומות

**סה"כ:** 26 רשומות

### אילוצים (Constraints)
- **constraints**: 116 רשומות
- **constraint_validations**: 0 רשומות

**סה"כ:** 116 רשומות

### הגדרות מערכת (System Settings)
- **system_setting_types**: 12 רשומות
- **system_settings**: 8 רשומות
- **system_setting_groups**: 1 רשומה

**סה"כ:** 21 רשומות

### משתמשים וחשבונות (Users & Accounts)
- **users**: 9 רשומות
- **trading_accounts**: 13 רשומות

**סה"כ:** 22 רשומות

### הערות (Notes)
- **notes**: 4 רשומות
- **note_relation_types**: 4 רשומות

**סה"כ:** 8 רשומות

### תזרימי מזומן (Cash Flows)
- **cash_flows**: 12 רשומות

**סה"כ:** 12 רשומות

### הגדרות כלליות (General Settings)
- **enum_values**: 83 רשומות
- **currencies**: 3 רשומות
- **external_data_providers**: 2 רשומות
- **trading_methods**: 0 רשומות
- **method_parameters**: 0 רשומות

**סה"כ:** 88 רשומות

### יבוא (Import)
- **import_sessions**: 44 רשומות

**סה"כ:** 44 רשומות

---

## 📈 סטטיסטיקות נוספות

### טבלאות עם הכי הרבה רשומות (Top 5)
1. **market_data_quotes** - 112,767 (77.8% מהסה"כ)
2. **data_refresh_logs** - 31,514 (21.7% מהסה"כ)
3. **preference_types** - 122 (0.08%)
4. **user_preferences** - 122 (0.08%)
5. **constraints** - 116 (0.08%)

### טבלאות ריקות (0 רשומות)
- condition_alerts_mapping
- constraint_validations
- intraday_data_slots
- method_parameters
- plan_conditions
- trade_conditions
- trading_methods

**סה"כ:** 7 טבלאות ריקות (21.2% מכלל הטבלאות)

### טבלאות שנמחקו (1 נובמבר 2025)

2 טבלאות נמחקו:
1. **tickers_new** - טבלה זמנית למיגרציות שכבר הסתיימו ✅ נמחקה
2. **user_preferences_v3** - טבלה ישנה, הוחלפה ב-`user_preferences` ✅ נמחקה

**עדכון:** המודל `UserPreference` ב-`Backend/models/preferences.py` עודכן להשתמש ב-`user_preferences` במקום `user_preferences_v3`.

---

## 💡 הערות

1. **market_data_quotes** מכילה את רוב הנתונים (77.8%) - טבלת נתוני השוק העיקרית
2. **data_refresh_logs** מכילה לוגים רבים (21.7%) - מומלץ לשקול ניקוי תקופתי
3. **טבלאות ריקות** - 7 טבלאות ריקות, ייתכן שהן מיועדות לשימוש עתידי
4. **טבלאות שנמחקו** - 2 טבלאות נמחקו (tickers_new, user_preferences_v3) ✅

---

**עדכון אחרון:** 1 נובמבר 2025

