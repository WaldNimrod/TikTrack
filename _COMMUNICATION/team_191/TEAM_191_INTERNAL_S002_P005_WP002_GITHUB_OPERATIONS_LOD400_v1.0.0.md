# Team 191 — Internal LOD400 | S002-P005-WP002 GitHub Operations Optimization
## TEAM_191_INTERNAL_S002_P005_WP002_GITHUB_OPERATIONS_LOD400_v1.0.0.md

**project_domain:** AGENTS_OS  
**id:** TEAM_191_INTERNAL_S002_P005_WP002_GITHUB_OPERATIONS_LOD400_v1.0.0  
**from:** Team 191 (Git Governance Operations)  
**to:** Team 190 (Constitutional Architectural Validator)  
**cc:** Team 61, Team 100, Team 10, Team 00, Team 51, Team 170  
**date:** 2026-03-14  
**historical_record:** true  
**status:** INTERNAL_PLAN_SUBMITTED_FOR_GATE_1_VALIDATION  
**gate_id:** GATE_1  
**architectural_approval_type:** SPEC  
**spec_version:** 1.0.0  
**source:** TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.0; FAST_TRACK_EXECUTION_PROTOCOL_v1.2.0; GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.1.0; user mandate 2026-03-15 (Hebrew)  
**required_ssm_version:** 1.0.0  
**required_wsm_version:** 1.0.0  
**required_active_stage:** S002  
**phase_owner:** Team 191

---

## §1 Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP002 |
| task_id | TEAM191_GITHUB_WORKFLOW_OPTIMIZATION |
| gate_id | GATE_1 |
| architectural_approval_type | SPEC |
| spec_version | 1.0.0 |
| date | 2026-03-14 |
| source | TEAM_191_INTERNAL_WORK_PROCEDURE; FAST_TRACK_EXECUTION_PROTOCOL_v1.2.0; GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.1.0 |
| required_ssm_version | 1.0.0 |
| required_wsm_version | 1.0.0 |
| required_active_stage | S002 |
| phase_owner | Team 191 |

---

## §2 Program Definition

### §2.1 Objective

Build an execution-grade internal optimization program for Team 191 so GitHub-centric commit/push/merge operations become deterministic, low-friction, and validation-ready under governance constraints.

### §2.2 Scope

In scope:
1. Team 191 operational capability hardening for GitHub PR/CI/comment workflows.
2. Integration of CLI-first diagnostics and remediation loops for merge blockers.
3. Structured command model for bilingual operator prompts (`191 ?`) including advanced lanes (`ci`, `comments`, `doctor`).
4. Fast-track execution plan with Team 61 as implementation owner (AGENTS_OS domain path).

Out of scope:
1. Constitutional gate decisions (Team 190 only).
2. Product business-logic changes under TikTrack runtime.
3. Branch protection policy semantics override (requires Team 190/Team 00 ruling).

### §2.3 Architecture Boundaries

1. Execution domain: AGENTS_OS automation/tooling lane only.
2. Proposed implementation paths restricted to automation/governance/tooling areas:
   - `agents_os_v2/`
   - `_COMMUNICATION/team_191/`
   - helper scripts under `scripts/` (non-business semantic scope)
3. No direct bypass of GitHub branch/rules protections.
4. Existing Team 191 non-authority lock remains active.

### §2.4 Work Package Structure

| WP Slice | Purpose | Owner |
|---|---|---|
| WP002-A | GitHub capability detection and auth diagnostics (`gh` + token fallback) | Team 61 |
| WP002-B | PR checks/logs diagnosis lane (CI failures) | Team 61 |
| WP002-C | PR comments ingestion and response lane | Team 61 |
| WP002-D | Team 191 command model expansion (Hebrew+English aliases + mode contracts) | Team 61 |
| WP002-E | Evidence/report automation and MoV packaging | Team 61 |

### §2.5 Required Artifacts (canonical taxonomy)

