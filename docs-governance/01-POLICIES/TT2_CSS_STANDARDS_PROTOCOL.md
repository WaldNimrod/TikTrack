# 🎨 פרוטוקול סטנדרטים ובקרת איכות CSS (v1.0)

**id:** `TT2_CSS_STANDARDS_PROTOCOL`  
**owner:** Team 31 (Blueprint)  
**status:** 🔒 **SSOT - MANDATORY**  
**supersedes:** None (Master document)  
**last_updated:** 2026-01-31  
**version:** v1.0

---

**פרויקט:** פיניקס (TikTrack V2)  
**תפקיד:** אבטחת איכות אדריכלית (LOD 400)  
**סטטוס:** ✅ נוהל מחייב

---

## 📋 תקציר מנהלים

פרוטוקול זה מגדיר את הסטנדרטים המחייבים לפיתוח CSS בפרויקט פיניקס V2. המטרה היא להבטיח תחזוקה קלה, רספונסיביות מלאה, ודיוק ויזואלי ברמה של LOD 400 (Digital Twin).

**הדיוק הוא לא יעד, הוא דרך חיים.**

---

## 1. מתודולוגיית עבודה: ITCSS + BEM

אנחנו משלבים שתי שיטות מוכחות לניהול היררכיה ושמות:

### א. היררכיית ITCSS (Inverted Triangle CSS)

הסדר שקבענו הוא **קדוש**. אין לחרוג ממנו כדי למנוע "מלחמות ספציפיות" (Specificity Wars).

#### **1. Settings** - משתני DNA בלבד
**קובץ:** `phoenix-base.css` (`:root`)

```css
:root {
  /* Apple Design System Variables */
  --apple-blue: #007AFF;
  --apple-red: #dc2626;
  --spacing-base: 8px; /* יחידת DNA בסיסית */
  --font-size-base: 0.92rem; /* 14.72px */
}
```

**חוק:** כל ערך קבוע (צבע, ריווח, גודל פונט) חייב להיות מוגדר כאן.

---

#### **2. Tools** - מיקסינים ופונקציות
**קובץ:** `phoenix-base.css` (לשימוש עתידי ב-SASS)

```css
/* דוגמה עתידית - מיקסינים */
@mixin fluid-typography($min, $max) {
  font-size: clamp($min, 5vw, $max);
}
```

**חוק:** כל פונקציה חוזרת תוגדר כאן.

---

#### **3. Generic** - איפוסים ו-Pico CSS
**קובץ:** `pico.min.css` (CDN) + `phoenix-base.css` (overrides)

```css
/* Pico CSS נטען ראשון */
/* phoenix-base.css דורס את מה שצריך */
```

**חוק:** Pico CSS תמיד נטען ראשון, אחר כך Phoenix CSS.

---

#### **4. Elements** - עיצוב תגי HTML נקיים
**קובץ:** `phoenix-base.css`

```css
/* דוגמה: עיצוב בסיסי של תגים */
h1 {
  font-size: var(--font-size-h1, 2rem);
  margin-block-end: var(--spacing-md, 16px);
}

input {
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  border: 1px solid var(--apple-border-light, #e5e5e5);
}
```

**חוק:** עיצוב בסיסי בלבד, ללא מחלקות.

---

#### **5. Objects** - מבני ה-LEGO שלנו
**קובץ:** `phoenix-components.css`

```css
/* LEGO Components - Semantic Tags */
tt-container {
  max-width: 1400px;
  margin-inline: auto;
  padding-inline: var(--spacing-lg, 24px);
}

tt-section {
  margin-block-end: var(--spacing-xl, 32px);
}

tt-section-row {
  display: flex;
  gap: var(--spacing-md, 16px);
}
```

**חוק:** רק מבנים גנריים, ללא עיצוב ספציפי.

---

#### **6. Components** - רכיבים מורכבים
**קובץ:** `phoenix-header.css`, `phoenix-components.css`

