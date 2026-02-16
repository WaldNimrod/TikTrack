# 🔍 ניתוח פערים: עדכון פרטי משתמש (User Profile Update)

**תאריך:** 2026-01-31  
**צוות:** Team 20 (Backend)  
**סטטוס:** ניתוח פערים הושלם

---

## 📋 סיכום ביצוע

### ✅ בעיה 1: שגיאת 500 בעדכון פרטי משתמש - **תוקנה**

**בעיה:** `PUT /api/v1/users/me` החזיר שגיאת 500 Internal Server Error.

**סיבה:** שימוש ב-`datetime.utcnow()` במקום `datetime.now(timezone.utc)` שגרם ל-`TypeError: can't compare offset-naive and offset-aware datetimes`.

**תיקון:**
- ✅ עודכן `api/routers/users.py` - הוחלף `datetime.utcnow()` ב-`datetime.now(timezone.utc)` בשני מקומות:
  - שורה 86: `update_user_profile` endpoint
  - שורה 142: `change_password` endpoint
- ✅ נוסף `from datetime import timezone` ל-imports

**אימות:** ה-endpoint עובד כעת בהצלחה.

---

## 🔍 ניתוח פערים: אפיון vs ממשק vs צד שרת

### 1. שדות חסרים בממשק (Frontend - ProfileView.jsx)

#### 1.1 שדות מטבלת `users` שלא מוצגים בממשק:

| שדה | טיפוס | סטטוס בממשק | הערה |
|-----|-------|-------------|------|
| `first_name` | VARCHAR(100) | ✅ **קיים** | מוצג בטופס |
| `last_name` | VARCHAR(100) | ✅ **קיים** | מוצג בטופס |
| `display_name` | VARCHAR(100) | ✅ **קיים** | מוצג בטופס |
| `email` | VARCHAR(255) | ✅ **קיים** | מוצג בטופס |
| `phone_number` | VARCHAR(20) | ✅ **קיים** | מוצג בטופס |
| `timezone` | VARCHAR(50) | ✅ **קיים** | מוצג בטופס |
| `language` | VARCHAR(5) | ✅ **קיים** | מוצג בטופס |
| `username` | VARCHAR(50) | ✅ **קיים** | מוצג כ-read-only |
| `role` | ENUM | ✅ **קיים** | מוצג כ-read-only |
| `is_email_verified` | BOOLEAN | ✅ **קיים** | מוצג עם כפתור resend |
| `phone_verified` | BOOLEAN | ✅ **קיים** | מוצג עם כפתור resend |
| `created_at` | TIMESTAMPTZ | ✅ **קיים** | מוצג כ-read-only |
| `external_ulids` | ULID | ✅ **קיים** | מוצג כ-read-only |

#### 1.2 שדות מטבלת `users` שחסרים בממשק:

| שדה | טיפוס | סטטוס | הערה |
|-----|-------|-------|------|
| `user_tier_levels` | ENUM | ⚠️ **חסר** | מוצג כ-read-only אבל לא בטופס |
| `last_login_at` | TIMESTAMPTZ | ❌ **חסר** | תאריך התחברות אחרונה |
| `last_login_ip` | VARCHAR(45) | ❌ **חסר** | כתובת IP של התחברות אחרונה |
| `email_verified_at` | TIMESTAMPTZ | ❌ **חסר** | תאריך אימות אימייל |
| `phone_verified_at` | TIMESTAMPTZ | ❌ **חסר** | תאריך אימות טלפון |
| `updated_at` | TIMESTAMPTZ | ❌ **חסר** | תאריך עדכון אחרון |
| `metadata` | JSONB | ❌ **חסר** | מטא-דאטה נוספת |

#### 1.3 שדות מאפיון שלא קיימים במסד נתונים:

