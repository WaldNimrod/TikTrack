# 🤝 החלטות ומידע נדרש מול Team 30 - סשן חירום

**id:** `TEAM_20_REQUIRED_DECISIONS_WITH_TEAM_30`  
**owner:** Team 20 (Backend Implementation)  
**status:** 🟡 **PENDING ARCHITECT DECISIONS**  
**last_updated:** 2026-02-07  
**version:** v2.1 (עודכן לפי ביקורת Team 90)

---

**מקור:** `TEAM_20_EMERGENCY_SESSION_PREPARATION.md` + `TEAM_10_EMERGENCY_SESSION_GUIDE.md` + החלטות אדריכלית סופיות  
**תאריך:** 2026-02-07  
**סטטוס:** 🟡 **PENDING ARCHITECT DECISIONS**  
**עדכון:** עודכן לפי ביקורת Team 90 - נושאים פתוחים דורשים החלטה אדריכלית לפני FINAL

**⚠️ הערה חשובה:** המסמך מכיל החלטות שננעלו כ-FINAL / LOCKED, אך גם נושאים פתוחים (OPEN) שדורשים החלטה אדריכלית. המסמך לא יכול להיות FINAL עד פתרון הנושאים הפתוחים.

---

## 🔒 החלטות סופיות לנעילה (FINAL / LOCKED)

**⚠️ החלטות אלה ננעלו כ-FINAL ואינן פתוחות לדיון נוסף:**

### **1. Financial Fields** ✅ **FINAL / LOCKED**
- ✅ Backend מחזיר **string** (Decimal→JSON) - **FINAL**
- ✅ Frontend ממיר **Number** רק דרך `transformers.js` v1.2 - **FINAL**
- ✅ אין שינוי Backend - **FINAL**

### **2. Version Mismatch** ✅ **FINAL / LOCKED**
- ✅ Production = **ERROR** (block) - **FINAL**
- ✅ Development = **WARNING** (non-block) - **FINAL**

### **3. Error Schema** ✅ **FINAL / LOCKED**
- ✅ `message_i18n` עתידי בלבד (לא נדרש כרגע) - **FINAL**
- ✅ `details.suggestions` רק ל-validation - **FINAL**

### **4. Error Handling** ✅ **FINAL / LOCKED**
- ✅ שגיאה אחידה ל-UI - **FINAL**
- ✅ retry/recovery רק ל-network instability - **FINAL**

### **5. Fetching** ✅ **FINAL / LOCKED**
- ✅ `fetch()` + wrapper אחיד - **FINAL**
- ✅ ללא interceptors (אלא אם אדריכלית מאשרת אחרת) - **FINAL**

### **6. Boundary Contract** ✅ **FINAL / LOCKED**
- ✅ מסמך Interface Definition נפרד חובה (Error + Response + examples) - **FINAL**
- ✅ בלי זה אין Gate - **FINAL**

---

## ⚠️ נושאים שדורשים הכרעה אדריכלית (OPEN - לא נעולים)

**⚠️ נושאים אלה עדיין דורשים החלטה אדריכלית לפני חתימה על boundary:**

### **1. PDSC Frontend vs Backend** 🚨 **OPEN - ARCHITECT DECISION REQUIRED**
- ⚠️ זה עדיין דורש החלטת אדריכלית (אסור לנעול בשטח)
- ⚠️ חייב להופיע כ-OPEN, לא כ-RESOLVED
- **דרישה:** החלטה אדריכלית לפני חתימה על boundary
- **נימוקים והמלצות:** מתועדים ב-`TEAM_20_TO_TEAM_10_OPEN_QUESTIONS.md`

### **2. UAI Config ללא inline `<script>`** 🚨 **OPEN - ARCHITECT DECISION REQUIRED**
- ⚠️ חייב פורמט חיצוני (JS/JSON) + Loader
- ⚠️ חייב להופיע כ-OPEN, לא כ-RESOLVED
- **עקרון:** כמה שפחות inline - תשתית נקייה ומיושרת
- **דרישה:** הגדרת פורמט חיצוני + Loader לפני חתימה על boundary
- **נימוקים והמלצות:** מתועדים ב-`TEAM_20_TO_TEAM_10_OPEN_QUESTIONS.md`

