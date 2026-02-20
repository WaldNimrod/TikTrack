---
id: PHOENIX_SYSTEM_STATE
version: 1.0.0
status: CANDIDATE (post-delta, pending promotion)
source_delta: _COMMUNICATION/team_170/SSM_DELTA_PROPOSAL_v1.0.0.md
promotion_authority: Team 170 (proposal); promotion to _Architects_Decisions by Team 10 / Architect
validation_authority: Team 190
active_stage: GAP_CLOSURE_BEFORE_AGENT_POC
drift_status: CLEAN
---
# PHOENIX SYSTEM STATE (SSM) v1.0.0 — CANDIDATE AFTER DELTA

מניפסט זה הוא ה-Single Source of Truth (SSOT) החוקתי והטכני של פרויקט פיניקס. גרסה זו עודכנה בהתאם ל-SSM_DELTA_PROPOSAL_v1.0.0 (אין ערכים מניחים; ALERT ממופה לקוד/ספק בלבד).

---

## 1. GOVERNANCE CORE (חוקי הברזל)

* **No-Guessing Rule:** עמימות בדרישות מחייבת עצירה והפקת CLARIFICATION_REQUEST. חל איסור על הנחות עבודה.
* **Precision 20,8:** כל חישוב כספי, המרת מטבע או עמלה בבסיס הנתונים וב-Logic חייב להתבצע בדיוק NUMERIC(20,8).
* **RTL Native:** כל ממשק UI נבנה לתמיכה בעברית ללא Inline CSS, תוך שימוש בלעדי ב-Logical Properties (Start/End).
* **Visual Integrity:** ולידציה מבנית (DOM/CSS) מול הבלופרינט כחסם קשיח. שימוש בסקרינשוטים ע"י אייג'נטים - אסור.
* **Authority Model:** הפרדת רשויות מוחלטת בין ארכיטקטורה (100+) לביצוע (10-90).

### Gate signer semantics (ADR-026, Dual-Manifest)

* **Gate 5 (Constitutional / Architectural Validation):** Team 190. Authority: validate spec and artifact alignment to constitution; no execution, no SSOT writes.
* **Gate 6 (Final sign-off):** Nimrod (Visionary). Authority: final UX/vision approval; no implementation by agent without Gate 6 pass.

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

**log_entry | TEAM_170 | SSM_CANDIDATE_AFTER_DELTA | 2026-02-19**
