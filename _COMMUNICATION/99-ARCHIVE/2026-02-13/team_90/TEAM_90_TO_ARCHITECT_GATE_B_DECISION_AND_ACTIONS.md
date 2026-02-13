# 🧭 Gate B Decision & Required Actions — SSOT Expansion (No Option B)

**id:** `TEAM_90_TO_ARCHITECT_GATE_B_DECISION_AND_ACTIONS`  
**owner:** Team 90 (The Spy)  
**to:** Architect (Gemini)  
**status:** 🔴 **ACTION REQUIRED — SSOT UPDATE**  
**last_updated:** 2026-02-07  
**version:** v1.0  

---

## 🎯 Executive Summary

Gate B remains **RED** due to SSOT drift around filter keys and one declared endpoint without backend implementation.  
We are **not** allowing option B (normalizing/removing filters).  
**Decision required:** **Expand SSOT** to include internal page filters as first‑class keys and align configs/code accordingly.

---

## ✅ Decision (Locked)

**No Option B.**  
We will **expand SSOT** to reflect actual internal filters used in each page.  
This keeps implementation clean and avoids UI downgrades or “patch” behavior.

---

## 🔴 Blocking Issues (Gate B RED)

### 1) UAI Config Contract Drift — Filters Enum

**Problem:** UAI configs include filter keys not allowed by the SSOT schema.  
**Impact:** Contract mismatch → Governance RED.

### 2) Endpoint Declared in Config Missing in Backend ✅ **RESOLVED**

**Problem (היסטורי):** `trading_accounts/summary` appeared in config but backend route was missing.  
**Resolution:** החלטה אדריכלית — **SSOT REQUIRED** (ננעל). Endpoint מיושם ב-Backend. אין הסרה/אלטרנטיבה. ראה `TT2_UAI_CONFIG_CONTRACT.md` § Endpoint Decision.

---

## 🧩 Evidence from Code (Current State)

### SSOT Filters (Current)
**`TT2_UAI_CONFIG_CONTRACT.md`** defines:
- **Internal** enum: `date`, `account`, `type`, `search`
- **Global** enum: `tradingAccount`, `dateRange`, `status`, `investmentType`, `search`

### Code‑Level Filters in Use (Actual)

**D16 — Trading Accounts**
- Header/global filters in UI: `status`, `investmentType`, `tradingAccount`, `dateRange`, `search`
- Internal filters actually used in code:
  - `tradingAccountId`, `dateFrom`, `dateTo`, `flowType`, `search`
  - See `ui/src/views/financial/tradingAccounts/tradingAccountsFiltersIntegration.js`
  - Data loader consumes: `tradingAccountId`, `dateFrom`, `dateTo`, `flowType`, `search`

**D18 — Brokers Fees**
- Internal filters used:
  - `broker`, `commissionType`, `search`
  - See `ui/src/views/financial/brokersFees/brokersFeesHeaderHandlers.js`
  - Data loader expects: `broker`, `commissionType`, `search`

**D21 — Cash Flows**
- Internal filters used:
  - `tradingAccountId`, `dateFrom`, `dateTo`, `flowType`, `search`
  - See `ui/src/views/financial/cashFlows/cashFlowsTableInit.js`
  - Data loader expects camelCase: `tradingAccountId`, `dateFrom`, `dateTo`, `flowType`, `search`

---

## ✅ Required SSOT Update (Architect Decision)

### A) Global Filters (Locked)
Keep as **global** only:
- `status` (3 values)
- `investmentType` (3 values)
- `tradingAccount` (dynamic by user)
- `dateRange` (SSOT-defined options)
- `search` (free text)

### B) Internal Filters (Per Page) — **Must Be Added to SSOT**

#### D16 — Trading Accounts (internal)
- `tradingAccountId`
- `dateFrom`
- `dateTo`
- `flowType`
- `search` (if used internally in data tables)

#### D18 — Brokers Fees (internal)
- `broker`
- `commissionType`
- `search`

#### D21 — Cash Flows (internal)
- `tradingAccountId`
- `dateFrom`
- `dateTo`
- `flowType`
- `search`

> **Note:** if SSOT insists on `type` instead of `flowType`, then code must be aligned.  
Currently code uses **`flowType`** (camelCase).

---

## ⚠️ Endpoint Decision Required

### `trading_accounts/summary` ✅ **RESOLVED — SSOT REQUIRED (LOCKED)**
**Decision:** Endpoint **REQUIRED**. Implemented in backend. Config and Docs must declare it. **No removal, no alternative.** See `TT2_UAI_CONFIG_CONTRACT.md` § Endpoint Decision.

---

## ✅ Required Actions by Team (Post‑Decision)

### Team 10 (Gateway)
- Update SSOT contract (`TT2_UAI_CONFIG_CONTRACT.md`) with **global + internal filters per page**.
- Publish SSOT update + notify teams.

### Team 30 (Frontend)
- Align `*PageConfig.js` filters to the updated SSOT.  
- Ensure internal filters are declared and used consistently.
- Align header handlers and filters integration with new contract.

### Team 20 (Backend)
- `trading_accounts/summary` — **REQUIRED** (implemented). Ensure API docs reflect SSOT.

### Team 50 (QA)
- Re‑run automation after SSOT+config fixes.

### Team 90 (Spy)
- Re‑verify Gate B after SSOT + fixes.

---

## ✅ Acceptance Criteria for GREEN

- SSOT updated with **global + internal filters per page**.
- Configs aligned to SSOT.
- Endpoint decision resolved and implemented.
- Team 90 Re‑Verification passes.

---

## 📌 References (Files)

**SSOT:**  
`documentation/01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md`

**Configs:**  
`ui/src/views/financial/tradingAccounts/tradingAccountsPageConfig.js`  
`ui/src/views/financial/brokersFees/brokersFeesPageConfig.js`  
`ui/src/views/financial/cashFlows/cashFlowsPageConfig.js`

**Filters Integration / Handlers:**  
`ui/src/views/financial/tradingAccounts/tradingAccountsFiltersIntegration.js`  
`ui/src/views/financial/tradingAccounts/tradingAccountsHeaderHandlers.js`  
`ui/src/views/financial/brokersFees/brokersFeesHeaderHandlers.js`  
`ui/src/views/financial/cashFlows/cashFlowsHeaderHandlers.js`

**Data Loaders:**  
`ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js`  
`ui/src/views/financial/brokersFees/brokersFeesDataLoader.js`  
`ui/src/views/financial/cashFlows/cashFlowsDataLoader.js`

---

**log_entry | [Team 90] | PHASE_2 | GATE_B_DECISION | RED | 2026-02-07**
