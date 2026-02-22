# UAI Config Contract - JSON Schema Specification
**project_domain:** TIKTRACK

**id:** `TT2_UAI_CONFIG_CONTRACT`  
**owner:** Team 10 (The Gateway) - SSOT  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** `TEAM_30_UAI_CONFIG_CONTRACT.md` (promoted from Communication)  
**last_updated:** 2026-02-07  
**version:** v1.2.0 (Gate B — SSOT Expanded: Global + Internal Filters Locked)

---

## 📢 Executive Summary

**UAI Config Contract** הוא JSON Schema מחייב שכל עמוד במערכת Phoenix חייב לייצא. ה-Config מגדיר את כל הפרמטרים הנדרשים לאתחול העמוד דרך Unified App Init (UAI).

**למה נחוץ:**
- הגדרה מרכזית של כל פרמטרי העמוד
- ולידציה של תצורת העמוד לפני אתחול
- תמיכה ב-UAI לזיהוי אוטומטי של סוג העמוד
- מניעת טעויות בעת אתחול

**חובה:** כל עמוד חייב לייצא `window.UAI.config` דרך קובץ JS חיצוני לפני טעינת UAI.

**⚠️ CRITICAL: Hybrid Scripts Policy Compliance**
- ❌ **FORBIDDEN:** Inline `<script>` tags in HTML
- ✅ **REQUIRED:** External JavaScript file with `.js` extension
- ✅ **REQUIRED:** Config must be loaded before UAI initialization

---

## 🎯 Purpose & Goals

### **מטרות עיקריות:**
- **ולידציה מרכזית:** בדיקת תקינות תצורת העמוד
- **זיהוי אוטומטי:** UAI מזהה את סוג העמוד מה-Config
- **תמיכה ב-UAI:** כל השלבים של UAI משתמשים ב-Config
- **תיעוד:** Config משמש כתיעוד של העמוד

### **בעיות שהמערכת פותרת:**
- **טעויות אתחול:** תצורה שגויה או חסרה
- **קוד כפול:** כל עמוד מגדיר את עצמו בצורה שונה
- **קושי בתחזוקה:** שינוי תצורה דורש חיפוש בקוד
- **חוסר ולידציה:** אין בדיקה של תקינות התצורה

---

## 📋 JSON Schema

