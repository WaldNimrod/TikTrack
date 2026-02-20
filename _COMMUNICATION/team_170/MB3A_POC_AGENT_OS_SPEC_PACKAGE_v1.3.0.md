# MB3A POC Agent OS Spec Package v1.3.0

**id:** MB3A_POC_AGENT_OS_SPEC_PACKAGE_v1.3.0  
**version:** 1.3.0  
**change_type:** TASK_IDENTITY_BINDING  
**requires_constitutional_review:** YES  
**subtitle:** FOUNDATION → L0 ROADMAP → POC-1 → MB3A ALERTS | Hierarchical Task ID Binding  
**from:** Team 170 (Librarian / SSOT Authority)  
**to:** Team 190 (Constitutional Validator), Team 10 (The Gateway)  
**re:** PHOENIX DEV OS — HIERARCHICAL TASK ID BINDING UPDATE (v1.2.0 → v1.3.0)  
**date:** 2026-02-20  
**stage context:** GAP_CLOSURE_BEFORE_AGENT_POC  
**authority:** Team 170 = SSOT integrity + knowledge promotion only. No Gate authority. No guessing.  
**context:** All Gates bound to full hierarchical task identity; no track abstraction; identity hierarchy replaces track separation.

---

## 0) MANDATORY HEADER (ALL ARTIFACTS)

**No Gate review is valid without full identity binding.** Every artifact in the WSM execution flow, Validation Kernel, Gate Review, and QA report MUST carry the following header (or equivalent structured block) at the top of the document or payload:

| Field | Definition |
|-------|-------------|
| **roadmap_id** | L0 identifier (e.g. L0-PHOENIX) |
| **initiative_id** | L1 identifier (e.g. L1-FOUND, L1-POC1, L1-MB3A) |
| **work_package_id** | L2 identifier (e.g. L2-SSM-001, L2-POC1-001) |
| **task_id** | L3 identifier when applicable (e.g. L3-POC1-OBS-001); else same as work_package_id or N/A |
| **gate_id** | Gate at which this artifact is produced or reviewed (GATE_0 … GATE_6) |
| **phase_owner** | Team 10 (or as assigned per Phase Ownership Matrix) |
| **required_ssm_version** | 1.0.0 (or as per node) |
| **required_active_stage** | GAP_CLOSURE_BEFORE_AGENT_POC (or as per node) |

**Constraint:** No track abstraction is to be introduced. **Identity hierarchy replaces track separation.** Context is determined solely by the hierarchy (roadmap → initiative → work_package → task) and gate_id.

---

## 1) Purpose & North Star

This package extends v1.2.0 by **binding all Gates to full hierarchical task identity**. It eliminates cross-context ambiguity: every validation request, validation response, gate review, and QA report is bound to a unique (roadmap_id, initiative_id, work_package_id, task_id, gate_id) so that no two contexts are confused. The North Star and all other package content (SSM/WSM, Channel 10↔90, Validation Kernel, Alerts) remain as in v1.2.0.

---

## 2) Foundation (SSM / WSM + Gates)

Unchanged from v1.2.0: §2.1 SSM, §2.2 WSM, §2.3 GATE ENUM. Source: PHOENIX_MASTER_SSM_v1.0.0.md, GATE_ENUM_CANONICAL_v1.0.0.md.

---

## 3) WSM EXPANSION — L0 ROADMAP + L1/L2/L3 (Identity-Bound Schema)

Structure as in v1.2.0. **WSM schema update:** Every L0/L1/L2/L3 node is identified by the hierarchical IDs below. Every artifact produced for or at that node MUST include the Mandatory Header (§0) with the corresponding roadmap_id, initiative_id, work_package_id, task_id (where applicable), gate_id, phase_owner, required_ssm_version, required_active_stage.

### L0 – ROADMAP

| roadmap_id | description | required_ssm_version | required_active_stage |
|------------|-------------|----------------------|------------------------|
| L0-PHOENIX | Phoenix Dev OS & Agent POC (ADR-026, Dual-Manifest) | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC |

### L1 – Initiative Modules (initiative_id = task_id)

| task_id (initiative_id) | roadmap_id | description | required_ssm_version | required_active_stage | phase_owner | responsible_team |
|-------------------------|------------|-------------|----------------------|------------------------|------------|-------------------|
| L1-FOUND | L0-PHOENIX | Foundation (SSM/WSM, Gates) | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Team 10 | 170, 10 |
| L1-POC1 | L0-PHOENIX | POC-1 Observer / Agent OS | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Team 10 | 170 |
| L1-MB3A | L0-PHOENIX | MB3A Alerts (D34) | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Team 10 | 30, 50 |

