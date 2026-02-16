# 🏗️ UI Integration Pattern

**id:** `TT2_UI_INTEGRATION_PATTERN`  
**owner:** Team 30 (Frontend Execution)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-05  
**version:** v1.0

---

- Shell Assembly: Context Resolver > Theme Injection > Shell > View.
- Data Sync: React Context (PhoenixFilterContext) + API Service Wrapper + Hybrid Bridge.
- Validation: 100% Match to Legacy fields required.

## 🔄 Routes SSOT (Single Source of Truth)

**Location:** `ui/public/routes.json` (v1.1.2)

Routes SSOT provides a centralized, runtime-accessible configuration for all application routes.

**Structure:**
```json
{
  "version": "1.1.1",
  "frontend": 8080,
  "backend": 8082,
  "routes": {
    "auth": { "login": "/login.html", "register": "/register.html" },
    "financial": { "trading_accounts": "/trading_accounts.html" }
  },
  "public_routes": ["/login", "/register", "/reset-password"]
}
```

**Usage:**
- `auth-guard.js` loads routes from `/routes.json` at runtime
- `vite.config.js` uses routes.json for HTML page mapping
- Single source of truth for all route definitions

## 🔄 Data Transformation Layer (Hardened v1.2)

**Location:** `ui/src/cubes/shared/utils/transformers.js`

**Features:**
- **Forced Number Conversion:** Financial fields (`balance`, `price`, `amount`, `total`, `value`, `quantity`, `cost`, `fee`, `commission`, `profit`, `loss`, `equity`, `margin`) are automatically converted to numbers
- **Default Values:** `null`/`undefined` financial fields default to `0`
- **Safe Conversion:** Returns `0` if conversion fails (NaN)

**Functions:**
- `apiToReact()` - Converts API response (snake_case) to React state (camelCase) with forced number conversion
- `reactToApi()` - Converts React state (camelCase) to API request (snake_case) with forced number conversion

## 🔗 Bridge Integration

**Location:** `ui/src/cubes/shared/contexts/PhoenixFilterContext.jsx`

**Features:**
- Listener for `phoenix-filter-change` event (from HTML Shell)
- Syncs filter state between HTML Shell and React Content
- Connected to `window.PhoenixBridge` for bidirectional communication

**Flow:**
1. HTML Shell → React: Bridge dispatches `phoenix-filter-change` event → React Context updates
2. React → HTML Shell: React Context calls `window.PhoenixBridge.setFilter()` → Bridge updates state and UI