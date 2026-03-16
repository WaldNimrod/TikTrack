---
project_domain: SHARED (TIKTRACK + AGENTS_OS)
id: TEAM_190_TO_TEAM_100_CONSTITUTIONAL_PACKAGE_LINTER_INTERNAL_EXPERIMENT_SUBMISSION_v1.0.0
from: Team 190 (Constitutional Architectural Validator)
to: Team 100 (Agents_OS Architects)
cc: Team 00, Team 170, Team 191, Nimrod
date: 2026-03-16
status: SUBMITTED_FOR_ARCHITECT_REVIEW
scope: Internal Team 190 Codex skill experiment for package preflight hardening
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | INTERNAL_EXPERIMENT |
| program_id | TEAM_190_INTERNAL |
| work_package_id | N/A |
| task_id | CONSTITUTIONAL_PACKAGE_LINTER_SKILL_EXPERIMENT |
| gate_id | INTERNAL_R_AND_D |
| phase_owner | Team 190 |

## 1) Context

This submission is an internal Team 190 local-Codex experiment. It is intentionally outside the normal stage/work-package activation flow.

Purpose:

1. reduce technical `BLOCK_FOR_FIX` loops before constitutional review,
2. reduce token waste on repetitive package hygiene checks,
3. create a small, evidence-backed MVP skill that can be tested locally before any wider rollout.

## 2) Why this skill was selected first

Team 190 reviewed:

1. its own skills baseline report,
2. cross-team submissions batch,
3. recent validation artifacts and remediation loops,
4. current idea-pipeline context.

Result:

`constitutional-package-linter` was selected as the first experiment because it has the strongest combination of:

1. immediate operational value,
2. direct fit to Team 190 work,
3. low-to-medium implementation effort,
4. measurable reduction in recurring technical blockers.

## 3) Evidence Basis (recent-first weighting)

Primary evidence window:

1. `2026-03-13`
2. `2026-03-14`
3. `2026-03-15`
4. `2026-03-16`

The MVP rules were derived from repeated issues in recent artifacts, especially:

1. temporal drift in revalidation packages,
2. `phase_owner` metadata drift and placeholders,
3. missing `correction_cycle` lineage in resubmission loops,
4. malformed findings-table schema missing `evidence-by-path` and `route_recommendation`.

Canonical evidence set used:

1. `/_COMMUNICATION/team_190/TEAM_190_TO_TEAM_170_TEAM_00_IDEA_PIPELINE_PHASE1_VALIDATION_RESULT_v1.0.0.md`
2. `/_COMMUNICATION/team_190/TEAM_190_TO_TEAM_170_TEAM_00_IDEA_PIPELINE_HIERARCHY_REVALIDATION_RESULT_v1.0.0.md`
3. `/_COMMUNICATION/team_190/TEAM_190_TO_TEAM_10_S002_P002_WP003_PLAN_REVALIDATION_RESULT_v1.0.0.md`
4. `/_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_TEAM_170_AOS_AUDIT_ROUND1_VALIDATION_RESULT_v1.0.0.md`
5. `/_COMMUNICATION/_ARCHITECT_INBOX/AGENT_OS_PHASE_2/INFRASTRUCTURE_STAGE_2/S002_P005_TEAM_SKILLS_ALIGNMENT/TEAM_190_ARCHITECT_DECISION_ACCELERATOR_SKILLS_ALIGNMENT_v1.0.0.md`
6. `/_COMMUNICATION/team_191/TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.3.md`

## 4) Implemented Local Experiment

Local draft skill created with Codex skill tooling at:

1. `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/tmp/team190-skill-lab/constitutional-package-linter/SKILL.md`
2. `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/tmp/team190-skill-lab/constitutional-package-linter/scripts/lint_constitutional_package.py`
3. `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/tmp/team190-skill-lab/constitutional-package-linter/scripts/test_lint_constitutional_package.py`
4. `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/tmp/team190-skill-lab/constitutional-package-linter/references/evidence-basis.md`
5. `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/tmp/team190-skill-lab/constitutional-package-linter/references/check-catalog.md`

The skill was initialized with Codex `skill-creator` tooling and then specialized manually around evidence-backed checks only.

Installed local skill path:

1. `/Users/nimrod/.codex/skills/constitutional-package-linter`

## 5) MVP Scope (implemented)

Current checks:

1. `CPL-001` missing canonical date,
2. `CPL-002` future date relative to UTC day,
3. `CPL-003` placeholder `phase_owner`,
4. `CPL-004` missing `correction_cycle` in revalidation/remediation/resubmission-style packages,
5. `CPL-005` missing `evidence-by-path` in validation findings schema,
6. `CPL-006` missing `route_recommendation` in validation findings schema.

Out of scope for MVP:

1. architectural judgment,
2. roadmap legality,
3. gate legality,
4. WSM/registry semantic reconciliation,
5. supersession-graph validation.

## 6) Validation Plan

Local validation layers:

1. unit-style fixtures via bundled test script,
2. skill structure validation via Codex skill validator,
3. later live-corpus spot checks on recent real artifacts.

Validation already executed:

1. `quick_validate.py` on the skill folder: `PASS`
2. bundled tests (`test_lint_constitutional_package.py`): `4/4 PASS`
3. live corpus smoke check:
   - correctly did **not** flag `TEAM_191_TO_TEAM_190_GITHUB_COMMUNICATION_DATE_GOVERNANCE_COMPLETION_v1.0.0.md`
   - correctly flagged missing `correction_cycle` in `TEAM_190_TO_TEAM_170_TEAM_00_IDEA_PIPELINE_HIERARCHY_REVALIDATION_RESULT_v1.0.0.md`
   - correctly flagged placeholder `phase_owner` in `TEAM_50_SKILLS_RECOMMENDATIONS_REPORT_v1.0.0.md`

Requested external review:

1. Team 100 to review whether the MVP rule set is correctly scoped,
2. Team 100 to identify any missing high-value check that is already evidenced in recent artifacts,
3. Team 100 to advise whether this should remain Team 190-only or become a shared governance-core candidate.

## 7) Decisions Requested from Team 100

1. Approve or refine the MVP rule set.
2. Approve or reject the current experiment boundary as `Team 190 internal`.
3. Advise whether `date-governance` should remain embedded in this skill or split into a second skill later.
4. Advise whether the next iteration should add:
   - superseded drift checks,
   - stage/program activation checks,
   - WSM mirror checks,
   - none of the above yet.

## 8) Success Criteria for the Experiment

1. Skill catches real recent defect classes before formal validation.
2. False positives remain low enough for practical use.
3. Team 190 can use it as first-pass preflight without increasing workflow overhead.
4. Team 100 confirms whether the design is sound before broader adoption.

## 9) Current Recommendation

Proceed with this skill as the first Team 190 internal Codex skill experiment.

Rationale:

1. strongest evidence density,
2. direct ROI on current Team 190 workload,
3. bounded scope,
4. lowest risk of architectural overreach in MVP form.

---

**log_entry | TEAM_190 | CONSTITUTIONAL_PACKAGE_LINTER_INTERNAL_EXPERIMENT | SUBMITTED_TO_TEAM_100_FOR_REVIEW | 2026-03-16**
