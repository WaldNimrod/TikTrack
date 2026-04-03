---
lod_target: LOD200
lod_status: APPROVED
track: B
authoring_team: team_00
consuming_team: team_100
date: 2026-04-03
version: v1.0.0
supersedes: TEAM_00_LOD100_S003_P019_MULTI_PROJECT_LEAN_KIT_ADOPTION_v1.0.0.md
program_id: S003-P019
domain: AGENTS_OS
approved_by: Team 00 (Nimrod)
---

# LOD200 — S003-P019: Lean Kit Adoption — SmallFarmsAgents

**id:** S003-P019
**status:** LOD200 / APPROVED
**date:** 2026-04-03
**gate_target:** Track B (L-GATE_E → L-GATE_C → L-GATE_S → L-GATE_B → L-GATE_V)
**executor:** Team 170 (spec + build) + Team 190 (L-GATE_V validation)

---

## §1 — Scope Decision (locked at LOD200)

### D-01: Project scope — SmallFarmsAgents only

**EyalAmit is deferred from S003-P019.**

Rationale:
- EyalAmit is an active client-delivery project (WordPress rebuild, M2 currently in QA/staging phase, docs dated 2026-04-07/09). Onboarding mid-delivery would disrupt the client relationship.
- EyalAmit operates as a web agency project with CLIENT_HUB_STANDARD governance — a fundamentally different paradigm than the product/agent paradigm that Lean Kit targets.
- EyalAmit can be reconsidered as S003-P020 (or later) after M2 is complete.

SmallFarmsAgents qualifies because:
- Active product project (not client-service) with 5-team structure (Teams 10/20/50/80/100)
- Mature milestone-based governance (M1-M11 roadmap, milestone G-gates)
- Currently at M9/M10 boundary — natural inflection point for methodology overlay
- Architecture team (Team 100) already active and producing specs

### D-02: Approach — Overlay, not migration

SmallFarmsAgents keeps its existing governance (ROADMAP.md, _COMMUNICATION/ structure, team assignments). The Lean Kit is added AS AN OVERLAY:

| What we ADD | What we DO NOT touch |
|-------------|---------------------|
| `agents-os/projects/smallfarmsagents.yaml` — project registry entry | Existing ROADMAP.md |
| `agents-os/projects/sfa/roadmap.yaml` — Lean Kit roadmap mapping existing milestones | Existing _COMMUNICATION/ folder structure |
| `agents-os/projects/sfa/team_assignments.yaml` — Lean role → SFA team mapping | Existing team docs and gate records |
| One pilot WP at L-GATE_S (spec + auth gate) | Existing milestone progression |

### D-03: Deployment profile

L0 — Lean/Manual. No AOS snapshot required for SmallFarmsAgents.
Rationale: SmallFarmsAgents has its own agent infrastructure and is not an AOS-engine consumer. L0 = methodology documents only (roadmap.yaml, team_assignments.yaml, Lean Gate Model).

### D-04: Team mapping (SmallFarmsAgents → Lean roles)

| Lean Role | Lean Kit canonical | SFA equivalent |
|-----------|------------------|----------------|
| ORCHESTRATOR | team_10 or team_11 | SFA Team 10 (Feature Dev / Gateway) |
| SPEC_AUTHOR | team_170 | SFA Team 100 (Architecture) |
| CONSTITUTIONAL_VALIDATOR | team_190 | SFA Team 50 (QA — cross-engine validation role) |
| ARCH_APPROVER | team_00 | Nimrod (SFA project lead) |
| IMPLEMENTATION_TEAM | teams 20/30/40 | SFA Team 20 (Infra) + Team 10 (Feature) |

Note: team_assignments.yaml declares actual team IDs and engines; these do not need to match TikTrack IDs.

### D-05: Pilot Work Package selection

The pilot WP is selected from SFA's M10 scope (next active milestone after M9 Site Optimization CLOSED).
Team 170 reads `_COMMUNICATION/team_100/` in SmallFarmsAgents to identify the first M10 work package and maps it as the Lean pilot WP. The pilot must reach L-GATE_S (spec + auth) before P019 is declared complete.

---

## §2 — Deliverables

| # | Deliverable | Path (agents-os repo) | Owner |
|---|------------|----------------------|-------|
| D1 | Project registry entry | `projects/smallfarmsagents.yaml` | Team 170 |
| D2 | Lean Kit roadmap | `projects/sfa/roadmap.yaml` | Team 170 |
| D3 | Team assignments | `projects/sfa/team_assignments.yaml` | Team 170 |
| D4 | Milestone mapping doc | `projects/sfa/MILESTONE_MAP.md` | Team 170 |
| D5 | Pilot WP at L-GATE_S | One WP entry in roadmap.yaml with `current_lean_gate: L-GATE_S` | Team 170 |
| D6 | Lessons learned | `projects/sfa/LESSONS_LEARNED.md` | Team 170 |

---

## §3 — `projects/smallfarmsagents.yaml` schema (required fields)

```yaml
id: smallfarmsagents
name: SmallFarmsAgents — OrganicMarketAgent
profile: L0
lean_kit_version: "0.1.0-scaffold"
owner: nimrod
created: "2026-04-03"
repo: "github.com/WaldNimrod/SmallFarmsAgents"
local_path: "/Users/nimrod/Documents/SmallFarmsAgents"
domain: smallfarmsagents
description: >
  Community AI agent platform for Israel's organic farming market.
  OrganicMarketAgent: community price index for organic vegetables.
team_assignments_ref: "projects/sfa/team_assignments.yaml"
roadmap_ref: "projects/sfa/roadmap.yaml"
deployment_profile: L0
aos_snapshot_required: false
active_milestone: M10
notes: "Overlay model — existing governance preserved. Lean Kit added as methodology layer only."
```

