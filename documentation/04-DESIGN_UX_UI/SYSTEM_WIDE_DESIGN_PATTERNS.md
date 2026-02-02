# תובנות מערכתיות ומבנים כלליים - מדריך מפורט

**מיקום:** `documentation/04-DESIGN_UX_UI/`  
**אחריות:** Team 40 (UI Assets & Design)  
**תוקף:** מחייב לכל המערכת  
**תאריך עדכון:** 2026-02-01  
**גרסה:** v1.1 (Footer Modular Strategy Added)

---

## 🎯 מטרה

מסמך זה מתעד את כל התובנות המערכתיות, המבנים הכלליים והכללים המחייבים שנלמדו בתהליך הפיתוח. זהו המדריך המלא לשמירה על עקביות ודיוק בכל המערכת.

---

## 📐 1. תבנית עמוד (Page Template)

### **מבנה בסיסי - מחייב לכל עמוד:**

```html
<body class="index-page">
  <!-- Header -->
  <header id="unified-header">...</header>
  
  <!-- Page Wrapper: Full-width gray background -->
  <div class="page-wrapper">
    <!-- Page Container: Centered, max-width 1400px -->
    <div class="page-container">
      <main>
        <tt-container>
          <!-- Page Content -->
        </tt-container>
      </main>
    </div>
  </div>
</body>
```

### **כללים קריטיים:**

#### **1.1 Page Wrapper (רקע אפור)**
- **רוחב:** `100%` (כל רוחב העמוד)
- **רקע:** אפור (`--apple-bg-secondary, #F2F2F7`)
- **ריווח:** `0` מכל הכיוונים (`margin: 0; padding: 0`)
- **Overflow:** `overflow-x: hidden !important` (אסור גלילה אופקית)

```css
.page-wrapper {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden !important;
  background-color: var(--apple-bg-secondary, #F2F2F7);
  min-height: calc(100vh - var(--header-height, 120px));
  box-sizing: border-box;
}
```

#### **1.2 Page Container (אזור פעיל)**
- **רוחב מקסימלי:** `1400px`
- **מיקום:** ממורכז (`margin-inline: auto`)
- **ריווח:** `0` (התוכן מטפל בריווח שלו)
- **Overflow:** `overflow-x: hidden !important`

```css
.page-container {
  max-width: var(--container-max-width, 1400px);
  width: 100%;
  max-width: 1400px !important;
  margin-inline: auto;
  padding: 0;
  overflow-x: hidden !important;
  box-sizing: border-box;
}
```

#### **1.3 HTML/Body Overflow Prevention**
```css
html {
  overflow-x: hidden !important;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

body {
  overflow-x: hidden !important;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
```

**⚠️ קריטי:** אסור גלילה אופקית בשום מצב. כל אלמנט חייב להיות מוגבל לרוחב המקסימלי.

### **1.4 Footer מודולרי (Modular Footer) - 🛡️ החלטה אדריכלית**

הפוטר הוא רכיב משותף (Shared Component) המנוהל באופן מרכזי על ידי **Team 31 (Shared Components)**.

#### **מבנה הקבצים:**
- **תוכן:** `footer.html` - HTML נקי של הפוטר (מקור אמת יחיד)
- **טוען:** `footer-loader.js` - סקריפט הזרקה ב-Vanilla JS
- **עיצוב:** `phoenix-components.css` - סגנונות הפוטר תחת סקשן "FOOTER"

#### **אופן המימוש בעמודים:**
הזרקת הסקריפט מתבצעת בסוף ה-`<body>`, **לפני** באנר ה-G-Bridge:

```html
<body class="index-page">
  <!-- Header -->
  <header id="unified-header">...</header>
  
  <!-- Page Wrapper -->
  <div class="page-wrapper">
    <div class="page-container">
      <main>
        <!-- Page Content -->
      </main>
    </div>
  </div>
  
  <!-- Footer Loader - לפני G-Bridge Banner -->
  <script src="./footer-loader.js"></script>
  
  <!-- G-Bridge Banner -->
  <div class="g-bridge-banner">...</div>
</body>
```

