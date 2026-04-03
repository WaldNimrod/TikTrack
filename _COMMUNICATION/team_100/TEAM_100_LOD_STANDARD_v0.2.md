# LOD for Software & Agentic Systems — Standard v0.2

**Date:** 2026-04-02
**Status:** DRAFT — pending Team 00 review and promotion to canonical governance
**Supersedes:** LOD_STANDARD_DRAFT_v0.1.md
**Authors:** Team 100 (architectural review + synthesis), incorporating v0.1 draft
**Target:** cross-project standard; AOS v3 overlay in §AOS

---

## 1. Why this standard exists

Traditional **LOD (Level of Development / Level of Detail)** comes from architecture and construction, where it defines the precision to which a building element is modeled at a given stage.

In software and agentic systems, there is no universal equivalent — yet the need is acute:

> **LOD in software/LLM systems = the degree to which a feature, flow, system, or task is defined strongly enough to support aligned execution with minimal ambiguity.**

This standard serves:
- product and software teams
- multi-agent / LLM builder pipelines
- specification-heavy environments with handoffs between producers and executors
- any system where the cost of specification ambiguity exceeds the cost of specification effort

It is designed to be **cross-project**. AOS v3 specifics are isolated in §AOS.

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
A LOD500 that exactly matches its LOD400 is the ideal outcome. Deviations must be documented.

---

## 3. Process tracks — Standard vs. Complex

Not every feature requires all five levels. Two tracks are defined:

### Track A — Standard
**Path:** LOD200 → LOD400 → LOD500

For bounded, single-system, pattern-following features. The specification author writes LOD400 directly from the concept without needing to resolve system behavior questions.

### Track B — Complex
**Path:** LOD200 → LOD300 → LOD400 → LOD500

For features that cross subsystem boundaries, require architectural decisions, or involve multiple coordinated agents in the build phase.

### Track selection criteria

Track B is **required** when any of the following apply:
1. Feature touches 2 or more backend systems, APIs, or databases
2. Feature requires a new or modified state machine, async coordination, or multi-step data flow
3. Feature involves a new data model (schema changes that persist beyond the session)
4. Feature will be built by more than one agent or team in sequence (requiring inter-agent contracts)
5. Feature is classified HIGH or CRITICAL risk (financial logic, auth flows, data migrations, irreversible changes)
6. The specification author cannot determine the full set of component interfaces without first resolving system behavior questions

Track A is sufficient when:
- The feature is a single-component change using an established codebase pattern
- All component interfaces are known and stable
- A prior implementation of the same pattern exists as a reference (LOD400 can cite it)
- The feature has no cross-system state effects

> **Why this matters for LLM agents specifically:** Research on Plan-then-Execute (P-t-E) architectures shows that for complex tasks, an intermediate planning/behavior document significantly improves executor output quality. The LOD300 artifact is precisely the Planner output consumed by the Executor agent — without it, the builder agent must infer system design from an execution spec, which introduces hallucination risk. For bounded tasks, this planning step adds overhead without benefit.

---

## 4. Level definitions

### LOD100 — Intent Level

**Main question:** Why does this exist?

**Definition:** A high-level statement of the problem, actor, desired outcome, and rationale.

**When used:**
- New initiative kickoff
- Early strategic decision
- Idea pipeline evaluation (go/no-go framing)
- When the problem statement is contested or unclear

**Must include:**
1. Problem statement
2. Target actor / affected user
3. Desired outcome
4. Business, mission, or technical rationale
5. Scope at a very high level (what is explicitly excluded)
6. Open questions or blocking assumptions

**May include:**
- Rough examples or analogies
- Success vision
- Strategic risks

**Must NOT contain:**
- Final UX decisions
- Implementation logic
- Acceptance criteria
- Anything that implies LOD200+ completeness

**Output quality test:** A reader understands the problem, who it matters to, and why solving it is worth resources. No implementation decisions have been made yet.

**Typical artifacts:** initiative brief, concept note, one-page framing, idea submission, early strategy memo.

