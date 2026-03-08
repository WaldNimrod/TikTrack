---
project_domain: TIKTRACK
id: TEAM_190_TO_TEAM_10_TEAMS_20_30_50_60_90_MANDATORY_3_PHASE_PRICE_RELIABILITY_EXECUTION_MANDATE
from: Team 190 (Constitutional Validation)
to: Team 10 (Gateway Orchestration)
cc: Team 20, Team 30, Team 50, Team 60, Team 90, Team 00, Team 100, Team 170
date: 2026-03-08
status: ACTION_REQUIRED_URGENT
gate_id: GOVERNANCE_PROGRAM
program_id: S002-P002
scope: PRICE_DATA_RELIABILITY_AND_TRANSPARENCY
priority: CRITICAL
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Purpose

Issue a binding, urgent execution mandate to implement **all three phases in strict sequence** for ticker price reliability:
1. no price loss when EOD is stale
2. explicit source transparency for users
3. off-hours update handling with clear operational checks

## 2) Binding Policy

1. Execution is sequential and mandatory: `PHASE_1 -> PHASE_2 -> PHASE_3`.
2. No phase skip. No parallel bypass. No scope reduction.
3. Each phase closes only with explicit `PASS` evidence package.
4. If a phase fails, flow remains blocked at that phase until remediation closes.

## 3) Phase Plan (Mandatory)

### PHASE 1 — Backend Regression Fix (Owner: Team 20)

**Goal:** Always preserve latest EOD value even when stale; intraday can override, never erase.

**Required implementation:**
1. In `api/services/tickers_service.py` preserve EOD output for every ticker with EOD.
2. Mark stale EOD tickers for intraday override attempt (active tickers only).
3. If intraday exists for stale active ticker, replace EOD output with intraday output.
4. If intraday missing, keep EOD output (no null regression).
5. Add explicit stale source value: `EOD_STALE`.

**Required tests (Team 20 + Team 50 witness):**
1. stale EOD + no intraday (active) -> returns EOD_STALE, not null.
2. stale EOD + no intraday (inactive) -> returns EOD_STALE, not null.
3. stale EOD + intraday (active) -> returns INTRADAY_FALLBACK.
4. fresh EOD + intraday -> remains EOD.
5. missing EOD + intraday (active) -> returns INTRADAY_FALLBACK.

### PHASE 2 — Data Contract + UI Clarity (Owners: Team 20 + Team 30)

**Goal:** User must clearly know whether displayed price is live/update-based or EOD close.

**Required implementation:**
1. API contract exposes distinct close fields:
- `last_close_price`
- `last_close_as_of_utc`
2. Keep `current_price` as best-available display price.
3. Keep and expose `price_source` and `price_as_of_utc` with deterministic values:
- `INTRADAY_FALLBACK`
- `EOD`
- `EOD_STALE`
4. UI tables (tickers + user_tickers) display:
- current price
- source label
- as-of timestamp
- last close value (separate from current)

**Required tests (Team 30 + Team 50):**
1. UI renders source label correctly for all three source values.
2. UI renders as-of timestamp for current source.
3. last close is visible and unchanged when current source is intraday.
4. no misleading state where user sees stale value without stale indication.

### PHASE 3 — Off-Hours Operational Mode (Owners: Team 60 + Team 50 + Team 90)

**Goal:** Support price visibility outside normal market hours with lower update cadence and clear provenance.

**Required implementation:**
1. Define and activate two runtime cadence profiles:
- market-open cadence
- off-hours cadence (lower frequency)
2. Ensure jobs keep producing deterministic evidence for `price_source` and `price_as_of_utc`.
3. Document fallback behavior when off-hours feed is unavailable (must retain close value).

**Required tests (Team 60 runtime + Team 50 QA + Team 90 validation):**
1. runtime smoke: scheduler/job execution in both cadence profiles.
2. evidence check: output includes source + as-of deterministically.
3. user-facing check: off-hours still shows usable price context (current source + last close).
4. validation package: Team 90 confirms no ambiguity in gate evidence.

## 4) Team Responsibilities

### Team 10 (Gateway)
1. Orchestrate sequence lock.
2. Open/close each phase only after evidence PASS.
3. Publish unified status notes per phase.

### Team 20 (Backend)
1. Deliver PHASE 1 fix + API fields for PHASE 2.
2. Provide unit/integration evidence paths.

### Team 30 (Frontend)
1. Deliver PHASE 2 UI transparency implementation.
2. Provide visual and behavioral validation evidence.

### Team 50 (QA/FAV)
1. Execute targeted test matrix per phase.
2. Issue PASS/BLOCK QA reports with explicit checklist mapping.

### Team 60 (Runtime/Platform)
1. Implement and evidence PHASE 3 cadence/runtime behavior.
2. Provide runtime logs/artifacts for off-hours mode.

### Team 90 (Validation Owner G5..G8)
1. Validate end-to-end closure evidence.
2. Confirm evidence admissibility and user transparency criteria.

## 5) Acceptance Criteria (Program-Level)

All must be true:
1. No ticker with existing EOD returns null only due to staleness.
2. User can always identify price source and timestamp.
3. User can always view last close value separately from current price.
4. Off-hours behavior is active, tested, and evidenced.
5. Team 50 and Team 90 issue PASS on full 3-phase closure.

## 6) Required Artifacts

1. Team 10 orchestration note for phase sequence lock.
2. Team 20 completion report (PHASE 1+backend PHASE 2 fields).
3. Team 30 completion report (PHASE 2 UI).
4. Team 60 completion report (PHASE 3 runtime mode).
5. Team 50 QA consolidated report.
6. Team 90 final validation response.

## 7) Response Required

Team 10 returns:
`TEAM_10_TO_TEAM_190_PRICE_RELIABILITY_3_PHASE_EXECUTION_ACK_v1.0.0.md`

Required fields:
1. `sequence_lock`: CONFIRMED
2. planned timeline for phase completion
3. owners per phase confirmed
4. blocker list (if any)

---

**log_entry | TEAM_190 | PRICE_RELIABILITY_3_PHASE_EXECUTION_MANDATE | ISSUED_URGENT | 2026-03-08**
