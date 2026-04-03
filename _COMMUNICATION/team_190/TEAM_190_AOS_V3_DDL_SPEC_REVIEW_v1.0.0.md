---
id: TEAM_190_AOS_V3_DDL_SPEC_REVIEW_v1.0.0
historical_record: true
from: Team 190 (Constitutional / Spec Validator)
to: Team 111, Team 100, Team 00
date: 2026-03-26
stage: SPEC_STAGE_4
artifact_reviewed: TEAM_111_AOS_V3_DDL_SPEC_v1.0.0.md
in_reply_to: TEAM_111_TO_TEAM_190_STAGE4_DDL_REVIEW_REQUEST_v1.0.0.md
verdict: CONDITIONAL_PASS---

## Overall Verdict: CONDITIONAL_PASS

Artifact quality is high and the 14-table scope is complete, but cross-SSOT naming drift remains open on policy and D-03 actor fields. These are constitutional consistency issues (spec-chain alignment), not structural SQL failures.

## Findings (BLOCKER / MAJOR / MINOR)

| ID | Severity | Finding | evidence-by-path | route_recommendation |
|---|---|---|---|---|
| F-01 | MAJOR | Policy field contract drift across SSOT chain: Stage 4 DDL and Entity Dictionary use `policy_key` / `policy_value_json`, while Stage 2/3 specs still query `policies.key` / `value`. | DDL: `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.0.md:341`, `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.0.md:342`; Dict: `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md:566`, `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md:567`; UC: `_COMMUNICATION/team_100/TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.2.md:432`, `_COMMUNICATION/team_100/TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.2.md:472`; SM: `_COMMUNICATION/team_100/TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.1.md:85`, `_COMMUNICATION/team_100/TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.1.md:86` | `doc` |
| F-02 | MAJOR | D-03 actor identifier drift remains in Stage 2 spec (`team_code`, `actor_id`) while canonical model is `teams.id` / `events.actor_team_id`. | SM: `_COMMUNICATION/team_100/TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.1.md:70`, `_COMMUNICATION/team_100/TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.1.md:109`; Principal model: `documentation/docs-governance/01-FOUNDATIONS/PRINCIPAL_AND_TEAM_00_MODEL_v1.0.0.md:44`; Dict canonical event field: `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md:485`; DDL event field: `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.0.md:283` | `doc` |
| F-03 | MINOR | Mandate §4.3 defines composite FK using non-SSOT keys (`pipeline_role_id`, `run_id` on assignments). DDL correctly follows Dictionary (`role_id`, no `run_id` in Assignment). | Mandate: `_COMMUNICATION/team_111/TEAM_100_TO_TEAM_111_STAGE4_DDL_MANDATE_v1.0.0.md:132`, `_COMMUNICATION/team_111/TEAM_100_TO_TEAM_111_STAGE4_DDL_MANDATE_v1.0.0.md:133`; Dict Assignment: `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md:257`, `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md:260`; DDL note: `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.0.md:547` | `doc` |
| F-04 | MINOR | Constraint naming rule is partially unmet in literal form (several PK/UNIQUE constraints remain inline/unnamed). Functional impact is low. | Mandate rule: `_COMMUNICATION/team_111/TEAM_100_TO_TEAM_111_STAGE4_DDL_MANDATE_v1.0.0.md:123`; DDL inline constraints examples: `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.0.md:51`, `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.0.md:72`, `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.0.md:90` | `doc` |

## Adjudication — Three End Notes

| Topic | Decision | Rationale | Evidence |
|---|---|---|---|
| 1) GRA table naming | **APPROVED (with correction): use `gate_role_authorities`** | Dictionary SSOT explicitly defines plural table name; mandate singular row is drift. | Dict: `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md:214`; DDL: `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.0.md:136`, `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.0.md:141`; Mandate drift: `_COMMUNICATION/team_111/TEAM_100_TO_TEAM_111_STAGE4_DDL_MANDATE_v1.0.0.md:91` |
| 2) `prompts` table vs Prompt VO | **CONCERN (non-blocking): keep only as explicit optional audit snapshot table** | Dictionary defines Prompt as Value Object and “not a DB row”; mandate asks for table. DDL documents compromise clearly. Requires explicit governance lock to avoid dual-canonical interpretation. | Dict Prompt: `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md:588`, `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md:609`; Mandate row: `_COMMUNICATION/team_111/TEAM_100_TO_TEAM_111_STAGE4_DDL_MANDATE_v1.0.0.md:94`; DDL rationale: `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.0.md:356`, `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.0.md:359` |
| 3) `assignments` deviation vs mandate §4.3 | **APPROVED (DDL is correct, mandate needs correction)** | Assignment SSOT has `role_id`/`work_package_id`/`domain_id` and no `run_id`; forcing mandate composite FK would invent non-SSOT schema. | Dict Assignment: `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md:257`, `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md:260`; Mandate §4.3: `_COMMUNICATION/team_111/TEAM_100_TO_TEAM_111_STAGE4_DDL_MANDATE_v1.0.0.md:133`; DDL deviation note: `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.0.md:547` |

## Validation-Packaging Check (V-01…V-06)

All six validation sections are present and filled in the deliverable.

Evidence: `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.0.md:515` through `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.0.md:582`.

## Spy Feedback (Risk Intelligence)

1. Team 111 identified key mandate-vs-SSOT drifts proactively inside the artifact; this lowered integration risk.
2. The biggest residual risk is not SQL structure but spec-chain divergence (Policy and D-03 actor naming) that can create runtime query failures if unresolved.
3. The artifact is implementation-ready once naming drifts are canonically unified across Stage 2/3 docs.

---
log_entry | TEAM_190 | AOS_V3_STAGE4_DDL_REVIEW | CONDITIONAL_PASS | 2026-03-26
