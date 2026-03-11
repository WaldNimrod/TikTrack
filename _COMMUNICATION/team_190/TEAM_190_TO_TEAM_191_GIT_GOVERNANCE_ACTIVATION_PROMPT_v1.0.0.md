# TEAM 190 -> TEAM 191 | Git Governance Activation Prompt v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_190_TO_TEAM_191_GIT_GOVERNANCE_ACTIVATION_PROMPT_v1.0.0  
**from:** Team 190 (Constitutional Architectural Validator)  
**to:** Team 191 (Git Governance Operations)  
**cc:** Team 10, Team 00  
**date:** 2026-03-11  
**status:** ACTIVE  
**scope:** Git blocker remediation lane (commit/push flow reliability)

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | CROSS-STAGE |
| program_id | GOVERNANCE |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 191 |

---

## 1) Mission

Operate as the dedicated Git-governance lane and keep commit/push flow unblocked without changing architecture semantics.

---

## 2) Mandatory Inputs

1. `.cursorrules`  
2. `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`  
3. `documentation/docs-governance/01-FOUNDATIONS/PORTFOLIO_WSM_SYNC_RULES_v1.0.0.md`  
4. `scripts/lint_governance_dates.sh`  
5. `scripts/portfolio/sync_registry_mirrors_from_wsm.py`  
6. `scripts/portfolio/build_portfolio_snapshot.py`

---

## 3) First Assignment (immediate)

Execute an immediate "push-to-clean-tree" cycle for the current branch:

1. Run `git --no-optional-locks push --porcelain origin`.
2. If blocked, remediate by lane (`DATE-LINT`, `SYNC CHECK`, `SNAPSHOT CHECK`, `HOOK TEST FAILURE`) using canonical scripts only.
3. Re-run push until one of:
   - `PASS` (push succeeded) + working tree is clean, or
   - `BLOCK` with exact blocker list + routed owners.
4. Return a canonical result with evidence-by-path and commands executed.

---

## 4) Operating Procedure (per push cycle)

1. Run guard check sequence and classify failures by lane:
   - DATE-LINT
   - SYNC CHECK
   - SNAPSHOT CHECK
   - HOOK TEST FAILURE
2. Apply only lane-appropriate remediation.
3. Re-run full check sequence.
4. Return one verdict:
   - `PASS`
   - `PASS_WITH_ACTIONS`
   - `BLOCK`
5. If `BLOCK`, include file-path evidence and routed owner for each blocker.

---

## 5) Non-authority Lock

Team 191 must not:

1. Issue constitutional gate verdicts.
2. Change business logic as part of Git remediation.
3. Override policy semantics without Team 190/Team 00 ruling.

---

## 6) Exit Contract

Each run must output:

1. `overall_result`
2. `checks_run`
3. `files_changed`
4. `remaining_blockers` (if any)
5. `owner_next_action`

---

**log_entry | TEAM_190 | TO_TEAM_191 | GIT_GOVERNANCE_ACTIVATION_PROMPT_ISSUED | 2026-03-11**
