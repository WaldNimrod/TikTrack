# AOS_SUBMISSION_PACK_SPEC_v1.0.0
project_domain: AGENTS_OS
status: LOCKED_SPEC
version: 1.0.0
last_updated: 2026-02-22
owner: Team 100
applies_to: Team 10 (pack assembly), Team 90/50/190/70 (contributors)

---

## 0) Purpose

Standardize the **Execution Submission Pack** produced from sandbox workspaces prior to human approval.

Pack location (inside workspace):
`agents_os/_workspaces/<work_package_id>/<workspace_id>/_SUBMISSION/`

---

## 1) Mandatory Files (EXECUTION submission)

1. `COVER_NOTE.md`
   - architectural_approval_type: EXECUTION
   - gate_id: GATE_6
   - roadmap_id, stage_id, program_id, work_package_id
   - project_domain: AGENTS_OS
   - reference_to_spec_version
   - ssm_version, wsm_version
   - workspace_id
   - branch_name
   - commit_hashes (range)

2. `EXECUTION_SUMMARY.md`
   - What was implemented
   - Deviations from SPEC (if any)
   - Risk notes
   - Operational notes (how to run)

3. `DIFF_SUMMARY.md`
   - File list changed
   - High-level changes per file
   - Generated automatically if possible

4. `DEV_VALIDATION_REPORT.md` (Team 90)
   - Gate 4 status PASS/FAIL
   - Evidence pointers

5. `QA_REPORT.md` (Team 50)
   - Gate 5 status PASS/FAIL
   - Evidence pointers

6. `KNOWLEDGE_PROMOTION_REPORT.md` (Team 70)
   - Promotion actions executed
   - Canonical locations updated
   - Archive actions completed (if applicable)

7. `PROCESS_LOG_REFERENCE.md`
   - Links to communication artifacts relevant to this WP
   - Loop counts & escalations

---

## 2) Mandatory Evidence Folder

`_EVIDENCE/` MUST contain:
- `TEST_RUNS/` (stdout/stderr logs, timestamps)
- `RUNBOOK_PROOF/` (proof of run command executed)
- `CHECKSUMS/` (optional)

No screenshots.

---

## 3) Forbidden

- Copying canonical SSM/WSM into submission pack as new canon
- Claims of SPEC approval inside EXECUTION pack
- Mixed-domain artifacts

---

END OF SPEC