#### **כללים קריטיים:**
- ✅ **עדכון תוכן:** כל עדכון תוכן חייב להתבצע **רק** ב-`footer.html`
- ✅ **עדכון עיצוב:** כל עדכון עיצוב חייב להתבצע **רק** ב-`phoenix-components.css` תחת סקשן "FOOTER"
- ✅ **ולידציית G-Bridge:** קובץ `footer.html` חייב לעבור ולידציית G-Bridge **באופן עצמאי** ולהופיע ב-Tracker כרכיב מאושר (Approved Blueprint)
- ⚠️ **חשוב:** מכיוון שהפוטר נטען ב-JS, מנוע ה-G-Bridge לא יזהה את תוכנו בתוך דפי ה-HTML הרגילים

#### **מבנה CSS:**
```css
/* FOOTER: Modular Footer Component */
.page-footer {
  display: block;
  width: 100%;
  min-height: 200px;
  background: var(--apple-bg-footer, #2C2C2E);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
  padding: var(--spacing-lg, 24px);
  color: #FFFFFF;
}

.page-footer__container {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  gap: var(--spacing-lg, 24px);
}
```

**מיקום קבצים:**
- `_COMMUNICATION/team_31/team_31_staging/footer.html`
- `_COMMUNICATION/team_31/team_31_staging/footer-loader.js`
- `_COMMUNICATION/team_31/team_31_staging/phoenix-components.css` (סקשן FOOTER)

---

## 📦 2. קונטיינרים (Containers)

### **2.1 LEGO Components - היררכיה:**

```
tt-container
  └── tt-section
      └── tt-section-row
```

### **2.2 tt-container**
- **תפקיד:** Wrapper לתוכן עם padding אופקי
- **רוחב:** `100%`
- **Padding:** `padding-inline: var(--grid-gutter, var(--spacing-md))`
- **Overflow:** `overflow-x: hidden !important`

```css
tt-container {
  display: block;
  width: 100%;
  max-width: 100%;
  padding-inline: var(--grid-gutter, var(--spacing-md));
  overflow-x: hidden !important;
  box-sizing: border-box;
}
```

### **2.3 tt-section**
- **תפקיד:** יחידת תוכן עצמאית
- **רקע:** שקוף (`transparent`) - Header/Body הם כרטיסים נפרדים
- **ריווח:** `margin-block-start/end: var(--grid-gutter, var(--spacing-md))`
- **Overflow:** `overflow-x: hidden !important`

```css
tt-section {
  display: block;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  margin-block-start: var(--grid-gutter, var(--spacing-md));
  margin-block-end: var(--grid-gutter, var(--spacing-md));
  overflow-x: hidden !important;
  overflow-y: visible;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
```

**⚠️ חשוב:** הרווח בין Header לקונטיינר הראשון זהה לרווח בין קונטיינרים.

### **2.4 tt-section-row**
- **תפקיד:** חלוקה פנימית ל-Flex/Grid alignment
- **כיוון:** `flex-direction: column`
- **ריווח:** `gap: var(--grid-gutter, var(--spacing-md))`

---

## 🎴 3. כרטיסים (Cards)

### **3.1 מבנה כרטיס - 2 חלקים נפרדים:**

כל כרטיס מורכב מ-**2 כרטיסים לבנים נפרדים**:

1. **Header Card** - כותרת הכרטיס
2. **Body Card** - תוכן הכרטיס

**ביניהם:** רווח קטן אפור (רקע העמוד)

### **3.2 Header Card:**
```css
.index-section__header {
  background: var(--apple-bg-elevated, #ffffff);
  border: 1px solid var(--apple-border-light, #e5e5e5);
  border-radius: 8px;
  margin-block-end: var(--spacing-xs, 4px); /* Gap for gray spacing */
  box-shadow: var(--apple-shadow-light, 0 1px 3px rgba(0, 0, 0, 0.1));
  height: 60px !important; /* Fixed height */
  /* ... */
}
```

### **3.3 Body Card:**
```css
.index-section__body {
  background: var(--apple-bg-elevated, #ffffff);
  border: 1px solid var(--apple-border-light, #e5e5e5);
  border-radius: 8px;
  box-shadow: var(--apple-shadow-light, 0 1px 3px rgba(0, 0, 0, 0.1));
  padding: var(--spacing-lg, 24px);
  /* ... */
}
```

**⚠️ קריטי:** רק כרטיסי התוכן לבנים. רקע העמוד תמיד אפור.

---

## 📋 4. כותרות ופילטרים (Headers & Filters)

