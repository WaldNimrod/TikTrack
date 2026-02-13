# Team 90 → Team 10: External Data — Live Provider Execution Request

**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**status:** 🔴 **EXECUTION REQUIRED — live data verification**

---

## 1) Context (Live results)

- **Alpha Vantage LIVE** ✅  
  Global Quote for AAPL returned successfully (real data).
- **Yahoo LIVE** ⚠️  
  Returns **429 Too Many Requests** from current IP. This is **rate‑limit**, not “market closed”.

We need **provider‑level execution** from the teams’ environment to finalize live verification.

---

## 2) Required Execution (Teams 20 + 30)

### Team 20 (Backend — Providers)
1. Run live fetch (Yahoo + Alpha) from team environment.  
2. Confirm **UA Rotation** (Yahoo guardrail) is active in LIVE mode.  
3. Confirm **RateLimitQueue** (Alpha 12.5s) is active.  
4. Record live output for **3 tickers** (e.g., AAPL, MSFT, TSLA).

### Team 30 (Frontend — UI)
1. Display live prices in UI for **3 tickers**.  
2. Verify **Clock + tooltip** with staleness values (ok/warning/na).  
3. Provide screenshots or evidence log.

---

## 3) Success Criteria (MANDATORY)

- ✅ Live data retrieved from **Alpha** for at least **3 tickers**.  
- ✅ Yahoo either **works** or is documented with **429** + UA rotation evidence.  
- ✅ UI shows **3 tickers** with live prices (screenshots + timestamps).  
- ✅ Evidence logs stored in `_COMMUNICATION/team_20/` and `_COMMUNICATION/team_30/`.

---

## 4) Evidence Deliverables

- Team 20: `TEAM_20_EXTERNAL_DATA_LIVE_PROVIDER_EVIDENCE.md`  
  (include command outputs + timestamps)
- Team 30: `TEAM_30_EXTERNAL_DATA_LIVE_UI_EVIDENCE.md`  
  (screenshots + UI clock status)

---

## 5) Team 10 Action

Distribute this mandate to Teams 20/30 immediately.  
Collect evidence and confirm readiness for Team 90 validation.

---

**log_entry | TEAM_90 | EXTERNAL_DATA_LIVE_PROVIDER_EXECUTION_REQUEST | 2026-02-13**