### **3. התאמת קוד לחוזה** ⚠️ **PENDING ARCHITECT DECISION**
- ⚠️ קבצים זוהו בקוד:
  - `ui/src/components/core/UnifiedAppInit.js` ⚠️
  - `ui/src/components/core/stages/DOMStage.js` ⚠️
  - `ui/src/components/core/cssLoadVerifier.js` ⚠️
- **עקרון:** הקוד צריך להתאים לחוזה, לא להפך
- **עקרון:** אנחנו לא מייצרים טלאים - אנחנו בונים תשתית שחייבת להיות מיושרת ונקיה ב-100%
- **דרישה:** החלטה אדריכלית על תהליך ההתאמה
- **נימוקים והמלצות:** מתועדים ב-`TEAM_20_TO_TEAM_10_OPEN_QUESTIONS.md`

---

## 🎯 Executive Summary

**רשימה מפורטת של כל המידע וההחלטות שדרושות מול Team 30 בסשן החירום.**

**מטרה:** להשלים את `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` עם החלטות משותפות.

---

## 📋 נושא 1: Error Schema - אישור/שינויים (2 שעות)

### **1.1. Error Response Structure** ✅ **FINAL / LOCKED**

**✅ החלטה סופית - ננעלה כ-FINAL:**

1. **האם ה-Structure הנוכחי מתאים ל-Frontend?**
   - ✅ **FINAL:** Error Response Structure מתאים ל-Frontend
   - ✅ **תוצאה:** ✅ Error Response Structure מוסכם

2. **האם `message_i18n` נדרש כבר עכשיו או בעתיד?**
   - ✅ **FINAL:** `message_i18n` **עתידי בלבד** (לא נדרש כרגע)
   - ✅ **תוצאה:** ✅ `message_i18n` עתידי בלבד

3. **האם `details.suggestions` נדרש בכל שגיאה או רק בחלקן?**
   - ✅ **FINAL:** `details.suggestions` **רק ל-validation** (לא לכל שגיאה)
   - ✅ **תוצאה:** ✅ `details.suggestions` רק ל-validation

**✅ נעול כ-FINAL - לא פתוח לדיון נוסף.**

---

### **1.2. Error Codes** 🔴 **CRITICAL**

**שאלות לדיון:**

1. **האם כל ה-Error Codes מובנים ל-Frontend?**
   - **Team 20 מציג:** רשימת כל ה-Error Codes מ-`TEAM_20_PDSC_ERROR_SCHEMA.md`
   - **Team 30 תשובה מוכנה:** כל ה-Error Codes מובנים, אין חסרים/מיותרים
   - **תוצאה נדרשת:** ✅ רשימת Error Codes מוסכמת

2. **האם יש Error Codes חסרים?**
   - **Team 30 צריך:** להציע Error Codes חסרים (אם יש)
   - **Team 20 צריך:** להחליט אם להוסיף
   - **תוצאה נדרשת:** ✅ Error Codes חסרים - הוספה או דחייה

3. **האם יש Error Codes מיותרים?**
   - **Team 30 צריך:** להציע Error Codes מיותרים (אם יש)
   - **Team 20 צריך:** להחליט אם להסיר
   - **תוצאה נדרשת:** ✅ Error Codes מיותרים - הסרה או שמירה

---

### **1.3. Error Handling** ✅ **FINAL / LOCKED**

**✅ החלטה סופית - ננעלה כ-FINAL:**

1. **איך Frontend מטפל בשגיאות?**
   - ✅ **FINAL:** Frontend מציג **שגיאה אחידה ל-UI**
   - ✅ **תוצאה:** ✅ Error Handling Pattern מוסכם - שגיאה אחידה ל-UI

2. **Error Recovery:**
   - ✅ **FINAL:** Error Recovery **רק ל-network instability** (לא לכל error)
   - ✅ **תוצאה:** ✅ Error Recovery - רק ל-network instability

