# 🧪 תרחישי בדיקה בדפדפן - Team 50 (QA)

**id:** `TEAM_50_BROWSER_TEST_SCENARIOS`  
**owner:** Team 50 (QA & Fidelity)  
**status:** ⚠️ **NON-SSOT** - מכיל הפניות לקבצי תקשורת (`_COMMUNICATION`) לצורכי התייחסות בלבד  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-05 (תיקון הפניות ל-`_COMMUNICATION` - NON-SSOT compliance)  
**version:** v1.1

---

**מיקום:** `documentation/05-PROCEDURES/`  
**אחריות:** Team 50 (QA & Fidelity)  
**תאריך יצירה:** 2026-02-03  
**סטטוס:** ✅ **ACTIVE - READY FOR USE**  
**⚠️ Note:** מסמך זה מכיל הפניות לקבצי תקשורת (`_COMMUNICATION`) לצורכי התייחסות בלבד. קבצי התקשורת אינם חלק מה-SSOT.

---

## 📋 תקציר מנהלים

מסמך זה מגדיר את כל תרחישי הבדיקה בדפדפן עבור TikTrack Phoenix, כולל בדיקות אוטומטיות (Selenium) ובדיקות ידניות. כל תרחיש כולל צעדים מפורטים, תוצאות צפויות, וקריטריוני הצלחה.

**חובה:** כל הבדיקות האוטומטיות חייבות לעבור עם **0 שגיאות והערות בקונסולה**.

---

## 🎯 מבנה תרחישי הבדיקה

### קטגוריות ראשיות:
1. **Authentication Flow** - כניסה, הרשמה, איפוס סיסמה
2. **Protected Pages** - דפים מוגנים (Homepage, Profile)
3. **Header Component** - רכיב Header מרכזי (חדש) 🔴 **CRITICAL**
4. **Footer Component** - רכיב Footer מרכזי 🔴 **CRITICAL**
5. **Static HTML Routing** - Clean Routes ו-Routing 🔴 **CRITICAL**
6. **Financial Views** - עמודי פיננסיים (D16, D18, D21)
7. **Cross-Page Navigation** - ניווט בין עמודים
8. **Error Handling** - טיפול בשגיאות
9. **Console Hygiene** - ניקיון קונסולה (חובה)

### ⚠️ עדיפויות בדיקה (לפי Team 10):
- 🔴 **עדיפות 1:** Auth Guard (דחוף) - נדחה זמנית עד לתיקון
- 🟡 **עדיפות 2:** Header/Footer/Routing - לאחר תיקון Auth Guard

---

## 1️⃣ Authentication Flow

### 1.1 Login - Successful

**מטרה:** בדיקת כניסה מוצלחת למשתמש קיים

**תרחיש:**
1. נווט ל-`http://localhost:8080/login`
2. בדוק שהעמוד נטען ללא שגיאות בקונסולה
3. מלא שדות:
   - Username/Email: `nimrod_wald`
   - Password: `4181`
4. לחץ על כפתור "התחבר"
5. בדוק הפניה ל-`/` (Homepage)
6. בדוק שהטוקן נשמר ב-`localStorage`
7. בדוק שהקונסולה נקייה (0 שגיאות, 0 אזהרות)

**תוצאות צפויות:**
- ✅ הפניה ל-Homepage
- ✅ טוקן נשמר ב-`localStorage` (key: `accessToken`)
- ✅ קונסולה נקייה לחלוטין
- ✅ אין שגיאות רשת (Network tab)

**קריטריוני הצלחה:**
- [ ] כניסה מוצלחת
- [ ] הפניה נכונה
- [ ] טוקן נשמר
- [ ] 0 שגיאות בקונסולה
- [ ] 0 אזהרות בקונסולה

---

### 1.2 Login - Invalid Credentials

**מטרה:** בדיקת טיפול בשגיאת פרטי כניסה שגויים

**תרחיש:**
1. נווט ל-`http://localhost:8080/login`
2. מלא שדות שגויים:
   - Username/Email: `wrong_user`
   - Password: `wrong_password`
3. לחץ על כפתור "התחבר"
4. בדוק הודעת שגיאה מוצגת
5. בדוק שהקונסולה נקייה (0 שגיאות, 0 אזהרות)
6. בדוק שהעמוד נשאר ב-`/login`

**תוצאות צפויות:**
- ✅ הודעת שגיאה מוצגת (בעברית)
- ✅ קוד שגיאה: `AUTH_INVALID_CREDENTIALS`
- ✅ שדות נשארים מלאים
- ✅ קונסולה נקייה לחלוטין
- ✅ אין הפניה

**קריטריוני הצלחה:**
- [ ] הודעת שגיאה מוצגת
- [ ] קוד שגיאה נכון
- [ ] אין הפניה
- [ ] 0 שגיאות בקונסולה
- [ ] 0 אזהרות בקונסולה

---

### 1.3 Login - Empty Fields Validation

**מטרה:** בדיקת ולידציה של שדות ריקים

**תרחיש:**
1. נווט ל-`http://localhost:8080/login`
2. השאר שדות ריקים
3. לחץ על כפתור "התחבר"
4. בדוק הודעות שגיאה לשדות ריקים
5. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ הודעות שגיאה לשדות ריקים
- ✅ שדות מסומנים כ-`aria-invalid="true"`
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] ולידציה עובדת
- [ ] הודעות שגיאה מוצגות
- [ ] ARIA attributes נכונים
- [ ] 0 שגיאות בקונסולה

---

### 1.4 Register - Successful

**מטרה:** בדיקת הרשמה מוצלחת

**תרחיש:**
1. נווט ל-`http://localhost:8080/register`
2. בדוק שהעמוד נטען ללא שגיאות
3. מלא שדות עם נתונים ייחודיים:
   - Username: `test_user_${Date.now()}`
   - Email: `test_${Date.now()}@example.com`
   - Phone: `+972501234567`
   - Password: `Test1234!`
   - Confirm Password: `Test1234!`
4. לחץ על כפתור "הירשם"
5. בדוק הפניה ל-`/login` או `/` (תלוי בהתנהגות)
6. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ הרשמה מוצלחת
- ✅ הפניה נכונה
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] הרשמה מוצלחת
- [ ] הפניה נכונה
- [ ] 0 שגיאות בקונסולה
- [ ] 0 אזהרות בקונסולה

---

### 1.5 Register - Validation Errors

**מטרה:** בדיקת ולידציה בהרשמה

