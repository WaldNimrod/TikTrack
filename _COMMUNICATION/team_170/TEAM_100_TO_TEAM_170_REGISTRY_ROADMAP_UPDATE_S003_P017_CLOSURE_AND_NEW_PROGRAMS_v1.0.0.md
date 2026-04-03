---
id: TEAM_100_TO_TEAM_170_REGISTRY_ROADMAP_UPDATE_S003_P017_CLOSURE_AND_NEW_PROGRAMS_v1.0.0.md
from: Team 100 (Architecture)
to: Team 170 (Documentation)
date: 2026-04-03
type: MANDATE
priority: HIGH
gate: GATE_3 (execution)
---

# Mandate: Registry + Roadmap Update — S003-P017 Closure + 6 New Programs

## §1 — Authority

`ARCHITECT_DIRECTIVE_DOMAIN_SEPARATION_BRIDGE_MODEL_v1.0.0.md` (separation phases A–E)
`_COMMUNICATION/team_00/TEAM_00_LOD100_S003_P018_*.md` through `TEAM_00_LOD100_S005_P001_*.md`

## §2 — Scope

Two files to update. Both are in the TikTrack repo.

---

## File 1: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`

### Task A — Close S003-P017

Find the S003-P017 row and change its status from `PLANNED` to `COMPLETE`. Add the completion
note. Full replacement:

**Find (current):**
```
| S003 | S003-P017 | Lean Kit — agents-os repository + methodology portability (LEAN-KIT) | AGENTS_OS | PLANNED | — **WPs:** `S003-P017-WP001` INIT_AGENTS_OS_REPO (Team 191); `S003-P017-WP002` BUILD_LEAN_KIT_CONTENT (Team 170); concept `LEAN-KIT-WP002`–`WP004` (generator, L0→L2 upgrade, scaffolding CLI) → **S004+**. Ref: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_METHODOLOGY_DEPLOYMENT_SPLIT_v1.0.0.md` §3; `documentation/docs-governance/01-FOUNDATIONS/LOD_STANDARD_v1.0.0.md` §10. |
```

**Replace with:**
```
| S003 | S003-P017 | Lean Kit — agents-os repository + methodology portability (LEAN-KIT) | AGENTS_OS | COMPLETE | WP001 GATE_5 PASS 2026-04-03 (Team 191 — repo init); WP002 GATE_5 PASS 2026-04-03 (Team 170 — lean-kit content, 24 files). `agents-os` repo: `github.com/WaldNimrod/agents-os`. Lean Kit v0.1.0-scaffold. Concept WPs → S003-P018/P019 + S004-P005/P006/P007. |
```

### Task B — Add S003-P018 row

Add immediately after the S003-P017 row (and before S003-P009):

```
| S003 | S003-P018 | AOS Snapshot Version Management | AGENTS_OS | PLANNED | LOD100 authored 2026-04-03. Scope: version numbering + automated sync script for `agents_os_v3/` snapshot in client repos. Pre-condition for S003-P019. Ref: `ARCHITECT_DIRECTIVE_DOMAIN_SEPARATION_BRIDGE_MODEL_v1.0.0.md` §2 Decision 1; LOD100: `_COMMUNICATION/team_00/TEAM_00_LOD100_S003_P018_AOS_SNAPSHOT_VERSION_MANAGEMENT_v1.0.0.md`. |
```

### Task C — Add S003-P019 row

Add immediately after the S003-P018 row:

```
| S003 | S003-P019 | Multi-Project Lean Kit Adoption — SmallFarmsAgents + EyalAmit | AGENTS_OS | PLANNED | LOD100 authored 2026-04-03. Scope: onboard 2 active projects onto L0 Lean profile; register in `agents-os/projects/`; validate Lean Kit in real-world conditions. Requires S003-P018 GATE_5 PASS. Ref: `ARCHITECT_DIRECTIVE_DOMAIN_SEPARATION_BRIDGE_MODEL_v1.0.0.md` §2 Decision 2; LOD100: `_COMMUNICATION/team_00/TEAM_00_LOD100_S003_P019_MULTI_PROJECT_LEAN_KIT_ADOPTION_v1.0.0.md`. |
```

### Task D — Add S004-P005, P006, P007 rows

Add in the S004 section (after S004-P004, before any later S004 rows or S005+):

```
| S004 | S004-P005 | Lean Kit Generator | AGENTS_OS | PLANNED | LOD100 authored 2026-04-03. Concept: LEAN-KIT-WP002. Scope: code generator producing project scaffold from minimal inputs. Requires S003-P019 GATE_5 PASS. LOD100: `_COMMUNICATION/team_00/TEAM_00_LOD100_S004_P005_LEAN_KIT_GENERATOR_v1.0.0.md`. |
| S004 | S004-P006 | L0→L2 Upgrade Path | AGENTS_OS | PLANNED | LOD100 authored 2026-04-03. Concept: LEAN-KIT-WP003. Scope: migration runbook + tooling for projects moving from Lean (L0) to AOS v3 (L2). Requires S003-P019 GATE_5 PASS + AOS L2 stability bar. LOD100: `_COMMUNICATION/team_00/TEAM_00_LOD100_S004_P006_L0_TO_L2_UPGRADE_PATH_v1.0.0.md`. |
| S004 | S004-P007 | Project Scaffolding CLI | AGENTS_OS | PLANNED | LOD100 authored 2026-04-03. Concept: LEAN-KIT-WP004. Scope: unified `aos` CLI (new, gate, snapshot, status). L3 profile entry point. Requires S004-P005 + S003-P018 GATE_5 PASS. LOD100: `_COMMUNICATION/team_00/TEAM_00_LOD100_S004_P007_PROJECT_SCAFFOLDING_CLI_v1.0.0.md`. |
```

### Task D2 — Add S005-P001 row

Add in a new S005 section (after all S004 rows, before any later entries or the footer):

```
| S005 | S005-P001 | Domain Clean Separation — TikTrack Consumes AOS as Installed Tool | AGENTS_OS | PLANNED | LOD100 authored 2026-04-03. Phase E of ARCHITECT_DIRECTIVE_DOMAIN_SEPARATION_BRIDGE_MODEL_v1.0.0.md. Scope: remove `agents_os_v3/` from TikTrack; AOS delivered as installable CLI (L3). ALL of S003-P018/P019 + S004-P005/P006/P007 must be GATE_5 PASS first. LOD100: `_COMMUNICATION/team_00/TEAM_00_LOD100_S005_P001_DOMAIN_CLEAN_SEPARATION_v1.0.0.md`. |
```

### Task E — Add log entries

Append to the log section at the bottom of the registry:

```
**log_entry | TEAM_100 | PHOENIX_PROGRAM_REGISTRY | S003_P017_CLOSED_COMPLETE | WP001_WP002_GATE5_PASS | 2026-04-03**
**log_entry | TEAM_100 | PHOENIX_PROGRAM_REGISTRY | S003_P018_P019_REGISTERED | S004_P005_P006_P007_REGISTERED | S005_P001_REGISTERED | DOMAIN_SEPARATION_BRIDGE_MODEL_DIRECTIVE | 2026-04-03**
```

---

## File 2: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md`

