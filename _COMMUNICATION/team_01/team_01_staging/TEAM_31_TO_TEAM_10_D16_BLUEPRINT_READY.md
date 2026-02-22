# 📡 הודעה: צוות 31 → צוות 10 (Blueprint Ready - עמוד חשבונות מסחר)
**project_domain:** TIKTRACK

**From:** Team 31 (Blueprint)  
**To:** Team 10 (The Gateway)  
**Date:** 2026-02-01  
**Session:** SESSION_01 - Phase 1.5  
**Subject:** BLUEPRINT_DELIVERY_D16_ACCTS_VIEW | Status: ✅ **BLUEPRINT READY**  
**Priority:** 🔴 **CRITICAL - READY FOR DELIVERY TO TEAM 30**

---

## 📋 סיכום

הבלופרינט המלא של עמוד חשבונות מסחר (D16_ACCTS_VIEW) מוכן ומאושר. הבלופרינט כולל:

- ✅ **אלמנט ראש הדף (TtHeader)** - מלא ופונקציונלי
- ✅ **פילטר גלובלי (TtGlobalFilter)** - מלא עם כל הפילטרים + JS Standards (`js-` prefixed classes)
- ✅ **מבנה העמוד המלא** - כל 5 הקונטיינרים עם טבלאות
- ✅ **מבנה LEGO System** - `tt-section`, `tt-section-row`
- ✅ **טבלאות** - מבנה מלא עם כל השדות והפילטרים הפנימיים
- ✅ **CSS לטבלאות** - קובץ נפרד `phoenix-tables.css` עם BEM naming

---

## 📦 קבצים שנמסרו

### **1. Blueprint HTML**
**מיקום:** `_COMMUNICATION/team_31/team_31_staging/D16_ACCTS_VIEW_BLUEPRINT.html`

**תוכן:**
- Unified Header עם פילטר גלובלי מלא
- 5 קונטיינרים עם טבלאות:
  - Container 0: סיכום מידע והתראות פעילות (טבלה + widgets placeholder)
  - Container 1: ניהול חשבונות מסחר (טבלה ראשונה למימוש)
  - Container 2: סיכום תנועות לחשבון (טבלה + פילטר תאריכים פנימי)
  - Container 3: דף חשבון לתאריכים (טבלה + פילטרים: תאריכים + חשבון)
  - Container 4: פוזיציות לפי חשבון (טבלה + פילטר חשבון פנימי)
- מבנה LEGO System מלא
- JS Standards Protocol (`js-` prefixed classes) לכל אלמנטים אינטראקטיביים
- ARIA attributes לנגישות
- דוגמאות שורות בטבלאות

### **2. CSS לטבלאות**
**מיקום:** `_COMMUNICATION/team_31/team_31_staging/phoenix-tables.css`

**תוכן:**
- סגנונות בסיסיים לטבלאות (BEM naming: `phoenix-table-*`)
- סגנונות לתאים (numeric, currency, date, status, actions)
- סגנונות לפילטרים פנימיים (`phoenix-table-filters`)
- סגנונות ל-status badges
- Responsive design (mobile support)
- Accessibility (focus states)

---

## ✅ מה מוכן ומה חסר

### **✅ מוכן לחלוטין:**

1. **אלמנט ראש הדף (TtHeader):**
   - ✅ מבנה HTML מלא
   - ✅ ניווט מלא
   - ✅ Logo section
   - ✅ User zone (placeholder)

