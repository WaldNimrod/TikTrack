# ✅ החלטות סופיות ומשימות: סיום אפיונים והגשה לביקורת

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-07  
**סטטוס:** 🟡 **FINAL DECISIONS - TASKS ASSIGNED**  
**עדיפות:** 🔴 **P0 - CRITICAL**

---

## 🎯 Executive Summary

**החלטות סופיות על בסיס תשובות Team 20 ו-Team 30, ומשימות סופיות לסיום האפיונים והגשה לביקורת.**

**מטרה:** השלמת כל האפיונים והגשה לביקורת Team 90.

---

## ✅ החלטות סופיות

### **1. Error Schema** ✅ **DECIDED**

#### **1.1. Error Response Structure:**

**החלטה סופית:**
- ✅ **Structure מתאים** - אין שינויים נדרשים
- ✅ **`message_i18n`** - **לא נדרש כרגע**, אך נשמר ב-Schema לעתיד
  - **החלטה:** Field אופציונלי, לא חובה
  - **שימוש:** בעתיד (i18n support)
- ✅ **`details.suggestions`** - **נדרש רק בשגיאות validation/input**
  - **החלטה:** Field אופציונלי, נדרש רק ב-`VALIDATION_*` errors
  - **שימוש:** הצגת הצעות למשתמש בשגיאות validation

**תוצאה:** Error Schema מאושר ללא שינויים, עם הבהרות על שימוש ב-`message_i18n` ו-`details.suggestions`.

---

#### **1.2. Error Codes:**

**החלטה סופית:**
- ✅ **כל ה-Error Codes מובנים** - אין חסרים/מיותרים
- ✅ **רשימת Error Codes מאושרת** - כפי שמוגדרת ב-`TEAM_20_PDSC_ERROR_SCHEMA.md`

**תוצאה:** Error Codes Enum מאושר ללא שינויים.

---

#### **1.3. Error Handling:**

**החלטה סופית:**
- ✅ **Error Recovery** - **לא נדרש כרגע**
  - **החלטה:** Frontend מציג שגיאה למשתמש, אין recovery אוטומטי
- ✅ **Retry Logic** - **לא נדרש כרגע**
  - **החלטה:** Frontend לא מבצע retry אוטומטי
  - **עתיד:** ניתן להוסיף בעתיד אם נדרש (למשל, עבור network errors)

**תוצאה:** Error Handling Pattern מאושר - Frontend מציג שגיאה, אין recovery/retry אוטומטי.

---

### **2. Response Contract** ✅ **DECIDED**

#### **2.1. Success Response:**

**החלטה סופית:**
- ✅ **Structure מתאים** - אין שינויים נדרשים
- ✅ **`meta` נדרש:** `timestamp` + `request_id` (מינימום)
  - **החלטה:** Field חובה ב-`meta`
  - **שימוש:** לוגים ודיבוג
- ✅ **Pagination metadata** - **לא נדרש כרגע**, אך נשמר ב-Schema לעתיד
  - **החלטה:** Field אופציונלי, לא חובה
  - **שימוש:** בעתיד (pagination support)

**תוצאה:** Success Response Structure מאושר, עם `meta` חובה (`timestamp` + `request_id`).

---

#### **2.2. Unified Response:**

**החלטה סופית:**
- ✅ **`oneOf` (Success/Error) מתאים** - אין שינויים נדרשים
- ✅ **`discriminator`** - **לא נדרש** - `success` field מספיק
  - **החלטה:** Frontend בודק `success: true/false`
- ✅ **Success/Error Detection** - Frontend בודק `success` field

**תוצאה:** Unified Response Structure מאושר, עם `success` field כ-discriminator.

---

### **3. Transformers Integration** ✅ **DECIDED**

#### **3.1. Data Transformation:**

**החלטה סופית:**
- ✅ **Backend מחזיר:** `snake_case` (למשל, `user_id`, `created_at`, `brokers_fees`)
- ✅ **Frontend ממיר:** `camelCase` (למשל, `userId`, `createdAt`, `brokersFees`)
- ✅ **מיקום המרה:** Frontend (`transformers.js` v1.2)
- ✅ **פונקציות:** `apiToReact()` (API → Frontend), `reactToApi()` (Frontend → API)

