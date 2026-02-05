# Team 20 → Team 60: יצירת טבלת user_api_keys במסד הנתונים

**תאריך:** 2026-02-01  
**מאת:** Team 20 (Backend)  
**אל:** Team 60 (DevOps)  
**נושא:** יצירת טבלת user_api_keys במסד הנתונים  
**סטטוס:** 🔴 **דרוש טיפול דחוף**

---

## 🔴 בעיה

**תסמינים:**
- Frontend מנסה לטעון API keys ומקבל שגיאת 500
- שגיאה: `relation "user_data.user_api_keys" does not exist`
- Endpoint: `GET /api/v1/user/api-keys` מחזיר 500

**סיבה:**
- הטבלה `user_data.user_api_keys` לא קיימת במסד הנתונים
- ה-DDL script לא הוריץ או שהטבלה לא נוצרה

---

## ✅ פעולה נדרשת

### שלב 1: הרצת SQL Script
**קובץ:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_USER_API_KEYS_TABLE.sql`

**פקודה:**
```bash
psql -U <username> -d <database_name> -f documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_USER_API_KEYS_TABLE.sql
```

או דרך psql:
```sql
\i documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_USER_API_KEYS_TABLE.sql
```

### שלב 2: אימות יצירת הטבלה
**בדיקה:**
```sql
-- בדיקת קיום הטבלה
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'user_data'
    AND tablename = 'user_api_keys';

-- בדיקת Indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'user_data'
    AND tablename = 'user_api_keys'
ORDER BY indexname;

-- בדיקת Constraints
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'user_data.user_api_keys'::regclass;
```

### שלב 3: בדיקת Endpoint
**לאחר יצירת הטבלה:**
```bash
# Login לקבלת token
TOKEN=$(curl -s -X POST http://localhost:8082/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"TikTrackAdmin","password":"4181"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# בדיקת list API keys
curl -X GET http://localhost:8082/api/v1/user/api-keys \
  -H "Authorization: Bearer $TOKEN"
```

**תגובה צפויה:** `[]` (רשימה ריקה) או רשימת API keys

---

## 📋 פרטי הטבלה

**שם:** `user_data.user_api_keys`  
**תפקיד:** אחסון מפתחות API מוצפנים למשתמשים (multi-provider)  
**תכונות:**
- הצפנת API keys לפני אחסון
- תמיכה במספר providers (IBKR, Polygon, Yahoo Finance, etc.)
- Rate limiting ו-quota management
- Verification status

**Columns עיקריים:**
- `id` (UUID, PK)
- `user_id` (UUID, FK to users)
- `provider` (ENUM: IBKR, POLYGON, etc.)
- `provider_label` (VARCHAR(100))
- `api_key_encrypted` (TEXT) - **מוצפן!**
- `api_secret_encrypted` (TEXT) - **מוצפן!**
- `is_active` (BOOLEAN)
- `is_verified` (BOOLEAN)
- `rate_limit_per_minute`, `rate_limit_per_day`
- `quota_used_today`

**Indexes:**
- `idx_user_api_keys_user_id` - למציאת keys לפי user
- `idx_user_api_keys_provider` - למציאת keys לפי provider
- `idx_user_api_keys_verified` - למציאת keys לפי verification status
- `idx_user_api_keys_config` - GIN index ל-JSONB config

**Constraints:**
- `user_api_keys_unique_user_provider` - UNIQUE (user_id, provider, provider_label) WHERE deleted_at IS NULL
- `user_api_keys_encrypted_not_empty` - CHECK (LENGTH(api_key_encrypted) > 0)
- `user_api_keys_rate_limit_positive` - CHECK (rate_limit_per_minute IS NULL OR rate_limit_per_minute > 0)
- `user_api_keys_quota_logic` - CHECK (quota_used_today >= 0)

---

## 🔗 קבצים קשורים

1. **SQL Script:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_USER_API_KEYS_TABLE.sql`
2. **Full DDL:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (שורות 1132-1194)
3. **Model:** `api/models/identity.py` - `UserApiKey` class (שורות 200-294)
4. **Router:** `api/routers/api_keys.py` - API endpoints

---

## ⚠️ הערות חשובות

1. **אבטחה:** הטבלה מכילה API keys מוצפנים - חשוב לוודא שהצפנה מופעלת
2. **Backup:** לפני הרצת ה-script, מומלץ לבצע backup למסד הנתונים
3. **Testing:** אחרי יצירת הטבלה, לבדוק שה-endpoint `/api/v1/user/api-keys` עובד
4. **Documentation:** יש לתעד את ביצוע הפעולה ולוודא שהטבלה נוצרה בהצלחה

---

## 📋 Checklist לביצוע

- [ ] Backup למסד הנתונים
- [ ] הרצת SQL script
- [ ] אימות יצירת הטבלה
- [ ] אימות יצירת Indexes
- [ ] אימות יצירת Constraints
- [ ] בדיקת Endpoint (`GET /api/v1/user/api-keys`)
- [ ] תיעוד ביצוע הפעולה

---

**Team 20 (Backend)**  
**Date:** 2026-02-01  
**Status:** 🔴 **REQUIRES IMMEDIATE ACTION**
