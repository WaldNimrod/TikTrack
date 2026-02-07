# 🕵️ Architect Decision Report — Open Questions (Phase 1.8)

**id:** `TEAM_90_ARCHITECT_DECISION_REPORT_OPEN_QUESTIONS_PHASE_1_8`  
**owner:** Team 90 (The Spy)  
**status:** 🔴 **DECISIONS REQUIRED**  
**last_updated:** 2026-02-07  
**version:** v1.0  

---

## 📌 Purpose
Provide the Architect with **complete, decision‑ready context** for the three blocking open questions raised by Team 20, including **options, rationale, and code references**. Architect receives only this report, so all relevant knowledge is included here.

Source questions (Team 20):  
- `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_OPEN_QUESTIONS.md`

---

## ✅ Verified Evidence (Code & Specs)

### UAI Core Exists in Code
- `ui/src/components/core/UnifiedAppInit.js` — main controller (UAI)  
- `ui/src/components/core/stages/DOMStage.js` — DOM stage  
- `ui/src/components/core/cssLoadVerifier.js` — CSS verifier

**Evidence:**
- `ui/src/components/core/UnifiedAppInit.js:17-45`  
- `ui/src/components/core/stages/DOMStage.js:12-48`  
- `ui/src/components/core/cssLoadVerifier.js:22-153`

### UAI Config Contract Requires External JS + `window.UAI.config`
- Contract explicitly forbids inline scripts and uses `window.UAI.config`.

**Evidence:**
- `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md:14-20`  
- `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md:88-140`

### UAI Architectural Spec Still Shows Inline `<script>` + `window.UAIConfig`
- Spec example uses inline config and the old namespace.

**Evidence:**
- `_COMMUNICATION/team_30/UAI_Architectural_Design.md:771-783`

### DOMStage Does **Not** Execute CSSLoadVerifier
- Verifier exists but is not invoked in DOMStage.

**Evidence:**
- `ui/src/components/core/stages/DOMStage.js:22-48`

### CSS Verifier Requires `phoenix-base.css` First
- Current verifier fails if `phoenix-base.css` is not index 0.

**Evidence:**
- `ui/src/components/core/cssLoadVerifier.js:136-145`

### Phase 2 HTML Pages Load Pico Before `phoenix-base.css`
- Current page order violates the verifier requirement if enforced strictly.

**Evidence:**
- `ui/src/views/financial/cashFlows/cash_flows.html:12-17`  
- `ui/src/views/financial/brokersFees/brokers_fees.html:12-17`  
- `ui/src/views/financial/tradingAccounts/trading_accounts.html:12-17`

---

# 🔴 Decision 1 — PDSC Frontend vs Backend Boundary

## Problem
Contract describes PDSC as “hybrid” but does **not** fully lock responsibility boundaries. This blocks final signature and implementation alignment.

## Options

### **Option A — PDSC as Frontend Service (JS) + Backend as API**
**Meaning:** PDSC is implemented in frontend (JS) using backend API as data source.
- **Pros:**
  - Aligns with current **frontend data loaders** and transformers flow.
  - Keeps UAI lifecycle and frontend integration consistent.
- **Cons:**
  - Backend role reduced to API contract enforcement only.

### **Option B — PDSC as Backend Service (Python)**
**Meaning:** PDSC logic is implemented backend‑side; frontend is thin client.
- **Pros:**
  - Centralized business logic enforcement server‑side.
- **Cons:**
  - Requires **refactoring** current frontend data loaders and UAI expectations.
  - Slows Phase 1.8 retrofit unless already prepared.

### **Option C — Hybrid Split (Dual Contracts)**
**Meaning:** Backend owns data contract; frontend owns transformation/render contract.
- **Pros:**
  - Clear split if documented properly.
- **Cons:**
  - Requires **two explicit contracts** + mapping doc; higher coordination cost.

## Recommendation (Team 90)
**Option A** for Phase 1.8 speed and alignment with current code, with explicit backend API contract boundaries.

