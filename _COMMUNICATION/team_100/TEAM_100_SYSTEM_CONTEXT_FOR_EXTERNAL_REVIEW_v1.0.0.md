---
id: TEAM_100_SYSTEM_CONTEXT_FOR_EXTERNAL_REVIEW_v1.0.0
from: Team 100 (Chief System Architect)
to: External reviewers
date: 2026-04-02
version: v1.0.0
purpose: Full system context for external teams evaluating the LOD standard (levels 100–500)
audience: Experienced software/LLM teams unfamiliar with this specific project
---

# TikTrack + Agents_OS — System Context for External Review

**Purpose of this document:** Enable external reviewers to evaluate our LOD specification standard (LOD100–500) in context. The LOD standard was designed for and by this environment. Understanding the system helps reviewers assess whether the standard's structure, levels, and decision logic are appropriate for its intended use.

This document describes the system at the architectural and process level — not at the level of individual features, implementation details, or tooling environment.

---

## 1. What the System Is

The project consists of two tightly linked domains:

### TikTrack
A personal financial portfolio tracking application. Its purpose is to give a private investor a structured, disciplined environment for managing a real stock and options portfolio — tracking positions, monitoring alerts, analyzing performance, and managing trade decisions.

TikTrack is a **web application** with a Python/FastAPI backend, a PostgreSQL database, and a frontend built with standard HTML/CSS/JavaScript. It is not a commercial product with multiple customers — it is a single-user domain-specialist tool, built to high engineering and governance standards.

**Why that matters for the LOD standard:** TikTrack features require high precision. A specification that leaves room for "interpretation" produces wrong implementations. LOD400 (execution-ready, zero-ambiguity) is the minimum viable spec level for any handoff to a builder agent.

### Agents_OS (AOS)
The orchestration layer that **manages how TikTrack gets built**. AOS is a pipeline engine — a state machine that routes work packages through a structured gate sequence, assigning them to AI agents (LLM-based teams), collecting structured feedback, and advancing or blocking based on validation outcomes.

AOS is not a TikTrack feature — it is the **software development process** itself, implemented as a running system. It has:
- A REST API for pipeline operations
- A PostgreSQL database tracking work packages, runs, assignments, and events
- A web UI for monitoring and operating the pipeline
- A feedback ingestion endpoint that validates structured LLM outputs (CANONICAL_AUTO mode)
- An auto-advance mechanism for eligible gates when feedback meets strict structural criteria

**The key insight:** AOS v3 is not a metaphor or a planning document. It is live infrastructure. When a work package begins, a run is created in the DB. When an agent submits feedback, it POSTs to the feedback endpoint. The gate model is enforced by code.

---

## 2. The Development Organization Model

The project uses a **multi-agent development model** where:

- **One human** (the Principal) holds constitutional authority — defines goals, sets iron rules, approves vision-level decisions
- **All other roles are LLM agents** — Claude Code, Cursor Composer, OpenAI Codex API — assigned to specific teams by role
- No agent team is autonomous. Every output goes through a structured gate sequence before it becomes canon

### Role types (generic — not team-numbered)

| Role type | Function |
|-----------|----------|
| Principal | Sole human. Sets Iron Rules, approves Gate 5 milestones |
| Architecture/Spec (Chief) | Overall specification, architectural decisions, LOD400 production, gate oversight |
| Domain Architect (IDE) | Domain-scoped specification within a program |
| Builder / Implementer | Implements against LOD400 specifications |
| DevOps / Platform | Infrastructure, DB, deployment, CI/CD |
| QA / Validator (same domain) | Runs tests, produces verdicts — same engine as builder |
| Validator (cross-engine) | Independent validation — DIFFERENT engine from builder |
| Documentation | AS_MADE records, governance documentation, knowledge promotion |
| Git Governance / Backup | Manages git state, branching, and backups |

**The cross-engine validation principle is constitutional.** LLM output is statistical and always contains errors. Any LLM action must be validated by a different agent — preferably a different engine and different environment. This is the foundational reason the gate model exists.

---

## 3. The Gate Model

### What a gate is

A gate is a formal checkpoint in the lifecycle of a work package. It defines:
- What evidence must be produced (entry criteria)
- What evaluation must occur (the gate process)
- What approval is required to exit (exit criteria)
- Who owns the gate decision

