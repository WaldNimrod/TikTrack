---
id: ARCHITECT_DIRECTIVE_METHODOLOGY_DEPLOYMENT_SPLIT_v1.0.0
from: Team 00 (Principal — Nimrod) via Team 100 (Chief System Architect)
to: All teams
date: 2026-04-02
type: ARCHITECT_DIRECTIVE — Constitutional
authority: Team 00
status: ACTIVE — LOCKED
---

# Architect Directive — Methodology/Deployment Split + Lean Kit Architecture

## Purpose

Locks the foundational architectural decision separating **Methodology** from
**Deployment** across all project environments. This directive governs how
the project's governance framework is replicated to new projects.

---

## 1. The Core Split — Iron Rule

**Methodology** (what we do) is permanently separated from **Deployment**
(how we enforce it). These are two distinct layers:

```
METHODOLOGY LAYER (portable, universal)
├── LOD Standard (specification levels 100–500)
├── Gate model (5 canonical gates GATE_1–GATE_5; GATE_0 = operational intake, predates the canon)
├── Team role type definitions
├── Iron Rules (including cross-engine validation)
├── Process tracks (FULL / FOCUSED / FAST)
└── Governance document templates

DEPLOYMENT LAYER (environment-specific)
├── Lean/Manual — documents + human orchestration, no infrastructure
├── AOS v3/Dashboard — pipeline engine, DB, API, dashboard UI
└── AOS v4/CLI — full automation, CANONICAL_AUTO (future)
```

**The methodology layer is maintained in ONE place: this AOS repository.**
Lean Kit documents are generated views of the SSoT — not independent copies.

---

## 2. Deployment Profiles — Canonical Names

| Profile | Name | Infrastructure | Active? |
|---------|------|----------------|---------|
| **L0** | Lean / Manual | None — documents + human orchestration | ✓ Active |
| **L2** | AOS v3 / Dashboard | AOS pipeline + DB + dashboard UI | ✓ Active |
| **L3** | AOS v4 / CLI | Full CANONICAL_AUTO + auto-advance | Future |

**L1 (AOS Manual mode) is eliminated.** Its role is absorbed by L0 (Lean).
The "manual gate navigation" use case is served by the Lean profile, not by
a degraded AOS mode. This simplifies AOS and removes backward-compat burden.

---

## 3. Lean Kit — Snapshot Architecture

The Lean Kit is a standalone repository generated from this SSoT.

### 3.1 What the Lean Kit contains

```
lean-project-kit/
├── LEAN_KIT_VERSION.md          ← snapshot version (e.g. v1.0.0)
├── METHODOLOGY_REFERENCE.md     ← links to SSoT docs (LOD Standard, Gate Model)
├── team_assignments.yaml        ← configure which engine handles which role
├── roadmap.yaml                 ← work packages registry (mirrors AOS DB schema)
├── work_packages/               ← one folder per WP
│   └── TEMPLATE_WP/
│       ├── LOD200_template.md
│       ├── LOD400_template.md
│       ├── LOD500_template.md
│       └── gate_log.md
├── team_roles/
│   ├── ROLE_DEFINITIONS.md      ← role types, skills, engine guidance
│   └── TEAM_CREATION_GUIDE.md   ← how to instantiate a role for a project
├── gates/
│   ├── LEAN_GATE_MODEL.md       ← simplified gate model for L0
│   └── gate_decision_template.md
└── procedures/
    └── PROJECT_CREATION_PROCEDURE.md  ← how to start a new project
```

### 3.2 Snapshot model (no automatic sync)

- A new project clones the Lean Kit repo at a specific version (tag)
- The project records which version was used in `LEAN_KIT_VERSION.md`
- **No automatic update** — the project is frozen at that snapshot
- When a critical methodology update occurs, the SSoT owner evaluates whether
  propagation is required and triggers the update procedure (see §3.3)

### 3.3 Critical update propagation procedure

When a methodology change is judged critical (Iron Rule change, gate model
revision, LOD level redefinition):

```
1. Update SSoT in AOS repo
2. Bump lean-kit version (new snapshot)
3. Publish release notes with: what changed, severity, migration steps
4. For active projects using old version: owner reviews release notes
   and decides whether to adopt the update
5. Update = clone relevant changed files from new lean-kit version
   into the project, updating LEAN_KIT_VERSION.md
```

Non-critical updates (template refinements, guidance text) do NOT trigger
propagation. Active projects adopt them opportunistically at next project start.

---

## 4. SSoT Maintenance Rule

When methodology changes:
1. Update the canonical source in AOS repo (definition.yaml, LOD Standard, etc.)
2. Regenerate affected Lean Kit sections (manual until generator tool is built)
3. Release new lean-kit version if change is significant

**Future WPs registered in AOS roadmap (concept IDs LEAN-KIT-WP001–WP004;**
**canonical S-P-WP execution IDs are assigned at program registration per stage):**
- `LEAN-KIT-WP001` / `BUILD_LEAN_KIT_REPO` — create standalone lean-kit repository *(S003-P017)*
- `LEAN-KIT-WP002` / `BUILD_LEAN_KIT_GENERATOR` — script that auto-generates lean-kit from SSoT *(S004+)*
- `LEAN-KIT-WP003` / `BUILD_LEAN_TO_AOS_UPGRADE` — roadmap.yaml → AOS DB migration tool *(S004+)*
- `LEAN-KIT-WP004` / `BUILD_PROJECT_SCAFFOLDING_CLI` — new project creation CLI (both L0 + L2) *(S004+)*

---

## 5. Cross-Engine Validation in Lean Profile — Iron Rule

Cross-engine validation is an unconditional Iron Rule across ALL profiles.

In L0 (Lean):
- The validation engine MUST be different from the builder engine
- This assignment is declared in `team_assignments.yaml` (assigned_validator ≠ assigned_builder)
- The **orchestrator (human) is responsible** for routing validation requests to the correct team
- The orchestrator does NOT approve content — routing and engine selection is the orchestration function
- Evidence: validation record produced by the assigned_validator engine in LOD500

---

## 6. Roadmap Without DB — Lean Mode

In L0, work package state lives in `roadmap.yaml` — a YAML file that mirrors
the AOS DB schema subset. When upgrading to L2 (AOS v3), this file is the
source for DB population (future migration script).

For the full `roadmap.yaml` schema and required fields per work package, see
`TEAM_100_LOD_STANDARD_v0.3.md §10.2` (or `LOD_STANDARD_v1.0.0.md §10.2` after promotion).

---

**log_entry | TEAM_00 | METHODOLOGY_DEPLOYMENT_SPLIT_LOCKED | 2026-04-02**
**log_entry | TEAM_100 | LEAN_KIT_ARCHITECTURE_DEFINED | SNAPSHOT_MODEL | 2026-04-02**

historical_record: true
