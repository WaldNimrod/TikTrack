---
id: TEAM_100_TO_TEAM_190_STAGE5_ROUTING_SPEC_REVIEW_REQUEST_v1.0.1
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 190 (Constitutional / Spec Validator)
cc: Team 00
date: 2026-03-26
stage: SPEC_STAGE_5
artifact: TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.1.md
supersedes_request: TEAM_100_TO_TEAM_190_STAGE5_ROUTING_SPEC_REVIEW_REQUEST_v1.0.0.md
prior_verdict: CONDITIONAL_PASS (v1.0.0)
prior_review: TEAM_190_AOS_V3_ROUTING_SPEC_REVIEW_v1.0.0.md
status: RESUBMITTED_FOR_REVIEW
correction_cycle: 1---

# Stage 5 — Routing Spec v1.0.1 — Revalidation Request

## Context

Team 190 issued `CONDITIONAL_PASS` on v1.0.0 with 3 MAJOR and 1 MINOR findings. This resubmission addresses all four findings. Team 00 directed zero-tolerance for any deviation.

## Artifact

`_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.1.md`

## SSOT Basis (unchanged)

| Document | Version |
|---|---|
| Entity Dictionary | v2.0.2 |
| DDL Spec | v1.0.1 |
| Use Case Catalog | v1.0.3 |
| State Machine Spec | v1.0.2 |

## Remediation Summary

| Finding | Severity | Fix Description | Sections Modified |
|---|---|---|---|
| **F-01** | MAJOR | Sentinel query now includes full context matching (`domain_id`, `variant`, `phase_id`) with specificity-ordered `LIMIT 1`. Prevents cross-context override. | §1.1 diagram, §1.2 chain, §1.3 pseudocode, §1.4 (new sentinel SQL), §2.1 definition, §2.2 mechanism, §2.4 uniqueness constraint, §3 chain, TC-01/02/03/05 sentinel SQL annotations |
| **F-02** | MAJOR | Removed `_resolve_from_snapshot()` from resolver. `resolve_actor()` precondition: `run.status ∈ {IN_PROGRESS, CORRECTION}`. PAUSED routing handled exclusively by UC-08 (§4.3 rewritten). Eliminates routing_rules drift during PAUSED state. | §1.1 diagram (precondition), §1.2 chain (Level 0 removed), §1.3 pseudocode (assertion + snapshot function removed), §4.3 (full rewrite), EC-05 updated |
| **F-03** | MAJOR | TC-12: Uses `GATE_6` (no rules in fixture) → deterministic `ROUTING_UNRESOLVED` at B.1. TC-13: Uses `S003-P006-WP001` (no assignment for resolved role) → deterministic `ROUTING_UNRESOLVED` at B.2. Both tests have single expected outcome, no hedging. | TC-12 (complete rewrite), TC-13 (complete rewrite), §6.0 fixture (explicit "no assignments for S003-P006-WP001" declaration) |
| **F-04** | MINOR | Removed "automatic clear on FORCE_RESUME" from sentinel lifecycle. Sentinel column persists on `runs` unless explicitly cleared by `team_00`. No contradiction. | §2.3 lifecycle table (Clear + Post-Resume rows), EC-05 updated |

## Requested Review Focus

1. **F-01 closure:** Verify `SENTINEL_RESOLUTION_SQL` (§1.4) correctly applies context scoping (`domain_id`, `variant`, `phase_id` OR-NULL matching) and specificity ordering. Confirm TC-03 sentinel test now documents context-scoped match.
2. **F-02 closure:** Verify `resolve_actor()` precondition blocks PAUSED calls. Verify §4.3 UC-08 resume contract uses snapshot directly (Branch A) without routing_rules re-resolution. Verify Branch B transitions to IN_PROGRESS before calling resolver.
3. **F-03 closure:** Verify TC-12 is deterministic (GATE_6, no rules → B.1 failure). Verify TC-13 is deterministic (S003-P006-WP001, no assignments → B.2 failure). Confirm no "alternative interpretation" hedging in any test case.
4. **F-04 closure:** Verify §2.3 lifecycle has no auto-clear. Verify EC-05 states sentinel persists through PAUSE/RESUME.
5. **Regression:** Confirm no new issues introduced by remediation.

---

log_entry | TEAM_100 | STAGE5_ROUTING_SPEC_REVIEW_REQUEST | v1.0.1_RESUBMISSION | correction_cycle=1 | 2026-03-26
