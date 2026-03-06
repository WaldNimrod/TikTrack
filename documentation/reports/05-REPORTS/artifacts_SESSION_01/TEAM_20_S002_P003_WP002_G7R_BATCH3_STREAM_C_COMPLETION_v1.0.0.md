# TEAM_20 → TEAM_10 | S002-P003-WP002 G7 Remediation — Batch 3 Stream C Completion

**project_domain:** TIKTRACK  
**id:** TEAM_20_S002_P003_WP002_G7R_BATCH3_STREAM_C_COMPLETION_v1.0.0  
**from:** Team 20 (Backend / Data)  
**to:** Team 10 (Execution Orchestrator)  
**cc:** Team 30, Team 40, Team 50, Team 60, Team 90  
**date:** 2026-03-04  
**status:** COMPLETE  
**gate_id:** GATE_3 (re-entry)  
**work_package_id:** S002-P003-WP002  
**session:** SESSION_01  
**in_response_to:** S002_P003_WP002_G7R_V13_BATCH3_STREAM_C_ACTIVATION_v1.0.0

---

## 1) Overall status

| Field | Value |
|-------|-------|
| **overall_status** | PASS |
| **scope** | BF-G7-012 through BF-G7-018 (Stream C — Alerts/Notes semantics) |

---

## 2) Per-BF closure evidence

| ID | Finding | Closure proof | Status |
|----|---------|---------------|--------|
| **BF-G7-012** | linked_to lacks record name | API returns linked entity type + record name. Alerts: `target_type`, `ticker_symbol`, `target_display_name`; datetime uses formatted `target_datetime`. Notes: `parent_type`, `linked_entity_display`; datetime uses formatted `parent_datetime`. Evidence: `api/services/alerts_service.py` _alert_to_response L98–109; `api/services/notes_service.py` _note_to_response L74–79. | PASS |
| **BF-G7-013** | Alert without condition allowed | Save blocked unless condition valid. AlertCreate/AlertUpdate: entity alerts (ticker, trade, trade_plan, account) require condition_field + condition_operator + condition_value; datetime may omit. 422 on partial/invalid. Evidence: `api/schemas/alerts.py` validate_condition_canonical L44–64 (create), L78–90 (update). | PASS |
| **BF-G7-014** | general linkage still allowed | Create/edit reject "general". AlertCreate/AlertUpdate/NoteCreate/NoteUpdate: model_validator raises ValueError "target_type/parent_type 'general' is not allowed". Evidence: `api/schemas/alerts.py` validate_target_and_general L34–41, validate_target_update L73–81; `api/schemas/notes.py` parent_type_valid L37–40, L74–77. | PASS |
| **BF-G7-015** | Alert message not rich text | Backend accepts and persists rich-text (HTML sanitized per SOP-012). create_alert and update_alert sanitize message via `sanitize_rich_text()`. Evidence: `api/services/alerts_service.py` L352–362 (create), L478–488 (update); `api/utils/rich_text_sanitizer.py`. | PASS |
| **BF-G7-016** | #alertsSummaryToggleSize alignment | UI-only; Team 30 owns | **DELEGATED_TO_TEAM_30** |
| **BF-G7-017** | Linked entity optional | linked_entity mandatory. Alerts: target_type required; entity types require ticker_id/target_id; datetime requires target_datetime. Notes: parent_type required (default ticker); entity types require parent_id; datetime requires parent_datetime. 422 if missing. Evidence: `api/schemas/alerts.py` L20; `api/schemas/notes.py` validate_linked_entity_required L44–55; `api/services/alerts_service.py` create_alert L277–311. | PASS |
| **BF-G7-018** | Cannot edit linked entity | Edit flow supports linked_entity change. AlertUpdate: target_type, target_id, ticker_id, target_datetime. NoteUpdate: parent_type, parent_id, parent_datetime. PATCH applies changes with validation. Evidence: `api/schemas/alerts.py` L68–76; `api/schemas/notes.py` L58–95; `api/services/alerts_service.py` update_alert L420–466; `api/services/notes_service.py` update_note L260–290. | PASS |

---

## 3) API/DB/files changed

| File | Change |
|------|--------|
| `api/schemas/alerts.py` | AlertCreate: target_type required; validate_target_and_general (reject general); validate_condition_canonical (entity condition required). AlertUpdate: target_type, target_id, ticker_id, target_datetime; validate_target_update. |
| `api/schemas/notes.py` | NoteCreate: validate_linked_entity_required; parent_type_valid rejects general. NoteUpdate: parent_type, parent_id, parent_datetime; validate_linked_entity_update. |
| `api/services/alerts_service.py` | _alert_to_response: datetime display; create_alert: message sanitization; update_alert: linked_entity apply, message sanitization. |
| `api/services/notes_service.py` | _note_to_response: datetime linked_entity_display; update_note: parent_type/parent_id/parent_datetime apply. |
| No DB migrations | Schema unchanged. |

---

## 4) Contract changes for Team 30

| Change | Description |
|--------|-------------|
| **POST /alerts** | `target_type` now **required** (was optional). Reject "general"; entity types require ticker_id or target_id; datetime requires target_datetime. Condition required for entity alerts. |
| **PATCH /alerts/{id}** | New optional fields: `target_type`, `target_id`, `ticker_id`, `target_datetime`. Supports linked-entity edit. `message` accepts HTML (sanitized). |
| **POST /notes** | `parent_id` required when `parent_type` in (ticker, trade, trade_plan, account). `parent_datetime` required when `parent_type`=datetime. Reject `parent_type`="general". |
| **PUT /notes/{id}** | New optional fields: `parent_type`, `parent_id`, `parent_datetime`. Supports linked-entity edit. |
| **Error codes** | No new codes. Validation uses 422 + VALIDATION_INVALID_FORMAT. |
| **Response shape** | Alerts: target_display_name for datetime = formatted target_datetime. Notes: linked_entity_display for datetime = formatted parent_datetime. |

---

## 5) Evidence paths summary

- BF-G7-012: `api/services/alerts_service.py` _alert_to_response; `api/services/notes_service.py` _note_to_response
- BF-G7-013: `api/schemas/alerts.py` AlertCreate/AlertUpdate validate_condition_canonical
- BF-G7-014: `api/schemas/alerts.py` validate_target_and_general, validate_target_update; `api/schemas/notes.py` parent_type_valid
- BF-G7-015: `api/services/alerts_service.py` create_alert, update_alert; `api/utils/rich_text_sanitizer.py`
- BF-G7-016: DELEGATED_TO_TEAM_30
- BF-G7-017: `api/schemas/alerts.py`, `api/schemas/notes.py`, `api/services/alerts_service.py` create_alert
- BF-G7-018: `api/schemas/alerts.py` AlertUpdate; `api/schemas/notes.py` NoteUpdate; `api/services/alerts_service.py` update_alert; `api/services/notes_service.py` update_note

---

**log_entry | TEAM_20 | G7R_BATCH3_STREAM_C | S002_P003_WP002 | PASS | 2026-03-04**
