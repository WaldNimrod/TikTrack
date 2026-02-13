# 🚨 הכנה לסשן חירום: PDSC Boundary Contract - Team 20

**id:** `TEAM_20_EMERGENCY_SESSION_PREPARATION`  
**owner:** Team 20 (Backend Implementation)  
**status:** 🟡 **PREPARATION**  
**last_updated:** 2026-02-07  
**version:** v1.0

---

**מקור:** `TEAM_10_EMERGENCY_SESSION_GUIDE.md`  
**תאריך:** 2026-02-07  
**סטטוס:** 🟡 **PREPARATION FOR EMERGENCY SESSION**

---

## 🎯 Executive Summary

**מדריך הכנה מקיף לסשן החירום בין Team 20 ל-Team 30.**

מסמך זה מסכם את כל מה שצריך לדעת ולהכין לפני הסשן החירום להשלמת PDSC Shared Boundary Contract.

---

## ✅ מצב נוכחי

### **מה מוכן (Team 20):**
- ✅ `TEAM_20_PDSC_ERROR_SCHEMA.md` - מוכן ומפורט
- ✅ `TEAM_20_PDSC_RESPONSE_CONTRACT.md` - מוכן ומפורט
- ✅ `TEAM_20_EMERGENCY_SESSION_PREPARATION.md` - מוכן (מסמך זה)
- ⚠️ `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` - טיוטה ראשונית

### **מה מוכן (Team 30):**
- ✅ `TEAM_30_EMERGENCY_SESSION_PREPARATION.md` - מוכן ומפורט
- ✅ תשובות לשאלות צפויות - מוכנות
- ✅ דוגמאות קוד - מוכנות
- ✅ נקודות לדיון - מסומנות

### **מה צריך להשלים בסשן:**
- ❌ הסכמה משותפת על Error Schema
- ❌ הסכמה משותפת על Response Contract
- ❌ הגדרת Transformers Integration (אחריות ברורה)
- ❌ הגדרת Fetching Integration (אחריות ברורה)
- ❌ הגדרת Routes SSOT Integration (אחריות ברורה)
- ❌ דוגמאות קוד משותפות
- ❌ תיעוד Integration Points

---

## 📋 הכנה נדרשת לפני הסשן

### **1. קריאת מסמכים** ✅

#### **מסמכי Team 20 (לבדיקה ואישור):**
- [x] `TEAM_20_PDSC_ERROR_SCHEMA.md` - ✅ קראתי
- [x] `TEAM_20_PDSC_RESPONSE_CONTRACT.md` - ✅ קראתי
- [x] `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` - ✅ קראתי (טיוטה)

#### **מסמכי Team 10 (להבנה):**
- [x] `TEAM_10_EMERGENCY_SESSION_GUIDE.md` - ✅ קראתי
- [x] `TEAM_10_TO_TEAM_20_PDSC_QUESTIONS_ANSWERS.md` - ✅ קראתי
- [x] `TEAM_10_TO_TEAM_20_30_EMERGENCY_SESSION_COORDINATION.md` - ✅ קראתי

#### **מסמכי Team 30 (להבנה):**
- [x] `TEAM_30_EMERGENCY_SESSION_PREPARATION.md` - ✅ קראתי (תשובות Team 30)
- [ ] `TEAM_30_EFR_HARDENED_TRANSFORMERS_LOCK.md` - ⚠️ צריך לקרוא
- [ ] `UAI_Architectural_Design.md` - ⚠️ צריך לקרוא (אם רלוונטי)

#### **קבצים טכניים:**
- [x] `api/utils/exceptions.py` - ✅ קראתי (ErrorCodes)
- [ ] `ui/src/cubes/shared/utils/transformers.js` - ⚠️ צריך לבדוק
- [ ] `ui/public/routes.json` - ⚠️ צריך לבדוק

---

### **2. הכנת דוגמאות** ✅

#### **דוגמאות Error Responses:**
- [x] Trading Account Not Found - ✅ מוכן
- [x] Validation Error - ✅ מוכן
- [x] Authentication Error - ✅ מוכן
- [x] Server Error - ✅ מוכן

#### **דוגמאות Success Responses:**
- [x] GET Single Resource - ✅ מוכן
- [x] GET List of Resources - ✅ מוכן
- [x] POST Create Resource - ✅ מוכן
- [x] PUT Update Resource - ✅ מוכן
- [x] DELETE Resource - ✅ מוכן