3. **Retry Logic:**
   - ✅ **FINAL:** Retry Logic **רק ל-network instability** (לא לכל error)
   - ✅ **תוצאה:** ✅ Retry Logic - רק ל-network instability

**✅ נעול כ-FINAL - לא פתוח לדיון נוסף.**

---

## 📋 נושא 2: Response Contract - אישור/שינויים (1 שעה)

### **2.1. Success Response** 🔴 **CRITICAL**

**שאלות לדיון:**

1. **האם ה-Structure הנוכחי מתאים?**
   - **Team 20 מציג:** Success Response Structure מ-`TEAM_20_PDSC_RESPONSE_CONTRACT.md`
   - **Team 30 תשובה מוכנה:** Success Response Structure מתאים
   - **תוצאה נדרשת:** ✅ Success Response Structure מוסכם

2. **מה נדרש ב-`meta`?**
   - **Team 20 מציג:** `meta` Structure עם `timestamp` + `request_id` (מינימום)
   - **Team 30 תשובה מוכנה:** `meta` נדרש: `timestamp` + `request_id` (מינימום)
   - **תוצאה נדרשת:** ✅ `meta` Structure מוסכם

3. **האם יש צורך ב-Pagination metadata?**
   - **Team 30 תשובה מוכנה:** לא נדרש כרגע, אך שימושי לעתיד
   - **Team 20 צריך:** להבין את הדרישות
   - **תוצאה נדרשת:** ✅ Pagination metadata - החלטה (נדרש/לא נדרש/עתיד)

---

### **2.2. Unified Response** 🔴 **CRITICAL**

**שאלות לדיון:**

1. **האם `oneOf` (Success/Error) מתאים?**
   - **Team 20 מציג:** Unified Response Structure עם `oneOf`
   - **Team 30 תשובה מוכנה:** `oneOf` מתאים, `discriminator` לא נדרש
   - **תוצאה נדרשת:** ✅ Unified Response Structure מוסכם

2. **האם יש צורך ב-`discriminator`?**
   - **Team 30 תשובה מוכנה:** לא נדרש (`success` field מספיק)
   - **Team 20 צריך:** להבין את הדרישות
   - **תוצאה נדרשת:** ✅ `discriminator` - החלטה (נדרש/לא נדרש)

3. **איך Frontend מבדיל בין Success ל-Error?**
   - **Team 30 צריך:** להציג את ה-pattern הנוכחי
   - **Team 20 צריך:** להבין את ה-pattern
   - **תוצאה נדרשת:** ✅ Success/Error Detection Pattern מוסכם

---

## 📋 נושא 3: Transformers Integration (1 שעה)

### **3.1. Data Transformation** 🔴 **CRITICAL**

**שאלות לדיון:**

1. **האם Backend מחזיר snake_case?**
   - **Team 20 מציג:** ✅ כן - Backend מחזיר `snake_case` (למשל, `user_id`, `created_at`)
   - **Team 30 תשובה מוכנה:** ✅ Backend מחזיר `snake_case`
   - **תוצאה נדרשת:** ✅ אישור - Backend = snake_case

2. **האם Frontend צריך להמיר ל-camelCase?**
   - **Team 20 מציג:** ✅ כן - Frontend ממיר ל-`camelCase` (למשל, `userId`, `createdAt`)
   - **Team 30 תשובה מוכנה:** ✅ Frontend ממיר ל-`camelCase` באמצעות `apiToReact()`
   - **תוצאה נדרשת:** ✅ אישור - Frontend = camelCase

3. **איפה מתבצעת ההמרה?**
   - **Team 20 מציג:** ✅ Frontend (`transformers.js` v1.2)
   - **Team 30 תשובה מוכנה:** ✅ המרה ב-Frontend (`transformers.js` v1.2)
   - **תוצאה נדרשת:** ✅ אישור - המרה ב-Frontend

---

### **3.2. Financial Fields** ✅ **FINAL / LOCKED**

**✅ החלטה סופית - ננעלה כ-FINAL:**

