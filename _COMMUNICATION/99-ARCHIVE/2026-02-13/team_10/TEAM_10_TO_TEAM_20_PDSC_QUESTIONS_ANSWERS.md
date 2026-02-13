# 📞 תשובות לשאלות Team 20: PDSC Boundary Contract

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend Implementation)  
**תאריך:** 2026-02-07  
**סטטוס:** 📋 **ANSWERS PROVIDED**  
**עדיפות:** 🔴 **P0 - CRITICAL**

---

## 🎯 Executive Summary

**תשובות לשאלות אפשריות מ-Team 20 בנושא PDSC Boundary Contract.**

מסמך זה מספק תשובות לשאלות נפוצות ומסייע בהכנה לסשן החירום.

---

## 📋 שאלות ותשובות

### **Q1: האם ה-Error Schema הנוכחי מתאים ל-Frontend?**

**תשובה:**

✅ **כן, ה-Error Schema מתאים ל-Frontend**, אך יש כמה נקודות לאימות בסשן החירום:

**מה מתאים:**
- ✅ Structure ברור (`success`, `error`, `code`, `message`, `status_code`)
- ✅ `message_i18n` - תמיכה בעתיד (לא חובה כרגע)
- ✅ `details.suggestions` - שימושי ל-Frontend (להצגת הצעות למשתמש)

**מה צריך לאימות:**
- ⚠️ האם `message_i18n` נדרש כבר עכשיו או בעתיד?
- ⚠️ האם `details.suggestions` נדרש בכל שגיאה או רק בחלקן?

**המלצה:** לשאול את Team 30 בסשן החירום.

---

### **Q2: האם כל ה-Error Codes מובנים ל-Frontend?**

**תשובה:**

✅ **כן, כל ה-Error Codes מובנים**, אך יש לוודא:

**Error Codes קיימים:**
- ✅ Authentication (AUTH_*)
- ✅ Validation (VALIDATION_*)
- ✅ User (USER_*)
- ✅ Password Reset (PASSWORD_RESET_*)
- ✅ API Key (API_KEY_*)
- ✅ Financial (FINANCIAL_*)
- ✅ Generic (SERVER_ERROR, NOT_FOUND, etc.)

**מה צריך לאימות:**
- ⚠️ האם יש Error Codes חסרים ל-Frontend?
- ⚠️ האם יש Error Codes מיותרים?

**המלצה:** לשאול את Team 30 בסשן החירום.

---

### **Q3: איך Frontend מטפל בשגיאות?**

**תשובה:**

**לפי ה-Specs הקיימים:**

1. **Error Handling ב-PDSC:**
   - Frontend משתמש ב-Error Schema מהשרת
   - כל שגיאה עוברת דרך PDSC Service
   - טיפול אחיד בשגיאות לפי Error Code

2. **Error Recovery:**
   - לא נדרש כרגע (לפי Spec)
   - ניתן להוסיף בעתיד אם נדרש

3. **Retry Logic:**
   - לא נדרש כרגע (לפי Spec)
   - ניתן להוסיף בעתיד אם נדרש

**המלצה:** לשאול את Team 30 בסשן החירום על Error Handling patterns.

---

### **Q4: האם ה-Response Contract מתאים?**

**תשובה:**

✅ **כן, ה-Response Contract מתאים**, אך יש כמה נקודות לאימות:

**מה מתאים:**
- ✅ `success: true/false` - ברור ופשוט
- ✅ `data` - גמיש (structure varies by endpoint)
- ✅ `meta` - שימושי (timestamp, request_id)

**מה צריך לאימות:**
- ⚠️ מה נדרש ב-`meta`? (רק timestamp + request_id או יותר?)
- ⚠️ האם יש צורך ב-Pagination metadata? (לעתיד?)

**המלצה:** לשאול את Team 30 בסשן החירום.

---

### **Q5: האם `oneOf` (Success/Error) מתאים ל-Frontend?**

