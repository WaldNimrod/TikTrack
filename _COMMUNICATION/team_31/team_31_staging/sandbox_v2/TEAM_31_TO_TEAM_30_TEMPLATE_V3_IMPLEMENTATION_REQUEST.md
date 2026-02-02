# 📡 הודעה: Team 31 → Team 30 | בקשה ליישום תבנית עמוד מלאה V3

**תאריך:** 2026-02-02  
**מאת:** Team 31 (Blueprint)  
**אל:** Team 30 (Frontend Implementation)  
**נושא:** יישום תבנית עמוד מלאה V3 - הגרסה הסופית והנעולה  
**Priority:** 🟢 **P1 - IMPLEMENTATION REQUEST**

---

## 🎯 רקע

תבנית עמוד מלאה V3 נוצרה ונעולה - מבוססת על **המבנה המדויק** של עמוד הכניסה (D15_LOGIN.html) שיצרתם בפועל, כוללת Unified Header מלא, ועומדת בכל הקללים החדשים.

**התבנית V3 היא הגרסה הסופית והנעולה - מוכנה ליישום.**

---

## 📋 המשימה

### **יישום תבנית עמוד מלאה V3**

התבנית V3 מבוססת על המבנה המדויק של עמוד הכניסה שיצרתם, עם הוספת Unified Header מלא ותוכן לדוגמה.

---

## 📦 קבצים למסירה

### **1. Blueprint HTML - V3 (הגרסה הסופית)**
**מיקום:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D15_PAGE_TEMPLATE_V3.html`

**תוכן:**
- ✅ Unified Header מלא (120px, LOD 400)
- ✅ מבנה עמוד **זהה 100%** לעמוד הכניסה:
  - `<div class="page-wrapper">` - רקע אפור מלא רוחב
  - `<div class="page-container">` - מרכז, max-width 1400px
  - `<main>` - תוכן ראשי
  - `<tt-container>` - קונטיינר LEGO
  - `<tt-section>` - סקשנים
- ✅ Footer מודולרי (נטען דינמית, התנהגות זהה לעמוד הכניסה)
- ✅ JavaScript חיצוני בלבד (Clean Slate Rule)
- ✅ 3 סקשנים לדוגמה

### **2. קבצי JavaScript חיצוניים**
**מיקום:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/`

- ✅ `footer-loader.js` - טעינת Footer דינמית (v1.3.0 - זהה למקור)
- ✅ `header-dropdown.js` - פונקציונליות תפריטי משנה (hover, 180° rotation)
- ✅ `header-filters.js` - פונקציונליות פילטרים של Header
- ✅ `section-toggle.js` - הצגה/הסתרה של סקשנים

### **3. קבצי Footer**
**מיקום:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/`

- ✅ `footer.html` - תוכן Footer (Single Source of Truth)
- ✅ `footer-loader.js` - טעינת Footer דינמית (v1.3.0 - זהה למקור)

---

## 🎯 עקרונות יסוד

### **1. מבוסס על מבנה עמוד הכניסה המדויק** ✅

התבנית V3 מבוססת על המבנה המדויק של `D15_LOGIN.html` שיצרתם:

```html
<!-- מבנה זהה 100% לעמוד הכניסה -->
<div class="page-wrapper">
  <div class="page-container">
    <main>
      <tt-container>
        <tt-section>
          <!-- Content -->
        </tt-section>
      </tt-container>
    </main>
  </div>
</div>

<!-- Footer: טעינה דינמית (זהה לעמוד הכניסה) -->
<script src="./footer-loader.js"></script>
```

**יתרונות:**
- ✅ מבנה זהה 100% למה שיצרתם (קל למימוש)
- ✅ CSS Classes זהה (אין צורך בשינויים)
- ✅ Footer behavior זהה (אין צורך בשינויים)
- ✅ JavaScript חיצוני (קל להמרה ל-React)

### **2. Unified Header מלא** ✅

התבנית כוללת Unified Header מלא (120px, LOD 400):

- **Row 1 (header-top):** Navigation + Logo (60px)
- **Row 2 (header-filters):** 5 פילטרים + חיפוש + User Profile Link (60px)

**מפרט טכני:**
- גובה כולל: `120px` (קבוע, LOD 400)
- Z-Index: `950`
- Position: `sticky top: 0`
- תפריטי משנה: סיבוב חץ 180° (לא 90° או 120°)
- אופציות Investment Type: Long, Short, מניות, אופציות, חוזים עתידיים, קרנות, אגרות חוב

### **3. Final Governance Lock Compliant** ✅

- ✅ **Clean Slate Rule:** אין JavaScript בתוך HTML - כל הסקריפטים בקבצים חיצוניים
- ✅ **Fluid Design:** מוכן ל-clamp, min, max, Grid auto-fit/auto-fill
- ✅ **Design Tokens SSOT:** שימוש ב-`phoenix-base.css` בלבד
- ✅ **LEGO System:** מבנה מודולרי תקין (`tt-container > tt-section > tt-section-row`)
- ✅ **RTL:** תמיכה מלאה בעברית (dir="rtl", lang="he")

---

## 📋 מפרט טכני

### **מבנה HTML/JSX:**
```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <!-- CSS Loading Order: Pico CSS FIRST, then base, then components, then header -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">
  <link rel="stylesheet" href="../phoenix-base.css">
  <link rel="stylesheet" href="../phoenix-components.css">
  <link rel="stylesheet" href="../phoenix-header.css">