1. **Backend מחזיר strings:**
   - ✅ **FINAL:** Backend מחזיר **string** (Decimal→JSON)
   - ✅ **תוצאה:** ✅ Backend מחזיר string

2. **Frontend מחויב להמיר למספרים:**
   - ✅ **FINAL:** Frontend ממיר **Number** רק דרך `transformers.js` v1.2
   - ✅ **תוצאה:** ✅ Frontend ממיר Number דרך transformers.js v1.2 בלבד

3. **אין שינוי ב-Backend:**
   - ✅ **FINAL:** אין שינוי Backend
   - ✅ **תוצאה:** ✅ אין שינוי Backend

**✅ נעול כ-FINAL - לא פתוח לדיון נוסף.**

**קבצים לבדיקה:**
- `api/schemas/trading_accounts.py` - `balance: Decimal`
- `api/schemas/cash_flows.py` - `amount: Decimal`
- `api/schemas/brokers_fees.py` - `minimum: Decimal`
- בדיקת תגובת API בפועל (JSON response)

---

## 📋 נושא 4: Fetching Integration (1 שעה)

### **4.1. API Calls** ✅ **FINAL / LOCKED**

**✅ החלטה סופית - ננעלה כ-FINAL:**

1. **איך Frontend מבצע API calls?**
   - ✅ **FINAL:** Frontend משתמש ב-`fetch()` + **wrapper אחיד**
   - ✅ **תוצאה:** ✅ `fetch()` + wrapper אחיד

2. **האם יש צורך ב-Request Interceptor?**
   - ✅ **FINAL:** **ללא interceptors** (אלא אם אדריכלית מאשרת אחרת)
   - ✅ **תוצאה:** ✅ ללא Request Interceptor

3. **האם יש צורך ב-Response Interceptor?**
   - ✅ **FINAL:** **ללא interceptors** (אלא אם אדריכלית מאשרת אחרת)
   - ✅ **תוצאה:** ✅ ללא Response Interceptor

**✅ נעול כ-FINAL - לא פתוח לדיון נוסף.**

---

### **4.2. Authorization** 🔴 **CRITICAL**

**שאלות לדיון:**

1. **איך Frontend שולח JWT token?**
   - **Team 20 מציג:** Authorization Headers: `Authorization: Bearer <token>`
   - **Team 30 צריך:** להציג את ה-pattern הנוכחי
   - **תוצאה נדרשת:** ✅ Authorization Pattern מוסכם

2. **האם יש צורך ב-Token Refresh?**
   - **Team 30 תשובה מוכנה:** ✅ קיים ב-`auth.js` (axios interceptor)
   - **Team 20 צריך:** להבין את ה-pattern
   - **תוצאה נדרשת:** ✅ אישור - Token Refresh קיים

3. **איך מטפלים ב-Token Expired?**
   - **Team 30 תשובה מוכנה:** ✅ מטופל ב-`auth.js` (redirect to login)
   - **Team 20 צריך:** להבין את ה-pattern
   - **תוצאה נדרשת:** ✅ אישור - Token Expired מטופל

---

## 📋 נושא 5: Routes SSOT Integration (30 דקות)

### **5.1. URL Building** 🔴 **CRITICAL**

**שאלות לדיון:**

1. **איך Frontend בונה URLs?**
   - **Team 20 מציג:** שימוש ב-`routes.json` (SSOT) לבניית URLs
   - **Team 30 תשובה מוכנה:** ✅ Frontend משתמש ב-`routes.json` (SSOT)
   - **תוצאה נדרשת:** ✅ אישור - Frontend משתמש ב-`routes.json`

2. **האם יש צורך ב-`routes.json` loader?**
   - **Team 20 מציג:** ✅ כן - `getApiBaseUrl()` function טוען `routes.json`
   - **Team 30 תשובה מוכנה:** ✅ Frontend משתמש ב-`routes.json` (SSOT)
   - **תוצאה נדרשת:** ✅ אישור - `routes.json` loader קיים

---

### **5.2. Version Mismatch** ✅ **FINAL / LOCKED**

**✅ החלטה סופית - ננעלה כ-FINAL:**

