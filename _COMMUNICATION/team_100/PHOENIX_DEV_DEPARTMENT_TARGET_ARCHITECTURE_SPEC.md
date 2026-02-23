# PHOENIX_DEV_DEPARTMENT_TARGET_ARCHITECTURE_SPEC.md
**project_domain:** TIKTRACK

Version: 1.0 (DRAFT)
Date: 2026-02-18
Owner: Team 100 + Nimrod + Architect
Status: FOR_ARCHITECT_APPROVAL

---

## 0) Purpose
Define the **final target architecture** for TikTrack Phoenix development as a two-department operating model:

- **Architecture Department** (planning + approvals)
- **Development Department** (execution engine + teams)

This spec is the **north star**. Implementation will be **gradual, stage-based**, but the target must be locked first to prevent drift.

---

## 1) Core Principle (Non‑Negotiable)

### 1.1 No-Guessing Rule (MUST)
- Development MUST NOT infer missing requirements.
- Any ambiguity MUST trigger a clarification loop back to Architecture Department (Architect + Nimrod), via the Engine.
- Work may proceed only when requirements are **complete, explicit, and testable**.

### 1.2 Separation of Responsibilities (MUST)
- Architecture produces **approved** specifications and decisions.
- Development produces **approved** code + tests + evidence.
- Validation is independent and blocks progress on contradictions.

---

## 2) Departments and Roles

### 2.1 Architecture Department (Planning + Control)
**Members**
- **Nimrod** (Human): product owner, final approver, final visual sign-off
- **Architect (Gemini)**: principal architect, issues architectural decisions/directives
- **Team 100 (ChatGPT)**: spec engineering, research, orchestration design, risk analysis

**Responsibilities**
- Produce and approve **module specs** (blueprints) with zero ambiguity.
- Approve gates:
  - Spec Gate approval (before development starts)
  - Pre-implementation Gate approval (schemas/mocks/feasibility)
  - Final Acceptance Gate (including visual approval by Nimrod)

### 2.2 Development Department (Execution Engine)
**Members**
- Teams 10/20/30/40/50/60/70 (Cursor)
- Engine Agent (the “Development Engine”)
- (Validation teams) Team 90 and/or split units (see §3)

**Responsibilities**
- Execute approved specs through gates.
- Produce code, tests, evidence, reports.
- Detect missing info and escalate (no guessing).

---

## 3) Validation Unit Design (Team 90)

### 3.1 Current state
Team 90 performs both:
- External validation (gates, contradictions, drift)
- “Spy” reality checks (governance vs reality)

### 3.2 Is dual-role a problem?
**Not inherently**, but it becomes a risk when:
- the unit begins to “help execute” instead of purely validate,
- conflicts appear between Architecture needs and Development execution timelines.

### 3.3 Recommended target (clean separation)
Adopt a **two-lane validation model** (can be implemented later, but target is locked now):

- **Team 90A — Validator** (Gate-B / compliance)
  - Objective: PASS/BLOCK decisions only
  - No suggestions beyond compliance deltas
- **Team 90B — Audit/Spy** (Reality map / drift scanner)
  - Objective: find hidden drift, missing artifacts, non-compliance patterns
  - Generates audit reports; does not block directly (feeds 90A)

If you keep a single Team 90 for now:
- enforce “two-hat protocol” in one team:
  - Separate outputs: `*_VALIDATION_*` vs `*_AUDIT_*`
  - No mixed reports
  - Explicit mode header in every document

---

## 4) Knowledge & Documentation Ownership (Team 70 vs Team 10)

### 4.1 Target stance (recommended)
- **Team 70 = Development Knowledge Ops (Librarian)**  
  Owns: documentation aggregation, standards registry, governance matrices, knowledge promotion execution.
  Organizationally part of the Development Department only. May provide documentation support to Architecture via a dotted-line request flow, without departmental reassignment.

- **Team 10 = Development Gateway / Orchestrator**  
  Owns: stage activation, routing, gate coordination, publication approvals, index-sync requests (but NOT bulk documentation writing).

### 4.2 Alternative stance (allowed)
If the Engine becomes the dominant coordinator and Team 10 is overloaded:
- Keep Team 70 in Development (still recommended)
- Team 10 remains a routing gateway and decision escalator
- Team 70 executes knowledge promotion end-stage work and archives comms.

