# 🛡️ מדריך אדריכלי: גבולות React ו-HTML בפיניקס

**id:** `PHOENIX_REACT_HTML_BOUNDARIES`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-05  
**version:** v1.0

**מאת:** Chief Architect (Gemini)  
**תאריך:** 2026-02-04  
**סטטוס:** 🔒 **MANDATORY - LOCKED**  
**קהל יעד:** כל המפתחים במערכת

---

## 📢 Executive Summary

**חוקי הברזל:** React הוא "האיים של לוגיקה" בתוך דפי HTML. המעטפת (Shell) היא HTML/Vanilla, התוכן (Content) הוא React.

**מטרה:** מניעת כפילויות וביצור הארכיטקטורה ההיברידית.

---

## 🛑 חוקי הברזל (The Iron Rules)

### **1. React Is Internal**
רכיבי React חיים אך ורק בתוך ה-Cubes (`ui/src/cubes/`). הם אחראים על ה-Content.

### **2. HTML Is External**
המעטפת (Header, Footer, Page Structure) היא HTML/Vanilla. היא אחראית על ה-Context.

### **3. The Bridge Is The Law**
כל תקשורת בין המעטפת לתוכן מתבצעת אך ורק דרך `window.PhoenixBridge`.

---

## 🗺️ מפת תפקידים (Boundary Map)

| האזור | הטכנולוגיה | האחראי | דוגמה |
|:------|:-----------|:-------|:------|
| **Navigation Menu** | Vanilla / HTML | Team 10 & 40 | `unified-header.html` |
| **Global Filters (UI)** | Vanilla / HTML | Team 10 & 40 | `unified-header.html` |
| **Filter Logic (State)** | React Context | Team 30 | `PhoenixFilterContext` |
| **Data Fetching (API)** | React Services | Team 30 & 20 | `api/services/` |
| **Table Rendering** | React Components | Team 30 | `PhoenixTable.jsx` |
| **Forms (Complex)** | React Components | Team 30 | `LoginForm.jsx` |
| **Page Structure** | HTML | Team 10 & 40 | `D16_ACCTS_VIEW.html` |

---

## ✅ דוגמאות נכונות

### **Navigation Menu - נכון**

```html
<!-- unified-header.html - נכון! -->
<nav class="main-nav">
  <ul class="tiktrack-nav-list">
    <li class="tiktrack-nav-item">
      <a href="/trading_accounts" class="tiktrack-nav-link">חשבונות מסחר</a>
    </li>
  </ul>
</nav>
```

**למה זה נכון:**
- ✅ HTML/Vanilla - לא React
- ✅ קישור סטנדרטי (`<a href>`) - לא `<Link>`
- ✅ עובד גם אם React נכשל בטעינה
- ✅ SSOT - מקור אמת יחיד

---

### **Global Filters UI - נכון**

```html
<!-- unified-header.html - נכון! -->
<div class="filter-group account-filter">
  <div class="filter-dropdown">
    <button class="filter-toggle js-filter-toggle">כל חשבון מסחר</button>
    <div class="filter-menu" id="accountFilterMenu">
      <!-- Options populated dynamically via PhoenixBridge -->
    </div>
  </div>
</div>
```

**למה זה נכון:**
- ✅ HTML/Vanilla - UI ב-HTML
- ✅ Logic ב-React דרך Bridge
- ✅ `window.PhoenixBridge.updateOptions()` מעדכן את ה-UI

---

### **Table Rendering - נכון**

```jsx
// PhoenixTable.jsx - נכון!
import React from 'react';

const PhoenixTable = ({ data, columns }) => {
  // React Component בתוך Cube
  return (
    <table>
      {/* Table rendering logic */}
    </table>
  );
};
```

**למה זה נכון:**
- ✅ React Component בתוך `ui/src/cubes/`
- ✅ אחראי על Content (טבלאות)
- ✅ לא מנסה לשלוט ב-Shell

---

## ❌ דוגמאות לא נכונות

### **Navigation Menu ב-React - לא נכון**

```jsx
// UnifiedHeader.jsx - לא נכון! ❌
import { Link } from 'react-router-dom';

const UnifiedHeader = () => {
  return (
    <header>
      <nav>
        <Link to="/trading_accounts">חשבונות מסחר</Link>
      </nav>
    </header>
  );
};
```

**למה זה לא נכון:**
- ❌ React Component שמכיל Navigation Menu
- ❌ שימוש ב-`<Link>` במקום `<a href>`
- ❌ מפר את חוקי הברזל: "Navigation Menu - Vanilla / HTML"
- ❌ יוצר כפילות עם `unified-header.html`

**הפתרון הנכון:**
- ✅ להשתמש ב-`unified-header.html` (HTML/Vanilla)
- ✅ קישורים סטנדרטיים (`<a href>`)

---

### **Header ב-React Template - לא נכון**

```jsx
// global_page_template.jsx - לא נכון! ❌
const TtHeader = ({ user }) => (
  <header>
    <nav>
      <a href="#">ראשי</a>
    </nav>
  </header>
);
```

