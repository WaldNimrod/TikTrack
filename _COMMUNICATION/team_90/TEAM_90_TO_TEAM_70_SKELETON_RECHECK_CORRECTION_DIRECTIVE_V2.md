# Team 90 -> Team 70 | PHOENIX_DOCS_TREE_SKELETON Recheck — Correction Directive V2

**from:** Team 90 (External Validation Unit)  
**to:** Team 70 (Knowledge Librarian)  
**cc:** Team 10 (Gateway), Architect  
**date:** 2026-02-17  
**status:** ACTION REQUIRED (BLOCK remains)  
**subject:** Mandatory corrections after skeleton recheck

---

## 1) Recheck Result

Root skeleton folders now exist (`docs-system`, `docs-governance`, `reports`, `logs`, `archive`, `_COMMUNICATION`), but cutover is still **not closure-ready**.

---

## 2) Blocking Gaps

### P1 — Duplicate active structures remain
- `documentation/docs-system/`, `documentation/docs-governance/`, and `documentation/reports/` are still present and populated.
- This violates "no active nested canonical layers" after cutover.

### P1 — Legacy archive path not aligned to skeleton
- Legacy snapshot exists in `archive/documentation_legacy/snapshots/2026-02-17_0000/`.
- Skeleton requires archive namespace under `archive/documentation_legacy/`.
- Current `archive/documentation_legacy/` is empty.

### P1 — Required Team 90 deliverables from previous directive are missing
Missing files:
1. `TEAM_70_DOCS_TREE_SKELETON_ALIGNMENT_REPORT.md`
2. `TEAM_70_DOCS_TREE_PRE_POST_DIFF.md`
3. `TEAM_70_REPORTS_RECLASSIFICATION_MAP.md`
4. `TEAM_70_COMMUNICATION_EXCEPTIONS_REGISTER.md`
5. `TEAM_70_ARCHIVE_SNAPSHOT_EVIDENCE.md`

### P2 — Reports classification evidence incomplete
- `reports/qa` and `reports/development` are populated, but no submitted reclassification map proves policy-based assignment into `qa/development/architecture/performance`.

---

## 3) Mandatory Fixes

1. **De-activate nested canonical folders under `documentation/`**
   - Move/archive/remove:
     - `documentation/docs-system/`
     - `documentation/docs-governance/`
     - `documentation/reports/`
   - Keep no active duplicate canonical roots.

2. **Normalize legacy archive path**
   - Place legacy snapshot under:
     - `archive/documentation_legacy/snapshots/YYYY-MM-DD_HHMM/`
   - If keeping existing path, add explicit approved exception (Team 10 + Architect) in exceptions register.

3. **Submit missing 5 deliverables**
   - Generate the exact files listed in Section 2 (P1).

4. **Submit reports mapping proof**
   - For each file moved from legacy reports, provide target bucket:
     - `reports/qa` / `reports/development` / `reports/architecture` / `reports/performance`.

5. **Submit pre/post structure diff**
   - Before/after tree snapshots and file counts by top folder.

---

## 4) Acceptance Criteria for PASS

- No active `documentation/docs-*` and no active `documentation/reports`.
- Legacy snapshot policy aligned or approved exception documented.
- All 5 required deliverables submitted.
- Reports reclassification map is complete and auditable.
- Team 90 spot-check passes with zero P1 findings.

---

**log_entry | TEAM_90 | TO_TEAM_70 | SKELETON_RECHECK_CORRECTION_DIRECTIVE_V2 | 2026-02-17**
