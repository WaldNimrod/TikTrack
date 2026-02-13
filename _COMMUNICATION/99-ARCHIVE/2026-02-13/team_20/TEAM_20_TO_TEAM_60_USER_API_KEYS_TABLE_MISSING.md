# Team 20 → Team 60: טבלת user_api_keys חסרה במסד הנתונים

**תאריך:** 2026-02-01  
**מאת:** Team 20 (Backend)  
**אל:** Team 60 (DevOps)  
**נושא:** טבלת user_api_keys חסרה במסד הנתונים  
**סטטוס:** 🔴 **דרוש טיפול**

---

## 🔴 בעיה

**תסמינים:**
- Frontend מנסה לטעון API keys ומקבל שגיאת 500
- שגיאה: `relation "user_data.user_api_keys" does not exist`

**סיבה:**
- הטבלה `user_data.user_api_keys` לא קיימת במסד הנתונים
- ה-DDL script לא הוריץ או שהטבלה לא נוצרה

---

## ✅ פתרון

**קובץ:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_USER_API_KEYS_TABLE.sql`

**פעולה נדרשת:**
1. להריץ את ה-SQL script על מסד הנתונים
2. לוודא שהטבלה נוצרה בהצלחה
3. לבדוק שה-indexes נוצרו

**בדיקה:**
```sql
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'user_data'
    AND tablename = 'user_api_keys';
```

---

## 📋 פרטי הטבלה

**שם:** `user_data.user_api_keys`  
**תפקיד:** אחסון מפתחות API מוצפנים למשתמשים (multi-provider)  
**תכונות:**
- הצפנת API keys לפני אחסון
- תמיכה במספר providers (IBKR, Polygon, etc.)
- Rate limiting ו-quota management
- Verification status

**Indexes:**
- `idx_user_api_keys_user_id` - למציאת keys לפי user
- `idx_user_api_keys_provider` - למציאת keys לפי provider
- `idx_user_api_keys_verified` - למציאת keys לפי verification status
- `idx_user_api_keys_config` - GIN index ל-JSONB config

---

## 🔗 קבצים קשורים

1. **SQL Script:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_USER_API_KEYS_TABLE.sql`
2. **Full DDL:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (שורות 1132-1194)
3. **Model:** `api/models/identity.py` - `UserApiKey` class

---

## ⚠️ הערות חשובות

1. **אבטחה:** הטבלה מכילה API keys מוצפנים - חשוב לוודא שהצפנה מופעלת
2. **Backup:** לפני הרצת ה-script, מומלץ לבצע backup למסד הנתונים
3. **Testing:** אחרי יצירת הטבלה, לבדוק שה-endpoint `/api/v1/user/api-keys` עובד

---

**Team 20 (Backend)**  
**Date:** 2026-02-01  
**Status:** 🔴 **REQUIRES DB UPDATE**
