# 🔴 Team 30 - סטטוס תיקונים קריטיים ותוכנית עבודה

**Team:** 30 (Frontend Execution)  
**Date:** 2026-02-07  
**Status:** 🔴 **CRITICAL FIXES IN PROGRESS**  
**Priority:** 🔴 **P0 - CRITICAL**

---

## 📢 Executive Summary

**סטטוס מפורט של כל התיקונים הקריטיים הנדרשים ותוכנית עבודה מפורטת.**

**מקור:** `TEAM_10_CRITICAL_FIXES_REQUIRED.md` + מסמכי תיקונים קריטיים

---

## ✅ סטטוס נוכחי

### **1. UAI Contract - תיקון Inline JS + Naming** ✅ **COMPLETED**

**סטטוס:** ✅ **הושלם**

**מה בוצע:**
- ✅ כל הדוגמאות עם `<script>` inline הוסרו מה-UAI Contract
- ✅ הוגדר פורמט SSOT חלופי: קובץ JS חיצוני (`pageConfig.js`)
- ✅ איחוד naming: `window.UAIConfig` → `window.UAI.config`
- ✅ תיקון `brokers` → `brokers_fees`

**קבצים:**
- `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md` (v1.1.0) ✅

---

### **2. Namespace UAI - עקביות** ⚠️ **PARTIAL**

**סטטוס:** ⚠️ **חלקי - צריך עדכון**

**מה בוצע:**
- ✅ המסמכים עודכנו (`TEAM_30_UAI_CONFIG_CONTRACT.md`)
- ⚠️ הקוד עדיין משתמש ב-`window.UAIConfig` כ-fallback (צריך לעדכן ל-legacy מפורש)

**מה צריך לעשות:**
- [ ] עדכון `DOMStage.js` (שורה 27) - להוסיף legacy fallback מפורש
- [ ] עדכון `UnifiedAppInit.js` (שורה 25) - להוסיף legacy fallback מפורש
- [ ] הוספת warning message אם משתמשים ב-legacy

**קבצים לעדכון:**
- `ui/src/components/core/stages/DOMStage.js` ⚠️
- `ui/src/components/core/UnifiedAppInit.js` ⚠️

**Timeline:** 4 שעות

---

### **3. CSS Load Verification - Integration** ❌ **NOT STARTED**

**סטטוס:** ❌ **לא התחיל**

**מה צריך לעשות:**
- [ ] Integration של `CSSLoadVerifier` ב-`DOMStage.js`
- [ ] הכרעה על כלל CSS (אופציה א או ב)
- [ ] עדכון `cssLoadVerifier.js` לפי הכלל שנבחר
- [ ] וידוא strict mode עובד (זורק error)

**קבצים לעדכון:**
- `ui/src/components/core/stages/DOMStage.js` ❌
- `ui/src/components/core/cssLoadVerifier.js` (אם נדרש) ⚠️

**Timeline:** 4 שעות

---

### **4. UAI חובה לכל העמודים** ❌ **NOT STARTED**

**סטטוס:** ❌ **לא התחיל**

**עמודים קיימים לבדיקה:**

#### **Batch 1: Identity & Auth** (5 עמודים)
- [ ] `ui/src/views/identity/D15_LOGIN.html` ❌
- [ ] `ui/src/views/identity/D15_REGISTER.html` ❌
- [ ] `ui/src/views/identity/D15_RESET_PWD.html` ❌
- [ ] `ui/src/views/dashboard/D15_INDEX.html` ❌
- [ ] `ui/src/views/profile/D15_PROF_VIEW.html` ❌

#### **Batch 2: Financial Core** (3 עמודים)
- [ ] `ui/src/views/financial/tradingAccounts/trading_accounts.html` ❌
- [ ] `ui/src/views/financial/cashFlows/cash_flows.html` ❌ (יש hardcoded scripts)
- [ ] `ui/src/views/financial/brokersFees/brokers_fees.html` ❌

