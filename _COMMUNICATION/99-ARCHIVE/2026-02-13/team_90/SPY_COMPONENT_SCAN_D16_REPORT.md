# 🕵️ SPY_COMPONENT_SCAN_D16_REPORT — Component Scan (D16 Trading Accounts Table)

**Team:** 90 (The Spy Team)  
**Date:** 2026-02-05  
**Status:** 🔴 **NON‑COMPLIANT — Hardened Transformers NOT USED**

---

## 1) Scope
- **Component:** D16 Trading Accounts Table (HTML + JS module set)  
- **Files scanned:**
  - `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js`
  - `ui/src/views/financial/tradingAccounts/trading_accounts.html`
  - `ui/src/cubes/shared/tableFormatters.js`
  - `ui/src/cubes/shared/utils/transformers.js` (reference only)

---

## 2) Mandatory Requirement (Architect Directive)
**Requirement:** D16 must use **Hardened Transformers** and ensure **financial fields are Number only**.

---

## 3) Findings (with evidence)

### 3.1 Hardened Transformers NOT used in D16
**Result:** ❌ FAIL
- D16 uses a **local** `apiToReact()` function in `tradingAccountsDataLoader.js` instead of the hardened transformer in `ui/src/cubes/shared/utils/transformers.js`.
- No import or use of the hardened transformer functions in D16 modules.

**Evidence:**
- `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js` defines `apiToReact()` locally (no forced number conversion).  
- No `import { apiToReact } from '.../transformers.js'` exists in the file.

---

### 3.2 Financial fields are converted only at render time
**Result:** ⚠️ PARTIAL (not SSOT‑safe)
- Numerous `parseFloat(...)` calls are used during DOM rendering to display values.  
- This does **not** guarantee that the **data layer** fields are numeric; it only sanitizes at render.

**Evidence (examples):**
- `tradingAccountsDataLoader.js` uses `parseFloat(account.balance || 0)` and similar during render.  
- No central normalization of numeric fields happens at API‑to‑React transformation.

**Impact:**
- Data objects may still contain string values.  
- Violates “Number‑only at source” mandate and risks downstream calculations.

---

### 3.3 Security regression (not part of mandate, but critical)
**Result:** ⚠️ RISK
- `tradingAccountsDataLoader.js` logs token preview in console (`tokenPreview`).  
- This violates masked‑log policies adopted in P1.

---

## 4) Verdict
D16 **does not comply** with the Hardened Transformers mandate. The current implementation only converts values at rendering time, leaving numeric fields un‑normalized at the data layer.

---

## 5) Required Actions

### Team 30 (Frontend Execution)
1) **Replace local `apiToReact`** in `tradingAccountsDataLoader.js` with the hardened transformer from `ui/src/cubes/shared/utils/transformers.js`.  
2) **Normalize numeric fields at ingestion** (use hardened transformer for financial fields).  
3) **Remove token preview logs** or route through `maskedLogWithTimestamp`.

### Team 10 (Gateway)
1) Update P1/P2 verification docs to explicitly **require** hardened transformer usage in D16 modules.  
2) Add a checklist item: “No local API‑to‑React transformers in D16 financial modules.”

---

**log_entry | [Team 90] | COMPONENT_SCAN | D16_TABLE | RED | 2026-02-05**
