---
id: PHOENIX_SYSTEM_STATE
version: 1.1.0
status: PROPOSED (SPEC_APPROVAL_REQUEST)
structural_revision: v2.3.0
owner: Chief Architect
mandate: TEAM_100_SSM_LOCK_AND_STRUCTURE_ALIGNMENT
promotion_authority: Team 70 (Librarian) — promotion execution ONLY; Team 170 — SSOT integrity only (no promotion execution); Team 10 / Architect — authority
validation_authority: Team 190
knowledge_promotion_executor: Team 70 ONLY
knowledge_promotion_validator: Team 190 ONLY
active_stage: GAP_CLOSURE_BEFORE_AGENT_POC
drift_status: CLEAN
---
**project_domain:** TIKTRACK
# PHOENIX SYSTEM STATE (SSM) v1.1.0 — PROPOSED

מניפסט זה מוגש כהצעה לעדכון ונעילה קנונית בהתאם למנדט TEAM_100_SSM_LOCK_AND_STRUCTURE_ALIGNMENT. אין הנחות; מבנה קנוני בלבד.

---

## 0. CANONICAL HIERARCHY & TAXONOMY (Taxonomy Lock)

**Hierarchy (single path):**

- **Roadmap** — יחידה אחת בלבד (single strategic roadmap).
- **Stage** — ממוספר (S{NNN}).
- **Program** — Stage-prefixed numbering (S{NNN}-P{NNN}).
- **Work Package** — Stage+Program prefix (S{NNN}-P{NNN}-WP{NNN}).
- **Task** — WP-prefixed (S{NNN}-P{NNN}-WP{NNN}-T{NNN}).

**Gate flow applies to every Work Package.** Gate binding only at Work Package (L3). No gate_id at Roadmap, Stage, Program, or Task level for gate-transition purposes.

**Mandatory identity header:** roadmap_id, stage_id, program_id, work_package_id, task_id (when applicable), gate_id, phase_owner, required_ssm_version, required_active_stage.

---

## 1. GOVERNANCE CORE (חוקי הברזל)

### 1.1 Governance Authority Clause (LOCKED)

| Team | Role | Authority |
|------|------|-----------|
| **Team 00 (Chief Architect)** | Product authority (TikTrack system) | Final SPEC and EXECUTION approval authority. |
| **Team 100 (Development Architecture Lead)** | Development Architecture Lead | אחראי לפיתוח סביבת העבודה, מבנה התהליכים, אורקסטרציה וניהול ארגוני. מוסמך לאשר שערים בתחומי המשילות והתהליך בלבד. כפוף אסטרטגית לאדריכלית הראשית (Team 00). |
| **Team 170** | Knowledge Librarian / Spec Owner | Original SPEC documents only. No Knowledge Promotion execution. |
| **Team 190** | Architectural Validator + Submission Owner | Validation and submission package ownership. Knowledge Promotion validator. |
| **Team 70** | Documentation Authority / Librarian | Exclusive writer to canonical documentation folders. **Knowledge Promotion executor ONLY.** |
| **Team 10** | Execution Orchestrator | Execution coordination. |

### 1.2 Knowledge Promotion Authority (Correction — LOCKED)

- **Executor:** Team 70 ONLY.
- **Validator:** Team 190.
- **Not Team 170.** Team 170 does not execute Knowledge Promotion and does not write to canonical documentation folders. All SSM references to promotion execution point to Team 70; validation to Team 190.

### 1.3 Gate Model (Canonical 0–8 — aligned to 04_GATE_MODEL_PROTOCOL_v2.2.0)

Canonical Gate Model: **GATE_0 … GATE_8** per active protocol v2.2.0.

**Explicit separation:**

- **Architectural Approval (SPEC):** GATE_1 — ARCHITECTURAL_DECISION_LOCK (LOD 400). Validation scope SPEC-only; no execution readiness claims.
- **Architectural Approval (EXECUTION):** GATE_6 — ARCHITECTURAL_VALIDATION. Post-implementation validation of artifact alignment to constitution.

