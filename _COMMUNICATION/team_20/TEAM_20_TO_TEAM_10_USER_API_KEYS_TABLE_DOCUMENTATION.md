# Team 20 → Team 10: דרישה ליצירת טבלת user_api_keys ותיעוד

**תאריך:** 2026-02-01  
**מאת:** Team 20 (Backend)  
**אל:** Team 10 (The Gateway)  
**נושא:** דרישה ליצירת טבלת user_api_keys ותיעוד  
**סטטוס:** 🔴 **דרוש טיפול ותיעוד**

---

## 📋 סיכום

**בעיה:** טבלת `user_data.user_api_keys` חסרה במסד הנתונים, מה שגורם לשגיאת 500 ב-endpoint של API keys.

**פעולה נדרשת:** יצירת הטבלה במסד הנתונים ותיעוד הביצוע.

---

## 🔴 בעיה שזוהתה

**תסמינים:**
- Frontend מנסה לטעון API keys בעמוד פרופיל המשתמש
- שגיאת 500: `relation "user_data.user_api_keys" does not exist`
- Endpoint: `GET /api/v1/user/api-keys` מחזיר 500

**סיבה:**
- הטבלה `user_data.user_api_keys` לא קיימת במסד הנתונים
- ה-DDL script לא הוריץ או שהטבלה לא נוצרה

---

## ✅ פעולות שבוצעו (Team 20)

1. **זיהוי הבעיה:** זיהוי שהטבלה חסרה דרך שגיאת 500
2. **יצירת SQL Script:** הכנת `PHX_DB_SCHEMA_V2.5_USER_API_KEYS_TABLE.sql` ליצירת הטבלה
3. **תיעוד:** הכנת הודעות לצוותים 60 ו-10

---

## 📋 פעולות נדרשות

### Team 60 (DevOps)
1. **יצירת הטבלה:** להריץ את ה-SQL script `PHX_DB_SCHEMA_V2.5_USER_API_KEYS_TABLE.sql`
2. **אימות:** לוודא שהטבלה, indexes ו-constraints נוצרו בהצלחה
3. **בדיקה:** לבדוק שה-endpoint `/api/v1/user/api-keys` עובד

### Team 10 (The Gateway)
1. **תיעוד:** לתעד את ביצוע יצירת הטבלה
2. **אימות:** לוודא שהטבלה נוספה ל-DDL המלא
3. **עדכון Index:** לעדכן את ה-System Index אם נדרש

---

## 📋 פרטי הטבלה

**שם:** `user_data.user_api_keys`  
**תפקיד:** אחסון מפתחות API מוצפנים למשתמשים (multi-provider)  
**מבוסס על:** D24 Blueprint + GIN-004

**תכונות:**
- הצפנת API keys לפני אחסון
- תמיכה במספר providers (IBKR, Polygon, Yahoo Finance, Alpha Vantage, Finnhub, Twelve Data, IEX Cloud, Custom)
- Rate limiting ו-quota management
- Verification status

**Schema:**
- `id` (UUID, PK)
- `user_id` (UUID, FK to users)
- `provider` (ENUM: api_provider)
- `provider_label` (VARCHAR(100))
- `api_key_encrypted` (TEXT) - **מוצפן!**
- `api_secret_encrypted` (TEXT) - **מוצפן!**
- `additional_config` (JSONB)
- `is_active` (BOOLEAN)
- `is_verified` (BOOLEAN)
- `last_verified_at` (TIMESTAMPTZ)
- `verification_error` (TEXT)
- `rate_limit_per_minute`, `rate_limit_per_day` (INTEGER)
- `quota_used_today` (INTEGER)
- `quota_reset_at` (TIMESTAMPTZ)
- `created_by`, `updated_by` (UUID, FK to users)
- `created_at`, `updated_at`, `deleted_at` (TIMESTAMPTZ)
- `version` (INTEGER)
- `metadata` (JSONB)

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
3. **Model:** `api/models/identity.py` - `UserApiKey` class
4. **Router:** `api/routers/api_keys.py` - API endpoints
5. **Service:** `api/services/api_keys.py` - Business logic
6. **Schemas:** `api/schemas/identity.py` - Pydantic models

---

## 📋 Checklist לביצוע ותיעוד

### Team 60 (DevOps)
- [ ] Backup למסד הנתונים
- [ ] הרצת SQL script
- [ ] אימות יצירת הטבלה
- [ ] אימות יצירת Indexes
- [ ] אימות יצירת Constraints
- [ ] בדיקת Endpoint (`GET /api/v1/user/api-keys`)
- [ ] דיווח על ביצוע הפעולה

### Team 10 (The Gateway)
- [ ] תיעוד ביצוע יצירת הטבלה
- [ ] אימות שהטבלה נוספה ל-DDL המלא
- [ ] עדכון System Index אם נדרש
- [ ] עדכון תיעוד ארכיטקטורה אם נדרש

---

## ⚠️ הערות חשובות

1. **אבטחה:** הטבלה מכילה API keys מוצפנים - חשוב לוודא שהצפנה מופעלת
2. **Backup:** לפני הרצת ה-script, מומלץ לבצע backup למסד הנתונים
3. **Testing:** אחרי יצירת הטבלה, לבדוק שה-endpoint `/api/v1/user/api-keys` עובד
4. **Documentation:** יש לתעד את ביצוע הפעולה ולוודא שהטבלה נוצרה בהצלחה

---

## 📊 Impact

**לפני יצירת הטבלה:**
- ❌ Frontend לא יכול לטעון API keys
- ❌ משתמשים לא יכולים לנהל API keys
- ❌ Endpoint מחזיר 500

**אחרי יצירת הטבלה:**
- ✅ Frontend יכול לטעון API keys
- ✅ משתמשים יכולים לנהל API keys
- ✅ Endpoint מחזיר תגובה תקינה

---

**Team 20 (Backend)**  
**Date:** 2026-02-01  
**Status:** 🔴 **REQUIRES ACTION & DOCUMENTATION**
