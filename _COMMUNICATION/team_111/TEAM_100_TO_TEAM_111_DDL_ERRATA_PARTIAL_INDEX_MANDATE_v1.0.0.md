---
id: TEAM_100_TO_TEAM_111_DDL_ERRATA_PARTIAL_INDEX_MANDATE_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 111 (AOS Domain Architect)
cc: Team 00 (Principal), Team 190 (Constitutional Validator)
date: 2026-03-26
type: DDL_ERRATA_MANDATE
priority: HIGH
parallel_to: STAGE_7
origin: Team 00 Architectural Review — Risk R3 (Stage 6 Prompt Arch Spec v1.0.1)---

# DDL Errata Mandate — Partial Unique Index on `templates`

## Background

During Team 00's final architectural review of Stage 6 (Prompt Architecture Spec v1.0.1), the following gap was identified:

**Entity Dictionary v2.0.2 §Template — Invariant 1:**
> "At most one `is_active=1` template per (`gate_id`, `phase_id`, `domain_id`) context."

**DDL v1.0.1 (Stage 4, Team 190 PASS):** This invariant is **not enforced** at the database level. No unique constraint or partial index exists on the `templates` table for active templates.

**Current Defense (Stage 6 EC-08):** `TEMPLATE_LOOKUP_SQL` uses `ORDER BY ... version DESC LIMIT 1` as defense-in-depth, selecting deterministically even if the invariant is violated. However, this only prevents corruption at read time — it does not prevent the mutation that violates the invariant.

## Mandate

Team 111 SHALL add the following partial unique index to the DDL specification:

```sql
CREATE UNIQUE INDEX uq_templates_active_scope
  ON templates (gate_id, COALESCE(phase_id, ''), COALESCE(domain_id, ''))
  WHERE is_active = 1;
```

**Design Notes:**
- `COALESCE` wraps nullable columns to make `NULL` values participate in the uniqueness constraint. Without this, PostgreSQL treats `NULL != NULL`, allowing multiple active templates with `phase_id IS NULL` for the same `gate_id`.
- Alternative: `CREATE UNIQUE INDEX uq_templates_active_scope ON templates (gate_id, phase_id, domain_id) WHERE is_active = 1;` — this is simpler but allows multiple `is_active=1` rows where `phase_id` or `domain_id` is NULL. **Team 111 must choose the variant that correctly enforces Dict Invariant 1 for NULL-scope templates.**
- The `WHERE is_active = 1` filter ensures deactivated templates (`is_active = 0`) do not interfere with the constraint.

## Deliverable

| Item | Description |
|---|---|
| **DDL Spec amendment** | Update `TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md` → v1.0.2 with the partial unique index |
| **Review** | Submit to Team 190 for constitutional validation (DDL errata — single amendment) |
| **Timeline** | Parallel to Stage 7 — no blocking dependency |

## Acceptance Criteria

1. Partial unique index exists in DDL spec on `templates` for `is_active = 1` rows
2. NULL-scope templates (gate-default, cross-domain) are correctly constrained — at most one active per context
3. Team 190 PASS on the DDL errata amendment
4. Artifact Index updated with the errata artifact

## Cross-References

| Reference | Location |
|---|---|
| Entity Dict Invariant | `TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md` §Template — Invariant 1 |
| DDL templates table | `TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md` §2 `templates` |
| Prompt Arch EC-08 | `TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.2.md` §8 EC-08 |
| Team 00 R3 finding | Architectural review 2026-03-26 |

---

**log_entry | TEAM_100 | DDL_ERRATA_MANDATE | PARTIAL_INDEX_TEMPLATES | TO_TEAM_111 | 2026-03-26**
