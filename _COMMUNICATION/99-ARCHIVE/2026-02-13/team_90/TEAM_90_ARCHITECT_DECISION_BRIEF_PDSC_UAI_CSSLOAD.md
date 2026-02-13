# 🕵️ Architect Decision Brief — PDSC / UAI / CSS Load Verification (Phase 2)

**id:** `TEAM_90_ARCHITECT_DECISION_BRIEF_PDSC_UAI_CSSLOAD`  
**owner:** Team 90 (The Spy)  
**status:** 🔴 **DECISIONS REQUIRED**  
**last_updated:** 2026-02-07  
**version:** v1.0  

---

## 📌 Purpose
Provide the Architect with **all required context, options, and code references** for final decisions blocking Phase 2 contracts and integration. Architect receives only this brief, so it includes **evidence from code + contracts + legacy specs**.

---

## ✅ Verified Facts (Code & Contracts)

### A) UAI Core Files Exist in Code
- `ui/src/components/core/UnifiedAppInit.js` (UAI main controller)
- `ui/src/components/core/stages/DOMStage.js` (DOM stage)
- `ui/src/components/core/cssLoadVerifier.js` (CSS load verification class)

**Evidence:**
- `ui/src/components/core/UnifiedAppInit.js:17-45` (class exists, sets `window.UAI.config`)  
- `ui/src/components/core/stages/DOMStage.js:12-48` (DOM stage exists, loads auth/header)  
- `ui/src/components/core/cssLoadVerifier.js:22-153` (CSSLoadVerifier class exists)

### B) Current UAI Config Contract (Team 30) is External JS + `window.UAI.config`
- Contract explicitly forbids inline `<script>` and requires external JS file.
- Contract uses `window.UAI.config` namespace.

**Evidence:**
- `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md:14-20` (Hybrid policy compliance + external JS)  
- `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md:44-60` (Base schema)  
- `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md:88-140` (example with `window.UAI.config`)

### C) UAI Architectural Spec Still Shows Inline `<script>` + `window.UAIConfig`
- Spec example includes inline config and uses `window.UAIConfig`.

**Evidence:**
- `_COMMUNICATION/team_30/UAI_Architectural_Design.md:771-783` (inline `<script>` + `window.UAIConfig`)

### D) DOMStage **does not call** CSSLoadVerifier
- No import/usage in DOMStage. The verifier is **not executed** in UAI lifecycle.

**Evidence:**
- `ui/src/components/core/stages/DOMStage.js:10-48` (no CSSLoadVerifier integration)

### E) CSSLoadVerifier Requires `phoenix-base.css` to be **first** stylesheet
- Verifier fails if `phoenix-base.css` is not first.

**Evidence:**
- `ui/src/components/core/cssLoadVerifier.js:136-145` (base CSS must be index 0)

### F) Actual Phase 2 HTML Pages Load Pico CSS **before** phoenix-base.css
- This **violates** verifier’s requirement.

**Evidence:**
- `ui/src/views/financial/cashFlows/cash_flows.html:12-17`  
- `ui/src/views/financial/brokersFees/brokers_fees.html:12-17`  
- `ui/src/views/financial/tradingAccounts/trading_accounts.html:12-17`

### G) Phase 2 Pages Do **Not** Load UAI Entry Point
- Pages use many per-page scripts; **no** `UnifiedAppInit.js` or UAI config file.

**Evidence:**
- `ui/src/views/financial/cashFlows/cash_flows.html:35-40` (auth/header scripts only)  
- `rg "UnifiedAppInit" ui/src/views/financial` → no matches

### H) Legacy Architecture Defines Unified Initialization System
- Legacy SSOT expects unified initialization/config system.

**Evidence:**
- `/Users/nimrod/Documents/TikTrack/TikTrackApp/documentation/01-ARCHITECTURE/frontend/GENERAL_SYSTEMS_LIST.md` (Core Systems, Unified Initialization)

---

## 🔴 Decisions Required (Architect)

### 1) **PDSC Frontend vs Backend Boundary**
**Problem:** Contract and implementation boundary must be locked. Team 20’s contracts imply backend schema ownership, but UI data loaders operate in frontend. Architect decision is **blocking** shared boundary contract.

**Options:**
- **Option A — Frontend Service (JS) [Recommended for Phase 2 integration]**
  - PDSC is a **Frontend shared service** that consumes backend APIs.
  - Keeps data loaders and UAI flow consistent with existing code.
  - Requires Team 30 to own JS interface spec.
- **Option B — Backend Service (Python)**
  - PDSC is **Backend** logic; Frontend is thin client.
  - Requires updates to mandates & loaders to consume backend-controlled contract only.
- **Option C — Hybrid (Split contracts)**
  - Backend owns data contract; Frontend owns transformation/aggregation contract.
  - Requires two separate specs + explicit boundary mapping.

**Code References:**
- Data loaders are **frontend JS** (e.g., `ui/src/views/financial/brokersFees/brokersFeesDataLoader.js`)  
- Transformers are **frontend JS** (`ui/src/cubes/shared/utils/transformers.js`)

**Impact:** Contract language must match the final architecture or the boundary contract remains invalid.

---

### 2) **UAI Config Namespace & Delivery**
**Problem:** UAI contract mandates external JS + `window.UAI.config`, but UAI Architectural spec still shows inline + `window.UAIConfig`.