```css
/* Component: Unified Header */
#unified-header {
  height: 120px;
  z-index: 950;
  background: var(--apple-bg-elevated, #ffffff);
}

/* Component: Auth Form */
.auth-form {
  max-width: 400px;
  margin-inline: auto;
}
```

**חוק:** רכיבים ספציפיים עם מחלקות או IDs.

---

#### **7. Trumps** - עוקפי סגנון נקודתיים
**קובץ:** `D15_IDENTITY_STYLES.css` (דוגמה)

```css
/* Page-specific overrides */
body.auth-layout-root form .form-group input {
  padding: 0.75rem 1rem !important; /* Override base for spacious layout */
}
```

**חוק:** רק כאשר יש צורך אמיתי, עם הסבר מדוע.

---

### ב. שיטת שמות BEM (Block Element Modifier)

בתוך רכיבי ה-LEGO, נשתמש ב-BEM כדי למנוע זליגת סגנונות:

#### **מבנה BEM:**

```css
/* Block */
.auth-form { }

/* Element */
.auth-form__input { }
.auth-form__label { }
.auth-form__button { }

/* Modifier */
.auth-form__input--error { }
.auth-form__button--primary { }
.auth-form__button--disabled { }
```

#### **דוגמה מלאה:**

```html
<form class="auth-form">
  <label class="auth-form__label">שם משתמש</label>
  <input type="text" class="auth-form__input" />
  <input type="text" class="auth-form__input auth-form__input--error" />
  <button class="auth-form__button auth-form__button--primary">שלח</button>
</form>
```

```css
/* Block */
.auth-form {
  max-width: 400px;
  margin-inline: auto;
}

/* Element */
.auth-form__input {
  width: 100%;
  padding: var(--spacing-sm, 8px);
  border: 1px solid var(--apple-border-light, #e5e5e5);
}

/* Modifier */
.auth-form__input--error {
  border-color: var(--apple-red, #dc2626);
}

.auth-form__button--primary {
  background: var(--header-brand, #26baac);
  color: white;
}
```

**חוקים:**
- Block: שם הרכיב הראשי
- Element: `__` (שני קווים תחתונים)
- Modifier: `--` (שני מקפים)
- אין קינון של יותר מ-2 רמות

---

## 2. בקרת רספונסיביות (Fluid Design)

במקום מאות Media Queries, נעבור לשימוש בעיצוב נוזלי:

### א. Fluid Typography

**שימוש ב-`clamp()` עבור גדלי פונט:**

```css
/* ❌ לא נכון - Media Queries */
h1 {
  font-size: 1.5rem;
}
@media (min-width: 768px) {
  h1 {
    font-size: 2rem;
  }
}
@media (min-width: 1200px) {
  h1 {
    font-size: 2.5rem;
  }
}

/* ✅ נכון - Fluid Typography */
h1 {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  /* מינימום: 1.5rem, אידיאלי: 5vw, מקסימום: 2.5rem */
}
```

**דוגמאות נוספות:**

```css
/* גוף טקסט */
body {
  font-size: clamp(0.875rem, 2vw, 1rem); /* 14px - 16px */
}

/* כותרות */
h1 {
  font-size: clamp(1.75rem, 5vw, 2.5rem); /* 28px - 40px */
}

h2 {
  font-size: clamp(1.5rem, 4vw, 2rem); /* 24px - 32px */
}

h3 {
  font-size: clamp(1.25rem, 3vw, 1.75rem); /* 20px - 28px */
}
```

---

### ב. Container Queries

**מעבר מ-`@media` (מסך) ל-`@container` (קונטיינר):**

```css
/* ❌ לא נכון - Media Query */
.card {
  width: 100%;
}
@media (min-width: 768px) {
  .card {
    width: 50%;
  }
}

/* ✅ נכון - Container Query */
.card-container {
  container-type: inline-size;
}

.card {
  width: 100%;
}

@container (min-width: 400px) {
  .card {
    width: 50%;
  }
}
```

