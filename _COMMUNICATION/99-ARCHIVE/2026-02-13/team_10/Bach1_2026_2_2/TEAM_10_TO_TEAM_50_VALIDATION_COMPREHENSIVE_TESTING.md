# 📡 הודעה: Team 10 → Team 50 (Validation Comprehensive Testing)

**From:** Team 10 (The Gateway)  
**To:** Team 50 (QA & Fidelity)  
**Date:** 2026-02-01  
**Session:** SESSION_01 - Phase 1.5  
**Subject:** VALIDATION_COMPREHENSIVE_TESTING | Status: 🔴 **P0 MANDATORY**  
**Priority:** 🔴 **CRITICAL - COMPREHENSIVE VALIDATION TESTING REQUIRED**

---

## 📋 Executive Summary

**משימה:** ביצוע בדיקות מקיפות לולידציה בכל הטפסים במערכת  
**רקע:** Validation Framework הושלם (Backend + Frontend)  
**סטטוס:** ✅ **Backend Complete** (Error Codes), ✅ **Frontend Complete** (PhoenixSchema)  
**דרישה:** בדיקות מקיפות לכל הטפסים ומגוון תרחישים

---

## 🎯 מטרת הבדיקות

לבדוק את תשתית הולידציה המלאה:
1. **Client-side Validation** - ולידציה בצד הלקוח (UX)
2. **Server-side Validation** - ולידציה בצד השרת (Security)
3. **Error Handling** - טיפול בשגיאות (error_code + detail)
4. **PhoenixSchema** - Schemas מרכזיות
5. **Transformation Layer** - המרת camelCase ↔ snake_case
6. **UI/UX** - הודעות שגיאה, BEM classes, Accessibility

---

## 📋 טפסים לבדיקה

### **1. Authentication Forms** 🔴 **P0**

#### **1.1 LoginForm** (`ui/src/components/auth/LoginForm.jsx`)

**Schema:** `ui/src/logic/schemas/authSchema.js`  
**Endpoint:** `POST /auth/login`

**תרחישי בדיקה:**

**Client-side Validation:**
- [ ] שדה ריק - הודעת שגיאה "שדה חובה"
- [ ] אימייל לא תקין - הודעת שגיאה "אימייל לא תקין"
- [ ] שם משתמש לא תקין - הודעת שגיאה "שם משתמש לא תקין"
- [ ] סיסמה ריקה - הודעת שגיאה "שדה חובה"
- [ ] ולידציה על blur - הודעת שגיאה מופיעה כשעוזבים שדה

**Server-side Validation:**
- [ ] שגיאת 401 - Invalid Credentials (`AUTH_INVALID_CREDENTIALS`)
- [ ] שגיאת 400 - Validation Error (`VALIDATION_FIELD_REQUIRED`)
- [ ] שגיאת 429 - Rate Limit (`AUTH_RATE_LIMIT_EXCEEDED`)
- [ ] שגיאת 500 - Server Error (`SERVER_ERROR`)

**Error Handling:**
- [ ] `error_code` מוצג נכון (Priority 1)
- [ ] `detail` מתורגם נכון (Priority 2)
- [ ] הודעת שגיאה בעברית
- [ ] Field-level errors מוצגים נכון
- [ ] Form-level errors מוצגים נכון

**UI/UX:**
- [ ] BEM classes נכונים (`form-group__input--error`)
- [ ] הודעות שגיאה מוצגות נכון
- [ ] ARIA attributes נכונים (`aria-invalid`, `aria-describedby`)
- [ ] Eye icon עובד (הצגה/הסתרה של סיסמה)

---

#### **1.2 RegisterForm** (`ui/src/components/auth/RegisterForm.jsx`)

**Schema:** `ui/src/logic/schemas/authSchema.js`  
**Endpoint:** `POST /auth/register`

**תרחישי בדיקה:**

**Client-side Validation:**
- [ ] שם משתמש ריק - "שדה חובה"
- [ ] שם משתמש קצר מדי - "שם משתמש חייב להיות לפחות 3 תווים"
- [ ] אימייל ריק - "שדה חובה"
- [ ] אימייל לא תקין - "אימייל לא תקין"
- [ ] סיסמה ריקה - "שדה חובה"
- [ ] סיסמה חלשה - "סיסמה חלשה מדי"
- [ ] אימות סיסמה לא תואם - "סיסמאות לא תואמות"
- [ ] טלפון לא תקין (אם מוזן) - "מספר טלפון חייב להיות בפורמט E.164"

