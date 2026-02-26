# PHASE1_AUTHORITY_CLASSIFICATION_MATRIX_v1.0.0
**project_domain:** SHARED (TIKTRACK + AGENTS_OS)

**id:** PHASE1_AUTHORITY_CLASSIFICATION_MATRIX_v1.0.0  
**owner:** Team 10  
**date:** 2026-02-26  
**status:** REMEDIATED_PENDING_TEAM190_REVALIDATION

---

## Classification Model

- `ACTIVE_DECISION_AUTHORITY`: Binding source for gate progression and runtime decisions.
- `ACTIVE_STRUCTURAL_AUTHORITY`: Binding source for structure and navigation, but not runtime state.
- `ACTIVE_MIRROR_ONLY`: Required mirror target for WSM sync; never an origin authority for runtime state.
- `REFERENCE_ONLY`: Useful context, not binding authority.
- `ARCHIVED_CONTEXT`: Historical trace only.

---

## Subject-to-Source Classification (Phase 1)

| Subject | Source | Class |
|---|---|---|
| Runtime state | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` | ACTIVE_DECISION_AUTHORITY |
| Constitutional structure | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md` | ACTIVE_DECISION_AUTHORITY |
| Gate semantics and ownership | `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md` | ACTIVE_DECISION_AUTHORITY |
| Gate 0/1/2 lifecycle contract | `documentation/docs-governance/05-CONTRACTS/GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.0.0.md` | ACTIVE_DECISION_AUTHORITY |
| Portfolio navigation | `documentation/docs-governance/00-INDEX/PORTFOLIO_INDEX.md` | ACTIVE_STRUCTURAL_AUTHORITY |
| Program registry mirror | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` | ACTIVE_MIRROR_ONLY |
| Work package registry mirror | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md` | ACTIVE_MIRROR_ONLY |
| Team communication folders (`_COMMUNICATION/team_*`) | Folder-scoped operational evidence | REFERENCE_ONLY |
| `_COMMUNICATION/90_Architects_comunication/` | Historical architect communication | ARCHIVED_CONTEXT |
| `documentation/docs-governance/99-archive/` | Archive | ARCHIVED_CONTEXT |

---

## Operational Constraint

No new governance policy files may be introduced by this program.
Convergence is executed via path normalization, supersedes markers, and lint controls only.

Runtime-source lock (F-01 closure):
- Runtime state remains single-source in WSM only, per `PORTFOLIO_WSM_SYNC_RULES_v1.0.0.md`.
- Program/WP registries are mirror artifacts and cannot authorize runtime or gate progression.

---

**log_entry | TEAM_10 | PHASE1_AUTHORITY_CLASSIFICATION_MATRIX | F01_REMEDIATED_PENDING_REVALIDATION | 2026-02-26**