### **4.1 מבנה כותרת קונטיינר - 3 חלקים:**

ראה: `CONTAINER_HEADER_STRUCTURE_GUIDELINES.md`

**סיכום:**
1. **כותרת** (Title) - תחילת השורה, רוחב לפי תוכן
2. **כותרת משנה** (Subtitle) - מרכז, לוקח רוחב נותר, תוכן ממורכז
3. **אזור כפתורים** (Actions) - סוף השורה, רוחב לפי תוכן

### **4.2 כללים מחייבים:**
- **גובה קבוע:** `60px` לקונטיינר ראשי, `40px` לוויגיטים
- **שורה אחת:** `flex-wrap: nowrap !important`
- **יישור אנכי:** כל האלמנטים מיושרים לאמצע (`align-items: center`)
- **אין padding אנכי:** רק אופקי
- **אין margin מיותר:** על אלמנטים פנימיים

### **4.3 פילטרים:**
- **כל הפילטרים בשורה אחת:** `flex-wrap: nowrap !important`
- **גובה קבוע:** `32px` לכל כפתור/פילטר
- **יישור אנכי:** כל האלמנטים מיושרים לאמצע

---

## 🔘 5. כפתורים (Buttons)

### **5.1 כפתור סגירת סקשן (Toggle Button):**
- **גודל:** `32px × 32px`
- **מיקום:** סוף אזור הכפתורים
- **יישור:** מיושר לאמצע (`align-items: center`)

```css
.index-section__header-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  margin: 0;
  background: transparent;
  border: 1px solid var(--apple-border-light, #e5e5e5);
  border-radius: 4px;
  flex-shrink: 0;
}
```

### **5.2 כפתור רענון (Refresh Button):**
- **גודל:** `32px × 32px`
- **מיקום:** סוף כותרת וויגיט
- **יישור:** מיושר לאמצע

### **5.3 כפתורי פילטר:**
- **גודל:** `32px × 32px`
- **גובה קבוע:** `32px`
- **יישור:** מיושר לאמצע בשורה

---

## 🔤 6. פונטים, גדלים וצבעים (Typography, Sizes & Colors)

### **6.1 פונטים:**

#### **גדלי פונט בסיסיים:**
- **XS:** `12px` (`--font-size-xs`)
- **SM:** `14px` (`--font-size-sm`)
- **Base:** `16px` (`--font-size-base`)
- **LG:** `18px` (`--font-size-lg`)
- **XL:** `20px` (`--font-size-xl`)

#### **משקלי פונט:**
- **Light:** `300` (`--font-weight-light`)
- **Normal:** `400` (`--font-weight-normal`)
- **Medium:** `500` (`--font-weight-medium`)
- **Semibold:** `600` (`--font-weight-semibold`)
- **Bold:** `700` (`--font-weight-bold`)

#### **כותרות:**
- **H1:** `clamp(1.25rem, 3vw, 1.75rem)`, `font-weight: 600`
- **H2:** `clamp(1.25rem, 3vw, 1.75rem)`, `font-weight: 600`
- **H3:** `clamp(0.875rem, 2vw, 1rem)`, `font-weight: 600`

### **6.2 צבעים:**

#### **צבעי רקע:**
- **רקע ראשי:** `--apple-bg-secondary, #F2F2F7` (אפור)
- **רקע כרטיסים:** `--apple-bg-elevated, #ffffff` (לבן)

#### **צבעי טקסט:**
- **טקסט ראשי:** `--apple-text-primary, #1d1d1f` (שחור)
- **טקסט משני:** `--apple-text-secondary, #86868b` (אפור)

#### **צבעי ישויות:**
- **טריידים:** `--entity-trade-color, #26baac`
- **חשבונות מסחר:** `--entity-trading-account-color, #28a745`
- **טיקרים:** `--entity-ticker-color, #17a2b8`
- **מחקר:** `--entity-research-color, #9c27b0`
- **ביצועים:** `--entity-execution-color, #ff9800`

**⚠️ קריטי:** אסור להשתמש בצבעים ישירים. רק CSS Variables.

### **6.3 גדלים:**

#### **ריווח (Spacing):**
- **XS:** `4px` (`--spacing-xs`)
- **SM:** `8px` (`--spacing-sm`)
- **MD:** `16px` (`--spacing-md`)
- **LG:** `24px` (`--spacing-lg`)
- **XL:** `32px` (`--spacing-xl`)

