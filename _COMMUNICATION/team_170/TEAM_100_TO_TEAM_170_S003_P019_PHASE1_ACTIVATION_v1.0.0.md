---
id: TEAM_100_TO_TEAM_170_S003_P019_PHASE1_ACTIVATION_v1.0.0
from: Team 100 (Architecture)
to: Team 170 (Documentation)
cc: Team 00 (Principal), Team 190 (L-GATE_V validator)
date: 2026-04-04
type: BUILD_ACTIVATION
program_id: S003-P019
domain: AGENTS_OS
lod_source: TEAM_00_LOD200_S003_P019_SMALLFARMSAGENTS_LEAN_ONBOARDING_v1.0.0.md
gate_entry: L-GATE_E (Track B)
gate_5_validator: Team 190
status: ACTIVE
pre_condition: S003-P018 GATE_5 PASS ✓ 2026-04-03
---

# Activation — S003-P019 Phase 1: SmallFarmsAgents Lean Kit Infrastructure
## Team 170 | L-GATE_E through L-GATE_B | agents-os repo

---

## §1 — Identity and Authority

**You are Team 170 (Documentation), executing S003-P019 Phase 1.**

Program: **S003-P019 — Lean Kit Adoption — SmallFarmsAgents**
Track: **B** (L-GATE_E → L-GATE_C → L-GATE_S → L-GATE_B → L-GATE_V)
Authority: Team 100 mandate, Team 00 LOD200 APPROVED 2026-04-04.
Cross-engine validation: Team 190 (OpenAI) validates at L-GATE_V.

**Do not begin build until you have completed the mandatory reads in §2.**

---

## §2 — Mandatory Reads (complete in order before any file creation)

### 2A — Your authority document (LOD200)
```
/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/_COMMUNICATION/team_00/TEAM_00_LOD200_S003_P019_SMALLFARMSAGENTS_LEAN_ONBOARDING_v1.0.0.md
```
Read in full. Every decision made there is locked. Do not deviate.

### 2B — Lean Kit example project (format reference)
```
/Users/nimrod/Documents/agents-os/lean-kit/examples/example-project/roadmap.yaml
```
Your `projects/sfa/roadmap.yaml` MUST follow this format exactly, including the verbatim `lod_status` header comment.

### 2C — Lean Kit templates (if present)
```
/Users/nimrod/Documents/agents-os/lean-kit/templates/
```
Read any `team_assignments.yaml` or project registry templates present.

### 2D — SmallFarmsAgents ROADMAP.md
```
/Users/nimrod/Documents/SmallFarmsAgents/_COMMUNICATION/ROADMAP.md
```
Read in full. You need: active milestone (M10), M10 phases and status, Gate model (G1–G10), team structure (Teams 10/20/50/80/100).

### 2E — SmallFarmsAgents Architecture docs (M10 active)
```
/Users/nimrod/Documents/SmallFarmsAgents/_COMMUNICATION/TEAM_100/reports/
```
Read the most recent M10 architecture/planning document. Purpose: identify current M10 work to inform pilot WP selection.

### 2F — Existing agents-os projects reference
```
/Users/nimrod/Documents/agents-os/projects/tiktrack.yaml
```
Read as format reference for your `projects/smallfarmsagents.yaml`.

---

## §3 — Context

**What P019 is:**
S003-P019 delivers the Lean Kit methodology infrastructure for SmallFarmsAgents. You are NOT onboarding SFA teams yet (that is Phase 2). You are creating the scaffolding: project registry entry, roadmap, team assignments, milestone map, and a pilot work package that reaches L-GATE_S (spec approved + authorized).

**What P019 is NOT:**
- Not changes to SmallFarmsAgents application code or governance docs
- Not writing to the SmallFarmsAgents repo (AC-07: zero writes to SFA)
- Not running the AOS pipeline engine for SFA
- Not onboarding SFA teams into Lean (Phase 2 handles this)

**Bridge model context:**
SmallFarmsAgents uses L0 (Lean/Manual) profile. No AOS snapshot needed.
All 6 deliverables go into the `agents-os` repository only.

