# LOD Standard — Delta Document: v0.2 → v0.3

**date:** 2026-04-02
**Prepared by:** Team 100
**Purpose:** Document every change from v0.2 to v0.3, with rationale for each decision.
**Companion document:** `TEAM_100_LOD_STANDARD_v0.3.md`
**Predecessor delta:** `TEAM_100_LOD_STANDARD_DELTA_v0.1_to_v0.2.md`

---

## Overview

v0.3 makes 9 categories of changes. The most significant change is the introduction of the **Methodology/Deployment Split**, which is the foundational principle enabling everything else. In addition to architectural extensions (deployment profiles, Lean Gate Model, Lean Kit, team structure, overlays), v0.3 also makes targeted corrections to LOD100 and LOD200 required-content lists (restoring items that were inadvertently absent from v0.2) and revises the anti-patterns list (expanding from 8 to 15, restoring dropped items, adding deployment-profile-aware patterns). Authority matrix is unchanged. Versioning policy and gate mapping are unchanged.

v0.3 is released as RELEASE_CANDIDATE. It becomes v1.0.0 upon Team 00 formal approval and relocation to `documentation/docs-governance/`.

---

## Change 1 — Methodology/Deployment Split: new foundational principle (§2, §3)

### What changed
Added a new foundational principle: **Methodology (what we do) is permanently separated from Deployment (how we enforce it).**

This principle is now stated explicitly in §2 and governs all subsequent sections. A corresponding **Deployment Profiles table** was added in §3.

### Previous state (v0.2)
v0.2 described the LOD standard as operating within AOS v3 (the pipeline system). The §AOS overlay section provided enforcement details. There was no explicit concept of the standard existing independently of the system that enforces it.

### Logic
The problem this solves: the LOD standard is a description of *what quality looks like at each planning level*. This is methodology — it does not change based on whether you are running a full CI/CD pipeline or editing YAML files manually.

If the standard is only described relative to AOS v3, then:
1. Small projects cannot adopt it (they cannot afford AOS v3 infrastructure)
2. The standard "breaks" whenever AOS v3 is unavailable or in transition
3. New deployment profiles (L0, L3) have no natural home in the standard

The split means the standard is written once, read the same way everywhere, and enforcement varies by profile. The Gate Model section (§6) now has sub-sections per profile. The overlays (§14, §15, §16) specify enforcement for each.

### Impact on the standard structure
This change causes every section that previously assumed AOS v3 to be generalized. AOS v3 specifics are moved to §15 (L2 overlay). New §14 (L0 overlay) and §16 (L3 placeholder) added. The standard itself now reads without any deployment assumption.

### Locked reference
`_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_METHODOLOGY_DEPLOYMENT_SPLIT_v1.0.0.md` (2026-04-02)

---

## Change 2 — Deployment Profiles table (§3)

### What changed
Added a new §3 defining three deployment profiles with canonical names:

| Profile | Canonical name | Infrastructure | Status |
|---------|---------------|---------------|--------|
| L0 | Lean / Manual | None — documents + YAML files | ACTIVE |
| L1 | (eliminated) | — | ELIMINATED |
| L2 | AOS v3 / Dashboard | Full pipeline + DB + API + UI | ACTIVE |
| L3 | AOS v4 / CLI | Full CANONICAL_AUTO | FUTURE |

### Previous state (v0.2)
No deployment profile concept. The standard implicitly assumed L2 (AOS v3). The three operating modes (manual / dashboard / auto) that had been informally discussed were not canonically defined anywhere.

### Logic
L1 ("AOS manual mode") was eliminated because it described a state that doesn't actually exist: using the AOS infrastructure but running it manually. In practice, this was either L0 (no AOS infrastructure at all) or early L2. Naming a non-existent intermediate caused confusion. L0 cleanly replaces it.

L3 is registered as future to make the roadmap clear without pretending it is currently buildable. The standard must not describe mechanisms that don't exist yet. §16 is a placeholder only.

### Canonical names — locked
- L0 = "Lean" or "Lean/Manual"
- L2 = "AOS v3" or "AOS v3/Dashboard"
- L3 = "AOS v4" or "AOS v4/CLI"
- Never "manual mode", "dashboard mode", "auto mode" (old informal names)

---

## Change 3 — Lean Gate Model: two compressed tracks (§6.3)

### What changed
Added §6.3 defining two Lean gate sequences for L0 operation, alongside the existing AOS v3 gate sequence (now §6.1).

