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
program_id: S005-P006
domain: AGENTS_OS
---

# Domain Clean Separation — TikTrack Consumes AOS as Installed Tool

**id:** S005-P006
**status:** DRAFT / LOD100
**date:** 2026-04-03

## What we want

Complete removal of `agents_os_v3/` from the TikTrack repository. AOS is installed into
TikTrack as an external tool (L3 CLI or pip-installable package), not carried as a
source snapshot. TikTrack's repo becomes a pure application codebase; the AOS repo
becomes a published, versioned methodology engine.

This is Phase E of the domain separation roadmap defined in
`ARCHITECT_DIRECTIVE_DOMAIN_SEPARATION_BRIDGE_MODEL_v1.0.0.md`.

## Why now (preconditions)

This program is only viable after all of the following are GATE_5 PASS:

| Precondition | Program |
|---|---|
| L3 CLI / AOS packaged as installable tool | S004-P011 (Project Scaffolding CLI) |
| Lean Kit generator stable | S004-P009 (Lean Kit Generator) |
| L0→L2 upgrade path operational | S004-P010 (Upgrade Path Tool) |
| ≥1 external project (non-TikTrack) running on AOS L0+ | S003-P019 (Multi-Project Adoption) |
| Snapshot sync process battle-tested | S003-P018 (Snapshot Version Management) |

**Do not plan implementation until all preconditions are met.**

## What this is NOT

- This is not a refactor of `agents_os_v3/` internals — that is S003-P018 and S003-P019 territory.
- This is not a new feature — it is a structural clean-up enabled by earlier programs.
- This is not a TikTrack feature program — it is infrastructure / methodology debt retirement.

## Scope outline (LOD100 — subject to LOD200 refinement)

1. **Verify AOS L3 CLI is installable** — `pip install agents-os` or `brew install agents-os` (or
   equivalent) delivers all pipeline tooling without a source checkout in the client repo.

2. **Verify TikTrack can run the full pipeline against AOS-as-tool** — every gate command,
   dashboard endpoint, and governance script works with AOS installed externally.

3. **Remove `agents_os_v3/` from TikTrack** — surgical deletion; update all internal imports,
   scripts, and references.

4. **Update TikTrack CLAUDE.md and AGENTS.md** — remove AOS-specific identity sections; TikTrack
   is now an L2/L3 client of AOS, not its host.

5. **Update FILE_INDEX.json** — remove all `agents_os_v3/` entries; add external-tool reference
   metadata.

6. **Validate dual-domain dashboard** — dashboard continues to serve both domains via the
   installed AOS API, not the bundled snapshot.

7. **Archive snapshot** — final `agents_os_v3/` state tagged in git history as `SNAPSHOT_FINAL`
   before removal.

## Out of scope

- Changes to the AOS repo itself (that is S004 territory)
- Dashboard visual redesign
- Any TikTrack application feature work

## Success criteria (preliminary — confirmed at LOD200)

- `agents_os_v3/` directory does not exist in the TikTrack repository
- All pipeline commands route through installed AOS CLI
- TikTrack CI/CD passes without any direct AOS source dependency
- Historical snapshot preserved in git tag `aos-snapshot-final-YYYYMMDD`

## Track rationale

Track B — concept gate required before spec. LOD200 must model the CLI installation mechanism
and confirm that the bi-domain dashboard can be served without `agents_os_v3/` in-tree.
A LOD300 system behavior document is expected before LOD400 spec.

## Dependencies

```
S003-P018 GATE_5 PASS
S003-P019 GATE_5 PASS
S004-P009 GATE_5 PASS
S004-P010 GATE_5 PASS
S004-P011 GATE_5 PASS
→ S005-P006 GATE_0 (intake)
```

---

**log_entry | TEAM_00 | LOD100_S005_P001_DOMAIN_CLEAN_SEPARATION | DRAFT | 2026-04-03**
