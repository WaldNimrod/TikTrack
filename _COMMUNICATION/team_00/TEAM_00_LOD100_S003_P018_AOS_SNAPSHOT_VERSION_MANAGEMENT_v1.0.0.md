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
program_id: S003-P018
domain: AGENTS_OS
---

# AOS Snapshot Version Management

**id:** S003-P018
**status:** DRAFT / LOD100
**date:** 2026-04-03

## What we want

A structured, version-numbered, and automated (or near-automated) process for updating the
`agents_os_v3/` deployed snapshot inside client repos (TikTrack and future projects) whenever
a significant AOS core update is ready to propagate.

## Why now

The bridge model (Decision 1, ARCHITECT_DIRECTIVE_DOMAIN_SEPARATION_BRIDGE_MODEL_v1.0.0.md)
requires that the snapshot stays frozen at a declared version. The moment there are ≥2 repos
carrying a snapshot (TikTrack + SmallFarmsAgents + EyalAmit), sync drift becomes a real
operational risk. Without a defined process, each sync will be ad-hoc, inconsistent, and
prone to error. This must exist before multi-project adoption (S003-P019).

## Success looks like

1. `agents_os_v3/SNAPSHOT_VERSION` exists in TikTrack (and all client repos), declaring the
   exact version of `agents-os/core/` that the snapshot was taken from.
2. A single command (or minimal script) executes a full snapshot sync: copies core/ to
   agents_os_v3/, updates SNAPSHOT_VERSION, runs the pre-commit hook gauntlet, and outputs
   a diff summary.
3. The process is documented in `agents-os/` and repeatable by any team without Team 00
   intervention.
4. Zero drift between the snapshot and the source after the command completes.
5. The process takes <10 minutes end-to-end and produces a clean, reviewable diff.

## Out of scope (explicit)

- Automatic/continuous sync (no CI triggers on AOS commits propagating to TikTrack)
- Backward migration of old snapshots
- Changing TikTrack app code to depend on new AOS APIs (that is a TikTrack development WP)

## Open questions

- [ ] Should `SNAPSHOT_VERSION` mirror the agents-os git commit SHA, a semantic version tag,
      or both? (LOD200 decision)
- [ ] Does the sync script live in `agents-os/scripts/` or in each client repo?
- [ ] Is a `make sync-snapshot` target in a Makefile the right interface, or a standalone script?
- [ ] Should the script include a dry-run mode for preview before applying?

## Fate decision

- [x] **PROMOTE to LOD200** → assign to: team_100 (spec) + team_61 or team_191 (build)
- [ ] DEFER: reason ___
- [ ] CLOSE: reason ___

**Sequencing constraint:** Must reach GATE_5 PASS before S003-P019 (multi-project adoption) begins.

---

*log_entry | TEAM_00 | LOD100 | S003_P018 | AOS_SNAPSHOT_VERSION_MANAGEMENT | 2026-04-03*
