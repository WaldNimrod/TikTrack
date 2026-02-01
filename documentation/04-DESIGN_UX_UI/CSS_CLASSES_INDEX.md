# אינדקס מחלקות CSS - מפה למפתח

**מיקום:** `documentation/04-DESIGN_UX_UI/`  
**אחריות:** Team 40 (UI Assets & Design)  
**תוקף:** מחייב לכל המערכת  
**תאריך עדכון:** 2026-02-01  
**גרסה:** v1.0

---

## 🎯 מטרה

מסמך זה מהווה מפה מרכזית לכל המחלקות CSS החשובות במערכת Phoenix V2. המטרה היא לאפשר שימוש חוזר מסודר בסגנונות אחידים ולמנוע כפילויות ודריסות.

**קישור לנוהל CSS:** `documentation/10-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md`

---

## 📚 היררכיית קבצי CSS

### **סדר טעינה (קריטי!):**
1. **Pico CSS** (CDN) - Reset & Base
2. **phoenix-base.css** - Variables & Base Styles
3. **phoenix-components.css** - LEGO Components
4. **phoenix-header.css** - Unified Header
5. **D15_DASHBOARD_STYLES.css** - Page-specific Styles

---

## 🗂️ קטגוריות מחלקות

### **1. מבנה עמוד (Page Structure)**

#### **`.page-wrapper`**
- **קובץ:** `phoenix-base.css`
- **תפקיד:** ראפר ראשי עם רקע אפור
- **שימוש:** כל עמוד
- **מאפיינים:**
  - `width: 100%`
  - `background-color: var(--apple-bg-secondary)`
  - `overflow-x: hidden !important`
  - `margin: 0; padding: 0`

#### **`.page-container`**
- **קובץ:** `phoenix-base.css`
- **תפקיד:** קונטיינר ממורכז, max-width 1400px
- **שימוש:** כל עמוד
- **מאפיינים:**
  - `max-width: 1400px !important`
  - `margin-inline: auto`
  - `overflow-x: hidden !important`

---

### **2. LEGO Components**

#### **`tt-container`**
- **קובץ:** `phoenix-components.css`
- **תפקיד:** Wrapper לתוכן עם padding אופקי
- **שימוש:** כל עמוד
- **מאפיינים:**
  - `padding-inline: var(--grid-gutter)`
  - `overflow-x: hidden !important`

#### **`tt-section`**
- **קובץ:** `phoenix-components.css`
- **תפקיד:** יחידת תוכן עצמאית
- **שימוש:** כל קונטיינר תוכן
- **מאפיינים:**
  - `background: transparent`
  - `margin-block-start/end: var(--grid-gutter)`

#### **`tt-section-row`**
- **קובץ:** `phoenix-components.css`
- **תפקיד:** חלוקה פנימית ל-Flex/Grid
- **שימוש:** בתוך `tt-section`
- **מאפיינים:**
  - `display: flex`
  - `flex-direction: column`
  - `gap: var(--grid-gutter)`

---

### **3. כותרות קונטיינרים (Container Headers)**

#### **`.index-section__header` / `.dashboard-section__header`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** כותרת קונטיינר ראשי
- **שימוש:** כל קונטיינר תוכן
- **מבנה:** 3 חלקים (Title | Subtitle | Actions)
- **מאפיינים:**
  - `height: 60px !important`
  - `flex-wrap: nowrap !important`
  - `align-items: center`
  - `padding: 0 var(--spacing-lg)`

#### **`.index-section__header-title`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** חלק 1 - כותרת עם איקון
- **מאפיינים:**
  - `flex-shrink: 0`
  - `display: flex`
  - `align-items: center`

#### **`.index-section__header-meta`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** חלק 2 - כותרת משנה (מרכז)
- **מאפיינים:**
  - `flex: 1`
  - `justify-content: center`
  - `align-items: center`

#### **`.index-section__header-count`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** טקסט כותרת משנה
- **מאפיינים:**
  - `text-align: center`
  - `opacity: 0.8`
  - `color: var(--color-brand)`

#### **`.index-section__header-actions`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** חלק 3 - אזור כפתורים
- **מאפיינים:**
  - `flex-shrink: 0`
  - `justify-content: flex-end`
  - `align-items: center`

#### **`.index-section__header-toggle-btn`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** כפתור סגירת סקשן
- **מאפיינים:**
  - `width: 32px`
  - `height: 32px`
  - `border-radius: 4px`

