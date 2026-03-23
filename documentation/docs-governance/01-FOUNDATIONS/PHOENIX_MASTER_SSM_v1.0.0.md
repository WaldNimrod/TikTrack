---
**provenance:** Governance consolidation (Team 170)
**source_path:** _COMMUNICATION/_Architects_Decisions/PHOENIX_MASTER_SSM_v1.0.0.md
**canonical_path:** documentation/docs-governance/PHOENIX_CANONICAL/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md
**promotion_date:** 2026-02-22
**date:** 2026-02-22
**directive_id:** TEAM_190_TO_TEAM_170_GOVERNANCE_PROCEDURES_CONSOLIDATION_DIRECTIVE_v1.0.0
**classification:** PROMOTE_TO_CANONICAL_GOVERNANCE
---

---
id: PHOENIX_SYSTEM_STATE
version: 1.0.0
status: LOCKED
structural_revision: v2.3.0
owner: System Designer
promotion_authority: Team 70 (Librarian) — promotion execution ONLY; Team 170 — SSOT integrity only (no promotion execution); Team 10 / Architect — authority
validation_authority: Team 190
active_stage: GAP_CLOSURE_BEFORE_AGENT_POC
drift_status: CLEAN
promotion_note: v2.3.0 — Knowledge Promotion Executor = Team 70 only (rule retained; Context Boundary Rule added in Gate Protocol v2.3.0)
ssm_final_lock: v1.0.0 — Governance Authority, Hierarchy Lock, Execution Order per TEAM_100_TO_170_SSM_FINAL_LOCK_v1.0.0
---
**project_domain:** TIKTRACK
# PHOENIX SYSTEM STATE (SSM) v1.0.0

מניפסט זה הוא ה-Single Source of Truth (SSOT) החוקתי והטכני של פרויקט פיניקס. גרסה זו עודכנה בהתאם ל־Gate 5 remediation: ישות ALERT ממופה לקוד/ספק בלבד (ללא ערכים מניחים). **מבנה קנוני v2.3.0:** היררכיה ומספור per 04_GATE_MODEL_PROTOCOL_v2.3.0.

---

## 0. CANONICAL HIERARCHY & TAXONOMY (v2.3.0)

**Hierarchy:** Roadmap (single) → Stage (שלב) → Program (תכנית) → Work Package (חבילת עבודה) → Task (משימה).  

**Entity definitions (English & Hebrew):**

| Level | English | Hebrew | Definition |
|-------|---------|--------|------------|
| L0 | Roadmap | רואדמפ | Single strategic roadmap; top-level container. |
| L1 | Stage | שלב | Phase or stage within the roadmap. |
| L2 | Program | תכנית | Program or initiative within a stage. |
| L3 | Work Package | חבילת עבודה | Deliverable unit; **Gate binding only at this level.** |
| L4 | Task | משימה | Atomic task within a work package. |

**Explicit rule:** Gate binding **only to Work Package** (L3). No gate_id at Roadmap, Stage, Program, or Task level for gate-transition purposes.  

**Canonical hierarchy lock (SSM Final Lock v1.0.0):**

```
Roadmap (single)
 └── Stage (SNNN)
      └── Program (SNNN-PNNN)
           └── Work Package (SNNN-PNNN-WPNNN)
                └── Task (SNNN-PNNN-WPNNN-TNNN)
```

Gate binding allowed **only** at Work Package level.

**Portfolio boundary (per PORTFOLIO_CANONICALIZATION):** Operational/runtime state (active stage, current gate, last_gate_event) is **not** in SSM; it is **only** in WSM (CURRENT_OPERATIONAL_STATE). The canonical Portfolio layer (Roadmap/Program/Work Package registries) is structural and mirror-only; see PORTFOLIO_INDEX and PORTFOLIO_WSM_SYNC_RULES.

**Numbering:** S{NNN}-P{NNN}-WP{NNN}-T{NNN} (prefix inheritance; no implicit numbering; no duplicates). Validation: parsing, inheritance check, duplicate check, lexicographic — per 04_GATE_MODEL_PROTOCOL_v2.3.0 §2.

**Uniqueness (mandatory):** Within a Stage, each Program number is unique (no two programs with the same P-number in the same stage). Within a Program, each Work Package number is unique (no two work packages with the same WP-number in the same program). One Program per (Stage, P-number); one Work Package per (Program, WP-number).

**One domain per Program:** Each Program is assigned to exactly one domain; a Program cannot span multiple domains.

**Mandatory identity header:** roadmap_id, stage_id, program_id, work_package_id, task_id (when applicable), gate_id, phase_owner, required_ssm_version, required_active_stage.

### 0.1 Architectural Approval Package Format Lock (v1.0.0)

Directive: `TEAM_100_ARCH_APPROVAL_PACKAGE_FORMAT_LOCK_v1.0.0`.

