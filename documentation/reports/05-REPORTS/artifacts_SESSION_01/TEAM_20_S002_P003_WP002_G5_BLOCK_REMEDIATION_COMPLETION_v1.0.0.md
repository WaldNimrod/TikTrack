# TEAM_20 → TEAM_10 | S002-P003-WP002 GATE_5 BLOCK — Remediation Completion (v1.0.0)

**project_domain:** TIKTRACK  
**id:** TEAM_20_S002_P003_WP002_G5_BLOCK_REMEDIATION_COMPLETION_v1.0.0  
**from:** Team 20 (Backend)  
**to:** Team 10 (Execution Orchestrator)  
**cc:** Team 30, Team 50, Team 60, Team 90  
**date:** 2026-03-06  
**status:** COMPLETE  
**gate_id:** GATE_5  
**work_package_id:** S002-P003-WP002  
**in_response_to:** TEAM_10_TO_TEAM_20_S002_P003_WP002_G5_BLOCK_REMEDIATION_MANDATE_v1.0.0.md

---

## Mandatory identity header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P003 |
| work_package_id | S002-P003-WP002 |
| gate_id | GATE_5 |
| phase_owner | Team 10 |

---

## 1) Closure matrix — BF IDs (Team 20 owned)

| id | owner | status | evidence_path | verification_report |
|----|-------|--------|---------------|---------------------|
| BF-G7-008 | Team 20 | CLOSED | `api/services/canonical_ticker_service.py` (lines 116–123): `_live_data_check` fails → `HTTPExceptionWithCode(422, detail="Provider could not fetch...", error_code=TICKER_SYMBOL_INVALID)`. `api/main.py`: HTTPExceptionWithCode handler returns `detail` + `message`. | POST /tickers with symbol INVALID999E2E → 422. Run with `VALIDATE_SYMBOL_ALWAYS=true` or `DEBUG=false`. |
| BF-G7-009 | Team 20 | CLOSED | `api/services/tickers_service.py` (lines 209–224): API-level duplicate check. `documentation/docs-system/02-SERVER/PHX_DB_SCHEMA_V2.6_FULL_DDL.sql`: `uix_tickers_symbol_exchange_active`. `api/services/canonical_ticker_service.py`: returns existing on IntegrityError. | POST duplicate symbol → 409 TICKER_SYMBOL_DUPLICATE. PUT same symbol for different ticker → 409. |
| BF-G7-010 | Team 20 | CLOSED | `api/services/tickers_service.py` (lines 251–291): `delete_ticker` cascades to `user_tickers` (status=cancelled, deleted_at). No reject path; cascade is per ARCHITECT_DIRECTIVE_G7. | DELETE /tickers/{id} with user_tickers refs → 204; linked user_tickers soft-deleted. |
| BF-G7-011 | Team 20 | CLOSED | `api/services/tickers_service.py` (lines 232–234): `update_ticker` sets `ticker.status`; commit + refresh. `_ticker_to_response` includes `status`. `api/services/user_tickers_service.py`: `_ticker_to_response` includes `status=t.status or "active"`. | PUT /tickers/{id} with status=inactive → 200; GET /tickers and GET /me/tickers return updated status. |
| BF-G7-013 | Team 20 | CLOSED | `api/schemas/alerts.py` (lines 50–64): `validate_condition_canonical` — entity alerts require all three (condition_field, condition_operator, condition_value); datetime may omit. | POST /alerts with target_type=ticker and no condition → 422. |
| BF-G7-014 | Team 20 | CLOSED | `api/schemas/alerts.py` (lines 35–42): `validate_target_and_general` rejects `target_type="general"`. `api/schemas/notes.py` (lines 38–39): `parent_type_valid` rejects `"general"`. | POST /alerts with target_type=general → 422. POST /notes with parent_type=general → 422. |
| BF-G7-017 | Team 20 | CLOSED | `api/schemas/alerts.py` (lines 66–75): `validate_linked_entity` — ticker requires ticker_id or target_id; trade/plan/account require target_id. `api/schemas/notes.py` (lines 45–55): `validate_linked_entity_required` — entity types require parent_id. | POST /alerts target_type=ticker without ticker_id → 422. POST /notes parent_type=ticker without parent_id → 422. |
| BF-G7-025 | Team 20 | CLOSED | `api/services/note_attachments_service.py` (line 20): `MAX_FILE_BYTES = 2621440` (2.5MB). Line 112: `len(file_content) > MAX_FILE_BYTES` → 413. | POST /notes/{id}/attachments with file >2.5MB → 413 "File exceeds 2.5MB limit". |

---

## 2) Summary

- **Total BF IDs in scope:** 8  
- **CLOSED:** 8  
- **BLOCK / partial:** 0  

---

## 3) References

- G7 Remediation activation: `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S002_P003_WP002_G7_REMEDIATION_ACTIVATION_v1.0.0.md`
- G5 Blocking report: `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S002_P003_WP002_GATE5_BLOCKING_REPORT_v1.1.0.md`
- Prior completion artifacts: `TEAM_20_S002_P003_WP002_G7R_BATCH2_STREAM_B_COMPLETION_v1.0.0.md`, `TEAM_20_S002_P003_WP002_G7R_BATCH3_STREAM_C_COMPLETION_v1.0.0.md`, `TEAM_20_S002_P003_WP002_G7R_BATCH4_STREAM_D_COMPLETION_v1.0.0.md`, `TEAM_20_S002_P003_WP002_G7R_BATCH5_REMEDIATION_008_017_COMPLETION_v1.0.0.md`

---

**log_entry | TEAM_20 | G5_BLOCK_REMEDIATION | S002_P003_WP002 | COMPLETION | 8/8_CLOSED | 2026-03-06**
