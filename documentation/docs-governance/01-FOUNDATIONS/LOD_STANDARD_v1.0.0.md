---
lod_document_type: STANDARD
id: LOD_STANDARD_v1.0.0
version: v1.0.0
status: ACTIVE
supersedes: TEAM_100_LOD_STANDARD_v0.3.md
source_document: _COMMUNICATION/team_100/TEAM_100_LOD_STANDARD_v0.3.md
promoted_on: 2026-04-02
date_approved: 2026-04-02
approved_by: Team 00
authoring_team: team_100
authority: Team 00 (Principal)
date: 2026-04-02
---

# LOD for Software & Agentic Systems — Standard v1.0.0

**Promoted from** `_COMMUNICATION/team_100/TEAM_100_LOD_STANDARD_v0.3.md` **on 2026-04-02** (Team 00 approval).

---

## 1. Why this standard exists

Traditional **LOD (Level of Development / Level of Detail)** comes from
architecture and construction, where it defines the precision to which a
building element is modeled at a given stage.

In software and agentic systems there is no universal equivalent — yet the
need is acute:

> **LOD in software/LLM systems = the degree to which a feature, flow, system,
> or task is defined strongly enough to support aligned execution with minimal
> ambiguity.**

This standard serves:
- product and software teams of any size
- multi-agent / LLM builder pipelines
- specification-heavy environments with handoffs between producers and executors
- any system where the cost of specification ambiguity exceeds the cost of
  specification effort

It is designed to be **cross-project and cross-environment**.
Deployment-specific details are isolated in §Lean and §AOS overlays.

---

## 2. Core principle

Each level answers a different question:

| Level | Question |
|-------|----------|
| **LOD100** | What problem are we solving and why? |
| **LOD200** | What kind of solution are we building? |
| **LOD300** | How should the system behave? *(conditional — see §4)* |
| **LOD400** | What exactly must be built, shown, enforced, and verified? |
| **LOD500** | What was actually implemented, verified, and is true now? |

**The critical distinction between LOD400 and LOD500:**
LOD400 is *prescriptive* (what must be). LOD500 is *descriptive* (what is).
A LOD500 that exactly matches its LOD400 is the ideal outcome. Deviations
must be documented.

---

## 3. Deployment Profiles

The LOD levels and their quality requirements are **identical across all
deployment profiles**. What changes between profiles is the **enforcement
mechanism** — not the standard itself.

| Profile | Name | Infrastructure | Enforcement |
|---------|------|----------------|-------------|
| **L0** | Lean / Manual | None | Human orchestrator routes; documents as state |
| **L2** | AOS v3 / Dashboard | AOS pipeline + DB + UI | Pipeline enforces; DB tracks state |
| **L3** | AOS v4 / CLI | Full automation | CANONICAL_AUTO + auto-advance *(future)* |

> **Iron Rule:** A weak spec in L0 is just as invalid as a weak spec in L2.
> Reducing enforcement does not reduce the specification requirement.

The choice of profile is a project-level deployment decision. The methodology
— LOD levels, gate model, Iron Rules — is identical in all profiles.

---

## 4. Process Tracks — Standard vs. Complex

Two tracks define how LOD levels are sequenced through a work package:

### Track A — Standard (most work packages)

```
LOD200 → LOD400 → LOD500
```

Criteria for Track A (all must be true):
- Single backend system or API surface
- No new state machine or async coordination pattern
- No new persisted data model (schema change)
- Low or Medium risk classification
- Spec author can determine component interfaces without system-level analysis

### Track B — Complex

```
LOD200 → LOD300 → LOD400 → LOD500
```

Track B triggers when any of the following is true:
- 2 or more backend systems or APIs involved
- New or materially modified state machine
- New persisted data model required
- Multi-team or multi-engine build sequence
- HIGH or CRITICAL risk classification
- Spec author cannot determine interfaces without resolving system behavior first

**Track decision authority:** Architecture team at GATE_1 / L-GATE_C.
Once declared, the track is immutable for the work package lifetime.

---

## 5. LOD Levels — Full Definitions

### LOD100 — Intent

**Question answered:** What problem are we solving and why?

**Must include:**
- Problem statement (1–3 sentences)
- Target user or affected system
- Desired outcome
- Business or product rationale
- What is explicitly out of scope
- Open questions or blocking assumptions (even if unresolved — must be surfaced, not omitted)

**Must not contain:**
- Solution design of any kind
- Technical decisions
- Acceptance criteria

