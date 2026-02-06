# מדיניות: Admin Duplicate Email/Phone Exception

**id:** `WP_20_07_C_ADMIN_DUPLICATE_EMAIL_PHONE_POLICY`  
**owner:** Team 20 (Backend Implementation)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-05  
**version:** v1.0

**תאריך:** 2026-02-01  
**סשן:** S20.07.C | **עדכון:** Admin Dual Identity Support  
**סטטוס:** ✅ **מאושר ויושם**

---

## 📋 מדיניות

### כלל כללי
- **Email:** UNIQUE per active user (לא נמחק)
- **Phone:** UNIQUE per active user (אם לא NULL ולא נמחק)

### החרגה למנהלים
- **ADMIN ו-SUPERADMIN:** יכולים להיות עם email/phone שכבר קיים אצל משתמש אחר
- **סיבה:** לאפשר למנהל להיות גם מנהל וגם משתמש רגיל (dual identity)

---

## 🔧 יישום טכני

### Database Schema
- **Partial Unique Indexes:** 
  - `idx_users_email_unique_non_admin` - UNIQUE רק למשתמשים שאינם ADMIN/SUPERADMIN
  - `idx_users_phone_unique_non_admin` - UNIQUE רק למשתמשים שאינם ADMIN/SUPERADMIN
- **ראה:** `PHX_DB_SCHEMA_V2.5_ADMIN_DUPLICATE_EMAIL_PHONE.sql` לעדכון DB schema

### Application Logic
- **בדיקת Uniqueness:** בקוד (`api/routers/users.py`) - מדלגת על ADMIN/SUPERADMIN לפני commit
- **טיפול ב-IntegrityError:** אם admin מקבל IntegrityError על email/phone, מוחזרת הודעה מתאימה

---

## 📋 דוגמאות שימוש

### תרחיש 1: משתמש רגיל מנסה לעדכן ל-email שכבר קיים
**תוצאה:** `409 Conflict` - "Email address is already in use by another user"

### תרחיש 2: Admin מנסה לעדכן ל-email שכבר קיים
**תוצאה:** ✅ **מותר** - העדכון מתבצע בהצלחה

### תרחיש 3: Admin מנסה לעדכן ל-phone שכבר קיים
**תוצאה:** ✅ **מותר** - העדכון מתבצע בהצלחה

---

## 🔗 קבצים קשורים

1. **DB Schema:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_ADMIN_DUPLICATE_EMAIL_PHONE.sql`
2. **Field Map:** `documentation/01-ARCHITECTURE/LOGIC/WP_20_07_C_FIELD_MAP_USERS_PROFILES.md`
3. **Code:** `api/routers/users.py` - `update_user_profile()`

---

## ⚠️ הערות חשובות

1. **דרישת DB Schema Update:** הקוד מוכן, אבל צריך להריץ את ה-SQL script לעדכון ה-DB schema
2. **Backward Compatibility:** אחרי עדכון ה-DB schema, admin יוכל לעדכן ל-email/phone שכבר קיים
3. **Security:** רק ADMIN/SUPERADMIN יכולים לעדכן ל-email/phone כפול - משתמשים רגילים עדיין מוגבלים

---

**עודכן:** 2026-02-01  
**Team:** 20 (Backend)  
**Status:** ✅ **DOCUMENTED**
