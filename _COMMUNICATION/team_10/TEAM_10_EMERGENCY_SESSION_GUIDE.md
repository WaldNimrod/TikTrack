# 🚨 מדריך סשן חירום: PDSC Shared Boundary Contract

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend) + Team 30 (Frontend)  
**תאריך:** 2026-02-07  
**סטטוס:** 🚨 **EMERGENCY - SESSION GUIDE**  
**עדיפות:** 🔴 **P0 - CRITICAL**

---

## 🎯 Executive Summary

**מדריך מפורט לסשן החירום בין Team 20 ל-Team 30 להשלמת PDSC Shared Boundary Contract.**

**מטרה:** השלמת `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` תוך 8 שעות.

---

## ✅ מצב נוכחי

### **מה מוכן:**
- ✅ `TEAM_20_PDSC_ERROR_SCHEMA.md` - מוכן (Team 20)
- ✅ `TEAM_20_PDSC_RESPONSE_CONTRACT.md` - מוכן (Team 20)
- ⚠️ `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` - טיוטה (Team 20)

### **מה חסר:**
- ❌ הסכמה משותפת על Boundary Definition
- ❌ דוגמאות קוד משותפות
- ❌ תיעוד Integration Points
- ❌ Validation Rules מוסכמים

---

## 📋 נושאים לדיון בסשן

### **1. Error Schema - אישור/שינויים** 🔴

**מסמך לבדיקה:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_SCHEMA.md`

**שאלות לדיון:**

#### **1.1. Error Response Structure:**
- [ ] האם ה-Structure הנוכחי מתאים ל-Frontend?
  - **Team 20:** להציג את ה-Structure
  - **Team 30:** לאשר או לבקש שינויים
- [ ] האם `message_i18n` נדרש כבר עכשיו או בעתיד?
  - **Team 20:** להציג את ה-Structure
  - **Team 30:** להחליט אם נדרש כרגע
- [ ] האם `details.suggestions` נדרש בכל שגיאה או רק בחלקן?
  - **Team 20:** להציג דוגמאות
  - **Team 30:** להחליט על שימוש

**תוצאה נדרשת:**
- ✅ Error Response Structure מוסכם
- ✅ `message_i18n` - החלטה (נדרש/לא נדרש/עתיד)
- ✅ `details.suggestions` - החלטה (כל שגיאה/רק חלקן)

---

#### **1.2. Error Codes:**
- [ ] האם כל ה-Error Codes מובנים ל-Frontend?
  - **Team 20:** להציג את רשימת ה-Error Codes
  - **Team 30:** לבדוק ולהציע שינויים
- [ ] האם יש Error Codes חסרים?
  - **Team 30:** להציע Error Codes חסרים
  - **Team 20:** להחליט אם להוסיף
- [ ] האם יש Error Codes מיותרים?
  - **Team 30:** להציע Error Codes מיותרים
  - **Team 20:** להחליט אם להסיר

**תוצאה נדרשת:**
- ✅ רשימת Error Codes מוסכמת
- ✅ Error Codes חסרים - הוספה או דחייה
- ✅ Error Codes מיותרים - הסרה או שמירה

---

#### **1.3. Error Handling:**
- [ ] איך Frontend מטפל בשגיאות?
  - **Team 30:** להציג את ה-pattern הנוכחי
  - **Team 20:** להבין את ה-pattern
- [ ] האם יש צורך ב-Error Recovery?
  - **Team 30:** להחליט אם נדרש
  - **Team 20:** להבין את הדרישות
- [ ] האם יש צורך ב-Retry Logic?
  - **Team 30:** להחליט אם נדרש
  - **Team 20:** להבין את הדרישות

**תוצאה נדרשת:**
- ✅ Error Handling Pattern מוסכם
- ✅ Error Recovery - החלטה (נדרש/לא נדרש)
- ✅ Retry Logic - החלטה (נדרש/לא נדרש)

---

### **2. Response Contract - אישור/שינויים** 🔴

**מסמך לבדיקה:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_RESPONSE_CONTRACT.md`