### L2 – Work Packages (work_package_id = task_id)

| task_id (work_package_id) | initiative_id | roadmap_id | description | required_ssm_version | required_active_stage | phase_owner | responsible_team |
|---------------------------|---------------|------------|-------------|----------------------|------------------------|------------|-------------------|
| L2-SSM-001 | L1-FOUND | L0-PHOENIX | SSM entity registry (ALERT from spec/code only) | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Team 10 | 170 |
| L2-WSM-001 | L1-FOUND | L0-PHOENIX | WSM task structure L0–L3 | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Team 10 | 170 |
| L2-GATE-001 | L1-FOUND | L0-PHOENIX | Gate chain wiring (SSM signer semantics) | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Team 10 | 170 |
| L2-POC1-001 | L1-POC1 | L0-PHOENIX | POC-1 Observer spec (read-only; STATE_SNAPSHOT.json) | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Team 10 | 170 |
| L2-MB3A-ALERTS-001 | L1-MB3A | L0-PHOENIX | Alerts spec lock (reference; Gate 5 PASS) | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Team 10 | 170 |

### L3 – Atomic Tasks (task_id)

| task_id | work_package_id | initiative_id | roadmap_id | description | required_ssm_version | required_active_stage | phase_owner | responsible_team |
|---------|-----------------|---------------|------------|-------------|----------------------|------------------------|------------|-------------------|
| L3-POC1-OBS-001 | L2-POC1-001 | L1-POC1 | L0-PHOENIX | Implement POC-1 Observer: read disk only → STATE_SNAPSHOT.json | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Team 10 | Agent/POC |
| L3-POC1-OBS-002 | L2-POC1-001 | L1-POC1 | L0-PHOENIX | Validate STATE_SNAPSHOT.json per POC-1 rules | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Team 10 | Agent/POC |

Channel 10↔90 fields (gate_id GATE_4, validation_status, iteration_count, max_resubmissions) per v1.2.0 §3.1 apply to L2 Work Packages when in the validation loop.

---

## 4) CHANNEL 10↔90 FULL LOOP (Canonical)

Unchanged from v1.2.0. Paths and termination (PASS / ESCALATE / STUCK) per CHANNEL_10_90_CANONICAL_CONFIRMATION_v1.0.0.

---

## 5) Validation Kernel v0.1 — Phase 1 — Templates Update

**Validation Kernel templates update:** Every artifact in the Channel 10↔90 loop MUST include the Mandatory Header (§0).

- **WORK_PACKAGE_VALIDATION_REQUEST:** MUST contain at top: roadmap_id, initiative_id, work_package_id, task_id (or N/A), gate_id (GATE_4), phase_owner, required_ssm_version, required_active_stage.
- **VALIDATION_RESPONSE:** MUST contain the same header block, matching the request’s work_package_id and gate_id.
- **BLOCKING_REPORT:** MUST contain the same header block, matching the request’s work_package_id and gate_id.

Path templates unchanged: _COMMUNICATION/team_10/TEAM_10_TO_TEAM_90_&lt;WORK_PACKAGE_ID&gt;_VALIDATION_REQUEST.md; _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_&lt;WORK_PACKAGE_ID&gt;_VALIDATION_RESPONSE.md; _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_&lt;WORK_PACKAGE_ID&gt;_BLOCKING_REPORT.md. &lt;WORK_PACKAGE_ID&gt; is the L2 work_package_id (e.g. L2-SSM-001).

---

## 6) Gate Review Templates Update

**Gate Review templates update:** Every Gate Review artifact (e.g. Gate 5 constitutional review, Gate 4 validation response) MUST include the Mandatory Header (§0) with the identity of the work package or initiative under review. **No Gate review is valid without full identity binding.** gate_id in the header MUST be the gate at which the review is performed (e.g. GATE_4, GATE_5).

---

## 7) QA Reports Update

**QA reports update:** Every QA report (e.g. Team 50 QA report, E2E results) that relates to a work package or task MUST include the Mandatory Header (§0) with the corresponding roadmap_id, initiative_id, work_package_id, task_id (when applicable), gate_id (e.g. GATE_3 for QA), phase_owner, required_ssm_version, required_active_stage.