**Typical length:** Half a page.
**Who produces:** Principal or Architecture team.
**Gate relevance:** Pre-GATE_0 concept evaluation.

---

### LOD200 — Concept

**Question answered:** What kind of solution are we building?

**Must include:**
- LOD100 content confirmed or refined (problem statement still accurate)
- Proposed solution concept (what kind of system or approach are we building?)
- Major components and their purpose
- Primary flow (happy path, brief)
- Actors / users / systems involved
- Open decisions (explicitly listed — not left implicit)
- Dependencies and constraints
- Initial success criteria
- Risk classification (Low / Medium / High / Critical) *(added in v0.3)*
- Track declaration (A or B) *(added in v0.3)*

**Must not contain:**
- Full field-level specification
- Implementation details
- Edge cases (those belong in LOD400)

**Typical length:** 1–2 pages.
**Who produces:** Architecture team.
**Gate relevance:** Required before GATE_1 approval (or L-GATE_C in Lean Track B / L-GATE_S in Lean Track A).

---

### LOD300 — System Behavior *(Track B only)*

**Question answered:** How should the system behave?

**Must include:**
- Complete state machine (all states, transitions, triggers)
- All business rules governing flow
- Integration contracts between components
- Full acceptance criteria at feature level
- API surface definition (endpoints, payloads, error responses)
- Data model (entity definitions, relationships, constraints)
- Sequence diagrams or equivalent for complex flows

**Must not contain:**
- Implementation language/framework choices (unless architecturally constraining)
- UI pixel-level design

**Typical length:** 4–10 pages depending on complexity.
**Who produces:** Architecture team, consuming team co-reviews.
**Gate relevance:** Required before GATE_2 / L-GATE_S (Track B only).

---

### LOD400 — Execution-Ready

**Question answered:** What exactly must be built, shown, enforced, and verified?

**Must include:**
- Zero ambiguity on product decisions — a builder agent must not need to invent anything
- Every UI state (empty, loading, error, success, edge cases)
- Every permission rule and enforcement point
- Complete acceptance criteria (numbered, testable, unambiguous)
- All copy / labels / messages (exact text, not "something about X")
- API contracts (exact endpoints, payloads, HTTP codes)
- DB schema changes (column names, types, constraints, migrations)
- Error handling (every error state, user-visible message, system behavior)
- Performance / scale constraints if relevant
- Explicit non-goals (what will NOT be built)

**Must not contain:**
- Open questions (any remaining question = spec is not LOD400)
- "TBD" or "to be determined" entries
- Aspirational descriptions ("should feel smooth")

**Typical length:** 5–20 pages.
**Who produces:** Architecture team.
**Who approves:** Consuming team (builder) confirms it is executable as written.
**Gate relevance:** Required before GATE_2 / L-GATE_S. Immutable after approval.
**Versioning:** v1.0.0 at first approval. Correction cycles → v2.0.0, etc.

---

### LOD500 — As-Built Record

**Question answered:** What was actually implemented, verified, and is true now?

**Must include:**
- `spec_ref`: exact reference to the LOD400 version it documents
- Execution fidelity: `FULL_MATCH | DEVIATIONS_DOCUMENTED | PARTIAL`
- Deviations from LOD400 (if any): what changed, why, who approved
- Verified acceptance criteria (which passed, which were modified, evidence)
- Known limitations or deferred items
- Validation evidence: who validated, which engine, what was tested

**Must not contain:**
- Content written from memory — must be produced from actual verification
- Self-certification by the implementing team

**Who produces:** Documentation / architecture team after build.
**Who approves:** Independent validator — **must be a different engine from the builder.** Iron Rule.
**Gate relevance:** Required at GATE_5 / L-GATE_V.

---

## 6. Gate Models

### 6.1 AOS v3 / L2 Gate Sequence (canonical)

| Gate | Question | LOD required |
|------|----------|--------------|
| GATE_0 | Is this WP eligible to enter the pipeline? | LOD100 |
| GATE_1 | Is the concept sound enough to authorize spec work? | LOD200 |
| GATE_2 | Is the spec complete enough to authorize build? | LOD400 |
| GATE_3 | Build execution (ongoing — not a decision gate) | — |
| GATE_4 | QA by same engine — does implementation meet spec? | LOD400 + test evidence |
| GATE_5 | Cross-engine validation + documentation lock | LOD500 (final) |

