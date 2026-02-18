# Iron Rules Constitution (Draft) v1.3.1

**status:** DRAFT_FOR_TEAM_190_ACTIVATION  
**owner:** Team 90 (derived from active governance anchors)  
**date:** 2026-02-18

---

## 1) Constitutional rules

1. **No guessing**: missing data or ambiguous spec -> BLOCK + clarification cycle.
2. **No authority drift**: only canonical anchors are valid.
3. **No gate bypass**: each gate must have explicit evidence and pass status.
4. **No closure without Seal**: closure requires SOP-013 compliant seal policy.
5. **No communication-as-SSOT**: `_COMMUNICATION/90_Architects_comunication/` is communication only.

---

## 2) Canonical anchors (locked)

- Global index: `00_MASTER_INDEX.md` (repo root)
- Architect decisions: `_COMMUNICATION/_Architects_Decisions/`
- SOP-013 canonical file: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md`

---

## 3) Team 190 operating boundaries

Team 190 is authorized to:
- validate spec completeness and architectural consistency,
- block on contradictions and missing mandatory fields,
- require clarification package before re-run.

Team 190 is not authorized to:
- write production code,
- edit SSOT directly,
- substitute QA (Team 50) or Dev Validation (Team 90).

---

## 4) Gate-5 mandatory checks

1. Spec package matches `SPEC_PACKAGE_SCHEMA_v1.3.1`.
2. `state_definitions` and `selector_registry` are present and testable.
3. ADR/decision references point only to canonical architect decisions.
4. Evidence package includes required artifact classes from taxonomy registry.

---

**log_entry | TEAM_90 | IRON_RULES_CONSTITUTION_DRAFT_v1_3_1 | PREPARED_FOR_TEAM_190 | 2026-02-18**