**Track A — 4 gates:**
```
L-GATE_E (Eligibility) → L-GATE_S (Spec + Auth) → L-GATE_B (Build + QA) → L-GATE_V (Validate + Lock)
```

**Track B — 5 gates:**
```
L-GATE_E (Eligibility) → L-GATE_C (Concept) → L-GATE_S (Spec + Auth) → L-GATE_B (Build + QA) → L-GATE_V (Validate + Lock)
```

Also added: **Artifact simplification table** showing how AOS v3 gate artifacts compress in Lean.

### Previous state (v0.2)
Only the AOS v3 gate model (GATE_0 through GATE_5) was defined. No equivalent model for non-pipeline operation existed.

### Logic for compression
Track A compresses 6 AOS gates into 4 Lean gates because:
- GATE_1 (spec approval) and GATE_2 (exec authorization) are merged into L-GATE_S: in Lean, the human orchestrator approves and authorizes in the same review step
- GATE_3 (build) and GATE_4 (QA, same-engine) are merged into L-GATE_B: same executor can self-review for simple features where cross-engine QA at GATE_4 level is disproportionate
- L-GATE_V = GATE_5 exactly: cross-engine validation is **always kept, never compressed**

Track B adds L-GATE_C (concept) for complex features where system behavior cannot be determined from concept alone — equivalent to LOD300 (Track B in the LOD hierarchy), which is not coincidental.

### L-GATE_V is immovable
The cross-engine validation gate (L-GATE_V = GATE_5) is never compressed, never merged, never optional. This is an Iron Rule from the Cross-Engine Validation Principle. In L0, the validator must be a different engine than the builder, declared in `team_assignments.yaml`.

### Artifact simplification table (summary)
| AOS v3 artifact | Lean equivalent |
|----------------|-----------------|
| pipeline_state.json | roadmap.yaml (WP state block) |
| LOD400 spec document | LOD400 spec doc (same) |
| GATE_1 approval record | L-GATE_S sign-off note (brief) |
| GATE_2 mandate | Combined in L-GATE_S approval |
| GATE_4 test report | Builder's self-QA checklist |
| GATE_5 validation record | L-GATE_V independent review (same depth) |

---

## Change 4 — Lean Kit architecture (§10)

### What changed
Added new §10: **Lean Kit Architecture**. Defines what the Lean Kit is, how it is maintained, how projects use it, and the planned build WPs.

Key definitions added:
- **Lean Kit**: standalone repo (separate from AOS repo), snapshot model
- **Snapshot model**: new project clones Lean Kit at a specific version tag; no automatic sync; `LEAN_KIT_VERSION.md` records which snapshot is in use
- **roadmap.yaml**: L0 work package state registry, mirrors AOS DB schema, enables clean upgrade to L2 via future import script
- **team_assignments.yaml**: L0 team registry, declares builder and validator engines per WP (enforces cross-engine rule in L0)

### Previous state (v0.2)
No concept of Lean Kit or project creation infrastructure.

### Logic
The snapshot model (no auto-sync) was chosen after considering three options:
1. Git submodule — rejected: complex, merge conflicts, must-update pressure
2. Package manager (npm/pip) — rejected: overkill for a doc/template kit, adds build tooling dependency
3. **Snapshot + propagation procedure** — adopted: simple, predictable, explicit. When a critical methodology update occurs, the maintainer issues a propagation procedure document. Projects update on their own schedule.