**תשובה:**

✅ **כן, `oneOf` מתאים**, אך יש לוודא:

**למה `oneOf` מתאים:**
- ✅ Frontend יכול לבדוק `success: true/false`
- ✅ TypeScript/JavaScript יכול לבדוק את ה-type
- ✅ ברור ופשוט

**מה צריך לאימות:**
- ⚠️ האם יש צורך ב-`discriminator`? (לא נדרש כרגע)
- ⚠️ איך Frontend מבדיל בין Success ל-Error? (לפי `success` field)

**המלצה:** לשאול את Team 30 בסשן החירום.

---

### **Q6: איפה מתבצעת המרת Data (snake_case ↔ camelCase)?**

**תשובה:**

✅ **המרה מתבצעת ב-Frontend** (transformers.js v1.2):

**לפי ה-Specs הקיימים:**

1. **Backend מחזיר:**
   - ✅ `snake_case` (למשל, `user_id`, `created_at`, `brokers_fees`)

2. **Frontend ממיר:**
   - ✅ `camelCase` (למשל, `userId`, `createdAt`, `brokersFees`)
   - ✅ באמצעות `transformers.js` v1.2
   - ✅ `apiToReact()` - API → Frontend
   - ✅ `reactToApi()` - Frontend → API

3. **Financial Fields:**
   - ✅ המרה כפויה למספרים (forced number conversion)
   - ✅ Default value: `0` עבור null/undefined

**מסמכים:**
- `_COMMUNICATION/team_30/TEAM_30_EFR_HARDENED_TRANSFORMERS_LOCK.md`
- `ui/src/cubes/shared/utils/transformers.js`

**המלצה:** לוודא בסשן החירום שהכל מוסכם.

---

### **Q7: האם Backend מחזיר מספרים כ-strings?**

**תשובה:**

⚠️ **צריך לבדוק** - זה נושא לסשן החירום:

**לפי ה-Specs:**
- ⚠️ לא ברור אם Backend מחזיר מספרים כ-strings או numbers
- ✅ Frontend ממיר למספרים (forced number conversion)

**המלצה:** לשאול את Team 30 בסשן החירום:
- האם Backend מחזיר מספרים כ-strings?
- האם יש צורך בשינוי ב-Backend?

---

### **Q8: איך Frontend מבצע API calls?**

**תשובה:**

**לפי ה-Specs הקיימים:**

1. **API Calls:**
   - ✅ Frontend משתמש ב-`fetch()` או `axios`
   - ✅ דרך PDSC Service (Unified Interface)
   - ✅ שימוש ב-`routes.json` (SSOT) לבניית URLs

2. **Request Interceptor:**
   - ⚠️ לא נדרש כרגע (לפי Spec)
   - ניתן להוסיף בעתיד אם נדרש

3. **Response Interceptor:**
   - ⚠️ לא נדרש כרגע (לפי Spec)
   - ניתן להוסיף בעתיד אם נדרש

**מסמכים:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md` (שורות 117-409)

**המלצה:** לשאול את Team 30 בסשן החירום על API calls patterns.

---

### **Q9: איך Frontend שולח JWT token?**

**תשובה:**

**לפי ה-Specs הקיימים:**

1. **Authorization Headers:**
   - ✅ `Authorization: Bearer <token>`
   - ✅ `Content-Type: application/json`
   - ✅ `Accept: application/json`

2. **Token Management:**
   - ✅ Frontend שולח token ב-Headers
   - ⚠️ Token Refresh - לא נדרש כרגע (לפי Spec)
   - ⚠️ Token Expired - לא נדרש כרגע (לפי Spec)

**מסמכים:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md` (שורות 206-242)

**המלצה:** לשאול את Team 30 בסשן החירום על Token Management.

---

### **Q10: איך Frontend בונה URLs?**

**תשובה:**

✅ **Frontend משתמש ב-`routes.json` (SSOT):**

