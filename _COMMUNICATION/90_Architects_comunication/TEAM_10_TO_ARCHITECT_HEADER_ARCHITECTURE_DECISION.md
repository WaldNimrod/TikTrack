# 🚨 הודעה קריטית: החלטה אדריכלית נדרשת - Header Navigation

**מאת:** Team 10 (The Gateway)  
**אל:** Chief Architect (Gemini)  
**תאריך:** 2026-02-03  
**סטטוס:** 🔴 **CRITICAL - ARCHITECTURAL DECISION REQUIRED**  
**עדיפות:** 🔴 **CRITICAL - ARCHITECTURAL VIOLATION**

---

## 🚨 Executive Summary

**בעיה קריטית:** התפריט הראשי (Header Navigation) מופיע כקוד כפול/מפוזר בכל עמוד HTML, במקום להיות קומפוננטה מרכזית אחת.

**השפעה:** כל עדכון בתפריט דורש עדכון ידני בכל עמוד HTML בנפרד - הפרה של עקרון DRY וניהול מרכזי.

**מורכבות:** Header כולל גם **פילטר גלובלי** (`TtGlobalFilter`) שדורש אינטגרציה עם `PhoenixFilterContext`.

**סטטוס:** 🔴 **CRITICAL** - דורש החלטה אדריכלית מיידית

---

## 📊 ממצאים

### **1. מצב נוכחי - קוד כפול** 🔴 **CRITICAL**

**עמודים שנבדקו:**
- ✅ `ui/src/views/financial/D16_ACCTS_VIEW.html` - Header מוטמע ישירות (שורות 35-264, כ-230 שורות)
- ⚠️ `ui/src/views/financial/D21_CASH_VIEW.html` - Template פשוט (לא נבדק במלואו)
- ⚠️ `ui/src/views/financial/D18_BRKRS_VIEW.html` - Template פשוט (לא נבדק במלואו)

**בעיה:**
- כל עמוד HTML מכיל את כל הקוד של ה-Header (כ-230 שורות)
- כל עדכון בתפריט דורש עדכון ידני בכל עמוד בנפרד
- אין מקור אמת יחיד (SSOT) לתפריט
- **דוגמה:** עדכון שבוצע היום (הוספת "ברוקרים ועמלות", שינוי "פיתוח" ל"ניהול") עודכן רק ב-D16_ACCTS_VIEW.html

---

### **2. קומפוננטות קיימות שלא בשימוש** ⚠️ **ISSUE**

**קובץ React Component:**
- ✅ `ui/src/components/core/UnifiedHeader.jsx` - קיים אבל לא משמש את עמודי ה-HTML
  - כולל `TtHeader` ו-`TtGlobalFilter`
  - משתמש ב-`PhoenixFilterContext`
  - עובד רק עם React Router

**קבצי JavaScript:**
- ✅ `ui/src/views/financial/header-dropdown.js` - קיים אבל לא מספיק
- ✅ `ui/src/views/financial/header-filters.js` - קיים אבל לא מספיק
- ✅ `ui/src/views/financial/d16-header-handlers.js` - ספציפי ל-D16
- ✅ `ui/src/views/financial/d16-header-links.js` - ספציפי ל-D16

**בעיה:**
- יש קומפוננטה React אבל עמודי HTML לא משתמשים בה
- יש קבצי JS אבל הם לא מספיקים - עדיין צריך HTML בכל עמוד
- **פילטר גלובלי** דורש אינטגרציה עם `PhoenixFilterContext` - מורכב יותר

---

### **3. דוגמה לבעיה** 🔴 **CRITICAL**

**עדכון שבוצע היום:**
- הוספת קישור "ברוקרים ועמלות" בתפריט נתונים
- שינוי שם תפריט מ"פיתוח" ל"ניהול"
- העברת "טיקרים (מנהל)" מתפריט נתונים לתפריט ניהול

**השפעה:**
- ✅ עודכן ב-`D16_ACCTS_VIEW.html` (שורות 87-127)
- ❌ **לא עודכן** ב-`D21_CASH_VIEW.html` (אם יש Header מוטמע)
- ❌ **לא עודכן** ב-`D18_BRKRS_VIEW.html` (אם יש Header מוטמע)
- ❌ **לא עודכן** בכל עמוד HTML אחר במערכת
- ❌ **לא עודכן** ב-`UnifiedHeader.jsx` (אם משמש עמודים אחרים)

**תוצאה:** התפריט לא אחיד בין העמודים! כל עדכון בתפריט דורש עדכון ידני בכל עמוד בנפרד.

---

## 📋 תיעוד ארכיטקטורה קיים

### **1. Header Specification (LOD 400)**

**מקור:** `documentation/01-ARCHITECTURE/FRONTEND/COMPONENTS/TT2_HEADER_SPEC_LOD400.md`

