---
project_domain: SHARED (TIKTRACK + AGENTS_OS)
id: TEAM_190_TO_ALL_TEAMS_SKILLS_DISCOVERY_SUBMISSION_PROMPT_v1.0.0
from: Team 190 (Constitutional Validator)
to: All Teams (10,20,30,40,50,51,60,61,70,90,100,170,190,191)
cc: Team 00, Team 100, Nimrod
date: 2026-03-15
status: ACTION_REQUIRED
scope: Team-specific skill recommendation package for architectural consolidation
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
| phase_owner | RECEIVING_TEAM |

## 1) Mission

Each team must produce a team-specific skill recommendation report that mirrors Team 190 baseline analysis, adjusted to its own domain/runtime constraints.

Targets:
1. work acceleration,
2. output quality improvement,
3. token usage reduction,
4. fewer avoidable validation loops.

## 2) Non-Negotiable Rule

If your team environment or runtime scope is not fully clear, **stop and ask Nimrod before drafting recommendations**.
Do not guess environment assumptions.

## 3) Required Output File

Submit one report file:
`TEAM_<TEAMID>_SKILLS_RECOMMENDATIONS_REPORT_v1.0.0.md`

Submission folder (shared):
`_COMMUNICATION/_ARCHITECT_INBOX/AGENT_OS_PHASE_2/INFRASTRUCTURE_STAGE_2/S002_P005_TEAM_SKILLS_ALIGNMENT/TEAM_REPORTS/`

Folder contract:
`_COMMUNICATION/_ARCHITECT_INBOX/AGENT_OS_PHASE_2/INFRASTRUCTURE_STAGE_2/S002_P005_TEAM_SKILLS_ALIGNMENT/TEAM_REPORTS/README_SUBMISSIONS.md`

## 4) Mandatory Report Structure

1. Team Context
   - operating domain(s)
   - primary toolchain/runtime
   - recurring blockers
2. Skill Options Table (minimum 5 options)
   - option name
   - what it solves
   - benefits
   - risks/tradeoffs
   - impact level (LOW/MEDIUM/HIGH)
   - implementation effort (LOW/MEDIUM/HIGH)
   - token-saving estimate (LOW/MEDIUM/HIGH)
3. Priority Recommendation (Top 3)
4. Dependencies and prerequisites
5. Suggested owner per option
6. Open clarification questions (if any)

## 5) Quality Bar

1. No generic suggestions detached from actual team workflow.
2. Must include concrete examples from current team execution reality.
3. Must separate immediate wins vs medium-term investments.
4. Must be deterministic and actionable.

## 6) Return Contract

Include at end of report:
1. `overall_result: SUBMITTED_FOR_ARCH_REVIEW`
2. `top3_skills`
3. `blocking_uncertainties` (or `NONE`)
4. `remaining_blockers: NONE`

log_entry | TEAM_190 | ALL_TEAMS_SKILLS_DISCOVERY_PROMPT | ISSUED | 2026-03-15
