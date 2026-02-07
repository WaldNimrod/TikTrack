# 🧭 Architect Report: Base Systems Adoption for Phoenix v2 (Phase 2)

**From:** Team 90 (The Spy)  
**To:** Chief Architect (Gemini)  
**Date:** 2026-02-06  
**Status:** 📌 Proposal for decision  
**Scope:** Phase 2 — Financial Core (D16/D18/D21)  
**Sources:** Legacy General Systems List + current Phoenix v2 codebase

---

## 0) Executive Summary
Phase 2 introduces multiple **structurally similar pages** (financial core). Current code already shows **repeated patterns** (header handlers, data loaders, table behaviors, filters). Legacy TikTrack includes **mature base systems** that match these patterns. This report proposes **adopting key base systems by concept**, not by copy‑paste, to enforce SSOT, reduce drift, and align with the **LEGO modular architecture**.

**Decision needed:** Approve one of the **adoption options (A/B/C)** and authorize creation of new **Core + Config layers**.

---

## 1) Evidence (Current Phoenix v2 patterns)

**Duplicated per‑page header logic:**
- `ui/src/views/financial/tradingAccounts/tradingAccountsHeaderHandlers.js`
- `ui/src/views/financial/brokersFees/brokersFeesHeaderHandlers.js`
- `ui/src/views/financial/cashFlows/cashFlowsHeaderHandlers.js`

**Per‑page Data Loader logic (similar flow):**
- `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js`
- `ui/src/views/financial/brokersFees/brokersFeesDataLoader.js`
- `ui/src/views/financial/cashFlows/cashFlowsDataLoader.js`

**Table behavior shared toolset (already in shared layer):**
- `ui/src/cubes/shared/PhoenixTableFilterManager.js`
- `ui/src/cubes/shared/PhoenixTableSortManager.js`
- `ui/src/cubes/shared/tableFormatters.js`

**SSOT requirements already mandated:**
- Routes: `ui/public/routes.json`
- Transformers: `ui/src/cubes/shared/utils/transformers.js`
- Masked log: `ui/src/utils/maskedLog.js`

---

## 2) Candidate Base Systems (from Legacy) to adopt by concept

Below is a **curated subset** from the legacy General Systems List (TikTrack v1) that maps directly to Phoenix v2 gaps. Each system includes **purpose, initial spec, LEGO alignment, and implementation practices**.

### 2.1 Unified App Initialization System
**Purpose:** Standardize page bootstrapping across all modules.  
**Initial Spec:** `initCore(config)` with 5 phases: DOMReady → Preload → Bind → Register → PostInit.  
**LEGO Alignment:** Core brick + per‑page config brick.  
**Implementation Practices:**
- `ui/src/views/shared/pageInitCore.js`
- `ui/src/views/financial/*/*PageConfig.js`
- Enforce no per‑page custom bootstraps outside config.

---

### 2.2 Event Handler Manager (Delegation)
**Purpose:** Prevent duplicated listeners, reduce memory leaks, unify UI interaction patterns.  
**Initial Spec:** `registerEvent({selector, event, handler, scope})` + `debugList()`  
**LEGO Alignment:** UI Core brick (used by header, filters, tables).  
**Implementation Practices:**
- Central handler registry in `ui/src/cubes/shared/ui/eventHandlerManager.js`
- Page configs only declare selectors + handlers.

---

### 2.3 Data Services Layer (Entity Services)
**Purpose:** Centralize fetch logic, transforms, and entity CRUD pipelines.  
**Initial Spec:** `createService({entity, baseUrl, endpoints, transformer, validator})`  
**LEGO Alignment:** Data Core brick + entity config bricks.  
**Implementation Practices:**
- `ui/src/cubes/shared/data/phoenixDataServiceCore.js`
- Entity service configs in `ui/src/cubes/entities/<entity>/serviceConfig.js`

---

### 2.4 CRUD Response Handler
**Purpose:** Consistent UI response patterns (notifications, table refresh, modal close).  
**Initial Spec:** `handleCrudResponse({entity, action, result, uiHooks})`  
**LEGO Alignment:** Flow brick used by tables, modals, forms.  
**Implementation Practices:**
- `ui/src/cubes/shared/flow/crudResponseHandler.js`
- Integrated with Notification System.

---

