---
id: TEAM_90_AOS_V3_PROMPT_ARCH_SPEC_REVIEW_v1.0.0
historical_record: true
from: Team 90 (QA Reviewer)
to: Team 100 (Author), Team 00 (Gate Approver)
date: 2026-03-26
stage: SPEC_STAGE_6
artifact_reviewed: TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.0.md
verdict: CONDITIONAL_PASS
major_count: 2
minor_count: 1
low_count: 0---

## Overall Verdict: CONDITIONAL_PASS

## Summary
The spec is strong on layer architecture, AD-S5 integration framing, and PAUSED-boundary sequencing intent. However, there are blocking SSOT alignment gaps in UC mapping and one behavioral SQL defect in template version-bump logic for nullable scope fields. These must be corrected before gate approval.

## Findings Table
| Finding ID | Severity | Section | Title | Gate Impact |
|---|---|---|---|---|
| F-01 | MAJOR | §3, §6, §9 | UC Mapping Drift vs Stage-3 SSOT | BLOCKING |
| F-02 | MAJOR | §3.2 | Null-Unsafe Template Update SQL Breaks L4 Invalidation for Default Scopes | BLOCKING |
| F-03 | MINOR | §6.1–§6.2 | `_get_policy_value()` Cannot Return Object-Shaped Policies (`token_budget`) | MUST_FIX_ON_RESUBMIT |

## Findings

### F-01 — [Severity: MAJOR] — UC Mapping Drift vs Stage-3 SSOT
**Section:** §3, §6, §9  
**Root Cause:** Stage 6 references non-canonical UC identities (`UC-12 UpdateTemplate`, `UC-13 UpdatePolicy`, `UC-07 GeneratePrompt`) that conflict with the current Use Case Catalog v1.0.3 numbering. This breaks traceability and can misroute implementation/validation responsibilities.  
**Evidence:**
- Stage 6: `_COMMUNICATION/team_100/TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.0.md:273` ("via UC-13 (UpdatePolicy)")
- Stage 6: `_COMMUNICATION/team_100/TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.0.md:284` ("UC-12 UpdateTemplate")
- Stage 6: `_COMMUNICATION/team_100/TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.0.md:595` ("GeneratePrompt (UC-07)")
- UC Catalog SSOT: `_COMMUNICATION/team_100/TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md:538` (UC-12 = PrincipalOverride)
- UC Catalog SSOT: `_COMMUNICATION/team_100/TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md:592` (UC-13 = GetCurrentState)
- UC Catalog SSOT: `_COMMUNICATION/team_100/TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md:779` (UC-07 = PauseRun)
**Required Fix:**
1. Align Stage 6 references to the canonical UC IDs in v1.0.3, or
2. Add/renumber UC definitions in Stage-3 SSOT and then update Stage 6 accordingly.
No Stage 6 artifact should reference non-canonical UC numbers.

### F-02 — [Severity: MAJOR] — Null-Unsafe Template Update SQL Breaks L4 Invalidation for Default Scopes
**Section:** §3.2  
**Root Cause:** The L4 invalidation UPDATE uses equality predicates for nullable columns (`phase_id`, `domain_id`). SQL `=` against NULL does not match, so version bump fails for gate-default/domain-default template rows. That can leave stale L4 content under version-based caching.
**Evidence:**
- Stage 6 SQL: `_COMMUNICATION/team_100/TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.0.md:292`-`295` (`phase_id = :phase_id` and `domain_id = :domain_id`)
- Template scope is nullable by design: `_COMMUNICATION/team_100/TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.0.md:338`-`339`
- DDL confirms nullable `phase_id`, `domain_id`: `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md:344`-`345`
**Required Fix:**
Use null-safe matching in update path, e.g. `IS NOT DISTINCT FROM` for PostgreSQL, or explicit `(col = :x OR (col IS NULL AND :x IS NULL))` predicates.

### F-03 — [Severity: MINOR] — `_get_policy_value()` Cannot Return Object-Shaped Policies (token_budget)
**Section:** §6.1–§6.2  
**Root Cause:** `_get_policy_value()` only extracts `value` or `max`, but `token_budget` is documented as an object with keys `L1..L4`. This causes policy rows to be ignored and default budgets to be used.
**Evidence:**
- Object policy shape: `_COMMUNICATION/team_100/TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.0.md:471`
- Resolver logic: `_COMMUNICATION/team_100/TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.0.md:496`-`497`
- Consumer expects dict budget: `_COMMUNICATION/team_100/TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.0.md:505`-`516`
**Required Fix:**
In `_get_policy_value()`, return full parsed JSON when `value`/`max` keys are absent (or implement typed policy decoders per key).

## AD-S5 Compliance Check
| AD | Requirement | Present in Spec? | Evidence |
|---|---|---|---|
| AD-S5-01 | process_variant in L1+L3 | ✅ | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.0.md:39`, `:41`, `:58`, `:69`, `:392` |
| AD-S5-02 | precondition run.status | ✅ | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.0.md:84`, `:129` |
| AD-S5-03 | RESUME sequence §7 | ✅ | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.0.md:533`-`560` |
| AD-S5-05 | sentinel in L3 | ✅ | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.0.md:71`, `:165`, `:582` |

## UC Alignment Check
| UC | Aspect | Covered? | Note |
|---|---|---|---|
| UC-07 | §9 closure complete | ❌ | Stage 6 labels GeneratePrompt as UC-07, but UC-07 in SSOT is PauseRun. |
| UC-12 | §3.2 invalidation | ❌ | Stage 6 maps UpdateTemplate to UC-12; UC-12 in SSOT is PrincipalOverride. |
| UC-13 | §6 policy management | ❌ | Stage 6 maps UpdatePolicy to UC-13; UC-13 in SSOT is GetCurrentState (read-only). |
| UC-08 | §7 RESUME sequence | ✅ | Boundary and Branch A/B flow are aligned to Routing Spec §4.3 and UC-08 behavior. |

## Recommendation to Team 00
Do not approve Stage 6 at this revision. Require Team 100 to submit v1.0.1 with: (1) canonical UC mapping aligned to Stage-3 SSOT, and (2) null-safe SQL for template update/version bump. After these MAJOR fixes, revalidation can focus on residual MINOR policy-decoding behavior.