### **Base Schema:**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["pageType", "requiresAuth", "requiresHeader"],
  "properties": {
    "pageType": {
      "type": "string",
      "description": "Type of page (cashFlows, brokersFees, tradingAccounts, etc.)",
      "pattern": "^[a-z][a-zA-Z0-9]*$"
    },
    "requiresAuth": {
      "type": "boolean",
      "description": "Whether page requires authentication"
    },
    "requiresHeader": {
      "type": "boolean",
      "description": "Whether page requires unified header"
    },
    "dataEndpoints": {
      "type": "array",
      "description": "List of API endpoints required for this page",
      "items": {
        "type": "string"
      },
      "minItems": 0
    },
    "dataLoader": {
      "type": "string",
      "description": "Path to data loader module",
      "pattern": "^/src/.*\\.js$"
    },
    "tableInit": {
      "type": "string",
      "description": "Path to table initialization module",
      "pattern": "^/src/.*\\.js$"
    },
    "headerHandlers": {
      "type": "string",
      "description": "Path to header handlers module",
      "pattern": "^/src/.*\\.js$"
    },
    "components": {
      "type": "array",
      "description": "List of components required for this page",
      "items": {
        "type": "string",
        "enum": ["table", "filter", "summary", "pagination", "actions"]
      }
    },
    "filters": {
      "type": "object",
      "description": "Filter configuration. See § Filter Keys Lock (by page) for allowed values per pageType.",
      "properties": {
        "internal": {
          "type": "array",
          "description": "Internal filters — page-specific keys only (see § Internal Filters per page)",
          "items": { "type": "string" }
        },
        "global": {
          "type": "array",
          "description": "Global filters from header — locked enum only",
          "items": {
            "type": "string",
            "enum": ["status", "investmentType", "tradingAccount", "dateRange", "search"]
          }
        }
      }
    },
    "tables": {
      "type": "array",
      "description": "Table configurations",
      "items": {
        "type": "object",
        "required": ["id", "type"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Table DOM ID"
          },
          "type": {
            "type": "string",
            "enum": ["cash_flows", "currency_conversions", "brokers_fees", "trading_accounts"]
          },
          "pageSize": {
            "type": "number",
            "default": 25,
            "minimum": 10,
            "maximum": 100
          },
          "sortable": {
            "type": "boolean",
            "default": true
          },
          "filterable": {
            "type": "boolean",
            "default": true
          }
        }
      }
    },
    "summary": {
      "type": "object",
      "description": "Summary section configuration",
      "properties": {
        "enabled": {
          "type": "boolean",
          "default": true
        },
        "toggleEnabled": {
          "type": "boolean",
          "default": false
        },
        "endpoint": {
          "type": "string",
          "description": "API endpoint for summary data"
        }
      }
    },
    "metadata": {
      "type": "object",
      "description": "Page metadata",
      "properties": {
        "title": {
          "type": "string",
          "description": "Page title"
        },
        "description": {
          "type": "string",
          "description": "Page description"
        },
        "version": {
          "type": "string",
          "description": "Page version"
        }
      }
    }
  }
}
```

---

## 🔒 Filter Keys Lock (by page) — Gate B SSOT Expanded

**Policy (locked):** No Option B. SSOT recognizes filter keys as they exist in code. Configs and code align to this SSOT.

### Global Filters (locked — all pages)

| Key (camelCase in config) | Description |
|---------------------------|-------------|
| `status` | Account/record status |
| `investmentType` | Investment type (UI) |
| `tradingAccount` | Trading account (header); API key `tradingAccountId` in requests |
| `dateRange` | Date range; API keys `dateFrom`, `dateTo` in requests |
| `search` | Free-text search |

**Config:** Every page that uses header filters must declare only these five in `filters.global`. No removal of filters; only alignment of keys.

### Internal Filters per page (exact keys in code)

#### D16 — Trading Accounts (`pageType: 'tradingAccounts'`)

**Keys in code (locked):**  
`status`, `tradingAccountId`, `dateFrom`, `dateTo`, `search`  
UI also exposes `investmentType` — if used, must be in SSOT (global).

**Config must declare:**
- `filters.global`: `['status', 'investmentType', 'tradingAccount', 'dateRange', 'search']`
- `filters.internal`: `[]` (all filter keys are global/header for D16)

**Mapping (code ↔ API):**  
`tradingAccountId` → API `trading_account_id`; `dateFrom`/`dateTo` → API `date_from`/`date_to`.

---

#### D18 — Brokers Fees (`pageType: 'brokersFees'`)

**Keys in code (locked):**  
`broker`, `commissionType`, `search`

**Config must declare:**
- `filters.global`: `['search']`
- `filters.internal`: `['broker', 'commissionType']`

**Mapping:**  
DataLoader/Header use `broker`, `commissionType`; API receives snake_case per PDSC.

---

#### D21 — Cash Flows (`pageType: 'cashFlows'`)

**Keys in code (locked):**  
`tradingAccountId`, `dateFrom`, `dateTo`, `flowType`, `search`  
Tables also use `type` / `tradingAccount` — **must unify:** use `flowType` (not `type`) and `tradingAccountId` (not `tradingAccount`) consistently in filter payloads.

**Config must declare:**
- `filters.global`: `['tradingAccount', 'dateRange', 'search']`
- `filters.internal`: `['flowType']` (and align UI/code to `dateFrom`/`dateTo` ↔ dateRange, `tradingAccountId` ↔ tradingAccount)

**Mapping:**  
Unify `type` ↔ `flowType`; `tradingAccount` ↔ `tradingAccountId`; `dateFrom`/`dateTo` for date range.

---

## 🔒 Endpoint Decision — trading_accounts/summary (LOCKED)

**Status:** 🔒 **LOCKED**  
**Decision (Architect / Team 10):** **REQUIRED** — אין אופציה להסרה או לאלטרנטיבה.

- **Endpoint:** `GET /api/v1/trading_accounts/summary` is **REQUIRED** in SSOT.
- **Backend:** Implemented (Team 20). Must remain available and documented.
- **Config/Docs:** Trading Accounts page **must** declare `trading_accounts/summary` in `dataEndpoints` and `summary.endpoint`. All Docs and Mandates must include it. No removal, no alternative.

---

## 📝 Complete Example

### **Example: Cash Flows Page**

#### **HTML File (cash_flows.html):**

```html
<!-- ✅ REQUIRED: Load config from external JS file -->
<!-- IMPORTANT: Load config BEFORE UAI script -->
<script src="/src/views/financial/cashFlows/cashFlowsPageConfig.js"></script>

