# 🕵️ SPY Review — D18 Brokers Fees (Team 30)

**Team:** 90 (The Spy)  
**Date:** 2026-02-06  
**Scope:** Frontend D18 completion verification (brokers_fees)  
**Mandate:** Phase 2 Governance + Hybrid Scripts Policy + Routes SSOT + Transformers Hardened  

---

## 📌 Executive Summary
**Status: YELLOW — NOT READY FOR GREEN.**  
Core UI and data loading exist, but **two policy violations** remain: inline JS in the HTML page and **routes.json SSOT not used** in the data loader (hardcoded base URL). Minor logging cleanup also required.

---

## ✅ Verified (Pass)
- **Transformers Hardened:** centralized `apiToReact` imported from `ui/src/cubes/shared/utils/transformers.js`.  
  Evidence: `ui/src/views/financial/brokersFees/brokersFeesDataLoader.js:13-14`
- **No token leakage:** no `tokenPreview`/raw token logs detected.  
- **External JS files:** main logic split into external JS files.  
  Evidence: `ui/src/views/financial/brokersFees/brokers_fees.html:230-247`
- **Table formatters:** `formatCommissionValue` added and exported.  
  Evidence: `ui/src/cubes/shared/tableFormatters.js:300-352`

---

## 🔴 Blocking Findings

### B1) Inline JavaScript in HTML (Hybrid Scripts Policy violation)
**Issue:** Inline `<script>` remains in the page. Policy forbids inline JS.  
**Evidence:**
- `ui/src/views/financial/brokersFees/brokers_fees.html:250`

**Impact:** Breaks Hybrid Scripts Policy; blocks Phase 2 compliance.

**Required fix:** Move lucide initialization to external JS file and load via `<script src>`.

---

### B2) Routes SSOT not used for API endpoints
**Issue:** Data loader uses hardcoded API base (`/api/v1`) instead of `routes.json` SSOT.  
**Evidence:**
- `ui/src/views/financial/brokersFees/brokersFeesDataLoader.js:16-41`

**Impact:** Violates Routes SSOT enforcement; risk of drift if endpoints change.

**Required fix:** Read API paths from `routes.json` (v1.1.2) and build URLs from SSOT.

---

## 🟠 Medium Findings

### M1) Debug console logs in action handlers
**Issue:** `console.log` remains for view/edit/delete actions.  
**Evidence:**
- `ui/src/views/financial/brokersFees/brokersFeesTableInit.js:296-320`

**Impact:** Not a security leak but conflicts with strict logging hygiene.  
**Required fix:** Remove or replace with maskedLog/debug-flag gated logging.

---

## ✅ Recommendation (Team 30)
1. **Remove inline JS** from `brokers_fees.html` by moving lucide init to external JS.
2. **Replace hardcoded API base** with `routes.json` lookups (SSOT).
3. **Remove console.log** in `brokersFeesTableInit.js` or guard with debug flag.

---

## ✅ Re‑Scan Criteria for GREEN
- No inline JS in `brokers_fees.html`.
- API endpoints resolved via `routes.json` SSOT.
- Debug logs removed or gated.

---

**log_entry | [Team 90] | D18_BROKERS_FEES_REVIEW | YELLOW | 2026-02-06**
