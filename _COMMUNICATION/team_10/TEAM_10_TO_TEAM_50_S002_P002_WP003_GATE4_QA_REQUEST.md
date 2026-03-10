# Team 10 → Team 50 | S002-P002-WP003 GATE_4 — QA Request

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_50_S002_P002_WP003_GATE4_QA_REQUEST  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 50 (QA & Fidelity)  
**date:** 2026-03-10  
**status:** ACTION_REQUIRED  
**gate_id:** GATE_4  
**work_package_id:** S002-P002-WP003  
**trigger:** TEAM_20_TO_TEAM_10_S002_P002_WP003_IMPLEMENTATION_COMPLETION  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP003 |
| gate_id | GATE_4 |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1) Context

Team 20 השלים את 4 ה-Fixes (FIX-1..FIX-4) per LOD400. נדרשת הרצת מטריצת Evidence EV-WP003-01..10.

---

## 2) Evidence Matrix (LOD400 §8)

| ID | Description | Pass Criterion |
|----|-------------|----------------|
| EV-WP003-01 | Priority filter — API call count | 10 tickers, 3 ACTIVE, market open: ≤ 5 HTTP calls to Yahoo (not 10) |
| EV-WP003-02 | Priority filter — off-hours | Same portfolio, market closed: ≤ 2 HTTP calls (only FIRST_FETCH) |
| EV-WP003-03 | Batch fetch | 9 active tickers → 1 batch call; log "Processing batch 1/1" |
| EV-WP003-04 | Alpha quota — no retry | Simulate AlphaQuotaExhaustedException → cooldown set; is_in_cooldown True; no Alpha calls in 3 cycles |
| EV-WP003-05 | Alpha quota — DB persistence | Restart → is_in_cooldown("ALPHA_VANTAGE") still True |
| EV-WP003-06 | Eligibility gate — reject invalid | `PUT /api/v1/tickers/{id}` is_active=true on invalid symbol → 422 |
| EV-WP003-07 | Eligibility gate — allow valid | `PUT /api/v1/tickers/{id}` is_active=true on valid (TSLA) → 200 |
| EV-WP003-08 | market_cap completeness | EOD sync → ANAU.MI, BTC-USD, TEVA.TA market_cap NOT NULL |
| EV-WP003-09 | NUMERIC precision | ticker_prices_intraday — 8 decimal places (Decimal) |
| EV-WP003-10 | Zero 429s in 1-hour run | 4 cycles sync_intraday — zero Yahoo 429 in logs |

---

## 3) Non-Regression (LOD400 §8.2)

- D22 ticker list loads
- D33 user_tickers live price (non-null within 20 min)
- LAST_KNOWN fallback when Yahoo+Alpha unavailable
- `scripts/run-tickers-d22-qa-api.sh` — all pass

## 3.1) E2E Test Hygiene Rule (LOD400 §6.3)

E2E scripts that create test tickers: use `skip_live_check=True`, `SKIP_LIVE_DATA_CHECK=true`, or `is_active=false`. Never activate fake symbols (e.g. `INVALID999E2E`) unless valid provider symbol. Team 50 to enforce in test runner config.

---

## 4) Output Required

**נתיב:** `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S002_P002_WP003_GATE4_QA_REPORT.md`

- status: PASS | BLOCK
- טבלת תוצאות לכל EV-WP003-01..10
- Evidence paths / snippets
- Blockers (אם BLOCK)

---

## 5) On PASS

Team 10 יפעיל את Team 90 ל-GATE_5 validation. נדרש גם Team 60 runtime corroboration (EF-WP003-60-01..04) לפני routing ל-GATE_5.

---

**log_entry | TEAM_10 | WP003_GATE4_QA_REQUEST | TO_TEAM_50 | 2026-03-10**