**תרחישים:**
1. **Username קצר מדי:**
   - Username: `ab` (< 3 תווים)
   - בדוק הודעת שגיאה

2. **Email לא תקין:**
   - Email: `invalid-email`
   - בדוק הודעת שגיאה

3. **Password קצר מדי:**
   - Password: `Short1!` (< 8 תווים)
   - בדוק הודעת שגיאה

4. **Password mismatch:**
   - Password: `Test1234!`
   - Confirm Password: `Different123!`
   - בדוק הודעת שגיאה

5. **Phone לא תקין:**
   - Phone: `123` (לא E.164)
   - בדוק הודעת שגיאה

**תוצאות צפויות:**
- ✅ הודעות שגיאה לכל שדה
- ✅ ARIA attributes נכונים
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] כל הולידציות עובדות
- [ ] הודעות שגיאה ברורות
- [ ] 0 שגיאות בקונסולה

---

### 1.6 Register - Duplicate User

**מטרה:** בדיקת טיפול במשתמש קיים

**תרחיש:**
1. נווט ל-`http://localhost:8080/register`
2. מלא שדות עם משתמש קיים:
   - Username: `nimrod_wald`
   - Email: `waldnimrod@gmail.com`
   - Phone: `+972501234567`
   - Password: `Test1234!`
   - Confirm Password: `Test1234!`
3. לחץ על כפתור "הירשם"
4. בדוק הודעת שגיאה גנרית (למניעת User Enumeration)
5. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ הודעת שגיאה גנרית: "Registration failed. Please check your input."
- ✅ קוד שגיאה: `USER_ALREADY_EXISTS` (ברקע)
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] הודעת שגיאה גנרית
- [ ] אין חשיפת מידע רגיש
- [ ] 0 שגיאות בקונסולה

---

### 1.7 Password Reset - Request (EMAIL)

**מטרה:** בדיקת בקשת איפוס סיסמה דרך EMAIL

**תרחיש:**
1. נווט ל-`http://localhost:8080/reset-password`
2. בחר "EMAIL" כשיטת איפוס
3. מלא Email: `waldnimrod@gmail.com`
4. לחץ על כפתור "שלח קוד"
5. בדוק הודעת הצלחה
6. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ הודעת הצלחה מוצגת
- ✅ קוד נשלח (ברקע)
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] בקשה נשלחה
- [ ] הודעת הצלחה מוצגת
- [ ] 0 שגיאות בקונסולה

---

### 1.8 Password Reset - Request (SMS)

**מטרה:** בדיקת בקשת איפוס סיסמה דרך SMS

**תרחיש:**
1. נווט ל-`http://localhost:8080/reset-password`
2. בחר "SMS" כשיטת איפוס
3. מלא Phone: `+972501234567`
4. לחץ על כפתור "שלח קוד"
5. בדוק הודעת הצלחה
6. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ הודעת הצלחה מוצגת
- ✅ קוד נשלח (ברקע)
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] בקשה נשלחה
- [ ] הודעת הצלחה מוצגת
- [ ] 0 שגיאות בקונסולה

---

### 1.9 Password Reset - Verify (EMAIL)

**מטרה:** בדיקת אימות קוד איפוס סיסמה דרך EMAIL

**תרחיש:**
1. בצע Password Reset Request (EMAIL) - תרחיש 1.7
2. מלא קוד אימות (6 ספרות)
3. מלא סיסמה חדשה: `NewPass1234!`
4. לחץ על כפתור "אפס סיסמה"
5. בדוק הודעת הצלחה
6. בדוק הפניה ל-`/login`
7. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ איפוס סיסמה מוצלח
- ✅ הפניה ל-`/login`
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] איפוס סיסמה מוצלח
- [ ] הפניה נכונה
- [ ] 0 שגיאות בקונסולה

---

### 1.10 Password Reset - Verify (SMS)

**מטרה:** בדיקת אימות קוד איפוס סיסמה דרך SMS

**תרחיש:**
1. בצע Password Reset Request (SMS) - תרחיש 1.8
2. מלא קוד אימות (6 ספרות)
3. מלא סיסמה חדשה: `NewPass1234!`
4. לחץ על כפתור "אפס סיסמה"
5. בדוק הודעת הצלחה
6. בדוק הפניה ל-`/login`
7. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ איפוס סיסמה מוצלח
- ✅ הפניה ל-`/login`
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] איפוס סיסמה מוצלח
- [ ] הפניה נכונה
- [ ] 0 שגיאות בקונסולה

---

### 1.11 Password Reset - Invalid Code

**מטרה:** בדיקת טיפול בקוד אימות שגוי

**תרחיש:**
1. בצע Password Reset Request - תרחיש 1.7 או 1.8
2. מלא קוד שגוי: `000000`
3. מלא סיסמה חדשה: `NewPass1234!`
4. לחץ על כפתור "אפס סיסמה"
5. בדוק הודעת שגיאה
6. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ הודעת שגיאה מוצגת
- ✅ קוד שגיאה: `INVALID_VERIFICATION_CODE`
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] הודעת שגיאה מוצגת
- [ ] קוד שגיאה נכון
- [ ] 0 שגיאות בקונסולה

---

### 1.12 Logout - Successful

**מטרה:** בדיקת התנתקות מוצלחת

**תרחיש:**
1. התחבר למערכת - תרחיש 1.1
2. לחץ על כפתור "התנתק" (בתפריט או Header)
3. בדוק הפניה ל-`/login`
4. בדוק שהטוקן נמחק מ-`localStorage`
5. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ הפניה ל-`/login`
- ✅ טוקן נמחק מ-`localStorage`
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] התנתקות מוצלחת
- [ ] הפניה נכונה
- [ ] טוקן נמחק
- [ ] 0 שגיאות בקונסולה

---

## 2️⃣ Protected Pages

### 2.1 Homepage - Load & Display

**מטרה:** בדיקת טעינה ותצוגה של Homepage

**תרחיש:**
1. התחבר למערכת - תרחיש 1.1
2. נווט ל-`http://localhost:8080/`
3. בדוק שהעמוד נטען ללא שגיאות
4. בדוק שהתוכן מוצג נכון:
   - Header נטען
   - Footer נטען
   - תוכן העמוד מוצג
5. בדוק שהקונסולה נקייה (0 שגיאות, 0 אזהרות)

**תוצאות צפויות:**
- ✅ העמוד נטען במלואו
- ✅ כל הרכיבים מוצגים
- ✅ קונסולה נקייה לחלוטין

