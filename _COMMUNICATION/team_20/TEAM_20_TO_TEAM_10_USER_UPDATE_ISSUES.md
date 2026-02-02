# Team 20 → Team 10: בעיות בעדכון פרטי משתמש + מדיניות Duplicate Email/Phone

**תאריך:** 2026-02-01  
**מאת:** Team 20 (Backend)  
**אל:** Team 10 (The Gateway)  
**נושא:** תיקון בעיות בעדכון פרטי משתמש + מדיניות Duplicate Email/Phone  
**סטטוס:** ✅ **חלקי - דורש החלטה**

---

## 🔴 בעיות שזוהו

### בעיה 1: Validation Error ללא `error_code`
**תסמינים:**
- Frontend מקבל 422 עם `detail` שהוא array
- Frontend מנסה לעשות `detail.toLowerCase()` וקורס
- `errorCode: undefined` ב-Frontend

**סיבה:**
- ה-RequestValidationError handler לא נקרא (FastAPI מטפל בזה לפני)
- התגובה לא כוללת `error_code`

**סטטוס:** 🔴 **דורש פתרון** - ה-handler לא עובד

### בעיה 2: אין בדיקת Uniqueness ל-Email/Phone
**תסמינים:**
- משתמש יכול לעדכן phone_number לזה של משתמש אחר
- אין בדיקה לפני commit

**סיבה:**
- אין בדיקת uniqueness לפני עדכון
- רק IntegrityError catch (אחרי commit)

**סטטוס:** ✅ **תוקן** - נוספה בדיקה לפני commit

---

## ✅ תיקונים שבוצעו

### 1. הוספת בדיקת Uniqueness ל-Phone
**קובץ:** `api/routers/users.py`

**שינוי:**
```python
# Phone number update - if changed, reset verification status
if data.phone_number is not None and data.phone_number != current_user.phone_number:
    # Check if phone number is already taken by another user
    existing_user = await db.execute(
        select(User).where(
            User.phone_number == data.phone_number,
            User.id != current_user.id,
            User.deleted_at.is_(None)
        )
    )
    if existing_user.scalar_one_or_none():
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_409_CONFLICT,
            detail="Phone number is already in use by another user",
            error_code=ErrorCodes.USER_ALREADY_EXISTS
        )
```

### 2. טיפול ב-IntegrityError
**קובץ:** `api/routers/users.py`

**שינוי:**
```python
try:
    await db.commit()
    await db.refresh(current_user)
except IntegrityError as e:
    await db.rollback()
    # Check for unique constraint violations
    if "email" in error_msg.lower() or "idx_users_email" in error_msg:
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email address is already in use by another user",
            error_code=ErrorCodes.USER_ALREADY_EXISTS
        )
    elif "phone" in error_msg.lower() or "idx_users_phone_unique" in error_msg:
        raise HTTPExceptionWithCode(
            status_code=status.HTTP_409_CONFLICT,
            detail="Phone number is already in use by another user",
            error_code=ErrorCodes.USER_ALREADY_EXISTS
        )
```

---

## 📋 מדיניות Duplicate Email/Phone

### לפי ה-DDL (`PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`):

**Email:**
- `email VARCHAR(255) NOT NULL UNIQUE` - **UNIQUE constraint**
- `CREATE INDEX idx_users_email ON user_data.users(email) WHERE deleted_at IS NULL`

**Phone:**
- `phone_number VARCHAR(20)` - **NULL allowed**
- `CREATE UNIQUE INDEX idx_users_phone_unique ON user_data.users(phone_number) WHERE phone_number IS NOT NULL AND deleted_at IS NULL`

### מדיניות נוכחית:
✅ **Email:** אסור לשני משתמשים פעילים להיות עם אותו email  
✅ **Phone:** אסור לשני משתמשים פעילים להיות עם אותו phone_number (אם לא NULL)

### שאלות לצוות 10:
1. **מה קורה אם משתמש מנסה לעדכן email/phone שכבר קיים?**
   - תגובה: `409 Conflict` עם `error_code: USER_ALREADY_EXISTS` ✅ (מימוש)
   
2. **מה קורה אם משתמש נמחק (soft delete) ואז משתמש אחר לוקח את ה-email/phone שלו?**
   - תגובה: מותר (ה-unique index רק על `deleted_at IS NULL`) ✅
   
3. **האם צריך לאפשר למשתמש לעדכן email?**
   - תגובה: כרגע לא (לפי הקוד: "Email and username cannot be changed via this endpoint") ✅

---

## 🔴 בעיה שנותרה

### RequestValidationError Handler לא עובד
**ניסיונות:**
1. ✅ הוספת `@app.exception_handler(RequestValidationError)` - לא נקרא
2. ✅ שימוש ב-`app.add_exception_handler(RequestValidationError, handler)` - לא נקרא
3. ✅ הוספת logger.debug - לא מופיע בלוגים

**השערה:**
- FastAPI מטפל ב-RequestValidationError לפני שה-handler שלנו נקרא
- אולי צריך להשתמש ב-middleware או ב-`app.router` hook

**דרישה לצוות 10:**
- האם צריך לטפל בזה ב-Frontend (Team 30) במקום?
- או שיש דרך אחרת לטפל ב-RequestValidationError ב-FastAPI?

---

## 📋 סיכום

**תוקן:**
- ✅ בדיקת uniqueness ל-phone לפני commit
- ✅ טיפול ב-IntegrityError עבור duplicate email/phone
- ✅ תגובות עם `error_code` ב-409 Conflict

**נותר:**
- 🔴 RequestValidationError handler לא עובד - דורש פתרון

**מדיניות:**
- ✅ Email: UNIQUE per active user
- ✅ Phone: UNIQUE per active user (if not NULL)
- ✅ Soft-deleted users: email/phone זמינים למשתמשים אחרים

---

**Team 20 (Backend)**  
**Date:** 2026-02-01  
**Status:** ✅ **PARTIALLY FIXED - REQUIRES DECISION**