**שאלות לדיון:**

#### **2.1. Success Response:**
- [ ] האם ה-Structure הנוכחי מתאים?
  - **Team 20:** להציג את ה-Structure
  - **Team 30:** לאשר או לבקש שינויים
- [ ] מה נדרש ב-`meta`?
  - **Team 20:** להציג את ה-Structure הנוכחי
  - **Team 30:** להחליט מה נדרש (timestamp, request_id, pagination?)
- [ ] האם יש צורך ב-Pagination metadata?
  - **Team 30:** להחליט אם נדרש
  - **Team 20:** להבין את הדרישות

**תוצאה נדרשת:**
- ✅ Success Response Structure מוסכם
- ✅ `meta` Structure מוסכם
- ✅ Pagination metadata - החלטה (נדרש/לא נדרש/עתיד)

---

#### **2.2. Unified Response:**
- [ ] האם `oneOf` (Success/Error) מתאים?
  - **Team 20:** להציג את ה-Structure
  - **Team 30:** לאשר או לבקש שינויים
- [ ] האם יש צורך ב-`discriminator`?
  - **Team 30:** להחליט אם נדרש
  - **Team 20:** להבין את הדרישות
- [ ] איך Frontend מבדיל בין Success ל-Error?
  - **Team 30:** להציג את ה-pattern הנוכחי
  - **Team 20:** להבין את ה-pattern

**תוצאה נדרשת:**
- ✅ Unified Response Structure מוסכם
- ✅ `discriminator` - החלטה (נדרש/לא נדרש)
- ✅ Success/Error Detection Pattern מוסכם

---

### **3. Transformers Integration** 🔴

**מסמכים לבדיקה:**
- `_COMMUNICATION/team_30/TEAM_30_EFR_HARDENED_TRANSFORMERS_LOCK.md`
- `ui/src/cubes/shared/utils/transformers.js`

**שאלות לדיון:**

#### **3.1. Data Transformation:**
- [ ] האם Backend מחזיר snake_case? ✅ (כן - לפי Spec)
  - **Team 20:** לאשר
  - **Team 30:** לאשר
- [ ] האם Frontend צריך להמיר ל-camelCase? ✅ (כן - transformers.js)
  - **Team 30:** להציג את transformers.js
  - **Team 20:** להבין את ה-pattern
- [ ] איפה מתבצעת ההמרה? ✅ (Frontend - transformers.js v1.2)
  - **Team 30:** להציג את transformers.js
  - **Team 20:** להבין את ה-pattern

**תוצאה נדרשת:**
- ✅ Data Transformation Pattern מוסכם
- ✅ אחריות ברורה: Backend = snake_case, Frontend = camelCase

---

#### **3.2. Financial Fields:**
- [ ] האם Backend מחזיר מספרים כ-strings?
  - **Team 20:** לבדוק ולהציג דוגמאות
  - **Team 30:** להבין את ה-pattern
- [ ] האם Frontend צריך להמיר למספרים? ✅ (כן - forced number conversion)
  - **Team 30:** להציג את transformers.js
  - **Team 20:** להבין את ה-pattern
- [ ] איפה מתבצעת ההמרה? ✅ (Frontend - transformers.js v1.2)
  - **Team 30:** להציג את transformers.js
  - **Team 20:** להבין את ה-pattern

**תוצאה נדרשת:**
- ✅ Financial Fields Conversion Pattern מוסכם
- ✅ אחריות ברורה: Backend = strings/numbers?, Frontend = numbers

---

### **4. Fetching Integration** 🔴

