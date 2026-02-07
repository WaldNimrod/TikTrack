# 🛑 מנדט דחוף: Interface Contracts עבור UAI ו-EFR

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-06  
**סטטוס:** 🛑 **RED - BLOCKING - MANDATORY**  
**עדיפות:** 🔴 **P0 - CRITICAL**

---

## 🎯 Executive Summary

**ה-Design Sprint נפסל על ידי Spy Team והאדריכלית.**

ה-Specs שהוגשו (UAI, EFR) הם תיאורטיים בלבד וחסר ה-"דבק" הארכיטקטוני המבטיח אינטגרציה.

**דרישה דחופה:** עליכם לייצר **Interface Contracts** עבור UAI ו-EFR.

---

## 🛑 מצב נוכחי

### **פסילת Design Sprint:**
- ✅ ה-Specs הוגשו (UAI, EFR, GED)
- 🛑 **נדחו על ידי Spy Team (90.05)**
- 🛑 **סטטוס:** `REJECTED_BY_SPY`
- 🛑 **סיבה:** Specs תיאורטיים בלבד - חסרים Interface Contracts

### **הבעיות שזוהו:**
1. **UAI:** אין הגדרה של מה עמוד *חייב* לייצא (Export) כדי שה-UAI יטען אותו
2. **EFR:** אין סטנדרט למיפוי שדות (Field-to-Renderer)
3. **EFR:** לא ננעל על ה-Hardened Transformers

---

## 📋 משימות דחופות

### **1. UAI Config Contract (חובה)**

**דרישה:** הגדרת ה-JSON Schema המדויק שכל עמוד חייב לספק.