GATE_5 is the lifecycle closure gate. **Cannot be merged, skipped, or self-certified.**

### 6.2 Lean / L0 Gate Sequence

Lean mode uses a compressed gate sequence that preserves all Iron Rules
while reducing artifact overhead. Gate merging applies only to consecutive
gates with compatible artifact sets.

#### Lean Track A (4 gates)

| Lean Gate | Merges AOS | Artifact | Iron Rule preserved |
|-----------|-----------|----------|---------------------|
| **L-GATE_E** — Eligibility | GATE_0 | 1-page eligibility check | ✓ |
| **L-GATE_S** — Spec + Auth | GATE_1 + GATE_2 | LOD200 + LOD400 + build authorization sign-off | ✓ No build without LOD400 |
| **L-GATE_B** — Build + QA | GATE_3 + GATE_4 | Implementation + inline QA evidence | ✓ |
| **L-GATE_V** — Validate + Lock | GATE_5 | LOD500 + cross-engine validation record | ✓ Cross-engine mandatory |

**Why GATE_1+2 merge is safe for Track A:**
In Track A there is no LOD300 intermediate step. The concept (LOD200) and the
full spec (LOD400) are produced in one continuous spec session. The merged gate
still enforces that build cannot begin without LOD400 approval.

**Why GATE_3+4 merge is safe:**
Build and QA are performed by the same engine in the same session. The
combined output (implementation + QA report) is reviewed at L-GATE_B before
advancing. The independence requirement is satisfied at L-GATE_V, not earlier.

#### Lean Track B (5 gates)

| Lean Gate | Merges AOS | Artifact |
|-----------|-----------|----------|
| **L-GATE_E** — Eligibility | GATE_0 | Eligibility check |
| **L-GATE_C** — Concept | GATE_1 | LOD200 approval |
| **L-GATE_S** — Spec + Auth | GATE_2 | LOD300 + LOD400 + authorization |
| **L-GATE_B** — Build + QA | GATE_3 + GATE_4 | Implementation + QA |
| **L-GATE_V** — Validate + Lock | GATE_5 | LOD500 + cross-engine |

Track B keeps concept and spec as separate gates because the LOD300 system
behavior layer requires its own review before LOD400 can be written.

#### Gate artifact simplification (L0 vs L2)

In L0, every gate artifact is a markdown document. No structured JSON, no DB
event, no pipeline_state entry. Equivalent of AOS's 7-artifact package = 1
gate_log.md entry with decision, evidence reference, and timestamp.

---

## 7. Machine-Readable Frontmatter

Every LOD document carries a YAML frontmatter block. This enables automated
tooling and SSoT consistency.

### Minimum required fields

```yaml
---
lod_target: LOD400          # LOD100 | LOD200 | LOD300 | LOD400 | LOD500
lod_status: DRAFT           # DRAFT | APPROVED | SUPERSEDED | ARCHIVED
track: A                    # A | B
profile: lean               # lean | aos_v3 | aos_v4
authoring_team: architect   # role type (not team number)
consuming_team: builder     # role type
date: 2026-04-02
version: v1.0.0
supersedes: null            # or "filename_v1.0.0.md"
work_package_id: S001-P001-WP001   # canonical 3-level ID
---
```

### LOD500 additional fields

```yaml
spec_ref: "LOD400_spec_v2.0.0.md"          # mandatory
execution_fidelity: FULL_MATCH              # FULL_MATCH | DEVIATIONS_DOCUMENTED | PARTIAL
verifying_team: team_190                    # team ID — must differ from builder team
verifying_engine: openai                    # must differ from builder_engine
builder_engine: cursor-composer
validated_at: 2026-04-02T14:00:00Z
```

---

## 8. Cross-Engine Validation — Iron Rule

**Unconditional. Applies across all profiles.**

No team may be the sole validator of its own output. The final validation of
any work package (LOD500 + GATE_5 / L-GATE_V) must be performed by a team
using a **different LLM engine** than the team that built the implementation.

| Profile | How enforced |
|---------|-------------|
| L2 (AOS v3) | Pipeline enforces: `gate_authority` in definition.yaml; DB tracks builder_engine; submission rejected if same engine |
| L0 (Lean) | Declared in `team_assignments.yaml` (`assigned_validator` ≠ `assigned_builder`). Human orchestrator routes validation requests to the assigned validator team. Orchestrator never validates content — only routes. |

