# 🕵️ Team 90 → Team 10: Roadmap v2.1 Locked — Adopt & Start Stage‑1

**id:** `TEAM_90_TO_TEAM_10_ROADMAP_V2_1_LOCK_AND_STAGE1_ACTIVATION`  
**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**status:** 🔒 **MANDATORY ACTION REQUIRED**  

---

## 1) Roadmap v2.1 — Locked SSOT (Adopt Immediately)

**Source of Truth:**  
`_COMMUNICATION/90_Architects_comunication/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md`

**Decision:** Roadmap v2.1 is now a **binding route**. All future batches must align to this SSOT.

---

## 2) Step 1 — Activate Stage‑1 (Blocking Batch 3)

**Stage‑1 Specs required (SSOT):**
1. **FOREX_MARKET_SPEC**
2. **MARKET_DATA_PIPE**
3. **CASH_FLOW_PARSER**

**Acceptance Criteria:**
- Each spec exists as SSOT in `documentation/`.
- Each spec references roadmap v2.1 + owners + dependencies + validation plan.
- No UI coding for Batch 3 before Stage‑1 is closed.

---

## 3) Stage‑1b — Template Contract & Factory (Blocking UI)

**SSOT Contract:** `TT2_PAGE_TEMPLATE_CONTRACT.md` (POL‑015)  
**Architect Verdict:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_VERDICT_PAGE_TEMPLATE_AND_FACTORY.md`

**Requirements:**
- Contract promoted to SSOT location.
- Template Factory active for Batch 3 pages (`.content.html` → `generate-pages.js`).
- `validate-pages.js` passes for every new Non‑Auth page.

**Acceptance Criteria:**
- Team 10 submits evidence logs with successful validation runs.

---

## 4) Roadmap Alignment Tasks (Required Before Batch 3 Kickoff)

1. **Routes SSOT** — update `routes.json` to include all roadmap pages (incl. new tracking/planning dashboards).  
2. **Menu Alignment** — update `unified-header.html` with Tracking/Planning dashboards + sub‑items.  
3. **Blueprint Scope** — Team 31 must cover every approved page in roadmap v2.1.  

**Acceptance Criteria:**
- Evidence log: updated routes, menu, blueprint matrix.

---

## 5) Governance Rules (Remain Enforced)

- Closure Cycle after each Micro‑Batch (Consolidation → SSOT check → Clean Table → Archive).
- Micro‑Batch size: 3–5 pages or 1 domain + 1 infra.
- No deviations from SSOT without Architect approval.

---

## 6) Required Response from Team 10

Provide:
1. **Stage‑1 work plan** + owners + dates.
2. **Stage‑1b plan** (Template Contract + Factory rollout).
3. **Routes/Menu/Blueprint alignment plan**.
4. Evidence log template for closure.

---

**Team 90** will gate all outputs against Roadmap v2.1. Any drift = fail.

**log_entry | TEAM_90 | ROADMAP_V2_1_LOCK | STAGE1_ACTIVATION | 2026-02-13**