**דרישות לכל עמוד:**
- [ ] יצירת `pageConfig.js` חיצוני
- [ ] הסרת hardcoded scripts מה-HTML
- [ ] הוספת UAI entry point (`UnifiedAppInit.js`)
- [ ] הוספת טעינת Config JS לפני UAI
- [ ] בדיקת תקינות

**Timeline:** 16 שעות (8 עמודים × 2 שעות)

---

### **5. ניקוי טעינת סקריפטים ישנה** ⚠️ **PARTIAL**

**סטטוס:** ⚠️ **חלקי - יש hardcoded scripts**

**מה צריך לעשות:**
- [ ] הסרת hardcoded scripts מכל העמודים:
  - [ ] `authGuard.js` (hardcoded)
  - [ ] `phoenixFilterBridge.js` (hardcoded)
  - [ ] `headerLoader.js` (hardcoded)
  - [ ] כל scripts אחרים
- [ ] הוספת טעינת `pageConfig.js` לפני UAI
- [ ] הוספת טעינת `UnifiedAppInit.js` אחרי Config

**דוגמה מ-`cash_flows.html` (שורות 35-40):**
```html
<!-- ❌ צריך להסיר -->
<script src="/src/components/core/authGuard.js"></script>
<script src="/src/components/core/phoenixFilterBridge.js"></script>
<script src="/src/components/core/headerLoader.js"></script>

<!-- ✅ צריך להוסיף -->
<script src="/src/views/financial/cashFlows/cashFlowsPageConfig.js"></script>
<script type="module" src="/src/components/core/UnifiedAppInit.js"></script>
```

**Timeline:** 8 שעות

---

### **6. חוזי UAI + PDSC סופיים** ⚠️ **IN PROGRESS**

**סטטוס:** ⚠️ **בתהליך - ממתין לסשן חירום**

**מה צריך לעשות:**

#### **6.1. UAI Config Contract:**
- [x] `TEAM_30_UAI_CONFIG_CONTRACT.md` - גרסה סופית ✅
- [x] כל דוגמאות inline JS הוסרו ✅
- [x] כל דוגמאות external JS נוספו ✅
- [x] naming מאוחד (`window.UAI.config`) ✅
- [ ] Validation function מעודכן (אם נדרש)
- [ ] חתימה סופית

#### **6.2. PDSC Boundary Contract:**
- [ ] ביצוע סשן חירום עם Team 20 (8 שעות) ⏳
- [ ] עדכון `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` עם החלטות משותפות
- [ ] הוספת דוגמאות קוד משותפות
- [ ] תיעוד Integration Points
- [ ] Validation Rules מוסכמים
- [ ] חתימה סופית

**Timeline:** 24 שעות (כולל סשן חירום)

---

## 📋 תוכנית עבודה מפורטת

### **שלב 1: תיקונים קריטיים מיידיים (12 שעות)** 🔴 **CRITICAL**

#### **1.1. Namespace UAI (4 שעות)**
- [ ] עדכון `DOMStage.js` - legacy fallback מפורש
- [ ] עדכון `UnifiedAppInit.js` - legacy fallback מפורש
- [ ] הוספת warning message
- [ ] בדיקת תקינות

#### **1.2. CSS Load Verification (4 שעות)**
- [ ] דיון עם Team 40 על כלל CSS (1 שעה)
- [ ] Integration ב-DOMStage (2 שעות)
- [ ] עדכון cssLoadVerifier.js (אם נדרש) (1 שעה)
- [ ] בדיקת תקינות

#### **1.3. ניקוי טעינת סקריפטים (4 שעות)**
- [ ] הסרת hardcoded scripts מ-`cash_flows.html`
- [ ] הסרת hardcoded scripts מ-`brokers_fees.html`
- [ ] הסרת hardcoded scripts מ-`trading_accounts.html`
- [ ] בדיקת תקינות

