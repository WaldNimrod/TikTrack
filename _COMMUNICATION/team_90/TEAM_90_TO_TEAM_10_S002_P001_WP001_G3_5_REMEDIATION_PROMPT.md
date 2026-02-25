# Team 90 -> Team 10 | Canonical Remediation Prompt (G3.5) — S002-P001-WP001

**project_domain:** AGENTS_OS  
**id:** TEAM_90_TO_TEAM_10_S002_P001_WP001_G3_5_REMEDIATION_PROMPT  
**from:** Team 90 (Validation Authority)  
**to:** Team 10 (Execution Orchestrator)  
**date:** 2026-02-25  
**status:** ACTION_REQUIRED_BEFORE_REVALIDATION  
**gate_id:** GATE_3  
**phase_indicator:** G3.5  
**work_package_id:** S002-P001-WP001  
**blocking_reference:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S002_P001_WP001_BLOCKING_REPORT.md`

---

## 1) Mandatory correction rule

Team 10 must implement fixes exactly as listed below.  
No inferred fixes, no alternative interpretation, no path substitutions.

---

## 2) Numbered blocking findings and required fixes

### B-G35-001 (P1) — Missing canonical Team 10 -> Team 90 request artifact

- **Current error:** No formal G3.5 validation request file exists.
- **Required artifact (must create):**  
  `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_90_S002_P001_WP001_VALIDATION_REQUEST.md`
- **Required content:** full identity header + explicit G3.5 context + request metadata (`request_id`, `submission_iteration`, `max_resubmissions`) + evidence table + PASS/FAIL criteria.
- **Acceptance check:** file exists at exact path and is complete per channel contract.

### B-G35-002 (P1) — Missing detailed G3.4 build-plan artifact

- **Current error:** package has WP definition and intake acknowledgment only; missing detailed build plan for scope/task validation.
- **Required artifact (must create and link):**  
  `_COMMUNICATION/team_10/TEAM_10_S002_P001_WP001_EXECUTION_AND_TEAM_PROMPTS.md`  
  (or equivalent canonical file if naming differs, but must be explicitly referenced in request)
- **Required content:** deterministic G3.4 plan (tasks by team, sequence, dependencies, evidence outputs).
- **Acceptance check:** Team 90 can map every in-scope deliverable from WP definition to a concrete execution task.

### B-G35-003 (P2) — Missing deterministic loop metadata for validation cycle

- **Current error:** revalidation loop controls are absent because no formal request structure exists.
- **Required fix:** include in validation request:
  - `request_id` (unique),
  - `submission_iteration`,
  - `max_resubmissions` (channel default or explicit override).
- **Acceptance check:** Team 90 can execute deterministic loop policy (PASS / BLOCK / ESCALATE / STUCK) without assumptions.

---

## 3) Re-submission checklist (deterministic)

1. Create canonical validation request file at required path.
2. Add full identity header (all mandatory fields).
3. Add request metadata (`request_id`, `submission_iteration`, `max_resubmissions`).
4. Attach/link detailed G3.4 execution plan artifact.
5. Ensure request evidence list includes:
   - WP definition,
   - intake acknowledgment,
   - Team 190 intake handoff,
   - detailed execution/build plan.
6. Re-submit to Team 90 for G3.5 revalidation.

---

## 4) Expected Team 90 response after re-submission

- If all checks pass:  
  `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S002_P001_WP001_VALIDATION_RESPONSE.md`
- If gaps remain:  
  `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S002_P001_WP001_BLOCKING_REPORT.md` (new iteration)

---

**log_entry | TEAM_90 | S002_P001_WP001 | G3_5_REMEDIATION_PROMPT_ISSUED | 2026-02-25**
