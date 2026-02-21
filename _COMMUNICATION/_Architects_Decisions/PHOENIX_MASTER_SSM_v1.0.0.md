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
---
# PHOENIX SYSTEM STATE (SSM) v1.0.0

מניפסט זה הוא ה-Single Source of Truth (SSOT) החוקתי והטכני של פרויקט פיניקס. גרסה זו עודכנה בהתאם ל־Gate 5 remediation: ישות ALERT ממופה לקוד/ספק בלבד (ללא ערכים מניחים). **מבנה קנוני v2.2.0:** היררכיה ומספור per 04_GATE_MODEL_PROTOCOL_v2.2.0.

---

## 0. CANONICAL HIERARCHY & TAXONOMY (v2.2.0)

**Hierarchy:** Roadmap (single) → Stage (שלב) → Program (תכנית) → Work Package (חבילת עבודה) → Task (משימה).  
**Rule:** Gate binding **only to Work Package** (L3).  
**Numbering:** S{NNN}-P{NNN}-WP{NNN}-T{NNN} (prefix inheritance; no implicit numbering; no duplicates).  
**Mandatory identity header:** roadmap_id, stage_id, program_id, work_package_id, task_id (when applicable), gate_id, phase_owner, required_ssm_version, required_active_stage.  
Full definitions: 04_GATE_MODEL_PROTOCOL_v2.2.0.

---

## 1. GOVERNANCE CORE (חוקי הברזל)

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

---

**log_entry | TEAM_10 | SSM_CANONICAL_REPLACED_PER_TEAM_170_REQUEST | GATE_5_F1_REMEDIATION | 2026-02-19**
