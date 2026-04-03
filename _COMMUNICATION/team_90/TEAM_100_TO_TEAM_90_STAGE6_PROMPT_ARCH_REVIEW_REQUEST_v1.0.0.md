---
id: TEAM_100_TO_TEAM_90_STAGE6_PROMPT_ARCH_REVIEW_REQUEST_v1.0.0
historical_record: true
from: Team 100
to: Team 90
cc: Team 00
date: 2026-03-26
artifact: TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.0.md
stage: SPEC_STAGE_6
focus_areas:
  - layer definitions completeness (L1–L4 content, budgets)
  - assemble_prompt() algorithm correctness + precondition
  - caching policy consistency (key format + invalidation)
  - template placeholder inventory completeness
  - PAUSED run boundary (AD-S5-02/AD-S5-03 compliance)
  - policy integration alignment with UC-13
  - edge case coverage (TemplateNotFound, GovernanceNotFound, INVALID_RUN_STATUS)
verdict_format: PASS | CONDITIONAL_PASS (findings table) | FAIL---

# Stage 6 — Prompt Architecture Spec — Review Request

## Artifact

`_COMMUNICATION/team_100/TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.0.md`

## SSOT Basis

| Document | Version | Status |
|---|---|---|
| Entity Dictionary | v2.0.2 | PASS (Team 190) |
| DDL Spec | v1.0.1 | PASS (Team 190) |
| Use Case Catalog | v1.0.3 | PASS_CHAIN_SYNC |
| Routing Spec | v1.0.1 | PASS (Team 190) |
| State Machine Spec | v1.0.2 | PASS_CHAIN_SYNC |

## Architectural Decisions Integrated

| AD | Description | Spec Section |
|---|---|---|
| AD-S5-01 | Sentinel is context-scoped; L1/L3 must include `domain_id` + `process_variant` | §1, §2.2, §4.3 |
| AD-S5-02 | `resolve_actor()` / `assemble_prompt()` NOT called for PAUSED runs | §2.1, §7 |
| AD-S5-03 | UC-08 Branch A reads snapshot directly; prompt assembly after RESUME only | §7.2 |
| AD-S5-05 | Sentinel column persists; L3 renders sentinel field as awareness metadata | §1 (L3 detail), §8 EC-05 |

## SSOT Corrections Applied

5 field name corrections from activation prompt to match DDL/Dict exactly:
- `templates.content` → `body_markdown`
- `templates.template_version` → `version`
- `templates.updated_by` → removed (not in DDL)
- Template lookup must filter `is_active=1`
- Prompt = Value Object (not DB entity in normal flow)

## Key Design Decisions

1. **Template specificity ordering:** Phase-specific + domain-specific beats phase-only, domain-only, or gate-default. Latest version wins at equal specificity.
2. **Template rendering:** Hard failure on unknown placeholders (`TemplateRenderError`). No silent substitution.
3. **Token budget:** Advisory only — logged as warning, does not block assembly.
4. **L4 caching:** Rendered template (after placeholder substitution) is cached, not raw `body_markdown`. Cache key includes `version`.
5. **OQ-S3-01 closure:** GeneratePrompt fully defined in §9 with optional audit persistence to `prompts` table.

## Requested Review Focus

1. **Layer completeness:** Verify L1 has all identity fields (including `process_variant`). Verify L3 has sentinel awareness + event window.
2. **Algorithm correctness:** Verify `assemble_prompt()` precondition matches AD-S5-02. Verify template lookup SQL uses `is_active=1` and specificity ordering.
3. **Caching consistency:** Verify L2/L4 cache keys use correct column names (`version`, not `template_version`). Verify invalidation sequences are complete.
4. **Placeholder inventory:** Verify all 9 placeholders are resolvable from declared DB sources. Verify hard-failure semantics for unknown placeholders.
5. **PAUSED boundary:** Verify §7 documents the complete RESUME→prompt sequence. Verify error codes for all invalid run statuses.
6. **Policy alignment:** Verify all policies listed map to `policies` table schema (DDL). Verify UC-13 authority restriction.
7. **Edge case coverage:** 8 ECs — verify each has behavior + justification + error code where applicable.
8. **OQ-S3-01:** Verify GeneratePrompt definition aligns with UC Catalog v1.0.3 open question closure.

---

log_entry | TEAM_100 | STAGE6_PROMPT_ARCH_REVIEW_REQUEST | v1.0.0 | SUBMITTED_TO_TEAM_90 | 2026-03-26