**תוצאה:** אחריות ברורה - Backend = snake_case, Frontend = camelCase, המרה ב-Frontend.

---

#### **3.2. Financial Fields:**

**החלטה סופית:**
- ⚠️ **Backend מחזיר:** **צריך לבדוק** - זה נושא לסשן החירום
  - **שאלה פתוחה:** האם Backend מחזיר מספרים כ-strings או numbers?
- ✅ **Frontend ממיר:** למספרים (forced number conversion)
- ✅ **מיקום המרה:** Frontend (`transformers.js` v1.2)
- ✅ **Default value:** `0` עבור null/undefined

**תוצאה:** אחריות ברורה - Frontend ממיר למספרים, צריך לבדוק מה Backend מחזיר.

**משימה לסשן:** לבדוק מה Backend מחזיר (strings/numbers) ולהחליט אם יש צורך בשינוי.

---

### **4. Fetching Integration** ✅ **DECIDED**

#### **4.1. API Calls:**

**החלטה סופית:**
- ✅ **Frontend משתמש:** `fetch()` (native API)
- ✅ **Routes SSOT:** שימוש ב-`routes.json` (SSOT) לבניית URLs
- ✅ **Request Interceptor** - **לא נדרש כרגע**
  - **החלטה:** Frontend מוסיף headers ישירות
- ✅ **Response Interceptor** - **לא נדרש כרגע**
  - **החלטה:** Frontend מטפל ב-responses ישירות

**תוצאה:** API Calls Pattern מאושר - `fetch()` + `routes.json` SSOT, אין interceptors.

---

#### **4.2. Authorization:**

