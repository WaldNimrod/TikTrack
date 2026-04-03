---
lod_target: LOD100
lod_status: DRAFT
track: B
authoring_team: team_00
consuming_team: team_100
date: 2026-04-03
version: v1.0.0
supersedes: null
program_id: S003-P019
domain: AGENTS_OS
---

# Multi-Project Lean Kit Adoption — SmallFarmsAgents + EyalAmit

**id:** S003-P019
**status:** DRAFT / LOD100
**date:** 2026-04-03

## What we want

Onboard two active projects — SmallFarmsAgents and EyalAmit — onto the AOS Lean (L0) profile
using the Lean Kit built in S003-P017. Each project gets registered in `agents-os/projects/`,
receives a `roadmap.yaml` and `team_assignments.yaml`, and begins operating under the Lean
Gate Model. This validates the Lean Kit in real-world conditions with real projects.

## Why now

The Lean Kit (S003-P017) exists. Both projects have existing procedures and governance
artifacts that were born from the same methodology context as TikTrack. They are the closest
candidates to a clean adoption without a full rewrite. Running the Lean Kit on ≥2 additional
projects is necessary to validate the methodology before investing in automation (Generator,
CLI — S004+).

**Pre-condition:** S003-P018 (snapshot sync process) must be complete first, so the projects
can adopt a versioned snapshot of AOS core if they need it.

## Target projects

| Project | GitHub | Local path | Notes |
|---------|--------|-----------|-------|
| SmallFarmsAgents | `github.com/WaldNimrod/SmallFarmsAgents` | `/Users/nimrod/Documents/SmallFarmsAgents` | Has existing procedures/policies |
| EyalAmit | `github.com/WaldNimrod/EyalAmit` | `/Users/nimrod/Documents/Eyal Amit` | Has existing procedures/policies |

## Success looks like

1. Both projects have a `projects/<id>.yaml` entry in `agents-os/projects/`.
2. Both have a `roadmap.yaml` and `team_assignments.yaml` following the Lean Kit templates.
3. Existing procedures/policies are mapped to the Lean framework (not discarded — preserved
   and translated into LOD100/LOD200 format as appropriate).
4. At least one WP per project has passed L-GATE_S (spec + auth) under the Lean model.
5. Team 190 (or equivalent cross-engine validator) has validated the adoption documents.
6. Lessons learned are captured for input into the Generator design (S004-P005).

## Out of scope (explicit)

- Rewriting existing project code or architecture to match TikTrack conventions
- Migrating either project to AOS L2 (that is S004-P006 territory)
- Forcing identical team structures — each project maps to Lean roles using its own team

## Open questions

- [ ] Do SmallFarmsAgents and EyalAmit need a separate AOS snapshot in their repos,
      or do they operate Lean-only (L0 = no AOS engine, just documents)?
      (Decision: if L0 = documents only, no snapshot needed. LOD200 to confirm.)
- [ ] What is the right WP to start with for each project to pilot the Lean Gate Model?
- [ ] Should existing governance artifacts be migrated into LOD format, or kept as-is with
      a mapping document? (Requires reading existing repos before LOD200.)
- [ ] Is one team handling both projects, or separate activations?

## Fate decision

- [x] **PROMOTE to LOD200** → assign to: team_100 (spec) — read both repos before LOD200
- [ ] DEFER: reason ___
- [ ] CLOSE: reason ___

**Sequencing constraint:** Requires S003-P018 GATE_5 PASS before activation.
Track B (5 gates): L-GATE_E → L-GATE_C (concept review per project) → L-GATE_S → L-GATE_B → L-GATE_V

---

*log_entry | TEAM_00 | LOD100 | S003_P019 | MULTI_PROJECT_LEAN_KIT_ADOPTION | 2026-04-03*
