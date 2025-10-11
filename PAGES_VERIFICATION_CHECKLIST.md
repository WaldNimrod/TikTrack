# רשימת בדיקה: סטנדרטיזציה מלאה של כל העמודים
# ======================================================

**תאריך:** 11 אוקטובר 2025  
**מטרה:** וידוא שכל העמודים מיישמים נכון את מערכת הטעינה והמטמון  
**סטטוס:** 🔍 **בתהליך בדיקה מעמיקה**

---

## 📋 **עמודי משתמש (11 עמודים)**

### **עמודים פעילים (9):**
- [ ] `alerts.html` - התראות
- [ ] `cash_flows.html` - תזרימי מזומנים
- [ ] `executions.html` - ביצועים
- [ ] `notes.html` - הערות
- [ ] `preferences.html` - העדפות
- [ ] `tickers.html` - טיקרים
- [ ] `trade_plans.html` - תוכניות השקעה
- [ ] `trades.html` - עסקאות
- [ ] `trading_accounts.html` - חשבונות מסחר

### **עמודי דמה (2) - לא לבדוק:**
- ⏸️ `index.html` - דף בית (דמה)
- ⏸️ `research.html` - מחקר (דמה)

---

## 🔧 **עמודי פיתוח/כלים (12 עמודים)**

### **כלי פיתוח פעילים:**
- [x] `cache-test.html` - ✅ **תוקן ונבדק לעומק**
- [ ] `server-monitor.html` - מוניטור שרת
- [ ] `system-management.html` - ניהול מערכת
- [ ] `crud-testing-dashboard.html` - דשבורד בדיקות CRUD
- [ ] `css-management.html` - ניהול CSS
- [ ] `linter-realtime-monitor.html` - מוניטור Linter
- [ ] `external-data-dashboard.html` - לוח נתונים חיצוניים
- [ ] `constraints.html` - אילוצים
- [ ] `db_display.html` - תצוגת DB
- [ ] `db_extradata.html` - טבלאות עזר
- [ ] `notifications-center.html` - מרכז התראות
- ⏸️ `test-header-only.html` - **לא לבדוק** (נבנה מחדש)

### **עמודים ישנים/לא רלוונטיים - לא לבדוק:**
- ⏸️ `dynamic-loading-test.html`
- ⏸️ `js-map.html`
- ⏸️ `designs.html`
- ⏸️ `chart-management.html`
- ⏸️ `dynamic-colors-display.html`
- ⏸️ `test-css-api.html`
- ⏸️ `background-tasks.html`

---

## 🔍 **מה לבדוק בכל עמוד**

### **1. מערכת הטעינה:**
```html
<!-- Stage 1: Core Modules (8 files) -->
<script src="scripts/modules/core-systems.js?v=20251010"></script>
<script src="scripts/modules/ui-basic.js?v=20251010"></script>
...

<!-- Stage 2: Core Utilities (3 files) -->
<script src="scripts/modules/data-basic.js?v=20251010"></script>
...

<!-- Stage 5: Page Script -->
<script src="scripts/[PAGE].js?v=20251010"></script>
```

**בדוק:**
- ✅ סדר נכון של הטעינה
- ✅ גרסאות אחידות (v=20251010)
- ✅ אין scripts inline
- ✅ אין scripts כפולים

---

### **2. שימוש ב-UnifiedCacheManager:**

**בקובץ .js של העמוד, בדוק:**

```javascript
// ✅ נכון
await window.UnifiedCacheManager.save(key, data, { layer: 'localStorage' });
const data = await window.UnifiedCacheManager.get(key);

// או עם fallback:
if (window.UnifiedCacheManager) {
  await window.UnifiedCacheManager.save(...);
} else {
  localStorage.setItem(...);
}
```

```javascript
// ❌ לא נכון - direct localStorage
localStorage.setItem(key, value);
localStorage.getItem(key);
```

**בדוק:**
- ✅ אין קריאות ישירות ל-localStorage/sessionStorage
- ✅ כל שמירה עוברת דרך UnifiedCacheManager
- ✅ יש fallback נכון אם UnifiedCacheManager לא זמין

---

### **3. אין קוד legacy/ישן:**

**בדוק שאין:**
```javascript
// ❌ אין להשתמש
CacheSyncManager
CachePolicyManager  
MemoryOptimizer
validation-utils.js
```

---

### **4. טעינת CSS:**

```html
<!-- Bootstrap ראשון -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" ...>

<!-- אחר כך ITCSS -->
<link rel="stylesheet" href="styles-new/01-settings/_variables.css?v=20251010">
...
```

**בדוק:**
- ✅ Bootstrap נטען ראשון
- ✅ גרסאות CSS אחידות
- ✅ אין CSS inline

---

## 🚀 **תוכנית הבדיקה**

### **שלב 1: עמודי משתמש (9 עמודים) - עדיפות גבוהה**
זמן משוער: 20 דקות

### **שלב 2: עמודי פיתוח (11 עמודים) - עדיפות בינונית**
זמן משוער: 25 דקות

### **שלב 3: סיכום + תיקונים**
זמן משוער: 15 דקות

**סה"כ:** ~60 דקות לבדיקה מעמיקה

---

## ✅ **מה תבדוק:**

בכל עמוד:
1. פתח את ה-.html - בדוק טעינת scripts וCSS
2. פתח את ה-.js - חפש direct localStorage calls
3. פתח בדפדפן - בדוק קונסול לשגיאות
4. סמן ✅ ברשימה

---

**מוכן להתחיל בבדיקה המעמיקה? אתחיל עם 9 עמודי המשתמש?** 🔍

