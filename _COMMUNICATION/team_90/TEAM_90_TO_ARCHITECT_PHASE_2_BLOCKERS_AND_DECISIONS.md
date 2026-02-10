# 🕵️ Team 90 → Architect: Phase 2 Final Blockers & Decisions (Code+Docs Scan)

**id:** `TEAM_90_TO_ARCHITECT_PHASE_2_BLOCKERS_AND_DECISIONS`
**From:** Team 90 (Spy / Governance)
**To:** Architect
**Date:** 2026-02-07
**Status:** 🔴 **BLOCKERS PRESENT – DECISION REQUIRED**
**Scope:** Phase 2 (D16/D18/D21) — Code + SSOT + Team 10/20/30/50/60 docs

---

## 🎯 Executive Summary (No GREEN Yet)
We re-scanned **code + SSOT + current team docs**. Multiple **hard blockers** remain. Some Team 10 summaries do **not** match code/SSOT. This report lists **precise findings**, **file references**, and **decision options**.

---

## 🔴 Blockers Requiring Architect Decision (24h)

### 1) Missing Backend Endpoints (Code ↔ UAI Config ↔ Docs mismatch)

#### 1.1 `cash_flows/currency_conversions`
**What code does now:**
- **UAI Config includes endpoint** (not removed):
  - `ui/src/views/financial/cashFlows/cashFlowsPageConfig.js:21-24`
- **DataLoader tries endpoint**, falls back to empty data with console.log:
  - `ui/src/views/financial/cashFlows/cashFlowsDataLoader.js:104-121`
- **Backend has no endpoint**:
  - `api/routers/cash_flows.py` (no `currency_conversions` route)

**Impact:**
- Table exists in UI flow, but backend endpoint is missing → empty table / confusion.
- Team 10 doc claims table removed from config; **this is false vs code**.

**Decision Options:**
- **Option A (Recommended):** Add backend endpoint + service + schema, keep table.
- **Option B:** Remove table from UI + remove endpoint usage in config/data loader.

**Required changes (if Option B):**
- `ui/src/views/financial/cashFlows/cashFlowsPageConfig.js` (remove endpoint)
- `ui/src/views/financial/cashFlows/cashFlowsDataLoader.js` (remove fetch)
- `ui/src/views/financial/cashFlows/cashFlowsTableInit.js` + HTML (remove table)
- Update SSOT + Team 10 requirements

---

#### 1.2 `brokers_fees/summary`
**What code does now:**
- **UAI Config includes endpoint**:
  - `ui/src/views/financial/brokersFees/brokersFeesPageConfig.js:20-24`
- **DataLoader tries endpoint**, falls back to local calculation:
  - `ui/src/views/financial/brokersFees/brokersFeesDataLoader.js:82-105`
- **Backend has no endpoint**:
  - `api/routers/brokers_fees.py` (no `/summary`)

**Impact:**
- Functionality works via local summary, but violates config/spec consistency and adds UI‑side computation.

**Decision Options:**
- **Option A:** Implement backend summary endpoint and keep config as-is.
- **Option B:** Remove summary from config + rely on client calculation explicitly in SSOT.

---

### 2) Console Hygiene / Masked Log Policy Violation (Hard Gate)
**What code does now:**
- Two `console.log` remain in DataLoaders (not masked):
  - `ui/src/views/financial/cashFlows/cashFlowsDataLoader.js:120`
  - `ui/src/views/financial/brokersFees/brokersFeesDataLoader.js:94`

**Impact:**
- Violates Masked Log Policy; **manual QA must fail** until removed.

**Decision:**
- Replace with `maskedLog` or remove entirely.

---

## 🔴 Blocker: Documentation Drift vs SSOT (Must Resolve)

### 3) D21 Infrastructure Status Drift
**Facts from code+SSOT:**
- SSOT DDL: `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql:976-1018`
- Team 60 verified table exists + matches SSOT:
  - `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_D21_CASH_FLOWS_TABLE_VERIFIED.md`

**Problem:**
- Team 10 comprehensive requirements still list D21 table as pending verification.

**Action:**
- Update Team 10 docs to reflect **D21 verified** and remove this as blocker.

---

## 🟡 Non‑Blocking but Must Align (48h)

### 4) Precision Mismatch in Infra Request
**SSOT + Code:**
- DDL & ORM use **NUMERIC(20,6)** for `cash_flows.amount`:
  - `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql:985`
  - `api/models/cash_flows.py:46-52`

**Mismatch:**
- Team 20 infra request uses **NUMERIC(20,8)** and extra `CHECK`.

**Action:**
- Update Team 20 infra request to **match SSOT** (20,6) and remove extra constraint unless architect overrides SSOT.

---

### 5) Manual QA Gate Ownership Conflict
**Docs conflict:**
- Team 10 requirements say **Team 40** completes Manual/Visual.
- Team 50 QA response says **Team 50** completes Manual QA after automation.

**Decision Needed:**
- Architect to confirm **single owner** of Manual Gate (Gate D) and sequence.

---

## ✅ Verified / PASS (No Action Required)
- **No inline scripts** in financial HTML.
- **UnifiedAppInit** is the only UAI entry point.
- **DataLoaders use Shared_Services** (no hardcoded fetch/axios).
- **Routes SSOT** used (no hardcoded API base).
- **CSS load order** correct (`phoenix-base.css` first).

---

## 📌 Recommended Decisions (Architect)
1) **Endpoints**: Decide A or B for both missing endpoints.
   - Team 90 recommends **Option A** for consistency (Backend summary + currency conversions).
2) **Manual QA Gate Owner**: Single authoritative owner + order (Automation → Manual once).
3) **Docs Drift**: Mandate that Team 10 update Phase 2 requirements to match verified infra.

---

## 📎 Key Evidence Pointers
- `ui/src/views/financial/cashFlows/cashFlowsPageConfig.js:21-24`
- `ui/src/views/financial/cashFlows/cashFlowsDataLoader.js:104-121`
- `ui/src/views/financial/brokersFees/brokersFeesPageConfig.js:20-24`
- `ui/src/views/financial/brokersFees/brokersFeesDataLoader.js:82-105`
- `api/routers/cash_flows.py` (no `/currency_conversions`)
- `api/routers/brokers_fees.py` (no `/summary`)
- `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql:976-1018`
- `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_D21_CASH_FLOWS_TABLE_VERIFIED.md`

---

**Team 90 Conclusion:**
No GREEN until the above decisions are made and code/docs are aligned 100%.