</head>
<body class="page-template">
  <!-- Unified Header: LOD 400 - Height 120px -->
  <header id="unified-header">
    <!-- Row 1: Navigation + Logo -->
    <!-- Row 2: Filters + Search + User Profile -->
  </header>

  <!-- Page Wrapper: Full-width gray background (EXACT from login page) -->
  <div class="page-wrapper">
    <!-- Page Container: Centered, max-width 1400px (EXACT from login page) -->
    <div class="page-container">
      <!-- Main Content -->
      <main>
        <tt-container>
          <tt-section data-section="section-0">...</tt-section>
          <tt-section data-section="section-1">...</tt-section>
          <tt-section data-section="section-2">...</tt-section>
        </tt-container>
      </main>
    </div>
  </div>
  
  <!-- Modular Footer: Loaded dynamically via footer-loader.js (EXACT same as login page) -->
  <script src="./footer-loader.js"></script>
  
  <!-- External JavaScript Files - NO inline scripts -->
  <script src="./header-dropdown.js"></script>
  <script src="./header-filters.js"></script>
  <script src="./section-toggle.js"></script>
</body>
</html>
```

### **CSS Architecture:**
- ✅ `phoenix-base.css` - CSS Variables (SSOT), Reset, Base Typography (Fluid Design)
- ✅ `phoenix-components.css` - LEGO System Components, Footer styles
- ✅ `phoenix-header.css` - Unified Header Styles

### **JavaScript Architecture:**
- ✅ `footer-loader.js` - טעינת Footer דינמית (v1.3.0 - זהה למקור)
- ✅ `header-dropdown.js` - פונקציונליות תפריטי משנה (hover, 180° rotation)
- ✅ `header-filters.js` - פונקציונליות פילטרים של Header
- ✅ `section-toggle.js` - הצגה/הסתרה של סקשנים

### **תמונות ואיקונים:**
- ✅ כל הנתיבים מעודכנים ל-`../../../../ui/public/images/...`
- ✅ איקונים: `../../../../ui/public/images/icons/entities/*.svg`
- ✅ לוגו: `../../../../ui/public/images/logo.svg`

---

## 🎯 הוראות יישום

### **1. המרת HTML ל-JSX**

התבנית V3 היא HTML טהור - יש להמיר ל-JSX:

- ✅ המרת כל ה-HTML ל-JSX syntax
- ✅ המרת `class` ל-`className`
- ✅ המרת `for` ל-`htmlFor`
- ✅ המרת inline styles ל-objects (אם נדרש)

### **2. שימוש ב-CSS קיים**

התבנית משתמשת באותם קבצי CSS שכבר קיימים:

- ✅ `phoenix-base.css` - CSS Variables (SSOT)
- ✅ `phoenix-components.css` - LEGO System Components
- ✅ `phoenix-header.css` - Unified Header Styles

**אין צורך** בקבצי CSS חדשים - כל הסגנונות כבר קיימים.

### **3. המרת JavaScript ל-React**

כל ה-JavaScript הוא חיצוני - יש להמיר ל-React Hooks/Components:

- ✅ `footer-loader.js` → שימוש ב-`PageFooter` component (כבר קיים)
- ✅ `header-dropdown.js` → React component עם `useState`/`useEffect`
- ✅ `header-filters.js` → React component עם `PhoenixFilterContext`
- ✅ `section-toggle.js` → React component עם `useState`

### **4. שימוש ב-Components קיימים**

אם יש components קיימים, יש להשתמש בהם:

- ✅ `PageFooter` - אם קיים, יש להשתמש בו
- ✅ `UnifiedHeader` - אם קיים, יש להשתמש בו (או לבנות לפי הבלופרינט)
- ✅ `TtContainer`, `TtSection`, `TtSectionRow` - אם קיימים, יש להשתמש בהם

### **5. בדיקת התנהגות Footer**

התנהגות Footer חייבת להיות **זהה 100%** לעמוד הכניסה:

- ✅ Footer לא מוצג בטעינה ראשונה
- ✅ Footer מוצג רק בגלילה
- ✅ Footer ממוקם תמיד מתחת לסוף התוכן
- ✅ רקע Footer בפיקס ומוצג רק בגלילה

---

## ⚠️ נקודות קריטיות

### **1. מבנה Wrappers** ⚠️ **קריטי**

המבנה חייב להיות **זהה 100%** לעמוד הכניסה:

```jsx
<div className="page-wrapper">
  <div className="page-container">
    <main>
      <tt-container>
        <tt-section>
          {/* Content */}
        </tt-section>
      </tt-container>
    </main>
  </div>
