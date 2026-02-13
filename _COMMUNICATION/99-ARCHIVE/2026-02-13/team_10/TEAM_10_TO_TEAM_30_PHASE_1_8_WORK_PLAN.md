# 📋 מסך עבודה: Phase 1.8 - Team 30 (Frontend)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-07  
**סטטוס:** 🔴 **MANDATORY - PHASE 1.8**  
**עדיפות:** 🔴 **P0 - CRITICAL**

---

## 🎯 Executive Summary

**מסך עבודה מפורט למימוש Phase 1.8 - Infrastructure & Retrofit עבור Team 30.**

**מקור:** `ARCHITECT_PHASE_1_8_DETAILED_STRATEGY.md` + `ARCHITECT_PHASE_1_8_FINAL_RESOLUTION.md`

**עדכון:** החלטות סופיות ננעלו - עוברים מ-'דיון' ל-'ביצוע'

---

## 🔴 UAI Core Refactor - Deadline 48 שעות 🚨 **CRITICAL**

**דרישה:** ריפקטור מלא של UAI Core תוך 48 שעות

**מסמך:** `TEAM_10_TO_TEAM_30_UAI_CORE_REFACTOR_48H.md` ✅

**דרישות:**
- [ ] ריפקטור UnifiedAppInit.js
- [ ] ריפקטור כל השלבים (DOMStage, BridgeStage, DataStage, RenderStage, ReadyStage)
- [ ] בדיקת Integration עם PDSC Client
- [ ] בדיקת Integration עם CSS Verifier
- [ ] בדיקת תקינות מלאה

**Deadline:** 48 שעות מתחילת המשימה

---

## 🔴 תיקונים קריטיים נדרשים לפני המשך

**⚠️ BLOCKING:** התיקונים הבאים חובה לפני אישור המשך:

1. **UAI חובה לכל העמודים** - מעבר מלא של 100% מהעמודים הקיימים ל-UAI (16 שעות)
2. **CSS Load Verification - אכיפה אמיתית** - Integration ב-DOMStage + הכרעה על כלל CSS (4 שעות)
3. **ניקוי טעינת סקריפטים ישנה** - הסרת hardcoded scripts מכל העמודים (8 שעות)
4. **Namespace UAI** - עקביות `window.UAI.config` בכל המסמכים (4 שעות)

**מסמכים:** `TEAM_10_CRITICAL_FIXES_REQUIRED.md`, `TEAM_10_TO_TEAM_30_CRITICAL_FIXES_UAI.md`, `TEAM_10_TO_TEAM_30_NAMESPACE_UAI_CRITICAL.md`

---

## 📋 שלב 0: UAI Core Refactor (48 שעות) 🔴 **CRITICAL - PRIORITY 1**

**⚠️ CRITICAL:** משימה זו היא עדיפות ראשונה - כל השאלות ננעלו, עוברים ל-'ביצוע'

**דרישות:**
- [ ] ריפקטור UnifiedAppInit.js (8 שעות)
- [ ] ריפקטור כל השלבים (24 שעות)
- [ ] בדיקת Integration (8 שעות)
- [ ] בדיקת תקינות מלאה (8 שעות)

**מסמך:** `TEAM_10_TO_TEAM_30_UAI_CORE_REFACTOR_48H.md` ✅

**Deadline:** 48 שעות מתחילת המשימה

---

## 📋 שלב 1: נעילת חוזים (48 שעות) 🔴 **CRITICAL**

### **משימה 1.1: השלמת PDSC Boundary Contract** (24 שעות)

**דרישות:**
- [ ] ביצוע סשן חירום עם Team 20 (8 שעות)
- [ ] עדכון `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` עם החלטות משותפות:
  - [ ] Transformers Integration - הגדרת אחריות ברורה
  - [ ] Fetching Integration - הגדרת אחריות ברורה
  - [ ] Routes SSOT Integration - הגדרת אחריות ברורה
- [ ] הוספת דוגמאות קוד משותפות:
  - [ ] Frontend Examples (JavaScript)
  - [ ] Integration Examples (End-to-End)
- [ ] תיעוד Integration Points

**קבצים:**
- `_COMMUNICATION/team_20/TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` (לעדכון משותף)

**Timeline:** 24 שעות (לאחר סשן חירום)

**Deadline:** 48 שעות מתחילת Phase 1.8

---

### **משימה 1.2: תיקון UAI Contract - External JS** (12 שעות)

**דרישות:**