**יתרונות:**
- רכיבי LEGO מתאימים את עצמם לשטח שבו הם נמצאים
- לא תלויים בגודל המסך
- גמישות מקסימלית

**דוגמה עם LEGO:**

```html
<tt-container>
  <tt-section>
    <div class="card-container">
      <div class="card">תוכן</div>
    </div>
  </tt-section>
</tt-container>
```

```css
.card-container {
  container-type: inline-size;
  container-name: card-area;
}

.card {
  padding: var(--spacing-md, 16px);
}

@container card-area (min-width: 500px) {
  .card {
    padding: var(--spacing-lg, 24px);
  }
}
```

---

### ג. Logical Viewports

**שימוש ביחידות `svh` / `lvh` למניעת קפיצות ממשק במובייל:**

```css
/* ❌ לא נכון - vh רגיל */
.header {
  height: 100vh; /* קפיצות במובייל בגלל Address Bar */
}

/* ✅ נכון - Logical Viewport */
.header {
  height: 100svh; /* Small Viewport Height - יציב */
}

/* או */
.fullscreen-section {
  min-height: 100lvh; /* Large Viewport Height */
}
```

**יחידות זמינות:**
- `svh` / `svw` - Small Viewport (ללא UI של הדפדפן)
- `lvh` / `lvw` - Large Viewport (עם UI של הדפדפן)
- `dvh` / `dvw` - Dynamic Viewport (מתאים את עצמו)

---

## 3. הרחבת ה-G-Bridge: אוטומציית Linter

אנחנו מעדכנים את מנוע ה-Audit לבדיקות מתקדמות יותר:

### א. Physical Property Blocker

**חסימה אוטומטית של כל מאפיין פיזי:**

```javascript
// בדיקה ב-G-Bridge
const physicalProperties = [
  'margin-left', 'margin-right',
  'padding-left', 'padding-right',
  'left:', 'right:',
  'top:', 'bottom:', // רק אם לא בשימוש לוגי
  'float: left', 'float: right'
];

// ❌ שגיאה:
margin-left: 20px;

// ✅ נכון:
margin-inline-start: 20px;
```

**רשימת מאפיינים אסורים:**
- `margin-left`, `margin-right`
- `padding-left`, `padding-right`
- `left`, `right` (בשימוש לא לוגי)
- `float: left`, `float: right`
- `text-align: left`, `text-align: right` (להשתמש ב-`text-align: start/end`)

---

### ב. Z-Index Registry

**וידוא שכל Z-Index מוגדר דרך משתנה DNA:**

```css
/* ❌ לא נכון - Z-Index ישיר */
.modal {
  z-index: 9999;
}

/* ✅ נכון - Z-Index דרך משתנה */
:root {
  --z-index-base: 1;
  --z-index-dropdown: 100;
  --z-index-sticky: 200;
  --z-index-header: 950;
  --z-index-modal: 1000;
  --z-index-tooltip: 1100;
}

.modal {
  z-index: var(--z-index-modal, 1000);
}
```

**רשימת Z-Index מוגדרים:**

```css
:root {
  /* Base layers */
  --z-index-base: 1;
  
  /* Components */
  --z-index-dropdown: 100;
  --z-index-sticky: 200;
  
  /* Fixed elements */
  --z-index-header: 950;
  --z-index-g-bridge-banner: 10002;
  
  /* Overlays */
  --z-index-modal: 1000;
  --z-index-tooltip: 1100;
  --z-index-notification: 1200;
}
```

**חוק:** כל Z-Index חייב להיות מוגדר כאן, אין Z-Index ישיר בקוד.

---

### ג. Color Clamp

**חסימה של כל צבע שלא מופיע ברשימת המשתנים המאושרת:**

