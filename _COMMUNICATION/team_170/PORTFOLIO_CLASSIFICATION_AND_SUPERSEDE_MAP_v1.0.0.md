# PORTFOLIO_CLASSIFICATION_AND_SUPERSEDE_MAP_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**from:** Team 170  
**date:** 2026-02-23  
**directive:** TEAM_190_TO_TEAM_170_PORTFOLIO_CANONICALIZATION_MIGRATION_WORK_PACKAGE_v1.0.0

---

## 1) Classification categories

- **CANONICAL_KEEP:** קובץ נשאר מקור פעיל; עדכון boundary/scope בלבד אם רלוונטי.
- **MIGRATE_AND_SUPERSEDE:** תוכן Portfolio הועבר ליעד קנוני; במסמך המקור נוסף pointer/superseded.
- **ARCHIVE_HISTORICAL:** לא מקור פעיל; סומן לארכיון או להשארה כהיסטורי (ללא שינוי נתיב במסגרת מיגרציה זו).

---

## 2) Full classification matrix (by path)

| Path | Classification | Note |
|------|----------------|------|
| `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` | CANONICAL_KEEP | boundary text added |
| `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md` | CANONICAL_KEEP | boundary text added |
| `documentation/docs-governance/00_MASTER_DOCUMENTATION_TABLE_v1.0.0.md` | CANONICAL_KEEP | rows added for Portfolio |
| `documentation/docs-governance/00-INDEX/GOVERNANCE_PROCEDURES_INDEX.md` | CANONICAL_KEEP | Portfolio link + list |
| `documentation/docs-governance/00-INDEX/GOVERNANCE_PROCEDURES_SOURCE_MAP.md` | CANONICAL_KEEP | rows 345–349 |
| `_COMMUNICATION/_Architects_Decisions/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md` | MIGRATE_AND_SUPERSEDE | Stage catalog → PHOENIX_PORTFOLIO_ROADMAP; doc keeps narrative + Level-2 links |
| `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md` | CANONICAL_KEEP | Task-level scope lock; no Portfolio SSOT here |
| `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST_PROTOCOL.md` | CANONICAL_KEEP | ibid |
| `_COMMUNICATION/team_10/TEAM_10_LEVEL2_LISTS_REGISTRY.md` | CANONICAL_KEEP | ibid |
| `_COMMUNICATION/team_10/TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST.md` | CANONICAL_KEEP | ibid |
| `documentation/docs-governance/00-INDEX/PORTFOLIO_INDEX.md` | NEW_CANONICAL | — |
| `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md` | NEW_CANONICAL | — |
| `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` | NEW_CANONICAL | — |
| `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md` | NEW_CANONICAL | — |
| `documentation/docs-governance/01-FOUNDATIONS/PORTFOLIO_WSM_SYNC_RULES_v1.0.0.md` | NEW_CANONICAL | — |
| `_COMMUNICATION/team_10/ACTIVE_STAGE.md` | ARCHIVE_HISTORICAL | Snapshot; not active SSOT (per Conflict Map) |
| `_COMMUNICATION/team_100/DEV_OS_TARGET_MODEL_CANONICAL_v1.3.1/10_ACTIVE_STAGE_REFERENCE.md` | ARCHIVE_HISTORICAL | Snapshot |
| `_COMMUNICATION/team_100/ARCHITECT_SUBMISSION_BUNDLE_*/ACTIVE_STAGE.md` | ARCHIVE_HISTORICAL | NOT CANONICAL snapshot |

---

## 3) Supersede / pointer map

| Original / kept doc | Points to (canonical) |
|---------------------|------------------------|
| PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1 | PORTFOLIO_INDEX, PHOENIX_PORTFOLIO_ROADMAP_v1.0.0 (Stage catalog) |
| WSM | PORTFOLIO_INDEX, PORTFOLIO_WSM_SYNC_RULES (boundary) |
| SSM | Portfolio boundary — state only in WSM |
| Team 10 Level-2 files | Portfolio SSOT: WSM + Portfolio registries (PORTFOLIO_INDEX) |

---

**log_entry | TEAM_170 | PORTFOLIO_CLASSIFICATION_AND_SUPERSEDE_MAP | v1.0.0 | 2026-02-23**