Gates do not exist for bureaucratic reasons. They exist because in a multi-agent system, each transition between roles is a failure point. A gate makes that transition explicit, auditable, and reversible.

### The active gate sequence

The canonical gate sequence (per `ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0.md`) defines **5 top-level gates: GATE_1 through GATE_5**. Operationally, AOS v3 also uses **GATE_0** as a pre-pipeline intake gate (eligibility check before a WP enters the formal sequence). GATE_0 predates the locked canon document; both definitions are consistent in practice.

| Gate | Name | Question answered |
|------|------|-------------------|
| GATE_0 | Intake & Eligibility *(operational pre-gate)* | Is this work package ready to enter the pipeline? |
| GATE_1 | Specification Approval | Is the concept well-enough defined to invest in a full spec? |
| GATE_2 | Execution Authorization | Is the LOD400 spec complete enough to authorize a build? |
| GATE_3 | Build Execution | Is the implementation being executed against the spec? |
| GATE_4 | QA Validation (same engine) | Does the implementation pass testing by the builder's own QA? |
| GATE_5 | Independent Validation + Documentation Lock | Does the implementation pass cross-engine validation? Is AS_MADE documented? |

GATE_5 is the lifecycle closure gate. When GATE_5 passes, the work package is complete, the AS_MADE record is locked, and the work enters canonical project history.

> **Note on legacy gate names:** Earlier project documentation used GATE_6, GATE_7, GATE_8. These are retired aliases that no longer map to active pipeline gates. All documentation and tooling have been updated to reflect the GATE_0–GATE_5 model.

### What happens when a gate fails

A FAIL verdict at any gate produces:
- A structured blocking report (specific findings, numbered, categorized by severity)
- A `route_recommendation` field indicating whether the issue is doc-only, requires code change, or requires architectural re-specification
- An explicit route: back to the responsible team, with the specific LOD level that needs to be updated

A FAIL does not "stop" the project. It creates a correction cycle — the specification (LOD400) is updated to a new version, the builder implements against the new version, and the gate is rerun.

---

## 4. How LOD Maps to the Gate Sequence

The LOD levels (100–500) are not just document categories — they are **gate entry conditions**:

| LOD Level | Gate relevance |
|-----------|----------------|
| LOD100 | Idea/concept validation before GATE_0 |
| LOD200 | Required before GATE_1 approval (concept is sound enough to specify) |
| LOD300 | Optional — required only for complex multi-system work packages (Track B) |
| LOD400 | Required before GATE_2 approval (spec is execution-ready, authorized to build) |
| LOD500 | Required at GATE_5 exit (what was actually built, verified, and locked) |

This mapping is not arbitrary. It reflects what each gate decision needs:
- A gate cannot authorize a build (GATE_2) if the spec is ambiguous (not LOD400)
- A gate cannot close a lifecycle (GATE_5) without a verified as-built record (LOD500)
- An independent validator cannot produce a LOD500 without a LOD400 to compare against

The LOD standard is therefore tightly coupled to the gate model — they are two aspects of the same process.

---

## 5. The Work Package Lifecycle

A work package (WP) is the unit of work. It has:
- A unique 3-level identifier: `S{NNN}-P{NNN}-WP{NNN}` (Stage / Program / Work Package)
- A domain: TikTrack or Agents_OS
- A spec package: a set of documents at LOD200 → LOD400 → LOD500
- A run record in the database: tracks current gate, phase, active team, correction cycle count
- A status: PLANNED → IN_PROGRESS → COMPLETE (or GATE0_REJECTED / CANCELLED)

The work package ID format enforces the roadmap hierarchy: Stage → Program → Work Package. A program always has at least WP001. Multi-WP programs have WP001, WP002, etc. The identifier is validated at the API level — program-level IDs are rejected.

---

## 6. The Specification Hierarchy

### LOD100 — Intent
The "why" and "what problem." A brief strategic framing: problem statement, target user, desired outcome, business rationale. Not actionable — used to decide whether to pursue a concept.

### LOD200 — Concept
The "what kind of solution." Major components, primary flow, actors, open decisions. Good enough for architecture review and roadmap prioritization. Not good enough to build from.