**מסמך לבדיקה:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md` (שורות 117-409)

**שאלות לדיון:**

#### **4.1. API Calls:**
- [ ] איך Frontend מבצע API calls? (fetch/axios/other?)
  - **Team 30:** להציג את ה-pattern הנוכחי
  - **Team 20:** להבין את ה-pattern
- [ ] האם יש צורך ב-Request Interceptor?
  - **Team 30:** להחליט אם נדרש
  - **Team 20:** להבין את הדרישות
- [ ] האם יש צורך ב-Response Interceptor?
  - **Team 30:** להחליט אם נדרש
  - **Team 20:** להבין את הדרישות

**תוצאה נדרשת:**
- ✅ API Calls Pattern מוסכם
- ✅ Request Interceptor - החלטה (נדרש/לא נדרש)
- ✅ Response Interceptor - החלטה (נדרש/לא נדרש)

---

#### **4.2. Authorization:**
- [ ] איך Frontend שולח JWT token? (Headers?)
  - **Team 30:** להציג את ה-pattern הנוכחי
  - **Team 20:** להבין את ה-pattern
- [ ] האם יש צורך ב-Token Refresh?
  - **Team 30:** להחליט אם נדרש
  - **Team 20:** להבין את הדרישות
- [ ] איך מטפלים ב-Token Expired?
  - **Team 30:** להציג את ה-pattern הנוכחי
  - **Team 20:** להבין את ה-pattern

**תוצאה נדרשת:**
- ✅ Authorization Pattern מוסכם
- ✅ Token Refresh - החלטה (נדרש/לא נדרש)
- ✅ Token Expired Handling מוסכם

---

### **5. Routes SSOT Integration** 🔴

**מסמכים לבדיקה:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md` (שורות 117-203)
- `ui/public/routes.json`

**שאלות לדיון:**

#### **5.1. URL Building:**
- [ ] איך Frontend בונה URLs? (routes.json loader?)
  - **Team 30:** להציג את ה-pattern הנוכחי
  - **Team 20:** להבין את ה-pattern
- [ ] האם יש צורך ב-`routes.json` loader? ✅ (כן - לפי Spec)
  - **Team 30:** להציג את ה-loader
  - **Team 20:** להבין את ה-pattern
- [ ] איך מטפלים ב-Version Mismatch?
  - **Team 30:** להציג את ה-pattern הנוכחי
  - **Team 20:** להבין את ה-pattern

**תוצאה נדרשת:**
- ✅ URL Building Pattern מוסכם
- ✅ `routes.json` loader - אישור
- ✅ Version Mismatch Handling מוסכם

---

#### **5.2. Fallback Mechanisms:**
- [ ] האם יש צורך ב-Fallback Mechanisms?
  - **Team 30:** להחליט אם נדרש
  - **Team 20:** להבין את הדרישות

**תוצאה נדרשת:**
- ✅ Fallback Mechanisms - החלטה (נדרש/לא נדרש)

---

## ⏰ Timeline מפורט

| זמן | פעילות | אחראי | תוצאה |
|:---|:---|:---|:---|
| **0-1 שעות** | הכנה - קריאת Specs | Team 20 + Team 30 | הבנה של Specs |
| **1-2 שעות** | דיון על Error Schema | Team 20 + Team 30 | Error Schema מוסכם |
| **2-3 שעות** | דיון על Response Contract | Team 20 + Team 30 | Response Contract מוסכם |
| **3-5 שעות** | דיון על Transformers + Fetching | Team 20 + Team 30 | Integration Patterns מוסכמים |
| **5-6 שעות** | דיון על Routes SSOT | Team 20 + Team 30 | Routes SSOT מוסכם |
| **6-7 שעות** | כתיבת Shared Boundary Contract | Team 20 + Team 30 | מסמך משותף |
| **7-8 שעות** | בדיקה ואישור | Team 20 + Team 30 | מסמך מאושר |

**דדליין:** 8 שעות מתחילת הסשן

---

## 📄 תוצאה נדרשת

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

## ✅ Checklist לסשן

### **לפני הסשן:**

#### **Team 20:**
- [ ] קריאת `TEAM_20_PDSC_ERROR_SCHEMA.md` (אישור)
- [ ] קריאת `TEAM_20_PDSC_RESPONSE_CONTRACT.md` (אישור)
- [ ] קריאת `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` (טיוטה)
- [ ] הכנת שאלות על Transformers Integration
- [ ] הכנת שאלות על Fetching Integration
- [ ] הכנת שאלות על Routes SSOT Integration
- [ ] קריאת `TEAM_10_TO_TEAM_20_PDSC_QUESTIONS_ANSWERS.md`