```css
/* ❌ לא נכון - צבע ישיר */
.button {
  color: #ff0000;
  background: rgb(255, 0, 0);
}

/* ✅ נכון - משתנה DNA */
.button {
  color: var(--apple-red, #dc2626);
  background: var(--header-brand, #26baac);
}
```

**רשימת צבעים מאושרים:**

```css
:root {
  /* Apple Design System */
  --apple-blue: #007AFF;
  --apple-red: #dc2626;
  --apple-green: #34c759;
  --apple-orange: #ff9500;
  
  /* Phoenix Brand */
  --header-brand: #26baac;
  --header-dropdown-item-hover: #ff9e04;
  
  /* Grays */
  --apple-bg-elevated: #ffffff;
  --apple-border-light: #e5e5e5;
  --apple-text-primary: #1d1d1f;
  --apple-text-secondary: #86868b;
}
```

**חוק:** אין צבעים ישירים בקוד, הכל דרך משתנים.

---

## 4. מערכת הבקרה הויזואלית (Visual Regression Testing)

תפקיד צוות 50 (QA) הוא לבצע השוואת Digital Twin:

### א. Pixel Match

**שימוש בכלי Overlay (כמו PerfectPixel) כדי להניח את ה-Legacy על ה-Phoenix:**

**דרישות:**
- סטייה של **0 פיקסלים** בכל אלמנט
- התאמה מושלמת של:
  - גבהים ורוחבים
  - ריווחים (margins, paddings)
  - גדלי פונטים
  - צבעים
  - גבולות וצללים

**תהליך בדיקה:**
1. פתיחת Legacy page בדפדפן
2. פתיחת Phoenix page בדפדפן
3. שימוש ב-PerfectPixel או כלי דומה
4. Overlay של Legacy על Phoenix
5. בדיקת התאמה פיקסל-לפיקסל
6. תיעוד כל סטייה

---

### ב. RTL Mirroring

**בדיקה שכל אלמנט צף (Float/Absolute) מתהפך בצורה לוגית מושלמת:**

```css
/* ❌ לא נכון - מיקום פיזי */
.menu {
  float: left;
  left: 0;
}

/* ✅ נכון - מיקום לוגי */
.menu {
  float: inline-start;
  inset-inline-start: 0;
}
```

**רשימת בדיקות:**
- [ ] כל אלמנטים עם `position: absolute` משתמשים ב-`inset-inline-*`
- [ ] כל אלמנטים עם `float` משתמשים ב-`float: inline-start/end`
- [ ] כל `text-align` משתמש ב-`start/end` במקום `left/right`
- [ ] כל `margin/padding` משתמש ב-`*-inline-*` / `*-block-*`

---

### ג. State Integrity

**בדיקה שכל מצבי ה-Hover, Focus ו-Active נשמרים בכל רכיבי ה-LEGO:**

```css
/* דוגמה: כפתור עם כל המצבים */
.button {
  background: var(--header-brand, #26baac);
  color: white;
  transition: background 0.2s ease;
}

.button:hover {
  background: var(--header-brand-hover, #20a89a);
}

.button:focus {
  outline: 2px solid var(--header-brand, #26baac);
  outline-offset: 2px;
}

.button:active {
  background: var(--header-brand-active, #1a9688);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**רשימת בדיקות:**
- [ ] כל כפתורים עם `:hover`, `:focus`, `:active`
- [ ] כל קישורים עם `:hover`, `:focus`, `:visited`
- [ ] כל שדות קלט עם `:focus`, `:invalid`, `:disabled`
- [ ] כל dropdowns עם `:hover`, `:focus`, `:active`

---

## 5. חוקי הניקיון (Maintainability)

### א. No Magic Numbers

**אין להשתמש במספרים שרירותיים:**

```css
/* ❌ לא נכון - Magic Numbers */
.card {
  margin-top: 13px;
  padding: 7px;
  font-size: 15px;
}