2. **פילטר גלובלי (TtGlobalFilter):**
   - ✅ כל הפילטרים מוגדרים:
     - סטטוס (status)
     - סוג השקעה (investmentType)
     - חשבון מסחר (tradingAccount)
     - טווח תאריכים (dateRange)
     - חיפוש (search)
   - ✅ כפתורי פעולות (reset, clear)
   - ✅ JS Standards (`js-filter-toggle`, `js-filter-item`, `js-search-filter`, וכו')
   - ✅ מבנה HTML מלא עם data attributes

3. **מבנה העמוד המלא:**
   - ✅ כל 5 הקונטיינרים מוגדרים
   - ✅ מבנה LEGO System (`tt-section`, `tt-section-row`)
   - ✅ כותרות קונטיינרים עם 3 חלקים (Title | Subtitle | Actions)
   - ✅ פילטרים פנימיים (Containers 2, 3, 4)
   - ✅ טבלאות עם מבנה מלא

4. **טבלאות:**
   - ✅ מבנה HTML מלא לכל טבלה
   - ✅ כותרות עמודות עם sortable indicators
   - ✅ data attributes לסידור (`data-sortable`, `data-sort-key`, `data-sort-type`)
   - ✅ ARIA attributes לנגישות
   - ✅ דוגמאות שורות
   - ✅ תאים מיוחדים (numeric, currency, date, status, actions)

5. **CSS:**
   - ✅ קובץ CSS נפרד לטבלאות (`phoenix-tables.css`)
   - ✅ BEM naming convention (`phoenix-table-*`)
   - ✅ CSS Variables בלבד (ללא hardcoded values)
   - ✅ Responsive design
   - ✅ Accessibility

### **⚠️ חסר (יישום ב-React):**

1. **JavaScript Functionality:**
   - ⏳ Sorting logic (PhoenixTableSortManager)
   - ⏳ Filter integration (PhoenixFilterContext)
   - ⏳ Section toggle (כבר יש ב-Vanilla JS, צריך להמיר ל-React)

2. **React Components:**
   - ⏳ `PhoenixTable` component
   - ⏳ `TradingAccountsTable` component
   - ⏳ `TtHeader` component (המרה מ-HTML ל-JSX)
   - ⏳ `TtGlobalFilter` component (המרה מ-HTML ל-JSX)

3. **Data Integration:**
   - ⏳ API calls
   - ⏳ Transformation Layer (snake_case ↔ camelCase)
   - ⏳ State management

---

## 📋 מפרט טכני

### **מבנה HTML/JSX:**

```html
<!-- Header + Global Filter -->
<header id="unified-header">
  <!-- TtHeader + TtGlobalFilter -->
</header>

<!-- Page Content -->
<div class="page-wrapper">
  <div class="page-container">
    <main>
      <tt-container>
        <!-- Container 0 -->
        <tt-section data-section="summary-alerts">
          <!-- Table + Widgets -->
        </tt-section>
        
        <!-- Container 1 - FIRST TABLE TO IMPLEMENT -->
        <tt-section data-section="trading-accounts-management">
          <!-- Table: ניהול חשבונות מסחר -->
        </tt-section>
        
        <!-- Container 2 -->
        <tt-section data-section="account-movements-summary">
          <!-- Internal Filters + Table -->
        </tt-section>
        
        <!-- Container 3 -->
        <tt-section data-section="account-by-dates">
          <!-- Internal Filters + Table -->
        </tt-section>
        
        <!-- Container 4 -->
        <tt-section data-section="positions-by-account">
          <!-- Internal Filters + Table -->
        </tt-section>
      </tt-container>
    </main>
  </div>
</div>
```

### **JS Standards Protocol:**

כל אלמנט אינטראקטיבי כולל `js-` prefixed class:

- `js-filter-toggle` - כפתורי פילטר
- `js-filter-item` - פריטי פילטר
- `js-filter-close` - כפתור סגירת פילטר
- `js-search-filter` - שדה חיפוש
- `js-search-clear` - כפתור ניקוי חיפוש
- `js-filter-reset` - כפתור איפוס פילטרים
- `js-filter-clear` - כפתור ניקוי פילטרים
- `js-filter-toggle-btn` - כפתור הצגה/הסתרה של פילטרים
- `js-section-toggle` - כפתור הצגה/הסתרה של סקשן
- `js-table` - הטבלה עצמה
- `js-table-sort-trigger` - כותרת עמודה לסידור
- `js-sort-indicator` - אינדיקטור סידור
- `js-sort-icon` - אייקון סידור
- `js-table-filter` - פילטרים פנימיים של טבלה

### **Data Attributes:**

**לסידור:**
- `data-sortable="true"` - האם ניתן למיין
- `data-sort-key="field_name"` - שם השדה לסידור
- `data-sort-type="string|numeric|date|boolean"` - טיפוס הסידור

**לפילטרים:**
- `data-filter-type="status|investmentType|tradingAccount|dateRange|search"` - סוג פילטר
- `data-filter-key="field_name"` - שם השדה לפילטר

**לשדות:**
- `data-field="field_name"` - שם השדה בתא

---

## 🎯 שימוש לצוות 30

### **לשלב 1 (PhoenixFilterContext):**

**קריטי:**
- ✅ `TtGlobalFilter` component מוכן ב-HTML
- ✅ מבנה הפילטרים (איזה פילטרים יש, איך הם נראים)
- ✅ HTML/JSX structure עם JS Standards
- ✅ Data attributes לכל פילטר

**שימוש:**
- צוות 30 יעשה Refactor של `TtGlobalFilter` ל-Context API
- הם ישתמשו בבלופרינט כבסיס לעבודה
- המרת HTML ל-JSX
- שימוש ב-JS Standards classes לזיהוי אלמנטים

### **לשלב 4 (יישום טבלה ראשונה):**

**קריטי:**
- ✅ מבנה העמוד המלא (כל 5 הקונטיינרים)
- ✅ מבנה LEGO System
- ✅ Container 1 (ניהול חשבונות מסחר) - מפורט עם כל השדות
- ✅ מבנה טבלה מלא עם sortable headers
- ✅ CSS לטבלאות (`phoenix-tables.css`)

**שימוש:**
- צוות 30 יישם את הטבלה הראשונה לפי המבנה של הבלופרינט
- הם ישתמשו ב-LEGO System structure מהבלופרינט
- המרת HTML ל-JSX
- שימוש ב-`PhoenixTable` component
- אינטגרציה עם `PhoenixFilterContext`

---

## 📋 Checklist לפני מסירה לצוות 30

- [x] **אלמנט ראש הדף מוכן:**
  - [x] `TtHeader` component (HTML)
  - [x] מבנה HTML/JSX מלא
  - [x] CSS (phoenix-header.css)

- [x] **פילטר גלובלי מוכן:**
  - [x] `TtGlobalFilter` component (HTML)
  - [x] כל הפילטרים מוגדרים
  - [x] מבנה HTML/JSX מלא
  - [x] JS Standards (`js-` prefixed classes)
  - [x] CSS (phoenix-header.css)

- [x] **מבנה העמוד המלא מוכן:**
  - [x] כל 5 הקונטיינרים
  - [x] מבנה LEGO System
  - [x] פילטרים פנימיים (Containers 2, 3, 4)
  - [x] טבלאות עם מבנה מלא

- [x] **CSS לטבלאות:**
  - [x] קובץ נפרד (`phoenix-tables.css`)
  - [x] BEM naming (`phoenix-table-*`)
  - [x] CSS Variables בלבד
  - [x] Responsive design
  - [x] Accessibility

- [x] **תיעוד:**
  - [x] הערות על המבנה
  - [x] הערות על פילטרים
  - [x] קישורים למפרט (`PHOENIX_TABLES_SPECIFICATION.md`)

- [x] **הודעה לצוות 10:**
  - [x] `TEAM_31_TO_TEAM_10_D16_BLUEPRINT_READY.md` נוצרה
  - [x] פירוט מה מוכן ומה חסר

---

## 🔗 קישורים רלוונטיים

1. **Blueprint HTML:**
   - `_COMMUNICATION/team_31/team_31_staging/D16_ACCTS_VIEW_BLUEPRINT.html`

2. **CSS לטבלאות:**
   - `_COMMUNICATION/team_31/team_31_staging/phoenix-tables.css`

3. **מפרט טבלאות:**
   - `_COMMUNICATION/team_31/team_31_staging/PHOENIX_TABLES_SPECIFICATION.md`

4. **תיעוד מרכזי:**
   - `documentation/02-DEVELOPMENT/TT2_TABLES_DEVELOPER_GUIDE.md`

5. **תוכנית עבודה:**
   - `_COMMUNICATION/team_10/TEAM_10_TABLES_REACT_IMPLEMENTATION_PLAN.md`

---

## 🚀 צעדים הבאים

1. **Team 10:** בדיקה ואישור הבלופרינט
2. **Team 10:** מסירה לצוות 30 לפני תחילת שלב 1
3. **Team 30:** התחלת עבודה על שלב 1 (PhoenixFilterContext) עם הבלופרינט

---

**Team 31 (Blueprint)**  
**Date:** 2026-02-01  
**Status:** ✅ **BLUEPRINT READY FOR TEAM 10 REVIEW**