**מפרט:**
- Row 1: Home, 6 Dropdowns (32 items), Utils (Mop, Flash, Search), Logo
- Row 2: Global Filter (5 Pillars), User Avatar
- Interaction: Half-circle Toggle at bottom edge
- Z-Index: Header(950), Filter(951), Dropdown(954)

---

### **2. Header Blueprint**

**מקור:** `documentation/01-ARCHITECTURE/TT2_HEADER_BLUEPRINT.md`

**מפרט:**
- 2 Rows layout
- Global Filter sync
- Centered Roll-up Toggle
- Entity context aware

---

### **3. UnifiedHeader.jsx (קיים אבל לא בשימוש)**

**מיקום:** `ui/src/components/core/UnifiedHeader.jsx`

**תכונות:**
- רכיב React מלא עם Navigation ו-Filters
- משתמש ב-`PhoenixFilterContext` לפילטר גלובלי
- כולל `TtHeader` ו-`TtGlobalFilter`
- עובד רק עם React Router

**בעיה:** עמודי HTML לא משתמשים בו.

---

### **4. global_page_template.jsx (תבנית React)**

**מיקום:** `ui/src/layout/global_page_template.jsx`

**תכונות:**
- תבנית React עם `TtHeader` ו-`TtGlobalFilter`
- משתמש ב-`PhoenixFilterContext`
- עובד רק עם React Router

**בעיה:** עמודי HTML לא משתמשים בו.

---

## ✅ דוגמת מימוש: Footer Loader (פתרון מוצלח)

### **החלטה אדריכלית קיימת**

**מקור:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DIRECTIVE_FOOTER_STRATEGY.md`  
**תאריך:** 2026-02-01  
**סטטוס:** ✅ **APPROVED**

**החלטה:**
- פוטר מודולרי (Shared Component)
- תוכן: `footer.html` - HTML נקי של הפוטר
- טוען: `footer-loader.js` - סקריפט הזרקה ב-Vanilla JS
- עיצוב: `phoenix-components.css` - סגנונות הפוטר

---

### **מימוש Footer Loader**

**קובץ:** `ui/src/views/financial/footer-loader.js`

**תכונות:**
- טעינת Footer דינמית מ-`footer.html`
- הזרקה אוטומטית ל-`.page-wrapper`
- מניעת כפילויות (בודק אם Footer כבר קיים)
- עובד עם עמודי HTML (Vanilla JS)

**שימוש:**
```html
<!-- Modular Footer: Loaded dynamically via footer-loader.js -->
<script src="footer-loader.js"></script>
```

**יתרונות:**
- ✅ מקור אמת יחיד (SSOT)
- ✅ עדכון במקום אחד משפיע על כל העמודים
- ✅ עובד עם עמודי HTML קיימים
- ✅ פתרון פשוט ויעיל

---

### **קובץ footer.html**

**מיקום:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/footer.html`

**מבנה מלא:**
```html
<!--
  Phoenix-Footer-Ver: v1.0.0 | Modular Footer Component
  Sync-Time: 2026-02-01 17:45:00 IST
  Team: Team 31 (Shared Components)
  Status: ✅ MODULAR FOOTER - SINGLE SOURCE OF TRUTH
  Compliance: RTL Charter ✅ | DNA Sync ✅ | LEGO System ✅ | CSS Standards Protocol ✅
  
  Purpose:
  This is the modular footer component - single source of truth for all footer content.
  Loaded dynamically via footer-loader.js into all pages.
  
  IMPORTANT:
  - All footer content updates MUST be done ONLY in this file
  - CSS styles are in phoenix-components.css (section: FOOTER)
  - This file must pass G-Bridge validation independently
-->

<!-- Page Footer: Global footer component (200px min-height, dark background) -->
<footer class="page-footer">
  <div class="page-footer__container">
    <!-- Column 1: Contact Information -->
    <div class="page-footer__column">
      <h3 class="page-footer__title">פרטי קשר</h3>
      <p class="page-footer__text">דוא"ל: info@tiktrack.co.il</p>
      <p class="page-footer__text">טלפון: 03-1234567</p>
      <p class="page-footer__text">כתובת: רחוב דוגמה 123, תל אביב</p>
      <p class="page-footer__text">שעות פעילות: א'-ה' 09:00-18:00</p>
    </div>
    
    <!-- Column 2: Site Map -->
    <div class="page-footer__column">
      <h3 class="page-footer__title">מפת אתר</h3>
      <p class="page-footer__text"><a href="/" class="page-footer__link">דף הבית</a></p>
      <p class="page-footer__text"><a href="/portfolio" class="page-footer__link">פורטפוליו</a></p>
      <p class="page-footer__text"><a href="/trades" class="page-footer__link">טריידים</a></p>
      <p class="page-footer__text"><a href="/research" class="page-footer__link">מחקר</a></p>
      <p class="page-footer__text"><a href="/settings" class="page-footer__link">הגדרות</a></p>
    </div>
    
    <!-- Column 3: Partners -->
    <div class="page-footer__column">
      <h3 class="page-footer__title">שותפים</h3>
      <p class="page-footer__text">שותף אסטרטגי 1</p>
      <p class="page-footer__text">שותף אסטרטגי 2</p>
      <p class="page-footer__text">שותף טכנולוגי</p>
      <p class="page-footer__text">שותף פיננסי</p>
    </div>
  </div>
</footer>
```