/* ✅ נכון - DNA Multiples */
.card {
  margin-block-start: var(--spacing-md, 16px); /* 8px * 2 */
  padding: var(--spacing-sm, 8px); /* 8px * 1 */
  font-size: var(--font-size-base, 0.92rem); /* 14.72px */
}
```

**יחידת DNA בסיסית:** `8px`

**כפולות מותרות:**
- `8px` (1x) - `--spacing-xs`
- `16px` (2x) - `--spacing-sm`
- `24px` (3x) - `--spacing-md`
- `32px` (4x) - `--spacing-lg`
- `40px` (5x) - `--spacing-xl`
- `48px` (6x) - `--spacing-xxl`

**חוק:** כל ריווח חייב להיות כפולה של 8px.

---

### ב. CSS Shorthand

**חובה להשתמש בקיצורים:**

```css
/* ❌ לא נכון - Longhand */
.element {
  margin-top: 10px;
  margin-right: 20px;
  margin-bottom: 10px;
  margin-left: 20px;
  padding-top: 5px;
  padding-right: 10px;
  padding-bottom: 5px;
  padding-left: 10px;
}

/* ✅ נכון - Shorthand */
.element {
  margin: 10px 20px;
  padding: 5px 10px;
}

/* ✅ עוד יותר טוב - Logical Properties */
.element {
  margin-block: 10px;
  margin-inline: 20px;
  padding-block: 5px;
  padding-inline: 10px;
}
```

**קיצורים מועדפים:**
- `margin-block` / `margin-inline`
- `padding-block` / `padding-inline`
- `border-block` / `border-inline`
- `inset-block` / `inset-inline`

---

### ג. Comments LOD 400

**כל בלוק קוד חייב לכלול כותרת המסבירה את ה-Purpose שלו:**

```css
/* ============================================
   Component: Unified Header
   Purpose: Main navigation header for all pages
   Legacy Reference: header-styles.css v7.0.0
   LOD 400 Requirement: Height 120px, Z-Index 950
   ============================================ */

#unified-header {
  height: 120px;
  z-index: var(--z-index-header, 950);
}

/* ============================================
   Element: Header Top Row
   Purpose: Contains logo and main navigation
   Height: 60px (half of total header)
   ============================================ */

#unified-header .header-top {
  height: 60px;
}
```

**פורמט תגובה:**
```css
/* ============================================
   [Component/Element Name]
   Purpose: [מה המטרה של הקוד הזה]
   Legacy Reference: [איפה זה היה ב-Legacy]
   LOD 400 Requirement: [דרישות ספציפיות]
   ============================================ */
```

---

## 6. סדר טעינת קבצי CSS (CRITICAL)

**הסדר הוא קדוש - אין לחרוג ממנו:**

```html
<!-- 1. Pico CSS FIRST (Framework) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">

<!-- 2. Phoenix Base Styles (Global defaults) -->
<link rel="stylesheet" href="./phoenix-base.css">

<!-- 3. LEGO Components (Reusable components) -->
<link rel="stylesheet" href="./phoenix-components.css">

<!-- 4. Header Component (If header is used) -->
<link rel="stylesheet" href="./phoenix-header.css">

<!-- 5. Page-Specific Styles (If needed) -->
<link rel="stylesheet" href="./D15_IDENTITY_STYLES.css">
```

**⚠️ IMPORTANT:** שינוי הסדר יגרום לשבירת סגנונות.

---

## 7. רשימת בדיקות לפני הגשה

### ✅ בדיקות אוטומטיות (G-Bridge)

- [ ] G-Bridge validation passed
- [ ] No physical properties found
- [ ] All Z-Indexes use CSS variables
- [ ] No hardcoded colors found
- [ ] All spacing uses DNA multiples (8px)
- [ ] RTL Charter compliance verified

### ✅ בדיקות ידניות

- [ ] Visual comparison with Legacy (0 pixel deviation)
- [ ] RTL mirroring verified
- [ ] All states tested (hover, focus, active, disabled)
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Container queries tested (if used)
- [ ] Logical viewports tested (svh/lvh)
- [ ] Comments LOD 400 added to all major blocks
- [ ] CSS shorthand used throughout
- [ ] No magic numbers found

---

## 8. דוגמאות מעשיות

### דוגמה 1: כפתור עם BEM

```html
<button class="auth-form__button auth-form__button--primary">
  התחבר
