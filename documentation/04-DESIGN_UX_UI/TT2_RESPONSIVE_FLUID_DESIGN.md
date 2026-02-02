# 📜 אמנת רספונסיביות דינמית - Phoenix v2.0

**תאריך:** 2026-02-02  
**מקור:** Chief Architect (Gemini)  
**סטטוס:** 🛡️ **MANDATORY**  
**גרסה:** 1.0.0

---

## 📋 תקציר מנהלים

אמנה זו מגדירה את הסטנדרטים המחייבים לרספונסיביות דינמית במערכת Phoenix V2. המטרה היא להבטיח שהמערכת תעבוד בכל מכשיר **ללא כפל קוד** וללא צורך בקבצי CSS נפרדים למובייל.

**עקרון יסוד:** **Fluid Design** - התוכן זורם טבעית לפי רוחב המסך ללא צורך ב-media queries.

---

## 🎯 עקרונות Fluid Design

### 1. טיפוגרפיה וריווחים נזילים (Fluidity)

#### **פונטים:**
שימוש ב-`clamp(min, preferred, max)` במקום media queries.

**דוגמה:**
```css
/* ❌ לא נכון - media query */
@media (max-width: 768px) {
  font-size: 14px;
}
@media (min-width: 769px) {
  font-size: 18px;
}

/* ✅ נכון - Fluid Design */
font-size: clamp(14px, 2vw + 0.5rem, 18px);
```

**הסבר:**
- `14px` - גודל מינימלי (מובייל)
- `2vw + 0.5rem` - גודל דינמי (מתאים לרוחב המסך)
- `18px` - גודל מקסימלי (דסקטופ)

#### **ריווחים:**
שימוש ב-`clamp()` ל-Margins ו-Paddings.

**דוגמה:**
```css
/* ✅ נכון - ריווח נזיל */
padding: clamp(16px, 2vw, 24px);
margin-block: clamp(8px, 1vw, 16px);
```

---

### 2. גריד גמיש (The No-Media-Query Goal)

#### **Grid עם auto-fit/auto-fill:**
העדפת `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))` במקום media queries.

**דוגמה:**
```css
/* ❌ לא נכון - media query */
.grid-container {
  display: grid;
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1200px) {
  .grid-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* ✅ נכון - Grid גמיש */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: clamp(16px, 2vw, 24px);
}
```

**הסבר:**
- `auto-fit` - מתאים את מספר העמודות לרוחב הזמין
- `minmax(300px, 1fr)` - רוחב מינימלי 300px, מקסימלי 1fr
- התוכן זורם אוטומטית לפי רוחב המסך

#### **Container:**
ה-Container תמיד ברוחב מקסימלי של 1400px (כבר מיושם ב-`tt-container`).

```css
tt-container {
  max-width: 1400px;
  width: 100%;
  margin-inline: auto;
  padding-inline: clamp(16px, 2vw, 24px);
}
```

---

### 3. טבלאות ונתונים (Mobile Tables)

#### **טבלאות לא "נשברות" למובייל:**
טבלאות עטופות ב-`overflow-x: auto` עם רוחב מינימלי.

**דוגמה:**
```css
/* ✅ נכון - טבלה עם scroll פנימי */
.phoenix-table-wrapper {
  display: block;
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
}

.phoenix-table {
  min-width: 800px; /* רוחב מינימלי */
  width: 100%;
}
```

#### **Sticky Columns:**
שימוש ב-Sticky Columns לשמירה על קונטקסט בטבלאות רחבות.

**דוגמה:**
```css
/* ✅ נכון - עמודה דביקה */
.phoenix-table__cell--sticky {
  position: sticky;
  inset-inline-start: 0;
  background: var(--apple-bg-primary);
  z-index: 1;
}
```

---

## 🚫 איסורים

### **אין קבצי CSS נפרדים למובייל:**
- ❌ אין `mobile.css`
- ❌ אין `responsive.css`
- ❌ אין `tablet.css`
- ✅ הכל בקובץ CSS אחד עם Fluid Design

### **אין media queries (חוץ מ-dark mode):**
- ❌ אין `@media (max-width: 768px)`
- ❌ אין `@media (min-width: 1200px)`
- ✅ רק `@media (prefers-color-scheme: dark)` (אם נדרש)

---

## 📚 דוגמאות שימוש

### **דוגמה 1: Typography Fluid**

```css
/* Base font size */
:root {
  --font-size-base: clamp(14px, 2vw + 0.5rem, 18px);
  --font-size-sm: clamp(12px, 1.5vw + 0.4rem, 14px);
  --font-size-lg: clamp(18px, 2.5vw + 0.6rem, 24px);
  --font-size-xl: clamp(24px, 3vw + 0.8rem, 32px);
}

h1 {
  font-size: var(--font-size-xl);
}

p {
  font-size: var(--font-size-base);
}
```

### **דוגמה 2: Spacing Fluid**

```css
:root {
  --spacing-xs: clamp(4px, 0.5vw, 8px);
  --spacing-sm: clamp(8px, 1vw, 12px);
  --spacing-md: clamp(16px, 2vw, 24px);
  --spacing-lg: clamp(24px, 3vw, 32px);
  --spacing-xl: clamp(32px, 4vw, 48px);
}

.card {
  padding: var(--spacing-md);
  margin-block-end: var(--spacing-lg);
}
```

### **דוגמה 3: Grid Fluid**

```css
.widget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: clamp(16px, 2vw, 24px);
}

/* Responsive אוטומטי - אין media queries נדרשים */
```

### **דוגמה 4: Table Fluid**

```css
.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table {
  min-width: 800px; /* רוחב מינימלי */
  width: 100%;
}

/* בטבלאות רחבות - עמודה דביקה */
.table__cell--sticky {
  position: sticky;
  inset-inline-start: 0;
  background: var(--apple-bg-primary);
  z-index: 1;
}
```

---

## 🔗 קישורים רלוונטיים

- [החלטה אדריכלית - LEGO Cubes & Fluidity](../_COMMUNICATION/90_Architects_comunication/ARCHITECT_DECISION_LEGO_CUBES.md)
- [אמנת רספונסיביות - מקור](../_COMMUNICATION/90_Architects_comunication/ARCHITECT_RESPONSIVE_CHARTER.md)
- [CSS Classes Index](./CSS_CLASSES_INDEX.md)
- [תוכנית עבודה - שלב 2.6](../_COMMUNICATION/team_10/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md#שלב-26-יישום-fluid-design---הסרת-media-queries)

---

**log_entry | [Team 10] | RESPONSIVE_FLUID_DESIGN | DOCUMENTATION_CREATED | BLUE | 2026-02-02**