**שימוש בעמוד HTML:**
```html
<!-- בסוף העמוד, לפני </body> -->
<!-- Modular Footer: Loaded dynamically via footer-loader.js -->
<script src="footer-loader.js"></script>
</body>
</html>
```

**תוצאה:** Footer נטען אוטומטית בכל עמוד, כל עדכון ב-`footer.html` משפיע על כל העמודים.

---

## 🔧 פתרונות מוצעים ל-Header

### **אפשרות 1: Header Loader (מומלץ - דומה ל-Footer)**

**יצירת קבצים:**
- `ui/src/components/core/unified-header.html` - HTML של Header + Global Filter
- `ui/src/components/core/header-loader.js` - טוען את ה-HTML ומזריק אותו

**תכונות:**
- טעינת HTML של Header מקובץ מרכזי
- הזרקה ל-`<header id="unified-header">` בכל עמוד
- תמיכה ב-JavaScript handlers (header-dropdown.js, header-filters.js)
- **פילטר גלובלי:** אינטגרציה עם `PhoenixFilterContext` דרך JavaScript

**יתרונות:**
- ✅ עובד עם עמודי HTML קיימים
- ✅ מקור אמת יחיד (SSOT)
- ✅ עדכון במקום אחד משפיע על כל העמודים
- ✅ דומה לפתרון Footer שכבר עובד

**אתגרים:**
- ⚠️ **פילטר גלובלי:** דורש אינטגרציה עם `PhoenixFilterContext` דרך JavaScript (לא React)
- ⚠️ **JavaScript Handlers:** צריך לוודא שכל ה-handlers עובדים אחרי טעינה דינמית

---

### **אפשרות 2: Server-Side Include (אם יש server-side rendering)**

**יצירת קובץ:** `ui/src/components/core/unified-header.html`

**שימוש:**
- Server-side include בכל עמוד
- או build-time include

**יתרונות:**
- ✅ פשוט יותר (אין צורך ב-JavaScript loader)
- ✅ עובד טוב עם פילטר גלובלי

**אתגרים:**
- ⚠️ דורש server-side rendering או build-time processing
- ⚠️ לא ברור אם יש תמיכה במערכת

---

### **אפשרות 3: React Component עם HTML Wrapper**

**יצירת קובץ:** `ui/src/components/core/header-wrapper.js`

**תכונות:**
- Wrapper שמזריק את `UnifiedHeader.jsx` לעמודי HTML
- משתמש ב-React DOM rendering
- תמיכה ב-`PhoenixFilterContext`

**יתרונות:**
- ✅ משתמש בקומפוננטה React הקיימת
- ✅ תמיכה מלאה ב-`PhoenixFilterContext`

**אתגרים:**
- ⚠️ דורש React DOM rendering לעמודי HTML
- ⚠️ מורכב יותר מ-Header Loader

---

## 📊 השוואה: Footer vs Header

| קריטריון | Footer | Header |
|:---------|:-------|:-------|
| **פתרון קיים** | ✅ כן (`footer-loader.js`) | ❌ לא |
| **מורכבות** | 🟢 פשוט | 🔴 מורכב (פילטר גלובלי) |
| **תלותיות** | 🟢 אין | 🔴 `PhoenixFilterContext` |
| **דחיפות** | 🟡 בינוני | 🔴 קריטי |
| **החלטה אדריכלית** | ✅ קיימת | ❌ נדרשת |

---

## ⚠️ מורכבות: פילטר גלובלי

### **מה זה פילטר גלובלי?**

**מקור:** `ui/src/layout/global_page_template.jsx`

**תכונות:**
- שורת פילטרים גלובליים המחוברת ל-`PhoenixFilterContext`
- כולל: חיפוש, סטטוס, סוג השקעה, חשבון מסחר, טווח תאריכים
- משפיע על כל העמודים במערכת

**אינטגרציה נדרשת:**
- `PhoenixFilterContext` - Context React
- `usePhoenixFilter()` - Hook React
- עדכון אוטומטי של נתונים בעת שינוי פילטרים

---

### **אתגרים בפתרון Header Loader:**