**למה זה לא נכון:**
- ❌ React Component שמכיל Header
- ❌ מפר את חוקי הברזל: "HTML Is External"
- ❌ יוצר כפילות עם `unified-header.html`

**הפתרון הנכון:**
- ✅ להשתמש ב-`unified-header.html` דרך `header-loader.js`
- ✅ לא להכיל Header ב-React Components

---

## 🔍 זיהוי כפילויות (How to Detect Violations)

### **סימנים לכפילות:**

1. **אם יש קוד HTML של תפריט בתוך קובץ `.jsx`:**
   ```jsx
   // ❌ כפילות!
   <nav>
     <a href="/trading_accounts">חשבונות מסחר</a>
   </nav>
   ```

2. **אם יש שימוש ב-`<Link>` מ-React Router ב-Navigation:**
   ```jsx
   // ❌ כפילות!
   <Link to="/trading_accounts">חשבונות מסחר</Link>
   ```

3. **אם יש React Component שמכיל Header/Footer:**
   ```jsx
   // ❌ כפילות!
   const MyHeader = () => <header>...</header>;
   ```

### **מה לעשות:**
- ❌ **למחוק** את הכפילות
- ✅ **להשתמש** ב-HTML/Vanilla (`unified-header.html`, `footer.html`)

---

## 🌉 The Bridge - תקשורת בין Shell ל-Content

### **איך זה עובד:**

1. **HTML Side (Shell):**
   ```html
   <!-- unified-header.html -->
   <button class="js-filter-toggle" data-filter-type="account">
     כל חשבון מסחר
   </button>
   ```

2. **JavaScript Handler (Vanilla):**
   ```javascript
   // header-filters.js
   document.querySelector('.js-filter-toggle').addEventListener('click', function() {
     const filterType = this.dataset.filterType;
     const value = this.dataset.value;
     window.PhoenixBridge.setFilter(filterType, value);
   });
   ```

3. **React Side (Content):**
   ```jsx
   // React Component
   useEffect(() => {
     const handleFilterChange = (e) => {
       const { key, value } = e.detail;
       setFilter(key, value);
     };
     window.addEventListener('phoenix-filter-change', handleFilterChange);
   }, []);
   ```

**למה זה נכון:**
- ✅ Shell (HTML) מדבר עם Content (React) דרך Bridge
- ✅ אין תלות ישירה בין Shell ל-Content
- ✅ עובד גם אם React נכשל בטעינה

---

## 📋 Checklist למפתחים

### **לפני יצירת קוד חדש:**

- [ ] האם זה Shell (Header, Footer, Navigation)? → HTML/Vanilla
- [ ] האם זה Content (Tables, Forms)? → React Components
- [ ] האם צריך תקשורת בין Shell ל-Content? → Bridge

### **לפני עדכון קוד קיים:**

- [ ] האם יש כפילות? → למחוק את הכפילות
- [ ] האם זה עומד בחוקי הברזל? → לתקן אם לא
- [ ] האם זה מתועד? → לתעד

---

## ❓ FAQ למפתחים

### **Q: איפה אני צריך לשים Navigation Menu?**
**A:** ב-`views/shared/unified-header.html` (HTML/Vanilla). לא ב-React Components.

### **Q: איך אני מעדכן Navigation Menu?**
**A:** עדכן את `views/shared/unified-header.html`. זה מקור האמת היחיד (SSOT).

### **Q: איך אני מוסיף קישור חדש?**
**A:** הוסף `<a href="/new_route">` ב-`views/shared/unified-header.html`. לא צריך לדעת React.

### **Q: איך אני משתמש ב-React Router?**
**A:** רק ב-React Components בתוך Cubes. לא ב-Navigation Menu.

### **Q: מה זה Bridge?**
**A:** `window.PhoenixBridge` - תקשורת בין Shell (HTML) ל-Content (React).

---

## 🔗 קישורים רלוונטיים

**הנחיות אדריכליות:**
- ⚓ Navigation Strategy: קישורים סטנדרטיים במבנה היברידי
- ⚛️ React Deep Dive: React הוא "האיים של לוגיקה"
- 🛡️ Boundary Mandate: React Is Internal, HTML Is External

**קבצים נכונים:**
- `ui/src/views/shared/unified-header.html` - Navigation Menu ✅
- `ui/src/views/shared/footer.html` - Footer ✅
- `ui/src/components/core/phoenix-filter-bridge.js` - Bridge ✅

**קבצים לא נכונים (למחוק):**
- `ui/src/components/core/UnifiedHeader.jsx` - כפילות ❌
- `ui/src/layout/global_page_template.jsx` (TtHeader) - כפילות ❌

---

**Chief Architect (Gemini)**  
**תאריך:** 2026-02-04  
**סטטוס:** 🔒 **MANDATORY - LOCKED**

**log_entry | [Architect] | REACT_HTML_BOUNDARIES | DOCUMENTED | LOCKED | 2026-02-04**
