# 🔴 מנדט סופי: Phase 1.8 - UAI Core Refactor + Retrofit

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-07  
**סטטוס:** 🔴 **MANDATORY - EXECUTION MODE**  
**עדיפות:** 🔴 **P0 - CRITICAL**

---

## 🎯 Executive Summary

**מנדט סופי למימוש Phase 1.8 - UAI Core Refactor + Retrofit בהתאם להחלטות הסופיות של האדריכלית.**

**מקור:** `ARCHITECT_PHASE_1_8_FINAL_RESOLUTION.md`

**שינוי מרכזי:** עוברים מ-'דיון' ל-'ביצוע' - כל השאלות הפתוחות ננעלו

---

## 🔒 החלטות סופיות - נעילה

### **1. כל השאלות הפתוחות ננעלו** ✅ **LOCKED**

**מצב:** האדריכלית נעלה את כל השאלות הפתוחות

**משמעות:**
- ✅ אין עוד דיונים
- ✅ מעבר מלא ל-'ביצוע'
- ✅ כל ההחלטות סופיות

---

## 🔴 משימה 1: UAI Core Refactor - Deadline 48 שעות 🚨 **CRITICAL**

### **דרישה:**

ריפקטור מלא של UAI Core תוך 48 שעות

**קבצים לריפקטור:**
- [ ] `ui/src/components/core/UnifiedAppInit.js`
- [ ] `ui/src/components/core/stages/DOMStage.js`
- [ ] `ui/src/components/core/stages/BridgeStage.js`
- [ ] `ui/src/components/core/stages/DataStage.js`
- [ ] `ui/src/components/core/stages/RenderStage.js`
- [ ] `ui/src/components/core/stages/ReadyStage.js`
- [ ] `ui/src/components/core/stages/StageBase.js`

**דרישות:**
- [ ] בדיקת תקינות Config validation
- [ ] בדיקת תקינות Sequential stage execution
- [ ] בדיקת תקינות Error handling
- [ ] בדיקת תקינות Integration עם PDSC Client
- [ ] בדיקת תקינות Integration עם CSS Verifier
- [ ] בדיקת תקינות End-to-End

**Deadline:** 48 שעות מתחילת המשימה

**מסמך מפורט:** `TEAM_10_TO_TEAM_30_UAI_CORE_REFACTOR_48H.md` ✅

---

## 🔒 משימה 2: עמודי Financial Core - LOCKED_FOR_UAI_REFIT

### **דרישה:**

כל עמודי הליבה הפיננסית נעולים ל-UAI Refit עד סיום UAI Core Refactor

**עמודים נעולים:**
- 🔒 D16 - Trading Accounts - **LOCKED_FOR_UAI_REFIT**
- 🔒 D18 - Brokers Fees - **LOCKED_FOR_UAI_REFIT**
- 🔒 D21 - Cash Flows - **LOCKED_FOR_UAI_REFIT**

**משמעות:**
- לא ניתן לעבוד עליהם עד סיום UAI Core Refactor
- כל העבודה עליהם מוקפאת
- ממתינים לסיום שלב 0 (UAI Core Refactor)

---

## 📋 דוח מיפוי Team 90 - עזרה קריטית

**מסמך:** `TEAM_90_UAI_RETROFIT_MAPPING_PHASE_1_8.md` ✅

### **ממצאים:**

**קבצי HTML שנסרקו:** 5

**קבצים עם UAI Entry:**
- ✅ `trading_accounts.html` - יש UAI entry
- ✅ `brokers_fees.html` - יש UAI entry
- ✅ `cash_flows.html` - יש UAI entry

**קבצים עם Config Script (heuristic):**
- ✅ `trading_accounts.html` - יש config script
- ✅ `brokers_fees.html` - יש config script
- ✅ `cash_flows.html` - יש config script

**קבצים עם Inline Script:**
- ❌ אין קבצים עם inline script (מצוין!)

### **פעולות נדרשות (לפי דוח Team 90):**