**קריטריוני הצלחה:**
- [ ] העמוד נטען
- [ ] כל הרכיבים מוצגים
- [ ] 0 שגיאות בקונסולה
- [ ] 0 אזהרות בקונסולה

---

### 2.2 Homepage - Protected Route

**מטרה:** בדיקת הגנה על Homepage

**תרחיש:**
1. התנתק מהמערכת (אם מחובר)
2. מחק טוקן מ-`localStorage` (אם קיים)
3. נווט ל-`http://localhost:8080/`
4. בדוק הפניה ל-`/login`
5. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ הפניה אוטומטית ל-`/login`
- ✅ אין גישה לתוכן מוגן
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] הפניה ל-`/login`
- [ ] אין גישה לתוכן
- [ ] 0 שגיאות בקונסולה

---

### 2.3 User Profile - Load & Display

**מטרה:** בדיקת טעינה ותצוגה של User Profile

**תרחיש:**
1. התחבר למערכת - תרחיש 1.1
2. נווט ל-`http://localhost:8080/profile`
3. בדוק שהעמוד נטען ללא שגיאות
4. בדוק שהתוכן מוצג נכון:
   - פרטי משתמש מוצגים
   - טופס עדכון פרופיל
5. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ העמוד נטען במלואו
- ✅ פרטי משתמש מוצגים
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] העמוד נטען
- [ ] פרטי משתמש מוצגים
- [ ] 0 שגיאות בקונסולה

---

### 2.4 User Profile - Update Profile

**מטרה:** בדיקת עדכון פרופיל משתמש

**תרחיש:**
1. התחבר למערכת - תרחיש 1.1
2. נווט ל-`http://localhost:8080/profile`
3. עדכן שדה (למשל Display Name)
4. לחץ על כפתור "שמור"
5. בדוק הודעת הצלחה
6. בדוק שהנתונים עודכנו
7. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ עדכון מוצלח
- ✅ הודעת הצלחה מוצגת
- ✅ נתונים עודכנו
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] עדכון מוצלח
- [ ] נתונים עודכנו
- [ ] 0 שגיאות בקונסולה

---

### 2.5 Password Change - Successful

**מטרה:** בדיקת שינוי סיסמה מוצלח

**תרחיש:**
1. התחבר למערכת - תרחיש 1.1
2. נווט ל-`http://localhost:8080/profile`
3. מצא את טופס שינוי סיסמה
4. מלא שדות:
   - Old Password: `4181`
   - New Password: `NewPass1234!`
   - Confirm New Password: `NewPass1234!`
5. לחץ על כפתור "שנה סיסמה"
6. בדוק הודעת הצלחה
7. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ שינוי סיסמה מוצלח
- ✅ הודעת הצלחה מוצגת
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] שינוי סיסמה מוצלח
- [ ] הודעת הצלחה מוצגת
- [ ] 0 שגיאות בקונסולה

---

### 2.6 Password Change - Invalid Old Password

**מטרה:** בדיקת טיפול בסיסמה ישנה שגויה

**תרחיש:**
1. התחבר למערכת - תרחיש 1.1
2. נווט ל-`http://localhost:8080/profile`
3. מצא את טופס שינוי סיסמה
4. מלא שדות:
   - Old Password: `WrongPassword123!`
   - New Password: `NewPass1234!`
   - Confirm New Password: `NewPass1234!`
5. לחץ על כפתור "שנה סיסמה"
6. בדוק הודעת שגיאה
7. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ הודעת שגיאה מוצגת
- ✅ קוד שגיאה: `AUTH_INVALID_CREDENTIALS`
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] הודעת שגיאה מוצגת
- [ ] קוד שגיאה נכון
- [ ] 0 שגיאות בקונסולה

---

## 3️⃣ Header Component (חדש)

### 3.1 Header - Load on All Pages

**מטרה:** בדיקת טעינת Header בכל העמודים

**תרחישים:**
1. **D16_ACCTS_VIEW:**
   - נווט ל-`http://localhost:8080/src/views/financial/D16_ACCTS_VIEW.html`
   - בדוק ש-Header נטען
   - בדוק שאין כפילויות של Header
   - בדוק שהקונסולה נקייה

2. **D18_BRKRS_VIEW:**
   - נווט ל-`http://localhost:8080/src/views/financial/D18_BRKRS_VIEW.html`
   - בדוק ש-Header נטען
   - בדוק שאין כפילויות של Header
   - בדוק שהקונסולה נקייה

3. **D21_CASH_VIEW:**
   - נווט ל-`http://localhost:8080/src/views/financial/D21_CASH_VIEW.html`
   - בדוק ש-Header נטען
   - בדוק שאין כפילויות של Header
   - בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ Header נטען בכל העמודים
- ✅ אין כפילויות של Header
- ✅ תוכן Header אחיד בכל העמודים
- ✅ קונסולה נקייה בכל העמודים

**קריטריוני הצלחה:**
- [ ] Header נטען בכל העמודים
- [ ] אין כפילויות
- [ ] תוכן אחיד
- [ ] 0 שגיאות בקונסולה בכל העמודים

---

### 3.2 Header - Navigation Menu

**מטרה:** בדיקת תפריט ניווט ב-Header

**תרחיש:**
1. נווט לכל עמוד עם Header (D16, D18, D21)
2. בדוק שכל הקישורים בתפריט עובדים:
   - קישורים ל-Entities (Home, Accounts, Brokers, Cash)
   - Dropdowns נפתחים ונסגרים נכון
   - Utils (Mop, Flash, Search) עובדים
3. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ כל הקישורים עובדים
- ✅ Dropdowns עובדים נכון
- ✅ Utils עובדים
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] כל הקישורים עובדים
- [ ] Dropdowns עובדים
- [ ] Utils עובדים
- [ ] 0 שגיאות בקונסולה

---

### 3.3 Header - Global Filter

**מטרה:** בדיקת פילטר גלובלי ב-Header

**תרחיש:**
1. נווט ל-`http://localhost:8080/src/views/financial/D16_ACCTS_VIEW.html`
2. בדוק שכל הפילטרים עובדים:
   - כל פילטר נפתח ונסגר נכון
   - בחירת ערך בפילטר עובדת
   - איפוס פילטרים עובד
3. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ כל הפילטרים עובדים
- ✅ בחירת ערכים עובדת
- ✅ איפוס עובד
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] כל הפילטרים עובדים
- [ ] בחירת ערכים עובדת
- [ ] איפוס עובד
- [ ] 0 שגיאות בקונסולה

---

### 3.4 Header - Phoenix Bridge Integration