**מה צריך לכלול:**
- ✅ **Selectors:** CSS selectors לכל רכיב (טבלאות, קונטיינרים, וכו')
- ✅ **Endpoints:** רשימת endpoints שצריך לטעון (עם מיפוי ל-containers)
- ✅ **Dependencies:** רשימת קבצים/סקריפטים שצריך לטעון לפני אתחול
- ✅ **Lifecycle Hooks:** נקודות התערבות (before/after hooks)
- ✅ **Error Handling:** הגדרת טיפול בשגיאות ספציפי לעמוד

**פורמט נדרש:**
```javascript
// כל עמוד חייב לייצא (export) אובייקט Config זה:
export const pageConfig = {
  // Selectors
  selectors: {
    mainContainer: '#main-container',
    dataTable: '#data-table',
    summaryContainer: '#summary-container'
  },
  
  // API Endpoints
  endpoints: {
    summary: {
      path: '/api/v1/financial/brokers-fees/summary',
      container: '#summary-container',
      method: 'GET'
    },
    table: {
      path: '/api/v1/financial/brokers-fees',
      container: '#data-table',
      method: 'GET'
    }
  },
  
  // Dependencies (scripts, styles)
  dependencies: {
    scripts: [
      'brokersFeesDataLoader.js',
      'brokersFeesHeaderHandlers.js'
    ],
    styles: [
      'brokersFees.css'
    ]
  },
  
  // Lifecycle Hooks
  hooks: {
    beforeDataLoad: async () => { /* ... */ },
    afterDataLoad: async (data) => { /* ... */ },
    beforeRender: async () => { /* ... */ },
    afterRender: async () => { /* ... */ }
  },
  
  // Error Handling
  errorHandling: {
    onApiError: (error) => { /* ... */ },
    onRenderError: (error) => { /* ... */ }
  }
};
```

**קבצים נדרשים:**
- `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md` - JSON Schema מפורט
- `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_EXAMPLES.md` - דוגמאות מפורטות (D18, D21)

---

### **2. EFR Logic Map (חובה)**

**דרישה:** טבלת SSOT המגדירה איזה טיפוס נתונים ב-API מקבל איזה רכיב רינדור ב-EFR.

**מה צריך לכלול:**
- ✅ **Field Type Mapping:** מיפוי בין שדות API ל-EFR Renderers
- ✅ **Hardened Transformers Integration:** וידוא ש-EFR משתמש ב-`transformers.js` v1.2
- ✅ **Field-to-Renderer Table:** טבלת SSOT מפורטת

**פורמט נדרש:**
```javascript
// EFR Logic Map - SSOT
export const efrLogicMap = {
  // Field Type → Renderer Mapping
  fieldTypes: {
    // Financial Fields (forced number conversion)
    'balance': {
      renderer: 'renderCurrency',
      transformer: 'convertFinancialField', // מ-transformers.js
      format: 'USD',
      options: {
        showSign: true,
        decimals: 2
      }
    },
    'commission': {
      renderer: 'renderCurrency',
      transformer: 'convertFinancialField',
      format: 'USD',
      options: {
        showSign: false,
        decimals: 2
      }
    },
    
    // Date Fields
    'created_at': {
      renderer: 'renderDate',
      transformer: 'apiToReact', // מ-transformers.js
      format: 'DD/MM/YYYY',
      options: {
        showTime: false
      }
    },
    
    // Status Fields
    'status': {
      renderer: 'renderBadge',
      transformer: 'apiToReact',
      options: {
        colorMap: {
          'active': 'green',
          'inactive': 'gray',
          'pending': 'yellow'
        }
      }
    }
  },
  
  // Hardened Transformers Integration
  transformers: {
    source: 'ui/src/cubes/shared/utils/transformers.js',
    version: '1.2',
    functions: {
      'apiToReact': 'api_to_react', // snake_case → camelCase
      'reactToApi': 'react_to_api', // camelCase → snake_case
      'convertFinancialField': 'convert_financial_field' // forced number conversion
    }
  }
};
```

**קבצים נדרשים:**
- `_COMMUNICATION/team_30/TEAM_30_EFR_LOGIC_MAP.md` - טבלת SSOT מפורטת
- `_COMMUNICATION/team_30/TEAM_30_EFR_TRANSFORMERS_INTEGRATION.md` - אינטגרציה עם Hardened Transformers

---

### **3. EFR Hardened Transformers Lock (חובה)**

**דרישה:** וידוא ש-EFR ננעל על ה-Hardened Transformers.

**מה צריך לכלול:**
- ✅ **Import Statement:** וידוא ש-EFR מייבא מ-`transformers.js` v1.2 בלבד
- ✅ **No Direct Transformations:** אסור לבצע המרות ישירות - רק דרך transformers.js
- ✅ **Version Lock:** נעילת גרסה v1.2
- ✅ **Validation:** בדיקות ש-EFR משתמש ב-transformers.js בלבד

**דוגמת קוד נדרשת:**
```javascript
// EFR - Entity Field Renderer
// MUST use Hardened Transformers v1.2 ONLY

import { 
  apiToReact, 
  convertFinancialField 
} from '../../cubes/shared/utils/transformers.js';

// ✅ CORRECT - Uses Hardened Transformers
function renderCurrency(value, fieldName) {
  // Convert using Hardened Transformers
  const convertedValue = convertFinancialField(value, fieldName);
  // ... render logic
}

// ❌ WRONG - Direct conversion (FORBIDDEN)
function renderCurrency(value, fieldName) {
  const convertedValue = Number(value); // ❌ FORBIDDEN
  // ... render logic
}
```

**קבצים נדרשים:**
- עדכון `TEAM_30_EFR_SPEC.md` עם סעיף "Hardened Transformers Integration"
- `_COMMUNICATION/team_30/TEAM_30_EFR_TRANSFORMERS_VALIDATION.md` - בדיקות ואימות

---

## 📋 Checklist להשלמה

### **UAI Config Contract:**
- [ ] יצירת `TEAM_30_UAI_CONFIG_CONTRACT.md` עם JSON Schema מפורט
- [ ] יצירת `TEAM_30_UAI_CONFIG_EXAMPLES.md` עם דוגמאות (D18, D21)
- [ ] הגדרת כל השדות הנדרשים (selectors, endpoints, dependencies, hooks, errorHandling)
- [ ] וידוא שהפורמט תואם ל-UAI Spec הקיים

### **EFR Logic Map:**
- [ ] יצירת `TEAM_30_EFR_LOGIC_MAP.md` עם טבלת SSOT מפורטת
- [ ] מיפוי כל סוגי השדות (financial, date, status, number, וכו')
- [ ] יצירת `TEAM_30_EFR_TRANSFORMERS_INTEGRATION.md`
- [ ] וידוא ש-EFR משתמש ב-`transformers.js` v1.2 בלבד

### **EFR Hardened Transformers Lock:**
- [ ] עדכון `TEAM_30_EFR_SPEC.md` עם סעיף "Hardened Transformers Integration"
- [ ] יצירת `TEAM_30_EFR_TRANSFORMERS_VALIDATION.md`
- [ ] הגדרת כללים ברורים: אסור המרות ישירות, רק דרך transformers.js
- [ ] וידוא Version Lock (v1.2)

---

## ⏰ Timeline

**דדליין:** **2026-02-07 (24 שעות)**

**צעדים:**
1. **עד 12 שעות:** יצירת UAI Config Contract + דוגמאות
2. **עד 18 שעות:** יצירת EFR Logic Map + Transformers Integration
3. **עד 24 שעות:** עדכון Specs + Validation + הגשה ל-Team 10

---

## 🔗 קישורים רלוונטיים

### **מקור המנדט:**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DESIGN_CONTRACTS_MANDATE.md`

### **Specs קיימים (נדחו - צריך עדכון):**
- `_COMMUNICATION/team_30/UAI_Architectural_Design.md`
- `_COMMUNICATION/team_30/TEAM_30_EFR_SPEC.md`

### **Hardened Transformers (SSOT):**
- `ui/src/cubes/shared/utils/transformers.js` (v1.2)

### **דוגמאות קוד קיימות:**
- `ui/src/views/financial/brokersFees/brokersFeesDataLoader.js`
- `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js`

---

## ⚠️ אזהרות קריטיות

1. **אין אישור התקדמות ללא Interface Contracts**
2. **כל עמוד חייב לייצא Config Object** - זה חובה, לא אופציונלי
3. **EFR חייב להשתמש ב-transformers.js v1.2 בלבד** - אסור המרות ישירות
4. **כל Contract חייב להיות מפורט עם דוגמאות קוד**

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-06  
**סטטוס:** 🛑 **RED - BLOCKING - MANDATORY**

**log_entry | [Team 10] | TEAM_30 | INTERFACE_CONTRACTS_MANDATE | RED | 2026-02-06**