<!-- Then load UAI -->
<script type="module" src="/src/components/core/UnifiedAppInit.js"></script>
```

#### **Config File (cashFlowsPageConfig.js):**

```javascript
// ui/src/views/financial/cashFlows/cashFlowsPageConfig.js
// ✅ REQUIRED: External JS file (Hybrid Scripts Policy Compliance)

// Initialize UAI namespace if not exists
window.UAI = window.UAI || {};

// Set config
window.UAI.config = {
  // Required fields
  pageType: 'cashFlows',
  requiresAuth: true,
  requiresHeader: true,
  
  // Data configuration
  dataEndpoints: [
    'cash_flows',
    'cash_flows/currency_conversions',
    'cash_flows/summary'
  ],
  dataLoader: '/src/views/financial/cashFlows/cashFlowsDataLoader.js',
  
  // Component initialization
  tableInit: '/src/views/financial/cashFlows/cashFlowsTableInit.js',
  headerHandlers: '/src/views/financial/cashFlows/cashFlowsHeaderHandlers.js',
  
  // Components
  components: ['table', 'filter', 'summary', 'pagination', 'actions'],
  
  // Filters
  filters: {
    internal: ['date', 'account', 'type', 'search'],
    global: ['tradingAccount', 'dateRange', 'search']
  },
  
  // Tables
  tables: [
    {
      id: 'cashFlowsTable',
      type: 'cash_flows',
      pageSize: 25,
      sortable: true,
      filterable: true
    },
    {
      id: 'currencyConversionsTable',
      type: 'currency_conversions',
      pageSize: 25,
      sortable: true,
      filterable: false
    }
  ],
  
  // Summary
  summary: {
    enabled: true,
    toggleEnabled: true,
    endpoint: 'cash_flows/summary'
  },
  
  // Metadata
  metadata: {
    title: 'תזרימי מזומנים',
    description: 'ניהול תזרימי מזומנים והמרות מטבע',
    version: '1.0.0'
  }
};
```

### **Example: Brokers Fees Page**

#### **HTML File (brokers_fees.html):**

```html
<!-- ✅ REQUIRED: Load config from external JS file -->
<script src="/src/views/financial/brokersFees/brokersFeesPageConfig.js"></script>

<!-- Then load UAI -->
<script type="module" src="/src/components/core/UnifiedAppInit.js"></script>
```

#### **Config File (brokersFeesPageConfig.js):**

```javascript
// ui/src/views/financial/brokersFees/brokersFeesPageConfig.js
// ✅ REQUIRED: External JS file (Hybrid Scripts Policy Compliance)

// Initialize UAI namespace if not exists
window.UAI = window.UAI || {};

// Set config
window.UAI.config = {
  pageType: 'brokersFees',
  requiresAuth: true,
  requiresHeader: true,
  
  dataEndpoints: [
    'brokers_fees',
    'brokers_fees/summary'
  ],
  dataLoader: '/src/views/financial/brokersFees/brokersFeesDataLoader.js',
  
  tableInit: '/src/views/financial/brokersFees/brokersFeesTableInit.js',
  headerHandlers: '/src/views/financial/brokersFees/brokersFeesHeaderHandlers.js',
  
  components: ['table', 'filter', 'summary', 'pagination', 'actions'],
  
  filters: {
    internal: [],
    global: ['broker', 'commissionType', 'search']
  },
  
  tables: [
    {
      id: 'brokersTable',
      type: 'brokers_fees', // ✅ Fixed: brokers_fees (matches API/Entity)
      pageSize: 25,
      sortable: true,
      filterable: true
    }
  ],
  
  summary: {
    enabled: true,
    toggleEnabled: false,
    endpoint: 'brokers_fees/summary'
  },
  
  metadata: {
    title: 'ברוקרים ועמלות',
    description: 'ניהול ברוקרים והגדרות עמלות',
    version: '1.0.0'
  }
};
```

### **⚠️ FORBIDDEN Patterns:**

```html
<!-- ❌ FORBIDDEN: Inline script in HTML -->
<script>
  window.UAIConfig = { ... }; // ❌ Violates Hybrid Scripts Policy
