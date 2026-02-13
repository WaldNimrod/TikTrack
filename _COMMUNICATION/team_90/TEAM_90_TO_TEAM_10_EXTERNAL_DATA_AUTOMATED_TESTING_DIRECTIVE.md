# Team 90 → Team 10: External Data — Automated Testing Directive (Nightly + PR Smoke)

**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**status:** 🔒 **MANDATORY — implement as architect instruction**

---

## ✅ Decision (Locked)

1) **Single central fixture pack** (shared for FX/Prices/Indicators).  
2) **Fixtures location:** `tests/fixtures/`  
3) **Execution model:**  
   - **Nightly CI:** full suite  
   - **PR/commit:** smoke subset

---

## 1) Required Architecture (Test Mode)

**Provider Replay Mode (MANDATORY):**  
All provider adapters must support `mode=REPLAY`, returning data from fixtures **without external calls**.

**Fixture Pack (Single Source of Truth):**  
Stored under `tests/fixtures/market_data/`  
Includes:
- FX EOD samples  
- Prices (intraday + EOD)  
- 250d daily history sample  
- Indicators sample (ATR/MA/CCI)  
- Market Cap sample  

---

## 2) Test Suites (Must Exist)

### A) Contract & Schema
- Validate required fields (`price_timestamp`, `fetched_at`, `is_stale`, `market_cap`)  
- Validate precision **20,8** (prices/rates/market_cap)  
- Validate `staleness` enum: `ok | warning | na`

### B) Cache‑First + Failover
- Cache HIT → no provider call  
- Cache MISS → Primary → Fallback  
- Primary fail → Fallback OK  
- Both fail → stale + `staleness=na` (Never block UI)

### C) Cadence & Status
- Active tickers → **Intraday** cadence  
- Inactive tickers → **EOD** cadence  
- Switch active↔inactive → correct behavior

### D) Retention & Cleanup Jobs
- Intraday DB: 30 days → archive → delete after 1 year  
- EOD/FX DB: 250d → archive (no hard delete)  
- Jobs emit `last_run_time`, `rows_updated`, `rows_pruned`

### E) UI (Clock + Tooltip)
- `staleness=ok` → neutral clock  
- `staleness=warning` → warning color + tooltip  
- `staleness=na` → alert color + tooltip  
- **No banner**

---

## 3) CI Execution Plan

**Nightly (Full):**
- All suites A–E  
- Uses `mode=REPLAY` fixtures  

**PR/Commit (Smoke):**
- A) Contract & Schema  
- B) Cache‑First + Failover  
- D) Retention (minimal check)  

---

## 4) Task Allocation (Team 10 to distribute)

| Team | Scope |
|------|------|
| **20** | Provider Replay Mode + contract tests + cache/failover tests |
| **60** | Retention/cleanup jobs + job evidence |
| **50** | Nightly/Smoke QA scripts + reporting |
| **30** | UI clock/tooltip automation (Selenium) |
| **10** | CI wiring + mandates + evidence log |

---

## 5) Acceptance Criteria (Must Pass)

- Full suite passes in nightly run  
- Smoke suite passes on PR  
- No external network calls when `mode=REPLAY`  
- Evidence logs attached for jobs + nightly run  

---

## ✅ Required Actions (Team 10)

1. Add this as **official directive** in Team 10 governance docs.  
2. Issue mandates to Teams 20/30/50/60.  
3. Publish evidence log + CI schedule.

---

**log_entry | TEAM_90 | EXTERNAL_DATA_AUTOMATED_TESTING_DIRECTIVE | 2026-02-13**
