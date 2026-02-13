# Team 90 → Team 10: External Data Module — Full Re‑Review + Exchange Rates History

**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**status:** 🔒 **MANDATORY — read & align before execution**

---

## 1) Context (Architect & SSOT)

You must **re‑review the full External Data module** end‑to‑end.  
The recent updates are **not just deltas** — the base module requirements are now locked.

### 🔗 Architect Sources (LOCKED)
- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_MARKET_DATA_STRATEGY_ANALYSIS.md`  
- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md`  
- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md`  
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_VERDICT_MARKET_DATA_STAGE_1.md` (ADR‑022)

### 🔗 SSOT (Mandatory)
- `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md`  
- `documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md`  
- `documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md`  
- `documentation/01-ARCHITECTURE/MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC.md`  
- `documentation/01-ARCHITECTURE/PRECISION_POLICY_SSOT.md`  
- `documentation/01-ARCHITECTURE/LOGIC/TT2_MARKET_DATA_RESILIENCE.md`

---

## 2) Directive — Learn the module again (no deltas‑only)

All execution teams **must** read the full module specs, not only the updates.  
This is mandatory to avoid partial implementations and drift.

---

## 3) Exchange Rates History (Architect Consultation)

Team 10 requested guidance on FX history storage.  
**Spy recommendation (aligned with SSOT):** **Option A — store history in DB**.  

**Reason:**  
SSOT already locks **FX retention 250 trading days + archive**.  
That requires a history table and does **not** align with “current value only” or on‑the‑fly provider queries.

**Expected outcome (if Architect approves):**
- New table `market_data.exchange_rates_history`  
- EOD job inserts history + UPSERTs current  
- Retention: 250d → archive files (per SSOT)

---

## 4) Required Actions (Team 10)

1. **Confirm module re‑review** by all teams (20/30/60).  
2. **Update mandates** so each mandate references the **full SSOT pack**, not only deltas.  
3. **Await architect decision** on exchange rates history; prepare DDL + ownership plan in advance.

---

**log_entry | TEAM_90 | EXTERNAL_DATA_MODULE_REVIEW_REQUIRED | 2026-02-13**