1. **Context React:** `PhoenixFilterContext` הוא Context React - איך לעבוד איתו מ-HTML?
   - **פתרון אפשרי:** יצירת JavaScript wrapper ל-`PhoenixFilterContext` שיחשף API ל-Vanilla JS
   - **פתרון אפשרי:** יצירת Event System (Custom Events) לתקשורת בין Header Loader ל-React Components

2. **State Management:** פילטר גלובלי דורש state management - איך לנהל אותו ב-Vanilla JS?
   - **פתרון אפשרי:** שימוש ב-LocalStorage או SessionStorage לשמירת מצב פילטרים
   - **פתרון אפשרי:** יצירת JavaScript State Manager עצמאי שיסנכרן עם `PhoenixFilterContext`

3. **Event Handling:** עדכון פילטרים צריך לעדכן את כל הקומפוננטות - איך לעשות זאת ב-HTML?
   - **פתרון אפשרי:** Custom Events (`phoenix-filter-change`) ש-Header Loader יפיץ ו-React Components יקשיבו להם
   - **פתרון אפשרי:** Polling של מצב פילטרים מ-LocalStorage

### **דוגמה: פילטר גלובלי ב-HTML (מימוש נוכחי)**

**מיקום:** `ui/src/views/financial/D16_ACCTS_VIEW.html` (שורות 159-264)

**מבנה:**
```html
<!-- Header Filters Row - TtGlobalFilter Component -->
<div class="header-filters">
  <div class="filters-container">
    <!-- Filter Groups -->
    <div class="filter-group status-filter">
      <div class="filter-dropdown">
        <button class="filter-toggle status-filter-toggle js-filter-toggle" 
                id="statusFilterToggle" 
                data-filter-type="status">
          <span class="selected-value selected-status-text" id="selectedStatus">כל סטטוס</span>
          <span class="dropdown-arrow">▼</span>
        </button>
        <div class="filter-menu" id="statusFilterMenu">
          <div class="status-filter-item js-filter-item" data-value="הכול">
            <span class="option-text">הכול</span>
          </div>
          <!-- ... עוד אפשרויות ... -->
        </div>
      </div>
    </div>
    
    <!-- עוד פילטרים: type-filter, account-filter, date-range-filter, search-filter -->
    
    <!-- Filter Actions -->
    <div class="filter-actions">
      <button class="reset-btn js-filter-reset" title="איפוס פילטרים">↻</button>
      <button class="clear-btn js-filter-clear" title="נקה כל הפילטרים">×</button>
    </div>
  </div>
</div>
```

**JavaScript Handlers:**
- `header-filters.js` - מטפל באירועי פילטרים
- `js-filter-toggle` - פתיחה/סגירה של תפריטי פילטרים
- `js-filter-item` - בחירת ערך פילטר
- `js-filter-reset` - איפוס פילטרים
- `js-filter-clear` - ניקוי כל הפילטרים

**בעיה נוכחית:** ה-handlers קיימים אבל לא מספיקים - עדיין צריך HTML בכל עמוד.

### **פילטר גלובלי - מימוש React (קיים)**

**מיקום:** `ui/src/cubes/shared/contexts/PhoenixFilterContext.jsx`

**תכונות:**
- Context API לניהול מצב פילטרים גלובליים
- פילטרים: `status`, `investmentType`, `tradingAccount`, `dateRange`, `search`
- State management עם React hooks (`useState`, `useCallback`)
- Audit Trail System (לוג כל שינוי פילטר)
- Debug Mode support

**API:**
```javascript
const { filters, setFilter, clearFilters, getFilters } = usePhoenixFilter();

// עדכון פילטר
setFilter('status', 'active');

// קריאת פילטר
console.log(filters.status); // 'active'

// איפוס פילטרים
clearFilters();
```

**שימוש ב-React:**
```jsx
import { PhoenixFilterProvider } from './cubes/shared/contexts/PhoenixFilterContext.jsx';

<PhoenixFilterProvider>
  <App />
</PhoenixFilterProvider>
```

**בעיה:** זה עובד רק עם React - עמודי HTML לא יכולים להשתמש בו ישירות.

---

### **פתרון אפשרי: JavaScript Wrapper ל-PhoenixFilterContext**

**רעיון:** יצירת JavaScript wrapper שיחשף את `PhoenixFilterContext` ל-Vanilla JS.