---

### LOD200 — Concept Level

**Main question:** What kind of solution are we building?

**Definition:** A structured concept that identifies the solution shape, major components, primary flows, and key unresolved decisions.

**When used:**
- Architecture / product concept review
- Alignment before specification begins
- Roadmap decision support
- Gate entry for planning approval

**Must include:**
1. LOD100 content, confirmed or refined
2. Proposed solution concept
3. Main actors and user/system types
4. Primary flows (described at concept level)
5. Major components or modules
6. Dependencies and constraints (external systems, team ownership, data sources)
7. Key decisions still unresolved — explicitly listed
8. Initial success criteria (what "done" looks like at a high level)

**May include:**
- Low-fidelity wireframes or sketches
- Comparative solution options with rationale
- Conceptual data model
- Milestone proposal

**Must NOT contain:**
- Exhaustive edge cases
- Exact copy or label text
- Implementation-ready logic
- Final API / schema contracts

**Output quality test:** A reader understands the intended shape of the solution, who uses it, what the main flow looks like, and what major choices remain open. No executor agent or developer should be able to start building from this alone.

**Typical artifacts:** product concept brief, solution outline, discovery document, LOD200 spec, feature architecture brief.

---

### LOD300 — System Behavior Level *(Track B only)*

**Main question:** How should the system behave?

**Definition:** A functional specification that resolves system behavior across core flows, states, component interfaces, and business rules — without yet prescribing exact implementation.

**When used:** Track B features only (see §3). This level resolves the architectural questions that LOD200 left open, so that LOD400 can be written without reopening them.

**Must include:**
1. LOD200 content, resolved where possible
2. Full primary user/system flows
3. Secondary flows and branching conditions
4. All significant system states and transitions
5. Business rules and constraints
6. Data requirements (fields, types, relationships — not final schema)
7. Permissions and roles
8. Error, empty, loading, and degraded states
9. Integration points (system A calls system B when X)
10. Measurable acceptance criteria at feature level

**May include:**
- Sequence diagrams
- State transition diagrams
- API outlines (not final contract)
- Medium-fidelity wireframes
- Validation rules

**Must NOT contain:**
- Exact SQL / API schema
- Pixel-level UI specifications
- Implementation-specific decisions that belong in LOD400

**Specific requirement for agentic systems:** LOD300 must define the **agent interface contract** — what each builder agent receives as input, what it is expected to produce, and what the handoff boundary between agents looks like. Without this, multi-agent execution produces uncoordinated outputs.

**Output quality test:** A builder agent or developer consuming only this document understands exactly how the system behaves in all significant cases, and can write LOD400 without reopening any system design question.

**Typical artifacts:** functional spec, design document (RFC), system behavior doc, feature architecture brief, QA-ready scenario document.

---

### LOD400 — Execution-Ready Level

**Main question:** What exactly must be built, shown, enforced, and verified?

**Definition:** A complete implementation-ready specification. A builder agent or developer should be able to implement it correctly **without making product decisions**.

**When used:**
- Handoff to implementation agent or developer
- Build sprint execution
- High-trust delegation to any executor

**Must include:**
1. Clear objective and scope
2. Exact actors, roles, permissions
3. Precise flow logic (every branch, every condition)
4. All states explicitly:
   - success
   - error (each error type, each message)
   - empty
   - loading / in-progress
   - blocked / unauthorized
   - fallback / degraded
5. Exact business rules and constraints
6. Non-goals / out-of-scope (explicitly stated)
7. Concrete content where required: labels, button text, helper text, tooltips, error messages
8. Exact UI/UX requirements where relevant: placement, hierarchy, visibility, responsive behavior, interaction states
9. Data contracts / schema expectations
10. Dependencies and preconditions
11. Acceptance criteria that are **objectively testable** by a third party
12. Known edge cases
13. Privacy, security, and policy rules
14. Verification instructions or QA checklist

