# 📋 הודעה למימוש סגנונות טבלאות (D16_ACCTS_VIEW)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 40 (UI/Design)  
**תאריך:** 2026-02-03  
**סטטוס:** 🟢 **READY TO START**  
**עדיפות:** 🔴 **CRITICAL - FOUNDATION FOR ALL TABLES**

---

## 🎯 מטרת המשימה

יצירת סגנונות CSS מלאים למערכת הטבלאות בהתאם לבלופרינט המאושר מ-Team 31 (v1.0.13). סגנונות אלה ישמשו כבסיס לכל הטבלאות במערכת.

---

## 📊 סקירה כללית

### **הקובץ הקיים:**
- מיקום: `ui/src/styles/phoenix-components.css`
- סטטוס: מכיל סגנונות LEGO System, חסרים סגנונות טבלאות

### **הבלופרינט:**
- מיקום: `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D16_ACCTS_VIEW.html`
- סטטוס: מכיל inline styles רבים שצריכים להיות מועברים ל-CSS

---

## 📋 משימות מפורטות

### **שלב 1: יצירת סגנונות טבלאות בסיסיים** 🔴 **CRITICAL**

**תאריך יעד:** 2026-02-04

#### **משימה 1.1: הוספת סקשן TABLES SYSTEM**
- **מיקום:** `ui/src/styles/phoenix-components.css`
- **פעולה:** הוספת סקשן `/* TABLES SYSTEM */` בסוף הקובץ
- **דרישות:**
  - העברת כל הסגנונות מ-inline styles של הבלופרינט לקובץ CSS
  - יישום כל המחלקות עם תחילית `phoenix-table-*`
  - שימוש בלעדי ב-CSS Variables (אין ערכי צבע hardcoded)

#### **משימה 1.2: מבנה מחלקות CSS**
- **מחלקות חובה:**
  - `.phoenix-table-wrapper` - Wrapper חיצוני לטבלה
  - `.phoenix-table` - הטבלה עצמה
  - `.phoenix-table__head` - אזור ה-head
  - `.phoenix-table__body` - אזור ה-body
  - `.phoenix-table__row` - שורה בטבלה
  - `.phoenix-table__header` - תא כותרת
  - `.phoenix-table__header-text` - טקסט כותרת
  - `.phoenix-table__sort-indicator` - אינדיקטור סידור
  - `.phoenix-table__sort-icon` - אייקון סידור
  - `.phoenix-table__cell` - תא רגיל
  - `.phoenix-table__cell--numeric` - תא מספרי
  - `.phoenix-table__cell--currency` - תא מטבע
  - `.phoenix-table__cell--date` - תא תאריך
  - `.phoenix-table__cell--status` - תא סטטוס
  - `.phoenix-table__cell--actions` - תא פעולות

---

### **שלב 2: יישום ברירות מחדל מערכתיות** 🔴 **CRITICAL**

**תאריך יעד:** 2026-02-04

#### **משימה 2.1: ריווח (Spacing)**
- **ברירת מחדל מערכתית:**
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

- **מחלקות ריווח סטנדרטיות:**
  - `.spacing-xs` / `.padding-xs`: `2px`
  - `.spacing-sm` / `.padding-sm`: `4px`
  - `.spacing-md` / `.padding-md`: `8px`
  - `.spacing-lg` / `.padding-lg`: `10px`
  - `.spacing-xl` / `.padding-xl`: `12px`
  - `.margin-xs`: `2px`
  - `.margin-sm`: `4px`
  - `.margin-md`: `8px`
  - `.margin-lg`: `10px`
  - `.margin-xl`: `12px`

#### **משימה 2.2: יישור עמודות**
- **כל העמודות המספריות:** `text-align: center` (לא ימין/שמאל)
- **כל כותרות העמודות:** `text-align: center`

**יישום:**
```css
/* כל העמודות המספריות - יישור למרכז */
.phoenix-table__cell--numeric,
.phoenix-table__cell--currency,
.phoenix-table__cell.col-balance,
.phoenix-table__cell.col-amount,
.phoenix-table__cell.col-total-pl,
.phoenix-table__cell.col-current_price,
.phoenix-table__cell.col-avg-price,
.phoenix-table__cell.col-market-value,
.phoenix-table__cell.col-unrealized-pl,
.phoenix-table__cell.col-percent-account,
.phoenix-table__cell.col-quantity,
.phoenix-table__cell.col-positions,
.phoenix-table__cell.col-account-value,
.phoenix-table__cell.col-holdings-value {
  text-align: center !important;
}

/* כל כותרות העמודות - יישור למרכז */
.phoenix-table__header {
  text-align: center;
}
```

---

### **שלב 3: יישום פורמטי תצוגה מיוחדים** 🔴 **CRITICAL**

**תאריך יעד:** 2026-02-04

#### **משימה 3.1: עמודת נוכחי (`col-current_price`)**
- **פורמט תצוגה:** `$155.34(+3.22%)`
- **מבנה HTML:**
```html
<div class="current-price-display">
  <span class="numeric-value-positive" dir="ltr">$155.34</span>
  <span class="numeric-value-positive" dir="ltr" style="font-size: 0.85em;">(+3.22%)</span>
</div>
```

#### **משימה 3.2: עמודת P/L (`col-unrealized-pl`)**
- **פורמט תצוגה:** `+$550.0(+3.5%)` (סיפרה אחת אחרי הנקודה)
- **מבנה HTML:**
```html
<div class="pl-display">
  <span class="pl-value numeric-value-positive" dir="ltr">+$550.0</span>
  <span class="pl-percentage numeric-value-positive" dir="ltr">(+3.5%)</span>
</div>
```

