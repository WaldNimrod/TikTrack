# 🚨 נוהל CSS מחייב - Team 30 (Frontend) | MANDATORY COMPLIANCE

**From:** Team 10 (The Gateway)  
**To:** Team 30 (Frontend)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.3  
**Status:** 🔴 **MANDATORY - CRITICAL COMPLIANCE REQUIRED**

---

## ⚠️ הודעה חשובה

לאחר ביקורת אדריכלית ראשית של חבילת הקבצים של Team 31, האדריכלית הגדירה **נוהל CSS מחייב** שכל הצוותים חייבים לעמוד בו.

**זהו נוהל מחייב - אין חריגות.**

---

## 📄 מסמך מחייב

**קובץ:** `documentation/07-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md`

**חובה לקרוא את המסמך המלא לפני כל עבודה על CSS!**

---

## 🎯 עיקרי הנוהל (Summary)

### **1. מתודולוגיית עבודה: ITCSS + BEM**

#### **ITCSS Hierarchy (סדר קדוש):**
1. **Settings** - משתני DNA בלבד (`:root` ב-`phoenix-base.css`)
2. **Tools** - מיקסינים ופונקציות
3. **Generic** - איפוסים ו-Pico CSS
4. **Elements** - עיצוב תגי HTML נקיים
5. **Objects** - מבני ה-LEGO (`tt-container`, `tt-section`)
6. **Components** - רכיבים מורכבים
7. **Trumps** - עוקפי סגנון נקודתיים

#### **BEM Naming:**
- **Block:** `.auth-form`
- **Element:** `.auth-form__input` (שני קווים תחתונים)
- **Modifier:** `.auth-form__input--error` (שני מקפים)
- **חוק:** אין קינון של יותר מ-2 רמות

---

### **2. בקרת רספונסיביות (Fluid Design)**

#### **Fluid Typography:**
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

/* ✅ נכון - Fluid Typography */
h1 {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
}
```

#### **Container Queries:**
```css
/* ❌ לא נכון - Media Query */
@media (min-width: 768px) {
  .card {
    width: 50%;
  }
}

/* ✅ נכון - Container Query */
.card-container {
  container-type: inline-size;
}
@container (min-width: 400px) {
  .card {
    width: 50%;
  }
}
```

#### **Logical Viewports:**
```css
/* ❌ לא נכון - vh רגיל */
.header {
  height: 100vh; /* קפיצות במובייל */
}

/* ✅ נכון - Logical Viewport */
.header {
  height: 100svh; /* Small Viewport Height - יציב */
}
```

---

### **3. הרחבת G-Bridge: אוטומציית Linter**

#### **Physical Property Blocker:**
**חסימה אוטומטית של כל מאפיין פיזי:**

```css
/* ❌ אסור - מאפיינים פיזיים */
margin-left: 20px;
padding-right: 10px;
left: 0;
right: 0;
float: left;
text-align: left;

/* ✅ נכון - Logical Properties */
margin-inline-start: 20px;
padding-inline-end: 10px;
inset-inline-start: 0;
inset-inline-end: 0;
float: inline-start;
text-align: start;
```

**רשימת מאפיינים אסורים:**
- `margin-left`, `margin-right`
- `padding-left`, `padding-right`
- `left`, `right` (בשימוש לא לוגי)
- `float: left`, `float: right`
- `text-align: left`, `text-align: right`

---

#### **Z-Index Registry:**
**כל Z-Index חייב להיות מוגדר דרך משתנה DNA:**

```css
/* ❌ לא נכון - Z-Index ישיר */
.modal {
  z-index: 9999;
}

/* ✅ נכון - Z-Index דרך משתנה */
:root {
  --z-index-modal: 1000;
}
.modal {
  z-index: var(--z-index-modal, 1000);
}
```

**רשימת Z-Index מוגדרים:**
```css
:root {
  --z-index-base: 1;
  --z-index-dropdown: 100;
  --z-index-sticky: 200;
  --z-index-header: 950;
  --z-index-g-bridge-banner: 10002;
  --z-index-modal: 1000;
  --z-index-tooltip: 1100;
  --z-index-notification: 1200;
}
```

---

#### **Color Clamp:**
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

**חוק:** אין צבעים ישירים בקוד, הכל דרך משתנים.

---

### **4. מערכת הבקרה הויזואלית**

#### **Pixel Match:**
- סטייה של **0 פיקסלים** בכל אלמנט
- Digital Twin - התאמה מושלמת ל-Legacy

#### **RTL Mirroring:**
- כל אלמנטים עם `position: absolute` משתמשים ב-`inset-inline-*`
- כל אלמנטים עם `float` משתמשים ב-`float: inline-start/end`
- כל `text-align` משתמש ב-`start/end` במקום `left/right`

#### **State Integrity:**
- כל מצבי Hover, Focus, Active נשמרים בכל רכיבי ה-LEGO

---

### **5. חוקי הניקיון (Maintainability)**

#### **No Magic Numbers:**
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

---

#### **CSS Shorthand:**
```css
/* ❌ לא נכון - Longhand */
.element {
  margin-top: 10px;
  margin-right: 20px;
  margin-bottom: 10px;
  margin-left: 20px;
}

/* ✅ נכון - Shorthand + Logical Properties */
.element {
  margin-block: 10px;
  margin-inline: 20px;
}
```

---

#### **Comments LOD 400:**
**כל בלוק קוד חייב לכלול כותרת:**

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
```

---

### **6. סדר טעינת קבצי CSS (CRITICAL)**

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

## ✅ רשימת בדיקות לפני הגשה

### **בדיקות אוטומטיות (G-Bridge):**
- [ ] G-Bridge validation passed
- [ ] No physical properties found
- [ ] All Z-Indexes use CSS variables
- [ ] No hardcoded colors found
- [ ] All spacing uses DNA multiples (8px)
- [ ] RTL Charter compliance verified

### **בדיקות ידניות:**
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

## 🚨 כללי ברזל - סיכום

1. **אין מאפיינים פיזיים:** רק Logical Properties
2. **אין צבעים ישירים:** רק CSS Variables
3. **אין Z-Index ישיר:** רק דרך `--z-index-*` variables
4. **אין Magic Numbers:** רק כפולות של 8px
5. **אין Media Queries:** רק Container Queries ו-Fluid Typography
6. **חובה G-Bridge validation:** לפני כל הגשה
7. **חובה Comments LOD 400:** בכל בלוק קוד משמעותי

---

## 📚 משאבים

- **מסמך מלא:** `documentation/07-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md`
- **דוגמאות מעשיות:** כלולות במסמך המלא
- **G-Bridge:** כלי אוטומטי לבדיקת compliance

---

## 🔄 Next Steps

1. **🚨 CRITICAL:** קראו את `TT2_CSS_STANDARDS_PROTOCOL.md` במלואו
2. **הבינו את כל הכללים:** אין חריגות
3. **השתמשו ב-G-Bridge:** לפני כל הגשה
4. **עמדו בכל הבדיקות:** אוטומטיות וידניות

---

## ⚠️ אזהרה אחרונה

**נוהל זה הוא מחייב. כל עבודה על CSS חייבת לעמוד בכל הכללים.**

**אי-עמידה בכללים תגרום לדחיית העבודה.**

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** 🔴 **MANDATORY COMPLIANCE REQUIRED**  
**Effective Date:** 2026-01-31

---

**log_entry | Team 10 | CSS_STANDARDS_MANDATORY | TT2_CSS_STANDARDS_PROTOCOL | RED | 2026-01-31**
