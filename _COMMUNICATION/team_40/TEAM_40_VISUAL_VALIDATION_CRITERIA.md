# 📋 קריטריוני בדיקת קוד | Team 40

**From:** Team 40 (UI Assets & Design) - "שומרי ה-DNA"  
**To:** Team 30 (Frontend), Team 10 (The Gateway)  
**Date:** 2026-02-02  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** CODE_VALIDATION_CRITERIA | Status: 🛡️ **MANDATORY**  
**Purpose:** קריטריוני בדיקת קוד לולידציה של Components  
**Version:** v1.2 (עודכן עם Batch 1 Closure & חוקי ברזל)

---

## 🎯 מטרה

מסמך זה מגדיר את הקריטריונים לבדיקת קוד של Components ש-Team 30 יוצר בשלב 2.5.

**שיטות בדיקה:**
1. **השוואה לבלופרינט** - השוואת מבנה JSX לבלופרינט HTML
2. **בדיקת קוד סטטית** - בדיקת CSS classes, CSS Variables, ARIA attributes
3. **בדיקת מבנה** - בדיקת LEGO components, BEM naming, ITCSS hierarchy
4. **בדיקת קונסולה** - זיהוי שגיאות JavaScript/React
5. **בדיקת Fluid Design** - בדיקת רספונסיביות אוטומטית (clamp, min, max)
6. **בדיקת Clean Slate Rule** - בדיקת איסור inline scripts ו-event handlers

**כל Component חייב לעבור בדיקה זו לפני אישור סופי.**

**עדכון:** 2026-02-02 - הוספת קריטריונים חדשים לפי Final Governance Lock

---

## 📋 קטגוריות בדיקה

### **1. Design Tokens Fidelity** 🔴 **CRITICAL**

