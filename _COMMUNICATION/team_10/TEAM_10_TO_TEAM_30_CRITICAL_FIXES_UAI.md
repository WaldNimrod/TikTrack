# 🔴 תיקונים קריטיים: UAI חובה לכל העמודים

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-07  
**סטטוס:** 🔴 **CRITICAL - BLOCKING**  
**עדיפות:** 🔴 **P0 - CRITICAL**

---

## 🎯 Executive Summary

**משימה קריטית: מעבר מלא של 100% מהעמודים הקיימים ל-UAI (Config חיצוני + UnifiedAppInit.js)**

**דרישה:** אין אישור לעמודים חדשים עד סיום retrofit

---

## 📋 עמודים קיימים לבדיקה

### **Batch 1: Identity & Auth**
- [ ] `ui/src/views/identity/D15_LOGIN.html`
- [ ] `ui/src/views/identity/D15_REGISTER.html`
- [ ] `ui/src/views/identity/D15_RESET_PWD.html`
- [ ] `ui/src/views/dashboard/D15_INDEX.html`
- [ ] `ui/src/views/profile/D15_PROF_VIEW.html`

### **Batch 2: Financial Core**
- [ ] `ui/src/views/financial/tradingAccounts/trading_accounts.html`
- [ ] `ui/src/views/financial/cashFlows/cash_flows.html`
- [ ] `ui/src/views/financial/brokersFees/brokers_fees.html`

---

## 📋 דרישות לכל עמוד

### **1. יצירת pageConfig.js חיצוני**

**דרישות:**
- [ ] יצירת קובץ `pageConfig.js` בתיקיית העמוד
- [ ] הגדרת `window.UAI.config` בקובץ
- [ ] תאימות ל-`TEAM_30_UAI_CONFIG_CONTRACT.md`

**דוגמה:**
```javascript
// ui/src/views/dashboard/d15IndexPageConfig.js
window.UAI = window.UAI || {};
window.UAI.config = {
  pageType: 'dashboard',
  requiresAuth: true,
  requiresHeader: true,
  dataEndpoints: ['/api/v1/dashboard/stats'],
  // ... שאר ה-config
};
```

---

### **2. הסרת hardcoded scripts מה-HTML**

**דרישות:**
- [ ] הסרת כל `<script>` tags מה-HTML (חוץ מ-UAI entry point)
- [ ] הסרת כל inline JavaScript
- [ ] הסרת כל event handlers מ-HTML attributes

**דוגמה לפני:**
```html
<!-- ❌ אסור -->
<script>
  window.UAIConfig = { ... };
</script>
<script src="/src/old-loader.js"></script>
```

**דוגמה אחרי:**
```html
<!-- ✅ נדרש -->
<script src="/src/views/dashboard/d15IndexPageConfig.js"></script>
<script type="module" src="/src/components/core/UnifiedAppInit.js"></script>
```

---

### **3. הוספת UAI entry point**

**דרישות:**
- [ ] הוספת טעינת `pageConfig.js` לפני UAI
- [ ] הוספת טעינת `UnifiedAppInit.js` אחרי Config
- [ ] וידוא סדר טעינה נכון

**דוגמה:**
```html
<!DOCTYPE html>
<html>
<head>
  <!-- CSS files -->
  <link rel="stylesheet" href="/src/styles/phoenix-base.css">
  <!-- ... -->
</head>
<body>
  <!-- Page content -->
  
  <!-- UAI Entry Point -->
  <script src="/src/views/dashboard/d15IndexPageConfig.js"></script>
  <script type="module" src="/src/components/core/UnifiedAppInit.js"></script>
</body>
</html>
```

---

### **4. בדיקת תקינות**

**דרישות:**
- [ ] בדיקת טעינת Config
- [ ] בדיקת אתחול UAI
- [ ] בדיקת תקינות Lifecycle
- [ ] בדיקת תקינות Data Loading
- [ ] בדיקת תקינות Rendering

---

## ✅ Checklist מימוש

### **לכל עמוד:**

#### **1. יצירת Config:**
- [ ] יצירת `pageConfig.js`
- [ ] הגדרת `window.UAI.config`
- [ ] תאימות ל-UAI Config Contract

#### **2. ניקוי HTML:**
- [ ] הסרת hardcoded scripts
- [ ] הסרת inline JavaScript
- [ ] הסרת event handlers

#### **3. הוספת UAI:**
- [ ] הוספת טעינת `pageConfig.js`
- [ ] הוספת טעינת `UnifiedAppInit.js`
- [ ] וידוא סדר טעינה

#### **4. בדיקת תקינות:**
- [ ] בדיקת טעינת Config
- [ ] בדיקת אתחול UAI
- [ ] בדיקת תקינות Lifecycle

---

## 🎯 Timeline

**סה"כ:** 16 שעות

- **עמודים Batch 1:** 10 שעות (5 עמודים × 2 שעות)
- **עמודים Batch 2:** 6 שעות (3 עמודים × 2 שעות)

---

## ⚠️ אזהרות קריטיות

1. **אין אישור לעמודים חדשים** - עד סיום retrofit
2. **Config חיצוני חובה** - לא inline scripts
3. **UAI entry point חובה** - כל עמוד חייב להשתמש ב-UAI

---

## 📞 תמיכה מ-Team 10

**Team 10 זמין לתמיכה:**
- אישור Config files
- בדיקת תאימות
- פתרון בעיות

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🔴 **CRITICAL - BLOCKING**

**log_entry | [Team 10] | CRITICAL_FIXES | UAI_REQUIRED | RED | 2026-02-07**
