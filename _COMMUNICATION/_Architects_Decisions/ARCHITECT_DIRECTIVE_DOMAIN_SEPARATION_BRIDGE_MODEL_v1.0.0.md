---
id: ARCHITECT_DIRECTIVE_DOMAIN_SEPARATION_BRIDGE_MODEL_v1.0.0
author: Team 00 (Nimrod — Chief Architect)
date: 2026-04-03
status: LOCKED
type: ARCHITECTURAL_DIRECTIVE
authority: CONSTITUTIONAL
---

# Architect Directive: Domain Separation Architecture — Bridge Model

## §1 — Context

TikTrack and Agents OS (AOS) are two independent application domains. Both are in active
development. This directive locks the architecture governing how the two repos relate during
this development phase, and establishes the principles that govern future separation.

---

## §2 — Locked Decisions (2026-04-03, Nimrod)

### Decision 1 — Bridge Model: Frozen Snapshot with Version Number

`agents_os_v3/` inside the TikTrack repo is the **deployed snapshot** of `agents-os/core/`.
It is frozen at a specific version and does NOT auto-sync with the agents-os repo.

**Rules:**
- The snapshot version is declared in `agents_os_v3/SNAPSHOT_VERSION` (file to be created in S003-P018)
- Sync is triggered manually and only when TikTrack needs a specific AOS feature
- A structured, documented sync process must exist before multi-project Lean Kit adoption (S003-P018)
- The sync process must be simple, runnable in a single command, and produce zero drift

**Asterisk (Nimrod):** The sync process is a critical dependency. It will be run frequently
(every significant AOS update). It must be designed for repeatability and minimal overhead.
S003-P018 addresses this directly.

### Decision 2 — Two Candidate Projects for Lean Kit Adoption

Both projects are registered as AOS-managed projects and will adopt the Lean (L0) profile:

| Project | GitHub | Local path |
|---------|--------|-----------|
| SmallFarmsAgents | `github.com/WaldNimrod/SmallFarmsAgents` | `/Users/nimrod/Documents/SmallFarmsAgents` |
| EyalAmit | `github.com/WaldNimrod/EyalAmit` | `/Users/nimrod/Documents/Eyal Amit` |

Both projects have existing procedures and policies that must be read before LOD200.
The adoption process (S003-P019) reads existing governance, maps it to Lean Kit, and registers
each project in `agents-os/projects/`.

### Decision 3 — Bi-Domain Dashboard Stays in TikTrack Repo

The AOS dashboard serves both TikTrack and AOS domains. It remains in the TikTrack repo as
long as:
- TikTrack is the primary project that drives AOS development requirements
- `agents_os_v3/` lives in TikTrack as deployed snapshot

When TikTrack moves to consuming AOS as an installed tool (L3 future state), the dashboard
either moves to agents-os or becomes a standalone repo. That decision is deferred to S005+.

---

## §3 — Architectural Principle (permanent)

**AOS cannot develop in a vacuum. TikTrack is the primary source of real requirements.**

Every AOS infrastructure capability (bridge model, Lean Kit, CLI) must be validated against
real TikTrack work before it is considered production-ready. The coupling between TikTrack
and AOS is intentional and correct at this stage — not a debt to be eliminated immediately.

Separation is a direction of travel, not an immediate mandate.

---

## §4 — Separation Phases (roadmap reference)

| Phase | Stage | What changes |
|-------|-------|-------------|
| **A — Bridge established** | S003 ✅ | agents-os repo exists; snapshot in TikTrack; methodology in agents-os |
| **B — Sync formalized** | S003-P018 | Snapshot sync process automated; version declared |
| **C — Lean expansion** | S003-P019 | SmallFarmsAgents + EyalAmit onboarded; Lean Kit proven on ≥3 projects |
| **D — Tooling** | S004 | Generator (P005), L0→L2 upgrade (P006), CLI (P007) |
| **E — Clean separation** | S005+ | TikTrack consumes AOS as installed tool; dashboard separation decision |

---

## §5 — Programs registered under this directive

| Program | Stage | Name | Status |
|---------|-------|------|--------|
| S003-P018 | S003 | AOS Snapshot Version Management | PLANNED |
| S003-P019 | S003 | Multi-Project Lean Kit Adoption | PLANNED |
| S004-P009 | S004 | Lean Kit Generator (LEAN-KIT-WP002) | PLANNED |
| S004-P010 | S004 | L0→L2 Upgrade Path (LEAN-KIT-WP003) | PLANNED |
| S004-P011 | S004 | Project Scaffolding CLI (LEAN-KIT-WP004) | PLANNED |
| S005-P006 | S005 | Domain Clean Separation — Phase E (TikTrack consumes AOS as installed tool) | PLANNED |

> **Note (2026-04-03):** Registry IDs S004-P009/010/011 (not P005/006/007 — those slots are taken
> by existing TikTrack programs). S005-P006 (not P001 — P001..P005 taken). Ratified by Team 00.

LOD100 documents: `_COMMUNICATION/team_00/TEAM_00_LOD100_S003_P018_*.md` through `TEAM_00_LOD100_S005_P006_DOMAIN_CLEAN_SEPARATION_v1.0.0.md`

---

**log_entry | TEAM_00 | DOMAIN_SEPARATION_BRIDGE_MODEL | LOCKED | 3_DECISIONS | 5_PROGRAMS | 2026-04-03**
**log_entry | TEAM_00 | DOMAIN_SEPARATION_BRIDGE_MODEL | REGISTRY_IDS_CORRECTED | S004_P009_P010_P011_S005_P006 | F01_FIX | 2026-04-03**
