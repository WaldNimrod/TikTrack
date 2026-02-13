# 🕵️ SPY_REPORT_90_01 — LCI Reality Check (Batch 1.6)

**Team:** 90 (The Spy Team)  
**Date:** 2026-02-04  
**Status:** 🔴 **NON‑COMPLIANT FINDINGS**

---

## 0) Sources Read (per directive)

- ` _COMMUNICATION/90_Architects_comunication/EXTERNAL_AUDIT_v1/ARCHITECT_TEAM_90_CHARTER.md`
- ` _COMMUNICATION/90_Architects_comunication/EXTERNAL_AUDIT_v1/MISSION_DIRECTIVE_90_01.md`

Note: Files are **not** at the root of `_COMMUNICATION/90_Architects_comunication/` as requested; they exist under `EXTERNAL_AUDIT_v1/`.

---

## 1) Physical Scan Coverage

**Scanned:** `ui/src/**` (all files).

---

## 2) Mandatory Checks (Mission 90.01)

### 2.1 Ports — find 3000/8080/8082 usage
**Directive:** FE=8080, BE=8082 only. Report anything else.

**Findings:**
- `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js` contains comment referencing `http://localhost:8082` (OK for BE).
- `ui/src/utils/debug.js` contains `http://localhost:8080/login?debug` in comments (OK for FE).
- **Red Flag (not allowed):** multiple hardcoded calls to `http://127.0.0.1:7246/ingest/...` exist in core tables + trading accounts modules (unauthorized port, not 8080/8082).
  - `ui/src/cubes/shared/PhoenixTableSortManager.js`
  - `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js`
  - `ui/src/views/financial/tradingAccounts/tradingAccountsFiltersIntegration.js`
  - `ui/src/views/financial/tradingAccounts/tradingAccountsTableInit.js`

**Verdict:** ❌ Non‑compliant (port 7246 present in production code paths).

---

### 2.2 Inline Scripts — scan HTML in views
**Directive:** report any `<script>` without `src`.

**Findings:**
- No inline `<script>` found in `ui/src/views/**` HTML. All scripts are external via `src`.

**Verdict:** ✅ Compliant.

---

### 2.3 The Bridge — PhoenixFilterContext listener
**Directive:** ensure `window.addEventListener('phoenix-filter-change')` exists.

**Findings:**
- Present in `ui/src/cubes/shared/contexts/PhoenixFilterContext.jsx`.
  - Listener added at line ~189, removed at ~202.

**Verdict:** ✅ Compliant.

---

### 2.4 Naming — trades / trading_accounts (plural only)
**Directive:** use plural names only.

**Violations found:**
- **Routes/labels using singular “trade”:**
  - `ui/src/views/shared/unified-header.html` → `/trade_history` (singular), “היסטוריית טרייד”.
  - `ui/src/components/HomePage.jsx` → `data-entity-type="trade"` and `option value="trade"` (singular).
- **Singular trading_account:**
  - `ui/src/components/HomePage.jsx` → `data-entity-type="trading_account"`.

**Additional drift:**
- CSS variables and class names use `trade` singular across `ui/src/styles/*` and `ui/src/styles/phoenix-base.css`.

**Verdict:** ❌ Non‑compliant (singular “trade” and “trading_account” appear in multiple places).

---

### 2.5 Persistence — sessionStorage in phoenixFilterBridge
**Directive:** verify sessionStorage usage.

**Findings:**
- `ui/src/components/core/phoenixFilterBridge.js` uses `sessionStorage.getItem` and `sessionStorage.setItem` for `phoenix-filters`.

**Verdict:** ✅ Compliant.

---

## 3) Extra Mismatches (not requested but clearly “cheating”)

### 3.1 Hidden Telemetry in Core + Trading Accounts
Hard‑coded external ingest calls remain in code (port 7246). This is **not** debug‑guarded and violates clean‑production expectations.

**Files:**
- `ui/src/cubes/shared/PhoenixTableSortManager.js`
- `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js`
- `ui/src/views/financial/tradingAccounts/tradingAccountsFiltersIntegration.js`
- `ui/src/views/financial/tradingAccounts/tradingAccountsTableInit.js`

**Risk:** silent data exfiltration + unstable runtime.

---

### 3.2 D16 Legacy Labels Still Present
Even after “rename to TradingAccounts,” legacy D16 labels remain in comments/log markers.

**Files:**
- `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js`
- `ui/src/views/financial/tradingAccounts/tradingAccountsTableInit.js`

**Risk:** audit noise + confusion in logs.

---

## 4) Final Verdict
**Teams cut corners.** Naming rules and port discipline are violated, and telemetry is still wired into production code. This is not a clean implementation of the architect’s rules.

---

## 5) Required Fixes (Order = Priority)

1) **Remove or hard‑gate port 7246 ingest calls** (debug‑only).  
   Files: `ui/src/cubes/shared/PhoenixTableSortManager.js`, `ui/src/views/financial/tradingAccounts/*`.
2) **Enforce plural naming**: eliminate `trade`, `trading_account` singular usages in routes, data attributes, and UI values.  
   Files: `ui/src/views/shared/unified-header.html`, `ui/src/components/HomePage.jsx`, `ui/src/styles/*`.
3) **Clean residual D16 labels** in Trading Accounts modules.  
   Files: `ui/src/views/financial/tradingAccounts/*`.

---

## 6) Recommendations & Options (for Chief Architect decision)

### A) Telemetry/ingest calls (port 7246)
**Options:**
1. **Hard remove** all ingest calls from production JS.  
   - Pros: eliminates hidden data flows, simpler QA.  
   - Cons: loses runtime tracing for investigations.
2. **Gate behind explicit debug flag** (e.g., `?debug=true` or env flag).  
   - Pros: keeps diagnostics when needed.  
   - Cons: still ships code path; risk if flag abused.
3. **Route through approved audit/logger** (PhoenixAudit) with no external POST.  
   - Pros: aligns with existing audit protocol.  
   - Cons: requires standardization + refactor.

**Recommendation:** Option 1 or 3. Do not ship external POSTs without architect approval.

---

### B) Naming violations (trade/trading_account singulars)
**Options:**
1. **Strict rename** all singulars to plural across UI, data attributes, and CSS tokens.  
   - Pros: full compliance with Architect naming mandates.  
   - Cons: touches many files; requires coordination.
2. **Introduce alias layer** (map singular → plural internally) while updating routes & user-facing labels.  
   - Pros: smaller diff, reduces risk.  
   - Cons: debt persists until full cleanup.

**Recommendation:** Option 1 if scheduling allows; Option 2 as temporary bridge only.

---

### C) D16 legacy tags in TradingAccounts modules
**Options:**
1. **Full cleanup** of comments/log markers.  
2. **Allow legacy tags** until next batch freeze.

**Recommendation:** Option 1. No value in keeping D16 labels after rename completion.

---

### D) Ports governance (8080/8082)
**Options:**
1. **Single source of truth** update across docs + code; enforce via lint check.  
2. **Allow dual docs** (legacy vs new) with clear “deprecated” flags.

**Recommendation:** Option 1. Eliminate ambiguity before next phase.

---

## 7) Decision Ownership
All final decisions must be made by the Chief Architect. This report provides options and risks only.

---

**log_entry | [Team 90] | LCI | SPY_REPORT_90_01 | RED | 2026-02-04**
