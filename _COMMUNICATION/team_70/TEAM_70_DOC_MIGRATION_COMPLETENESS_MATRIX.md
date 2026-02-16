# Team 70 | Documentation Migration Completeness Matrix

**id:** TEAM_70_DOC_MIGRATION_COMPLETENESS_MATRIX  
**owner:** Team 70 (Knowledge Librarian)  
**to:** Team 90 (Validation), Team 10 (Gateway)  
**date:** 2026-02-17  
**context:** TEAM_90_TO_TEAM_70_DOCUMENTATION_MIGRATION_CORRECTION_DIRECTIVE  
**status:** SUBMITTED FOR VALIDATION

---

## 1) Scope

**Source:** `documentation/` (full tree)  
**Targets:** `docs-system/`, `docs-governance/`, `reports/`, `archive/documentation_legacy/`, `_COMMUNICATION/_ARCHITECT_INBOX/`

**Rule:** Every file has exactly one target path. No file without defined destination.

---

## 2) Mapping by Folder (Source → Target)

| source_path | target_path | status | notes |
|-------------|-------------|--------|-------|
| `documentation/00-MANAGEMENT/**` | `archive/documentation_legacy/00-MANAGEMENT/` | MAPPED | Management & Master Index; remains in legacy until cutover; post-cutover: MASTER_INDEX authority moves to new location |
| `documentation/01-ARCHITECTURE/**` | `docs-system/01-ARCHITECTURE/` | MAPPED | ADRs, blueprints, specs — system documentation |
| `documentation/02-DEVELOPMENT/**` | `archive/documentation_legacy/02-DEVELOPMENT/` | MAPPED | Development guides; legacy retention per target model |
| `documentation/03-PRODUCT_&_BUSINESS/**` | `docs-system/08-PRODUCT/` | MAPPED | Product & business logic |
| `documentation/04-DESIGN_UX_UI/**` | `docs-system/07-DESIGN/` | MAPPED | Design, UX, UI specs |
| `documentation/05-PROCEDURES/**` | `docs-governance/02-PROCEDURES/` | MAPPED | Operational procedures |
| `documentation/05-REPORTS/**` | `reports/05-REPORTS/` | MAPPED | QA artifacts, evidence, Gate B |
| `documentation/06-ENGINEERING/**` | `docs-system/02-SERVER/` | MAPPED | Engineering, DB, auth |
| `documentation/07-CONTRACTS/**` | `docs-governance/06-CONTRACTS/` | MAPPED | API contracts, OpenAPI addenda |
| `documentation/07-POLICIES/**` | `archive/documentation_legacy/07-POLICIES/` | MAPPED | Legacy policies; 10-POLICIES → docs-governance/01-POLICIES |
| `documentation/08-REPORTS/**` | `reports/08-REPORTS/` | MAPPED | Weekly, monthly, yearly reports, session artifacts |
| `documentation/09-GOVERNANCE/**` | `docs-governance/09-GOVERNANCE/` | MAPPED | Governance, standards, gins |
| `documentation/10-POLICIES/**` | `docs-governance/01-POLICIES/` | MAPPED | Policies; merge with existing 01-POLICIES structure |
| `documentation/90_ARCHITECTS_DOCUMENTATION/**` | `_COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/` | MAPPED | Architect submission channel; READ-ONLY; decisions remain in _Architects_Decisions |
| `documentation/99-ARCHIVE/**` | `archive/documentation_legacy/99-ARCHIVE/` | MAPPED | Deprecated indexes, old logic — archive |
| `documentation/logs/**` | `archive/documentation_legacy/logs/` | MAPPED | Handover logs |
| `documentation/OPENAPI_SPEC_V2.yaml` | `archive/documentation_legacy/OPENAPI_SPEC_V2.yaml` | MAPPED | Root-level spec; primary OpenAPI lives in 07-CONTRACTS → docs-governance/06-CONTRACTS |

---

## 3) File Count Summary

| Source Folder | Est. Files | Target |
|---------------|------------|--------|
| 00-MANAGEMENT | 16 | archive/documentation_legacy/00-MANAGEMENT |
| 01-ARCHITECTURE | ~95 | docs-system/01-ARCHITECTURE |
| 02-DEVELOPMENT | ~15 | archive/documentation_legacy/02-DEVELOPMENT |
| 03-PRODUCT_&_BUSINESS | 1 | docs-system/08-PRODUCT |
| 04-DESIGN_UX_UI | ~12 | docs-system/07-DESIGN |
| 05-PROCEDURES | ~25 | docs-governance/02-PROCEDURES |
| 05-REPORTS | ~60 | reports/05-REPORTS |
| 06-ENGINEERING | ~20 | docs-system/02-SERVER |
| 07-CONTRACTS | ~15 | docs-governance/06-CONTRACTS |
| 07-POLICIES | ~5 | archive/documentation_legacy/07-POLICIES |
| 08-REPORTS | ~90 | reports/08-REPORTS |
| 09-GOVERNANCE | ~35 | docs-governance/09-GOVERNANCE |
| 10-POLICIES | ~15 | docs-governance/01-POLICIES |
| 90_ARCHITECTS_DOCUMENTATION | ~95 | _COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION |
| 99-ARCHIVE | ~20 | archive/documentation_legacy/99-ARCHIVE |
| logs | ~5 | archive/documentation_legacy/logs |
| OPENAPI_SPEC_V2.yaml | 1 | archive/documentation_legacy |
| **Total** | **~507** | — |

---

## 4) Coverage Statement

- **100% coverage:** Every folder under `documentation/` has a defined target.
- **Zero files without target:** All files inherit folder mapping.
- **No overlap:** Each source path maps to exactly one target; no file in two targets.

---

## 5) Exceptions / Notes

1. **07-POLICIES vs 10-POLICIES:** 10-POLICIES → docs-governance/01-POLICIES; 07-POLICIES retained in legacy (split per original migration spec).
2. **90_ARCHITECTS_DOCUMENTATION:** Moved to _ARCHITECT_INBOX; authority for locked decisions remains `_COMMUNICATION/_Architects_Decisions/`.
3. **OPENAPI_SPEC_V2.yaml:** Root-level; if superseded by contracts in 07-CONTRACTS, archive; otherwise document in cutover plan.

---

**log_entry | TEAM_70 | DOC_MIGRATION_COMPLETENESS_MATRIX_SUBMITTED | 2026-02-17**