---

### **4. גופי קונטיינרים (Container Bodies)**

#### **`.index-section__body` / `.dashboard-section__body`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** גוף קונטיינר (כרטיס לבן נפרד)
- **מאפיינים:**
  - `background: var(--apple-bg-elevated)`
  - `border-radius: 8px`
  - `padding: var(--spacing-lg)`

---

### **5. וויגיטים (Widgets)**

#### **`.widget-placeholder`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** קונטיינר וויגיט
- **מאפיינים:**
  - `background: var(--apple-bg-elevated)`
  - `border-radius: 8px`
  - `min-height: 200px`

#### **`.widget-placeholder__header`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** כותרת וויגיט (כרטיס נפרד)
- **מאפיינים:**
  - `min-height: 48px`
  - `max-height: 60px`
  - `border-bottom: 1px solid`

#### **`.widget-placeholder__header-title-row`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** שורת כותרת וויגיט
- **מאפיינים:**
  - `height: 40px !important`
  - `align-items: center`
  - `padding: 0 var(--spacing-md)`

#### **`.widget-placeholder__title`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** כותרת וויגיט
- **מאפיינים:**
  - `font-size: clamp(0.875rem, 2vw, 1rem)`
  - `font-weight: 600`
  - `display: flex`
  - `align-items: center`

#### **`.widget-placeholder__title-icon`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** איקון כותרת וויגיט
- **מאפיינים:**
  - `width: 20px`
  - `height: 20px`
  - `flex-shrink: 0`

#### **`.widget-placeholder__refresh-btn`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** כפתור רענון וויגיט
- **מאפיינים:**
  - `width: 32px`
  - `height: 32px`
  - `border-radius: 4px`

#### **`.widget-placeholder__body`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** גוף וויגיט (כרטיס נפרד)
- **מאפיינים:**
  - `background: var(--apple-bg-elevated)`
  - `border-radius: 8px`

---

### **6. Header (אלמנט ראש הדף)**

#### **`#unified-header`**
- **קובץ:** `phoenix-header.css`
- **תפקיד:** Header ראשי
- **מאפיינים:**
  - `height: 120px !important`
  - `z-index: 950`
  - `position: sticky`

#### **`.header-top`**
- **קובץ:** `phoenix-header.css`
- **תפקיד:** שורה עליונה של Header
- **מאפיינים:**
  - `height: 60px`
  - `border-bottom: 1px solid`

#### **`.header-container`**
- **קובץ:** `phoenix-header.css`
- **תפקיד:** קונטיינר Header
- **מאפיינים:**
  - `max-width: 1400px`
  - `margin: 0 auto`
  - `padding: 0 10px`

#### **`.logo-image`**
- **קובץ:** `phoenix-header.css`
- **תפקיד:** תמונת לוגו
- **מאפיינים:**
  - `width: 125px !important`
  - `height: 37.5px !important`

#### **`.logo-text`**
- **קובץ:** `phoenix-header.css`
- **תפקיד:** טקסט סלוגן
- **מאפיינים:**
  - `font-size: 1rem !important`
  - `font-weight: 300 !important`
  - `color: #26baac !important`

---

### **7. פילטרים (Filters)**

#### **`.portfolio-header-filters`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** קונטיינר פילטרים פורטפוליו
- **מאפיינים:**
  - `flex-wrap: nowrap !important`
  - `align-items: center`
  - `height: 100%`

#### **`.portfolio-filter-select`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** Dropdown פילטר
- **מאפיינים:**
  - `height: 32px`
  - `width: 50%`
  - `max-width: 200px`

#### **`.portfolio-side-filter-btn`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** כפתור פילטר צד
- **מאפיינים:**
  - `width: 32px`
  - `height: 32px`
  - `border-radius: 4px`

---

### **8. טבלאות (Tables)**

#### **`.portfolio-table-wrapper`**
- **קובץ:** `D15_DASHBOARD_STYLES.css`
- **תפקיד:** Wrapper לטבלת פורטפוליו
- **מאפיינים:**
  - `overflow-x: auto`
  - `border-radius: 8px`

---

## 🎨 לוגיקת הגדרת מחלקות

### **עקרון 1: BEM Naming Convention**
```
.block__element--modifier
```