1. **Version Mismatch ב-Production:**
   - ✅ **FINAL:** ב-**Production** זה **ERROR** (block)
   - ✅ **תוצאה:** ✅ Production = ERROR (block)

2. **Version Mismatch ב-Development:**
   - ✅ **FINAL:** ב-**Development** זה **WARNING** (non-block)
   - ✅ **תוצאה:** ✅ Development = WARNING (non-block)

**✅ נעול כ-FINAL - לא פתוח לדיון נוסף.**

---

### **5.3. Fallback Mechanisms** 🔴 **CRITICAL**

**שאלות לדיון:**

1. **האם יש צורך ב-Fallback Mechanisms?**
   - **Team 20 מציג:** ✅ Fallback Mechanisms קיימים - Fallback ל-`/api/v1` אם `routes.json` לא זמין
   - **Team 30 תשובה מוכנה:** ✅ Fallback Mechanisms קיימים
   - **תוצאה נדרשת:** ✅ אישור - Fallback Mechanisms קיימים

---

## 📊 סיכום החלטות קריטיות

### **החלטות שננעלו כ-FINAL (לא פתוחות לדיון נוסף):**

1. **Financial Fields** ✅ **FINAL / LOCKED**
   - ✅ Backend מחזיר string (Decimal→JSON) - **FINAL**
   - ✅ Frontend ממיר Number רק דרך transformers.js v1.2 - **FINAL**
   - ✅ אין שינוי Backend - **FINAL**

2. **Version Mismatch** ✅ **FINAL / LOCKED**
   - ✅ Production = ERROR (block) - **FINAL**
   - ✅ Development = WARNING (non-block) - **FINAL**

3. **Error Schema** ✅ **FINAL / LOCKED**
   - ✅ `message_i18n` עתידי בלבד - **FINAL**
   - ✅ `details.suggestions` רק ל-validation - **FINAL**

4. **Error Handling** ✅ **FINAL / LOCKED**
   - ✅ שגיאה אחידה ל-UI - **FINAL**
   - ✅ retry/recovery רק ל-network instability - **FINAL**

5. **Fetching** ✅ **FINAL / LOCKED**
   - ✅ `fetch()` + wrapper אחיד - **FINAL**
   - ✅ ללא interceptors (אלא אם אדריכלית מאשרת אחרת) - **FINAL**

6. **Boundary Contract** ✅ **FINAL / LOCKED**
   - ✅ מסמך Interface Definition נפרד חובה - **FINAL**
   - ✅ בלי זה אין Gate - **FINAL**

---

## 📋 תוצאה נדרשת מהסשן (עדכון לפי Team 90)

### **Shared Boundary Contract Document:**

**קובץ:** `_COMMUNICATION/team_20/TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md`

**⚠️ חובה מסמך Interface Definition נפרד (Error Schema + Response Contract + examples) — בלי זה אין Gate**

**תוכן נדרש (להשלמה):**

1. **JSON Error Schema** (מוסכם) ✅
   - [x] Error Response Structure - מוסכם
   - [x] Error Codes List - מוסכם
   - [ ] Error Handling Guidelines - להגדיר (Frontend מציג שגיאה אחידה; recovery/retry רק רשת)

2. **Response Contract** (מוסכם) ✅
   - [x] Success Response Structure - מוסכם
   - [x] Unified Response Structure - מוסכם
   - [ ] Response Handling Guidelines - להגדיר

3. **Transformers Integration** (מוסכם) ✅
   - [x] Data Transformation Rules - להגדיר
   - [x] Financial Fields Conversion - להגדיר (רשמי: Backend=strings, Frontend=numbers, אין שינוי)
   - [ ] Implementation Guidelines - להגדיר

4. **Fetching Integration** (מוסכם) ✅
   - [x] API Calls Pattern - להגדיר (fetch עם wrapper אחיד)
   - [x] Authorization Handling - להגדיר
   - [x] Error Recovery - להגדיר (רק לאי-יציבות רשת)

