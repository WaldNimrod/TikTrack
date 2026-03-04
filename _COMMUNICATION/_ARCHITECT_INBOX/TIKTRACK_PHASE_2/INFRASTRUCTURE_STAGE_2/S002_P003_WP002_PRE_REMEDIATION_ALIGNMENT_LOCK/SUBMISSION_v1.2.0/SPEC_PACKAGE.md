# SPEC_PACKAGE — S002-P003-WP002 Unified Pre-Remediation Alignment Frame (v1.2.0)
**project_domain:** TIKTRACK
**date:** 2026-03-03

**architectural_approval_type:** SPEC

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | TIKTRACK_ROADMAP_LOCKED |
| stage_id | S002 |
| program_id | S002-P003 |
| work_package_id | S002-P003-WP002 |
| task_id | N/A |
| gate_id | POST_G7_REJECTION_PREP |
| phase_owner | Team 90 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
| project_domain | TIKTRACK |

## 1) Unified remediation scope

This is a **foundation alignment package** across current active entities before expansion continues.

Primary in-scope domains:
- D22 (`tickers`)
- D33 (`user_tickers`)
- D34 (`alerts`)
- D35 (`notes`)

Mandatory connected scope:
- shared add-button patterns
- shared modal patterns
- shared action-menu semantics
- shared detail-module behavior
- auth/session behavior after token expiry

Out of immediate blocking scope (deferred carryover only):
- global top-filter full integration across all tables
  - this remains a real gap, but is not requested for immediate blocking remediation in this cycle
  - it should be routed into the completion-gap scheduling track, not the current blocking execution slice

## 2) Decisions already locked (execution-ready)

The following are already locked and do not require re-decision:

1. One canonical backend path for system ticker creation.
2. D33 is included in the current correction cycle where coupled.
3. Notes/alerts must link to either a specific record or a specific datetime (date + time).
4. `general` is not a valid linked target.
5. Alerts require a rich condition model now.
6. Alert lifecycle uses the richer operational baseline set.
7. UI consistency alignment applies across current existing entities now.
8. Attachments require real persisted proof in re-test.
9. No deferred structural tails; baseline must be aligned before expansion.
10. Architect lock is required before Team 10 execution begins.
11. After access-token expiry (24h), the user is treated as logged out.
12. Only `usernameOrEmail` may be remembered locally.

## 3) Exact architect completion items still required

Only the following details still require architect-level completion / precision before execution:

### A. D34 condition-builder canonical contract

Need final locked definition for v1 implementation:
- required fields in the condition model
- operator set
- supported metric families in the immediate cycle (at minimum practical support aligned with the already-locked rich model)
- UI interaction pattern for building conditions

Constraint already locked:
- This must remain a rich model, not a placeholder.
- TradingView-style alert capability is the benchmark reference.

### B. Datetime linkage contract for D34/D35

The principle is locked, but the exact contract shape still requires precision:
- whether datetime-only linkage is allowed without entity linkage
- canonical field structure
- timezone handling
- storage/display precision expectations

### C. Alert lifecycle expansion beyond the locked baseline (optional only)

The baseline is already locked and sufficient to proceed.
Architect input is required only if the project wants to expand beyond the baseline in this cycle.

### D. Details-modal blueprint completion source

The product expectation is already locked: details views must match the blueprint standard.
If the canonical blueprint already exists in the repository, execution should use it.
If the exact blueprint source is missing or ambiguous, an authoritative reference example must be supplied before implementation.

### E. Refresh-token technical behavior after access-token expiry

The UX rule is locked: once the access token expires, the user is effectively logged out.
The remaining implementation detail requiring architect confirmation is:
- whether silent refresh remains allowed only before expiry checks, or
- whether refresh should be bypassed entirely in the human-facing flow once expiry is detected.

## 4) Execution streams (single upcoming implementation package)

After architect completion of the items above, Team 90 will issue **one unified execution package** to Team 10 with these streams:

### Stream 1 — Canonical data-flow alignment
- unify system ticker creation
- convert `/me/tickers` into lookup + link with canonical create fallback
- enforce market-data validation before new system ticker activation

### Stream 2 — Semantic model completion
- complete D34 condition-builder implementation
- enforce note/alert linkage semantics
- enforce alert lifecycle behavior and status rendering

### Stream 3 — UX/system consistency
- add-button standardization
- details-modal standardization
- tooltip coverage for action controls and entity-type filters
- copy normalization (`ביטול` etc.)
- linked-object rendering (icon + display name + details-modal linkage)

### Stream 4 — Auth/session behavior alignment
- remove misleading persisted authenticated state after access-token expiry
- force login redirect on expiry
- preserve only `usernameOrEmail`

## 5) Requested decision

Approve this **single unified remediation frame** so Team 90 can convert it into one structured execution package for Team 10.

**log_entry | TEAM_90 | SPEC_PACKAGE | S002_P003_WP002 | PRE_REMEDIATION_ALIGNMENT_FRAME_READY_v1_2_0_UNIFIED | 2026-03-03**