| שדה מאפיון | טיפוס באפיון | סטטוס במסד נתונים | הערה |
|------------|--------------|-------------------|------|
| `user_profiles_data` | JSONB | ❌ **חסר** | 5 פרופילים (Day, Swing, וכו') - לא מיושם |
| `email_addresses` (plural) | VARCHAR(255) | ⚠️ **שונה** | במסד: `email` (singular) |

---

### 2. שדות חסרים ב-UserResponse Schema (Backend)

#### 2.1 שדות מטבלת `users` שלא מוחזרים ב-UserResponse:

| שדה | טיפוס | סטטוס ב-UserResponse | הערה |
|-----|-------|---------------------|------|
| `first_name` | VARCHAR(100) | ❌ **חסר** | קיים בטבלה אבל לא ב-schema |
| `last_name` | VARCHAR(100) | ❌ **חסר** | קיים בטבלה אבל לא ב-schema |
| `timezone` | VARCHAR(50) | ❌ **חסר** | קיים בטבלה אבל לא ב-schema |
| `language` | VARCHAR(5) | ❌ **חסר** | קיים בטבלה אבל לא ב-schema |
| `last_login_at` | TIMESTAMPTZ | ❌ **חסר** | תאריך התחברות אחרונה |
| `last_login_ip` | VARCHAR(45) | ❌ **חסר** | כתובת IP של התחברות אחרונה |
| `email_verified_at` | TIMESTAMPTZ | ❌ **חסר** | תאריך אימות אימייל |
| `phone_verified_at` | TIMESTAMPTZ | ❌ **חסר** | תאריך אימות טלפון |
| `updated_at` | TIMESTAMPTZ | ❌ **חסר** | תאריך עדכון אחרון |

#### 2.2 שדות ב-UserResponse שלא קיימים במסד נתונים:

| שדה | טיפוס ב-UserResponse | סטטוס במסד נתונים | הערה |
|-----|---------------------|-------------------|------|
| `user_tier_levels` | str (default="Bronze") | ❌ **חסר** | hardcoded כ-"Bronze", לא קיים בטבלה |

---

### 3. שדות חסרים ב-UserUpdate Schema (Backend)

#### 3.1 שדות מטבלת `users` שלא ניתן לעדכן:

| שדה | טיפוס | סטטוס ב-UserUpdate | הערה |
|-----|-------|-------------------|------|
| `email` | VARCHAR(255) | ❌ **לא ניתן לעדכן** | הגיוני - דורש אימות |
| `username` | VARCHAR(50) | ❌ **לא ניתן לעדכן** | הגיוני - מזהה ייחודי |
| `role` | ENUM | ❌ **לא ניתן לעדכן** | הגיוני - דורש הרשאות |
| `user_tier_levels` | ENUM | ❌ **לא ניתן לעדכן** | לא קיים בטבלה |

#### 3.2 שדות ב-UserUpdate שלא קיימים במסד נתונים:

כל השדות ב-UserUpdate קיימים במסד נתונים. ✅

---

### 4. פערים בין אפיון למסד נתונים

#### 4.1 שדות מאפיון שלא קיימים במסד נתונים:

| שדה מאפיון | טיפוס באפיון | סטטוס במסד נתונים | הערה |
|------------|--------------|-------------------|------|
| `internal_ids` (BIGINT) | BIGINT PK | ⚠️ **שונה** | במסד: `id` (UUID PK) |
| `external_ulids` | VARCHAR(26) | ❌ **חסר** | לא קיים בטבלה (מחושב מ-UUID) |
| `user_tier_levels` | ENUM | ❌ **חסר** | לא קיים בטבלה |
| `email_addresses` (plural) | VARCHAR(255) | ⚠️ **שונה** | במסד: `email` (singular) |
| `user_profiles_data` | JSONB | ❌ **חסר** | 5 פרופילים - לא מיושם |

#### 4.2 שדות במסד נתונים שלא מופיעים באפיון:

| שדה | טיפוס | הערה |
|-----|-------|------|
| `id` (UUID) | UUID PK | באפיון: BIGINT |
| `username` | VARCHAR(50) | לא מופיע באפיון |
| `password_hash` | VARCHAR(255) | לא מופיע באפיון (סביר) |
| `first_name` | VARCHAR(100) | לא מופיע באפיון |
| `last_name` | VARCHAR(100) | לא מופיע באפיון |
| `display_name` | VARCHAR(100) | לא מופיע באפיון |
| `role` | ENUM | לא מופיע באפיון |
| `timezone` | VARCHAR(50) | לא מופיע באפיון |
| `language` | VARCHAR(5) | לא מופיע באפיון |
| `is_active` | BOOLEAN | לא מופיע באפיון |
| `is_email_verified` | BOOLEAN | לא מופיע באפיון |
| `email_verified_at` | TIMESTAMPTZ | לא מופיע באפיון |
| `phone_verified` | BOOLEAN | לא מופיע באפיון |
| `phone_verified_at` | TIMESTAMPTZ | לא מופיע באפיון |
| `last_login_at` | TIMESTAMPTZ | לא מופיע באפיון |
| `last_login_ip` | VARCHAR(45) | לא מופיע באפיון |
| `failed_login_attempts` | INTEGER | לא מופיע באפיון |
| `locked_until` | TIMESTAMPTZ | לא מופיע באפיון |
| `created_at` | TIMESTAMPTZ | לא מופיע באפיון |
| `updated_at` | TIMESTAMPTZ | לא מופיע באפיון |
| `deleted_at` | TIMESTAMPTZ | לא מופיע באפיון |
| `metadata` | JSONB | לא מופיע באפיון |

---

## 🎯 המלצות לתיקון

### עדיפות גבוהה (P0):

1. **הוספת שדות חסרים ל-UserResponse Schema:**
   - `first_name`, `last_name`
   - `timezone`, `language`
   - `last_login_at`, `last_login_ip`
   - `email_verified_at`, `phone_verified_at`
   - `updated_at`

2. **הוספת שדות חסרים לממשק (read-only):**
   - `last_login_at`, `last_login_ip`
   - `email_verified_at`, `phone_verified_at`
   - `updated_at`
   - `user_tier_levels` (אם יוחלט להוסיף לטבלה)

### עדיפות בינונית (P1):

3. **יישום `user_tier_levels` במסד נתונים:**
   - הוספת עמודה `user_tier_levels` לטבלת `users`
   - יצירת ENUM `user_tier` עם ערכים: Bronze, Silver, Gold, Platinum
   - עדכון UserResponse Schema להחזיר את הערך מהמסד נתונים

4. **יישום `user_profiles_data` (JSONB):**
   - הוספת עמודה `user_profiles_data` לטבלת `users`
   - הגדרת מבנה JSONB ל-5 פרופילים (Day, Swing, וכו')
   - הוספת endpoints לניהול פרופילים

### עדיפות נמוכה (P2):

5. **הוספת `metadata` לממשק:**
   - הצגת מטא-דאטה נוספת (אם נדרש)

6. **תיעוד פערים באפיון:**
   - עדכון אפיון עם כל השדות הקיימים במסד נתונים

---

## 📝 הערות נוספות

1. **אי-התאמה בין אפיון למסד נתונים:**
   - האפיון מציין `BIGINT` כ-PK פנימי, אבל המסד נתונים משתמש ב-`UUID`
   - האפיון מציין `external_ulids` כעמודה בטבלה, אבל בפועל זה מחושב מ-UUID
   - האפיון מציין `email_addresses` (plural), אבל המסד נתונים משתמש ב-`email` (singular)

2. **`user_tier_levels` hardcoded:**
   - ב-UserResponse, `user_tier_levels` תמיד מחזיר "Bronze" (hardcoded)
   - השדה לא קיים במסד נתונים
   - צריך להחליט אם להוסיף אותו למסד נתונים או להסיר אותו מה-API

3. **`user_profiles_data` לא מיושם:**
   - האפיון מציין תמיכה ב-5 פרופילים (Day, Swing, וכו')
   - השדה לא קיים במסד נתונים
   - צריך להחליט אם ליישם אותו או להסיר אותו מהאפיון

---

## ✅ סיכום

**בעיות שזוהו:**
- ✅ שגיאת 500 בעדכון פרטי משתמש - **תוקנה**
- ⚠️ שדות חסרים ב-UserResponse Schema (10 שדות)
- ⚠️ שדות חסרים בממשק (read-only) (6 שדות)
- ⚠️ `user_tier_levels` hardcoded ולא קיים במסד נתונים
- ⚠️ `user_profiles_data` לא מיושם במסד נתונים
- ⚠️ פערים בין אפיון למסד נתונים (אי-התאמה ב-PK, שמות שדות)

**המלצות:**
1. להוסיף שדות חסרים ל-UserResponse Schema (P0)
2. להוסיף שדות read-only לממשק (P0)
3. להחליט על יישום `user_tier_levels` ו-`user_profiles_data` (P1)

---

**דוח זה נוצר על ידי Team 20 (Backend) כחלק מניתוח פערים בין אפיון, ממשק וצד שרת.**
