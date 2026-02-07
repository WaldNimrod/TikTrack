# 📋 משימות סופיות: סיום אפיונים והגשה לביקורת

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend) + Team 30 (Frontend)  
**תאריך:** 2026-02-07  
**סטטוס:** 🟡 **FINAL TASKS ASSIGNED**  
**עדיפות:** 🔴 **P0 - CRITICAL**

---

## 🎯 Executive Summary

**משימות סופיות לסיום האפיונים והגשה לביקורת Team 90.**

**מטרה:** השלמת כל האפיונים והגשה לביקורת תוך 40 שעות.

---

## 🚨 משימה 1: סשן חירום (8 שעות)

**משתתפים:** Team 20 + Team 30

**דרישות:**
- [ ] ביצוע סשן חירום להשלמת Shared Boundary Contract
- [ ] דיון על כל הנושאים הפתוחים
- [ ] החלטות משותפות מתועדות

**נושאים לדיון:**

### **1. Error Schema (2 שעות):**
- [ ] אישור Error Response Structure
- [ ] אישור Error Codes Enum
- [ ] הגדרת Error Handling Guidelines

### **2. Response Contract (1 שעה):**
- [ ] אישור Success Response Structure
- [ ] אישור Unified Response Structure
- [ ] הגדרת Response Handling Guidelines

### **3. Transformers Integration (1 שעה):**
- [ ] הגדרת Data Transformation Rules
- [ ] **שאלה פתוחה:** Financial Fields - Backend מחזיר strings/numbers?
- [ ] הגדרת Financial Fields Conversion Rules
- [ ] הגדרת Implementation Guidelines

### **4. Fetching Integration (1 שעה):**
- [ ] הגדרת API Calls Pattern
- [ ] הגדרת Authorization Handling
- [ ] הגדרת Error Recovery (אם נדרש)

### **5. Routes SSOT Integration (30 דקות):**
- [ ] הגדרת URL Building Rules
- [ ] **שאלה פתוחה:** Version Mismatch - error או warning?
- [ ] הגדרת Version Handling Rules
- [ ] הגדרת Fallback Mechanisms

### **6. סיכום והחלטות (30 דקות):**
- [ ] תיעוד כל ההחלטות
- [ ] מוכנות לכתיבת Shared Boundary Contract

**תוצאה נדרשת:**
- ✅ כל הנושאים מוסכמים
- ✅ החלטות מתועדות
- ✅ מוכנות לכתיבת Shared Boundary Contract הסופי

**מנדטים:**
- `TEAM_10_EMERGENCY_SESSION_GUIDE.md`
- `TEAM_10_TO_TEAM_20_30_EMERGENCY_SESSION_COORDINATION.md`

**Timeline:** 8 שעות

---

## 📋 משימה 2: השלמת Shared Boundary Contract (16 שעות)

**משתתפים:** Team 20 + Team 30

**דרישות:**
- [ ] עדכון `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` עם החלטות משותפות
- [ ] הוספת דוגמאות קוד משותפות
- [ ] תיעוד Integration Points
- [ ] Validation Rules מוסכמים

**תוכן נדרש:**

### **1. JSON Error Schema (מוסכם):**
- [ ] Error Response Structure - אישור/שינויים
- [ ] Error Codes List - אישור/שינויים
- [ ] Error Handling Guidelines - הגדרה מפורטת

### **2. Response Contract (מוסכם):**
- [ ] Success Response Structure - אישור/שינויים
- [ ] Unified Response Structure - אישור/שינויים
- [ ] Response Handling Guidelines - הגדרה מפורטת

### **3. Transformers Integration (מוסכם):**
- [ ] Data Transformation Rules - הגדרה מפורטת
- [ ] Financial Fields Conversion - הגדרה מפורטת (לאחר החלטה בסשן)
- [ ] Implementation Guidelines - הגדרה מפורטת

### **4. Fetching Integration (מוסכם):**
- [ ] API Calls Pattern - הגדרה מפורטת
- [ ] Authorization Handling - הגדרה מפורטת
- [ ] Error Recovery - הגדרה מפורטת (אם נדרש)

### **5. Routes SSOT Integration (מוסכם):**
- [ ] URL Building Rules - הגדרה מפורטת
- [ ] Version Handling - הגדרה מפורטת (לאחר החלטה בסשן)
- [ ] Fallback Mechanisms - הגדרה מפורטת

