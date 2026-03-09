# TEAM_90 -> NIMROD | S002-P002 GATE_7 Human Approval Scenarios v1.0.0

**project_domain:** TIKTRACK
**id:** TEAM_90_TO_NIMROD_S002_P002_GATE7_HUMAN_APPROVAL_SCENARIOS_v1.0.0
**from:** Team 90 (GATE_7 Owner)
**to:** Nimrod (Human Approver)
**cc:** Team 10, Team 190
**date:** 2026-03-10
**status:** READY_FOR_EXECUTION
**gate_id:** GATE_7
**program_id:** S002-P002
**work_package_id:** N/A (program-level)

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | N/A (program-level) |
| task_id | N/A |
| gate_id | GATE_7 |
| phase_owner | Team 90 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
| project_domain | TIKTRACK |

---

## 1) Scope for Human Gate-7

Human validation is browser-only and targets Price Reliability closure outcomes:
1. No null-only-by-staleness for tickers with available EOD.
2. Price source and timestamp visible to user.
3. Last close visible separately from current price.
4. Off-hours behavior exposed and understandable in UI.
5. No regression in core access flow (login/landing/basic visibility).

No terminal/log/file checks are required from Nimrod in this gate.

---

## 2) Preconditions

1. Frontend is reachable in browser (expected local URL: `http://localhost:8080`).
2. Backend is reachable from UI.
3. Test user exists and can log in.
4. At least 2 symbols exist in the system ticker list (recommended: `AAPL`, `MSFT`).

If one precondition fails: stop and report as a blocking item.

---

## 3) Scenarios (browser execution)

### S7-PR-01 — Login and landing integrity (P0)
Steps:
1. Open login page.
2. Login with valid user.
3. Verify redirect to main/home dashboard.
Expected:
- Login succeeds without UI error.
- Landing is complete (no broken shell / empty state crash).
PASS rule: all expected outcomes true.

### S7-PR-02 — Price transparency fields are visible (P0)
Steps:
1. Open ticker management/list page.
2. Locate columns/fields for current price, price source, and source timestamp (`as of`).
Expected:
- All 3 fields are visible at row level.
- Labels are understandable for end user.
PASS rule: all required fields visible in UI.

### S7-PR-03 — Last close is separate from current price (P0)
Steps:
1. On same ticker row, identify current price field and last-close field.
2. Compare values and labels.
Expected:
- Last-close exists as a dedicated field (not merged into current).
- User can distinguish both values without ambiguity.
PASS rule: separation is explicit and readable.

### S7-PR-04 — Staleness does not force null-only display (P0)
Steps:
1. Trigger a ticker refresh action from UI (if available).
2. Re-open/refresh the table view.
Expected:
- For symbols with market history, price area is not null-only due to staleness.
- Source indication explains data origin/state.
PASS rule: no null-only regression for tested symbols.

### S7-PR-05 — Off-hours behavior is user-transparent (P1)
Steps:
1. Inspect source/state indicators for at least one symbol.
2. Confirm UI communicates off-hours/fallback state when relevant.
Expected:
- User can understand why value is shown (live vs fallback/close).
- Timestamp/source context remains visible.
PASS rule: state is explainable from UI, without reading logs.

### S7-PR-06 — Cross-view consistency (P1)
Steps:
1. View ticker value in central ticker list.
2. Open corresponding context where same symbol is shown (e.g., my tickers or details modal).
Expected:
- Source/timestamp/last-close semantics are consistent between views.
PASS rule: no conflicting representation across tested views.

---

## 4) Gate-7 Decision Rule

- `PASS`: all P0 scenarios PASS; P1 may contain at most 1 minor note that does not break reliability semantics.
- `BLOCK`: any P0 failure, or multiple P1 failures affecting user understanding.

---

## 5) Feedback Submission Format (Hebrew)

Nimrod returns one of:
- `אישור`
- `פסילה + סעיפים`

For `פסילה`, each סעיף must include:
1. מזהה תרחיש (למשל S7-PR-04)
2. מה בוצע
3. תוצאה בפועל
4. תוצאה צפויה
5. חומרה (P0/P1)

Template file:
`_COMMUNICATION/team_90/TEAM_90_TO_NIMROD_S002_P002_GATE7_HUMAN_FEEDBACK_TEMPLATE_v1.0.0.md`

Coverage matrix:
`_COMMUNICATION/team_90/TEAM_90_TO_NIMROD_S002_P002_GATE7_HUMAN_APPROVAL_COVERAGE_MATRIX_v1.0.0.md`

---

**log_entry | TEAM_90 | TO_NIMROD | S002_P002_GATE7_HUMAN_APPROVAL_SCENARIOS_v1.0.0 | READY_FOR_EXECUTION | 2026-03-10**