**מטרה:** בדיקת אינטגרציה עם Phoenix Bridge

**תרחיש:**
1. נווט לכל עמוד עם Header
2. בדוק ש-`window.PhoenixBridge` קיים:
   ```javascript
   console.log(window.PhoenixBridge);
   ```
3. בדוק שכל הפונקציות זמינות:
   - `updateOptions`
   - `syncWithUrl`
   - `setFilter`
   - `clearFilters`
4. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ `window.PhoenixBridge` קיים
- ✅ כל הפונקציות זמינות
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] PhoenixBridge קיים
- [ ] כל הפונקציות זמינות
- [ ] 0 שגיאות בקונסולה

---

### 3.5 Header - State Persistence (URL Sync)

**מטרה:** בדיקת סנכרון מצב עם URL

**תרחיש:**
1. נווט ל-`http://localhost:8080/src/views/financial/D16_ACCTS_VIEW.html`
2. שנה פילטר (למשל Accounts)
3. בדוק שה-URL Params עודכנו:
   ```javascript
   console.log(window.location.search);
   ```
4. רענן את העמוד (F5)
5. בדוק שהפילטרים נשמרו מ-URL
6. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ URL Params עודכנו
- ✅ פילטרים נשמרו ב-URL
- ✅ פילטרים נטענים מ-URL
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] URL Params עודכנו
- [ ] פילטרים נשמרו
- [ ] פילטרים נטענים מ-URL
- [ ] 0 שגיאות בקונסולה

---

### 3.6 Header - State Persistence (Session Storage)

**מטרה:** בדיקת שמירת מצב ב-Session Storage

**תרחיש:**
1. נווט ל-`http://localhost:8080/src/views/financial/D16_ACCTS_VIEW.html`
2. שנה פילטר
3. בדוק שהמצב נשמר ב-`sessionStorage`:
   ```javascript
   console.log(sessionStorage.getItem('phoenixFilters'));
   ```
4. נווט לעמוד אחר (D18)
5. חזור ל-D16
6. בדוק שהפילטרים נשמרו מ-`sessionStorage`
7. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ מצב נשמר ב-`sessionStorage`
- ✅ פילטרים נטענים מ-`sessionStorage`
- ✅ מצב נשמר במעבר בין עמודים
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] מצב נשמר ב-`sessionStorage`
- [ ] פילטרים נטענים מ-`sessionStorage`
- [ ] מצב נשמר במעבר בין עמודים
- [ ] 0 שגיאות בקונסולה

---

### 3.7 Header - Cross-Page Navigation

**מטרה:** בדיקת מעבר בין עמודים עם שמירת מצב

**תרחיש:**
1. נווט ל-`http://localhost:8080/src/views/financial/D16_ACCTS_VIEW.html`
2. שנה פילטר (למשל Accounts)
3. נווט ל-`http://localhost:8080/src/views/financial/D18_BRKRS_VIEW.html`
4. בדוק שהפילטרים נשמרו
5. נווט ל-`http://localhost:8080/src/views/financial/D21_CASH_VIEW.html`
6. בדוק שהפילטרים נשמרו
7. חזור ל-D16
8. בדוק שהפילטרים נשמרו
9. בדוק שהקונסולה נקייה בכל העמודים

**תוצאות צפויות:**
- ✅ פילטרים נשמרים במעבר בין עמודים
- ✅ מצב נשמר ב-`sessionStorage`
- ✅ קונסולה נקייה בכל העמודים

**קריטריוני הצלחה:**
- [ ] פילטרים נשמרים במעבר בין עמודים
- [ ] מצב נשמר
- [ ] 0 שגיאות בקונסולה בכל העמודים

---

### 3.8 Header - Dynamic Data Injection

**מטרה:** בדיקת הזרקת נתונים דינמית לפילטרים

**תרחיש:**
1. נווט ל-`http://localhost:8080/src/views/financial/D16_ACCTS_VIEW.html`
2. בדוק ש-`window.PhoenixBridge.updateOptions` זמין
3. עדכן אפשרויות פילטר (למשל Accounts):
   ```javascript
   window.PhoenixBridge.updateOptions('accounts', [
     { value: 'acc1', label: 'Account 1' },
     { value: 'acc2', label: 'Account 2' }
   ]);
   ```
4. בדוק שהאלמנטים נוצרים דינמית ב-UI
5. בדוק שהאלמנטים החדשים עובדים (click handlers)
6. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ `updateOptions` עובד
- ✅ אלמנטים נוצרים דינמית
- ✅ אלמנטים עובדים
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] `updateOptions` עובד
- [ ] אלמנטים נוצרים דינמית
- [ ] אלמנטים עובדים
- [ ] 0 שגיאות בקונסולה

---

## 4️⃣ Footer Component 🔴 **CRITICAL**

### 4.1 Footer - Load on All Pages

**מטרה:** בדיקת טעינת Footer בכל העמודים

**תרחישים:**
1. **D16_ACCTS_VIEW:**
   - נווט ל-`http://localhost:8080/trading_accounts` או `http://localhost:8080/src/views/financial/D16_ACCTS_VIEW.html`
   - בדוק ש-Footer נטען
   - בדוק שאין כפילויות של Footer
   - בדוק שהקונסולה נקייה

2. **D18_BRKRS_VIEW:**
   - נווט ל-`http://localhost:8080/brokers_fees` או `http://localhost:8080/src/views/financial/D18_BRKRS_VIEW.html`
   - בדוק ש-Footer נטען
   - בדוק שאין כפילויות של Footer
   - בדוק שהקונסולה נקייה

3. **D21_CASH_VIEW:**
   - נווט ל-`http://localhost:8080/cash_flows` או `http://localhost:8080/src/views/financial/D21_CASH_VIEW.html`
   - בדוק ש-Footer נטען
   - בדוק שאין כפילויות של Footer
   - בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ Footer נטען בכל העמודים
- ✅ אין כפילויות של Footer
- ✅ תוכן Footer אחיד בכל העמודים
- ✅ קונסולה נקייה בכל העמודים

**קריטריוני הצלחה:**
- [ ] Footer נטען בכל העמודים
- [ ] אין כפילויות
- [ ] תוכן אחיד
- [ ] 0 שגיאות בקונסולה בכל העמודים

---

### 4.2 Footer - No Duplicates

**מטרה:** בדיקת מניעת כפילויות של Footer

**תרחיש:**
1. נווט לכל עמוד עם Footer (D16, D18, D21)
2. בדוק שאין יותר מ-Footer אחד בכל עמוד:
   ```javascript
   console.log(document.querySelectorAll('footer').length);
   ```