#### **1.2.1. הסרת Inline JS** (6 שעות)
- [ ] להסיר את כל הדוגמאות עם `<script>` inline מה-UAI Contract
- [ ] להגדיר פורמט SSOT חלופי: קובץ JS חיצוני (`pageConfig.js`)
- [ ] לעדכן את כל הדוגמאות בחוזה (Cash Flows, Brokers Fees)
- [ ] לעדכן את ה-Integration examples
- [ ] לעדכן את ה-Validation function

**דוגמה לתיקון:**

#### **להסיר:**
```html
<!-- ❌ אסור - Inline JS: -->
<script>
  window.UAI.config = { ... };
</script>
```

#### **להוסיף:**
```html
<!-- ✅ נדרש - קובץ חיצוני: -->
<script src="/src/views/financial/cashFlows/cashFlowsPageConfig.js"></script>
```

**קבצים:**
- `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md` (לעדכון)

---

#### **1.2.2. איחוד naming** (6 שעות)
- [ ] איחוד naming: `window.UAIConfig` → `window.UAI.config`
  - [ ] לעדכן שורה 22
  - [ ] לעדכן שורות 199, 266
  - [ ] לעדכן שורות 386, 389
  - [ ] לוודא שכל הדוגמאות עקביות
- [ ] איחוד naming: `brokers` → `brokers_fees`
  - [ ] לעדכן שורה 131 (enum)
  - [ ] לעדכן שורה 290 (דוגמה)

**החלטה:** `window.UAI.config` (יותר עקבי עם מבנה UAI)

**קבצים:**
- `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md` (לעדכון)

---

## 📋 שלב 2: בניית המנוע - UAI Engine + PDSC Client (32 שעות)

### **משימה 2.1: בניית UAI Engine + תיקונים קריטיים** (20 שעות)

**⚠️ כולל תיקונים קריטיים:**
- CSS Load Verification Integration (4 שעות)
- Namespace UAI (4 שעות)

**דרישות:**

#### **2.1.1. מימוש UnifiedAppInit.js** (8 שעות)
- [ ] מימוש מלא של `UnifiedAppInit.js` לפי UAI Spec
- [ ] Config validation
- [ ] Sequential stage execution
- [ ] Error handling
- [ ] תמיכה ב-`window.UAI.config` (backward compatible עם `window.UAIConfig`)

**קבצים:**
- `ui/src/components/core/UnifiedAppInit.js` (קיים, לעדכן/להשלים)

---

#### **2.1.2. מימוש 5 שלבי Lifecycle** (8 שעות)
- [ ] DOMStage - DOM Ready, auth guard, header, containers
- [ ] BridgeStage - PhoenixBridge initialization
- [ ] DataStage - Data loading מה-API
- [ ] RenderStage - Table rendering ו-UI
- [ ] ReadyStage - סיום אתחול והצגת העמוד

**קבצים:**
- `ui/src/components/core/stages/DOMStage.js` (קיים, לעדכן/להשלים)
- `ui/src/components/core/stages/BridgeStage.js` (חדש)
- `ui/src/components/core/stages/DataStage.js` (חדש)
- `ui/src/components/core/stages/RenderStage.js` (חדש)
- `ui/src/components/core/stages/ReadyStage.js` (חדש)
- `ui/src/components/core/stages/StageBase.js` (קיים, לעדכן/להשלים)

---

### **משימה 2.2: בניית PDSC Client (Shared_Services.js)** (16 שעות)

**דרישות:**

#### **2.2.1. מימוש Shared_Services.js** (8 שעות)
- [ ] מימוש PDSC Client לפי `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md`
- [ ] Fetching (API Calls) עם `fetch()` + wrapper אחיד
- [ ] Transformers (camelCase ↔ snake_case) עם `transformers.js` v1.2
- [ ] Error Handling לפי PDSC Error Schema
- [ ] Routes SSOT Integration עם `routes.json`

**קבצים:**
- `ui/src/components/core/Shared_Services.js` - חדש (PDSC Client)

---

#### **2.2.2. Integration עם UAI DataStage** (8 שעות)
- [ ] Integration של PDSC Client ב-DataStage
- [ ] Data loading דרך Shared_Services.js
- [ ] Error handling דרך PDSC Error Schema
- [ ] Transformers דרך transformers.js v1.2

**קבצים:**
- `ui/src/components/core/stages/DataStage.js` (לעדכן)

---

