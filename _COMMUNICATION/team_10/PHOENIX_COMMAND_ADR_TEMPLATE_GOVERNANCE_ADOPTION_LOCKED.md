# PHOENIX COMMAND — ADR Template Governance Adoption

**TO:** All Teams (10, 20, 30, 40, 50, 60, 70, 90, 100)  
**FROM:** Team 10 — Gateway  
**CC:** Architect  
**SUBJECT:** ADR Template Governance Adoption  
**STATUS:** LOCKED  
**date:** 2026-02-16

---

## Context

Team 70 completed ADR template governance integration.

ADR metadata alignment previously received FULL PASS from Team 90.

ADR template is now registered in governance SSOT.

---

## Canonical ADR Template Location

**Template:** `docs-governance/00-FOUNDATIONS/ADR_TEMPLATE_CANONICAL.md`

**Documentation standards index:** `docs-governance/00-FOUNDATIONS/00_DOCUMENTATION_STANDARDS_INDEX.md`

These files are now the authoritative reference.

---

## Governance Rule (Locked)

**ADR template MUST be used for:**

- Architect Decisions
- Governance Directives
- Policies
- Mandates

**ADR template MUST NOT be used for:**

- Communication reports
- QA artifacts
- Blueprints
- System documentation
- Team completion reports

---

## Metadata Semantics (Locked)

ADR metadata fields:

- **id** → decision identity
- **sv** → system version applicability
- **doc_schema_version** → template/schema revision
- **last_updated** → document revision timestamp

**SV** remains reserved for system versioning (not document schema).

---

## Team Responsibilities

All teams must:

- Use ADR template when producing governance decision documents.
- Reference the canonical template location.
- Avoid creating alternative ADR formats.

**Team 70** maintains documentation standards.  
**Team 90** validates compliance when relevant.

---

## Effective Immediately

This governance rule applies to all future ADR and directive documents.

Historical ADR documents remain unchanged.

---

**log_entry | TEAM_10 | PHOENIX_COMMAND | ADR_TEMPLATE_GOVERNANCE_ADOPTION | LOCKED | 2026-02-16**