</button>
```

```css
/* Block Element */
.auth-form__button {
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  border: none;
  border-radius: 4px;
  font-size: var(--font-size-base, 0.92rem);
  cursor: pointer;
  transition: background 0.2s ease;
}

/* Modifier */
.auth-form__button--primary {
  background: var(--header-brand, #26baac);
  color: white;
}

.auth-form__button--primary:hover {
  background: var(--header-brand-hover, #20a89a);
}

.auth-form__button--primary:focus {
  outline: 2px solid var(--header-brand, #26baac);
  outline-offset: 2px;
}
```

---

### דוגמה 2: Fluid Typography

```css
/* כותרת ראשית */
.hero-title {
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  line-height: 1.2;
  margin-block-end: var(--spacing-lg, 24px);
}

/* גוף טקסט */
.hero-text {
  font-size: clamp(0.875rem, 2vw, 1rem);
  line-height: 1.6;
  margin-block-end: var(--spacing-md, 16px);
}
```

---

### דוגמה 3: Container Query

```html
<tt-container>
  <tt-section>
    <div class="card-grid">
      <div class="card">כרטיס 1</div>
      <div class="card">כרטיס 2</div>
      <div class="card">כרטיס 3</div>
    </div>
  </tt-section>
</tt-container>
```

```css
.card-grid {
  container-type: inline-size;
  container-name: card-grid;
  display: grid;
  gap: var(--spacing-md, 16px);
  grid-template-columns: 1fr;
}

@container card-grid (min-width: 500px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container card-grid (min-width: 800px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## 9. משאבים נוספים

- `CSS_ARCHITECTURE_HIERARCHY.md` - היררכיית קבצי CSS
- `STANDARD_PAGE_BUILD_WORKFLOW.md` - תהליך בניית עמודים
- `BATCH_1_AUTH_COMPLETE.md` - דוגמאות מהחבילה הראשונה

---

## 10. מסמכים משלימים

### **אינדקס מחלקות CSS:**
- [🗂️ CSS_CLASSES_INDEX.md](../04-DESIGN_UX_UI/CSS_CLASSES_INDEX.md) - מפה מרכזית לכל המחלקות CSS החשובות, לוגיקת הגדרת מחלקות, ומניעת כפילויות

### **מפרטים טכניים:**
- [🎯 UNIFIED_HEADER_SPECIFICATION.md](../04-DESIGN_UX_UI/UNIFIED_HEADER_SPECIFICATION.md) - מפרט טכני מפורט של אלמנט ראש הדף
- [📐 CONTAINER_HEADER_STRUCTURE_GUIDELINES.md](../04-DESIGN_UX_UI/CONTAINER_HEADER_STRUCTURE_GUIDELINES.md) - הנחיות מבנה כותרות קונטיינרים

### **תובנות מערכתיות:**
- [📚 SYSTEM_WIDE_DESIGN_PATTERNS.md](../04-DESIGN_UX_UI/SYSTEM_WIDE_DESIGN_PATTERNS.md) - תובנות מערכתיות ומבנים כלליים

---

## 11. עדכונים עתידיים

פרוטוקול זה יתעדכן בהתאם ל:
- שיפורים במתודולוגיה
- משוב מצוותים אחרים
- שינויים בדרישות האדריכליות

---

**Last Updated:** 2026-01-31  
**Maintained By:** Team 31 (Blueprint)  
**Approved By:** Chief Architect - Phoenix v252