**GATE_8 (DOCUMENTATION_CLOSURE — AS_MADE_LOCK):** Owner Team 190; Executor Team 70. Documentation closure, AS_MADE_REPORT, Developer Guides update, clean communication folders, archive by Stage. Lifecycle not complete until GATE_8 PASS. Source: 04_GATE_MODEL_PROTOCOL_v2.2.0.

### 1.4 Iron Rules (unchanged)

* **No-Guessing Rule:** עמימות בדרישות מחייבת עצירה והפקת CLARIFICATION_REQUEST.
* **Precision 20,8:** NUMERIC(20,8) for money.
* **RTL Native:** Logical properties only; no Inline CSS.
* **Visual Integrity:** DOM/CSS validation vs blueprint; no agent screenshots.
* **Authority Model:** הפרדת רשויות מוחלטת בין ארכיטקטורה (100+) לביצוע (10-90).

---

## 2. ADR LOCK REGISTRY (unchanged)

| ADR_ID | Title | Status | Lock Level |
| :--- | :--- | :--- | :--- |
| ADR-001 | Unified Modular Roadmap | LOCKED | 5 (System) |
| ADR-015 | Financial Precision (20,8) | LOCKED | 5 (System) |
| ADR-024 | Documentation Model B | LOCKED | 4 (Arch) |
| ADR-026 | Agent OS Target Model v1.2 | LOCKED | 4 (Arch) |

---

## 3. ENTITY & CONTRACT REGISTRY (unchanged)

### [Entity: ALERT]

- **db_contract:** table user_data.alerts, primary_key id (UUID). Soft delete via deleted_at.
- **state_machine:** is_active, is_triggered; row visibility by deleted_at IS NULL. No nominal status enum.
- **dom_contract:** Selectors from Alerts spec only (data-section, data-role, data-alert-id, id, class).

### [Entity: TRADING_ACCOUNT]

- db_contract: table trading_accounts, precision 20,8. api_contract: /api/v1/accounts. validation: Account-based fees only (ADR-014).

---

## 4. ENGINE CONTRACT (unchanged)

Spec Package schema v1.0: endpoint_contract, db_contract, state_definitions (Enum or code-derived), dom_blueprint, no_guessing_declaration (Signed by Architect).

---

## 5. ACTIVE STAGE CONTROL (unchanged)

Current Stage: GAP_CLOSURE_BEFORE_AGENT_POC. Allowed: spec_finalization, structural_alignment, poc_observer_implementation. Forbidden: feature_scaling, production_write_access.

---

## 6. CANONICAL ARCHITECTURAL APPROVAL PACKAGE FORMAT (unchanged)

Per TEAM_100_ARCH_APPROVAL_PACKAGE_FORMAT_LOCK_v1.0.0. Seven artifacts; mandatory identity header; SPEC vs EXECUTION semantics; Team 170 = SPEC originals only; Team 190 = submission package owner.

---

## 7. CHANGE LOG (SSM)

| Date | Version / Directive | Change |
|------|---------------------|--------|
| 2026-02-20 | **v1.1.0 — SSM_LOCK_AND_STRUCTURE_ALIGNMENT** | §1.1 Team 100 locked as Development Architecture Lead. §0 Hierarchy canonicalization (Taxonomy Lock). §1.3 Gate Model 0–8 (per 04_GATE_MODEL_PROTOCOL_v2.2.0): GATE_1 = SPEC, GATE_6 = EXECUTION, GATE_8 = DOCUMENTATION_CLOSURE (AS_MADE_LOCK). §1.2 Knowledge Promotion: Executor Team 70 ONLY, Validator Team 190; not Team 170. |

---

**log_entry | TEAM_170 | SSM_LOCK_AND_STRUCTURE_ALIGNMENT | PROPOSED_v1.1.0 | SPEC_APPROVAL_REQUEST | 2026-02-20**
