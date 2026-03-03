---
project_domain: TIKTRACK
id: TEAM_190_TO_TEAM_10_S002_P003_WP002_BLOCKING_BUG_REMEDIATION_PROMPT
from: Team 190 (Constitutional Validation)
to: Team 10 (Execution Orchestrator)
cc: Team 20, Team 30, Team 50, Team 90, Team 100, Team 00
date: 2026-03-03
status: ACTION_REQUIRED
gate_id: GATE_3
program_id: S002-P003
work_package_id: S002-P003-WP002
scope: BLOCKING_BUG_REMEDIATION
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | TIKTRACK_ROADMAP_LOCKED |
| stage_id | S002 |
| program_id | S002-P003 |
| work_package_id | S002-P003-WP002 |
| task_id | N/A |
| gate_id | GATE_3 |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Decision

Team 190 classifies the two detected bugs below as **blocking remediation items** for the active `S002-P003-WP002` rollback cycle.

Execution may continue only after Team 10 routes both fixes, the owning squads complete them, and the updated package is re-submitted to the normal validation path.

## 2) Ownership Routing

| Bug ID | Primary Owner | Why |
|---|---|---|
| B-01 | Team 20 | Backend/runtime code under `api/background/jobs/*` is Team 20 scope per role mapping. |
| B-02 | Team 30 | Minimal safe fix is frontend behavior correction under `ui/*`; no API contract expansion is required. |
| Orchestration | Team 10 | Team 10 must issue execution mandates and collect closure evidence. |

**Role source:** `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`

## 3) Blocking Findings

### B-01 — Duplicate intraday inserts in background job fallback logic

**Severity:** BLOCKING

**File:** `api/background/jobs/sync_intraday.py`

**Evidence:**
- `api/background/jobs/sync_intraday.py:114`
- `api/background/jobs/sync_intraday.py:137`
- Reference behavior: `scripts/sync_ticker_prices_intraday.py:110`
- Reference behavior: `scripts/sync_ticker_prices_intraday.py:135`

**Finding:**
The async conversion moved fallback handling from a `for ... else` model to a `try ... except ... else` branch inside the provider loop. As written, the `LAST_KNOWN` fallback can be appended before the loop is exhausted, and a later provider can still append a successful live-price row for the same ticker.

**Resulting risk:**
1. Multiple rows for one ticker in a single run.
2. Duplicate `LAST_KNOWN` insertion when providers return non-usable values without raising.
3. Corrupted runtime evidence for background-task correctness.

**Required fix (minimum safe scope):**
1. Team 20 must move fallback execution outside the provider iteration.
2. Team 20 must ensure fallback runs exactly once, only after all providers fail to return a usable price.
3. Team 20 may implement either:
   - a real `for ... else`, or
   - a `got_price` flag with post-loop fallback

**Mandatory acceptance criteria:**
1. If provider A returns no usable price and provider B succeeds, exactly **one** row is appended.
2. If both providers return no usable price without exception, exactly **one** `LAST_KNOWN` row is appended.
3. If provider A succeeds, fallback is not called.

### B-02 — Alerts edit form exposes fields that cannot persist

**Severity:** BLOCKING

**Files:**
- `ui/src/views/data/alerts/alertsForm.js`
- `api/schemas/alerts.py`

**Evidence:**
- `ui/src/views/data/alerts/alertsForm.js:77`
- `ui/src/views/data/alerts/alertsForm.js:153`
- `api/schemas/alerts.py:38`

**Finding:**
In edit mode, the UI still renders editable `target_type` and `alert_type` fields, but the PATCH payload excludes them and `AlertUpdate` does not accept them. Users can appear to change immutable fields, but those changes never persist.

**Resulting risk:**
1. False user feedback.
2. Silent mismatch between UI behavior and API contract.
3. Support/debug noise during D34 validation.

**Required fix (minimum safe scope):**
1. Team 30 must make `target_type` and `alert_type` non-editable when `isEdit=true`.
2. The approved minimal implementation is:
   - disable the selects, or
   - render read-only text instead of editable controls
3. Team 30 must not widen the API update contract in this remediation cycle unless separately directed.

**Mandatory acceptance criteria:**
1. In create mode, both fields remain selectable.
2. In edit mode, users cannot modify either field.
3. Edit mode still allows updating the supported mutable fields (`title`, `message`, `is_active`, condition fields).

## 4) Required Team 10 Actions

1. Issue one execution mandate to Team 20 for `B-01`.
2. Issue one execution mandate to Team 30 for `B-02`.
3. Mark both items as **must-close before forward gate progression** in the active WP execution checklist.
4. Collect closure evidence from both teams.
5. Route the updated package back into the existing validation chain after implementation.

## 5) Required Evidence Package

Team 10 must collect and submit:

1. Team 20 completion note with code references for the `sync_intraday.py` fix.
2. Team 30 completion note with UI evidence for edit-mode immutability.
3. A short Team 10 closure note stating both blocking items are closed and integrated into the active WP package.

## 6) Final Recommendation

**May Team 10 continue normal execution routing without these fixes?**  
**NO**

Both issues are now classified as blocking remediation items inside the current `S002-P003-WP002` cycle.

---

**log_entry | TEAM_190 | S002_P003_WP002_BLOCKING_BUG_REMEDIATION_PROMPT | B_01_TEAM20 + B_02_TEAM30 | 2026-03-03**