5. **Routes SSOT Integration** (מוסכם) ✅
   - [x] URL Building Rules - להגדיר
   - [x] Version Handling - להגדיר (רשמי: Production=ERROR, Dev=WARNING)
   - [x] Fallback Mechanisms - להגדיר

6. **דוגמאות קוד** (מוסכם) ⚠️ **חובה**
   - [ ] **Backend Examples** - להוסיף (חובה)
   - [ ] **Frontend Examples** - להוסיף (חובה - מ-Team 30)
   - [ ] **Integration Examples** - להוסיף (חובה - משותף)
   - [ ] **Boundary Examples** - חובה לכלול דוגמאות input/output בשני צדדים (Backend + Frontend)

7. **פתרון פערים** (מוסכם) ⚠️ **חובה**
   - [ ] פתרון פער "PDSC Frontend vs Backend" - החלטה אדריכלית
   - [ ] תיקון UAI Config (Inline `<script>`) - פורמט חיצוני + Loader
   - [ ] וידוא התאמה בין חוזה לקבצים קיימים (UnifiedAppInit, DOMStage, cssLoadVerifier)

---

## ✅ Checklist לסשן החירום

### **לפני הסשן:**

#### **Team 20 צריך להכין:**
- [x] קריאת `TEAM_20_PDSC_ERROR_SCHEMA.md` ✅
- [x] קריאת `TEAM_20_PDSC_RESPONSE_CONTRACT.md` ✅
- [x] קריאת `TEAM_30_EMERGENCY_SESSION_PREPARATION.md` ✅
- [x] הכנת דוגמאות Error/Success Responses ✅
- [x] הכנת שאלות לדיון ✅
- [ ] בדיקת Financial Fields (לפני/במהלך סשן) ⚠️

#### **Team 30 צריך להכין:**
- [x] קריאת `TEAM_20_PDSC_ERROR_SCHEMA.md` ✅
- [x] קריאת `TEAM_20_PDSC_RESPONSE_CONTRACT.md` ✅
- [x] הכנת תשובות לשאלות ✅
- [x] הכנת דוגמאות קוד Frontend ✅

---

### **במהלך הסשן:**

#### **נושא 1: Error Schema (2 שעות)**
- [ ] דיון על Error Response Structure (30 דקות)
- [ ] דיון על Error Codes (30 דקות)
- [ ] דיון על Error Handling (30 דקות)
- [ ] סיכום + החלטות (30 דקות)

#### **נושא 2: Response Contract (1 שעה)**
- [ ] דיון על Success Response (30 דקות)
- [ ] דיון על Unified Response (30 דקות)

#### **נושא 3: Transformers Integration (1 שעה)**
- [ ] דיון על Data Transformation (20 דקות)
- [ ] **דיון על Financial Fields** (30 דקות) 🚨 **CRITICAL**
- [ ] סיכום + החלטות (10 דקות)

#### **נושא 4: Fetching Integration (1 שעה)**
- [ ] דיון על API Calls (20 דקות)
- [ ] דיון על Authorization (20 דקות)
- [ ] סיכום + החלטות (20 דקות)

#### **נושא 5: Routes SSOT Integration (30 דקות)**
- [ ] דיון על URL Building (10 דקות)
- [ ] **דיון על Version Mismatch** (15 דקות) 🚨 **CRITICAL**
- [ ] דיון על Fallback Mechanisms (5 דקות)

#### **סיכום כללי (30 דקות)**
- [ ] תיעוד כל ההחלטות
- [ ] מוכנות לכתיבת Shared Boundary Contract

---

### **אחרי הסשן:**

- [ ] עדכון Shared Boundary Contract עם החלטות משותפות
- [ ] הוספת דוגמאות קוד משותפות
- [ ] תיעוד Integration Points
- [ ] Validation Rules מוסכמים
- [ ] הגשה ל-Team 10

---

## 🔗 קבצים רלוונטיים

### **מסמכי Team 20:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_SCHEMA.md` ✅
- `_COMMUNICATION/team_20/TEAM_20_PDSC_RESPONSE_CONTRACT.md` ✅
- `_COMMUNICATION/team_20/TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` 🟡 (טיוטה)
- `_COMMUNICATION/team_20/TEAM_20_EMERGENCY_SESSION_PREPARATION.md` ✅