---

# 🔴 Decision 2 — UAI Config Without Inline `<script>`

## Problem
Hybrid Policy forbids inline JS. Contract mandates external config (`window.UAI.config`) but UAI architectural spec still shows inline `<script>` + `window.UAIConfig`.

## Options

### **Option A — External JS File (Recommended)**
- Each page loads a **config JS** file before `UnifiedAppInit.js`.
- Example: `cashFlowsPageConfig.js` defining `window.UAI.config`.
- **Pros:**
  - Fully compliant with Hybrid Policy.
  - Works with current contract language.
- **Cons:**
  - Requires extra file per page.

### **Option B — External JSON + Loader**
- Use `uai-config.json` and a loader that assigns to `window.UAI.config`.
- **Pros:**
  - Clean data‑only config.
  - Easy validation and tooling.
- **Cons:**
  - Requires loader logic and error handling.

### **Option C — Allow Inline for Legacy Only (Deprecated)**
- Inline script allowed **only for legacy**, explicitly labeled forbidden in new work.
- **Pros:**
  - Smooths legacy transition.
- **Cons:**
  - Creates drift and policy ambiguity.

## Recommendation (Team 90)
**Option A** (external JS) as default. Option B is acceptable if loader is standardized and documented. Inline must remain **forbidden** for new pages.

---

# 🔴 Decision 3 — Code Must Match Contract (Not the Other Way Around)

## Problem
Team 20 requests that contracts remain authoritative and code must be adjusted to match them. Currently, some code patterns do not implement contractual requirements (e.g., CSS verification not executed in DOMStage, UAI not used in pages).

## Options

### **Option A — Contract‑First Enforcement (Recommended)**
- Treat contract as SSOT and **update code** to comply.
- Benefits: clean infra, no “patching,” long‑term stability.

### **Option B — Code‑First Alignment**
- Adjust contract to match current code reality.
- Benefits: faster short‑term alignment.
- Risks: permanent drift from policy and mandates.

## Recommendation (Team 90)
**Option A**. If code does not match contract, **code must be updated**. This aligns with Phase 1.8 retrofit mandate.

---

# ⚠️ Related Technical Dependencies (Architect Awareness)

1) **CSS verification enforcement** must be integrated into DOMStage if UAI is the lifecycle gate.  
2) **phoenix-base.css ordering rule** must be clarified (strict first vs first among Phoenix styles). Current pages load Pico before phoenix-base, which conflicts with current verifier logic.  
3) **Namespace standardization**: code supports `window.UAI.config` and legacy `window.UAIConfig`. The contract mandates `window.UAI.config`. Architect decision should declare legacy fallback **deprecated** (explicitly documented).

---

# ✅ Required Architect Outputs
To unblock Phase 1.8, this report requests the following **final decisions**:

1. **PDSC boundary model** (Frontend vs Backend vs Hybrid split).
2. **UAI Config delivery format** (External JS vs JSON+Loader, inline forbidden).
3. **Contract‑first enforcement** (code must match contract; confirm explicitly).

---

## 📎 Evidence Index
- `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_OPEN_QUESTIONS.md`  
- `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md`  
- `_COMMUNICATION/team_30/UAI_Architectural_Design.md`  
- `ui/src/components/core/UnifiedAppInit.js`  
- `ui/src/components/core/stages/DOMStage.js`  
- `ui/src/components/core/cssLoadVerifier.js`  
- `ui/src/views/financial/cashFlows/cash_flows.html`  
- `ui/src/views/financial/brokersFees/brokers_fees.html`  
- `ui/src/views/financial/tradingAccounts/trading_accounts.html`

---

**Team 90 (The Spy)**  
**Date:** 2026-02-07  
**Status:** 🔴 **DECISIONS REQUIRED**  

**log_entry | [Team 90] | ARCHITECT_DECISION_REPORT | OPEN_QUESTIONS_PHASE_1_8 | RED | 2026-02-07**
