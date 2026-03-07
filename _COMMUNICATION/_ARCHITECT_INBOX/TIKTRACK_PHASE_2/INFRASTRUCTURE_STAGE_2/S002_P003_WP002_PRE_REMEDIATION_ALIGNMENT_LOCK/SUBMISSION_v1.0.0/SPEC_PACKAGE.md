# SPEC_PACKAGE — S002-P003-WP002 Pre-Remediation Alignment Frame
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
- D34 (`alerts`)
- D35 (`notes`)

Mandatory connected scope where the same structural issue exists:

- D33 / `user_tickers`
- shared add-button patterns
- shared modal patterns
- shared action-menu semantics
- shared detail-module behavior

## Locked decisions included in this package

1. One canonical backend path for system ticker creation.
2. D33 is included in the correction cycle where coupled to the issue.
3. Notes/alerts must link to either:
   - a specific record, or
   - a specific datetime (date + time).
4. `general` is not a valid linked target.
5. Alerts require a rich condition model now (not a placeholder).
6. Alert lifecycle requires a richer operational state model.
7. UI consistency alignment applies across current entities, not just the last reviewed page.
8. Attachments require real persisted proof in re-test.
9. No deferred structural tails; baseline must be aligned before expansion.

## Proposed implementation streams

### Stream 1 — Canonical data-flow alignment

- Unify system ticker creation.
- Convert `/me/tickers` into lookup + link with canonical create fallback.
- Remove record-link ambiguity in notes/alerts.

### Stream 2 — Semantic model lock

- Lock alert condition-builder structure.
- Lock alert lifecycle/status model.
- Lock note linkage rules and edit-mode constraints.

### Stream 3 — UX/system consistency alignment

- Standardize add buttons and labels.
- Standardize details modules.
- Standardize modal layout and copy.
- Add explicit tooltips to action-menu buttons.

## Open semantic definitions requiring architect confirmation

1. Final shape of the D34 condition builder.
2. Final minimum alert lifecycle set (baseline may be expanded if justified).
3. Whether the D33 user-layer status model requires a dedicated persistent field now.
4. How datetime-linked notes/alerts should be represented canonically in the data contract.

## Benchmark instruction (locked requirement)

The remediation design for D34 alerts must include a structured benchmark against TradingView-style alert capabilities before implementation details are finalized.

Minimum benchmark focus:

1. condition flexibility
2. trigger ergonomics
3. operator/value usability
4. practical support for metrics such as price, moving averages, and volume

This package requests approval of that benchmark requirement as part of the remediation frame.

## Requested decision

Approve this remediation frame so Team 90 can convert it into an execution package for Team 10.

**log_entry | TEAM_90 | SPEC_PACKAGE | S002_P003_WP002 | PRE_REMEDIATION_ALIGNMENT_FRAME_READY | 2026-03-01**