### LOD300 — System Behavior (conditional)
The "how it should work." Full flow logic, all states, business rules, integration points, feature-level acceptance criteria. Required for complex work packages (Track B: 2+ backend systems, new state machine, new data model, multi-team build, HIGH/CRITICAL risk). Skipped for straightforward single-component work (Track A: LOD200 → LOD400 directly).

### LOD400 — Execution-Ready
The "what exactly must be built." Zero product ambiguity — a builder agent should be able to implement it correctly without inventing any product decisions. Every state, every edge case, every piece of copy, every permission rule, every acceptance criterion must be explicit. This is the LOD level that authorizes a build. Immutable once GATE_2-approved; updated to a new version in correction cycles.

### LOD500 — As-Built Record
The "what actually exists." Produced after build and independent validation. Documents: final implemented scope, deviations from LOD400, actual behaviors, verification evidence, known limitations. Must include an execution fidelity field (`FULL_MATCH | DEVIATIONS_DOCUMENTED | PARTIAL`) and a direct reference to the LOD400 it was built against. Cannot be self-certified by the implementing team — requires cross-engine sign-off.

---

## 7. The Two-Track Model

Not all work packages need LOD300. Two tracks are defined:

**Track A** (most work packages): LOD200 → LOD400 → LOD500

Appropriate when the work is bounded, follows established patterns, and the architect can write a full LOD400 directly from the concept without first needing to resolve system behavior questions.

**Track B** (complex work packages): LOD200 → LOD300 → LOD400 → LOD500

Required when any of the following is true:
- 2 or more backend systems or APIs are involved
- A new or modified state machine or async coordination pattern is introduced
- A new persisted data model (schema change) is required
- Multiple teams or agents are in the build sequence
- The work is classified HIGH or CRITICAL risk
- The spec author cannot determine component interfaces without first resolving system behavior

The track decision is made at GATE_1 by the architecture team.

---

## 8. Document Governance

### Versioning
Every LOD document carries a machine-readable YAML frontmatter block:

```yaml
lod_target: LOD400
lod_status: APPROVED
track: A
authoring_team: architecture_team
consuming_team: builder_team
date: 2026-04-02
version: v1.0.0
supersedes: null
```

LOD documents are **immutable after approval**. A correction cycle produces a new version (v2.0.0), with the previous version archived. The LOD500 references the exact LOD400 version it was built against (`spec_ref`).

### Authority
- **LOD400** can only be declared approved by the consuming team (the team that will build it) — they are the ones who can confirm it is actually executable as written
- **LOD500** requires sign-off by a team that did NOT build the implementation — cross-engine validation is mandatory

### Anti-patterns the standard explicitly prohibits
- **Fake LOD400** — long and detailed but still leaves product decisions open
- **Orphan LOD500** — written from memory after the fact, without run evidence
- **Self-certified LOD500** — the implementing team approving their own fidelity record
- **Correction without spec update** — fixing the implementation in a correction cycle without updating the LOD400 (severs the traceability chain)
- **LOD creep** — iteratively refining a LOD200 until it looks like a LOD400 without formal promotion (misses the systematic completeness checks)

---

## 9. The Feedback and Validation Loop

Agents do not freely report "PASS" or "FAIL" in natural language. The system uses a structured feedback protocol:

**CANONICAL_AUTO mode:** The feedback endpoint (`POST /api/feedback`) accepts structured JSON (`StructuredVerdictV1`). The payload contains:
- `proposed_action`: ADVANCE | BLOCK | REQUIRE_CORRECTION | NEEDS_REVIEW
- `route_recommendation`: `doc` | `impl` | `arch` (where to route on a BLOCK)
- `findings`: numbered list with severity, category, description
- `confidence_score`, `tested_at`, `runner_id`

Non-conforming payloads (e.g., `route_recommendation: "full"`) are rejected with HTTP 422 — the pipeline never accepts ambiguous routing decisions.

**Auto-advance:** When a CANONICAL_AUTO feedback payload proposes ADVANCE at eligible gates (GATE_0, GATE_1) with no blocking findings, the pipeline advances automatically. GATE_2 and above always require human-in-the-loop approval.