For all architect approval submissions (SPEC and EXECUTION), the submission package format is locked and mandatory:

1. `COVER_NOTE.md`
2. `SPEC_PACKAGE.md` (or `EXECUTION_PACKAGE.md`)
3. `VALIDATION_REPORT.md`
4. `DIRECTIVE_RECORD.md`
5. `SSM_VERSION_REFERENCE.md`
6. `WSM_VERSION_REFERENCE.md`
7. `PROCEDURE_AND_CONTRACT_REFERENCE.md`

Rules:
- Submission folder is self-contained.
- No links to communication paths inside submission artifacts.
- No additional scattered artifacts.
- Every file must include `architectural_approval_type: SPEC | EXECUTION` and the full mandatory identity header table.

SPEC semantic lock:
- `architectural_approval_type = SPEC`
- `gate_id = GATE_1`
- validation scope must be SPEC-only
- no execution-readiness claims

EXECUTION semantic lock:
- `architectural_approval_type = EXECUTION`
- `gate_id` must map to execution validation gate context
- implementation evidence and post-dev architectural validation scope are required

Role contract lock:
- Team 170: owner of SPEC originals only.
- Team 190: submission package owner; only entity that may create/edit submission folders; must replace old package with new package on corrections.

---

## 1. GOVERNANCE CORE (חוקי הברזל)

### 1.1 Governance Authority Clause (TEAM_100_SSM_FINAL_LOCK_v1.0.0 — LOCKED)

| Team | Role | Authority |
|------|------|-----------|
| **Team 00 (System Designer)** | Product authority (TikTrack system) | Final SPEC and EXECUTION approval authority. |
| **Team 100 (Development Architecture Authority)** | Architectural partner of Team 00 in domain vision and executable plans | Responsible for GATE_0 (LOD200 initial intent) and GATE_1 (SPEC submission to validation); holds **approval authority** at **GATE_2** (final spec approval) and **GATE_6** (post-execution architectural approval). Defines gate model, lifecycle contracts, and orchestration rules; operates in strategic alignment with Team 00. |
| **Team 170** | Spec Owner | Original documents only. |
| **Team 190** | Architectural Validator + Submission Owner | Validation and submission package ownership. |
| **Team 70** | Documentation Authority (Execution Department Librarian) | Organizationally part of the Development Department (10-90). Exclusive writer to canonical documentation folders; may support Architecture via request flow only (no departmental reassignment). |
| **Team 10** | Work Plan Generator | Produces G3_PLAN at GATE_3; does not orchestrate teams, manage state, or update WSM directly. WSM state is managed exclusively by the pipeline system. |

---

* **No-Guessing Rule:** עמימות בדרישות מחייבת עצירה והפקת CLARIFICATION_REQUEST. חל איסור על הנחות עבודה.
* **Precision 20,8:** כל חישוב כספי, המרת מטבע או עמלה בבסיס הנתונים וב-Logic חייב להתבצע בדיוק NUMERIC(20,8).
* **RTL Native:** כל ממשק UI נבנה לתמיכה בעברית ללא Inline CSS, תוך שימוש בלעדי ב-Logical Properties (Start/End).
* **Visual Integrity:** ולידציה מבנית (DOM/CSS) מול הבלופרינט כחסם קשיח. שימוש בסקרינשוטים ע"י אייג'נטים - אסור.
* **Authority Model:** הפרדת רשויות מוחלטת בין ארכיטקטורה (100+) לביצוע (10-90).

### IR-MAKER-CHECKER-01 — The Maker-Checker Principle (locked 2026-03-17)

No team may serve as the Checker (validator) for an artifact it produced as the Maker
(executor) in the same work package.

Definitions:
- **Maker:** A team that produces an artifact in a gate (plan, spec, code, document).
- **Checker:** A team that evaluates an artifact for correctness, compliance, or completeness.

A team may be a Maker in one WP and a Checker in a different WP. The constraint is
per-work-package, not per-team globally.

Enforcement: Gate ownership assignments enforce this rule structurally. Violations
require Team 00 constitutional authorization to override.

Reference: ARCHITECT_DIRECTIVE_GATE_ARCHITECTURE_CANONICAL_ADDENDUM_v1.0.0.md §B.1

### Gate signer semantics (ADR-026, Dual-Manifest — Gate Model v2.3.0, realignment v1.1.0)