**דוגמאות:**
- `.index-section__header` (Block: `index-section`, Element: `header`)
- `.widget-placeholder__title-icon` (Block: `widget-placeholder`, Element: `title-icon`)
- `.portfolio-filter-select` (Block: `portfolio-filter`, Element: `select`)

### **עקרון 2: Specificity Hierarchy**
1. **Base Styles** (`phoenix-base.css`) - נמוכה
2. **Components** (`phoenix-components.css`) - בינונית
3. **Page-specific** (`D15_DASHBOARD_STYLES.css`) - גבוהה

### **עקרון 3: CSS Variables בלבד**
```css
/* ✅ נכון */
color: var(--apple-text-primary);

/* ❌ שגוי */
color: #1d1d1f;
```

### **עקרון 4: Fixed Heights עם !important**
```css
/* ✅ נכון */
height: 60px !important;
min-height: 60px !important;
max-height: 60px !important;

/* ❌ שגוי */
height: 60px;
```

### **עקרון 5: Overflow Prevention**
```css
/* ✅ נכון */
overflow-x: hidden !important;
width: 100%;
max-width: 100%;

/* ❌ שגוי */
overflow-x: auto;
```

---

## 📋 טבלת מחלקות מהירה

| מחלקה | קובץ | שימוש | גובה קבוע |
|------|------|------|-----------|
| `.page-wrapper` | phoenix-base.css | כל עמוד | - |
| `.page-container` | phoenix-base.css | כל עמוד | - |
| `tt-container` | phoenix-components.css | כל עמוד | - |
| `tt-section` | phoenix-components.css | כל קונטיינר | - |
| `.index-section__header` | D15_DASHBOARD_STYLES.css | כותרת קונטיינר | 60px |
| `.widget-placeholder__header-title-row` | D15_DASHBOARD_STYLES.css | כותרת וויגיט | 40px |
| `#unified-header` | phoenix-header.css | Header | 120px |
| `.header-top` | phoenix-header.css | שורה עליונה | 60px |

---

## 🔍 חיפוש מחלקות לפי תפקיד

### **כותרות:**
- `.index-section__header` - כותרת קונטיינר ראשי
- `.widget-placeholder__header-title-row` - כותרת וויגיט
- `#unified-header` - Header עמוד

### **גופים:**
- `.index-section__body` - גוף קונטיינר
- `.widget-placeholder__body` - גוף וויגיט

### **כפתורים:**
- `.index-section__header-toggle-btn` - כפתור סגירה
- `.widget-placeholder__refresh-btn` - כפתור רענון
- `.portfolio-side-filter-btn` - כפתור פילטר

### **פילטרים:**
- `.portfolio-header-filters` - קונטיינר פילטרים
- `.portfolio-filter-select` - Dropdown פילטר

---

## ⚠️ כללים למניעת כפילויות

### **1. בדיקה לפני יצירת מחלקה חדשה:**
- [ ] האם יש מחלקה קיימת שמתאימה?
- [ ] האם אפשר להרחיב מחלקה קיימת?
- [ ] האם זה באמת צריך מחלקה חדשה?

### **2. שימוש חוזר:**
- **תמיד** להשתמש במחלקות קיימות לפני יצירת חדשות
- **תמיד** לבדוק את האינדקס הזה לפני יצירת מחלקה

### **3. תיעוד:**
- כל מחלקה חדשה חייבת להיות מתועדת כאן
- כל שינוי במחלקה קיימת חייב להיות מתועד

---

## 🔗 קישורים רלוונטיים

- `documentation/10-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md` - נוהל CSS מלא
- `documentation/04-DESIGN_UX_UI/CONTAINER_HEADER_STRUCTURE_GUIDELINES.md` - הנחיות כותרות
- `documentation/04-DESIGN_UX_UI/SYSTEM_WIDE_DESIGN_PATTERNS.md` - תובנות מערכתיות
- `_COMMUNICATION/team_31/team_31_staging/phoenix-base.css` - יישום בפועל
- `_COMMUNICATION/team_31/team_31_staging/phoenix-components.css` - יישום בפועל
- `_COMMUNICATION/team_31/team_31_staging/D15_DASHBOARD_STYLES.css` - יישום בפועל

---

**Team 40 (UI Assets & Design)**  
**Date:** 2026-02-01  
**Status:** ✅ **MANDATORY INDEX - ALL DEVELOPERS MUST USE**