3. בדוק ש-`footer-loader.js` לא יוצר כפילויות
4. בדוק שאין Footer מוטמע באף עמוד (בדיקת HTML)
5. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ רק Footer אחד בכל עמוד
- ✅ `footer-loader.js` לא יוצר כפילויות
- ✅ אין Footer מוטמע באף עמוד
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] רק Footer אחד בכל עמוד
- [ ] אין כפילויות
- [ ] אין Footer מוטמע
- [ ] 0 שגיאות בקונסולה

---

### 4.3 Footer - Consistent Content

**מטרה:** בדיקת עקביות תוכן Footer בין כל העמודים

**תרחיש:**
1. נווט ל-`http://localhost:8080/trading_accounts` (D16)
2. שמור את תוכן Footer (HTML structure)
3. נווט ל-`http://localhost:8080/brokers_fees` (D18)
4. השווה את תוכן Footer ל-D16
5. נווט ל-`http://localhost:8080/cash_flows` (D21)
6. השווה את תוכן Footer ל-D16 ו-D18
7. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ תוכן Footer זהה בכל העמודים
- ✅ מבנה Footer זהה בכל העמודים
- ✅ סגנון Footer זהה בכל העמודים
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] תוכן זהה
- [ ] מבנה זהה
- [ ] סגנון זהה
- [ ] 0 שגיאות בקונסולה

---

### 4.4 Footer - Functionality

**מטרה:** בדיקת פונקציונליות Footer

**תרחיש:**
1. נווט לכל עמוד עם Footer
2. בדוק שכל הקישורים ב-Footer עובדים:
   - לחץ על כל קישור
   - בדוק שהקישור עובד
3. בדוק שכל האלמנטים ב-Footer נראים נכון
4. בדוק ש-Footer ממוקם נכון בתחתית העמוד
5. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ כל הקישורים עובדים
- ✅ כל האלמנטים נראים נכון
- ✅ Footer ממוקם נכון בתחתית העמוד
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] כל הקישורים עובדים
- [ ] כל האלמנטים נראים נכון
- [ ] Footer ממוקם נכון
- [ ] 0 שגיאות בקונסולה

---

### 4.5 Footer - Integration with Header

**מטרה:** בדיקת אינטגרציה בין Header ו-Footer

**תרחיש:**
1. נווט לכל עמוד עם Header ו-Footer
2. בדוק שהמבנה הכללי נכון:
   - Header נטען לפני Footer
   - אין התנגשויות בין Header ל-Footer
   - המבנה הכללי: Header > Content > Footer
3. בדוק שאין רווחים או בעיות פריסה בין Header ל-Footer
4. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ Header נטען לפני Footer
- ✅ אין התנגשויות
- ✅ מבנה נכון (Header > Content > Footer)
- ✅ אין רווחים או בעיות פריסה
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] Header נטען לפני Footer
- [ ] אין התנגשויות
- [ ] מבנה נכון
- [ ] אין רווחים או בעיות פריסה
- [ ] 0 שגיאות בקונסולה

---

## 5️⃣ Static HTML Routing 🔴 **CRITICAL**

### 5.1 Clean Routes - Trading Accounts

**מטרה:** בדיקת Clean Route ל-Trading Accounts

**תרחיש:**
1. נווט ל-`http://localhost:8080/trading_accounts`
2. בדוק שהעמוד `D16_ACCTS_VIEW.html` נטען ישירות
3. בדוק שהעמוד נטען ללא שגיאות
4. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ `/trading_accounts` משרת `D16_ACCTS_VIEW.html` ישירות
- ✅ העמוד נטען נכון
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] Route עובד
- [ ] העמוד נטען נכון
- [ ] 0 שגיאות בקונסולה

---

### 5.2 Clean Routes - Brokers Fees

**מטרה:** בדיקת Clean Route ל-Brokers Fees

**תרחיש:**
1. נווט ל-`http://localhost:8080/brokers_fees`
2. בדוק שהעמוד `D18_BRKRS_VIEW.html` נטען ישירות
3. בדוק שהעמוד נטען ללא שגיאות
4. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ `/brokers_fees` משרת `D18_BRKRS_VIEW.html` ישירות
- ✅ העמוד נטען נכון
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] Route עובד
- [ ] העמוד נטען נכון
- [ ] 0 שגיאות בקונסולה

---

### 5.3 Clean Routes - Cash Flows

**מטרה:** בדיקת Clean Route ל-Cash Flows

**תרחיש:**
1. נווט ל-`http://localhost:8080/cash_flows`
2. בדוק שהעמוד `D21_CASH_VIEW.html` נטען ישירות
3. בדוק שהעמוד נטען ללא שגיאות
4. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ `/cash_flows` משרת `D21_CASH_VIEW.html` ישירות
- ✅ העמוד נטען נכון
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] Route עובד
- [ ] העמוד נטען נכון
- [ ] 0 שגיאות בקונסולה

---

### 5.4 Navigation from Header - Clean Routes

**מטרה:** בדיקת ניווט מ-Header דרך Clean Routes

**תרחיש:**
1. נווט לכל עמוד עם Header
2. לחץ על "חשבונות מסחר" בתפריט Header
3. בדוק ניווט ל-`/trading_accounts` → טעינת `D16_ACCTS_VIEW.html`
4. לחץ על "ברוקרים" בתפריט Header
5. בדוק ניווט ל-`/brokers_fees` → טעינת `D18_BRKRS_VIEW.html`
6. לחץ על "מזומנים" בתפריט Header
7. בדוק ניווט ל-`/cash_flows` → טעינת `D21_CASH_VIEW.html`
8. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ ניווט מ-Header עובד נכון
- ✅ כל הקישורים מובילים ל-Clean Routes
- ✅ העמודים נטענים נכון
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] ניווט מ-Header עובד
- [ ] כל הקישורים עובדים
- [ ] העמודים נטענים נכון
- [ ] 0 שגיאות בקונסולה

---

### 5.5 Backward Compatibility - Direct HTML Access

**מטרה:** בדיקת תאימות לאחור - גישה ישירה ל-HTML

**תרחיש:**
1. נווט ל-`http://localhost:8080/src/views/financial/D16_ACCTS_VIEW.html`
2. בדוק שהעמוד נטען נכון
3. נווט ל-`http://localhost:8080/src/views/financial/D18_BRKRS_VIEW.html`
4. בדוק שהעמוד נטען נכון
5. נווט ל-`http://localhost:8080/src/views/financial/D21_CASH_VIEW.html`
6. בדוק שהעמוד נטען נכון
7. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ גישה ישירה ל-HTML עובדת
- ✅ כל העמודים נטענים נכון
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] גישה ישירה עובדת
- [ ] כל העמודים נטענים נכון
- [ ] 0 שגיאות בקונסולה

