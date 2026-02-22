# 👨‍💻 מדריך מפתחים - סטנדרטי CSS (Phoenix V2)
**project_domain:** TIKTRACK

**Status:** ✅ ACTIVE GUIDE  
**Version:** v1.0.0  
**Date:** 2026-01-31  
**Team:** Team 31 (Blueprint)

---

## 📋 תקציר

מדריך זה מספק הוראות מעשיות למפתחים לפיתוח CSS בפרויקט פיניקס V2. כל דוגמה כאן היא **חובה** ויש לעמוד בה.

---

## 🚀 התחלה מהירה

### שלב 1: הכרת המבנה

```html
<!-- סדר טעינת CSS - קדוש! -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">
<link rel="stylesheet" href="./phoenix-base.css">
<link rel="stylesheet" href="./phoenix-components.css">
<link rel="stylesheet" href="./phoenix-header.css">
<link rel="stylesheet" href="./D15_PAGE_STYLES.css"> <!-- רק אם נדרש -->
```

### שלב 2: שימוש ב-LEGO Components

```html
<!-- ✅ נכון - LEGO Components -->
<tt-container>
  <tt-section>
    <tt-section-row>
      <!-- התוכן שלך כאן -->
    </tt-section-row>
  </tt-section>
</tt-container>

<!-- ❌ לא נכון - divs רגילים -->
<div class="container">
  <div class="section">
    <div class="row">
      <!-- לא להשתמש! -->
    </div>
  </div>
</div>
```

---

## 📝 דוגמאות מעשיות

### דוגמה 1: יצירת כפתור עם BEM

#### HTML:
```html
<button class="auth-form__button auth-form__button--primary">
  התחבר
</button>
```

#### CSS:
```css
/* ============================================
   Block: Auth Form Button
   Purpose: Base button styles for auth forms
   ============================================ */

/* Block Element */
.auth-form__button {
  /* Spacing - DNA multiples only */
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  
  /* Typography - CSS variables */
  font-size: var(--font-size-base, 0.92rem);
  font-weight: 500;
  
  /* Colors - CSS variables */
  background: transparent;
  color: var(--apple-text-primary, #1d1d1f);
  
  /* Borders */
  border: 1px solid var(--apple-border-light, #e5e5e5);
  border-radius: 4px;
  
  /* Interactions */
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

/* Modifier: Primary */
.auth-form__button--primary {
  background: var(--header-brand, #26baac);
  color: white;
  border-color: var(--header-brand, #26baac);
}

.auth-form__button--primary:hover {
  background: var(--header-brand-hover, #20a89a);
  border-color: var(--header-brand-hover, #20a89a);
}

.auth-form__button--primary:focus {
  outline: 2px solid var(--header-brand, #26baac);
  outline-offset: 2px;
}

.auth-form__button--primary:active {
  background: var(--header-brand-active, #1a9688);
}

.auth-form__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

### דוגמה 2: יצירת כותרת עם Fluid Typography

#### HTML:
```html
<section class="hero">
  <h1 class="hero__title">ברוכים הבאים ל-Phoenix</h1>
  <p class="hero__text">המערכת החדשה לניהול מסחר</p>
</section>
```

#### CSS:
```css
/* ============================================
   Component: Hero Section
   Purpose: Landing page hero with fluid typography
   ============================================ */

.hero {
  padding-block: var(--spacing-xl, 32px);
  text-align: center;
}