**The correction cycle:** When a gate fails, the specification (LOD400) is updated to a new version by the architecture team (or correction agent). The builder implements against the new version. The gate is rerun. Correction cycle count is tracked on the run record.

---

## 10. Roadmap Structure

The project roadmap uses a 4-level hierarchy:

```
Portfolio
  └── Stage (Milestone)    — S001, S002, S003 ...
        └── Program         — S003-P005
              └── Work Package — S003-P005-WP001
```

Exactly one Stage is active globally at any time. All active programs must be within the active Stage. Programs group related work packages under a shared strategic objective.

**Current roadmap:**

| Stage | Name | Status | Scope |
|-------|------|--------|-------|
| S001 | Foundations Sealed | COMPLETED | Core infrastructure, auth, base pages |
| S002 | Active Development | ACTIVE | Core TikTrack features, AOS v3 pipeline |
| S003 | Essential Data | PLANNED | User data layer, preferences, system settings |
| S004 | Financial Execution | PLANNED | P&L, positions, cash flow |
| S005 | Trades & Plans | PLANNED | Complex entities, trade planning |
| S006 | Advanced Analytics | PLANNED | Portfolio analytics, strategy |

**AOS programs are within the active stage.** When a TikTrack work package is in progress, AOS is managing it. When an AOS work package is in progress, it is improving the pipeline infrastructure used to build TikTrack.

---

## 11. Key Architectural Principles (Iron Rules)

These are locked by the Principal and cannot be modified without constitutional authority:

1. **One human, all others are AI agents.** There is exactly one human in the organization. All other roles are LLM agents, each with defined engine assignments, writing authorities, and gate roles.

2. **Cross-engine validation is mandatory.** Every LLM output must be validated by a different agent — preferably a different engine (e.g., Claude Code builds → OpenAI validates). No team self-validates final outputs.

3. **Stage = Milestone.** Exactly one stage is active globally. All active programs must be within the active stage. The stage boundary is a hard lifecycle constraint, not a planning label.

4. **LOD400 is the minimum for build authorization.** No builder agent may begin implementation without an approved LOD400. Ambiguous specs are sent back, not "interpreted."

5. **LOD500 requires a `spec_ref`.** Every as-built record must reference the exact LOD400 version it documents. A LOD500 without a traceable LOD400 is not a valid closure record.

6. **Correction cycles update the spec, not just the code.** When implementation reveals a spec gap, the LOD400 is updated to a new version. The builder then implements against the new version. The spec is always the source of truth — not the code.

---

## 12. Why This Context Matters for the LOD Standard

The LOD standard (v0.2) was designed in and for this environment. Reviewers should evaluate it against these questions:

**Does the two-track model (Track A/B) make sense given the environment?**
Most AOS and TikTrack work packages are single-component feature additions — they follow established patterns and don't require LOD300. A small number involve multi-system coordination (new APIs, new state machines) and do require a system behavior specification layer. The track model reflects this reality.

**Is the LOD400 bar set at the right level?**
The builders are LLM agents, not human developers who can "figure it out." A weak spec produces a wrong implementation with high confidence. LOD400's "zero-ambiguity" standard exists because the cost of specification gaps is correction cycles, not just code review comments.

**Is LOD500 independent validation enforceable?**
Yes — it is enforced by the gate model (GATE_5 requires cross-engine sign-off) and by the authority matrix (the implementing team cannot approve its own LOD500). In practice: the builder is Claude Code or Cursor → the validator is OpenAI, or vice versa. The engines have different training, different blind spots, different failure modes.

**Is the versioning policy proportionate to the system's needs?**
The gate model gates decisions to specific spec versions. "What did GATE_2 approve?" requires an immutable answer. If the LOD400 is mutable after GATE_2 approval, the gate history is unreliable. Immutability + versioning is structurally required, not bureaucratic overhead.

---

*Document prepared for external review of LOD Standard v0.3 (RELEASE_CANDIDATE).*
*Reference document: `_COMMUNICATION/team_100/TEAM_100_LOD_STANDARD_v0.3.md`*

**log_entry | TEAM_100 | SYSTEM_CONTEXT_FOR_EXTERNAL_REVIEW | 2026-04-02**