---

### **שלב 2: UAI Retrofit לכל העמודים (16 שעות)** 🔴 **CRITICAL**

#### **2.1. Batch 1: Identity & Auth (10 שעות)**
- [ ] D15_LOGIN.html (2 שעות)
- [ ] D15_REGISTER.html (2 שעות)
- [ ] D15_RESET_PWD.html (2 שעות)
- [ ] D15_INDEX.html (2 שעות)
- [ ] D15_PROF_VIEW.html (2 שעות)

#### **2.2. Batch 2: Financial Core (6 שעות)**
- [ ] trading_accounts.html (2 שעות)
- [ ] cash_flows.html (2 שעות)
- [ ] brokers_fees.html (2 שעות)

**דרישות לכל עמוד:**
1. יצירת `pageConfig.js`
2. הסרת hardcoded scripts
3. הוספת UAI entry point
4. בדיקת תקינות

---

### **שלב 3: השלמת חוזים (24 שעות)** 🔴 **CRITICAL**

#### **3.1. סשן חירום עם Team 20 (8 שעות)**
- [ ] ביצוע סשן חירום
- [ ] החלטות משותפות על כל הנושאים
- [ ] תיעוד החלטות

#### **3.2. השלמת PDSC Boundary Contract (16 שעות)**
- [ ] עדכון `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md`
- [ ] הוספת דוגמאות קוד משותפות
- [ ] תיעוד Integration Points
- [ ] Validation Rules מוסכמים
- [ ] חתימה סופית

---

## 📊 סיכום Timeline

| שלב | משימה | סטטוס | Timeline |
|:---|:---|:---|:---|
| **שלב 1** | Namespace UAI | ⚠️ Partial | 4 שעות |
| **שלב 1** | CSS Load Verification | ❌ Not Started | 4 שעות |
| **שלב 1** | ניקוי סקריפטים | ⚠️ Partial | 4 שעות |
| **שלב 2** | UAI Retrofit (8 עמודים) | ❌ Not Started | 16 שעות |
| **שלב 3** | סשן חירום + PDSC Contract | ⚠️ In Progress | 24 שעות |

**סה"כ:** 52 שעות

---

## ✅ Checklist מימוש

### **מיידי (12 שעות):**
- [ ] Namespace UAI - עדכון legacy fallback
- [ ] CSS Load Verification - Integration ב-DOMStage
- [ ] ניקוי סקריפטים - הסרת hardcoded scripts

### **שלב 2 (16 שעות):**
- [ ] יצירת `pageConfig.js` לכל עמוד
- [ ] הסרת hardcoded scripts מכל העמודים
- [ ] הוספת UAI entry point לכל עמוד
- [ ] בדיקת תקינות

### **שלב 3 (24 שעות):**
- [ ] סשן חירום עם Team 20
- [ ] השלמת PDSC Boundary Contract
- [ ] חתימה סופית

---

## ⚠️ אזהרות קריטיות

1. **UAI חובה** - אין אישור לעמודים חדשים עד סיום retrofit
2. **CSS Load Verification חובה** - הבדיקה חייבת להפיל עמוד אם סדר ה-CSS שגוי
3. **חוזים סופיים חובה** - לא ניתן להתחיל מימוש ללא חוזים חתומים
4. **Namespace עקבי חובה** - `window.UAI.config` בכל המסמכים והדוגמאות

---

## 🎯 הצעדים הבאים

1. **מיידי:** תיקונים קריטיים (Namespace + CSS Verification + ניקוי סקריפטים)
2. **שלב 2:** UAI Retrofit לכל העמודים
3. **שלב 3:** השלמת חוזים (סשן חירום + PDSC Contract)

---

**Team 30 (Frontend Execution)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🔴 **CRITICAL FIXES IN PROGRESS**

**log_entry | [Team 30] | CRITICAL_FIXES | STATUS_AND_PLAN | RED | 2026-02-07**
