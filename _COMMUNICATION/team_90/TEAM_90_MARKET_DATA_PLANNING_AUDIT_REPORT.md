# 🕵️ Team 90 → Architect: Market Data Planning Audit (ADR‑022 / ARCH‑STRAT‑002)

**id:** `TEAM_90_MARKET_DATA_PLANNING_AUDIT_REPORT`  
**from:** Team 90 (The Spy)  
**to:** Architect + Team 10  
**date:** 2026-02-13  
**context:** TEAM_90_MARKET_DATA_PLANNING_AUDIT.md (ACTIVE PLANNING)

---

## 1) Precision Check (20,8 for prices/rates)

**Status:** ✅ **PASS (SSOT aligned)**

**Evidence:**
- `documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md` — conversion_rate NUMERIC(20,8).  
- `documentation/01-ARCHITECTURE/PRECISION_POLICY_SSOT.md` — prices/rates NUMERIC(20,8).  
- `api/models/ticker_prices.py` + DB (Team 60 evidence) — NUMERIC(20,8).

**Gap:** Provider specs (Yahoo/Alpha) are not yet referenced inside `MARKET_DATA_PIPE_SPEC.md` → must be added as Primary sources.

---

## 2) Cache Design (Cache‑First)

**Status:** ⚠️ **PARTIAL**

**Evidence:**
- `api/services/exchange_rates_service.py` — DB only; no external calls.  
- ADR‑022 mandates Cache‑First globally.

**Gap:** Cache‑First is not fully expressed in `MARKET_DATA_PIPE_SPEC.md` for **prices** (not only FX).  
**Required:** explicit rule: *no external API call without local cache check*, for both FX and Prices.

---

## 3) Fallback Logic (Failover)

**Status:** ⚠️ **DEFINED IN ARCH DOCS, NOT YET IN SSOT**

**Evidence:**
- ARCH‑STRAT‑002 defines:  
  - FX: Alpha → Yahoo  
  - Prices: Yahoo → Alpha

**Gap:** This priority order is not yet written into `MARKET_DATA_PIPE_SPEC.md` or provider registry SSOT.

---

## 4) Rate Limit Security (Queue Manager)

**Status:** ⚠️ **NOT YET PLANNED IN SSOT**

**Evidence:**
- Alpha Vantage spec requires **RateLimitQueue (12.5s delay)**.
- Yahoo spec requires **User‑Agent Rotation**.

**Gap:** No implementation plan or SSOT section that mandates these guardrails.

---

## 5) Summary — Ready/Blocked

**Ready:** Precision policy for prices/rates (20,8) is consistent.  
**Blocked:** SSOT missing provider guardrails + fallback + cache‑first for prices.  
**Action:** Update SSOT, then reopen Gate‑B for Stage‑1 external data planning.

---

**log_entry | TEAM_90 | MARKET_DATA_PLANNING_AUDIT | 2026-02-13**