**May include:**
- Expected HTML/CSS/JS behavior
- API contract (request/response shapes)
- SQL contract
- Pseudo-code for complex logic
- Test cases
- Annotated wireframes

**Must NOT leave open:**
- Key copy or label decisions
- Permission logic for any significant action
- Edge cases that affect user-visible behavior
- Ownership boundaries between components
- Required validation rules
- Any criterion where the builder agent must make a product interpretation

**Specific requirement for agentic systems:** LOD400 must be complete enough that a **weak or newly-initialized agent** can implement it correctly. The test is: would a competent but fresh executor — with no prior project context — produce the correct result? If the answer requires project memory to succeed, the spec is incomplete.

**Output quality test:** A competent but otherwise-uninformed builder produces the correct result. No product decision is made during implementation.

**Typical artifacts:** implementation mandate, engineering-ready spec, agent-ready specification, zero-ambiguity handoff, execution package.

---

### LOD500 — As-Built / Operational Truth Level

**Main question:** What actually exists and is verified today?

**Definition:** A record of what was implemented, how it deviates from spec, what was verified, and what is true now.

**When used:**
- QA closure and sign-off
- Production or deployment documentation
- Operational support and maintenance
- Future iteration baseline
- Audit and traceability

**Must include:**
1. Final implemented scope
2. **Deviations from LOD400 spec** — explicitly documented, with rationale
3. Actual behaviors (what the system does, not what it was meant to do)
4. Final interfaces and schemas as implemented
5. Deployed constraints and configurations
6. Verification evidence (test results, QA sign-off, reviewer identities)
7. Known limitations and technical debt
8. Operational ownership
9. Rollback / maintenance notes if relevant

**May include:**
- Screenshots of final UI
- Test run evidence (passed/failed, counts)
- Production URLs or configuration references
- Final database migrations
- Monitoring references

**Must NOT be:**
- Aspirational or speculative
- Mixed with future plans without clear labeling
- Self-certified by the implementing team alone

**Specific requirement for agentic systems:** LOD500 must include **execution fidelity** — a statement of how faithfully the builder agent followed the LOD400 spec. This is the agentic analog of "as-built drawings" in construction: not what was designed, but what was physically built. Execution fidelity requires **independent verification** — the same agent that built cannot produce LOD500 alone.

**Validation requirement:** LOD500 requires sign-off from a team or agent that did not produce the implementation. Self-certification is invalid.

**Output quality test:** A new team member, or a future agent with no prior context, can understand exactly what exists in production today, how it differs from what was designed, and what the known constraints are.

**Typical artifacts:** release notes, as-built documentation, QA sign-off pack, operational runbook, implementation record.

---

## 5. Declaration format (machine-readable)

All LOD documents MUST include a YAML frontmatter block. This enables programmatic validation by agents and governance tooling.

**Minimum required fields:**

```yaml
---
lod_target: LOD400         # LOD100 | LOD200 | LOD300 | LOD400 | LOD500
lod_status: DRAFT          # DRAFT | APPROVED | SUPERSEDED | ARCHIVED
track: A                   # A | B (see §3)
authoring_team: team_100   # use generic role if cross-project (e.g., "architect")
consuming_team: team_61    # the team that will execute or validate against this
date: 2026-04-02
version: v1.0.0
supersedes: null           # filename of superseded document, or null
---
```

**For LOD500, additional required fields:**

```yaml
---
lod_target: LOD500
lod_status: APPROVED
spec_ref: LOD400_document_filename_v1.0.0.md
fidelity: FULL_MATCH       # FULL_MATCH | DEVIATIONS_DOCUMENTED | PARTIAL
verifying_team: team_51    # must differ from authoring_team
verification_date: 2026-04-02
---
```

**Declaration rule:** A document must be labeled by the **lowest level at which critical information is still missing**. Length and detail do not determine LOD — completeness of required fields does.

---

## 6. Declaration authority

Production of a LOD document does not constitute its approval. The following authority matrix applies:

| LOD | May be produced by | Approved by | Notes |
|-----|--------------------|-------------|-------|
| LOD100 | Any team | Optional | Kickoff / idea; no formal approval required |
| LOD200 | Architecture / product team | Planning authority (human or designated arch agent) | Required before Track B LOD300 or direct LOD400 begins |
| LOD300 | Architecture team | Consuming team (builder) acknowledgment | Builder must confirm LOD300 is complete enough to derive LOD400 |
| LOD400 | Architecture team | Consuming team sign-off **before** implementation begins | Builder team must explicitly acknowledge LOD400 is executable |
| LOD500 | QA / validation team | Cross-team sign-off: implementation team + independent validator | Self-certification invalid |

**Key principle:** LOD400 is the gate. No implementation may begin below LOD400. Consuming team sign-off is not optional — it is the mechanism that surfaces specification gaps before implementation cost is incurred.

---

## 7. Versioning policy

LOD documents are versioned assets, not living documents.

**Version format:** `_v{major}.{minor}.{patch}` suffix, per project versioning convention.

**Rules:**

1. A LOD document that has been approved is **immutable**. Corrections require a new version.
2. When a correction cycle (during implementation) modifies the spec, the LOD400 is updated to a new version. The old version is marked `lod_status: SUPERSEDED` with a pointer to the replacement.
3. Superseded documents are retained for audit. They are never deleted.
4. LOD500 is point-in-time. If the feature changes after LOD500 is published, a new LOD500 version must be produced. The old LOD500 does not automatically reflect the new state.
5. A document that is in use but has not yet been approved is `lod_status: DRAFT`. DRAFT documents may not gate implementation.

**Version lifecycle:**
```
DRAFT → APPROVED → (if superseded) SUPERSEDED
                 → (if retired)    ARCHIVED
```

---

## 8. Recommended mapping for software and LLM teams

| Use case | Minimum LOD required |
|----------|----------------------|
| Strategy or priority discussion | LOD100 |
| Concept review / go-no-go | LOD200 |
| Architecture alignment | LOD200 or LOD300 (Track B) |
| Handoff to developer or builder agent | LOD400 |
| QA closure / release documentation | LOD500 |
| Agentic system planning (complex features) | LOD300 → LOD400 |
| Correction cycle update | LOD400 new version |

---

## 9. Recommended mapping for agentic systems

### Product / strategy agent
Produces:
- LOD100 (idea pipeline, initiative framing)
- LOD200 (concept spec)

### Architecture / spec agent
Produces:
- LOD300 (Track B)
- LOD400
Reviews:
- LOD500 (fidelity check)

### Builder / implementation agent
Consumes:
- LOD400
Produces:
- Code, configuration, output
May document:
- LOD500 partial (self-reported implementation)

### QA / validation agent
Consumes:
- LOD400 (acceptance criteria)
Verifies:
- Against AC
Produces:
- LOD500 evidence (independent of builder)

### Correction / remediation agent
Consumes:
- LOD400 + LOD500 (failed or partial attempt)
Produces:
- LOD400 new version with explicit delta-from-previous

**Cross-engine validation requirement:** LOD500 production and approval must involve at least two different engines or teams. The engine that produced the implementation may not alone certify LOD500. This is the agentic equivalent of independent inspection.

---

## 10. Required artifact checklists

### LOD100 checklist
- [ ] Problem defined
- [ ] Target actor defined
- [ ] Desired outcome defined
- [ ] Rationale defined
- [ ] Scope boundaries stated (including explicit exclusions)
- [ ] Open questions listed

### LOD200 checklist
- [ ] LOD100 content confirmed or refined
- [ ] Solution concept described
- [ ] Main actors described
- [ ] Primary flow outlined
- [ ] Major components described
- [ ] Dependencies listed
- [ ] Unresolved decisions identified
- [ ] Initial success criteria drafted
- [ ] YAML frontmatter present