#### **דוגמאות Backend Code:**
- [x] Error Response Helper - ✅ מוכן
- [x] Success Response Helper - ✅ מוכן
- [x] Router Usage Example - ✅ מוכן

---

### **3. הכנת שאלות לדיון** 🔴

#### **שאלות על Error Schema:**

1. **Error Response Structure:**
   - [ ] האם `message_i18n` נדרש כבר עכשיו או בעתיד?
   - [ ] האם `details.suggestions` נדרש בכל שגיאה או רק בחלקן?
   - [ ] האם ה-Structure הנוכחי מתאים ל-Frontend?

2. **Error Codes:**
   - [ ] האם כל ה-Error Codes מובנים ל-Frontend?
   - [ ] האם יש Error Codes חסרים?
   - [ ] האם יש Error Codes מיותרים?

3. **Error Handling:**
   - [ ] איך Frontend מטפל בשגיאות?
   - [ ] האם יש צורך ב-Error Recovery?
   - [ ] האם יש צורך ב-Retry Logic?

---

#### **שאלות על Response Contract:**

1. **Success Response:**
   - [ ] מה נדרש ב-`meta`? (רק timestamp + request_id או יותר?)
   - [ ] האם יש צורך ב-Pagination metadata?

2. **Unified Response:**
   - [ ] האם `oneOf` (Success/Error) מתאים?
   - [ ] האם יש צורך ב-`discriminator`?
   - [ ] איך Frontend מבדיל בין Success ל-Error?

---

#### **שאלות על Transformers Integration:**

1. **Data Transformation:**
   - [ ] האם Backend מחזיר snake_case? ✅ (כן - לפי Spec)
   - [ ] האם Frontend צריך להמיר ל-camelCase? ✅ (כן - transformers.js)
   - [ ] איפה מתבצעת ההמרה? ✅ (Frontend - transformers.js v1.2)

2. **Financial Fields:**
   - [ ] האם Backend מחזיר מספרים כ-strings או numbers?
   - [ ] האם Frontend צריך להמיר למספרים? ✅ (כן - forced number conversion)
   - [ ] איפה מתבצעת ההמרה? ✅ (Frontend - transformers.js v1.2)

---

#### **שאלות על Fetching Integration:**

1. **API Calls:**
   - [ ] איך Frontend מבצע API calls? (fetch/axios/other?)
   - [ ] האם יש צורך ב-Request Interceptor?
   - [ ] האם יש צורך ב-Response Interceptor?

2. **Authorization:**
   - [ ] איך Frontend שולח JWT token? (Headers?)
   - [ ] האם יש צורך ב-Token Refresh?
   - [ ] איך מטפלים ב-Token Expired?

---

#### **שאלות על Routes SSOT Integration:**

1. **URL Building:**
   - [ ] איך Frontend בונה URLs? (routes.json loader?)
   - [ ] האם יש צורך ב-`routes.json` loader? ✅ (כן - לפי Spec)
   - [ ] איך מטפלים ב-Version Mismatch?

2. **Fallback Mechanisms:**
   - [ ] האם יש צורך ב-Fallback Mechanisms?

---

## 📊 תשובות מוכנות (לפי Q&A)

### **Q1: האם ה-Error Schema הנוכחי מתאים ל-Frontend?**

**תשובה מוכנה (Team 20):**
- ✅ כן, ה-Error Schema מתאים ל-Frontend
- ⚠️ צריך לאימות: `message_i18n` (נדרש/לא נדרש/עתיד?), `details.suggestions` (כל שגיאה/רק חלקן?)

**תשובה מ-Team 30:**
- ✅ ה-Structure הנוכחי מתאים ל-Frontend
- ⚠️ `message_i18n` - **לא נדרש כרגע**, אך שימושי לעתיד
- ⚠️ `details.suggestions` - **שימושי**, אך לא חובה בכל שגיאה (נדרש רק בשגיאות validation/input)

---

### **Q2: האם כל ה-Error Codes מובנים ל-Frontend?**

**תשובה מוכנה (Team 20):**
- ✅ כן, כל ה-Error Codes מובנים
- ⚠️ צריך לאימות: Error Codes חסרים/מיותרים?

