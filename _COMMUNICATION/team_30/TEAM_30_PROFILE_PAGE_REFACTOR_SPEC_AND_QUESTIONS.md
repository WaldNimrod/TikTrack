# Team 30 → Team 10 / Team 20: עמוד פרופיל משתמש — ספק יישום ושאלות לאדריכלית

**מאת:** Team 30 (Frontend Execution)  
**תאריך:** 2026-01-31  
**סטטוס:** ✅ **יישום הושלם** — שאלות פתוחות ל-Team 20  
**הקשר:** תיקוני עמוד ניהול פרופיל משתמש (D15)

---

## 📋 Executive Summary

בוצע רפקטור מלא לעמוד הפרופיל (`ProfileView.jsx`) לפי הדרישות. להלן מה שבוצע, תאימות ל-API/DB, והבהרות נדרשות מ-Team 20.

---

## 1. שינויים שבוצעו

### 1.1 הסרת כפילות

| פעולה | פרטים |
|-------|--------|
| **הסרת סקשן כפול** | נמחק הסקשן "עריכת פרטי משתמש" (section-1) — היה שכפול מלא של טופס פרטי משתמש |
| **מבנה סופי** | סקשן יחיד "מידע" — פרטי משתמש + שינוי סיסמה (2 כרטיסים זה ליד זה) |

### 1.2 הסרת כפתור מיותר

- **כפתור "עדכן סיסמה"** — הוסר; ממשק שינוי סיסמה קיים ישירות בכרטיס.

### 1.3 שדה טלפון

- נוסף שדה `phone_number` (מפה: `phoneNumber` ב-state).
- עדכון דרך `PUT /users/me` עם `phone_number`.

### 1.4 ממשק סטטוס אימות

- **אימייל:** badge + כפתור "שלח אימות" כשלא מאומת.
- **טלפון:** badge + כפתור "שלח קוד" + שדה קוד 6 ספרות + כפתור "אימות".
- שימוש ב-`authService.resendEmailVerification()`, `resendPhoneVerification()`, `verifyPhone()`.

### 1.5 תאימות שדות ל-API ולמסד נתונים

| שדה | API UserUpdate | DB users | ממשק |
|-----|----------------|----------|------|
| `first_name` | ✅ | ✅ | ✅ |
| `last_name` | ✅ | ✅ | ✅ |
| `display_name` | ✅ | ✅ | ✅ (נוסף) |
| `phone_number` | ✅ | ✅ | ✅ (נוסף) |
| `timezone` | ✅ | ✅ | ⏳ העדפות (עמוד נפרד) |
| `language` | ✅ | ✅ | ⏳ העדפות (עמוד נפרד) |
| `email` | ❌ לא ניתן לעדכון | ✅ | read-only |
| `username` | ❌ | ✅ | read-only |
| `icon` | ❌ לא ב-API | ❌ לא ב-DB | הוסר |

---

## 2. הבחנה: פרופיל vs העדפות

| עמוד | תוכן |
|------|------|
| **פרופיל** `/profile` | פרטי זהות: username, email, phone, first_name, last_name, display_name, סטטוס אימות, שינוי סיסמה, מפתחות API |
| **העדפות** `/preferences.html` | timezone, language — עמוד נפרד תחת פרופילים |

**סטטוס:**  
- קישור "העדפות" ב-header מפנה ל-`/preferences.html`.  
- timezone ו-language לא מוצגים בעמוד הפרופיל.

---

## 3. שאלות ל-Team 20 (Backend)

### Q1: אימות אימייל (Resend)

- **מצב:** `authService.resendEmailVerification()` משתמש ב-`POST /auth/reset-password` עם `{ method: 'EMAIL', email }`.  
- **בעיה:** זה endpoint לאיפוס סיסמה, לא לשליחת אימות אימייל.  
- **שאלה:** האם קיים endpoint ייעודי לשליחת אימות אימייל? אם לא — האם נדרש endpoint חדש `POST /auth/send-email-verification`?

### Q2: אימות טלפון (Resend)

- **מצב:** `authService.resendPhoneVerification()` משתמש ב-`POST /auth/reset-password` עם `{ method: 'SMS', phone_number }`.  
- **בעיה:** יוצר `PasswordResetRequest` — זרימת איפוס סיסמה, לא אימות טלפון גנרי.  
- **הערה:** `POST /auth/verify-phone` יוצר קוד חדש כשאין PENDING — אך דורש `verification_code` בקריאה.  
- **שאלה:** האם יש endpoint ל-`POST /auth/send-phone-verification` (ללא קוד) כדי לשלוח קוד בלבד? אם לא — האם להשתמש ב-reset-password כ-workaround?

### Q3: UserResponse — `phone_numbers` vs `phone_number`

- **מצב:** ה-schema משתמש ב-`phone_numbers` (רבים) אך הערך הוא string בודד.  
- **שאלה:** האם להותיר כך או לעדכן ל-`phone_number` לתאימות ל-DB?

---

## 4. קבצים ששונו

| קובץ | שינויים |
|------|---------|
| `ui/src/cubes/identity/components/profile/ProfileView.jsx` | הסרת כפילות, הסרת כפתור, הוספת טלפון, אימות, displayName, התאמת שדות |
| `ui/src/cubes/identity/services/auth.js` | תיקון `resendPhoneVerification` — `phoneNumbers` כ-string |
| `ui/src/styles/phoenix-components.css` | `.profile-verify-code-input` — width 6em |

---

## 5. Acceptance Criteria — אימות

- [x] אין כפילות של טופס עריכת פרטי משתמש  
- [x] כפתור "עדכן סיסמה" הוסר  
- [x] שדה טלפון קיים ועדכון עובד  
- [x] סטטוס אימות אימייל וטלפון מוצג  
- [x] ממשק לשליחת קוד אימות טלפון והזנת קוד  
- [x] שדות תואמים ל-UserUpdate (ללא email, username, icon)  
- [x] הבדלה בין פרופיל (זהות) לבין העדפות (עמוד נפרד)  

---

## 6. הפניות

- **API:** `PUT /api/v1/users/me`, `POST /auth/verify-phone`, `POST /auth/reset-password`
- **DB:** `user_data.users` — `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
- **Schemas:** `api/schemas/identity.py` — `UserResponse`, `UserUpdate`
- **Gaps:** `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_20_USER_PROFILE_GAPS_ANALYSIS.md`

---

**Team 30 (Frontend Execution)**  
**log_entry | PROFILE_PAGE_REFACTOR | SPEC_AND_QUESTIONS | 2026-01-31**