---

### 5.6 No Unwanted Redirects

**מטרה:** בדיקת מניעת Redirects לא רצויים

**תרחיש:**
1. נווט לכל Clean Route (`/trading_accounts`, `/brokers_fees`, `/cash_flows`)
2. בדוק שאין redirects לדף הבית (`/`)
3. בדוק ש-React Router לא תופס את ה-routes של HTML
4. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ אין redirects לא רצויים לדף הבית
- ✅ React Router לא תופס את ה-routes של HTML
- ✅ כל Route עובד ישירות
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] אין redirects לא רצויים
- [ ] React Router לא תופס את ה-routes
- [ ] כל Route עובד ישירות
- [ ] 0 שגיאות בקונסולה

---

## 6️⃣ Financial Views

### 6.1 D16_ACCTS_VIEW - Load & Display

**מטרה:** בדיקת טעינה ותצוגה של D16_ACCTS_VIEW

**תרחיש:**
1. נווט ל-`http://localhost:8080/trading_accounts` או `http://localhost:8080/src/views/financial/D16_ACCTS_VIEW.html`
2. בדוק שהעמוד נטען ללא שגיאות
3. בדוק שהתוכן מוצג נכון:
   - Header נטען
   - Footer נטען
   - טבלת Accounts מוצגת
   - פילטרים מוצגים
4. בדוק שהקונסולה נקייה (0 שגיאות, 0 אזהרות)

**תוצאות צפויות:**
- ✅ העמוד נטען במלואו
- ✅ כל הרכיבים מוצגים
- ✅ קונסולה נקייה לחלוטין

**קריטריוני הצלחה:**
- [ ] העמוד נטען
- [ ] כל הרכיבים מוצגים
- [ ] 0 שגיאות בקונסולה
- [ ] 0 אזהרות בקונסולה

---

### 4.2 D16_ACCTS_VIEW - Table Sorting

**מטרה:** בדיקת מיון טבלה ב-D16_ACCTS_VIEW

**תרחיש:**
1. נווט ל-`http://localhost:8080/src/views/financial/D16_ACCTS_VIEW.html`
2. לחץ על כותרת עמודה (למשל "Account Name")
3. בדוק שהטבלה ממוינת
4. לחץ שוב על אותה כותרת
5. בדוק שהמיון מתהפך (ASC → DESC)
6. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ מיון עובד
- ✅ מיון מתהפך
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] מיון עובד
- [ ] מיון מתהפך
- [ ] 0 שגיאות בקונסולה

---

### 4.3 D16_ACCTS_VIEW - Table Filtering

**מטרה:** בדיקת סינון טבלה ב-D16_ACCTS_VIEW

**תרחיש:**
1. נווט ל-`http://localhost:8080/src/views/financial/D16_ACCTS_VIEW.html`
2. השתמש בפילטרים המקומיים (לא Global Filter)
3. בדוק שהטבלה מסוננת
4. איפוס פילטרים
5. בדוק שהטבלה חוזרת למצב התחלתי
6. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ סינון עובד
- ✅ איפוס עובד
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] סינון עובד
- [ ] איפוס עובד
- [ ] 0 שגיאות בקונסולה

---

### 4.4 D16_ACCTS_VIEW - Data Loading

**מטרה:** בדיקת טעינת נתונים ב-D16_ACCTS_VIEW

**תרחיש:**
1. נווט ל-`http://localhost:8080/src/views/financial/D16_ACCTS_VIEW.html`
2. בדוק שנתונים נטענים מהשרת:
   - בדוק Network tab ב-DevTools
   - בדוק שהנתונים מוצגים בטבלה
3. שנה פילטר
4. בדוק שנתונים חדשים נטענים
5. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ נתונים נטענים מהשרת
- ✅ נתונים מוצגים בטבלה
- ✅ נתונים מתעדכנים עם פילטרים
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] נתונים נטענים
- [ ] נתונים מוצגים
- [ ] נתונים מתעדכנים
- [ ] 0 שגיאות בקונסולה

---

### 6.2 D18_BRKRS_VIEW - Load & Display

**מטרה:** בדיקת טעינה ותצוגה של D18_BRKRS_VIEW

**תרחיש:**
1. נווט ל-`http://localhost:8080/brokers_fees` או `http://localhost:8080/src/views/financial/D18_BRKRS_VIEW.html`
2. בדוק שהעמוד נטען ללא שגיאות
3. בדוק שהתוכן מוצג נכון:
   - Header נטען
   - Footer נטען
   - תוכן העמוד מוצג
4. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ העמוד נטען במלואו
- ✅ כל הרכיבים מוצגים
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] העמוד נטען
- [ ] כל הרכיבים מוצגים
- [ ] 0 שגיאות בקונסולה

---

### 6.3 D21_CASH_VIEW - Load & Display

**מטרה:** בדיקת טעינה ותצוגה של D21_CASH_VIEW

**תרחיש:**
1. נווט ל-`http://localhost:8080/cash_flows` או `http://localhost:8080/src/views/financial/D21_CASH_VIEW.html`
2. בדוק שהעמוד נטען ללא שגיאות
3. בדוק שהתוכן מוצג נכון:
   - Header נטען
   - Footer נטען
   - תוכן העמוד מוצג
4. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ העמוד נטען במלואו
- ✅ כל הרכיבים מוצגים
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] העמוד נטען
- [ ] כל הרכיבים מוצגים
- [ ] 0 שגיאות בקונסולה

---

## 7️⃣ Cross-Page Navigation

### 5.1 Navigation - Between Protected Pages

**מטרה:** בדיקת ניווט בין עמודים מוגנים

**תרחיש:**
1. התחבר למערכת - תרחיש 1.1
2. נווט ל-`http://localhost:8080/` (Homepage)
3. נווט ל-`http://localhost:8080/profile`
4. בדוק שהטוקן נשמר
5. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ ניווט עובד
- ✅ טוקן נשמר
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] ניווט עובד
- [ ] טוקן נשמר
- [ ] 0 שגיאות בקונסולה

---

### 5.2 Navigation - Protected to Public

**מטרה:** בדיקת ניווט מעמוד מוגן לעמוד ציבורי