### **מסמכי Team 10:**
- `_COMMUNICATION/team_10/TEAM_10_EMERGENCY_SESSION_GUIDE.md`
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_PDSC_QUESTIONS_ANSWERS.md`
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_30_EMERGENCY_SESSION_COORDINATION.md`

### **מסמכי Team 30:**
- `_COMMUNICATION/team_30/TEAM_30_EMERGENCY_SESSION_PREPARATION.md` ✅ (תשובות Team 30)

### **קבצים טכניים:**
- `api/utils/exceptions.py` - ErrorCodes
- `api/schemas/trading_accounts.py` - Decimal fields
- `api/schemas/cash_flows.py` - Decimal fields
- `api/schemas/brokers_fees.py` - Decimal fields
- `ui/src/cubes/shared/utils/transformers.js` - Transformers
- `ui/public/routes.json` - Routes SSOT

---

## ⚠️ אזהרות קריטיות

### **החלטות שננעלו כ-FINAL / LOCKED:**

1. ✅ **Financial Fields** - **FINAL / LOCKED**
   - ✅ Backend מחזיר string (Decimal→JSON) - **FINAL**
   - ✅ Frontend ממיר Number רק דרך transformers.js v1.2 - **FINAL**
   - ✅ אין שינוי Backend - **FINAL**

2. ✅ **Version Mismatch** - **FINAL / LOCKED**
   - ✅ Production = ERROR (block) - **FINAL**
   - ✅ Development = WARNING (non-block) - **FINAL**

3. ✅ **Boundary Contract** - **FINAL / LOCKED**
   - ✅ מסמך Interface Definition נפרד חובה - **FINAL**
   - ✅ בלי זה אין Gate - **FINAL**

### **נושאים שדורשים הכרעה אדריכלית (OPEN - חוסמים FINAL):**

4. ⚠️ **PDSC Frontend vs Backend** - **OPEN - ARCHITECT DECISION REQUIRED**
   - ⚠️ זה עדיין דורש החלטת אדריכלית (אסור לנעול בשטח)
   - ⚠️ **חוסם:** המסמך לא יכול להיות FINAL עד החלטה אדריכלית

5. ⚠️ **UAI Config ללא inline `<script>`** - **OPEN - ARCHITECT DECISION REQUIRED**
   - ⚠️ חייב פורמט חיצוני (JS/JSON) + Loader
   - ⚠️ **חוסם:** המסמך לא יכול להיות FINAL עד החלטה אדריכלית

6. ⚠️ **התאמת חוזה לקוד הקיים** - **PENDING VERIFICATION**
   - ⚠️ קבצים זוהו (לא מאומתים): `UnifiedAppInit.js`, `DOMStage.js`, `cssLoadVerifier.js`
   - ⚠️ **חוסם:** צריך אימות מוצלב לפני FINAL

### **חובה תיאום:**
- אין שינוי ב-Schema ללא תיאום
- אין שינוי ב-Implementation ללא תיאום
- כל החלטה חייבת להיות מוסכמת

---

## 🎯 הצעדים הבאים

1. **✅ הושלם:** הנעלת החלטות קריטיות כ-FINAL:
   - ✅ Financial Fields (FINAL / LOCKED)
   - ✅ Version Mismatch (FINAL / LOCKED)
   - ✅ Error Schema (FINAL / LOCKED)
   - ✅ Error Handling (FINAL / LOCKED)
   - ✅ Fetching (FINAL / LOCKED)
   - ✅ Boundary Contract (FINAL / LOCKED)

2. **⏳ PENDING:** פתרון נושאים שדורשים הכרעה אדריכלית (חוסמים FINAL):
   - ⚠️ PDSC Frontend vs Backend (OPEN - ARCHITECT DECISION REQUIRED)
   - ⚠️ UAI Config ללא inline `<script>` (OPEN - ARCHITECT DECISION REQUIRED)
   - ⚠️ התאמת חוזה לקוד הקיים (PENDING VERIFICATION - צריך אימות מוצלב)

