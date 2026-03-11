# TEAM_90 -> NIMROD | S002-P002-WP003 GATE_7 Part B Human Browser Scenarios v2.0.0

**project_domain:** TIKTRACK  
**id:** TEAM_90_TO_NIMROD_S002_P002_WP003_GATE7_PARTB_HUMAN_BROWSER_SCENARIOS_v2.0.0  
**from:** Team 90 (GATE_7 Owner)  
**to:** Nimrod (Human Approver)  
**cc:** Team 10, Team 00, Team 190, Team 100, Team 30  
**date:** 2026-03-11  
**status:** READY_FOR_HUMAN_EXECUTION  
**gate_id:** GATE_7  
**program_id:** S002-P002  
**work_package_id:** S002-P002-WP003  
**in_response_to:** ARCHITECT_GATE6_DECISION_S002_P002_WP003_v2.0.0

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

## Scope lock

Part B verifies **CC-WP003-05** only (browser review of B1 features in D22 surface).

No terminal commands and no log checks are required from you.

---

## Preconditions

1. Browser access to D22 admin market-data page.
2. User with permissions to open jobs/settings/tickers management elements.
3. Data table has at least one row.

If any precondition fails -> `פסילה` with numbered finding.

---

## Scenarios (browser only)

### S7B-WP003-01 (P0) — Actions hover menu behavior

Actions:
1. Open D22 table with rows.
2. Hover row area and actions trigger.
3. Verify menu appears after short delay and remains while hovering row/menu.
4. Press `Escape`.

Expected:
- menu appears deterministically;
- `Escape` closes menu.

PASS rule: all 4 checks pass.

---

### S7B-WP003-02 (P0) — Inline history expansion

Actions:
1. In jobs table click `▼ היסטוריה (N)` on one job.
2. Verify inline history row expands.
3. Verify history row contains date/status/duration/records/errors columns.

Expected:
- inline history opens and displays structured fields.

PASS rule: expansion works and required fields are visible.

---

### S7B-WP003-03 (P0) — Settings form validation + hints

Actions:
1. Open market-data settings panel.
2. Verify both fields exist:
   - `off_hours_interval_minutes`
   - `alpha_quota_cooldown_hours`
3. Enter invalid value and save.
4. Verify field-level error indication.
5. Verify hint text exists for relevant fields.

Expected:
- validation blocks invalid save with clear field error;
- hints visible and helpful.

PASS rule: invalid value rejected with explicit field error + hints present.

---

### S7B-WP003-04 (P0) — Heat indicator card + status legend

Actions:
1. Open D22 summary area.
2. Verify heat card exists and has visible state (low/medium/high).
3. Verify status legend is shown below table.

Expected:
- heat card and legend are both visible and readable.

PASS rule: both surfaces displayed correctly.

---

### S7B-WP003-05 (P1) — Modal skeleton + refresh feedback

Actions:
1. Open ticker details modal.
2. Verify skeleton/loading state appears before full content.
3. Click refresh in details modal.
4. Verify UI feedback (success/error) appears.

Expected:
- loading skeleton visible;
- refresh gives explicit feedback.

PASS rule: both states visible.

---

## Decision rule

- `PASS`: all P0 scenarios pass.  
- `BLOCK`: any P0 failure.  
- P1 may be noted as non-blocking only if all P0 pass.

---

## Feedback format (Hebrew free text)

Send:
- `אישור`
or
- `פסילה` + numbered findings.

For each finding:
1. scenario id
2. actual result
3. expected result
4. severity (`P0`/`P1`)

Team 90 will normalize your response into canonical GATE_7 decision artifacts.

---

**log_entry | TEAM_90 | TO_NIMROD | S002_P002_WP003_GATE7_PARTB_HUMAN_BROWSER_SCENARIOS_v2.0.0 | READY_FOR_HUMAN_EXECUTION | 2026-03-11**