This matches how canonical standards work in practice (e.g., ISO standards don't auto-push to factories; organizations update their processes when they choose to adopt a new version).

`roadmap.yaml` is critical for the L0→L2 migration path. If a project starts in L0 and later wants L2 (full pipeline), the import script reads `roadmap.yaml` and populates the AOS DB. Without `roadmap.yaml`, migration requires manual data entry.

### Future WPs registered
Four canonical Lean Kit WPs registered in `agents_os_v3/definition.yaml`:
- `LEAN-KIT-WP001`: BUILD_LEAN_KIT_REPO — standalone repository with templates, roles, gate model
- `LEAN-KIT-WP002`: BUILD_LEAN_KIT_GENERATOR — script to generate project from Lean Kit snapshot
- `LEAN-KIT-WP003`: BUILD_LEAN_TO_AOS_UPGRADE — migration path from L0 to L2
- `LEAN-KIT-WP004`: BUILD_PROJECT_SCAFFOLDING_CLI — new project creation CLI for both profiles

---

## Change 5 — §9 Team structure expanded (§9)

### What changed
§9 was substantially expanded from a brief overview to a full specification covering:
- **Role types table** — 5 canonical role types: System Designer, Architecture Agent, Builder Agent, QA/Validator Agent, Documentation Agent
- **Minimum viable team** — smallest possible team structure that satisfies Iron Rules (3 roles minimum: one builder, one validator [different engine], one documenter [or combined with validator])
- **Team creation procedure** — steps to create a new team: assign role type, assign engine, register in team_assignments.yaml (L0) or definition.yaml (L2), declare skills
- **Skills per role type** — canonical skills for each role type; what a builder agent must be able to do vs. what a validator must be able to do

### Previous state (v0.2)
§9 contained a brief agentic system mapping (4 agent types) with no guidance on team creation or minimum viable team structure.

### Logic
As the standard is intended for new projects (not just the existing TikTrack/AOS setup), readers need actionable guidance on how to staff a project. Without a minimum viable team definition and skills specification, the standard describes *what to produce* but not *who can produce it*.

The 3-role minimum is derived from the Iron Rule: cross-engine validation requires at minimum (builder ≠ validator). Documentation is a separate concern that may be handled by the validator in a minimal setup.

### Connection to Lean Kit
The role types table will be a core template in `lean-kit/team_roles/`. New projects clone the Lean Kit and see exactly what skills are needed for each agent they register.

---

## Change 6 — §Lean overlay added (§14)

### What changed
New §14: **Lean Overlay (L0 Profile)**. Describes the specific process for operating the LOD standard in L0 (no pipeline infrastructure).

Contents:
- `roadmap.yaml` schema (full) and required fields per WP
- `team_assignments.yaml` schema and required fields
- L0 gate execution procedure (how each L-GATE is conducted without tooling)
- Human role in L0: **orchestrator only** — routes requests, escalates, never approves content
- Cross-engine validation enforcement in L0: declared statically in `team_assignments.yaml`; validator must be different engine than builder; human does not substitute for validator

### Previous state (v0.2)
No L0-specific section. AOS v3 overlay (§AOS in v0.2) was the only deployment context described.

### Critical rule: Human ≠ Content Approver in L0
In L0, the human (Nimrod / Team 00) is the **orchestrator** — they route work to agents, receive outputs, and escalate decisions. They are **never** the content reviewer substituting for a cross-engine validator. If the validator engine is unavailable, the WP waits — it does not advance on human approval alone.

This is a non-negotiable corollary of the Cross-Engine Validation Iron Rule. An all-human review does not provide the statistical independence that different LLM engines provide.

---

## Change 7 — §AOS v3 overlay updated to §L2 (§15)

### What changed
Renamed from "§AOS overlay" to "§L2 overlay (AOS v3 / Dashboard)". Added explicit labeling of this section as L2-specific. Added two interaction modes:

| Mode | Description |
|------|-------------|
| Chat mode | Human operates via conversation interface (Cursor, Claude Code); gate prompts delivered as chat messages; state tracked manually or via pipeline_run.sh |
| Dashboard mode | Human operates via agents_os_v3 UI; gate prompts generated by pipeline engine; state tracked in pipeline_state.json + DB |

Both modes enforce the same gate model and LOD requirements. The mode affects how gate prompts are delivered, not what they require.

### Previous state (v0.2)
§AOS overlay described a single interaction model without distinguishing between chat-based and UI-based operation.

### Logic
In practice, different teams operate in different modes within the same project. Team 100 (Claude Code) operates in Chat mode; Team 61 (Cursor) operates in Chat mode via Cursor; Team 90 (API) operates in API/Auto mode. The Dashboard mode is primarily used for oversight and progress tracking, not for agent-to-agent interaction.

Making the modes explicit prevents confusion when an agent receives instructions from a different delivery mechanism than it expects.

---

## Summary of all changes

| Change | Category | LOD definitions changed? | Gate model changed? | New section? | Impact |
|--------|----------|--------------------------|---------------------|--------------|--------|
| Methodology/Deployment Split | Foundational principle | No | No | Adds to §2, §3 | HIGH |
| Deployment Profiles table | Architecture | No | No | New §3 | HIGH |
| Lean Gate Model (Track A + B) | Gate model | No | YES — Lean model added | New §6.3 | HIGH |
| Lean Kit architecture | Infrastructure | No | No | New §10 | MEDIUM |
| Team structure expanded | Guidance | No | No | Expands §9 | MEDIUM |
| §Lean overlay | L0 process | No | No | New §14 | HIGH |
| §AOS v3 overlay updated | L2 labeling | No | No | Updates §15 | LOW |
| LOD100/LOD200 required-content corrections | Core definitions | **YES** | No | Updates §5 | MEDIUM |
| Anti-patterns list revised | Quality rules | **YES** | No | Updates §13 | MEDIUM |

**Authority matrix: unchanged from v0.2.**
**Cross-engine validation Iron Rule: unchanged but now explicitly applies to ALL profiles.**
**Versioning policy: unchanged from v0.2.**
**Gate mapping (LOD200→GATE_1, LOD400→GATE_2, LOD500→GATE_5): unchanged.**

---

## Change 8 — LOD100 and LOD200 required-content corrections (§5)

### What changed

**LOD100:** Added a sixth required item that was absent from v0.2:
- *Open questions or blocking assumptions* — must be surfaced even if unresolved; cannot be omitted

**LOD200:** Restored four required items from v0.2 that were missing from early v0.3 drafts, and retained two new items introduced by the Methodology/Deployment Split work:

Items restored from v0.2:
- *LOD100 content confirmed or refined* — problem statement still accurate before proceeding
- *Proposed solution concept* — what kind of system or approach are we building?
- *Dependencies and constraints*
- *Initial success criteria*

Items added in v0.3 (new, not in v0.2):
- *Risk classification* (Low / Medium / High / Critical) — required to determine gate sequence
- *Track declaration* (A or B) — required for Lean Gate Model routing

### Previous state (v0.2)
LOD200 in v0.2 required: LOD100 confirmation, proposed solution, major components, primary flows, major components, dependencies/constraints, key unresolved decisions, initial success criteria (8 items total). LOD100 required 5 items. Both were correct but underdocumented in early v0.3 drafts.

### Logic
The LOD200 additions (risk classification, track declaration) were introduced as part of the Lean Gate Model — without a declared track and risk level, the gate routing system cannot determine which gate sequence to apply. These are structural requirements, not optional metadata.

---

## Change 9 — Anti-patterns list revised (§13)

### What changed

Anti-patterns list expanded from 8 (v0.2) to 15 (v0.3).

**Three anti-patterns from v0.2 were inadvertently dropped in early v0.3 drafts — restored:**
- *Inflated LOD* — writing LOD400 detail in a LOD200 document; bypasses concept gate
- *Mixed-state document* — single document with content at multiple LOD levels
- *Hidden ambiguity* — deliberately or accidentally omitting known open questions

**Seven new anti-patterns added in v0.3:**
- *Spec-less build* — builder starts before LOD400 approved
- *Profile-based spec reduction* — arguing Lean mode requires less rigorous specs
- *Same-engine validation* — same LLM provider for build and final validation
- *Undeclared track* — starting build without explicitly declaring Track A or B
- *LOD500 without spec_ref* — as-built record with no traceable link to LOD400
- *Cross-gate confusion* — merging GATE_5/L-GATE_V with any other gate
- *Version drift* — LOD500 references superseded LOD400 version without documenting delta

These additions are directly driven by the Lean Gate Model introduction (new failure modes) and deployment profile addition (new incorrect arguments teams may use).

---

## What v0.3 does NOT change

The following remain exactly as defined in v0.2:
- Declaration authority matrix (who produces, who approves each level)
- Versioning policy
- Machine-readable YAML frontmatter spec
- Gate mapping (LOD200 → GATE_1, LOD400 → GATE_2, LOD500 → GATE_5)
- Cross-engine validation rule (unchanged; scope expanded to explicitly cover L0)
- LOD300, LOD400, LOD500 definitions and required contents (unchanged from v0.2)

---

## Promotion path: v0.3 → v1.0.0

v0.3 is a RELEASE_CANDIDATE. Promotion requires:
1. **Team 00 formal approval** — review and sign-off via `_COMMUNICATION/team_00/` approval document
2. **Team 170 execution** — move to `documentation/docs-governance/LOD_STANDARD_v1.0.0.md`; update `GOVERNANCE_PROCEDURES_INDEX.md`; update `00_MASTER_DOCUMENTATION_TABLE_v1.0.0.md`
3. **Team 190 validation** — cross-engine review of v0.3 content and promotion procedure

No functional changes are expected between v0.3 and v1.0.0 — only status change and canonical relocation.

---

*log_entry | TEAM_100 | LOD_STANDARD_DELTA_v0.2_to_v0.3 | 2026-04-02*
