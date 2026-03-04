# SPEC_PACKAGE — S002-P003-WP002 Pre-Remediation Alignment Frame (v1.1.0)
**project_domain:** TIKTRACK

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

## Scope

This package defines the remediation frame for full baseline alignment across existing active entities and shared UI patterns before new entities are added.

Primary emphasis:
- D22 (`tickers`)
- D33 (`user_tickers`)
- D34 (`alerts`)
- D35 (`notes`)

Mandatory connected scope:
- shared add-button patterns
- shared modal patterns
- shared action-menu semantics
- shared detail-module behavior
- authentication/session UX after token expiry

## Locked decisions included in this package

1. One canonical backend path for system ticker creation.
2. D33 is included in the correction cycle where coupled.
3. Notes/alerts must link to either a specific record or a specific datetime.
4. `general` is not a valid linked target.
5. Alerts require a rich condition model now.
6. Alert lifecycle requires a richer operational state model.
7. UI consistency alignment applies across current entities.
8. Attachments require real persisted proof in re-test.
9. No deferred structural tails; baseline must be aligned before expansion.
10. After access-token expiry (24h), the user is treated as logged out.
11. Only `usernameOrEmail` may be remembered locally for convenience.

## Proposed implementation streams

### Stream 1 — Canonical data-flow alignment
- unify system ticker creation
- convert `/me/tickers` into lookup + link with canonical create fallback
- remove record-link ambiguity in notes/alerts

### Stream 2 — Semantic model lock
- lock alert condition-builder structure
- lock alert lifecycle/status model
- lock note linkage rules and edit-mode constraints

### Stream 3 — UX/system consistency alignment
- standardize add buttons and labels
- standardize details modules
- standardize modal layout and copy
- add explicit tooltips to action-menu buttons

### Stream 4 — Auth/session alignment
- remove misleading persisted authenticated state after token expiry
- enforce redirect to login on expired access token
- remember only `usernameOrEmail`
- keep explicit logout as a clean local-state reset path, not the sole visible exit from auth state

## Open architect confirmations requested

1. Final shape of the D34 condition builder.
2. Final minimum alert lifecycle set (baseline may be expanded if justified).
3. Whether D33 requires a dedicated persistent status field now.
4. Canonical data-contract shape for datetime-linked notes/alerts.
5. Whether silent refresh remains allowed only before expiry, or should be removed entirely from human-facing flow after access-token expiry.

## Requested decision

Approve this remediation frame so Team 90 can convert it into an execution package for Team 10.

**log_entry | TEAM_90 | SPEC_PACKAGE | S002_P003_WP002 | PRE_REMEDIATION_ALIGNMENT_FRAME_READY_v1_1_0 | 2026-03-03**