* **Gates 0–2 (SPEC_ARC, SPEC_LOCK, ARCHITECTURAL_SPEC_VALIDATION):** Owner Team 190. WSM updated by Team 190 on closure.
* **Gates 3–4 (IMPLEMENTATION, QA):** Owner Team 10. WSM updated by Team 10 on closure.
* **Gates 5–8 (DEV_VALIDATION, ARCHITECTURAL_DEV_VALIDATION, HUMAN_UX_APPROVAL, DOCUMENTATION_CLOSURE):** Owner Team 90. WSM updated by Team 90 on closure. GATE_6 rejection routing: _COMMUNICATION/team_170/GATE_6_REJECTION_ROUTE_PROTOCOL_v1.0.0.md. Source: 04_GATE_MODEL_PROTOCOL_v2.3.0.

### 1.2 WSM Operational State Law (TEAM_100_WSM_OPERATIONAL_STATE_PROTOCOL_v1.0.0)

**Every gate closure requires a WSM Operational State update before progression.** No gate progression is allowed without updating the canonical WSM CURRENT_OPERATIONAL_STATE block. No operational data must be stored inside SSM; operational state authority is WSM only. Reference: _COMMUNICATION/team_100/TEAM_100_TO_TEAM_170_WSM_OPERATIONAL_STATE_PROTOCOL_v1.0.0.md.

---

## 2. ADR LOCK REGISTRY (ספר ההחלטות)

| ADR_ID | Title | Status | Lock Level |
| :--- | :--- | :--- | :--- |
| ADR-001 | Unified Modular Roadmap | LOCKED | 5 (System) |
| ADR-015 | Financial Precision (20,8) | LOCKED | 5 (System) |
| ADR-024 | Documentation Model B | LOCKED | 4 (Arch) |
| ADR-026 | Agent OS Target Model v1.2 | LOCKED | 4 (Arch) |

---

## 3. ENTITY & CONTRACT REGISTRY (מפת ישויות)

### [Entity: ALERT]