### Task F — Update Future Stages S003-P017 entry

Find the S003-P017-LEAN-KIT row in the Future Stages section. Update status to COMPLETE and
add the new programs as follow-on rows:

**Find the row containing `S003-P017-LEAN-KIT`** and update the Status cell from `PLANNED` to
`COMPLETE`. Then add two new rows immediately after:

```
| S003-P018/P019 + S004-P005/P006/P007 | S003 / S004 | Bridge sync + multi-project adoption + generator + upgrade + CLI | Methodology (Agents_OS) | PLANNED | 5 follow-on programs registered from S003-P017 completion. Authority: `ARCHITECT_DIRECTIVE_DOMAIN_SEPARATION_BRIDGE_MODEL_v1.0.0.md`. See PHOENIX_PROGRAM_REGISTRY for detail. |
| S005-P001 | S005 | Domain Clean Separation — TikTrack Consumes AOS as Installed Tool (Phase E) | Methodology (Agents_OS) | PLANNED | Removes `agents_os_v3/` from TikTrack; AOS as installable L3 CLI. Pre-conditions: ALL of S003-P018/P019 + S004-P005/P006/P007 GATE_5 PASS. Locked: `ARCHITECT_DIRECTIVE_DOMAIN_SEPARATION_BRIDGE_MODEL_v1.0.0.md` Phase E. LOD100: `_COMMUNICATION/team_00/TEAM_00_LOD100_S005_P001_DOMAIN_CLEAN_SEPARATION_v1.0.0.md`. |
```

---

## §3 — Self-QA before submission

- [ ] S003-P017 status = COMPLETE in registry
- [ ] S003-P018 row present with correct note
- [ ] S003-P019 row present with correct note
- [ ] S004-P009, P010, P011 rows present in S004 section (note: S004-P005/P006/P007 taken by TikTrack)
- [ ] S005-P006 row present in S005 section (Phase E — clean separation; S005-P001..P005 taken)
- [ ] Log entries appended
- [ ] Roadmap S003-P017-LEAN-KIT row = COMPLETE
- [ ] Follow-on rows added: S003-P018/P019+S004 block + S005-P001 row

## §4 — Submission

Completion report:
```
_COMMUNICATION/_ARCHITECT_INBOX/TEAM_170_TO_TEAM_100_REGISTRY_ROADMAP_UPDATE_S003_P017_CLOSURE_v1.0.0.md
```

No Team 190 validation required for this mandate (registry update only, no LOD content).
Team 100 will spot-check directly.

---

*log_entry | TEAM_100 | MANDATE | TEAM_170 | REGISTRY_ROADMAP_UPDATE | S003_P017_CLOSURE_AND_NEW_PROGRAMS | 2026-04-03*
