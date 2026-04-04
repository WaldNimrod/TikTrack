---
historical_record: true
lod_target: LOD100
lod_status: DRAFT
track: A
authoring_team: team_00
consuming_team: team_100
date: 2026-04-03
version: v1.0.0
supersedes: null
concept_id: LEAN-KIT-WP002
program_id: S004-P005
domain: AGENTS_OS
---

# Lean Kit Generator

**id:** S004-P005 (concept: LEAN-KIT-WP002)
**status:** DRAFT / LOD100
**date:** 2026-04-03

## What we want

A code generator (script or CLI command) that, given minimal inputs (project name, profile,
team roster), produces a complete, correct Lean Kit scaffold for a new project: `roadmap.yaml`,
`team_assignments.yaml`, directory structure, and initial LOD100 document — all pre-filled
with the project's details and ready to use.

## Why now (S004)

After adopting Lean Kit manually on ≥3 projects (TikTrack + S003-P019 two projects), the
manual cost of setting up a new project from templates will be clear. At that point, the
patterns are stable enough to automate. Building the generator before that validation would
produce an incorrect abstraction.

## Success looks like

1. `aos generate project --name <name> --profile L0 --teams cursor,openai` produces a valid
   project directory in <5 seconds.
2. Generated output passes Lean Kit structural linter (no missing required fields, no forbidden
   terms, valid YAML).
3. Generated `team_assignments.yaml` pre-enforces cross-engine Iron Rule (validator ≠ builder
   auto-detected from team roster and flagged if violated).
4. Generator is tested against the two S003-P019 real projects to confirm it would have
   produced equivalent output.
5. Lessons from S003-P019 are reflected in the generated defaults.

## Out of scope (explicit)

- Auto-generating LOD200+ documents (those require human architectural judgment)
- Generating AOS L2 (Dashboard) scaffolds — that is the CLI (S004-P007)
- Integration with any external project management tool

## Open questions

- [ ] Language/runtime: Python (aligned with agents_os_v3/), or shell script?
- [ ] Does the generator live in `agents-os/core/cli/` or as a standalone entry point?
- [ ] Should it write directly to a target directory, or produce a dry-run preview first?
- [ ] What is the minimum viable input set? (Name + profile + team list sufficient?)

## Fate decision

- [x] **PROMOTE to LOD200** → assign to: team_100 (spec) after S003-P019 GATE_5 PASS
- [ ] DEFER: reason ___
- [ ] CLOSE: reason ___

---

*log_entry | TEAM_00 | LOD100 | S004_P005 | LEAN_KIT_GENERATOR | LEAN-KIT-WP002 | 2026-04-03*