### **6. דוגמאות קוד (מוסכם):**
- [ ] Backend Examples - הוספה
- [ ] Frontend Examples - הוספה
- [ ] Integration Examples - הוספה

**קבצים:**
- `_COMMUNICATION/team_20/TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` (לעדכון)

**Timeline:** 16 שעות (לאחר סשן חירום)

---

## 📋 משימה 3: תיקון UAI Contract (12 שעות)

**משתתפים:** Team 30

### **תת-משימה 3.1: תיקון Inline JS (6 שעות)**

**דרישות:**
- [ ] להסיר את כל הדוגמאות עם `<script>` inline מה-UAI Contract
- [ ] להגדיר פורמט SSOT חלופי:
  - **אופציה מומלצת:** קובץ JS חיצוני (`pageConfig.js`)
  - **אופציה חלופית:** JSON + loader (`pageConfig.json` + `loadPageConfig()`)
- [ ] לעדכן את כל הדוגמאות בחוזה (Cash Flows, Brokers Fees)
- [ ] לעדכן את ה-Integration examples
- [ ] לעדכן את ה-Validation function

**דוגמה לתיקון:**

#### **להסיר:**
```html
<!-- ❌ אסור - Inline JS: -->
<script>
  window.UAIConfig = {
    pageType: 'cashFlows',
    // ...
  };
</script>
```

#### **להוסיף:**
```html
<!-- ✅ נדרש - קובץ חיצוני: -->
<script src="/src/views/financial/cashFlows/cashFlowsPageConfig.js"></script>
```

**קבצים:**
- `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md` (לעדכון)

**Timeline:** 6 שעות

---

### **תת-משימה 3.2: איחוד naming (6 שעות)**

**דרישות:**

#### **3.2.1. איחוד window.UAIConfig:**
- [ ] לעדכן שורה 22: מ-`window.UAIConfig` ל-`window.UAI.config`
- [ ] לעדכן שורות 199, 266: דוגמאות מ-`window.UAIConfig` ל-`window.UAI.config`
- [ ] לעדכן שורות 386, 389: validation מ-`window.UAIConfig` ל-`window.UAI.config`
- [ ] לוודא שכל הדוגמאות עקביות

**החלטה:** `window.UAI.config` (יותר עקבי עם מבנה UAI)

#### **3.2.2. איחוד brokers:**
- [ ] לעדכן שורה 131: enum מ-`"brokers"` ל-`"brokers_fees"`
- [ ] לעדכן שורה 290: דוגמה מ-`type: 'brokers'` ל-`type: 'brokers_fees'`

**החלטה:** `brokers_fees` (תואם ל-API ו-Entity)

**קבצים:**
- `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md` (לעדכון)

**Timeline:** 6 שעות

---

## ✅ Checklist הגשה לביקורת

### **לפני הגשה לביקורת:**

#### **Team 20:**
- [x] `TEAM_20_PDSC_ERROR_SCHEMA.md` ✅ (מוכן)
- [x] `TEAM_20_PDSC_RESPONSE_CONTRACT.md` ✅ (מוכן)
- [ ] `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` - להשלים (לאחר סשן)

#### **Team 30:**
- [ ] `TEAM_30_UAI_CONFIG_CONTRACT.md` - לתקן (Inline JS + naming)
- [x] `TEAM_30_EFR_LOGIC_MAP.md` ✅ (מוכן)
- [x] `TEAM_30_EFR_HARDENED_TRANSFORMERS_LOCK.md` ✅ (מוכן)

#### **Team 40:**
- [x] `TEAM_40_CSS_LOAD_VERIFICATION_SPEC.md` ✅ (מוכן)
- [x] `TEAM_40_CSS_LOAD_VERIFICATION_INTEGRATION.md` ✅ (מוכן)
- [x] `ui/src/components/core/cssLoadVerifier.js` ✅ (נוצר)

#### **קבצי Core:**
- [x] `ui/src/components/core/UnifiedAppInit.js` ✅ (נוצר)
- [x] `ui/src/components/core/stages/DOMStage.js` ✅ (נוצר)
- [x] `ui/src/components/core/stages/StageBase.js` ✅ (נוצר)
- [x] `ui/src/components/core/cssLoadVerifier.js` ✅ (נוצר)

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
**סטטוס:** 🟡 **FINAL TASKS ASSIGNED**

**log_entry | [Team 10] | FINAL_TASKS | ASSIGNED | YELLOW | 2026-02-07**
