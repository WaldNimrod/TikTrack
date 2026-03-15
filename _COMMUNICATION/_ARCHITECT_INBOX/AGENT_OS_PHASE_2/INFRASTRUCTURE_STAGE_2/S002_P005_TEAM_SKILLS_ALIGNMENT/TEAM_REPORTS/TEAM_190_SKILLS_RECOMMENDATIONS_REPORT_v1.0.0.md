---
project_domain: SHARED (TIKTRACK + AGENTS_OS)
id: TEAM_190_SKILLS_RECOMMENDATIONS_REPORT_v1.0.0
from: Team 190 (Constitutional Validator)
to: Team 190, Team 100, Team 00
cc: Team 10, Team 170, Nimrod
date: 2026-03-15
status: SUBMITTED_FOR_ARCH_REVIEW
in_response_to: TEAM_190_TO_ALL_TEAMS_SKILLS_DISCOVERY_SUBMISSION_PROMPT_v1.0.0
scope: Team 190 skill recommendations for constitutional validation speed, quality, and token efficiency
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | N/A |
| task_id | TEAM_SKILLS_DISCOVERY_AND_SUBMISSION |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 190 |

## 1) Team Context

| Dimension | Value |
|---|---|
| Operating domain(s) | Cross-domain constitutional validation for TIKTRACK, AGENTS_OS, and SHARED programs |
| Primary toolchain/runtime | Codex/Cursor agent runtime; markdown governance artifacts; WSM, program registry, WP registry, architect directives, validation packages |
| Primary activities | GATE_0-GATE_2 validation, identity/header integrity checks, domain-boundary checks, evidence-by-path verification, blocking-report issuance |
| Recurring blockers | (1) Stale prompts or snapshots causing false state reads. (2) Date/header drift causing avoidable BLOCKs. (3) Weak evidence chains that require manual path+line reconstruction. (4) Domain/routing drift between Team 00, Team 100, Team 170, Team 190, and Team 191 responsibilities. |

Concrete examples from current execution reality:
- `S001-P002-WP001` required repeated GATE_0 review because prompt state said `Active stage: unknown` while canonical WSM and activation directive had to be checked manually.
- `S002-P005-WP001` GATE_1 validation blocked on a future-dated LLD400 and later on an incomplete UI contract, both found through manual section-by-section inspection.
- IDEA pipeline revalidation needed a second loop only to normalize archived `OPEN` statuses to `MIGRATED_TO_IDEA_LOG`, which is a machine-detectable drift pattern.

## 2) Skill Options Table

| # | Option name | What it solves | Benefits | Risks / tradeoffs | Impact level | Implementation effort | Token-saving estimate |
|---|---|---|---|---|---|---|---|
| T190-01 | Constitutional package linter | Validates required headers, `in_response_to`, `supersedes`, mandatory sections, and output-contract fields before Team 190 review begins | Prevents technical BLOCKs on format defects; shortens first-pass review | Must stay aligned with evolving templates and gate contracts | HIGH | MEDIUM | HIGH |
| T190-02 | Evidence-by-path builder | Builds candidate evidence tables with canonical file paths and exact line anchors from cited findings | Faster, more defensible verdicts; fewer vague findings; better architect traceability | Wrong heuristics can over-select nearby lines and require human correction | HIGH | MEDIUM | HIGH |
| T190-03 | Date-governance verifier | Compares artifact header dates, log entries, WSM stage dates, and request timestamps | Eliminates repeated future-date and stale-date defects like the `S002-P005-WP001` LLD400 block | Can over-block historical/archive documents without an archive exception model | HIGH | LOW | MEDIUM |
| T190-04 | Stage/activation resolver | Checks whether apparent stage mismatches are truly invalid or explicitly authorized by architect directive | Prevents false blockers in deferred or parallel activations such as `S001-P002-WP001` during `S002` era | Needs directive registry coverage to avoid missed exemptions | HIGH | MEDIUM | MEDIUM |
| T190-05 | Domain-boundary and owner validator | Confirms path/domain isolation and allowed team ownership per role map, gate, and program | Reduces TikTrack vs AGENTS_OS leakage and owner drift between Team 00/100/170/190/191 | Governance changes require upkeep; false positives early on | HIGH | MEDIUM | MEDIUM |
| T190-06 | Drift-and-supersession detector | Detects stale prompts, obsolete package versions, conflicting `v1.0.0` vs `v1.0.1+`, and archived-but-still-referenced files | Lowers revalidation loops caused by reading stale artifacts first | Can generate noise if supersession conventions are inconsistent | MEDIUM | MEDIUM | HIGH |
| T190-07 | Token-lean verdict composer | Produces compact findings-first PASS/BLOCK outputs from validated inputs and evidence tables | Reduces token cost on repetitive constitutional checks and keeps output deterministic | Over-compression can hide rationale if not paired with evidence links | MEDIUM | LOW | HIGH |

## 3) Priority Recommendation (Top 3)

Immediate wins:
1. `T190-01 Constitutional package linter` — highest immediate return because many loops are technical contract failures, not substantive constitutional disputes.
2. `T190-03 Date-governance verifier` — low effort and directly addresses repeated date drift findings already seen in active validations.
3. `T190-02 Evidence-by-path builder` — large speed and token gain because Team 190 repeatedly reconstructs path+line proof manually.

Medium-term investments:
1. `T190-04 Stage/activation resolver`
2. `T190-05 Domain-boundary and owner validator`
3. `T190-06 Drift-and-supersession detector`

## 4) Dependencies and Prerequisites

| Dependency / prerequisite | Owner | Notes |
|---|---|---|
| Stable gate output contracts and mandatory header schemas | Team 170 | Needed for `T190-01` and `T190-07` |
| Canonical role map and gate ownership rules | Team 170 + Team 00 | Needed for `T190-05` |
| WSM, program registry, and WP registry path stability | Team 170 | Needed for `T190-03` and `T190-04` |
| Activation/directive index for architect exceptions | Team 00 + Team 170 | Needed so `T190-04` does not produce false blockers |
| Git/date remediation support lane | Team 191 | Natural execution partner for date and drift automation |

## 5) Suggested Owner per Option

| Option | Suggested owner |
|---|---|
| T190-01 Constitutional package linter | Team 170 (schema) + Team 190 (validation rules) |
| T190-02 Evidence-by-path builder | Team 190 |
| T190-03 Date-governance verifier | Team 191 (automation) + Team 190 (policy checks) |
| T190-04 Stage/activation resolver | Team 190 + Team 170 |
| T190-05 Domain-boundary and owner validator | Team 190 + Team 170 |
| T190-06 Drift-and-supersession detector | Team 191 + Team 170 |
| T190-07 Token-lean verdict composer | Team 190 |

## 6) Open Clarification Questions

**NONE.** Team 190 scope, runtime, and constitutional lane are clear from the active role mapping and current validation workload.

## 7) Return Contract

| Field | Value |
|---|---|
| overall_result | SUBMITTED_FOR_ARCH_REVIEW |
| top3_skills | T190-01 Constitutional package linter; T190-03 Date-governance verifier; T190-02 Evidence-by-path builder |
| blocking_uncertainties | NONE |
| remaining_blockers | NONE |

---

**log_entry | TEAM_190 | SKILLS_RECOMMENDATIONS_REPORT | SUBMITTED_FOR_ARCH_REVIEW | 2026-03-15**
