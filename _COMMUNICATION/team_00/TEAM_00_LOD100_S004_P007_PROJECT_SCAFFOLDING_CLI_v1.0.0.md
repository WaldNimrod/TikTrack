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
concept_id: LEAN-KIT-WP004
program_id: S004-P007
domain: AGENTS_OS
---

# Project Scaffolding CLI

**id:** S004-P007 (concept: LEAN-KIT-WP004)
**status:** DRAFT / LOD100
**date:** 2026-04-03

## What we want

A unified AOS command-line interface (`aos`) that covers the full project lifecycle: create
a new project, advance gates, record verdicts, sync snapshots, and query project state —
all from the terminal, without requiring the Dashboard or a running AOS server. This is the
L3 deployment profile's primary interface.

## Why now (S004)

The CLI consolidates all point-tools built across S003-P018 (snapshot sync), S004-P005
(generator), and S004-P006 (upgrade path) into one coherent interface. It can only be
designed after those three programs establish the underlying operations it wraps.
The CLI is the last step before TikTrack can consume AOS as an installed tool (Phase E,
ARCHITECT_DIRECTIVE_DOMAIN_SEPARATION_BRIDGE_MODEL_v1.0.0.md).

## Success looks like

1. `aos new project` replaces the Generator (S004-P005) with a first-class CLI entry point.
2. `aos gate advance --verdict pass --summary "..."` replaces `pipeline_run.sh pass`.
3. `aos snapshot sync` replaces the sync script from S003-P018.
4. `aos status` shows the current project state in a readable format without starting a server.
5. The CLI is installable as a Python package (`pip install aos-cli` or equivalent) and runs
   independently of any AOS server.
6. TikTrack's `pipeline_run.sh` is deprecated and replaced by `aos` commands in its Makefile.
7. Team 190 validates the CLI contract (inputs, outputs, Iron Rule enforcement) before release.

## Out of scope (explicit)

- Full Dashboard replacement (Dashboard remains for visual monitoring)
- Multi-repo batch operations in v1.0
- Authentication / multi-user / cloud sync

## Open questions

- [ ] Python Click vs Typer vs argparse? (LOD200 decision — align with existing `agents_os_v3/cli/`)
- [ ] Is `aos` the right command name, or `agos`, `aoscli`? (simple, short preferred)
- [ ] Should the CLI be part of the `agents-os` repo, or its own installable package repo?
- [ ] What is the v1.0 command surface? (Minimum viable: new, gate, snapshot, status)

## Fate decision

- [x] **PROMOTE to LOD200** → assign to: team_100 (spec) after S004-P005 and S003-P018
      are both GATE_5 PASS
- [ ] DEFER: reason ___
- [ ] CLOSE: reason ___

**Note:** This program represents the L3 deployment profile described in
`ARCHITECT_DIRECTIVE_METHODOLOGY_DEPLOYMENT_SPLIT_v1.0.0.md`. L3 is the long-term target.

---

*log_entry | TEAM_00 | LOD100 | S004_P007 | PROJECT_SCAFFOLDING_CLI | LEAN-KIT-WP004 | 2026-04-03*
