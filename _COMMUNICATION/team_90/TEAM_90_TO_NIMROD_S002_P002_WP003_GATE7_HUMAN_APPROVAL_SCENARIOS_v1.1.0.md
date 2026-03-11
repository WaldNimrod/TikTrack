# TEAM_90 -> NIMROD | S002-P002-WP003 GATE_7 Human Approval Scenarios v1.1.0

**project_domain:** TIKTRACK  
**id:** TEAM_90_TO_NIMROD_S002_P002_WP003_GATE7_HUMAN_APPROVAL_SCENARIOS_v1.1.0  
**from:** Team 90 (GATE_7 Owner)  
**to:** Nimrod (Human Approver)  
**cc:** Team 10, Team 00, Team 190, Team 100, Team 60, Team 50  
**date:** 2026-03-11  
**status:** READY_FOR_HUMAN_EXECUTION  
**gate_id:** GATE_7  
**program_id:** S002-P002  
**work_package_id:** S002-P002-WP003  
**supersedes:** TEAM_90_TO_NIMROD_S002_P002_WP003_GATE7_HUMAN_APPROVAL_SCENARIOS_v1.0.0

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

## Gate-7 lock for this cycle

1. GATE_7 closes only on your human decision (`אישור` / `פסילה`).  
2. Browser/UI verification only.  
3. No terminal/log commands are requested from you.

---

## Preconditions

1. Application is available in browser.
2. Admin user can access:
   - Tickers management page
   - My Tickers page
   - Runtime verification surface (admin card/page/panel published for WP003 evidence)
3. Symbols available in system: `ANAU.MI`, `BTC-USD`, `TEVA.TA`, `QQQ`, `SPY`.

If any precondition fails: `פסילה` with numbered finding.

---

## Human scenarios (browser-only)

### S7-WP003-01 (P0) — Price transparency columns

Actions:
1. Open Tickers management table.
2. Verify visible fields for sample symbols (`QQQ`, `SPY`, `TEVA.TA`):
   - current price
   - last close price
   - price source
   - as-of timestamp
   - currency

Expected:
- All fields are visible with values (not hidden, not `-` where value exists).

PASS rule: 3/3 sampled symbols show full transparency set.

---

### S7-WP003-02 (P0) — Current vs last close semantics

Actions:
1. Open details modal/page for `TEVA.TA`.
2. Verify current price and last close are shown as separate values.
3. Verify labels are clear and not ambiguous.

Expected:
- Two distinct values with clear labels.

PASS rule: user can distinguish "current" vs "last close" without guesswork.

---

### S7-WP003-03 (P0) — Market cap readiness for architect target symbols

Actions:
1. Open details for `ANAU.MI`, `BTC-USD`, `TEVA.TA`.
2. Verify `market_cap` field exists and is not empty.

Expected:
- `market_cap` shown for all 3 symbols.

PASS rule: 3/3 symbols show non-empty market cap.

---

### S7-WP003-04 (P0) — Runtime confirmation panel visibility (CC-WP003-01..04)

Actions:
1. Open WP003 runtime confirmation panel in browser.
2. Verify it shows all four conditions:
   - CC-WP003-01
   - CC-WP003-02
   - CC-WP003-03
   - CC-WP003-04
3. Verify each condition has:
   - status (`PASS`/`BLOCK`)
   - measured value/result
   - as-of timestamp

Expected:
- Panel is readable and complete for all 4 CC items.

PASS rule: 4/4 CC conditions are visible with status + value + timestamp.

---

### S7-WP003-05 (P0) — Off-hours / staleness transparency

Actions:
1. In Tickers page, inspect freshness/staleness indicator and last update clock.
2. Verify indicator state and time are coherent and understandable.

Expected:
- User can infer whether value is fresh/off-hours fallback from UI state alone.

PASS rule: state explanation is visible and consistent for sampled rows.

---

### S7-WP003-06 (P1) — Cross-view consistency (Tickers vs My Tickers)

Actions:
1. Compare one symbol in Tickers and My Tickers.
2. Check source/as-of/current-vs-last-close semantics match.

Expected:
- No contradiction between pages.

PASS rule: semantic consistency preserved.

---

## Decision rule

- `PASS`: all P0 scenarios pass.  
- `BLOCK`: any P0 failure.  
- P1 can be non-blocking note only if all P0 pass.

---

## Feedback format (from Nimrod)

Reply in Hebrew free text:
- `אישור`
or
- `פסילה` + numbered findings.

For each finding include:
1. scenario id
2. actual result
3. expected result
4. severity (`P0`/`P1`)

Team 90 will normalize your response into canonical Gate-7 decision artifacts.

---

**log_entry | TEAM_90 | TO_NIMROD | S002_P002_WP003_GATE7_HUMAN_APPROVAL_SCENARIOS_v1.1.0 | READY_FOR_HUMAN_EXECUTION | 2026-03-11**