---

## §4 — Deliverables (6 total — all in agents-os repo)

| # | Path | Description |
|---|------|-------------|
| D1 | `projects/smallfarmsagents.yaml` | Project registry entry |
| D2 | `projects/sfa/roadmap.yaml` | Lean Kit roadmap (with pilot WP at L-GATE_S) |
| D3 | `projects/sfa/team_assignments.yaml` | Lean role → SFA team mapping |
| D4 | `projects/sfa/MILESTONE_MAP.md` | SFA milestone → Lean Gate mapping |
| D5 | Pilot WP entry (embedded in D2) | `SFA-P001-WP001` at `current_lean_gate: L-GATE_S` |
| D6 | `projects/sfa/LESSONS_LEARNED.md` | ≥200 words, overlay approach assessment |

All files committed and pushed to `agents-os` remote `main`.

---

## §5 — D1 Specification: `projects/smallfarmsagents.yaml`

Use this exact schema (fill in `created` date as today's date; `lean_kit_version` from the Lean Kit scaffold):

```yaml
id: smallfarmsagents
name: SmallFarmsAgents — OrganicMarketAgent
profile: L0
lean_kit_version: "0.1.0-scaffold"
owner: nimrod
created: "2026-04-04"
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

## §6 — D2 Specification: `projects/sfa/roadmap.yaml`

**REQUIRED: verbatim `lod_status` header comment (exactly as shown):**
```yaml
# lod_status convention: this field records the document type authored
# (LOD100..LOD500), NOT gate closure. Gate closure is tracked in current_lean_gate.
```

**Required structure:**

```yaml
# lod_status convention: this field records the document type authored
# (LOD100..LOD500), NOT gate closure. Gate closure is tracked in current_lean_gate.

project:
  id: smallfarmsagents
  name: "SmallFarmsAgents — OrganicMarketAgent"
  profile: L0
  lean_kit_version: "0.1.0-scaffold"
  created: "2026-04-04"
  owner: nimrod
  active_milestone: M10
  notes: "Overlay model — existing SFA governance unchanged."

work_packages:
  - id: "SFA-P001-WP001"
    label: "Lean Kit Integration Guide — LEAN_KIT_INTEGRATION.md"
    status: IN_PROGRESS
    track: B
    current_lean_gate: L-GATE_S
    lod_status: LOD200
    team_lead: sfa_team_100
    validator: sfa_team_50
    created_at: "2026-04-04"
    milestone_ref: M10
    gate_history:
      - gate: L-GATE_E
        result: PASS
        date: "2026-04-04"
        notes: "Pilot WP eligible — new methodology doc, no application risk."
      - gate: L-GATE_C
        result: PASS
        date: "2026-04-04"
        notes: "Concept approved. Output: LEAN_KIT_INTEGRATION.md — full Lean onboarding guide for all SFA teams."
      - gate: L-GATE_S
        result: PASS
        date: "2026-04-04"
        notes: "LOD200 spec approved. Scope: LEAN_KIT_INTEGRATION.md + team activation prompts. Authorized. Execution = Phase 2 post-P019 COMPLETE."
    spec_ref: "projects/sfa/SFA_P001_WP001_LOD200_SPEC.md"
    notes: "Pilot WP chosen to validate Lean Kit overlay approach. Phase 2 executes L-GATE_B+V."
```

**You must also create** `projects/sfa/SFA_P001_WP001_LOD200_SPEC.md` — this is the LOD200 spec for the pilot WP (referenced in spec_ref above). See §9 for its required content.

---

## §7 — D3 Specification: `projects/sfa/team_assignments.yaml`

```yaml
project: smallfarmsagents
profile: L0
date: "2026-04-04"
teams:
  - id: sfa_team_100
    name: "SFA Architecture (Team 100)"
    engine: cursor
    lean_role: SPEC_AUTHOR
    contact: nimrod
    notes: "Spec authority in SFA. Writes LOD200/LOD400 for all SFA Lean WPs."

  - id: sfa_team_10
    name: "SFA Feature Dev / Gateway (Team 10)"
    engine: cursor
    lean_role: ORCHESTRATOR
    notes: "Routes WPs, manages task flow within SFA milestones."

  - id: sfa_team_50
    name: "SFA QA (Team 50)"
    engine: openai
    lean_role: CONSTITUTIONAL_VALIDATOR
    notes: "Cross-engine validator. Validates all deliverables at L-GATE_V."

  - id: sfa_team_20
    name: "SFA Infrastructure (Team 20)"
    engine: cursor
    lean_role: IMPLEMENTATION_TEAM
    notes: "Implements infrastructure WPs. Paired with sfa_team_10 for feature WPs."

  - id: nimrod
    name: "Nimrod (Project Lead)"
    engine: human
    lean_role: ARCH_APPROVER
    notes: "Only human. Approves at L-GATE_S and L-GATE_V."

cross_engine_validator: sfa_team_50
iron_rule_note: >
  Cross-engine validation Iron Rule applies in all profiles (L0, L2, L3).
  sfa_team_50 (OpenAI) validates deliverables built by sfa_team_10/sfa_team_20 (Cursor).
  Different engines are mandatory — not optional.
lean_gate_model:
  track_a: "L-GATE_E → L-GATE_S → L-GATE_B → L-GATE_V"
  track_b: "L-GATE_E → L-GATE_C → L-GATE_S → L-GATE_B → L-GATE_V"
  current_pilot: "Track B (SFA-P001-WP001)"
```

---

## §8 — D4 Specification: `projects/sfa/MILESTONE_MAP.md`

Document header and required table:

```markdown
# MILESTONE_MAP.md — SmallFarmsAgents Lean Gate Mapping
**project:** smallfarmsagents
**created:** 2026-04-04
**purpose:** Maps SFA milestone/gate model to Lean Gate Model equivalents.

## Mapping Table

| SFA Milestone Gate | SFA Description | Lean Gate Equivalent | Notes |
|-------------------|----------------|---------------------|-------|
| Phase A (Implementation) | Executing team delivers code + tests | L-GATE_B (Build gate) | Builder produces + QAs output |
| Phase B (QA Validation) | Team 50 runs integration/regression/E2E | L-GATE_V (Validate gate) | Cross-engine validation |
| Gₙ PASS | Team 50 sign-off; milestone unlocks next | L-GATE_V PASS | Gate closure = lifecycle step complete |
| Milestone N CLOSED | Full Phase A+B+C complete | WP status: COMPLETE | Equivalent to GATE_5 Phase 2 |
| Architecture spec issued | Team 100 publishes mandate/spec | L-GATE_S (Spec + auth) | LOD200 equiv = mandate/spec doc |
| Concept review | Nimrod or Team 100 reviews approach | L-GATE_C (Concept) | Track B only |

## Active Mapping (M10)

| SFA M10 Phase | Active WPs | Lean Equivalent |
|---------------|-----------|----------------|
| M10.1 | COMPLETE | L-GATE_V PASS |
| M10.2 Dictionary Optimization | Team 10 active | L-GATE_B (in progress) |
| M10.3 Static HTML Parsers | Team 10 active | L-GATE_B (in progress) |
| M10.4 Headless Browser Infra | PLANNED | L-GATE_E (not yet started) |
| M10.5 CSA Basket Sources | PLANNED | L-GATE_E (blocked on M10.4) |

## Notes on Overlay Approach

The Lean Gate Model is applied AS AN OVERLAY to SFA's existing governance. SFA teams continue
to use their existing ROADMAP.md, mandate docs, and QA mandate structure. The Lean Kit adds a
parallel methodology view — it does not replace or conflict with SFA's gate model.

Equivalence is approximate: the Lean Kit's L-GATE_V (cross-engine validation) aligns closely
with SFA's Phase B (Team 50 QA), since both require a different-engine validator to pass.
```

---

## §9 — D5/D2 supplement: `projects/sfa/SFA_P001_WP001_LOD200_SPEC.md`

This is the LOD200 spec for the pilot WP (referenced in roadmap.yaml spec_ref). Required content:

```markdown
---
lod_target: LOD200
lod_status: APPROVED
program_id: SFA-P001
wp_id: SFA-P001-WP001
label: Lean Kit Integration Guide — LEAN_KIT_INTEGRATION.md
current_lean_gate: L-GATE_S
date: 2026-04-04
authoring_team: team_170
approved_by: Team 00 (via P019 LOD200)
---

# LOD200 — SFA-P001-WP001: Lean Kit Integration Guide

## §1 — Objective

Produce `LEAN_KIT_INTEGRATION.md` in the SmallFarmsAgents repository and one activation
prompt document per SFA team. Together these give every SFA team their Lean context and
enable immediate execution of their first Lean WP.

## §2 — Deliverables (Phase 2 — post-P019 COMPLETE)

| # | File | Location |
|---|------|----------|
| PD1 | `LEAN_KIT_INTEGRATION.md` | `SmallFarmsAgents/_COMMUNICATION/` |
| PD2 | `LEAN_KIT_ACTIVATION_TEAM100.md` | `SmallFarmsAgents/_COMMUNICATION/TEAM_100/` |
| PD3 | `LEAN_KIT_ACTIVATION_TEAM10.md` | `SmallFarmsAgents/_COMMUNICATION/TEAM_10/` |
| PD4 | `LEAN_KIT_ACTIVATION_TEAM20.md` | `SmallFarmsAgents/_COMMUNICATION/TEAM_20/` |
| PD5 | `LEAN_KIT_ACTIVATION_TEAM50.md` | `SmallFarmsAgents/_COMMUNICATION/TEAM_50/` |

## §3 — LEAN_KIT_INTEGRATION.md required sections

1. What is the Lean Kit (2-3 paragraphs, non-technical)
2. Why SmallFarmsAgents is adopting it at M10 (overlay rationale)
3. Team role map (SFA team → Lean role table from team_assignments.yaml)
4. Lean Gate Model summary for SFA context (4-gate Track B visual)
5. Pilot WP: SFA-P001-WP001 — what it is and what each team does
6. Where to find Lean Kit docs (agents-os repo paths)
7. Iron Rule — cross-engine validation (why sfa_team_50 must be OpenAI)

## §4 — Acceptance Criteria (for Phase 2 execution)

| AC | Criterion |
|----|-----------|
| PAC-01 | LEAN_KIT_INTEGRATION.md exists, ≥600 words, all 7 sections present |
| PAC-02 | All 4 team activation docs exist, ≥150 words each |
| PAC-03 | Each activation doc begins with identity, role, and first action |
| PAC-04 | sfa_team_50 (OpenAI) reviews and PASSES the package |
| PAC-05 | No application code modified in SmallFarmsAgents |
| PAC-06 | Committed to SmallFarmsAgents repo (not agents-os) |
```

---

## §10 — D6 Specification: `projects/sfa/LESSONS_LEARNED.md`

Minimum ≥200 words. Must cover:
1. **Role mapping challenges** — where SFA teams map cleanly vs. where there was ambiguity
2. **Overlay approach assessment** — what worked about the "no changes to SFA governance" approach
3. **Pilot WP selection rationale** — why LEAN_KIT_INTEGRATION.md was chosen as the pilot
4. **Recommendation for EyalAmit timing** — based on observations from SFA onboarding

---

## §11 — Gate History to Record

After completing all deliverables:

**L-GATE_E:** Record PASS on `SFA-P001-WP001` — eligibility confirmed (pilot WP is low-risk methodology doc).

**L-GATE_C:** Record PASS — concept approved: output = LEAN_KIT_INTEGRATION.md + team activations.

**L-GATE_S:** Record PASS — LOD200 spec (`SFA_P001_WP001_LOD200_SPEC.md`) exists and is approved. Execution authorized for Phase 2.

These three gate records go in `projects/sfa/roadmap.yaml` `gate_history` array for `SFA-P001-WP001`.

---

## §12 — Acceptance Criteria (Team 190 will validate these)

| AC | Criterion | Test |
|----|-----------|------|
| AC-01 | `agents-os/projects/smallfarmsagents.yaml` exists, YAML valid, all required fields | `yaml.safe_load()` → no exception |
| AC-02 | `projects/sfa/roadmap.yaml` exists, verbatim `lod_status` header comment, ≥1 WP at `current_lean_gate: L-GATE_S` | file present + grep verbatim lines |
| AC-03 | `projects/sfa/team_assignments.yaml` exists, all 5 team entries, `cross_engine_validator: sfa_team_50` | yaml valid + field check |
| AC-04 | `projects/sfa/MILESTONE_MAP.md` exists, ≥4 mapping rows | file present, non-empty |
| AC-05 | `projects/sfa/LESSONS_LEARNED.md` exists, ≥200 words, covers role mapping + overlay assessment + EyalAmit recommendation | wc -w ≥ 200 + section check |
| AC-06 | Pilot WP `current_lean_gate: L-GATE_S`, `lod_status: LOD200` | grep in roadmap.yaml |
| AC-07 | Zero writes to `/Users/nimrod/Documents/SmallFarmsAgents/` | git status on SFA repo: clean |
| AC-08 | `yaml.safe_load()` on all 3 YAML files (smallfarmsagents.yaml, roadmap.yaml, team_assignments.yaml) passes | no exception |
| AC-09 | `cross_engine_validator: sfa_team_50` in team_assignments.yaml; sfa_team_50 engine = openai (different from builders: cursor) | field present + engine check |
| AC-10 | Commit pushed to `agents-os` remote `main`; new commit visible on `origin/main` | `git log origin/main` shows new commit |

---

## §13 — Execution Constraints

**Repository paths:**
- agents-os: `/Users/nimrod/Documents/agents-os/`
- SmallFarmsAgents: `/Users/nimrod/Documents/SmallFarmsAgents/` — **READ ONLY during Phase 1**

**Iron Rule — Cross-Engine Validation:**
Team 170 (Cursor) builds → Team 190 (OpenAI) validates at L-GATE_V.
This is non-negotiable.

**DO NOT:**
- Write any file into `/Users/nimrod/Documents/SmallFarmsAgents/` (that is Phase 2)
- Modify existing agents-os files outside `projects/`
- Touch TikTrack repo during this build

---

## §14 — Completion Report

On completion, file:
```
/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/_COMMUNICATION/_ARCHITECT_INBOX/TEAM_170_TO_TEAM_100_S003_P019_PHASE1_COMPLETION_REPORT_v1.0.0.md
```

Required header fields:
```yaml
from: Team 170
to: Team 100
cc: Team 00, Team 190
date: <today>
program_id: S003-P019
phase: Phase 1 (agents-os infrastructure)
acs_pass: <list>
acs_fail: <list or empty>
git_commit_sha: <sha on agents-os main>
pilot_wp_spec_ref: projects/sfa/SFA_P001_WP001_LOD200_SPEC.md
overall_verdict: PASS / PASS_WITH_FINDINGS / FAIL
```

Self-QA before filing:
- [ ] AC-01..AC-10 all tested
- [ ] `projects/sfa/` directory: D1–D6 all present
- [ ] roadmap.yaml verbatim header check: `grep "this field records the document type authored"` returns a match
- [ ] `sfa_team_50` engine = `openai` in team_assignments.yaml
- [ ] Zero git changes in `/Users/nimrod/Documents/SmallFarmsAgents/`
- [ ] Push to `origin/main` confirmed

---

## §15 — Next Steps After Completion Report

1. Team 190 receives L-GATE_V validation request (this document's companion: `TEAM_100_TO_TEAM_190_S003_P019_LGATE_V_VALIDATION_v1.0.0.md`)
2. L-GATE_V PASS → S003-P019 LIFECYCLE COMPLETE
3. Phase 2 activates: Team 170 writes SFA onboarding docs in SmallFarmsAgents repo

---

**log_entry | TEAM_100 | S003_P019_PHASE1_BUILD_ACTIVATION | TEAM_170 | L-GATE_E_ENTRY | 2026-04-04**
