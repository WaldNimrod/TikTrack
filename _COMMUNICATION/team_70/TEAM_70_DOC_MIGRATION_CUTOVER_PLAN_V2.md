# Team 70 | Documentation Migration Cutover Plan v2
**project_domain:** TIKTRACK

**id:** TEAM_70_DOC_MIGRATION_CUTOVER_PLAN_V2  
**owner:** Team 70 (Knowledge Librarian)  
**to:** Team 90 (Validation), Team 10 (Gateway)  
**date:** 2026-02-17  
**context:** TEAM_90_TO_TEAM_70_MODEL_B_FINAL_CORRECTIONS_V4  
**status:** Model B EXECUTED — structure under `documentation/`

**Model B only.** All paths under `documentation/`. No root-level `docs-system/`, `docs-governance/`, `reports/`.

---

## 1) Prerequisites (Gate)

- [ ] Team 10 approval of Completeness Matrix, Authority Drift Register, this Plan, MASTER_INDEX Draft
- [ ] Team 90 validation (PASS)
- [ ] Cutover order issued by Team 10

**No moves, copies, or archives until Gate is GREEN.**

---

## 2) Order of Operations (Sequential) — Model B

### Phase 0 — Freeze
- **Action:** Confirm `documentation/` read-only; no edits by teams.
- **Validation:** Team 90 spot-check.
- **Rollback:** N/A.

### Phase 1 — Create Target Structure (Model B)
- **Action:** Create empty folders under `documentation/`:
  - `documentation/docs-system/`
  - `documentation/docs-governance/`
  - `documentation/reports/`
  - `archive/documentation/legacy_documentation_YYYY-MM-DD/` (or policy path)
  - `archive/code/`
- **Validation:** Verify folders exist; `archive/` remains unchanged otherwise.
- **Rollback:** Remove empty folders only.

### Phase 2 — Governance Migration (Model B)
- **Action:** Copy (not move) content:
  - `documentation/09-GOVERNANCE` → `documentation/docs-governance/09-GOVERNANCE`
  - `documentation/10-POLICIES` → `documentation/docs-governance/01-POLICIES`
  - `documentation/05-PROCEDURES` → `documentation/docs-governance/02-PROCEDURES`
  - `documentation/07-CONTRACTS` → `documentation/docs-governance/06-CONTRACTS`
- **Validation:** Diff source vs target; file count match.
- **Rollback:** Delete target copies; source unchanged.

### Phase 3 — System Documentation Migration (Model B)
- **Action:** Copy content:
  - `documentation/01-ARCHITECTURE` → `documentation/docs-system/01-ARCHITECTURE`
  - `documentation/06-ENGINEERING` → `documentation/docs-system/02-SERVER`
  - `documentation/03-PRODUCT_&_BUSINESS` → `documentation/docs-system/08-PRODUCT`
  - `documentation/04-DESIGN_UX_UI` → `documentation/docs-system/07-DESIGN`
- **Validation:** Diff source vs target; file count match.
- **Rollback:** Delete target copies; source unchanged.

### Phase 4 — Reports Separation (Model B)
- **Action:** Copy content (per reports policy — e.g. last 48h to active):
  - `documentation/05-REPORTS` → `documentation/reports/05-REPORTS`
  - `documentation/08-REPORTS` → `documentation/reports/08-REPORTS`
- **Validation:** Diff; file count match per policy.
- **Rollback:** Delete target copies; source unchanged.

### Phase 5 — Architect Submission Channel
- **Action:** Copy `documentation/90_ARCHITECTS_DOCUMENTATION` → `_COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION`.
- **Validation:** Diff; architect decisions authority unchanged (_Architects_Decisions).
- **Rollback:** Remove copied folder from _ARCHITECT_INBOX.

### Phase 6 — Completeness Verification
- **Action:** Run diff (source vs migrated structure) per Completeness Matrix.
- **Validation:** 100% coverage; zero files without target; Team 90 sign-off.
- **Rollback:** N/A; verification only.

### Phase 7 — Archive Legacy (ONLY AFTER VALIDATION)
- **Action:** Copy full legacy content to archive. Actual path used: `archive/documentation_legacy/snapshots/2026-02-17_0000/` (or policy path `archive/documentation_legacy/snapshots/YYYY-MM-DD_HHMM/` per approval).
- **Model B:** `documentation/` remains as canonical parent with `docs-system`, `docs-governance`, `reports`. Legacy snapshot is immutable copy.
- **Validation:** Full backup in archive; MASTER_INDEX updated.
- **Rollback:** Restore from archive; remove archive copy if needed.

### Phase 8 — MASTER_INDEX Update
- **Action:** Publish MASTER_INDEX alignment. `00_MASTER_INDEX.md` (repo root) canonical. Paths reference `documentation/docs-system/`, `documentation/docs-governance/`, `documentation/reports/`.
- **Owner/Gate:** Team 10 (owner), Team 90 (validation).
- **Validation:** Authority chain locked; Team 90 final Gate.

---

## 3) Validation Checkpoints

| Phase | Checkpoint | Owner |
|-------|------------|-------|
| 1 | Folders created under documentation/ | Team 70 |
| 2–5 | Copy integrity (diff, count) | Team 70 |
| 6 | Completeness diff pass | Team 90 |
| 7 | Archive integrity; legacy snapshot preserved | Team 90 |
| 8 | MASTER_INDEX authority chain | Team 90 |

---

## 4) Rollback Strategy

- **Before Phase 7:** Delete copied content in targets only; `documentation/` source unchanged.
- **After Phase 7:** Restore from `archive/documentation_legacy/snapshots/2026-02-17_0000/` (or policy path); revert MASTER_INDEX.

---

## 5) Constraints

- No document content modifications during migration (relocation only).
- No file renames (preserve names).
- No ADR modifications.
- Model B paths only; no root-level docs folders.

---

**log_entry | TEAM_70 | CUTOVER_PLAN_V2_MODEL_B | 2026-02-17**