**מימוש אפשרי:**
```javascript
// phoenix-filter-wrapper.js
(function initPhoenixFilterWrapper() {
  'use strict';
  
  // גישה ל-PhoenixFilterContext דרך window (אם Provider קיים)
  // או יצירת State Manager עצמאי ב-Vanilla JS
  
  const FilterManager = {
    filters: {
      status: null,
      investmentType: null,
      tradingAccount: null,
      dateRange: { from: null, to: null },
      search: ''
    },
    
    setFilter(key, value) {
      this.filters[key] = value;
      // פיצוץ Custom Event
      window.dispatchEvent(new CustomEvent('phoenix-filter-change', {
        detail: { key, value, filters: this.filters }
      }));
    },
    
    clearFilters() {
      this.filters = {
        status: null,
        investmentType: null,
        tradingAccount: null,
        dateRange: { from: null, to: null },
        search: ''
      };
      window.dispatchEvent(new CustomEvent('phoenix-filter-change', {
        detail: { filters: this.filters }
      }));
    }
  };
  
  // חשיפה גלובלית
  window.PhoenixFilterManager = FilterManager;
})();
```

**שימוש ב-HTML:**
```javascript
// ב-header-filters.js
document.querySelector('.js-filter-item').addEventListener('click', function() {
  const value = this.dataset.value;
  window.PhoenixFilterManager.setFilter('status', value);
});
```

**סנכרון עם React:**
```jsx
// ב-React Components
useEffect(() => {
  const handleFilterChange = (e) => {
    // סנכרון עם PhoenixFilterContext
    setFilter(e.detail.key, e.detail.value);
  };
  
  window.addEventListener('phoenix-filter-change', handleFilterChange);
  return () => window.removeEventListener('phoenix-filter-change', handleFilterChange);
}, []);
```

**אתגרים:**
- ⚠️ דורש סנכרון בין Vanilla JS ל-React
- ⚠️ דורש יצירת State Manager עצמאי
- ⚠️ מורכב יותר מפתרון Footer

---

## 📋 שאלות להחלטה אדריכלית

### **1. אסטרטגיה כללית:**
- האם לפתור את Header באותו אופן כמו Footer (Header Loader)?
- האם יש פתרון אחר שמועדף?
- **הערה:** יש החלטה אדריכלית קיימת על Footer (`ARCHITECT_DIRECTIVE_FOOTER_STRATEGY.md`) - האם ליישם אותה גם על Header?

### **2. פילטר גלובלי:**
- איך לטפל בפילטר גלובלי ב-Header Loader?
- האם ליצור JavaScript wrapper ל-`PhoenixFilterContext`?
- האם להפריד בין Header Navigation ל-Global Filter?
- **הערה:** פילטר גלובלי הוא חלק אינטגרלי מה-Header לפי המפרט (`TT2_HEADER_SPEC_LOD400.md`)

### **3. תמיכה ב-HTML Pages:**
- האם הפתרון חייב לעבוד עם עמודי HTML (לא רק React)?
- האם יש תמיכה ב-server-side rendering או build-time processing?
- **הערה:** עמודי HTML קיימים (`D16_ACCTS_VIEW.html`, `D18_BRKRS_VIEW.html`, `D21_CASH_VIEW.html`) דורשים פתרון

### **4. קומפוננטה React הקיימת:**
- מה לעשות עם `UnifiedHeader.jsx` הקיים?
- האם להשתמש בו או ליצור פתרון חדש?
- **הערה:** `UnifiedHeader.jsx` כולל `TtHeader` ו-`TtGlobalFilter` אבל לא משמש את עמודי HTML

### **5. ארכיטקטורה קיימת:**
- האם יש החלטה אדריכלית קיימת על Header שלא מומשה?
- **הערה:** יש תיעוד (`TT2_HEADER_SPEC_LOD400.md`, `TT2_HEADER_BLUEPRINT.md`) אבל לא ברור אם יש החלטה על מימוש

---

## 📊 טבלת השוואה - פתרונות

| קריטריון | Header Loader | Server-Side Include | React Wrapper |
|:---------|:-------------|:-------------------|:--------------|
| **עובד עם HTML** | ✅ כן | ✅ כן | ⚠️ חלקי |
| **מקור אמת יחיד** | ✅ כן | ✅ כן | ✅ כן |
| **פילטר גלובלי** | ⚠️ מורכב | ✅ פשוט | ✅ פשוט |
| **תלותיות** | 🟡 JavaScript | 🟢 אין | 🔴 React |
| **מורכבות** | 🟡 בינוני | 🟢 נמוך | 🔴 גבוה |
| **דומה ל-Footer** | ✅ כן | ❌ לא | ❌ לא |

---

## 📋 המלצה

**המלצה:** פתרון דומה ל-Footer (Header Loader) עם התאמות לפילטר גלובלי.

**סיבות:**
1. ✅ דומה לפתרון Footer שכבר עובד ואושר
2. ✅ עובד עם עמודי HTML קיימים
3. ✅ מקור אמת יחיד (SSOT)
4. ⚠️ דורש פתרון לפילטר גלובלי (JavaScript wrapper ל-`PhoenixFilterContext`)

---

## 🔧 דוגמת מימוש מוצע: Header Loader