.hero__title {
  /* Fluid Typography - clamp() */
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  line-height: 1.2;
  margin-block-end: var(--spacing-lg, 24px);
  color: var(--apple-text-primary, #1d1d1f);
}

.hero__text {
  /* Fluid Typography */
  font-size: clamp(0.875rem, 2vw, 1rem);
  line-height: 1.6;
  margin-block-end: var(--spacing-md, 16px);
  color: var(--apple-text-secondary, #86868b);
}
```

---

### דוגמה 3: יצירת Grid עם Container Queries

#### HTML:
```html
<tt-container>
  <tt-section>
    <div class="card-grid">
      <div class="card-grid__item">
        <div class="card">כרטיס 1</div>
      </div>
      <div class="card-grid__item">
        <div class="card">כרטיס 2</div>
      </div>
      <div class="card-grid__item">
        <div class="card">כרטיס 3</div>
      </div>
    </div>
  </tt-section>
</tt-container>
```

#### CSS:
```css
/* ============================================
   Component: Card Grid
   Purpose: Responsive grid using container queries
   ============================================ */

.card-grid {
  /* Container Query Setup */
  container-type: inline-size;
  container-name: card-grid;
  
  /* Grid Layout */
  display: grid;
  gap: var(--spacing-md, 16px);
  grid-template-columns: 1fr;
}

/* Container Query: Medium */
@container card-grid (min-width: 500px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Container Query: Large */
@container card-grid (min-width: 800px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.card-grid__item {
  /* Spacing */
  padding: var(--spacing-md, 16px);
}

.card {
  background: var(--apple-bg-elevated, #ffffff);
  border: 1px solid var(--apple-border-light, #e5e5e5);
  border-radius: 8px;
  padding: var(--spacing-lg, 24px);
}
```

---

### דוגמה 4: יצירת Form עם BEM

#### HTML:
```html
<form class="contact-form">
  <div class="contact-form__group">
    <label class="contact-form__label" for="name">שם:</label>
    <input 
      type="text" 
      id="name" 
      class="contact-form__input" 
      required 
    />
  </div>
  
  <div class="contact-form__group">
    <label class="contact-form__label" for="email">אימייל:</label>
    <input 
      type="email" 
      id="email" 
      class="contact-form__input contact-form__input--error" 
      required 
    />
    <span class="contact-form__error">אימייל לא תקין</span>
  </div>
  
  <button 
    type="submit" 
    class="contact-form__button contact-form__button--primary"
  >
    שלח
  </button>
</form>
```

#### CSS:
```css
/* ============================================
   Block: Contact Form
   Purpose: Contact form with validation states
   ============================================ */

.contact-form {
  max-width: 500px;
  margin-inline: auto;
}

.contact-form__group {
  margin-block-end: var(--spacing-md, 16px);
}

.contact-form__label {
  display: block;
  margin-block-end: var(--spacing-xs, 8px);
  font-size: var(--font-size-base, 0.92rem);
  font-weight: 500;
  color: var(--apple-text-primary, #1d1d1f);
}

.contact-form__input {
  width: 100%;
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  border: 1px solid var(--apple-border-light, #e5e5e5);
  border-radius: 4px;
  font-size: var(--font-size-base, 0.92rem);
  transition: border-color 0.2s ease;
}

.contact-form__input:focus {
  outline: none;
  border-color: var(--header-brand, #26baac);
}

/* Modifier: Error State */
.contact-form__input--error {
  border-color: var(--apple-red, #dc2626);
}

.contact-form__error {
  display: block;
  margin-block-start: var(--spacing-xs, 8px);
  font-size: 0.875rem;
  color: var(--apple-red, #dc2626);
}

.contact-form__button {
  /* Base button styles - reuse from example 1 */
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  font-size: var(--font-size-base, 0.92rem);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.contact-form__button--primary {
  background: var(--header-brand, #26baac);
  color: white;
}

.contact-form__button--primary:hover {
  background: var(--header-brand-hover, #20a89a);
}
```

---

## ⚠️ טעויות נפוצות - מה לא לעשות

### ❌ טעות 1: שימוש במאפיינים פיזיים

```css
/* ❌ לא נכון */
.menu {
  margin-left: 20px;
  padding-right: 10px;
  float: left;
}

/* ✅ נכון */
.menu {
  margin-inline-start: 20px;
  padding-inline-end: 10px;
  float: inline-start;
}
```

---

### ❌ טעות 2: צבעים ישירים

```css
/* ❌ לא נכון */
.button {
  color: #ff0000;
  background: rgb(255, 0, 0);
}

/* ✅ נכון */
.button {
  color: var(--apple-red, #dc2626);
  background: var(--header-brand, #26baac);
}
```

---

### ❌ טעות 3: Z-Index ישיר

```css
/* ❌ לא נכון */
.modal {
  z-index: 9999;
}

/* ✅ נכון */
.modal {
  z-index: var(--z-index-modal, 1000);
}
```

---

### ❌ טעות 4: Magic Numbers

```css
/* ❌ לא נכון */
.card {
  margin-top: 13px;
  padding: 7px;
}

/* ✅ נכון */
.card {
  margin-block-start: var(--spacing-md, 16px); /* 8px * 2 */
  padding: var(--spacing-sm, 8px); /* 8px * 1 */
}
```

---

### ❌ טעות 5: Longhand במקום Shorthand

```css
/* ❌ לא נכון */
.element {
  margin-top: 10px;
  margin-right: 20px;
  margin-bottom: 10px;
  margin-left: 20px;
}

/* ✅ נכון */
.element {
  margin-block: 10px;
  margin-inline: 20px;
}
```

---

### ❌ טעות 6: Media Queries במקום Container Queries

```css
/* ❌ לא נכון */
.card {
  width: 100%;
}
@media (min-width: 768px) {
  .card {
    width: 50%;
  }
}

/* ✅ נכון */
.card-container {
  container-type: inline-size;
}

.card {
  width: 100%;
}

@container (min-width: 500px) {
  .card {
    width: 50%;
  }
}
```

---

## ✅ רשימת בדיקות לפני הגשה

### לפני כל commit:

- [ ] הרצת G-Bridge: `node "HOENIX G-BRIDGE.js" [file_name.html]`
- [ ] כל הבדיקות עברו (✅ PASSED)
- [ ] אין מאפיינים פיזיים (margin-left, padding-right, וכו')
- [ ] כל הצבעים דרך משתנים (var(--...))
- [ ] כל Z-Index דרך משתנים (var(--z-index-...))
- [ ] כל הריווחים כפולות של 8px
- [ ] שימוש ב-CSS shorthand (margin-block/inline)
- [ ] שימוש ב-LEGO Components (tt-container, tt-section)
- [ ] תגובות LOD 400 לכל בלוק קוד גדול
- [ ] בדיקה ויזואלית מול Legacy (0 פיקסל סטייה)

---

## 📚 משאבים נוספים

- `TT2_CSS_STANDARDS_PROTOCOL.md` - הפרוטוקול המלא
- `CSS_ARCHITECTURE_HIERARCHY.md` - היררכיית קבצי CSS
- `STANDARD_PAGE_BUILD_WORKFLOW.md` - תהליך בניית עמודים

---

**Last Updated:** 2026-01-31  
**Maintained By:** Team 31 (Blueprint)
