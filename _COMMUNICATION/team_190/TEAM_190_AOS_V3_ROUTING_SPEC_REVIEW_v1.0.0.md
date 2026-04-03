---
id: TEAM_190_AOS_V3_ROUTING_SPEC_REVIEW_v1.0.0
historical_record: true
from: Team 190 (Constitutional / Spec Validator)
to: Team 100, Team 00
date: 2026-03-26
stage: SPEC_STAGE_5
artifact_reviewed: TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.0.md
verdict: CONDITIONAL_PASS
review_mode: STRICT_REVIEW---

## Overall Verdict: CONDITIONAL_PASS

The Stage 5 routing spec is structurally strong and broadly aligned with the SSOT chain, but contains unresolved contract-level issues that must be fixed before full PASS.

## Scope Coverage vs Request

| Focus Area | Status | Notes |
|---|---|---|
| Two-stage resolution correctness | PARTIAL | Correct `routing_rules -> role_id -> assignments -> team_id` model, but sentinel path has unresolved scope behavior. |
| Priority ordering (domain > variant > phase > priority > id) | PASS | Canonical SQL ordering matches declared policy. |
| Sentinel mechanism + DEPRECATED/L1 | PARTIAL | L1 framing is present, but runtime semantics are internally inconsistent. |
| Canonical SQL (§1.4) vs DDL v1.0.1 | PASS | Column names and filters align with DDL (`variant`, `role_id`, `resolve_from_state_key`). |
| paused_routing_snapshot_json vs UC-08 lock | PARTIAL | Schema is aligned, but resolver implementation path conflicts with restore contract. |
| Test coverage (13 TC, 8 EC) | PARTIAL | Coverage breadth is good, but two tests are non-deterministic under the provided fixture. |
| ROUTING_UNRESOLVED event + error code | PARTIAL | Error code is explicit, event semantics need tightening. |
| SSOT correction section | PASS | Top-level correction set is accurate and useful. |

## Findings Table (STRICT)

| ID | Severity | Finding | evidence-by-path | route_recommendation |
|---|---|---|---|---|
| F-01 | MAJOR | Sentinel query ignores routing context fields (`phase_id`, `domain_id`, `variant`) and currently evaluates only by `gate_id` + non-null key. This can trigger cross-context override behavior. | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.0.md:124`; `_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.0.md:129`; `_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.0.md:305`; `_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.0.md:525` | doc |
| F-02 | MAJOR | Resume routing contract mismatch: `_resolve_from_snapshot()` still resolves `role_id` via live routing_rules before reading snapshot, which can drift from the "restore from snapshot unless TEAM_ASSIGNMENT_CHANGED" contract. | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.0.md:205`; `_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.0.md:216`; `_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.0.md:470`; `_COMMUNICATION/team_100/TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md:111`; `_COMMUNICATION/team_100/TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md:406` | doc |
| F-03 | MAJOR | TC-12 and TC-13 are not deterministic under the declared fixture and include alternate outcomes. This breaks strict test-contract expectations for rank=1 outcomes from fixed seed data. | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.0.md:772`; `_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.0.md:789`; `_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.0.md:795`; `_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.0.md:814` | doc |
| F-04 | MINOR | Sentinel lifecycle text is internally contradictory: one line says automatic clear on FORCE_RESUME, another says sentinel state persists independently on `runs`. | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.0.md:324`; `_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.0.md:326` | doc |

## Confirmed Strengths

1. Field/column alignment to DDL v1.0.1 is clean (`routing_rules.variant`, `routing_rules.role_id`, `assignments.status`, `runs.process_variant`).
2. Two-stage role-to-team resolution architecture is explicit and coherent.
3. `ROUTING_UNRESOLVED` as fail-closed behavior is defined with HTTP 500 and audit event insertion path.
4. Snapshot schema section matches UC-08 locked JSON schema structure.

## Spy Feedback (Architectural Risk Intelligence)

1. The current document is one iteration away from PASS; issues are semantic consistency, not foundational model failure.
2. Highest operational risk is resolver drift during PAUSED/RESUME, not SQL syntax or DDL mismatch.
3. Sentinel deprecation is correctly framed, but interim behavior must be constrained to avoid unpredictable cross-context overrides.

## Recommendation to Team 00

Hold Stage 5 gate at `CONDITIONAL_PASS` until F-01..F-03 are explicitly closed in the next revision.

---
log_entry | TEAM_190 | AOS_V3_STAGE5_ROUTING_SPEC_REVIEW | CONDITIONAL_PASS_v1.0.0 | 2026-03-26