**לפי ה-Specs הקיימים:**

1. **URL Building:**
   - ✅ Frontend טוען `routes.json` (SSOT)
   - ✅ בונה URLs לפי `routes.json`
   - ✅ שימוש ב-`RoutesSSOTLoader` (לפי Spec)

2. **Version Handling:**
   - ✅ Frontend בודק version של `routes.json`
   - ✅ זורק שגיאה אם version לא תואם

3. **Fallback Mechanisms:**
   - ⚠️ לא נדרש כרגע (לפי Spec)
   - ניתן להוסיף בעתיד אם נדרש

**מסמכים:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md` (שורות 117-203)
- `ui/public/routes.json`

**המלצה:** לוודא בסשן החירום שהכל מוסכם.

---

## 🎯 הכנה לסשן החירום

### **שאלות לשאול את Team 30:**

1. **Error Schema:**
   - [ ] האם `message_i18n` נדרש כבר עכשיו או בעתיד?
   - [ ] האם `details.suggestions` נדרש בכל שגיאה או רק בחלקן?
   - [ ] האם יש Error Codes חסרים?
   - [ ] האם יש Error Codes מיותרים?

2. **Response Contract:**
   - [ ] מה נדרש ב-`meta`? (רק timestamp + request_id או יותר?)
   - [ ] האם יש צורך ב-Pagination metadata?
   - [ ] איך Frontend מבדיל בין Success ל-Error?

3. **Transformers Integration:**
   - [ ] האם Backend מחזיר מספרים כ-strings?
   - [ ] האם יש צורך בשינוי ב-Backend?

4. **Fetching Integration:**
   - [ ] איך Frontend מבצע API calls? (fetch/axios/other?)
   - [ ] האם יש צורך ב-Request Interceptor?
   - [ ] האם יש צורך ב-Response Interceptor?
   - [ ] איך Frontend מטפל ב-Token Expired?

5. **Routes SSOT Integration:**
   - [ ] איך Frontend מטפל ב-Version Mismatch?
   - [ ] האם יש צורך ב-Fallback Mechanisms?

---

## 📋 Checklist הכנה

### **Team 20 לפני הסשן:**

- [ ] קריאת `TEAM_20_PDSC_ERROR_SCHEMA.md` (אישור)
- [ ] קריאת `TEAM_20_PDSC_RESPONSE_CONTRACT.md` (אישור)
- [ ] קריאת `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` (טיוטה)
- [ ] הכנת שאלות על Transformers Integration
- [ ] הכנת שאלות על Fetching Integration
- [ ] הכנת שאלות על Routes SSOT Integration

---

## 🔗 קבצים רלוונטיים

### **Specs:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_SCHEMA.md` ✅
- `_COMMUNICATION/team_20/TEAM_20_PDSC_RESPONSE_CONTRACT.md` ✅
- `_COMMUNICATION/team_20/TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` 🟡 (טיוטה)

### **Frontend Specs:**
- `_COMMUNICATION/team_30/TEAM_30_EFR_HARDENED_TRANSFORMERS_LOCK.md`
- `ui/src/cubes/shared/utils/transformers.js`

### **מנדטים:**
- `_COMMUNICATION/team_10/TEAM_10_EMERGENCY_SESSION_20_30_PDSC_BOUNDARY.md`
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_30_EMERGENCY_SESSION_COORDINATION.md`

---

## ⚠️ הערות חשובות

1. **רוב התשובות מבוססות על Specs קיימים** - יש לוודא בסשן החירום שהכל מוסכם
2. **יש שאלות שצריכות תשובה מ-Team 30** - לשאול בסשן החירום
3. **Shared Boundary Contract צריך להיות מוסכם** - לא רק טיוטה

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-07  
**סטטוס:** 📋 **ANSWERS PROVIDED**

**log_entry | [Team 10] | PDSC | QUESTIONS_ANSWERS | BLUE | 2026-02-07**
