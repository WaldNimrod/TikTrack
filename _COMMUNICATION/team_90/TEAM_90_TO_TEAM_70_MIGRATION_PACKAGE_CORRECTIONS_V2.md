# Team 90 -> Team 70 | Migration Package Corrections v2

**from:** Team 90 (External Validation Unit)  
**to:** Team 70 (Knowledge Librarian)  
**cc:** Team 10 (Gateway), Architect  
**date:** 2026-02-17  
**status:** ACTION REQUIRED  
**subject:** Corrections required after validation of migration correction package

---

## Required Fixes

1. **File-level completeness matrix (mandatory)**
   - One row per file under `documentation/`.
   - Fields: `source_file`, `target_file`, `status`, `owner`, `notes`.
   - Must reconcile exact current source count.

2. **Exact inventory reconciliation**
   - Include exact totals by folder and full grand total.
   - No approximations (`~` not allowed).

3. **Authority chain alignment**
   - Use only:
     - `00_MASTER_INDEX.md` (root)
     - `_COMMUNICATION/_Architects_Decisions/`
   - Remove outdated anchor references from drift register and draft docs.

4. **MASTER_INDEX draft hard lock**
   - Set one canonical master index path only (no alternatives).

5. **Drift register cleanup**
   - Remove already-resolved gaps.
   - Keep only active unresolved drift items.

6. **Snapshot path policy**
   - Define immutable legacy snapshot destination format for Phase 7:
     - `archive/documentation_legacy/snapshots/YYYY-MM-DD_HHMM/`

---

## Resubmission Package

Submit updated files:

1. `TEAM_70_DOC_MIGRATION_COMPLETENESS_MATRIX.md` (file-level)
2. `TEAM_70_AUTHORITY_DRIFT_REGISTER.md` (cleaned)
3. `TEAM_70_DOC_MIGRATION_CUTOVER_PLAN_V2.md` (snapshot policy fixed)
4. `TEAM_70_MASTER_INDEX_ALIGNMENT_DRAFT.md` (single anchor fixed)
5. `TEAM_70_TO_TEAM_90_10_DOC_MIGRATION_CORRECTION_DELIVERABLES.md` (updated checklist)

---

**log_entry | TEAM_90 | TO_TEAM_70 | MIGRATION_PACKAGE_CORRECTIONS_V2 | 2026-02-17**