**Server-side Validation:**
- [ ] שגיאת 400 - Duplicate User (`USER_ALREADY_EXISTS`)
- [ ] שגיאת 400 - Validation Error (`VALIDATION_FIELD_REQUIRED`)
- [ ] שגיאת 400 - Invalid Email (`VALIDATION_INVALID_EMAIL`)
- [ ] שגיאת 400 - Invalid Phone (`VALIDATION_INVALID_PHONE`)

**Error Handling:**
- [ ] Field-level errors מוצגים נכון
- [ ] Form-level errors מוצגים נכון
- [ ] `error_code` מתורגם נכון

**UI/UX:**
- [ ] כל השדות עוברים ולידציה
- [ ] הודעות שגיאה ברורות
- [ ] BEM classes נכונים
- [ ] ARIA attributes נכונים

---

#### **1.3 PasswordResetFlow** (`ui/src/components/auth/PasswordResetFlow.jsx`)

**Schema:** `ui/src/logic/schemas/authSchema.js`  
**Endpoints:** `POST /auth/reset-password`, `POST /auth/verify-reset`

**תרחישי בדיקה:**

**Step 1: Request Reset:**
- [ ] מזהה ריק - "שדה חובה"
- [ ] מזהה לא תקין - "אימייל או שם משתמש לא תקין"
- [ ] שליחה מוצלחת - הודעת הצלחה

**Step 2: Verify Reset:**
- [ ] טוקן ריק - "שדה חובה"
- [ ] קוד אימות ריק - "שדה חובה"
- [ ] סיסמה חדשה ריקה - "שדה חובה"
- [ ] סיסמה חלשה - "סיסמה חלשה מדי"
- [ ] אימות סיסמה לא תואם - "סיסמאות לא תואמות"

**Server-side Validation:**
- [ ] שגיאת 400 - Invalid Token (`PASSWORD_RESET_INVALID_TOKEN`)
- [ ] שגיאת 400 - Token Expired (`PASSWORD_RESET_TOKEN_EXPIRED`)
- [ ] שגיאת 400 - Invalid Code (`PASSWORD_RESET_INVALID_CODE`)
- [ ] שגיאת 400 - Code Expired (`PASSWORD_RESET_CODE_EXPIRED`)
- [ ] שגיאת 429 - Max Attempts (`PASSWORD_RESET_MAX_ATTEMPTS`)

**Error Handling:**
- [ ] כל שגיאות מוצגות נכון
- [ ] `error_code` מתורגם נכון

---

### **2. Profile Forms** 🔴 **P0**

#### **2.1 ProfileView** (`ui/src/components/profile/ProfileView.jsx`)

**Schema:** `ui/src/logic/schemas/userSchema.js`  
**Endpoint:** `PUT /users/me`

**תרחישי בדיקה:**

**Client-side Validation:**
- [ ] שם פרטי ארוך מדי (>100 תווים) - "שם פרטי לא יכול להיות יותר מ-100 תווים"
- [ ] שם משפחה ארוך מדי (>100 תווים) - "שם משפחה לא יכול להיות יותר מ-100 תווים"
- [ ] שם תצוגה ארוך מדי (>100 תווים) - "שם תצוגה לא יכול להיות יותר מ-100 תווים"
- [ ] אימייל ריק - "שדה חובה"
- [ ] אימייל לא תקין - "אימייל לא תקין"
- [ ] טלפון לא תקין (אם מוזן) - "מספר טלפון חייב להיות בפורמט E.164"
- [ ] אזור זמן ריק - "שדה חובה"
- [ ] אזור זמן לא תקין - "אזור זמן לא תקין"
- [ ] שפה ריקה - "שדה חובה"
- [ ] שפה לא תקינה - "שפה לא תקינה"

**Server-side Validation:**
- [ ] שגיאת 400 - Validation Error (`VALIDATION_FIELD_REQUIRED`)
- [ ] שגיאת 400 - Invalid Email (`VALIDATION_INVALID_EMAIL`)
- [ ] שגיאת 400 - Invalid Phone (`VALIDATION_INVALID_PHONE`)
- [ ] שגיאת 401 - Unauthorized (`AUTH_UNAUTHORIZED`)
- [ ] שגיאת 500 - Server Error (`SERVER_ERROR`)

**Error Handling:**
- [ ] Field-level errors מוצגים נכון
- [ ] Form-level errors מוצגים נכון
- [ ] `error_code` מתורגם נכון

**Transformation Layer:**
- [ ] Payload נשלח ב-snake_case
- [ ] Response מתקבל ב-camelCase