### **קובץ unified-header.html**

**מיקום:** `ui/src/components/core/unified-header.html`

**מבנה:**
```html
<!--
  Phoenix-Header-Ver: v1.0.0 | Modular Header Component
  Sync-Time: 2026-02-03 00:00:00 IST
  Team: Team 31 (Shared Components)
  Status: ✅ MODULAR HEADER - SINGLE SOURCE OF TRUTH
  Compliance: RTL Charter ✅ | DNA Sync ✅ | LEGO System ✅ | CSS Standards Protocol ✅
  
  Purpose:
  This is the modular header component - single source of truth for all header content.
  Loaded dynamically via header-loader.js into all pages.
  
  IMPORTANT:
  - All header content updates MUST be done ONLY in this file
  - CSS styles are in phoenix-header.css
  - JavaScript handlers are in header-dropdown.js and header-filters.js
  - Global Filter integration via PhoenixFilterContext wrapper
  - This file must pass G-Bridge validation independently
-->

<header id="unified-header">
  <div class="header-content">
    <div class="header-top">
      <div class="header-container">
        <!-- Navigation: Standard navigation menu -->
        <div class="header-nav">
          <nav class="main-nav">
            <ul class="tiktrack-nav-list">
              <!-- Home Link -->
              <li class="tiktrack-nav-item">
                <a href="/" class="tiktrack-nav-link" data-page="home" title="דף הבית">
                  <img src="../../../../ui/public/images/icons/entities/home.svg" alt="בית" width="36" height="36" class="nav-icon home-icon-only">
                </a>
              </li>
              
              <!-- Dropdown Menus (6 dropdowns) -->
              <!-- תכנון, מעקב, מחקר, נתונים, הגדרות, ניהול -->
              
              <!-- Utils -->
              <li class="tiktrack-nav-item">
                <a href="#" class="tiktrack-nav-link" title="ניקוי">
                  <span class="nav-text utils-icon-clean">🧹</span>
                </a>
              </li>
              <!-- ... -->
            </ul>
          </nav>
        </div>
        
        <!-- Logo Section -->
        <div class="logo-section">
          <a href="/" class="logo" data-page="home" title="דף הבית">
            <img src="../../../../ui/public/images/logo.svg" alt="TikTrack Logo" class="logo-image">
            <span class="logo-text">פשוט לנהל תיק</span>
          </a>
        </div>
      </div>
    </div>
    
    <!-- Header Filters Row - TtGlobalFilter Component -->
    <div class="header-filters">
      <div class="filters-container">
        <!-- Filter Groups -->
        <div class="filter-group status-filter">
          <!-- ... פילטרים ... -->
        </div>
        <!-- ... עוד פילטרים ... -->
        
        <!-- Filter Actions -->
        <div class="filter-actions">
          <button class="reset-btn js-filter-reset" title="איפוס פילטרים">↻</button>
          <button class="clear-btn js-filter-clear" title="נקה כל הפילטרים">×</button>
        </div>
      </div>
      
      <div class="filter-toggle-section filter-toggle-main">
        <button class="header-filter-toggle-btn js-filter-toggle-btn" id="headerFilterToggleBtnMain" title="הצג/הסתר פילטרים">
          <span class="header-filter-arrow">▲</span>
        </button>
      </div>
    </div>
  </div>
</header>
```

---

### **קובץ header-loader.js**

**מיקום:** `ui/src/components/core/header-loader.js`

**מבנה (דומה ל-footer-loader.js):**
```javascript
/**
 * Phoenix-Header-Loader-Ver: v1.0.0 | Modular Header Loader
 * Sync-Time: 2026-02-03 00:00:00 IST
 * Team: Team 31 (Shared Components)
 * Status: ✅ MODULAR HEADER LOADER
 * 
 * Purpose:
 * Dynamically loads unified-header.html into all pages.
 * All pages now use unified structure: header > .page-wrapper > .page-container > main
 * Header is injected at the beginning of <body> (before .page-wrapper)
 * 
 * Usage:
 * Add <script src="./header-loader.js"></script> in <head> or before closing </body> tag.
 */

(function loadHeader() {
  'use strict';
  
  // Wait for DOM to be ready
  function initHeader() {
    // Check if header already exists (prevent duplicate)
    if (document.querySelector('header#unified-header')) {
      console.warn('Phoenix Header Loader: Header already exists. Skipping load.');
      return;
    }
    
    // Load unified-header.html
    fetch('./unified-header.html')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        // Create temporary container to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html.trim();
        
        // Find the header element
        const header = tempDiv.querySelector('header#unified-header');
        if (!header) {
          console.warn('Phoenix Header Loader: header element not found in unified-header.html');
          return;
        }
        
        // Insert header at the beginning of <body> (before .page-wrapper)
        const pageWrapper = document.querySelector('.page-wrapper');
        
        if (pageWrapper) {
          // Insert before .page-wrapper
          document.body.insertBefore(header, pageWrapper);
        } else {
          // Fallback: Insert at the beginning of body
          document.body.insertBefore(header, document.body.firstChild);
        }
        
        // Initialize JavaScript handlers after header is loaded
        // Load header-dropdown.js and header-filters.js if not already loaded
        if (!window.__headerHandlersLoaded) {
          // Load header-dropdown.js
          const dropdownScript = document.createElement('script');
          dropdownScript.src = './header-dropdown.js';
          document.body.appendChild(dropdownScript);
          
          // Load header-filters.js
          const filtersScript = document.createElement('script');
          filtersScript.src = './header-filters.js';
          document.body.appendChild(filtersScript);
          
          window.__headerHandlersLoaded = true;
        }
      })
      .catch(error => {
        console.error('Phoenix Header Loader: Failed to load unified-header.html', error);
      });
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    // DOM already loaded
    initHeader();
  }
})();
```