**תרחיש:**
1. התחבר למערכת - תרחיש 1.1
2. נווט ל-`http://localhost:8080/` (Homepage)
3. נווט ל-`http://localhost:8080/login`
4. בדוק שהטוקן נשמר (לא נמחק)
5. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ ניווט עובד
- ✅ טוקן נשמר (לא נמחק)
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] ניווט עובד
- [ ] טוקן נשמר
- [ ] 0 שגיאות בקונסולה

---

### 5.3 Navigation - Public to Protected (Without Auth)

**מטרה:** בדיקת ניווט מעמוד ציבורי לעמוד מוגן ללא אימות

**תרחיש:**
1. התנתק מהמערכת (אם מחובר)
2. מחק טוקן מ-`localStorage` (אם קיים)
3. נווט ל-`http://localhost:8080/login`
4. נווט ל-`http://localhost:8080/` (Homepage)
5. בדוק הפניה אוטומטית ל-`/login`
6. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ הפניה אוטומטית ל-`/login`
- ✅ אין גישה לתוכן מוגן
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] הפניה ל-`/login`
- [ ] אין גישה לתוכן
- [ ] 0 שגיאות בקונסולה

---

## 8️⃣ Error Handling

### 6.1 Network Error - Backend Offline

**מטרה:** בדיקת טיפול בשגיאת רשת (Backend Offline)

**תרחיש:**
1. כבה את Backend Server (`http://localhost:8082`)
2. נווט ל-`http://localhost:8080/login`
3. נסה להתחבר
4. בדוק הודעת שגיאה מתאימה
5. בדוק שהקונסולה נקייה (אין שגיאות לא מטופלות)

**תוצאות צפויות:**
- ✅ הודעת שגיאה מתאימה מוצגת
- ✅ אין שגיאות לא מטופלות בקונסולה
- ✅ האפליקציה לא קורסת

**קריטריוני הצלחה:**
- [ ] הודעת שגיאה מוצגת
- [ ] אין שגיאות לא מטופלות
- [ ] האפליקציה לא קורסת

---

### 6.2 API Error - 400 Bad Request

**מטרה:** בדיקת טיפול בשגיאת API 400

**תרחיש:**
1. נווט ל-`http://localhost:8080/register`
2. מלא נתונים לא תקינים (למשל Email לא תקין)
3. לחץ על כפתור "הירשם"
4. בדוק הודעת שגיאה מתאימה
5. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ הודעת שגיאה מתאימה מוצגת
- ✅ קוד שגיאה נכון
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] הודעת שגיאה מוצגת
- [ ] קוד שגיאה נכון
- [ ] 0 שגיאות בקונסולה

---

### 6.3 API Error - 401 Unauthorized

**מטרה:** בדיקת טיפול בשגיאת API 401

**תרחיש:**
1. התחבר למערכת - תרחיש 1.1
2. מחק טוקן מ-`localStorage`
3. נסה לגשת לעמוד מוגן (למשל `/profile`)
4. בדוק הפניה ל-`/login`
5. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ הפניה ל-`/login`
- ✅ הודעת שגיאה מתאימה (אם רלוונטי)
- ✅ קונסולה נקייה

**קריטריוני הצלחה:**
- [ ] הפניה ל-`/login`
- [ ] הודעת שגיאה מתאימה
- [ ] 0 שגיאות בקונסולה

---

### 6.4 API Error - 500 Server Error

**מטרה:** בדיקת טיפול בשגיאת API 500

**תרחיש:**
1. נווט ל-`http://localhost:8080/login`
2. נסה להתחבר (עם Backend שעלול להחזיר 500)
3. בדוק הודעת שגיאה מתאימה
4. בדוק שהקונסולה נקייה

**תוצאות צפויות:**
- ✅ הודעת שגיאה מתאימה מוצגת
- ✅ אין שגיאות לא מטופלות בקונסולה
- ✅ האפליקציה לא קורסת

**קריטריוני הצלחה:**
- [ ] הודעת שגיאה מוצגת
- [ ] אין שגיאות לא מטופלות
- [ ] האפליקציה לא קורסת

---

## 9️⃣ Console Hygiene (חובה)

### 7.1 Console - No Errors

**מטרה:** בדיקת ניקיון קונסולה - אין שגיאות

**תרחיש:**
1. פתח DevTools (F12) → Console
2. נקה את הקונסולה (Clear console)
3. בצע כל תרחיש בדיקה (1.1 עד 6.4)
4. בדוק שאין שגיאות בקונסולה (Errors = 0)

**תוצאות צפויות:**
- ✅ 0 שגיאות בקונסולה
- ✅ כל הבדיקות עוברות ללא שגיאות

**קריטריוני הצלחה:**
- [ ] 0 שגיאות בקונסולה
- [ ] כל הבדיקות עוברות

---

### 7.2 Console - No Warnings

**מטרה:** בדיקת ניקיון קונסולה - אין אזהרות

**תרחיש:**
1. פתח DevTools (F12) → Console
2. נקה את הקונסולה (Clear console)
3. בצע כל תרחיש בדיקה (1.1 עד 6.4)
4. בדוק שאין אזהרות בקונסולה (Warnings = 0)

**תוצאות צפויות:**
- ✅ 0 אזהרות בקונסולה
- ✅ כל הבדיקות עוברות ללא אזהרות

**קריטריוני הצלחה:**
- [ ] 0 אזהרות בקונסולה
- [ ] כל הבדיקות עוברות

---

### 7.3 Console - Debug Mode

**מטרה:** בדיקת קונסולה במצב Debug