**Engine diversity principle:** "Different engine" means different LLM provider
(e.g., Anthropic vs. OpenAI vs. Google). Same provider, different model = NOT
sufficient. The goal is different training data, different failure modes,
different blind spots.

---

## 9. Team Structure

### 9.1 Role types (universal — not project-specific team numbers)

| Role type | Function | Min engine requirement |
|-----------|----------|------------------------|
| **principal** | Sets Iron Rules, approves GATE_5/L-GATE_V milestones | Human only |
| **architect** | Produces LOD specs, gate decisions, architectural ADRs | Any LLM + full context |
| **domain_architect** | Domain-scoped spec within a program | Any LLM + domain context |
| **builder** | Implements against LOD400 | IDE agent (Cursor/Codex preferred) |
| **qa_internal** | Tests same engine as builder, produces QA report | Same engine as builder |
| **validator_external** | Cross-engine validation, LOD500 sign-off | **Must differ from builder** |
| **tech_writer** | AS_MADE documentation, gate log records | Any LLM |
| **git_backup** | Version control, branching, backups | Human or CLI |

### 9.2 Minimum viable team (Lean / L0)

```
architect  (engine A)
    ↓ LOD400
builder    (engine B)
    ↓ implementation
validator  (engine C — must ≠ engine B)
```

Minimum 2 different engines. 3 roles can be collapsed to 2 humans/agents
(architect + builder as one, validator as another) **as long as engine
constraint is preserved.**

In a minimum L0 setup: `architect` + `builder` may share an engine (collapsed to one agent); `validator_external` is always a separate engine. Remaining role types (`qa_internal`, `tech_writer`, `git_backup`, `domain_architect`) are optional in L0 and may be omitted for simple bounded projects.

### 9.3 Team creation (L0 — Lean)

Creating a team in Lean mode = defining a context file per role:

```yaml
# team_assignments.yaml
roles:
  architect:
    engine: claude-code
    context_file: prompts/architect_context.md
    lean_gate_authority: [L-GATE_E, L-GATE_S, L-GATE_V]

  builder:
    engine: cursor-composer
    context_file: prompts/builder_context.md
    lean_gate_authority: [L-GATE_B]

  validator:
    engine: openai-codex              # MUST ≠ builder engine
    context_file: prompts/validator_context.md
    lean_gate_authority: [L-GATE_V]
    iron_rule: "engine MUST differ from builder"
```

Context files contain: role identity, Iron Rules for this role, current WP
LOD400 reference, gate sequence for this WP.

### 9.4 Basic skills per role type

**architect:**
- Input: LOD100/200, strategic context, Principal directives
- Output: LOD200, LOD300 (Track B), LOD400, gate decisions, ADRs
- Must know: full LOD standard, gate model, Iron Rules
- Cannot: validate own spec (route to validator)

**builder:**
- Input: LOD400 (approved), context files, codebase access
- Output: implementation, inline QA report
- Must know: LOD400 spec exactly; cannot deviate without architect sign-off
- Cannot: approve own LOD400, produce LOD500 independently

**validator_external:**
- Input: LOD400 + implementation + QA report
- Output: LOD500 (as-built), validation verdict, blocking report if FAIL
- Must know: LOD standard §LOD500, cross-engine validation requirement
- Cannot: be same engine as builder; validate without full re-execution

---

## 10. Lean Kit — Architecture Reference

The Lean Kit is a standalone repository that packages the methodology layer
into a ready-to-use project starter. It is generated from this AOS repository
(the SSoT).

### 10.1 Contents (see ADR for full structure)

```
lean-project-kit/
├── LEAN_KIT_VERSION.md
├── METHODOLOGY_REFERENCE.md
├── team_assignments.yaml
├── roadmap.yaml
├── work_packages/TEMPLATE_WP/
│   ├── LOD200_template.md
│   ├── LOD400_template.md
│   ├── LOD500_template.md
│   └── gate_log.md
├── team_roles/
│   ├── ROLE_DEFINITIONS.md
│   └── TEAM_CREATION_GUIDE.md
└── gates/
    └── LEAN_GATE_MODEL.md
```

### 10.2 Roadmap without DB — roadmap.yaml

In L0, work package state lives in `roadmap.yaml`:

```yaml
project_id: my-project
active_stage: S001
active_program: S001-P001

work_packages:
  - id: S001-P001-WP001
    label: "Feature X"
    status: IN_PROGRESS          # PLANNED | IN_PROGRESS | COMPLETE | CANCELLED
    current_lean_gate: L-GATE_B
    track: A
    lod_status: LOD400_APPROVED
    assigned_builder: cursor-composer
    assigned_validator: claude-code   # must ≠ builder
    created_at: 2026-04-02
    spec_ref: "work_packages/S001-P001-WP001/LOD400_spec.md"
```

This schema mirrors the AOS DB. When upgrading to L2, the roadmap.yaml is the
source for DB population.

### 10.3 Snapshot model

New project = clone lean-kit at a specific version tag. No automatic sync.
Critical methodology updates trigger a propagation procedure
(see ARCHITECT_DIRECTIVE_METHODOLOGY_DEPLOYMENT_SPLIT_v1.0.0.md §3.3).

### 10.4 Future canonical WPs registered in AOS roadmap

| WP ID (future) | Label |
|----------------|-------|
| LEAN-KIT-WP001 | BUILD_LEAN_KIT_REPO — create standalone lean-kit repository *(S003-P017)* |
| LEAN-KIT-WP002 | BUILD_LEAN_KIT_GENERATOR — SSoT auto-generation script *(S004+)* |
| LEAN-KIT-WP003 | BUILD_LEAN_TO_AOS_UPGRADE — roadmap.yaml → AOS DB migration *(S004+)* |
| LEAN-KIT-WP004 | BUILD_PROJECT_SCAFFOLDING_CLI — new project CLI (L0 + L2) *(S004+)* |

> Concept IDs (LEAN-KIT-WP001–WP004). Canonical S-P-WP execution IDs are assigned at program registration each stage.

---

## 11. Declaration Authority Matrix

| LOD Level | Who produces | Who approves | Cross-engine required |
|-----------|-------------|--------------|----------------------|
| LOD100 | Principal or Architect | Principal | No |
| LOD200 | Architect | Architecture team | No |
| LOD300 | Architect | Architecture team + consuming team | No |
| LOD400 | Architect | **Consuming team (builder must confirm executable)** | No |
| LOD500 | Tech writer / Architect post-build | **Independent validator (different engine)** | **Yes — Iron Rule** |

---

## 12. Versioning Policy

- All LOD documents are **immutable after approval**
- Naming: `{document_name}_v{major}.{minor}.{patch}.md`
- Version bump triggers: major = scope change; minor = content addition; patch = clarification/error fix
- Lifecycle: `DRAFT → APPROVED → SUPERSEDED → ARCHIVED`
- A correction cycle always produces a new version number; the old version is retained as reference
- LOD500 `spec_ref` must point to an exact version of the LOD400 it documents

---

## 13. Anti-patterns

The following are explicitly prohibited:

| Anti-pattern | Description |
|-------------|-------------|
| **Fake LOD400** | Long and detailed but still contains open product questions ("TBD", "we'll decide later") |
| **Inflated LOD** | Writing LOD400-level detail in a LOD200 document — bypasses the gate where concept approval happens; creates false confidence before the spec is authorized |
| **Mixed-state document** | A single document containing content at multiple LOD levels (e.g., LOD200 concept mixed with LOD400 field specs); makes gate evaluation impossible |
| **Hidden ambiguity** | Deliberately or accidentally omitting known open questions from LOD documents; the gate cannot evaluate what it cannot see |
| **Spec-less build** | Builder starts before LOD400 is approved at GATE_2 / L-GATE_S |
| **Orphan LOD500** | Written from memory after the fact, without actual verification run |
| **Self-certified LOD500** | Implementing team approves its own as-built record |
| **Correction without spec update** | Fixing code in a correction cycle without updating LOD400 (severs traceability) |
| **LOD creep** | Iteratively refining LOD200 until it resembles LOD400, skipping the formal LOD400 checklist |
| **Profile-based spec reduction** | Arguing that L0 / Lean mode requires less rigorous specs (it requires the same spec; only enforcement mechanism differs) |
| **Same-engine validation** | Using the same LLM provider for build and final validation |
| **Undeclared track** | Starting build without explicitly declaring Track A or B |
| **LOD500 without spec_ref** | An as-built record with no traceable link to the LOD400 it documents |
| **Cross-gate confusion** | Merging GATE_5/L-GATE_V with any other gate (validation must always be independent) |
| **Version drift** | LOD500 references a superseded LOD400 version without documenting the delta |

---

## §Lean — L0 Profile Overlay

This section contains all L0-specific details.