**שימוש בעמוד HTML:**
```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <!-- CSS Loading Order -->
  <!-- ... -->
</head>
<body class="trading-accounts-page context-trading">
  
  <!-- Header will be loaded dynamically via header-loader.js -->
  <script src="./header-loader.js"></script>
  
  <!-- Page Wrapper + Container Structure -->
  <div class="page-wrapper">
    <!-- ... תוכן העמוד ... -->
  </div>
  
  <!-- Footer -->
  <script src="footer-loader.js"></script>
</body>
</html>
```

---

### **אינטגרציה עם פילטר גלובלי**

**קובץ phoenix-filter-wrapper.js (חדש)**

**מיקום:** `ui/src/components/core/phoenix-filter-wrapper.js`

**תכונות:**
- JavaScript wrapper ל-`PhoenixFilterContext`
- State Manager עצמאי ב-Vanilla JS
- Custom Events לתקשורת עם React Components
- סנכרון עם `PhoenixFilterContext` (אם קיים)

**מימוש:**
```javascript
/**
 * Phoenix-Filter-Wrapper-Ver: v1.0.0 | Filter Context Wrapper
 * Purpose: JavaScript wrapper for PhoenixFilterContext to work with HTML pages
 */

(function initPhoenixFilterWrapper() {
  'use strict';
  
  const FilterManager = {
    filters: {
      status: null,
      investmentType: null,
      tradingAccount: null,
      dateRange: { from: null, to: null },
      search: ''
    },
    
    setFilter(key, value) {
      this.filters[key] = value;
      
      // Dispatch Custom Event
      window.dispatchEvent(new CustomEvent('phoenix-filter-change', {
        detail: { key, value, filters: { ...this.filters } }
      }));
      
      // Update UI
      this.updateFilterUI(key, value);
    },
    
    clearFilters() {
      this.filters = {
        status: null,
        investmentType: null,
        tradingAccount: null,
        dateRange: { from: null, to: null },
        search: ''
      };
      
      window.dispatchEvent(new CustomEvent('phoenix-filter-change', {
        detail: { filters: { ...this.filters } }
      }));
      
      this.updateAllFilterUI();
    },
    
    updateFilterUI(key, value) {
      // Update filter UI elements
      const filterElement = document.querySelector(`[data-filter-type="${key}"]`);
      if (filterElement) {
        const selectedValue = filterElement.querySelector('.selected-value');
        if (selectedValue) {
          selectedValue.textContent = value || 'הכול';
        }
      }
    },
    
    updateAllFilterUI() {
      // Update all filter UI elements
      Object.keys(this.filters).forEach(key => {
        this.updateFilterUI(key, this.filters[key]);
      });
    }
  };
  
  // Expose globally
  window.PhoenixFilterManager = FilterManager;
  
  // Initialize filter handlers
  document.addEventListener('DOMContentLoaded', function() {
    // Connect filter buttons to FilterManager
    document.querySelectorAll('.js-filter-item').forEach(item => {
      item.addEventListener('click', function() {
        const filterType = this.closest('.filter-group').querySelector('.js-filter-toggle').dataset.filterType;
        const value = this.dataset.value === 'הכול' ? null : this.dataset.value;
        FilterManager.setFilter(filterType, value);
      });
    });
    
    // Connect reset/clear buttons
    document.querySelector('.js-filter-reset')?.addEventListener('click', () => {
      FilterManager.clearFilters();
    });
    
    document.querySelector('.js-filter-clear')?.addEventListener('click', () => {
      FilterManager.clearFilters();
    });
  });
})();
```

**שימוש:**
```html
<!-- Load filter wrapper before header-loader -->
<script src="./phoenix-filter-wrapper.js"></script>
<script src="./header-loader.js"></script>
```

