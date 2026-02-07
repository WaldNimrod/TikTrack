# 🕵️ SPY Full Review — D21 Cash Flows (Team 30)

**Team:** 90 (The Spy)  
**Date:** 2026-02-06  
**Scope:** Full Phase 2 compliance scan for D21 (Cash Flows) — HTML + JS + SSOT + Policies  
**Mandate:** Phase 2 Governance, Hybrid Scripts Policy, Routes SSOT, Transformers Hardened  

---

## 📌 Executive Summary
**Status: YELLOW — NOT READY FOR GREEN.**  
Core functionality is in place and most policies pass. However, **a critical runtime error risk** exists in `cashFlowsHeaderHandlers.js` due to out‑of‑scope variable usage in global handlers. This can break filter clearing in production and violates the “clean gate” requirement for Phase 2 release.

---

## ✅ Verified (Pass)

### 1) Hybrid Scripts Policy — PASS
No inline JS, all scripts loaded via `src`.
- Evidence: `ui/src/views/financial/cashFlows/cash_flows.html:230-260`

### 2) Transformers Hardened — PASS
Centralized `apiToReact` imported from `ui/src/cubes/shared/utils/transformers.js`.
- Evidence: `ui/src/views/financial/cashFlows/cashFlowsDataLoader.js:13-14`

### 3) Routes SSOT — PASS
API base URL derived from `routes.json` (v1.1.2) with fallback.
- Evidence: `ui/src/views/financial/cashFlows/cashFlowsDataLoader.js:24-72`

### 4) Logging Hygiene — PASS
No `console.log` in D21 cash flows modules.
- Evidence: `rg -n "console\.log" ui/src/views/financial/cashFlows` returned no matches.

---

## 🔴 Blocking Finding

### B1) Global handler uses out‑of‑scope variable (`currentFilters`)
**Issue:** `cashFlowsHeaderHandlers.js` defines `currentFilters` inside an IIFE, but global functions (`window.clearSearchFilter`, `window.resetAllFilters`, `window.clearAllFilters`) reference `currentFilters` outside scope. This will throw `ReferenceError` at runtime when called, breaking filters.

**Evidence:**
- `ui/src/views/financial/cashFlows/cashFlowsHeaderHandlers.js:9-14` (currentFilters scoped to IIFE)
- `ui/src/views/financial/cashFlows/cashFlowsHeaderHandlers.js:150+` (global functions reference `currentFilters`)

**Impact:** Runtime error on user actions, filters become unstable. Blocks Phase 2 gate.

**Required Fix:** Move global functions inside the IIFE, or expose a safe accessor (e.g., `window.cashFlowsFilters = { get/set }`) and reference that.

---

## 🟠 Medium Observations (Not blocking)
- Data loader uses fallback `/api/v1` if routes.json missing; acceptable but should be kept as last‑resort only.

---

## ✅ Re‑Scan Criteria for GREEN
- No out‑of‑scope global references in `cashFlowsHeaderHandlers.js`.
- Filters work without ReferenceError in runtime.

---

**log_entry | [Team 90] | D21_CASH_FLOWS_REVIEW | YELLOW | 2026-02-06**
