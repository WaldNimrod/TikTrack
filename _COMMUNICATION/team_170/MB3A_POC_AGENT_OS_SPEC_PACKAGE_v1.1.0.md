# MB3A POC Agent OS Spec Package v1.1.0

**id:** MB3A_POC_AGENT_OS_SPEC_PACKAGE_v1.1.0  
**version:** 1.1.0  
**change_type:** STRUCTURAL_ENHANCEMENT  
**requires_constitutional_review:** YES  
**subtitle:** FOUNDATION → L0 ROADMAP → POC-1 → MB3A ALERTS | Roadmap-First State Model  
**from:** Team 170 (Librarian / SSOT Authority)  
**to:** Team 190 (Constitutional Validator), Team 10 (The Gateway)  
**re:** PHOENIX DEV OS — SPEC PACKAGE STRUCTURAL UPDATE (v1.0.0 → v1.1.0)  
**date:** 2026-02-19  
**stage context:** GAP_CLOSURE_BEFORE_AGENT_POC  
**authority:** Team 170 = SSOT integrity + knowledge promotion only. No Gate authority. No guessing.  
**context:** TARGET_MODEL_v1.2_LOCKED | Dual-Manifest Active | Roadmap-First State Model Activated

---

## 1) Purpose & North Star

This package is a **structural enhancement** to v1.0.0. It integrates:

- **L0 ROADMAP** as root of work-state hierarchy.
- **Phase Ownership Enforcement** (every L1/L2/L3 node has phase_owner, responsible_team).
- **Channel E formalization** (Team 10 ↔ Dev Teams: Approved L2 → TASK_COMPLETION_REPORT, INITIAL_INTERNAL_VERIFICATION, submission to Team 50).

The North Star remains **Agent OS**: SSM/WSM, Gates 0–6, POC-1 Observer (read-only), MB3A Alerts as locked module reference. No directional change to product or gates.

---

## 2) Foundation (SSM / WSM + Gates)

### 2.1 SSM (System State Manifest)

- **Canonical source:** `_COMMUNICATION/_Architects_Decisions/PHOENIX_MASTER_SSM_v1.0.0.md` (post Gate 5 F1 remediation; no speculative Alerts).
- **Content lock:** Governance core, Gate 5 = Team 190 / Gate 6 = Nimrod, Entity ALERT (UUID; is_active, is_triggered, deleted_at only; dom_contract from Alerts spec), ADR Lock Registry, Active Stage Control.

### 2.2 WSM (Work State Manifest) — Hierarchy

- **Canonical WSM:** _COMMUNICATION/_Architects_Decisions/PHOENIX_MASTER_WSM_v1.0.0.md.
- **Extension (L0–L3):** This package §3. Every L1/L2/L3 node MUST include: **roadmap_parent_id**, **required_ssm_version**, **required_active_stage**, **phase_owner**, **responsible_team**. Any task missing these fields is invalid.

### 2.3 Gates (0–6)

- **Source:** _COMMUNICATION/team_100/DEV_OS_TARGET_MODEL_CANONICAL_v1.3.1/04_GATE_MODEL_PROTOCOL.md.
- **Signers:** Gate 5 = Team 190 (Constitutional Validation). Gate 6 = Nimrod (Final UX Approval). No agent SSOT writes or feature scaling without Gate 5 pass and, where required, Gate 6 pass.

---

## 3) WSM EXPANSION — L0 ROADMAP + L1/L2/L3 (MANDATORY)

**Structure:**

- **L0 – Roadmap (Strategic Initiatives)** — root of work-state hierarchy.
- **L1 – Initiative Modules** — each has roadmap_parent_id = L0 node.
- **L2 – Work Packages** — each has roadmap_parent_id = L1 node; phase_owner assigned by Team 10 (Center of Gravity).
- **L3 – Atomic Tasks** — each has roadmap_parent_id = L2 node.

### L0 – ROADMAP (Strategic Initiatives)

| roadmap_id | description | required_ssm_version | required_active_stage |
|------------|-------------|----------------------|------------------------|
| L0-PHOENIX | Phoenix Dev OS & Agent POC (ADR-026, Dual-Manifest) | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC |

### L1 – Initiative Modules