---

## 🔗 קישורים רלוונטיים

**דוח מקורי:**
- `TEAM_30_TO_TEAM_10_HEADER_ARCHITECTURE_CRITICAL_ISSUE.md`

**החלטה אדריכלית Footer:**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DIRECTIVE_FOOTER_STRATEGY.md`

**תיעוד ארכיטקטורה:**
- `documentation/01-ARCHITECTURE/FRONTEND/COMPONENTS/TT2_HEADER_SPEC_LOD400.md`
- `documentation/01-ARCHITECTURE/TT2_HEADER_BLUEPRINT.md`

**קבצים רלוונטיים:**
- `ui/src/views/financial/D16_ACCTS_VIEW.html` - Header מוטמע (שורות 35-264)
- `ui/src/components/core/UnifiedHeader.jsx` - קומפוננטה React (לא בשימוש)
- `ui/src/layout/global_page_template.jsx` - תבנית React
- `ui/src/views/financial/footer-loader.js` - דוגמה לפתרון דומה ✅
- `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/footer.html` - דוגמה ל-HTML מרכזי ✅

---

## ✅ החלטה אדריכלית התקבלה

**תאריך:** 2026-02-03  
**מקור:** Chief Architect (Gemini)  
**סטטוס:** ✅ **APPROVED - Phoenix Dynamic Bridge (v2.0)**

### **החלטה:**
1. **Header Loader:** דומה ל-Footer Loader - `header-loader.js` טוען `unified-header.html`
2. **Phoenix Dynamic Bridge (v2.0):** פתרון לפילטר גלובלי עם:
   - **The Registry:** `window.PhoenixBridge` - אובייקט גלובלי
   - **Dynamic Data Injection:** `updateOptions(key, data)` - עדכון אפשרויות פילטרים
   - **URL Sync:** `syncWithUrl()` - סנכרון פילטרים עם URL Params
   - **Session Storage:** שמירת מצב ב-`sessionStorage`
   - **Cross-Page:** טעינת מצב במעבר בין עמודים

### **משימה לצוות 30:**
מימוש קובץ `phoenix-filter-bridge.js` המכיל את פונקציות ה-`updateOptions` וה-`syncWithUrl`.

**מפרט מלא:** `ARCHITECT_FILTER_BRIDGE_SPEC_V2.md`

---

## 📋 סיכום והמלצה (לפני החלטה)

### **בעיה קריטית:**
- Header מופיע כקוד כפול בכל עמוד HTML (~230 שורות)
- כל עדכון בתפריט דורש עדכון ידני בכל עמוד בנפרד
- אין מקור אמת יחיד (SSOT) לתפריט

### **פתרון שאושר:**
- ✅ Header Loader דומה ל-Footer Loader - `header-loader.js` + `unified-header.html`
- ✅ Phoenix Dynamic Bridge (v2.0) - פתרון לפילטר גלובלי
- ✅ אפס למידה לצוות 30 - דומה ל-Footer Loader

### **יתרונות:**
- ✅ דומה לפתרון Footer שכבר עובד ואושר
- ✅ עובד עם עמודי HTML קיימים
- ✅ מקור אמת יחיד (SSOT)
- ✅ עדכון במקום אחד משפיע על כל העמודים
- ✅ פתרון לפילטר גלובלי עם Dynamic Data Injection
- ✅ שמירת מצב (URL + Session Storage)

---

## ✅ החלטה אדריכלית התקבלה

**תאריך:** 2026-02-03  
**מקור:** Chief Architect (Gemini)  
**סטטוס:** ✅ **APPROVED**

**החלטה:** Phoenix Dynamic Bridge (v2.0) - Header Loader + Dynamic Filter Bridge

**מפרט:** `ARCHITECT_FILTER_BRIDGE_SPEC_V2.md`

---

## 📅 צעדים הבאים

1. ✅ **החלטה אדריכלית:** ✅ **APPROVED** - Phoenix Dynamic Bridge (v2.0)
2. ✅ **פתרון פילטר גלובלי:** ✅ **APPROVED** - `window.PhoenixBridge` עם `updateOptions` ו-`syncWithUrl`
3. ⏳ **יישום:** יישום הפתרון על ידי Team 30
   - יצירת `unified-header.html`
   - יצירת `header-loader.js`
   - יצירת `phoenix-filter-bridge.js`
   - עדכון כל עמודי HTML
4. ⏳ **בדיקות:** בדיקת עקביות בין כל העמודים על ידי Team 50

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-03  
**סטטוס:** 🔴 **CRITICAL - ARCHITECTURAL DECISION REQUIRED**

**log_entry | [Team 10] | HEADER_ARCHITECTURE | DECISION_REQUIRED | CRITICAL | 2026-02-03**
