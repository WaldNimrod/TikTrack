# EFR Hardened Transformers Lock - SSOT Lock Specification
**project_domain:** TIKTRACK

**id:** `TT2_EFR_HARDENED_TRANSFORMERS_LOCK`  
**owner:** Team 10 (The Gateway) - SSOT  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** `TEAM_30_EFR_HARDENED_TRANSFORMERS_LOCK.md` (promoted from Communication)  
**last_updated:** 2026-02-07  
**version:** v1.0.0 (Promoted to SSOT)

---

## 📢 Executive Summary

**EFR Hardened Transformers Lock** הוא מסמך נעילה מחייב על `transformers.js` v1.2 כבסיס היחיד להמרת נתונים במערכת Phoenix. המסמך מגדיר את הנעילה, את הסיבות לה, ואת התהליך לשינוי (אם נדרש בעתיד).

**למה נחוץ:**
- הבטחת עקביות בהמרת נתונים
- מניעת שימוש ב-transformers מקומיים
- תמיכה ב-SSOT (Single Source of Truth)
- מניעת טעויות בהמרת נתונים

**חובה:** כל המרת נתונים חייבת לעבור דרך `transformers.js` v1.2 בלבד.

---

## 🎯 Purpose & Goals

### **מטרות עיקריות:**
- **SSOT Lock:** נעילה על `transformers.js` v1.2 כבסיס יחיד
- **מניעת Drift:** מניעת יצירת transformers מקומיים
- **עקביות:** הבטחת עקביות בהמרת נתונים
- **תיעוד:** תיעוד הנעילה והסיבות לה

### **בעיות שהמערכת פותרת:**
- **Transformers מקומיים:** שימוש ב-transformers שונים בכל מקום
- **חוסר עקביות:** המרות שונות לאותם שדות
- **טעויות:** טעויות בהמרת נתונים
- **קושי בתחזוקה:** שינוי המרה דורש עדכון בכל המקומות

---

## 🔒 Lock Specification

### **Locked Resource:**

**File:** `ui/src/cubes/shared/utils/transformers.js`  
**Version:** `v1.2 - Hardened`  
**Status:** 🔒 **LOCKED - SSOT**

### **Lock Details:**

```javascript
/**
 * Transformation Layer - Data Normalization
 * ------------------------------------------
 * הפרדה בין ה-Backend (snake_case) לבין ה-Frontend (camelCase).
 * 
 * @description כל תקשורת API חייבת לעבור דרך פונקציות אלו כדי לשמור על ניקיון ה-State
 * @legacyReference Legacy.data.transformations
 * @version v1.2 - Hardened for Financials (forced number conversion)
 * @status 🔒 LOCKED - SSOT
 * 
 * ⚠️ CRITICAL: This file is LOCKED as SSOT.
 * ⚠️ DO NOT create local transformers.
 * ⚠️ All data transformations MUST use this file.
 */
```

### **Locked Functions:**

#### **1. apiToReact() - Locked**
```javascript
/**
 * Transforms API response (snake_case) to React state (camelCase)
 * 
 * @version v1.2 - Hardened: forced number conversion for financial fields
 * @status 🔒 LOCKED
 * 
 * ⚠️ DO NOT create local versions of this function.
 * ⚠️ All API responses MUST use this function.
 */
export const apiToReact = (apiData) => {
  // Implementation locked
};
```

#### **2. reactToApi() - Locked**
```javascript
/**
 * Transforms React state (camelCase) to API request (snake_case)
 * 
 * @version v1.2 - Hardened: forced number conversion for financial fields
 * @status 🔒 LOCKED
 * 
 * ⚠️ DO NOT create local versions of this function.
 * ⚠️ All API requests MUST use this function.
 */
export const reactToApi = (reactData) => {
  // Implementation locked
};
```

### **Locked Features:**

1. **Forced Number Conversion:** Financial fields are automatically converted to numbers
2. **Default Values:** Null/undefined financial fields default to `0`
3. **Case Conversion:** snake_case ↔ camelCase conversion
4. **Financial Fields List:** Predefined list of financial fields

---

## 🚫 Prohibited Patterns

### **❌ FORBIDDEN: Local Transformers**

```javascript
// ❌ FORBIDDEN: Local transformer function
function localApiToReact(data) {
  // DO NOT CREATE LOCAL TRANSFORMERS
  return data;
}

// ❌ FORBIDDEN: Inline transformation
const transformed = data.map(item => ({
  userId: item.user_id, // Manual transformation
  balance: Number(item.balance) // Manual conversion
}));
```

### **✅ REQUIRED: Use SSOT Transformers**

```javascript
// ✅ REQUIRED: Import from SSOT
import { apiToReact } from '../../../cubes/shared/utils/transformers.js';

// ✅ REQUIRED: Use SSOT function
const transformed = apiToReact(data);
```

---

## 📋 Lock Enforcement

### **Validation Rules:**

1. **Import Check:** כל קובץ חייב לייבא מ-`transformers.js` (אם משתמש בהמרות)
2. **No Local Transformers:** אסור ליצור פונקציות המרה מקומיות
3. **No Inline Transformations:** אסור לבצע המרות inline (חוץ מ-transformers.js)
4. **Version Check:** חייב להשתמש ב-v1.2 (Hardened)

### **Validation Function:**