**UI/UX:**
- [ ] כל השדות עוברים ולידציה
- [ ] הודעות שגיאה ברורות
- [ ] BEM classes נכונים
- [ ] ARIA attributes נכונים
- [ ] טעינת נתונים נכונה (initial state)

---

#### **2.2 PasswordChangeForm** (`ui/src/components/profile/PasswordChangeForm.jsx`)

**Schema:** `ui/src/logic/schemas/authSchema.js`  
**Endpoint:** `PUT /users/me/password`

**תרחישי בדיקה:**

**Client-side Validation:**
- [ ] סיסמה ישנה ריקה - "שדה חובה"
- [ ] סיסמה חדשה ריקה - "שדה חובה"
- [ ] סיסמה חלשה - "סיסמה חלשה מדי"
- [ ] אימות סיסמה לא תואם - "סיסמאות לא תואמות"

**Server-side Validation:**
- [ ] שגיאת 401 - Invalid Old Password (`AUTH_INVALID_CREDENTIALS`)
- [ ] שגיאת 400 - Validation Error (`VALIDATION_FIELD_REQUIRED`)
- [ ] שגיאת 400 - Invalid Password (`VALIDATION_INVALID_PASSWORD`)
- [ ] שגיאת 429 - Rate Limit (`AUTH_RATE_LIMIT_EXCEEDED`)
- [ ] שגיאת 500 - Server Error (`SERVER_ERROR`)

**Error Handling:**
- [ ] Field-level errors מוצגים נכון
- [ ] Form-level errors מוצגים נכון
- [ ] `error_code` מתורגם נכון

**UI/UX:**
- [ ] Eye icon עובד (הצגה/הסתרה של סיסמה)
- [ ] BEM classes נכונים
- [ ] ARIA attributes נכונים

---

## 🧪 תרחישי בדיקה נוספים

### **3. Error Code Testing** 🔴 **P0**

**מטרה:** לבדוק שכל Error Codes מתורגמים נכון

**Error Codes לבדיקה:**
- [ ] `AUTH_INVALID_CREDENTIALS` - "שם משתמש או סיסמה שגויים. אנא נסה שוב."
- [ ] `AUTH_TOKEN_EXPIRED` - "פג תוקף ההתחברות. אנא התחבר מחדש."
- [ ] `AUTH_UNAUTHORIZED` - "אין הרשאה לבצע פעולה זו."
- [ ] `VALIDATION_FIELD_REQUIRED` - "שדה חובה"
- [ ] `VALIDATION_INVALID_EMAIL` - "אימייל לא תקין"
- [ ] `VALIDATION_INVALID_PHONE` - "מספר טלפון לא תקין"
- [ ] `USER_NOT_FOUND` - "משתמש לא נמצא."
- [ ] `USER_ALREADY_EXISTS` - "משתמש כבר קיים."
- [ ] `SERVER_ERROR` - "שגיאת שרת פנימית. אנא נסה שוב מאוחר יותר."
- [ ] `NETWORK_ERROR` - "שגיאת רשת. אנא בדוק את החיבור."

---

### **4. Transformation Layer Testing** 🔴 **P0**

**מטרה:** לבדוק שהמרת camelCase ↔ snake_case עובדת נכון

**תרחישי בדיקה:**
- [ ] Payload נשלח ב-snake_case (בדיקה ב-Network tab)
- [ ] Response מתקבל ב-camelCase (בדיקה ב-React state)
- [ ] כל השדות מומרים נכון
- [ ] Nested objects מומרים נכון
- [ ] Arrays מומרים נכון

---

### **5. PhoenixSchema Testing** 🔴 **P0**

**מטרה:** לבדוק ש-Schemas מרכזיות עובדות נכון

**תרחישי בדיקה:**
- [ ] כל Validation Rules ב-Schemas (לא ב-Components)
- [ ] Components משתמשים ב-Schemas מרכזיות
- [ ] אין לוגיקת בדיקה בתוך Components
- [ ] Schemas מחזירות `{ isValid: boolean, error: string|null }`
- [ ] Form validation מחזירה `{ isValid: boolean, errors: Object }`

---

### **6. Accessibility Testing** 🟡 **P1**

**מטרה:** לבדוק Accessibility

**תרחישי בדיקה:**
- [ ] `aria-invalid` מוגדר נכון על שדות עם שגיאות
- [ ] `aria-describedby` מוגדר נכון על שדות עם שגיאות
- [ ] `role="alert"` מוגדר על הודעות שגיאה
- [ ] `aria-live` מוגדר נכון
- [ ] Screen reader קורא הודעות שגיאה נכון

