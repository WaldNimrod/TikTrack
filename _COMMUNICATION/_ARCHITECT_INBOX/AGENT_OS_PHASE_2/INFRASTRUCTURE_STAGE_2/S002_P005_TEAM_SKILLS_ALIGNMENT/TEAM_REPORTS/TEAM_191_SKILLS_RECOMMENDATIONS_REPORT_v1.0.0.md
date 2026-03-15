---
project_domain: SHARED (TIKTRACK + AGENTS_OS)
id: TEAM_191_SKILLS_RECOMMENDATIONS_REPORT_v1.0.0
from: Team 191 (Git Governance Operations)
to: Team 00, Team 100
cc: Team 190, Team 10, Nimrod
date: 2026-03-15
status: SUBMITTED_FOR_ARCH_REVIEW
scope: Team 191 skill recommendations for Git governance acceleration and validation-loop reduction
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
| phase_owner | Team 191 |

## 1) Team Context

- operating domain(s): SHARED (TIKTRACK + AGENTS_OS), Git governance lane only
- primary toolchain/runtime: `git`, `pre-commit`, `curl`, `jq`, Python scripts, Codex terminal runtime
- recurring blockers:
  - date-header drift causing `DATE-LINT` push failures
  - repeated approval popups for recurring network operations
  - branch protection (`GH013`) requiring PR flow
  - long/verbose check polling loops (token waste)
  - concurrent local deltas arriving during active cycle

## 2) Skill Options Table

| Option | What It Solves | Benefits | Risks/Tradeoffs | Impact | Effort | Token Saving |
|---|---|---|---|---|---|---|
| Team191 Canonical PR Ops Scripts (`scripts/team191_poll_pr_checks.sh`, `scripts/team191_merge_pr.sh`) | Long ad-hoc one-liners and repeated manual polling | Deterministic PR flow, shorter output, fewer approval prompts | Requires ongoing script maintenance | HIGH | LOW | HIGH |
| Process-Functional Separation Lint (`scripts/lint_process_functional_separation.sh`) | Invalid `owner_next_action` fields inside functional verdict artifacts | Early fail at commit time, fewer validation rework loops | May block commits until issuing team fixes text | HIGH | LOW | MEDIUM |
| `gh-fix-ci` skill (curated) | Slow manual triage of failing CI checks | Faster extraction of actionable CI failure snippets | Requires `gh` auth/scopes and skill installation | MEDIUM | MEDIUM | MEDIUM |
| `gh-address-comments` skill (curated) | PR review comments handled manually and inconsistently | Numbered comment workflows, deterministic closure tracking | Requires `gh` auth and disciplined usage | MEDIUM | MEDIUM | MEDIUM |
| Team191 Unified Check Aggregator Script (`191 checks` backend wrapper, planned) | Multiple separate check commands and fragmented evidence | One command for DATE-LINT/SYNC/SNAPSHOT/PFS + compact report | Initial implementation and maintenance cost | HIGH | MEDIUM | HIGH |
| Persistent Codex approval profile for recurring prefixes | Repeated permission interruptions | Stable no-popup execution for routine commands | Security hygiene must remain strict on allowed prefixes | HIGH | LOW | HIGH |

## 3) Priority Recommendation (Top 3)

1. Team191 Unified Check Aggregator Script (planned, immediate next implementation)
2. Team191 Canonical PR Ops Scripts (already active; keep as default)
3. Persistent Codex approval profile for recurring prefixes (already partially active; complete hardening)

Immediate wins:
- Option 1 (canonical PR ops scripts) and Option 6 (approval profile) to reduce runtime friction now.

Medium-term investments:
- Option 5 (unified checks wrapper) and curated `gh` skills integration (Options 3-4).

## 4) Dependencies and Prerequisites

- `GITHUB_TOKEN_ADMIN` with required repository scopes
- `/tmp/team191_github_token` fallback loading convention
- `pre-commit` installed and active in repository
- `jq` and `curl` available in runtime
- for `gh` options: `gh auth login` with `repo` + `workflow` scopes

## 5) Suggested Owner Per Option

- Team 191: Options 1, 2, 5, 6
- Team 60: environment/tooling support for `gh` rollout and runner consistency
- Team 00 + Team 100: architectural approval for standardizing Options 3-5 across teams

## 6) Open Clarification Questions

NONE

## Return Contract

- overall_result: SUBMITTED_FOR_ARCH_REVIEW
- top3_skills:
  1. Team191 Unified Check Aggregator Script
  2. Team191 Canonical PR Ops Scripts
  3. Persistent Codex approval profile for recurring prefixes
- blocking_uncertainties: NONE
- remaining_blockers: NONE

log_entry | TEAM_191 | TEAM_SKILLS_DISCOVERY_AND_SUBMISSION | REPORT_SUBMITTED | 2026-03-15