---

## §4 — `projects/sfa/roadmap.yaml` structure (required)

Must include:
- `project.id`, `project.name`, `project.profile: L0`, `project.lean_kit_version`
- `lod_status convention` header comment (verbatim two-line form)
- At least one WP mapped from SFA's M10 scope with:
  - `id`, `name`, `current_lean_gate: L-GATE_S`
  - `lod_status: LOD200` (pilot spec at LOD200 level)
  - `team_lead`, `validator`

---

## §5 — `projects/sfa/team_assignments.yaml` structure (required)

```yaml
project: smallfarmsagents
profile: L0
teams:
  - id: sfa_team_100
    name: "SFA Architecture (Team 100)"
    engine: cursor
    lean_role: SPEC_AUTHOR
    contact: nimrod
  - id: sfa_team_10
    name: "SFA Feature Dev / Gateway (Team 10)"
    engine: cursor
    lean_role: ORCHESTRATOR
  - id: sfa_team_50
    name: "SFA QA (Team 50)"
    engine: openai
    lean_role: CONSTITUTIONAL_VALIDATOR
  - id: sfa_team_20
    name: "SFA Infrastructure (Team 20)"
    engine: cursor
    lean_role: IMPLEMENTATION_TEAM
  - id: nimrod
    name: "Nimrod (Project Lead)"
    engine: human
    lean_role: ARCH_APPROVER
cross_engine_validator: sfa_team_50
iron_rule_note: >
  Cross-engine validation Iron Rule applies. sfa_team_50 (OpenAI) validates
  deliverables built by sfa_team_10/sfa_team_20 (Cursor). Different engines required.
```

---

## §6 — `projects/sfa/MILESTONE_MAP.md` (required content)

Maps SFA milestone model to Lean Gate Model:

| SFA Milestone | Lean Gate equivalent | Notes |
|---------------|---------------------|-------|
| G1 (env + DB ready) | L-GATE_B (build gate) | Infrastructure milestone |
| G2 (feature implemented) | L-GATE_B | Feature completion |
| G3/QA PASS | L-GATE_V (validate) | QA = cross-engine validation |
| Milestone N CLOSED | L-GATE_V PASS | Milestone closure = validation locked |

---

## §7 — Acceptance Criteria

| AC | Criterion | Test |
|----|-----------|------|
| AC-01 | `agents-os/projects/smallfarmsagents.yaml` exists, YAML valid, all required fields | `yaml.safe_load()` → no exception |
| AC-02 | `projects/sfa/roadmap.yaml` exists, verbatim `lod_status` header, ≥1 WP at L-GATE_S | file present + grep |
| AC-03 | `projects/sfa/team_assignments.yaml` exists, all 5 team entries, `cross_engine_validator` set | yaml valid + field check |
| AC-04 | `projects/sfa/MILESTONE_MAP.md` exists, ≥4 mapping rows | file present, non-empty |
| AC-05 | `projects/sfa/LESSONS_LEARNED.md` exists, ≥200 words, covers: role mapping challenges, overlay approach assessment, recommendation for EyalAmit timing | wc -w ≥ 200 |
| AC-06 | Pilot WP `current_lean_gate: L-GATE_S` — spec documented at LOD200+ | lod_status ≥ LOD200 |
| AC-07 | No changes to SmallFarmsAgents repo files (overlay only — no writes to `/Users/nimrod/Documents/SmallFarmsAgents/`) | git status on SFA repo shows clean |
| AC-08 | `yaml.safe_load` on all 3 YAML files passes | no exception |
| AC-09 | Iron Rule declared in team_assignments.yaml | `cross_engine_validator:` field present, different engine from builder |
| AC-10 | Commit pushed to `agents-os` remote `main` | git log shows new commit on origin/main |

---

## §8 — Out of scope (explicit)

- EyalAmit — deferred
- Any changes to SmallFarmsAgents application code or existing governance
- AOS snapshot installation in SmallFarmsAgents repo
- Running the AOS pipeline engine for SmallFarmsAgents (L0 = documents only)
- Migrating SFA team IDs to TikTrack numbering conventions

---

## §9 — Sequencing

```
Pre-condition: S003-P018 GATE_5 PASS ✓ (2026-04-03)

L-GATE_E: Team 170 reads: TEAM_00_LOD200_S003_P019_... (this doc)
           + SmallFarmsAgents/_COMMUNICATION/ROADMAP.md
           + SmallFarmsAgents/_COMMUNICATION/team_100/ (latest specs)
L-GATE_C: Team 100 reviews concept (confirm overlay approach, pilot WP selection)
L-GATE_S: Team 170 writes deliverables D1–D6
L-GATE_B: Team 170 commits + pushes to agents-os
L-GATE_V: Team 190 validates AC-01..AC-10

Post-condition: agents-os/projects/smallfarmsagents.yaml locked → S004-P009 (Generator) informed
```

---

## §10 — EyalAmit re-evaluation trigger

EyalAmit can be re-evaluated for Lean onboarding when:
1. M2 (WordPress rebuild) is COMPLETE and GATE_5 PASS in EyalAmit repo
2. Client (Eyal Amit) has signed off on M2 deliverables
3. Nimrod explicitly requests P020 (EyalAmit Lean onboarding)

Not before.

---

**log_entry | TEAM_00 | LOD200_APPROVED | S003_P019 | SMALLFARMSAGENTS_LEAN_ONBOARDING | GATE_L-GATE_E_AUTHORIZED | EYALAMIT_DEFERRED | 2026-04-03**