</div>
```

**אין לשנות** את המבנה הזה - הוא זהה למה שיצרתם בעמוד הכניסה.

### **2. Unified Header** ⚠️ **קריטי ומורכב מאוד**

**מבנה מלא:**
- **Row 1 (header-top):** 60px
  - Navigation (header-nav) - תפריט ניווט ראשי
  - Logo Section (logo-section) - לוגו + סלוגן
- **Row 2 (header-filters):** 60px
  - **5 פילטרים:** Status, Investment Type, Trading Account, Date Range, Search
  - **Filter Actions:** Reset, Clear
  - **User Profile Link:** קישור לפרופיל משתמש
  - **Filter Toggle Button:** כפתור הצגה/הסתרה

**מפרט טכני:**
- **גובה כולל:** `120px` (קבוע, LOD 400) - **אסור לשנות**
- **Z-Index:** `950`
- **Position:** `sticky top: 0`
- **תפריטי משנה:** סיבוב חץ 180° (לא 90° או 120°)

**אינטגרציה עם React:**
- **PhoenixFilterContext:** כל הפילטרים מחוברים ל-Context API
- **TtGlobalFilter:** רכיב React שמחבר את הפילטרים ל-Context

### **3. Footer Behavior** ⚠️ **קריטי**

התנהגות Footer חייבת להיות **זהה 100%** לעמוד הכניסה:

- ✅ Footer לא מוצג בטעינה ראשונה
- ✅ Footer מוצג רק בגלילה
- ✅ Footer ממוקם תמיד מתחת לסוף התוכן
- ✅ רקע Footer בפיקס ומוצג רק בגלילה

**יש להשתמש ב-`PageFooter` component** (אם קיים) או ליישם את אותה התנהגות.

---

## 📝 שאלות לבדיקה

1. **Footer:** האם יש `PageFooter` component קיים? איפה הוא ממוקם?
2. **Unified Header:** האם יש `UnifiedHeader` component קיים? איפה הוא ממוקם?
3. **PhoenixFilterContext:** האם `PhoenixFilterContext` קיים ופועל? איפה הוא ממוקם?
4. **אייקונים:** האם כל האייקונים הנדרשים (`ui/public/images/icons/entities/*.svg`) זמינים?
5. **CSS:** האם כל קבצי ה-CSS (`phoenix-base.css`, `phoenix-components.css`, `phoenix-header.css`) זמינים ופועלים?

---

## ✅ קריטריונים להצלחה

- [ ] התבנית V3 מיושמת במדויק (המרת HTML ל-JSX)
- [ ] מבנה wrappers זהה 100% לעמוד הכניסה
- [ ] Unified Header מיושם במדויק (LOD 400, 120px)
- [ ] Footer behavior זהה 100% לעמוד הכניסה
- [ ] כל ה-JavaScript פונקציונליות עובדת (Section Toggle, Filter Toggle, Dropdowns)
- [ ] התבנית נקייה ומוכנה לשימוש

---

## 🔗 קישורים רלוונטיים

### **קבצים:**
- `sandbox_v2/D15_PAGE_TEMPLATE_V3.html` - תבנית עמוד מלאה V3 ⭐ **הגרסה הסופית והנעולה**
- `sandbox_v2/footer-loader.js` - טעינת Footer (v1.3.0)
- `sandbox_v2/footer.html` - תוכן Footer
- `sandbox_v2/header-dropdown.js` - תפריטי משנה
- `sandbox_v2/header-filters.js` - פילטרים
- `sandbox_v2/section-toggle.js` - הצגה/הסתרה

### **התייחסות:**
- `_COMMUNICATION/team_31/team_31_staging/D15_LOGIN.html` - עמוד הכניסה (מבנה התייחסות)

### **תיעוד מרכזי:**
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_FINAL_GOVERNANCE_LOCK.md` - Final Governance Lock
- `documentation/04-DESIGN_UX_UI/UNIFIED_HEADER_SPECIFICATION.md` - מפרט Unified Header

---

## 📞 תקשורת

לשאלות או הבהרות, אנא פנו ל-Team 31 (Blueprint) או ל-Team 10 (Gateway).

---

**חתימה:**  
Team 31 (Blueprint)  
**Date:** 2026-02-02  
**Status:** 🔒 **LOCKED & READY FOR IMPLEMENTATION**