**תרחיש:**
1. פתח DevTools (F12) → Console
2. נווט ל-`http://localhost:8080/?debug`
3. בצע פעולות שונות (Login, Navigation, וכו')
4. בדוק שיש לוגים בקונסולה (במצב Debug)
5. בדוק שאין שגיאות או אזהרות

**תוצאות צפויות:**
- ✅ לוגים מוצגים בקונסולה (במצב Debug)
- ✅ אין שגיאות או אזהרות
- ✅ לוגים מועילים לניפוי באגים

**קריטריוני הצלחה:**
- [ ] לוגים מוצגים במצב Debug
- [ ] אין שגיאות או אזהרות
- [ ] לוגים מועילים

---

## 📊 סיכום תרחישי בדיקה

### סטטיסטיקות:

| קטגוריה | תרחישים | סטטוס |
|---------|---------|--------|
| **Authentication Flow** | 12 | ⏸️ Ready |
| **Protected Pages** | 6 | ⏸️ Ready |
| **Header Component** | 8 | ⏸️ Ready |
| **Financial Views** | 6 | ⏸️ Ready |
| **Cross-Page Navigation** | 3 | ⏸️ Ready |
| **Error Handling** | 4 | ⏸️ Ready |
| **Console Hygiene** | 3 | ⏸️ Ready |
| **Total** | **42** | ⏸️ **Ready** |

---

## 🔗 קישורים רלוונטיים

### נוהלי עבודה:
- **QA Workflow Protocol:** `documentation/09-GOVERNANCE/standards/TEAM_50_QA_WORKFLOW_PROTOCOL.md`
- **QA Test Index:** `documentation/09-GOVERNANCE/standards/TEAM_50_QA_TEST_INDEX.md`

### דוחות QA:
- **QA Report Template:** `documentation/09-GOVERNANCE/standards/TEAM_50_QA_REPORT_TEMPLATE.md`

### תקשורת - Header & Footer:
> ⚠️ **NON-SSOT:** קבצים אלה הם תקשורת פנימית בלבד ואינם חלק מה-SSOT. להתייחסות בלבד.

- **Header & Footer QA Start:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_HEADER_QA_START.md` (Communication only)
- **Header Implementation Complete:** `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_HEADER_IMPLEMENTATION_COMPLETE.md` (Communication only)
- **Footer Standardization:** `_COMMUNICATION/team_10/TEAM_10_TO_ALL_TEAMS_FOOTER_STANDARDIZATION_FULL.md` (Communication only)

### תקשורת - Routing:
> ⚠️ **NON-SSOT:** קבצים אלה הם תקשורת פנימית בלבד ואינם חלק מה-SSOT. להתייחסות בלבד.

- **Static HTML Routing Documentation:** `_COMMUNICATION/team_10/TEAM_10_STATIC_HTML_ROUTING_DOCUMENTATION.md` (Communication only)
- **Static HTML Routing Fix:** `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_STATIC_HTML_ROUTING_FIX.md` (Communication only)

### תקשורת - Auth Guard:
> ⚠️ **NON-SSOT:** קבצים אלה הם תקשורת פנימית בלבד ואינם חלק מה-SSOT. להתייחסות בלבד.

- **Auth Guard Fix Plan:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_AUTH_GUARD_FIX_PLAN.md` (Communication only)
- **Auth Guard Urgent Fix:** `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_URGENT_FIX_AUTH_GUARD.md` (Communication only)

### החלטות אדריכליות:
> **SSOT:** החלטות אדריכליות מחייבות נקראות מתיקיית `_COMMUNICATION/_Architects_Decisions/`.

- **Header Unification Mandate:** `_COMMUNICATION/_Architects_Decisions/ARCHITECT_HEADER_UNIFICATION_MANDATE.md`
- **Filter Bridge Spec:** `_COMMUNICATION/_Architects_Decisions/ARCHITECT_FILTER_BRIDGE_SPEC_V2.md`
- **Footer Strategy:** `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_FOOTER_STRATEGY.md`

---

## ✅ Sign-off

**מסמך זה מגדיר את כל תרחישי הבדיקה בדפדפן עבור TikTrack Phoenix.**

**חובה:** כל הבדיקות האוטומטיות חייבות לעבור עם **0 שגיאות והערות בקונסולה**.

**Last Updated:** 2026-02-03  
**Maintained By:** Team 50 (QA)  
**Next Update:** After Auth Guard fix and test execution

---

## ⚠️ הערות חשובות (לפי Team 10)

### **Routing (Static HTML Pages):**
1. **Clean Routes:** כל העמודים נגישים דרך clean routes:
   - `/trading_accounts` → `D16_ACCTS_VIEW.html`
   - `/brokers_fees` → `D18_BRKRS_VIEW.html`
   - `/cash_flows` → `D21_CASH_VIEW.html`
   - `/user_profile` → `user_profile.html`
2. **Vite Middleware:** Routing מוגדר ב-`vite.config.js` - בדיקה שהניווט עובד נכון
3. **תיעוד:** `TEAM_10_STATIC_HTML_ROUTING_DOCUMENTATION.md`

### **Header:**
1. **סדר טעינה קריטי:**
   - `phoenix-filter-bridge.js` חייב להיטען לפני `header-loader.js`
   - בדיקה שהסדר נכון בכל העמודים

2. **מניעת כפילויות:**
   - בדיקה שאין Header מוטמע באף עמוד
   - בדיקה ש-`header-loader.js` לא יוצר כפילויות

3. **Dynamic Data Injection:**
   - בדיקה ש-`updateOptions` עובד נכון
   - בדיקה שהאלמנטים נוצרים דינמית

4. **State Persistence:**
   - בדיקה ששמירת מצב עובדת (URL + Session Storage)
   - בדיקה ש-Cross-Page Navigation עובדת

### **Footer:**
1. **מניעת כפילויות:**
   - בדיקה שאין Footer מוטמע באף עמוד
   - בדיקה ש-`footer-loader.js` לא יוצר כפילויות
   - בדיקה שכל העמודים משתמשים ב-`footer-loader.js`

2. **עקביות:**
   - בדיקה שהתוכן של Footer זהה בכל העמודים
   - בדיקה שהסגנון של Footer זהה בכל העמודים

### **Header + Footer יחד:**
1. **עקביות מערכתית:**
   - בדיקה ש-Header ו-Footer עובדים יחד ללא התנגשויות
   - בדיקה שהמבנה הכללי של העמוד נכון (Header > Content > Footer)
   - בדיקה שאין רווחים או בעיות פריסה בין Header ל-Footer

### **Auth Guard (עדיפות גבוהה):**
⚠️ **בעיה דחופה:** Auth Guard מנתב משתמשים מהר מדי - דורש תיקון יסודי ותשתיתי.

**השפעה על QA:**
- ⚠️ **QA של Header/Footer/Routing נדחה זמנית** עד לתיקון Auth Guard
- ⚠️ **QA של Auth Guard קודם** - בעדיפות גבוהה יותר

**תיעוד:**
- `TEAM_10_AUTH_GUARD_DEEP_ANALYSIS_AND_FIX_PLAN.md` - ניתוח מעמיק ותכנית תיקון

**צעדים:**
1. 🔴 **URGENT:** תיקון Auth Guard (Phase 1-3)
2. ⏳ **לאחר תיקון Auth Guard:** המשך QA של Header/Footer/Routing

---

**log_entry | Team 50 | BROWSER_TEST_SCENARIOS | CREATED | GREEN | 2026-02-03**