#### **משימה 3.3: באגטים (Badges)**
- **עיצוב סטנדרטי:**
  - רקע: `rgba(color, 0.3)` (0.3 alpha)
  - מסגרת: `1px solid` עם אותו צבע
  - צבע טקסט: צבע מלא בהתאם לסוג
  - פדינג: `2px 8px`
  - border-radius: `4px`

**יישום:**
```css
.phoenix-table__status-badge {
  background: rgba(52, 199, 89, 0.3); /* Green with 0.3 alpha */
  border: 1px solid var(--apple-green, #34C759);
  color: var(--apple-green, #34C759);
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}
```

---

### **שלב 4: יישום תפריט פעולות** 🔴 **CRITICAL**

**תאריך יעד:** 2026-02-04

#### **משימה 4.1: תפריט פעולות (Action Menu)**
- **מאפיינים קריטיים:**
  - נפתח במעבר עכבר (hover) - **לא** מוצג קבוע
  - דיליי לסגירה: `0.5s` (לא `0.3s`)
  - פדינג לקונטיינר: `4px`
  - מיקום: `inset-inline-end: calc(100% + 1px)` (צמוד מאוד לכפתור)
  - כפתורים: `margin: 0`, `padding: 0` - רק פדינג לקונטיינר

**יישום:**
```css
.table-actions-menu {
  padding: 4px; /* Only padding for container */
  inset-inline-end: calc(100% + 1px); /* Very close to trigger button */
  transition-delay: 0.5s; /* Delay for closing */
}

.table-action-btn {
  margin: 0;
  padding: 0; /* No padding for buttons themselves */
}
```

---

### **שלב 5: יישום פילטרים פנימיים** 🟡 **PENDING**

**תאריך יעד:** 2026-02-04

#### **משימה 5.1: פילטרים פנימיים**
- **מאפיינים:**
  - אין `width: 100%` - יש להשתמש ב-`width: auto` עם `min-width` מתאים
  - מבנה: `.phoenix-table-filters` עם `.phoenix-table-filter-group`
  - יישור: `display: flex` עם `align-items: center`

**יישום:**
```css
.phoenix-table-filters {
  width: auto !important; /* Remove 100% width */
  max-width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm, 8px);
  margin: 0;
  padding: 0;
}

.phoenix-table-filter-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  margin: 0;
  padding: 0;
  width: auto !important; /* Remove 100% width */
}

.phoenix-table-filter-select,
.phoenix-table-filter-input {
  width: auto !important; /* Remove 100% width */
  min-width: 150px;
  margin: 0;
  padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
}
```

---

### **שלב 6: יישום מצבי מעבר עכבר (Hover States)** 🟡 **PENDING**

**תאריך יעד:** 2026-02-04

#### **משימה 6.1: מצבי מעבר עכבר**
- **ברירת מחדל:**
  - מעבר עכבר על אלמנטים (כמו כפתורי סידור) משנה את צבע הטקסט לצבע משני (`--apple-text-secondary`)
  - **ללא** מסגרת
  - **ללא** צבע ירוק/outline

**יישום:**
```css
.phoenix-table__header[data-sortable="true"]:hover,
.phoenix-table__header.js-table-sort-trigger:hover {
  color: var(--apple-text-secondary, #3C3C43) !important;
  background: transparent !important;
  border: none !important;
  outline: none !important;
}
```

---

### **שלב 7: יישום אלמנט חלוקה לעמודים (Pagination)** 🟡 **PENDING**

**תאריך יעד:** 2026-02-04

#### **משימה 7.1: אלמנט חלוקה לעמודים**
- **מאפיינים:**
  - כפתורים ומספר עמוד: `margin: 0`, `padding: 0`
  - אין `margin-bottom: 14.7px` - יש לבטל ל-`0`

**יישום:**
```css
.phoenix-table-pagination__button,
.phoenix-table-pagination__page-number {
  padding: 0;
  margin: 0;
}
```

---

## ⚠️ כללים קריטיים

### **1. CSS Variables בלבד**
- כל הערכים חייבים להשתמש ב-CSS Variables
- אין ערכי צבע hardcoded
- אין ערכי ריווח hardcoded

### **2. סדר טעינת CSS**
- הסגנונות חייבים להיות ב-`phoenix-components.css`
- הקובץ נטען אחרי `phoenix-base.css` ולפני `phoenix-header.css`

### **3. Naming Convention**
- כל המחלקות עם תחילית `phoenix-table-*`
- BEM methodology: `.phoenix-table__header`, `.phoenix-table__cell`

### **4. Responsive Design**
- שימוש ב-`clamp()`, `min()`, `max()` עבור גדלי פונטים וריווחים
- אין media queries עבור גדלי פונטים וריווחים (רק dark mode)

---

## 📞 קישורים רלוונטיים

- **בלופרינט מאושר:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D16_ACCTS_VIEW.html`
- **מפרט טבלאות:** `_COMMUNICATION/team_31/team_31_staging/PHOENIX_TABLES_SPECIFICATION.md`
- **תוכנית עבודה:** `_COMMUNICATION/team_10/TEAM_10_D16_ACCTS_VIEW_IMPLEMENTATION_PLAN.md`

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-03  
**סטטוס:** 🟢 **READY TO START**  
**עדיפות:** 🔴 **CRITICAL**
