# 🕵️ Team 90 Spy Validation SOP — Organization‑Wide (Automation‑First)

**id:** `TEAM_90_SPY_VALIDATION_SOP_PHASE_2`
**owner:** Team 90 (Spy)
**status:** 🟢 **APPROVED - BASIC LAW**
**last_updated:** 2026-02-07
**version:** v1.2

---

## 🎯 Purpose
Create a **locked, automation‑first** validation procedure that verifies **SSOT documentation, code implementation, and end‑user UI** end‑to‑end for **all development phases**. Manual/visual approval happens **only after all automated checks pass**. This SOP is **Basic Law** and is the sole gatekeeper to Production.

---

## 🔐 Non‑Negotiable Principles
1. **Automation‑First:** Every feasible check is automated, even with high initial setup cost.
2. **E2E Mandatory:** No GREEN without passing E2E automation.
3. **Manual/Visual Final Gate Only:** Manual/visual review only after all automated layers pass.
4. **Zero‑Deviation Governance:** Any divergence from SSOT/contract = **RED immediately**.
5. **Compartmentalization:** Team 90 methods, mappings, and internal findings are **compartmentalized** and **not shared** with Team 10 or other execution teams. Only final pass/fail outcomes and architect‑approved summaries are distributed.
6. **Automation Gatekeeper:** Team 90 automation gates are the **only** path to Production approval. No shortcuts.
7. **Master Index Sync:** Gates must remain **continuously synchronized** with the Master Index updates.

---

## 🧱 Validation Layers (Gate Model)

### **Gate A — Doc ↔ Code (Automated)**
**Goal:** Verify all SSOT specs match code artifacts.

**Checks:**
- Endpoints exist and match SSOT (paths, methods, response schema)
- DTO/Schema field names & types match SSOT
- Routes SSOT + version alignment
- Transformers version and field mapping alignment

**Artifacts:**
- `DocCodeMatrix.json`
- `DocCodeFindings.md`

**Pass Criteria:**
- 0 Critical, 0 High

---

### **Gate B — Code ↔ Runtime (Automated)**
**Goal:** Validate runtime behavior against contracts.

**Checks:**
- Contract tests against live responses (PDSC Boundary)
- Shared_Services only (no local loaders)
- UAI Config is external (no inline script)

**Artifacts:**
- `ContractTestReport.md`

**Pass Criteria:**
- 0 Critical, 0 High

---

### **Gate C — UI ↔ Runtime (Automated E2E Required)**
**Goal:** Confirm UI behavior + UAI flow + UI contracts.

**Checks (Automated):**
- UAI stages: DOM → Bridge → Data → Render → Ready
- E2E flows for D16/D18/D21
- Filters, pagination, summary toggles, tables
- CSS load order enforced (phoenix-base.css first) — must fail if wrong

**Artifacts:**
- `E2EReport.md`
- screenshots / snapshots

**Pass Criteria:**
- 100% mandatory scenarios pass

---

### **Gate D — Manual/Visual (Final Only)**
**Goal:** Human verification after all automation passes.

**Checks:**
- Visual layout fidelity vs SSOT
- Content correctness (dates, decimals, labels)
- UX sanity and edge cases

**Artifacts:**
- `ManualVisualApproval.md`

**Pass Criteria:**
- 0 Critical, 0 High

---

## ✅ Required Automation Minimum Set
- Contract Schema Validation (PDSC Boundary)
- Routes SSOT validation (version + base_url)
- Transformers compatibility (snake_case ↔ camelCase)
- UAI config external enforcement (no inline)
- CSS load order enforcement (fail if incorrect)
- No local DataLoader logic (must use Shared_Services)

---

## 🔗 Integration With Team 50 QA Infrastructure
**Mandatory usage of Team 50 automation assets:**
- Selenium + test index
- Security validation (token leakage, masked logs)
- Digital twin coverage

**Integration Rule:**
Team 90 produces gates; Team 50 executes QA automation suite; Team 90 approves GREEN only after gates pass.

---

## 🧾 Artifacts / Output List
1. `DocCodeMatrix.json`
2. `DocCodeFindings.md`
3. `ContractTestReport.md`
4. `E2EReport.md`
5. `ManualVisualApproval.md`
6. `Spy_Final_Green.md`

---

## 🧭 Final Approval Logic
**GREEN (Production‑Ready)** only if:
- Gates A–C: PASS
- Gate D: PASS

**Else:** RED or YELLOW with mandatory remediation plan.

---

## ✅ Required Adoption
This SOP applies to **all development phases and teams** (not limited to Phase 2).

**Enforcement:** Any deviation triggers **immediate RED**.

---

**Prepared by:** Team 90 (Spy)
**Date:** 2026-02-07
**Status:** 🟢 **APPROVED - BASIC LAW**

**log_entry | [Team 90] | SOP | SPY_VALIDATION_ORG_WIDE | APPROVED_BASIC_LAW | 2026-02-07 | v1.2**