| Path | Purpose | WP Slice |
|---|---|---|
| `_COMMUNICATION/team_191/TEAM_191_INTERNAL_S002_P005_WP002_GITHUB_OPERATIONS_LOD400_v1.0.0.md` | This internal LOD400 spec | ALL |
| `_COMMUNICATION/team_191/TEAM_191_TO_TEAM_190_S002_P005_WP002_INTERNAL_LOD400_VALIDATION_REQUEST_v1.0.0.md` | Formal validation request package | ALL |
| `_COMMUNICATION/team_191/TEAM_191_S002_P005_WP002_FAST2_EXECUTION_CLOSEOUT_v1.0.0.md` | FAST_2 closeout (post implementation) | ALL |
| `_COMMUNICATION/team_191/evidence/s002_p005_wp002/` | CI/comments/merge evidence bundle | B,C,E |
| `agents_os_v2/` implementation files (to be finalized in FAST_2) | Automation integration | A-D |

### §2.6 Exit Criteria

1. Team 190 issues PASS on this LOD400 (FAST_1 equivalent validation readiness).
2. Team 61 completes FAST_2 implementation package with deterministic commands and evidence.
3. Team 51 issues FAST_2.5 QA PASS on defined AUTO_TESTABLE criteria.
4. Team 00/authorized human signs FAST_3.
5. Team 170 completes FAST_4 governance closure.

---

## §3 Routing and Execution Flow (Fast Track)

This plan is internal to Team 191 but executed in AGENTS_OS fast-track path:

1. FAST_0: Scope/spec package owner — Team 191 (this document).
2. FAST_1: Validation — Team 190.
3. FAST_2: Implementation — Team 61 (explicitly requested by mandate).
4. FAST_2.5: QA — Team 51.
5. FAST_3: Human sign-off — Team 00 / Nimrod authority path.
6. FAST_4: Knowledge/governance closure — Team 170.

---

## §4 Repo Reality Evidence (as-is baseline)

1. Team 191 procedure lock already exists and is active:
   - `_COMMUNICATION/team_191/TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.0.md`
2. Team 191 currently operates merge flow via GitHub REST + token file (`/tmp/team191_github_token`) and curl/jq chain.
3. Current environment finding: `gh` CLI is not installed (`command not found: gh`).
4. Curated skills inventory includes `gh-fix-ci` and `gh-address-comments`, but they are not installed in active Codex skills root.
5. Existing flow is functional but has avoidable friction on CI failure forensics and PR review-thread handling.

Evidence commands executed (Team 191 pre-plan scan):
1. `gh --version` -> `command not found`
2. `python3 .../list-skills.py --format json` -> curated list includes `gh-fix-ci`, `gh-address-comments`
3. runtime merge/push lane confirmed via existing Team 191 API flow in prior operations

---

## §5 Detailed Requirements (Implementation Contract)

### §5.1 GitHub Capability Layer

R-01: Add deterministic capability check command (`191 doctor` / `191 דוקטור`) that verifies:
1. `gh` binary availability.
2. `gh auth status` validity (if `gh` exists).
3. fallback token availability (`/tmp/team191_github_token`).
4. API connectivity and minimal repo permissions.

R-02: `191 doctor` must return actionable remediation steps in Hebrew + command tokens in English.

### §5.2 CI Failure Lane

R-03: Add `191 ci` / `191 סי-איי` command lane to inspect failing checks for current PR or provided PR number.

R-04: Preferred backend when `gh` available:
1. use `gh-fix-ci` skill workflow,
2. extract failing checks,
3. provide concise failure snippet + run URL,
4. output deterministic fix-plan request.

R-05: If `gh` unavailable, fallback to API mode using current token/curl mechanism and report limitation explicitly.

### §5.3 PR Comment Lane

R-06: Add `191 comments` / `191 תגובות` lane for review-thread ingestion.

R-07: When `gh` available, use `gh-address-comments` workflow to:
1. enumerate open review threads,
2. number them,
3. map each to required code/document action.

R-08: lane output must support selective execution by thread IDs.

### §5.4 Command Model and Bilingual Lock

R-09: Extend `191 ?` menu with new lanes:
1. `191 doctor` / `191 דוקטור`
2. `191 ci` / `191 סי-איי`
3. `191 comments` / `191 תגובות`

R-10: Every command in `191 ?` must appear with Hebrew and English aliases (existing lock remains mandatory).

R-11: Optional payload syntax remains supported:
`191 <command> ? <text>` and Hebrew alias equivalent.

### §5.5 Evidence and Closure

R-12: Every advanced lane must emit canonical closure block:
1. `overall_result`
2. `checks_run`
3. `files_changed`
4. `remaining_blockers`
5. `owner_next_action`

R-13: FAST_2 closeout must include command transcript and evidence-by-path package.

