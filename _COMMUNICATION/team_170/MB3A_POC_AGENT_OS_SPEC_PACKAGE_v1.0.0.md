# MB3A POC Agent OS Spec Package v1.0.0
**project_domain:** TIKTRACK

**id:** MB3A_POC_AGENT_OS_SPEC_PACKAGE_v1.0.0  
**subtitle:** FOUNDATION → POC-1 → MB3A ALERTS  
**from:** Team 170 (Librarian / SSOT Authority)  
**to:** Team 190 (Constitutional Validator), Team 10 (The Gateway)  
**re:** PHOENIX DEV OS — SPEC PACKAGE EXPANSION & KNOWLEDGE PROMOTION MANDATE  
**date:** 2026-02-19  
**stage context:** GAP_CLOSURE_BEFORE_AGENT_POC  
**authority:** Team 170 = SSOT integrity + knowledge promotion only. No Gate authority. No guessing.

---

## 1) Purpose & North Star (Agent OS, not Alerts)

This package defines a **controlled Agent POC** operating under the Phoenix Dev OS (ADR-026): Dual-Manifest (SSM + WSM), Gates 0–6, and read-first behavior. The **North Star** is **Agent OS** — a single, ordered spec stack that enables an agent to:

- Know the **current governance and work state** (SSM/WSM).
- Know **Gate signer semantics** (Gate 5 = Team 190 constitutional validation; Gate 6 = Nimrod final sign-off).
- Execute **POC-1 Observer** (read-only: reconstruct state from disk, output STATE_SNAPSHOT.json).
- Use **MB3A Alerts** as the first locked module spec (reference only; no redesign).

Alerts is one **module** within this package; the package itself is the **Agent OS** foundation and POC-1 observer spec, then Alerts.

---

## 2) Foundation (SSM / WSM + Gates)

### 2.1 SSM (System State Manifest)

- **Canonical source (post-delta):** _COMMUNICATION/team_170/SSM_DELTA_PROPOSAL_v1.0.0.md + _COMMUNICATION/team_170/PHOENIX_MASTER_SSM_v1.0.0_CANDIDATE_AFTER_DELTA.md.
- **Promotion path:** Team 10 / Architect promotes candidate to _COMMUNICATION/_Architects_Decisions/PHOENIX_MASTER_SSM_v1.0.0.md when approved.
- **Content lock:** Governance core (No-Guessing, Precision 20,8, RTL, Visual Integrity, Authority Model). **Gate signer semantics:** Gate 5 = Team 190 (constitutional validation); Gate 6 = Nimrod (final UX sign-off). **Entity ALERT:** db_contract (user_data.alerts, UUID, soft delete), state_machine (is_active, is_triggered, deleted_at only — no DISMISSED/ARCHIVED), dom_contract (selectors from Alerts spec only). **ADR Lock Registry.** **Active Stage Control.**

### 2.2 WSM (Work State Manifest)

- **Canonical source:** _COMMUNICATION/_Architects_Decisions/PHOENIX_MASTER_WSM_v1.0.0.md.
- **Extension (task structure):** _COMMUNICATION/team_170/WSM_TASK_STRUCTURE_L1_L2_L3_v1.0.0.md.
- **Content:** L1 roadmap modules (M1–M3, M-POC1, M-MB3A). L2 foundation tasks (SSM fix, WSM extension, Gate wiring, POC-1 Observer spec). L2 MB3A Alerts (spec lock reference, continuation if authorized). L3 POC-1 Observer execution (produce STATE_SNAPSHOT.json, validate). Bridge: required_ssm_version 1.0.0, required_active_stage GAP_CLOSURE_BEFORE_AGENT_POC.

### 2.3 Gates (0–6)

- **Source:** _COMMUNICATION/team_100/DEV_OS_TARGET_MODEL_CANONICAL_v1.3.1/04_GATE_MODEL_PROTOCOL.md.
- **Signers (from SSM delta):** Gate 5 = Team 190 (Architectural / Constitutional Validation). Gate 6 = Human UX Approval (Nimrod). No agent implementation of SSOT writes or feature scaling without Gate 5 pass and, where required, Gate 6 pass.

---

## 3) POC-1 Observer Spec

- **Document:** _COMMUNICATION/team_170/POC_1_OBSERVER_SPEC_v1.0.0.md.
- **Agent objective:** Reconstruct current state from **disk artifacts only**. Output: **STATE_SNAPSHOT.json** (schema 1.0.0, active_stage, governance_anchors, artifact_checks, gates, no_ssot_writes).
- **Hard rule:** **NO writes to SSOT** unless explicit G-Lead instruction.
- **Validation rules:** V1–V8 (schema_version, produced_at_iso, agent_role, read_only, active_stage.stage_id match, governance_anchors paths, artifact_checks consistency, no_ssot_writes). Any violation → reject snapshot.

