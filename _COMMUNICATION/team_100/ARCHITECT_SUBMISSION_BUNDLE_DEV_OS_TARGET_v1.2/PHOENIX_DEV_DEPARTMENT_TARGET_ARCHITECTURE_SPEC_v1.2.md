# PHOENIX_DEV_DEPARTMENT_TARGET_ARCHITECTURE_SPEC.md

Version: 1.2 (DRAFT)
Date: 2026-02-18
Owner: Team 100 + Nimrod + Chief Architect
Status: FOR_ARCHITECT_APPROVAL (v1.2)

---

## 0) Purpose
Lock the **final target operating system** for Phoenix development:
- Two departments (Architecture vs Development)
- A deterministic Engine running execution logistics
- A 7-gate supply chain from **Gate 0** to **Gate 6 (Human Sign-off)**

This is the **canonical target** used to derive the POC plan. No POC starts until v1.2 is approved.

---

## 1) Non‑Negotiables (Iron Rules)

### 1.1 No‑Guessing Rule (MUST)
- Development MUST NOT infer missing requirements.
- Any ambiguity MUST trigger a clarification loop back to Architecture.
- Work proceeds only when requirements are **complete, explicit, and testable**.

### 1.2 Independent Validation Rule (MUST)
- No team completes work without **another team** validating it.
- Validation gates can BLOCK progress.

### 1.3 Authority Model Rule (MUST)
- **00_MASTER_INDEX.md** is the active SSOT authority anchor.
- Architect decisions/directives are implemented only after validation and alignment to SSOT.

### 1.4 No Screenshots Policy (LOCKED)
- Agents MUST NOT use screenshots for visual validation.
- Visual validation is **DOM & CSS Structural Validation** (see §7).

---

## 2) Org Realignment (LOCKED) — Team Number Sovereignty

### 2.1 Architecture Department (100+)
- **Nimrod (Human)**: Product Owner, final approver, final human visual sign‑off (Gate 6)
- **Chief Architect (Gemini)**: principal architect; issues directives/ADRs
- **Team 100 (ChatGPT)**: spec engineering, orchestration design, risk analysis
- **Team 170 (Librarian / SSOT Owner)**: owns SSOT knowledge promotion & index governance
- **Team 190 (Architectural Validator)**: Gate‑B authority for ADR compliance / architecture alignment
- **Team 91 (Architect Intelligence Spy, Codex)**: read‑only audit intelligence for Architecture (drift/risk/options)

### 2.2 Development Department (10–90)
- **Team 10 (Gateway)**: orchestrates execution pipeline; routing; stage activation; coordination
- **Teams 20/30/40/50/60 (Execution & QA)**: implementation, UI/UX, QA, infra
- **Team 70 (Product Intelligence)**: stays in Development; translates code to product narrative & closed product docs
- **Team 90 (Dev Validator)**: development-side validation (Dev SOP compliance/evidence)

> Team 190 is the **architectural** Gate‑B authority. Team 90 remains **development** validation authority.

---

## 3) The Engine (Development Engine) — Mission

### 3.1 Definition
The Engine receives **Approved Spec Packages** and runs Development to deliver:
- working code
- tests
- evidence artifacts
- QA pass
- sealed knowledge promotion package
- readiness for human visual sign‑off

### 3.2 Engine boundaries (MUST)
Engine MAY:
- decompose work, define gates, route tasks
- request clarifications
- block on ambiguity and failed gates
- request/verify evidence artifacts

Engine MUST NOT:
- invent requirements
- bypass gates
- change SSOT directly (unless explicitly authorized in later phases)

---

## 4) Spec Package Contract (LOCKED) — “Throw Over the Wall”
The architecture department hands the Engine a **Spec Package** with a strict schema.

### 4.1 Canonical schema
`SPEC_PACKAGE_SCHEMA_v1.0.json`

### 4.2 Minimum required fields (MUST)
- module_id, stage_id, context
- scope (in/out)
- requirements (atomic)
- acceptance_criteria
- data_contracts (schemas)
- ui_contract (flows/states; blueprint references)
- edge_cases
- test_plan (PASS definition)
- dependencies
- operational_constraints

Missing any required field → **Gate 0 blocks** and triggers Retry Logic (see §6).

---

## 5) Artifact Taxonomy (LOCKED)
Engine may only create artifacts from an approved registry:
`ARTIFACT_TAXONOMY_REGISTRY_v1.0.md`

---

## 6) Retry / Clarification Logic (LOCKED)
Deterministic loop when Gate 0 blocks:
`RETRY_AND_CLARIFICATION_PROTOCOL_v1.0.md`

---

## 7) Blueprint‑First Requirement (LOCKED) — UPDATED WEIGHTING

### 7.1 What “Blueprint” means now
Blueprint is a **structural UI contract** (DOM/CSS structure + states + flows) that enables deterministic validation.

### 7.2 Updated weighting (per Nimrod clarification)
- Early phases required high visual precision.
- Current phase: most core UI objects already exist and are integrated.
- Blueprint becomes primarily:
  - reference + constraint (learn from existing UI / legacy UI)
  - not a pixel-perfect redesign exercise.

### 7.3 Still mandatory: user-directed UI spec + real presentation early
- User-guided UI specification is required early (Gate 1).
- Review is against a **live served UI**, but validation is structural (DOM/CSS), not screenshots.

### 7.4 DOM & CSS Structural Validation (NO SCREENSHOTS)
Agents validate UI via:
- DOM tree structure
- class names / attributes
- CSS variables/tokens
Compared against the blueprint contract produced in Gate 1.

---

## 8) 7‑Gate Supply Chain (LOCKED)

### Gate 0 — Intake & Completeness (Engine)
- Input: Spec Package JSON
- Output: completeness report or PASS

### Gate 1 — Blueprint / Proof Gate (Architecture approval)
Deliverables:
- UI contract (flows/states + blueprint references)
- DOM contract expectations
- feasibility evidence
- acceptance criteria frozen

### Gate 2 — Implementation (Development)
- code + tests + integration

### Gate 3 — QA (Team 50)
- QA pass report + evidence

### Gate 4 — Dev Validation (Team 90)
- dev SOP compliance + evidence completeness

### Gate 5 — Architectural Validation (Team 190) + Knowledge Promotion (Team 170)
- Team 190: ADR alignment / architecture compliance (Gate‑B)
- Team 170: SSOT promotion, index update, archive comms, seal artifact

### Gate 6 — Human Visual Sign‑off (Nimrod only)
- Live build only; no screenshot validation artifacts
- Nimrod final approval

---

## 9) Phased Implementation Plan (target; incremental)
Phase A: Governance foundations (complete)
Phase B: POC‑1 Observer Engine (read‑only state reconstruction)
Phase C: POC‑2 Gate 0 Completeness Validator (schema‑driven)
Phase D: POC‑3 Advisor Orchestrator (workplan drafts + routing)
Phase E: Controlled Executor (optional; strict write‑zones)

---

## 10) Approval Checklist (Chief Architect + Nimrod)
Chief Architect approves:
1) Org realignment to 100+/170/190 and Team 70 placement
2) 7-gate supply chain mapping
3) Spec Package JSON Schema contract
4) Artifact taxonomy registry
5) Retry/clarification protocol
6) DOM/CSS structural validation policy (no screenshots)
7) Blueprint-first requirement with updated weighting

Nimrod approves:
- Human sign-off gate definition and escalation rules

---

**log_entry | TEAM_100 | AGENT_MODEL_V1_2_TARGET_SPEC_DRAFTED | 2026-02-18**