**תשובה מ-Team 30:**
- ✅ כל ה-Error Codes מובנים ל-Frontend
- ✅ אין Error Codes חסרים - הרשימה הנוכחית מכסה את כל המקרים
- ✅ אין Error Codes מיותרים - כל ה-Codes שימושיים

---

### **Q3: איפה מתבצעת המרת Data (snake_case ↔ camelCase)?**

**תשובה מוכנה (Team 20):**
- ✅ המרה מתבצעת ב-Frontend (transformers.js v1.2)
- ✅ Backend מחזיר snake_case
- ✅ Frontend ממיר ל-camelCase באמצעות `apiToReact()`
- ✅ Frontend ממיר ל-snake_case באמצעות `reactToApi()`

**תשובה מ-Team 30:**
- ✅ המרה מתבצעת ב-Frontend (transformers.js v1.2)
- ✅ Backend מחזיר snake_case
- ✅ Frontend ממיר ל-camelCase באמצעות `apiToReact()`
- ✅ Frontend ממיר ל-snake_case באמצעות `reactToApi()`

---

### **Q4: האם Backend מחזיר מספרים כ-strings?**

**תשובה מוכנה (Team 20):**
- ⚠️ צריך לבדוק - זה נושא לסשן החירום
- ✅ Frontend ממיר למספרים (forced number conversion)

**תשובה מ-Team 30:**
- ⚠️ **לא ברור אם Backend מחזיר מספרים כ-strings או numbers**
- ✅ Frontend ממיר למספרים (forced number conversion)
- ⚠️ **שאלה לסשן:** האם Backend מחזיר מספרים כ-strings? האם יש צורך בשינוי ב-Backend?

---

### **Q5: איך Frontend מבצע API calls?**

**תשובה מוכנה (Team 20):**
- ✅ Frontend משתמש ב-`fetch()` או `axios`
- ✅ דרך PDSC Service (Unified Interface)
- ✅ שימוש ב-`routes.json` (SSOT) לבניית URLs

**תשובה מ-Team 30:**
- ✅ Frontend משתמש ב-`fetch()` (native API)
- ✅ שימוש ב-`routes.json` (SSOT) לבניית URLs
- ✅ שימוש ב-`transformers.js` v1.2 להמרת נתונים
- ⚠️ Request Interceptor - **לא נדרש כרגע**
- ⚠️ Response Interceptor - **לא נדרש כרגע**
- ✅ Token Refresh - **קיים** ב-`auth.js` (axios interceptor)
- ✅ Token Expired - **מטופל** ב-`auth.js` (redirect to login)

---

## 🎯 נושאים לדיון בסשן

### **1. Error Schema - אישור/שינויים** 🔴 (שעות 1-2)

**מטרה:** אימות Error Schema עם Frontend.

**נקודות לדיון:**
- Error Response Structure - האם מתאים?
- `message_i18n` - נדרש/לא נדרש/עתיד?
- `details.suggestions` - כל שגיאה/רק חלקן?
- Error Codes - האם כל ה-Codes מובנים?
- Error Codes חסרים/מיותרים?

**מסמכים להצגה:**
- `TEAM_20_PDSC_ERROR_SCHEMA.md`
- דוגמאות Error Responses

---

### **2. Response Contract - אישור/שינויים** 🔴 (שעות 2-3)

**מטרה:** אימות Response Contract עם Frontend.

**נקודות לדיון:**
- Success Response Structure - האם מתאים?
- `meta` field - מה נדרש?
- Pagination metadata - נדרש/לא נדרש/עתיד?
- Unified Response (`oneOf`) - האם מתאים?
- Response Type Detection - איך Frontend מבדיל?

**מסמכים להצגה:**
- `TEAM_20_PDSC_RESPONSE_CONTRACT.md`
- דוגמאות Success Responses

---

### **3. Transformers Integration** 🔴 (שעות 3-4)

**מטרה:** תיאום על Transformers Integration.

**נקודות לדיון:**
- Data Transformation - Backend = snake_case, Frontend = camelCase
- Financial Fields - Backend מחזיר strings/numbers?
- Number Conversion - איפה מתבצעת?
- `transformers.js` v1.2 - האם מתאים?

**מסמכים להצגה:**
- `TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md` (Transformers section)
- דוגמאות Backend Responses