**החלטה סופית:**
- ✅ **Authorization Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`, `Accept: application/json`
- ✅ **Token Management:** Frontend שולח token מ-`localStorage` ב-Headers
- ✅ **Token Refresh** - **קיים** ב-`auth.js` (axios interceptor)
- ✅ **Token Expired** - **מטופל** ב-`auth.js` (redirect to login)

**תוצאה:** Authorization Pattern מאושר - Token ב-Headers, Refresh קיים, Expired מטופל.

---

### **5. Routes SSOT Integration** ✅ **DECIDED**

#### **5.1. URL Building:**

**החלטה סופית:**
- ✅ **Frontend משתמש:** `routes.json` (SSOT) לבניית URLs
- ✅ **Loader:** `getApiBaseUrl()` function טוען `routes.json`
- ⚠️ **Version Mismatch** - **warning (לא error)** - צריך לאימות בסשן
  - **החלטה זמנית:** Warning (לא error) - זה בסדר?
  - **שאלה פתוחה:** האם צריך להיות error או warning?

**תוצאה:** URL Building Pattern מאושר - `routes.json` SSOT, צריך להחליט על Version Mismatch.

---

#### **5.2. Fallback Mechanisms:**

**החלטה סופית:**
- ✅ **Fallback Mechanisms קיימים** - Frontend משתמש ב-fallback אם `routes.json` לא זמין
- ✅ **Fallback:** `/api/v1` (default)

**תוצאה:** Fallback Mechanisms מאושרים - Fallback ל-`/api/v1` אם `routes.json` לא זמין.

---

## 📋 שאלות פתוחות לסשן החירום

### **שאלות שצריכות החלטה בסשן:**

1. **Financial Fields:**
   - [ ] האם Backend מחזיר מספרים כ-strings או numbers?
   - [ ] האם יש צורך בשינוי ב-Backend? (למשל, להחזיר numbers במקום strings)

2. **Version Mismatch:**
   - [ ] האם Version Mismatch צריך להיות error או warning?
   - [ ] מה ההשפעה של warning vs error?

---

## 📋 משימות סופיות לצוותים

### **Team 20: PDSC Boundary Contract** 🔴 **CRITICAL**

#### **משימה 1: השלמת Shared Boundary Contract** (16 שעות)

**דרישות:**
- [ ] ביצוע סשן חירום עם Team 30 (8 שעות)
- [ ] עדכון `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` עם החלטות משותפות:
  - [ ] Error Schema - אישור/שינויים
  - [ ] Response Contract - אישור/שינויים
  - [ ] Transformers Integration - הגדרת אחריות ברורה
  - [ ] Fetching Integration - הגדרת אחריות ברורה
  - [ ] Routes SSOT Integration - הגדרת אחריות ברורה
- [ ] הוספת דוגמאות קוד משותפות:
  - [ ] Backend Examples
  - [ ] Frontend Examples
  - [ ] Integration Examples
- [ ] תיעוד Integration Points
- [ ] Validation Rules מוסכמים

**קבצים:**
- `_COMMUNICATION/team_20/TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` (לעדכון)

**Timeline:** 16 שעות (לאחר סשן חירום)

---

#### **משימה 2: בדיקת Financial Fields** (2 שעות)

**דרישות:**
- [ ] לבדוק מה Backend מחזיר (strings/numbers) עבור financial fields
- [ ] להחליט אם יש צורך בשינוי ב-Backend
- [ ] לתעד את ההחלטה ב-Shared Boundary Contract

**Timeline:** 2 שעות (במהלך סשן חירום)

---

### **Team 30: UAI Contract Fixes** 🔴 **CRITICAL**

#### **משימה 1: תיקון Inline JS** (6 שעות)

**דרישות:**
- [ ] להסיר את כל הדוגמאות עם `<script>` inline מה-UAI Contract
- [ ] להגדיר פורמט SSOT חלופי:
  - **אופציה מומלצת:** קובץ JS חיצוני (`pageConfig.js`)
  - **אופציה חלופית:** JSON + loader (`pageConfig.json` + `loadPageConfig()`)
- [ ] לעדכן את כל הדוגמאות בחוזה (Cash Flows, Brokers Fees)
- [ ] לעדכן את ה-Integration examples
- [ ] לעדכן את ה-Validation function

**קבצים:**
- `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md` (לעדכון)

**Timeline:** 6 שעות

---

#### **משימה 2: איחוד naming** (6 שעות)

**דרישות:**
- [ ] איחוד naming: `window.UAIConfig` → `window.UAI.config`
  - [ ] לעדכן שורה 22
  - [ ] לעדכן שורות 199, 266
  - [ ] לעדכן שורות 386, 389
  - [ ] לוודא שכל הדוגמאות עקביות
- [ ] איחוד naming: `brokers` → `brokers_fees`
  - [ ] לעדכן שורה 131 (enum)
  - [ ] לעדכן שורה 290 (דוגמה)

**קבצים:**
- `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md` (לעדכון)

**Timeline:** 6 שעות

---

#### **משימה 3: השלמת Shared Boundary Contract** (16 שעות)

**דרישות:**
- [ ] ביצוע סשן חירום עם Team 20 (8 שעות)
- [ ] עדכון `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` עם החלטות משותפות:
  - [ ] Transformers Integration - הגדרת אחריות ברורה
  - [ ] Fetching Integration - הגדרת אחריות ברורה
  - [ ] Routes SSOT Integration - הגדרת אחריות ברורה
- [ ] הוספת דוגמאות קוד משותפות:
  - [ ] Frontend Examples
  - [ ] Integration Examples
- [ ] תיעוד Integration Points

**קבצים:**
- `_COMMUNICATION/team_20/TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` (לעדכון משותף)

**Timeline:** 16 שעות (לאחר סשן חירום)

---

### **Team 20 + Team 30: סשן חירום** 🚨 **EMERGENCY**

#### **משימה: ביצוע סשן חירום** (8 שעות)

**דרישות:**
- [ ] דיון על Error Schema - אישור/שינויים (2 שעות)
- [ ] דיון על Response Contract - אישור/שינויים (1 שעה)
- [ ] דיון על Transformers Integration - הגדרת אחריות (1 שעה)
- [ ] דיון על Fetching Integration - הגדרת אחריות (1 שעה)
- [ ] דיון על Routes SSOT Integration - הגדרת אחריות (30 דקות)
- [ ] החלטות משותפות - תיעוד (30 דקות)
- [ ] סיכום + החלטות (30 דקות)

**נושאים לדיון:**
1. Financial Fields - Backend מחזיר strings/numbers?
2. Version Mismatch - error או warning?

**תוצאה נדרשת:**
- ✅ כל הנושאים מוסכמים
- ✅ החלטות מתועדות
- ✅ מוכנות לכתיבת Shared Boundary Contract הסופי

**Timeline:** 8 שעות

---

## 📊 טבלת משימות סופיות

| משימה | צוות | סטטוס | Timeline | הערות |
|:---|:---|:---|:---|:---|
| **סשן חירום** | Team 20 + Team 30 | ⏳ **PENDING** | 8 שעות | דיון על כל הנושאים |
| **Shared Boundary Contract** | Team 20 + Team 30 | ⏳ **PENDING** | 16 שעות | לאחר סשן חירום |
| **תיקון Inline JS** | Team 30 | ⏳ **PENDING** | 6 שעות | הסרה + פורמט חלופי |
| **איחוד naming** | Team 30 | ⏳ **PENDING** | 6 שעות | window.UAI.config + brokers_fees |

**סה"כ:** 36 שעות

---

## ✅ Checklist הגשה לביקורת

### **לפני הגשה לביקורת:**

#### **Team 20:**
- [ ] `TEAM_20_PDSC_ERROR_SCHEMA.md` ✅ (מוכן)
- [ ] `TEAM_20_PDSC_RESPONSE_CONTRACT.md` ✅ (מוכן)
- [ ] `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` - להשלים (לאחר סשן)

#### **Team 30:**
- [ ] `TEAM_30_UAI_CONFIG_CONTRACT.md` - לתקן (Inline JS + naming)
- [ ] `TEAM_30_EFR_LOGIC_MAP.md` ✅ (מוכן)
- [ ] `TEAM_30_EFR_HARDENED_TRANSFORMERS_LOCK.md` ✅ (מוכן)

#### **Team 40:**
- [ ] `TEAM_40_CSS_LOAD_VERIFICATION_SPEC.md` ✅ (מוכן)
- [ ] `TEAM_40_CSS_LOAD_VERIFICATION_INTEGRATION.md` ✅ (מוכן)
- [ ] `ui/src/components/core/cssLoadVerifier.js` ✅ (נוצר)

#### **קבצי Core:**
- [ ] `ui/src/components/core/UnifiedAppInit.js` ✅ (נוצר)
- [ ] `ui/src/components/core/stages/DOMStage.js` ✅ (נוצר)
- [ ] `ui/src/components/core/stages/StageBase.js` ✅ (נוצר)
- [ ] `ui/src/components/core/cssLoadVerifier.js` ✅ (נוצר)

---

## 🎯 Timeline סופי

### **שלב 1: סשן חירום (8 שעות)**
- Team 20 + Team 30: ביצוע סשן חירום
- החלטות משותפות על כל הנושאים

### **שלב 2: השלמת Shared Boundary Contract (16 שעות)**
- Team 20 + Team 30: כתיבת Shared Boundary Contract הסופי
- דוגמאות קוד משותפות
- תיעוד Integration Points

### **שלב 3: תיקוני UAI Contract (12 שעות)**
- Team 30: תיקון Inline JS (6 שעות)
- Team 30: איחוד naming (6 שעות)

### **שלב 4: הגשה לביקורת (4 שעות)**
- Team 10: בדיקת עמידה בכל התיקונים
- עדכון דוחות
- הגשת Re-Scan ל-Team 90

**סה"כ:** 40 שעות

---

## ⚠️ אזהרות קריטיות

1. **סשן חירום חובה** - Shared Boundary Contract לא יכול להישאר טיוטה
2. **Inline JS הוא חסם קריטי** - לא ניתן לאשר חוזה שמנחה Inline JS
3. **איחוד naming חובה** - חוסר עקביות יגרום ל-runtime failures

---

## 📞 תמיכה מ-Team 10

**Team 10 זמין לתמיכה:**
- תיאום סשן חירום
- אישור החלטות
- בדיקת תאימות
- הגשה לביקורת

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🟡 **FINAL DECISIONS - TASKS ASSIGNED**

**log_entry | [Team 10] | FINAL_DECISIONS | TASKS_ASSIGNED | YELLOW | 2026-02-07**
