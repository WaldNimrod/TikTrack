---
id: PHOENIX_SYSTEM_STATE
version: 1.0.0
status: LOCKED
structural_revision: v2.2.0
owner: Chief Architect
promotion_authority: Team 70 (Librarian) — promotion execution ONLY; Team 170 — SSOT integrity only (no promotion execution); Team 10 / Architect — authority
validation_authority: Team 190
active_stage: GAP_CLOSURE_BEFORE_AGENT_POC
drift_status: CLEAN
promotion_note: v2.2.0 — Knowledge Promotion Executor = Team 70 only per TEAM_100_RETURN_FOR_CANONICAL_UPDATE_v2.2.0
ssm_final_lock: v1.0.0 — Governance Authority, Hierarchy Lock, Execution Order per TEAM_100_TO_170_SSM_FINAL_LOCK_v1.0.0
---
**project_domain:** TIKTRACK
# PHOENIX SYSTEM STATE (SSM) v1.0.0

מניפסט זה הוא ה-Single Source of Truth (SSOT) החוקתי והטכני של פרויקט פיניקס. גרסה זו עודכנה בהתאם ל־Gate 5 remediation: ישות ALERT ממופה לקוד/ספק בלבד (ללא ערכים מניחים). **מבנה קנוני v2.2.0:** היררכיה ומספור per 04_GATE_MODEL_PROTOCOL_v2.2.0.

---

## 0. CANONICAL HIERARCHY & TAXONOMY (v2.2.0)

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

**Numbering:** S{NNN}-P{NNN}-WP{NNN}-T{NNN} (prefix inheritance; no implicit numbering; no duplicates). Validation: parsing, inheritance check, duplicate check, lexicographic — per 04_GATE_MODEL_PROTOCOL_v2.2.0 §2.  

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
| **Team 00 (Chief Architect)** | Product authority (TikTrack system) | Final SPEC and EXECUTION approval authority. |
| **Team 100 (Development Architecture Authority)** | Owner of development process architecture | Defines gate model, lifecycle contracts, orchestration rules; may approve structural/process gates within its domain; operates under strategic alignment with Team 00. |
| **Team 170** | Spec Owner | Original documents only. |
| **Team 190** | Architectural Validator + Submission Owner | Validation and submission package ownership. |
| **Team 70** | Documentation Authority | Exclusive writer to canonical documentation folders. |
| **Team 10** | Execution Orchestrator | Execution coordination. |

---

* **No-Guessing Rule:** עמימות בדרישות מחייבת עצירה והפקת CLARIFICATION_REQUEST. חל איסור על הנחות עבודה.
* **Precision 20,8:** כל חישוב כספי, המרת מטבע או עמלה בבסיס הנתונים וב-Logic חייב להתבצע בדיוק NUMERIC(20,8).
* **RTL Native:** כל ממשק UI נבנה לתמיכה בעברית ללא Inline CSS, תוך שימוש בלעדי ב-Logical Properties (Start/End).
* **Visual Integrity:** ולידציה מבנית (DOM/CSS) מול הבלופרינט כחסם קשיח. שימוש בסקרינשוטים ע"י אייג'נטים - אסור.
* **Authority Model:** הפרדת רשויות מוחלטת בין ארכיטקטורה (100+) לביצוע (10-90).

### Gate signer semantics (ADR-026, Dual-Manifest — Gate Model v2.2.0)

* **Gate 2 (KNOWLEDGE_PROMOTION):** Owner Team 190 (validation). **Executor Team 70 (Librarian) ONLY.** Team 170 does not retain promotion execution authority.
* **Gate 6 (ARCHITECTURAL_VALIDATION):** Team 190. Validate spec and artifact alignment to constitution; no execution, no SSOT writes.
* **Gate 7 (HUMAN_UX_APPROVAL — Final sign-off):** Nimrod (Visionary). Final UX/vision approval; no implementation by agent without Gate 7 pass.
* **Gate 8 (DOCUMENTATION_CLOSURE — AS_MADE_LOCK):** Owner Team 190; Executor Team 70 (Librarian). Purpose: AS_MADE_REPORT, Developer Guides update, clean communication folders, archive by Stage. Lifecycle not complete without GATE_8 PASS. Source: 04_GATE_MODEL_PROTOCOL_v2.2.0.

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

## 5. ACTIVE STAGE CONTROL

- Current Stage: GAP_CLOSURE_BEFORE_AGENT_POC
- Allowed Operations: spec_finalization, structural_alignment, poc_observer_implementation
- Forbidden Operations: feature_scaling, production_write_access

### 5.1 Current execution order lock (SSM Final Lock v1.0.0)

| Level | Identifier | Name | Status |
|-------|------------|------|--------|
| Stage | S001 | Agent OS Initial Build | ACTIVE |
| Program | S001-P001 | Agent Core | ACTIVE |
| Work Package | S001-P001-WP001 | 10↔90 Validator Agent | ACTIVE |
| Program | S001-P002 | Alerts POC | **FROZEN** until S001-P001-WP001 completes GATE_8 |

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

---

**log_entry | TEAM_70 | SSM_CANONICAL_UPDATE | content_from_Team_170 | GATE_5_F1_REMEDIATION | 2026-02-19**  
**log_entry | TEAM_70 | SSM_CANONICAL_UPDATE | content_from_Team_170 | ARCH_APPROVAL_PACKAGE_FORMAT_LOCK_v1.0.0 | 2026-02-20**  
**log_entry | TEAM_70 | SSM_CANONICAL_UPDATE | content_from_Team_170 | SSM_FINAL_LOCK_v1.0.0 | 2026-02-20**