---

### **4. Fetching Integration** 🔴 (שעות 4-5)

**מטרה:** תיאום על Fetching Integration.

**נקודות לדיון:**
- API Calls Pattern - איך Frontend מבצע?
- Request/Response Interceptors - נדרש/לא נדרש?
- Authorization - איך Frontend שולח JWT token?
- Token Refresh/Expired - איך מטפלים?

**מסמכים להצגה:**
- `TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md` (Fetching section)

---

### **5. Routes SSOT Integration** 🔴 (שעות 5-6)

**מטרה:** תיאום על Routes SSOT Integration.

**נקודות לדיון:**
- URL Building - איך Frontend בונה URLs?
- `routes.json` Loader - נדרש/לא נדרש?
- Version Mismatch - איך מטפלים?
- Fallback Mechanisms - נדרש/לא נדרש?

**מסמכים להצגה:**
- `TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md` (Routes SSOT section)
- `ui/public/routes.json` v1.1.2

---

## 📝 תוצאה נדרשת מהסשן

### **Shared Boundary Contract Document:**

**קובץ:** `_COMMUNICATION/team_20/TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md`

**תוכן נדרש (להשלמה):**

1. **JSON Error Schema** (מוסכם) ✅
   - Error Response Structure - להסכים
   - Error Codes List - להסכים
   - Error Handling Guidelines - להגדיר

2. **Response Contract** (מוסכם) ✅
   - Success Response Structure - להסכים
   - Unified Response Structure - להסכים
   - Response Handling Guidelines - להגדיר

3. **Transformers Integration** (מוסכם) ⚠️
   - Data Transformation Rules - להגדיר
   - Financial Fields Conversion - להגדיר
   - Implementation Guidelines - להגדיר

4. **Fetching Integration** (מוסכם) ⚠️
   - API Calls Pattern - להגדיר
   - Authorization Handling - להגדיר
   - Error Recovery - להגדיר

5. **Routes SSOT Integration** (מוסכם) ⚠️
   - URL Building Rules - להגדיר
   - Version Handling - להגדיר
   - Fallback Mechanisms - להגדיר

6. **דוגמאות קוד** (מוסכם) ⚠️
   - Backend Examples - להוסיף
   - Frontend Examples - להוסיף
   - Integration Examples - להוסיף

---

## ✅ Checklist הכנה

### **לפני הסשן:**

#### **קריאת מסמכים:**
- [x] `TEAM_20_PDSC_ERROR_SCHEMA.md` ✅
- [x] `TEAM_20_PDSC_RESPONSE_CONTRACT.md` ✅
- [x] `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` ✅
- [x] `TEAM_10_EMERGENCY_SESSION_GUIDE.md` ✅
- [x] `TEAM_10_TO_TEAM_20_PDSC_QUESTIONS_ANSWERS.md` ✅
- [x] `TEAM_30_EMERGENCY_SESSION_PREPARATION.md` ✅ (תשובות Team 30)
- [ ] `TEAM_30_EFR_HARDENED_TRANSFORMERS_LOCK.md` ⚠️
- [ ] `ui/src/cubes/shared/utils/transformers.js` ⚠️

#### **הכנת דוגמאות:**
- [x] Error Responses (4 דוגמאות) ✅
- [x] Success Responses (5 דוגמאות) ✅
- [x] Backend Code Examples ✅

#### **הכנת שאלות:**
- [x] שאלות על Error Schema ✅
- [x] שאלות על Response Contract ✅
- [x] שאלות על Transformers Integration ✅
- [x] שאלות על Fetching Integration ✅
- [x] שאלות על Routes SSOT Integration ✅

---

### **במהלך הסשן:**

- [ ] פתיחה + סקירה (30 דקות)
- [ ] דיון על Error Schema (2 שעות)
- [ ] דיון על Response Contract (1 שעה)
- [ ] דיון על Transformers Integration (1 שעה)
- [ ] דיון על Fetching Integration (1 שעה)
- [ ] דיון על Routes SSOT Integration (30 דקות)
- [ ] סיכום + החלטות (30 דקות)

---

### **אחרי הסשן:**

- [ ] כתיבת Shared Boundary Contract הסופי
- [ ] דוגמאות קוד משותפות
- [ ] תיעוד משותף
- [ ] הגשה ל-Team 10