#### **גבהים קבועים:**
- **Header כולל:** `120px`
- **Header שורה:** `60px`
- **כותרת קונטיינר:** `60px`
- **כותרת וויגיט:** `40px`
- **כפתורים:** `32px`

---

## 🎨 7. עיצוב ויזואלי (Visual Design)

### **7.1 גבולות (Borders):**
- **צבע:** `--apple-border-light, #e5e5e5`
- **עובי:** `1px`
- **רדיוס:** `8px` לכרטיסים, `4px` לכפתורים

### **7.2 צללים (Shadows):**
- **קל:** `var(--apple-shadow-light, 0 1px 3px rgba(0, 0, 0, 0.1))`
- **בינוני:** `var(--apple-shadow-medium, 0 4px 12px rgba(0, 0, 0, 0.15))`
- **כבד:** `var(--apple-shadow-heavy, 0 8px 24px rgba(0, 0, 0, 0.2))`

### **7.3 אקראים צבע (Color Accents):**
כל כותרת קונטיינר/וויגיט מקבלת אקרא צבע לפי הישות:
- **גבול שמאלי:** `3px solid` בצבע הישות
- **איקון:** בצבע הישות

---

## 📐 8. Responsive Design

### **8.1 Container Queries:**
```css
tt-section-row {
  container-type: inline-size;
  container-name: dashboard-row;
}

@container dashboard-row (min-width: 600px) {
  .widget-placeholder {
    min-height: 250px;
  }
}
```

### **8.2 Fluid Typography:**
```css
font-size: clamp(0.875rem, 2vw, 1rem);
```

---

## ⚠️ 9. כללים קריטיים - סיכום

### **9.1 אסור בשום מצב:**
- ❌ גלילה אופקית
- ❌ צבעים ישירים (רק Variables)
- ❌ שינוי גבהים קבועים
- ❌ שבירת שורה בכותרת
- ❌ רקע לבן על העמוד (רק אפור)
- ❌ padding/margin מיותר

### **9.2 חובה תמיד:**
- ✅ `overflow-x: hidden` על כל קונטיינר
- ✅ `box-sizing: border-box` על כל אלמנט
- ✅ גבהים קבועים עם `!important`
- ✅ `flex-wrap: nowrap` על כותרות
- ✅ `align-items: center` על כותרות
- ✅ CSS Variables בלבד

---

## 📋 10. Checklist ליישום

לפני סיום כל עמוד/קומפוננטה, ודא:

- [ ] מבנה עמוד נכון (page-wrapper > page-container > main > tt-container)
- [ ] אין גלילה אופקית
- [ ] רקע אפור על העמוד, לבן רק על כרטיסים
- [ ] כותרות עם גובה קבוע ו-3 חלקים
- [ ] כל האלמנטים מיושרים לאמצע
- [ ] רק CSS Variables לצבעים
- [ ] ריווח עקבי (spacing variables)
- [ ] גבהים קבועים לא נשברים
- [ ] פוטר מודולרי נטען לפני G-Bridge Banner (`<script src="./footer-loader.js"></script>`)

---

## 🔗 קישורים רלוונטיים

- `documentation/04-DESIGN_UX_UI/CONTAINER_HEADER_STRUCTURE_GUIDELINES.md` - הנחיות כותרות
- `documentation/04-DESIGN_UX_UI/UNIFIED_HEADER_SPECIFICATION.md` - מפרט Header
- `documentation/10-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md` - נוהל CSS
- `_COMMUNICATION/team_31/team_31_staging/phoenix-base.css` - יישום בפועל
- `_COMMUNICATION/team_31/team_31_staging/phoenix-components.css` - יישום בפועל (כולל סקשן FOOTER)
- `_COMMUNICATION/team_31/team_31_staging/footer.html` - תוכן הפוטר המודולרי (מקור אמת יחיד)
- `_COMMUNICATION/team_31/team_31_staging/footer-loader.js` - טוען הפוטר המודולרי
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DIRECTIVE_FOOTER_STRATEGY.md` - החלטה אדריכלית על פוטר מודולרי

---

**Team 40 (UI Assets & Design)**  
**Date:** 2026-02-01  
**Status:** ✅ **MANDATORY GUIDELINES - ALL TEAMS MUST FOLLOW**
