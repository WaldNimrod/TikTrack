# TEAM_190_TO_TEAM_00_ADR031_DECISION_LOCK_AND_SIGNER_CHAIN_PROPOSAL_v1.0.0

**project_domain:** SHARED (AGENTS_OS + TIKTRACK)  
**from:** Team 190 (Constitutional Validation)  
**to:** Team 00 (Chief Architect)  
**cc:** Team 100, Team 10, Team 170, Team 90, Nimrod  
**date:** 2026-03-14  
**status:** SUBMITTED_FOR_APPROVAL  
**gate_id:** GOVERNANCE_PROGRAM  
**in_response_to:** ADR-031 + Team 190 clarification cycle

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002/S003/S004 |
| program_id | S002-P005, S003-P007, S004-P008 |
| work_package_id | N/A (activation package request) |
| task_id | ADR031-LOCKS-D01-D05 |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 190 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1) Decision Locks Received and Applied

1. `D-01` Program slot lock: **S002-P005** selected for Stage A.
2. `D-02` Sequencing lock:
- Stage A = next package in Stage 2 (S002-P005).
- Stage B = next AGENTS_OS package in Stage 3 (S003-P007).
- Stage C = independent package in Stage 4 after existing AGENTS_OS Stage 4 programs (S004-P008).
3. `D-03` Stage C scope lock: **independent package** (not absorbed).
4. `D-05` Gate-6 desync blocking scope: **BOTH DOMAINS** (AGENTS_OS + TIKTRACK).

Applied in canonical artifacts:
- `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`
- `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
- `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md`

---

## 2) Team 190 Proposal for D-04 (Signer Chain) — For Architect Approval

### 2.1 Proposed Model: Dual-Key Mediated Write

Write path for `WSM` updates under ADR-031:

1. UI writes proposal only to non-authoritative file: `proposed_updates.json`.
2. Engine performs legality checks vs SSM/iron-rules (no write yet).
3. Team 90 generates canonical normalization artifact + hash (structural validation).
4. Human authority approval key:
- Nimrod signs execution-state apply for normal lifecycle updates.
5. Architectural authority co-sign required when update type is constitutional:
- Team 00 (or delegated Team 100 mandate) must co-sign structural updates.

### 2.2 Mandatory Co-sign Categories (Team 00 required)

1. Stage/program/work-package identity change.
2. Gate ownership mapping change.
3. Any override/bypass of Gate-6 desync block.
4. Any change to admissibility/evidence contract.

### 2.3 Why this model

1. Preserves human control and Zero-Trust (no direct UI write to canonical WSM).
2. Keeps execution speed for routine updates (no architectural bottleneck per routine step).
3. Prevents constitutional drift by requiring co-sign on structural changes.
4. Works uniformly for both domains per D-05 lock.

### 2.4 Overhead Guardrails (anti-friction lock)

1. No co-sign required for routine non-structural state updates (single Nimrod sign after Team 90 normalization artifact).
2. Team 00 co-sign is triggered only for categories listed in §2.2.
3. One-click approval bundle per update: signer sees hash + diff summary + rule verdict in one artifact.
4. Hard timeout rule: if co-sign decision is not returned within SLA, item remains blocked (no silent bypass), but queue is not frozen for unrelated routine updates.

Requested architect decision: **APPROVE / MODIFY / REJECT** for D-04 model above.

---

## 3) Readiness Status

- Roadmap slotting is now deterministic and canonically placed.
- Team 190 is ready to issue immediate activation mandates to Team 10 and Team 170 once D-04 is approved.

---

**log_entry | TEAM_190 | ADR_031 | DECISION_LOCK_APPLIED_AND_D04_SIGNER_CHAIN_PROPOSAL_SUBMITTED | 2026-03-14**