---

## 🔗 קבצים רלוונטיים

### **מסמכי Team 20:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_SCHEMA.md` ✅
- `_COMMUNICATION/team_20/TEAM_20_PDSC_RESPONSE_CONTRACT.md` ✅
- `_COMMUNICATION/team_20/TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` 🟡 (טיוטה)
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md` (v1.1)

### **מסמכי Team 10:**
- `_COMMUNICATION/team_10/TEAM_10_EMERGENCY_SESSION_GUIDE.md`
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_PDSC_QUESTIONS_ANSWERS.md`
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_30_EMERGENCY_SESSION_COORDINATION.md`

### **מסמכי Team 30:**
- `_COMMUNICATION/team_30/TEAM_30_EMERGENCY_SESSION_PREPARATION.md` ✅ (תשובות Team 30)
- `_COMMUNICATION/team_30/TEAM_30_EFR_HARDENED_TRANSFORMERS_LOCK.md`

### **קבצים טכניים:**
- `api/utils/exceptions.py` - ErrorCodes
- `ui/src/cubes/shared/utils/transformers.js` - Transformers
- `ui/public/routes.json` - Routes SSOT

---

## ⚠️ אזהרות קריטיות

### **1. השרת הוא מקור החוק:**
- ✅ כל Error Schema חייב להיות מוגדר מהשרת
- ✅ Frontend לא יכול לשנות את ה-Schema
- ✅ כל שינוי ב-Schema דורש עדכון ב-Server

---

### **2. הלקוח הוא מקור המימוש:**
- ✅ הלקוח מממש Fetching + Transformers
- ✅ Backend רק מגדיר את ה-Schema
- ✅ כל שינוי ב-Implementation דורש עדכון ב-Client

---

### **3. חובה תיאום:**
- ✅ אין שינוי ב-Schema ללא תיאום
- ✅ אין שינוי ב-Implementation ללא תיאום
- ✅ כל החלטה חייבת להיות מוסכמת

---

## 🎯 הצעדים הבאים

1. **מיידי:** ✅ קריאת `TEAM_30_EMERGENCY_SESSION_PREPARATION.md` (תשובות Team 30)
2. **לפני הסשן:** השלמת קריאת מסמכי Team 30 הנוספים
3. **במהלך הסשן:** דיון מפורט על כל הנושאים (עם תשובות Team 30 מוכנות)
4. **אחרי הסשן:** כתיבת Shared Boundary Contract הסופי

---

## 📋 תשובות Team 30 - סיכום

### **Error Schema:**
- ✅ Structure מתאים
- ⚠️ `message_i18n` - לא נדרש כרגע, אך שימושי לעתיד
- ⚠️ `details.suggestions` - שימושי, אך לא חובה בכל שגיאה (רק validation/input)
- ✅ כל ה-Error Codes מובנים, אין חסרים/מיותרים

### **Response Contract:**
- ✅ Success Response Structure מתאים
- ✅ `meta` נדרש: `timestamp` + `request_id` (מינימום)
- ⚠️ Pagination metadata - לא נדרש כרגע, אך שימושי לעתיד
- ✅ `oneOf` מתאים, `discriminator` לא נדרש

### **Transformers Integration:**
- ✅ המרה ב-Frontend (transformers.js v1.2)
- ✅ Backend = snake_case, Frontend = camelCase
- ⚠️ Financial Fields - צריך לבדוק אם Backend מחזיר strings או numbers

### **Fetching Integration:**
- ✅ Frontend משתמש ב-`fetch()` (native API)
- ✅ שימוש ב-`routes.json` (SSOT)
- ⚠️ Request/Response Interceptors - לא נדרש כרגע
- ✅ Token Refresh - קיים ב-`auth.js`
- ✅ Token Expired - מטופל ב-`auth.js`

### **Routes SSOT Integration:**
- ✅ Frontend משתמש ב-`routes.json` (SSOT)
- ✅ Fallback Mechanisms קיימים
- ⚠️ Version Mismatch - warning (לא error) - זה בסדר?

---

**Team 20 (Backend Implementation)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🟡 **PREPARATION FOR EMERGENCY SESSION**

**log_entry | [Team 20] | EMERGENCY_SESSION | PREPARATION | YELLOW | 2026-02-07**
