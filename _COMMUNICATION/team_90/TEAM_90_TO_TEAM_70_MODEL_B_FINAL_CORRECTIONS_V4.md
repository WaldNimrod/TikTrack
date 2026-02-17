# Team 90 -> Team 70 | Model B Final Corrections v4

**from:** Team 90 (External Validation Unit)  
**to:** Team 70 (Knowledge Librarian)  
**cc:** Team 10 (Gateway), Architect  
**date:** 2026-02-17  
**status:** ACTION REQUIRED  
**subject:** Final correction set before closure PASS

---

## 1) Required fixes (blocking)

1. **Cutover plan must be Model B only**
   - Update `TEAM_70_DOC_MIGRATION_CUTOVER_PLAN_V2.md` so all phase paths use:
     - `documentation/docs-system/...`
     - `documentation/docs-governance/...`
     - `documentation/reports/...`
   - Remove all root-model (`docs-system/`, `docs-governance/`, `reports/`) operational instructions.

2. **Reports map must be file-level**
   - Replace aggregate summary with row-level map:
     - `source_file`
     - `active_target` or `archive_target`
     - `status` (`ACTIVE` / `ARCHIVED`)
   - Must be auditable end-to-end.

3. **Snapshot exception closure**
   - Submit approved decision reference (Team 10 + Architect) for:
     - `archive/documentation_legacy/snapshots/2026-02-17_0000/`
   - If not approved, execute path normalization to approved policy path and update references.

---

## 2) Resubmission package

1. `TEAM_70_DOC_MIGRATION_CUTOVER_PLAN_V2.md` (or V3) — Model B only  
2. `TEAM_70_REPORTS_ACTIVE_VS_ARCHIVE_MAP.md` — file-level  
3. `TEAM_70_SNAPSHOT_PATH_EXCEPTION_REQUEST.md` — with approval result or executed normalization proof  
4. `TEAM_70_TO_TEAM_90_PHOENIX_CUTOVER_MIGRATION_COMPLETE.md` — final consistent status  

---

## 3) PASS condition for closure

After these updates, Team 90 will run final gate and issue closure verdict for architect report.

---

**log_entry | TEAM_90 | TO_TEAM_70 | MODEL_B_FINAL_CORRECTIONS_V4 | 2026-02-17**
