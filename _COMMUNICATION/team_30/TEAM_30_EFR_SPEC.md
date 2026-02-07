# Entity Field Renderer (EFR) Specification

**id:** `TEAM_30_EFR_SPEC`  
**owner:** Team 30 (Frontend Execution)  
**status:** 📝 **DRAFT - DESIGN SPRINT**  
**last_updated:** 2026-01-31  
**version:** v1.0 (Design Sprint)

---

## 📢 Executive Summary

**Entity Field Renderer (EFR)** הוא מנוע רינדור אחיד לטבלאות במערכת Phoenix. המערכת מספקת API מרכזי לרינדור שדות בטבלאות (סכומים, תאריכים, באדג'ים) בצורה עקבית וניתנת לתחזוקה.

**למה נחוץ:**
- רינדור אחיד של שדות בכל הטבלאות במערכת
- מניעת קוד כפול וטעויות עקביות
- תמיכה בפורמטים מורכבים (מטבעות, תאריכים, באדג'ים צבעוניים)
- אינטגרציה עם `tableFormatters.js` הקיים

**איך משתלב:**
- משתמש ב-`tableFormatters.js` כבסיס לפורמט
- מספק API לרינדור HTML elements
- עובד עם טבלאות Phoenix (`phoenix-table`)
- משתלב עם UAI RenderStage

---

## 🎯 Purpose & Goals

### **מטרות עיקריות:**
- **רינדור אחיד:** רינדור עקבי של שדות בכל הטבלאות
- **API מרכזי:** נקודת גישה אחת לכל סוגי הרינדור
- **תמיכה בפורמטים:** מטבעות, תאריכים, באדג'ים, מספרים
- **אינטגרציה:** שימוש ב-`tableFormatters.js` הקיים

### **בעיות שהמערכת פותרת:**
- **קוד כפול:** כל טבלה מטפלת בעצמה ברינדור
- **חוסר עקביות:** פורמטים שונים באותם סוגי שדות
- **קושי בתחזוקה:** שינוי פורמט דורש עדכון בכל הטבלאות
- **טעויות:** פורמט שגוי או לא עקבי

### **יתרונות:**
- **עקביות:** כל השדות מאותו סוג נראים אותו דבר
- **תחזוקה קלה:** שינוי פורמט במקום אחד משפיע על הכל
- **ביצועים:** רינדור יעיל עם caching
- **גמישות:** תמיכה בפורמטים מותאמים אישית

---

## 🏗️ Architecture

### **מבנה כללי:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Entity Field Renderer                    │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   Formatter  │───▶│   Renderer   │───▶│   HTML DOM  │ │
│  │   (EFR)      │    │   (EFR)      │    │   Element   │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│         │                    │                    │         │
│         └────────────────────┴────────────────────┘         │
│                          │                                   │
│                    ┌──────────────┐                         │
│                    │ tableFormatters│                        │
│                    │    (SSOT)     │                        │
│                    └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### **רכיבים מרכזיים:**

#### **1. EFRCore (Main Controller)**
- מנהל את כל פעולות הרינדור
- מספק API מרכזי
- מטפל ב-caching וב-optimization

#### **2. FieldRenderers (Specialized Renderers)**
- `CurrencyRenderer` - רינדור מטבעות
- `DateRenderer` - רינדור תאריכים
- `BadgeRenderer` - רינדור באדג'ים
- `NumericRenderer` - רינדור מספרים
- `StatusRenderer` - רינדור סטטוס

#### **3. FormatterAdapter**
- מתאם בין `tableFormatters.js` ל-EFR
- מספק interface אחיד

### **תלויות:**
- `tableFormatters.js` (SSOT) - פונקציות פורמט
- `phoenix-components.css` - סגנונות לרינדור
- DOM APIs - יצירת אלמנטים

---

## 📋 API / Interface

### **Public Methods / Functions:**

#### **1. EFRCore.render() - רינדור שדה**

```javascript
/**
 * Render field value based on field type
 * @param {string} fieldType - Type of field (currency, date, badge, numeric, status)
 * @param {any} value - Field value
 * @param {Object} options - Render options
 * @returns {HTMLElement} Rendered HTML element
 * 
 * @example
 * const element = EFR.render('currency', 1234.56, { currency: 'USD', showSign: true });
 * // Returns: <span class="numeric-value-positive" dir="ltr">+$1,234.56</span>
 */
EFRCore.render(fieldType, value, options = {})
```

#### **2. EFRCore.renderCurrency() - רינדור מטבע**

```javascript
/**
 * Render currency value
 * @param {number} amount - Amount to render
 * @param {Object} options - Options: { currency, showSign, decimals, className }
 * @returns {HTMLElement} Rendered currency element
 * 
 * @example
 * const element = EFR.renderCurrency(1234.56, { 
 *   currency: 'USD', 
 *   showSign: true,
 *   decimals: 2
 * });
 * // Returns: <span class="numeric-value-positive" dir="ltr">+$1,234.56</span>
 */
EFRCore.renderCurrency(amount, options = {})
```

#### **3. EFRCore.renderDate() - רינדור תאריך**

```javascript
/**
 * Render date value
 * @param {Date|string} date - Date to render
 * @param {Object} options - Options: { format, className }
 * @returns {HTMLElement} Rendered date element
 * 
 * @example
 * const element = EFR.renderDate(new Date('2026-02-01'));
 * // Returns: <span class="phoenix-table__cell--date">01/02/2026</span>
 */
EFRCore.renderDate(date, options = {})
```

#### **4. EFRCore.renderBadge() - רינדור באדג'**

```javascript
/**
 * Render badge (status, operation type, etc.)
 * @param {string} text - Badge text
 * @param {Object} options - Options: { type, category, className, dataAttributes }
 * @returns {HTMLElement} Rendered badge element
 * 
 * @example
 * const element = EFR.renderBadge('הפקדה', { 
 *   type: 'operation',
 *   operationType: 'deposit',
 *   isPositive: true
 * });
 * // Returns: <span class="operation-type-badge" data-operation-type="deposit" data-type-positive="true">הפקדה</span>
 */
EFRCore.renderBadge(text, options = {})
```

#### **5. EFRCore.renderNumeric() - רינדור מספרי**

```javascript
/**
 * Render numeric value with color coding
 * @param {number} value - Numeric value
 * @param {Object} options - Options: { decimals, showSign, className }
 * @returns {HTMLElement} Rendered numeric element
 * 
 * @example
 * const element = EFR.renderNumeric(1234.56, { decimals: 2, showSign: true });
 * // Returns: <span class="numeric-value-positive" dir="ltr">+1,234.56</span>
 */
EFRCore.renderNumeric(value, options = {})
```

#### **6. EFRCore.renderStatus() - רינדור סטטוס**

```javascript
/**
 * Render status badge
 * @param {string} status - Status text
 * @param {Object} options - Options: { category, className }
 * @returns {HTMLElement} Rendered status badge
 * 
 * @example
 * const element = EFR.renderStatus('פעיל', { category: 'active' });
 * // Returns: <span class="phoenix-table__status-badge phoenix-table__status-badge--active">פעיל</span>
 */
EFRCore.renderStatus(status, options = {})
```

### **Configuration Options:**

#### **Global Configuration:**
```javascript
EFRCore.config({
  defaultCurrency: 'USD',
  defaultDateFormat: 'DD/MM/YYYY',
  defaultDecimals: 2,
  enableCaching: true
});
```

#### **Field-Specific Options:**
- **Currency:** `currency`, `showSign`, `decimals`, `className`
- **Date:** `format`, `className`, `showTime`
- **Badge:** `type`, `category`, `operationType`, `isPositive`, `dataAttributes`
- **Numeric:** `decimals`, `showSign`, `className`
- **Status:** `category`, `className`

---

## 🔄 Workflow / Lifecycle

### **תהליך עבודה:**

1. **Initialization:**
   - EFR נטען עם העמוד
   - מתחבר ל-`tableFormatters.js`
   - מאתחל cache (אם מופעל)

2. **Render Request:**
   - קוד קורא ל-`EFR.render()` או ל-renderer ספציפי
   - EFR מזהה את סוג השדה
   - בוחר renderer מתאים

3. **Formatting:**
   - EFR קורא ל-`tableFormatters.js` לפורמט הטקסט
   - יוצר HTML element
   - מוסיף classes ו-attributes

4. **Return:**
   - מחזיר HTML element מוכן
   - Element מוכנס ל-DOM

### **Lifecycle Hooks:**

- **onInit:** נקרא בעת אתחול EFR
- **onRender:** נקרא לפני כל רינדור
- **onError:** נקרא בעת שגיאה

---

## ⚠️ Error Handling

### **Error Types:**

- **EFR_INVALID_FIELD_TYPE:** סוג שדה לא תקין
- **EFR_INVALID_VALUE:** ערך לא תקין
- **EFR_FORMATTER_ERROR:** שגיאה בפורמט

### **Error Handling Patterns:**

```javascript
try {
  const element = EFR.render('currency', amount, options);
} catch (error) {
  // Fallback: render as plain text
  const fallback = document.createElement('span');
  fallback.textContent = String(amount || '');
  fallback.className = 'efr-error';
  return fallback;
}
```

### **Error Codes:**

| Code | Description | HTTP Status |
|:---|:---|:---|
| `EFR_INVALID_FIELD_TYPE` | Invalid field type provided | N/A |
| `EFR_INVALID_VALUE` | Invalid value for field type | N/A |
| `EFR_FORMATTER_ERROR` | Error in formatter function | N/A |

---

## 📊 Examples

### **דוגמה 1: שימוש בסיסי - רינדור מטבע**

```javascript
// In table initialization
const amountCell = document.createElement('td');
const amount = flow.amount || 0;
const currency = flow.currency || 'USD';

// Using EFR
const amountElement = EFR.renderCurrency(amount, {
  currency: currency,
  showSign: true,
  decimals: 2
});

amountCell.appendChild(amountElement);
```

### **דוגמה 2: רינדור תאריך**

```javascript
// In table initialization
const dateCell = document.createElement('td');
const date = flow.date || '';

// Using EFR
const dateElement = EFR.renderDate(date, {
  format: 'DD/MM/YYYY',
  className: 'phoenix-table__cell--date'
});

dateCell.appendChild(dateElement);
```

### **דוגמה 3: רינדור באדג' סוג פעולה**

```javascript
// In table initialization
const typeCell = document.createElement('td');
const flowType = flow.type || '';
const isPositive = flowType === 'deposit' || flowType === 'execution';

// Using EFR
const badgeElement = EFR.renderBadge(flowType, {
  type: 'operation',
  operationType: flowType.toLowerCase(),
  isPositive: isPositive
});

typeCell.appendChild(badgeElement);
```

### **דוגמה 4: רינדור מספרי עם צבע**

```javascript
// In table initialization
const balanceCell = document.createElement('td');
const balance = account.balance || 0;

// Using EFR
const balanceElement = EFR.renderNumeric(balance, {
  decimals: 2,
  showSign: true,
  currency: 'USD' // Optional: adds currency formatting
});

balanceCell.appendChild(balanceElement);
```

### **דוגמה 5: שימוש ב-EFR.render() כללי**

```javascript
// Generic render based on field type
const renderField = (fieldType, value, options) => {
  return EFR.render(fieldType, value, options);
};

// Usage
const currencyElement = renderField('currency', 1234.56, { currency: 'USD' });
const dateElement = renderField('date', new Date());
const badgeElement = renderField('badge', 'פעיל', { category: 'active' });
```

### **דוגמה 6: אינטגרציה עם UAI RenderStage**

```javascript
// In RenderStage
async function renderTableRow(data) {
  const row = document.createElement('tr');
  
  // Amount cell
  const amountCell = document.createElement('td');
  amountCell.appendChild(EFR.renderCurrency(data.amount, {
    currency: data.currency,
    showSign: true
  }));
  row.appendChild(amountCell);
  
  // Date cell
  const dateCell = document.createElement('td');
  dateCell.appendChild(EFR.renderDate(data.date));
  row.appendChild(dateCell);
  
  // Type badge
  const typeCell = document.createElement('td');
  typeCell.appendChild(EFR.renderBadge(data.type, {
    type: 'operation',
    operationType: data.type.toLowerCase()
  }));
  row.appendChild(typeCell);
  
  return row;
}
```

---

## 🔗 Dependencies

### **External Dependencies:**
- אין (רק DOM APIs)

### **Internal Dependencies:**
- `tableFormatters.js` (SSOT) - פונקציות פורמט
- `phoenix-components.css` - סגנונות לרינדור
- `phoenix-base.css` - משתני CSS (DNA variables)

### **SSOT Dependencies:**
- `tableFormatters.js` v1.0 - פונקציות פורמט (SSOT)
- `transformers.js` v1.2 - המרת נתונים (אם נדרש)

### **Integration Points:**
- **UAI RenderStage:** EFR משמש לרינדור בטבלאות
- **Table Init Modules:** כל table init משתמש ב-EFR
- **PhoenixTableSortManager:** EFR מספק elements לרינדור

---

## 🏗️ Implementation Details

### **File Structure:**

```
ui/src/cubes/shared/
├── tableFormatters.js (existing - SSOT)
└── EntityFieldRenderer.js (new - EFR)
    ├── EFRCore.js
    ├── renderers/
    │   ├── CurrencyRenderer.js
    │   ├── DateRenderer.js
    │   ├── BadgeRenderer.js
    │   ├── NumericRenderer.js
    │   └── StatusRenderer.js
    └── FormatterAdapter.js
```

### **Class Structure:**

```javascript
// EFRCore.js
class EFRCore {
  constructor() {
    this.formatters = window.tableFormatters;
    this.renderers = {
      currency: new CurrencyRenderer(),
      date: new DateRenderer(),
      badge: new BadgeRenderer(),
      numeric: new NumericRenderer(),
      status: new StatusRenderer()
    };
    this.cache = new Map();
  }
  
  render(fieldType, value, options) {
    const renderer = this.renderers[fieldType];
    if (!renderer) {
      throw new Error(`EFR_INVALID_FIELD_TYPE: ${fieldType}`);
    }
    return renderer.render(value, options, this.formatters);
  }
  
  renderCurrency(amount, options) {
    return this.render('currency', amount, options);
  }
  
  // ... other render methods
}

// CurrencyRenderer.js
class CurrencyRenderer {
  render(amount, options, formatters) {
    const { currency = 'USD', showSign = false, decimals = 2 } = options;
    
    const formatted = formatters.formatCurrency(amount, currency, decimals);
    const element = document.createElement('span');
    
    if (showSign && amount > 0) {
      element.textContent = `+${formatted}`;
    } else {
      element.textContent = formatted;
    }
    
    element.className = amount >= 0 ? 'numeric-value-positive' : 'numeric-value-negative';
    element.setAttribute('dir', 'ltr');
    
    return element;
  }
}
```

---

## ✅ Checklist

### **Specification:**
- [x] כל הסעיפים מולאו
- [x] דוגמאות קוד נכללו
- [x] תלויות מתועדות
- [x] Error handling מתועד
- [x] התייחסות ל-`tableFormatters.js` הקיים
- [x] אינטגרציה עם UAI מתועדת

### **Integration:**
- [x] תיאום עם UAI RenderStage
- [x] בדיקת עקביות עם `tableFormatters.js` (SSOT)
- [x] בדיקת עמידה ב-SSOT
- [x] תמיכה בטבלאות קיימות (D18, D21)

---

## 📞 קישורים רלוונטיים

- **מקור המנדט:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BASE_SYSTEMS_DESIGN_MANDATE.md`
- **תיעוד SSOT:** `documentation/01-ARCHITECTURE/TT2_SSOT_REGISTRY.md`
- **קבצים קשורים:**
  - `ui/src/cubes/shared/tableFormatters.js` (SSOT)
  - `ui/src/components/core/UnifiedAppInit.js` (UAI - RenderStage)
  - `ui/src/views/financial/cashFlows/cashFlowsTableInit.js` (דוגמת שימוש)
  - `ui/src/views/financial/brokersFees/brokersFeesTableInit.js` (דוגמת שימוש)

---

**Team 30 (Frontend Execution)**  
**תאריך:** 2026-01-31  
**סטטוס:** 📝 **DRAFT - DESIGN SPRINT**

**log_entry | [Team 30] | EFR | SPEC_DRAFT | BLUE | 2026-01-31**