1. **הוספת external UAI config file** (JS/JSON) וטעינתו לפני UAI entry point
2. **החלפת hardcoded script stacks** ב-UAI entry point יחיד
3. **הסרת כל inline `<script>` tags** (Hybrid Policy)

---

## 📋 דרישות Retrofit (לאחר סיום UAI Core Refactor)

### **לכל עמוד Financial Core:**

#### **1. יצירת pageConfig.js חיצוני**

**דרישות:**
- [ ] יצירת קובץ `pageConfig.js` בתיקיית העמוד
- [ ] הגדרת `window.UAI.config` בקובץ
- [ ] תאימות ל-`TEAM_30_UAI_CONFIG_CONTRACT.md`

**דוגמה:**
```javascript
// ui/src/views/financial/tradingAccounts/tradingAccountsPageConfig.js
window.UAI = window.UAI || {};
window.UAI.config = {
  pageType: 'tradingAccounts',
  requiresAuth: true,
  requiresHeader: true,
  dataEndpoints: ['/api/v1/trading_accounts'],
  // ... שאר ה-config
};
```

---

#### **2. עדכון HTML**

**דרישות:**
- [ ] הוספת טעינת `pageConfig.js` לפני UAI
- [ ] החלפת כל hardcoded scripts ב-UAI entry point יחיד
- [ ] הסרת כל inline scripts (אם יש)
- [ ] וידוא סדר טעינה נכון

**דוגמה:**
```html
<!-- UAI Entry Point -->
<script src="/src/views/financial/tradingAccounts/tradingAccountsPageConfig.js"></script>
<script type="module" src="/src/components/core/UnifiedAppInit.js"></script>
```

---

#### **3. בדיקת תקינות**

**דרישות:**
- [ ] בדיקת טעינת Config
- [ ] בדיקת אתחול UAI
- [ ] בדיקת תקינות Lifecycle
- [ ] בדיקת תקינות Data Loading
- [ ] בדיקת תקינות Rendering

---

## ✅ Checklist מימוש

### **שלב 0: UAI Core Refactor (48 שעות):**
- [ ] ריפקטור UnifiedAppInit.js (8 שעות)
- [ ] ריפקטור כל השלבים (24 שעות)
- [ ] בדיקת Integration (8 שעות)
- [ ] בדיקת תקינות מלאה (8 שעות)

### **שלב 3: UAI Refit (לאחר סיום שלב 0):**
- [ ] D16 - Trading Accounts Refit (8 שעות)
- [ ] D18 - Brokers Fees Refit (8 שעות)
- [ ] D21 - Cash Flows Refit (8 שעות)

---

## 🎯 Timeline

**סה"כ:** 80 שעות

- **שלב 0:** 48 שעות (UAI Core Refactor) - **CRITICAL - PRIORITY 1**
- **שלב 3:** 24 שעות (UAI Refit) - **LOCKED עד סיום שלב 0**

---

## ⚠️ אזהרות קריטיות

1. **UAI Core Refactor חובה** - 48 שעות deadline ללא הארכה
2. **עמודי Financial Core נעולים** - לא ניתן לעבוד עליהם עד סיום Refactor
3. **ביצוע בלבד** - אין עוד דיונים, רק ביצוע
4. **דוח Team 90 חובה** - יש להשתמש בדוח המיפוי כמדריך

---

## 🔗 קבצים קשורים

### **מסמכי מנדט:**
- `TEAM_10_TO_TEAM_30_UAI_CORE_REFACTOR_48H.md` ✅
- `TEAM_10_PHASE_1_8_UPDATED_IMPLEMENTATION_PLAN.md` ✅

### **דוח מיפוי:**
- `_COMMUNICATION/team_90/TEAM_90_UAI_RETROFIT_MAPPING_PHASE_1_8.md` ✅

### **מסמכי חוזה:**
- `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md` ✅

---

## 📞 תמיכה מ-Team 10

**Team 10 זמין לתמיכה:**
- אישור החלטות
- בדיקת תאימות
- פתרון בעיות

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🔴 **MANDATORY - EXECUTION MODE**

**log_entry | [Team 10] | PHASE_1_8 | FINAL_MANDATE | RED | 2026-02-07**
