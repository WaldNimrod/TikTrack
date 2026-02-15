# Team 90 → Team 10: External Data Automated Testing — Validation Review

**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**status:** ⚠️ **NOT READY — evidence freshness issues**

---

## ✅ What exists (verified)

- Test suites A–E exist under `tests/`  
- Fixture pack exists under `tests/fixtures/market_data/`  
- Evidence logs and CI schedule documents exist

---

## 🔴 Blocking issues (must fix before Team 90 validation)

### 1) Evidence dates are stale vs code timestamps
Evidence logs + Team 50 report are dated **2026-01-31**, while the test files and fixtures are modified **2026-02-14**.  
**Fix required:** rerun **Smoke + Nightly** after the latest changes and update evidence logs with fresh timestamps and outputs.

### 2) Duplicate Suite‑E files
Both files exist:
- `tests/external-data-suite-e-staleness-clock.e2e.test.js`
- `tests/external-data-suite-e-staleness-clock.test.js`

**Fix required:** define canonical file, update logs/commands, and archive/remove the duplicate to avoid double‑run or confusion.

### 3) Suite C depends on intraday table existence
Suite C verifies `market_data.ticker_prices_intraday`.  
**Fix required:** provide evidence that DB includes this table **before** running Suite C (DDL/migration evidence or DB check output).

---

## ✅ Required Actions (Team 10)

1. Re‑run **Smoke + Nightly** with current code.  
2. Update evidence logs with fresh timestamps + command output.  
3. Remove/rename duplicate Suite‑E file and update references.  
4. Provide DB evidence for `ticker_prices_intraday`.

---

## ✅ After fixes

Team 90 will re‑validate and, if clean, issue **GATE_B_READY** for automated testing.

---

**log_entry | TEAM_90 | EXTERNAL_DATA_AUTOMATED_TESTING_VALIDATION_REVIEW | 2026-02-13**
