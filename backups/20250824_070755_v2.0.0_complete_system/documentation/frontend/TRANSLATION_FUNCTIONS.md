# Translation Functions - TikTrack Frontend

## Overview
This document provides detailed documentation for all translation functions in the TikTrack system. All translation functions are centralized in `trading-ui/scripts/translation-utils.js`.

## 🎯 **Purpose**
The translation functions provide consistent Hebrew translations for various system entities including statuses, types, and actions. They ensure a unified user experience across all pages.

## 📁 **File Location**
- **Primary File:** `trading-ui/scripts/translation-utils.js`
- **Included In:** All HTML files via script tag
- **Global Access:** All functions exported to `window` object

## 🔄 **Function Categories**

### **1. Account Status Translations**

#### `translateAccountStatus(status)`
**Purpose:** Translate account status values to Hebrew
**Parameters:**
- `status` (string): Account status in English
**Returns:** (string) Account status in Hebrew
**Usage:**
```javascript
const hebrewStatus = window.translateAccountStatus('open'); // Returns 'פתוח'
```

**Status Mapping:**
- `'open'` → `'פתוח'`
- `'closed'` → `'סגור'`
- `'cancelled'` → `'מבוטל'`

### **2. Ticker Status Translations**

#### `translateTickerStatus(status)`
**Purpose:** Translate ticker status values to Hebrew
**Parameters:**
- `status` (string): Ticker status in English
**Returns:** (string) Ticker status in Hebrew
**Usage:**
```javascript
const hebrewStatus = window.translateTickerStatus('active'); // Returns 'פעיל'
```

**Status Mapping:**
- `'active'` → `'פעיל'`
- `'inactive'` → `'לא פעיל'`
- `'suspended'` → `'מושעה'`
- `'delisted'` → `'הוסר מהמסחר'`

### **3. Note Status Translations**

#### `translateNoteStatus(status)`
**Purpose:** Translate note status values to Hebrew
**Parameters:**
- `status` (string): Note status in English
**Returns:** (string) Note status in Hebrew
**Usage:**
```javascript
const hebrewStatus = window.translateNoteStatus('active'); // Returns 'פעיל'
```

**Status Mapping:**
- `'active'` → `'פעיל'`
- `'archived'` → `'בארכיון'`
- `'deleted'` → `'נמחק'`

### **4. Alert Status Translations**

#### `translateAlertStatus(status)`
**Purpose:** Translate alert status values to Hebrew
**Parameters:**
- `status` (string): Alert status in English
**Returns:** (string) Alert status in Hebrew
**Usage:**
```javascript
const hebrewStatus = window.translateAlertStatus('open'); // Returns 'פתוח'
```

**Status Mapping:**
- `'open'` → `'פתוח'`
- `'closed'` → `'סגור'`
- `'cancelled'` → `'מבוטל'`

### **5. Is Triggered Translation**

#### `translateIsTriggered(isTriggered)`
**Purpose:** Translate boolean triggered status to Hebrew
**Parameters:**
- `isTriggered` (boolean): Triggered status
**Returns:** (string) Triggered status in Hebrew
**Usage:**
```javascript
const hebrewStatus = window.translateIsTriggered(true); // Returns 'כן'
```

**Status Mapping:**
- `true` → `'כן'`
- `false` → `'לא'`

### **6. Trade Type Translations**

#### `translateTradeType(type)`
**Purpose:** Translate trade type values to Hebrew
**Parameters:**
- `type` (string): Trade type in English
**Returns:** (string) Trade type in Hebrew
**Usage:**
```javascript
const hebrewType = window.translateTradeType('buy'); // Returns 'קנה'
```

**Type Mapping:**
- `'buy'` → `'קנה'`
- `'sell'` → `'מכר'`
- `'hold'` → `'החזק'`
- `'close'` → `'סגר'`

### **7. Trade Plan Type Translations**

#### `translateTradePlanType(type)`
**Purpose:** Translate trade plan type values to Hebrew
**Parameters:**
- `type` (string): Trade plan type in English
**Returns:** (string) Trade plan type in Hebrew
**Usage:**
```javascript
const hebrewType = window.translateTradePlanType('long'); // Returns 'עלייה'
```

**Type Mapping:**
- `'long'` → `'עלייה'`
- `'short'` → `'ירידה'`
- `'neutral'` → `'ניטרלי'`

### **8. Trade Plan Status Translations**

#### `translateTradePlanStatus(status)`
**Purpose:** Translate trade plan status values to Hebrew
**Parameters:**
- `status` (string): Trade plan status in English
**Returns:** (string) Trade plan status in Hebrew
**Usage:**
```javascript
const hebrewStatus = window.translateTradePlanStatus('active'); // Returns 'פעיל'
```

**Status Mapping:**
- `'active'` → `'פעיל'`
- `'completed'` → `'הושלם'`
- `'cancelled'` → `'בוטל'`

### **9. Cash Flow Type Translations**

#### `translateCashFlowType(type)`
**Purpose:** Translate cash flow type values to Hebrew
**Parameters:**
- `type` (string): Cash flow type in English
**Returns:** (string) Cash flow type in Hebrew
**Usage:**
```javascript
const hebrewType = window.translateCashFlowType('deposit'); // Returns 'הפקדה'
```