| task_id | roadmap_parent_id | description | required_ssm_version | required_active_stage | phase_owner | responsible_team |
|---------|-------------------|-------------|----------------------|------------------------|------------|-------------------|
| L1-FOUND | L0-PHOENIX | Foundation (SSM/WSM, Gates) | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Team 10 | 170, 10 |
| L1-POC1 | L0-PHOENIX | POC-1 Observer / Agent OS | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Team 10 | 170 |
| L1-MB3A | L0-PHOENIX | MB3A Alerts (D34) | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Team 10 | 30, 50 |

### L2 – Work Packages

| task_id | roadmap_parent_id | description | required_ssm_version | required_active_stage | phase_owner | responsible_team |
|---------|-------------------|-------------|----------------------|------------------------|------------|-------------------|
| L2-SSM-001 | L1-FOUND | SSM entity registry (ALERT from spec/code only) | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Team 10 | 170 |
| L2-WSM-001 | L1-FOUND | WSM task structure L0–L3 | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Team 10 | 170 |
| L2-GATE-001 | L1-FOUND | Gate chain wiring (SSM signer semantics) | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Team 10 | 170 |
| L2-POC1-001 | L1-POC1 | POC-1 Observer spec (read-only; STATE_SNAPSHOT.json) | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Team 10 | 170 |
| L2-MB3A-ALERTS-001 | L1-MB3A | Alerts spec lock (reference; Gate 5 PASS) | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Team 10 | 170 |

### L3 – Atomic Tasks

| task_id | roadmap_parent_id | description | required_ssm_version | required_active_stage | phase_owner | responsible_team |
|---------|-------------------|-------------|----------------------|------------------------|------------|-------------------|
| L3-POC1-OBS-001 | L2-POC1-001 | Implement POC-1 Observer: read disk only → STATE_SNAPSHOT.json | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Team 10 | Agent/POC |
| L3-POC1-OBS-002 | L2-POC1-001 | Validate STATE_SNAPSHOT.json per POC-1 rules | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Team 10 | Agent/POC |

**Rule:** No phase may execute without explicit phase_owner. Owner is responsible for coordination, artifact completeness, and submission to next Gate.

---

## 4) Phase Ownership Matrix (MANDATORY)

Team 10 assigns **phase_owner** per L2 (Center of Gravity principle). Owner responsible for: coordination, artifact completeness, submission to next Gate.

| L2 Work Package | phase_owner | responsible_team | next_gate |
|-----------------|------------|-------------------|-----------|
| L2-SSM-001 | Team 10 | 170 | Gate 5 |
| L2-WSM-001 | Team 10 | 170 | — |
| L2-GATE-001 | Team 10 | 170 | Gate 5 |
| L2-POC1-001 | Team 10 | 170 | Gate 5 |
| L2-MB3A-ALERTS-001 | Team 10 | 170 | Gate 5 PASS (done) |

---

## 5) Channel E Formalization (Team 10 ↔ Dev Teams)

**Channel E** is the defined phase for handoff from Team 10 to Dev Teams for execution and back.

| Item | Definition |
|------|------------|
| **Input** | Approved L2 Work Package (by Gate 5 where required; Team 10 approval for execution order). |
| **Output** | TASK_COMPLETION_REPORT; INITIAL_INTERNAL_VERIFICATION; submission to Team 50 (QA / Gate 3). |
| **Rule** | No execution of L3 tasks without Approved L2; no closure without TASK_COMPLETION_REPORT and, per SOP-013, Seal Message where applicable. |

---

## 6) Alert State Correction (Declaration)

- **SSM canonical** (_Architects_Decisions/PHOENIX_MASTER_SSM_v1.0.0.md) has been updated per Gate 5 F1 remediation. ALERT entity: UUID; is_active, is_triggered, deleted_at only; dom_contract from ALERTS_WIDGET_SPEC_v1.0.1_FULL_LOCK.md only.
- **No guessed Alert states** (e.g. ACTIVE/TRIGGERED/DISMISSED/ARCHIVED) in this package or in SSM. If mismatch detected between spec and code → mark BLOCKER; do NOT infer.

---

## 7) POC-1 Observer Spec (Reference — Unchanged)

