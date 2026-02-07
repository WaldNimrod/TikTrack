# DNA Variables CSS Specification

**id:** `TEAM_40_DNA_VARIABLES_CSS_SPEC`  
**owner:** Team 40 (UI Assets & Design) - "שומרי ה-DNA"  
**status:** 📝 **DRAFT - DESIGN SPRINT**  
**last_updated:** 2026-02-06  
**version:** v1.0 (Design Sprint)

---

## 📢 Executive Summary

**DNA Variables CSS** הוא קובץ ה-CSS הבסיסי ביותר במערכת Phoenix, המכיל את כל ה-CSS Variables (משתני CSS) המשמשים כבסיס לכל העיצוב במערכת. הקובץ `phoenix-base.css` משמש כ-**Single Source of Truth (SSOT)** לכל המשתנים העיצוביים במערכת, כולל צבעים, טיפוגרפיה, ריווחים, צללים, רדיוסים, z-index, וכל המשתנים הסמנטיים והספציפיים לישויות.

הקובץ חייב להיטען **ראשון** בהיררכיית הטעינה של HTML, לפני כל קובצי CSS אחרים, כדי להבטיח שכל המשתנים זמינים לכל הקומפוננטים והעמודים במערכת.

---

## 🎯 Purpose & Goals

### **מטרות עיקריות:**

1. **Single Source of Truth (SSOT):** לספק מקור אמת יחיד לכל ה-CSS Variables במערכת
2. **עקביות עיצובית:** להבטיח שכל הקומפוננטים והעמודים משתמשים באותם ערכים עיצוביים
3. **תחזוקה קלה:** לאפשר שינוי ערכים מרכזיים במקום אחד בלבד
4. **תמיכה ב-Dark Mode:** לספק משתנים מותאמים למצב כהה (עתידי)
5. **Fluid Design:** ליישם עיצוב נזיל באמצעות `clamp()`, `min()`, `max()` ללא Media Queries

### **בעיות שהמערכת פותרת:**

- **בעיה 1:** פיזור CSS Variables בקבצים מרובים, מה שגורם לחוסר עקביות וקושי בתחזוקה
- **בעיה 2:** שימוש בערכים קשיחים (hardcoded) במקום משתנים, מה שמקשה על שינוי עיצוב גלובלי
- **בעיה 3:** חוסר תמיכה ב-Dark Mode עקב חוסר משתנים מותאמים
- **בעיה 4:** שימוש ב-Media Queries לרספונסיביות במקום Fluid Design

### **יתרונות:**

- **יתרון 1:** שינוי עיצוב גלובלי במקום אחד בלבד
- **יתרון 2:** תמיכה עתידית ב-Dark Mode ללא שינוי קוד קיים
- **יתרון 3:** עיצוב נזיל אוטומטי ללא Media Queries
- **יתרון 4:** עקביות מלאה בכל הקומפוננטים והעמודים
- **יתרון 5:** תחזוקה קלה ומהירה של ערכי עיצוב

---

## 🏗️ Architecture

### **מבנה כללי:**

הקובץ `phoenix-base.css` מחולק לשני חלקים עיקריים:

1. **Level 1: CSS Variables (`:root`)**
   - כל המשתנים מוגדרים ב-`:root` כדי להיות זמינים גלובלית
   - משתנים מאורגנים לפי קטגוריות (צבעים, טיפוגרפיה, ריווחים, וכו')
   - תמיכה ב-Dark Mode באמצעות `@media (prefers-color-scheme: dark)`

2. **Level 2: Base Styles**
   - סגנונות בסיסיים ל-HTML elements (`html`, `body`, `h1-h6`, `p`, `a`, `input`, `button`, וכו')
   - סגנונות אלה משתמשים ב-CSS Variables המוגדרים ב-Level 1

### **רכיבים מרכזיים:**

- **`:root` Selector:** מכיל את כל ה-CSS Variables
- **Apple Design System Variables:** משתנים המבוססים על Apple Design System
- **Brand Colors:** צבעי המותג (Primary, Secondary)
- **Semantic Colors:** צבעים סמנטיים (Success, Error, Warning)
- **Entity Colors:** צבעים ספציפיים לישויות (Trades, Ticker, Trading Account, וכו')
- **Typography Variables:** משתני טיפוגרפיה (גופנים, גדלים, משקלים, line-height)
- **Spacing Variables:** משתני ריווח (Fluid Design עם `clamp()`)
- **Shadow Variables:** משתני צללים
- **Border Radius Variables:** משתני רדיוס גבול
- **Z-Index Registry:** רישום מרכזי של כל ערכי z-index במערכת
- **Container Variables:** משתני מיכל (max-width, וכו')
- **Dark Mode Support:** תמיכה במצב כהה (עתידי)

### **תלויות:**

- **אין תלויות חיצוניות:** הקובץ עצמאי לחלוטין
- **תלויות פנימיות:** כל קובצי CSS האחרים תלויים בקובץ זה (חייב להיטען ראשון)

---

## 📋 API / Interface

### **רשימת CSS Variables לפי קטגוריות:**

#### **1. Apple Design System Variables:**

```css
/* Colors */
--apple-blue: #007AFF;
--apple-blue-dark: #0056CC;
--logo-orange: #ff9e04;
--apple-gray-1 עד --apple-gray-11: [גווני אפור]
--apple-red: #FF3B30;
--apple-red-dark: #D70015;
--apple-green: #34C759;
--apple-green-dark: #248A3D;
--apple-orange: #FF9500;
--apple-orange-dark: #CC7700;
--apple-yellow: #FFCC02;
--apple-purple: #AF52DE;
--apple-pink: #FF2D92;

/* Backgrounds */
--apple-bg-primary: #FFFFFF;
--apple-bg-secondary: #F2F2F7;
--apple-bg-tertiary: #FFFFFF;
--apple-bg-elevated: #FFFFFF;
--apple-bg-footer: #2C2C2E;

/* Text Colors */
--apple-text-primary: #000000;
--apple-text-secondary: #3C3C43;
--apple-text-tertiary: #3C3C4399;
--apple-text-quaternary: #3C3C434D;

/* Borders */
--apple-border: #C6C6C8;
--apple-border-light: #E5E5EA;

/* Shadows */
--apple-shadow-light: 0 1px 3px rgba(0, 0, 0, 0.1);
--apple-shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.15);
--apple-shadow-heavy: 0 8px 24px rgba(0, 0, 0, 0.2);

/* Border Radius */
--apple-radius-small: 6px;
--apple-radius-medium: 10px;
--apple-radius-large: 16px;
```

#### **2. Typography Variables (Fluid Design):**

```css
/* Font Families */
--font-family-primary: 'Noto Sans Hebrew', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Alef', sans-serif;
--font-family-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
--font-hebrew: 'Noto Sans Hebrew', sans-serif;
--font-mono: 'Courier New', monospace;

/* Font Sizes (Fluid Design - clamp() for responsive) */
--font-size-xs: clamp(10px, 1vw + 0.3rem, 12px);
--font-size-sm: clamp(12px, 1.5vw + 0.4rem, 14px);
--font-size-base: clamp(14px, 2vw + 0.5rem, 16px);
--font-size-lg: clamp(16px, 2.5vw + 0.6rem, 18px);
--font-size-xl: clamp(18px, 3vw + 0.7rem, 20px);
--font-size-xxl: clamp(20px, 3.5vw + 0.8rem, 24px);
--font-size-xxxl: clamp(24px, 4vw + 1rem, 32px);

/* Font Weights */
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Line Heights */
--line-height-tight: 1.2;
--line-height-normal: 1.4;
--line-height-relaxed: 1.6;
--line-height-loose: 1.8;

/* Letter Spacing */
--letter-spacing-tight: -0.025em;
--letter-spacing-normal: 0;
--letter-spacing-wide: 0.025em;
--letter-spacing-wider: 0.05em;
```

#### **3. Spacing Variables (Fluid Design):**

```css
/* Main Spacing Scale (Fluid Design - clamp() for responsive) */
--spacing-xs: clamp(4px, 0.5vw, 8px);
--spacing-sm: clamp(8px, 1vw, 12px);
--spacing-md: clamp(12px, 1.5vw, 16px);
--spacing-lg: clamp(20px, 2.5vw, 24px);
--spacing-xl: clamp(24px, 3vw, 32px);
--spacing-xxl: clamp(32px, 4vw, 48px);
--spacing-xxxl: clamp(48px, 5vw, 64px);

/* Apple Spacing (Fluid Design - clamp() for responsive) */
--apple-spacing-xs: clamp(4px, 0.5vw, 8px);
--apple-spacing-sm: clamp(8px, 1vw, 12px);
--apple-spacing-md: clamp(12px, 1.5vw, 16px);
--apple-spacing-lg: clamp(20px, 2.5vw, 24px);
--apple-spacing-xl: clamp(24px, 3vw, 32px);

/* Additional Spacing Variables */
--spacing-0: 0;
--spacing-1: 0.25rem;
--spacing-2: 0.5rem;
--spacing-3: 0.75rem;
--spacing-5: 1.25rem;
--spacing-6: 1.5rem;
--spacing-8: 2rem;
--spacing-10: 2.5rem;
--spacing-12: 3rem;
--spacing-16: 4rem;
--spacing-20: 5rem;
--spacing-24: 6rem;
```

#### **4. Brand Colors:**

```css
/* Primary Brand Color */
--color-primary: #26baac;
--color-primary-light: #4dd4c4;
--color-primary-lighter: #7ee8dc;
--color-primary-dark: #1e968a;
--color-primary-darker: #167268;

/* Secondary Brand Color */
--color-secondary: #fc5a06;
--color-secondary-light: #ff7a33;
--color-secondary-lighter: #ff9a66;
--color-secondary-dark: #c84805;
--color-secondary-darker: #943604;

/* Legacy Brand Variables */
--color-brand: #26baac;
--color-brand-hover: #1e968a;
```

#### **5. Semantic Colors:**

```css
/* Success Colors */
--color-success: #10b981;
--color-success-light: #34d399;
--color-success-lighter: #6ee7b7;
--color-success-dark: #059669;
--color-success-darker: #047857;
--color-success-bg: #e6f7f5;

/* Error Colors */
--color-error: #ef4444;
--color-error-light: #f87171;
--color-error-lighter: #fca5a5;
--color-error-dark: #dc2626;
--color-error-darker: #b91c1c;
--color-error-red: var(--apple-red, #FF3B30);
--color-error-red-dark: var(--apple-red-dark, #D70015);

/* Warning Colors */
--color-warning: #f59e0b;
--color-warning-light: #fbbf24;
--color-warning-lighter: #fcd34d;
--color-warning-dark: #d97706;
--color-warning-darker: #b45309;
```

#### **6. Entity Colors:**

```css
/* Trades Entity */
--entity-trades-color: #26baac;
--entity-trades-border: var(--apple-border-light, #e5e5e5);
--entity-trades-bg: var(--apple-bg-elevated, #ffffff);
--entity-trades-text: var(--apple-text-primary, #1d1d1f);

/* Ticker Entity */
--entity-ticker-color: #17a2b8;
--entity-ticker-border: var(--apple-border-light, #e5e5e5);
--entity-ticker-bg: var(--apple-bg-elevated, #ffffff);
--entity-ticker-text: var(--apple-text-primary, #1d1d1f);

/* Trading Account Entity */
--entity-trading-account-color: #28a745;
--entity-trading-account-border: var(--apple-border-light, #e5e5e5);
--entity-trading-account-bg: var(--apple-bg-elevated, #ffffff);
--entity-trading-account-text: var(--apple-text-primary, #1d1d1f);

/* Research Entity */
--entity-research-color: #9c27b0;

/* Execution Entity */
--entity-execution-color: #ff9800;

/* Alert Card Entity Colors */
--alert-card-trades-bg: rgba(38, 186, 172, 0.1);
--alert-card-trades-border: rgba(38, 186, 172, 0.3);
--alert-card-trades-text: #1a8f83;
--alert-card-ticker-bg: rgba(23, 162, 184, 0.1);
--alert-card-ticker-border: rgba(23, 162, 184, 0.3);
--alert-card-ticker-text: #138496;
```

#### **7. Shadow Variables:**

```css
--shadow-none: none;
--shadow-sm: var(--apple-shadow-light);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);
--shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-header: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px;
--shadow-legacy: 0 20px 60px rgba(0, 0, 0, 0.18);
```

#### **8. Border Radius Variables:**

```css
--radius-none: 0;
--radius-sm: 2px;
--radius-md: 4px;
--radius-lg: 8px;
--radius-xl: 12px;
--radius-2xl: 16px;
--radius-full: 9999px;
```

#### **9. Z-Index Registry (MANDATORY):**

```css
/* Main Z-Index Variables */
--z-index-base: 1;
--z-index-dropdown: 100;
--z-index-sticky: 200;
--z-index-header: 950;
--z-index-header-dropdown: 951;
--z-index-header-filter-menu: 952;
--z-index-header-filter-overlay: 953;
--z-index-header-search-dropdown: 954;
--z-index-header-modal: 1000;
--z-index-g-bridge-banner: 10002;

/* Additional Z-Index Variables */
--z-base: 0;
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
```

#### **10. Container Variables:**

```css
--container-max-width: 1400px;
--container-xl: 1400px;
```

#### **11. Header Variables:**

```css
--header-height: 158px;
--header-row1-height: 98px;
--header-row2-height: 60px;
--header-brand: #26baac;
--header-brand-hover: #1e9a8a;
--header-brand-active: #0f766e;
--header-dropdown-item: #29a6a8;
--header-dropdown-item-hover: #ff9e04;
--header-filter-hover: #ff9500;
--header-filter-selected-bg: #f0f9ff;
--header-filter-selected-color: #26baac;
```

#### **12. Text Colors (Semantic):**

```css
--text-primary: #1c1e21;
--text-secondary: #4b4f56;
--text-tertiary: #94a3b8;
--text-inverse: #ffffff;
```

#### **13. Legacy Compatibility Variables:**

```css
--color-surface: var(--apple-bg-elevated);
--color-bg-light: var(--apple-bg-secondary);
--color-bg-main: var(--apple-bg-secondary);
--color-border: var(--apple-border-light);
--color-text-main: var(--apple-text-primary);
--color-text-muted: var(--apple-text-secondary);
--color-white: var(--apple-bg-primary);
--font-main: var(--font-family-primary);
--grid-gutter: var(--spacing-md);
--color-bg-grad: radial-gradient(circle at 10% 20%, #eef2ff 0%, #f8fafc 45%, #e0e7ff 100%);
```

### **Configuration Options:**

- **Fluid Design:** כל משתני הטיפוגרפיה והריווח משתמשים ב-`clamp()` לרספונסיביות אוטומטית
- **Dark Mode Support:** תמיכה במצב כהה באמצעות `@media (prefers-color-scheme: dark)` (עתידי)
- **RTL Support:** כל המשתנים תומכים ב-RTL באמצעות שימוש ב-logical properties

---

## 🔄 Workflow / Lifecycle

### **תהליך עבודה:**

1. **שלב 1: טעינת הקובץ (HTML Loading Order)**
   - הקובץ חייב להיטען **ראשון** בהיררכיית הטעינה של HTML
   - לפני כל קובצי CSS אחרים (Components, Pages, וכו')
   - דוגמה:
     ```html
     <!-- 1. DNA Variables (CSS) - MUST BE FIRST -->
     <link rel="stylesheet" href="ui/src/styles/phoenix-base.css">
     
     <!-- 2. Other CSS files (Components, Pages, etc.) -->
     <link rel="stylesheet" href="ui/src/styles/phoenix-components.css">
     <link rel="stylesheet" href="ui/src/styles/phoenix-header.css">
     ```

2. **שלב 2: הגדרת משתנים (`:root`)**
   - כל המשתנים מוגדרים ב-`:root` selector
   - המשתנים זמינים גלובלית לכל הקומפוננטים והעמודים
   - משתנים יכולים להתייחס למשתנים אחרים (nested variables)

3. **שלב 3: שימוש במשתנים (בקומפוננטים/עמודים)**
   - כל קובצי CSS האחרים משתמשים ב-`var(--variable-name)` כדי לגשת למשתנים
   - דוגמה:
     ```css
     .my-component {
       color: var(--apple-text-primary);
       background-color: var(--apple-bg-elevated);
       padding: var(--spacing-md);
       font-size: var(--font-size-base);
     }
     ```

4. **שלב 4: Dark Mode (עתידי)**
   - כאשר Dark Mode מופעל, המשתנים מתעדכנים אוטומטית באמצעות `@media (prefers-color-scheme: dark)`
   - כל הקומפוננטים והעמודים משתמשים במשתנים המעודכנים ללא שינוי קוד

### **Lifecycle Hooks:**

- **onInit:** המשתנים מוגדרים ב-`:root` בעת טעינת הקובץ
- **onLoad:** המשתנים זמינים לכל הקומפוננטים והעמודים לאחר טעינת הקובץ
- **onDarkModeToggle:** המשתנים מתעדכנים אוטומטית כאשר Dark Mode מופעל/מושבת (עתידי)

---

## ⚠️ Error Handling

### **Error Types:**

- **Error Type 1: משתנה לא קיים**
  - **תיאור:** שימוש במשתנה שלא הוגדר ב-`phoenix-base.css`
  - **קוד שגיאה:** CSS fallback value (אם קיים) או ערך ברירת מחדל של הדפדפן
  - **טיפול:** הוספת המשתנה ל-`phoenix-base.css` או שימוש בערך fallback ב-`var()`

- **Error Type 2: קובץ לא נטען**
  - **תיאור:** הקובץ `phoenix-base.css` לא נטען או נטען אחרי קובצי CSS אחרים
  - **קוד שגיאה:** משתנים לא זמינים, עיצוב לא עקבי
  - **טיפול:** וידוא שהקובץ נטען ראשון בהיררכיית הטעינה

- **Error Type 3: משתנה עם ערך לא תקין**
  - **תיאור:** משתנה מוגדר עם ערך לא תקין (למשל, צבע לא תקין)
  - **קוד שגיאה:** CSS validation error או ערך ברירת מחדל של הדפדפן
  - **טיפול:** תיקון הערך ב-`phoenix-base.css`

### **Error Handling Patterns:**

1. **Fallback Values:**
   - כל שימוש ב-`var()` צריך לכלול ערך fallback
   - דוגמה: `color: var(--apple-text-primary, #000000);`
   - אם המשתנה לא קיים, הערך fallback ישמש

2. **CSS Validation:**
   - בדיקת תקינות CSS באמצעות כלי validation
   - וידוא שכל המשתנים מוגדרים נכון

3. **Browser DevTools:**
   - שימוש ב-Browser DevTools לזיהוי משתנים לא קיימים
   - בדיקת Computed Styles כדי לראות אילו משתנים משמשים

### **Error Codes:**

| Code | Description | HTTP Status |
|:---|:---|:---|
| `CSS_VAR_NOT_FOUND` | משתנה לא קיים ב-`phoenix-base.css` | N/A (CSS) |
| `CSS_FILE_NOT_LOADED` | קובץ `phoenix-base.css` לא נטען | N/A (CSS) |
| `CSS_VAR_INVALID_VALUE` | ערך משתנה לא תקין | N/A (CSS) |

---

## 📊 Examples

### **דוגמה 1: שימוש בסיסי במשתנים**

```css
/* בקובץ CSS של קומפוננט */
.my-button {
  background-color: var(--color-primary);
  color: var(--text-inverse);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-md);
}

.my-button:hover {
  background-color: var(--color-primary-dark);
  box-shadow: var(--shadow-lg);
}
```

### **דוגמה 2: שימוש במשתני Entity**

```css
/* בקובץ CSS של קומפוננט Trades */
.trades-card {
  background-color: var(--entity-trades-bg);
  border: 1px solid var(--entity-trades-border);
  color: var(--entity-trades-text);
}

.trades-card__header {
  color: var(--entity-trades-color);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}
```

### **דוגמה 3: שימוש ב-Fluid Design**

```css
/* בקובץ CSS של קומפוננט */
.responsive-text {
  font-size: var(--font-size-base); /* משתמש ב-clamp() אוטומטית */
  padding: var(--spacing-md); /* משתמש ב-clamp() אוטומטית */
  margin: var(--spacing-lg); /* משתמש ב-clamp() אוטומטית */
}

/* אין צורך ב-Media Queries - הכל אוטומטי! */
```

### **דוגמה 4: שימוש ב-Z-Index Registry**

```css
/* בקובץ CSS של קומפוננט */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky); /* משתמש ב-Z-Index Registry */
}

.modal-overlay {
  position: fixed;
  z-index: var(--z-index-header-modal); /* משתמש ב-Z-Index Registry */
}
```

### **דוגמה 5: שימוש ב-Dark Mode (עתידי)**

```css
/* בקובץ CSS של קומפוננט */
.my-component {
  background-color: var(--apple-bg-primary);
  color: var(--apple-text-primary);
}

/* כאשר Dark Mode מופעל, המשתנים מתעדכנים אוטומטית */
/* אין צורך בשינוי קוד - הכל אוטומטי! */
```

### **דוגמה 6: HTML Loading Order**

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phoenix App</title>
  
  <!-- 1. DNA Variables (CSS) - MUST BE FIRST -->
  <link rel="stylesheet" href="ui/src/styles/phoenix-base.css">
  
  <!-- 2. Components CSS -->
  <link rel="stylesheet" href="ui/src/styles/phoenix-components.css">
  
  <!-- 3. Header CSS -->
  <link rel="stylesheet" href="ui/src/styles/phoenix-header.css">
  
  <!-- 4. Page-specific CSS -->
  <link rel="stylesheet" href="ui/src/styles/D15_DASHBOARD_STYLES.css">
</head>
<body>
  <!-- Page content -->
</body>
</html>
```

---

## 🔗 Dependencies

### **External Dependencies:**

- **אין תלויות חיצוניות:** הקובץ עצמאי לחלוטין ואינו תלוי בספריות חיצוניות

### **Internal Dependencies:**

- **אין תלויות פנימיות:** הקובץ הוא הבסיס לכל המערכת ואינו תלוי בקבצים אחרים

### **SSOT Dependencies:**

- **אין תלויות SSOT:** הקובץ עצמו הוא ה-SSOT ל-CSS Variables

### **Dependencies on This File:**

כל קובצי CSS האחרים במערכת תלויים בקובץ זה:

- `phoenix-components.css` - משתמש במשתנים ל-Components
- `phoenix-header.css` - משתמש במשתנים ל-Header
- `D15_DASHBOARD_STYLES.css` - משתמש במשתנים ל-Dashboard
- `D15_IDENTITY_STYLES.css` - משתמש במשתנים ל-Identity/Auth
- כל קובצי CSS נוספים במערכת

---

## ✅ Checklist

### **Specification:**

- [x] כל הסעיפים מולאו
- [x] דוגמאות קוד נכללו
- [x] תלויות מתועדות (אין תלויות)
- [x] Error handling מתועד
- [x] רשימת משתנים מפורטת נכללה
- [x] היררכיית טעינה מתועדת
- [x] Fluid Design מתועד
- [x] Dark Mode Support מתועד

### **Integration:**

- [x] תיאום עם צוותים אחרים (Team 30, Team 50)
- [x] בדיקת עקביות עם Specs אחרים
- [x] בדיקת עמידה ב-SSOT
- [x] וידוא שהקובץ קיים ופועל (`ui/src/styles/phoenix-base.css`)

### **Documentation:**

- [x] Spec נכתב בהתאם לתבנית
- [x] כל המשתנים מתועדים
- [x] דוגמאות שימוש נכללו
- [x] היררכיית טעינה מתועדת

---

## 📞 קישורים רלוונטיים

### **מקור המנדט:**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BASE_SYSTEMS_DESIGN_MANDATE.md`
- `_COMMUNICATION/team_10/TEAM_10_DESIGN_SPRINT_ALL_TEAMS_MANDATE.md`

### **תיעוד SSOT:**
- `documentation/01-ARCHITECTURE/TT2_SSOT_REGISTRY.md`
- `documentation/04-DESIGN_UX_UI/CSS_CLASSES_INDEX.md`

### **קבצים קשורים:**
- **קובץ DNA Variables:** `ui/src/styles/phoenix-base.css` (SSOT)
- **קובצי CSS תלויים:**
  - `ui/src/styles/phoenix-components.css`
  - `ui/src/styles/phoenix-header.css`
  - `ui/src/styles/D15_DASHBOARD_STYLES.css`
  - `ui/src/styles/D15_IDENTITY_STYLES.css`

### **תיעוד נוסף:**
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_40_DNA_VARIABLES_CLARIFICATION.md`
- `_COMMUNICATION/team_40/TEAM_40_TO_TEAM_10_DESIGN_SPRINT_STATUS.md`

---

## 📝 הערות חשובות

### **1. Single Source of Truth (SSOT):**
- `phoenix-base.css` הוא המקור היחיד לכל ה-CSS Variables במערכת
- **איסור מוחלט** על הגדרת CSS Variables בקבצים אחרים
- כל המשתנים חייבים להיות מוגדרים ב-`phoenix-base.css` בלבד

### **2. היררכיית טעינה:**
- הקובץ **חייב** להיטען ראשון בהיררכיית הטעינה של HTML
- לפני כל קובצי CSS אחרים (Components, Pages, וכו')
- זה מבטיח שכל המשתנים זמינים לכל הקומפוננטים והעמודים

### **3. Fluid Design:**
- כל משתני הטיפוגרפיה והריווח משתמשים ב-`clamp()` לרספונסיביות אוטומטית
- **איסור מוחלט** על Media Queries לרספונסיביות (למעט Dark Mode)
- שימוש ב-`clamp()`, `min()`, `max()` בלבד

### **4. Dark Mode Support:**
- תמיכה במצב כהה באמצעות `@media (prefers-color-scheme: dark)`
- כל המשתנים מתעדכנים אוטומטית כאשר Dark Mode מופעל
- אין צורך בשינוי קוד בקומפוננטים - הכל אוטומטי

### **5. Z-Index Registry:**
- כל ערכי z-index במערכת חייבים להשתמש במשתנים מה-Registry
- **איסור מוחלט** על ערכי z-index קשיחים (hardcoded)
- זה מבטיח היררכיית z-index עקבית ומסודרת

### **6. RTL Support:**
- כל המשתנים תומכים ב-RTL באמצעות שימוש ב-logical properties
- `inset-inline-start` במקום `left`, `inset-inline-end` במקום `right`
- `margin-inline` במקום `margin-left/right`, וכו'

### **7. Fallback Values:**
- כל שימוש ב-`var()` צריך לכלול ערך fallback
- דוגמה: `color: var(--apple-text-primary, #000000);`
- זה מבטיח שהעיצוב יעבוד גם אם משתנה לא קיים

---

**Team 40 (UI Assets & Design) - "שומרי ה-DNA"**  
**תאריך:** 2026-02-06  
**סטטוס:** 📝 **DRAFT - DESIGN SPRINT**

**log_entry | [Team 40] | DNA_VARIABLES_CSS | SPEC_DRAFT | BLUE | 2026-02-06**
