# TT2 Architect Decision Template Procedure
**project_domain:** TIKTRACK

**id:** `TT2_ARCHITECT_DECISION_TEMPLATE_PROCEDURE`  
**owner:** Team 70 (Knowledge Librarian)  
**status:** 🔒 **SSOT - ACTIVE**  
**last_updated:** 2026-02-16  
**version:** v1.1  
**authority:** `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DECISION_TEMPLATE_STANDARD.md`

---

## 1) Purpose

Enforce one canonical template for all new or updated architect decision files under:

`_COMMUNICATION/_Architects_Decisions/`

---

## 2) Canonical Template

Mandatory template source:

`_COMMUNICATION/_Architects_Decisions/ARCHITECT_DECISION_TEMPLATE.md`

No alternative structure is allowed for new decision documents.

---

## 3) Applicability Rule

### 3.1 Mandatory
- New decision files
- Existing decision files that are currently edited

### 3.2 Not required
- Historical decision files that are not being modified

This is the locked "no full retroactive refactor" rule.

---

## 4) Required Sections Checklist

Each decision file must include:
1. Frontmatter with id/owner/status/context/sv/doc_schema_version/last_updated
   - **id** = decision identity
   - **sv** = system version applicability (NOT document schema)
   - **doc_schema_version** = template revision
2. Context
3. Decision
4. Scope (in/out)
5. Binding rules (MUST/MUST NOT)
6. Team impact
7. Validation gate (owner/evidence/pass/block)
8. References
9. `log_entry`

---

## 5) Workflow (Role Realignment)

1. Architect issues or updates decision text.
2. Team 70 formats decision using canonical template.
3. Team 10 performs gateway approval.
4. Team 90 validates structure + authority integrity.
5. Team 70 publishes and updates related SSOT links/indexes.

---

## 6) Fail Conditions

A decision update is blocked if any of these applies:
- Not based on canonical template
- Missing frontmatter or missing `log_entry`
- Uses communication path as authority instead of `_Architects_Decisions`
- Lacks explicit validation gate definition

---

## 7) Related Files

- `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DECISION_TEMPLATE_STANDARD.md`
- `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DECISION_TEMPLATE.md`
- `docs-governance/00-FOUNDATIONS/ADR_TEMPLATE_CANONICAL.md` (governance registration)
- `docs-governance/00-FOUNDATIONS/00_DOCUMENTATION_STANDARDS_INDEX.md`
- `_COMMUNICATION/_Architects_Decisions/ARCHITECT_TEAM_10_70_ROLE_REALIGNMENT.md`

---

**log_entry | TEAM_70 | ARCHITECT_DECISION_TEMPLATE_PROCEDURE | v1.1_ADR_METADATA_ALIGNMENT | 2026-02-16**