3. **⏳ PENDING:** השלמת Shared Boundary Contract:
   - ✅ מסמך Interface Definition נפרד (Error Schema + Response Contract + examples)
   - ✅ Boundary Examples (input/output בשני צדדים)
   - ✅ דוגמאות Code משותפות (Backend + Frontend)

4. **⏳ PENDING:** הגשה ל-Team 10 + Team 90 לביקורת:
   - ✅ `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` (מלא)
   - ✅ `TEAM_20_FINAL_DECISIONS_LOCKED_SUMMARY.md` (עם חתימות)
   - ✅ Interface Definition מלא + examples

**⚠️ בשורה התחתונה:**
- ✅ כל ההחלטות הסופיות ננעלו כ-FINAL / LOCKED
- ⚠️ נותרו נושאים שדורשים הכרעה אדריכלית (OPEN) - **חוסמים FINAL**
- 🟡 המסמך **לא יכול להיות FINAL** עד פתרון הנושאים הפתוחים
- 🟡 סטטוס נוכחי: **PENDING ARCHITECT DECISIONS**

---

---

## 📊 סיכום עדכונים סופיים

### **החלטות שננעלו כ-FINAL / LOCKED:**

1. ✅ **Financial Fields** - **FINAL / LOCKED**
   - Backend מחזיר string (Decimal→JSON)
   - Frontend ממיר Number רק דרך transformers.js v1.2
   - אין שינוי Backend

2. ✅ **Version Mismatch** - **FINAL / LOCKED**
   - Production = ERROR (block)
   - Development = WARNING (non-block)

3. ✅ **Error Schema** - **FINAL / LOCKED**
   - `message_i18n` עתידי בלבד
   - `details.suggestions` רק ל-validation

4. ✅ **Error Handling** - **FINAL / LOCKED**
   - שגיאה אחידה ל-UI
   - retry/recovery רק ל-network instability

5. ✅ **Fetching** - **FINAL / LOCKED**
   - `fetch()` + wrapper אחיד
   - ללא interceptors (אלא אם אדריכלית מאשרת אחרת)

6. ✅ **Boundary Contract** - **FINAL / LOCKED**
   - מסמך Interface Definition נפרד חובה
   - Boundary Examples (input/output בשני צדדים)

### **נושאים שדורשים הכרעה אדריכלית (OPEN):**

1. ⚠️ **PDSC Frontend vs Backend** - **OPEN - ARCHITECT DECISION REQUIRED**
   - זה עדיין דורש החלטת אדריכלית (אסור לנעול בשטח)

2. ⚠️ **UAI Config ללא inline `<script>`** - **OPEN - ARCHITECT DECISION REQUIRED**
   - חייב פורמט חיצוני (JS/JSON) + Loader

3. ⚠️ **התאמת חוזה לקוד הקיים** - **PENDING VERIFICATION**
   - ⚠️ קבצים זוהו (לא מאומתים): `UnifiedAppInit.js`, `DOMStage.js`, `cssLoadVerifier.js`
   - ⚠️ צריך אימות מוצלב לפני FINAL

### **בשורה התחתונה:**

- ✅ כל ההחלטות הסופיות ננעלו כ-FINAL
- ⚠️ נותרו נושאים שדורשים הכרעה אדריכלית (OPEN)
- ✅ המסמך מוכן להגשה סופית לאחר פתרון הנושאים הפתוחים

---

**Team 20 (Backend Implementation)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🟡 **PENDING ARCHITECT DECISIONS**  
**גרסה:** v2.1 (עודכן לפי ביקורת Team 90)

**⚠️ הערה:** המסמך מכיל החלטות שננעלו כ-FINAL / LOCKED, אך גם נושאים פתוחים (OPEN) שדורשים החלטה אדריכלית. המסמך לא יכול להיות FINAL עד פתרון הנושאים הפתוחים.

**log_entry | [Team 20] | EMERGENCY_SESSION | PENDING_ARCHITECT_DECISIONS | YELLOW | 2026-02-07 | v2.1**
