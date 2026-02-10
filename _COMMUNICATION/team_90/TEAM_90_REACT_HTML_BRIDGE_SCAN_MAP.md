# 🕵️ Team 90 — React vs HTML Bridge: Scan Map (Primary Branches)

**id:** `TEAM_90_REACT_HTML_BRIDGE_SCAN_MAP`  
**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-10  
**status:** 📍 **INITIAL MAP — Teams to complete detailed scan**  
**context:** ADR‑013 + Header Unification + Tables React Mandates  

---

## 🎯 Purpose
Provide **initial scan map** and **required branches/paths** so teams can complete full detailed scan with uniform coverage.

---

## ✅ Core SSOT / Mandates (must be scanned first)
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DIRECTIVE_TABLES_REACT.md`
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DIRECTIVE_TABLES_V2_FINAL.md`
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_FILTER_BRIDGE_SPEC_V2.md`
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_HEADER_UNIFICATION_MANDATE.md`
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md` (ADR‑013)

---

## 🧭 Scan Branches — **HTML Side (UAI + Pages)**
**Pages (HTML skeletons):**
- `ui/src/views/financial/tradingAccounts/trading_accounts.html`
- `ui/src/views/financial/brokersFees/brokers_fees.html`
- `ui/src/views/financial/cashFlows/cash_flows.html`

**UAI Config + Init:**
- `ui/src/views/financial/tradingAccounts/tradingAccountsPageConfig.js`
- `ui/src/views/financial/brokersFees/brokersFeesPageConfig.js`
- `ui/src/views/financial/cashFlows/cashFlowsPageConfig.js`
- `ui/src/components/core/UnifiedAppInit.js`
- `ui/src/components/core/stages/DOMStage.js`

**Header Loader + Bridge:**
- `ui/src/components/core/headerLoader.js`
- `ui/src/components/core/phoenixFilterBridge.js`
- `ui/src/views/shared/unified-header.html`

**Auth Guard (HTML):**
- `ui/src/components/core/authGuard.js`

---

## 🧭 Scan Branches — **React Side (SPA)**
**Router + Auth pages:**
- `ui/src/router/AppRouter.jsx`
- `ui/src/cubes/identity/components/auth/LoginForm.jsx`
- `ui/src/cubes/identity/components/auth/RegisterForm.jsx`
- `ui/src/cubes/identity/components/auth/PasswordResetFlow.jsx`
- `ui/src/cubes/identity/components/auth/ProtectedRoute.jsx`
- `ui/src/cubes/identity/components/profile/ProfileView.jsx`

**Home Page (Shared):**
- `ui/src/components/HomePage.jsx`

---

## 🧭 Scan Branches — **Tables (React vs HTML)**
**React Tables (Mandated):**
- `ui/src/cubes/shared/components/tables/PhoenixTable.jsx`
- `ui/src/cubes/shared/hooks/usePhoenixTableSort.js`
- `ui/src/cubes/shared/hooks/usePhoenixTableFilter.js`
- `ui/src/cubes/shared/hooks/usePhoenixTableData.js`

**Legacy Managers (HTML tables):**
- `ui/src/cubes/shared/PhoenixTableSortManager.js`
- `ui/src/cubes/shared/PhoenixTableFilterManager.js`

**Table init / loaders (HTML):**
- `ui/src/views/financial/*/*TableInit.js`
- `ui/src/views/financial/*/*DataLoader.js`

---

## 🧭 Scan Branches — **Routing SSOT & Serving**
**Routes SSOT:**
- `ui/public/routes.json`

**Vite HTML routing:**
- `ui/vite.config.js` (HTML middleware)

---

## 🧭 Scan Branches — **CSS / Layout**
- `ui/src/styles/phoenix-base.css`
- `ui/src/styles/phoenix-components.css`
- `ui/src/styles/phoenix-header.css`
- `ui/src/styles/D15_DASHBOARD_STYLES.css`

---

## ✅ Required Output from Teams (to complete scan)
Each team must extend this map with:
1. **Exact file → requirement mapping** (from SSOT).
2. **Evidence snippets** (line refs) for compliance.
3. **Gaps + required fixes** if drift found.

---

**Team 90 (The Spy)**  
**log_entry | [Team 90] | REACT_HTML_BRIDGE_SCAN_MAP | ISSUED | 2026-02-10**
