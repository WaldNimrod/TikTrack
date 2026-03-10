# TEAM_90 -> NIMROD | S002-P002-WP003 GATE_7 Human Approval Scenarios v1.0.0

**project_domain:** TIKTRACK  
**id:** TEAM_90_TO_NIMROD_S002_P002_WP003_GATE7_HUMAN_APPROVAL_SCENARIOS_v1.0.0  
**from:** Team 90 (GATE_7 Owner)  
**to:** Nimrod (Human Approver)  
**cc:** Team 10, Team 00, Team 190, Team 100  
**date:** 2026-03-10  
**status:** READY_FOR_HUMAN_EXECUTION  
**gate_id:** GATE_7  
**program_id:** S002-P002  
**work_package_id:** S002-P002-WP003  
**in_response_to:** ARCHITECT_GATE6_DECISION_S002_P002_WP003_v1.0.0 (CONDITIONAL_APPROVED)

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP003 |
| task_id | N/A |
| gate_id | GATE_7 |
| phase_owner | Team 90 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
| project_domain | TIKTRACK |

---

## 1) Gate-7 scope

GATE_7 for WP003 is human execution by Nimrod.

Goal: confirm the CONDITIONAL_APPROVED carry-over conditions are observable and acceptable:

1. CC-WP003-01: market-open cadence is provider-efficient.
2. CC-WP003-02: off-hours cadence is provider-efficient.
3. CC-WP003-03: `market_cap` is populated for `ANAU.MI`, `BTC-USD`, `TEVA.TA` post-EOD.
4. CC-WP003-04: no Yahoo `429` bursts in the monitored runtime window.

UI-first rule:
- browser/UI checks are primary;
- terminal checks are allowed only for runtime telemetry that is not exposed in UI yet.

---

## 2) Preconditions

1. Frontend reachable (`http://localhost:8080`).
2. Backend reachable (`http://localhost:8082/health` returns OK from UI flow assumptions).
3. Admin/test user can access ticker management screens.
4. Tickers exist: `ANAU.MI`, `BTC-USD`, `TEVA.TA`.
5. Runtime window evidence exists for the same deployment window under test (for telemetry scenarios).

If one precondition fails -> stop and report `פסילה` with סעיף.

---

## 3) Human execution scenarios

### S7-WP003-01 (P0) — Ticker screen transparency baseline

Steps:
1. Open Tickers management page.
2. Verify row-level visibility of:
   - current price,
   - `price_source`,
   - `price_as_of_utc`,
   - `last_close_price`.

Expected:
- all fields visible and readable from table or details modal;
- source and as-of are not hidden.

PASS: all fields exist for sampled tickers.

---

### S7-WP003-02 (P0) — Cross-view consistency (Tickers vs My Tickers)

Steps:
1. Open `AAPL` or `TEVA.TA` in Tickers table.
2. Open same symbol in My Tickers page.
3. Compare source/as-of/last-close semantics.

Expected:
- no semantic mismatch between views;
- user can understand current vs last-close in both places.

PASS: no conflicting display semantics.

---

### S7-WP003-03 (P0) — Market cap presence for architect target symbols

Steps:
1. In Tickers page open "בקרת תקינות נתונים" panel for:
   - `ANAU.MI`,
   - `BTC-USD`,
   - `TEVA.TA`.
2. Read "שווי שוק (Market Cap)" value for each symbol.

Expected:
- all three symbols show `market_cap` value (not empty/`—`) for post-EOD validated window.

PASS: 3/3 symbols with non-null market cap.

---

### S7-WP003-04 (P1) — Off-hours transparency in UI

Steps:
1. Open staleness/status indicators on Tickers or related data views.
2. Verify state is understandable to user (market-open vs off-hours semantics via labels/tooltips/status chips).

Expected:
- UI communicates why value shown now (fresh/fallback/off-hours context).

PASS: state is explainable from UI without code reading.

---

### S7-WP003-05 (P0, human terminal-assisted) — Provider call-count check

Use only if call-count telemetry is not exposed in UI.

Steps:
1. Collect runtime evidence for one market-open cycle and one off-hours cycle from current deployment window.
2. Count Yahoo quote requests per cycle.

Suggested command shape:

```bash
BACKEND_LOG=/tmp/tt_backend.log
grep -n "query1.finance.yahoo.com" "$BACKEND_LOG"
```

Then count calls inside the exact cycle windows you sampled.

Expected:
- market-open cycle: <=5 calls;
- off-hours cycle: <=2 calls.

PASS: both thresholds satisfied.

---

### S7-WP003-06 (P0, human terminal-assisted) — 429 suppression window

Use only if 429 telemetry is not exposed in UI.

Steps:
1. Check 1-hour window (4 cycles) evidence from current deployment window.
2. Search for Yahoo `429` errors.

Suggested command shape:

```bash
BACKEND_LOG=/tmp/tt_backend.log
grep -n "429" "$BACKEND_LOG"
```

Filter to the exact 1-hour window under test.

Expected:
- zero `429` in the monitored window.

PASS: zero `429` events.

---

## 4) Decision rule

- `PASS`: all P0 scenarios PASS.
- `BLOCK`: any P0 failure.
- P1 items may be attached as non-blocking notes only if all P0 pass.

---

## 5) Human feedback handoff (no external template)

Nimrod sends free-text Hebrew feedback:
- `אישור`
or
- `פסילה + סעיפים`.

For each failed סעיף include:
1. scenario id,
2. actual result,
3. expected result,
4. severity (`P0`/`P1`).

Team 90 is responsible to normalize this feedback into canonical Gate-7 decision artifacts.

---

**log_entry | TEAM_90 | TO_NIMROD | S002_P002_WP003_GATE7_HUMAN_APPROVAL_SCENARIOS_v1.0.0 | READY_FOR_HUMAN_EXECUTION | 2026-03-10**
