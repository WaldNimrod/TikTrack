---
id: GOV-FOUND-ADR-TEMPLATE-001
owner: Architect
status: LOCKED
context: Canonical ADR template for Architect Decisions, Directives, Policies, Mandates
sv: 1.0.0
doc_schema_version: 1.0
last_updated: 2026-02-16
authority: _COMMUNICATION/_Architects_Decisions/ARCHITECT_DECISION_TEMPLATE.md
---
**project_domain:** TIKTRACK

# ADR Template — Canonical Governance Standard

**Canonical source:** `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DECISION_TEMPLATE.md`  
**Procedure:** `documentation/05-PROCEDURES/TT2_ARCHITECT_DECISION_TEMPLATE_PROCEDURE.md`

---

## Metadata Model (LOCKED)

| Field | Semantics | Example |
|-------|-----------|---------|
| **id** | decision identity | ADR-ARCH-001, ADR-GOV-XXX |
| **sv** | system version applicability | 1.0.0 |
| **doc_schema_version** | template/metadata schema revision | 1.0 |
| **last_updated** | document revision date | YYYY-MM-DD |

**CRITICAL:** `sv` = system version applicability (Ceiling policy). **NOT** document schema version.

---

## Template Body

See operational source: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DECISION_TEMPLATE.md`

Required frontmatter fields: `id`, `owner`, `status`, `context`, `sv`, `doc_schema_version`, `last_updated`.

Required sections: Context, Decision, Scope, Binding Rules, Operational Impact, Validation Gate, References, log_entry.

---

**log_entry | TEAM_70 | ADR_TEMPLATE_CANONICAL_REGISTERED | docs-governance/00-FOUNDATIONS | 2026-02-16**