#### **Team 30:**
- [ ] קריאת `TEAM_20_PDSC_ERROR_SCHEMA.md` (בדיקה)
- [ ] קריאת `TEAM_20_PDSC_RESPONSE_CONTRACT.md` (בדיקה)
- [ ] קריאת `TEAM_30_EFR_HARDENED_TRANSFORMERS_LOCK.md` (להבין אחריות)
- [ ] הכנת שאלות על Error Schema
- [ ] הכנת שאלות על Response Contract
- [ ] הכנת שאלות על Transformers Integration
- [ ] הכנת שאלות על Fetching Integration
- [ ] הכנת דוגמאות קוד (Frontend)

---

### **במהלך הסשן:**

- [ ] דיון על Error Schema - הסכמה
- [ ] דיון על Response Contract - הסכמה
- [ ] דיון על Transformers Integration - הגדרת אחריות
- [ ] דיון על Fetching Integration - הגדרת אחריות
- [ ] דיון על Routes SSOT Integration - הגדרת אחריות
- [ ] החלטות משותפות - תיעוד

---

### **אחרי הסשן:**

- [ ] כתיבת Shared Boundary Contract הסופי
- [ ] דוגמאות קוד משותפות
- [ ] תיעוד משותף
- [ ] הגשה ל-Team 10

---

## 🔗 קבצים רלוונטיים

### **Specs:**
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_SCHEMA.md` ✅
- `_COMMUNICATION/team_20/TEAM_20_PDSC_RESPONSE_CONTRACT.md` ✅
- `_COMMUNICATION/team_20/TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` ⚠️ (טיוטה)
- `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md` (v1.1)

### **Frontend Specs:**
- `_COMMUNICATION/team_30/TEAM_30_EFR_HARDENED_TRANSFORMERS_LOCK.md`
- `ui/src/cubes/shared/utils/transformers.js`

### **מנדטים ותמיכה:**
- `_COMMUNICATION/team_10/TEAM_10_EMERGENCY_SESSION_20_30_PDSC_BOUNDARY.md`
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_30_EMERGENCY_SESSION_COORDINATION.md`
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_PDSC_QUESTIONS_ANSWERS.md`

---

## ⚠️ אזהרות קריטיות

### **1. אין אישור התקדמות ללא Interface Contracts:**
- ✅ כל התקדמות תלויה ב-Boundary Contract
- ✅ אין מימוש ללא הסכמה משותפת

### **2. חובה תיאום בין Team 20 ל-Team 30:**
- ✅ אין PDSC Contract ללא הסכמה משותפת
- ✅ כל החלטה חייבת להיות מוסכמת

### **3. השרת הוא מקור החוק:**
- ✅ כל Error Schema חייב להיות מוגדר מהשרת
- ✅ Frontend לא יכול לשנות את ה-Schema

### **4. הלקוח הוא מקור המימוש:**
- ✅ הלקוח מממש Fetching + Transformers
- ✅ Backend רק מגדיר את ה-Schema

---

## 📞 תמיכה מ-Team 10

**Team 10 זמין לתמיכה:**
- שאלות על Boundary Definition
- תיאום בין הצוותים
- אישור החלטות
- בדיקת תאימות

---

## 🎯 הצעדים הבאים

1. **מיידי:** Team 20 + Team 30 מתחילים הכנה לסשן
2. **8 שעות:** ביצוע סשן חירום
3. **16 שעות:** השלמת Shared Boundary Contract
4. **לאחר השלמה:** הגשה ל-Team 10 לבדיקה

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🚨 **EMERGENCY - SESSION GUIDE**

**log_entry | [Team 10] | EMERGENCY_SESSION | GUIDE | RED | 2026-02-07**