**Options:**
- **Option A — Enforce Contract (`window.UAI.config`, external JS)**
  - Aligns with Hybrid Policy.
  - Requires updating UAI Architectural Spec and removing inline examples.
- **Option B — Allow Legacy (`window.UAIConfig`) as backward compatibility**
  - Code already supports fallback (`UnifiedAppInit.js` uses both).  
  - Must be explicitly documented as **legacy-only** to avoid drift.

**Code References:**
- Fallback exists: `ui/src/components/core/UnifiedAppInit.js:24-27`  
- DOMStage also checks legacy: `ui/src/components/core/stages/DOMStage.js:26-28`

**Impact:** Without final decision, contract cannot be signed; Hybrid Policy compliance remains unclear.

---

### 3) **UAI Entry Point Requirement for Phase 2 Pages**
**Problem:** UAI exists, but Phase 2 pages still load scripts manually and do not load UAI entry point or config.

**Options:**
- **Option A — Enforce UAI for Phase 2 (Single Entry Point)**
  - All Phase 2 HTML pages must load config JS + `UnifiedAppInit.js`.
  - Requires refactor of current pages to remove script sprawl.
- **Option B — Defer UAI (Phase 2 uses legacy script loading)**
  - UAI remains future-only; specs must reflect this.  
  - Contracts and UAI docs must be downgraded or flagged “future”.

**Evidence:**
- No UAI entry in Phase 2 HTML (`rg "UnifiedAppInit" ui/src/views/financial`)

**Impact:** UAI contracts cannot be considered “complete” if not required for Phase 2.

---

### 4) **CSS Load Verification Rule (phoenix-base.css)**
**Problem:** CSSLoadVerifier requires `phoenix-base.css` **first**, but actual pages load Pico first. Verifier is not invoked by DOMStage.

**Options:**
- **Option A — Enforce phoenix-base.css first**
  - Must reorder CSS in all pages.
  - CSSLoadVerifier remains strict.
- **Option B — Update CSSLoadVerifier rule**
  - Allow Pico first; require phoenix-base.css to be first **Phoenix** stylesheet only.
  - Update verifier logic accordingly.

**Code References:**
- Verifier requirement: `ui/src/components/core/cssLoadVerifier.js:136-145`  
- Page order: `ui/src/views/financial/*/*.html:12-17`

**Impact:** Current config fails verification; decision required before “Design Sprint green”.

---

### 5) **CSSLoadVerifier Integration into UAI DOMStage**
**Problem:** Spec says DOMStage should verify CSS before lifecycle continues, but DOMStage does not call verifier.

**Options:**
- **Option A — Integrate into DOMStage.execute()**
  - UAI becomes the enforcement gate for CSS order.
- **Option B — Run verification outside DOMStage**
  - e.g., page-level JS or pre-init step.
  - Must update spec accordingly.

**Code References:**
- DOMStage has no verifier: `ui/src/components/core/stages/DOMStage.js:22-48`  
- Verifier exists: `ui/src/components/core/cssLoadVerifier.js`  

**Impact:** Without integration, CSS verification requirement is not enforced.

---

## 📚 Legacy Alignment Notes (from General Systems List)
The legacy system already defines a **Unified Initialization System** as a core system. This strengthens the case to enforce UAI in Phase 2 rather than keep pages on manual script loading.

**Reference:**
- `/Users/nimrod/Documents/TikTrack/TikTrackApp/documentation/01-ARCHITECTURE/frontend/GENERAL_SYSTEMS_LIST.md`

---

## ✅ Recommended Architect Decisions (Team 90 Position)

1. **PDSC Boundary:** Option A (Frontend service) — matches current code and loaders; avoids backend-only refactor mid-Phase 2.
2. **UAI Config:** Option A (external JS + `window.UAI.config`), allow `window.UAIConfig` only as deprecated fallback (documented explicitly).
3. **UAI Entry Point:** Option A (enforce UAI for Phase 2) — aligns with legacy Unified Initialization System and removes script sprawl.
4. **CSS Load Rule:** Option B (update verifier to allow Pico first, but require phoenix-base.css first among Phoenix CSS). Current pages already follow that order.
5. **CSSLoadVerifier Integration:** Option A (integrate into DOMStage) — enforce at lifecycle gate.

---

## ✅ What Architect Needs to Approve
- Final architecture boundaries (PDSC).  
- Contract alignment (UAI config + hybrid policy).  
- UAI lifecycle enforcement for Phase 2.  
- CSS load rule and where it is enforced.  

---

## 📎 Evidence Index (Quick Links)
- `ui/src/components/core/UnifiedAppInit.js`  
- `ui/src/components/core/stages/DOMStage.js`  
- `ui/src/components/core/cssLoadVerifier.js`  
- `ui/src/views/financial/cashFlows/cash_flows.html`  
- `ui/src/views/financial/brokersFees/brokers_fees.html`  
- `ui/src/views/financial/tradingAccounts/trading_accounts.html`  
- `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md`  
- `_COMMUNICATION/team_30/UAI_Architectural_Design.md`  
- `/Users/nimrod/Documents/TikTrack/TikTrackApp/documentation/01-ARCHITECTURE/frontend/GENERAL_SYSTEMS_LIST.md`

---

**Team 90 (The Spy)**  
**Date:** 2026-02-07  
**Status:** 🔴 **DECISIONS REQUIRED**  

**log_entry | [Team 90] | ARCHITECT_DECISION_BRIEF | PDSC_UAI_CSSLOAD | RED | 2026-02-07**
