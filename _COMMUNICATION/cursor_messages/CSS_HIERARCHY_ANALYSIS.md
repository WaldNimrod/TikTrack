# 🏗️ CSS Hierarchy & Architecture Guide - Phoenix V2

**תאריך עדכון אחרון:** 2026-01-31  
**גרסה:** v2.0.0 (Complete Base System Established)  
**צוות:** Team 30 (Frontend)  
**סטטוס:** ✅ **BASE SYSTEM COMPLETE & STABLE**

---

## 📋 תוכן עניינים

1. [היררכיית CSS המלאה](#היררכיית-css-המלאה)
2. [סדר טעינת קבצי CSS](#סדר-טעינת-קבצי-css)
3. [חוק !important](#חוק-important)
4. [קבצי CSS במערכת](#קבצי-css-במערכת)
5. [ברירות מחדל מדויקות](#ברירות-מחדל-מדויקות)
6. [Best Practices](#best-practices)

---

## 🏗️ היררכיית CSS המלאה

### Level 1: CSS Variables (`:root`)
**קובץ:** `phoenix-base.css` (שורות 28-151)

```css
:root {
  /* Apple Design System Variables */
  --apple-blue, --apple-gray-*, --apple-bg-*, --apple-text-*
  
  /* Typography Variables */
  --font-family-primary, --font-size-*, --font-weight-*
  
  /* Spacing Variables */
  --spacing-xs/sm/md/lg/xl, --apple-spacing-*
  
  /* Border Radius */
  --apple-radius-small/medium/large
  
  /* Header Dimensions (LOD 400) */
  --header-height: 158px
  --header-row1-height: 98px
  --header-row2-height: 60px
  --header-z-index: 950
}
```

**מטרה:** כל המשתנים הגלובליים של המערכת. **אין צורך ב-!important** - משתנים תמיד נגישים.

---

### Level 2: Base Styles (Global Defaults)
**קובץ:** `phoenix-base.css` (שורות 153-378)

#### 2.1 HTML & Body
```css
html {
  direction: rtl;
  lang: he;
}

body {
  background-color: var(--apple-bg-secondary, #F2F2F7);
  color: var(--apple-text-primary, #000000);
  font-family: var(--font-family-primary);
  /* ... */
}
```

#### 2.2 Typography Base
```css
h1, h2, h3, h4, h5, h6 {
  margin: 0;
  padding: 0;
  font-weight: var(--font-weight-semibold, 600);
  /* ... */
}

h1 { font-size: var(--font-size-xxxl, 32px); }
h2 { font-size: var(--font-size-xxl, 24px); }
/* ... */
```

#### 2.3 Form Elements Base (System Defaults)
**מבוסס על הפילטר הראשי בלגסי:**

```css
input:not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button]):not([type=file]):not([type=hidden]),
textarea,
select {
  font-size: 0.9rem;
  font-weight: 300;
  padding: 0.35rem 0.9rem;  /* מינימליסטי - מבוסס על פילטר ראשי */
  border-radius: 5.4px;
  border: 1px solid #ddd;
  direction: rtl;
  text-align: right;
  /* ... */
}
```

#### 2.4 Buttons Base
**מבוסס על legacy `_buttons-base.css`:**

```css
button,
.btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 400;
  border-radius: var(--apple-radius-small, 6px);
  margin-inline-end: 0.5rem;
  /* ... */
}
```

#### 2.5 Form Groups & Labels
**מבוסס על legacy `_forms-base.css`:**

```css
.form-group label {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: var(--apple-spacing-xs, 4px);
  text-align: right;
  direction: rtl;
}
```

**מטרה:** כל ברירות המחדל של המערכת. **אין צורך ב-!important** - זה הבסיס.

---

### Level 3: LEGO System Components
**קובץ:** `phoenix-components.css`

```css
tt-container {
  max-width: var(--container-max-width, 1400px);
  margin-inline: auto;
  padding-inline: var(--grid-gutter, var(--spacing-md));
}

tt-section {
  background: var(--apple-bg-elevated, #ffffff);
  border: 1px solid var(--apple-border-light, #e5e5e5);
  border-radius: 2px;
  margin-block-end: var(--grid-gutter, var(--spacing-md));
  box-shadow: var(--apple-shadow-light);
}

tt-section-row {
  display: flex;
  flex-direction: column;
  gap: var(--grid-gutter, var(--spacing-md));
}
```

**מטרה:** רכיבי LEGO לשימוש בכל המערכת. **אין צורך ב-!important** - custom elements ללא התנגשות.

---

### Level 4: Header Styles (Global Component)
**קובץ:** `phoenix-header.css`

```css
#unified-header {
  height: var(--header-height, 158px);
  z-index: var(--header-z-index, 950);
  /* ... */
}
```

**מטרה:** סגנונות Header שמופיע בכל העמודים. **⚠️ מותר להשתמש ב-!important כאן** - Header חייב להיות סופר יציב.

**הסבר:** Header הוא אלמנט קריטי שצריך להיות יציב לחלוטין. שימוש ב-`!important` כאן מותר ומבוקש כדי להבטיח שהסגנונות לא יידרסו.

---

### Level 5: Context-Specific Overrides
**קובץ:** `D15_IDENTITY_STYLES.css` (לדפי אוטנטיקציה)

```css
body.auth-layout-root {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-grad);
  padding-top: 45px; /* G-Bridge banner */
  padding-inline: var(--spacing-lg, 24px);
  padding-bottom: var(--spacing-lg, 24px);
}

/* Override base input styles for auth pages */
body.auth-layout-root form .form-control,
body.auth-layout-root form input[type="text"],
body.auth-layout-root form input[type="password"] {
  padding: 0.75rem 1rem; /* גדול יותר מברירת המחדל */
  font-size: 1rem;
  border-radius: 8px;
  /* ... */
}
```

**מטרה:** סגנונות ספציפיים לדפי אוטנטיקציה. **אין צורך ב-!important** - משתמשים ב-specificity גבוהה יותר (`body.auth-layout-root form .form-control`).

---

## 📦 סדר טעינת קבצי CSS

**⚠️ קריטי: סדר הטעינה קובע את ההיררכיה!**

### ✅ הסדר הנכון (Mandatory):

```html
<head>
  <!-- 1. Pico CSS Framework (Base Layer) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">
  
  <!-- 2. Phoenix Base Styles (System Defaults) -->
  <link rel="stylesheet" href="./phoenix-base.css">
  
  <!-- 3. Phoenix Components (LEGO System) -->
  <link rel="stylesheet" href="./phoenix-components.css">
  
  <!-- 4. Phoenix Header (if page uses header) -->
  <link rel="stylesheet" href="./phoenix-header.css">
  
  <!-- 5. Page-Specific Styles (Auth, Dashboard, etc.) -->
  <link rel="stylesheet" href="./D15_IDENTITY_STYLES.css">
</head>
```

### 🎯 למה זה חשוב?

1. **Pico CSS ראשון** - מספק את הבסיס הראשוני
2. **phoenix-base.css שני** - דורס את Pico CSS עם ברירות המחדל שלנו (באמצעות specificity)
3. **phoenix-components.css שלישי** - מוסיף רכיבי LEGO
4. **phoenix-header.css רביעי** - סגנונות Header (אם נדרש)
5. **Page-specific אחרון** - דורס עם specificity גבוהה יותר (למשל `body.auth-layout-root form .form-control`)

### ❌ שגיאות נפוצות:

```html
<!-- ❌ שגוי: הקובץ שלנו לפני Pico CSS -->
<link rel="stylesheet" href="./phoenix-base.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">
```

---

## 🚫 חוק !important

### הכלל הכללי:
**אסור להשתמש ב-`!important` ב-CSS של פרויקט פיניקס.**

### חריג יחיד:
**מותר להשתמש ב-`!important` רק ב-`phoenix-header.css`** - Header הוא אלמנט קריטי שצריך להיות סופר יציב.

### למה אסור ב-!important (בכל מקום חוץ מ-Header)?

- מקשה על תחזוקה
- יוצרת קונפליקטים בין סגנונות
- מפריעה להיררכיה הנכונה של CSS
- מקשה על override עתידי

### ✅ הפתרון: Specificity במקום !important

```css
/* ❌ לא נכון */
.form-control {
  padding: 5px 8px !important;
}

/* ✅ נכון: Specificity גבוהה יותר */
body.auth-layout-root form .form-control {
  padding: 5px 8px;
}
```

---

## 📁 קבצי CSS במערכת

### 1. `phoenix-base.css`
**מטרה:** בסיס המערכת - כל ברירות המחדל הגלובליות

**תוכן:**
- CSS Variables (`:root`)
- Base styles ל-html, body, typography
- Base styles ל-inputs, buttons, forms (מבוסס על פילטר ראשי)
- **אין !important**

**מתי לטעון:** תמיד (לכל עמוד)

---

### 2. `phoenix-components.css`
**מטרה:** רכיבי LEGO System (`tt-container`, `tt-section`, `tt-section-row`)

**תוכן:**
- סגנונות לרכיבי LEGO
- **אין !important**

**מתי לטעון:** תמיד (לכל עמוד)

---

### 3. `phoenix-header.css`
**מטרה:** סגנונות Header שמופיע בכל העמודים

**תוכן:**
- סגנונות ל-`#unified-header`
- **⚠️ מותר להשתמש ב-!important כאן** - Header חייב להיות יציב

**מתי לטעון:** רק בדפים עם Header (לא בדפי אוטנטיקציה)

---

### 4. `D15_IDENTITY_STYLES.css`
**מטרה:** סגנונות ספציפיים לדפי אוטנטיקציה (Login, Register, Reset Password)

**תוכן:**
- Overrides ספציפיים עם specificity גבוהה (`body.auth-layout-root form .form-control`)
- **אין !important**

**מתי לטעון:** רק בדפי אוטנטיקציה

---

## 🎯 ברירות מחדל מדויקות

### ✅ מה יש לנו עכשיו:

1. **Inputs/Textarea/Select:**
   - `font-size: 0.9rem`
   - `font-weight: 300`
   - `padding: 0.35rem 0.9rem` (מינימליסטי - מבוסס על פילטר ראשי)
   - `border-radius: 5.4px`
   - `border: 1px solid #ddd`
   - `direction: rtl`
   - `text-align: right`

2. **Buttons:**
   - `padding: 0.375rem 0.75rem`
   - `font-size: 0.875rem`
   - `font-weight: 400`
   - `border-radius: 6px`
   - `margin-inline-end: 0.5rem`

3. **Form Labels:**
   - `font-size: 15px`
   - `font-weight: 500`
   - `margin-bottom: 4px`
   - `text-align: right`
   - `direction: rtl`

4. **Typography:**
   - `h1: 32px`, `h2: 24px`, `h3: 20px`, `h4: 18px`, `h5: 16px`, `h6: 14px`
   - `font-weight: 600` (h1-h3), `500` (h4-h6)

**מקור:** כל הערכים מבוססים על הלגסי (`_forms-base.css`, `_buttons-base.css`, `_typography.css`, פילטר ראשי)

---

## ✅ Best Practices

### 1. Override Base Styles

```css
/* ✅ נכון: Specificity גבוהה יותר */
body.auth-layout-root form .form-control {
  padding: 0.75rem 1rem; /* גדול יותר מברירת המחדל */
}

/* ❌ לא נכון: !important */
.form-control {
  padding: 0.75rem 1rem !important;
}
```

### 2. Context-Specific Styles

```css
/* ✅ נכון: Context class */
body.auth-layout-root .auth-title {
  font-size: 1.25rem;
}

/* ❌ לא נכון: Global override */
.auth-title {
  font-size: 1.25rem;
}
```

### 3. Use CSS Variables

```css
/* ✅ נכון: CSS Variable */
color: var(--apple-text-primary, #000000);

/* ❌ לא נכון: Hardcoded value */
color: #000000;
```

### 4. RTL Compliance

```css
/* ✅ נכון: Logical Properties */
margin-inline-start: var(--spacing-md);
padding-block: var(--spacing-lg);
text-align: start;

/* ❌ לא נכון: Physical Properties */
margin-left: var(--spacing-md);
padding-top: var(--spacing-lg);
text-align: right;
```

---

## 📋 Checklist לפני Commit

- [ ] סדר טעינת קבצי CSS נכון (Pico → Base → Components → Header → Page-specific)
- [ ] אין `!important` (חוץ מ-`phoenix-header.css`)
- [ ] כל ה-overrides משתמשים ב-specificity גבוהה יותר
- [ ] כל הערכים הקשיחים מוחלפים ב-CSS Variables
- [ ] RTL compliance (logical properties)
- [ ] DNA compliance (CSS variables בלבד)

---

## 📊 סטטוס נוכחי

**תאריך:** 2026-01-31  
**גרסה:** v2.0.0  
**סטטוס:** ✅ **BASE SYSTEM COMPLETE & STABLE**

### מה הושלם:
- ✅ בסיס מדויק ויציב לכל ברירות המחדל
- ✅ היררכיית CSS נקייה ומסודרת
- ✅ אין כפילויות מתנגשות
- ✅ חוק !important ברור (מותר רק ב-Header)
- ✅ סדר טעינת קבצים מתועד
- ✅ כל הערכים מבוססים על הלגסי

---

**Prepared by:** Team 30 (Frontend)  
**Last Updated:** 2026-01-31  
**Status:** ✅ **COMPLETE & STABLE**
