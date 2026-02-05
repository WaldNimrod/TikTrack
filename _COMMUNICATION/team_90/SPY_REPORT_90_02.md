# 🕵️ SPY_REPORT_90_02 — Final Scan After Naming Resolution

**Team:** 90 (The Spy Team)  
**Date:** 2026-02-05  
**Status:** 🟡 **PARTIAL PASS — NEW NAMING DRIFT FOUND**

---

## 0) Sources Read
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_RESOLUTION_NAMING_FINAL.md`
- `_COMMUNICATION/90_Architects_comunication/EXTERNAL_AUDIT_v3/ARCHITECT_P0_RED_MANDATE.md`

---

## 1) Scan Scope
- **Primary:** `ui/src/**`
- **Secondary spot-check:** `api/**`, `documentation/03-PRODUCT_&_BUSINESS/LEGACY_TO_PHOENIX_MAPPING_V2.5.md`, `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`

---

## 2) Mandatory P0 Checks (Status)

### 2.1 Port 7246 / ingest
**Result:** ✅ Clean in `ui/src/**` (0 matches).

### 2.2 D16 remnants
**Result:** ✅ Clean in `ui/src/**` and `api/**` (0 matches).

---

## 3) Naming Resolution Compliance (Entity vs ID)

### 3.1 Entity names in UI (Plural)
**Passes:**
- `value="trades"` present in `ui/src/components/HomePage.jsx` (OK).
- `data-entity-type="trading_accounts"` present (OK).
- CSS tokens: `--entity-trades-*`, `--alert-card-trades-*` (OK).

### 3.2 IDs / query params (Singular)
**Passes:**
- `trading_account_id` remains singular in `ui/src/components/core/phoenixFilterBridge.js` and `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js` (OK).

---

## 4) New Drift Detected — `trade_plans` vs `trades_plans`

**Observation:** UI routes/values were changed to **`trades_plans`**, but authoritative docs and DB schemas still reference **`trade_plans`**.

**Evidence in UI (now `trades_plans`):**
- `ui/src/views/shared/unified-header.html` → `href="/trades_plans"`, `data-page="trades_plans"`
- `ui/src/components/core/headerLinksUpdater.js` → `'/trades_plans': '/trades_plans'`
- `ui/src/components/HomePage.jsx` → `value="trades_plans"`

**Evidence in docs/DB (still `trade_plans`):**
- `documentation/03-PRODUCT_&_BUSINESS/LEGACY_TO_PHOENIX_MAPPING_V2.5.md` → `trade_plans`
- `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` → table `user_data.trade_plans`

**Why this matters:**
- The architect resolution explicitly called out **`trade_history → trades_history`**, but did **not** require `trade_plans → trades_plans`. `trade_plans` is already plural by entity (`plans`) and matches DB naming.
- Current UI uses a route (`/trades_plans`) that likely **does not exist** in backend or mapping.

**Verdict:** ❌ **Naming drift introduced** (UI now out of sync with docs/DB and possibly backend).

---

## 5) Additional Risk: Missing Route Mapping
- `routes.json` does **not** list `/trades_plans` or `/trades_history`.
- This creates broken navigation even if HTML links are correct.

**File:** `_COMMUNICATION/90_Architects_comunication/routes.json`

---

## 6) Recommendation to Chief Architect (Decision Required)

**Option A (Revert):**
- Revert UI `trades_plans` → `trade_plans` to match DB + documentation.
- Keep `trades_history` as mandated.

**Option B (Standardize New Route):**
- Officially rename backend/docs to `trades_plans` (DB alias or API path change).
- Update mappings and route registry.

**Recommendation:** **Option A** unless architect explicitly mandates renaming DB/API to `trades_plans`.

---

## 7) Final Status
- **P0 cleanup:** ✅ PASS
- **D16 cleanup:** ✅ PASS
- **Entity/ID naming:** 🟡 PASS with **new drift on trade_plans**

---

**log_entry | [Team 90] | LCI | SPY_REPORT_90_02 | YELLOW | 2026-02-05**
