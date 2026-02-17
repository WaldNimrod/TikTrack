# Team 70 | Documentation Migration Cutover Plan v2

**id:** TEAM_70_DOC_MIGRATION_CUTOVER_PLAN_V2  
**owner:** Team 70 (Knowledge Librarian)  
**to:** Team 90 (Validation), Team 10 (Gateway)  
**date:** 2026-02-17  
**context:** TEAM_90_TO_TEAM_70_MODEL_B_LOCKED_CORRECTION_DIRECTIVE  
**status:** Model B EXECUTED — structure under `documentation/`

**Model B (as executed):** Targets under `documentation/`: `documentation/docs-system/`, `documentation/docs-governance/`, `documentation/reports/`. Legacy: `archive/documentation/legacy_documentation_2026-2-17/`.

---

## 1) Prerequisites (Gate)

- [ ] Team 10 approval of Completeness Matrix, Authority Drift Register, this Plan, MASTER_INDEX Draft
- [ ] Team 90 validation (PASS)
- [ ] Cutover order issued by Team 10

**No moves, copies, or archives until Gate is GREEN.**

---

## 2) Order of Operations (Sequential)

### Phase 0 — Freeze
- **Action:** Confirm `documentation/` read-only; no edits by teams.
- **Validation:** Team 90 spot-check.
- **Rollback:** N/A.

### Phase 1 — Create Target Structure
- **Action:** Create empty folders: `docs-system/`, `docs-governance/`, `reports/`, `logs/`, `archive/documentation_legacy/`, `archive/code/`.
- **Validation:** Verify folders exist; `archive/` remains unchanged otherwise.
- **Rollback:** Remove empty folders only.

### Phase 2 — Governance Migration
- **Action:** Copy (not move) content:
  - `documentation/09-GOVERNANCE` → `docs-governance/09-GOVERNANCE`
  - `documentation/10-POLICIES` → `docs-governance/01-POLICIES`
  - `documentation/05-PROCEDURES` → `docs-governance/02-PROCEDURES`
  - `documentation/07-CONTRACTS` → `docs-governance/06-CONTRACTS`
- **Validation:** Diff source vs target; file count match.
- **Rollback:** Delete target copies; source unchanged.

### Phase 3 — System Documentation Migration
- **Action:** Copy content:
  - `documentation/01-ARCHITECTURE` → `docs-system/01-ARCHITECTURE`
  - `documentation/06-ENGINEERING` → `docs-system/02-SERVER`
  - `documentation/03-PRODUCT_&_BUSINESS` → `docs-system/08-PRODUCT`
  - `documentation/04-DESIGN_UX_UI` → `docs-system/07-DESIGN`
- **Validation:** Diff source vs target; file count match.
- **Rollback:** Delete target copies; source unchanged.

### Phase 4 — Reports Separation
- **Action:** Copy content:
  - `documentation/05-REPORTS` → `reports/05-REPORTS`
  - `documentation/08-REPORTS` → `reports/08-REPORTS`
- **Validation:** Diff; file count match.
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
- **Action:** Copy full `documentation/` snapshot → `archive/documentation_legacy/snapshots/YYYY-MM-DD_HHMM/` (immutable legacy snapshot path). **Then** remove `documentation/` from active tree (or rename per Team 10 decision).
- **Snapshot policy:** Immutable destination format `archive/documentation_legacy/snapshots/YYYY-MM-DD_HHMM/` (e.g. `2026-02-17_1430`).
- **Validation:** Full backup in archive; MASTER_INDEX updated.
- **Rollback:** Restore `documentation/` from `archive/documentation_legacy/snapshots/YYYY-MM-DD_HHMM/`; remove archive copy if needed.

### Phase 8 — MASTER_INDEX Update
- **Action:** Publish MASTER_INDEX alignment. Pre-cutover: `00_MASTER_INDEX.md` (repo root) is canonical. If relocating post-cutover: create `docs-governance/00-FOUNDATIONS/00_MASTER_INDEX.md` per Team 10/90 gate.
- **Owner/Gate:** Team 10 (owner), Team 90 (validation).
- **Validation:** Authority chain locked; Team 90 final Gate.

---

## 3) Validation Checkpoints

| Phase | Checkpoint | Owner |
|-------|------------|-------|
| 1 | Folders created; archive untouched | Team 70 |
| 2–5 | Copy integrity (diff, count) | Team 70 |
| 6 | Completeness diff pass | Team 90 |
| 7 | Archive integrity; documentation snapshot preserved | Team 90 |
| 8 | MASTER_INDEX authority chain | Team 90 |

---

## 4) Rollback Strategy

- **Before Phase 7:** Delete copied content in targets only; `documentation/` never modified.
- **After Phase 7:** Restore `documentation/` from `archive/documentation_legacy/`; revert MASTER_INDEX.

---

## 5) Constraints

- No document content modifications during migration (relocation only).
- No file renames (preserve names).
- No ADR modifications.
- `archive/` remains unchanged until Phase 7.

---

**log_entry | TEAM_70 | CUTOVER_PLAN_V2_SUBMITTED | 2026-02-17**