---

## 8) Phase Ownership Matrix (MANDATORY)

Unchanged from v1.2.0. L2 Work Packages with phase_owner, gate_id GATE_4 when in Channel 10↔90, next_gate per row.

---

## 9) Channel E Formalization

Unchanged from v1.2.0. Input: Approved L2 Work Package. Output: TASK_COMPLETION_REPORT; INITIAL_INTERNAL_VERIFICATION; submission to Team 50 (QA / Gate 3). Artifacts MUST carry Mandatory Header with correct work_package_id and gate_id.

---

## 10) Alert State Correction (Declaration)

Unchanged from v1.2.0. SSM canonical ALERT entity; no guessed Alert states.

---

## 11) POC-1 Observer Spec (Reference — Unchanged)

Unchanged from v1.2.0. Document: POC_1_OBSERVER_SPEC_v1.0.0.md. SSM input: PHOENIX_MASTER_SSM_v1.0.0.md.

---

## 12) Alerts Module Spec (Reference — Locked)

Unchanged from v1.2.0. ALERTS_WIDGET_SPEC_v1.0.1_FULL_LOCK.md; constitutional review PASS.

---

## 13) Validation Matrix (Updated for v1.3.0)

| Definition / Item | Source file(s) | Evidence type |
|-------------------|----------------|----------------|
| Mandatory Header (all artifacts) | This document §0 | Spec package v1.3.0 |
| WSM schema (identity-bound L0–L3) | This document §3 | Spec package v1.3.0 |
| Validation Kernel templates (header required) | This document §5 | Spec package v1.3.0 |
| Gate Review templates (header required) | This document §6 | Spec package v1.3.0 |
| QA reports (header required) | This document §7 | Spec package v1.3.0 |
| SSM + ALERT entity | PHOENIX_MASTER_SSM_v1.0.0.md | Canonical |
| Gate enum GATE_0 … GATE_6 | GATE_ENUM_CANONICAL_v1.0.0.md | Canonical confirmation |
| Channel 10↔90 | CHANNEL_10_90_CANONICAL_CONFIRMATION_v1.0.0.md | Canonical confirmation |
| (Other rows as in v1.2.0) | — | — |

---

## 14) No-Guessing Declaration & Identity Binding Constraint

All definitions in this package are derived from **existing artifacts** and the **Team 100 mandate (HIERARCHICAL TASK ID BINDING UPDATE)**. The Mandatory Header and the requirement that every artifact carry full identity binding are from that mandate. WSM schema, Validation Kernel templates, Gate Review templates, and QA reports are updated to require the header; no inferred identity.

**Explicit constraint:** **No track abstraction is to be introduced. Identity hierarchy (roadmap_id → initiative_id → work_package_id → task_id) replaces track separation.** Gate review is valid only when the artifact under review carries the full identity binding.

---

## Submission

This consolidated package (v1.3.0) is submitted to **Team 190 for Gate 5 constitutional review** as part of the **unified validation** with v1.4.0 (see TEAM_170_TO_TEAM_190_UNIFIED_VALIDATION_INSTRUCTION_v1.3_v1.4.md).  
**Change type:** TASK_IDENTITY_BINDING. **Requires constitutional review:** YES.

**Package artifacts:**

- _COMMUNICATION/team_170/MB3A_POC_AGENT_OS_SPEC_PACKAGE_v1.3.0.md (this document)
- _COMMUNICATION/team_170/MB3A_POC_AGENT_OS_SPEC_PACKAGE_v1.2.0.md (predecessor)
- _COMMUNICATION/_Architects_Decisions/PHOENIX_MASTER_SSM_v1.0.0.md
- _COMMUNICATION/team_190/GATE_ENUM_CANONICAL_v1.0.0.md
- _COMMUNICATION/team_190/CHANNEL_10_90_CANONICAL_CONFIRMATION_v1.0.0.md
- _COMMUNICATION/team_170/POC_1_OBSERVER_SPEC_v1.0.0.md
- _COMMUNICATION/team_170/ALERTS_WIDGET_SPEC_v1.0.1_FULL_LOCK.md

---

**log_entry | TEAM_170 | MB3A_POC_AGENT_OS_SPEC_PACKAGE_v1.3.0 | TASK_IDENTITY_BINDING | SUBMITTED_FOR_GATE5 | 2026-02-20**