- **db_contract:** table user_data.alerts, primary_key id (UUID). Soft delete via deleted_at. Evidence: scripts/migrations/d34_alerts.sql, api/models/alerts.py.
- **state_machine:** No nominal status enum. Canonical flags from code: is_active (boolean), is_triggered (boolean); row visibility by deleted_at IS NULL. Transitions: create (POST), update is_active (PATCH), soft delete (DELETE). Evidence: ALERTS_WIDGET_SPEC_v1.0.1_FULL_LOCK.md §C, api/services/alerts_service.py.
- **dom_contract:** Selectors from Alerts spec only: data-section, data-role, data-alert-id, id (e.g. #alertsTable, #totalAlerts), class (.active-alerts, .phoenix-table__row, .js-add-alert). Evidence: ALERTS_WIDGET_SPEC_v1.0.1_FULL_LOCK.md §D.

### [Entity: TRADING_ACCOUNT]

- db_contract: table trading_accounts, precision 20,8 for balances.
- api_contract: /api/v1/accounts.
- validation: Account-based fees only (ADR-014).

---

## 4. ENGINE CONTRACT (חוזה האפיון)

חבילת אפיון (Spec Package) חייבת לעבור ולידציית Schema v1.0 הכוללת:
1. endpoint_contract (JSON)
2. db_contract (JSON)
3. state_definitions (Enum or code-derived flags)
4. dom_blueprint (Structural HTML/CSS)
5. no_guessing_declaration (Signed by Architect)

---

## 5. EXECUTION ORDER AND STAGE (law only — no operational data)

**Law:** Active stage, current gate, and execution order state are **not** stored in SSM. They are maintained **solely** in WSM CURRENT_OPERATIONAL_STATE block. SSM states only the following **structural lock**:

- **Execution order lock:** S001-P002 may not be activated until S001-P001-WP001 completes GATE_8.

**Stage control (rule only):** Allowed/forbidden operation categories are defined by the active stage; the **current** active stage value lives only in WSM. This section does not store current stage or current gate.

### 5.1 Execution order lock (SSM Final Lock v1.0.0 — structural rule only)

| Level | Identifier | Structural rule |
|-------|------------|-----------------|
| Stage | S001 | Agent OS Initial Build — in scope. |
| Program | S001-P001 | In scope. |
| Work Package | S001-P001-WP001 | In scope. |
| Program | S001-P002 | **FROZEN** until S001-P001-WP001 completes GATE_8. |

---

## 6. CANONICAL ARCHITECTURAL APPROVAL PACKAGE FORMAT (Governance — TEAM_100_ARCH_APPROVAL_PACKAGE_FORMAT_LOCK_v1.0.0)

All submissions to Architect Inbox (SPEC or EXECUTION) MUST conform to this format.

**Package structure (7 artifacts, mandatory):** COVER_NOTE.md; SPEC_PACKAGE.md or EXECUTION_PACKAGE.md; VALIDATION_REPORT.md; DIRECTIVE_RECORD.md; SSM_VERSION_REFERENCE.md; WSM_VERSION_REFERENCE.md; PROCEDURE_AND_CONTRACT_REFERENCE.md. No scattered artifacts; no links to communication paths; folder self-contained.

**Mandatory header block (every artifact):** architectural_approval_type (SPEC | EXECUTION); Identity Header table: roadmap_id, stage_id, program_id, work_package_id, task_id, gate_id, phase_owner, required_ssm_version, required_active_stage. Structure fixed and non-editable.

**SPEC semantics:** gate_id = GATE_1; validation scope SPEC-only; no execution readiness claims; mandatory declaration block (verbatim). **EXECUTION semantics:** gate_id = execution validation gate; implementation evidence; post-dev architectural validation scope. No mixing.

**Role contract:** Team 170 — owner of SPEC content (originals only). Team 190 — owner of submission package; only entity allowed to create/edit submission folder; must delete old package and create new one upon fixes. No role overlap.

Reference: _COMMUNICATION/team_100/TEAM_100_ARCH_APPROVAL_PACKAGE_FORMAT_LOCK_v1.0.0.md; template: Team 190 ARCHITECTURAL_APPROVAL_PACKAGE_TEMPLATE_v1.0.0.

---

## 7. CHANGE LOG (SSM)

| Date | Version / Directive | Change |
|------|--------------------|--------|
| 2026-02-19 | GATE_5_F1_REMEDIATION | SSM canonical replacement per Team 170 request. |
| 2026-02-20 | ARCH_APPROVAL_PACKAGE_FORMAT_LOCK_v1.0.0 | Content from Team 170; canonical update per Team 70. §6 Canonical Architectural Approval Package Format embedded. |
| 2026-02-20 | **TEAM_100_SSM_FINAL_LOCK_v1.0.0** | Content supplied by Team 170; canonical SSM updated per promotion authority (Team 70). §1.1 Governance Authority Clause (Team 00, 100, 170, 190, 70, 10). §0 Canonical hierarchy lock. §5.1 Current execution order lock: S001 / S001-P001 / S001-P001-WP001 ACTIVE; S001-P002 FROZEN until WP001 GATE_8. |
| 2026-02-22 | **TEAM_100_WSM_OPERATIONAL_STATE_PROTOCOL_v1.0.0** | §1.2 WSM Operational State Law added: every gate closure requires WSM update before progression; no operational data in SSM; WSM is sole operational state authority. |
| 2026-02-22 | **TEAM_190_WSM_VALIDATION_FAIL_F2_REMEDIATION** | §5 / §5.1: removed operational data (current stage, ACTIVE/FROZEN status); retained structural lock rule only; current state lives solely in WSM CURRENT_OPERATIONAL_STATE. |
| 2026-02-22 | **GATE_PROTOCOL_v2.3.0_OFFICIALIZATION** | structural_revision updated to v2.3.0; Gate Model source references updated from v2.2.0 to v2.3.0. |
| 2026-03-07 | **TEAM_10_WSM_SSM_SYNC_POST_GATE8** | Team 10 (Gateway) updated WSM per TEAM_90_TO_TEAM_10_S002_P003_WP002_GATE8_VALIDATION_REPORT (GATE_8 PASS; S002-P003-WP002 COMPLETE). Next authorized program S002-P002 (MCP-QA Transition) — GATE_2 approved by Team 190; activation prompt received. Operational state remains in WSM only; this changelog entry is audit. |
| 2026-03-17 | **ARCHITECT_DIRECTIVE_GATE_ARCHITECTURE_CANONICAL_ADDENDUM** | §1: IR-MAKER-CHECKER-01 Maker-Checker Principle added. §1.1: Team 10 role updated — Execution Orchestrator → Work Plan Generator; WSM managed by pipeline system only. Reference: ARCHITECT_DIRECTIVE_GATE_ARCHITECTURE_CANONICAL_ADDENDUM_v1.0.0.md. |

---

**log_entry | TEAM_70 | SSM_CANONICAL_UPDATE | content_from_Team_170 | GATE_5_F1_REMEDIATION | 2026-02-19**  
**log_entry | TEAM_70 | SSM_CANONICAL_UPDATE | content_from_Team_170 | ARCH_APPROVAL_PACKAGE_FORMAT_LOCK_v1.0.0 | 2026-02-20**  
**log_entry | TEAM_70 | SSM_CANONICAL_UPDATE | content_from_Team_170 | SSM_FINAL_LOCK_v1.0.0 | 2026-02-20**  
**log_entry | TEAM_170 | SSM_AMENDMENT_REFERENCE | §1.2_WSM_OPERATIONAL_STATE_LAW | TEAM_100_WSM_OPERATIONAL_STATE_PROTOCOL_v1.0.0 | 2026-02-22**  
**log_entry | TEAM_70 | SSM_CANONICAL_UPDATE | GATE_PROTOCOL_v2.3.0_OFFICIALIZATION_REFERENCE_REFRESH | 2026-02-22**