```javascript
/**
 * Validate transformers usage
 * @param {string} filePath - Path to file to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateTransformersUsage(filePath) {
  const errors = [];
  const content = readFile(filePath);
  
  // Check for local transformer functions
  if (content.match(/function\s+(apiToReact|reactToApi|transformApi|transformReact)/)) {
    errors.push('Local transformer function detected. Use transformers.js SSOT instead.');
  }
  
  // Check for manual case conversion
  if (content.match(/user_id.*userId|userId.*user_id/)) {
    errors.push('Manual case conversion detected. Use transformers.js SSOT instead.');
  }
  
  // Check for manual number conversion on financial fields
  const financialFields = ['balance', 'amount', 'price', 'total', 'value'];
  financialFields.forEach(field => {
    if (content.match(new RegExp(`Number\\(.*${field}.*\\)|parseFloat\\(.*${field}.*\\)`))) {
      errors.push(`Manual number conversion for ${field} detected. Use transformers.js SSOT instead.`);
    }
  });
  
  // Check for import from SSOT
  if (content.includes('transform') && !content.includes('transformers.js')) {
    errors.push('Transformations detected but no import from transformers.js SSOT.');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## 🔄 Integration with EFR

### **EFR Uses Transformers:**

```javascript
// In EFRCore.js
import { apiToReact } from '../../../cubes/shared/utils/transformers.js';

class EFRCore {
  constructor() {
    // Use SSOT transformers
    this.transformers = { apiToReact };
  }
  
  renderField(fieldName, value, data) {
    // Value is already transformed by transformers.js
    // EFR only handles rendering, not transformation
    const renderer = this.getRenderer(fieldName);
    return renderer.render(value, options);
  }
}
```

### **Data Loaders Use Transformers:**

```javascript
// In cashFlowsDataLoader.js
import { apiToReact } from '../../../cubes/shared/utils/transformers.js';

async function fetchCashFlows(filters = {}) {
  const response = await fetch(url);
  const data = await response.json();
  
  // ✅ REQUIRED: Use SSOT transformers
  return apiToReact(data);
  
  // ❌ FORBIDDEN: Manual transformation
  // return data.map(item => ({ ... }));
}
```

---

## 📊 Lock Status

### **Current Status:**

| Component | Status | Version | Locked |
|:---|:---|:---|:---|
| `transformers.js` | 🔒 LOCKED | v1.2 | ✅ Yes |
| `apiToReact()` | 🔒 LOCKED | v1.2 | ✅ Yes |
| `reactToApi()` | 🔒 LOCKED | v1.2 | ✅ Yes |
| Financial Fields | 🔒 LOCKED | v1.2 | ✅ Yes |

### **Files Using Transformers (Verified):**

| File | Status | Version Used |
|:---|:---|:---|
| `cashFlowsDataLoader.js` | ✅ Verified | v1.2 |
| `brokersFeesDataLoader.js` | ✅ Verified | v1.2 |
| `tradingAccountsDataLoader.js` | ✅ Verified | v1.2 |

---

## 🔓 Unlock Process (Future)

### **If Unlock Required:**

1. **Request:** Submit unlock request to Team 10
2. **Review:** Team 10 reviews request with Architect
3. **Approval:** Architect approval required
4. **Migration:** Plan migration to new version
5. **Update:** Update all files using transformers
6. **Lock:** Lock new version

### **Unlock Criteria:**

- Critical bug in v1.2
- New feature requirement
- Performance issue
- Security vulnerability

---

## ✅ Checklist

### **For Each Data Loader:**

- [ ] מייבא מ-`transformers.js` (SSOT)
- [ ] משתמש ב-`apiToReact()` בלבד
- [ ] לא יוצר transformers מקומיים
- [ ] לא מבצע המרות inline
- [ ] משתמש ב-v1.2 (Hardened)

### **For Each Component:**

- [ ] לא יוצר פונקציות המרה מקומיות
- [ ] לא מבצע המרות case manual
- [ ] לא מבצע המרות מספר manual על financial fields
- [ ] משתמש ב-transformers.js SSOT

### **Validation:**

- [ ] כל הקבצים עוברים `validateTransformersUsage()`
- [ ] אין שגיאות ולידציה
- [ ] כל ה-imports תקינים
- [ ] כל השימושים תקינים

---

## 📞 קישורים רלוונטיים

- **Transformers SSOT:** `ui/src/cubes/shared/utils/transformers.js`
- **EFR Spec:** `_COMMUNICATION/team_30/TEAM_30_EFR_SPEC.md`
- **EFR Logic Map:** `_COMMUNICATION/team_30/TEAM_30_EFR_LOGIC_MAP.md`
- **UAI Config Contract:** `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md`

---

## 🚨 Critical Warnings

### **⚠️ DO NOT:**

- ❌ Create local transformer functions
- ❌ Perform manual case conversion
- ❌ Perform manual number conversion on financial fields
- ❌ Use different transformer versions
- ❌ Bypass transformers.js SSOT

### **✅ MUST:**

- ✅ Import from `transformers.js` SSOT
- ✅ Use `apiToReact()` for API responses
- ✅ Use `reactToApi()` for API requests
- ✅ Use v1.2 (Hardened) version
- ✅ Follow SSOT lock rules

---

**Team 30 (Frontend Execution)**  
**תאריך:** 2026-01-31  
**סטטוס:** 🔴 **CRITICAL - SSOT LOCK**  
**Deadline:** 2026-02-07 (12 hours)

**log_entry | [Team 30] | EFR_HARDENED_TRANSFORMERS_LOCK | CRITICAL_LOCK | 2026-01-31**
