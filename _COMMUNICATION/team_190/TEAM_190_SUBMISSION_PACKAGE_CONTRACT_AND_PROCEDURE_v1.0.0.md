# TEAM_190 — Submission Package Contract and Procedure v1.0.0

**id:** TEAM_190_SUBMISSION_PACKAGE_CONTRACT_AND_PROCEDURE_v1.0.0  
**from:** Team 190 (Constitutional Architectural Validator / Submission Owner)  
**to:** Team 170 (Spec Owner), Team 10, Team 100  
**re:** Contract between Team 170 and Team 190 on submission ownership and originals-only edits  
**date:** 2026-02-20  
**status:** ACTIVE

---

## 1. Contract (חוזה) — Submission ownership and responsibility

### 1.1 Who submits to Architects

- **Team 190** performs submission to the Architect Inbox for **both**:
  - **SPEC (Design/LOD400)** architectural approval submissions, and  
  - **Execution / development process** architectural approval submissions  
- Submissions are based on content prepared by **Team 170** (spec/content) and by **development teams** (execution artifacts as applicable).

### 1.2 Submission package = copy; exclusive responsibility

- The submission package under `_COMMUNICATION/_ARCHITECT_INBOX/<path>/SUBMISSION_vX.Y.Z/` is a **copy** of originals, for the purpose of submission only.
- **Submission files are the exclusive responsibility of Team 190.** No other team may edit files in the submission folder or create submission packages.
- **Team 170** and other teams **must not** create or modify files under `_ARCHITECT_INBOX/.../SUBMISSION_*`.

### 1.3 Content fixes only in originals

- **All content fixes for the submission must be performed in the original files** (e.g. Team 170 content originals, Team 190 validation report originals).
- After originals are corrected or updated, **Team 190** prepares a **new** submission package and **deletes the previous** submission package (same work package / version or as per versioning policy).

### 1.4 Summary table

| Role | Responsibility |
|------|----------------|
| Team 170 | Owner of SPEC content; authoring and correctness; **edits only originals**. |
| Team 190 | Owner of submission package; assembly, metadata, completeness; **only 190 creates/edits submission files**; builds new package from originals and removes old package after fixes. |

---

## 2. Procedure (נוהל) — Building a submission package

1. **Content originals** are maintained by Team 170 (spec, scope, identity block, approval type, declaration) and Team 190 (validation report, package assembly metadata).
2. **Team 190** assembles the submission package by copying from these originals into `_ARCHITECT_INBOX/.../SUBMISSION_vX.Y.Z/`.
3. All 6 (or as required) artifacts in the submission folder must include:
   - `architectural_approval_type` as defined in the content original (e.g. SPEC or EXECUTION).
   - Identity header and gate_id as defined in the content original (e.g. GATE_1 for SPEC approval).
   - Any mandatory declaration block verbatim where required (e.g. COVER_NOTE).
4. If a correction is required (e.g. SPEC vs EXEC semantics), **Team 170 / relevant team** updates the **originals**; **Team 190** then produces a **new** submission package and **deletes** the old one.
5. Team 190 re-issues the formal submission note to the Architect Inbox (corrected) when the new package is ready.

---

## 3. Reference for validation package

When submitting a package for validation or re-approval, include a reference to:
- This contract and procedure: `_COMMUNICATION/team_190/TEAM_190_SUBMISSION_PACKAGE_CONTRACT_AND_PROCEDURE_v1.0.0.md`
- Content original used for the submission (e.g. `_COMMUNICATION/team_170/TEAM_170_CANONICAL_STRUCTURAL_UPDATE_v2.2.0_SUBMISSION_CONTENT_ORIGINAL.md` for v2.2.0 SPEC submission).

---

**log_entry | TEAM_190 | SUBMISSION_PACKAGE_CONTRACT_AND_PROCEDURE_v1.0.0 | 2026-02-20**
