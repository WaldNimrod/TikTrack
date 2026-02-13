# Team 20 → Team 10: תיקון שגיאת 500 בעדכון פרטי משתמש + דוח פערים

**תאריך:** 2026-01-31  
**מאת:** Team 20 (Backend)  
**אל:** Team 10 (The Gateway)  
**נושא:** תיקון שגיאת 500 + ניתוח פערים בין אפיון, ממשק וצד שרת

---

## ✅ בעיה 1: שגיאת 500 בעדכון פרטי משתמש - **תוקנה**

### בעיה:
`PUT /api/v1/users/me` החזיר שגיאת 500 Internal Server Error בעת עדכון פרטי משתמש.

### סיבה:
שימוש ב-`datetime.utcnow()` במקום `datetime.now(timezone.utc)` שגרם ל-`TypeError: can't compare offset-naive and offset-aware datetimes` בעת עדכון `updated_at`.

### תיקון:
- ✅ עודכן `api/routers/users.py`:
  - הוחלף `datetime.utcnow()` ב-`datetime.now(timezone.utc)` ב-`update_user_profile` endpoint
  - הוחלף `datetime.utcnow()` ב-`datetime.now(timezone.utc)` ב-`change_password` endpoint
  - נוסף `from datetime import timezone` ל-imports

### אימות:
ה-endpoint עובד כעת בהצלחה. ✅

---

## 🔍 בעיה 2: ניתוח פערים בין אפיון, ממשק וצד שרת

### סיכום:
בוצע ניתוח מעמיק של הפערים בין:
1. **אפיון** (`WP_20_07_C_FIELD_MAP_USERS_PROFILES.md`)
2. **ממשק** (`ProfileView.jsx` - Team 30)
3. **צד שרת** (`UserResponse`, `UserUpdate` schemas - Team 20)
4. **מסד נתונים** (`PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`)

### ממצאים עיקריים:

#### 1. שדות חסרים ב-UserResponse Schema (10 שדות):
- `first_name`, `last_name`
- `timezone`, `language`
- `last_login_at`, `last_login_ip`
- `email_verified_at`, `phone_verified_at`
- `updated_at`

#### 2. שדות חסרים בממשק (read-only) (6 שדות):
- `last_login_at`, `last_login_ip`
- `email_verified_at`, `phone_verified_at`
- `updated_at`
- `user_tier_levels` (אם יוחלט להוסיף לטבלה)

#### 3. פערים בין אפיון למסד נתונים:
- **`user_tier_levels`**: hardcoded כ-"Bronze" ב-UserResponse, לא קיים במסד נתונים
- **`user_profiles_data`**: מופיע באפיון (5 פרופילים), לא קיים במסד נתונים
- **`external_ulids`**: באפיון כעמודה בטבלה, בפועל מחושב מ-UUID
- **`internal_ids` (BIGINT)**: באפיון, בפועל `id` (UUID) במסד נתונים
- **`email_addresses` (plural)**: באפיון, בפועל `email` (singular) במסד נתונים

### דוח מפורט:
📄 **דוח מלא:** `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_20_USER_PROFILE_GAPS_ANALYSIS.md`

---

## 🎯 המלצות לתיקון

### עדיפות גבוהה (P0):
1. ✅ **תיקון שגיאת 500** - הושלם
2. **הוספת שדות חסרים ל-UserResponse Schema** (10 שדות)
3. **הוספת שדות read-only לממשק** (6 שדות)

### עדיפות בינונית (P1):
4. **יישום `user_tier_levels` במסד נתונים** (הוספת עמודה + ENUM)
5. **יישום `user_profiles_data` (JSONB)** (הוספת עמודה + מבנה JSONB)

### עדיפות נמוכה (P2):
6. **תיעוד פערים באפיון** (עדכון אפיון עם כל השדות הקיימים)

---

## 📋 פעולות נדרשות

### Team 20 (Backend):
- [ ] הוספת שדות חסרים ל-UserResponse Schema
- [ ] החלטה על יישום `user_tier_levels` ו-`user_profiles_data`

### Team 30 (Frontend):
- [ ] הוספת שדות read-only לממשק (לפי דוח מפורט)

### Team 10 (The Gateway):
- [ ] החלטה על יישום `user_tier_levels` ו-`user_profiles_data`
- [ ] עדכון אפיון עם כל השדות הקיימים במסד נתונים

---

## 📝 הערות

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

**דוח זה נוצר על ידי Team 20 (Backend) כחלק מניתוח פערים בין אפיון, ממשק וצד שרת.**

**קישור לדוח המלא:** `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_20_USER_PROFILE_GAPS_ANALYSIS.md`