**Type Mapping:**
- `'deposit'` → `'הפקדה'`
- `'withdrawal'` → `'משיכה'`
- `'transfer'` → `'העברה'`
- `'fee'` → `'עמלה'`

### **10. Cash Flow Source Translations**

#### `translateCashFlowSource(source)`
**Purpose:** Translate cash flow source values to Hebrew
**Parameters:**
- `source` (string): Cash flow source in English
**Returns:** (string) Cash flow source in Hebrew
**Usage:**
```javascript
const hebrewSource = window.translateCashFlowSource('manual'); // Returns 'הזנה ידנית'
```

**Source Mapping:**
- `'manual'` → `'הזנה ידנית'`
- `'import'` → `'ייבוא'`
- `'api'` → `'API'`

### **11. Test Category Translations**

#### `translateTestCategory(category)`
**Purpose:** Translate test category values to Hebrew
**Parameters:**
- `category` (string): Test category in English
**Returns:** (string) Test category in Hebrew
**Usage:**
```javascript
const hebrewCategory = window.translateTestCategory('performance'); // Returns 'ביצועים'
```

**Category Mapping:**
- `'performance'` → `'ביצועים'`
- `'functionality'` → `'פונקציונאליות'`
- `'security'` → `'אבטחה'`

### **12. Execution Action Translations**

#### `translateExecutionAction(action)`
**Purpose:** Translate execution action values to Hebrew
**Parameters:**
- `action` (string): Execution action in English
**Returns:** (string) Execution action in Hebrew
**Usage:**
```javascript
const hebrewAction = window.translateExecutionAction('buy'); // Returns 'קנה'
```

**Action Mapping:**
- `'buy'` → `'קנה'`
- `'sell'` → `'מכר'`
- `'hold'` → `'החזק'`
- `'close'` → `'סגר'`
- `'cancel'` → `'בטל'`

## 🔗 **Backward Compatibility**

All old function names are maintained for backward compatibility:

```javascript
// New function names
window.translateAccountStatus = translateAccountStatus;
window.translateTickerStatus = translateTickerStatus;
// ... and more

// Backward compatibility (old names still work)
window.convertAccountStatusToHebrew = translateAccountStatus;
window.convertTickerStatusToHebrew = translateTickerStatus;
window.convertNoteStatusToHebrew = translateNoteStatus;
window.convertAlertStatusToHebrew = translateAlertStatus;
window.convertIsTriggeredToHebrew = translateIsTriggered;
window.getTypeDisplay = translateTradeType;
window.getTypeDisplayName = translateCashFlowType;
window.getCategoryDisplayName = translateTestCategory;
window.convertExecutionActionToHebrew = translateExecutionAction;
```

## 📊 **Usage Examples**

### **In HTML Templates**
```html
<td>${window.translateAccountStatus(account.status)}</td>
<td>${window.translateTradeType(trade.type)}</td>
<td>${window.translateIsTriggered(alert.is_triggered)}</td>
```

### **In JavaScript Code**
```javascript
// Update table with translated values
const statusDisplay = window.translateAccountStatus(account.status);
const typeDisplay = window.translateTradeType(trade.type);

// Use in conditional logic
if (window.translateIsTriggered(alert.is_triggered) === 'כן') {
    // Handle triggered alert
}
```

### **In Filter Functions**
```javascript
// Filter by translated status
const filteredData = data.filter(item => 
    window.translateAccountStatus(item.status) === 'פתוח'
);
```

## 🧪 **Testing**

### **Function Testing**
All translation functions can be tested in the browser console:

```javascript
// Test account status translation
console.log(window.translateAccountStatus('open')); // Should return 'פתוח'

// Test trade type translation
console.log(window.translateTradeType('buy')); // Should return 'קנה'

// Test backward compatibility
console.log(window.convertAccountStatusToHebrew('open')); // Should return 'פתוח'
```

### **Error Handling**
All functions include fallback handling:
```javascript
// If status is not found in mapping, return original value
window.translateAccountStatus('unknown_status'); // Returns 'unknown_status'
```

## 📚 **Maintenance**

### **Adding New Translations**
To add a new translation function:

1. **Add the function to `translation-utils.js`:**
```javascript
/**
 * Translate new entity property to Hebrew
 * @param {string} value - The value in English
 * @returns {string} The value in Hebrew
 */
function translateNewEntityProperty(value) {
    const valueMap = {
        'value1': 'ערך1',
        'value2': 'ערך2'
    };
    return valueMap[value] || value;
}
```

2. **Export to global scope:**
```javascript
window.translateNewEntityProperty = translateNewEntityProperty;
```

3. **Add backward compatibility (if needed):**
```javascript
window.convertNewEntityPropertyToHebrew = translateNewEntityProperty;
```

### **Updating Existing Translations**
To update existing translations:

1. **Modify the mapping in the function**
2. **Test the changes**
3. **Update documentation if needed**

### **Best Practices**
- Always use the `translate[Entity][Property]` naming convention
- Include JSDoc comments for all functions
- Maintain backward compatibility for existing functions
- Test all changes thoroughly
- Update this documentation when adding new functions

---

**Last Updated:** August 22, 2025  
**Version:** 2.1  
**Status:** Complete ✅
