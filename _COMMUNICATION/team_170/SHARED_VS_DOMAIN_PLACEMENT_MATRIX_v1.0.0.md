# SHARED_VS_DOMAIN_PLACEMENT_MATRIX_v1.0.0

**project_domain:** SHARED  
**from:** Team 170  
**to:** Team 190  
**mandate:** TEAM_190_TO_TEAM_170_CROSS_DOMAIN_STRUCTURE_IMPLEMENTATION_MANDATE_v1.0.0  
**date:** 2026-02-22

---

## 1. Placement rules (enforced by structure)

| Layer | Location | Content |
|-------|----------|---------|
| **Shared governance** | `documentation/docs-governance/` | SSM, WSM, Gate Model, procedures, policies, protocols, contracts, templates, directives, working validation records; single active root (00-INDEX, 01-FOUNDATIONS, …, 08-WORKING_VALIDATION_RECORDS, 99-archive) |
| **Shared system docs** | `documentation/docs-system/` | System-level specs and docs shared across domains |
| **AGENTS_OS domain governance** | `agents_os/docs-governance/` | Domain concepts, LLD400 concept package, AOS_workpack, 00-INDEX (gateway), 99-QUARANTINE_STAGE3 (conflict candidates) |
| **AGENTS_OS domain documentation** | `agents_os/documentation/` | Domain product docs; 00-INDEX (gateway) |

---

## 2. Matrix: artifact type → placement

| Artifact type | Shared | AGENTS_OS domain |
|---------------|--------|-------------------|
| SSM / WSM | `documentation/docs-governance/01-FOUNDATIONS/` | — |
| Gate Model, Iron Rules, Team 190 Constitution | `documentation/docs-governance/01-FOUNDATIONS/` | — |
| Procedures, policies, protocols | `documentation/docs-governance/` (02–04, etc.) | — |
| Directives, contracts, templates | `documentation/docs-governance/` (05–08) | — |
| Governance index / source map | `documentation/docs-governance/00-INDEX/` | `agents_os/docs-governance/00-INDEX/` (empty, Stage 3 fill) |
| Domain concept package (e.g. Phase 1 LLD400) | — | `agents_os/docs-governance/AGENTS_OS_PHASE_1_CONCEPT_PACKAGE_v1.0.0/` |
| Domain conflict candidates (quarantine) | — | `agents_os/docs-governance/99-QUARANTINE_STAGE3/` |
| Legacy / deprecated | `documentation/docs-governance/99-archive/` | — |

---

## 3. Invariants (unchanged)

- Roadmap/Stages: shared.  
- SSM/WSM: shared canonical under `documentation/docs-governance/01-FOUNDATIONS/`.  
- Gate model and team roles: shared.  
- Program / Work Package: single-domain only.  
- Domain-local override does not alter shared canonical artifacts.

---

**log_entry | TEAM_170 | SHARED_VS_DOMAIN_PLACEMENT_MATRIX | v1.0.0 | 2026-02-22**
