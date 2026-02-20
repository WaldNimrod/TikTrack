# SSM Delta Proposal v1.0.0

**id:** SSM_DELTA_PROPOSAL_v1.0.0  
**from:** Team 170 (Librarian / SSOT Authority)  
**to:** Team 10 (The Gateway), Team 190 (Constitutional Validator)  
**re:** PHOENIX DEV OS — SPEC PACKAGE EXPANSION & KNOWLEDGE PROMOTION MANDATE  
**date:** 2026-02-19  
**stage context:** GAP_CLOSURE_BEFORE_AGENT_POC  
**authority:** SSOT integrity only. No Gate authority.

---

## 1. Purpose

Propose corrections to the Phoenix System State Manifest (SSM) so that:

- All Alert-related definitions are derived **only** from code/spec evidence (no guessed states).
- Explicit **signer semantics** for Gate 5 and Gate 6 are added.
- No unmapped or inferred values remain for the ALERT entity.

---

## 2. Evidence Sources (Code / Spec Only)

| Source | Path | Use |
|--------|------|-----|
| Alerts Widget Spec (Full Lock) | _COMMUNICATION/team_170/ALERTS_WIDGET_SPEC_v1.0.1_FULL_LOCK.md | State machine, DB contract, DOM contract |
| Alerts Constitutional Review (PASS) | _COMMUNICATION/team_190/MB3A_ALERTS_WIDGET_SPEC_V1_0_1_CONSTITUTIONAL_REVIEW.md | Validation of spec |
| D34 migration | scripts/migrations/d34_alerts.sql | Table, PK type, enums |
| ORM | api/models/alerts.py | PK UUID, is_active, is_triggered, deleted_at |
| Gate model | _COMMUNICATION/team_100/DEV_OS_TARGET_MODEL_CANONICAL_v1.3.1/04_GATE_MODEL_PROTOCOL.md | Gate 5 = Team 190, Gate 6 = Human UX |

---

## 3. Delta: Entity ALERT (Replace Guessed Values)

**Current SSM v1.0.0 (problematic):**

```text
### [Entity: ALERT]
- db_contract: table alerts, primary_key id (ULID).
- state_machine: [ACTIVE, TRIGGERED, DISMISSED, ARCHIVED].
- dom_contract: Required data-testid on all interaction elements.
```

**Issues:**

- **primary_key:** Code and migration use **UUID** (gen_random_uuid()), not ULID. Evidence: d34_alerts.sql L21, api/models/alerts.py L36–42.
- **state_machine:** [ACTIVE, TRIGGERED, DISMISSED, ARCHIVED] is **not** in code. Code has: **is_active** (boolean), **is_triggered** (boolean), **deleted_at** (soft delete). No DISMISSED or ARCHIVED in api/services/alerts_service.py or d34_alerts.sql. Per mandate: "Any Alert states appearing in SSM are currently NON-CANONICAL unless derived from CODE/SPEC evidence."
- **dom_contract:** Alerts spec (Section D) uses **data-role**, **data-alert-id**, **id**, **class** selectors from alerts.html and alertsTableInit.js. **data-testid** is not used in Alerts code. Requiring "data-testid on all interaction elements" for ALERT would be inferred, not from evidence.

**Proposed replacement (code/spec-only):**

```text
### [Entity: ALERT]
- db_contract: table user_data.alerts, primary_key id (UUID). Soft delete via deleted_at. Evidence: scripts/migrations/d34_alerts.sql, api/models/alerts.py.
- state_machine: No nominal status enum. Canonical flags from code: is_active (boolean), is_triggered (boolean); row visibility by deleted_at IS NULL. Transitions: create (POST), update is_active (PATCH), soft delete (DELETE). Evidence: ALERTS_WIDGET_SPEC_v1.0.1_FULL_LOCK.md §C, api/services/alerts_service.py.
- dom_contract: Selectors from Alerts spec only: data-section, data-role, data-alert-id, id (e.g. #alertsTable, #totalAlerts), class (.active-alerts, .phoenix-table__row, .js-add-alert). Evidence: ALERTS_WIDGET_SPEC_v1.0.1_FULL_LOCK.md §D.
```

---

## 4. Delta: Signer Semantics (Gates 5 & 6)

**Add to SSM (new subsection under GOVERNANCE CORE or equivalent):**

```text
### Gate signer semantics (ADR-026, Dual-Manifest)
- Gate 5 (Constitutional / Architectural Validation): Team 190. Authority: validate spec and artifact alignment to constitution; no execution, no SSOT writes.
- Gate 6 (Final sign-off): Nimrod (Visionary). Authority: final UX/vision approval; no implementation by agent without Gate 6 pass.
```

Evidence: Mandate "Gate 5 (Team 190) = constitutional validation; Gate 6 (Nimrod) = final sign-off authority"; 04_GATE_MODEL_PROTOCOL.md (Gate 5 = Architectural Validation Team 190, Gate 6 = Human UX Approval).

---

## 5. BLOCKER / UNKNOWN

- **ALERT state_machine:** Any value not in the proposed replacement (e.g. DISMISSED, ARCHIVED, or a single "status" enum) is **UNKNOWN** and must be marked **BLOCKER** until a code or signed spec introduces it.
- **ALERT primary_key:** Use **UUID** only; ULID for Alerts is **not** in code.

---

## 6. Output Artifacts

- **This file:** SSM_DELTA_PROPOSAL_v1.0.0.md (Team 170, _COMMUNICATION/team_170/).
- **Updated SSM candidate:** PHOENIX_MASTER_SSM_v1.0.0_CANDIDATE_AFTER_DELTA.md (below in same folder). Promotion to _Architects_Decisions and replacement of PHOENIX_MASTER_SSM_v1.0.0.md is **Team 10 / Architect** responsibility.

---

**log_entry | TEAM_170 | SSM_DELTA_PROPOSAL_v1.0.0 | 2026-02-19**