## 📋 שלב 3: הסבה (Retrofit) - עמודי Financial Core 🔒 **LOCKED_FOR_UAI_REFIT**

**⚠️ CRITICAL:** כל עמודי הליבה הפיננסית נעולים ל-UAI Refit עד סיום UAI Core Refactor

**עמודים נעולים:**
- 🔒 D16 - Trading Accounts - **LOCKED_FOR_UAI_REFIT**
- 🔒 D18 - Brokers Fees - **LOCKED_FOR_UAI_REFIT**
- 🔒 D21 - Cash Flows - **LOCKED_FOR_UAI_REFIT**

**דרישות (לאחר סיום UAI Core Refactor):**
- [ ] D16 - Trading Accounts Refit (8 שעות)
- [ ] D18 - Brokers Fees Refit (8 שעות)
- [ ] D21 - Cash Flows Refit (8 שעות)

---

### **משימה 3.1: הסבת Dashboard (D15_INDEX)** (8 שעות)

**דרישות:**
- [ ] יצירת `d15IndexPageConfig.js` (external JS)
- [ ] מעבר לטעינת UAI
- [ ] שימוש ב-GED (אם נדרש)
- [ ] שימוש ב-PDSC Client (Shared_Services.js)
- [ ] בדיקת תקינות

**קבצים:**
- `ui/src/views/dashboard/d15IndexPageConfig.js` - חדש
- `ui/src/views/dashboard/D15_INDEX.html` (לעדכון)

---

## 📋 תוצר סופי נדרש

### **קבצים:**
- [ ] `ui/src/components/core/UnifiedAppInit.js` - מושלם
- [ ] `ui/src/components/core/stages/DOMStage.js` - מושלם
- [ ] `ui/src/components/core/stages/BridgeStage.js` - חדש
- [ ] `ui/src/components/core/stages/DataStage.js` - חדש
- [ ] `ui/src/components/core/stages/RenderStage.js` - חדש
- [ ] `ui/src/components/core/stages/ReadyStage.js` - חדש
- [ ] `ui/src/components/core/stages/StageBase.js` - מושלם
- [ ] `ui/src/components/core/Shared_Services.js` - חדש (PDSC Client)
- [ ] `ui/src/views/dashboard/d15IndexPageConfig.js` - חדש
- [ ] `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md` - מתוקן

### **תיעוד:**
- [ ] דוגמאות קוד Frontend (JavaScript)
- [ ] Integration Examples (End-to-End)
- [ ] Validation Rules

---

## ✅ Checklist מימוש

### **שלב 1: נעילת חוזים (48 שעות):**
- [ ] סשן חירום עם Team 20
- [ ] השלמת PDSC Boundary Contract
- [ ] תיקון UAI Contract (External JS + Naming)
- [ ] הגשה ל-Team 90 לביקורת

### **שלב 2: בניית המנוע (32 שעות):**
- [ ] מימוש UAI Engine (5 שלבים)
- [ ] מימוש PDSC Client (Shared_Services.js)
- [ ] Integration בין UAI ל-PDSC

### **שלב 3: הסבה (8 שעות):**
- [ ] הסבת Dashboard (D15_INDEX)
- [ ] בדיקת תקינות

---

## 🎯 Timeline סופי

**סה"כ:** 136 שעות

- **שלב 0:** 48 שעות (UAI Core Refactor) - **CRITICAL - PRIORITY 1**
- **שלב 1:** 48 שעות (נעילת חוזים)
- **שלב 2:** 32 שעות (בניית המנוע)
- **שלב 3:** 8 שעות (הסבה - Dashboard)
- **שלב 4:** 24 שעות (הסבה - Financial Core) - **LOCKED עד סיום שלב 0**

---

## ⚠️ אזהרות קריטיות

1. **UAI External JS חובה** - לא ניתן להתחיל Retrofit ללא External JS
2. **PDSC Boundary Contract חובה** - לא ניתן להתחיל מימוש ללא חוזה מושלם
3. **UAI Engine חובה** - לא ניתן להתחיל Retrofit ללא UAI Engine יציב

---

## 📞 תמיכה מ-Team 10

**Team 10 זמין לתמיכה:**
- תיאום סשן חירום עם Team 20
- אישור החלטות
- בדיקת תאימות
- הגשה ל-Team 90 לביקורת

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🔴 **MANDATORY - PHASE 1.8**

**log_entry | [Team 10] | PHASE_1_8 | TEAM_30_WORK_PLAN | RED | 2026-02-07**
