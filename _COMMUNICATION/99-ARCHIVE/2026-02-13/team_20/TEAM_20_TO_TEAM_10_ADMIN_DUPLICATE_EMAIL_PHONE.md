# Team 20 → Team 10: תמיכה ב-Admin עם Email/Phone כפולים

**תאריך:** 2026-02-01  
**מאת:** Team 20 (Backend)  
**אל:** Team 10 (The Gateway)  
**נושא:** תמיכה ב-Admin עם Email/Phone כפולים  
**סטטוס:** ✅ **קוד עודכן - דורש עדכון DB Schema**

---

## 📋 דרישה

**דרישה:** משתמשי ADMIN ו-SUPERADMIN יכולים להיות עם email/phone שכבר קיים אצל משתמש אחר.

**סיבה:** לאפשר למנהל להיות גם מנהל וגם משתמש רגיל (dual identity).

---

## ✅ שינויים שבוצעו

### 1. עדכון בדיקת Uniqueness בקוד
**קובץ:** `api/routers/users.py`

**שינוי:**
- בדיקת uniqueness ל-phone מדלגת על משתמשי ADMIN/SUPERADMIN
- אם המשתמש הוא ADMIN/SUPERADMIN, לא נבדק אם ה-phone כבר קיים

```python
# Phone number update - if changed, reset verification status
if data.phone_number is not None and data.phone_number != current_user.phone_number:
    # Check if phone number is already taken by another user
    # Exception: ADMIN and SUPERADMIN users can have duplicate phone/email
    if current_user.role not in (UserRole.ADMIN, UserRole.SUPERADMIN):
        existing_user = await db.execute(...)
        if existing_user.scalar_one_or_none():
            raise HTTPExceptionWithCode(...)
```

### 2. טיפול ב-IntegrityError
**קובץ:** `api/routers/users.py`

**שינוי:**
- אם IntegrityError קורה למשתמש ADMIN/SUPERADMIN, נבדק אם זה email/phone
- אם כן, מוחזרת הודעה שמדברת על עדכון DB schema

---

## 🔴 דרישה לעדכון DB Schema

**בעיה:** ה-UNIQUE constraint ב-DB עדיין מונע duplicates גם ל-admin.

**פתרון:** יצירת Partial Unique Index שמדלג על ADMIN/SUPERADMIN.

**קובץ:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_ADMIN_DUPLICATE_EMAIL_PHONE.sql`

**שינויים נדרשים:**
1. מחיקת UNIQUE constraint/indexes הקיימים על email ו-phone
2. יצירת Partial Unique Indexes שמדלגים על ADMIN/SUPERADMIN:
   - `idx_users_email_unique_non_admin` - UNIQUE רק למשתמשים שאינם admin
   - `idx_users_phone_unique_non_admin` - UNIQUE רק למשתמשים שאינם admin

---

## 📋 מדיניות

**לפני עדכון DB:**
- ❌ Admin לא יכול לעדכן ל-email/phone שכבר קיים (DB constraint יזרוק שגיאה)
- ✅ משתמש רגיל לא יכול לעדכן ל-email/phone שכבר קיים (בדיקה בקוד)

**אחרי עדכון DB:**
- ✅ Admin יכול לעדכן ל-email/phone שכבר קיים
- ✅ משתמש רגיל לא יכול לעדכן ל-email/phone שכבר קיים (DB constraint)

---

## 🔗 קבצים שעודכנו

1. **`api/routers/users.py`** - עדכון בדיקת uniqueness וטיפול ב-IntegrityError
2. **`documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_ADMIN_DUPLICATE_EMAIL_PHONE.sql`** - SQL script לעדכון DB schema

---

## ⚠️ פעולות נדרשות

**Team 60 (DevOps):**
1. להריץ את ה-SQL script: `PHX_DB_SCHEMA_V2.5_ADMIN_DUPLICATE_EMAIL_PHONE.sql`
2. לוודא שה-indexes נוצרו בהצלחה
3. לבדוק ש-admin יכול לעדכן ל-email/phone שכבר קיים

**Team 20 (Backend):**
- ✅ קוד עודכן - מוכן לבדיקה אחרי עדכון DB

---

**Team 20 (Backend)**  
**Date:** 2026-02-01  
**Status:** ✅ **CODE UPDATED - REQUIRES DB SCHEMA UPDATE**
