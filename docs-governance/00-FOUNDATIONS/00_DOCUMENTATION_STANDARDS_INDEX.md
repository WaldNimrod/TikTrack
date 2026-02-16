---
id: GOV-FOUND-INDEX-001
owner: Team 70 (Knowledge Librarian)
status: ACTIVE
context: Governance documentation standards registration
sv: 1.0.0
doc_schema_version: 1.0
last_updated: 2026-02-16
---

# Governance Documentation Standards Index

**Scope:** Canonical templates and standards for governance documentation.

**Governance lock:** ADR Template Adoption — **LOCKED** per [PHOENIX COMMAND (Team 10)](../../_COMMUNICATION/team_10/PHOENIX_COMMAND_ADR_TEMPLATE_GOVERNANCE_ADOPTION_LOCKED.md). Effective immediately for all future ADR and directive documents.

---

## 1) Canonical Templates

| Template | Path | Applicability |
|----------|------|---------------|
| **ADR Template** | `docs-governance/00-FOUNDATIONS/ADR_TEMPLATE_CANONICAL.md` | Architect Decisions, Directives, Policies, Mandates |
| **Operational source** | `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DECISION_TEMPLATE.md` | Authoring template (Team 70 formats; Architect issues) |

---

## 2) ADR Template Applicability

**Used for:**
- Architect Decisions (ADR)
- Governance Directives
- Policies
- Mandates

**Not used for:**
- Communication reports
- Team completion reports
- QA artifacts
- Blueprints / specs (use applicable spec templates)

---

## 3) ADR Metadata Model

| Field | Semantics |
|-------|-----------|
| **id** | decision identity |
| **sv** | system version applicability (NOT document schema) |
| **doc_schema_version** | template/metadata schema revision |
| **last_updated** | document revision date |

---

## 4) Verification Rule

No governance template may use `sv` as document schema version.  
`sv` is reserved for system version applicability (Ceiling policy).

---

## 5) References

- **Phoenix Command (lock):** `_COMMUNICATION/team_10/PHOENIX_COMMAND_ADR_TEMPLATE_GOVERNANCE_ADOPTION_LOCKED.md`
- `documentation/05-PROCEDURES/TT2_ARCHITECT_DECISION_TEMPLATE_PROCEDURE.md`
- `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DECISION_TEMPLATE_STANDARD.md`
- `_COMMUNICATION/team_90/GOVERNANCE_SOURCE_MATRIX.md`

---

**log_entry | TEAM_70 | DOCUMENTATION_STANDARDS_INDEX_CREATED | 2026-02-16**  
**log_entry | TEAM_10 | PHOENIX_COMMAND_REF_ADDED | 2026-02-16**
