# Team 90 → Team 10: External Data — Maintenance & Final Locks (Ready to Execute)

**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**status:** ✅ **LOCKED — proceed to execution**

---

## ✅ What’s locked (Stage‑1 External Data)

1) **Providers + Priority**  
Yahoo Finance (Primary for Prices) / Alpha Vantage (Fallback)  
Alpha Vantage (Primary for FX) / Yahoo (Fallback)

2) **Intraday Requirement**  
Active tickers = **Intraday** (Stage‑1), inactive = EOD  
Source of truth: `is_active_flags`

3) **Interval Storage**  
Intraday data **must live in a separate table**:  
`market_data.ticker_prices_intraday`

4) **Cadence Config (Admin Settings)**  
Must support configurable cadence by **domain + status**:
Prices (Active), Prices (Inactive), FX + staleness thresholds.

5) **Retention + Archive (NEW — LOCKED)**  
- **Intraday DB:** 30 days → archive files (1 year) → delete  
- **EOD/FX DB:** 250 trading days → archive files (no hard delete)  
- **Cleanup cycles:** Daily / Weekly / Monthly

---

## ✅ SSOT files updated (authoritative)

- `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md`  
  + Intraday, separate table, System Settings cadence  
  + **Maintenance/Retention/Cleanup §7** (new)
- `documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md`  
  + Retention + archive summary
- `documentation/05-REPORTS/artifacts/TEAM_10_EXTERNAL_DATA_SSOT_EVIDENCE_LOG.md`  
  + Evidence log updated for maintenance lock
- `documentation/01-ARCHITECTURE/LOGIC/TT2_MARKET_DATA_RESILIENCE.md`  
  + Staleness thresholds (15m/24h)

---

## ✅ Execute now (no blockers)

Please proceed with:
- **P3‑008:** Provider Interface + Cache‑First (Team 20)  
- **P3‑009:** Guardrails (Team 20)  
- **P3‑011:** FX EOD Sync (Team 60)  
- **P3‑012:** Clock UI (Team 30)  
- **P3‑013:** Market Cap (Team 20)  
- **P3‑014:** Indicators ATR/MA/CCI (Team 20)  
- **P3‑015:** 250d Historical Daily (Team 20)  
- **NEW:** DB + migration task for `market_data.ticker_prices_intraday` (Team 60)  
- **NEW:** Cleanup jobs implementation (Team 60) + evidence logs

---

## 🟠 Non‑blocking follow‑ups (prepare proposals)

1) **Rate‑limit feasibility (Alpha Vantage)**  
Define max active tickers / schedule policy in SSOT.

2) **Provider Registry SSOT**  
Decide: new SSOT doc vs embed in `MARKET_DATA_PIPE_SPEC.md`.

These are not blockers, but proposals are required for closure.

---

## ✅ Required Response

1) Confirm execution kickoff for the tasks above.  
2) Update your task list + evidence logs accordingly.  
3) Report back when intraday table + cleanup jobs are implemented.

---

**log_entry | TEAM_90 | EXTERNAL_DATA_MAINTENANCE_LOCKED_UPDATE | 2026-02-13**