R-14: No lane may bypass branch protection/rulesets.

R-15: No lane may mutate business logic under a Git-remediation label without explicit mandate.

---

## §6 Acceptance Criteria (with Classification)

| AC | Criterion | Class | Verified At |
|---|---|---|---|
| AC-01 | `191 doctor` reports gh availability/auth/token/API readiness deterministically | AUTO_TESTABLE | FAST_2.5 |
| AC-02 | Missing `gh` path returns explicit remediation commands (no silent fail) | AUTO_TESTABLE | FAST_2.5 |
| AC-03 | `191 ci` extracts failing check summary with run URL when failures exist | AUTO_TESTABLE | FAST_2.5 |
| AC-04 | `191 ci` fallback mode works with token-based API path when gh unavailable | AUTO_TESTABLE | FAST_2.5 |
| AC-05 | `191 comments` enumerates PR review threads and numbers them | AUTO_TESTABLE | FAST_2.5 |
| AC-06 | `191 comments` supports selective thread execution flow | AUTO_TESTABLE | FAST_2.5 |
| AC-07 | `191 ?` displays Hebrew+English aliases for all commands including new lanes | AUTO_TESTABLE | FAST_2.5 |
| AC-08 | Optional payload syntax works for new lanes (`?<text>`) | AUTO_TESTABLE | FAST_2.5 |
| AC-09 | Output contract block (overall_result/checks_run/files_changed/remaining_blockers/owner_next_action) appears for lanes | AUTO_TESTABLE | FAST_2.5 |
| AC-10 | No branch-protection bypass path is introduced by new automation lanes | AUTO_TESTABLE | FAST_2.5 |
| AC-11 | Non-authority lock remains explicit in operator outputs where applicable | AUTO_TESTABLE | FAST_2.5 |
| AC-12 | Human validation confirms operator clarity/readability of bilingual help output | HUMAN_ONLY | FAST_3 |

---

## §7 Proposed Deltas (Implementation Targets for Team 61)

| Path | Proposed Delta |
|---|---|
| `agents_os_v2/orchestrator/` | Add Team 191 advanced operation handlers (`doctor`, `ci`, `comments`) |
| `_COMMUNICATION/team_191/TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.0.md` | Update command lock and bilingual map with new lanes |
| `scripts/` (Team 61 approved path) | Add deterministic helper scripts for CI/comments diagnostics |
| `_COMMUNICATION/team_191/evidence/s002_p005_wp002/` | Add structured evidence artifacts per run |

Note: exact file-level implementation contract will be finalized in FAST_2 activation prompt after Team 190 PASS.

---

## §8 Risk Register

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| RSK-01 | `gh` absent on operator machine causes lane degradation | HIGH | enforce `191 doctor` precheck + fallback API lane |
| RSK-02 | Missing scopes in `gh auth` or PAT create partial failures | HIGH | deterministic permission diagnostics + remediation instructions |
| RSK-03 | Over-automation may blur governance boundaries | HIGH | explicit non-authority guards in command outputs |
| RSK-04 | CI provider heterogeneity (non-GitHub Actions checks) | MEDIUM | scope strictly to GitHub Actions; external checks reported as URL-only |
| RSK-05 | Command surface growth reduces operator clarity | MEDIUM | bilingual structured `191 ?` table + mode descriptions |
| RSK-06 | Evidence sprawl in communication folders | MEDIUM | canonical evidence path + closeout cleanup discipline |

---

## §9 Validation Package Contract (to Team 190)

Team 190 validation package for this internal LOD400 must verify:
1. LOD400 structure completeness (identity, scope, deltas, AC classification).
2. Alignment with Team 191 authority boundaries.
3. Fast-track routing correctness with Team 61 as FAST_2 executor.
4. No governance semantic override embedded in automation scope.

---

## §10 No Guessing Declaration

All claims in this plan are grounded in active governance documents and in-repo runtime findings:
1. `TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.0.md`
2. `TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`
3. `FAST_TRACK_EXECUTION_PROTOCOL_v1.2.0.md`
4. `GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.1.0.md`
5. environment evidence (`gh` absence and curated skills availability) collected during this planning turn.

No policy-semantic override is proposed.

---

**log_entry | TEAM_191 | S002_P005_WP002_INTERNAL_LOD400 | v1.0.0_SUBMITTED_FOR_GATE_1_VALIDATION | 2026-03-14**
