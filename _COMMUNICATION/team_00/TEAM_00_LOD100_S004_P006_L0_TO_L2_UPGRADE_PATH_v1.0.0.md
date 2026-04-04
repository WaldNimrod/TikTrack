---
historical_record: true
lod_target: LOD100
lod_status: DRAFT
track: B
authoring_team: team_00
consuming_team: team_100
date: 2026-04-03
version: v1.0.0
supersedes: null
concept_id: LEAN-KIT-WP003
program_id: S004-P006
domain: AGENTS_OS
---

# L0→L2 Upgrade Path

**id:** S004-P006 (concept: LEAN-KIT-WP003)
**status:** DRAFT / LOD100
**date:** 2026-04-03

## What we want

A defined, documented, and tooling-assisted migration path for a project that has been
operating under the Lean (L0) profile to upgrade to the full AOS v3 (L2) profile — including
adopting the AOS Dashboard, connecting to the AOS DB, and running the full GATE_0–GATE_5
pipeline with automation.

## Why now (S004)

After ≥2 projects have lived on Lean (L0) for a meaningful period, the upgrade friction will
be observable and measurable. The upgrade path must be designed from evidence, not speculation.
Additionally, the AOS L2 system must itself be stable before we define an upgrade path to it.

## Success looks like

1. A documented runbook in `agents-os/methodology/` that describes the exact steps to migrate
   a project from L0 to L2.
2. A migration script that: reads the project's `roadmap.yaml` (L0 format), produces an
   equivalent AOS DB seed (L2 format), and verifies structural correctness.
3. At least one real project has completed the migration end-to-end under this runbook.
4. The migrated project's existing WP history is preserved in the AOS DB with correct gate
   state, dates, and team assignments.
5. The upgrade path is validated by Team 190 against the cross-engine Iron Rule
   (the validator on the migration itself must differ from the builder).

## Out of scope (explicit)

- Forcing any L0 project to upgrade (upgrade is voluntary and staged)
- Migrating TikTrack (TikTrack is already L2; this is for projects that started on L0)
- Automatic migration without human review of the produced DB seed

## Open questions

- [ ] What is the minimum AOS L2 stability bar required before this program activates?
      (Definition: Dashboard + API + DB all at GATE_5 PASS quality for a defined feature set)
- [ ] Should the L0→L2 migration preserve old gate timestamps as historical records in the
      AOS DB, or start fresh from the migration date?
- [ ] Is there a L0.5 intermediate state (e.g., L0 docs + AOS API without full Dashboard)?

## Fate decision

- [x] **PROMOTE to LOD200** → assign to: team_100 (spec) after S003-P019 GATE_5 PASS
      and after AOS L2 stability bar is defined
- [ ] DEFER: reason ___
- [ ] CLOSE: reason ___

Track B: requires L-GATE_C (concept review of migration approach) before spec.

---

*log_entry | TEAM_00 | LOD100 | S004_P006 | L0_TO_L2_UPGRADE_PATH | LEAN-KIT-WP003 | 2026-04-03*
