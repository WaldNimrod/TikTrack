# 🕵️ Team 90 → Architect: Broker vs Fees Entity Decision — Context & Recommendation

**id:** `TEAM_90_TO_ARCHITECT_BROKER_FEES_ENTITY_DECISION_CONTEXT`  
**owner:** Team 90 (The Spy)  
**date:** 2026-02-11  
**status:** 🧭 **DECISION REQUIRED**  
**scope:** Data Model + API + UI alignment (Phase 2 foundations)  

---

## 🎯 Purpose
To decide the **canonical entity model** for Brokers & Fees (foundation-level, no patches). This decision affects DB schema, API contracts, UI forms, and long‑term integration (imports/API sync).

---

## ✅ Current State (SSOT + Code)

### 1) SSOT DB Schema (current)
- **`user_data.trading_accounts`** includes **`broker`** (string field) — broker is an attribute of the trading account.  
  **Ref:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (table `trading_accounts`, broker column).
- **`user_data.brokers_fees`** exists as a standalone table with:  
  `broker`, `commission_type`, `commission_value`, `minimum`, `user_id` (no `trading_account_id`).  
  **Ref:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (table `brokers_fees`).

### 2) API Reference (ADR‑013)
- **Broker list must be API‑based**: `GET /api/v1/reference/brokers`.  
  **Ref:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md` (ADR‑013).

### 3) Current Reference Implementation
- `/api/v1/reference/brokers` pulls **distinct broker names from `brokers_fees`** and falls back to `defaults_brokers.json`.  
  **Ref:** `api/routers/reference.py`, `api/services/reference_service.py`.

---

## 🧠 Product Logic (as clarified by G‑Lead)
- **User‑relevant entity is the Trading Account**, not the broker itself.
- **Fees apply to a specific trading account**, not directly to a broker.
- Broker affects **import format / future API link**, but fees are **account‑scoped**.

This implies the **true relationship is: Trading Account → Fees (1:M)** and broker is metadata of the account.

---

## 🔍 Mismatch Identified
We currently store fees per **broker name** (via `brokers_fees`), while product logic expects fees per **trading account**. This is a foundational mismatch.

---

## 🧭 Decision Options (Architect‑level)

### **Option A — Keep `brokers_fees` (Broker‑centric)**
**Model:** User → brokers_fees (broker name + commission).  
**Pros:** Minimal changes; matches current table.  
**Cons:** Not aligned with account‑based fee logic; conflates broker identity and account‑specific fees; harder future integration with per‑account rules.

### **Option B — Account‑based Fees (Recommended)**
**Model:** Trading Account → Fees (`trading_account_id` FK) with broker as account metadata.  
**Pros:** Aligns with business logic; clear ownership; supports multiple accounts per broker; clean foundation for future integrations.  
**Cons:** Requires DB + API + UI adjustments; migration from current broker_fees.

### **Option C — Hybrid (Broker Defaults + Account Overrides)**
**Model:** Broker defaults (reference) + account‑specific overrides.  
**Pros:** Flexible; supports defaults while keeping account logic.  
**Cons:** More complex; adds policy layer; higher implementation and QA cost.

---

## ✅ Team 90 Recommendation
**Adopt Option B (Account‑based Fees)**.  
Rationale: we are laying foundations; broker is metadata of the account; fees must be tied to account to avoid long‑term drift. No patches.

---

## 📌 Required Changes if Option B is Approved
**Data Model**
- Introduce `user_data.trading_account_fees` (or rename/replace `brokers_fees`) with `trading_account_id` FK.
- Maintain broker on `trading_accounts` (already exists).

**API**
- Update CRUD endpoints to use `trading_account_id`.  
- Reference brokers API remains for dropdowns (still needed for account creation/import), but **fees are account‑scoped**.

**UI**
- Forms: “Broker” select bound to account; fees configured per account.
- D18 UI may need relabeling (from Brokers Fees → Account Fees) depending on naming decision.

**Migration**
- Map existing `brokers_fees` rows to trading accounts (if possible).  
- If not possible, migrate as defaults and force explicit assignment per account.

---

## 📎 Key References
- `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
  - `user_data.trading_accounts` (broker field)
  - `user_data.brokers_fees` (current fees storage)
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md` (ADR‑013)
- `api/routers/reference.py` + `api/services/reference_service.py` (reference/brokers API)

---

## ✅ Decision Needed
Please choose **Option A / B / C** and confirm naming/route conventions for the fees endpoint(s).  
Team 90 will enforce the decision across SSOT + code + tests.

**Proposed Decision:** **Option B (Account‑based Fees)**.
