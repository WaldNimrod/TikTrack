# 🛑 מנדט דחוף: תיקונים קריטיים ב-UAI Config Contract

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-07  
**סטטוס:** 🟥 **RED - BLOCKING - CRITICAL**  
**עדיפות:** 🔴 **P0 - IMMEDIATE**

---

## 🎯 Executive Summary

**דוח Team 90 זיהה 3 חסמים קריטיים ב-UAI Config Contract:**

1. 🟥 **Inline JS** - הפרה ישירה של Hybrid Scripts Policy
2. 🟠 **אי-עקביות naming** - `window.UAIConfig` vs `window.UAI.config`
3. 🟠 **Mismatch brokers** - `brokers` vs `brokers_fees`

**דרישה:** תיקון מיידי לפני אישור Gate

---

## 🔴 חסם 1: Inline JS - הפרה ישירה

### **הבעיה:**

החוזה מציג דוגמאות עם `<script>` המגדיר `window.UAIConfig` inline בתוך HTML.

**ראיות:**
- `TEAM_30_UAI_CONFIG_CONTRACT.md` שורות 197-258: דוגמה עם `<script>` inline

**השפעה:**
- הפרה ישירה של Hybrid Scripts Policy
- לא ניתן לאשר חוזה שמנחה Inline JS

### **תיקון נדרש:**

#### **להסיר:**
```html
<!-- ❌ אסור - Inline JS: -->
<script>
  window.UAIConfig = {
    pageType: 'cashFlows',
    requiresAuth: true,
    requiresHeader: true,
    // ...
  };
</script>
```

#### **להוסיף (אופציה 1 - קובץ JS נפרד):**
```html
<!-- ✅ נדרש - קובץ חיצוני: -->
<script src="/src/views/financial/cashFlows/cashFlowsPageConfig.js"></script>
```

**קובץ `cashFlowsPageConfig.js`:**
```javascript
// ui/src/views/financial/cashFlows/cashFlowsPageConfig.js
window.UAIConfig = {
  pageType: 'cashFlows',
  requiresAuth: true,
  requiresHeader: true,
  // ... rest of config
};
```

#### **או להוסיף (אופציה 2 - JSON + Loader):**
```html
<!-- ✅ נדרש - JSON + Loader: -->
<script src="/src/components/core/configLoader.js"></script>
<script>
  loadPageConfig('cashFlows'); // טוען מ-pageConfig.json
</script>
```

**קובץ `pageConfig.json`:**
```json
{
  "cashFlows": {
    "pageType": "cashFlows",
    "requiresAuth": true,
    "requiresHeader": true
  }
}
```

### **משימות:**

- [ ] להסיר את כל הדוגמאות עם Inline JS מהחוזה
- [ ] להגדיר פורמט SSOT חלופי (קובץ JS חיצוני או JSON + loader)
- [ ] לעדכן את כל הדוגמאות בחוזה (Cash Flows, Brokers Fees)
- [ ] לעדכן את ה-Integration examples
- [ ] לעדכן את ה-Validation function

**Timeline:** 12 שעות

---

## 🟠 חסם 2: אי-עקביות naming - window.UAIConfig

### **הבעיה:**

- החוזה מגדיר `window.UAIConfig`
- דוגמאות UAI משתמשות ב-`window.UAI.config`

**ראיות:**
- `TEAM_30_UAI_CONFIG_CONTRACT.md` שורה 22: "כל עמוד חייב לייצא `window.UAIConfig`"
- `TEAM_30_UAI_CONFIG_CONTRACT.md` שורות 438, 455, 479: דוגמאות משתמשות ב-`window.UAI.config`

**השפעה:**
- חוסר עקביות יגרום ל-runtime failures
- Config לא יטען כראוי

### **תיקון נדרש:**

**החלטה:** לאחד ל-`window.UAI.config` (יותר עקבי עם מבנה UAI)

**שינויים נדרשים:**
- [ ] שורה 22: לעדכן מ-`window.UAIConfig` ל-`window.UAI.config`
- [ ] שורות 199, 266: לעדכן דוגמאות מ-`window.UAIConfig` ל-`window.UAI.config`
- [ ] שורות 386, 389: לעדכן validation מ-`window.UAIConfig` ל-`window.UAI.config`
- [ ] שורות 438, 455, 479: כבר משתמשות ב-`window.UAI.config` - להשאיר

**Timeline:** 6 שעות

---

## 🟠 חסם 3: Mismatch brokers vs brokers_fees

### **הבעיה:**

- ב-UAI Contract `tables.type` מאפשר `brokers`
- ה-Entity וה-API הם `brokers_fees`

**ראיות:**
- `TEAM_30_UAI_CONFIG_CONTRACT.md` שורה 290: `type: 'brokers'`
- `TEAM_30_UAI_CONFIG_CONTRACT.md` שורה 272: `'brokers_fees'` (endpoint)

**השפעה:**
- עלול לשבור חיבורים בין Routing/Transformers/Renderers
- חוסר עקביות בין Contract ל-API

### **תיקון נדרש:**

**החלטה:** לאחד ל-`brokers_fees` (תואם ל-API ו-Entity)

**שינויים נדרשים:**
- [ ] שורה 131: לעדכן enum מ-`"brokers"` ל-`"brokers_fees"`
- [ ] שורה 290: לעדכן דוגמה מ-`type: 'brokers'` ל-`type: 'brokers_fees'`

**Timeline:** 6 שעות

---

## 📋 Checklist תיקונים

### **תיקון 1: הסרת Inline JS**
- [ ] להסיר את כל הדוגמאות עם `<script>` inline
- [ ] להגדיר פורמט SSOT חלופי (קובץ JS חיצוני או JSON + loader)
- [ ] לעדכן דוגמה Cash Flows
- [ ] לעדכן דוגמה Brokers Fees
- [ ] לעדכן Integration examples
- [ ] לעדכן Validation function

### **תיקון 2: איחוד window.UAIConfig**
- [ ] לעדכן שורה 22
- [ ] לעדכן שורות 199, 266
- [ ] לעדכן שורות 386, 389
- [ ] לוודא שכל הדוגמאות עקביות

### **תיקון 3: איחוד brokers**
- [ ] לעדכן שורה 131 (enum)
- [ ] לעדכן שורה 290 (דוגמה)

---

## ⚠️ אזהרות קריטיות

1. **Inline JS הוא חסם קריטי** - לא ניתן לאשר חוזה שמנחה Inline JS
2. **חוסר עקביות יגרום ל-runtime failures** - יש לאחד את ה-naming
3. **Mismatch יגרום לשבירת חיבורים** - יש לאחד את brokers

---

## 🎯 Timeline

**12 שעות:** תיקון Inline JS  
**6 שעות:** תיקון naming  
**6 שעות:** תיקון brokers

**סה"כ:** 24 שעות

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🟥 **RED - CRITICAL FIXES REQUIRED**

**log_entry | [Team 10] | UAI_CONTRACT | CRITICAL_FIXES_MANDATE | RED | 2026-02-07**