### §Lean.1 — When to use L0

Use L0 when:
- Project is small (1–3 active WPs at a time)
- No need for persistent pipeline infrastructure
- Team size is small (2–4 roles)
- Speed of setup matters more than automation

Do NOT use L0 for:
- Projects with 5+ concurrent WPs
- Environments requiring audit trail in DB
- Projects that will eventually need full AOS (start with L2 directly)

### §Lean.2 — Lean gate artifact set (simplified)

| Lean Gate | AOS equivalent artifact | L0 artifact |
|-----------|------------------------|-------------|
| L-GATE_E | GATE_0 package | 1-page eligibility doc in gate_log.md |
| L-GATE_S | SPEC_PACKAGE (7 artifacts) | LOD200 + LOD400 in work_packages/WP_ID/ + sign-off note in gate_log.md |
| L-GATE_B | QA report + implementation evidence | Implementation commit ref + inline QA section in gate_log.md |
| L-GATE_V | VALIDATION_REPORT + LOD500 | LOD500_as_built.md + validator sign-off in gate_log.md |

### §Lean.3 — Orchestrator responsibilities in L0

The human orchestrator in L0:
- Routes work to the correct role/engine
- Ensures cross-engine validation assignment is honored
- Decides when a gate is passed (based on artifact review)
- Does NOT approve content quality (that is the validator's function)
- Does NOT produce LOD specs (that is the architect's function)

Orchestrator = **traffic controller**, not reviewer.

### §Lean.4 — gate_log.md format

```markdown
# Gate Log — {WP_ID}

## {LEAN_GATE} — {date}
**Decision:** PASS / FAIL / PASS_WITH_NOTES
**Evidence:** {artifact references}
**Orchestrator:** {name}
**Notes:** {any deviations, conditions}
---
```

---

## §AOS v3 — L2 Profile Overlay

This section contains AOS v3 / Dashboard-specific details.

### §AOS.1 — Gate mapping

| LOD level | AOS gate | Who approves |
|-----------|----------|-------------|
| LOD200 | GATE_1 exit | Architecture team |
| LOD400 | GATE_2 exit | Consuming team sign-off required |
| LOD500 | GATE_5 exit | Independent validator (cross-engine) |

### §AOS.2 — Team role → AOS team number mapping

Role types map to numbered teams in `agents_os_v3/definition.yaml`. Current
assignments are in that file. The LOD standard uses role types only; team
numbers are AOS-internal.

### §AOS.3 — AOS enforcement mechanisms

In L2, the following are enforced by the pipeline (not by human discipline):
- LOD400 must be APPROVED status in `work_packages.lod_status` before GATE_2 passes
- `assigned_validator` engine must differ from `assigned_builder` engine (checked at GATE_5)
- CANONICAL_AUTO feedback rejects `route_recommendation: "full"` with HTTP 422
- LOD500 `spec_ref` is validated against known LOD400 version records

### §AOS.4 — Operating modes within L2

AOS v3 supports two interaction modes (both use the same pipeline, same DB):

| Interaction mode | Description |
|-----------------|-------------|
| **Dashboard** | Human uses web UI to monitor runs, read gate prompts, trigger actions |
| **Script** | Human uses `pipeline_run.sh` commands to operate the same pipeline |

The distinction is UI only — pipeline logic and enforcement are identical.

> **Naming note:** The "Script" mode uses the `pipeline_run.sh` shell script. The name "CLI" is reserved for the L3 profile ("AOS v4 / CLI") which introduces full CANONICAL_AUTO automation — a distinct concept.

---

## §AOS v4 — L3 Profile (Future)

AOS v4 / CLI introduces full CANONICAL_AUTO automation with auto-advance at
eligible gates. Architecture and gate model are identical to L2. Changes:
- All feedback must be StructuredVerdictV1 (no free-form modes)
- Auto-advance fires for GATE_0, GATE_1 when conditions are met
- Human gates (GATE_5) remain — cannot be automated

**Status: PLANNED. Implementation as canonical AOS WP in future stage.**

---

*This document is the authoritative LOD Standard v0.3 RELEASE_CANDIDATE.*
*Upon Team 00 approval → promoted to v1.0.0 and moved to*
*`documentation/docs-governance/01-FOUNDATIONS/LOD_STANDARD_v1.0.0.md`*

**log_entry | TEAM_100 | LOD_STANDARD_v0.3_RELEASE_CANDIDATE | 2026-04-02**