### LOD300 checklist *(Track B only)*
- [ ] LOD200 content resolved or superseded
- [ ] Primary flows fully defined
- [ ] Secondary flows and branching defined
- [ ] All significant system states defined
- [ ] All state transitions defined
- [ ] Business rules defined
- [ ] Data requirements defined (fields, types, relationships)
- [ ] Roles and permissions defined
- [ ] Error / empty / loading / degraded states addressed
- [ ] Integration points specified (system A → system B on condition X)
- [ ] Agent interface contracts defined (for multi-agent features)
- [ ] Feature-level acceptance criteria included
- [ ] YAML frontmatter present

### LOD400 checklist
- [ ] LOD300 (Track B) or LOD200 (Track A) complete or explicitly superseded
- [ ] Objective and scope exactly defined
- [ ] All flow logic explicit — every branch, every condition
- [ ] All states explicit: success, error, empty, loading, blocked, fallback
- [ ] Concrete content included: labels, buttons, errors, tooltips
- [ ] Exact UI/UX instructions where relevant
- [ ] Business rules and constraints fully specified
- [ ] Non-goals explicitly stated
- [ ] Dependencies and preconditions listed
- [ ] Acceptance criteria objectively testable by third party
- [ ] Known edge cases documented
- [ ] Privacy / security / policy rules included if relevant
- [ ] QA verification path included
- [ ] Consuming team sign-off obtained before implementation begins
- [ ] YAML frontmatter present

### LOD500 checklist
- [ ] Final implemented scope documented
- [ ] Deviations from LOD400 spec documented with rationale
- [ ] Actual behaviors documented
- [ ] Final interfaces and schemas documented
- [ ] Deployed constraints and configurations documented
- [ ] Verification evidence attached or referenced
- [ ] Execution fidelity declared (FULL_MATCH / DEVIATIONS_DOCUMENTED / PARTIAL)
- [ ] Known limitations and technical debt documented
- [ ] Operational ownership documented
- [ ] Release / change history captured
- [ ] Signed off by independent team (not the implementing team)
- [ ] YAML frontmatter present

---

## 11. Comparison table

| Level | Name | Core question | Track | For execution? | For QA? |
|-------|------|---------------|-------|----------------|---------|
| LOD100 | Intent | Why? | Both | No | No |
| LOD200 | Concept | What kind of solution? | Both | No | No |
| LOD300 | System Behavior | How should it work? | B only | Partially | Partially |
| LOD400 | Execution-Ready | What exactly must be built? | Both | Yes | Yes |
| LOD500 | As-Built | What actually exists? | Both | Not for first build | Yes |

---

## 12. Anti-patterns

### Fake LOD400
A document that is long and detailed but still leaves important decisions open. Length is not a proxy for completeness.

### Inflated LOD
Labeling a concept document "LOD400" to create false certainty. The decision rule: label by the lowest level at which critical information is still missing.

### Mixed-state document
Combining future intent, current reality, and implementation instructions without labeling each section separately. Any document that mixes LOD levels must label each section with its actual LOD.

### Hidden ambiguity
Using vague words without behavioral definition: "intuitive," "modern," "clear," "user-friendly," "flexible," "appropriate." Every instruction must have a deterministic interpretation.

### LOD creep
A document that starts as LOD200 and gradually accumulates LOD400-looking detail without a formal promotion event. The result appears detailed but contains critical specification gaps in non-obvious places.

### Orphan LOD500
A LOD500 record written months after implementation from memory, without run evidence, test artifacts, or deviation documentation. This is not LOD500 — it is aspirational retroactive documentation.

### Self-certified LOD500
An implementing team declaring their own LOD500 without independent validation. Execution fidelity cannot be self-assessed.

### Correction without spec update
A correction cycle that updates the implementation without updating the LOD400 to reflect the change. This breaks the traceability chain. Every substantive correction requires a LOD400 new version.

---

## 13. How to embed this standard

### Layer A — Project context rule
A stable project-level context file defines: the LOD scale, required interpretation, which teams produce and consume each level, and default handoff expectations.

Canonical filename: `documentation/docs-governance/LOD_STANDARD.md`

