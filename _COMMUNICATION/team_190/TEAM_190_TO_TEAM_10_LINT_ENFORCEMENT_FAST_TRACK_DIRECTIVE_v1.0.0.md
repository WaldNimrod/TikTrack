# TEAM_190_TO_TEAM_10_LINT_ENFORCEMENT_FAST_TRACK_DIRECTIVE_v1.0.0
**project_domain:** SHARED (TIKTRACK + AGENTS_OS)

**id:** TEAM_190_TO_TEAM_10_LINT_ENFORCEMENT_FAST_TRACK_DIRECTIVE_v1.0.0  
**from:** Team 190 (Constitutional Architectural Validator)  
**to:** Team 10 (Gateway Orchestration)  
**cc:** Team 60 (DevOps), Team 00, Team 100, Team 170  
**date:** 2026-02-26  
**status:** ACTION_REQUIRED  
**gate_id:** GOVERNANCE_PROGRAM  
**program_id:** S002-P001  
**execution_mode:** FAST_TRACK_EXCEPTION (ONE_TIME)

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P001 |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1) Directive and Exception Lock

This is a formal execution directive for lint enforcement hardening.

Execution is approved under a **one-time fast-track exception**:

1. No full Work Package is opened for this activity.
2. Scope is implementation-only (no governance redesign).
3. Exception is valid for this action only and does not become a precedent.
4. Exception is executed under architectural approval and chief-manager approval.

---

## 2) Locked Decisions to Implement

1. Branch protection/lint blocking applies to the active mainline only (`main`), not `phoenix-dev` (backup branch).
2. Enforcement policy is strict: zero-warning gate for configured linters.
3. CI runs **check-only** (no auto-fix, no code-writing mutations in CI).
4. Local auto-fix is allowed manually only when CI fails.
5. Docs/governance bootstrap lint must be part of CI checks, not documentation-only evidence.

---

## 3) Execution Scope

In scope:

1. Wire `scripts/lint_source_authority_bootstrap_paths.sh` into CI.
2. Add/align code lint checks per active domains with deterministic pass/fail outputs.
3. Configure required checks on `main` so merge is blocked on lint failure.
4. Keep runtime overhead low via path filtering and check-only flow.

Out of scope:

1. Any SSM/WSM semantic change.
2. Any new governance layer or additional policy documents.
3. Any CI auto-commit or auto-fix behavior.

---

## 4) Team Action Matrix

| Team | Mandatory action |
|---|---|
| Team 10 | Orchestrate implementation, own final integration, publish completion report + evidence paths. |
| Team 60 | Implement/update GitHub Actions and branch-protection check mapping under Team 10 instruction. |
| Team 190 | Validate final result against this directive and issue PASS/FAIL. |

---

## 5) Required Deliverables (from Team 10)

Publish under `_COMMUNICATION/team_10/`:

1. `TEAM_10_LINT_ENFORCEMENT_FAST_TRACK_EXECUTION_REPORT_v1.0.0.md`
2. `TEAM_10_LINT_ENFORCEMENT_FAST_TRACK_EVIDENCE_BY_PATH_v1.0.0.md`
3. `TEAM_10_TO_TEAM_190_LINT_ENFORCEMENT_FAST_TRACK_VALIDATION_REQUEST_v1.0.0.md`

Mandatory evidence sections:

1. Workflow file paths and trigger definitions.
2. CI run URLs (at least one PASS and one FAIL sample).
3. Proof that CI does not modify repository files.
4. Proof that `main` merge is blocked on lint failure.
5. Proof that `phoenix-dev` is excluded from required-check policy.

### 5.1 Mandatory Team 60 return package (validation evidence)

Team 60 must return implementation evidence under `_COMMUNICATION/team_60/`:

1. `TEAM_60_LINT_ENFORCEMENT_FAST_TRACK_IMPLEMENTATION_REPORT_v1.0.0.md`
2. `TEAM_60_LINT_ENFORCEMENT_FAST_TRACK_CI_EVIDENCE_v1.0.0.md`

Minimum required content:

1. Final workflow path(s) and exact trigger matrix.
2. Executed run list (PASS + FAIL) with URLs and timestamps.
3. Proof CI mode is check-only (no write-back, no auto-commit).
4. Branch protection mapping evidence for `main` required checks.
5. Explicit note that `phoenix-dev` is out of enforcement scope (backup branch).

---

## 6) Acceptance Criteria (Team 190 PASS Gate)

PASS only if all are true:

1. Bootstrap lint script is executed by CI, not only manually.
2. Code lint checks run in CI for configured active domains.
3. Check-only behavior confirmed (no auto-fix commit/push from CI).
4. Required checks block merge on `main` when lint fails.
5. No impact on backup branch policy (`phoenix-dev` not enforced).
6. No governance semantic drift introduced.

---

## 7) Execution Sequence

1. Team 10 activates Team 60 for implementation using this Team 190 directive as binding source.
2. Team 60 implements workflow/protection configuration.
3. Team 60 submits mandatory return package (Section 5.1) to Team 10.
4. Team 10 executes dry-run validation (PASS/FAIL simulations), consolidates Team 10 + Team 60 evidence.
5. Team 10 submits validation request to Team 190.
6. Team 190 issues final validation result: PASS / CONDITIONAL_PASS / FAIL.

---

**log_entry | TEAM_190 | LINT_ENFORCEMENT_FAST_TRACK_DIRECTIVE | ACTION_REQUIRED_ONE_TIME_EXCEPTION | 2026-02-26**