#### **1.1 CSS Variables Usage**
- ✅ **חובה:** שימוש ב-CSS Variables מ-`phoenix-base.css` בלבד
- ❌ **אסור:** ערכים hardcoded (צבעים, ריווחים, וכו')
- ❌ **אסור:** Inline styles (`style={{ ... }}`)
- ✅ **מותר:** CSS Variables בלבד
- ✅ **מותר:** CSS Classes בלבד

**דוגמאות:**
```css
/* ✅ נכון */
color: var(--color-brand);
padding: var(--spacing-md);
border-radius: var(--apple-radius-medium);

/* ❌ שגוי */
color: #26baac;
padding: 16px;
border-radius: 10px;
```

```jsx
/* ✅ נכון - CSS Classes */
<div className="phoenix-button phoenix-button--primary">
  Click me
</div>

/* ❌ שגוי - Inline styles */
<div style={{ color: '#1d1d1f', background: '#ffffff' }}>
  Click me
</div>
```

**בדיקה:**
```bash
# חיפוש inline styles
grep -r "style=\{" ui/src/cubes/identity/components/
```

#### **1.2 Palette Spec Compliance**
- ✅ **חובה:** עמידה ב-`TT2_MASTER_PALETTE_SPEC.md`
- ✅ **חובה:** שימוש בצבעים מהפלטה בלבד
- ❌ **אסור:** ערכי צבע hardcoded (`#ffffff`, `rgb()`, `rgba()`)
- ✅ **חובה:** כל הצבעים דרך CSS Variables בלבד

**בדיקה:**
```bash
# חיפוש ערכי צבע hardcoded
grep -r "#[0-9a-fA-F]\{3,6\}\|rgb(\|rgba(" ui/src/cubes/identity/components/
```
- ❌ **אסור:** צבעים חדשים שלא בפלטה

**צבעים מותרים:**
- Primary: `var(--color-brand)` / `#26baac`
- Secondary: `var(--color-secondary)` / `#fc5a06`
- Error: `var(--color-error)` / `#ef4444`
- Success: `var(--color-success)` / `#10b981`
- Warning: `var(--color-warning)` / `#f59e0b`
- Neutral Scale: `var(--color-1)` עד `var(--color-50)`

#### **1.3 Typography**
- ✅ **חובה:** שימוש ב-CSS Variables לטקסט
- ✅ **חובה:** עמידה ב-Font Family (`var(--font-main)`)
- ✅ **חובה:** עמידה ב-Font Sizes (`var(--font-size-base)`, וכו')

**דוגמאות:**
```css
/* ✅ נכון */
font-family: var(--font-main);
font-size: var(--font-size-base);
font-weight: var(--font-weight-medium);

/* ❌ שגוי */
font-family: 'Arial', sans-serif;
font-size: 16px;
font-weight: 500;
```

#### **1.4 Spacing**
- ✅ **חובה:** שימוש ב-CSS Variables לריווחים
- ✅ **חובה:** עמידה ב-Spacing Scale (`var(--spacing-xs)` עד `var(--spacing-24)`)

**דוגמאות:**
```css
/* ✅ נכון */
margin: var(--spacing-md);
padding: var(--spacing-lg);

/* ❌ שגוי */
margin: 16px;
padding: 24px;
```

#### **1.5 Shadows**
- ✅ **חובה:** שימוש ב-CSS Variables לצללים
- ✅ **חובה:** עמידה ב-Shadow Scale (`var(--shadow-sm)`, וכו')

**דוגמאות:**
```css
/* ✅ נכון */
box-shadow: var(--shadow-sm);
box-shadow: var(--shadow-md);

/* ❌ שגוי */
box-shadow: 0 1px 3px rgba(0,0,0,0.1);
```

#### **1.6 Border Radius**
- ✅ **חובה:** שימוש ב-CSS Variables ל-Border Radius
- ✅ **חובה:** עמידה ב-Radius Scale (`var(--radius-sm)`, וכו')

**דוגמאות:**
```css
/* ✅ נכון */
border-radius: var(--apple-radius-small);
border-radius: var(--radius-md);

/* ❌ שגוי */
border-radius: 6px;
border-radius: 10px;
```

---

### **2. CSS Classes Compliance** 🔴 **CRITICAL**

#### **2.1 CSS Classes Usage**
- ✅ **חובה:** שימוש במחלקות מ-`CSS_CLASSES_INDEX.md`
- ✅ **חובה:** שימוש חוזר במחלקות קיימות
- ❌ **אסור:** יצירת מחלקות חדשות ללא בדיקה

**דוגמאות:**
```jsx
/* ✅ נכון - שימוש במחלקות קיימות */
<div className="auth-header">
  <h1 className="auth-title">התחברות</h1>
</div>

/* ❌ שגוי - מחלקה חדשה ללא צורך */
<div className="login-header">
  <h1 className="login-title">התחברות</h1>
</div>
```

#### **2.2 BEM Naming Convention**
- ✅ **חובה:** עמידה ב-BEM Naming (`block__element--modifier`)
- ✅ **חובה:** שימוש ב-BEM לכל מחלקות חדשות

**דוגמאות:**
```css
/* ✅ נכון */
.auth-form__error
.auth-form__error--hidden
.auth-form__input--error

/* ❌ שגוי */
.auth-form-error
.auth-form-error-hidden
.auth-form-input-error
```

#### **2.3 No Duplicate Classes**
- ✅ **חובה:** מניעת מחלקות כפולות
- ✅ **חובה:** בדיקה ב-`CSS_CLASSES_INDEX.md` לפני יצירת מחלקה חדשה

---

### **3. RTL Compliance** 🔴 **CRITICAL**

#### **3.1 Direction**
- ✅ **חובה:** `direction: rtl` על אלמנטים רלוונטיים
- ✅ **חובה:** RTL על כל עמודי Auth

**דוגמאות:**
```css
/* ✅ נכון */
.auth-layout-root {
  direction: rtl;
}

/* ❌ שגוי */
.auth-layout-root {
  direction: ltr;
}
```

#### **3.2 Logical Properties**
- ✅ **חובה:** שימוש ב-Logical Properties (`margin-inline`, `padding-inline`)
- ❌ **אסור:** שימוש ב-`margin-left`/`margin-right`

**דוגמאות:**
```css
/* ✅ נכון */
margin-inline: var(--spacing-md);
padding-inline: var(--spacing-lg);

/* ❌ שגוי */
margin-left: var(--spacing-md);
padding-right: var(--spacing-lg);
```

#### **3.3 Text Alignment**
- ✅ **חובה:** `text-align: right` או `text-align: center` (לא `left`)
- ✅ **חובה:** עמידה ב-RTL Charter

---

### **4. Accessibility (ARIA)** 🟡 **IMPORTANT**

#### **4.1 Role Attributes**
- ✅ **חובה:** `role` attributes על אלמנטים אינטראקטיביים
- ✅ **חובה:** `role="alert"` על הודעות שגיאה
- ✅ **חובה:** `role="button"` על אלמנטים שנראים כמו כפתורים

**דוגמאות:**
```jsx
/* ✅ נכון */
<div className="auth-form__error" role="alert">
  שגיאה בהתחברות
</div>

<button role="button" className="btn-auth-primary">
  התחבר
</button>
```

#### **4.2 ARIA Labels**
- ✅ **חובה:** `aria-label` או `aria-labelledby` על אלמנטים ללא טקסט גלוי
- ✅ **חובה:** `aria-label` על כפתורים עם איקונים בלבד

**דוגמאות:**
```jsx
/* ✅ נכון */
<button aria-label="סגור" className="close-btn">
  <span className="icon-close"></span>
</button>

<input 
  type="text" 
  aria-label="שם משתמש"
  className="form-control"
/>
```

#### **4.3 ARIA Live Regions**
- ✅ **חובה:** `aria-live="polite"` על הודעות שגיאה
- ✅ **חובה:** `aria-hidden="true"` על אלמנטים מוסתרים

**דוגמאות:**
```jsx
/* ✅ נכון */
<div 
  className="auth-form__error" 
  role="alert"
  aria-live="polite"
  aria-hidden={!error}
>
  {error}
</div>
```

#### **4.4 Keyboard Navigation**
- ✅ **חובה:** כל האלמנטים האינטראקטיביים נגישים דרך מקלדת
- ✅ **חובה:** `tabindex` נכון על אלמנטים מותאמים אישית

---

### **5. ITCSS Hierarchy** 🟡 **IMPORTANT**

#### **5.1 LEGO Components Usage**
- ✅ **חובה:** שימוש ב-LEGO Components (`tt-container`, `tt-section`, `tt-section-row`)
- ✅ **חובה:** עמידה במבנה LEGO System

**דוגמאות:**
```jsx
/* ✅ נכון */
<tt-container>
  <tt-section>
    <div className="auth-header">...</div>
  </tt-section>
</tt-container>

/* ❌ שגוי */
<div className="container">
  <div className="section">
    <div className="auth-header">...</div>
  </div>
</div>
```

#### **5.2 ITCSS Layers Compliance**
- ✅ **חובה:** עמידה ב-ITCSS Layers
- ✅ **חובה:** שימוש ב-Components Layer (לא Elements או Objects)

**ITCSS Layers:**
1. **Settings:** CSS Variables (phoenix-base.css)
2. **Generic:** Reset & Base (Pico CSS + phoenix-base.css)
3. **Elements:** HTML Elements (phoenix-base.css)
4. **Objects:** LEGO Components (phoenix-components.css)
5. **Components:** Page-specific Components (D15_IDENTITY_STYLES.css, וכו')
6. **Trumps:** Overrides (if needed)

#### **5.3 Specificity Hierarchy**
- ✅ **חובה:** עמידה ב-Specificity Hierarchy
- ✅ **חובה:** לא להשתמש ב-`!important` ללא צורך

---

## 🔍 שיטות בדיקה

### **1. השוואה לבלופרינט** 🔴 **CRITICAL**

#### **1.1 מבנה HTML/JSX**
- ✅ **חובה:** השוואת מבנה JSX לבלופרינט HTML
- ✅ **חובה:** אותן מחלקות CSS
- ✅ **חובה:** אותו סדר אלמנטים
- ✅ **חובה:** אותן תכונות HTML (type, required, placeholder, וכו')

**דוגמה:**
```html
<!-- בלופרינט (D15_LOGIN.html) -->
<form>
  <div class="form-group">
    <label class="form-label">שם משתמש / אימייל:</label>
    <input type="text" class="form-control" required placeholder="הכנס שם משתמש">
  </div>
</form>

<!-- Component (LoginForm.jsx) - צריך להתאים -->
<form>
  <div className="form-group">
    <label className="form-label">שם משתמש / אימייל:</label>
    <input type="text" className="form-control" required placeholder="הכנס שם משתמש" />
  </div>
</form>
```

#### **1.2 LEGO Components Structure**
- ✅ **חובה:** אותו מבנה LEGO (`tt-container` > `tt-section`)
- ✅ **חובה:** אותן מחלקות CSS
- ✅ **חובה:** אותו סדר אלמנטים

**דוגמה:**
```html
<!-- בלופרינט -->
<tt-container>
  <tt-section>
    <div class="auth-header">...</div>
  </tt-section>
</tt-container>

<!-- Component - צריך להתאים -->
<tt-container>
  <tt-section>
    <div className="auth-header">...</div>
  </tt-section>
</tt-container>
```

#### **1.3 Text Content**
- ✅ **חובה:** אותו טקסט כמו בבלופרינט
- ✅ **חובה:** אותן כותרות
- ✅ **חובה:** אותן הודעות שגיאה

---

### **2. בדיקת קוד סטטית** 🔴 **CRITICAL**

#### **2.1 CSS Classes**
- ✅ **חובה:** שימוש במחלקות מ-`CSS_CLASSES_INDEX.md`
- ✅ **חובה:** אותן מחלקות כמו בבלופרינט
- ❌ **אסור:** מחלקות חדשות ללא צורך

**בדיקה:**
```bash
# חיפוש מחלקות בקוד
grep -r "className=" ui/src/cubes/identity/components/AuthForm.jsx
# השוואה לבלופרינט
grep -r "class=" _COMMUNICATION/team_31/team_31_staging/D15_LOGIN.html
```

#### **2.2 CSS Variables**
- ✅ **חובה:** שימוש ב-CSS Variables מ-`phoenix-base.css` בלבד
- ❌ **אסור:** ערכים hardcoded

**בדיקה:**
```bash
# חיפוש ערכים hardcoded
grep -r "#[0-9a-fA-F]\{6\}" ui/src/cubes/identity/components/
grep -r "[0-9]\+px" ui/src/cubes/identity/components/
```

#### **2.3 ARIA Attributes**
- ✅ **חובה:** `role`, `aria-label`, `aria-live` כמו בבלופרינט (אם קיים)
- ✅ **חובה:** Accessibility attributes על אלמנטים אינטראקטיביים

**בדיקה:**
```bash
# חיפוש ARIA attributes
grep -r "aria-" ui/src/cubes/identity/components/
grep -r "role=" ui/src/cubes/identity/components/
```

---

### **3. בדיקת מבנה** 🟡 **IMPORTANT**

#### **3.1 LEGO Components**
- ✅ **חובה:** שימוש ב-LEGO Components (`tt-container`, `tt-section`)
- ✅ **חובה:** מבנה נכון

**בדיקה:**
```bash
# חיפוש LEGO components
grep -r "tt-container\|tt-section\|tt-section-row" ui/src/cubes/identity/components/
```

#### **3.2 BEM Naming**
- ✅ **חובה:** עמידה ב-BEM Naming (`block__element--modifier`)
- ✅ **חובה:** שימוש במחלקות מ-`CSS_CLASSES_INDEX.md`

**בדיקה:**
```bash
# חיפוש מחלקות BEM
grep -r "className=\"[a-z-]*__[a-z-]*" ui/src/cubes/identity/components/
```

#### **3.3 ITCSS Hierarchy**
- ✅ **חובה:** עמידה ב-ITCSS Layers
- ✅ **חובה:** שימוש ב-Components Layer (לא Elements או Objects)

---

### **4. בדיקת קונסולה** 🟡 **IMPORTANT**

#### **4.1 JavaScript Errors**
- ✅ **חובה:** אין שגיאות JavaScript בקונסולה
- ✅ **חובה:** אין שגיאות React warnings

**בדיקה:**
```bash
# הרצת בדיקות (אם קיימות)
npm test
# או בדיקה ידנית בקונסולה של הדפדפן
```

#### **4.2 Console Warnings**
- ✅ **חובה:** אין warnings מיותרים בקונסולה
- ⚠️ **מותר:** warnings מ-React DevTools (אם לא קריטיים)

---

### **5. בדיקת Fluid Design (רספונסיביות אוטומטית)** 🔴 **CRITICAL - NEW**

#### **5.1 איסור Media Queries**
- ❌ **אסור:** Media Queries עבור גדלי פונטים וריווחים
- ✅ **חובה:** שימוש בלעדי ב-`clamp()`, `min()`, `max()`

**בדיקה:**
```bash
# חיפוש media queries בקוד
grep -r "@media" ui/src/cubes/identity/components/
grep -r "@media" ui/src/styles/
```

**דוגמאות:**
```css
/* ❌ לא נכון - media query */
@media (max-width: 768px) {
  font-size: 14px;
}

/* ✅ נכון - Fluid Design */
font-size: clamp(14px, 2vw + 0.5rem, 18px);
```

#### **5.2 Typography Fluid**
- ✅ **חובה:** שימוש ב-`clamp()` לגדלי פונטים
- ✅ **חובה:** CSS Variables עם `clamp()` ב-`phoenix-base.css`

**בדיקה:**
```bash
# חיפוש font-size ללא clamp
grep -r "font-size:" ui/src/cubes/identity/components/ | grep -v "clamp"
```

#### **5.3 Spacing Fluid**
- ✅ **חובה:** שימוש ב-`clamp()` ל-Margins ו-Paddings
- ✅ **חובה:** CSS Variables עם `clamp()` ב-`phoenix-base.css`

**בדיקה:**
```bash
# חיפוש padding/margin ללא clamp
grep -r "padding:\|margin:" ui/src/cubes/identity/components/ | grep -v "clamp\|var("
```

#### **5.4 Grid Fluid**
- ✅ **חובה:** שימוש ב-Grid עם `auto-fit` / `auto-fill`
- ✅ **חובה:** `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`

**בדיקה:**
```bash
# חיפוש grid ללא auto-fit/auto-fill
grep -r "grid-template-columns" ui/src/cubes/identity/components/
```

---

### **6. בדיקת Clean Slate Rule (משמעת סקריפטים)** 🔴 **CRITICAL - RETROACTIVE - NEW**

#### **6.1 איסור תגי `<script>` בתוך HTML/JSX**
- ❌ **אסור:** תגי `<script>` בתוך קבצי HTML או JSX
- ✅ **מותר:** רק `<script src="...">` בסוף `<body>` (לפני G-Bridge)

**בדיקה:**
```bash
# חיפוש תגי script בתוך JSX
grep -r "<script" ui/src/cubes/identity/components/
grep -r "</script>" ui/src/cubes/identity/components/
```

**דוגמאות:**
```jsx
/* ❌ לא נכון - inline script */
<script>
  function handleLogin() {
    // לוגיקה...
  }
</script>

/* ✅ נכון - script חיצוני */
<script src="./cubes/identity/scripts/auth-login.js"></script>
```

#### **6.2 איסור Event Handlers Inline**
- ❌ **אסור:** `onclick`, `onchange`, `onsubmit`, `oninput`, וכו'
- ✅ **חובה:** שימוש ב-`js-` prefixed classes + event listeners בקבצים חיצוניים

**בדיקה:**
```bash
# חיפוש event handlers inline
grep -r "onclick=\|onchange=\|onsubmit=\|oninput=" ui/src/cubes/identity/components/
```

**דוגמאות:**
```jsx
/* ❌ לא נכון - inline handler */
<button onClick={handleLogin}>התחבר</button>

/* ✅ נכון - js- prefixed class */
<button className="js-login-submit">התחבר</button>
```

#### **6.3 מבנה קבצי Scripts**
- ✅ **חובה:** כל הלוגיקה בקבצים חיצוניים ב-`cubes/{cube-name}/scripts/`
- ✅ **חובה:** שימוש ב-`js-` prefixed classes
- ✅ **חובה:** עמידה ב-`TT2_JS_STANDARDS_PROTOCOL.md`

**בדיקה:**
```bash
# בדיקת מבנה תיקיות scripts
ls -la ui/src/cubes/identity/scripts/
```

**מבנה נדרש:**
```
cubes/identity/scripts/
├── auth-login.js
├── auth-register.js
├── auth-reset-password.js
├── auth-profile.js
└── auth-common.js
```

---

## 📊 טופס בדיקה

**Component Name:** _______________  
**Cube:** _______________ (Identity/Financial)  
**Blueprint:** _______________ (D15_LOGIN.html, וכו')  
**Created by:** Team 30  
**Date:** _______________  
**Checked by:** Team 40  
**Check Date:** _______________

### **1. השוואה לבלופרינט:**
- [ ] ✅ מבנה JSX תואם לבלופרינט HTML
- [ ] ✅ אותן מחלקות CSS כמו בבלופרינט
- [ ] ✅ אותו סדר אלמנטים כמו בבלופרינט
- [ ] ✅ אותן תכונות HTML (type, required, placeholder)
- [ ] ✅ אותו טקסט כמו בבלופרינט
- [ ] ✅ מבנה LEGO Components תואם (`tt-container` > `tt-section`)

**השוואה:**
- בלופרינט: `_COMMUNICATION/team_31/team_31_staging/D15_LOGIN.html`
- Component: `ui/src/cubes/identity/components/AuthForm.jsx`
- הבדלים: _______________

**הערות:** _______________

### **2. בדיקת קוד סטטית:**
- [ ] ✅ משתמש במחלקות מ-`CSS_CLASSES_INDEX.md`
- [ ] ✅ משתמש ב-CSS Variables מ-`phoenix-base.css` בלבד
- [ ] ✅ אין ערכים hardcoded (צבעים, ריווחים)
- [ ] ✅ אין inline styles (`style={{ ... }}`)
- [ ] ✅ ARIA attributes נכונים (`role`, `aria-label`, `aria-live`)
- [ ] ✅ עומד ב-BEM Naming Convention
- [ ] ✅ אין מחלקות כפולות

**בדיקות שבוצעו:**
- [ ] חיפוש ערכים hardcoded: _______________
- [ ] חיפוש inline styles: _______________
- [ ] חיפוש מחלקות CSS: _______________
- [ ] חיפוש ARIA attributes: _______________

**הערות:** _______________

### **3. בדיקת מבנה:**
- [ ] ✅ משתמש ב-LEGO Components (`tt-container`, `tt-section`, `tt-section-row`)
- [ ] ✅ עומד ב-ITCSS Layers
- [ ] ✅ `direction: rtl` נכון
- [ ] ✅ Logical Properties נכונים (`margin-inline`, `padding-inline`)
- [ ] ✅ עמידה במבנה LEGO System

**בדיקות שבוצעו:**
- [ ] חיפוש LEGO components: _______________
- [ ] חיפוש BEM naming: _______________

**הערות:** _______________

### **4. בדיקת קונסולה:**
- [ ] ✅ אין שגיאות JavaScript בקונסולה
- [ ] ✅ אין שגיאות React warnings
- [ ] ✅ אין warnings מיותרים

**בדיקות שבוצעו:**
- [ ] בדיקת קונסולה: _______________
- [ ] בדיקת React DevTools: _______________

**הערות:** _______________

### **5. בדיקת Fluid Design (רספונסיביות אוטומטית):** 🔴 **CRITICAL - NEW**
- [ ] ✅ אין Media Queries עבור גדלי פונטים וריווחים
- [ ] ✅ שימוש ב-`clamp()` לגדלי פונטים
- [ ] ✅ שימוש ב-`clamp()` ל-Margins ו-Paddings
- [ ] ✅ שימוש ב-Grid עם `auto-fit` / `auto-fill` (אם רלוונטי)

**בדיקות שבוצעו:**
- [ ] חיפוש media queries: _______________
- [ ] חיפוש font-size ללא clamp: _______________
- [ ] חיפוש padding/margin ללא clamp: _______________

**הערות:** _______________

### **6. בדיקת Clean Slate Rule (משמעת סקריפטים):** 🔴 **CRITICAL - RETROACTIVE - NEW**
- [ ] ✅ אין תגי `<script>` בתוך HTML/JSX
- [ ] ✅ אין event handlers inline (`onclick`, `onchange`, `onsubmit`, וכו')
- [ ] ✅ כל הלוגיקה בקבצים חיצוניים ב-`cubes/{cube-name}/scripts/`
- [ ] ✅ שימוש ב-`js-` prefixed classes

**בדיקות שבוצעו:**
- [ ] חיפוש תגי script: _______________
- [ ] חיפוש event handlers inline: _______________
- [ ] בדיקת מבנה תיקיות scripts: _______________

**הערות:** _______________

---

## ✅ תוצאה

**תוצאה:** [ ] ✅ **מאושר** | [ ] ⚠️ **נדרשים תיקונים** | [ ] ❌ **נדחה**

**סיכום בדיקות:**
- השוואה לבלופרינט: [ ] ✅ תואם | [ ] ⚠️ הבדלים | [ ] ❌ לא תואם
- בדיקת קוד סטטית: [ ] ✅ תקין | [ ] ⚠️ בעיות | [ ] ❌ שגיאות
- בדיקת מבנה: [ ] ✅ תקין | [ ] ⚠️ בעיות | [ ] ❌ שגיאות
- בדיקת קונסולה: [ ] ✅ תקין | [ ] ⚠️ warnings | [ ] ❌ שגיאות
- בדיקת Fluid Design: [ ] ✅ תקין | [ ] ⚠️ media queries נמצאו | [ ] ❌ שגיאות 🔴 **NEW**
- בדיקת Clean Slate Rule: [ ] ✅ תקין | [ ] ⚠️ inline scripts/handlers נמצאו | [ ] ❌ שגיאות 🔴 **RETROACTIVE - NEW**

**הערות כלליות:** _______________

**תיקונים נדרשים:**
1. _______________
2. _______________
3. _______________

**קבצים שנבדקו:**
- בלופרינט: `_COMMUNICATION/team_31/team_31_staging/[BLUEPRINT].html`
- Component: `ui/src/cubes/[CUBE]/components/[COMPONENT].jsx`

---

## 🎨 ולידציה סופית (The Visionary)

**לאחר שכל הבדיקות של Team 40 עוברות:**

### **שלב ולידציה סופית:**
- ✅ Team 40 מעביר Component ל-The Visionary (Nimrod Wald)
- ✅ The Visionary בודק ויזואלית בדפדפן
- ✅ The Visionary מאשר/מבקש תיקונים
- ✅ Team 30 מתקן לפי הערות (אם נדרש)
- ✅ חזרה לשלב ולידציה עד אישור סופי

**תוצאה סופית:**
- [ ] ✅ **מאושר על ידי The Visionary** - Component מוכן לשימוש
- [ ] ⚠️ **נדרשים תיקונים** - חזרה ל-Team 30
- [ ] ❌ **נדחה** - חזרה ל-Team 30 עם הערות

**הערות The Visionary:** _______________

---

## 🔄 תהליך עבודה

### **שלב 1: קבלת Component**
- Team 30 יוצר Component
- Team 30 שולח ל-Team 40 לבדיקה עם:
  - קישור לקובץ Component
  - קישור לבלופרינט הרלוונטי
  - קישור ל-preview/דמו (אם קיים)

### **שלב 2: בדיקת קוד**
- Team 40 מבצע בדיקות:
  1. **השוואה לבלופרינט** - קריאת HTML בלופרינט והשוואה ל-JSX
  2. **בדיקת קוד סטטית** - חיפוש CSS classes, CSS Variables, ARIA attributes
  3. **בדיקת מבנה** - בדיקת LEGO components, BEM naming
  4. **בדיקת קונסולה** - זיהוי שגיאות JavaScript/React (אם אפשר)
- Team 40 ממלא טופס בדיקה
- Team 40 מזהה בעיות/תיקונים נדרשים

### **שלב 3: תגובה**
- Team 40 שולח תגובה ל-Team 30:
  - ✅ **אישור** (אם הכל תקין)
  - ⚠️ **בקשה לתיקונים** (אם יש בעיות) - עם פירוט בעיות
  - ❌ **דחייה** (אם יש בעיות קריטיות) - עם פירוט בעיות

**פורמט תגובה:**
```markdown
## בדיקת Component: [Component Name]

### השוואה לבלופרינט:
- ✅ מבנה תואם
- ⚠️ הבדל: [פירוט]

### בדיקת קוד:
- ✅ CSS Variables נכונים
- ⚠️ בעיה: [פירוט]

### תוצאה:
[ ] ✅ מאושר | [ ] ⚠️ נדרשים תיקונים | [ ] ❌ נדחה
```

### **שלב 4: בדיקה חוזרת (אם נדרש)**
- Team 30 מתקן לפי הערות
- Team 30 שולח שוב ל-Team 40
- Team 40 בודק שוב (בדגש על הבעיות שזוהו)
- חזרה לשלב 3 עד אישור

### **שלב 5: ולידציה סופית (The Visionary)**
- Team 40 מעביר Component ל-The Visionary (Nimrod Wald)
- The Visionary בודק ויזואלית בדפדפן
- The Visionary מאשר/מבקש תיקונים
- Team 30 מתקן לפי הערות (אם נדרש)
- חזרה לשלב 5 עד אישור סופי

### **שלב 6: אישור סופי**
- The Visionary מאשר Component
- Component מוכן לשימוש

---

## 🔗 קישורים רלוונטיים

### **תיעוד:**
- [`documentation/04-DESIGN_UX_UI/CSS_CLASSES_INDEX.md`](../../documentation/04-DESIGN_UX_UI/CSS_CLASSES_INDEX.md) (v1.1) - CSS Classes Index
- [`ui/src/styles/phoenix-base.css`](../../ui/src/styles/phoenix-base.css) - Design Tokens SSOT
- [`documentation/01-ARCHITECTURE/TT2_MASTER_PALETTE_SPEC.md`](../../documentation/01-ARCHITECTURE/TT2_MASTER_PALETTE_SPEC.md) - Palette Spec

### **סטנדרטים:**
- [`documentation/10-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md`](../../documentation/10-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md) - CSS Standards
- [`documentation/10-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md`](../../documentation/10-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md) - JavaScript Standards

### **החלטות אדריכליות חדשות:**
- [`_COMMUNICATION/90_Architects_comunication/ARCHITECT_DECISION_LEGO_CUBES_FINAL.md`](../../../_COMMUNICATION/90_Architects_comunication/ARCHITECT_DECISION_LEGO_CUBES_FINAL.md) - Final Governance Lock 🛡️
- [`_COMMUNICATION/90_Architects_comunication/ARCHITECT_RESPONSIVE_CHARTER.md`](../../../_COMMUNICATION/90_Architects_comunication/ARCHITECT_RESPONSIVE_CHARTER.md) - Responsive Charter 📱
- [`documentation/04-DESIGN_UX_UI/TT2_RESPONSIVE_FLUID_DESIGN.md`](../../documentation/04-DESIGN_UX_UI/TT2_RESPONSIVE_FLUID_DESIGN.md) - Fluid Design Guide
- [`_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_FINAL_GOVERNANCE_LOCK.md`](../../../_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_FINAL_GOVERNANCE_LOCK.md) - Final Governance Lock (Retroactive)

---

```
log_entry | [Team 40] | VALIDATION_CRITERIA | CREATED | 2026-02-01
log_entry | [Team 40] | VALIDATION_METHODS | CODE_BASED | 2026-02-01
```

---

## 📝 הערות חשובות

**שיטות בדיקה ריאליסטיות:**
- ✅ **השוואה לבלופרינט** - קריאת HTML והשוואה ל-JSX
- ✅ **בדיקת קוד סטטית** - חיפוש CSS classes, CSS Variables, ARIA attributes
- ✅ **בדיקת מבנה** - בדיקת LEGO components, BEM naming
- ✅ **בדיקת קונסולה** - זיהוי שגיאות JavaScript/React (אם אפשר)
- 🔴 **בדיקת Fluid Design** - בדיקת רספונסיביות אוטומטית (clamp, min, max) **NEW**
- 🔴 **בדיקת Clean Slate Rule** - בדיקת איסור inline scripts/handlers **RETROACTIVE - NEW**

**לא ניתן לבצע:**
- ❌ בדיקות ויזואליות אמיתיות (לא ניתן לראות את המסך)
- ❌ בדיקות אינטראקטיביות (לא ניתן להריץ את האפליקציה)

---

**Team 40 (UI Assets & Design) - "שומרי ה-DNA"**  
**Date:** 2026-02-02  
**Version:** v1.2  
**Status:** 🛡️ **MANDATORY CODE VALIDATION CRITERIA**  
**עדכון אחרון:** Batch 1 Closure - הוספת חוקי ברזל (אין inline styles, אין ערכי צבע hardcoded)