- **Document:** _COMMUNICATION/team_170/POC_1_OBSERVER_SPEC_v1.0.0.md.
- **SSM input for POC-1:** _COMMUNICATION/_Architects_Decisions/PHOENIX_MASTER_SSM_v1.0.0.md (single authoritative source).
- Objective, STATE_SNAPSHOT.json schema, validation rules V1–V8 unchanged.

---

## 8) Alerts Module Spec (Reference — Locked)

- **Document:** _COMMUNICATION/team_170/ALERTS_WIDGET_SPEC_v1.0.1_FULL_LOCK.md.
- **Constitutional review (PASS):** _COMMUNICATION/team_190/MB3A_ALERTS_WIDGET_SPEC_V1_0_1_CONSTITUTIONAL_REVIEW.md.
- Reference only; no changes to Alerts spec in this package.

---

## 9) Validation Matrix (Updated)

| Definition / Item | Source file(s) | Evidence type |
|-------------------|----------------|----------------|
| SSM Governance Core + ALERT entity | _COMMUNICATION/_Architects_Decisions/PHOENIX_MASTER_SSM_v1.0.0.md | Canonical (post F1 remediation) |
| Gate 5 / Gate 6 signers | PHOENIX_MASTER_SSM_v1.0.0.md, 04_GATE_MODEL_PROTOCOL.md | SSM + Gate protocol |
| WSM L0–L3 + Phase Ownership | This document §3, §4 | Spec package v1.1.0 |
| Channel E | This document §5 | Spec package v1.1.0 |
| POC-1 Observer objective & output | POC_1_OBSERVER_SPEC_v1.0.0.md | Spec |
| POC-1 validation rules V1–V8 | POC_1_OBSERVER_SPEC_v1.0.0.md §4 | Spec |
| Alerts endpoint/DB/state/DOM | ALERTS_WIDGET_SPEC_v1.0.1_FULL_LOCK.md §A–D | Locked spec |
| Alerts constitutional pass | MB3A_ALERTS_WIDGET_SPEC_V1_0_1_CONSTITUTIONAL_REVIEW.md | Team 190 review |
| Active stage | _COMMUNICATION/team_10/ACTIVE_STAGE.md | Stage doc |
| Master Index | 00_MASTER_INDEX.md | Repo root |

---

## 10) No-Guessing Declaration & Structural Declaration

All definitions in this package are derived from **existing artifacts** only. SSM ALERT and Gate signers from canonical PHOENIX_MASTER_SSM_v1.0.0.md (code/spec-derived). WSM L0–L3 from ADR-026, PHOENIX_MASTER_WSM, and mandate; phase_owner assigned by Team 10 per Center of Gravity. POC-1 from POC_1_OBSERVER_SPEC_v1.0.0. Alerts from locked v1.0.1 spec and constitutional review.

**Explicit declaration:** **No inferred states or ownership assumptions present.** All phase_owner and responsible_team values are set by this spec or by Team 10 assignment per protocol; no inferred ownership.

---

## Submission

This consolidated package (v1.1.0) is submitted to **Team 190 for Gate 5 constitutional review**.  
**Change type:** STRUCTURAL_ENHANCEMENT (L0 Roadmap, Phase Ownership, Channel E). **Requires constitutional review:** YES.

**Package artifacts:**

- _COMMUNICATION/team_170/MB3A_POC_AGENT_OS_SPEC_PACKAGE_v1.1.0.md (this document)
- _COMMUNICATION/_Architects_Decisions/PHOENIX_MASTER_SSM_v1.0.0.md
- _COMMUNICATION/team_170/POC_1_OBSERVER_SPEC_v1.0.0.md
- _COMMUNICATION/team_170/ALERTS_WIDGET_SPEC_v1.0.1_FULL_LOCK.md
- _COMMUNICATION/team_190/MB3A_POC_AGENT_OS_SPEC_PACKAGE_V1_0_0_CONSTITUTIONAL_REVIEW.md (v1.0.0 PASS; Gate 6 ready)

---

**log_entry | TEAM_170 | MB3A_POC_AGENT_OS_SPEC_PACKAGE_v1.1.0 | STRUCTURAL_ENHANCEMENT | SUBMITTED_FOR_GATE5 | 2026-02-19**