### Layer B — Operational enforcement
A reusable template or agent skill that can:
- Classify an input document into an LOD
- Validate whether a document meets a target LOD (checklist pass/fail)
- Generate gap reports (what is missing to reach target LOD)
- Upgrade a draft from lower to higher LOD

### Minimum operational policy
1. Every handoff document must declare: `lod_target`, `authoring_team`, `consuming_team`
2. No implementation may begin below LOD400
3. LOD500 requires independent sign-off
4. LOD400 requires consuming team acknowledgment before implementation begins
5. Correction cycles must produce a versioned LOD400 update
6. Documents mixing LOD levels must label sections separately

---

## §AOS — AOS v3 Overlay

*This section is AOS v3-specific. The general standard above is project-agnostic.*

### Gate-to-LOD mapping (5-gate + GATE_0 model)

The canonical gate model for AOS v3 is the **5-gate model** (GATE_0 through GATE_5), locked by `ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0.md` on 2026-03-19.

GATE_6, GATE_7, GATE_8 are **LEGACY** — they appear in historical documents only and are aliased to GATE_4/GATE_5 for migration compatibility. They are not active pipeline gates.

| Gate | Name | LOD requirement | LOD produced |
|------|------|-----------------|--------------|
| GATE_0 | Pre-planning | — | LOD100 (idea/brief) |
| GATE_1 | Needs and Planning | LOD200 submitted and approved | LOD200 (concept spec) |
| GATE_2 | Specification | LOD400 (LLD400) approved by consuming team | LOD400 (execution-ready) |
| GATE_3 | Implementation | LOD400 consumed; implementation proceeds | LOD500 partial (in progress) |
| GATE_4 | Validation | Implementation complete; human UX approval | LOD500 drafted |
| GATE_5 | Documentation — AS_MADE_LOCK | LOD500 finalized and approved | LOD500 locked |

**LOD300 placement:** Track B features may insert a LOD300 approval step between GATE_1 and GATE_2. This is not a new named gate — it is a phase within the GATE_1→GATE_2 transition.

### Team-type mapping (role-based, not team-number-specific)

| Role type | LOD produced | LOD consumed |
|-----------|-------------|--------------|
| Architecture team (Team 100 equivalent) | LOD200, LOD300, LOD400 | LOD500 (review) |
| QA / Acceptance team (Team 51 equivalent) | LOD500 evidence | LOD400 (acceptance criteria) |
| Validation team (Team 190 equivalent) | LOD500 sign-off | LOD400 + LOD500 draft |
| Implementation team (Team 61 equivalent) | LOD500 partial | LOD400 |
| Documentation team (Team 170 equivalent) | LOD500 final lock | All prior LODs |
| Principal (Team 00) | LOD approval decisions | LOD200, LOD400, LOD500 |

### Cross-engine validation (Iron Rule)

Per `ARCHITECT_DIRECTIVE_CROSS_ENGINE_VALIDATION_PRINCIPLE_v1.0.0.md`:

- LOD400 approval requires sign-off from a team on a **different engine** than the authoring team
- LOD500 sign-off requires a **different engine** from the implementing team
- Self-certification by the authoring/implementing engine is never valid for any approval gate

### Versioning alignment

AOS v3 versioning policy: `_v{major}.{minor}.{patch}` suffix.
- `v1.0.0` — initial approved version
- `v1.0.1` — minor correction without scope change
- `v1.1.0` — scope addition within same LOD
- `v2.0.0` — full revision (LOD upgraded or substantially rewritten)
- SUPERSEDED marker: add `lod_status: SUPERSEDED` to frontmatter + `superseded_by: filename_v{new}.md`

---

## 14. Review status

**v0.2** — prepared for Team 00 review.
After approval: promote to `documentation/docs-governance/LOD_STANDARD.md` via Team 170.

---

*log_entry | TEAM_100 | LOD_STANDARD_v0.2 | DRAFT | 2026-04-02*

historical_record: true
