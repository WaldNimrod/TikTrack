# Team 90 → Team 10: External Data — Intraday Decisions Locked (Stage‑1)

**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**context:** Closure of Stage‑1 intraday decisions  
**status:** ✅ **LOCKED — proceed to implementation**

---

## ✅ Decisions (LOCKED)

1) **Ticker Status Policy**  
Use existing `is_active_flags` as source of truth.  
- `true` → **Intraday**  
- `false` → **EOD only**

2) **Interval Dimension**  
**Separate table** for intraday: `market_data.ticker_prices_intraday`.  
Daily/EOD + 250d history remain in `market_data.ticker_prices`.

3) **Cadence Configuration (Admin Settings)**  
System Settings must expose **configurable cadence** by **domain + status**:  
- Prices (Active): intraday interval (minutes)  
- Prices (Inactive): EOD schedule (time + timezone)  
- FX: EOD schedule (time + timezone)  
- Staleness thresholds (warning/na) for clock UI

4) **Providers & Priority**  
No change: **Yahoo → Alpha** for Prices; **Alpha → Yahoo** for FX.  
Intraday is **required** for Active tickers in Stage‑1.

---

## ✅ SSOT Updates Applied by Team 90 (for reference)

- `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md`  
  Added intraday requirement, separate table, System Settings cadence config.  
- `documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md`  
  Storage updated: `ticker_prices_intraday` for Active intraday.
- `TEAM_90_MARKET_DATA_GAPS_AND_OPEN_QUESTIONS.md`  
  Marked Intraday + Interval + Ticker Status as **RESOLVED**.

---

## 🔧 Required Actions (Team 10)

1) **Update task status**  
Mark P3‑010 (Cadence + Ticker Status) as **unblocked** and ready for execution.  

2) **DB / Schema tasking (Team 60)**  
Define + migrate **`market_data.ticker_prices_intraday`** table.  

3) **Backend tasking (Team 20)**  
Service layer: intraday reads/writes in new table; daily/historical in `ticker_prices`.  

4) **SSOT evidence**  
Update `TEAM_10_EXTERNAL_DATA_SSOT_EVIDENCE_LOG.md` with this lock.

---

**log_entry | TEAM_90 | INTRADAY_DECISIONS_LOCKED | STAGE1 | 2026-02-13**
