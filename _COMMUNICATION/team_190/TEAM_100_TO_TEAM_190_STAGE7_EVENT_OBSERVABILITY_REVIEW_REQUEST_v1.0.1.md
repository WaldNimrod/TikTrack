---
id: TEAM_100_TO_TEAM_190_STAGE7_EVENT_OBSERVABILITY_REVIEW_REQUEST_v1.0.1
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 190 (Spec Validator)
date: 2026-03-26
type: REVIEW_REQUEST (REVALIDATION)
stage: SPEC_STAGE_7
artifact: _COMMUNICATION/team_100/TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.1.md
artifact_version: v1.0.1
supersedes: TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.0.md
correction_cycle: 1
prior_review: TEAM_190_AOS_V3_EVENT_OBSERVABILITY_SPEC_REVIEW_v1.0.0.md
prior_verdict: CONDITIONAL_PASS
findings_addressed: F-01, F-02, F-03, F-04, F-05---

# Review Request — Stage 7: Event & Observability Spec v1.0.1 (Correction Cycle 1)

## Request

Team 100 requests Team 190 revalidation of the Stage 7 Event & Observability Spec v1.0.1, addressing all 5 findings from the initial review (CONDITIONAL_PASS).

**Artifact:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.1.md`
**Supersedes:** v1.0.0
**Correction cycle:** 1

---

## Findings Addressed

| Finding | Severity | Fix | Location |
|---|---|---|---|
| **F-01** | MAJOR | Added `ROUTING_MISCONFIGURATION` to §6.2 Routing Spec Error Codes. Source: Routing Spec v1.0.1 EC-01 (duplicate sentinel rules). | §6.2 |
| **F-02** | MAJOR | Fixed ROUTING_FAILED payload: `failure_reason` → `reason` (per Stage 5 canonical INSERT SQL). Added optional `role_id` key (present in B.2 per Routing Spec TC-13). | §2.2 (ROUTING_FAILED) |
| **F-03** | MAJOR | Fixed GetCurrentState SQL: (1) added `a.domain_id = r.domain_id` for assignment JOIN domain scoping; (2) added `LEFT JOIN pipeline_roles pr ON pr.id = a.role_id`; (3) added `CASE WHEN r.status = 'PAUSED' THEN NULL` for actor columns — AD-S5-02 enforcement at SQL level. | §4.4 |
| **F-04** | MINOR | Harmonized error codes in §3.2: `limit` out-of-range → `INVALID_LIMIT`; unknown `event_type` → `INVALID_EVENT_TYPE`. `INVALID_HISTORY_PARAMS` retained for generic parameter errors only (offset, order). | §3.2 |
| **F-05** | MINOR | Removed UC-08 from `ROUTING_UNRESOLVED` UC mapping. UC-08 uses its own `ROUTING_RESOLUTION_FAILED` code. `ROUTING_UNRESOLVED` now mapped to UC-01 only. | §6.1 |

---

## Revalidation Focus

1. **F-01 closure:** Verify `ROUTING_MISCONFIGURATION` is present in §6.2 with correct description from Routing Spec EC-01
2. **F-02 closure:** Verify ROUTING_FAILED payload uses `reason` key (not `failure_reason`) and includes optional `role_id`
3. **F-03 closure:** Verify GetCurrentState SQL includes `a.domain_id = r.domain_id`, `pipeline_roles` JOIN, and PAUSED actor=null CASE
4. **F-04 closure:** Verify §3.2 uses `INVALID_LIMIT` and `INVALID_EVENT_TYPE` for specific errors
5. **F-05 closure:** Verify `ROUTING_UNRESOLVED` maps to UC-01 only (not UC-01, UC-08)
6. **Regression check:** No new findings introduced

---

**log_entry | TEAM_100 | STAGE7_REVIEW_REQUEST_v1.0.1 | TO_TEAM_190 | CORRECTION_CYCLE_1 | 2026-03-26**