---

## 4) Alerts Module Spec (Reference — Locked)

- **Document:** _COMMUNICATION/team_170/ALERTS_WIDGET_SPEC_v1.0.1_FULL_LOCK.md.
- **Constitutional review (PASS):** _COMMUNICATION/team_190/MB3A_ALERTS_WIDGET_SPEC_V1_0_1_CONSTITUTIONAL_REVIEW.md.
- **Placement:** After Foundation and POC-1 in the package order. No changes to Alerts spec in this package; reference only. All Alert states and contracts in SSM are derived from this spec and code (see SSM_DELTA_PROPOSAL_v1.0.0.md).

---

## 5) Validation Matrix (Every Definition Mapped to a File Source)

| Definition / Item | Source file(s) | Evidence type |
|-------------------|----------------|---------------|
| SSM Governance Core (compliant source) | _COMMUNICATION/team_170/PHOENIX_MASTER_SSM_v1.0.0_CANDIDATE_AFTER_DELTA.md, SSM_DELTA_PROPOSAL_v1.0.0.md | SSM candidate; canonical at _Architects_Decisions/PHOENIX_MASTER_SSM_v1.0.0.md contains speculative Alerts until replaced by Team 10/Architect per delta |
| SSM ALERT entity (corrected) | SSM_DELTA_PROPOSAL_v1.0.0.md, ALERTS_WIDGET_SPEC_v1.0.1_FULL_LOCK.md §B–D, scripts/migrations/d34_alerts.sql, api/models/alerts.py | Delta + spec + code |
| Gate 5 / Gate 6 signers | SSM_DELTA_PROPOSAL_v1.0.0.md §4, 04_GATE_MODEL_PROTOCOL.md | Delta + Gate protocol |
| WSM L1/L2/L3 tasks | WSM_TASK_STRUCTURE_L1_L2_L3_v1.0.0.md, ADR_026_AGENT_OS_FINAL_VERDICT.md, PHOENIX_MASTER_WSM_v1.0.0.md | WSM extension + ADR + WSM |
| POC-1 Observer objective & output | POC_1_OBSERVER_SPEC_v1.0.0.md | Spec |
| POC-1 validation rules V1–V8 | POC_1_OBSERVER_SPEC_v1.0.0.md §4 | Spec |
| Alerts endpoint/DB/state/DOM | ALERTS_WIDGET_SPEC_v1.0.1_FULL_LOCK.md §A–D | Locked spec |
| Alerts constitutional pass | MB3A_ALERTS_WIDGET_SPEC_V1_0_1_CONSTITUTIONAL_REVIEW.md | Team 190 review |
| Active stage | _COMMUNICATION/team_10/ACTIVE_STAGE.md | Stage doc |
| Master Index | 00_MASTER_INDEX.md | Repo root |

---

## 6) No-Guessing Declaration

All definitions in this package are derived from **existing artifacts** only:

- **SSM:** ALERT entity and Gate signers from SSM_DELTA_PROPOSAL_v1.0.0 (which references ALERTS_WIDGET_SPEC_v1.0.1_FULL_LOCK, d34_alerts.sql, api/models/alerts.py, 04_GATE_MODEL_PROTOCOL.md). No inferred states (DISMISSED, ARCHIVED removed; is_active, is_triggered, deleted_at only).
- **WSM:** Tasks from ADR_026, PHOENIX_MASTER_WSM_v1.0.0, and mandate; no invented task IDs or outputs without a source.
- **POC-1 Observer:** Inputs and output schema from POC_1_OBSERVER_SPEC_v1.0.0; validation rules from same document.
- **Alerts:** No additional Alerts content in this package beyond reference to the locked v1.0.1 spec and its constitutional review.

**No inferred structures. No guessed fields or states. No authority overreach (Team 170 does not perform Gate or Architect duties).**

---

## Submission

This consolidated package is submitted to **Team 190 for Gate 5 constitutional validation**.  
**Do not** request Nimrod (Gate 6) sign-off until Team 190 PASS.

**Package artifacts (all under _COMMUNICATION/team_170/):**

- SSM_DELTA_PROPOSAL_v1.0.0.md  
- PHOENIX_MASTER_SSM_v1.0.0_CANDIDATE_AFTER_DELTA.md  
- WSM_TASK_STRUCTURE_L1_L2_L3_v1.0.0.md  
- POC_1_OBSERVER_SPEC_v1.0.0.md  
- ALERTS_WIDGET_SPEC_v1.0.1_FULL_LOCK.md (preexisting)  
- MB3A_POC_AGENT_OS_SPEC_PACKAGE_v1.0.0.md (this document)

**log_entry | TEAM_170 | MB3A_POC_AGENT_OS_SPEC_PACKAGE_v1.0.0 | CONSOLIDATED | 2026-02-19**