---

### **7. UI/UX Testing** 🟡 **P1**

**מטרה:** לבדוק UI/UX

**תרחישי בדיקה:**
- [ ] BEM classes נכונים (`form-group__input--error`)
- [ ] הודעות שגיאה מוצגות נכון
- [ ] Visual feedback נכון (צבעים, גבולות)
- [ ] הודעות שגיאה נעלמות כשמתקנים
- [ ] Form-level errors מוצגים נכון

---

### **8. Integration Testing** 🔴 **P0**

**מטרה:** לבדוק אינטגרציה מלאה

**תרחישי בדיקה:**
- [ ] Client-side validation → Server-side validation
- [ ] Error handling → Error display
- [ ] Transformation Layer → API call
- [ ] Success flow → Success message
- [ ] Error flow → Error message

---

## 📋 Checklist לבדיקות

### **Phase 1: Client-side Validation** 🔴 **P0**
- [ ] כל הטפסים עוברים ולידציה Client-side
- [ ] כל השדות עוברים ולידציה
- [ ] הודעות שגיאה בעברית
- [ ] ולידציה על blur
- [ ] ולידציה על submit

### **Phase 2: Server-side Validation** 🔴 **P0**
- [ ] כל הטפסים עוברים ולידציה Server-side
- [ ] כל Error Codes מתורגמים נכון
- [ ] Field-level errors מוצגים נכון
- [ ] Form-level errors מוצגים נכון

### **Phase 3: Error Handling** 🔴 **P0**
- [ ] Priority 1: `error_code` מתורגם נכון
- [ ] Priority 2: `detail` מתורגם נכון
- [ ] Fallback: הודעת שגיאה גנרית
- [ ] כל Error Codes מתועדים

### **Phase 4: PhoenixSchema** 🔴 **P0**
- [ ] כל Validation Rules ב-Schemas
- [ ] Components משתמשים ב-Schemas
- [ ] אין לוגיקת בדיקה ב-Components

### **Phase 5: Transformation Layer** 🔴 **P0**
- [ ] Payload נשלח ב-snake_case
- [ ] Response מתקבל ב-camelCase
- [ ] כל השדות מומרים נכון

### **Phase 6: UI/UX** 🟡 **P1**
- [ ] BEM classes נכונים
- [ ] ARIA attributes נכונים
- [ ] הודעות שגיאה מוצגות נכון
- [ ] Visual feedback נכון

---

## 📊 דוח נדרש

**תבנית:** `TEAM_50_QA_REPORT_TEMPLATE.md`  
**מיקום:** `documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_VALIDATION_COMPREHENSIVE_TESTING.md`

**תוכן:**
- סיכום כל הבדיקות שבוצעו
- תוצאות כל הבדיקות
- בעיות שנמצאו
- המלצות לתיקון
- סטטוס כללי

---

## 🔗 מסמכים רלוונטיים

1. **תשתית ולידציה:** `documentation/10-POLICIES/TT2_FORM_VALIDATION_FRAMEWORK.md`
2. **מדריך מפתח:** `documentation/02-DEVELOPMENT/TT2_VALIDATION_DEVELOPER_GUIDE.md`
3. **Backend Implementation:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_ERROR_CODE_CLEAN_IMPLEMENTATION.md`
4. **Frontend Implementation:** `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_VALIDATION_PHOENIX_SCHEMA_COMPLETE.md`
5. **QA Workflow:** `documentation/09-GOVERNANCE/standards/TEAM_50_QA_WORKFLOW_PROTOCOL.md`
6. **QA Test Index:** `documentation/09-GOVERNANCE/standards/TEAM_50_QA_TEST_INDEX.md`

---

## ⚠️ הערות חשובות

1. **Priority:** בדיקות P0 הן חובה, בדיקות P1 הן מומלצות
2. **תיעוד:** כל בדיקה חייבת להיות מתועדת
3. **תמונות:** להוסיף screenshots של שגיאות
4. **Network Tab:** לבדוק את ה-Payloads ב-Network tab
5. **Console:** לבדוק את ה-Errors ב-Console

---

**Team 10 (The Gateway)**  
**Date:** 2026-02-01  
**log_entry | Team 10 | VALIDATION_COMPREHENSIVE_TESTING | TO_TEAM_50 | 2026-02-01**

**Status:** 🔴 **P0 MANDATORY - AWAITING TEAM 50 TESTING**