</script>

<!-- ❌ FORBIDDEN: Wrong namespace -->
<script src="config.js">
  // config.js contains: window.UAIConfig = { ... }; // ❌ Wrong namespace
</script>
```

### **✅ REQUIRED Pattern:**

```html
<!-- ✅ REQUIRED: External JS file -->
<script src="/src/views/[page]/[page]PageConfig.js"></script>
<!-- Config file sets: window.UAI.config = { ... }; -->
```

---

## 🔍 Validation

### **Validation Function:**

```javascript
/**
 * Validate UAI Config
 * @param {Object} config - Config object to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateUAIConfig(config) {
  const errors = [];
  
  // Required fields
  if (!config.pageType) {
    errors.push('pageType is required');
  }
  
  if (typeof config.requiresAuth !== 'boolean') {
    errors.push('requiresAuth must be a boolean');
  }
  
  if (typeof config.requiresHeader !== 'boolean') {
    errors.push('requiresHeader must be a boolean');
  }
  
  // Page type validation
  if (config.pageType && !/^[a-z][a-zA-Z0-9]*$/.test(config.pageType)) {
    errors.push('pageType must match pattern: ^[a-z][a-zA-Z0-9]*$');
  }
  
  // Data loader validation
  if (config.dataLoader && !/^\/src\/.*\.js$/.test(config.dataLoader)) {
    errors.push('dataLoader must be a valid path to .js file');
  }
  
  // Tables validation
  if (config.tables) {
    if (!Array.isArray(config.tables)) {
      errors.push('tables must be an array');
    } else {
      config.tables.forEach((table, index) => {
        if (!table.id) {
          errors.push(`tables[${index}].id is required`);
        }
        if (!table.type) {
          errors.push(`tables[${index}].type is required`);
        }
        if (table.pageSize && (table.pageSize < 10 || table.pageSize > 100)) {
          errors.push(`tables[${index}].pageSize must be between 10 and 100`);
        }
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### **Usage in UAI:**

```javascript
// In UnifiedAppInit.js
class UnifiedAppInit {
  constructor() {
    this.config = this.loadAndValidateConfig();
  }
  
  loadAndValidateConfig() {
    // ✅ REQUIRED: Use window.UAI.config (consistent with UAI namespace)
    const config = window.UAI?.config;
    
    if (!config) {
      throw new Error('UAI_CONFIG_MISSING: window.UAI.config is not defined. Make sure page config JS file is loaded before UAI.');
    }
    
    const validation = validateUAIConfig(config);
    if (!validation.valid) {
      throw new Error(`UAI_CONFIG_INVALID: ${validation.errors.join(', ')}`);
    }
    
    return config;
  }
}
```

---

## 📊 Field Reference

### **Required Fields:**

| Field | Type | Description | Example |
|:---|:---|:---|:---|
| `pageType` | string | Type of page (camelCase) | `"cashFlows"` |
| `requiresAuth` | boolean | Requires authentication | `true` |
| `requiresHeader` | boolean | Requires unified header | `true` |

### **Optional Fields:**

| Field | Type | Description | Default |
|:---|:---|:---|:---|
| `dataEndpoints` | string[] | API endpoints | `[]` |
| `dataLoader` | string | Path to data loader | `null` |
| `tableInit` | string | Path to table init | `null` |
| `headerHandlers` | string | Path to header handlers | `null` |
| `components` | string[] | Required components | `[]` |
| `filters` | object | Filter configuration | `{}` |
| `tables` | object[] | Table configurations | `[]` |
| `summary` | object | Summary configuration | `{}` |
| `metadata` | object | Page metadata | `{}` |

---

## 🔄 Integration with UAI

### **Usage in UAI Stages:**

#### **DOMStage:**
```javascript
class DOMStage {
  async execute() {
    const config = window.UAI.config;
    
    if (config.requiresAuth) {
      await this.loadAuthGuard();
    }
    
    if (config.requiresHeader) {
      await this.loadHeader();
    }
  }
}
```

#### **DataStage:**
```javascript
class DataStage {
  async execute() {
    const config = window.UAI.config;
    
    // Use pageType to identify page
    const pageType = config.pageType;
    
    // Use dataLoader path
    if (config.dataLoader) {
      await this.loadScript(config.dataLoader);
    }
    
    // Use dataEndpoints
    if (config.dataEndpoints) {
      for (const endpoint of config.dataEndpoints) {
        await this.fetchData(endpoint);
      }
    }
  }
}
```

#### **RenderStage:**
```javascript
class RenderStage {
  async execute() {
    const config = window.UAI.config;
    
    // Use tableInit path
    if (config.tableInit) {
      await this.loadScript(config.tableInit);
    }
    
    // Use tables configuration
    if (config.tables) {
      for (const tableConfig of config.tables) {
        await this.initializeTable(tableConfig);
      }
    }
    
    // Use components list
    if (config.components) {
      for (const component of config.components) {
        await this.initializeComponent(component);
      }
    }
  }
}
```

---

## ✅ Checklist

### **For Each Page:**

- [ ] **Config File:** קובץ JS חיצוני נוצר (`[page]PageConfig.js`)
- [ ] **No Inline JS:** אין `<script>` inline ב-HTML (Hybrid Scripts Policy)
- [ ] **Namespace:** `window.UAI.config` מוגדר (לא `window.UAIConfig`)
- [ ] **Load Order:** Config נטען לפני UAI script
- [ ] כל השדות הנדרשים מוגדרים (`pageType`, `requiresAuth`, `requiresHeader`)
- [ ] `pageType` תואם ל-pattern: `^[a-z][a-zA-Z0-9]*$`
- [ ] `dataLoader` מצביע לנתיב תקין (אם נדרש)
- [ ] `tableInit` מצביע לנתיב תקין (אם נדרש)
- [ ] `tables` מוגדר עם `id` ו-`type` לכל טבלה
- [ ] `tables[].type` תואם ל-API/Entity (`brokers_fees` לא `brokers`)
- [ ] `filters` מוגדר עם `internal` ו-`global` (אם נדרש)
- [ ] Config עובר ולידציה לפני אתחול UAI

### **Validation:**

- [ ] Config עובר `validateUAIConfig()`
- [ ] אין שגיאות ולידציה
- [ ] כל הנתיבים תקינים
- [ ] כל ה-endpoints תקינים

---

## 📞 קישורים רלוונטיים

- **UAI Spec:** `_COMMUNICATION/team_30/UAI_Architectural_Design.md`
- **EFR Spec:** `_COMMUNICATION/team_30/TEAM_30_EFR_SPEC.md`
- **GED Spec:** `_COMMUNICATION/team_30/TEAM_30_GED_SPEC.md`

---

---

## 🔧 Critical Fixes Applied (v1.1.0)

### **Fix 1: Inline JS Removed** ✅
- ❌ Removed: All inline `<script>` examples
- ✅ Added: External JS file pattern (`[page]PageConfig.js`)
- ✅ Compliance: Hybrid Scripts Policy

### **Fix 2: Naming Unified** ✅
- ❌ Removed: `window.UAIConfig`
- ✅ Unified: `window.UAI.config` (consistent with UAI namespace)
- ✅ Updated: All examples and validation

### **Fix 3: brokers → brokers_fees** ✅
- ❌ Removed: `"brokers"` from enum
- ✅ Fixed: `"brokers_fees"` (matches API/Entity)
- ✅ Updated: All examples

---

**Team 30 (Frontend Execution)**  
**תאריך:** 2026-02-07  
**סטטוס:** ✅ **CRITICAL FIXES APPLIED - v1.1.0**  
**Deadline:** 2026-02-07 (12 hours)

**log_entry | [Team 30] | UAI_CONFIG_CONTRACT | CRITICAL_FIXES_APPLIED | v1.1.0 | 2026-02-07**

---

### **Gate B — SSOT Expanded (v1.2.0)** ✅
- **Global Filters (locked):** status, investmentType, tradingAccount, dateRange, search
- **Internal Filters per page:** D16 / D18 / D21 — explicit lists and mapping (see § Filter Keys Lock)
- **Endpoint decision:** trading_accounts/summary REQUIRED (Backend implemented)
- **Policy:** No Option B; configs align to SSOT

**log_entry | [Team 10] | UAI_CONFIG_CONTRACT | GATE_B_SSOT_EXPANDED | v1.2.0 | 2026-02-07**