### 2.5 Field Renderer Service
**Purpose:** Stable rendering of date/amount/status/badges across all tables.  
**Initial Spec:** `renderField(type, value, meta)`  
**LEGO Alignment:** Table view brick.  
**Implementation Practices:**
- `ui/src/cubes/shared/tables/fieldRenderer.js`
- Link with `tableFormatters` and transformers.

---

### 2.6 Table Sort Value Adapter
**Purpose:** Uniform sorting across mixed value types.  
**Initial Spec:** `normalizeSortValue(type, value)`  
**LEGO Alignment:** Table core brick.  
**Implementation Practices:**
- `ui/src/cubes/shared/tables/sortValueAdapter.js`

---

### 2.7 Notification System
**Purpose:** Unified success/error/info UX for actions.  
**Initial Spec:** `notify(type, message, meta)` + queue.  
**LEGO Alignment:** UI Core brick.  
**Implementation Practices:**
- `ui/src/cubes/shared/ui/notificationCenter.js`
- Integration with CRUD Response Handler.

---

### 2.8 Select Populator + Default Value Setter
**Purpose:** Standard select population, caching, and defaults.  
**Initial Spec:** `populateSelect({source, target, cache})`  
**LEGO Alignment:** Form Core brick.  
**Implementation Practices:**
- `ui/src/cubes/shared/forms/selectPopulator.js`
- `ui/src/cubes/shared/forms/defaultValues.js`

---

### 2.9 Modal Manager + Navigation + Z‑Index (Optional in Phase 2)
**Purpose:** Avoid modal stacking conflicts across financial modules.  
**Initial Spec:** Stack manager + z-index coordinator.  
**LEGO Alignment:** UI Core brick (optional).  
**Implementation Practices:**
- `ui/src/cubes/shared/ui/modalManager.js`

---

## 3) What’s already Base vs. what should move to Base

### Already Base (keep)
- Routes SSOT (`ui/public/routes.json`)
- Transformers SSOT (`ui/src/cubes/shared/utils/transformers.js`)
- Masked Log (`ui/src/utils/maskedLog.js`)
- Table filter/sort managers (`ui/src/cubes/shared/*`)

### Must move to Base (priority for Phase 2)
- Header Handlers → `headerHandlersCore + pageConfig`
- Data Loaders → `DataServiceCore`
- CRUD Response Handler
- Field Renderer + Sort Adapter

### Keep per‑page (entity‑specific)
- Column definitions
- Field maps
- UI copy and status labels
- Entity‑specific validation rules

---

## 4) Adoption Options (Architect Choice)

### **Option A — Minimal Core (Fast, Safe)**
**Scope:** Header Handlers + DataServiceCore + CRUD Response Handler.  
**Timeline:** 1–2 sprints.  
**Risk:** Low.  
**Benefit:** Immediate reduction of drift.

### **Option B — Balanced Core (Recommended)**
**Scope:** Option A + Field Renderer + Sort Adapter + Notification.  
**Timeline:** 2–3 sprints.  
**Risk:** Medium.  
**Benefit:** Full table consistency, faster page rollout.

### **Option C — Full Base Systems (Max Unification)**
**Scope:** Option B + Modal Manager + Select/Defaults + Page Init Core.  
**Timeline:** 3–4 sprints.  
**Risk:** Higher.  
**Benefit:** Strongest long‑term maintainability.

---

## 5) Integration With LEGO Architecture
Each proposed system becomes a **Core Brick** with **Config Bricks** per module.  
This aligns with Phoenix’s hybrid React/HTML architecture:

- **Core Bricks:** shared in `ui/src/cubes/shared/` or `ui/src/views/shared/`
- **Config Bricks:** per module in `ui/src/views/financial/<module>/`

**Outcome:** modules remain modular while behavior stays consistent.

---

## 6) Governance & Enforcement
- All base systems must be registered in `documentation/00-MANAGEMENT/00_MASTER_INDEX.md`.
- Each base system requires metadata block (`id/owner/status/supersedes`).
- Page modules forbidden from duplicating base logic after adoption.

---

## 7) Recommendation (Team 90)
**Approve Option B** (Balanced Core).  
It delivers most ROI before D18/D21 expansion, without high risk.

---

## 8) Required Decisions (Architect)
1. **Approve adoption option (A/B/C).**
2. **Approve creation of Core + Config structure.**
3. **Approve enforcement rule:** no per‑page header/data logic once base exists.

---

**log_entry | [Team 90] | BASE_SYSTEMS_ADOPTION | ARCH_REPORT_SUBMITTED | YELLOW | 2026-02-06**
