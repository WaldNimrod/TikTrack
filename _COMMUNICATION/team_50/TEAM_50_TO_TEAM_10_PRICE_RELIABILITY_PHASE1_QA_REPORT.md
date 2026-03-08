# Team 50 → Team 10 | Price Reliability PHASE_1 — QA Report

**project_domain:** TIKTRACK  
**id:** TEAM_50_TO_TEAM_10_PRICE_RELIABILITY_PHASE1_QA_REPORT  
**from:** Team 50 (QA & Fidelity)  
**to:** Team 10 (Gateway Orchestration)  
**date:** 2026-03-09  
**status:** BLOCK  
**phase:** PHASE_1  
**trigger:** TEAM_10_TO_TEAM_50_PRICE_RELIABILITY_PHASE1_QA_REQUEST  
**procedure:** TEAM_50_QA_BLOCK_DIRECT_ROUTING_PROCEDURE_v1.0.0 — דרישת תיקון נשלחה ישירות ל־Team 20 (cc Team 10).

---

## 1) Executive Summary

**status:** BLOCK

PHASE_1 QA cannot be signed off. Two blockers prevent PASS:

1. **Missing unit test file** — `tests/unit/test_price_reliability_phase1.py` does not exist; Team 20 completion referred to this file.
2. **EOD_STALE regression not implemented** — Scenarios 1 and 2 fail: when EOD is stale and no intraday exists, the API returns `null` instead of `EOD_STALE` (not null).

---

## 2) Test Matrix Results

| # | Scenario | Expected | Actual (Code Analysis) | Result |
|---|----------|----------|------------------------|--------|
| 1 | stale EOD + no intraday (active) | EOD_STALE, not null | current_price null, price_source null | **FAIL** |
| 2 | stale EOD + no intraday (inactive) | EOD_STALE, not null | current_price null, price_source null | **FAIL** |
| 3 | stale EOD + intraday (active) | INTRADAY_FALLBACK | INTRADAY_FALLBACK | PASS |
| 4 | fresh EOD + intraday | EOD | EOD | PASS |
| 5 | missing EOD + intraday (active) | INTRADAY_FALLBACK | INTRADAY_FALLBACK | PASS |

---

## 3) Evidence

### 3.1 Unit Test Run

```
$ python3 -m pytest tests/unit/test_price_reliability_phase1.py -v
ERROR: file or directory not found: tests/unit/test_price_reliability_phase1.py
collected 0 items
```

**Path referenced in ACK:** `tests/unit/test_price_reliability_phase1.py`  
**Status:** File does not exist in repository.

### 3.2 Code Analysis — `api/services/tickers_service.py`

**Logic (lines 66–122):**

- EOD rows: if `price_timestamp` &lt; `stale_cutoff` → ticker added to `need_intraday`; **not added to `out`**.
- Intraday fallback: only adds to `out` when `intra_rows` has a row for that ticker.
- **No step** adds stale EOD values to `out` when intraday is missing.

**Result:** For stale EOD + no intraday (scenarios 1 & 2), the ticker never appears in `out`, so `_get_price_with_fallback` returns no entry → caller gets `price_data=None` → response has `current_price=null`, `price_source=null`.

### 3.3 Schema

`api/schemas/tickers.py` line 35:

```python
price_source: Optional[str] = Field(None, description="EOD | INTRADAY_FALLBACK — T190-Price provenance")
```

`EOD_STALE` is not documented in the schema (acceptable for PHASE_1, but logic must support it).

---

## 4) Blockers

| # | Blocker | Owner | Required Action |
|---|---------|-------|-----------------|
| B1 | Unit test file `test_price_reliability_phase1.py` missing | Team 20 | Create file with 5 scenarios; ensure all pass. |
| B2 | EOD_STALE not implemented | Team 20 | In `_get_price_with_fallback`, after intraday fallback, add tickers in `need_intraday` that are not in `out`, using stored EOD values with `price_source="EOD_STALE"` so price is never null when EOD exists. |

---

## 5) Recommended Remediation (Team 20)

1. **Preserve stale EOD data:** When a ticker is marked stale (added to `need_intraday`), store `(ticker_id, price_val, daily_pct, ts_utc)` in a temporary structure.
2. **Post intraday fallback:** For each ticker in `need_intraday` that is still not in `out`, insert the stored EOD values with `price_source="EOD_STALE"`.
3. **Create `test_price_reliability_phase1.py`:** 5 tests covering the mandated scenarios.
4. **Schema:** Add `EOD_STALE` to the `price_source` description in `api/schemas/tickers.py`.

---

## 6) Direct Fix Request (per procedure)

**Per TEAM_50_QA_BLOCK_DIRECT_ROUTING_PROCEDURE_v1.0.0:** דרישת תיקון מפורטת נשלחה ישירות ל־Team 20 עם cc ל־Team 10:

- **Path:** `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_20_PRICE_RELIABILITY_PHASE1_BLOCK_FIX_REQUEST.md`

---

## 7) On Remediation

After Team 20 addresses B1 and B2:

1. Team 50 will re-run `pytest tests/unit/test_price_reliability_phase1.py -v`.
2. Team 50 will re-perform code review and, if needed, API/DB verification.
3. Team 50 will issue a revised report with status PASS if all 5 scenarios pass.

---

**log_entry | TEAM_50 | PRICE_RELIABILITY_PHASE1_QA_REPORT | TO_TEAM_10 | 2026-03-09 | BLOCK**
