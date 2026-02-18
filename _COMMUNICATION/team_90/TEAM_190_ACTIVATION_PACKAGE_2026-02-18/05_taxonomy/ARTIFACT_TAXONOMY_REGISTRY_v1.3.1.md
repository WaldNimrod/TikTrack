# Artifact Taxonomy Registry v1.3.1

**status:** VALIDATED_BASELINE  
**owner:** Team 90 (compiled for Team 190 activation)  
**date:** 2026-02-18  
**source basis:** active Phoenix governance + active communication artifacts

---

## 1) Purpose

Define the artifact classes Team 190 must validate at Gate 5 and their canonical storage layer.

---

## 2) Canonical artifact classes

| Class | Artifact examples | Canonical location |
|---|---|---|
| Authority anchors | `00_MASTER_INDEX.md`, architect decision files | `00_MASTER_INDEX.md` + `_COMMUNICATION/_Architects_Decisions/` |
| Stage control | `ACTIVE_STAGE.md`, level-2 master lists, work plans | `_COMMUNICATION/team_10/` |
| Implementation completion | team completion reports, completion evidence | `_COMMUNICATION/team_20/`, `_COMMUNICATION/team_30/`, `_COMMUNICATION/team_60/` |
| QA gate evidence | Gate-A QA reports, E2E evidence | `_COMMUNICATION/team_50/` |
| Validation gate evidence | Gate-B validation reports, drift register | `_COMMUNICATION/team_90/` |
| Knowledge consolidation | promotion plans, migration/consolidation outputs | `_COMMUNICATION/team_70/` |
| Procedures and standards | gate protocols, governance standards | `documentation/docs-governance/` |
| Structured reports | artifacts, summaries, execution evidence | `documentation/reports/` |

---

## 3) Naming baseline (observed)

- Team communication artifacts: `TEAM_<team>_...md`
- Validation outputs: `TEAM_90_TO_TEAM_10_...md`
- Governance anchors: stable canonical filenames (no per-stage renaming)

---

## 4) Team 190 validation use

Team 190 must validate that each Gate package contains at least:

1. Authority anchor references
2. Active stage definition
3. One implementation artifact
4. One QA artifact
5. One Team 90 validation artifact
6. One report-layer artifact

If any mandatory class is missing -> Gate 5 BLOCK.

---

**log_entry | TEAM_90 | ARTIFACT_TAXONOMY_REGISTRY_v1_3_1 | PREPARED_FOR_TEAM_190 | 2026-02-18**
