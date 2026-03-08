# Team 20 → Team 10 | Price Reliability — PHASE_1 Completion

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_10_PRICE_RELIABILITY_PHASE1_COMPLETION  
**from:** Team 20 (Backend)  
**to:** Team 10 (Gateway Orchestration)  
**date:** 2026-03-08  
**status:** COMPLETE  
**phase:** PHASE_1  
**authority:** TEAM_10_TO_TEAM_20_PRICE_RELIABILITY_PHASE1_MANDATE  

---

## 1) Goal Addressed

Always preserve latest EOD value even when stale; intraday can override, never erase. **No null regression** when EOD is stale.

---

## 2) Implementation Summary

| # | פעולה | סטטוס |
|---|--------|--------|
| 1 | preserve EOD | ✅ EOD always added to output; never dropped |
| 2 | Mark stale | ✅ Stale EOD tickers marked for intraday override attempt (active only) |
| 3 | Intraday override | ✅ If intraday exists for stale active ticker → INTRADAY_FALLBACK |
| 4 | No null | ✅ If intraday missing → keep EOD output (EOD_STALE) |
| 5 | EOD_STALE value | ✅ Explicit price_source="EOD_STALE" when applicable |

---

## 3) Files Modified

| קובץ | שינויים |
|------|---------|
| `api/services/tickers_service.py` | `_get_price_with_fallback` — rewrite per PHASE_1 |
| `api/schemas/tickers.py` | `price_source` description — add EOD_STALE |
| `tests/unit/test_price_reliability_phase1.py` | New — 5 scenario unit tests |

---

## 4) Logic Change (api/services/tickers_service.py)

**Before:** Stale EOD tickers were not added to `out`; only fresh EOD or intraday. → **null regression** when stale + no intraday.

**After:**
1. **Always add EOD** to `out` for every ticker with EOD (preserve — no null).
2. If EOD fresh → `price_source="EOD"`.
3. If EOD stale → `price_source="EOD_STALE"`; add to `stale_for_intraday`.
4. For `stale_for_intraday` + `missing_eod` (active only): fetch intraday.
5. If intraday exists → **override** with `price_source="INTRADAY_FALLBACK"`.
6. If intraday missing → keep EOD_STALE (no null).

---

## 5) Test Matrix (5 scenarios)

| # | Scenario | Expected | Test |
|---|----------|----------|------|
| 1 | stale EOD + no intraday (active) | EOD_STALE, not null | ✅ test_stale_eod_no_intraday_active_returns_eod_stale_not_null |
| 2 | stale EOD + no intraday (inactive) | EOD_STALE, not null | ✅ test_stale_eod_no_intraday_inactive_returns_eod_stale_not_null |
| 3 | stale EOD + intraday (active) | INTRADAY_FALLBACK | ✅ test_stale_eod_intraday_active_returns_intraday_fallback |
| 4 | fresh EOD + intraday | remains EOD | ✅ test_fresh_eod_intraday_remains_eod |
| 5 | missing EOD + intraday (active) | INTRADAY_FALLBACK | ✅ test_missing_eod_intraday_active_returns_intraday_fallback |

**Run:** `python3 -m pytest tests/unit/test_price_reliability_phase1.py -v`

---

## 6) Evidence Paths

| Evidence | Path |
|----------|------|
| Unit tests | `tests/unit/test_price_reliability_phase1.py` |
| Service logic | `api/services/tickers_service.py` — `_get_price_with_fallback` (lines ~35–138) |
| Schema | `api/schemas/tickers.py` — `price_source` (EOD \| EOD_STALE \| INTRADAY_FALLBACK) |

---

## 7) Acceptance Criteria

| # | קריטריון | סטטוס |
|---|-----------|--------|
| 1 | No ticker with existing EOD returns null only due to staleness | ✅ |
| 2 | EOD_STALE exposed deterministically when applicable | ✅ |
| 3 | Unit/integration evidence paths documented | ✅ Above |

---

## 8) Next Steps

1. **Team 50:** Run test matrix; issue `TEAM_50_TO_TEAM_10_PRICE_RELIABILITY_PHASE1_QA_REPORT.md`.
2. **Team 10:** PHASE_1_PASS only after Team 50 PASS; then open PHASE_2.

---

**log_entry | TEAM_20 | PRICE_RELIABILITY_PHASE1 | COMPLETION | 2026-03-08**
