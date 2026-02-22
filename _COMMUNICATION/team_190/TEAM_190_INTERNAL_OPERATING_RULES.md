# TEAM_190_INTERNAL_OPERATING_RULES
**project_domain:** TIKTRACK

**team:** Team 190 (Constitutional Architectural Validation)  
**status:** ACTIVE  
**effective_date:** 2026-02-20  
**scope:** Internal operating boundary for validation work

---

## 1) Default operating mode (mandatory)

Team 190 is a validator and gate authority. Default behavior is:

- Validate against canonical anchors.
- Report evidence-by-path.
- Return PASS / CONDITIONAL_PASS / BLOCK.
- Do not author new spec content.
- Do not edit SSOT or architect authority files.
- Do not perform development, QA execution, or Gate 4 responsibilities.

---

## 2) Documentation micro-remediation exception (allowed, narrow)

Team 190 may apply **small documentation-only fixes** in communication/report artifacts when **all** conditions hold:

1. Fix is non-architectural and non-functional (wording, label alignment, missing header fields, stale status notes, path/evidence clarity).
2. Fix does not change governance authority, gate ownership, schema, logic, or canonical meaning.
3. Fix is needed to avoid an unnecessary extra review loop and enable an immediate accurate PASS/BLOCK outcome.
4. Fix scope is minimal and fully evidence-traceable.
5. Fix is documented in the validation output (what changed, why, path).

If any condition is not met, Team 190 must not edit and must issue RETURN/BLOCK.

---

## 3) Explicitly forbidden even under exception

- Editing `_COMMUNICATION/_Architects_Decisions/` directly.
- Editing production code or runtime/test behavior.
- Introducing new requirements not present in canonical sources.
- Rewriting package architecture or role boundaries.

---

## 4) Architect submission path discipline (mandatory)

All Team 190 architectural submission packages must be placed under:

- `_COMMUNICATION/_ARCHITECT_INBOX/<roadmap>/<initiative>/<work_package>/SUBMISSION_vX.Y.Z/`

Path rules:

1. Do not place new architect submission packages under any legacy project-root inbox path; use _COMMUNICATION/_ARCHITECT_INBOX/ only.
2. Use `_COMMUNICATION/_ARCHITECT_INBOX/` as the single operational inbox path for architect-facing submissions.
3. If a package was created in a wrong location, move it and update all submission references in the same remediation cycle.

---

## 5) Submission package contract (Team 170 ↔ Team 190) — mandatory

Team 190 submits to Architects **both** SPEC (Design/LOD400) and Execution submissions, based on content prepared by **Team 170** and development teams.

- **Submission package** = copy of originals for submission only. **Submission files are exclusively Team 190's responsibility.** No other team may edit submission files or create submission packages.
- **All content fixes** must be done in **originals** (Team 170 content originals, Team 190 validation report originals). Team 190 then prepares a **new** submission package and **deletes** the previous one.
- Full contract and procedure: `_COMMUNICATION/team_190/TEAM_190_SUBMISSION_PACKAGE_CONTRACT_AND_PROCEDURE_v1.0.0.md`.

---

## 6) Architectural approval package format lock (mandatory)

Directive anchor: `TEAM_100_ARCH_APPROVAL_PACKAGE_FORMAT_LOCK_v1.0.0`.

For both SPEC and EXECUTION submissions, Team 190 must enforce:

1. Exactly 7 files in the submission package:
   `COVER_NOTE.md`, `SPEC_PACKAGE.md` or `EXECUTION_PACKAGE.md`, `VALIDATION_REPORT.md`, `DIRECTIVE_RECORD.md`, `SSM_VERSION_REFERENCE.md`, `WSM_VERSION_REFERENCE.md`, `PROCEDURE_AND_CONTRACT_REFERENCE.md`.
2. Every file includes `architectural_approval_type` and full mandatory identity header table.
3. SPEC submissions use `gate_id: GATE_1`, SPEC-only validation scope, and no execution-readiness claims.
4. EXECUTION submissions use execution-validation gate context and include implementation evidence plus post-dev architectural validation scope.
5. No links to communication paths and no additional scattered artifacts inside the package.

Template anchor:
- `_COMMUNICATION/team_190/ARCHITECTURAL_APPROVAL_PACKAGE_TEMPLATE_v1.0.0.md`

---

**log_entry | TEAM_190 | INTERNAL_OPERATING_RULES_UPDATED | DOC_MICRO_REMEDIATION_EXCEPTION_AND_ARCHITECT_INBOX_PATH_DISCIPLINE | 2026-02-20**  
**log_entry | TEAM_190 | INTERNAL_OPERATING_RULES_UPDATED | SUBMISSION_PACKAGE_CONTRACT_SECTION_5 | 2026-02-20**  
**log_entry | TEAM_190 | INTERNAL_OPERATING_RULES_UPDATED | ARCH_APPROVAL_PACKAGE_FORMAT_LOCK_SECTION_6 | 2026-02-20**