**Decision to lock with Architect:** Team 70 stays in Development Department with dotted-line to Architecture.

---

## 5) Development Engine (Agent) — Final Mission

### 5.1 Definition
A **Development Engine** that receives approved specification packages and autonomously runs the development department to deliver:
- working code,
- tests,
- evidence artifacts,
- QA pass,
- final bundle for human visual approval.

### 5.2 Engine authority boundaries (MUST)
Engine MAY:
- ask for clarifications
- decompose work into steps and gates
- route tasks to teams
- request evidence and verification
- block progress on ambiguity, drift, or failed gates

Engine MUST NOT:
- invent missing requirements
- bypass gates
- change SSOT directly (unless in future Level-3 with strict write contracts)
- alter Architect Decisions

---

## 6) Gate Model (End-to-End)

### Gate 0 — Intake / Completeness (Engine-controlled)
- Input: spec package
- Output: completeness assessment
- If incomplete: clarification loop to Architecture Dept

### Gate 1 — Pre-Implementation Proof Gate (Architecture approval required)
Deliverables:
- schemas/contracts
- UI mock (interactive where possible)
- feasibility evidence (spikes, PoCs, risk notes)
- acceptance criteria confirmed

### Gate 2 — Implementation Gate (Development execution)
Deliverables:
- code implemented
- unit/integration tests
- artifacts generated
- migration notes

### Gate 3 — QA Gate (Team 50)
Deliverables:
- QA report
- PASS criteria met

### Gate 4 — External Validation Gate (Team 90A)
Deliverables:
- validation report (PASS/BLOCK)
- authority/consistency check

### Gate 5 — Knowledge Promotion + Seal (Team 70 executes; Team 10 approves routing; Team 90 validates)
Deliverables:
- updated documentation (as per protocol)
- archive comms
- seal artifact

### Gate 6 — Human Visual Approval (Nimrod only)
Deliverable:
- live build accessible
- no screenshots as approval artifact
- Nimrod final sign-off

---

## 7) Specification Package Contract (What “Architecture throws over the wall”)
A spec package MUST contain (minimum):
- scope (in/out)
- acceptance criteria
- data contracts & schemas
- UI flows & states
- edge cases explicitly enumerated
- test approach (what constitutes pass)
- operational constraints
- dependencies

If any item is missing → Gate 0 blocks and requests clarifications.

---

## 8) Artifact & Template Standardization (Target)
Target requirement:
- Every recurring artifact type has:
  - a canonical template
  - required metadata
  - canonical path
  - owner and validation owner

Team 90 to publish:
- **Artifact Taxonomy Registry**
- **Template Registry** (single index)
- Enforced naming rules (TEAM_<id>_... + stage IDs)

---

## 9) Phased Implementation Plan (Stage-Based)

### Phase A — Foundation (NOW, already mostly done)
- governance alignment
- docs structure
- authority anchors
- clean-for-agent validation

### Phase B — POC 1 (Observer Engine)
Goal:
- reconstruct current stage state from artifacts (read-only)
Outputs:
- state_snapshot.md/json
No repo writes.

### Phase C — POC 2 (Spec Completeness Validator)
Goal:
- Gate 0 automation: detect ambiguity & missing parts
- clarification loop artifacts

### Phase D — POC 3 (Advisor Orchestrator)
Goal:
- propose workplans, gates, team routing (still read-only outputs)

### Phase E — Controlled Executor (Write contracts, optional)
Goal:
- engine can create drafts in allowed write-zones
- never touches SSOT without gates

---

## 10) Approval Items (Architect + Nimrod)
Architect must approve:
1. Two-department structure
2. Engine mission and boundaries
3. Gate model (0–6)
4. Team 70 placement (Development Knowledge Ops)
5. Validation split target (90A/90B) or two-hat protocol
6. Spec package minimum contract
7. No-screenshot visual approval rule (human-only)

Nimrod must approve:
- final gate authority and escalation rules

---

**log_entry | TEAM_100 | TARGET_DEV_DEPARTMENT_ARCH_SPEC_DRAFTED | 2026-02-18**
